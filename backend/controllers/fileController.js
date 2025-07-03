const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');
const { encryptFile, decryptFile } = require('../utils/encryption');
const { sendFileShareNotification } = require('../utils/emailService');

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Encrypt file if enabled
    let finalPath = req.file.path;
    let isEncrypted = false;

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const encryptedBuffer = encryptFile(fileBuffer);
      
      // Save encrypted file
      const encryptedPath = req.file.path + '.enc';
      fs.writeFileSync(encryptedPath, encryptedBuffer);
      
      // Remove original file
      fs.unlinkSync(req.file.path);
      
      finalPath = encryptedPath;
      isEncrypted = true;
    } catch (encryptionError) {
      console.error('File encryption failed:', encryptionError);
      // Continue with unencrypted file
    }

    // Create file record
    const fileRecord = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: finalPath,
      uploadedBy: req.user.id,
      description: req.body.description || '',
      isPublic: req.body.isPublic === 'true',
      isEncrypted: isEncrypted
    });

    await fileRecord.save();

    // Populate user info
    await fileRecord.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileRecord
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
};

// Get user files
const getUserFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userFiles = await File.find({ uploadedBy: req.user.id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    const sharedFiles = await File.find({ 
      'sharedWith.user': req.user.id 
    })
      .populate('uploadedBy', 'name email')
      .populate('sharedWith.user', 'name email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUserFiles = await File.countDocuments({ uploadedBy: req.user.id });
    const totalSharedFiles = await File.countDocuments({ 'sharedWith.user': req.user.id });

    res.json({
      userFiles,
      sharedFiles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalUserFiles + totalSharedFiles) / limit),
        totalFiles: totalUserFiles + totalSharedFiles,
        hasMore: skip + limit < totalUserFiles + totalSharedFiles
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error retrieving files' });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user can access this file
    if (!file.canUserAccess(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Update download count
    file.downloadCount += 1;
    file.lastDownloaded = new Date();
    await file.save();

    let fileBuffer;

    try {
      // Read and decrypt file if encrypted
      if (file.isEncrypted) {
        const encryptedBuffer = fs.readFileSync(file.path);
        fileBuffer = decryptFile(encryptedBuffer);
      } else {
        fileBuffer = fs.readFileSync(file.path);
      }
    } catch (decryptionError) {
      console.error('File decryption error:', decryptionError);
      return res.status(500).json({ message: 'Error processing file' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

// Share file
const shareFile = async (req, res) => {
  try {
    const { email, permission = 'view' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns this file
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only share your own files' });
    }

    // Find user to share with
    const userToShareWith = await User.findOne({ email: email.toLowerCase() });

    if (!userToShareWith) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already shared
    const alreadyShared = file.sharedWith.some(
      share => share.user.toString() === userToShareWith._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: 'File already shared with this user' });
    }

    // Add to shared list
    file.sharedWith.push({
      user: userToShareWith._id,
      permission: permission,
      sharedAt: new Date()
    });

    await file.save();

    // Send notification email
    try {
      await sendFileShareNotification(
        userToShareWith.email,
        userToShareWith.name,
        file.originalname,
        req.user.name
      );
    } catch (emailError) {
      console.error('Error sending share notification:', emailError);
    }

    res.json({
      message: 'File shared successfully',
      sharedWith: {
        user: {
          id: userToShareWith._id,
          name: userToShareWith.name,
          email: userToShareWith.email
        },
        permission: permission
      }
    });

  } catch (error) {
    console.error('File share error:', error);
    res.status(500).json({ message: 'Error sharing file' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns this file
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own files' });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (fileError) {
        console.error('Error deleting file from disk:', fileError);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = {
  uploadFile,
  getUserFiles,
  downloadFile,
  shareFile,
  deleteFile
};

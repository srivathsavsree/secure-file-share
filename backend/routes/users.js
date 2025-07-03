const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's file statistics
    const totalFiles = await File.countDocuments({ uploadedBy: req.user.id });
    const totalDownloads = await File.aggregate([
      { $match: { uploadedBy: req.user.id } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    const sharedFiles = await File.countDocuments({ 'sharedWith.user': req.user.id });

    res.json({
      user,
      stats: {
        totalFiles,
        totalDownloads: totalDownloads[0]?.total || 0,
        sharedFiles
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// @route   GET /api/users/search
// @desc    Search for users (for sharing files)
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        { isVerified: true }, // Only verified users
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email')
    .limit(10);

    res.json({ users });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Delete user's files from disk
    const userFiles = await File.find({ uploadedBy: req.user.id });
    
    for (const file of userFiles) {
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
        }
      }
    }

    // Delete user's files from database
    await File.deleteMany({ uploadedBy: req.user.id });

    // Remove user from shared files
    await File.updateMany(
      { 'sharedWith.user': req.user.id },
      { $pull: { sharedWith: { user: req.user.id } } }
    );

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    console.log('Account deleted for user:', user.email);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: {
    type: Date
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  encryptionMethod: {
    type: String,
    default: 'AES-256-CBC'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
});

// Index for efficient queries
FileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
FileSchema.index({ isPublic: 1, uploadedAt: -1 });
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for file age
FileSchema.virtual('age').get(function() {
  return Date.now() - this.uploadedAt;
});

// Instance method to check if user can access file
FileSchema.methods.canUserAccess = function(userId) {
  // Owner can always access
  if (this.uploadedBy.toString() === userId.toString()) {
    return true;
  }
  
  // Check if file is public
  if (this.isPublic) {
    return true;
  }
  
  // Check if user is in shared list
  return this.sharedWith.some(share => 
    share.user.toString() === userId.toString()
  );
};

// Static method to get user's files
FileSchema.statics.getUserFiles = function(userId) {
  return this.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
};

// Static method to get public files
FileSchema.statics.getPublicFiles = function() {
  return this.find({ isPublic: true }).sort({ uploadedAt: -1 });
};

module.exports = mongoose.model('File', FileSchema);

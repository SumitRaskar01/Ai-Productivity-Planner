const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);

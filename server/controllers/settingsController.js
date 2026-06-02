const UserSettings = require('../models/UserSettings');

// GET /api/settings  — return user settings, defaults if none exist
const getSettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ userId: req.user._id });

    if (!settings) {
      // Return defaults without writing to DB (lazy creation)
      return res.json({ darkMode: false, soundEnabled: true });
    }

    res.json({
      darkMode: settings.darkMode,
      soundEnabled: settings.soundEnabled,
      updatedAt: settings.updatedAt,
    });
  } catch (err) {
    console.error('[settings] getSettings error:', err.message);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// PATCH /api/settings  — upsert user settings
const updateSettings = async (req, res) => {
  const { darkMode, soundEnabled } = req.body;

  // Only accept the fields we know about
  const patch = {};
  if (typeof darkMode === 'boolean') patch.darkMode = darkMode;
  if (typeof soundEnabled === 'boolean') patch.soundEnabled = soundEnabled;

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  try {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: patch },
      { new: true, upsert: true }
    );

    res.json({
      darkMode: settings.darkMode,
      soundEnabled: settings.soundEnabled,
      updatedAt: settings.updatedAt,
    });
  } catch (err) {
    console.error('[settings] updateSettings error:', err.message);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

module.exports = { getSettings, updateSettings };

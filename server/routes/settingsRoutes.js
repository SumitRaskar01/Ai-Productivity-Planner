const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',   protect, getSettings);
router.patch('/', protect, updateSettings);

module.exports = router;

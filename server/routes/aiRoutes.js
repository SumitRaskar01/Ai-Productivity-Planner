const express = require('express');
const router = express.Router();
const { getCoachInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/coach', protect, getCoachInsights);

module.exports = router;

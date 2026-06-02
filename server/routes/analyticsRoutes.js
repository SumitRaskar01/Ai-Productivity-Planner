const express = require('express');
const router = express.Router();
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/analytics/summary
router.get('/summary', protect, getAnalyticsSummary);

module.exports = router;

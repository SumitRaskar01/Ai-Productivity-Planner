const express = require('express');
const router = express.Router();
const {
  generatePlan,
  savePlan,
  getPlanHistory,
  updatePlan,
  deletePlan,
  regeneratePlan,
  exportPlan,
} = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

// Existing routes
router.post('/generate',    protect, generatePlan);
router.post('/save',        protect, savePlan);
router.get('/history',      protect, getPlanHistory);

// New routes — note: specific paths before :id to avoid conflicts
router.post('/regenerate',  protect, regeneratePlan);
router.get('/export/:id',   protect, exportPlan);
router.patch('/:id',        protect, updatePlan);
router.delete('/:id',       protect, deletePlan);

module.exports = router;

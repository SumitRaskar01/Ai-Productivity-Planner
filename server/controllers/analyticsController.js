const Plan = require('../models/Plan');

// GET /api/analytics/summary
const getAnalyticsSummary = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user._id }).sort({ createdAt: -1 });

    if (plans.length === 0) {
      return res.json({
        totalPlans: 0,
        totalTasks: 0,
        avgTasksPerPlan: 0,
        priorityBreakdown: { high: 0, medium: 0, low: 0 },
        dailyActivity: [],
        recentPlans: [],
      });
    }

    const allTasks = plans.flatMap(p => p.generatedPlan);
    const totalTasks = allTasks.length;

    const priorityBreakdown = allTasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    // Plans per day for the last 7 days
    const now = new Date();
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayPlans = plans.filter(p => p.createdAt.toISOString().split('T')[0] === dateStr);
      return {
        date: dateStr,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        plans: dayPlans.length,
        tasks: dayPlans.reduce((sum, p) => sum + p.generatedPlan.length, 0),
      };
    });

    res.json({
      totalPlans: plans.length,
      totalTasks,
      avgTasksPerPlan: Math.round((totalTasks / plans.length) * 10) / 10,
      priorityBreakdown,
      dailyActivity,
      recentPlans: plans.slice(0, 5).map(p => ({
        _id: p._id,
        originalInput: p.originalInput,
        taskCount: p.generatedPlan.length,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('[analytics] getAnalyticsSummary error:', error.message);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

module.exports = { getAnalyticsSummary };

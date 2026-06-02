const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/coach
// Accepts a generatedPlan array, returns 2–4 concise coaching insights
const getCoachInsights = async (req, res) => {
  const { generatedPlan } = req.body;

  if (!Array.isArray(generatedPlan) || generatedPlan.length === 0) {
    return res.status(400).json({ message: 'generatedPlan array is required' });
  }

  const planSummary = generatedPlan
    .map(t => `  ${t.start}–${t.end} | ${t.task} | ${t.priority} priority`)
    .join('\n');

  const prompt = `
You are a productivity coach reviewing a user's daily schedule.

Schedule:
${planSummary}

Analyse the schedule and return 2 to 4 concise, actionable coaching insights.
Focus on: task distribution, priority balance, break gaps, cognitive load, realistic timing.

Rules:
- Return ONLY a valid JSON array of strings. No markdown, no code blocks, no extra keys.
- Each string is one insight, max 15 words.
- Be direct, practical, and kind — like a coach, not a critic.

Example format:
["You have 3 high-priority tasks back-to-back — add a short break.", "Morning sessions look productive; protect that time.", "Consider batching email tasks together."]

Respond with ONLY the JSON array.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text()
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const insights = JSON.parse(text);

    if (!Array.isArray(insights)) {
      return res.status(500).json({ message: 'AI returned invalid format' });
    }

    // Cap at 4 insights and ensure they're all strings
    res.json({
      insights: insights
        .filter(i => typeof i === 'string')
        .slice(0, 4),
    });
  } catch (error) {
    console.error('[ai] getCoachInsights error:', error.message);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned non-JSON response' });
    }
    res.status(500).json({ message: 'Failed to get coaching insights', error: error.message });
  }
};

module.exports = { getCoachInsights };

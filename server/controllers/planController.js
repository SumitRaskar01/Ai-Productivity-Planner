const Groq = require('groq-sdk');
const PDFDocument = require('pdfkit');
const Plan = require('../models/Plan');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Shared helper: strip markdown fences and parse JSON from Gemini response
function parseGeminiJSON(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// Shared helper: validate that a task object has the required shape
function isValidTask(task) {
  return (
    task &&
    typeof task.task === 'string' && task.task.trim() !== '' &&
    typeof task.start === 'string' && /^\d{2}:\d{2}$/.test(task.start) &&
    typeof task.end === 'string' && /^\d{2}:\d{2}$/.test(task.end) &&
    ['low', 'medium', 'high'].includes(task.priority)
  );
}

// ─────────────────────────────────────────────
// POST /api/plan/generate
// ─────────────────────────────────────────────
const generatePlan = async (req, res) => {
  const { inputText } = req.body;

  if (!inputText || inputText.trim() === '') {
    return res.status(400).json({ message: 'inputText is required' });
  }

  const prompt = `
You are a productivity assistant. The user has given you a messy, unstructured description of their day.
Your job is to extract tasks, assign realistic time blocks, and assign a priority level to each task.

Rules:
- Return ONLY a valid JSON array. No explanations, no markdown, no code blocks.
- Each item must have exactly these fields: "task", "start", "end", "priority"
- "start" and "end" must be in "HH:MM" 24-hour format
- "priority" must be one of: "low", "medium", "high"
- Tasks should not overlap
- Order tasks by start time
- If no specific times are mentioned, assign reasonable time blocks throughout the day starting from 08:00
- Keep task names short and clear (under 50 characters)

User input:
"${inputText}"

Respond with ONLY the JSON array.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });
    
    const text = chatCompletion.choices[0]?.message?.content || '';
    const plan = parseGeminiJSON(text);

    if (!Array.isArray(plan)) {
      return res.status(500).json({ message: 'AI returned invalid format' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('[plan] generatePlan error:', error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned non-JSON response', error: error.message });
    }
    res.status(500).json({ message: 'Failed to generate plan', error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/plan/save
// ─────────────────────────────────────────────
const savePlan = async (req, res) => {
  const { originalInput, generatedPlan } = req.body;

  if (!originalInput || !Array.isArray(generatedPlan) || generatedPlan.length === 0) {
    return res.status(400).json({ message: 'originalInput and generatedPlan array are required' });
  }

  try {
    const plan = await Plan.create({
      userId: req.user._id,
      originalInput,
      generatedPlan,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save plan', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/plan/history
// ─────────────────────────────────────────────
const getPlanHistory = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('originalInput generatedPlan createdAt lastEditedAt');

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/plan/:id  — update task list
// ─────────────────────────────────────────────
const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { generatedPlan } = req.body;

  if (!Array.isArray(generatedPlan) || generatedPlan.length === 0) {
    return res.status(400).json({ message: 'generatedPlan must be a non-empty array' });
  }

  // Validate every task in the submitted array
  const invalid = generatedPlan.find(t => !isValidTask(t));
  if (invalid) {
    return res.status(400).json({
      message: 'Each task must have task, start (HH:MM), end (HH:MM), and priority (low|medium|high)',
    });
  }

  try {
    const plan = await Plan.findOne({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found or access denied' });
    }

    plan.generatedPlan = generatedPlan;
    plan.lastEditedAt  = new Date();
    await plan.save();

    res.json({ message: 'Plan updated', plan });
  } catch (err) {
    console.error('[plan] updatePlan error:', err.message);
    res.status(500).json({ message: 'Failed to update plan', error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/plan/:id
// ─────────────────────────────────────────────
const deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found or access denied' });
    }

    res.json({ message: 'Plan deleted' });
  } catch (err) {
    console.error('[plan] deletePlan error:', err.message);
    res.status(500).json({ message: 'Failed to delete plan', error: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/plan/regenerate  — AI re-optimise
// ─────────────────────────────────────────────
const regeneratePlan = async (req, res) => {
  const { originalInput, existingPlan, modificationPrompt } = req.body;

  if (!existingPlan || !Array.isArray(existingPlan) || existingPlan.length === 0) {
    return res.status(400).json({ message: 'existingPlan array is required' });
  }

  if (!modificationPrompt || modificationPrompt.trim() === '') {
    return res.status(400).json({ message: 'modificationPrompt is required' });
  }

  const planSummary = existingPlan
    .map(t => `  ${t.start}–${t.end} | ${t.task} | priority: ${t.priority}`)
    .join('\n');

  const prompt = `
You are a productivity assistant helping refine an existing daily schedule.

Original user description:
"${originalInput || 'Not provided'}"

Current schedule:
${planSummary}

User's modification request:
"${modificationPrompt}"

Rules:
- Apply the user's requested changes intelligently.
- Preserve tasks that don't need to change.
- Adjust time blocks and priorities as needed to satisfy the request.
- Return ONLY a valid JSON array. No explanations, no markdown, no code blocks.
- Each item must have exactly: "task", "start" (HH:MM), "end" (HH:MM), "priority" (low|medium|high)
- Tasks must not overlap. Order by start time.

Respond with ONLY the JSON array.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });
    
    const text = chatCompletion.choices[0]?.message?.content || '';
    const plan = parseGeminiJSON(text);

    if (!Array.isArray(plan)) {
      return res.status(500).json({ message: 'AI returned invalid format' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('[plan] regeneratePlan error:', error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned non-JSON response', error: error.message });
    }
    res.status(500).json({ message: 'Failed to regenerate plan', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/plan/export/:id  — stream PDF
// ─────────────────────────────────────────────
const exportPlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findOne({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found or access denied' });
    }

    // Build the PDF in memory and stream it
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="timezy-plan-${id}.pdf"`
    );
    doc.pipe(res);

    // ── Header ──
    const dateStr = new Date(plan.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    doc
      .fontSize(22).font('Helvetica-Bold').fillColor('#1F7A4C')
      .text('Timezy', 50, 50);

    doc
      .fontSize(10).font('Helvetica').fillColor('#6B7280')
      .text('AI Productivity Planner', { continued: false });

    doc.moveDown(0.5);

    doc
      .fontSize(14).font('Helvetica-Bold').fillColor('#1A1A1A')
      .text('Daily Plan', { continued: false });

    doc
      .fontSize(10).font('Helvetica').fillColor('#6B7280')
      .text(dateStr);

    doc.moveDown(1);

    // Divider line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();

    doc.moveDown(1);

    // ── Task list ──
    const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

    plan.generatedPlan.forEach((task, i) => {
      const y = doc.y;
      const color = PRIORITY_COLORS[task.priority] || '#22C55E';

      // Priority dot
      doc.circle(62, y + 6, 4).fillColor(color).fill();

      // Time
      doc
        .fontSize(9).font('Helvetica').fillColor('#6B7280')
        .text(`${task.start} – ${task.end}`, 75, y, { width: 80 });

      // Task name
      doc
        .fontSize(11).font('Helvetica-Bold').fillColor('#1A1A1A')
        .text(task.task, 165, y, { width: 280 });

      // Priority badge (text)
      const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      doc
        .fontSize(9).font('Helvetica').fillColor(color)
        .text(priorityLabel, 460, y, { width: 60, align: 'right' });

      // Row separator
      const rowBottom = doc.y + 4;
      if (i < plan.generatedPlan.length - 1) {
        doc
          .moveTo(75, rowBottom)
          .lineTo(545, rowBottom)
          .strokeColor('#F3F4F6')
          .lineWidth(0.5)
          .stroke();
      }

      doc.moveDown(0.6);
    });

    doc.moveDown(1.5);

    // ── Footer ──
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();

    doc.moveDown(0.5);

    doc
      .fontSize(9).font('Helvetica').fillColor('#9CA3AF')
      .text(
        `Generated by Timezy · ${plan.generatedPlan.length} task${plan.generatedPlan.length !== 1 ? 's' : ''} · ${new Date().toLocaleDateString()}`,
        { align: 'center' }
      );

    doc.end();
  } catch (err) {
    console.error('[plan] exportPlan error:', err.message);
    // Can't set headers after streaming starts, so just end the response
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export plan', error: err.message });
    }
  }
};

module.exports = {
  generatePlan,
  savePlan,
  getPlanHistory,
  updatePlan,
  deletePlan,
  regeneratePlan,
  exportPlan,
};

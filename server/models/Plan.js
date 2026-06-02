const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
}, { _id: false });

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalInput: {
    type: String,
    required: true,
  },
  generatedPlan: {
    type: [taskSchema],
    required: true,
  },
  lastEditedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);

const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    ref: 'Subject'
  },
  subjectName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  slot: {
    type: String,
    required: true
  },
  hall: {
    type: String,
    required: true,
    ref: 'Hall'
  },
  invigilator: {
    type: String,
    ref: 'Teacher'
  },
  semester: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    default: 3
  },
  studentsEnrolled: [{
    type: String,
    ref: 'Student'
  }],
  preferredSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'any'],
    default: 'any'
  },
  duration: {
    type: Number,
    default: 3 // hours
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);

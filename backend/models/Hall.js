const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  hallId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    default: 1
  },
  facilities: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hall', hallSchema);

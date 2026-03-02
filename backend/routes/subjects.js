const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subject by code
router.get('/:code', async (req, res) => {
  try {
    const subject = await Subject.findOne({ code: req.params.code });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new subject
router.post('/add', async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({ message: 'Subject added successfully', subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add multiple subjects (bulk)
router.post('/bulk', async (req, res) => {
  try {
    const subjects = await Subject.insertMany(req.body.subjects);
    res.status(201).json({ 
      message: `${subjects.length} subjects added successfully`, 
      subjects 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update subject
router.put('/:code', async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject updated successfully', subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete subject
router.delete('/:code', async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ code: req.params.code });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

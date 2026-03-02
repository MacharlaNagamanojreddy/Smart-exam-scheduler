const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new teacher
router.post('/add', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json({ message: 'Teacher added successfully', teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add multiple teachers (bulk)
router.post('/bulk', async (req, res) => {
  try {
    const teachers = await Teacher.insertMany(req.body.teachers);
    res.status(201).json({ 
      message: `${teachers.length} teachers added successfully`, 
      teachers 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { teacherId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndDelete({ teacherId: req.params.id });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

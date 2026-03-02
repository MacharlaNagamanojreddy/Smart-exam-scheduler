const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new student
router.post('/add', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add multiple students (bulk)
router.post('/bulk', async (req, res) => {
  try {
    const students = await Student.insertMany(req.body.students);
    res.status(201).json({ 
      message: `${students.length} students added successfully`, 
      students 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

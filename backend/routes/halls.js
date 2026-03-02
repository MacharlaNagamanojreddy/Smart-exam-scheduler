const express = require('express');
const router = express.Router();
const Hall = require('../models/Hall');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all halls
router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hall by ID
router.get('/:id', async (req, res) => {
  try {
    const hall = await Hall.findOne({ hallId: req.params.id });
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new hall
router.post('/add', async (req, res) => {
  try {
    const hall = new Hall(req.body);
    await hall.save();
    res.status(201).json({ message: 'Hall added successfully', hall });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add multiple halls (bulk)
router.post('/bulk', async (req, res) => {
  try {
    const halls = await Hall.insertMany(req.body.halls);
    res.status(201).json({ 
      message: `${halls.length} halls added successfully`, 
      halls 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update hall
router.put('/:id', async (req, res) => {
  try {
    const hall = await Hall.findOneAndUpdate(
      { hallId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    res.json({ message: 'Hall updated successfully', hall });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete hall
router.delete('/:id', async (req, res) => {
  try {
    const hall = await Hall.findOneAndDelete({ hallId: req.params.id });
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

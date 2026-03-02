const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Hall = require('../models/Hall');
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/auth');

router.use(protect);

// Generate exam schedule using Python algorithm
router.post('/generate', async (req, res) => {
  try {
    const {
      startDate,
      excludeDates,
      algorithmMode = 'csp',
      gaPopulation = 30,
      gaGenerations = 25,
      gaMutationRate = 0.12
    } = req.body;

    // Fetch all required data from database
    const subjects = await Subject.find().lean();
    const students = await Student.find().lean();
    const halls = await Hall.find({ isAvailable: true }).lean();
    const teachers = await Teacher.find({ isAvailable: true }).lean();

    if (!subjects.length || !students.length || !halls.length) {
      return res.status(400).json({ 
        error: 'Insufficient data. Please add subjects, students, and halls first.' 
      });
    }

    // Build enrollment map from students + subjects using both subject code and subject name.
    // This makes scheduling resilient when UI stores student subject preferences by name.
    const subjectLookup = new Map();
    const enrolledBySubjectCode = new Map();

    subjects.forEach((subject) => {
      const code = String(subject.code || '').trim();
      const name = String(subject.name || '').trim();

      if (code) {
        subjectLookup.set(code.toLowerCase(), code);
        enrolledBySubjectCode.set(
          code,
          new Set((subject.studentsEnrolled || []).map((id) => String(id).trim()).filter(Boolean))
        );
      }
      if (name && code) {
        subjectLookup.set(name.toLowerCase(), code);
      }
    });

    const normalizeSubjectRefToCode = (value) => {
      const key = String(value || '').trim().toLowerCase();
      return subjectLookup.get(key) || null;
    };

    students.forEach((student) => {
      const studentId = String(student.studentId || '').trim();
      if (!studentId) {
        return;
      }

      (student.subjects || []).forEach((subjectRef) => {
        const resolvedCode = normalizeSubjectRefToCode(subjectRef);
        if (resolvedCode && enrolledBySubjectCode.has(resolvedCode)) {
          enrolledBySubjectCode.get(resolvedCode).add(studentId);
        }
      });
    });

    // Prepare data for Python script
    const inputData = {
      subjects: subjects.map(s => ({
        code: s.code,
        name: s.name,
        department: s.department,
        semester: s.semester,
        studentsEnrolled: Array.from(enrolledBySubjectCode.get(s.code) || []),
        preferredSlot: s.preferredSlot,
        duration: s.duration
      })),
      students: students.map(st => ({
        studentId: st.studentId,
        name: st.name,
        subjects: (st.subjects || [])
          .map((subjectRef) => normalizeSubjectRefToCode(subjectRef) || subjectRef)
      })),
      halls: halls.map(h => ({
        hallId: h.hallId,
        name: h.name,
        capacity: h.capacity
      })),
      teachers: teachers.map(t => ({
        teacherId: t.teacherId,
        name: t.name
      })),
      startDate: startDate || new Date().toISOString().split('T')[0],
      excludeDates: excludeDates || [],
      algorithmMode,
      gaPopulation,
      gaGenerations,
      gaMutationRate
    };

    // Path to Python script
    const pythonScript = path.join(__dirname, '../../algorithm/scheduler.py');
    const pythonPath = process.env.PYTHON_PATH || 'python3';

    // Spawn Python process
    const python = spawn(pythonPath, [pythonScript]);

    let dataString = '';
    let errorString = '';

    // Send input data to Python script
    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();

    // Collect data from script
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    // Handle process completion
    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python Error:', errorString);
        return res.status(500).json({ 
          error: 'Schedule generation failed', 
          details: errorString 
        });
      }

      try {
        const result = JSON.parse(dataString);
        
        // Clear existing schedule
        await Schedule.deleteMany({});

        // Save new schedule to database
        const scheduleEntries = result.timetable.map(entry => ({
          subjectCode: entry.subject_code,
          subjectName: entry.subject_name,
          date: entry.date,
          slot: entry.slot,
          hall: entry.hall,
          invigilator: entry.invigilator || null,
          semester: entry.semester,
          department: entry.department,
          studentsCount: entry.students_count
        }));

        await Schedule.insertMany(scheduleEntries);

        res.json({
          success: true,
          message: 'Exam schedule generated successfully',
          algorithm: result.algorithm || { mode: algorithmMode },
          stats: result.stats,
          timetable: result.timetable
        });

      } catch (parseError) {
        console.error('Parse Error:', parseError);
        res.status(500).json({ 
          error: 'Failed to parse schedule result',
          details: parseError.message
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scheduled exams
router.get('/all', async (req, res) => {
  try {
    const schedule = await Schedule.find().sort({ date: 1, slot: 1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by date
router.get('/date/:date', async (req, res) => {
  try {
    const schedule = await Schedule.find({ date: req.params.date });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by department
router.get('/department/:dept', async (req, res) => {
  try {
    const schedule = await Schedule.find({ department: req.params.dept })
      .sort({ date: 1, slot: 1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by semester
router.get('/semester/:sem', async (req, res) => {
  try {
    const schedule = await Schedule.find({ semester: parseInt(req.params.sem) })
      .sort({ date: 1, slot: 1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/clear', async (req, res) => {
  try {
    await Schedule.deleteMany({});
    res.json({ message: 'Schedule cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule statistics
router.get('/stats', async (req, res) => {
  try {
    const totalExams = await Schedule.countDocuments();
    const departments = await Schedule.distinct('department');
    const dates = await Schedule.distinct('date');
    const halls = await Schedule.distinct('hall');

    res.json({
      totalExams,
      totalDepartments: departments.length,
      totalDays: dates.length,
      totalHalls: halls.length,
      departments,
      dates: dates.sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

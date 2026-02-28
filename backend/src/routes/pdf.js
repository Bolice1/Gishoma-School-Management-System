const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/marks/:studentId', authorize('admin', 'teacher', 'student'), async (req, res) => {
  try {
    if (req.userRole === 'student') {
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { userId: req.userId } });
      if (!student || student.id !== req.params.studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const buffer = await pdfService.generateMarksReport(req.params.studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=marks-report.pdf' });
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/discipline/:studentId', authorize('admin', 'teacher', 'student'), async (req, res) => {
  try {
    if (req.userRole === 'student') {
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { userId: req.userId } });
      if (!student || student.id !== req.params.studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const buffer = await pdfService.generateDisciplineReport(req.params.studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=discipline-report.pdf' });
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/homework/:studentId', authorize('admin', 'teacher', 'student'), async (req, res) => {
  try {
    if (req.userRole === 'student') {
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { userId: req.userId } });
      if (!student || student.id !== req.params.studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const buffer = await pdfService.generateHomeworkReport(req.params.studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=homework-report.pdf' });
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

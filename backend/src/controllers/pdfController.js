const { query } = require('../config/database');
const pdfService = require('../services/pdfService');

async function marksReport(req, res, next) {
  try {
    const { studentId } = req.params;
    const schoolId = req.schoolId;

    if (req.userRole === 'student') {
      const [s] = await query('SELECT id FROM students WHERE user_id = ?', [req.userId]);
      if (!s[0] || s[0].id !== studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      const [s] = await query('SELECT id FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);
      if (!s[0]) return res.status(404).json({ error: 'Student not found' });
    }

    const buffer = await pdfService.generateMarksReport(studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=marks-report.pdf' });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function disciplineReport(req, res, next) {
  try {
    const { studentId } = req.params;
    const schoolId = req.schoolId;

    if (req.userRole === 'student') {
      const [s] = await query('SELECT id FROM students WHERE user_id = ?', [req.userId]);
      if (!s[0] || s[0].id !== studentId) return res.status(403).json({ error: 'Access denied' });
    } else {
      const [s] = await query('SELECT id FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);
      if (!s[0]) return res.status(404).json({ error: 'Student not found' });
    }

    const buffer = await pdfService.generateDisciplineReport(studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=discipline-report.pdf' });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function homeworkReport(req, res, next) {
  try {
    const { studentId } = req.params;
    const schoolId = req.schoolId;

    if (req.userRole === 'student') {
      const [s] = await query('SELECT id FROM students WHERE user_id = ?', [req.userId]);
      if (!s[0] || s[0].id !== studentId) return res.status(403).json({ error: 'Access denied' });
    } else {
      const [s] = await query('SELECT id FROM students WHERE id = ? AND school_id = ?', [studentId, schoolId]);
      if (!s[0]) return res.status(404).json({ error: 'Student not found' });
    }

    const buffer = await pdfService.generateHomeworkReport(studentId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=homework-report.pdf' });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { marksReport, disciplineReport, homeworkReport };

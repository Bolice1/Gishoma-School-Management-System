const PDFDocument = require('pdfkit');
const { query } = require('../config/database');

function addHeader(doc, title) {
  doc.fontSize(20).text('Gishoma Multi-School System', { align: 'center' });
  doc.fontSize(12).text(title, { align: 'center' });
  doc.moveDown(2);
}

function addFooter(doc) {
  doc.fontSize(8).text(
    `Generated on ${new Date().toLocaleString()} - Gishoma School Management`,
    { align: 'center' }
  );
}

async function generateMarksReport(studentId) {
  const [students] = await query(
    `SELECT s.*, u.first_name, u.last_name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
  const student = students[0];
  if (!student) throw new Error('Student not found');

  const marks = await query(
    `SELECT m.*, c.name as course_name FROM marks m JOIN courses c ON m.course_id = c.id WHERE m.student_id = ? ORDER BY m.academic_year DESC, m.term`,
    [studentId]
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addHeader(doc, 'Student Marks Report');
    doc.fontSize(14).text(`Student: ${student.first_name} ${student.last_name}`);
    doc.text(`Student ID: ${student.student_id} | Class: ${student.class_level}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown(2);

    if (marks.length === 0) {
      doc.text('No marks recorded.');
    } else {
      const byTerm = {};
      marks.forEach((m) => {
        const key = `${m.academic_year} - ${m.term}`;
        if (!byTerm[key]) byTerm[key] = [];
        byTerm[key].push(m);
      });
      for (const [key, termMarks] of Object.entries(byTerm)) {
        doc.fontSize(12).text(key, { underline: true });
        doc.moveDown(0.5);
        termMarks.forEach((m) => {
          const pct = ((Number(m.score) / Number(m.max_score)) * 100).toFixed(1);
          doc.text(`  ${m.course_name}: ${m.score}/${m.max_score} (${pct}%)`);
        });
        doc.moveDown(1);
      }
    }

    addFooter(doc);
    doc.end();
  });
}

async function generateDisciplineReport(studentId) {
  const [students] = await query(
    `SELECT s.*, u.first_name, u.last_name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
  const student = students[0];
  if (!student) throw new Error('Student not found');

  const disciplines = await query(
    'SELECT * FROM disciplines WHERE student_id = ? ORDER BY date DESC',
    [studentId]
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addHeader(doc, 'Discipline Report');
    doc.fontSize(14).text(`Student: ${student.first_name} ${student.last_name}`);
    doc.text(`Student ID: ${student.student_id} | Class: ${student.class_level}`);
    doc.moveDown(2);

    if (disciplines.length === 0) {
      doc.text('No discipline records.');
    } else {
      disciplines.forEach((d) => {
        doc.fontSize(11).text(`${d.date} - ${d.type.toUpperCase()}`, { underline: true });
        doc.fontSize(10).text(d.description);
        if (d.resolution) doc.text(`Resolution: ${d.resolution}`);
        doc.text(`Status: ${d.status}`);
        doc.moveDown(1);
      });
    }

    addFooter(doc);
    doc.end();
  });
}

async function generateHomeworkReport(studentId) {
  const [students] = await query(
    `SELECT s.*, u.first_name, u.last_name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
  const student = students[0];
  if (!student) throw new Error('Student not found');

  const subs = await query(
    `SELECT hs.*, h.title as homework_title, h.due_date, h.max_score, c.name as course_name
     FROM homework_submissions hs JOIN homework h ON hs.homework_id = h.id JOIN courses c ON h.course_id = c.id
     WHERE hs.student_id = ?`,
    [studentId]
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    addHeader(doc, 'Homework Progress Report');
    doc.fontSize(14).text(`Student: ${student.first_name} ${student.last_name}`);
    doc.text(`Student ID: ${student.student_id}`);
    doc.moveDown(2);

    if (subs.length === 0) {
      doc.text('No homework submissions.');
    } else {
      subs.forEach((s) => {
        doc.fontSize(11).text(`${s.course_name} - ${s.homework_title}`, { underline: true });
        doc.text(`Due: ${s.due_date}`);
        doc.text(`Submitted: ${s.submitted_at}`);
        doc.text(`Score: ${s.score != null ? s.score + '/' + s.max_score : 'Pending'}`);
        doc.text(`Status: ${s.status}`);
        doc.moveDown(1);
      });
    }

    addFooter(doc);
    doc.end();
  });
}

module.exports = { generateMarksReport, generateDisciplineReport, generateHomeworkReport };

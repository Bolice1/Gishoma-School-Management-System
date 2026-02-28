const PDFDocument = require('pdfkit');
const { Mark, Discipline, HomeworkSubmission, Homework, Student, User, Course, Teacher } = require('../models');

const addHeader = (doc, title) => {
  doc.fontSize(20).text('Gishoma Secondary School', { align: 'center' });
  doc.fontSize(12).text(title, { align: 'center' });
  doc.moveDown(2);
};

const addFooter = (doc) => {
  doc.fontSize(8).text(
    `Generated on ${new Date().toLocaleString()} - Gishoma School Management System`,
    { align: 'center' }
  );
};

exports.generateMarksReport = async (studentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const student = await Student.findByPk(studentId, {
        include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName', 'email'] }],
      });
      if (!student) return reject(new Error('Student not found'));

      const marks = await Mark.findAll({
        where: { studentId },
        include: [{ model: Course, as: 'Course' }],
        order: [['academicYear', 'DESC'], ['term'], ['createdAt', 'DESC']],
      });

      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      addHeader(doc, 'Student Marks Report');
      doc.fontSize(14).text(`Student: ${student.User.firstName} ${student.User.lastName}`, { continued: false });
      doc.text(`Student ID: ${student.studentId} | Class: ${student.class}`);
      doc.text(`Email: ${student.User.email}`);
      doc.moveDown(2);

      if (marks.length === 0) {
        doc.text('No marks recorded.');
      } else {
        const byTerm = {};
        marks.forEach((m) => {
          const key = `${m.academicYear}-${m.term}`;
          if (!byTerm[key]) byTerm[key] = [];
          byTerm[key].push(m);
        });

        for (const [key, termMarks] of Object.entries(byTerm)) {
          doc.fontSize(12).text(key, { underline: true });
          doc.moveDown(0.5);
          termMarks.forEach((m) => {
            const pct = ((parseFloat(m.score) / parseFloat(m.maxScore)) * 100).toFixed(1);
            doc.text(`  ${m.Course.name}: ${m.score}/${m.maxScore} (${pct}%) - ${m.examType || 'N/A'}`);
          });
          doc.moveDown(1);
        }
      }

      addFooter(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateDisciplineReport = async (studentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const student = await Student.findByPk(studentId, {
        include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName'] }],
      });
      if (!student) return reject(new Error('Student not found'));

      const disciplines = await Discipline.findAll({
        where: { studentId },
        include: [{ model: Teacher, as: 'Teacher', include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName'] }] }],
        order: [['date', 'DESC']],
      });

      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      addHeader(doc, 'Discipline Report');
      doc.fontSize(14).text(`Student: ${student.User.firstName} ${student.User.lastName}`);
      doc.text(`Student ID: ${student.studentId} | Class: ${student.class}`);
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
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateHomeworkReport = async (studentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const student = await Student.findByPk(studentId, {
        include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName'] }],
      });
      if (!student) return reject(new Error('Student not found'));

      const submissions = await HomeworkSubmission.findAll({
        where: { studentId },
        include: [
          { model: Homework, as: 'Homework', include: [{ model: Course, as: 'Course' }] },
        ],
      });

      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      addHeader(doc, 'Homework Progress Report');
      doc.fontSize(14).text(`Student: ${student.User.firstName} ${student.User.lastName}`);
      doc.text(`Student ID: ${student.studentId}`);
      doc.moveDown(2);

      if (submissions.length === 0) {
        doc.text('No homework submissions.');
      } else {
        submissions.forEach((s) => {
          const hw = s.Homework;
          doc.fontSize(11).text(`${hw.Course?.name || 'Course'} - ${hw.title}`, { underline: true });
          doc.text(`Due: ${hw.dueDate}`);
          doc.text(`Submitted: ${s.submittedAt}`);
          doc.text(`Score: ${s.score != null ? s.score + '/' + hw.maxScore : 'Pending'}`);
          doc.text(`Status: ${s.status}`);
          doc.moveDown(1);
        });
      }

      addFooter(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

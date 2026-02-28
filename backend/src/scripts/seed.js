require('dotenv').config();
const {
  sequelize,
  User,
  Student,
  Teacher,
  Course,
  Enrollment,
  Attendance,
  Mark,
  Discipline,
  Homework,
  HomeworkSubmission,
  Exercise,
  ExerciseSubmission,
  Note,
  Fee,
  Payment,
  Announcement,
} = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const defaultPassword = 'password123';

    const admin = await User.create({
      email: 'admin@gishoma.edu',
      password: defaultPassword,
      firstName: 'School',
      lastName: 'Admin',
      role: 'admin',
    });

    const bursar = await User.create({
      email: 'bursar@gishoma.edu',
      password: defaultPassword,
      firstName: 'John',
      lastName: 'Bursar',
      role: 'bursar',
    });

    const dean = await User.create({
      email: 'dean@gishoma.edu',
      password: defaultPassword,
      firstName: 'Grace',
      lastName: 'Dean',
      role: 'dean',
    });

    const teacherUsers = await User.bulkCreate(
      [
        { email: 'teacher1@gishoma.edu', password: defaultPassword, firstName: 'Peter', lastName: 'Mwangi', role: 'teacher' },
        { email: 'teacher2@gishoma.edu', password: defaultPassword, firstName: 'Mary', lastName: 'Kamau', role: 'teacher' },
      ],
      { individualHooks: true }
    );

    const teachers = await Teacher.bulkCreate([
      { userId: teacherUsers[0].id, employeeId: 'T001', specialization: 'Mathematics' },
      { userId: teacherUsers[1].id, employeeId: 'T002', specialization: 'English' },
    ]);

    const studentUsers = await User.bulkCreate(
      [
        { email: 'student1@gishoma.edu', password: defaultPassword, firstName: 'James', lastName: 'Uwimana', role: 'student' },
        { email: 'student2@gishoma.edu', password: defaultPassword, firstName: 'Claire', lastName: 'Mukiza', role: 'student' },
        { email: 'student3@gishoma.edu', password: defaultPassword, firstName: 'David', lastName: 'Habimana', role: 'student' },
      ],
      { individualHooks: true }
    );

    const students = await Student.bulkCreate([
      { userId: studentUsers[0].id, studentId: 'S001', class: 'Senior 1', section: 'A' },
      { userId: studentUsers[1].id, studentId: 'S002', class: 'Senior 1', section: 'A' },
      { userId: studentUsers[2].id, studentId: 'S003', class: 'Senior 2', section: 'B' },
    ]);

    const courses = await Course.bulkCreate([
      { teacherId: teachers[0].id, name: 'Mathematics', code: 'MATH101', classLevel: 'Senior 1' },
      { teacherId: teachers[0].id, name: 'Mathematics', code: 'MATH201', classLevel: 'Senior 2' },
      { teacherId: teachers[1].id, name: 'English', code: 'ENG101', classLevel: 'Senior 1' },
    ]);

    await Enrollment.bulkCreate([
      { studentId: students[0].id, courseId: courses[0].id, academicYear: '2024-2025', status: 'active' },
      { studentId: students[1].id, courseId: courses[0].id, academicYear: '2024-2025', status: 'active' },
      { studentId: students[2].id, courseId: courses[1].id, academicYear: '2024-2025', status: 'active' },
    ]);

    const today = new Date().toISOString().split('T')[0];
    await Attendance.bulkCreate([
      { studentId: students[0].id, courseId: courses[0].id, teacherId: teachers[0].id, date: today, status: 'present', type: 'student' },
      { studentId: students[1].id, courseId: courses[0].id, teacherId: teachers[0].id, date: today, status: 'present', type: 'student' },
      { studentId: students[2].id, courseId: courses[1].id, teacherId: teachers[0].id, date: today, status: 'late', type: 'student' },
      { teacherId: teachers[0].id, date: today, status: 'present', type: 'teacher' },
      { teacherId: teachers[1].id, date: today, status: 'present', type: 'teacher' },
    ]);

    await Mark.bulkCreate([
      { studentId: students[0].id, courseId: courses[0].id, teacherId: teachers[0].id, term: 'Term 1', academicYear: '2024-2025', examType: 'midterm', score: 85, maxScore: 100 },
      { studentId: students[1].id, courseId: courses[0].id, teacherId: teachers[0].id, term: 'Term 1', academicYear: '2024-2025', examType: 'midterm', score: 72, maxScore: 100 },
      { studentId: students[0].id, courseId: courses[2].id, teacherId: teachers[1].id, term: 'Term 1', academicYear: '2024-2025', examType: 'midterm', score: 90, maxScore: 100 },
    ]);

    await Discipline.bulkCreate([
      { studentId: students[2].id, teacherId: teachers[0].id, type: 'warning', description: 'Late to class', date: today, status: 'resolved' },
    ]);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const homeworks = await Homework.bulkCreate([
      { courseId: courses[0].id, teacherId: teachers[0].id, title: 'Algebra Practice', description: 'Complete exercises 1-10', dueDate: nextWeek, status: 'published' },
      { courseId: courses[2].id, teacherId: teachers[1].id, title: 'Essay Writing', description: 'Write 500 words on leadership', dueDate: nextWeek, status: 'published' },
    ]);

    await HomeworkSubmission.create({
      homeworkId: homeworks[0].id,
      studentId: students[0].id,
      content: 'Completed all exercises',
      submittedAt: new Date(),
      status: 'graded',
      score: 95,
    });

    await Exercise.bulkCreate([
      {
        courseId: courses[0].id,
        teacherId: teachers[0].id,
        title: 'Quick Math Quiz',
        questions: [{ q: '2+2?', a: '4' }, { q: '5*3?', a: '15' }],
        status: 'active',
        maxScore: 100,
      },
    ]);

    await ExerciseSubmission.create({
      exerciseId: (await Exercise.findOne()).id,
      studentId: students[0].id,
      answers: { q1: '4', q2: '15' },
      score: 100,
      submittedAt: new Date(),
    });

    await Note.bulkCreate([
      { courseId: courses[0].id, teacherId: teachers[0].id, title: 'Introduction to Algebra', content: 'Algebra is the branch of mathematics...', topic: 'Algebra' },
      { courseId: courses[2].id, teacherId: teachers[1].id, title: 'Essay Structure', content: 'A good essay has an introduction, body, and conclusion...', topic: 'Writing' },
    ]);

    const fees = await Fee.bulkCreate([
      { name: 'Tuition Term 1', amount: 150000, academicYear: '2024-2025', term: 'Term 1' },
      { name: 'Development Fee', amount: 25000, academicYear: '2024-2025' },
    ]);

    await Payment.bulkCreate([
      { studentId: students[0].id, feeId: fees[0].id, amount: 150000, receiptNumber: 'REC-001', paymentDate: new Date(), paymentMethod: 'bank' },
      { studentId: students[1].id, feeId: fees[0].id, amount: 75000, receiptNumber: 'REC-002', paymentDate: new Date(), paymentMethod: 'mobile_money' },
    ]);

    await Announcement.bulkCreate([
      { title: 'Welcome Back', content: 'School resumes next week. All students should be present.', authorId: admin.id, targetRole: 'all', priority: 'high' },
    ]);

    console.log('Seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@gishoma.edu / password123');
    console.log('Bursar: bursar@gishoma.edu / password123');
    console.log('Dean: dean@gishoma.edu / password123');
    console.log('Teacher: teacher1@gishoma.edu / password123');
    console.log('Student: student1@gishoma.edu / password123');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();

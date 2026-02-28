const { sequelize } = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Attendance = require('./Attendance');
const Mark = require('./Mark');
const Discipline = require('./Discipline');
const Homework = require('./Homework');
const HomeworkSubmission = require('./HomeworkSubmission');
const Exercise = require('./Exercise');
const ExerciseSubmission = require('./ExerciseSubmission');
const Note = require('./Note');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Announcement = require('./Announcement');

// User associations
User.hasOne(Student);
User.hasOne(Teacher);
Student.belongsTo(User);
Teacher.belongsTo(User);

// Student associations
Student.hasMany(Enrollment);
Student.hasMany(Attendance);
Student.hasMany(Mark);
Student.hasMany(Discipline);
Student.hasMany(HomeworkSubmission);
Student.hasMany(ExerciseSubmission);
Student.hasMany(Payment);

// Teacher associations
Teacher.hasMany(Course);
Teacher.hasMany(Attendance);
Teacher.hasMany(Mark);
Teacher.hasMany(Discipline);
Teacher.hasMany(Homework);
Teacher.hasMany(Exercise);
Teacher.hasMany(Note);

// Course associations
Course.belongsTo(Teacher);
Course.hasMany(Enrollment);
Course.hasMany(Mark);
Course.hasMany(Homework);
Course.hasMany(Exercise);
Course.hasMany(Note);
Course.hasMany(Attendance);

// Enrollment
Enrollment.belongsTo(Student);
Enrollment.belongsTo(Course);

// Attendance
Attendance.belongsTo(Student);
Attendance.belongsTo(Course);
Attendance.belongsTo(Teacher);

// Mark
Mark.belongsTo(Student);
Mark.belongsTo(Course);
Mark.belongsTo(Teacher);

// Discipline
Discipline.belongsTo(Student);
Discipline.belongsTo(Teacher);

// Homework
Homework.belongsTo(Course);
Homework.belongsTo(Teacher);
Homework.hasMany(HomeworkSubmission);
HomeworkSubmission.belongsTo(Homework);
HomeworkSubmission.belongsTo(Student);

// Exercise
Exercise.belongsTo(Course);
Exercise.belongsTo(Teacher);
Exercise.hasMany(ExerciseSubmission);
ExerciseSubmission.belongsTo(Exercise);
ExerciseSubmission.belongsTo(Student);

// Note
Note.belongsTo(Course);
Note.belongsTo(Teacher);

// Fee & Payment
Fee.hasMany(Payment);
Payment.belongsTo(Student);
Payment.belongsTo(Fee);

// Announcement
Announcement.belongsTo(User, { as: 'User', foreignKey: 'authorId' });
User.hasMany(Announcement, { foreignKey: 'authorId' });

module.exports = {
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
};

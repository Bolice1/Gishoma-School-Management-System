const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    references: { model: 'students', key: 'id' },
  },
  teacherId: {
    type: DataTypes.UUID,
    references: { model: 'teachers', key: 'id' },
  },
  courseId: {
    type: DataTypes.UUID,
    references: { model: 'courses', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'attendances',
});

module.exports = Attendance;

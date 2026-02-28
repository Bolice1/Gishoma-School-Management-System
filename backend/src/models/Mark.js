const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'teachers', key: 'id' },
  },
  term: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  examType: {
    type: DataTypes.ENUM('midterm', 'final', 'assignment', 'quiz'),
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  maxScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'marks',
});

module.exports = Mark;

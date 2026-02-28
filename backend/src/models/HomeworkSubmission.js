const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  homeworkId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'homeworks', key: 'id' },
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  content: {
    type: DataTypes.TEXT,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'late'),
    defaultValue: 'submitted',
  },
}, {
  tableName: 'homework_submissions',
});

module.exports = HomeworkSubmission;

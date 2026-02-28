const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExerciseSubmission = sequelize.define('ExerciseSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exerciseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'exercises', key: 'id' },
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  answers: {
    type: DataTypes.JSONB,
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    comment: 'Minutes',
  },
}, {
  tableName: 'exercise_submissions',
});

module.exports = ExerciseSubmission;

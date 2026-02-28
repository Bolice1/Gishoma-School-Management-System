const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  questions: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  maxScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    comment: 'Minutes',
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'closed'),
    defaultValue: 'active',
  },
}, {
  tableName: 'exercises',
});

module.exports = Exercise;

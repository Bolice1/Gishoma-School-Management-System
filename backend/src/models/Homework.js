const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Homework = sequelize.define('Homework', {
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
  description: {
    type: DataTypes.TEXT,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  maxScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed'),
    defaultValue: 'published',
  },
}, {
  tableName: 'homeworks',
});

module.exports = Homework;

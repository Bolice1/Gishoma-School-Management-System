const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'teachers', key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  classLevel: {
    type: DataTypes.STRING,
    comment: 'e.g., Senior 1, Senior 2',
  },
}, {
  tableName: 'courses',
});

module.exports = Course;

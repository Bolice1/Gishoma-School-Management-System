const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Discipline = sequelize.define('Discipline', {
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
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'teachers', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('warning', 'reprimand', 'suspension', 'expulsion', 'other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  resolution: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved', 'closed'),
    defaultValue: 'open',
  },
}, {
  tableName: 'disciplines',
});

module.exports = Discipline;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  feeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'fees', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  receiptNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank', 'mobile_money', 'check', 'other'),
    defaultValue: 'cash',
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'payments',
});

module.exports = Payment;

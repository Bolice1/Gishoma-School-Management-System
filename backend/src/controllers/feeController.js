const { Fee, Payment, Student, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      where: { isActive: true },
      order: [['academicYear', 'DESC'], ['term', 'DESC']],
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (startDate && endDate) {
      where.paymentDate = { [Op.between]: [startDate, endDate] };
    }
    
    const payments = await Payment.findAll({
      where,
      include: [
        { model: Student, as: 'Student', include: ['User'] },
        { model: Fee, as: 'Fee' },
      ],
      order: [['paymentDate', 'DESC']],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const payment = await Payment.create({
      ...req.body,
      receiptNumber,
      paymentDate: req.body.paymentDate || new Date(),
    });
    res.status(201).json(await Payment.findByPk(payment.id, {
      include: [{ model: Student, as: 'Student', include: ['User'] }, { model: Fee, as: 'Fee' }],
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function listFees(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const fees = await query(
      'SELECT * FROM fees WHERE school_id = ? AND is_active = 1 ORDER BY academic_year DESC, term',
      [schoolId]
    );
    res.json(fees);
  } catch (err) {
    next(err);
  }
}

async function createFee(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { name, amount, description, term, academicYear, dueDate } = req.body;

    const id = uuidv4();
    await query(
      `INSERT INTO fees (id, school_id, name, amount, description, term, academic_year, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, name, amount, description || null, term || null, academicYear, dueDate || null]
    );

    const created = await query('SELECT * FROM fees WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function listPayments(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, startDate, endDate } = req.query;

    let where = 'p.school_id = ?';
    const params = [schoolId];
    if (studentId) { where += ' AND p.student_id = ?'; params.push(studentId); }
    if (startDate) { where += ' AND DATE(p.payment_date) >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND DATE(p.payment_date) <= ?'; params.push(endDate); }

    const rows = await query(
      `SELECT p.*, s.student_id, u.first_name, u.last_name, f.name as fee_name, f.amount as fee_amount
       FROM payments p JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id JOIN fees f ON p.fee_id = f.id
       WHERE ${where} ORDER BY p.payment_date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, feeId, amount, paymentMethod, reference, remarks } = req.body;

    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const id = uuidv4();

    await query(
      `INSERT INTO payments (id, school_id, student_id, fee_id, amount, receipt_number, payment_method, payment_date, reference, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [id, schoolId, studentId, feeId, amount, receiptNumber, paymentMethod || 'cash', reference || null, remarks || null]
    );

    const created = await query(
      `SELECT p.*, s.student_id, u.first_name, u.last_name, f.name as fee_name FROM payments p
       JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id JOIN fees f ON p.fee_id = f.id WHERE p.id = ?`,
      [id]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { listFees, createFee, listPayments, recordPayment };

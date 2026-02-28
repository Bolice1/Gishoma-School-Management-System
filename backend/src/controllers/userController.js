const { User, Student, Teacher } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        { model: Student, as: 'Student', required: false },
        { model: Teacher, as: 'Teacher', required: false },
      ],
    });
    res.json({ users: rows, total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, studentData, teacherData } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({
      email,
      password: password || 'password123',
      firstName,
      lastName,
      role,
      phone,
    });
    
    if (role === 'student' && studentData) {
      await Student.create({
        userId: user.id,
        studentId: studentData.studentId,
        class: studentData.class,
        section: studentData.section,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        parentName: studentData.parentName,
        parentPhone: studentData.parentPhone,
        address: studentData.address,
        enrollmentDate: studentData.enrollmentDate,
      });
    } else if (role === 'teacher' && teacherData) {
      await Teacher.create({
        userId: user.id,
        employeeId: teacherData.employeeId,
        specialization: teacherData.specialization,
        dateOfBirth: teacherData.dateOfBirth,
        gender: teacherData.gender,
        hireDate: teacherData.hireDate,
        address: teacherData.address,
      });
    } else if (role === 'bursar' || role === 'dean') {
      // No additional profile needed
    }
    
    const fullUser = await User.findByPk(user.id, {
      include: [
        { model: Student, as: 'Student', required: false },
        { model: Teacher, as: 'Teacher', required: false },
      ],
    });
    res.status(201).json(fullUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, isActive, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await user.update({ firstName, lastName, phone, isActive, password });
    res.json(await User.findByPk(id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

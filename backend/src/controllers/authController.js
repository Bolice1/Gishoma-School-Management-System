const jwt = require('jsonwebtoken');
const { User, Student, Teacher } = require('../models');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const formatUserResponse = async (user) => {
  const userObj = user.toJSON();
  delete userObj.password;
  
  if (user.role === 'student') {
    const student = await Student.findOne({ where: { userId: user.id } });
    if (student) userObj.studentId = student.id;
  }
  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ where: { userId: user.id } });
    if (teacher) userObj.teacherId = teacher.id;
  }
  
  return userObj;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    const token = generateToken(user.id);
    const userData = await formatUserResponse(user);
    
    res.json({
      token,
      user: userData,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.me = async (req, res) => {
  try {
    const userData = await formatUserResponse(req.user);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

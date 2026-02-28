require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'Gishoma',
};

async function seed() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    const hash = await bcrypt.hash('password123', 12);

    let [rows] = await conn.execute('SELECT id FROM schools WHERE slug = ?', ['gishoma-secondary']);
    let school1Id = rows[0]?.id || uuidv4();
    if (!rows[0]) {
      await conn.execute(
        'INSERT INTO schools (id, name, slug, email, phone, region) VALUES (?, ?, ?, ?, ?, ?)',
        [school1Id, 'Gishoma Secondary School', 'gishoma-secondary', 'admin@gishoma.edu', '+250788000001', 'Southern']
      );
    }

    [rows] = await conn.execute('SELECT id FROM schools WHERE slug = ?', ['kigali-high']);
    const school2Id = rows[0]?.id || uuidv4();
    if (!rows[0]) {
      await conn.execute(
        'INSERT INTO schools (id, name, slug, email, phone, region) VALUES (?, ?, ?, ?, ?, ?)',
        [school2Id, 'Kigali High School', 'kigali-high', 'info@kigalihigh.edu', '+250788000002', 'Kigali']
      );
    }

    const superAdminId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, NULL, ?, ?, ?, ?, 'super_admin')`,
      [superAdminId, 'superadmin@gishoma.edu', hash, 'Platform', 'Admin']
    );

    const schoolAdminId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'school_admin')`,
      [schoolAdminId, school1Id, 'admin@gishoma.edu', hash, 'School', 'Admin']
    );

    const bursarId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'bursar')`,
      [bursarId, school1Id, 'bursar@gishoma.edu', hash, 'John', 'Bursar']
    );

    const deanId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'dean')`,
      [deanId, school1Id, 'dean@gishoma.edu', hash, 'Grace', 'Dean']
    );

    const teacher1Id = uuidv4();
    const teacher1UserId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'teacher')`,
      [teacher1UserId, school1Id, 'teacher1@gishoma.edu', hash, 'Peter', 'Mwangi']
    );
    await conn.execute(
      `INSERT IGNORE INTO teachers (id, school_id, user_id, employee_id, specialization) VALUES (?, ?, ?, ?, ?)`,
      [teacher1Id, school1Id, teacher1UserId, 'T001', 'Mathematics']
    );

    const teacher2Id = uuidv4();
    const teacher2UserId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'teacher')`,
      [teacher2UserId, school1Id, 'teacher2@gishoma.edu', hash, 'Mary', 'Kamau']
    );
    await conn.execute(
      `INSERT IGNORE INTO teachers (id, school_id, user_id, employee_id, specialization) VALUES (?, ?, ?, ?, ?)`,
      [teacher2Id, school1Id, teacher2UserId, 'T002', 'English']
    );

    const student1Id = uuidv4();
    const student1UserId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [student1UserId, school1Id, 'student1@gishoma.edu', hash, 'James', 'Uwimana']
    );
    await conn.execute(
      `INSERT IGNORE INTO students (id, school_id, user_id, student_id, class_level, section) VALUES (?, ?, ?, ?, ?, ?)`,
      [student1Id, school1Id, student1UserId, 'S001', 'Senior 1', 'A']
    );

    const student2Id = uuidv4();
    const student2UserId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [student2UserId, school1Id, 'student2@gishoma.edu', hash, 'Claire', 'Mukiza']
    );
    await conn.execute(
      `INSERT IGNORE INTO students (id, school_id, user_id, student_id, class_level, section) VALUES (?, ?, ?, ?, ?, ?)`,
      [student2Id, school1Id, student2UserId, 'S002', 'Senior 1', 'A']
    );

    const course1Id = uuidv4();
    const course2Id = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO courses (id, school_id, teacher_id, name, code, class_level) VALUES (?, ?, ?, ?, ?, ?)`,
      [course1Id, school1Id, teacher1Id, 'Mathematics', 'MATH101', 'Senior 1']
    );
    await conn.execute(
      `INSERT IGNORE INTO courses (id, school_id, teacher_id, name, code, class_level) VALUES (?, ?, ?, ?, ?, ?)`,
      [course2Id, school1Id, teacher2Id, 'English', 'ENG101', 'Senior 1']
    );

    const today = new Date().toISOString().split('T')[0];
    await conn.execute(
      `INSERT IGNORE INTO attendance (id, school_id, student_id, teacher_id, date, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), school1Id, student1Id, null, today, 'present', 'student']
    );
    await conn.execute(
      `INSERT IGNORE INTO attendance (id, school_id, teacher_id, date, status, type) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), school1Id, teacher1Id, today, 'present', 'teacher']
    );

    await conn.execute(
      `INSERT IGNORE INTO marks (id, school_id, student_id, course_id, teacher_id, term, academic_year, exam_type, score, max_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), school1Id, student1Id, course1Id, teacher1Id, 'Term 1', '2024-2025', 'midterm', 85, 100]
    );

    const fee1Id = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO fees (id, school_id, name, amount, term, academic_year) VALUES (?, ?, ?, ?, ?, ?)`,
      [fee1Id, school1Id, 'Tuition Term 1', 150000, 'Term 1', '2024-2025']
    );
    await conn.execute(
      `INSERT IGNORE INTO payments (id, school_id, student_id, fee_id, amount, receipt_number, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [uuidv4(), school1Id, student1Id, fee1Id, 150000, 'REC-001', 'bank']
    );

    const hwId = uuidv4();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await conn.execute(
      `INSERT IGNORE INTO homework (id, school_id, course_id, teacher_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [hwId, school1Id, course1Id, teacher1Id, 'Algebra Practice', 'Complete exercises 1-10', dueDate, 100]
    );

    const noteId = uuidv4();
    await conn.execute(
      `INSERT IGNORE INTO notes (id, school_id, course_id, teacher_id, title, content, topic) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [noteId, school1Id, course1Id, teacher1Id, 'Introduction to Algebra', 'Algebra is the branch of mathematics...', 'Algebra']
    );

    await conn.execute(
      `INSERT IGNORE INTO announcements (id, school_id, title, content, author_id, target_role) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), school1Id, 'Welcome Back', 'School resumes next week.', schoolAdminId, 'all']
    );

    console.log('Seed completed successfully!');
    console.log('\nTest credentials (all password: password123):');
    console.log('Super Admin: superadmin@gishoma.edu');
    console.log('School Admin: admin@gishoma.edu');
    console.log('Bursar: bursar@gishoma.edu');
    console.log('Dean: dean@gishoma.edu');
    console.log('Teacher: teacher1@gishoma.edu');
    console.log('Student: student1@gishoma.edu');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();

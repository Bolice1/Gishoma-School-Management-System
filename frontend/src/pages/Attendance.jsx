import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Attendance() {
  const [studentAtt, setStudentAtt] = useState([]);
  const [teacherAtt, setTeacherAtt] = useState([]);
  const [tab, setTab] = useState('students');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/attendance/students?startDate=${today}&endDate=${today}`).then((res) => setStudentAtt(res.data || []));
    api.get(`/attendance/teachers?startDate=${today}&endDate=${today}`).then((res) => setTeacherAtt(res.data || []));
  }, []);

  const studentCols = [
    { label: 'Student', render: (r) => r.Student?.User ? `${r.Student.User.firstName} ${r.Student.User.lastName}` : '-' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.status}</span> },
  ];

  const teacherCols = [
    { label: 'Teacher', render: (r) => r.Teacher?.User ? `${r.Teacher.User.firstName} ${r.Teacher.User.lastName}` : '-' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.status}</span> },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Attendance</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button style={{ ...styles.tab, ...(tab === 'students' ? styles.tabActive : {}) }} onClick={() => setTab('students')}>Students</button>
        <button style={{ ...styles.tab, ...(tab === 'teachers' ? styles.tabActive : {}) }} onClick={() => setTab('teachers')}>Teachers</button>
      </div>
      <DataTable columns={tab === 'students' ? studentCols : teacherCols} data={tab === 'students' ? studentAtt : teacherAtt} />
    </div>
  );
}

const styles = {
  tab: { marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: '6px' },
  tabActive: { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: 'white' },
};

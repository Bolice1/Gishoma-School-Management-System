import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/students').then((res) => setStudents(res.data.students || []));
  }, []);

  const columns = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'class', label: 'Class' },
    { key: 'section', label: 'Section' },
    { label: 'Name', render: (r) => r.User ? `${r.User.firstName} ${r.User.lastName}` : '-' },
    { label: 'Email', render: (r) => r.User?.email || '-' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Students</h1>
      <DataTable columns={columns} data={students} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    let canceled = false;
    api.get('/students')
      .then((res) => {
        if (!canceled) setStudents(res.data?.students ?? []);
      })
      .catch(() => {
        if (!canceled) setStudents([]);
      });
    return () => { canceled = true; };
  }, []);

  const columns = [
    { key: 'student_id', label: 'Student ID' },
    { key: 'class_level', label: 'Class' },
    { key: 'section', label: 'Section' },
    { label: 'Name', render: (r) => r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : '-' },
    { label: 'Email', render: (r) => r.email || '-' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Students</h1>
      <DataTable columns={columns} data={students} />
    </div>
  );
}

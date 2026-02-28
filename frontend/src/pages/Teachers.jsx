import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api.get('/teachers').then((res) => setTeachers(res.data.teachers || []));
  }, []);

  const columns = [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'specialization', label: 'Specialization' },
    { label: 'Name', render: (r) => r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : '-' },
    { label: 'Email', render: (r) => r.email || '-' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Teachers</h1>
      <DataTable columns={columns} data={teachers} />
    </div>
  );
}

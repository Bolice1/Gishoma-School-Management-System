import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Discipline() {
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    api.get('/discipline').then((res) => setDisciplines(res.data || []));
  }, []);

  const columns = [
    { label: 'Student', render: (r) => r.student_first_name && r.student_last_name ? `${r.student_first_name} ${r.student_last_name}` : r.student_no || '-' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.type}</span> },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Discipline Cases</h1>
      <DataTable columns={columns} data={disciplines} />
    </div>
  );
}

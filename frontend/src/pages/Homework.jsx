import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Homework() {
  const [homeworks, setHomeworks] = useState([]);

  useEffect(() => {
    api.get('/homework').then((res) => setHomeworks(res.data || []));
  }, []);

  const columns = [
    { label: 'Course', render: (r) => r.Course?.name || '-' },
    { key: 'title', label: 'Title' },
    { key: 'dueDate', label: 'Due Date', render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Homework</h1>
      <DataTable columns={columns} data={homeworks} />
    </div>
  );
}

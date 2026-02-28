import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Notes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get('/notes').then((res) => setNotes(res.data || []));
  }, []);

  const columns = [
    { label: 'Course', render: (r) => r.Course?.name || '-' },
    { key: 'title', label: 'Title' },
    { key: 'topic', label: 'Topic' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Notes</h1>
      <DataTable columns={columns} data={notes} />
    </div>
  );
}

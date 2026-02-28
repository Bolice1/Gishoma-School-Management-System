import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    api.get('/exercises').then((res) => setExercises(res.data || []));
  }, []);

  const columns = [
    { label: 'Course', render: (r) => r.course_name || '-' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Exercises</h1>
      <DataTable columns={columns} data={exercises} />
    </div>
  );
}

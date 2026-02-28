import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Marks() {
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    api.get('/marks').then((res) => setMarks(res.data || []));
  }, []);

  const columns = [
    { label: 'Student', render: (r) => r.Student?.User ? `${r.Student.User.firstName} ${r.Student.User.lastName}` : '-' },
    { label: 'Course', render: (r) => r.Course?.name || '-' },
    { key: 'term', label: 'Term' },
    { key: 'examType', label: 'Type' },
    { label: 'Score', render: (r) => `${r.score}/${r.maxScore}` },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Marks</h1>
      <DataTable columns={columns} data={marks} />
    </div>
  );
}

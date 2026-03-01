import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Marks() {
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    let canceled = false;
    api.get('/marks')
      .then((res) => {
        if (!canceled) setMarks(res.data || []);
      })
      .catch(() => {
        if (!canceled) setMarks([]);
      });
    return () => { canceled = true; };
  }, []);

  const columns = [
    { label: 'Student', render: (r) => r.student_first_name && r.student_last_name ? `${r.student_first_name} ${r.student_last_name}` : r.student_no || '-' },
    { label: 'Course', render: (r) => r.course_name || '-' },
    { key: 'term', label: 'Term' },
    { key: 'exam_type', label: 'Type' },
    { label: 'Score', render: (r) => `${r.score}/${r.max_score}` },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Marks</h1>
      <DataTable columns={columns} data={marks} />
    </div>
  );
}

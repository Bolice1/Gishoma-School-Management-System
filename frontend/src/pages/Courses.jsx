import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data || []));
  }, []);

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'classLevel', label: 'Level' },
    { label: 'Teacher', render: (r) => r.Teacher?.User ? `${r.Teacher.User.firstName} ${r.Teacher.User.lastName}` : '-' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Courses</h1>
      <DataTable columns={columns} data={courses} />
    </div>
  );
}

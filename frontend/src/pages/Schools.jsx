import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Schools() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    api.get('/schools').then((res) => setSchools(res.data.schools || []));
  }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'email', label: 'Email' },
    { key: 'region', label: 'Region' },
    { key: 'subscription_tier', label: 'Tier' },
    { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Schools</h1>
      <DataTable columns={columns} data={schools} />
    </div>
  );
}

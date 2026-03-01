import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let canceled = false;
    api.get('/users')
      .then((res) => { if (!canceled) setUsers(res.data.users || []); })
      .catch(() => { if (!canceled) setUsers([]); });
    return () => { canceled = true; };
  }, []);

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'role', label: 'Role', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.role?.replace(/_/g, ' ')}</span> },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Users</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

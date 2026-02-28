import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/activity-logs').then((res) => setLogs(res.data || []));
  }, []);

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource' },
    { key: 'user_id', label: 'User ID' },
    { key: 'school_id', label: 'School ID' },
    { key: 'ip_address', label: 'IP' },
    { key: 'created_at', label: 'Time', render: (r) => new Date(r.created_at).toLocaleString() },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Activity Logs</h1>
      <DataTable columns={columns} data={logs} />
    </div>
  );
}

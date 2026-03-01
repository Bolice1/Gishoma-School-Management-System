import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let canceled = false;
    api.get('/announcements')
      .then((res) => { if (!canceled) setAnnouncements(res.data || []); })
      .catch(() => { if (!canceled) setAnnouncements([]); });
    return () => { canceled = true; };
  }, []);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content', render: (r) => (r.content || '').slice(0, 80) + '...' },
    { key: 'priority', label: 'Priority' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Announcements</h1>
      <DataTable columns={columns} data={announcements} />
    </div>
  );
}

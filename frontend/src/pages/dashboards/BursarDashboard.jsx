import { useState, useEffect } from 'react';
import api from '../../api';

export default function BursarDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/bursar').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={styles.title}>Bursar Dashboard</h1>
      <div style={styles.grid}>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-success)' }}>
          <span style={styles.cardLabel}>Today's Payments</span>
          <span style={styles.cardValue}>{stats.todayPayments}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Today's Total</span>
          <span style={styles.cardValue}>RWF {stats.todayTotal?.toLocaleString() || 0}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-warning)' }}>
          <span style={styles.cardLabel}>Month Total</span>
          <span style={styles.cardValue}>RWF {stats.monthTotal?.toLocaleString() || 0}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: { marginBottom: '1.5rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'var(--color-surface)',
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    borderLeft: '4px solid',
    display: 'flex',
    flexDirection: 'column',
  },
  cardLabel: { fontSize: '0.85rem', color: 'var(--color-text-muted)' },
  cardValue: { fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' },
};

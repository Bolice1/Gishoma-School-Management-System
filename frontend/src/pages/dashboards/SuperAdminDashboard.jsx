import { useState, useEffect } from 'react';
import api from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/super-admin')
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (error) return <div style={{ color: 'var(--color-danger)' }}>{error}</div>;
  if (!stats) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Schools', value: stats.totalSchools, color: 'var(--color-accent)' },
    { label: 'Total Users', value: stats.totalUsers, color: 'var(--color-success)' },
    { label: 'Total Students', value: stats.totalStudents, color: 'var(--color-warning)' },
    { label: 'Total Teachers', value: stats.totalTeachers, color: 'var(--color-accent)' },
  ];

  return (
    <div>
      <h1 style={styles.title}>Super Admin Dashboard</h1>
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={{ ...styles.card, borderLeftColor: card.color }}>
            <span style={styles.cardLabel}>{card.label}</span>
            <span style={styles.cardValue}>{card.value}</span>
          </div>
        ))}
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

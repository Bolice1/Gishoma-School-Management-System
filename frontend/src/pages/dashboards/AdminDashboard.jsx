import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/admin').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, color: 'var(--color-accent)' },
    { label: 'Total Teachers', value: stats.totalTeachers, color: 'var(--color-success)' },
    { label: 'Monthly Revenue', value: `RWF ${stats.monthlyRevenue?.toLocaleString() || 0}`, color: 'var(--color-warning)' },
    { label: 'Today Present', value: stats.todayPresent, color: 'var(--color-success)' },
    { label: 'Today Absent', value: stats.todayAbsent, color: 'var(--color-danger)' },
    { label: 'Open Discipline Cases', value: stats.openDisciplines, color: 'var(--color-warning)' },
  ];

  return (
    <div>
      <h1 style={styles.title}>Admin Dashboard</h1>
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

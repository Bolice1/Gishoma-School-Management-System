import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';

export default function TeacherDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const id = user?.teacherId;
    if (id) api.get(`/dashboard/teacher/${id}`).then((res) => setStats(res.data)).catch(() => setStats({}));
  }, [user?.teacherId]);

  if (!stats && !user?.teacherId) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <h1 style={styles.title}>Teacher Dashboard</h1>
      <div style={styles.grid}>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Discipline Cases</span>
          <span style={styles.cardValue}>{stats.disciplineCases}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-success)' }}>
          <span style={styles.cardLabel}>Active Homeworks</span>
          <span style={styles.cardValue}>{stats.homeworks}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-warning)' }}>
          <span style={styles.cardLabel}>Active Exercises</span>
          <span style={styles.cardValue}>{stats.exercises}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Marks Entered</span>
          <span style={styles.cardValue}>{stats.marksAdded}</span>
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

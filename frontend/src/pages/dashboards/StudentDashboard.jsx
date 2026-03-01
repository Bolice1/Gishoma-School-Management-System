import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let canceled = false;
    const id = user?.studentId;
    if (id) {
      api.get(`/dashboard/student/${id}`)
        .then((res) => { if (!canceled) setStats(res.data); })
        .catch(() => { if (!canceled) setStats({}); });
    }
    return () => { canceled = true; };
  }, [user?.studentId]);

  if (!stats && !user?.studentId) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <h1 style={styles.title}>Student Dashboard</h1>
      <div style={styles.grid}>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Notes Available</span>
          <span style={styles.cardValue}>{stats.notesAvailable}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-success)' }}>
          <span style={styles.cardLabel}>Exercises Completed</span>
          <span style={styles.cardValue}>{stats.exercisesCompleted}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-warning)' }}>
          <span style={styles.cardLabel}>Homework Submitted</span>
          <span style={styles.cardValue}>{stats.homeworkSubmitted}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Marks Recorded</span>
          <span style={styles.cardValue}>{stats.marksRecorded}</span>
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

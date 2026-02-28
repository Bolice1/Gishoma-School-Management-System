import { useState, useEffect } from 'react';
import api from '../../api';

export default function DeanDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/dean').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={styles.title}>Dean of Courses - Attendance</h1>
      <div style={styles.grid}>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-success)' }}>
          <span style={styles.cardLabel}>Students Present Today</span>
          <span style={styles.cardValue}>{stats.studentPresent}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-danger)' }}>
          <span style={styles.cardLabel}>Students Absent</span>
          <span style={styles.cardValue}>{stats.studentAbsent}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-success)' }}>
          <span style={styles.cardLabel}>Teachers Present</span>
          <span style={styles.cardValue}>{stats.teacherPresent}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-danger)' }}>
          <span style={styles.cardLabel}>Teachers Absent</span>
          <span style={styles.cardValue}>{stats.teacherAbsent}</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Student Attendance Rate</span>
          <span style={styles.cardValue}>{stats.studentAttendanceRate}%</span>
        </div>
        <div style={{ ...styles.card, borderLeftColor: 'var(--color-accent)' }}>
          <span style={styles.cardLabel}>Teacher Attendance Rate</span>
          <span style={styles.cardValue}>{stats.teacherAttendanceRate}%</span>
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

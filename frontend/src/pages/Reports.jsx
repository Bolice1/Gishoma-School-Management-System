import { useSelector } from 'react-redux';
import api from '../api';

export default function Reports() {
  const { user } = useSelector((s) => s.auth);
  const studentId = user?.studentId;

  const downloadPdf = (type) => {
    if (!studentId) return;
    api.get(`/pdf/${type}/${studentId}`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}-report.pdf`);
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        alert('Failed to download report');
      });
  };

  if (!studentId) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My Reports</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Download PDF reports of your marks, homework progress, and discipline records.
      </p>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Marks Report</h3>
          <p style={styles.cardDesc}>All your marks by term and course</p>
          <button style={styles.button} onClick={() => downloadPdf('marks')}>Download PDF</button>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Homework Report</h3>
          <p style={styles.cardDesc}>Homework submissions and scores</p>
          <button style={styles.button} onClick={() => downloadPdf('homework')}>Download PDF</button>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Discipline Report</h3>
          <p style={styles.cardDesc}>Discipline cases and resolutions</p>
          <button style={styles.button} onClick={() => downloadPdf('discipline')}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    background: 'var(--color-surface)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
  },
  cardTitle: { margin: '0 0 0.5rem' },
  cardDesc: { color: 'var(--color-text-muted)', margin: '0 0 1rem', fontSize: '0.9rem' },
  button: {
    padding: '0.5rem 1rem',
    background: 'var(--color-accent)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
  },
};

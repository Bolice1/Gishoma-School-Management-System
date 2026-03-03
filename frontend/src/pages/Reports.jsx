import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../components/Toast';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import api from '../api';

const styles = {
  page: { padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0, marginBottom: '0.5rem' },
  subtitle: { color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-text)' },
  termContainer: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  termHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border)',
  },
  termName: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' },
  termStats: { display: 'flex', gap: '2rem', fontSize: '0.9rem' },
  termStat: { display: 'flex', flexDirection: 'column' },
  statValue: { fontWeight: 600, color: 'var(--color-accent)', fontSize: '1.2rem' },
  statLabel: { color: 'var(--color-text-muted)', fontSize: '0.8rem' },
  courseRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid var(--color-border)',
    alignItems: 'center',
  },
  courseRowHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--color-bg)',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    borderRadius: '8px 8px 0 0',
  },
  courseCell: { fontSize: '0.9rem' },
  scoreCell: { fontWeight: 600, color: 'var(--color-accent)' },
  passCell: { color: 'var(--color-success)', fontWeight: 600 },
  failCell: { color: 'var(--color-danger)', fontWeight: 600 },
  downloadBtn: {
    padding: '0.6rem 1.2rem',
    background: 'var(--color-accent)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'background 0.2s',
  },
  downloadBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  tableWrapper: { overflowX: 'auto' },
};

export default function Reports() {
  const { user } = useSelector((s) => s.auth);
  const { toast } = useToast();
  const studentId = user?.studentId;

  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    loadMarks();
  }, [studentId]);

  const loadMarks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/marks?studentId=${studentId}`);
      setMarks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load marks');
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (type) => {
    if (!studentId) return;
    setDownloading(true);
    try {
      const res = await api.get(`/pdf/${type}/${studentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.pdf`);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (err) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (!studentId) {
    return <div style={styles.page}><p>Loading...</p></div>;
  }

  const groupedByTerm = {};
  marks.forEach(mark => {
    const key = `${mark.academic_year || 'N/A'} - ${mark.term || 'N/A'}`;
    if (!groupedByTerm[key]) {
      groupedByTerm[key] = [];
    }
    groupedByTerm[key].push(mark);
  });

  const calculateTermStats = (termMarks) => {
    if (termMarks.length === 0) return { avg: 0, total: 0, passed: 0 };
    const total = termMarks.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
    const avg = (total / termMarks.length).toFixed(1);
    const passed = termMarks.filter(m => (parseFloat(m.score) || 0) >= 40).length;
    return { avg, total: termMarks.length, passed };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Reports</h1>
        <p style={styles.subtitle}>View your marks grouped by term, download comprehensive reports</p>
      </div>

      {/* Download Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          style={{ ...styles.downloadBtn, ...(downloading ? styles.downloadBtnDisabled : {}) }}
          onClick={() => downloadPdf('marks')}
          disabled={downloading}
        >
          📥 Download Marks Report
        </button>
        <button
          style={{ ...styles.downloadBtn, ...(downloading ? styles.downloadBtnDisabled : {}) }}
          onClick={() => downloadPdf('homework')}
          disabled={downloading}
        >
          📥 Download Homework Report
        </button>
        <button
          style={{ ...styles.downloadBtn, ...(downloading ? styles.downloadBtnDisabled : {}) }}
          onClick={() => downloadPdf('discipline')}
          disabled={downloading}
        >
          📥 Download Discipline Report
        </button>
      </div>

      {/* Marks by Term */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Marks by Term</h2>

        {loading && <SkeletonTable rows={6} columns={4} />}

        {!loading && Object.keys(groupedByTerm).length === 0 && (
          <EmptyState
            icon="📋"
            title="No marks yet"
            message="Your marks will appear here once your teachers have recorded them"
          />
        )}

        {!loading && Object.entries(groupedByTerm).map(([term, termMarks]) => {
          const stats = calculateTermStats(termMarks);
          return (
            <div key={term} style={styles.termContainer}>
              <div style={styles.termHeader}>
                <div style={styles.termName}>{term}</div>
                <div style={styles.termStats}>
                  <div style={styles.termStat}>
                    <div style={styles.statValue}>{stats.avg}%</div>
                    <div style={styles.statLabel}>Average</div>
                  </div>
                  <div style={styles.termStat}>
                    <div style={styles.statValue}>{stats.passed}</div>
                    <div style={styles.statLabel}>Passed ({stats.total})</div>
                  </div>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <div style={styles.courseRowHeader}>
                  <div>Course</div>
                  <div>Exam Type</div>
                  <div>Score</div>
                  <div>Status</div>
                </div>
                {termMarks.map(mark => {
                  const score = parseFloat(mark.score) || 0;
                  const passed = score >= 40;
                  return (
                    <div key={mark.id} style={styles.courseRow}>
                      <div style={styles.courseCell}>{mark.course_name || 'N/A'}</div>
                      <div style={styles.courseCell}>{mark.exam_type || 'Normal'}</div>
                      <div style={{ ...styles.courseCell, ...styles.scoreCell }}>{score}/{mark.max_score || 100}</div>
                      <div style={passed ? styles.passCell : styles.failCell}>
                        {passed ? '✓ Pass' : '✗ Fail'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

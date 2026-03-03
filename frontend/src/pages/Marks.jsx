import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const EXAM_TYPES = ['Continuous Assessment', 'Mid-term', 'End of Term', 'Final Exam', 'Quiz', 'Assignment'];
const CAN_ADD = ['teacher', 'patron', 'matron', 'dean', 'school_admin'];

const scoreBadge = (score, max) => {
  const pct = (score / max) * 100;
  return { padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600,
    background: pct >= 70 ? 'rgba(34,197,94,0.15)' : pct >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
    color: pct >= 70 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' };
};

const base = {
  input: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSec: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDanger: { padding: '0.4rem 0.75rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  field: { marginBottom: '1.1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.82rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' },
};

export default function Marks() {
  const { user } = useSelector(st => st.auth);
  const canAdd = CAN_ADD.includes(user?.role);
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ studentId: '', courseId: '', term: '', academicYear: String(new Date().getFullYear()) });
  const [mode, setMode] = useState('view');
  const [showAdd, setShowAdd] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeReason, setRemoveReason] = useState('');
  const [form, setForm] = useState({ studentId: '', courseId: '', term: 'Term 1', academicYear: String(new Date().getFullYear()), examType: 'Continuous Assessment', score: '', maxScore: '100', remarks: '' });
  const [bulkRows, setBulkRows] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const p = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api.get('/marks?' + p).then(r => setMarks(Array.isArray(r.data) ? r.data : [])).catch(() => setMarks([]));
  };
  useEffect(load, [filters]);
  useEffect(() => {
    api.get('/students').then(r => { const d = r.data; setStudents(Array.isArray(d) ? d : d?.students || []); }).catch(() => {});
    api.get('/courses').then(r => { const d = r.data; setCourses(Array.isArray(d) ? d : d?.courses || []); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === 'bulk' && form.courseId && students.length)
      setBulkRows(students.map(st => ({ studentId: st.id, name: st.first_name + ' ' + st.last_name, no: st.student_id, score: '', remarks: '' })));
  }, [mode, form.courseId, students]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addMark = async () => {
    if (!form.studentId || !form.courseId || form.score === '') { setError('Student, course and score required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/marks', { studentId: form.studentId, courseId: form.courseId, term: form.term, academicYear: form.academicYear, examType: form.examType, score: parseFloat(form.score), maxScore: parseFloat(form.maxScore) || 100, remarks: form.remarks || null });
      setShowAdd(false); load();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const submitBulk = async () => {
    const valid = bulkRows.filter(r => r.score !== '');
    if (!valid.length || !form.courseId) { setError('Select a course and enter at least one score.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/marks/bulk', { marks: valid.map(r => ({ studentId: r.studentId, courseId: form.courseId, term: form.term, academicYear: form.academicYear, examType: form.examType, score: parseFloat(r.score), maxScore: parseFloat(form.maxScore) || 100, remarks: r.remarks || null })) });
      setMode('view'); load();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const doRemove = async () => {
    if (!removeReason.trim()) { setError('Reason is required.'); return; }
    setSaving(true); setError('');
    try {
      await api.delete('/marks/' + removeTarget.id, { data: { reason: removeReason } });
      setRemoveTarget(null); load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to remove'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Marks</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{marks.filter(m => !m.removed).length} active marks</p>
        </div>
        {canAdd && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={base.btnSec} onClick={() => setMode(mode === 'bulk' ? 'view' : 'bulk')}>
              {mode === 'bulk' ? '← Back to List' : '📋 Bulk Entry'}
            </button>
            <button style={base.btn} onClick={() => { setError(''); setShowAdd(true); }}>+ Add Mark</button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {user?.role !== 'student' && (
          <select style={{ ...base.select, width: 'auto' }} value={filters.studentId} onChange={e => setFilters({ ...filters, studentId: e.target.value })}>
            <option value="">All Students</option>
            {students.map(st => <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.student_id})</option>)}
          </select>
        )}
        <select style={{ ...base.select, width: 'auto' }} value={filters.courseId} onChange={e => setFilters({ ...filters, courseId: e.target.value })}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={{ ...base.select, width: 'auto' }} value={filters.term} onChange={e => setFilters({ ...filters, term: e.target.value })}>
          <option value="">All Terms</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={{ ...base.select, width: 'auto' }} value={filters.academicYear} onChange={e => setFilters({ ...filters, academicYear: e.target.value })}>
          {['2024','2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Bulk Entry Panel */}
      {mode === 'bulk' && canAdd && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Bulk Mark Entry</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[['Course *', <select key="c" style={base.select} value={form.courseId} onChange={e => f('courseId', e.target.value)}><option value="">Select...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>],
              ['Term', <select key="t" style={base.select} value={form.term} onChange={e => f('term', e.target.value)}>{TERMS.map(t => <option key={t} value={t}>{t}</option>)}</select>],
              ['Exam Type', <select key="e" style={base.select} value={form.examType} onChange={e => f('examType', e.target.value)}>{EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>],
              ['Out of', <input key="m" style={base.input} type="number" value={form.maxScore} onChange={e => f('maxScore', e.target.value)} />],
            ].map(([label, el]) => (
              <div key={label}><label style={base.label}>{label}</label>{el}</div>
            ))}
          </div>
          {form.courseId && bulkRows.length > 0 && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead><tr>
                  <th style={base.th}>Student</th><th style={base.th}>ID</th>
                  <th style={base.th}>Score (/{form.maxScore})</th><th style={base.th}>Remarks</th>
                </tr></thead>
                <tbody>
                  {bulkRows.map((row, i) => (
                    <tr key={row.studentId}>
                      <td style={base.td}>{row.name}</td>
                      <td style={base.td}>{row.no}</td>
                      <td style={base.td}><input type="number" min="0" max={form.maxScore} style={{ ...base.input, width: '80px' }} value={row.score} onChange={e => { const r = [...bulkRows]; r[i].score = e.target.value; setBulkRows(r); }} placeholder="—" /></td>
                      <td style={base.td}><input style={base.input} value={row.remarks} onChange={e => { const r = [...bulkRows]; r[i].remarks = e.target.value; setBulkRows(r); }} placeholder="Optional" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {error && <div style={base.error}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button style={base.btnSec} onClick={() => setMode('view')}>Cancel</button>
                <button style={base.btn} onClick={submitBulk} disabled={saving}>{saving ? 'Saving...' : 'Save ' + bulkRows.filter(r => r.score !== '').length + ' Marks'}</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Marks Table */}
      {mode === 'view' && (marks.length === 0
        ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}><p style={{ fontSize: '3rem', margin: 0 }}>📊</p><p>No marks found.</p></div>
        : <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <thead><tr>
              {user?.role !== 'student' && <th style={base.th}>Student</th>}
              <th style={base.th}>Course</th><th style={base.th}>Term</th>
              <th style={base.th}>Type</th><th style={base.th}>Score</th>
              <th style={base.th}>%</th><th style={base.th}>By</th>
              <th style={base.th}>Remarks</th>
              {canAdd && <th style={base.th}>Action</th>}
            </tr></thead>
            <tbody>
              {marks.map(m => {
                const removed = m.removed || m.is_removed;
                const pct = Math.round((m.score / m.max_score) * 100);
                return (
                  <tr key={m.id} style={{ opacity: removed ? 0.5 : 1 }}>
                    {user?.role !== 'student' && <td style={base.td}><strong>{m.student_first_name} {m.student_last_name}</strong><br/><span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{m.student_no}</span></td>}
                    <td style={base.td}>{m.course_name}</td>
                    <td style={base.td}>{m.term}</td>
                    <td style={base.td}>{m.exam_type || '-'}</td>
                    <td style={base.td}>
                      {removed
                        ? <span style={{ textDecoration: 'line-through', color: 'var(--color-danger)' }}>{m.score}/{m.max_score}</span>
                        : <span style={scoreBadge(m.score, m.max_score)}>{m.score}/{m.max_score}</span>}
                    </td>
                    <td style={base.td}>{removed ? <span style={{ color: 'var(--color-danger)' }}>Removed</span> : pct + '%'}</td>
                    <td style={base.td}>{m.teacher_first_name} {m.teacher_last_name}</td>
                    <td style={{ ...base.td, maxWidth: '200px', fontSize: '0.82rem' }}>
                      {removed ? <span style={{ color: 'var(--color-danger)' }}>⚠ {m.removal_reason}</span> : (m.remarks || '—')}
                    </td>
                    {canAdd && <td style={base.td}>{!removed && <button style={base.btnDanger} onClick={() => { setRemoveReason(''); setError(''); setRemoveTarget(m); }}>Remove</button>}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
      )}

      {/* Add Mark Modal */}
      {showAdd && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' }}>Add Mark</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={base.field}><label style={base.label}>Student *</label><select style={base.select} value={form.studentId} onChange={e => f('studentId', e.target.value)}><option value="">Select...</option>{students.map(st => <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.student_id})</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Course *</label><select style={base.select} value={form.courseId} onChange={e => f('courseId', e.target.value)}><option value="">Select...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Term</label><select style={base.select} value={form.term} onChange={e => f('term', e.target.value)}>{TERMS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Exam Type</label><select style={base.select} value={form.examType} onChange={e => f('examType', e.target.value)}>{EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Score *</label><input style={base.input} type="number" min="0" value={form.score} onChange={e => f('score', e.target.value)} placeholder="e.g. 78" /></div>
              <div style={base.field}><label style={base.label}>Out of</label><input style={base.input} type="number" value={form.maxScore} onChange={e => f('maxScore', e.target.value)} /></div>
            </div>
            <div style={base.field}><label style={base.label}>Remarks</label><input style={base.input} value={form.remarks} onChange={e => f('remarks', e.target.value)} placeholder="Optional..." /></div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={base.btn} onClick={addMark} disabled={saving}>{saving ? 'Saving...' : 'Add Mark'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Mark Modal */}
      {removeTarget && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1rem 0' }}>Remove Mark</h2>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.4rem 0', fontWeight: 600 }}>{removeTarget.student_first_name} {removeTarget.student_last_name}</p>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{removeTarget.course_name} · {removeTarget.term} · {removeTarget.exam_type}</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{removeTarget.score}/{removeTarget.max_score}</p>
            </div>
            <div style={base.field}>
              <label style={base.label}>Reason for Removal *</label>
              <textarea style={{ ...base.input, minHeight: '100px', resize: 'vertical' }} value={removeReason} onChange={e => setRemoveReason(e.target.value)} placeholder="Explain why this mark is being removed (e.g. data entry error, exam irregularity, cheating)..." />
            </div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setRemoveTarget(null)}>Cancel</button>
              <button style={{ ...base.btn, background: 'var(--color-danger)' }} onClick={doRemove} disabled={saving}>{saving ? 'Removing...' : 'Remove Mark'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

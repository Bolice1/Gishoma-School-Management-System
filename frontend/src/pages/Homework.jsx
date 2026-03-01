import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSuccess: { padding: '0.5rem 1rem', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnWarning: { padding: '0.5rem 1rem', background: 'var(--color-warning)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' },
  badge: (color) => ({ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', background: color === 'green' ? 'rgba(34,197,94,0.15)' : color === 'yellow' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: color === 'green' ? 'var(--color-success)' : color === 'yellow' ? 'var(--color-warning)' : 'var(--color-accent)' }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.5rem' },
  subList: { marginTop: '1rem' },
  subItem: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};

export default function Homework() {
  const { user } = useSelector((st) => st.auth);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const [homeworks, setHomeworks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(null);
  const [showGrade, setShowGrade] = useState(null);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxScore: '100' });
  const [submitForm, setSubmitForm] = useState({ content: '' });
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '', status: 'graded' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/homework').then(r => setHomeworks(r.data || [])).catch(() => setHomeworks([]));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data || [])).catch(() => setCourses([]));
  }, []);

  const loadDetail = (hw) => {
    api.get(`/homework/${hw.id}`).then(r => setSelected(r.data)).catch(() => setSelected(hw));
  };

  const createHomework = async () => {
    if (!form.courseId || !form.title || !form.dueDate) { setError('Course, title and due date are required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/homework', { courseId: form.courseId, title: form.title, description: form.description, dueDate: form.dueDate, maxScore: parseInt(form.maxScore) || 100 });
      setShowCreate(false);
      load();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const submitHomework = async () => {
    if (!submitForm.content) { setError('Answer content is required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post(`/homework/${showSubmit.id}/submit/${user.studentId}`, { content: submitForm.content });
      setShowSubmit(null);
      load();
    } catch (e) { setError(e.response?.data?.error || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  const gradeSubmission = async () => {
    setSaving(true); setError('');
    try {
      await api.put(`/homework/submissions/${showGrade.id}`, { score: parseFloat(gradeForm.score), feedback: gradeForm.feedback, status: gradeForm.status });
      setShowGrade(null);
      if (selected) loadDetail(selected);
    } catch (e) { setError(e.response?.data?.error || 'Failed to grade'); }
    finally { setSaving(false); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Homework</h1>
        {isTeacher && <button style={s.btn} onClick={() => { setForm({ courseId: '', title: '', description: '', dueDate: '', maxScore: '100' }); setError(''); setShowCreate(true); }}>+ Assign Homework</button>}
      </div>

      {selected ? (
        <div>
          <button style={s.btnSecondary} onClick={() => setSelected(null)}>← Back to list</button>
          <div style={{ ...s.table, marginTop: '1.5rem', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{selected.title}</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1rem 0' }}>{selected.course_name} · Due: {new Date(selected.due_date).toLocaleDateString()} · Max Score: {selected.max_score}</p>
            {selected.description && <p style={{ marginBottom: '1.5rem' }}>{selected.description}</p>}

            {isStudent && (
              <button style={s.btn} onClick={() => { setSubmitForm({ content: '' }); setError(''); setShowSubmit(selected); }}>Submit Answer</button>
            )}

            <h3 style={{ marginTop: '1.5rem' }}>Submissions ({(selected.submissions || []).length})</h3>
            {(selected.submissions || []).length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No submissions yet.</p>
            ) : (
              <div style={s.subList}>
                {(selected.submissions || []).map(sub => (
                  <div key={sub.id} style={s.subItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong>{sub.first_name} {sub.last_name}</strong>
                      <span style={s.badge(sub.status === 'graded' ? 'green' : 'yellow')}>{sub.status}</span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{sub.content}</p>
                    {sub.score !== null && <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-success)' }}>Score: {sub.score}/{selected.max_score}</p>}
                    {sub.feedback && <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Feedback: {sub.feedback}</p>}
                    {isTeacher && sub.status !== 'graded' && (
                      <button style={{ ...s.btnSuccess, marginTop: '0.75rem' }} onClick={() => { setGradeForm({ score: '', feedback: '', status: 'graded' }); setError(''); setShowGrade(sub); }}>Grade</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {homeworks.length === 0 ? (
            <div style={s.empty}><p style={{ fontSize: '3rem', margin: 0 }}>📚</p><p>No homework assigned yet.</p></div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Due Date</th>
                  <th style={s.th}>Max Score</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {homeworks.map(hw => (
                  <tr key={hw.id}>
                    <td style={s.td}><strong>{hw.title}</strong></td>
                    <td style={s.td}>{hw.course_name}</td>
                    <td style={s.td} style={{ ...s.td, color: isOverdue(hw.due_date) ? 'var(--color-danger)' : 'inherit' }}>{new Date(hw.due_date).toLocaleDateString()}</td>
                    <td style={s.td}>{hw.max_score}</td>
                    <td style={s.td}><span style={s.badge(hw.status === 'published' ? 'blue' : 'green')}>{hw.status}</span></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={s.btnSecondary} onClick={() => loadDetail(hw)}>View</button>
                        {isStudent && <button style={s.btn} onClick={() => { setSubmitForm({ content: '' }); setError(''); setShowSubmit(hw); }}>Submit</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Assign Homework</h2>
            <div style={s.field}>
              <label style={s.label}>Course *</label>
              <select style={s.select} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Homework title" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Instructions for students..." />
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Due Date *</label>
                <input style={s.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Max Score</label>
                <input style={s.input} type="number" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} />
              </div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowCreate(false)}>Cancel</button>
              <button style={s.btn} onClick={createHomework} disabled={saving}>{saving ? 'Saving...' : 'Assign'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Submit: {showSubmit.title}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Due: {new Date(showSubmit.due_date).toLocaleDateString()} · Max Score: {showSubmit.max_score}</p>
            {showSubmit.description && <p style={{ marginBottom: '1.5rem' }}>{showSubmit.description}</p>}
            <div style={s.field}>
              <label style={s.label}>Your Answer *</label>
              <textarea style={{ ...s.textarea, minHeight: '200px' }} value={submitForm.content} onChange={e => setSubmitForm({ content: e.target.value })} placeholder="Write your answer here..." />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowSubmit(null)}>Cancel</button>
              <button style={s.btn} onClick={submitHomework} disabled={saving}>{saving ? 'Submitting...' : 'Submit Answer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGrade && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Grade Submission</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Student: {showGrade.first_name} {showGrade.last_name}</p>
            <div style={{ ...s.subItem, marginBottom: '1.5rem' }}><p style={{ margin: 0 }}>{showGrade.content}</p></div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Score</label>
                <input style={s.input} type="number" value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} placeholder="e.g. 85" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Status</label>
                <select style={s.select} value={gradeForm.status} onChange={e => setGradeForm({ ...gradeForm, status: e.target.value })}>
                  <option value="graded">Graded</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Feedback</label>
              <textarea style={s.textarea} value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Optional feedback for student..." />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowGrade(null)}>Cancel</button>
              <button style={s.btn} onClick={gradeSubmission} disabled={saving}>{saving ? 'Saving...' : 'Save Grade'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDanger: { padding: '0.4rem 0.75rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' },
  card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1 },
  badge: (color) => ({ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', flexShrink: 0, background: color === 'green' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', color: color === 'green' ? 'var(--color-success)' : 'var(--color-accent)' }),
  meta: { fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.5rem' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  qBox: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  qNum: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-accent)' },
  answerBox: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' },
};

export default function Exercises() {
  const { user } = useSelector((st) => st.auth);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const [exercises, setExercises] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDo, setShowDo] = useState(null);
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({ courseId: '', title: '', dueDate: '', maxScore: '100', timeLimitMinutes: '' });
  const [questions, setQuestions] = useState([{ question: '', type: 'text' }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = () => api.get('/exercises').then(r => setExercises(r.data || [])).catch(() => setExercises([]));

  useEffect(() => { load(); }, []);
  useEffect(() => { api.get('/courses').then(r => setCourses(r.data || [])).catch(() => setCourses([])); }, []);

  const addQuestion = () => setQuestions([...questions, { question: '', type: 'text' }]);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const createExercise = async () => {
    if (!form.courseId || !form.title) { setError('Course and title are required.'); return; }
    if (questions.some(q => !q.question.trim())) { setError('All questions must have text.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/exercises', {
        courseId: form.courseId,
        title: form.title,
        dueDate: form.dueDate || null,
        maxScore: parseInt(form.maxScore) || 100,
        timeLimitMinutes: form.timeLimitMinutes ? parseInt(form.timeLimitMinutes) : null,
        questions,
      });
      setShowCreate(false);
      load();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const openExercise = async (ex) => {
    const r = await api.get(`/exercises/${ex.id}`).catch(() => ({ data: ex }));
    const data = r.data;
    let qs = data.questions;
    if (typeof qs === 'string') { try { qs = JSON.parse(qs); } catch { qs = []; } }
    setShowDo({ ...data, questions: qs || [] });
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  const submitExercise = async () => {
    setSaving(true); setError('');
    try {
      await api.post(`/exercises/${showDo.id}/submit/${user.studentId}`, { answers });
      setSubmitted(true);
    } catch (e) { setError(e.response?.data?.error || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Exercises</h1>
        {isTeacher && <button style={s.btn} onClick={() => { setForm({ courseId: '', title: '', dueDate: '', maxScore: '100', timeLimitMinutes: '' }); setQuestions([{ question: '', type: 'text' }]); setError(''); setShowCreate(true); }}>+ Create Exercise</button>}
      </div>

      {exercises.length === 0 ? (
        <div style={s.empty}><p style={{ fontSize: '3rem', margin: 0 }}>✏️</p><p>No exercises yet.</p></div>
      ) : (
        <div style={s.grid}>
          {exercises.map(ex => {
            let qs = ex.questions;
            if (typeof qs === 'string') { try { qs = JSON.parse(qs); } catch { qs = []; } }
            return (
              <div key={ex.id} style={s.card}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>{ex.title}</h3>
                  <span style={s.badge(ex.status === 'active' ? 'green' : 'blue')}>{ex.status}</span>
                </div>
                <div style={s.meta}>{ex.course_name}</div>
                <div style={s.meta}>{(qs || []).length} question(s) · Max: {ex.max_score} pts{ex.time_limit_minutes ? ` · ${ex.time_limit_minutes} min` : ''}</div>
                {ex.due_date && <div style={s.meta}>Due: {new Date(ex.due_date).toLocaleDateString()}</div>}
                {(isStudent || isTeacher) && (
                  <button style={{ ...s.btnSecondary, marginTop: '0.5rem' }} onClick={() => openExercise(ex)}>
                    {isStudent ? 'Do Exercise' : 'View'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Create Exercise</h2>
            <div style={s.field}>
              <label style={s.label}>Course *</label>
              <select style={s.select} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Exercise title" />
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Due Date</label>
                <input style={s.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Time Limit (minutes)</label>
                <input style={s.input} type="number" value={form.timeLimitMinutes} onChange={e => setForm({ ...form, timeLimitMinutes: e.target.value })} placeholder="Optional" />
              </div>
            </div>

            <div style={{ ...s.field, marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...s.label, margin: 0 }}>Questions *</label>
                <button style={s.btn} onClick={addQuestion}>+ Add Question</button>
              </div>
              {questions.map((q, i) => (
                <div key={i} style={s.qBox}>
                  <div style={s.qHeader}>
                    <span style={s.qNum}>Q{i + 1}</span>
                    {questions.length > 1 && <button style={s.btnDanger} onClick={() => removeQuestion(i)}>Remove</button>}
                  </div>
                  <textarea style={s.textarea} value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} placeholder={`Question ${i + 1}...`} />
                </div>
              ))}
            </div>

            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowCreate(false)}>Cancel</button>
              <button style={s.btn} onClick={createExercise} disabled={saving}>{saving ? 'Creating...' : 'Create Exercise'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Do Exercise Modal */}
      {showDo && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{showDo.title}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{showDo.course_name} · {showDo.questions.length} question(s) · Max: {showDo.max_score} pts</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: '3rem', margin: 0 }}>✅</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Submitted successfully!</p>
                <button style={s.btn} onClick={() => setShowDo(null)}>Close</button>
              </div>
            ) : (
              <>
                {showDo.questions.map((q, i) => (
                  <div key={i} style={s.answerBox}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.75rem 0' }}>Q{i + 1}: {q.question}</p>
                    <textarea
                      style={s.textarea}
                      value={answers[i] || ''}
                      onChange={e => setAnswers({ ...answers, [i]: e.target.value })}
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
                {error && <div style={s.error}>{error}</div>}
                <div style={s.actions}>
                  <button style={s.btnSecondary} onClick={() => setShowDo(null)}>Cancel</button>
                  {isStudent && <button style={s.btn} onClick={submitExercise} disabled={saving}>{saving ? 'Submitting...' : 'Submit Exercise'}</button>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

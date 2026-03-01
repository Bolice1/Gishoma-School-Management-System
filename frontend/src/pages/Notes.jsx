import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnDanger: { padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' },
  card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, margin: 0 },
  badge: { padding: '0.25rem 0.6rem', background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent)', borderRadius: '20px', fontSize: '0.8rem' },
  meta: { fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' },
  content: { fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', minHeight: '160px', resize: 'vertical', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.5rem' },
  expandedContent: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' },
};

export default function Notes() {
  const { user } = useSelector((st) => st.auth);
  const isTeacher = user?.role === 'teacher';
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [form, setForm] = useState({ courseId: '', title: '', topic: '', content: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');

  const load = () => {
    const params = filterCourse ? `?courseId=${filterCourse}` : '';
    api.get(`/notes${params}`).then(r => setNotes(r.data || [])).catch(() => setNotes([]));
  };

  useEffect(() => { load(); }, [filterCourse]);
  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data || [])).catch(() => setCourses([]));
  }, []);

  const openCreate = () => {
    setEditNote(null);
    setForm({ courseId: '', title: '', topic: '', content: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditNote(note);
    setForm({ courseId: note.course_id, title: note.title, topic: note.topic || '', content: note.content || '' });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.courseId || !form.title || !form.content) { setError('Course, title and content are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editNote) {
        await api.put(`/notes/${editNote.id}`, { title: form.title, topic: form.topic, content: form.content });
      } else {
        await api.post('/notes', { courseId: form.courseId, title: form.title, topic: form.topic, content: form.content });
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save note');
    } finally { setSaving(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Notes</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select style={{ ...s.input, width: 'auto' }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isTeacher && <button style={s.btn} onClick={openCreate}>+ Add Note</button>}
        </div>
      </div>

      {notes.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: '3rem', margin: 0 }}>📝</p>
          <p>No notes yet{isTeacher ? ' — create one!' : '.'}</p>
        </div>
      ) : (
        <div style={s.grid}>
          {notes.map(note => (
            <div key={note.id} style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>{note.title}</h3>
                <span style={s.badge}>{note.course_name}</span>
              </div>
              {note.topic && <div style={s.meta}>Topic: {note.topic}</div>}
              <div style={s.meta}>By {note.teacher_first_name} {note.teacher_last_name} · {new Date(note.created_at).toLocaleDateString()}</div>
              {expanded === note.id ? (
                <div style={s.expandedContent}>
                  <div style={s.content}>{note.content}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button style={s.btnSecondary} onClick={() => setExpanded(null)}>Collapse</button>
                    {isTeacher && <button style={s.btnSecondary} onClick={() => openEdit(note)}>Edit</button>}
                  </div>
                </div>
              ) : (
                <button style={s.btnSecondary} onClick={() => setExpanded(note.id)}>Read Note</button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editNote ? 'Edit Note' : 'Create Note'}</h2>
            {!editNote && (
              <div style={s.field}>
                <label style={s.label}>Course *</label>
                <select style={s.select} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Topic</label>
              <input style={s.input} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Chapter 3 - Photosynthesis" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Content *</label>
              <textarea style={s.textarea} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your note content here..." />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.btn} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

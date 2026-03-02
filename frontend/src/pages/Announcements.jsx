import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const PRIORITY_COLORS = {
  high: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger)', border: 'rgba(239,68,68,0.3)', icon: '🔴' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning)', border: 'rgba(245,158,11,0.3)', icon: '🟡' },
  low: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-accent)', border: 'rgba(59,130,246,0.3)', icon: '🔵' },
};

const TARGET_LABELS = {
  all: 'Everyone',
  teacher: 'Teachers',
  student: 'Students',
  bursar: 'Bursars',
  dean: 'Dean',
};

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  subtitle: { color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: (active) => ({ padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: active ? 'var(--color-accent)' : 'transparent', color: active ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }),
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: (priority) => ({
    background: 'var(--color-surface)',
    border: `1px solid ${PRIORITY_COLORS[priority]?.border || 'var(--color-border)'}`,
    borderLeft: `4px solid ${PRIORITY_COLORS[priority]?.color || 'var(--color-border)'}`,
    borderRadius: '12px',
    padding: '1.5rem',
  }),
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1 },
  badges: { display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' },
  badge: (priority) => ({ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', background: PRIORITY_COLORS[priority]?.bg || 'var(--color-bg)', color: PRIORITY_COLORS[priority]?.color || 'var(--color-text-muted)', border: `1px solid ${PRIORITY_COLORS[priority]?.border || 'var(--color-border)'}` }),
  targetBadge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', background: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)' },
  content: { fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--color-text)', margin: '0 0 1rem 0', whiteSpace: 'pre-wrap' },
  meta: { fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', minHeight: '160px', resize: 'vertical', boxSizing: 'border-box' },
  selectFull: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  prioritySelect: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  priorityBtn: (selected, priority) => ({
    padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: selected ? 600 : 400,
    border: `1px solid ${selected ? PRIORITY_COLORS[priority]?.color : 'var(--color-border)'}`,
    background: selected ? PRIORITY_COLORS[priority]?.bg : 'transparent',
    color: selected ? PRIORITY_COLORS[priority]?.color : 'var(--color-text-muted)',
  }),
};

export default function Announcements() {
  const { user } = useSelector((st) => st.auth);
  const canCreate = ['super_admin', 'school_admin', 'teacher', 'dean', 'bursar'].includes(user?.role);

  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium', targetRole: 'all' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    api.get('/announcements')
      .then(r => setAnnouncements(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAnnouncements([]));
  };

  useEffect(() => { load(); }, []);

  const filtered = announcements.filter(a => {
    if (filter === 'all') return true;
    return a.priority === filter;
  });

  const counts = {
    all: announcements.length,
    high: announcements.filter(a => a.priority === 'high').length,
    medium: announcements.filter(a => a.priority === 'medium').length,
    low: announcements.filter(a => a.priority === 'low').length,
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const create = async () => {
    if (!form.title || !form.content) { setError('Title and content are required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/announcements', {
        title: form.title,
        content: form.content,
        priority: form.priority,
        targetRole: form.targetRole,
      });
      setShowModal(false);
      setForm({ title: '', content: '', priority: 'medium', targetRole: 'all' });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to post announcement');
    } finally { setSaving(false); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Announcements</h1>
          <p style={s.subtitle}>{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && (
          <button style={s.btn} onClick={() => { setForm({ title: '', content: '', priority: 'medium', targetRole: 'all' }); setError(''); setShowModal(true); }}>
            + Post Announcement
          </button>
        )}
      </div>

      {/* Priority Filters */}
      <div style={s.filters}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'high', label: `🔴 Urgent (${counts.high})` },
          { key: 'medium', label: `🟡 Medium (${counts.medium})` },
          { key: 'low', label: `🔵 Low (${counts.low})` },
        ].map(({ key, label }) => (
          <button key={key} style={s.filterBtn(filter === key)} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: '3rem', margin: 0 }}>📢</p>
          <p>No announcements yet{canCreate ? ' — post one!' : '.'}</p>
        </div>
      ) : (
        <div style={s.list}>
          {filtered.map(ann => {
            const isLong = (ann.content || '').length > 200;
            const isExpanded = expanded === ann.id;
            return (
              <div key={ann.id} style={s.card(ann.priority)}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>
                    {PRIORITY_COLORS[ann.priority]?.icon} {ann.title}
                  </h3>
                  <div style={s.badges}>
                    <span style={s.badge(ann.priority)}>{ann.priority} priority</span>
                    <span style={s.targetBadge}>→ {TARGET_LABELS[ann.target_role] || ann.target_role || 'Everyone'}</span>
                  </div>
                </div>

                <p style={s.content}>
                  {isLong && !isExpanded
                    ? (ann.content || '').slice(0, 200) + '...'
                    : ann.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={s.meta}>
                    <span>👤 {ann.author_first_name} {ann.author_last_name}</span>
                    <span>🕒 {formatDate(ann.created_at)}</span>
                  </div>
                  {isLong && (
                    <button style={s.btnSecondary} onClick={() => setExpanded(isExpanded ? null : ann.id)}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Post Announcement</h2>

            <div style={s.field}>
              <label style={s.label}>Title *</label>
              <input
                style={s.input}
                value={form.title}
                onChange={e => f('title', e.target.value)}
                placeholder="Announcement title..."
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Content *</label>
              <textarea
                style={s.textarea}
                value={form.content}
                onChange={e => f('content', e.target.value)}
                placeholder="Write your announcement here..."
              />
            </div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Priority</label>
                <div style={s.prioritySelect}>
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      style={s.priorityBtn(form.priority === p, p)}
                      onClick={() => f('priority', p)}
                    >
                      {PRIORITY_COLORS[p].icon} {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Target Audience</label>
                <select style={s.selectFull} value={form.targetRole} onChange={e => f('targetRole', e.target.value)}>
                  <option value="all">Everyone</option>
                  <option value="teacher">Teachers only</option>
                  <option value="student">Students only</option>
                  <option value="bursar">Bursars only</option>
                  <option value="dean">Dean only</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {form.title && (
              <div style={{ ...s.card(form.priority), marginBottom: '1rem' }}>
                <div style={s.cardHeader}>
                  <h3 style={{ ...s.cardTitle, fontSize: '1rem' }}>{PRIORITY_COLORS[form.priority]?.icon} {form.title}</h3>
                  <div style={s.badges}>
                    <span style={s.badge(form.priority)}>{form.priority}</span>
                    <span style={s.targetBadge}>→ {TARGET_LABELS[form.targetRole]}</span>
                  </div>
                </div>
                {form.content && <p style={{ ...s.content, fontSize: '0.88rem', margin: 0 }}>{form.content.slice(0, 120)}{form.content.length > 120 ? '...' : ''}</p>}
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.btn} onClick={create} disabled={saving}>{saving ? 'Posting...' : 'Post Announcement'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

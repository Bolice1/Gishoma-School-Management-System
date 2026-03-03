import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';
import { formatDate } from '../utils/format';

const TYPES = ['Misconduct', 'Absence', 'Violence', 'Theft', 'Cheating', 'Bullying', 'Vandalism', 'Insubordination', 'Other'];
const CAN_MANAGE = ['teacher', 'patron', 'matron', 'dean', 'school_admin'];

const statusBadge = (status) => ({
  padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem',
  background: status === 'open' ? 'rgba(239,68,68,0.15)' : status === 'resolved' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
  color: status === 'open' ? 'var(--color-danger)' : status === 'resolved' ? 'var(--color-success)' : 'var(--color-warning)',
});

const base = {
  input: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSec: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSuccess: { padding: '0.4rem 0.75rem', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  field: { marginBottom: '1.1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.82rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' },
};

export default function Discipline() {
  const { user } = useSelector(st => st.auth);
  const canManage = CAN_MANAGE.includes(user?.role);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [form, setForm] = useState({ studentId: '', type: 'Misconduct', description: '', date: new Date().toISOString().split('T')[0], resolution: '', status: 'open' });
  const [resolveForm, setResolveForm] = useState({ resolution: '', status: 'resolved' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const p = statusFilter ? '?status=' + statusFilter : '';
    api.get('/discipline' + p).then(r => setRecords(Array.isArray(r.data) ? r.data : [])).catch(() => setRecords([]));
  };
  useEffect(load, [statusFilter]);
  useEffect(() => { api.get('/students').then(r => { const d = r.data; setStudents(Array.isArray(d) ? d : d?.students || []); }).catch(() => {}); }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const create = async () => {
    if (!form.studentId || !form.description) { setError('Student and description required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/discipline', form);
      setShowAdd(false); load();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const resolve = async () => {
    setSaving(true); setError('');
    try {
      await api.put('/discipline/' + resolveTarget.id, resolveForm);
      setResolveTarget(null); load();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const counts = { all: records.length, open: records.filter(r => r.status === 'open').length, resolved: records.filter(r => r.status === 'resolved').length };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Discipline</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{counts.open} open case(s)</p>
        </div>
        {canManage && <button style={base.btn} onClick={() => { setError(''); setShowAdd(true); }}>+ Record Case</button>}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[['All Cases', counts.all, ''], ['Open', counts.open, 'var(--color-danger)'], ['Resolved', counts.resolved, 'var(--color-success)']].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || 'var(--color-text)' }}>{val}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {[['', 'All'], ['open', 'Open'], ['resolved', 'Resolved'], ['pending', 'Pending']].map(([val, label]) => (
          <button key={val} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: statusFilter === val ? 'var(--color-accent)' : 'transparent', color: statusFilter === val ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => setStatusFilter(val)}>{label}</button>
        ))}
      </div>

      {records.length === 0
        ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}><p style={{ fontSize: '3rem', margin: 0 }}>⚖️</p><p>No discipline records.</p></div>
        : <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <thead><tr>
              <th style={base.th}>Student</th><th style={base.th}>Type</th>
              <th style={base.th}>Description</th><th style={base.th}>Date</th>
              <th style={base.th}>Reported By</th><th style={base.th}>Status</th>
              <th style={base.th}>Resolution</th>
              {canManage && <th style={base.th}>Action</th>}
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={base.td}><strong>{r.student_first_name} {r.student_last_name}</strong><br/><span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{r.student_no}</span></td>
                  <td style={base.td}>{r.type}</td>
                  <td style={{ ...base.td, maxWidth: '200px', fontSize: '0.85rem' }}>{r.description}</td>
                  <td style={base.td}>{formatDate(r.date)}</td>
                  <td style={base.td}>{r.teacher_first_name} {r.teacher_last_name}</td>
                  <td style={base.td}><span style={statusBadge(r.status)}>{r.status}</span></td>
                  <td style={{ ...base.td, maxWidth: '180px', fontSize: '0.85rem' }}>{r.resolution || '—'}</td>
                  {canManage && <td style={base.td}>{r.status !== 'resolved' && <button style={base.btnSuccess} onClick={() => { setResolveForm({ resolution: '', status: 'resolved' }); setError(''); setResolveTarget(r); }}>Resolve</button>}</td>}
                </tr>
              ))}
            </tbody>
          </table>
      }

      {/* Add Modal */}
      {showAdd && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' }}>Record Discipline Case</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={base.field}><label style={base.label}>Student *</label><select style={base.select} value={form.studentId} onChange={e => f('studentId', e.target.value)}><option value="">Select...</option>{students.map(st => <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.student_id})</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Type *</label><select style={base.select} value={form.type} onChange={e => f('type', e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Date</label><input style={base.input} type="date" value={form.date} onChange={e => f('date', e.target.value)} /></div>
              <div style={base.field}><label style={base.label}>Status</label><select style={base.select} value={form.status} onChange={e => f('status', e.target.value)}><option value="open">Open</option><option value="pending">Pending</option><option value="resolved">Resolved</option></select></div>
            </div>
            <div style={base.field}><label style={base.label}>Description *</label><textarea style={base.textarea} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe the incident in detail..." /></div>
            <div style={base.field}><label style={base.label}>Resolution (if known)</label><textarea style={{ ...base.textarea, minHeight: '70px' }} value={form.resolution} onChange={e => f('resolution', e.target.value)} placeholder="Action taken..." /></div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={base.btn} onClick={create} disabled={saving}>{saving ? 'Saving...' : 'Record Case'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveTarget && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1rem 0' }}>Resolve Case</h2>
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: 600 }}>{resolveTarget.student_first_name} {resolveTarget.student_last_name}</p>
              <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>{resolveTarget.type} · {formatDate(resolveTarget.date)}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{resolveTarget.description}</p>
            </div>
            <div style={base.field}><label style={base.label}>Resolution *</label><textarea style={base.textarea} value={resolveForm.resolution} onChange={e => setResolveForm({ ...resolveForm, resolution: e.target.value })} placeholder="Describe the action taken to resolve this case..." /></div>
            <div style={base.field}><label style={base.label}>Final Status</label><select style={base.select} value={resolveForm.status} onChange={e => setResolveForm({ ...resolveForm, status: e.target.value })}><option value="resolved">Resolved</option><option value="pending">Pending</option></select></div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setResolveTarget(null)}>Cancel</button>
              <button style={{ ...base.btn, background: 'var(--color-success)' }} onClick={resolve} disabled={saving}>{saving ? 'Saving...' : 'Mark Resolved'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

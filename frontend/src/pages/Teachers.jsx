import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  subtitle: { color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDanger: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  stats: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.5rem', minWidth: '130px' },
  statNum: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' },
  statLabel: { fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  searchInput: { padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', width: '260px' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.9rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', background: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  actions: { display: 'flex', gap: '0.5rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' },
  section: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.5rem 0 0.75rem 0' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  selectFull: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  confirmBox: { background: 'var(--color-bg)', border: '1px solid var(--color-danger)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' },
};

const SPECIALIZATIONS = ['Mathematics', 'English', 'French', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Arts', 'Music', 'Economics', 'Other'];

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  employeeId: '', specialization: '', gender: '',
  dateOfBirth: '', hireDate: '', address: '',
};

export default function Teachers() {
  const { user } = useSelector((st) => st.auth);
  const canManage = ['super_admin', 'school_admin'].includes(user?.role);

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/teachers')
      .then(r => {
        const d = r.data;
        setTeachers(Array.isArray(d) ? d : d?.teachers || []);
      })
      .catch(() => setTeachers([]));
  };

  useEffect(() => { load(); }, []);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const openCreate = () => {
    setEditTeacher(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTeacher(t);
    setForm({
      firstName: t.first_name || '', lastName: t.last_name || '',
      email: t.email || '', password: '',
      employeeId: t.employee_id || '', specialization: t.specialization || '',
      gender: t.gender || '',
      dateOfBirth: t.date_of_birth ? t.date_of_birth.split('T')[0] : '',
      hireDate: t.hire_date ? t.hire_date.split('T')[0] : '',
      address: t.address || '',
    });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!editTeacher && (!form.firstName || !form.lastName || !form.email)) {
      setError('First name, last name and email are required.'); return;
    }
    setSaving(true); setError('');
    try {
      if (editTeacher) {
        await api.put(`/teachers/${editTeacher.id}`, {
          employee_id: form.employeeId || undefined,
          specialization: form.specialization || null,
          gender: form.gender || null,
          date_of_birth: form.dateOfBirth || null,
          hire_date: form.hireDate || null,
          address: form.address || null,
        });
      } else {
        await api.post('/teachers', {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password || 'password123',
          employeeId: form.employeeId || undefined,
          specialization: form.specialization || null,
          gender: form.gender || null,
          dateOfBirth: form.dateOfBirth || null,
          hireDate: form.hireDate || null,
          address: form.address || null,
        });
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save teacher');
    } finally { setSaving(false); }
  };

  const filtered = teachers.filter(t =>
    !search || `${t.first_name} ${t.last_name} ${t.email} ${t.employee_id} ${t.specialization}`.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (t) => `${t.first_name?.[0] || ''}${t.last_name?.[0] || ''}`.toUpperCase();

  // Stats
  const specializationCounts = teachers.reduce((acc, t) => {
    if (t.specialization) acc[t.specialization] = (acc[t.specialization] || 0) + 1;
    return acc;
  }, {});
  const topSpec = Object.entries(specializationCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Teachers</h1>
          <p style={s.subtitle}>{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} on staff</p>
        </div>
        {canManage && <button style={s.btn} onClick={openCreate}>+ Register Teacher</button>}
      </div>

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.statCard}>
          <div style={s.statNum}>{teachers.length}</div>
          <div style={s.statLabel}>Total Teachers</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{teachers.filter(t => t.gender === 'male').length}</div>
          <div style={s.statLabel}>Male</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{teachers.filter(t => t.gender === 'female').length}</div>
          <div style={s.statLabel}>Female</div>
        </div>
        {topSpec.map(([spec, count]) => (
          <div key={spec} style={s.statCard}>
            <div style={s.statNum}>{count}</div>
            <div style={s.statLabel}>{spec}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <input
          style={s.searchInput}
          placeholder="Search by name, email, ID or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: '3rem', margin: 0 }}>👨‍🏫</p>
          <p>No teachers found.</p>
          {canManage && <button style={s.btn} onClick={openCreate}>Register First Teacher</button>}
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Teacher</th>
              <th style={s.th}>Employee ID</th>
              <th style={s.th}>Specialization</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Gender</th>
              <th style={s.th}>Hired</th>
              {canManage && <th style={s.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={s.td}>
                  <div style={s.nameCell}>
                    <div style={s.avatar}>{initials(t)}</div>
                    <div style={{ fontWeight: 500 }}>{t.first_name} {t.last_name}</div>
                  </div>
                </td>
                <td style={s.td}><span style={s.badge}>{t.employee_id}</span></td>
                <td style={s.td}>{t.specialization || '-'}</td>
                <td style={s.td}>{t.email}</td>
                <td style={s.td}>{t.gender || '-'}</td>
                <td style={s.td}>{t.hire_date ? new Date(t.hire_date).toLocaleDateString() : '-'}</td>
                {canManage && (
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={s.btnSecondary} onClick={() => setViewTeacher(t)}>View</button>
                      <button style={s.btnSecondary} onClick={() => openEdit(t)}>Edit</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editTeacher ? 'Edit Teacher' : 'Register New Teacher'}</h2>

            {!editTeacher && (
              <>
                <p style={s.section}>Account Details</p>
                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>First Name *</label>
                    <input style={s.input} value={form.firstName} onChange={e => f('firstName', e.target.value)} placeholder="First name" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Last Name *</label>
                    <input style={s.input} value={form.lastName} onChange={e => f('lastName', e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Email *</label>
                    <input style={s.input} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="teacher@school.edu" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Password</label>
                    <input style={s.input} type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Default: password123" />
                  </div>
                </div>
              </>
            )}

            <p style={s.section}>Professional Info</p>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Employee ID</label>
                <input style={s.input} value={form.employeeId} onChange={e => f('employeeId', e.target.value)} placeholder="e.g. T001" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Specialization</label>
                <select style={s.selectFull} value={form.specialization} onChange={e => f('specialization', e.target.value)}>
                  <option value="">Select subject...</option>
                  {SPECIALIZATIONS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                </select>
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Hire Date</label>
              <input style={s.input} type="date" value={form.hireDate} onChange={e => f('hireDate', e.target.value)} />
            </div>

            <p style={s.section}>Personal Info</p>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Gender</label>
                <select style={s.selectFull} value={form.gender} onChange={e => f('gender', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Date of Birth</label>
                <input style={s.input} type="date" value={form.dateOfBirth} onChange={e => f('dateOfBirth', e.target.value)} />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Address</label>
              <input style={s.input} value={form.address} onChange={e => f('address', e.target.value)} placeholder="Home address" />
            </div>

            {error && <div style={s.error}>{error}</div>}
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.btn} onClick={save} disabled={saving}>
                {saving ? 'Saving...' : editTeacher ? 'Save Changes' : 'Register Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTeacher && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ ...s.avatar, width: '56px', height: '56px', fontSize: '1.2rem' }}>{initials(viewTeacher)}</div>
              <div>
                <h2 style={{ margin: 0 }}>{viewTeacher.first_name} {viewTeacher.last_name}</h2>
                <span style={s.badge}>{viewTeacher.employee_id}</span>
              </div>
            </div>
            {[
              ['Email', viewTeacher.email],
              ['Specialization', viewTeacher.specialization || '-'],
              ['Gender', viewTeacher.gender || '-'],
              ['Date of Birth', viewTeacher.date_of_birth ? new Date(viewTeacher.date_of_birth).toLocaleDateString() : '-'],
              ['Hire Date', viewTeacher.hire_date ? new Date(viewTeacher.hire_date).toLocaleDateString() : '-'],
              ['Address', viewTeacher.address || '-'],
            ].map(([label, value]) => (
              <div key={label} style={s.detailRow}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}
            <div style={s.modalActions}>
              {canManage && <button style={s.btnSecondary} onClick={() => { setViewTeacher(null); openEdit(viewTeacher); }}>Edit</button>}
              <button style={s.btn} onClick={() => setViewTeacher(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

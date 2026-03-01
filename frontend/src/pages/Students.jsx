import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDanger: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  searchInput: { padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', width: '240px' },
  select: { padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.9rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent)' },
  actions: { display: 'flex', gap: '0.5rem' },
  pagination: { display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' },
  pageBtn: (active) => ({ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: active ? 'var(--color-accent)' : 'transparent', color: active ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }),
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
  stats: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.5rem', minWidth: '120px' },
  statNum: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' },
  statLabel: { fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' },
  confirmBox: { background: 'var(--color-bg)', border: '1px solid var(--color-danger)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' },
};

const CLASS_LEVELS = ['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  studentId: '', class_level: 'Senior 1', section: 'A',
  gender: '', dateOfBirth: '', parentName: '', parentPhone: '', address: '',
};

export default function Students() {
  const { user } = useSelector((st) => st.auth);
  const canManage = ['super_admin', 'school_admin'].includes(user?.role);

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const load = (p = page, cls = classFilter) => {
    const params = new URLSearchParams({ page: p, limit });
    if (cls) params.append('class_level', cls);
    api.get(`/students?${params}`)
      .then(r => {
        const d = r.data;
        setStudents(Array.isArray(d) ? d : d?.students || []);
        setTotal(d?.total || 0);
      })
      .catch(() => { setStudents([]); setTotal(0); });
  };

  useEffect(() => { load(page, classFilter); }, [page, classFilter]);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const openCreate = () => {
    setEditStudent(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (st) => {
    setEditStudent(st);
    setForm({
      firstName: st.first_name || '', lastName: st.last_name || '',
      email: st.email || '', password: '',
      studentId: st.student_id || '', class_level: st.class_level || 'Senior 1',
      section: st.section || 'A', gender: st.gender || '',
      dateOfBirth: st.date_of_birth ? st.date_of_birth.split('T')[0] : '',
      parentName: st.parent_name || '', parentPhone: st.parent_phone || '',
      address: st.address || '',
    });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!editStudent && (!form.firstName || !form.lastName || !form.email)) {
      setError('First name, last name and email are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent.id}`, {
          class_level: form.class_level, section: form.section,
          gender: form.gender || null, dateOfBirth: form.dateOfBirth || null,
          parentName: form.parentName || null, parentPhone: form.parentPhone || null,
          address: form.address || null,
        });
      } else {
        await api.post('/students', {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password || 'password123',
          studentId: form.studentId || undefined,
          class_level: form.class_level, section: form.section,
          gender: form.gender || null, dateOfBirth: form.dateOfBirth || null,
          parentName: form.parentName || null, parentPhone: form.parentPhone || null,
          address: form.address || null,
        });
      }
      setShowModal(false);
      load(page, classFilter);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save student');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/students/${deleteStudent.id}`);
      setDeleteStudent(null);
      load(1, classFilter);
      setPage(1);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  const filtered = students.filter(st =>
    !search || `${st.first_name} ${st.last_name} ${st.email} ${st.student_id}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);
  const initials = (st) => `${st.first_name?.[0] || ''}${st.last_name?.[0] || ''}`.toUpperCase();

  // Group by class level for stats
  const classCounts = students.reduce((acc, st) => { acc[st.class_level] = (acc[st.class_level] || 0) + 1; return acc; }, {});

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Students</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{total} student{total !== 1 ? 's' : ''} enrolled</p>
        </div>
        {canManage && <button style={s.btn} onClick={openCreate}>+ Register Student</button>}
      </div>

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.statCard}>
          <div style={s.statNum}>{total}</div>
          <div style={s.statLabel}>Total Students</div>
        </div>
        {Object.entries(classCounts).slice(0, 4).map(([cls, count]) => (
          <div key={cls} style={s.statCard}>
            <div style={s.statNum}>{count}</div>
            <div style={s.statLabel}>{cls}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <input
          style={s.searchInput}
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.select} value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
          <option value="">All Classes</option>
          {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: '3rem', margin: 0 }}>🎓</p>
          <p>No students found.</p>
          {canManage && <button style={s.btn} onClick={openCreate}>Register First Student</button>}
        </div>
      ) : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>ID</th>
                <th style={s.th}>Class</th>
                <th style={s.th}>Section</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Gender</th>
                {canManage && <th style={s.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(st => (
                <tr key={st.id} style={{ cursor: 'pointer' }}>
                  <td style={s.td}>
                    <div style={s.nameCell}>
                      <div style={s.avatar}>{initials(st)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{st.first_name} {st.last_name}</div>
                        {st.parent_name && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Parent: {st.parent_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={s.td}><span style={s.badge}>{st.student_id}</span></td>
                  <td style={s.td}>{st.class_level}</td>
                  <td style={s.td}>{st.section || '-'}</td>
                  <td style={s.td}>{st.email}</td>
                  <td style={s.td}>{st.gender || '-'}</td>
                  {canManage && (
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.btnSecondary} onClick={() => setViewStudent(st)}>View</button>
                        <button style={s.btnSecondary} onClick={() => openEdit(st)}>Edit</button>
                        <button style={s.btnDanger} onClick={() => setDeleteStudent(st)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button style={s.pageBtn(false)} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} style={s.pageBtn(p === page)} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button style={s.pageBtn(false)} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editStudent ? 'Edit Student' : 'Register New Student'}</h2>

            {!editStudent && (
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
                    <input style={s.input} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="student@school.edu" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Password</label>
                    <input style={s.input} type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Default: password123" />
                  </div>
                </div>
              </>
            )}

            <p style={s.section}>Academic Info</p>
            <div style={s.row3}>
              <div style={s.field}>
                <label style={s.label}>Student ID</label>
                <input style={s.input} value={form.studentId} onChange={e => f('studentId', e.target.value)} placeholder="e.g. S001" disabled={!!editStudent} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Class Level *</label>
                <select style={s.selectFull} value={form.class_level} onChange={e => f('class_level', e.target.value)}>
                  {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Section</label>
                <select style={s.selectFull} value={form.section} onChange={e => f('section', e.target.value)}>
                  {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                </select>
              </div>
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

            <p style={s.section}>Parent / Guardian</p>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Parent Name</label>
                <input style={s.input} value={form.parentName} onChange={e => f('parentName', e.target.value)} placeholder="Parent/Guardian name" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Parent Phone</label>
                <input style={s.input} value={form.parentPhone} onChange={e => f('parentPhone', e.target.value)} placeholder="+250 700 000 000" />
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
                {saving ? 'Saving...' : editStudent ? 'Save Changes' : 'Register Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewStudent && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ ...s.avatar, width: '56px', height: '56px', fontSize: '1.2rem' }}>{initials(viewStudent)}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{viewStudent.first_name} {viewStudent.last_name}</h2>
                <span style={s.badge}>{viewStudent.student_id}</span>
              </div>
            </div>
            {[
              ['Email', viewStudent.email],
              ['Class', viewStudent.class_level],
              ['Section', viewStudent.section || '-'],
              ['Gender', viewStudent.gender || '-'],
              ['Date of Birth', viewStudent.date_of_birth ? new Date(viewStudent.date_of_birth).toLocaleDateString() : '-'],
              ['Parent Name', viewStudent.parent_name || '-'],
              ['Parent Phone', viewStudent.parent_phone || '-'],
              ['Address', viewStudent.address || '-'],
              ['Enrolled', viewStudent.enrollment_date ? new Date(viewStudent.enrollment_date).toLocaleDateString() : '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}
            <div style={s.modalActions}>
              {canManage && <button style={s.btnSecondary} onClick={() => { setViewStudent(null); openEdit(viewStudent); }}>Edit</button>}
              <button style={s.btn} onClick={() => setViewStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteStudent && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: '420px' }}>
            <div style={s.confirmBox}>
              <p style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>⚠️</p>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Delete Student?</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem 0' }}>
                This will permanently delete <strong>{deleteStudent.first_name} {deleteStudent.last_name}</strong> and their user account. This cannot be undone.
              </p>
              {error && <div style={s.error}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button style={s.btnSecondary} onClick={() => setDeleteStudent(null)}>Cancel</button>
                <button style={{ ...s.btn, background: 'var(--color-danger)' }} onClick={confirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

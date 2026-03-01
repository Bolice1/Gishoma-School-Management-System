import { useState, useEffect, useRef } from 'react';
import api from '../../api';

const s = {
  page: { padding: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.25rem 0' },
  subtitle: { color: 'var(--color-text-muted)', margin: '0 0 2rem 0', fontSize: '0.9rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: (color) => ({ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: '12px', padding: '1.5rem', borderLeft: `4px solid ${color}` }),
  statNum: { fontSize: '2rem', fontWeight: 700, margin: '0 0 0.25rem 0' },
  statLabel: { color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 },
  statIcon: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSmall: { padding: '0.35rem 0.7rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  btnToggle: (active) => ({ padding: '0.35rem 0.7rem', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', background: active ? 'var(--color-success)' : 'rgba(239,68,68,0.2)', color: active ? 'white' : 'var(--color-danger)' }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.88rem' },
  badge: (active) => ({ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.75rem', background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: active ? 'var(--color-success)' : 'var(--color-danger)' }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' },
  section: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.75rem 0' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  barWrap: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  barLabel: { fontSize: '0.82rem', color: 'var(--color-text-muted)', width: '90px', flexShrink: 0, textAlign: 'right' },
  barTrack: { flex: 1, height: '22px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' },
  barFill: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.8s ease', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem', minWidth: pct > 0 ? '30px' : '0' }),
  donut: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' },
  legend: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' },
  legendDot: (color) => ({ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }),
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
};

const COLORS = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', '#a78bfa', '#f472b6', '#34d399'];

function BarChart({ data, max, color }) {
  return (
    <div style={s.barWrap}>
      {data.map((item, i) => {
        const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
        return (
          <div key={i} style={s.barRow}>
            <div style={s.barLabel}>{item.label}</div>
            <div style={s.barTrack}>
              <div style={s.barFill(pct, color || COLORS[i % COLORS.length])}>
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>{pct > 10 ? item.value : ''}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', width: '30px', textAlign: 'right' }}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments }) {
  const size = 130;
  const cx = size / 2, cy = size / 2, r = 48, strokeW = 22;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-bg)" strokeWidth={strokeW} />
        {segments.map((seg, i) => {
          if (seg.value === 0) return null;
          const pct = seg.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--color-text)" fontSize="18" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--color-text-muted)" fontSize="9">TOTAL</text>
      </svg>
      <div style={s.legend}>
        {segments.map((seg, i) => (
          <div key={i} style={s.legendItem}>
            <div style={s.legendDot(COLORS[i % COLORS.length])} />
            <span style={{ color: 'var(--color-text-muted)' }}>{seg.label}:</span>
            <span style={{ fontWeight: 600 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptySchoolForm = {
  name: '', email: '', phone: '', address: '', region: '',
  adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '',
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalSchools: 0, totalUsers: 0, totalStudents: 0, totalTeachers: 0 });
  const [schools, setSchools] = useState([]);
  const [schoolStats, setSchoolStats] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState(emptySchoolForm);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadStats = () => {
    api.get('/dashboard/super-admin').then(r => setStats(r.data)).catch(() => {});
  };

  const loadSchools = (p = 1) => {
    api.get(`/schools?page=${p}&limit=${limit}`)
      .then(r => {
        const d = r.data;
        const list = Array.isArray(d) ? d : d?.schools || [];
        setSchools(list);
        setTotal(d?.total || list.length);
        // Load per-school student/teacher counts
        list.forEach(school => {
          api.get(`/students?schoolId=${school.id}&limit=1`).then(sr => {
            setSchoolStats(prev => ({ ...prev, [school.id]: { ...prev[school.id], students: sr.data?.total || 0 } }));
          }).catch(() => {});
        });
      })
      .catch(() => setSchools([]));
  };

  useEffect(() => { loadStats(); loadSchools(); }, []);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const ef = (k, v) => setEditForm(prev => ({ ...prev, [k]: v }));

  const createSchool = async () => {
    if (!form.name || !form.email) { setError('School name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/schools', form);
      setShowAdd(false);
      setForm(emptySchoolForm);
      loadSchools();
      loadStats();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || 'Failed to create school');
    } finally { setSaving(false); }
  };

  const saveEdit = async () => {
    setSaving(true); setError('');
    try {
      await api.put(`/schools/${showEdit.id}`, editForm);
      setShowEdit(null);
      loadSchools();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const toggleActive = async (school) => {
    try {
      await api.put(`/schools/${school.id}`, { is_active: !school.is_active });
      loadSchools(page);
    } catch (e) {}
  };

  const totalPages = Math.ceil(total / limit);

  // Chart data
  const regionData = schools.reduce((acc, s) => {
    const r = s.region || 'Unknown';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  const regionChartData = Object.entries(regionData).map(([label, value]) => ({ label, value }));
  const maxRegion = Math.max(...regionChartData.map(d => d.value), 1);

  return (
    <div style={s.page}>
      <h1 style={s.title}>Platform Overview</h1>
      <p style={s.subtitle}>Gishoma Multi-School Management System — Super Admin</p>

      {/* Stat Cards */}
      <div style={s.grid4}>
        {[
          { label: 'Active Schools', value: stats.totalSchools, icon: '🏫', color: 'var(--color-accent)' },
          { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: 'var(--color-success)' },
          { label: 'Total Teachers', value: stats.totalTeachers, icon: '👨‍🏫', color: 'var(--color-warning)' },
          { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#a78bfa' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={s.statCard(color)}>
            <div style={s.statIcon}>{icon}</div>
            <p style={s.statNum}>{value.toLocaleString()}</p>
            <p style={s.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={s.grid2}>
        <div style={s.card}>
          <p style={s.cardTitle}>Platform Distribution</p>
          <DonutChart segments={[
            { label: 'Students', value: stats.totalStudents },
            { label: 'Teachers', value: stats.totalTeachers },
            { label: 'Other Users', value: Math.max(0, stats.totalUsers - stats.totalStudents - stats.totalTeachers) },
          ]} />
        </div>
        <div style={s.card}>
          <p style={s.cardTitle}>Schools by Region</p>
          {regionChartData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No region data yet.</p>
          ) : (
            <BarChart data={regionChartData} max={maxRegion} />
          )}
        </div>
      </div>

      {/* Schools Table */}
      <div style={s.card}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Registered Schools</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{total} school{total !== 1 ? 's' : ''} total</p>
          </div>
          <button style={s.btn} onClick={() => { setForm(emptySchoolForm); setError(''); setShowAdd(true); }}>+ Add School</button>
        </div>

        {schools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '2.5rem', margin: 0 }}>🏫</p>
            <p>No schools registered yet.</p>
          </div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>School</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Region</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Registered</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map(school => (
                  <tr key={school.id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 500 }}>{school.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{school.address || '-'}</div>
                    </td>
                    <td style={s.td}>{school.email}</td>
                    <td style={s.td}>{school.region || '-'}</td>
                    <td style={s.td}>{school.phone || '-'}</td>
                    <td style={s.td}><span style={s.badge(school.is_active)}>{school.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td style={s.td}>{new Date(school.created_at).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={s.btnSmall} onClick={() => {
                          setShowEdit(school);
                          setEditForm({ name: school.name, email: school.email, phone: school.phone || '', address: school.address || '', region: school.region || '' });
                          setError('');
                        }}>Edit</button>
                        <button style={s.btnToggle(school.is_active)} onClick={() => toggleActive(school)}>
                          {school.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                <button style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setPage(p => Math.max(1, p - 1)); loadSchools(page - 1); }} disabled={page === 1}>←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--color-border)', background: p === page ? 'var(--color-accent)' : 'transparent', color: p === page ? 'white' : 'var(--color-text-muted)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setPage(p); loadSchools(p); }}>{p}</button>
                ))}
                <button style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setPage(p => Math.min(totalPages, p + 1)); loadSchools(page + 1); }} disabled={page === totalPages}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add School Modal */}
      {showAdd && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Register New School</h2>

            <p style={s.section}>School Information</p>
            <div style={s.field}>
              <label style={s.label}>School Name *</label>
              <input style={s.input} value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Green Hills Academy" />
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Email *</label>
                <input style={s.input} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="info@school.edu" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input style={s.input} value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+250 700 000 000" />
              </div>
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Region</label>
                <input style={s.input} value={form.region} onChange={e => f('region', e.target.value)} placeholder="e.g. Kigali" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Address</label>
                <input style={s.input} value={form.address} onChange={e => f('address', e.target.value)} placeholder="Physical address" />
              </div>
            </div>

            <p style={s.section}>School Admin Account (Optional)</p>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Admin First Name</label>
                <input style={s.input} value={form.adminFirstName} onChange={e => f('adminFirstName', e.target.value)} placeholder="First name" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Admin Last Name</label>
                <input style={s.input} value={form.adminLastName} onChange={e => f('adminLastName', e.target.value)} placeholder="Last name" />
              </div>
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Admin Email</label>
                <input style={s.input} type="email" value={form.adminEmail} onChange={e => f('adminEmail', e.target.value)} placeholder="admin@school.edu" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Admin Password</label>
                <input style={s.input} type="password" value={form.adminPassword} onChange={e => f('adminPassword', e.target.value)} placeholder="Secure password" />
              </div>
            </div>

            {error && <div style={s.error}>{error}</div>}
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={s.btn} onClick={createSchool} disabled={saving}>{saving ? 'Creating...' : 'Create School'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit School Modal */}
      {showEdit && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Edit School</h2>
            <div style={s.field}>
              <label style={s.label}>School Name</label>
              <input style={s.input} value={editForm.name || ''} onChange={e => ef('name', e.target.value)} />
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} value={editForm.email || ''} onChange={e => ef('email', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input style={s.input} value={editForm.phone || ''} onChange={e => ef('phone', e.target.value)} />
              </div>
            </div>
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Region</label>
                <input style={s.input} value={editForm.region || ''} onChange={e => ef('region', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Address</label>
                <input style={s.input} value={editForm.address || ''} onChange={e => ef('address', e.target.value)} />
              </div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowEdit(null)}>Cancel</button>
              <button style={s.btn} onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

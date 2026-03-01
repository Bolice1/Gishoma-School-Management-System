import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const s = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSecondary: { padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: '6px', cursor: 'pointer' },
  tabActive: { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: 'white' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' },
  badge: (status) => {
    const colors = { present: 'rgba(34,197,94,0.15)', absent: 'rgba(239,68,68,0.15)', late: 'rgba(245,158,11,0.15)', excused: 'rgba(59,130,246,0.15)' };
    const textColors = { present: 'var(--color-success)', absent: 'var(--color-danger)', late: 'var(--color-warning)', excused: 'var(--color-accent)' };
    return { padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', background: colors[status] || colors.excused, color: textColors[status] || textColors.excused, textTransform: 'capitalize' };
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.95rem', boxSizing: 'border-box' },
  select: { padding: '0.5rem 0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text)', fontSize: '0.9rem', cursor: 'pointer' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.5rem' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  markRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' },
  markName: { fontWeight: 500 },
  markId: { fontSize: '0.85rem', color: 'var(--color-text-muted)' },
  markHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' },
  markList: { border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' },
  quickBtns: { display: 'flex', gap: '0.4rem' },
  quickBtn: (status, active) => ({ padding: '0.35rem 0.65rem', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 700 : 400, opacity: active ? 1 : 0.5, background: status === 'present' ? 'var(--color-success)' : status === 'absent' ? 'var(--color-danger)' : status === 'late' ? 'var(--color-warning)' : 'var(--color-accent)', color: 'white' }),
};

export default function Attendance() {
  const { user } = useSelector((st) => st.auth);
  const canMark = ['super_admin', 'school_admin', 'dean', 'teacher'].includes(user?.role);

  const [tab, setTab] = useState('students');
  const [studentAtt, setStudentAtt] = useState([]);
  const [teacherAtt, setTeacherAtt] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showMark, setShowMark] = useState(false);
  const [markType, setMarkType] = useState('student');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markRecords, setMarkRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const loadAttendance = () => {
    api.get(`/attendance/students?startDate=${dateFilter}&endDate=${dateFilter}`).then(r => setStudentAtt(r.data || [])).catch(() => setStudentAtt([]));
    api.get(`/attendance/teachers?startDate=${dateFilter}&endDate=${dateFilter}`).then(r => setTeacherAtt(r.data || [])).catch(() => setTeacherAtt([]));
  };

  useEffect(() => { loadAttendance(); }, [dateFilter]);

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data?.students || r.data || [])).catch(() => setStudents([]));
    api.get('/teachers').then(r => setTeachers(r.data?.teachers || r.data || [])).catch(() => setTeachers([]));
  }, []);

  const openMark = (type) => {
    setMarkType(type);
    setMarkDate(new Date().toISOString().split('T')[0]);
    setMarkRecords({});
    setError('');
    setShowMark(true);
  };

  const setStatus = (id, status) => setMarkRecords(prev => ({ ...prev, [id]: status }));

  const markAll = (status) => {
    const list = markType === 'student' ? students : teachers;
    const records = {};
    list.forEach(p => { records[p.id] = status; });
    setMarkRecords(records);
  };

  const saveAttendance = async () => {
    const list = markType === 'student' ? students : teachers;
    const records = list
      .filter(p => markRecords[p.id])
      .map(p => ({
        [markType === 'student' ? 'studentId' : 'teacherId']: p.id,
        date: markDate,
        status: markRecords[p.id],
        type: markType,
      }));

    if (records.length === 0) { setError('Please mark at least one person.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/attendance', { records });
      setShowMark(false);
      loadAttendance();
    } catch (e) { setError(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const currentList = tab === 'students' ? studentAtt : teacherAtt;

  const stats = (list) => {
    const total = list.length;
    const present = list.filter(r => r.status === 'present').length;
    const absent = list.filter(r => r.status === 'absent').length;
    const late = list.filter(r => r.status === 'late').length;
    return { total, present, absent, late };
  };

  const { total, present, absent, late } = stats(currentList);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Attendance</h1>
        {canMark && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={s.btnSecondary} onClick={() => openMark('teacher')}>Mark Teachers</button>
            <button style={s.btn} onClick={() => openMark('student')}>Mark Students</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['Total', total, 'var(--color-text)'], ['Present', present, 'var(--color-success)'], ['Absent', absent, 'var(--color-danger)'], ['Late', late, 'var(--color-warning)']].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.5rem', minWidth: '100px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'students' ? s.tabActive : {}) }} onClick={() => setTab('students')}>Students</button>
          <button style={{ ...s.tab, ...(tab === 'teachers' ? s.tabActive : {}) }} onClick={() => setTab('teachers')}>Teachers</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Date:</label>
          <input type="date" style={s.select} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
      </div>

      {currentList.length === 0 ? (
        <div style={s.empty}><p style={{ fontSize: '3rem', margin: 0 }}>📋</p><p>No attendance records for {dateFilter}.</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>ID</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Status</th>
              {tab === 'students' && <th style={s.th}>Remarks</th>}
            </tr>
          </thead>
          <tbody>
            {currentList.map((r, i) => (
              <tr key={i}>
                <td style={s.td}><strong>{r.first_name} {r.last_name}</strong></td>
                <td style={s.td}>{r.student_no || r.employee_id || '-'}</td>
                <td style={s.td}>{r.date}</td>
                <td style={s.td}><span style={s.badge(r.status)}>{r.status}</span></td>
                {tab === 'students' && <td style={s.td}>{r.remarks || '-'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Mark Attendance Modal */}
      {showMark && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Mark {markType === 'student' ? 'Student' : 'Teacher'} Attendance</h2>

            <div style={s.field}>
              <label style={s.label}>Date *</label>
              <input style={s.input} type="date" value={markDate} onChange={e => setMarkDate(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Mark all:</span>
              {['present', 'absent', 'late', 'excused'].map(st => (
                <button key={st} style={s.quickBtn(st, false)} onClick={() => markAll(st)}>{st}</button>
              ))}
            </div>

            <div style={s.markList}>
              <div style={s.markHeader}>
                <span>Name</span>
                <span>Status</span>
              </div>
              {(markType === 'student' ? students : teachers).map(person => (
                <div key={person.id} style={s.markRow}>
                  <div>
                    <div style={s.markName}>{person.first_name} {person.last_name}</div>
                    <div style={s.markId}>{person.student_id || person.employee_id || ''}</div>
                  </div>
                  <div style={s.quickBtns}>
                    {['present', 'absent', 'late', 'excused'].map(st => (
                      <button
                        key={st}
                        style={s.quickBtn(st, markRecords[person.id] === st)}
                        onClick={() => setStatus(person.id, st)}
                      >
                        {st.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              {Object.keys(markRecords).length} of {markType === 'student' ? students.length : teachers.length} marked
            </div>

            {error && <div style={s.error}>{error}</div>}
            <div style={s.actions}>
              <button style={s.btnSecondary} onClick={() => setShowMark(false)}>Cancel</button>
              <button style={s.btn} onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

const base = {
  input: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' },
  btn: { padding: '0.6rem 1.2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSec: { padding: '0.5rem 0.9rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSmall: { padding: '0.35rem 0.75rem', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' },
  field: { marginBottom: '1.1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' },
  error: { color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0.5rem 0' },
  th: { padding: '1rem', textAlign: 'left', fontSize: '0.82rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' },
};

export default function Fees() {
  const { user } = useSelector(st => st.auth);
  const canManage = ['school_admin', 'bursar'].includes(user?.role);
  const [tab, setTab] = useState('payments');
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [feeForm, setFeeForm] = useState({ name: '', amount: '', term: '', academicYear: String(new Date().getFullYear()), dueDate: '', description: '' });
  const [payForm, setPayForm] = useState({ studentId: '', feeId: '', amount: '', paymentMethod: 'cash', reference: '', remarks: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadFees = () => api.get('/fees').then(r => setFees(Array.isArray(r.data) ? r.data : [])).catch(() => setFees([]));
  const loadPayments = () => api.get('/fees/payments').then(r => setPayments(Array.isArray(r.data) ? r.data : [])).catch(() => setPayments([]));

  useEffect(() => { loadFees(); loadPayments(); }, []);
  useEffect(() => { api.get('/students').then(r => { const d = r.data; setStudents(Array.isArray(d) ? d : d?.students || []); }).catch(() => {}); }, []);

  const ff = (k, v) => setFeeForm(p => ({ ...p, [k]: v }));
  const pf = (k, v) => setPayForm(p => ({ ...p, [k]: v }));

  const createFee = async () => {
    if (!feeForm.name || !feeForm.amount) { setError('Name and amount required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/fees', { ...feeForm, amount: parseFloat(feeForm.amount) });
      setShowAddFee(false); loadFees();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const recordPayment = async () => {
    if (!payForm.studentId || !payForm.feeId || !payForm.amount) { setError('Student, fee and amount required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/fees/payments', { ...payForm, amount: parseFloat(payForm.amount) });
      setShowPay(false); loadPayments();
    } catch(e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const filteredPayments = payments.filter(p =>
    !search || (p.first_name + ' ' + p.last_name + ' ' + p.student_id + ' ' + p.receipt_number).toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Fees & Payments</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Total collected: <strong>{totalCollected.toLocaleString()} RWF</strong></p>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={base.btnSec} onClick={() => { setError(''); setShowAddFee(true); }}>+ Add Fee</button>
            <button style={base.btn} onClick={() => { setError(''); setShowPay(true); }}>+ Record Payment</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['Total Payments', payments.length, 'var(--color-accent)'], ['Total Collected', totalCollected.toLocaleString() + ' RWF', 'var(--color-success)'], ['Fee Types', fees.length, 'var(--color-warning)']].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['payments', 'Payments'], ['fees', 'Fee Types']].map(([key, label]) => (
          <button key={key} style={{ padding: '0.5rem 1.25rem', background: tab === key ? 'var(--color-accent)' : 'transparent', color: tab === key ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'payments' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input style={{ ...base.input, width: '280px' }} placeholder="Search by name, ID or receipt..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filteredPayments.length === 0
            ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}><p style={{ fontSize: '3rem', margin: 0 }}>💰</p><p>No payments recorded yet.</p></div>
            : <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <thead><tr>
                  <th style={base.th}>Student</th><th style={base.th}>Fee</th>
                  <th style={base.th}>Amount</th><th style={base.th}>Method</th>
                  <th style={base.th}>Receipt</th><th style={base.th}>Date</th>
                  <th style={base.th}>Remarks</th>
                </tr></thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id}>
                      <td style={base.td}><strong>{p.first_name} {p.last_name}</strong><br/><span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p.student_id}</span></td>
                      <td style={base.td}>{p.fee_name}</td>
                      <td style={base.td}><strong style={{ color: 'var(--color-success)' }}>{parseFloat(p.amount).toLocaleString()} RWF</strong></td>
                      <td style={base.td}>{p.payment_method}</td>
                      <td style={base.td}><span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>{p.receipt_number}</span></td>
                      <td style={base.td}>{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td style={base.td}>{p.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </>
      )}

      {tab === 'fees' && (
        fees.length === 0
          ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}><p style={{ fontSize: '3rem', margin: 0 }}>📋</p><p>No fee types created yet.</p></div>
          : <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <thead><tr>
                <th style={base.th}>Name</th><th style={base.th}>Amount</th>
                <th style={base.th}>Term</th><th style={base.th}>Academic Year</th>
                <th style={base.th}>Due Date</th><th style={base.th}>Description</th>
                {canManage && <th style={base.th}>Action</th>}
              </tr></thead>
              <tbody>
                {fees.map(f => (
                  <tr key={f.id}>
                    <td style={base.td}><strong>{f.name}</strong></td>
                    <td style={base.td}><strong style={{ color: 'var(--color-accent)' }}>{parseFloat(f.amount).toLocaleString()} RWF</strong></td>
                    <td style={base.td}>{f.term || '—'}</td>
                    <td style={base.td}>{f.academic_year}</td>
                    <td style={base.td}>{f.due_date ? new Date(f.due_date).toLocaleDateString() : '—'}</td>
                    <td style={base.td}>{f.description || '—'}</td>
                    {canManage && <td style={base.td}><button style={base.btnSmall} onClick={() => { pf('feeId', f.id); pf('amount', f.amount); setShowPay(true); }}>Collect</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
      )}

      {/* Add Fee Modal */}
      {showAddFee && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' }}>Create Fee Type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={base.field}><label style={base.label}>Fee Name *</label><input style={base.input} value={feeForm.name} onChange={e => ff('name', e.target.value)} placeholder="e.g. School Fees Term 1" /></div>
              <div style={base.field}><label style={base.label}>Amount (RWF) *</label><input style={base.input} type="number" value={feeForm.amount} onChange={e => ff('amount', e.target.value)} placeholder="e.g. 150000" /></div>
              <div style={base.field}><label style={base.label}>Term</label><select style={base.select} value={feeForm.term} onChange={e => ff('term', e.target.value)}><option value="">None</option><option value="Term 1">Term 1</option><option value="Term 2">Term 2</option><option value="Term 3">Term 3</option></select></div>
              <div style={base.field}><label style={base.label}>Academic Year</label><input style={base.input} value={feeForm.academicYear} onChange={e => ff('academicYear', e.target.value)} /></div>
              <div style={base.field}><label style={base.label}>Due Date</label><input style={base.input} type="date" value={feeForm.dueDate} onChange={e => ff('dueDate', e.target.value)} /></div>
              <div style={base.field}><label style={base.label}>Description</label><input style={base.input} value={feeForm.description} onChange={e => ff('description', e.target.value)} /></div>
            </div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setShowAddFee(false)}>Cancel</button>
              <button style={base.btn} onClick={createFee} disabled={saving}>{saving ? 'Saving...' : 'Create Fee'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPay && (
        <div style={base.overlay}>
          <div style={base.modal}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', margin: '0 0 1.5rem 0' }}>Record Payment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={base.field}><label style={base.label}>Student *</label><select style={base.select} value={payForm.studentId} onChange={e => pf('studentId', e.target.value)}><option value="">Select...</option>{students.map(st => <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.student_id})</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Fee Type *</label><select style={base.select} value={payForm.feeId} onChange={e => { pf('feeId', e.target.value); const fee = fees.find(f => f.id === e.target.value); if(fee) pf('amount', fee.amount); }}><option value="">Select...</option>{fees.map(f => <option key={f.id} value={f.id}>{f.name} ({parseFloat(f.amount).toLocaleString()} RWF)</option>)}</select></div>
              <div style={base.field}><label style={base.label}>Amount (RWF) *</label><input style={base.input} type="number" value={payForm.amount} onChange={e => pf('amount', e.target.value)} /></div>
              <div style={base.field}><label style={base.label}>Payment Method</label><select style={base.select} value={payForm.paymentMethod} onChange={e => pf('paymentMethod', e.target.value)}><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="mobile_money">Mobile Money</option><option value="cheque">Cheque</option></select></div>
              <div style={base.field}><label style={base.label}>Reference</label><input style={base.input} value={payForm.reference} onChange={e => pf('reference', e.target.value)} placeholder="Transaction ref..." /></div>
              <div style={base.field}><label style={base.label}>Remarks</label><input style={base.input} value={payForm.remarks} onChange={e => pf('remarks', e.target.value)} placeholder="Optional..." /></div>
            </div>
            {error && <div style={base.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button style={base.btnSec} onClick={() => setShowPay(false)}>Cancel</button>
              <button style={base.btn} onClick={recordPayment} disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

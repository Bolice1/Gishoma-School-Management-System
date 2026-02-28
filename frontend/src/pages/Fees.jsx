import { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function Fees() {
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [tab, setTab] = useState('payments');

  useEffect(() => {
    api.get('/fees/payments').then((res) => setPayments(res.data || []));
    api.get('/fees').then((res) => setFees(res.data || []));
  }, []);

  const paymentCols = [
    { label: 'Student', render: (r) => r.Student?.User ? `${r.Student.User.firstName} ${r.Student.User.lastName}` : '-' },
    { key: 'receiptNumber', label: 'Receipt' },
    { key: 'amount', label: 'Amount', render: (r) => `RWF ${Number(r.amount).toLocaleString()}` },
    { key: 'paymentDate', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
    { key: 'paymentMethod', label: 'Method' },
  ];

  const feeCols = [
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount', render: (r) => `RWF ${Number(r.amount).toLocaleString()}` },
    { key: 'term', label: 'Term' },
    { key: 'academicYear', label: 'Year' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Fees & Payments</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button style={{ ...tabStyles.tab, ...(tab === 'payments' ? tabStyles.tabActive : {}) }} onClick={() => setTab('payments')}>Payments</button>
        <button style={{ ...tabStyles.tab, ...(tab === 'fees' ? tabStyles.tabActive : {}) }} onClick={() => setTab('fees')}>Fee Types</button>
      </div>
      <DataTable columns={tab === 'payments' ? paymentCols : feeCols} data={tab === 'payments' ? payments : fees} />
    </div>
  );
}

const tabStyles = {
  tab: { marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: '6px' },
  tabActive: { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: 'white' },
};

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';
import Toast from '../components/Toast';

const ROLE_GROUPS = {
  everyone: 'Everyone',
  students: 'All Students',
  teachers: 'All Teachers',
  bursars: 'All Bursars',
  dean: 'Dean',
  patrons: 'All Patrons & Matrons',
  specific: 'Select Specific People',
};

export default function EmailComposer() {
  const user = useSelector((s) => s.auth.user);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [allRecipients, setAllRecipients] = useState([]);
  const [recipientGroup, setRecipientGroup] = useState('everyone');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecipientList, setShowRecipientList] = useState(false);

  const isAdmin = user?.role === 'school_admin' || user?.role === 'patron' || user?.role === 'matron';

  // Fetch all recipients on mount
  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const res = await api.get('/email/recipients');
        setAllRecipients(res.data);
      } catch (err) {
        console.error('Failed to load recipients:', err);
      }
    };
    loadRecipients();
  }, []);

  // Update recipients based on selected group
  useEffect(() => {
    if (recipientGroup === 'everyone') {
      setRecipients(allRecipients.map((r) => r.id));
    } else if (recipientGroup === 'students') {
      setRecipients(allRecipients.filter((r) => r.role === 'student').map((r) => r.id));
    } else if (recipientGroup === 'teachers') {
      setRecipients(allRecipients.filter((r) => r.role === 'teacher').map((r) => r.id));
    } else if (recipientGroup === 'bursars') {
      setRecipients(allRecipients.filter((r) => r.role === 'bursar').map((r) => r.id));
    } else if (recipientGroup === 'dean') {
      setRecipients(allRecipients.filter((r) => r.role === 'dean').map((r) => r.id));
    } else if (recipientGroup === 'patrons') {
      setRecipients(allRecipients.filter((r) => ['patron', 'matron'].includes(r.role)).map((r) => r.id));
    } else if (recipientGroup === 'specific') {
      setShowRecipientList(true);
    }
  }, [recipientGroup, allRecipients]);

  const filteredRecipients = allRecipients.filter((r) =>
    searchTerm === '' ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRecipient = (id) => {
    if (recipients.includes(id)) {
      setRecipients(recipients.filter((rid) => rid !== id));
    } else {
      setRecipients([...recipients, id]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      Toast.error('Subject is required');
      return;
    }
    if (!message.trim()) {
      Toast.error('Message is required');
      return;
    }
    if (recipients.length === 0) {
      Toast.error('Please select at least one recipient');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (recipientGroup === 'specific') {
        res = await api.post('/email/send-custom', {
          recipientIds: recipients,
          subject,
          message,
        });
      } else {
        res = await api.post('/email/send-announcement', {
          subject,
          message,
          targetRole: recipientGroup === 'everyone' ? 'all' : recipientGroup,
          recipientIds: recipientGroup === 'specific' ? recipients : undefined,
        });
      }

      Toast.success(`✅ Email sent to ${res.data.sent} recipient${res.data.sent !== 1 ? 's' : ''}`);
      setSubject('');
      setMessage('');
      setRecipients([]);
      setRecipientGroup('everyone');
    } catch (err) {
      Toast.error(err.response?.data?.error || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
        <p>You do not have permission to send emails.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem',
        color: 'var(--color-text)',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>✉️ Send Email</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Compose and send emails to students and staff
      </p>

      <form onSubmit={handleSend}>
        {/* Recipients Selection */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
            Send To:
          </label>
          <select
            value={recipientGroup}
            onChange={(e) => {
              setRecipientGroup(e.target.value);
              setShowRecipientList(false);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              marginBottom: '1rem',
            }}
          >
            {Object.entries(ROLE_GROUPS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {recipientGroup === 'specific' && (
            <div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                }}
              />
              <div
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  background: '#0f172a',
                }}
              >
                {filteredRecipients.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, padding: '0.5rem' }}>
                    No recipients found
                  </p>
                ) : (
                  filteredRecipients.map((recipient) => (
                    <label
                      key={recipient.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '0.5rem',
                        background: recipients.includes(recipient.id) ? '#1e40af' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={recipients.includes(recipient.id)}
                        onChange={() => handleSelectRecipient(recipient.id)}
                        style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{recipient.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {recipient.email} • {recipient.role}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                Selected: {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {recipientGroup !== 'specific' && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Will send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
            Subject:
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            style={{
              width: '100%',
              minHeight: '250px',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            background: loading ? 'var(--color-border)' : 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '📤 Sending...' : '📤 Send Email'}
        </button>
      </form>
    </div>
  );
}

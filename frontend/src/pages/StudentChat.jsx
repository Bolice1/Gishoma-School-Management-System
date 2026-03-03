import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';

export default function StudentChat() {
  const { user } = useSelector(st => st.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const load = () => {
    api.get('/chat/messages').then(r => {
      const d = Array.isArray(r.data) ? r.data : r.data?.messages || [];
      setMessages(d);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true); setError('');
    try {
      await api.post('/chat/messages', { content: text.trim() });
      setText('');
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to send'); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const isMe = (msg) => msg.user_id === user?.id || msg.author_id === user?.id;
  const isPrefect = (msg) => msg.is_prefect && msg.is_prefect !== 'none';

  const prefectBadge = (type) => ({
    padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
    background: type === 'head_boy' ? 'rgba(59,130,246,0.2)' : 'rgba(236,72,153,0.2)',
    color: type === 'head_boy' ? 'var(--color-accent)' : '#ec4899',
  });

  return (
    <div style={{ padding: '2rem', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Student Chat</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>School community platform — be respectful 🤝</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '3rem', margin: 0 }}>💬</p>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div style={{ textAlign: 'center', margin: '1rem 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <span style={{ background: 'var(--color-bg)', padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>{formatDate(msgs[0].created_at)}</span>
            </div>
            {msgs.map(msg => {
              const mine = isMe(msg);
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                  {!mine && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginRight: '0.5rem', alignSelf: 'flex-end' }}>
                      {(msg.first_name?.[0] || '') + (msg.last_name?.[0] || '')}
                    </div>
                  )}
                  <div style={{ maxWidth: '65%' }}>
                    {!mine && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{msg.first_name} {msg.last_name}</span>
                        {isPrefect(msg) && <span style={prefectBadge(msg.is_prefect)}>{msg.is_prefect === 'head_boy' ? '👑 Head Boy' : '👑 Head Girl'}</span>}
                      </div>
                    )}
                    <div style={{
                      padding: '0.65rem 1rem',
                      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: mine ? 'var(--color-accent)' : 'var(--color-bg)',
                      color: mine ? 'white' : 'var(--color-text)',
                      border: mine ? 'none' : '1px solid var(--color-border)',
                      fontSize: '0.92rem',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', textAlign: mine ? 'right' : 'left', paddingLeft: '0.25rem' }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <textarea
          style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text)', fontSize: '0.95rem', resize: 'none', minHeight: '50px', maxHeight: '120px', lineHeight: 1.5 }}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send)"
          rows={1}
        />
        <button
          style={{ padding: '0.75rem 1.5rem', background: text.trim() ? 'var(--color-accent)' : 'var(--color-border)', color: 'white', border: 'none', borderRadius: '12px', cursor: text.trim() ? 'pointer' : 'default', fontSize: '0.95rem', transition: 'background 0.2s' }}
          onClick={send}
          disabled={sending || !text.trim()}
        >
          {sending ? '...' : '➤'}
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Auto-refreshes every 5 seconds</p>
    </div>
  );
}

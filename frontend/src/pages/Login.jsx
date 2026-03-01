import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const credentials = { email, password };
    if (schoolId && schoolId.trim()) credentials.schoolId = schoolId.trim();
    const result = await dispatch(login(credentials));
    // only navigate when login succeeds
    if (login.fulfilled.match(result)) {
      // redirect to root; the router will send the user to the
      // appropriate dashboard based on their role
      navigate('/', { replace: true });
      // clear sensitive fields
      setPassword('');
      setSchoolId('');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gishoma Multi-School</h1>
        <p style={styles.subtitle}>School Management System</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="School ID (optional - for school users)"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.hint}>
          Demo: superadmin@gishoma.edu or admin@gishoma.edu / password123
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.75rem',
    textAlign: 'center',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem 1rem',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text)',
    fontSize: '1rem',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: '0.9rem',
    margin: 0,
  },
  button: {
    padding: '0.75rem',
    background: 'var(--color-accent)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  hint: {
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
};

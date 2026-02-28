import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.text}>
              The application encountered an unexpected error. Please refresh the page.
            </p>
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={styles.error}>{this.state.error.toString()}</pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f1419',
    color: '#e8edf4',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    padding: '2rem',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  text: {
    color: '#8b9cb3',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  button: {
    padding: '0.75rem 1.5rem',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    marginTop: '1rem',
    fontSize: '0.8rem',
    color: '#ef4444',
    textAlign: 'left',
  },
};

export default ErrorBoundary;

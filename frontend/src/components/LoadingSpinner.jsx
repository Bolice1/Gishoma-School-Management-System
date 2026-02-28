export default function LoadingSpinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--color-border)',
    borderTopColor: 'var(--color-accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
};

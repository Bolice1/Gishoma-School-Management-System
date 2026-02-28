import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '1.5rem 2rem',
    overflow: 'auto',
  },
};

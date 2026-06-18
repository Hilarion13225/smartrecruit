import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    background: '#F9FAFB',
    minHeight: '100vh',
  },
};
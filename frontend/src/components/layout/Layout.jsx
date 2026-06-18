import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* Mobile menu button */}
      <button
        style={styles.mobileMenuBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  },
  mobileMenuBtn: {
    display: 'none',
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 999,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '20px',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  overlay: {
    display: 'none',
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 40,
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    background: '#F9FAFB',
    minHeight: '100vh',
    '@media (max-width: 1024px)': {
      marginLeft: '0',
      padding: '16px',
    },
    '@media (max-width: 768px)': {
      marginLeft: '0',
      padding: '12px',
      paddingTop: '60px',
    },
  },
};
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie.');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '💼', label: 'Mes offres', path: '/jobs' },
    { icon: '⚙️', label: 'Paramètres', path: '/settings' },
    ...(user?.role === 'admin' ? [
      { icon: '🛡️', label: 'Administration', path: '/admin' },
    ] : []),
  ];

  return (
    <aside style={{
      ...styles.sidebar,
      ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
    }}>
      {/* Header avec bouton fermer */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <span style={styles.logoText}>SmartRecruit</span>
        </div>
        <button
          onClick={onClose}
          style={styles.closeBtn}
        >
          ✕
        </button>
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.menuItemActive : {}),
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={styles.bottom}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={styles.userRole}>{user?.company || 'Recruteur'}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#1F2937',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
    transition: 'transform 0.3s ease',
    '@media (max-width: 768px)': {
      width: '250px',
    },
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    '@media (max-width: 768px)': {
      transform: 'translateX(-100%)',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '36px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '8px',
  },
  logoText: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    '@media (max-width: 640px)': {
      display: 'none',
    },
  },
  closeBtn: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#9CA3AF',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menuItemActive: {
    background: '#4F46E5',
    color: '#fff',
  },
  bottom: {
    marginTop: 'auto',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: '#374151',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  userDetails: {
    minWidth: 0,
    flex: 1,
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#4F46E5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  userName: {
    color: '#F9FAFB',
    fontSize: '13px',
    fontWeight: '600',
    margin: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    color: '#9CA3AF',
    fontSize: '11px',
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#9CA3AF',
    fontSize: '13px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
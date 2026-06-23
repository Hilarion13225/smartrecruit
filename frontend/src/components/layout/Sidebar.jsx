import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Briefcase, Settings, ShieldCheck,
  Target, LogOut, X,
} from 'lucide-react';

const css = `
  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #1F2937;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    transition: transform 0.3s ease;
  }
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 8px;
  }
  .logo-icon {
    width: 36px;
    height: 36px;
    background: #4F46E5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
  }
  .close-btn {
    display: none;
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.15s;
  }
  .close-btn:hover { color: #fff; }
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #9CA3AF;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .menu-item:hover { background: #374151; color: #fff; }
  .menu-item.active { background: #4F46E5; color: #fff; }
  .sidebar-bottom { margin-top: auto; }
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #374151;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #4F46E5;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .user-name {
    color: #F9FAFB;
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .user-role {
    color: #9CA3AF;
    font-size: 11px;
    margin: 2px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 9px 12px;
    background: transparent;
    border: 1px solid #374151;
    border-radius: 8px;
    color: #9CA3AF;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .logout-btn:hover {
    background: #374151;
    color: #fff;
    border-color: #4B5563;
  }

  /* Overlay mobile */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
  }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .close-btn { display: flex; }
    .sidebar-overlay.open { display: block; }
  }
`;

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
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard',     path: '/dashboard' },
    { icon: <Briefcase       size={18} />, label: 'Mes offres',    path: '/jobs' },
    { icon: <Settings        size={18} />, label: 'Paramètres',    path: '/settings' },
    ...(user?.role === 'admin' ? [
      { icon: <ShieldCheck   size={18} />, label: 'Administration', path: '/admin' },
    ] : []),
  ];

  return (
    <>
      <style>{css}</style>

      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Target size={20} color="#fff" />
            </div>
            <span className="logo-text">SmartRecruit</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer le menu">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`menu-item${location.pathname === item.path ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="avatar">
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="user-name">{user?.first_name} {user?.last_name}</p>
              <p className="user-role">{user?.company || 'Recruteur'}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>

      </aside>
    </>
  );
}
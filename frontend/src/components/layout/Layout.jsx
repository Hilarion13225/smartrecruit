import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const css = `
  .layout {
    display: flex;
    min-height: 100vh;
    position: relative;
  }
  .mobile-menu-btn {
    display: none;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 999;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 8px 10px;
    cursor: pointer;
    color: #1F2937;
    align-items: center;
    justify-content: center;
  }
  .layout-main {
    margin-left: 240px;
    flex: 1;
    padding: 32px;
    background: #F9FAFB;
    min-height: 100vh;
  }

  @media (max-width: 768px) {
    .mobile-menu-btn { display: flex; }
    .layout-main {
      margin-left: 0;
      padding: 16px;
      padding-top: 64px;
    }
  }
`;

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{css}</style>
      <div className="layout">

        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="layout-main">
          {children}
        </main>

      </div>
    </>
  );
}
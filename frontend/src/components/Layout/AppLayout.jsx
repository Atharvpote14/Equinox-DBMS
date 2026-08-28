import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export function AppLayout({ children }) {
  const { data } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data) return null;

  return (
    <div id="app-shell" className="app-shell" role="application">
      <Sidebar />
      <div className="workspace">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content" role="main">
          {children}
        </main>
        <footer className="app-footer glass-nav" role="contentinfo">
          <div className="footer-copy">
            <strong>Equinox DBMS</strong>
            <span>Default MySQL schema: <code>equinox_dbms</code></span>
          </div>
          <div className="footer-links">
            <button data-static-page="about">About</button>
            <button data-static-page="privacy">Privacy</button>
            <button data-static-page="terms">Terms</button>
            <button data-static-page="support">Support</button>
          </div>
        </footer>
      </div>
      {window.innerWidth <= 1024 && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
}
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';

export function Topbar({ onMenuToggle }) {
  const { activeSection, logout, data } = useAuth();

  const sectionMeta = {
    'command-center': { title: 'Command Center', subtitle: 'Payment readiness, trust signals, ledger activity, and operational visibility across the platform.' },
    'wallet-hub': { title: 'Wallet & Transfer', subtitle: 'Use wallet ID or QR flows, choose an active card reference, and monitor transfer-side audit details.' },
    'cards-payments': { title: 'Cards & Payments', subtitle: 'Issue virtual cards after verified checkout, manage freeze controls, and review the full payment order timeline.' },
    'skill-market': { title: 'Skill Market', subtitle: 'Publish services, open marketplace contracts, settle them atomically, and build trust through reviews.' },
    'social-pool': { title: 'Community Pools', subtitle: 'Create verified impact campaigns, contribute Eq, and demonstrate trigger-driven funding totals.' },
    'citizen-directory': { title: 'Citizen Directory', subtitle: 'Discover peers, inspect trust levels, and prefill secure wallet transfers in one click.' },
    'query-lab': { title: 'SQL Demonstrator', subtitle: 'Run preset joins or your own read-only queries against live MySQL data for a clean demonstration flow.' },
  };

  const meta = sectionMeta[activeSection] || sectionMeta['command-center'];

  const handleShowQr = () => {
    const event = new CustomEvent('open-qr-modal');
    window.dispatchEvent(event);
  };

  const handleScanQr = () => {
    const event = new CustomEvent('open-scan-modal');
    window.dispatchEvent(event);
  };

  return (
    <header className="topbar glass-nav" role="banner">
      <div className="topbar-left">
        <Button id="mobile-menu-toggle" variant="ghost" className="mobile-only" onClick={onMenuToggle}>
          Menu
        </Button>
        <div>
          <p className="topbar-kicker">Live MySQL + Razorpay + PHP</p>
          <h1 id="topbar-section-title">{meta.title}</h1>
          <p id="topbar-section-subtitle" className="topbar-subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <Button id="show-my-qr-top" variant="ghost" onClick={handleShowQr}>My QR</Button>
        <Button id="scan-qr-top" variant="ghost-cyan" onClick={handleScanQr}>Scan QR</Button>
        <Button id="logout-btn" variant="ghost" onClick={logout}>Sign Out</Button>
      </div>
    </header>
  );
}
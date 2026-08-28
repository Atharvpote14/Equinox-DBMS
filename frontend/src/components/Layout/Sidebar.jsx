import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';
import { formatEq, initials, trustTier } from '../../utils/helpers';

export function Sidebar() {
  const { data, activeSection, switchSection, logout } = useAuth();
  const profile = data?.profile;
  const insights = data?.insights;

  if (!profile) return null;

  const trustScore = Number(profile.trust_score || 0);

  const navItems = [
    { id: 'command-center', label: 'Command Center' },
    { id: 'wallet-hub', label: 'Wallet & Transfer' },
    { id: 'cards-payments', label: 'Cards & Payments' },
    { id: 'skill-market', label: 'Skill Market' },
    { id: 'social-pool', label: 'Community Pools' },
    { id: 'citizen-directory', label: 'Citizen Directory' },
    { id: 'query-lab', label: 'SQL Demonstrator' },
  ];

  return (
    <aside id="sidebar" className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-brand">
        <p className="eyebrow">EQUINOX</p>
        <h2>Command Center</h2>
      </div>

      <div className="glass-card profile-card">
        <div className="avatar-badge" id="profile-avatar">{initials(profile.full_name)}</div>
        <div>
          <p id="sidebar-user-name" className="profile-name">{profile.full_name || 'Citizen'}</p>
          <p id="sidebar-trust-label" className="trust-inline">Trust Level: {trustTier(trustScore)}</p>
        </div>
      </div>

      <Button id="nav-new-transfer" variant="primary" fullWidth onClick={() => switchSection('wallet-hub')}>
        New Payment
      </Button>

      <nav className="sidebar-nav" aria-label="Dashboard sections">
        {navItems.map((item) => (
          <Button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            variant="ghost"
            onClick={() => switchSection(item.id)}
            data-section-target={item.id}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="sidebar-footer-links">
        <Button variant="ghost" className="nav-item" data-static-page="about">About</Button>
        <Button variant="ghost" className="nav-item" data-static-page="support">Support</Button>
      </div>
    </aside>
  );
}
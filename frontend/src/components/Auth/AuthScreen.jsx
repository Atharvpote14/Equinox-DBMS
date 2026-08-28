import { useState } from 'react';
import { LoginForm, RegisterForm } from './AuthForms';
import { Button } from '../UI/Button';

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <section id="auth-screen" className="auth-screen" role="main">
      <div className="auth-hero">
        <div className="hero-site-nav">
          <div className="site-brand">
            <p className="eyebrow">EQUINOX</p>
            <strong>Beyond Money</strong>
          </div>
          <div className="hero-site-links">
            <Button variant="ghost" size="small" data-static-page="about">About</Button>
            <Button variant="ghost" size="small" data-static-page="privacy">Privacy</Button>
            <Button variant="ghost" size="small" data-static-page="terms">Terms</Button>
          </div>
        </div>

        <div className="hero-copy-block">
          <p className="eyebrow">Reciprocity Finance Platform</p>
          <h1>Professional-grade community payments, powered by MySQL and verified checkout flows.</h1>
          <p className="auth-copy">
            Equinox combines wallet activation, virtual card issuance, QR payments, trust scoring,
            marketplace contracts, community pools, and live SQL demonstrations in one polished web
            experience built for your DBMS project and polished like a product demo.
          </p>
        </div>

        <div className="hero-metrics">
          <article className="glass-card metric-card">
            <span>Wallet Activation</span>
            <strong>Rs. 1,500 → 500 Eq</strong>
            <small>Verified payment required before the wallet becomes active.</small>
          </article>
          <article className="glass-card metric-card">
            <span>Card Issuance</span>
            <strong>Rs. 1,500 per virtual card</strong>
            <small>Cards are created only after successful Razorpay verification.</small>
          </article>
          <article className="glass-card metric-card">
            <span>Live SQL</span>
            <strong>Joins, groups, audits, and ledger views</strong>
            <small>Use the Query Demonstrator to show real MySQL values instantly.</small>
          </article>
        </div>

        <div className="hero-feature-grid">
          <article className="glass-card feature-tile">
            <p className="eyebrow">Payments</p>
            <strong>Razorpay-backed checkout</strong>
            <p>Every paid action is tracked through payment orders, verification logs, and fulfillment records.</p>
          </article>
          <article className="glass-card feature-tile">
            <p className="eyebrow">Banking Concepts</p>
            <strong>Wallet, cards, trust, ledger</strong>
            <p>Card freeze controls, card limits, audit trails, and immutable transaction history are all built in.</p>
          </article>
          <article className="glass-card feature-tile">
            <p className="eyebrow">Demonstration Ready</p>
            <strong>Professional UX for evaluation day</strong>
            <p>Clear copy, polished interactions, and live database-backed screens make the presentation flow simpler.</p>
          </article>
        </div>
      </div>

      <div className="auth-panel glass-card">
        <div className="panel-heading">
          <h2>Citizen Access</h2>
          <p>Create your Equinox profile or sign in to enter the live command center.</p>
        </div>

        <div className="tab-switch" role="tablist">
          <Button
            role="tab"
            aria-selected={activeTab === 'register'}
            variant={activeTab === 'register' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('register')}
          >
            Register
          </Button>
          <Button
            role="tab"
            aria-selected={activeTab === 'login'}
            variant={activeTab === 'login' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('login')}
          >
            Login
          </Button>
        </div>

        {activeTab === 'register' && <RegisterForm onTabChange={setActiveTab} />}
        {activeTab === 'login' && <LoginForm onTabChange={setActiveTab} />}
      </div>
    </section>
  );
}
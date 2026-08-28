import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { 
  formatEq, formatInr, formatDate, shortId, escapeHtml, 
  trustTier, volumeLabel, reputationLabel, formatAge, 
  prettyTransactionType, initials, buildQrPayload 
} from '../../utils/helpers';

export function CommandCenter() {
  const { data, switchSection, loadDashboard } = useAuth();
  const profile = data?.profile;
  const insights = data?.insights;
  const paymentConfig = data?.payment_config;
  const transactions = data?.transactions || [];
  const notifications = data?.notifications || [];
  const trustHistory = data?.trust_history || [];
  const loginHistory = data?.login_history || [];
  const payments = data?.payments || [];

  if (!profile) return null;

  const trustScore = Number(profile.trust_score || 0);
  const trustDegrees = Math.max(10, Math.min(360, trustScore * 3.6));
  const unreadCount = notifications.filter((n) => Number(n.is_read) === 0).length;
  const checkoutEnabled = Boolean(paymentConfig?.checkout_enabled);
  const cardCount = Number(insights?.card_count || 0);
  const activationFee = paymentConfig?.wallet_activation_fee_inr || 1500;
  const cardFee = paymentConfig?.card_issuance_fee_inr || 1500;
  const successfulPayments = Number(insights?.successful_payment_count || 0);

  const [walletReadinessCopy, setWalletReadinessCopy] = useState('');
  const [walletReadinessList, setWalletReadinessList] = useState('');
  const [heroPrimaryAction, setHeroPrimaryAction] = useState({ label: '', disabled: false, onClick: null });
  const [heroSecondaryAction, setHeroSecondaryAction] = useState({ label: '', mode: 'wallet' });

  useEffect(() => {
    if (profile.status !== 'ACTIVE') {
      setWalletReadinessCopy(
        'Your wallet is currently dormant. A verified onboarding payment is required before the account becomes active and the initial 500 Eq balance is credited.'
      );
      setWalletReadinessList(`
        <ul class="bullet-note compact-list">
          <li>Activation fee: ${escapeHtml(formatInr(activationFee))}</li>
          <li>Post-payment credit: 500 Eq</li>
          <li>Checkout status: ${escapeHtml(checkoutEnabled ? 'Ready for payment' : 'Unavailable until Razorpay keys are configured')}</li>
        </ul>
      `);
      setHeroPrimaryAction({
        label: `Activate Wallet for ${formatInr(activationFee)}`,
        disabled: !checkoutEnabled,
        onClick: () => beginPaymentFlow('WALLET_ACTIVATION'),
      });
      setHeroSecondaryAction({ label: 'Review Payments', mode: 'payments' });
    } else {
      setWalletReadinessCopy(
        'Your wallet is active and ready for wallet-ID or QR-based payments. You can now issue additional virtual cards through verified payment orders.'
      );
      setWalletReadinessList(`
        <ul class="bullet-note compact-list">
          <li>Card issuance fee: ${escapeHtml(formatInr(cardFee))} per card</li>
          <li>Cards issued: ${escapeHtml(String(cardCount))} of 3 allowed</li>
          <li>Successful payment orders: ${escapeHtml(String(successfulPayments))}</li>
        </ul>
      `);
      if (!checkoutEnabled) {
        setHeroPrimaryAction({ label: 'Checkout Unavailable', disabled: true, onClick: null });
      } else if (cardCount >= 3) {
        setHeroPrimaryAction({ label: 'Card Limit Reached', disabled: true, onClick: null });
      } else {
        setHeroPrimaryAction({
          label: `Issue Card for ${formatInr(cardFee)}`,
          disabled: false,
          onClick: () => beginPaymentFlow('CARD_ISSUANCE'),
        });
      }
      setHeroSecondaryAction({ label: 'Open Wallet', mode: 'wallet' });
    }
  }, [profile.status, checkoutEnabled, cardCount, activationFee, cardFee, successfulPayments]);

  const beginPaymentFlow = async (purpose) => {
    // This will be handled by the parent component or context
    const event = new CustomEvent('begin-payment-flow', { detail: { purpose } });
    window.dispatchEvent(event);
  };

  const handleHeroSecondaryClick = () => {
    if (heroSecondaryAction.mode === 'payments') {
      switchSection('cards-payments');
    } else {
      switchSection('wallet-hub');
    }
  };

  const recentTransactions = transactions.slice(0, 6);
  const commandPaymentFeed = payments.slice(0, 4);

  return (
    <section className="section active" data-section="command-center" aria-labelledby="command-center-title">
      <h2 id="command-center-title" className="hidden">Command Center</h2>

      <div className="overview-grid">
        <article className="glass-card hero-balance-card">
          <div className="card-glow" aria-hidden="true"></div>
          <p className="eyebrow">Available Equinox Balance</p>
          <div className="balance-line">
            <span id="available-balance" className="balance-value">{formatEq(profile.balance)}</span>
            <span className="balance-unit">Eq</span>
          </div>
          <div className="wallet-meta-row">
            <span id="wallet-status-pill" className={`pill ${profile.status === 'ACTIVE' ? 'cyan' : 'muted'}`}>
              {profile.status || 'DORMANT'}
            </span>
            <span id="kyc-status-pill" className={`pill ${profile.kyc_status === 'VERIFIED' ? 'cyan' : 'muted'}`}>
              KYC {profile.kyc_status || 'PENDING'}
            </span>
            <span id="checkout-status-pill" className={`pill ${checkoutEnabled ? 'cyan' : 'muted'}`}>
              {checkoutEnabled ? 'Checkout Ready' : 'Checkout Offline'}
            </span>
          </div>
          <p id="wallet-readiness-copy" className="hero-status-copy" dangerouslySetInnerHTML={{ __html: walletReadinessCopy }} />
          <div id="wallet-readiness-list" className="bullet-note compact-list" dangerouslySetInnerHTML={{ __html: walletReadinessList }} />
          <div className="quick-action-row">
            <Button
              id="hero-primary-action"
              variant="primary"
              disabled={heroPrimaryAction.disabled}
              onClick={heroPrimaryAction.onClick}
            >
              {heroPrimaryAction.label}
            </Button>
            <Button
              id="hero-secondary-action"
              variant="ghost-cyan"
              onClick={handleHeroSecondaryClick}
            >
              {heroSecondaryAction.label}
            </Button>
            <Button id="jump-wallet-btn" variant="ghost" onClick={() => switchSection('wallet-hub')}>
              Open Wallet
            </Button>
          </div>
        </article>

        <article className="glass-card trust-card">
          <p className="eyebrow">Trust Matrix</p>
          <div id="trust-ring" className="trust-ring" style={{ background: `conic-gradient(var(--cyan) ${trustDegrees}deg, rgba(255, 255, 255, 0.08) ${trustDegrees}deg)` }}>
            <div className="trust-ring-center">
              <strong id="trust-score-value">{String(trustScore)}</strong>
              <span id="trust-score-tier">{trustTier(trustScore)}</span>
            </div>
          </div>
          <div className="trust-detail-row">
            <div>
              <span>VOL</span>
              <strong id="trust-volume-label">{volumeLabel(Number(insights?.ledger_count || 0))}</strong>
            </div>
            <div>
              <span>REP</span>
              <strong id="trust-rep-label">{reputationLabel(trustScore)}</strong>
            </div>
            <div>
              <span>AGE</span>
              <strong id="trust-age-label">{formatAge(Number(insights?.account_age_days || 0))}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="stats-grid">
        <article className="glass-card stat-card">
          <span>Total Sent</span>
          <strong id="stat-total-sent">{formatEq(insights?.total_sent_eq)} Eq</strong>
          <small>Outgoing ledger value</small>
        </article>
        <article className="glass-card stat-card">
          <span>Total Received</span>
          <strong id="stat-total-received">{formatEq(insights?.total_received_eq)} Eq</strong>
          <small>Incoming reciprocity</small>
        </article>
        <article className="glass-card stat-card">
          <span>Fiat Paid</span>
          <strong id="stat-fiat-paid">{formatInr(insights?.fiat_spent_inr)}</strong>
          <small>Verified checkout value</small>
        </article>
        <article className="glass-card stat-card">
          <span>Virtual Cards</span>
          <strong id="stat-card-count">{String(cardCount)}</strong>
          <small>Up to 3 cards per wallet</small>
        </article>
      </div>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Recent Reciprocity</h3>
            <Button variant="ghost" size="small" onClick={() => switchSection('wallet-hub')}>
              Open Wallet
            </Button>
          </div>
          <div id="recent-transactions" className="stack-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((item) => {
                const incoming = item.receiver_wallet === profile.wallet_id;
                const amountClass = incoming ? 'amount-positive' : 'amount-negative';
                const sign = incoming ? '+' : '-';
                const counterpart = incoming ? item.sender_name || 'System' : item.receiver_name || 'Citizen';
                return (
                  <div key={item.transaction_id} className="list-item">
                    <div>
                      <p className="list-title">{escapeHtml(prettyTransactionType(item.transaction_type))} • {escapeHtml(counterpart)}</p>
                      <p className="list-subtitle">{escapeHtml(item.note || 'No payment note provided')} • {formatDate(item.created_at)}</p>
                      <p className="list-meta">
                        {escapeHtml(item.status)}
                        {item.latitude ? ` • GPS ${escapeHtml(String(item.latitude))}, ${escapeHtml(String(item.longitude))}` : ''}
                      </p>
                    </div>
                    <div className={amountClass}>{sign}{formatEq(item.amount)} Eq</div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No transaction activity yet. Activate the wallet or send Eq to begin building the ledger.</div>
            )}
          </div>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Payment Operations</h3>
            <span id="payment-count-pill" className="pill cyan">{payments.length} {payments.length === 1 ? 'Order' : 'Orders'}</span>
          </div>
          <div id="command-payment-feed" className="stack-list">
            {commandPaymentFeed.length > 0 ? (
              commandPaymentFeed.map((payment) => (
                <div key={payment.payment_order_id} className="list-item">
                  <div>
                    <p className="list-title">
                      {escapeHtml(payment.title || paymentPurposeLabel(payment.payment_purpose))}
                      {payment.metadata?.card_name ? ` • ${escapeHtml(payment.metadata.card_name)}` : ''}
                    </p>
                    <p className="list-subtitle">
                      {escapeHtml(prettyPaymentStatus(payment.payment_status))} •
                      {escapeHtml(prettyFulfillmentStatus(payment.fulfillment_status))} •
                      {escapeHtml(payment.gateway_status ? `Gateway ${payment.gateway_status}` : 'Gateway pending')}
                    </p>
                    <p className="list-meta">
                      {escapeHtml(payment.receipt || 'No receipt')} • {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div className="list-meta payment-amount-block">
                    <strong>{escapeHtml(formatInr(payment.amount_inr))}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No payment orders yet. Wallet activation and card issuance will appear here.</div>
            )}
          </div>
        </article>
      </div>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Notifications</h3>
            <span id="notification-count-pill" className="pill cyan">{unreadCount} Unread</span>
          </div>
          <div id="notification-feed" className="stack-list">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div key={item.notif_id} className="list-item">
                  <div>
                    <p className="list-title">{escapeHtml(item.title)}</p>
                    <p className="list-subtitle">{escapeHtml(item.body)}</p>
                  </div>
                  <div className="list-meta">{formatDate(item.created_at)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No notifications have been generated yet.</div>
            )}
          </div>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Security Activity</h3>
            <span className="section-note">Recent login records and audit-friendly access history</span>
          </div>
          <div id="security-feed" className="stack-list compact">
            {loginHistory.length > 0 ? (
              loginHistory.map((item) => (
                <div key={item.log_id} className="list-item">
                  <div>
                    <p className="list-title">{escapeHtml(shortId(item.device_fingerprint || 'Unknown device'))}</p>
                    <p className="list-subtitle">{escapeHtml(item.ip_address || 'Localhost')} • {escapeHtml(item.login_status)}</p>
                  </div>
                  <div className="list-meta">{formatDate(item.created_at)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">Recent sign-in activity will appear here after authentication events.</div>
            )}
          </div>
        </article>
      </div>

      <article className="glass-card">
        <div className="section-heading">
          <h3>Trust Activity</h3>
          <span className="section-note">Review submissions and contract completions feed the trust engine.</span>
        </div>
        <div id="trust-feed" className="stack-list compact">
          {trustHistory.length > 0 ? (
            trustHistory.map((item) => (
              <div key={item.log_id} className="list-item">
                <div>
                  <p className="list-title">{escapeHtml(item.reason)}</p>
                  <p className="list-subtitle">{formatDate(item.created_at)}</p>
                </div>
                <div className={Number(item.score_delta) >= 0 ? 'amount-positive' : 'amount-negative'}>
                  {Number(item.score_delta) >= 0 ? '+' : ''}{escapeHtml(String(item.score_delta))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Reviews and completed contract activity will generate trust updates here.</div>
          )}
        </div>
      </article>
    </section>
  );
}

function paymentPurposeLabel(purpose) {
  const map = {
    WALLET_ACTIVATION: 'Wallet Activation',
    CARD_ISSUANCE: 'Card Issuance',
  };
  return map[purpose] || purpose;
}

function prettyPaymentStatus(status) {
  const map = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    EXPIRED: 'Expired',
  };
  return map[status] || status;
}

function prettyFulfillmentStatus(status) {
  const map = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return map[status] || status;
}
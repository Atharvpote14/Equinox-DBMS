import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Form } from '../UI/Form';
import { formatEq, formatInr, formatDate, escapeHtml, shortId } from '../../utils/helpers';

export function CardsPayments() {
  const { data, switchSection } = useAuth();
  const profile = data?.profile;
  const cards = data?.cards || [];
  const payments = data?.payments || [];
  const insights = data?.insights;

  if (!profile) return null;

  const [cardName, setCardName] = useState('');

  const handleCardOrder = () => {
    const event = new CustomEvent('begin-payment-flow', {
      detail: { purpose: 'CARD_ISSUANCE', card_name: cardName || 'Primary' },
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="section" data-section="cards-payments" aria-labelledby="cards-payments-title">
      <h2 id="cards-payments-title" className="hidden">Cards & Payments</h2>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Issue Virtual Card</h3>
            <span className="section-note">Each card requires a verified Rs. 1,500 Razorpay payment.</span>
          </div>
          <Form onSubmit={handleCardOrder} className="stack-form" id="card-order-form">
            <Input
              label="Card label"
              name="card_name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Primary, Work, Savings"
              maxLength={30}
            />
            <Button type="button" variant="primary" fullWidth onClick={handleCardOrder}>
              Continue to Razorpay
            </Button>
          </Form>
          <p id="card-program-note" className="hint-text">
            Card issuance remains unavailable until the wallet is active. The MySQL trigger still enforces the three-card limit.
          </p>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Identity & Wallet Summary</h3>
            <span className="section-note">Live citizen information from the current database session.</span>
          </div>
          <div className="kyc-grid">
            <div className="detail-block">
              <span>Name</span>
              <strong id="kyc-name">{escapeHtml(profile.full_name || '-')}</strong>
            </div>
            <div className="detail-block">
              <span>Email</span>
              <strong id="kyc-email">{escapeHtml(profile.email || '-')}</strong>
            </div>
            <div className="detail-block">
              <span>Phone</span>
              <strong id="kyc-phone">{escapeHtml(profile.phone_number || 'Not provided')}</strong>
            </div>
            <div className="detail-block">
              <span>City</span>
              <strong id="kyc-city">{escapeHtml(profile.location_city || 'Not provided')}</strong>
            </div>
            <div className="detail-block">
              <span>KYC Status</span>
              <strong id="kyc-status-text">{escapeHtml(profile.kyc_status || 'PENDING')}</strong>
            </div>
            <div className="detail-block">
              <span>Wallet Status</span>
              <strong id="kyc-wallet-status">{escapeHtml(profile.status || 'DORMANT')}</strong>
            </div>
          </div>
        </article>
      </div>

      <article className="glass-card top-space">
        <div className="section-heading">
          <h3>Virtual Card Control Panel</h3>
          <span className="section-note">Freeze and unfreeze cards instantly after issuance.</span>
        </div>
        <div id="cards-grid" className="cards-grid">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div key={card.card_id} className={`bank-card ${card.is_frozen ? 'frozen' : ''}`}>
                <div className="data-card-header">
                  <div>
                    <div className="bank-card-label">{escapeHtml(card.brand)} • {escapeHtml(card.card_name)}</div>
                    <div className="bank-card-number">{escapeHtml(card.masked_card_number)}</div>
                  </div>
                  <span className={`pill ${card.is_frozen ? 'muted' : 'cyan'}`}>
                    {card.is_frozen ? 'Frozen' : 'Active'}
                  </span>
                </div>
                <div className="bank-card-meta">
                  <span>Expiry {escapeHtml(card.expiry_date)}</span>
                  <span>{formatDate(card.created_at)}</span>
                </div>
                <div className="top-space">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      const event = new CustomEvent('toggle-card-freeze', {
                        detail: { card_id: card.card_id },
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    {card.is_frozen ? 'Unfreeze Card' : 'Freeze Card'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No virtual cards issued yet. Complete a verified card payment to create one.</div>
          )}
        </div>
      </article>

      <article className="glass-card top-space">
        <div className="section-heading">
          <h3>Payment History</h3>
          <span className="section-note">Razorpay orders, verification status, and fulfillment progress.</span>
        </div>
        <div id="payments-history" className="stack-list">
          {payments.length > 0 ? (
            payments.map((payment) => (
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
            <div className="empty-state">Payment history will populate after a wallet activation or card issuance checkout flow.</div>
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
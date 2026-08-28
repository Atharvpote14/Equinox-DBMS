import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Form, FormRow } from '../UI/Form';
import { formatEq, formatInr, formatDate, shortId, escapeHtml, buildQrPayload, parseQrPayload } from '../../utils/helpers';

export function WalletHub() {
  const { data, switchSection } = useAuth();
  const profile = data?.profile;
  const cards = data?.cards || [];
  const transactions = data?.transactions || [];

  if (!profile) return null;

  const [receiverWallet, setReceiverWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [cardId, setCardId] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiAmount, setUpiAmount] = useState('');

  const activeCards = cards.filter((c) => !c.is_frozen);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    // Payment flow will be handled by parent
    const event = new CustomEvent('wallet-transfer', {
      detail: {
        receiver_wallet: receiverWallet,
        amount: Number(amount),
        note,
        card_id: cardId || undefined,
      },
    });
    window.dispatchEvent(event);
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    const event = new CustomEvent('upi-payment', {
      detail: {
        upi_id: upiId,
        upi_amount: Number(upiAmount),
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="section" data-section="wallet-hub" aria-labelledby="wallet-hub-title">
      <h2 id="wallet-hub-title" className="hidden">Wallet & Transfer</h2>

      <div className="dual-grid">
        <article className="glass-card wallet-identity-card">
          <div className="section-heading">
            <h3>Wallet Identity</h3>
            <Button variant="ghost" size="small" onClick={() => copyToClipboard(profile.wallet_id)}>
              Copy Wallet ID
            </Button>
          </div>
          <p className="muted-label">Full wallet ID</p>
          <p id="wallet-id-full" className="mono-block">{profile.wallet_id || '-'}</p>
          <p className="muted-label">QR payload</p>
          <p id="wallet-qr-payload" className="payload-preview">{buildQrPayload(profile)}</p>
          <div className="quick-action-row top-space">
            <Button variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('open-qr-modal'))}>
              Generate QR
            </Button>
            <Button variant="ghost-cyan" onClick={() => window.dispatchEvent(new CustomEvent('open-scan-modal'))}>
              Scan & Pay
            </Button>
          </div>

          <div className="divider top-space bottom-space" />

          <div className="section-heading">
            <h3>Pay by UPI ID</h3>
            <span className="section-note">Alternative payment method</span>
          </div>
          <Form onSubmit={handleUpiSubmit} className="stack-form" id="upi-payment-form">
            <Input
              label="UPI ID"
              name="upi_id"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              required
            />
            <Input
              label="Amount (Rs.)"
              type="number"
              name="upi_amount"
              value={upiAmount}
              onChange={(e) => setUpiAmount(e.target.value)}
              placeholder="1500"
              min="1"
              step="0.01"
              required
            />
            <Button type="submit" variant="ghost-cyan" fullWidth>
              Send via UPI
            </Button>
          </Form>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Send Eq Payment</h3>
            <span className="section-note">Transfer by wallet ID, QR scan, or citizen directory selection.</span>
          </div>
          <Form onSubmit={handleTransferSubmit} className="stack-form" id="payment-form">
            <Input
              label="Receiver wallet UUID"
              name="receiver_wallet"
              value={receiverWallet}
              onChange={(e) => setReceiverWallet(e.target.value)}
              placeholder="Paste or scan the receiver wallet ID"
              required
            />
            <FormRow>
              <Input
                label="Amount"
                type="number"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20"
                min="1"
                step="0.01"
                required
              />
              <label>
                <span>Card to use</span>
                <select
                  id="payment-card-select"
                  name="card_id"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="stack-form"
                  style={{ width: '100%' }}
                >
                  <option value="">Use wallet directly</option>
                  {activeCards.map((card) => (
                    <option key={card.card_id} value={card.card_id}>
                      {escapeHtml(card.card_name)} • {escapeHtml(card.masked_card_number)}
                    </option>
                  ))}
                </select>
              </label>
            </FormRow>
            <Input
              label="Payment note / reference"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Python tutoring, contribution share, scanned reference"
            />
            <Button type="submit" variant="primary" fullWidth>
              Confirm Transfer
            </Button>
          </Form>
        </article>
      </div>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Card Preview</h3>
            <span className="section-note">Only active cards can be selected for a transfer reference.</span>
          </div>
          <div id="wallet-card-preview" className="cards-strip">
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
                </div>
              ))
            ) : (
              <div className="empty-state">No virtual cards issued yet. Complete a verified card payment to create one.</div>
            )}
          </div>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Recent Transaction Audit</h3>
            <span className="section-note">Inspect timestamps, transaction types, and recorded references.</span>
          </div>
          <div id="wallet-transaction-audit" className="stack-list compact">
            {transactions.slice(0, 10).length > 0 ? (
              transactions.slice(0, 10).map((item) => (
                <div key={item.transaction_id} className="list-item">
                  <div>
                    <p className="list-title">{escapeHtml(shortId(item.transaction_id))}</p>
                    <p className="list-subtitle">
                      {escapeHtml(prettyTransactionType(item.transaction_type))} • {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="list-meta">{escapeHtml(item.status)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">Transaction audit entries will appear here as soon as the wallet begins receiving activity.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function prettyTransactionType(type) {
  const map = {
    WALLET_ACTIVATION: 'Wallet Activation',
    CARD_ISSUANCE: 'Card Issuance',
    TRANSFER_SENT: 'Transfer Sent',
    TRANSFER_RECEIVED: 'Transfer Received',
    POOL_CONTRIBUTION: 'Pool Contribution',
    CONTRACT_SETTLEMENT: 'Contract Settlement',
    REFUND: 'Refund',
  };
  return map[type] || type;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const event = new CustomEvent('show-toast', {
      detail: { title: 'Copied', message: 'Wallet ID copied to clipboard', type: 'success' },
    });
    window.dispatchEvent(event);
  });
}
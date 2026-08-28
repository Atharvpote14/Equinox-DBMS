export function formatEq(value) {
  return Number(value || 0).toFixed(2);
}

export function formatInr(value) {
  return `Rs. ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortId(uuid) {
  if (!uuid) return '-';
  return uuid.slice(0, 8) + '...' + uuid.slice(-4);
}

export function initials(name) {
  if (!name) return 'EC';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function trustTier(score) {
  const s = Number(score || 0);
  if (s >= 80) return 'Trusted';
  if (s >= 60) return 'Reliable';
  if (s >= 40) return 'Neutral';
  if (s >= 20) return 'Caution';
  return 'Risk';
}

export function volumeLabel(count) {
  const n = Number(count || 0);
  if (n >= 50) return 'High';
  if (n >= 20) return 'Moderate';
  if (n >= 5) return 'Building';
  return 'New';
}

export function reputationLabel(score) {
  const s = Number(score || 0);
  if (s >= 70) return 'Strong';
  if (s >= 40) return 'Stable';
  return 'Forming';
}

export function formatAge(days) {
  const d = Number(days || 0);
  if (d >= 365) return `${Math.floor(d / 365)} Year${Math.floor(d / 365) > 1 ? 's' : ''}`;
  if (d >= 30) return `${Math.floor(d / 30)} Month${Math.floor(d / 30) > 1 ? 's' : ''}`;
  return `${d} Day${d !== 1 ? 's' : ''}`;
}

export function prettyTransactionType(type) {
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

export function prettyPaymentStatus(status) {
  const map = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    EXPIRED: 'Expired',
  };
  return map[status] || status;
}

export function prettyFulfillmentStatus(status) {
  const map = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return map[status] || status;
}

export function paymentPurposeLabel(purpose) {
  const map = {
    WALLET_ACTIVATION: 'Wallet Activation',
    CARD_ISSUANCE: 'Card Issuance',
  };
  return map[purpose] || purpose;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

export function normalizeCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function isUuid(str) {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function buildQrPayload(profile) {
  return JSON.stringify({
    wallet_id: profile.wallet_id,
    display_name: profile.full_name,
    type: 'EQUINOX_WALLET',
    version: '1.0',
  });
}

export function parseQrPayload(decodedText) {
  const text = String(decodedText || '').trim();
  if (!text) return null;

  try {
    const data = JSON.parse(text);
    if (data.type === 'EQUINOX_WALLET' && isUuid(data.wallet_id)) {
      return {
        walletId: data.wallet_id,
        displayName: data.display_name || '',
      };
    }
  } catch (_) {}

  if (/^upi:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      return {
        upiReference: url.searchParams.get('pa') || url.searchParams.get('pn') || 'UPI QR',
      };
    } catch (_) {}
  }

  if (isUuid(text)) {
    return { walletId: text, displayName: '' };
  }

  return null;
}

export async function getCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve({ latitude: null, longitude: null }),
      { timeout: 5000 }
    );
  });
}
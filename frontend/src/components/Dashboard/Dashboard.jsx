import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { CommandCenter } from './CommandCenter';
import { WalletHub } from './WalletHub';
import { CardsPayments } from './CardsPayments';
import { SkillMarket } from './SkillMarket';
import { SocialPool } from './SocialPool';
import { CitizenDirectory } from './CitizenDirectory';
import { QueryLab } from './QueryLab';
import { api, walletApi, paymentApi, cardApi, poolApi, skillApi, contractApi, reviewApi, queryApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export function Dashboard() {
  const { data, activeSection, switchSection, loadDashboard, setPaymentLocked } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleBeginPaymentFlow = async (e) => {
      const { purpose, ...extra } = e.detail;
      const profile = data?.profile;
      const insights = data?.insights || {};
      const paymentConfig = data?.payment_config || {};

      if (!profile) {
        showToast('Session unavailable', 'Sign in again to continue with payments.', 'error');
        return;
      }

      if (setPaymentLocked) setPaymentLocked(true);

      if (!paymentConfig.checkout_enabled) {
        showToast('Checkout unavailable', 'Razorpay credentials are missing or the checkout script is not ready.', 'error');
        if (setPaymentLocked) setPaymentLocked(false);
        return;
      }

      if (purpose === 'WALLET_ACTIVATION' && profile.status === 'ACTIVE') {
        showToast('Wallet already active', 'This wallet has already completed the onboarding payment.', 'warning');
        if (setPaymentLocked) setPaymentLocked(false);
        return;
      }

      if (purpose === 'CARD_ISSUANCE') {
        if (profile.status !== 'ACTIVE') {
          showToast('Wallet activation required', 'Activate the wallet before requesting a virtual card.', 'error');
          if (setPaymentLocked) setPaymentLocked(false);
          return;
        }
        if (Number(insights.card_count || 0) >= 3) {
          showToast('Card limit reached', 'This wallet has already reached the three-card limit.', 'warning');
          if (setPaymentLocked) setPaymentLocked(false);
          return;
        }
      }

      try {
        const coords = await getCoords();
        const response = await paymentApi.createOrder({ purpose, ...extra, ...coords });

        if (!response.success) {
          if (setPaymentLocked) setPaymentLocked(false);
          showToast('Order creation failed', response.error || 'The payment order could not be created.', 'error');
          return;
        }

        if (typeof window.Razorpay === 'undefined') {
          if (setPaymentLocked) setPaymentLocked(false);
          showToast('Checkout library unavailable', 'Razorpay Checkout did not load in the browser. Check connectivity and try again.', 'error');
          return;
        }

        const orderId = response.payment_order?.payment_order_id;
        const options = {
          ...response.checkout,
          modal: {
            ondismiss: () => {
              if (setPaymentLocked) setPaymentLocked(false);
              showToast('Checkout closed', 'The payment window was closed before verification was completed.', 'warning');
            },
          },
          handler: async (gatewayResponse) => {
            await verifyCompletedPayment(orderId, gatewayResponse, coords, purpose);
          },
        };

        const checkout = new window.Razorpay(options);
        checkout.on('payment.failed', async (failure) => {
          if (setPaymentLocked) setPaymentLocked(false);
          const failureMessage =
            failure?.error?.description ||
            failure?.error?.reason ||
            'Razorpay did not complete the payment successfully.';
          showToast('Payment failed', failureMessage, 'error');
          await loadDashboard({ silent: true });
        });

        checkout.open();
      } catch (error) {
        if (setPaymentLocked) setPaymentLocked(false);
        showToast('Payment error', error.message, 'error');
      }
    };

    const handleWalletTransfer = async (e) => {
      const { receiver_wallet, amount, note, card_id } = e.detail;
      try {
        const response = await walletApi.transfer({
          receiver_wallet,
          amount,
          note,
          card_id,
          ...(await getCoords()),
        });

        if (!response.success) {
          showToast('Transfer failed', response.error || 'The payment could not be completed.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Transfer completed', response.message || 'The Eq transfer was committed successfully.', 'success');
      } catch (error) {
        showToast('Transfer failed', error.message, 'error');
      }
    };

    const handleUpiPayment = async (e) => {
      const { upi_id, upi_amount } = e.detail;
      try {
        const response = await paymentApi.upi({ upi_id, upi_amount });

        if (!response.success) {
          showToast('UPI Payment failed', response.error || 'The UPI payment could not be processed.', 'error');
          return;
        }

        showToast('UPI Payment initiated', response.message || 'Payment request sent. Confirm in your UPI app.', 'success');
        await loadDashboard({ silent: true });
      } catch (error) {
        showToast('UPI Payment failed', error.message, 'error');
      }
    };

    const handleToggleCardFreeze = async (e) => {
      const { card_id } = e.detail;
      try {
        const response = await cardApi.freeze({ card_id });

        showToast(
          response.success ? 'Card updated' : 'Card update failed',
          response.success ? response.message || 'The card state changed successfully.' : response.error || 'The card state could not be updated.',
          response.success ? 'success' : 'error'
        );

        if (response.success) {
          await loadDashboard({ silent: true });
        }
      } catch (error) {
        showToast('Card update failed', error.message, 'error');
      }
    };

    const handleCreateSkill = async (e) => {
      const { skill_name, description, rate_per_hour } = e.detail;
      try {
        const response = await skillApi.create({ skill_name, description, rate_per_hour });

        if (!response.success) {
          showToast('Listing failed', response.error || 'The skill listing could not be published.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Listing published', response.message || 'Your marketplace listing is now live.', 'success');
      } catch (error) {
        showToast('Listing failed', error.message, 'error');
      }
    };

    const handleCreatePool = async (e) => {
      const { title, description, target_amount, deadline } = e.detail;
      try {
        const response = await poolApi.create({ title, description, target_amount, deadline });

        if (!response.success) {
          showToast('Pool creation failed', response.error || 'The community pool could not be created.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Pool created', response.message || 'Your community pool is now available for contributions.', 'success');
      } catch (error) {
        showToast('Pool creation failed', error.message, 'error');
      }
    };

    const handleContributePool = async (e) => {
      const { pool_id, amount } = e.detail;
      try {
        const response = await poolApi.contribute({ pool_id, amount });

        if (!response.success) {
          showToast('Contribution failed', response.error || 'The pool contribution could not be processed.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Contribution completed', response.message || 'The pool has been updated successfully.', 'success');
      } catch (error) {
        showToast('Contribution failed', error.message, 'error');
      }
    };

    const handleCreateContract = async (e) => {
      const { skill_id, hours } = e.detail;
      try {
        const response = await contractApi.create({ skill_id, hours });

        if (!response.success) {
          showToast('Contract creation failed', response.error || 'The service contract could not be opened.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Contract created', response.message || 'The contract is now available for settlement.', 'success');
      } catch (error) {
        showToast('Contract creation failed', error.message, 'error');
      }
    };

    const handleSettleContract = async (e) => {
      const { contract_id } = e.detail;
      try {
        const response = await contractApi.settle({ contract_id });

        showToast(
          response.success ? 'Contract settled' : 'Settlement failed',
          response.success ? response.message || 'The contract settlement completed successfully.' : response.error || 'The contract could not be settled.',
          response.success ? 'success' : 'error'
        );

        if (response.success) {
          await loadDashboard({ silent: true });
        }
      } catch (error) {
        showToast('Settlement failed', error.message, 'error');
      }
    };

    const handleCreateReview = async (e) => {
      const { contract_id, subject_id, rating, comment } = e.detail;
      try {
        const response = await reviewApi.create({ contract_id, subject_id, rating, comment });

        if (!response.success) {
          showToast('Review submission failed', response.error || 'The review could not be saved.', 'error');
          return;
        }

        await loadDashboard({ silent: true });
        showToast('Review submitted', response.message || 'Trust-related records have been updated.', 'success');
      } catch (error) {
        showToast('Review submission failed', error.message, 'error');
      }
    };

    const handleRunPresetQuery = async (e) => {
      const { preset } = e.detail;
      try {
        const response = await queryApi.run({ preset });

        if (!response.success) {
          showToast('Query failed', response.error || 'The SQL statement could not be executed.', 'error');
          return;
        }

        // Update QueryLab state
        const event = new CustomEvent('query-result', { detail: response });
        window.dispatchEvent(event);
        switchSection('query-lab');
        showToast('Query executed', 'Live MySQL results have been loaded into the demonstrator.', 'success');
      } catch (error) {
        showToast('Query failed', error.message, 'error');
      }
    };

    const handleRunCustomQuery = async (e) => {
      const { sql } = e.detail;
      try {
        const response = await queryApi.run({ sql });

        if (!response.success) {
          showToast('Query failed', response.error || 'The SQL statement could not be executed.', 'error');
          return;
        }

        const event = new CustomEvent('query-result', { detail: response });
        window.dispatchEvent(event);
        switchSection('query-lab');
        showToast('Query executed', 'Live MySQL results have been loaded into the demonstrator.', 'success');
      } catch (error) {
        showToast('Query failed', error.message, 'error');
      }
    };

    const handlePrefillTransfer = (e) => {
      const { wallet_id, name } = e.detail;
      switchSection('wallet-hub');
      const event = new CustomEvent('prefill-transfer-form', { detail: { wallet_id, name } });
      window.dispatchEvent(event);
      showToast('Transfer form updated', 'Receiver details were loaded from the citizen directory.', 'success');
    };

    const handleProcessScan = (e) => {
      const { payload } = e.detail;
      // Process scanned payload - this would need QR parsing logic
      const parsed = parseQrPayload(payload);
      if (!parsed) {
        showToast('Unsupported QR payload', 'Use an Equinox wallet QR, a UPI QR, or a raw wallet UUID.', 'error');
        return;
      }

      if (parsed.walletId) {
        handlePrefillTransfer({ detail: { wallet_id: parsed.walletId, name: parsed.displayName || '' } });
        showToast('Wallet captured', 'The receiver wallet was loaded from the scanned QR.', 'success');
      }
    };

    window.addEventListener('begin-payment-flow', handleBeginPaymentFlow);
    window.addEventListener('wallet-transfer', handleWalletTransfer);
    window.addEventListener('upi-payment', handleUpiPayment);
    window.addEventListener('toggle-card-freeze', handleToggleCardFreeze);
    window.addEventListener('create-skill', handleCreateSkill);
    window.addEventListener('create-pool', handleCreatePool);
    window.addEventListener('contribute-pool', handleContributePool);
    window.addEventListener('create-contract', handleCreateContract);
    window.addEventListener('settle-contract', handleSettleContract);
    window.addEventListener('create-review', handleCreateReview);
    window.addEventListener('run-preset-query', handleRunPresetQuery);
    window.addEventListener('run-custom-query', handleRunCustomQuery);
    window.addEventListener('prefill-transfer', handlePrefillTransfer);
    window.addEventListener('process-scan', handleProcessScan);

    return () => {
      window.removeEventListener('begin-payment-flow', handleBeginPaymentFlow);
      window.removeEventListener('wallet-transfer', handleWalletTransfer);
      window.removeEventListener('upi-payment', handleUpiPayment);
      window.removeEventListener('toggle-card-freeze', handleToggleCardFreeze);
      window.removeEventListener('create-skill', handleCreateSkill);
      window.removeEventListener('create-pool', handleCreatePool);
      window.removeEventListener('contribute-pool', handleContributePool);
      window.removeEventListener('create-contract', handleCreateContract);
      window.removeEventListener('settle-contract', handleSettleContract);
      window.removeEventListener('create-review', handleCreateReview);
      window.removeEventListener('run-preset-query', handleRunPresetQuery);
      window.removeEventListener('run-custom-query', handleRunCustomQuery);
      window.removeEventListener('prefill-transfer', handlePrefillTransfer);
      window.removeEventListener('process-scan', handleProcessScan);
    };
  }, [data, loadDashboard, setPaymentLocked, switchSection, showToast]);

  // Render the active section
  const renderSection = () => {
    switch (activeSection) {
      case 'command-center':
        return <CommandCenter />;
      case 'wallet-hub':
        return <WalletHub />;
      case 'cards-payments':
        return <CardsPayments />;
      case 'skill-market':
        return <SkillMarket />;
      case 'social-pool':
        return <SocialPool />;
      case 'citizen-directory':
        return <CitizenDirectory />;
      case 'query-lab':
        return <QueryLab />;
      default:
        return <CommandCenter />;
    }
  };

  return <>{renderSection()}</>;
}

async function getCoords() {
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

function parseQrPayload(decodedText) {
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

function isUuid(str) {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

async function verifyCompletedPayment(paymentOrderId, gatewayResponse, coords, purpose) {
  // This would call the verify API and handle the response
  // For now, just reload dashboard
  await loadDashboard({ silent: true });
}
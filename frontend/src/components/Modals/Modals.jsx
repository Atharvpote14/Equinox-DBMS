import { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Form } from '../UI/Form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatEq, escapeHtml, buildQrPayload } from '../../utils/helpers';

export function Modals() {
  const { data } = useAuth();
  const { showToast } = useToast();
  const profile = data?.profile;

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageModalContent, setPageModalContent] = useState({ title: '', body: '' });
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractModalData, setContractModalData] = useState({ skillId: '', skillName: '', rate: 0 });
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [contributeModalData, setContributeModalData] = useState({ poolId: '', poolTitle: '' });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState({ contractId: '', subjectId: '', subjectName: '' });
  const [issuedCardModalOpen, setIssuedCardModalOpen] = useState(false);
  const [issuedCardData, setIssuedCardData] = useState({});
  const [manualPayload, setManualPayload] = useState('');

  useEffect(() => {
    const handleQrOpen = () => setQrModalOpen(true);
    const handleScanOpen = () => setScanModalOpen(true);
    const handlePageOpen = (e) => {
      setPageModalContent(e.detail);
      setPageModalOpen(true);
    };
    const handleContractOpen = (e) => {
      setContractModalData(e.detail);
      setContractModalOpen(true);
    };
    const handleContributeOpen = (e) => {
      setContributeModalData(e.detail);
      setContributeModalOpen(true);
    };
    const handleReviewOpen = (e) => {
      setReviewModalData(e.detail);
      setReviewModalOpen(true);
    };
    const handleIssuedCardOpen = (e) => {
      setIssuedCardData(e.detail);
      setIssuedCardModalOpen(true);
    };

    window.addEventListener('open-qr-modal', handleQrOpen);
    window.addEventListener('open-scan-modal', handleScanOpen);
    window.addEventListener('open-page-modal', handlePageOpen);
    window.addEventListener('open-contract-modal', handleContractOpen);
    window.addEventListener('open-contribute-modal', handleContributeOpen);
    window.addEventListener('open-review-modal', handleReviewOpen);
    window.addEventListener('open-issued-card-modal', handleIssuedCardOpen);

    return () => {
      window.removeEventListener('open-qr-modal', handleQrOpen);
      window.removeEventListener('open-scan-modal', handleScanOpen);
      window.removeEventListener('open-page-modal', handlePageOpen);
      window.removeEventListener('open-contract-modal', handleContractOpen);
      window.removeEventListener('open-contribute-modal', handleContributeOpen);
      window.removeEventListener('open-review-modal', handleReviewOpen);
      window.removeEventListener('open-issued-card-modal', handleIssuedCardOpen);
    };
  }, []);

  const staticPages = {
    about: {
      title: 'About Equinox',
      body: `
        <h4>Beyond Money</h4>
        <p>Equinox is a reciprocity finance platform where community contribution is tracked as Equinox Credits (Eq) inside a MySQL-backed payment and trust ecosystem.</p>
        <p>This build combines wallet activation, virtual card issuance, QR-based transfers, community funding, service contracts, trust scoring, and live SQL views inside one professional interface.</p>
        <p>The aim is to help your DBMS project feel product-grade while still keeping the data model, procedures, joins, and operational flows easy to explain during demonstration.</p>
      `,
    },
    privacy: {
      title: 'Privacy Policy',
      body: `
        <h4>Local Project Privacy Scope</h4>
        <p>This project stores profile, wallet, card, contract, transaction, payment order, review, and login audit data within the local MySQL schema <code>equinox_dbms</code>.</p>
        <p>Card CVV values are hashed before storage. Only the one-time issuance response reveals the generated CVV in the user interface.</p>
        <p>Location and device details are retained strictly for demonstration of audit, fraud-awareness, and database logging concepts inside the local evaluation environment.</p>
      `,
    },
    terms: {
      title: 'Terms of Use',
      body: `
        <h4>Demo Usage Terms</h4>
        <p>Equinox is an academic product demonstration. Eq is a project currency and not legal tender.</p>
        <p>Wallet activation and card issuance require verified payment success in the application flow, while the ledger, cards, notifications, and trust records remain backed by real MySQL tables and procedures.</p>
        <p>The SQL Demonstrator is limited to safe read-only statements so the database state stays intact during project presentations.</p>
      `,
    },
    support: {
      title: 'Support',
      body: `
        <h4>Environment Checks</h4>
        <p>If a payment or dashboard flow is not responding, confirm that MySQL is running, the schema has been imported successfully, and your <code>.env</code> file contains the correct database password and Razorpay test credentials.</p>
        <p>If Razorpay checkout does not open, check internet connectivity in the browser and verify that the Razorpay test key and secret are set in the backend environment.</p>
        <p>For a reliable live demo: register two citizens, activate one wallet, issue a card, send a QR payment, and then validate the database state using the SQL Demonstrator presets.</p>
      `,
    },
  };

  const handleStaticPage = (pageId) => {
    const page = staticPages[pageId] || staticPages.about;
    setPageModalContent(page);
    setPageModalOpen(true);
  };

  const handleContractSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const event = new CustomEvent('create-contract', {
      detail: {
        skill_id: formData.get('skill_id'),
        hours: Number(formData.get('hours')),
      },
    });
    window.dispatchEvent(event);
    setContractModalOpen(false);
  };

  const handleContributeSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const event = new CustomEvent('contribute-pool', {
      detail: {
        pool_id: formData.get('pool_id'),
        amount: Number(formData.get('amount')),
      },
    });
    window.dispatchEvent(event);
    setContributeModalOpen(false);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const event = new CustomEvent('create-review', {
      detail: {
        contract_id: formData.get('contract_id'),
        subject_id: formData.get('subject_id'),
        rating: Number(formData.get('rating')),
        comment: formData.get('comment'),
      },
    });
    window.dispatchEvent(event);
    setReviewModalOpen(false);
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    const event = new CustomEvent('process-scan', { detail: { payload: manualPayload } });
    window.dispatchEvent(event);
    setManualPayload('');
  };

  const qrPayload = profile ? buildQrPayload(profile) : '';

  return (
    <>
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="My Dynamic Wallet QR"
        subtitle="Scan this code to load the receiver wallet during a payment."
      >
        <div id="qr-render" className="qr-render" />
        <p id="qr-wallet-label" className="payload-preview">{qrPayload}</p>
        <Button variant="ghost-cyan" fullWidth onClick={() => navigator.clipboard.writeText(qrPayload)}>
          Copy QR Payload
        </Button>
      </Modal>

      <Modal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        title="Scan QR for Payment"
        subtitle="Camera scanning and manual payload entry are both available."
      >
        <div id="qr-scanner" className="scanner-shell" />
        <Form onSubmit={handleManualScan} className="stack-form top-space" id="manual-scan-form">
          <Input
            label="Manual QR text / wallet ID"
            name="manual_payload"
            value={manualPayload}
            onChange={(e) => setManualPayload(e.target.value)}
            placeholder='{"wallet_id":"..."} or raw UUID'
          />
          <Button type="submit" variant="ghost-cyan" fullWidth>
            Use Manual Payload
          </Button>
        </Form>
      </Modal>

      <Modal
        isOpen={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        title={pageModalContent.title}
        subtitle="Professional product information and support details."
        size="large"
      >
        <div className="page-content" dangerouslySetInnerHTML={{ __html: pageModalContent.body }} />
      </Modal>

      <Modal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        title="Create Service Contract"
        subtitle={`${contractModalData.skillName} • ${formatEq(contractModalData.rate)} Eq per hour`}
      >
        <Form onSubmit={handleContractSubmit} className="stack-form" id="contract-form">
          <input type="hidden" name="skill_id" value={contractModalData.skillId} />
          <Input
            label="Hours required"
            type="number"
            name="hours"
            defaultValue={1}
            min={1}
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Create Contract
          </Button>
        </Form>
      </Modal>

      <Modal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        title="Contribute to Pool"
        subtitle={`Pool: ${contributeModalData.poolTitle}`}
      >
        <Form onSubmit={handleContributeSubmit} className="stack-form" id="contribute-form">
          <input type="hidden" name="pool_id" value={contributeModalData.poolId} />
          <Input
            label="Contribution amount (Eq)"
            type="number"
            name="amount"
            min="1"
            step="0.01"
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Contribute Now
          </Button>
        </Form>
      </Modal>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Submit Review"
        subtitle={`Reviewing ${reviewModalData.subjectName} after contract settlement`}
      >
        <Form onSubmit={handleReviewSubmit} className="stack-form" id="review-form">
          <input type="hidden" name="contract_id" value={reviewModalData.contractId} />
          <input type="hidden" name="subject_id" value={reviewModalData.subjectId} />
          <label>
            <span>Rating</span>
            <select name="rating" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Strong</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Needs improvement</option>
              <option value="1">1 - Poor</option>
            </select>
          </label>
          <label>
            <span>Comment</span>
            <textarea name="comment" placeholder="Describe the service quality and overall reciprocity experience" />
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Submit Review
          </Button>
        </Form>
      </Modal>

      <Modal
        isOpen={issuedCardModalOpen}
        onClose={() => setIssuedCardModalOpen(false)}
        title="Virtual Card Issued"
        subtitle="This card was created only after successful payment verification."
      >
        <div className="credential-grid">
          <div className="detail-block">
            <span>Card Label</span>
            <strong>{escapeHtml(issuedCardData.card_name || 'Primary')}</strong>
          </div>
          <div className="detail-block">
            <span>Card Number</span>
            <strong>{escapeHtml(issuedCardData.card_number || issuedCardData.masked_card_number || '-')}</strong>
          </div>
          <div className="detail-block">
            <span>Expiry</span>
            <strong>{escapeHtml(issuedCardData.expiry_date || '-')}</strong>
          </div>
          <div className="detail-block">
            <span>CVV</span>
            <strong>{escapeHtml(issuedCardData.cvv || '***')}</strong>
          </div>
        </div>
      </Modal>
    </>
  );
}
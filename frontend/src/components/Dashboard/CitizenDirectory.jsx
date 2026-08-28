import { useAuth } from '../../context/AuthContext';
import { formatEq, formatDate, escapeHtml, shortId } from '../../utils/helpers';

export function CitizenDirectory() {
  const { data } = useAuth();
  const profile = data?.profile;
  const directory = data?.directory || [];

  if (!profile) return null;

  const handlePayCitizen = (walletId, name) => {
    const event = new CustomEvent('prefill-transfer', {
      detail: { wallet_id: walletId, name },
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="section" data-section="citizen-directory" aria-labelledby="citizen-directory-title">
      <h2 id="citizen-directory-title" className="hidden">Citizen Directory</h2>

      <article className="glass-card">
        <div className="section-heading">
          <h3>Citizen Directory</h3>
          <span className="section-note">Find peers, inspect trust levels, and prefill secure transfers instantly.</span>
        </div>
        <div id="directory-grid" className="cards-grid">
          {directory.length > 0 ? (
            directory.map((citizen) => (
              <div key={citizen.user_id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <strong>{escapeHtml(citizen.full_name)}</strong>
                    <p>{escapeHtml(citizen.location_city || 'City not set')} • {escapeHtml(citizen.kyc_status)}</p>
                  </div>
                  <span className="pill cyan">{escapeHtml(String(citizen.trust_score))}</span>
                </div>
                <p>{escapeHtml(String(citizen.skill_count))} active listing(s) • Wallet {escapeHtml(citizen.wallet_status)}</p>
                <div className="data-card-header">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handlePayCitizen(citizen.wallet_id, citizen.full_name)}
                  >
                    Pay Citizen
                  </Button>
                  <span className="list-meta">{escapeHtml(shortId(citizen.wallet_id))}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No peer citizens found yet. Register a second account to demonstrate directory-based transfers.</div>
          )}
        </div>
      </article>
    </section>
  );
}
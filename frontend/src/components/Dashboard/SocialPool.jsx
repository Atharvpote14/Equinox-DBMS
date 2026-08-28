import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Input';
import { Form, FormRow } from '../UI/Form';
import { formatEq, formatDate, escapeHtml } from '../../utils/helpers';

export function SocialPool() {
  const { data } = useAuth();
  const profile = data?.profile;
  const pools = data?.pools || [];

  if (!profile) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handlePoolSubmit = (e) => {
    e.preventDefault();
    const event = new CustomEvent('create-pool', {
      detail: {
        title,
        description,
        target_amount: Number(targetAmount),
        deadline: deadline.replace('T', ' ') + ':00',
      },
    });
    window.dispatchEvent(event);
  };

  const handleContribute = (pool) => {
    const event = new CustomEvent('open-contribute-modal', {
      detail: { pool_id: pool.pool_id, pool_title: pool.title },
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="section" data-section="social-pool" aria-labelledby="social-pool-title">
      <h2 id="social-pool-title" className="hidden">Community Pools</h2>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Create Community Pool</h3>
            <span className="section-note">Community funding with trigger-driven raised totals.</span>
          </div>
          <Form onSubmit={handlePoolSubmit} className="stack-form" id="pool-form">
            <Input
              label="Pool title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Urban Garden Initiative"
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the initiative and intended impact"
            />
            <FormRow>
              <Input
                label="Target Eq"
                type="number"
                name="target_amount"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="150"
                min="1"
                step="0.01"
                required
              />
              <Input
                label="Deadline"
                type="datetime-local"
                name="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </FormRow>
            <Button type="submit" variant="primary" fullWidth>
              Create Pool
            </Button>
          </Form>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Funding Notes</h3>
            <span className="section-note">Community pool contributions remain fully database-backed.</span>
          </div>
          <ul className="bullet-note">
            <li>Wallet debit and contribution insertion happen together through the contribution procedure.</li>
            <li>The pool total grows automatically through the raised amount trigger.</li>
            <li>Pool status can close itself when the target is reached.</li>
          </ul>
        </article>
      </div>

      <article className="glass-card top-space">
        <div className="section-heading">
          <h3>Community Pools</h3>
          <span className="section-note">Live progress bars, contribution counts, and creator data.</span>
        </div>
        <div id="pools-grid" className="cards-grid">
          {pools.length > 0 ? (
            pools.map((pool) => (
              <div key={pool.pool_id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <strong>{escapeHtml(pool.title)}</strong>
                    <p>{escapeHtml(pool.creator_name)}</p>
                  </div>
                  <span className={`pill ${pool.status === 'COMPLETED' ? 'cyan' : 'muted'}`}>
                    {escapeHtml(pool.status)}
                  </span>
                </div>
                <p>{escapeHtml(pool.description || 'No description provided.')}</p>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Number(pool.progress_percent || 0))}%` }}
                  />
                </div>
                <div className="data-card-header">
                  <span className="list-meta">
                    {formatEq(pool.raised_amount)} / {formatEq(pool.target_amount)} Eq • {pool.contribution_count} contributions
                  </span>
                  {pool.status === 'ACTIVE' ? (
                    <Button variant="ghost-cyan" size="small" onClick={() => handleContribute(pool)}>
                      Contribute
                    </Button>
                  ) : (
                    <span className="pill cyan">Completed</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No community pools are live yet. Create one to demonstrate the pool workflow.</div>
          )}
        </div>
      </article>
    </section>
  );
}
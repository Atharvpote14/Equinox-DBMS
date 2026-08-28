import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Input';
import { Form } from '../UI/Form';
import { formatEq, formatDate, escapeHtml } from '../../utils/helpers';

export function SkillMarket() {
  const { data } = useAuth();
  const profile = data?.profile;
  const skills = data?.skills || [];
  const contracts = data?.contracts || [];

  if (!profile) return null;

  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');

  const currentUser = profile.user_id;
  const mySkills = skills.filter((s) => s.user_id === currentUser);
  const otherSkills = skills.filter((s) => s.user_id !== currentUser);
  const myContracts = contracts.filter((c) => c.provider_id === currentUser || c.consumer_id === currentUser);

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    const event = new CustomEvent('create-skill', {
      detail: {
        skill_name: skillName,
        description,
        rate_per_hour: Number(ratePerHour),
      },
    });
    window.dispatchEvent(event);
  };

  const handleCreateContract = (skill) => {
    const event = new CustomEvent('open-contract-modal', {
      detail: { skill_id: skill.skill_id, skill_name: skill.skill_name, rate: skill.rate_per_hour },
    });
    window.dispatchEvent(event);
  };

  const handleSettleContract = (contractId) => {
    const event = new CustomEvent('settle-contract', {
      detail: { contract_id: contractId },
    });
    window.dispatchEvent(event);
  };

  const handleOpenReview = (contractId, subjectId, subjectName) => {
    const event = new CustomEvent('open-review-modal', {
      detail: { contract_id: contractId, subject_id: subjectId, subject_name: subjectName },
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="section" data-section="skill-market" aria-labelledby="skill-market-title">
      <h2 id="skill-market-title" className="hidden">Skill Market</h2>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Publish Skill Listing</h3>
            <span className="section-note">Offer a service and set the Eq rate per hour.</span>
          </div>
          <Form onSubmit={handleSkillSubmit} className="stack-form" id="skill-form">
            <Input
              label="Skill name"
              name="skill_name"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Python Tutoring"
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service you offer"
            />
            <Input
              label="Rate per hour (Eq)"
              type="number"
              name="rate_per_hour"
              value={ratePerHour}
              onChange={(e) => setRatePerHour(e.target.value)}
              placeholder="20"
              min="1"
              required
            />
            <Button type="submit" variant="primary" fullWidth>
              Publish Listing
            </Button>
          </Form>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Contract Settlement</h3>
            <span className="section-note">Create, settle, and review marketplace engagements.</span>
          </div>
          <div id="contracts-grid" className="cards-grid">
            {myContracts.length > 0 ? (
              myContracts.map((contract) => {
                const isConsumer = contract.consumer_id === currentUser;
                const counterpartName = isConsumer ? contract.provider_name : contract.consumer_name;
                const reviewSubjectId = isConsumer ? contract.provider_id : contract.consumer_id;
                return (
                  <div key={contract.contract_id} className="data-card">
                    <div className="data-card-header">
                      <div>
                        <strong>{escapeHtml(contract.skill_name)}</strong>
                        <p>{escapeHtml(counterpartName)} • {escapeHtml(contract.status)}</p>
                      </div>
                      <span className="pill">{formatEq(contract.total_eq)} Eq</span>
                    </div>
                    <p>{escapeHtml(String(contract.hours))} hour(s) • {formatDate(contract.created_at)}</p>
                    <div className="data-card-header">
                      {contract.status === 'COMPLETED' ? (
                        <Button
                          variant="ghost-cyan"
                          size="small"
                          onClick={() => handleOpenReview(contract.contract_id, reviewSubjectId, counterpartName)}
                        >
                          Add Review
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleSettleContract(contract.contract_id)}
                        >
                          Settle Contract
                        </Button>
                      )}
                      <span className="list-meta">{isConsumer ? 'Consumer View' : 'Provider View'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No contracts have been created yet. Hire a skill listing to demonstrate settlement.</div>
            )}
          </div>
        </article>
      </div>

      <article className="glass-card top-space">
        <div className="section-heading">
          <h3>Marketplace Listings</h3>
          <span className="section-note">Browse live offerings and convert them into service contracts.</span>
        </div>
        <div id="skills-grid" className="cards-grid">
          {otherSkills.length > 0 ? (
            otherSkills.map((skill) => (
              <div key={skill.skill_id} className="data-card">
                <div className="data-card-header">
                  <div>
                    <strong>{escapeHtml(skill.skill_name)}</strong>
                    <p>{escapeHtml(skill.full_name)}</p>
                  </div>
                  <span className="pill cyan">{formatEq(skill.rate_per_hour)} Eq/hr</span>
                </div>
                <p>{escapeHtml(skill.description || 'No description provided.')}</p>
                <div className="data-card-header">
                  <span className="list-meta">{formatDate(skill.created_at)}</span>
                  <Button
                    variant="ghost-cyan"
                    size="small"
                    onClick={() => handleCreateContract(skill)}
                  >
                    Create Contract
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No marketplace listings are live yet. Publish a skill to begin the service flow.</div>
          )}
        </div>
      </article>
    </section>
  );
}
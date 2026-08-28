import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Button } from '../UI/Button';
import { Textarea } from '../UI/Input';
import { Form } from '../UI/Form';
import { formatDate, escapeHtml, normalizeCell } from '../../utils/helpers';

export function QueryLab() {
  const { data } = useAuth();
  const queryPresets = data?.query_presets || [];

  const [customSql, setCustomSql] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');

  const handlePresetQuery = (presetId) => {
    const event = new CustomEvent('run-preset-query', { detail: { preset: presetId } });
    window.dispatchEvent(event);
  };

  const handleCustomQuery = (e) => {
    e.preventDefault();
    if (!customSql.trim()) return;
    const event = new CustomEvent('run-custom-query', { detail: { sql: customSql } });
    window.dispatchEvent(event);
  };

  const renderResult = (result) => {
    if (!result.columns || !result.columns.length) {
      return (
        <div className="empty-state">No table columns were returned.</div>
      );
    }

    const header = result.columns.map((column) => <th key={column}>{escapeHtml(column)}</th>);
    const rows = (result.rows || []).length > 0
      ? result.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {result.columns.map((column) => (
              <td key={column}>{escapeHtml(normalizeCell(row[column]))}</td>
            ))}
          </tr>
        ))
      : <tr><td colSpan={result.columns.length}>No rows returned.</td></tr>;

    return (
      <div className="table-wrap">
        <table>
          <thead><tr>{header}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="section" data-section="query-lab" aria-labelledby="query-lab-title">
      <h2 id="query-lab-title" className="hidden">SQL Demonstrator</h2>

      <div className="dual-grid">
        <article className="glass-card">
          <div className="section-heading">
            <h3>Preset SQL Demonstrator</h3>
            <span className="section-note">Join-based presets for viva-friendly live database demonstrations.</span>
          </div>
          <div id="query-preset-list" className="chip-group">
            {queryPresets.length > 0 ? (
              queryPresets.map((preset) => (
                <Button
                  key={preset.id}
                  className="query-chip"
                  variant="ghost"
                  onClick={() => handlePresetQuery(preset.id)}
                  style={{ textAlign: 'left', padding: '14px 16px', background: 'rgba(10, 12, 22, 0.74)' }}
                >
                  <strong style={{ display: 'block', marginBottom: '6px' }}>{escapeHtml(preset.label)}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.55' }}>
                    {escapeHtml(preset.description)}
                  </span>
                </Button>
              ))
            ) : (
              <div className="empty-state">Query presets will appear once the dashboard bootstrap completes.</div>
            )}
          </div>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <h3>Custom Read-Only SQL</h3>
            <span className="section-note">Only SELECT, SHOW, DESCRIBE, DESC, or EXPLAIN statements are allowed.</span>
          </div>
          <Form onSubmit={handleCustomQuery} className="stack-form" id="custom-query-form">
            <Textarea
              label="SQL"
              name="sql"
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              placeholder="SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 10"
              rows={6}
            />
            <Button type="submit" variant="primary" fullWidth>
              Execute Query
            </Button>
          </Form>
        </article>
      </div>

      <article className="glass-card top-space">
        <div className="section-heading">
          <h3>Query Results</h3>
          <span id="query-meta" className="section-note">
            {queryResult ? `${queryResult.row_count} row(s) • Executed ${formatDate(queryResult.executed_at)}` : 'Choose a preset or enter a read-only query.'}
          </span>
        </div>
        {queryResult && (
          <pre id="query-sql-output" className="query-sql">{escapeHtml(queryResult.query || '')}</pre>
        )}
        <div id="query-table-wrap" className="table-wrap">
          {queryResult ? renderResult(queryResult) : <div className="empty-state">Choose a preset or enter a read-only query.</div>}
        </div>
        {queryError && (
          <div className="empty-state" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            {escapeHtml(queryError)}
          </div>
        )}
      </article>
    </section>
  );
}
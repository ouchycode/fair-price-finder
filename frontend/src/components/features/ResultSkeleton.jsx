import React from 'react';

const ResultSkeleton = () => {
  return (
    <div className="result-card" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      <div className="result-card__header">
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-3)' }} />
        <div style={{ width: 120, height: 16, borderRadius: 4, background: 'var(--bg-3)' }} />
      </div>

      <div className="result-price-grid">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="result-price-cell"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)' }}
          >
            <div style={{ width: 13, height: 13, margin: '0 auto 7px', background: 'var(--bg-3)', borderRadius: '50%' }} />
            <div style={{ width: 60, height: 12, margin: '0 auto 8px', background: 'var(--bg-3)', borderRadius: 2 }} />
            <div style={{ width: 90, height: 18, margin: '0 auto', background: 'var(--bg-3)', borderRadius: 2 }} />
          </div>
        ))}
      </div>

      <div className="result-note" style={{ background: 'var(--bg-2)' }}>
        <div style={{ width: 12, height: 12, flexShrink: 0, background: 'var(--bg-3)', borderRadius: '50%', marginTop: 2 }} />
        <div style={{ width: '100%', maxWidth: 400, height: 12, background: 'var(--bg-3)', borderRadius: 2, marginTop: 2 }} />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  );
};

export default ResultSkeleton;

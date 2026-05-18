import React from 'react';

const ResultSkeleton = () => {
  return (
    <div className="result-card" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      <div className="result-card__header">
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-3)' }} />
        <div style={{ width: 120, height: 16, borderRadius: 4, background: 'var(--bg-3)' }} />
      </div>

      <div className="result-price-display">
        <div className="result-price-main">
          <div style={{ width: 140, height: 12, margin: '0 auto 8px', background: 'var(--bg-3)', borderRadius: 2 }} />
          <div style={{ width: 220, height: 36, margin: '0 auto', background: 'var(--bg-3)', borderRadius: 4 }} />
        </div>
        
        <div className="result-price-range">
          <div className="result-price-range__item">
            <div style={{ width: 30, height: 10, marginBottom: 4, background: 'var(--bg-3)', borderRadius: 2 }} />
            <div style={{ width: 80, height: 14, background: 'var(--bg-3)', borderRadius: 2 }} />
          </div>
          
          <div className="result-price-range__bar-wrap">
            <div className="result-price-range__bar"></div>
          </div>
          
          <div className="result-price-range__item" style={{ alignItems: 'flex-end' }}>
            <div style={{ width: 40, height: 10, marginBottom: 4, background: 'var(--bg-3)', borderRadius: 2 }} />
            <div style={{ width: 90, height: 14, background: 'var(--bg-3)', borderRadius: 2 }} />
          </div>
        </div>
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

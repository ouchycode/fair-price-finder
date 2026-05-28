import React from 'react';

const ResultSkeleton = () => {
  return (
    <div className="result-card skeleton-pulse">
      <div className="result-card__header">
        <div className="skel-14x14 skel-round skel-bg" />
        <div className="skel-120x16 skel-r4 skel-bg" />
      </div>

      <div className="result-price-display">
        <div className="result-price-main">
          <div className="skel-140x12-center skel-r2 skel-bg" />
          <div className="skel-220x36-center skel-r4 skel-bg" />
        </div>
        
        <div className="result-price-range">
          <div className="result-price-range__item">
            <div className="skel-30x10 skel-r2 skel-bg" />
            <div className="skel-80x14 skel-r2 skel-bg" />
          </div>
          
          <div className="result-price-range__bar-wrap">
            <div className="result-price-range__bar"></div>
          </div>
          
          <div className="result-price-range__item items-end">
            <div className="skel-40x10 skel-r2 skel-bg" />
            <div className="skel-90x14 skel-r2 skel-bg" />
          </div>
        </div>
      </div>

      <div className="result-note skel-bg-2">
        <div className="skel-12x12 skel-round skel-bg" />
        <div className="skel-text-note skel-r2 skel-bg" />
      </div>
    </div>
  );
};

export default ResultSkeleton;

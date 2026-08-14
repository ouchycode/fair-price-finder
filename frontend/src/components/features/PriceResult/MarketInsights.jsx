import React from "react";
import PropTypes from "prop-types";

const MarketInsights = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="market-insights">
      {skills.map((s) => (
        <span
          key={s}
          className="market-insights-tag"
        >
          {s}
        </span>
      ))}
    </div>
  );
};

MarketInsights.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string),
};

export default MarketInsights;

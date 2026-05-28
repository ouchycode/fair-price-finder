import React from "react";
import PropTypes from "prop-types";

const MarketInsights = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 14,
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        padding: "0 24px 24px",
      }}
    >
      {skills.map((s) => (
        <span
          key={s}
          style={{
            fontSize: 10.5,
            padding: "3px 9px",
            borderRadius: 20,
            background: "var(--bg-3)",
            color: "var(--fg-2)",
            border: "1px solid var(--border)",
            fontWeight: 500,
            textTransform: "capitalize",
          }}
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

import React from "react";
import PropTypes from "prop-types";

const PageHeader = ({ eyebrow, title, muted, description, actions, className = "" }) => (
  <div className={`page-header ${className}`}>
    <div className="page-header__main">
      {eyebrow && <p className="label-mono page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-title">
        {title}
        {muted && <span className="page-title__muted"> {muted}</span>}
      </h1>
      {description && <p className="page-desc page-header__desc">{description}</p>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </div>
);

PageHeader.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  muted: PropTypes.node,
  description: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
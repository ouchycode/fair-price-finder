import React, { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";

const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 60}
      className={`faq-item${open ? " faq-item--open" : ""}`}
    >
      <button className="faq-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="faq-trigger__text">{q}</span>
        <ChevronDown
          size={14}
          style={{
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--fg-2)",
          }}
        />
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  );
};

FaqItem.propTypes = {
  q: PropTypes.string.isRequired,
  a: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default FaqItem;

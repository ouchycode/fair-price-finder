import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Plus, Minus } from "lucide-react";
import AOS from "aos";

const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
      
      // REFRESH AOS SETELAH TRANSISI SELESAI
      const timer = setTimeout(() => {
        AOS.refresh();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 60}
      data-aos-once="true"
      className={`faq-item${open ? " faq-item--open" : ""}`}
    >
      <button className="faq-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="faq-trigger__text">{q}</span>
        <span className="faq-trigger__icon">
          {open ? <Minus size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
        </span>
      </button>
      <div
        className="faq-answer-wrap faq-content-wrap"
        style={{ height }}
      >
        <div ref={contentRef}>
          <p className="faq-answer">{a}</p>
        </div>
      </div>
    </div>
  );
};

FaqItem.propTypes = {
  q: PropTypes.string.isRequired,
  a: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default FaqItem;

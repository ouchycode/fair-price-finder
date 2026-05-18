import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const StatCounter = ({ val, label, src, delay }) => {
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const raf = useRef(null);

  const numericMatch = val.match(/^([\d.]+)/);
  const suffix = numericMatch ? val.slice(numericMatch[0].length) : "";
  const numericVal = numericMatch ? parseFloat(numericMatch[1]) : null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (numericVal === null) {
      setDisplay(val);
      return;
    }

    const COUNTER_ANIMATION_DURATION = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / COUNTER_ANIMATION_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((eased * numericVal).toFixed(1)) + suffix);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [started, numericVal, suffix, val]);

  return (
    <div
      ref={ref}
      data-aos="fade-up"
      data-aos-delay={delay}
      className="stats-bar__item"
    >
      <p className="stats-bar__val">{display}</p>
      <p className="stats-bar__label">
        {label}
        <span className="stats-bar__src">· {src}</span>
      </p>
    </div>
  );
};

StatCounter.propTypes = {
  val: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

export default StatCounter;

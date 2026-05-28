import React from "react";
import PropTypes from "prop-types";
import { Bot, Sparkles } from "lucide-react";

const AiConsultation = ({ loading, consultation }) => {
  if (!loading && !consultation) return null;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay="150"
      className="ai-consult-card"
    >
      <div className="ai-consult-header">
        <div className="ai-consult-icon-bg">
          <Sparkles size={13} color="var(--indigo)" />
        </div>
        <div>
          <p className="ai-consult-title">
            Analisis & Saran Negosiasi
          </p>
          <p className="ai-consult-subtitle">
            Powered by AI
          </p>
        </div>
      </div>

      <div className="ai-consult-body-wrapper">
        {loading ? (
          <div className="ai-consult-loading">
            <Bot size={16} className="spin-slow" />
            <span>AI sedang menyusun saran untukmu…</span>
          </div>
        ) : (
          <div
            className="ai-consult-content"
            dangerouslySetInnerHTML={{
              __html: consultation
                .replace(/\n\n/g, "</p><p style='margin:8px 0'>")
                .replace(/\n/g, "<br/>")
                .replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong style='color:var(--fg);font-weight:600'>$1</strong>",
                ),
            }}
          />
        )}
      </div>
    </div>
  );
};

AiConsultation.propTypes = {
  loading: PropTypes.bool.isRequired,
  consultation: PropTypes.string.isRequired,
};

export default AiConsultation;

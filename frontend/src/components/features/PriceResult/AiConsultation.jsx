import React from "react";
import PropTypes from "prop-types";
import { Bot, Sparkles } from "lucide-react";

const AiConsultation = ({ loading, consultation }) => {
  if (!loading && !consultation) return null;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay="150"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-2)",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "rgba(99,102,241,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={13} color="var(--indigo)" />
        </div>
        <div>
          <p
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--fg)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Analisis & Saran Negosiasi
          </p>
          <p style={{ fontSize: 10.5, color: "var(--fg-3)", margin: 0 }}>
            Powered by AI
          </p>
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--fg-3)",
              fontSize: 13,
            }}
          >
            <Bot size={16} className="spin-slow" />
            <span>AI sedang menyusun saran untukmu…</span>
          </div>
        ) : (
          <div
            style={{ fontSize: 13, lineHeight: 1.75, color: "var(--fg-2)" }}
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

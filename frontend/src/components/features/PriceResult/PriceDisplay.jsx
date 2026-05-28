import React from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmt, fmtShort } from "./utils";

const PriceDisplay = ({
  min_price,
  median_price,
  max_price,
  detected_category,
  duration,
}) => {
  const spread = max_price - min_price;
  const spreadPct = Math.round((spread / median_price) * 100);

  return (
    <>
      <div style={{ padding: "28px 24px 0", textAlign: "center" }}>
        <p
          style={{
            fontSize: 11,
            color: "var(--fg-3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Harga Tengah (Rekomendasi)
        </p>
        <div
          data-aos="zoom-in"
          data-aos-delay="100"
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--fg)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {fmt(median_price)}
        </div>
        {detected_category && (
          <span
            style={{
              fontSize: 11.5,
              color: "var(--fg-3)",
              background: "var(--bg-2)",
              padding: "3px 10px",
              borderRadius: 20,
              display: "inline-block",
              marginBottom: 4,
            }}
          >
            {detected_category}
          </span>
        )}
        {duration && (
          <p style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>
            untuk {duration} hari pengerjaan
          </p>
        )}
      </div>

      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: "var(--bg-3)",
              overflow: "hidden",
            }}
          >
            <div
              data-aos="fade-right"
              data-aos-delay="200"
              style={{
                height: "100%",
                borderRadius: 99,
                background:
                  "linear-gradient(90deg, var(--accent) 0%, #a00000 100%)",
                width: "60%",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "var(--fg)",
              border: "3px solid var(--bg-1)",
              boxShadow: "0 0 0 2px var(--accent)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 8,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <TrendingDown size={11} color="var(--green)" />
              <span
                style={{
                  fontSize: 10,
                  color: "var(--fg-3)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Min
              </span>
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--fg)",
                letterSpacing: "-0.03em",
              }}
            >
              {fmt(min_price)}
            </div>
            <div style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>
              {fmtShort(min_price)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 10,
              gap: 3,
            }}
          >
            <Minus size={12} color="var(--fg-3)" />
            <span
              style={{
                fontSize: 9,
                color: "var(--fg-3)",
                writingMode: "vertical-rl",
                letterSpacing: "0.05em",
              }}
            >
              ±{spreadPct}%
            </span>
          </div>

          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 14px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "var(--fg-3)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Maks
              </span>
              <TrendingUp size={11} color="var(--accent)" />
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--fg)",
                letterSpacing: "-0.03em",
              }}
            >
              {fmt(max_price)}
            </div>
            <div style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>
              {fmtShort(max_price)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PriceDisplay.propTypes = {
  min_price: PropTypes.number.isRequired,
  median_price: PropTypes.number.isRequired,
  max_price: PropTypes.number.isRequired,
  detected_category: PropTypes.string,
  duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PriceDisplay;

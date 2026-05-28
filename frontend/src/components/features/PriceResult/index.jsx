import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { consultPrice } from "../../../services/api";
import PriceHeader from "./PriceHeader";
import PriceDisplay from "./PriceDisplay";
import MarketInsights from "./MarketInsights";
import AiConsultation from "./AiConsultation";

const PriceResult = ({ result }) => {
  const [consultation, setConsultation] = useState("");
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    if (result && result.requestParams) {
      setConsultLoading(true);
      setConsultation("");
      consultPrice({ ...result.requestParams, role: result.requestParams.role || "freelancer" })
        .then((res) => {
          const data = res.data?.data || res.data;
          setConsultation(
            data.consultation ||
              data.text ||
              "Saran negosiasi berhasil dibuat.",
          );
        })
        .catch(() => {
          setConsultation(
            "Gagal memuat saran dari AI. Gunakan rentang harga di atas sebagai patokan negosiasi.",
          );
        })
        .finally(() => setConsultLoading(false));
    }
  }, [result]);

  if (!result) return null;

  const {
    min_price,
    median_price,
    max_price,
    detected_category,
    requestParams,
  } = result;

  return (
    <div className="price-result-wrapper">
      <div
        data-aos="fade-left"
        className="price-result-card"
      >
        <PriceHeader
          min_price={min_price}
          median_price={median_price}
          max_price={max_price}
        />
        <PriceDisplay
          min_price={min_price}
          median_price={median_price}
          max_price={max_price}
          detected_category={detected_category}
          duration={requestParams?.duration}
        />
        <MarketInsights skills={requestParams?.skills} />
      </div>

      <AiConsultation loading={consultLoading} consultation={consultation} />
    </div>
  );
};

PriceResult.propTypes = {
  result: PropTypes.shape({
    min_price: PropTypes.number.isRequired,
    median_price: PropTypes.number.isRequired,
    max_price: PropTypes.number.isRequired,
    detected_category: PropTypes.string,
    requestParams: PropTypes.object,
  }),
};

export default PriceResult;

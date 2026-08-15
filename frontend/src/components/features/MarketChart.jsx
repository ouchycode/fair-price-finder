import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useI18n';

const MarketChart = ({ data }) => {
  const { t } = useLanguage();

  return (
    !data || data.length === 0 ? (
      <div className="market-chart-empty">
        <BarChart2 size={32} color="var(--border-2)" />
        <span className="market-chart-empty-text">{t("chartSection.empty")}</span>
      </div>
    ) : null
  );
};

export default MarketChart;
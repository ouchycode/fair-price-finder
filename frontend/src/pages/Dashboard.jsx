import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Activity,
  Users,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
import DumbbellChart from "../components/features/DumbbellChart";
import PageHeader from "../components/common/PageHeader";
import { getMarketTrends } from "../services/api";
import { useLanguage } from "../hooks/useI18n";

const Dashboard = () => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState("job");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // API
  const [jobsData, setJobsData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dynamicTrendData, setDynamicTrendData] = useState([]);
  const [top3Keys, setTop3Keys] = useState([]);

  const [backendJobTrends, setBackendJobTrends] = useState(null);
  const [backendSkillTrends, setBackendSkillTrends] = useState(null);

  useEffect(() => {
    getMarketTrends()
      .then((res) => {
        const data = res.data?.data || res.data;

        if (data.jobsData) setJobsData(data.jobsData);
        if (data.skillsData) setSkillsData(data.skillsData);
        if (data.jobTrends) setBackendJobTrends(data.jobTrends);
        if (data.skillTrends) setBackendSkillTrends(data.skillTrends);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat trend data", err);
        setLoading(false);
      });
  }, []);

  let rawData = filterType === "job" ? jobsData : skillsData;

  useEffect(() => {
    if (rawData.length === 0) return;
    setTop3Keys(rawData.slice(0, 5).map((i) => i.name));
    setDynamicTrendData(rawData.slice(0, 5));
  }, [rawData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  const DashboardSkeleton = () => (
    <div className="animate-pulse">
      <div className="kpi-grid mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="kpi-card kpi-card-skeleton" />
        ))}
      </div>
      <div className="panel panel-skeleton-sm" />
      <div className="panel panel-skeleton-lg" />
    </div>
  );

  if (loading) {
    return (
      <div className="page-wrap">
        {/* HEADER */}
        <div data-aos="fade-down">
          <PageHeader
            eyebrow={t("dashboardSection.label")}
            title={t("dashboardSection.title")}
            muted={t("dashboardSection.titleMuted")}
          />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // STATE KOSONG: data tersedia dari API tapi kosong (bukan loading abadi)
  if (rawData.length === 0) {
    return (
      <div className="page-wrap">
        <div data-aos="fade-down">
          <PageHeader
            eyebrow={t("dashboardSection.label")}
            title={t("dashboardSection.title")}
            muted={t("dashboardSection.titleMuted")}
          />
        </div>
        <div data-aos="zoom-in" className="empty-result">
          <div className="empty-result__icon">
            <AlertTriangle size={22} color="var(--amber)" strokeWidth={1.7} />
          </div>
          <div>
            <p className="empty-result__title">
              {t("dashboardSection.title")}
            </p>
            <p className="empty-result__desc">
              {t("dashboardSection.emptyState")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CALCULATE
  const maxDemand = Math.max(
    ...(rawData.length > 0 ? rawData : [{ demand: 1 }]).map((d) => d.demand),
  );

  const sortedData = rawData
    .map((item) => {
      const pctChange =
        item.prevDemand > 0
          ? ((item.demand - item.prevDemand) / item.prevDemand) * 100
          : 0;
      return {
        ...item,
        trend: pctChange,
        fillPct: (item.demand / maxDemand) * 100,
      };
    })
    .sort((a, b) => b.demand - a.demand);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const leaderboardData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // HITUNG RATA-RATA HARGA GLOBAL
  const globalAvgPrice =
    rawData.length > 0
      ? rawData.reduce((acc, curr) => acc + (curr.avgPrice || 0), 0) /
        rawData.length
      : 0;

  const formatKpiCurrency = (value) => {
    if (!value) return "Rp 0";
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1).replace(".0", "")}jt`;
    }
    if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(0)}rb`;
    }
    return `Rp ${value}`;
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="page-wrap relative-wrap">
        {/* STAT CARDS */}
        <div data-aos="fade-down">
          <PageHeader
            eyebrow={t("dashboardSection.label")}
            title={t("dashboardSection.title")}
            muted={t("dashboardSection.titleMuted")}
            actions={
              <div className="live-badge live-badge-custom">
                <span className="live-badge__text">
                  {t("dashboardSection.source")}
                </span>
              </div>
            }
          />
        </div>

        <div className="chart-filters" data-aos="fade-up" data-aos-delay="40">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="job">{t("dashboardSection.filterJob")}</option>
            <option value="skill">{t("dashboardSection.filterSkill")}</option>
          </select>
        </div>

        <div className="kpi-grid" data-aos="fade-up" data-aos-delay="50">
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">
                {t("dashboardSection.kpi.refsTitle")}
              </span>
              <Activity size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {rawData
                .reduce((acc, curr) => acc + curr.demand, 0)
                .toLocaleString("id-ID")}
            </div>
            <div className="kpi-card__trend trend-fg3">
              {t("dashboardSection.kpi.refsTrend")}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">
                {t("dashboardSection.kpi.priceTitle")}
              </span>
              <BarChart2 size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {formatKpiCurrency(globalAvgPrice)}
            </div>
            <div className="kpi-card__trend trend-fg2">
              {t("dashboardSection.kpi.priceTrend", filterType)}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">
                {t("dashboardSection.kpi.topTitle", filterType)}
              </span>
              <Users size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">{leaderboardData[0]?.name}</div>
            <div className="kpi-card__trend trend-indigo">
              {t("dashboardSection.kpi.topTrend")}
            </div>
          </div>
        </div>

        <div
          className="dashboard-panel-leaderboard panel"
          data-aos="fade-up"
          data-aos-delay="60"
        >
          <div className="dashboard-panel-header">
            <h3 className="section-title-sm mb-4">
              {t("dashboardSection.distTitle")}
            </h3>
            <p className="page-desc text-13">
              {t("dashboardSection.distDesc")}
            </p>
          </div>
          <div className="dashboard-table-wrapper">
            <DumbbellChart data={dynamicTrendData} />
          </div>
        </div>

        <div className="panel" data-aos="fade-up" data-aos-delay="80">
          <div className="dashboard-panel-header dashboard-panel-header--large">
            <h3 className="section-title-sm mb-4">
              {t("dashboardSection.recoTitle", filterType)}
            </h3>
            <div className="dashboard-info-card page-desc text-13">
              <Info size={16} className="dashboard-info-card-icon" />
              <span className="dashboard-info-card-text">
                <strong>{t("dashboardSection.infoTitle")}</strong>
                <br />
                {t("dashboardSection.infoBodyPre")}
                <strong>
                  {filterType === "job"
                    ? t("dashboardSection.infoStrong1")
                    : t("dashboardSection.infoStrong2")}
                </strong>
                {t("dashboardSection.infoBodyPost")}
              </span>
            </div>
          </div>
          <div className="leaderboard">
            {/* HEADER */}
            <div className="leaderboard-header">
              <div className="table-col-center">
                {t("dashboardSection.thRank")}
              </div>
              <div>{t("dashboardSection.thName", filterType)}</div>
              <div>{t("dashboardSection.thPrice", filterType)}</div>
              <div>{t("dashboardSection.thVolume", filterType)}</div>
            </div>

            {leaderboardData.map((item, i) => {
              const isUp = item.trend > 0;
              const isDown = item.trend < 0;
              const trendColor = isUp
                ? "var(--green)"
                : isDown
                  ? "var(--amber)"
                  : "var(--fg-2)";
              const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

              return (
                <div key={item.name} className="leaderboard-row">
                  <div className="leaderboard-rank">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </div>
                  <div className="leaderboard-name">{item.name}</div>
                  <div className="leaderboard-rate">{item.rate}</div>
                  <div
                    className="leaderboard-bar-wrap"
                    title={`${item.demand.toLocaleString("id-ID")} ${t("dashboardSection.ttlData", filterType)}`}
                  >
                    <div
                      className={`leaderboard-bar-fill ${i < 3 ? "bg-indigo" : "bg-border-2"}`}
                      style={{ width: `${Math.max(item.fillPct, 5)}%` }}
                    />
                    <span
                      className={`leaderboard-demand-text ${i < 3 ? "text-white" : ""} ${i >= 3 ? "text-fg" : ""}`}
                    >
                      {item.demand.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                {currentPage > 1 ? (
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    <ChevronLeft size={16} />
                  </button>
                ) : (
                  <div className="pagination-btn-placeholder" />
                )}
                <span className="pagination-info">
                  {t("dashboardSection.paging", [currentPage, totalPages])}
                </span>
                {currentPage < totalPages ? (
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                  >
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="pagination-btn-placeholder" />
                )}
              </div>
            )}
          </div>
        </div>

        <Separator.Root className="dashboard-separator" />
      </div>
    </Tooltip.Provider>
  );
};

export default Dashboard;
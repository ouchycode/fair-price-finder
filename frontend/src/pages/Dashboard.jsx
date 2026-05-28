import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Activity,
  Users,
  BarChart2,
} from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
import DumbbellChart from "../components/features/DumbbellChart";
import { getMarketTrends } from "../services/api";

const Dashboard = () => {
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
    setTop3Keys(rawData.slice(0, 5).map(i => i.name));
    setDynamicTrendData(rawData.slice(0, 5));
  }, [rawData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="kpi-grid" style={{ marginTop: 32, marginBottom: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="kpi-card" style={{ height: 110, background: "var(--bg-2)", borderColor: "var(--border-1)" }} />
      ))}
    </div>
    <div className="panel" style={{ height: 350, marginBottom: 24, background: "var(--bg-2)", borderColor: "var(--border-1)" }} />
    <div className="panel" style={{ height: 400, background: "var(--bg-2)", borderColor: "var(--border-1)" }} />
  </div>
);

  if (loading || rawData.length === 0) {
    return (
      <div className="page-wrap">
        {/* HEADER */}
        <div data-aos="fade-down" className="page-header">
          <div>
            <p className="label-mono" style={{ marginBottom: 10 }}>Market Intelligence</p>
            <h1 className="page-title">Analisis Data <span className="page-title__muted">Freelancer di Indonesia</span></h1>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }


  // CALCULATE
  const maxDemand = Math.max(...(rawData.length > 0 ? rawData : [{demand: 1}]).map((d) => d.demand));

  const sortedData = rawData
    .map((item) => {
      const pctChange = item.prevDemand > 0 
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
    currentPage * itemsPerPage
  );

  // Hitung Global Average Price
  const globalAvgPrice = rawData.length > 0 
    ? rawData.reduce((acc, curr) => acc + (curr.avgPrice || 0), 0) / rawData.length 
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
      <div className="page-wrap" style={{ position: "relative" }}>
        {/* HEADER */}
        <div data-aos="fade-down" className="page-header">
          <div>
            <p className="label-mono" style={{ marginBottom: 10 }}>
              Market Intelligence
            </p>
            <h1 className="page-title">
              Analisis Data{" "}
              <span className="page-title__muted">Freelancer di Indonesia</span>
            </h1>
          </div>
          <div className="live-badge" style={{ padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--border-1)', color: 'var(--fg-2)' }}>
            <span className="live-badge__text">Sumber: Upwork, Sribu, Fastwork, dll.</span>
          </div>
        </div>

        <div className="chart-filters" data-aos="fade-up" data-aos-delay="40">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="job">Kategori Pekerjaan</option>
            <option value="skill">Spesifik Skill</option>
          </select>
        </div>

        <div className="kpi-grid" data-aos="fade-up" data-aos-delay="50">
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">Total Proyek</span>
              <Activity size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {rawData
                .reduce((acc, curr) => acc + curr.demand, 0)
                .toLocaleString("id-ID")}
            </div>
            <div className="kpi-card__trend" style={{ color: "var(--fg-3)" }}>
              Data Keseluruhan
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">Rata-Rata Nilai Proyek</span>
              <BarChart2 size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {formatKpiCurrency(globalAvgPrice)}
            </div>
            <div className="kpi-card__trend" style={{ color: "var(--fg-2)" }}>
              Rata-rata dari semua {filterType === "job" ? "pekerjaan" : "skill"}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">
                Top {filterType === "job" ? "Pekerjaan" : "Skill"}
              </span>
              <Users size={14} color="var(--fg-3)" />
            </div>
            <div
              className="kpi-card__value"
              style={{ fontSize: "18px", marginTop: "6px" }}
            >
              {leaderboardData[0]?.name}
            </div>
            <div className="kpi-card__trend" style={{ color: "var(--indigo)" }}>
              Paling banyak dicari
            </div>
          </div>
        </div>

        <div
          className="panel"
          data-aos="fade-up"
          data-aos-delay="60"
          style={{ padding: "24px", marginBottom: "24px" }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 className="section-title-sm" style={{ marginBottom: 4 }}>
              Distribusi Harga
            </h3>
            <p className="page-desc" style={{ fontSize: "13px" }}>
              Rentang Harga (Terendah vs Tertinggi) Top 5
            </p>
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <DumbbellChart data={dynamicTrendData} />
          </div>
        </div>

        <div className="panel" data-aos="fade-up" data-aos-delay="80">
          <div className="leaderboard">
            {/* HEADER */}
            <div className="leaderboard-header">
              <div style={{ textAlign: "center" }}>#</div>
              <div>{filterType === "job" ? "Pekerjaan" : "Skill"}</div>
              <div>Pendapatan (per Proyek)</div>
              <div>Jumlah Proyek</div>
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
                <div
                  key={item.name}
                  className="leaderboard-row"
                >
                  <div className="leaderboard-rank">{(currentPage - 1) * itemsPerPage + i + 1}</div>
                  <div className="leaderboard-name">{item.name}</div>
                  <div className="leaderboard-rate">
                    {item.rate}
                  </div>
                  <div
                    className="leaderboard-bar-wrap"
                    title={`${item.demand.toLocaleString("id-ID")} proyek`}
                  >
                    <div
                      className="leaderboard-bar-fill"
                      style={{
                        width: `${Math.max(item.fillPct, 5)}%`, 
                        background: i < 3 ? "var(--indigo)" : "var(--border-2)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: i < 3 ? "#ffffff" : "var(--fg)",
                        pointerEvents: "none",
                      }}
                    >
                      {item.demand.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 32 }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ 
                    padding: "6px 14px", 
                    borderRadius: 6, 
                    border: "1px solid var(--border)", 
                    background: "var(--bg-1)", 
                    color: "var(--fg)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer", 
                    opacity: currentPage === 1 ? 0.5 : 1,
                    fontWeight: 500,
                    fontSize: 13
                  }}
                >
                  Sebelumnya
                </button>
                <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ 
                    padding: "6px 14px", 
                    borderRadius: 6, 
                    border: "1px solid var(--border)", 
                    background: "var(--bg-1)", 
                    color: "var(--fg)",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer", 
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    fontWeight: 500,
                    fontSize: 13
                  }}
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>

        <Separator.Root
          style={{
            height: 1,
            background: "var(--border)",
            margin: "32px 0 16px 0",
          }}
        />
      </div>
    </Tooltip.Provider>
  );
};

export default Dashboard;

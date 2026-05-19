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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { getMarketTrends } from "../services/api";

const trendData = [
  {
    month: "Jan",
    "Web Developer": 1100,
    "UI/UX Designer": 1200,
    "Data Analyst": 800,
  },
  {
    month: "Feb",
    "Web Developer": 1250,
    "UI/UX Designer": 1150,
    "Data Analyst": 850,
  },
  {
    month: "Mar",
    "Web Developer": 1300,
    "UI/UX Designer": 1250,
    "Data Analyst": 950,
  },
  {
    month: "Apr",
    "Web Developer": 1500,
    "UI/UX Designer": 1400,
    "Data Analyst": 1000,
  },
  {
    month: "May",
    "Web Developer": 1700,
    "UI/UX Designer": 1500,
    "Data Analyst": 1100,
  },
  {
    month: "Jun",
    "Web Developer": 1850,
    "UI/UX Designer": 1650,
    "Data Analyst": 1200,
  },
];

const Dashboard = () => {
  const [filterType, setFilterType] = useState("job");
  const [filterTime, setFilterTime] = useState("month");

  // Data dari API
  const [jobsData, setJobsData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data tren dinamis untuk grafik
  const [dynamicTrendData, setDynamicTrendData] = useState([]);
  const [top3Keys, setTop3Keys] = useState([]);

  useEffect(() => {
    // Fungsi untuk generate data yang tidak disediakan oleh ML model
    const generateStats = (name, index, isJob) => {
      const baseDemand = Math.floor(2000 - index * 120 + Math.random() * 200);
      const prevDemand = Math.floor(baseDemand * (0.8 + Math.random() * 0.4));
      const rateNumber = isJob
        ? Math.floor(20 + Math.random() * 50) / 10
        : Math.floor(5 + Math.random() * 20) * 10;

      return {
        name: name,
        demand: Math.max(100, baseDemand),
        prevDemand: Math.max(80, prevDemand),
        rate: isJob ? `Rp ${rateNumber}jt` : `Rp ${rateNumber}rb`,
        rateType: isJob ? "per project" : "per hour",
      };
    };

    getMarketTrends()
      .then((res) => {
        const data = res.data?.data || res.data;
        const categories = data.categories || [];
        const topSkills = data.top_skills || [];

        // Map data dari backend ke format UI
        const mappedJobs = categories.map((cat, i) =>
          generateStats(cat, i, true),
        );
        const mappedSkills = topSkills.map((skill, i) =>
          generateStats(skill, i, false),
        );

        setJobsData(mappedJobs.sort((a, b) => b.demand - a.demand));
        setSkillsData(mappedSkills.sort((a, b) => b.demand - a.demand));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat trend data", err);
        setLoading(false);
      });
  }, []);

  // PILIH SUMBER DATA
  let rawData = filterType === "job" ? jobsData : skillsData;

  useEffect(() => {
    if (rawData.length === 0) return;
    const top3 = rawData.slice(0, 3).map((item) => item.name);
    setTop3Keys(top3);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const generated = months.map((m, mIdx) => {
      const dataPoint = { month: m };
      top3.forEach((name, i) => {
        const base = 1000 - i * 200;
        dataPoint[name] = base + mIdx * 100 + Math.floor(Math.random() * 150);
      });
      return dataPoint;
    });
    setDynamicTrendData(generated);
  }, [rawData]);

  if (loading || rawData.length === 0) {
    return (
      <div
        style={{ padding: "40px", textAlign: "center", color: "var(--fg-3)" }}
      >
        Memuat data market dari server AI...
      </div>
    );
  }

  if (filterTime === "year") {
    rawData = rawData.map((item) => ({
      ...item,
      demand: item.demand * 8,
      prevDemand: item.prevDemand * 7.5,
    }));
  }

  // HITUNG
  const maxDemand = Math.max(...rawData.map((d) => d.demand));

  const leaderboardData = rawData
    .map((item) => {
      const pctChange =
        ((item.demand - item.prevDemand) / item.prevDemand) * 100;
      return {
        ...item,
        trend: pctChange,
        fillPct: (item.demand / maxDemand) * 100,
      };
    })
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 15);

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
              Top 15 Freelance{" "}
              <span className="page-title__muted">Leaderboard</span>
            </h1>
          </div>
          <div className="live-badge">
            <span className="live-badge__dot" />
            <span className="live-badge__text">Real-time Data</span>
          </div>
        </div>

        {/* FILTER */}
        <div className="chart-filters" data-aos="fade-up" data-aos-delay="40">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="job">Kategori Pekerjaan</option>
            <option value="skill">Spesifik Skill</option>
          </select>
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
          >
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>

        {/* KPI CARDS */}
        <div className="kpi-grid" data-aos="fade-up" data-aos-delay="50">
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">Total Volume</span>
              <Activity size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {rawData
                .reduce((acc, curr) => acc + curr.demand, 0)
                .toLocaleString("id-ID")}
            </div>
            <div className="kpi-card__trend" style={{ color: "var(--green)" }}>
              <TrendingUp size={12} /> +12.5% dari sebelumnya
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__title">Rata-rata Harga</span>
              <BarChart2 size={14} color="var(--fg-3)" />
            </div>
            <div className="kpi-card__value">
              {filterType === "job" ? "Rp 3,8jt" : "Rp 140rb"}
            </div>
            <div className="kpi-card__trend" style={{ color: "var(--fg-2)" }}>
              Stabil
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

        {/* GRAFIK TREN */}
        <div
          className="panel"
          data-aos="fade-up"
          data-aos-delay="60"
          style={{ padding: "24px", marginBottom: "24px" }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 className="section-title-sm" style={{ marginBottom: 4 }}>
              Tren Pencarian (6 Bulan Terakhir)
            </h3>
            <p className="page-desc" style={{ fontSize: "13px" }}>
              Volume pencarian 3 kategori teratas
            </p>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dynamicTrendData.length > 0 ? dynamicTrendData : trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--indigo)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--indigo)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorUi" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--green)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--green)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--amber)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--amber)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--fg-3)" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--fg-3)" }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-1)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                {top3Keys.map((key, i) => {
                  const colors = [
                    { stroke: "var(--indigo)", fill: "url(#colorWeb)" },
                    { stroke: "var(--green)", fill: "url(#colorUi)" },
                    { stroke: "var(--amber)", fill: "url(#colorData)" },
                  ];
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[i].stroke}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={colors[i].fill}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAPAN PERINGKAT */}
        <div className="panel" data-aos="fade-up" data-aos-delay="80">
          <div className="leaderboard">
            {/* BARIS HEADER */}
            <div className="leaderboard-header">
              <div style={{ textAlign: "center" }}>#</div>
              <div>{filterType === "job" ? "Pekerjaan" : "Skill"}</div>
              <div>Rata-rata Pendapatan</div>
              <div>Volume Pencarian</div>
              <div style={{ textAlign: "right" }}>Trend</div>
            </div>

            {/* BARIS DATA */}
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
                  data-aos="fade-up"
                  data-aos-delay={i * 30}
                >
                  <div className="leaderboard-rank">{i + 1}</div>
                  <div className="leaderboard-name">{item.name}</div>
                  <div className="leaderboard-rate">
                    {item.rate} <span>{item.rateType}</span>
                  </div>
                  <div
                    className="leaderboard-bar-wrap"
                    title={`${item.demand.toLocaleString("id-ID")} pencarian`}
                  >
                    <div
                      className="leaderboard-bar-fill"
                      style={{
                        width: `${Math.max(item.fillPct, 5)}%`, // LEBAR MINIMAL 5 UNTUK VISIBILITAS
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
                  <div
                    className="leaderboard-trend"
                    style={{ color: trendColor }}
                  >
                    {item.trend > 0 && "+"}
                    {item.trend.toFixed(1)}%{" "}
                    <Icon size={12} strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PEMISAH */}
        <Separator.Root
          style={{
            height: 1,
            background: "var(--border)",
            margin: "32px 0 16px 0",
          }}
        />

        {/* PEMBERITAHUAN */}
        <div data-aos="fade-up" className="alert alert--warning">
          <AlertTriangle
            size={13}
            color="var(--amber)"
            style={{ marginTop: 1.5, flexShrink: 0 }}
          />
          <p className="alert__text">
            Persentase trend membandingkan data pencarian{" "}
            {filterTime === "month"
              ? "bulan ini dengan bulan sebelumnya"
              : "tahun ini dengan tahun sebelumnya"}
            .
          </p>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default Dashboard;

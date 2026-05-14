import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import * as Tooltip from '@radix-ui/react-tooltip';

// Mock Data
const jobsData = [
  { name: 'Web Developer', demand: 1850, prevDemand: 1600, rate: 'Rp 5,5jt', rateType: 'per project' },
  { name: 'UI/UX Designer', demand: 1650, prevDemand: 1700, rate: 'Rp 4,2jt', rateType: 'per project' },
  { name: 'Mobile Developer', demand: 1420, prevDemand: 1200, rate: 'Rp 6,5jt', rateType: 'per project' },
  { name: 'Data Analyst', demand: 1200, prevDemand: 1050, rate: 'Rp 4,8jt', rateType: 'per project' },
  { name: 'Graphic Designer', demand: 1050, prevDemand: 1100, rate: 'Rp 2,5jt', rateType: 'per project' },
  { name: 'Copywriter', demand: 890, prevDemand: 800, rate: 'Rp 1,5jt', rateType: 'per project' },
  { name: 'Video Editor', demand: 850, prevDemand: 820, rate: 'Rp 3,5jt', rateType: 'per project' },
  { name: 'Social Media Manager', demand: 810, prevDemand: 750, rate: 'Rp 3,0jt', rateType: 'per month' },
  { name: 'SEO Specialist', demand: 760, prevDemand: 700, rate: 'Rp 4,0jt', rateType: 'per month' },
  { name: 'Digital Marketer', demand: 710, prevDemand: 680, rate: 'Rp 4,5jt', rateType: 'per project' },
  { name: 'Backend Engineer', demand: 680, prevDemand: 600, rate: 'Rp 7,0jt', rateType: 'per project' },
  { name: 'Illustrator', demand: 550, prevDemand: 580, rate: 'Rp 1,8jt', rateType: 'per project' },
  { name: 'Virtual Assistant', demand: 520, prevDemand: 450, rate: 'Rp 2,5jt', rateType: 'per month' },
  { name: 'Voice Over Talent', demand: 480, prevDemand: 470, rate: 'Rp 1,0jt', rateType: 'per project' },
  { name: 'Translator', demand: 420, prevDemand: 450, rate: 'Rp 1,2jt', rateType: 'per project' },
];

const skillsData = [
  { name: 'React.js', demand: 2500, prevDemand: 2200, rate: 'Rp 150rb', rateType: 'per hour' },
  { name: 'Figma', demand: 2100, prevDemand: 1950, rate: 'Rp 120rb', rateType: 'per hour' },
  { name: 'Node.js', demand: 1850, prevDemand: 1700, rate: 'Rp 180rb', rateType: 'per hour' },
  { name: 'Python', demand: 1750, prevDemand: 1500, rate: 'Rp 200rb', rateType: 'per hour' },
  { name: 'Tailwind CSS', demand: 1600, prevDemand: 1450, rate: 'Rp 100rb', rateType: 'per hour' },
  { name: 'Flutter', demand: 1450, prevDemand: 1300, rate: 'Rp 170rb', rateType: 'per hour' },
  { name: 'TypeScript', demand: 1400, prevDemand: 1200, rate: 'Rp 160rb', rateType: 'per hour' },
  { name: 'Adobe Premiere', demand: 1250, prevDemand: 1300, rate: 'Rp 110rb', rateType: 'per hour' },
  { name: 'SQL', demand: 1100, prevDemand: 1050, rate: 'Rp 150rb', rateType: 'per hour' },
  { name: 'Next.js', demand: 1050, prevDemand: 800, rate: 'Rp 160rb', rateType: 'per hour' },
  { name: 'Adobe Illustrator', demand: 950, prevDemand: 1000, rate: 'Rp 90rb', rateType: 'per hour' },
  { name: 'AWS', demand: 850, prevDemand: 800, rate: 'Rp 250rb', rateType: 'per hour' },
  { name: 'Docker', demand: 750, prevDemand: 700, rate: 'Rp 220rb', rateType: 'per hour' },
  { name: 'Copywriting', demand: 720, prevDemand: 650, rate: 'Rp 80rb', rateType: 'per hour' },
  { name: 'Canva', demand: 680, prevDemand: 700, rate: 'Rp 50rb', rateType: 'per hour' },
];

const Dashboard = () => {
  const [filterType, setFilterType] = useState('job');
  const [filterTime, setFilterTime] = useState('month');

  // Select data source
  let rawData = filterType === 'job' ? jobsData : skillsData;

  // Simulate "year" data by multiplying demands and adding some variance
  if (filterTime === 'year') {
    rawData = rawData.map(item => ({
      ...item,
      demand: item.demand * 8,
      prevDemand: item.prevDemand * 7.5, // slightly different trend for year
    }));
  }

  // Calculate trends and percentages
  const maxDemand = Math.max(...rawData.map(d => d.demand));
  
  const leaderboardData = rawData.map(item => {
    const pctChange = ((item.demand - item.prevDemand) / item.prevDemand) * 100;
    return {
      ...item,
      trend: pctChange,
      fillPct: (item.demand / maxDemand) * 100,
    };
  }).sort((a, b) => b.demand - a.demand).slice(0, 15); // Top 15

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="page-wrap" style={{ position: "relative" }}>

        {/* Header */}
        <div data-aos="fade-down" className="page-header">
          <div>
            <p className="label-mono" style={{ marginBottom: 10 }}>Market Intelligence</p>
            <h1 className="page-title">
              Top 15 Freelance{' '}
              <span className="page-title__muted">Leaderboard</span>
            </h1>
          </div>
          <div className="live-badge">
            <span className="live-badge__dot" />
            <span className="live-badge__text">Real-time Data</span>
          </div>
        </div>

        {/* Filters */}
        <div className="chart-filters" data-aos="fade-up" data-aos-delay="40">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="job">Kategori Pekerjaan</option>
            <option value="skill">Spesifik Skill</option>
          </select>
          <select value={filterTime} onChange={e => setFilterTime(e.target.value)}>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>

        {/* Leaderboard Chart */}
        <div className="panel" data-aos="fade-up" data-aos-delay="80">
          
          <div className="leaderboard">
            {/* Header row */}
            <div className="leaderboard-header">
              <div style={{ textAlign: 'center' }}>#</div>
              <div>{filterType === 'job' ? 'Pekerjaan' : 'Skill'}</div>
              <div>Rata-rata Pendapatan</div>
              <div>Volume Pencarian</div>
              <div style={{ textAlign: 'right' }}>Trend</div>
            </div>

            {/* Data rows */}
            {leaderboardData.map((item, i) => {
              const isUp = item.trend > 0;
              const isDown = item.trend < 0;
              const trendColor = isUp ? 'var(--green)' : isDown ? 'var(--amber)' : 'var(--fg-2)';
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
                  <div className="leaderboard-bar-wrap" title={`${item.demand.toLocaleString('id-ID')} pencarian`}>
                    <div 
                      className="leaderboard-bar-fill" 
                      style={{ 
                        width: `${Math.max(item.fillPct, 5)}%`, // min width 5% for visibility
                        background: i < 3 ? 'var(--indigo)' : 'var(--border-2)' 
                      }} 
                    />
                    <span style={{ 
                      position: 'absolute', 
                      left: 10, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      fontSize: 11.5, 
                      fontWeight: 600,
                      color: i < 3 ? '#ffffff' : 'var(--fg)',
                      pointerEvents: 'none'
                    }}>
                      {item.demand.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="leaderboard-trend" style={{ color: trendColor }}>
                    {item.trend > 0 && '+'}{item.trend.toFixed(1)}% <Icon size={12} strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Separator */}
        <Separator.Root style={{ height: 1, background: 'var(--border)', margin: '32px 0 16px 0' }} />

        {/* Notice */}
        <div data-aos="fade-up" className="alert alert--warning">
          <AlertTriangle size={13} color="var(--amber)" style={{ marginTop: 1.5, flexShrink: 0 }} />
          <p className="alert__text">
            Persentase trend membandingkan data pencarian {filterTime === 'month' ? 'bulan ini dengan bulan sebelumnya' : 'tahun ini dengan tahun sebelumnya'}.
          </p>
        </div>

      </div>
    </Tooltip.Provider>
  );
};

export default Dashboard;

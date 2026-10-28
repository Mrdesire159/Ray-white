import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Percent,
  BarChart3,
  Building,
  Home,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  DollarSign,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { REGIONS_MARKET_DATA, RegionData } from '../data/marketTrendsData';

interface MarketTrendsProps {
  onSelectRegionListing?: (regionName: string) => void;
  onRequestValuation?: () => void;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({
  onSelectRegionListing,
  onRequestValuation,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('sydney');
  const [activeTab, setActiveTab] = useState<'growth' | 'yields' | 'demand'>('growth');
  const [growthTimeframe, setGrowthTimeframe] = useState<'5y' | '12m'>('5y');
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    houseVal?: number | string;
    unitVal?: number | string;
    benchmarkVal?: number | string;
    extra?: string;
    x: number;
    y: number;
  } | null>(null);

  const currentRegion = useMemo(() => {
    return (
      REGIONS_MARKET_DATA.find((r) => r.id === selectedRegionId) ||
      REGIONS_MARKET_DATA[0]
    );
  }, [selectedRegionId]);

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG dimensions for charts
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Compute 5-Year SVG line paths
  const fiveYearPaths = useMemo(() => {
    const data = currentRegion.priceHistory;
    const allVals = data.flatMap((d) => [d.houses, d.units, d.benchmark]);
    const minVal = Math.floor(Math.min(...allVals) * 0.85);
    const maxVal = Math.ceil(Math.max(...allVals) * 1.1);

    const getX = (index: number) =>
      padding.left + (index / (data.length - 1)) * graphWidth;
    const getY = (val: number) =>
      padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;

    const housePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.houses), d }));
    const unitPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.units), d }));
    const benchmarkPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.benchmark), d }));

    const makeLinePath = (pts: { x: number; y: number }[]) => {
      return pts.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '');
    };

    const makeAreaPath = (pts: { x: number; y: number }[]) => {
      const line = makeLinePath(pts);
      const lastX = pts[pts.length - 1].x;
      const firstX = pts[0].x;
      const bottomY = padding.top + graphHeight;
      return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };

    return {
      houseLine: makeLinePath(housePoints),
      houseArea: makeAreaPath(housePoints),
      unitLine: makeLinePath(unitPoints),
      unitArea: makeAreaPath(unitPoints),
      benchmarkLine: makeLinePath(benchmarkPoints),
      housePoints,
      unitPoints,
      benchmarkPoints,
      minVal,
      maxVal,
    };
  }, [currentRegion.priceHistory]);

  // Compute 12-Month SVG line & bar paths
  const monthlyData = useMemo(() => {
    const data = currentRegion.monthlyGrowthTrend;
    const maxGrowth = Math.max(...data.map((d) => d.growth)) * 1.25;
    const maxVolume = Math.max(...data.map((d) => d.volume));

    const barWidth = graphWidth / data.length - 14;

    const items = data.map((d, i) => {
      const x = padding.left + i * (graphWidth / data.length) + 7;
      const barHeight = (d.growth / maxGrowth) * graphHeight;
      const y = padding.top + graphHeight - barHeight;
      return {
        ...d,
        x,
        y,
        width: barWidth,
        height: barHeight,
      };
    });

    return { items, maxGrowth, maxVolume };
  }, [currentRegion.monthlyGrowthTrend]);

  return (
    <section className="bg-white border-y border-neutral-200 py-14 sm:py-16 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD200]/20 text-neutral-900 text-xs font-bold border border-[#FFD200]/50 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-900" />
              <span>Ray White Econometric Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-neutral-950">
              Regional Market Trends &amp; Yield Analytics
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Track regional capital appreciation, gross rental yields, auction clearance rates, and property-type buyer demand backed by real-time Australasia settlement data.
            </p>
          </div>

          {/* Quick Valuation CTA */}
          <div className="flex items-center gap-2.5">
            {onRequestValuation && (
              <button
                type="button"
                onClick={onRequestValuation}
                className="px-4 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-neutral-950" />
                <span>Check Your Home Equity</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Region Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Region:
          </span>
          {REGIONS_MARKET_DATA.map((reg) => {
            const isSelected = reg.id === selectedRegionId;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => setSelectedRegionId(reg.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-neutral-950 text-[#FFD200] border-neutral-900 shadow-md ring-2 ring-neutral-900/10'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                <span>{reg.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-sm font-black ${
                    isSelected ? 'bg-[#FFD200] text-neutral-950' : 'bg-neutral-300 text-neutral-800'
                  }`}
                >
                  +{reg.annualHouseGrowth}% YoY
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Key Metrics Snapshot Cards */}
        {/* 2. Key Metrics Snapshot Cards - Colorful & Well-Organized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {/* 1. Median House */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all">
            <div className="text-[11px] font-black text-emerald-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-700"><Home className="w-3.5 h-3.5" /></span>
              <span>Median House</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 tabular-nums">
              {formatCurrency(currentRegion.medianHousePrice)}
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{currentRegion.annualHouseGrowth}% 12M
            </div>
          </div>

          {/* 2. Median Unit */}
          <div className="bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white border border-blue-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all">
            <div className="text-[11px] font-black text-blue-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-blue-100 text-blue-700"><Building className="w-3.5 h-3.5" /></span>
              <span>Median Unit</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 tabular-nums">
              {formatCurrency(currentRegion.medianUnitPrice)}
            </div>
            <div className="text-[11px] font-extrabold text-blue-600 mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{currentRegion.annualUnitGrowth}% 12M
            </div>
          </div>

          {/* 3. Gross Yield */}
          <div className="bg-gradient-to-br from-violet-500/10 via-violet-50/40 to-white border border-violet-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-violet-400 transition-all">
            <div className="text-[11px] font-black text-violet-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-violet-100 text-violet-700"><Percent className="w-3.5 h-3.5" /></span>
              <span>Gross Yield</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 tabular-nums">
              {currentRegion.houseRentalYield}% / {currentRegion.unitRentalYield}%
            </div>
            <div className="text-[11px] font-bold text-violet-600 mt-1">
              Houses vs Units
            </div>
          </div>

          {/* 4. Median Rent */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white border border-amber-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-amber-400 transition-all">
            <div className="text-[11px] font-black text-amber-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-amber-100 text-amber-700"><DollarSign className="w-3.5 h-3.5" /></span>
              <span>Median Rent</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 tabular-nums">
              ${currentRegion.medianRentHouseWeekly}/wk
            </div>
            <div className="text-[11px] font-bold text-amber-700 mt-1">
              ${currentRegion.medianRentUnitWeekly}/wk units
            </div>
          </div>

          {/* 5. Clearance Rate */}
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white border border-rose-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-rose-400 transition-all">
            <div className="text-[11px] font-black text-rose-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-rose-100 text-rose-700"><Clock className="w-3.5 h-3.5" /></span>
              <span>Clearance Rate</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 tabular-nums">
              {currentRegion.auctionClearanceRate}%
            </div>
            <div className="text-[11px] font-bold text-rose-600 mt-1">
              Avg {currentRegion.avgDaysOnMarket} days on market
            </div>
          </div>

          {/* 6. Buyer Demand */}
          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-50/40 to-white border border-cyan-300/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all">
            <div className="text-[11px] font-black text-cyan-800 uppercase flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-cyan-100 text-cyan-700"><Compass className="w-3.5 h-3.5" /></span>
              <span>Buyer Demand</span>
            </div>
            <div className="text-xl font-black text-neutral-950 mt-2 flex items-center gap-1 tabular-nums">
              <span>{currentRegion.buyerDemandIndex}</span>
              <span className="text-xs text-neutral-400 font-normal">/100</span>
            </div>
            <div className="text-[11px] font-bold text-cyan-700 mt-1">
              {currentRegion.vacancyRate}% vacancy rate
            </div>
          </div>
        </div>

        {/* 3. Interactive Chart Visualizer Container */}
        <div className="relative bg-gradient-to-br from-slate-950 via-[#0a1229] to-[#0f1d3e] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/20 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Chart Controls Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-black/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('growth')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'growth'
                    ? 'bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Regional Price Growth</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('yields')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'yields'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Median Rental Yields</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('demand')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'demand'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Property Type Demand</span>
              </button>
            </div>

            {/* Secondary Timeframe or Legend Options */}
            {activeTab === 'growth' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setGrowthTimeframe('5y')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      growthTimeframe === '5y'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    5-Year Capital Gain
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrowthTimeframe('12m')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      growthTimeframe === '12m'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    12-Month Momentum
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: REGIONAL PROPERTY PRICE GROWTH CHART */}
          {activeTab === 'growth' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentRegion.name} Price Growth Trajectory</span>
                    <span className="text-xs font-normal text-neutral-400">
                      ({growthTimeframe === '5y' ? '2020 – 2025 Historical & Forecast' : 'Monthly Rate & Settlement Volume'})
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {growthTimeframe === '5y'
                      ? 'Comparison of Detached Luxury Houses vs Urban Units against the National Combined Capital Benchmark.'
                      : 'Rolling monthly capital gain (%) and recorded sales volume throughout the last 12 months.'}
                  </p>
                </div>

                {/* Legend */}
                {growthTimeframe === '5y' ? (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#FFD200]" />
                      <span className="text-neutral-300 font-semibold">Houses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan-400" />
                      <span className="text-neutral-300 font-semibold">Units / Apts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t border-dashed border-neutral-400" />
                      <span className="text-neutral-400">National Benchmark</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#FFD200]" />
                      <span className="text-neutral-300 font-semibold">Monthly Growth %</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[550px] select-none"
                >
                  <defs>
                    <linearGradient id="houseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD200" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FFD200" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="unitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + ratio * graphHeight;
                    const val =
                      growthTimeframe === '5y'
                        ? Math.round(
                            fiveYearPaths.maxVal -
                              ratio * (fiveYearPaths.maxVal - fiveYearPaths.minVal)
                          )
                        : (monthlyData.maxGrowth * (1 - ratio)).toFixed(1);

                    return (
                      <g key={i}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#262626"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          fill="#737373"
                          fontSize="10"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {growthTimeframe === '5y' ? `$${val}k` : `+${val}%`}
                        </text>
                      </g>
                    );
                  })}

                  {/* 5-Year Chart Lines */}
                  {growthTimeframe === '5y' && (
                    <>
                      {/* Area fills */}
                      <path d={fiveYearPaths.houseArea} fill="url(#houseGradient)" />
                      <path d={fiveYearPaths.unitArea} fill="url(#unitGradient)" />

                      {/* Benchmark line */}
                      <path
                        d={fiveYearPaths.benchmarkLine}
                        fill="none"
                        stroke="#737373"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />

                      {/* Unit line */}
                      <path
                        d={fiveYearPaths.unitLine}
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* House line */}
                      <path
                        d={fiveYearPaths.houseLine}
                        fill="none"
                        stroke="#FFD200"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Interactive nodes */}
                      {fiveYearPaths.housePoints.map((pt, i) => (
                        <g key={`node-${i}`}>
                          {/* Vertical guide on hover */}
                          <line
                            x1={pt.x}
                            y1={padding.top}
                            x2={pt.x}
                            y2={padding.top + graphHeight}
                            stroke="#404040"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            opacity="0.6"
                          />

                          {/* Unit circle */}
                          <circle
                            cx={fiveYearPaths.unitPoints[i].x}
                            cy={fiveYearPaths.unitPoints[i].y}
                            r="4.5"
                            fill="#22D3EE"
                            stroke="#0a0a0a"
                            strokeWidth="2"
                          />

                          {/* House circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="6"
                            fill="#FFD200"
                            stroke="#0a0a0a"
                            strokeWidth="2.5"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                label: `${pt.d.year} Median Values`,
                                houseVal: `$${pt.d.houses.toLocaleString()},000`,
                                unitVal: `$${pt.d.units.toLocaleString()},000`,
                                benchmarkVal: `$${pt.d.benchmark.toLocaleString()},000`,
                                extra:
                                  i > 0
                                    ? `+${(
                                        ((pt.d.houses -
                                          fiveYearPaths.housePoints[i - 1].d.houses) /
                                          fiveYearPaths.housePoints[i - 1].d.houses) *
                                        100
                                      ).toFixed(1)}% YoY`
                                    : 'Baseline',
                                x: pt.x,
                                y: pt.y,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />

                          {/* Year label */}
                          <text
                            x={pt.x}
                            y={chartHeight - 12}
                            fill="#A3A3A3"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.d.year}
                          </text>
                        </g>
                      ))}
                    </>
                  )}

                  {/* 12-Month Momentum Bar Chart */}
                  {growthTimeframe === '12m' && (
                    <>
                      {monthlyData.items.map((m, i) => (
                        <g key={`bar-${i}`}>
                          {/* Bar */}
                          <rect
                            x={m.x}
                            y={m.y}
                            width={m.width}
                            height={m.height}
                            rx="4"
                            fill="#FFD200"
                            opacity="0.9"
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                label: `${m.month} Momentum`,
                                houseVal: `+${m.growth}% MoM Growth`,
                                extra: `${m.volume} Verified Transactions`,
                                x: m.x + m.width / 2,
                                y: m.y,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />

                          {/* Value on top of bar */}
                          <text
                            x={m.x + m.width / 2}
                            y={m.y - 6}
                            fill="#FFD200"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            +{m.growth}%
                          </text>

                          {/* Month label */}
                          <text
                            x={m.x + m.width / 2}
                            y={chartHeight - 12}
                            fill="#A3A3A3"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {m.month}
                          </text>
                        </g>
                      ))}
                    </>
                  )}
                </svg>

                {/* Floating Tooltip */}
                {hoveredPoint && (
                  <div
                    className="absolute z-20 pointer-events-none bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl shadow-2xl text-xs -translate-x-1/2 -translate-y-full mb-3 min-w-[170px]"
                    style={{
                      left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                      top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                    }}
                  >
                    <div className="font-extrabold text-[#FFD200] pb-1 border-b border-neutral-800">
                      {hoveredPoint.label}
                    </div>
                    {hoveredPoint.houseVal && (
                      <div className="flex items-center justify-between gap-3 mt-1.5">
                        <span className="text-neutral-400">Houses:</span>
                        <span className="font-bold text-white">{hoveredPoint.houseVal}</span>
                      </div>
                    )}
                    {hoveredPoint.unitVal && (
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-neutral-400">Units:</span>
                        <span className="font-bold text-cyan-300">{hoveredPoint.unitVal}</span>
                      </div>
                    )}
                    {hoveredPoint.benchmarkVal && (
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-neutral-500">Benchmark:</span>
                        <span className="font-medium text-neutral-400">{hoveredPoint.benchmarkVal}</span>
                      </div>
                    )}
                    {hoveredPoint.extra && (
                      <div className="mt-1.5 pt-1 border-t border-neutral-800 text-[10px] text-emerald-400 font-bold">
                        {hoveredPoint.extra}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEDIAN RENTAL YIELDS & CASHFLOW */}
          {activeTab === 'yields' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentRegion.name} Median Rental Yields &amp; Cashflow Matrix
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Gross rental yields against average weekly rents for detached residences and multi-residential units.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Vacancy: <strong className="text-white">{currentRegion.vacancyRate}%</strong> (Extreme Landlord Favor)</span>
                </div>
              </div>

              {/* Yield comparative visual bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* House Rental Profile */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD200]/20 flex items-center justify-center text-[#FFD200]">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Detached Houses Yield</div>
                        <div className="text-xs text-neutral-400">{currentRegion.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#FFD200]">
                        {currentRegion.houseRentalYield}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">
                        Gross Yield
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Gross Rental Yield:</span>
                        <span className="font-bold text-white">{currentRegion.houseRentalYield}% p.a.</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-[#FFD200] h-full rounded-full transition-all duration-700"
                          style={{ width: `${(currentRegion.houseRentalYield / 8) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Median Weekly Rent:</span>
                        <span className="font-bold text-white">${currentRegion.medianRentHouseWeekly}/week</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${(currentRegion.medianRentHouseWeekly / 1500) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-400">Annual Rent Return:</span>
                        <div className="font-bold text-white mt-0.5">
                          ${(currentRegion.medianRentHouseWeekly * 52).toLocaleString()} / yr
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-400">12M Rent Escalation:</span>
                        <div className="font-bold text-emerald-400 mt-0.5">+9.8% YoY</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unit / Apartment Rental Profile */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Multi-Unit / Apts Yield</div>
                        <div className="text-xs text-neutral-400">{currentRegion.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan-400">
                        {currentRegion.unitRentalYield}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">
                        Gross Yield
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Gross Rental Yield:</span>
                        <span className="font-bold text-white">{currentRegion.unitRentalYield}% p.a.</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${(currentRegion.unitRentalYield / 8) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">Median Weekly Rent:</span>
                        <span className="font-bold text-white">${currentRegion.medianRentUnitWeekly}/week</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${(currentRegion.medianRentUnitWeekly / 1500) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-400">Annual Rent Return:</span>
                        <div className="font-bold text-white mt-0.5">
                          ${(currentRegion.medianRentUnitWeekly * 52).toLocaleString()} / yr
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-400">12M Rent Escalation:</span>
                        <div className="font-bold text-emerald-400 mt-0.5">+11.2% YoY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Regions Comparative Yield Bar Chart */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  All Major Capital Cities Rental Yield Comparison
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {REGIONS_MARKET_DATA.map((r) => {
                    const isSelected = r.id === selectedRegionId;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRegionId(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-neutral-800 border-[#FFD200] shadow-sm'
                            : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="text-xs font-bold text-white truncate">{r.name.split('&')[0]}</div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-[11px] text-neutral-400">Units Yield:</span>
                          <span className="text-sm font-black text-cyan-400">{r.unitRentalYield}%</span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-[11px] text-neutral-400">Houses Yield:</span>
                          <span className="text-sm font-black text-[#FFD200]">{r.houseRentalYield}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEMAND CHARTS FOR DIFFERENT PROPERTY TYPES */}
          {activeTab === 'demand' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentRegion.name} Buyer Demand &amp; Clearance by Property Type
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Comparative clearance rates, buyer inquiry volume scores, and annual price growth across 5 property categories.
                  </p>
                </div>
                <div className="text-xs text-neutral-400">
                  Total Active Inquiries: <strong className="text-[#FFD200]">28,450 this month</strong>
                </div>
              </div>

              {/* Demand Cards / Horizontal Data Visualization */}
              <div className="space-y-3">
                {currentRegion.propertyTypeDemand.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Property Type & Median */}
                      <div className="w-full lg:w-1/4">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          Type {idx + 1}
                        </div>
                        <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                          {item.type}
                        </div>
                        <div className="text-xs font-bold text-[#FFD200] mt-1">
                          Median {item.medianPriceDisplay}
                        </div>
                      </div>

                      {/* Demand Score Meter */}
                      <div className="w-full lg:w-1/4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">Buyer Demand Index:</span>
                          <span className="font-extrabold text-[#FFD200]">{item.demandScore} / 100</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#FFD200] h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.demandScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Auction Clearance Rate */}
                      <div className="w-full lg:w-1/4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">Auction Clearance:</span>
                          <span className="font-extrabold text-cyan-400">{item.clearanceRate}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.clearanceRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats & Turnaround */}
                      <div className="w-full lg:w-1/4 flex items-center justify-between lg:justify-end gap-6 text-xs">
                        <div>
                          <div className="text-neutral-400 text-[11px]">Avg Days:</div>
                          <div className="font-bold text-white text-sm">{item.avgDaysOnMarket} days</div>
                        </div>
                        <div className="text-right">
                          <div className="text-neutral-400 text-[11px]">YoY Growth:</div>
                          <div className="font-bold text-emerald-400 text-sm">+{item.priceGrowthYoY}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Bottom Commentary Box */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[#FFD200] shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFD200] uppercase tracking-wider">
                  Ray White Market Commentary
                </span>
                <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed max-w-3xl">
                  {currentRegion.summary}
                </p>
              </div>
            </div>

            {onSelectRegionListing && (
              <button
                type="button"
                onClick={() => onSelectRegionListing(currentRegion.state)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border border-neutral-700 cursor-pointer transition-colors"
              >
                <span>Browse {currentRegion.state} Residences</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#FFD200]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

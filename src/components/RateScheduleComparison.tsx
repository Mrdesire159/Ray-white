import React, { useState, useMemo } from 'react';
import {
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Percent,
  Calendar,
  Sliders,
  Table,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export interface RateScheduleComparisonProps {
  propertyPrice: number;
  propertyAddress?: string;
  initialRateA?: number;
  initialRateB?: number;
  inline?: boolean;
}

export const RateScheduleComparison: React.FC<RateScheduleComparisonProps> = ({
  propertyPrice,
  propertyAddress = '',
  initialRateA = 5.49,
  initialRateB = 6.49,
  inline = true,
}) => {
  const defaultPrice = propertyPrice > 0 ? propertyPrice : 1500000;

  // Loan Configuration
  const [purchasePrice, setPurchasePrice] = useState<number>(defaultPrice);
  const [depositPercent, setDepositPercent] = useState<number>(20);
  const [depositAmount, setDepositAmount] = useState<number>(Math.round(defaultPrice * 0.2));
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [repaymentFrequency, setRepaymentFrequency] = useState<'monthly' | 'fortnightly' | 'weekly'>('monthly');

  // Dual Rates State
  const [rateA, setRateA] = useState<number>(initialRateA);
  const [rateB, setRateB] = useState<number>(initialRateB);
  const [labelA, setLabelA] = useState<string>('Rate Option A (Prime Offer)');
  const [labelB, setLabelB] = useState<string>('Rate Option B (Comparison / Hike)');

  // View Options
  const [chartView, setChartView] = useState<'cumulative' | 'balance' | 'annual'>('cumulative');
  const [tableFilterMode, setTableFilterMode] = useState<'all' | 'milestones'>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [showScheduleTable, setShowScheduleTable] = useState<boolean>(true);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync deposit amount on price change
  const handlePriceChange = (val: number) => {
    const p = Math.max(0, val);
    setPurchasePrice(p);
    setDepositAmount(Math.round(p * (depositPercent / 100)));
  };

  const handleDepositPercentChange = (pct: number) => {
    setDepositPercent(pct);
    setDepositAmount(Math.round(purchasePrice * (pct / 100)));
  };

  const handleDepositAmountChange = (amt: number) => {
    const valid = Math.max(0, Math.min(purchasePrice, amt));
    setDepositAmount(valid);
    if (purchasePrice > 0) {
      setDepositPercent(Math.round((valid / purchasePrice) * 100));
    }
  };

  const loanAmount = useMemo(() => {
    return Math.max(0, purchasePrice - depositAmount);
  }, [purchasePrice, depositAmount]);

  // Calculations for Rate A
  const metricsA = useMemo(() => {
    const monthlyRate = rateA / 100 / 12;
    const totalMonths = loanTermYears * 12;
    let monthlyPayment = 0;

    if (loanAmount <= 0) {
      monthlyPayment = 0;
    } else if (monthlyRate === 0) {
      monthlyPayment = Math.round(loanAmount / totalMonths);
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
    }

    const periodicPayment =
      repaymentFrequency === 'monthly'
        ? monthlyPayment
        : repaymentFrequency === 'fortnightly'
        ? Math.round((monthlyPayment * 12) / 26)
        : Math.round((monthlyPayment * 12) / 52);

    const totalPaid = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalPaid - loanAmount);

    return { monthlyPayment, periodicPayment, totalPaid, totalInterest, totalMonths };
  }, [loanAmount, rateA, loanTermYears, repaymentFrequency]);

  // Calculations for Rate B
  const metricsB = useMemo(() => {
    const monthlyRate = rateB / 100 / 12;
    const totalMonths = loanTermYears * 12;
    let monthlyPayment = 0;

    if (loanAmount <= 0) {
      monthlyPayment = 0;
    } else if (monthlyRate === 0) {
      monthlyPayment = Math.round(loanAmount / totalMonths);
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
    }

    const periodicPayment =
      repaymentFrequency === 'monthly'
        ? monthlyPayment
        : repaymentFrequency === 'fortnightly'
        ? Math.round((monthlyPayment * 12) / 26)
        : Math.round((monthlyPayment * 12) / 52);

    const totalPaid = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalPaid - loanAmount);

    return { monthlyPayment, periodicPayment, totalPaid, totalInterest, totalMonths };
  }, [loanAmount, rateB, loanTermYears, repaymentFrequency]);

  // Generate Year-by-Year Amortization Schedule for BOTH rates side-by-side
  const comparisonSchedule = useMemo(() => {
    if (loanAmount <= 0 || loanTermYears <= 0) return [];

    const monthlyRateA = rateA / 100 / 12;
    const monthlyRateB = rateB / 100 / 12;

    let balanceA = loanAmount;
    let balanceB = loanAmount;

    let cumPrincipalA = 0;
    let cumInterestA = 0;
    let cumPrincipalB = 0;
    let cumInterestB = 0;

    let crossoverYearA: number | null = null;
    let crossoverYearB: number | null = null;

    const rows = [];

    for (let year = 1; year <= loanTermYears; year++) {
      let yearPrincipalA = 0;
      let yearInterestA = 0;
      let yearPrincipalB = 0;
      let yearInterestB = 0;

      const startingBalA = Math.round(balanceA);
      const startingBalB = Math.round(balanceB);

      // 12 months in this year
      for (let m = 0; m < 12; m++) {
        // Rate A
        if (balanceA > 0) {
          const interestA = balanceA * monthlyRateA;
          const principalA = Math.min(balanceA, metricsA.monthlyPayment - interestA);
          yearInterestA += interestA;
          yearPrincipalA += principalA;
          balanceA = Math.max(0, balanceA - principalA);
        }

        // Rate B
        if (balanceB > 0) {
          const interestB = balanceB * monthlyRateB;
          const principalB = Math.min(balanceB, metricsB.monthlyPayment - interestB);
          yearInterestB += interestB;
          yearPrincipalB += principalB;
          balanceB = Math.max(0, balanceB - principalB);
        }
      }

      cumPrincipalA += yearPrincipalA;
      cumInterestA += yearInterestA;
      cumPrincipalB += yearPrincipalB;
      cumInterestB += yearInterestB;

      if (!crossoverYearA && yearPrincipalA >= yearInterestA) {
        crossoverYearA = year;
      }
      if (!crossoverYearB && yearPrincipalB >= yearInterestB) {
        crossoverYearB = year;
      }

      const annualInterestDelta = Math.round(yearInterestB - yearInterestA);
      const cumulativeInterestDelta = Math.round(cumInterestB - cumInterestA);

      rows.push({
        year,
        yearLabel: `Yr ${year}`,
        startingBalA,
        principalA: Math.round(yearPrincipalA),
        interestA: Math.round(yearInterestA),
        endingBalA: Math.round(balanceA),
        cumPrincipalA: Math.round(cumPrincipalA),
        cumInterestA: Math.round(cumInterestA),
        totalPaidA: Math.round(cumPrincipalA + cumInterestA),
        equityPercentA: Math.min(100, Math.round((cumPrincipalA / loanAmount) * 100)),

        startingBalB,
        principalB: Math.round(yearPrincipalB),
        interestB: Math.round(yearInterestB),
        endingBalB: Math.round(balanceB),
        cumPrincipalB: Math.round(cumPrincipalB),
        cumInterestB: Math.round(cumInterestB),
        totalPaidB: Math.round(cumPrincipalB + cumInterestB),
        equityPercentB: Math.min(100, Math.round((cumPrincipalB / loanAmount) * 100)),

        annualInterestDelta,
        cumulativeInterestDelta,
        isCrossoverA: crossoverYearA === year,
        isCrossoverB: crossoverYearB === year,
      });

      if (balanceA <= 0 && balanceB <= 0) break;
    }

    return rows;
  }, [loanAmount, rateA, rateB, loanTermYears, metricsA.monthlyPayment, metricsB.monthlyPayment]);

  // Filtered rows for the table view
  const displayedRows = useMemo(() => {
    let filtered = comparisonSchedule;

    if (tableFilterMode === 'milestones') {
      const milestoneYears = new Set([1, 2, 3, 5, 10, 15, 20, 25, 30, loanTermYears]);
      filtered = filtered.filter((r) => milestoneYears.has(r.year) || r.endingBalA === 0 || r.endingBalB === 0);
    }

    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.year.toString().includes(q) ||
          r.yearLabel.toLowerCase().includes(q) ||
          (r.isCrossoverA && 'crossover'.includes(q)) ||
          (r.isCrossoverB && 'crossover'.includes(q))
      );
    }

    return filtered;
  }, [comparisonSchedule, tableFilterMode, tableSearchQuery, loanTermYears]);

  // Overall Variance Metrics
  const rateDelta = Number((rateB - rateA).toFixed(2));
  const periodicDelta = Math.abs(metricsB.periodicPayment - metricsA.periodicPayment);
  const monthlyDelta = Math.abs(metricsB.monthlyPayment - metricsA.monthlyPayment);
  const lifetimeInterestDelta = Math.abs(metricsB.totalInterest - metricsA.totalInterest);
  const higherRateIsB = rateB >= rateA;

  // 5-Year and 10-Year Interest Gaps
  const fiveYearInterestA = comparisonSchedule.length >= 5 ? comparisonSchedule[4].cumInterestA : 0;
  const fiveYearInterestB = comparisonSchedule.length >= 5 ? comparisonSchedule[4].cumInterestB : 0;
  const fiveYearGap = Math.abs(fiveYearInterestB - fiveYearInterestA);

  const tenYearInterestA = comparisonSchedule.length >= 10 ? comparisonSchedule[9].cumInterestA : 0;
  const tenYearInterestB = comparisonSchedule.length >= 10 ? comparisonSchedule[9].cumInterestB : 0;
  const tenYearGap = Math.abs(tenYearInterestB - tenYearInterestA);

  // Quick Preset Handlers
  const applyPresetHike = (delta: number) => {
    const base = rateA;
    setRateB(Number((base + delta).toFixed(2)));
    setLabelB(`Rate Option B (+${delta.toFixed(2)}% Hike)`);
  };

  const applyCustomPreset = (a: number, b: number, nameA: string, nameB: string) => {
    setRateA(a);
    setRateB(b);
    setLabelA(nameA);
    setLabelB(nameB);
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Year',
      `Rate A (${rateA}%) Starting Balance ($)`,
      `Rate A (${rateA}%) Principal Paid ($)`,
      `Rate A (${rateA}%) Interest Paid ($)`,
      `Rate A (${rateA}%) Ending Balance ($)`,
      `Rate A (${rateA}%) Cumul. Interest ($)`,
      `Rate B (${rateB}%) Starting Balance ($)`,
      `Rate B (${rateB}%) Principal Paid ($)`,
      `Rate B (${rateB}%) Interest Paid ($)`,
      `Rate B (${rateB}%) Ending Balance ($)`,
      `Rate B (${rateB}%) Cumul. Interest ($)`,
      'Annual Interest Difference ($)',
      'Cumulative Cost Gap ($)',
    ];

    const rows = comparisonSchedule.map((r) => [
      `Year ${r.year}`,
      r.startingBalA,
      r.principalA,
      r.interestA,
      r.endingBalA,
      r.cumInterestA,
      r.startingBalB,
      r.principalB,
      r.interestB,
      r.endingBalB,
      r.cumInterestB,
      r.annualInterestDelta,
      r.cumulativeInterestDelta,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RayWhite_Rate_Comparison_${rateA}pct_vs_${rateB}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Chart Tooltip
  const CustomCompareTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = comparisonSchedule.find((r) => r.yearLabel === label);
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-xl border border-neutral-700 shadow-2xl backdrop-blur-md text-xs min-w-[240px]">
          <div className="font-bold text-amber-400 mb-2 border-b border-neutral-800 pb-1.5 flex items-center justify-between">
            <span>{label} Cost Comparison</span>
            <span className="text-[10px] text-neutral-400 font-normal">Side-by-Side</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-blue-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>Rate A ({rateA}%):</span>
              </span>
              <span className="font-extrabold tabular-nums">
                ${Number(payload[0]?.value || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-red-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span>Rate B ({rateB}%):</span>
              </span>
              <span className="font-extrabold tabular-nums">
                ${Number(payload[1]?.value || 0).toLocaleString()}
              </span>
            </div>

            {row && (
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-emerald-300 font-bold">
                <span>Cost Difference:</span>
                <span className="tabular-nums">
                  {higherRateIsB ? '+' : '-'}${Math.abs(row.cumulativeInterestDelta).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Theme Identity */}
      <div className="bg-gradient-to-r from-blue-900 via-neutral-900 to-red-950 p-5 sm:p-6 rounded-2xl text-white shadow-lg border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-xs">
                Oceanic Blue
              </span>
              <span className="text-white/40 font-bold">vs</span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                Crimson Red
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-neutral-950 shadow-xs">
                Light Mint Savings
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-1">
              <Scale className="w-6 h-6 text-[#FFD200]" />
              <span>Side-by-Side Interest Rate Comparison</span>
            </h3>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Compare exact loan repayment schedules between two interest rates. See the true compounding cost-of-borrowing gap over 5, 10, 20, and 30 years for{' '}
              <strong className="text-white">{propertyAddress || 'this property'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Top Export Button - Light Mint Green Theme */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              title="Download side-by-side comparison CSV"
            >
              <Download className="w-3.5 h-3.5 text-neutral-950" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Rate Presets Bar - Each button with distinct theme color */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-semibold text-[11px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#FFD200]" />
            <span>Quick Scenarios:</span>
          </span>
          {/* Preset 1: +0.50% Hike - Oceanic Royal Blue */}
          <button
            type="button"
            onClick={() => applyPresetHike(0.5)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-xs active:scale-95 border border-blue-400/40"
          >
            +0.50% Hike
          </button>
          {/* Preset 2: +1.00% Bank Spread - Fresh Emerald Green */}
          <button
            type="button"
            onClick={() => applyPresetHike(1.0)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-xs active:scale-95 border border-emerald-400/40"
          >
            +1.00% Bank Spread
          </button>
          {/* Preset 3: +1.50% RBA Stress Test - Bold Crimson Red */}
          <button
            type="button"
            onClick={() => applyPresetHike(1.5)}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-xs active:scale-95 border border-red-400/40"
          >
            +1.50% RBA Stress Test
          </button>
          {/* Preset 4: 5.39% Special vs 6.29% Standard - Teal/Cyan Blue */}
          <button
            type="button"
            onClick={() => applyCustomPreset(5.39, 6.29, 'Bank Special Offer (5.39%)', 'Standard Variable (6.29%)')}
            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-xs active:scale-95 border border-teal-400/40"
          >
            5.39% Special vs 6.29% Standard
          </button>
          {/* Preset 5: Reset - Coral/Rose Red */}
          <button
            type="button"
            onClick={() => applyCustomPreset(5.49, 6.49, 'Rate Option A (5.49%)', 'Rate Option B (6.49%)')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer ml-auto flex items-center gap-1 shadow-xs active:scale-95 border border-rose-400/40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Input Controls: Dual Rates & Loan Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rate Option A (Blue Card) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-blue-500/40 p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
              <h4 className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Rate Option A (Blue)
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Base / Preferred
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-semibold">Custom Label</label>
            <input
              type="text"
              value={labelA}
              onChange={(e) => setLabelA(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Interest Rate (% p.a.)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="14.0"
                  value={rateA}
                  onChange={(e) => setRateA(Math.max(0.1, Number(e.target.value) || 0))}
                  className="w-20 text-right text-base font-black text-blue-700 bg-blue-50 border border-blue-300 rounded-lg px-2 py-1 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-neutral-500">%</span>
              </div>
            </div>

            <input
              type="range"
              min="3.0"
              max="11.0"
              step="0.05"
              value={rateA}
              onChange={(e) => setRateA(Number(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
              <span>3.0%</span>
              <span>7.0%</span>
              <span>11.0%</span>
            </div>
          </div>

          {/* Quick Stats A */}
          <div className="pt-3 border-t border-neutral-100 bg-blue-50/60 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">
                {repaymentFrequency.charAt(0).toUpperCase() + repaymentFrequency.slice(1)} Payment:
              </span>
              <span className="font-extrabold text-blue-900 text-sm tabular-nums">
                ${metricsA.periodicPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Lifetime Interest:</span>
              <span className="font-bold text-neutral-800 tabular-nums">
                ${metricsA.totalInterest.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Rate Option B (Red Card) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-red-500/40 p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 shadow-xs" />
              <h4 className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Rate Option B (Red)
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              Alternative / Higher
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-semibold">Custom Label</label>
            <input
              type="text"
              value={labelB}
              onChange={(e) => setLabelB(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Interest Rate (% p.a.)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="14.0"
                  value={rateB}
                  onChange={(e) => setRateB(Math.max(0.1, Number(e.target.value) || 0))}
                  className="w-20 text-right text-base font-black text-red-700 bg-red-50 border border-red-300 rounded-lg px-2 py-1 tabular-nums focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-neutral-500">%</span>
              </div>
            </div>

            <input
              type="range"
              min="3.0"
              max="11.0"
              step="0.05"
              value={rateB}
              onChange={(e) => setRateB(Number(e.target.value))}
              className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
              <span>3.0%</span>
              <span>7.0%</span>
              <span>11.0%</span>
            </div>
          </div>

          {/* Quick Stats B */}
          <div className="pt-3 border-t border-neutral-100 bg-red-50/60 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">
                {repaymentFrequency.charAt(0).toUpperCase() + repaymentFrequency.slice(1)} Payment:
              </span>
              <span className="font-extrabold text-red-900 text-sm tabular-nums">
                ${metricsB.periodicPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Lifetime Interest:</span>
              <span className="font-bold text-neutral-800 tabular-nums">
                ${metricsB.totalInterest.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Global Loan Settings & Term (Organized Side Card) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-neutral-600" />
              <span>Loan Parameters</span>
            </span>
            <span className="text-[11px] font-extrabold text-neutral-950 tabular-nums">
              Loan: ${loanAmount.toLocaleString()}
            </span>
          </div>

          {/* Purchase Price Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Purchase Price</span>
              <span className="font-bold text-neutral-900 tabular-nums">
                ${purchasePrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="300000"
              max="5000000"
              step="25000"
              value={purchasePrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Deposit Percent */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Deposit</span>
              <span className="font-bold text-neutral-900 tabular-nums">
                ${depositAmount.toLocaleString()} ({depositPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { pct: 10, active: 'bg-blue-600 text-white font-black shadow-xs', inactive: 'bg-blue-50 text-blue-800 hover:bg-blue-100' },
                { pct: 20, active: 'bg-emerald-600 text-white font-black shadow-xs', inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' },
                { pct: 30, active: 'bg-red-600 text-white font-black shadow-xs', inactive: 'bg-red-50 text-red-800 hover:bg-red-100' },
                { pct: 40, active: 'bg-indigo-600 text-white font-black shadow-xs', inactive: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100' },
              ].map((item) => (
                <button
                  key={item.pct}
                  type="button"
                  onClick={() => handleDepositPercentChange(item.pct)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    depositPercent === item.pct ? item.active : item.inactive
                  }`}
                >
                  {item.pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Loan Term - Each button distinct theme color */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Loan Term</span>
              <span className="font-bold text-neutral-900 tabular-nums">{loanTermYears} Years</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { yr: 15, active: 'bg-blue-600 text-white font-black shadow-xs', inactive: 'bg-blue-50 text-blue-800 hover:bg-blue-100' },
                { yr: 20, active: 'bg-emerald-600 text-white font-black shadow-xs', inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' },
                { yr: 25, active: 'bg-red-600 text-white font-black shadow-xs', inactive: 'bg-red-50 text-red-800 hover:bg-red-100' },
                { yr: 30, active: 'bg-slate-900 text-white font-black shadow-xs', inactive: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
              ].map((item) => (
                <button
                  key={item.yr}
                  type="button"
                  onClick={() => setLoanTermYears(item.yr)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    loanTermYears === item.yr ? item.active : item.inactive
                  }`}
                >
                  {item.yr}y
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Toggle - Blue, Green, Red themes */}
          <div className="pt-1">
            <div className="flex items-center gap-1 p-0.5 bg-neutral-200/70 rounded-xl text-xs font-semibold shadow-inner">
              {[
                { freq: 'monthly' as const, label: 'Monthly', active: 'bg-blue-600 text-white font-black shadow-xs', inactive: 'text-blue-900 hover:bg-blue-100' },
                { freq: 'fortnightly' as const, label: 'Fortnightly', active: 'bg-emerald-600 text-white font-black shadow-xs', inactive: 'text-emerald-900 hover:bg-emerald-100' },
                { freq: 'weekly' as const, label: 'Weekly', active: 'bg-red-600 text-white font-black shadow-xs', inactive: 'text-red-900 hover:bg-red-100' },
              ].map((item) => (
                <button
                  key={item.freq}
                  type="button"
                  onClick={() => setRepaymentFrequency(item.freq)}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer capitalize text-[11px] ${
                    repaymentFrequency === item.freq
                      ? item.active
                      : item.inactive
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Executive Impact & Cost-of-Borrowing Divergence Cards (Light Green Showcase) */}
      <div className="bg-emerald-50/70 rounded-2xl border-2 border-emerald-500/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-neutral-950">
                Cost of Borrowing Divergence &amp; Savings
              </h4>
              <p className="text-xs text-neutral-600">
                Rate variance of <strong className="text-neutral-900">{Math.abs(rateDelta)}% p.a.</strong> ({rateA}% vs {rateB}%)
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {higherRateIsB ? `${labelA} Saves Pure Cash` : `${labelB} Saves Pure Cash`}
            </span>
          </div>
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              {repaymentFrequency} Payment Gap
            </span>
            <div className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">
              +${periodicDelta.toLocaleString()}
            </div>
            <p className="text-[10px] text-neutral-500">
              ${monthlyDelta.toLocaleString()} extra per month on {higherRateIsB ? 'Rate B' : 'Rate A'}
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              First 5 Years Extra Cost
            </span>
            <div className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">
              +${fiveYearGap.toLocaleString()}
            </div>
            <p className="text-[10px] text-neutral-500">
              Immediate cumulative cash drain
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              First 10 Years Extra Cost
            </span>
            <div className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">
              +${tenYearGap.toLocaleString()}
            </div>
            <p className="text-[10px] text-neutral-500">
              Compounds before equity crossover
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Lifetime Interest Delta
            </span>
            <div className="text-lg sm:text-2xl font-black text-neutral-950 tabular-nums">
              +${lifetimeInterestDelta.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-700 font-bold">
              Total wealth preserved by picking {higherRateIsB ? 'Rate A' : 'Rate B'}
            </p>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80 text-xs text-neutral-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Key Borrowing Insight:</strong> Even a modest{' '}
            <strong className="text-neutral-900">{Math.abs(rateDelta)}% interest rate variance</strong> on a ${loanAmount.toLocaleString()} loan results in an additional{' '}
            <strong className="text-emerald-700 font-black">${lifetimeInterestDelta.toLocaleString()}</strong> in non-recoverable bank interest payments over {loanTermYears} years. Securing the lower rate gives you an extra{' '}
            <strong className="text-neutral-900">${monthlyDelta.toLocaleString()}/month</strong> in free cash flow.
          </p>
        </div>
      </div>

      {/* 4. Side-by-Side Visual Trajectory Charts */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-neutral-900">
              Visual Timeline &amp; Cost Gap Over {loanTermYears} Years
            </h4>
            <p className="text-xs text-neutral-500">
              Interactive side-by-side progression of cumulative interest and remaining debt
            </p>
          </div>

          {/* Chart View Selector - Distinct Blue, Green, Red theme colors */}
          <div className="flex items-center gap-1 p-1 bg-neutral-200/70 rounded-xl text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => setChartView('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'cumulative'
                  ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-blue-400'
                  : 'text-blue-900 hover:bg-blue-100'
              }`}
            >
              Cumulative Interest
            </button>
            <button
              type="button"
              onClick={() => setChartView('balance')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'balance'
                  ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              Loan Debt Balance
            </button>
            <button
              type="button"
              onClick={() => setChartView('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'annual'
                  ? 'bg-red-600 text-white shadow-xs font-black ring-1 ring-red-400'
                  : 'text-red-900 hover:bg-red-100'
              }`}
            >
              Annual Interest Paid
            </button>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-4 text-xs font-semibold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-neutral-700">Rate A ({rateA}%): {labelA}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-neutral-700">Rate B ({rateB}%): {labelB}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-emerald-700 font-bold hidden sm:flex">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Gap: Divergence</span>
          </div>
        </div>

        {/* Recharts Area */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'cumulative' ? (
              <AreaChart data={comparisonSchedule} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#606060" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#606060" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d4d4d" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4d4d4d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e7e7" />
                <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: '#727272' }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#727272' }}
                />
                <Tooltip content={<CustomCompareTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumInterestA"
                  name={`Rate A (${rateA}%)`}
                  stroke="#606060"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBlue)"
                />
                <Area
                  type="monotone"
                  dataKey="cumInterestB"
                  name={`Rate B (${rateB}%)`}
                  stroke="#4d4d4d"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                />
              </AreaChart>
            ) : chartView === 'balance' ? (
              <LineChart data={comparisonSchedule} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e7e7" />
                <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: '#727272' }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#727272' }}
                />
                <Tooltip content={<CustomCompareTooltip />} />
                <Line
                  type="monotone"
                  dataKey="endingBalA"
                  name={`Rate A (${rateA}%) Debt`}
                  stroke="#606060"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="endingBalB"
                  name={`Rate B (${rateB}%) Debt`}
                  stroke="#4d4d4d"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={comparisonSchedule} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e7e7" />
                <XAxis dataKey="yearLabel" tick={{ fontSize: 11, fill: '#727272' }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#727272' }}
                />
                <Tooltip content={<CustomCompareTooltip />} />
                <Bar dataKey="interestA" name={`Rate A (${rateA}%)`} fill="#606060" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interestB" name={`Rate B (${rateB}%)`} fill="#4d4d4d" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Detailed Side-by-Side Schedule Comparison Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        {/* Table Header & Controls Toolbar */}
        <div className="p-4 sm:p-5 bg-neutral-50/90 border-b border-neutral-200 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-[#FFD200] flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-neutral-900">
                    Side-by-Side Repayment Schedule Table
                  </h4>
                  <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                    {loanTermYears} Years
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Direct annual breakdown of principal paid, interest paid, remaining balance, and cost gap
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Export Dual CSV - Fresh Emerald Green Theme */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 border border-emerald-500"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export Dual CSV</span>
              </button>

              {/* Collapse/Expand Table - Crimson / Rose Red Theme */}
              <button
                type="button"
                onClick={() => setShowScheduleTable(!showScheduleTable)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>{showScheduleTable ? 'Collapse Table' : 'Expand Table'}</span>
                {showScheduleTable ? <ChevronUp className="w-3.5 h-3.5 text-rose-600" /> : <ChevronDown className="w-3.5 h-3.5 text-rose-600" />}
              </button>
            </div>
          </div>

          {/* Table Filters Toolbar */}
          {showScheduleTable && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-200/60">
              <div className="flex items-center gap-1.5 bg-neutral-200/70 p-1 rounded-xl text-xs font-semibold shrink-0 shadow-inner">
                {/* All Years - Royal Blue */}
                <button
                  type="button"
                  onClick={() => setTableFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    tableFilterMode === 'all'
                      ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-blue-400'
                      : 'text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  All {loanTermYears} Years
                </button>
                {/* 5-Year Milestones - Fresh Emerald Green */}
                <button
                  type="button"
                  onClick={() => setTableFilterMode('milestones')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    tableFilterMode === 'milestones'
                      ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                      : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  5-Year Milestones
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search year..."
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                  />
                  {tableSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTableSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
                  {displayedRows.length} {displayedRows.length === 1 ? 'row' : 'rows'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        {showScheduleTable && (
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              {/* Top Level Category Header */}
              <thead className="sticky top-0 z-20 border-b border-neutral-300">
                <tr className="bg-neutral-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-2 px-3 border-r border-neutral-700" rowSpan={2}>
                    Timeline
                  </th>
                  <th colSpan={3} className="py-2 px-3 text-center bg-blue-900/90 border-r border-blue-700 text-blue-200">
                    Rate Option A ({rateA}% p.a.)
                  </th>
                  <th colSpan={3} className="py-2 px-3 text-center bg-red-950/90 border-r border-red-800 text-red-200">
                    Rate Option B ({rateB}% p.a.)
                  </th>
                  <th colSpan={2} className="py-2 px-3 text-center bg-emerald-950/90 text-emerald-200">
                    Cost-of-Borrowing Impact
                  </th>
                </tr>
                <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200 text-[10px]">
                  {/* Rate A Columns */}
                  <th className="py-2 px-2.5 text-right bg-blue-50/70 text-blue-900">Principal Paid</th>
                  <th className="py-2 px-2.5 text-right bg-blue-50/70 text-blue-900">Interest Paid</th>
                  <th className="py-2 px-2.5 text-right bg-blue-50/70 text-blue-900 border-r border-blue-200">Ending Balance</th>

                  {/* Rate B Columns */}
                  <th className="py-2 px-2.5 text-right bg-red-50/70 text-red-900">Principal Paid</th>
                  <th className="py-2 px-2.5 text-right bg-red-50/70 text-red-900">Interest Paid</th>
                  <th className="py-2 px-2.5 text-right bg-red-50/70 text-red-900 border-r border-red-200">Ending Balance</th>

                  {/* Difference Columns */}
                  <th className="py-2 px-2.5 text-right bg-emerald-50/70 text-emerald-950">Annual Interest Gap</th>
                  <th className="py-2 px-2.5 text-right bg-emerald-50/70 text-emerald-950">Cumulative Gap</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-400">
                      No schedule rows matching query.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row) => {
                    const isHovered = hoveredYear === row.year;
                    const isCrossoverA = row.isCrossoverA;
                    const isCrossoverB = row.isCrossoverB;

                    return (
                      <tr
                        key={row.year}
                        onMouseEnter={() => setHoveredYear(row.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                        className={`transition-colors ${
                          isHovered
                            ? 'bg-amber-50/80 font-medium'
                            : row.year % 2 === 0
                            ? 'bg-neutral-50/40'
                            : 'bg-white'
                        }`}
                      >
                        {/* Year */}
                        <td className="py-2.5 px-3 font-bold text-neutral-900 whitespace-nowrap border-r border-neutral-200">
                          <div className="flex items-center gap-1.5">
                            <span>Year {row.year}</span>
                            {row.year === 1 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                                Inception
                              </span>
                            )}
                            {row.year === loanTermYears && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                Paid Off
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Rate A: Principal */}
                        <td className="py-2.5 px-2.5 text-right text-blue-700 font-semibold tabular-nums whitespace-nowrap bg-blue-50/30">
                          ${row.principalA.toLocaleString()}
                        </td>
                        {/* Rate A: Interest */}
                        <td className="py-2.5 px-2.5 text-right text-neutral-700 tabular-nums whitespace-nowrap bg-blue-50/30">
                          ${row.interestA.toLocaleString()}
                        </td>
                        {/* Rate A: Balance */}
                        <td className="py-2.5 px-2.5 text-right font-bold text-neutral-900 tabular-nums whitespace-nowrap bg-blue-50/30 border-r border-blue-200">
                          ${row.endingBalA.toLocaleString()}
                        </td>

                        {/* Rate B: Principal */}
                        <td className="py-2.5 px-2.5 text-right text-red-700 font-semibold tabular-nums whitespace-nowrap bg-red-50/30">
                          ${row.principalB.toLocaleString()}
                        </td>
                        {/* Rate B: Interest */}
                        <td className="py-2.5 px-2.5 text-right text-neutral-700 tabular-nums whitespace-nowrap bg-red-50/30">
                          ${row.interestB.toLocaleString()}
                        </td>
                        {/* Rate B: Balance */}
                        <td className="py-2.5 px-2.5 text-right font-bold text-neutral-900 tabular-nums whitespace-nowrap bg-red-50/30 border-r border-red-200">
                          ${row.endingBalB.toLocaleString()}
                        </td>

                        {/* Annual Gap */}
                        <td className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap bg-emerald-50/40 font-bold text-emerald-800">
                          {row.annualInterestDelta >= 0 ? '+' : ''}${row.annualInterestDelta.toLocaleString()}
                        </td>

                        {/* Cumulative Gap */}
                        <td className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap bg-emerald-50/40 font-extrabold text-neutral-900">
                          {row.cumulativeInterestDelta >= 0 ? '+' : ''}${row.cumulativeInterestDelta.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Summary Footer */}
              <tfoot className="bg-neutral-900 text-white font-bold sticky bottom-0 z-20 border-t-2 border-neutral-700 shadow-md text-xs">
                <tr>
                  <td className="py-3 px-3 text-amber-400 border-r border-neutral-700">Total Lifetime</td>

                  {/* Rate A Totals */}
                  <td className="py-3 px-2.5 text-right text-blue-300 tabular-nums bg-blue-950/80">
                    ${loanAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-right text-neutral-300 tabular-nums bg-blue-950/80">
                    ${metricsA.totalInterest.toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-right text-emerald-400 font-extrabold tabular-nums bg-blue-950/80 border-r border-blue-700">
                    $0 Bal
                  </td>

                  {/* Rate B Totals */}
                  <td className="py-3 px-2.5 text-right text-red-300 tabular-nums bg-red-950/80">
                    ${loanAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-right text-neutral-300 tabular-nums bg-red-950/80">
                    ${metricsB.totalInterest.toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-right text-emerald-400 font-extrabold tabular-nums bg-red-950/80 border-r border-red-700">
                    $0 Bal
                  </td>

                  {/* Variance Totals */}
                  <td className="py-3 px-2.5 text-right text-emerald-400 font-bold tabular-nums bg-emerald-950/80">
                    +${lifetimeInterestDelta.toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-right text-emerald-400 font-black tabular-nums bg-emerald-950/80">
                    +${lifetimeInterestDelta.toLocaleString()} Gap
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

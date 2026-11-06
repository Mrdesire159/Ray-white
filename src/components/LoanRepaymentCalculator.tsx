import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  X,
  DollarSign,
  Percent,
  Calendar,
  HelpCircle,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Check,
  Building2,
  RotateCcw,
  Clock,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  LineChart,
  Layers,
  Award,
  PieChart as PieChartIcon,
  TrendingUp,
  Gauge,
  AlertTriangle,
  Sliders,
  Table,
  Download,
  FileSpreadsheet,
  Search,
  ArrowLeftRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export interface LoanRepaymentCalculatorProps {
  propertyPrice: number;
  propertyTitle?: string;
  propertyAddress?: string;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  inline?: boolean;
  onOpenRateCompare?: () => void;
}

export const LoanRepaymentCalculator: React.FC<LoanRepaymentCalculatorProps> = ({
  propertyPrice,
  propertyTitle = 'Property Loan Repayment',
  propertyAddress = '',
  isOpenModal = false,
  onCloseModal,
  inline = false,
  onOpenRateCompare,
}) => {
  const initialBasePrice = propertyPrice > 0 ? propertyPrice : 1500000;

  // Main input state
  const [purchasePrice, setPurchasePrice] = useState<number>(initialBasePrice);
  const [depositPercent, setDepositPercent] = useState<number>(20);
  const [depositAmount, setDepositAmount] = useState<number>(Math.round(initialBasePrice * 0.2));
  const [interestRate, setInterestRate] = useState<number>(5.85);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [repaymentFrequency, setRepaymentFrequency] = useState<'monthly' | 'fortnightly' | 'weekly'>('monthly');
  const [repaymentType, setRepaymentType] = useState<'pi' | 'io'>('pi'); // Principal & Interest vs Interest Only
  const [extraRepaymentMonthly, setExtraRepaymentMonthly] = useState<number>(0);
  const [stateAbbr, setStateAbbr] = useState<'NSW' | 'VIC' | 'QLD' | 'WA'>('NSW');
  const [showExtraSimulator, setShowExtraSimulator] = useState<boolean>(false);
  const [showUpfrontCosts, setShowUpfrontCosts] = useState<boolean>(true);
  const [consultationRequested, setConsultationRequested] = useState<boolean>(false);
  const [graphView, setGraphView] = useState<'annual' | 'stress' | 'composition' | 'balance' | 'cumulative'>('stress');
  const [showScheduleTable, setShowScheduleTable] = useState<boolean>(true);
  const [tableFilterMode, setTableFilterMode] = useState<'all' | 'milestones'>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [inspectYear, setInspectYear] = useState<number>(5);

  // Rate Hike Stress-Test State
  const [stressRateHike, setStressRateHike] = useState<number>(1.5); // Default +1.50% hike to demonstrate immediately
  const [isStressTestEnabled, setIsStressTestEnabled] = useState<boolean>(true);
  const [applyStressToAmortisation, setApplyStressToAmortisation] = useState<boolean>(false);

  // Sync inspectYear with loan term changes
  useEffect(() => {
    if (inspectYear > loanTermYears) {
      setInspectYear(loanTermYears);
    }
  }, [loanTermYears, inspectYear]);

  // Synchronize when propertyPrice prop changes
  useEffect(() => {
    if (propertyPrice > 0) {
      setPurchasePrice(propertyPrice);
      setDepositAmount(Math.round(propertyPrice * (depositPercent / 100)));
    }
  }, [propertyPrice]);

  // Adjust deposit by percentage
  const handlePercentChange = (pct: number) => {
    setDepositPercent(pct);
    setDepositAmount(Math.round(purchasePrice * (pct / 100)));
  };

  // Adjust deposit by amount
  const handleAmountChange = (amt: number) => {
    const valid = Math.max(0, Math.min(purchasePrice, amt));
    setDepositAmount(valid);
    if (purchasePrice > 0) {
      setDepositPercent(Math.round((valid / purchasePrice) * 100));
    }
  };

  // Loan Amount
  const loanAmount = useMemo(() => {
    return Math.max(0, purchasePrice - depositAmount);
  }, [purchasePrice, depositAmount]);

  // Calculations
  const metrics = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let baseMonthlyPayment = 0;

    if (loanAmount <= 0) {
      baseMonthlyPayment = 0;
    } else if (repaymentType === 'io') {
      // Interest-Only: monthly payment is purely loanAmount * monthlyRate
      baseMonthlyPayment = Math.round(loanAmount * monthlyRate);
    } else {
      // Principal & Interest standard amortization formula
      if (monthlyRate === 0) {
        baseMonthlyPayment = Math.round(loanAmount / totalMonths);
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        baseMonthlyPayment = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
      }
    }

    const fortnightlyPayment = Math.round((baseMonthlyPayment * 12) / 26);
    const weeklyPayment = Math.round((baseMonthlyPayment * 12) / 52);

    const activePeriodicRepayment =
      repaymentFrequency === 'monthly'
        ? baseMonthlyPayment
        : repaymentFrequency === 'fortnightly'
        ? fortnightlyPayment
        : weeklyPayment;

    // Total repayments and total interest paid over life of loan (standard without extra)
    const totalPayments =
      repaymentType === 'io'
        ? baseMonthlyPayment * totalMonths + loanAmount
        : baseMonthlyPayment * totalMonths;

    const totalInterest = Math.max(0, totalPayments - loanAmount);

    const principalPercent = totalPayments > 0 ? Math.round((loanAmount / totalPayments) * 100) : 100;
    const interestPercent = Math.max(0, 100 - principalPercent);

    // Extra Repayment Savings simulation (for P&I)
    let interestSaved = 0;
    let yearsSaved = 0;
    if (extraRepaymentMonthly > 0 && repaymentType === 'pi' && loanAmount > 0 && monthlyRate > 0) {
      const effectivePayment = baseMonthlyPayment + extraRepaymentMonthly;
      // Formula for n: n = -ln(1 - (P * r) / PMT) / ln(1 + r)
      const ratio = (loanAmount * monthlyRate) / effectivePayment;
      if (ratio < 1) {
        const newTotalMonths = -Math.log(1 - ratio) / Math.log(1 + monthlyRate);
        const newTotalPayments = effectivePayment * newTotalMonths;
        const newTotalInterest = Math.max(0, newTotalPayments - loanAmount);
        interestSaved = Math.max(0, Math.round(totalInterest - newTotalInterest));
        yearsSaved = Math.max(0, Number(((totalMonths - newTotalMonths) / 12).toFixed(1)));
      }
    }

    // Upfront stamp duty estimation based on progressive Australian stamp duty brackets
    let stampDuty = 0;
    if (stateAbbr === 'NSW') {
      if (purchasePrice > 3000000) {
        stampDuty = Math.round(150000 + (purchasePrice - 3000000) * 0.07);
      } else if (purchasePrice > 1000000) {
        stampDuty = Math.round(40000 + (purchasePrice - 1000000) * 0.055);
      } else {
        stampDuty = Math.round(purchasePrice * 0.04);
      }
    } else if (stateAbbr === 'VIC') {
      stampDuty = Math.round(purchasePrice * 0.055);
    } else if (stateAbbr === 'QLD') {
      stampDuty = Math.round(purchasePrice * 0.042);
    } else {
      // WA
      stampDuty = Math.round(purchasePrice * 0.048);
    }

    const transferFee = 380;
    const conveyancingEstimate = 1850;
    const mortgageRegistrationFee = 160;
    const totalGovernmentFees = stampDuty + transferFee + mortgageRegistrationFee;
    const totalCashRequired = depositAmount + totalGovernmentFees + conveyancingEstimate;

    // Lenders Mortgage Insurance (LMI) applies if deposit is under 20%
    const isLmiApplicable = depositPercent < 20;
    const estimatedLmi = isLmiApplicable ? Math.round(loanAmount * 0.02) : 0;

    // Rate Hike Stress-Test Metrics
    const activeHike = isStressTestEnabled ? stressRateHike : 0;
    const stressedInterestRate = Number((interestRate + activeHike).toFixed(2));
    const stressedMonthlyRate = stressedInterestRate / 100 / 12;

    let stressedMonthlyPayment = 0;
    if (loanAmount <= 0) {
      stressedMonthlyPayment = 0;
    } else if (repaymentType === 'io') {
      stressedMonthlyPayment = Math.round(loanAmount * stressedMonthlyRate);
    } else {
      if (stressedMonthlyRate === 0) {
        stressedMonthlyPayment = Math.round(loanAmount / totalMonths);
      } else {
        const factor = Math.pow(1 + stressedMonthlyRate, totalMonths);
        stressedMonthlyPayment = Math.round((loanAmount * stressedMonthlyRate * factor) / (factor - 1));
      }
    }

    const stressedFortnightlyPayment = Math.round((stressedMonthlyPayment * 12) / 26);
    const stressedWeeklyPayment = Math.round((stressedMonthlyPayment * 12) / 52);

    const stressedActivePeriodicRepayment =
      repaymentFrequency === 'monthly'
        ? stressedMonthlyPayment
        : repaymentFrequency === 'fortnightly'
        ? stressedFortnightlyPayment
        : stressedWeeklyPayment;

    const monthlyHikeDelta = Math.max(0, stressedMonthlyPayment - baseMonthlyPayment);
    const periodicHikeDelta = Math.max(0, stressedActivePeriodicRepayment - activePeriodicRepayment);
    const annualHikeDelta = monthlyHikeDelta * 12;
    const hikePercentageIncrease = baseMonthlyPayment > 0 ? (monthlyHikeDelta / baseMonthlyPayment) * 100 : 0;

    const stressedTotalPayments =
      repaymentType === 'io'
        ? stressedMonthlyPayment * totalMonths + loanAmount
        : stressedMonthlyPayment * totalMonths;
    const stressedTotalInterest = Math.max(0, stressedTotalPayments - loanAmount);
    const extraLifetimeInterestFromHike = Math.max(0, stressedTotalInterest - totalInterest);

    return {
      baseMonthlyPayment,
      fortnightlyPayment,
      weeklyPayment,
      activePeriodicRepayment,
      totalPayments,
      totalInterest,
      principalPercent,
      interestPercent,
      interestSaved,
      yearsSaved,
      stampDuty,
      transferFee,
      conveyancingEstimate,
      mortgageRegistrationFee,
      totalGovernmentFees,
      totalCashRequired,
      isLmiApplicable,
      estimatedLmi,
      // Stress test outputs
      activeHike,
      stressedInterestRate,
      stressedMonthlyPayment,
      stressedFortnightlyPayment,
      stressedWeeklyPayment,
      stressedActivePeriodicRepayment,
      monthlyHikeDelta,
      periodicHikeDelta,
      annualHikeDelta,
      hikePercentageIncrease,
      stressedTotalPayments,
      stressedTotalInterest,
      extraLifetimeInterestFromHike,
    };
  }, [
    purchasePrice,
    depositAmount,
    loanAmount,
    interestRate,
    loanTermYears,
    repaymentFrequency,
    repaymentType,
    extraRepaymentMonthly,
    stateAbbr,
    depositPercent,
    stressRateHike,
    isStressTestEnabled,
  ]);

  // Stress Test Monthly Payment Chart Scenarios
  const stressCurveData = useMemo(() => {
    if (loanAmount <= 0) return [];
    const baseMonthly = metrics.baseMonthlyPayment;
    const totalMonths = loanTermYears * 12;
    const standardHikes = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    const currentHike = isStressTestEnabled ? Number(stressRateHike.toFixed(2)) : 0;

    // Merge standard presets with current user slider value if unique
    const allHikes = Array.from(new Set([...standardHikes, currentHike])).sort((a, b) => a - b);

    return allHikes.map((hike) => {
      const rate = Number((interestRate + hike).toFixed(2));
      const mRate = rate / 100 / 12;
      let payment = 0;
      if (repaymentType === 'io') {
        payment = Math.round(loanAmount * mRate);
      } else {
        if (mRate === 0) {
          payment = Math.round(loanAmount / totalMonths);
        } else {
          const factor = Math.pow(1 + mRate, totalMonths);
          payment = Math.round((loanAmount * mRate * factor) / (factor - 1));
        }
      }
      const extraPerMonth = Math.max(0, payment - baseMonthly);
      const annualExtra = extraPerMonth * 12;
      const isSelected = Math.abs(hike - currentHike) < 0.04;
      const isApraBuffer = Math.abs(hike - 3.0) < 0.04;

      return {
        hike,
        hikeLabel: hike === 0 ? 'Base' : `+${hike.toFixed(2)}%`,
        rate,
        rateLabel: `${rate.toFixed(2)}%`,
        basePayment: baseMonthly,
        extraPayment: extraPerMonth,
        totalMonthlyPayment: payment,
        annualExtra,
        isSelected,
        isApraBuffer,
      };
    });
  }, [
    loanAmount,
    interestRate,
    stressRateHike,
    isStressTestEnabled,
    loanTermYears,
    repaymentType,
    metrics.baseMonthlyPayment,
  ]);

  // Amortisation Schedule Calculation for Recharts Graph
  const amortisationData = useMemo(() => {
    if (loanAmount <= 0) return { schedule: [], crossoverYear: null, fiveYearEquity: 0, tenYearEquity: 0 };

    const effectiveRate = applyStressToAmortisation && isStressTestEnabled && stressRateHike > 0
      ? interestRate + stressRateHike
      : interestRate;

    const monthlyRate = effectiveRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let baseMonthlyPayment = 0;
    if (repaymentType === 'io') {
      baseMonthlyPayment = loanAmount * monthlyRate;
    } else {
      if (monthlyRate === 0) {
        baseMonthlyPayment = loanAmount / totalMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        baseMonthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
      }
    }

    const monthlyPaymentWithExtra = baseMonthlyPayment + extraRepaymentMonthly;

    let currentBalance = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    let crossoverYear: number | null = null;
    let fiveYearEquity = 0;
    let tenYearEquity = 0;

    const schedule: Array<{
      year: number;
      yearLabel: string;
      remainingBalance: number;
      principalPaid: number;
      interestPaid: number;
      principalShare: number;
      interestShare: number;
      cumulativePrincipal: number;
      cumulativeInterest: number;
      totalPaid: number;
      equityPercent: number;
    }> = [];

    // Year 0 starting point
    schedule.push({
      year: 0,
      yearLabel: 'Yr 0',
      remainingBalance: Math.round(currentBalance),
      principalPaid: 0,
      interestPaid: 0,
      principalShare: 0,
      interestShare: 0,
      cumulativePrincipal: 0,
      cumulativeInterest: 0,
      totalPaid: 0,
      equityPercent: 0,
    });

    for (let year = 1; year <= loanTermYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let m = 1; m <= 12; m++) {
        if (currentBalance <= 0) break;

        const interestForMonth = currentBalance * monthlyRate;
        let principalForMonth = 0;

        if (repaymentType === 'io') {
          principalForMonth = Math.min(currentBalance, extraRepaymentMonthly);
        } else {
          principalForMonth = Math.min(
            currentBalance,
            Math.max(0, monthlyPaymentWithExtra - interestForMonth)
          );
        }

        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        currentBalance = Math.max(0, currentBalance - principalForMonth);
      }

      cumulativePrincipal += yearlyPrincipal;
      cumulativeInterest += yearlyInterest;

      if (!crossoverYear && yearlyPrincipal > yearlyInterest && repaymentType === 'pi') {
        crossoverYear = year;
      }

      if (year === 5) {
        fiveYearEquity = Math.round(cumulativePrincipal);
      }
      if (year === 10) {
        tenYearEquity = Math.round(cumulativePrincipal);
      }

      const annualTotal = yearlyPrincipal + yearlyInterest;
      const principalShare = annualTotal > 0 ? Math.round((yearlyPrincipal / annualTotal) * 100) : 0;
      const interestShare = Math.max(0, 100 - principalShare);

      schedule.push({
        year,
        yearLabel: `Yr ${year}`,
        remainingBalance: Math.round(currentBalance),
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        principalShare,
        interestShare,
        cumulativePrincipal: Math.round(cumulativePrincipal),
        cumulativeInterest: Math.round(cumulativeInterest),
        totalPaid: Math.round(cumulativePrincipal + cumulativeInterest),
        equityPercent: Math.min(100, Math.round((cumulativePrincipal / loanAmount) * 100)),
      });

      if (currentBalance <= 0) {
        break;
      }
    }

    if (fiveYearEquity === 0 && schedule.length > 5) {
      fiveYearEquity = schedule[5].cumulativePrincipal;
    }
    if (tenYearEquity === 0 && schedule.length > 10) {
      tenYearEquity = schedule[10].cumulativePrincipal;
    }

    return { schedule, crossoverYear, fiveYearEquity, tenYearEquity };
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    repaymentType,
    extraRepaymentMonthly,
    applyStressToAmortisation,
    isStressTestEnabled,
    stressRateHike,
  ]);

  // Specific data point on the timeline selected by user scrubber
  const inspectedYearData = useMemo(() => {
    const clampedYear = Math.max(1, Math.min(loanTermYears, inspectYear));
    const match =
      amortisationData.schedule.find((s) => s.year === clampedYear) ||
      amortisationData.schedule[1] ||
      amortisationData.schedule[0];
    if (!match) return null;
    const annualTotal = match.principalPaid + match.interestPaid;
    const principalShare = annualTotal > 0 ? Math.round((match.principalPaid / annualTotal) * 100) : 0;
    const interestShare = Math.max(0, 100 - principalShare);
    return {
      ...match,
      annualTotal,
      principalShare,
      interestShare,
    };
  }, [amortisationData, inspectYear, loanTermYears]);

  const lifetimePieData = useMemo(() => [
    { name: 'Loan Principal', value: loanAmount, color: '#10b981' },
    { name: 'Total Interest', value: metrics.totalInterest, color: '#f59e0b' },
  ], [loanAmount, metrics.totalInterest]);

  const resetToOriginal = () => {
    setPurchasePrice(initialBasePrice);
    setDepositPercent(20);
    setDepositAmount(Math.round(initialBasePrice * 0.2));
    setInterestRate(5.85);
    setLoanTermYears(30);
    setRepaymentType('pi');
    setRepaymentFrequency('monthly');
    setExtraRepaymentMonthly(0);
    setStressRateHike(0);
    setIsStressTestEnabled(false);
    setApplyStressToAmortisation(false);
  };

  const formatCurrencyAxis = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  };

  const CustomStressTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: any }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-xl border border-neutral-700 shadow-2xl backdrop-blur-md text-xs min-w-[220px] space-y-2">
          <div className="border-b border-neutral-800 pb-1.5 flex items-center justify-between">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{data.hike === 0 ? 'Base Interest Rate' : `+${data.hike.toFixed(2)}% Rate Hike`}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              {data.rate.toFixed(2)}% p.a.
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Base Monthly Payment:</span>
              </span>
              <span className="font-bold text-white tabular-nums">${data.basePayment.toLocaleString()}</span>
            </div>
            {data.extraPayment > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Hike Increase / Mo:</span>
                </span>
                <span className="font-extrabold tabular-nums">+${data.extraPayment.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800 font-extrabold">
              <span className="text-[#FFD200]">Total Monthly Repayment:</span>
              <span className="text-sm text-[#FFD200] tabular-nums">${data.totalMonthlyPayment.toLocaleString()}</span>
            </div>
            {data.annualExtra > 0 && (
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
                <span>Annual Cashflow Surge:</span>
                <span className="tabular-nums text-neutral-300">+${data.annualExtra.toLocaleString()} / yr</span>
              </div>
            )}
            {data.isApraBuffer && (
              <div className="text-[10px] text-indigo-300 font-bold bg-indigo-950/70 p-1.5 rounded border border-indigo-800 mt-1">
                APRA +3.00% regulatory buffer benchmark
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomScheduleTooltip = ({
    active,
    payload,
    label,
    isPercentage = false,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
    label?: string;
    isPercentage?: boolean;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-xl border border-neutral-700 shadow-2xl backdrop-blur-md text-xs min-w-[210px]">
          <div className="font-bold text-amber-400 mb-2 border-b border-neutral-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-neutral-400 font-normal">
              {isPercentage ? 'Repayment Share %' : 'Amortisation Breakdown'}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  <span>{item.name}:</span>
                </span>
                <span className="font-extrabold text-white tabular-nums">
                  {isPercentage ? `${item.value}%` : `$${Number(item.value).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDownloadScheduleCSV = () => {
    const headers = [
      'Year',
      'Starting Balance ($)',
      'Annual Principal Paid ($)',
      'Annual Interest Paid ($)',
      'Total Annual Repayment ($)',
      'Principal Share (%)',
      'Interest Share (%)',
      'Cumulative Principal ($)',
      'Cumulative Interest ($)',
      'Remaining Loan Balance ($)',
      'Home Equity (%)',
    ];

    const validRows = amortisationData.schedule.filter((r) => r.year > 0);
    const rows = validRows.map((row, idx) => {
      const startingBal = idx === 0 ? loanAmount : validRows[idx - 1].remainingBalance;
      const annualTotal = row.principalPaid + row.interestPaid;
      return [
        `Year ${row.year}`,
        startingBal,
        row.principalPaid,
        row.interestPaid,
        annualTotal,
        `${row.principalShare}%`,
        `${row.interestShare}%`,
        row.cumulativePrincipal,
        row.cumulativeInterest,
        row.remainingBalance,
        `${row.equityPercent}%`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RayWhite_Amortisation_Schedule_${loanTermYears}Yr.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedScheduleRows = useMemo(() => {
    const allValid = amortisationData.schedule.filter((r) => r.year > 0);
    let filtered = allValid;

    if (tableFilterMode === 'milestones') {
      const milestoneYears = new Set([1, 2, 3, 5, 10, 15, 20, 25, 30, loanTermYears]);
      if (amortisationData.crossoverYear) milestoneYears.add(amortisationData.crossoverYear);
      filtered = allValid.filter((r) => milestoneYears.has(r.year) || r.remainingBalance === 0);
    }

    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.year.toString().includes(q) ||
          r.yearLabel.toLowerCase().includes(q) ||
          (amortisationData.crossoverYear === r.year && 'crossover'.includes(q))
      );
    }

    return filtered;
  }, [amortisationData, tableFilterMode, tableSearchQuery, loanTermYears]);

  const calculatorBody = (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-[#FFD200] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900 tracking-tight">
                Loan Repayment Calculator
              </h3>
              <span className="text-[10px] font-bold bg-[#FFD200] text-neutral-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live Estimates
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {propertyAddress ? `Calculating estimated repayments for ${propertyAddress}` : 'Customise purchase price, deposit, and interest rates'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Reset Button - Rose Red Accent */}
          <button
            type="button"
            onClick={resetToOriginal}
            className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Reset to listing defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset</span>
          </button>

          {/* Compare 2 Rates Side-by-Side Shortcut - Bold Crimson Red Theme */}
          {onOpenRateCompare && (
            <button
              type="button"
              onClick={onOpenRateCompare}
              className="px-3 py-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-600/20 active:scale-95 border border-red-500"
              title="Compare side-by-side with another interest rate"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Compare 2 Rates</span>
            </button>
          )}

          {isOpenModal && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls (Left) vs Summary Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Property Purchase Price */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Purchase Price
              </label>
              <span className="text-sm font-extrabold text-neutral-950 tabular-nums">
                ${purchasePrice.toLocaleString()} AUD
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-base">
                $
              </span>
              <input
                type="number"
                step={25000}
                min={100000}
                max={50000000}
                value={purchasePrice}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setPurchasePrice(val);
                  setDepositAmount(Math.round(val * (depositPercent / 100)));
                }}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-base font-extrabold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              />
            </div>

            {/* Slider & Quick increments */}
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min={200000}
                max={10000000}
                step={25000}
                value={purchasePrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPurchasePrice(val);
                  setDepositAmount(Math.round(val * (depositPercent / 100)));
                }}
                className="w-full accent-[#FFD200] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>$200k</span>
                <div className="flex items-center gap-1">
                  {[-100000, -50000, 50000, 100000].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => {
                        const newP = Math.max(100000, purchasePrice + delta);
                        setPurchasePrice(newP);
                        setDepositAmount(Math.round(newP * (depositPercent / 100)));
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded text-[10px] transition-colors cursor-pointer"
                    >
                      {delta > 0 ? `+${delta / 1000}k` : `${delta / 1000}k`}
                    </button>
                  ))}
                </div>
                <span>$10M+</span>
              </div>
            </div>
          </div>

          {/* 2. Deposit / Down Payment */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Deposit / Down Payment ({depositPercent}%)
              </label>
              <span className="text-sm font-extrabold text-neutral-950 tabular-nums">
                ${depositAmount.toLocaleString()}
              </span>
            </div>

            {/* Quick Percentage Presets - Each with distinct theme color */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { pct: 10, active: 'bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400', inactive: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' },
                { pct: 20, active: 'bg-emerald-600 text-white font-black shadow-xs ring-1 ring-emerald-400', inactive: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
                { pct: 25, active: 'bg-red-600 text-white font-black shadow-xs ring-1 ring-red-400', inactive: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100' },
                { pct: 30, active: 'bg-indigo-600 text-white font-black shadow-xs ring-1 ring-indigo-400', inactive: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100' },
              ].map((item) => (
                <button
                  key={item.pct}
                  type="button"
                  onClick={() => handlePercentChange(item.pct)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    depositPercent === item.pct ? item.active : item.inactive
                  }`}
                >
                  {item.pct}% Deposit
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={depositPercent}
              onChange={(e) => handlePercentChange(Number(e.target.value))}
              className="w-full accent-[#FFD200] cursor-pointer"
            />

            {/* Lenders Mortgage Insurance Notice if < 20% */}
            {metrics.isLmiApplicable && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Lenders Mortgage Insurance (LMI) applies:</strong> Since the deposit is under 20%, lenders typically require approx <strong>${metrics.estimatedLmi.toLocaleString()}</strong> in one-off LMI protection.
                </div>
              </div>
            )}
          </div>

          {/* 3. Interest Rate (% p.a.) */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Annual Interest Rate
              </label>
              <span className="text-base font-black text-neutral-900 tabular-nums">
                {interestRate.toFixed(2)}% p.a.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-28 shrink-0">
                <input
                  type="number"
                  step={0.05}
                  min={1}
                  max={15}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">
                  %
                </span>
              </div>
              <input
                type="range"
                min={3.0}
                max={9.5}
                step={0.05}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Benchmark Market Rate Presets - Distinct Blue, Green, Red themes */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'Current Variable', rate: 5.85, active: 'bg-blue-600 text-white font-black shadow-xs', inactive: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' },
                { label: '3-Yr Fixed', rate: 5.39, active: 'bg-emerald-600 text-white font-black shadow-xs', inactive: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' },
                { label: 'Investor Variable', rate: 6.15, active: 'bg-red-600 text-white font-black shadow-xs', inactive: 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' },
              ].map((bench) => (
                <button
                  key={bench.label}
                  type="button"
                  onClick={() => setInterestRate(bench.rate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    interestRate === bench.rate
                      ? bench.active
                      : bench.inactive
                  }`}
                >
                  {bench.label} ({bench.rate}%)
                </button>
              ))}
            </div>
          </div>

          {/* Rate Hike Stress-Test Slider Card (APRA Buffer Simulator) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 p-4 rounded-xl border border-amber-300 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-neutral-900 text-[#FFD200] rounded-lg shrink-0">
                  <TrendingUp className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                      Rate Hike Stress-Test
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                      Buffer Simulator
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Test your monthly budget against potential RBA interest rate hikes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGraphView('stress');
                  const el = document.getElementById('timeline-chart-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-neutral-900 bg-amber-200/90 hover:bg-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-amber-300 shadow-2xs"
                title="View dynamic monthly payment chart"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Chart</span>
              </button>
            </div>

            {/* Slider & Dynamic Display */}
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-600 font-semibold">Simulated Hike:</span>
                  <span className="text-lg font-black text-neutral-950 tabular-nums">
                    +{stressRateHike.toFixed(2)}%
                  </span>
                  <span className="text-xs text-neutral-500">
                    (Stressed: <strong className="text-neutral-900 font-bold">{metrics.stressedInterestRate}% p.a.</strong>)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    stressRateHike === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : stressRateHike <= 1.0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : stressRateHike <= 2.5
                      ? 'bg-orange-100 text-orange-950 border border-orange-300'
                      : 'bg-rose-100 text-rose-950 border border-rose-300'
                  }`}
                >
                  {stressRateHike === 0
                    ? 'Current Baseline'
                    : stressRateHike <= 1.0
                    ? 'Mild (+1 to 4 Hikes)'
                    : stressRateHike <= 2.5
                    ? 'Moderate to High'
                    : 'APRA 3% Buffer Tested'}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={4.0}
                step={0.1}
                value={stressRateHike}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStressRateHike(val);
                  setIsStressTestEnabled(true);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />

              {/* Preset Quick Buttons - Distinct Blue, Green, Red themes */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { label: '0.0%', hike: 0, sub: 'Base', active: 'bg-blue-600 text-white border-blue-600 font-black shadow-xs ring-1 ring-blue-400', inactive: 'bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-blue-200' },
                  { label: '+0.5%', hike: 0.5, sub: '2 hikes', active: 'bg-emerald-600 text-white border-emerald-600 font-black shadow-xs ring-1 ring-emerald-400', inactive: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-emerald-200' },
                  { label: '+1.0%', hike: 1.0, sub: '4 hikes', active: 'bg-teal-600 text-white border-teal-600 font-black shadow-xs ring-1 ring-teal-400', inactive: 'bg-teal-50/80 hover:bg-teal-100 text-teal-900 border-teal-200' },
                  { label: '+2.0%', hike: 2.0, sub: 'Severe', active: 'bg-red-600 text-white border-red-600 font-black shadow-xs ring-1 ring-red-400', inactive: 'bg-red-50/80 hover:bg-red-100 text-red-900 border-red-200' },
                  { label: '+3.0%', hike: 3.0, sub: 'APRA', active: 'bg-rose-700 text-white border-rose-700 font-black shadow-xs ring-1 ring-rose-400', inactive: 'bg-rose-50/80 hover:bg-rose-100 text-rose-900 border-rose-200' },
                ].map((preset) => {
                  const isSelected = Math.abs(stressRateHike - preset.hike) < 0.05;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStressRateHike(preset.hike);
                        setIsStressTestEnabled(true);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected ? preset.active : preset.inactive
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{preset.label}</div>
                      <div className="text-[9px] font-medium leading-tight opacity-90">{preset.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-white/90 rounded-lg border border-amber-200 text-xs">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Extra Monthly Cost</div>
                <div className="text-sm font-extrabold text-rose-600 tabular-nums">
                  {metrics.monthlyHikeDelta > 0 ? `+$${metrics.monthlyHikeDelta.toLocaleString()}/mo` : '$0/mo'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {metrics.hikePercentageIncrease > 0 ? `+${metrics.hikePercentageIncrease.toFixed(1)}% monthly jump` : 'Baseline payment'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Annual Cashflow Impact</div>
                <div className="text-sm font-extrabold text-neutral-900 tabular-nums">
                  {metrics.annualHikeDelta > 0 ? `+$${metrics.annualHikeDelta.toLocaleString()}/yr` : '$0/yr'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  ${Math.round(metrics.annualHikeDelta / 52).toLocaleString()} extra / week
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Lifetime Interest Surge</div>
                <div className="text-sm font-extrabold text-amber-700 tabular-nums">
                  {metrics.extraLifetimeInterestFromHike > 0 ? `+$${formatCurrencyAxis(metrics.extraLifetimeInterestFromHike)}` : '$0'}
                </div>
                <div className="text-[10px] text-neutral-500">Over {loanTermYears} yrs</div>
              </div>
            </div>

            {/* Toggle to apply stress to full amortization schedule */}
            <div className="flex items-center justify-between pt-1 text-xs text-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyStressToAmortisation}
                  onChange={(e) => setApplyStressToAmortisation(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer accent-amber-500"
                />
                <span className="text-[11px] font-semibold text-neutral-700">
                  Apply +{stressRateHike.toFixed(2)}% hike to 30-year lifetime amortization charts
                </span>
              </label>
            </div>
          </div>

          {/* 4. Loan Term & Repayment Type - Distinct Blue, Green, Red themes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Loan Term */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                Loan Term
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { yrs: 15, active: 'bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400', inactive: 'bg-blue-50 text-blue-800 hover:bg-blue-100' },
                  { yrs: 20, active: 'bg-emerald-600 text-white font-black shadow-xs ring-1 ring-emerald-400', inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' },
                  { yrs: 25, active: 'bg-red-600 text-white font-black shadow-xs ring-1 ring-red-400', inactive: 'bg-red-50 text-red-800 hover:bg-red-100' },
                  { yrs: 30, active: 'bg-slate-900 text-white font-black shadow-xs ring-1 ring-slate-400', inactive: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
                ].map((item) => (
                  <button
                    key={item.yrs}
                    type="button"
                    onClick={() => setLoanTermYears(item.yrs)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      loanTermYears === item.yrs ? item.active : item.inactive
                    }`}
                  >
                    {item.yrs}y
                  </button>
                ))}
              </div>
            </div>

            {/* Repayment Type */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                Repayment Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRepaymentType('pi')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    repaymentType === 'pi'
                      ? 'bg-blue-600 text-white font-black border-blue-600 shadow-xs ring-1 ring-blue-400'
                      : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  Principal &amp; Interest
                </button>
                <button
                  type="button"
                  onClick={() => setRepaymentType('io')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    repaymentType === 'io'
                      ? 'bg-red-600 text-white font-black border-red-600 shadow-xs ring-1 ring-red-400'
                      : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                  }`}
                >
                  Interest Only
                </button>
              </div>
            </div>
          </div>

          {/* 5. Extra Repayments Simulator (Collapsible) */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExtraSimulator(!showExtraSimulator)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#E5BC00]" />
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Extra Repayments Simulator
                </span>
                {extraRepaymentMonthly > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Active (+${extraRepaymentMonthly}/mo)
                  </span>
                )}
              </div>
              {showExtraSimulator ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            {showExtraSimulator && (
              <div className="p-4 pt-0 space-y-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  See how paying an extra amount each month can dramatically reduce your loan term and overall interest.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setExtraRepaymentMonthly(amt)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        extraRepaymentMonthly === amt
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {amt === 0 ? 'None' : `+$${amt}/mo`}
                    </button>
                  ))}
                </div>

                {extraRepaymentMonthly > 0 && metrics.interestSaved > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Potential Savings</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <div className="text-[11px] text-emerald-700">Interest Saved:</div>
                        <div className="text-base font-extrabold text-emerald-950 tabular-nums">
                          ${metrics.interestSaved.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-emerald-700">Time Saved:</div>
                        <div className="text-base font-extrabold text-emerald-950 tabular-nums">
                          {metrics.yearsSaved} Years
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Column (Right) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Repayment Card */}
          <div className="bg-neutral-950 text-white rounded-2xl p-6 shadow-xl border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                Estimated Loan Repayment
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD200] text-neutral-950">
                {repaymentType === 'pi' ? 'Principal & Interest' : 'Interest Only'}
              </span>
            </div>

            {/* Frequency Selector - Blue, Green, Red themes */}
            <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-semibold shadow-inner">
              {[
                { freq: 'monthly' as const, label: 'Monthly', active: 'bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400', inactive: 'text-blue-300 hover:text-white hover:bg-blue-600/30' },
                { freq: 'fortnightly' as const, label: 'Fortnightly', active: 'bg-emerald-600 text-white font-black shadow-xs ring-1 ring-emerald-400', inactive: 'text-emerald-300 hover:text-white hover:bg-emerald-600/30' },
                { freq: 'weekly' as const, label: 'Weekly', active: 'bg-red-600 text-white font-black shadow-xs ring-1 ring-red-400', inactive: 'text-red-300 hover:text-white hover:bg-red-600/30' },
              ].map((item) => (
                <button
                  key={item.freq}
                  type="button"
                  onClick={() => setRepaymentFrequency(item.freq)}
                  className={`py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                    repaymentFrequency === item.freq
                      ? item.active
                      : item.inactive
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Hero Big Payment Figure */}
            <div className="text-center py-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FFD200] tracking-tight tabular-nums">
                ${(isStressTestEnabled && stressRateHike > 0
                  ? metrics.stressedActivePeriodicRepayment
                  : metrics.activePeriodicRepayment
                ).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400 capitalize font-medium flex items-center justify-center gap-1.5 flex-wrap">
                <span>
                  per {repaymentFrequency === 'fortnightly' ? 'fortnight' : repaymentFrequency === 'weekly' ? 'week' : 'month'}
                </span>
                {isStressTestEnabled && stressRateHike > 0 && (
                  <span className="text-amber-400 font-bold">
                    (at {metrics.stressedInterestRate}% p.a.)
                  </span>
                )}
              </div>

              {/* Stress-Test Delta Banner */}
              {isStressTestEnabled && stressRateHike > 0 && metrics.periodicHikeDelta > 0 && (
                <div className="pt-2 mt-1 border-t border-neutral-800 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-neutral-400 text-[11px]">
                    Base: ${metrics.activePeriodicRepayment.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-rose-400" />
                    <span>+${metrics.periodicHikeDelta.toLocaleString()} (+{metrics.hikePercentageIncrease.toFixed(1)}%)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs pt-1 border-t border-neutral-800">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Borrowing Amount (Principal):</span>
                <span className="font-extrabold text-white tabular-nums">
                  ${loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>
                  Total Interest {isStressTestEnabled && stressRateHike > 0 ? `(at ${metrics.stressedInterestRate}%)` : `(at ${interestRate}%)`}:
                </span>
                <span className="font-extrabold text-amber-400 tabular-nums">
                  ${(isStressTestEnabled && stressRateHike > 0
                    ? metrics.stressedTotalInterest
                    : metrics.totalInterest
                  ).toLocaleString()}
                </span>
              </div>
              {isStressTestEnabled && stressRateHike > 0 && metrics.extraLifetimeInterestFromHike > 0 && (
                <div className="flex items-center justify-between text-rose-300 text-[11px]">
                  <span>Extra Interest from Rate Hike:</span>
                  <span className="font-extrabold tabular-nums">
                    +${metrics.extraLifetimeInterestFromHike.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-neutral-300">
                <span>Total Loan Cost (Over {loanTermYears} yrs):</span>
                <span className="font-extrabold text-white tabular-nums">
                  ${(isStressTestEnabled && stressRateHike > 0
                    ? metrics.stressedTotalPayments
                    : metrics.totalPayments
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual Lifetime Principal vs Interest Donut Chart */}
            <div className="pt-3 border-t border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-[#FFD200]" />
                  <span>Total Loan Lifetime Breakdown</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Principal vs Interest</span>
              </div>

              {/* Donut Chart */}
              <div className="relative h-32 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lifetimePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {lifetimePieData.map((entry, index) => (
                        <Cell key={`donut-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#404040',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Total</span>
                  <span className="text-xs font-black text-white font-mono">
                    ${formatCurrencyAxis(metrics.totalPayments)}
                  </span>
                </div>
              </div>

              {/* Principal vs Interest Proportional Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Principal (${formatCurrencyAxis(loanAmount)} · {metrics.principalPercent}%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Interest (${formatCurrencyAxis(metrics.totalInterest)} · {metrics.interestPercent}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${metrics.principalPercent}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${metrics.interestPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upfront Settlement Costs Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#E5BC00]" />
                <span>Upfront Settlement Costs</span>
              </h4>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                {(['NSW', 'VIC', 'QLD', 'WA'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStateAbbr(st)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      stateAbbr === st ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-700 divide-y divide-neutral-100">
              <div className="flex items-center justify-between pt-1">
                <span>Deposit ({depositPercent}%):</span>
                <span className="font-bold tabular-nums">${depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Estimated Stamp Duty ({stateAbbr}):</span>
                <span className="font-bold tabular-nums text-neutral-900">
                  ${metrics.stampDuty.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Transfer &amp; Mortgage Registry:</span>
                <span className="font-bold tabular-nums">
                  ${(metrics.transferFee + metrics.mortgageRegistrationFee).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Legal &amp; Conveyancing estimate:</span>
                <span className="font-bold tabular-nums">${metrics.conveyancingEstimate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm font-extrabold text-neutral-900">
                <span>Total Cash Required:</span>
                <span className="text-emerald-700 tabular-nums">
                  ${metrics.totalCashRequired.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Loan Consultant Pre-Approval Action */}
            <div className="pt-2 border-t border-neutral-100">
              {consultationRequested ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Request received! A Ray White Finance specialist will be in touch shortly.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConsultationRequested(true)}
                  className="w-full py-2.5 px-3 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Pre-Approved with Ray White Finance</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TIMELINE OF PRINCIPAL VS INTEREST PAYMENTS OVER LOAN LIFE */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-neutral-900 text-[#FFD200] rounded-xl shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight flex items-center gap-2">
                  <span>Timeline of Principal vs. Interest Payments</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {loanTermYears}-Year Loan Life
                  </span>
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  Observe the timeline transition: early payments are interest-heavy, crossing over into accelerated home equity payoff.
                </p>
              </div>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start md:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setGraphView('stress')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                graphView === 'stress'
                  ? 'bg-neutral-900 text-[#FFD200] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Rate Hike Stress Chart</span>
              {stressRateHike > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-neutral-950 font-black">
                  +{stressRateHike.toFixed(1)}%
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setGraphView('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                graphView === 'annual'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Annual Split ($)</span>
            </button>
            <button
              type="button"
              onClick={() => setGraphView('composition')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                graphView === 'composition'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Repayment Share (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setGraphView('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                graphView === 'cumulative'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cumulative Paid</span>
            </button>
            <button
              type="button"
              onClick={() => setGraphView('balance')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                graphView === 'balance'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-blue-400" />
              <span>Debt Paydown</span>
            </button>
          </div>
        </div>

        {/* Milestone Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500">Loan Principal</div>
            <div className="text-base sm:text-lg font-black text-neutral-900 tabular-nums">
              ${loanAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              100% Home Equity
            </div>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <div className="text-[11px] font-semibold text-neutral-600">Total Interest Paid</div>
            <div className="text-base sm:text-lg font-black text-amber-900 tabular-nums">
              ${metrics.totalInterest.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
              {metrics.interestPercent}% of overall costs
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <div className="text-[11px] font-semibold text-neutral-600">5-Year Equity Built</div>
            <div className="text-base sm:text-lg font-black text-emerald-950 tabular-nums">
              ${amortisationData.fiveYearEquity.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              {loanAmount > 0 ? Math.round((amortisationData.fiveYearEquity / loanAmount) * 100) : 0}% equity in first 5 yrs
            </div>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
            <div className="text-[11px] font-semibold text-neutral-600">Tipping Point (Crossover)</div>
            <div className="text-base sm:text-lg font-black text-indigo-950">
              {amortisationData.crossoverYear ? `Year ${amortisationData.crossoverYear}` : 'Interest Only'}
            </div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
              {amortisationData.crossoverYear ? 'Principal overtakes interest' : 'Flat interest term'}
            </div>
          </div>
        </div>

        {/* Interactive Control Panel: Rate Hike Stress Simulator or Timeline Year Inspection */}
        {graphView === 'stress' ? (
          <div className="p-4 sm:p-5 bg-neutral-950 text-white rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FFD200]" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-300">
                    Live Monthly Payment Hike Simulator
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black">
                    Interactive Slider
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Drag the rate hike slider to visually observe the payment jump across all scenarios in the chart below.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-neutral-400">Tested Hike:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FFD200] text-neutral-950 font-black text-xs font-mono shadow-xs">
                  +{stressRateHike.toFixed(2)}% ({metrics.stressedInterestRate}% p.a.)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={4.0}
                step={0.1}
                value={stressRateHike}
                onChange={(e) => {
                  setStressRateHike(Number(e.target.value));
                  setIsStressTestEnabled(true);
                }}
                className="w-full accent-[#FFD200] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>0.0% (Current Base {interestRate}% p.a.)</span>
                <span className="text-indigo-400 font-bold">+3.00% (APRA Regulatory Buffer)</span>
                <span>+4.00% (High Stress)</span>
              </div>
            </div>

            {/* Quick Hike Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { hike: 0, label: '0.0%: Base Rate' },
                { hike: 0.5, label: '+0.50%: Mild (2 hikes)' },
                { hike: 1.0, label: '+1.00%: Moderate (4 hikes)' },
                { hike: 1.5, label: '+1.50%: Significant' },
                { hike: 2.0, label: '+2.00%: Severe' },
                { hike: 3.0, label: '🏛️ +3.00%: APRA Buffer Test' },
                { hike: 4.0, label: '+4.00%: Max Stress' },
              ].map((m) => (
                <button
                  key={m.hike}
                  type="button"
                  onClick={() => {
                    setStressRateHike(m.hike);
                    setIsStressTestEnabled(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    Math.abs(stressRateHike - m.hike) < 0.05
                      ? 'bg-[#FFD200] text-neutral-950 shadow-xs font-black'
                      : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Live Scenario Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800 text-xs">
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Base Monthly Repayment</div>
                <div className="text-base font-black text-white mt-0.5 tabular-nums">
                  ${metrics.baseMonthlyPayment.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  At base {interestRate}% p.a.
                </div>
              </div>

              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Stressed Monthly Repayment</div>
                <div className="text-base font-black text-[#FFD200] mt-0.5 tabular-nums">
                  ${metrics.stressedMonthlyPayment.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                  At stressed {metrics.stressedInterestRate}% p.a.
                </div>
              </div>

              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Monthly Cashflow Impact</div>
                <div className="text-base font-black text-rose-400 mt-0.5 tabular-nums">
                  {metrics.monthlyHikeDelta > 0 ? `+$${metrics.monthlyHikeDelta.toLocaleString()}` : '$0'}
                </div>
                <div className="text-[10px] text-rose-300 font-semibold mt-0.5">
                  {metrics.hikePercentageIncrease > 0 ? `+${metrics.hikePercentageIncrease.toFixed(1)}% jump` : 'Baseline'}
                </div>
              </div>

              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Extra Annual Cost</div>
                <div className="text-base font-black text-amber-400 mt-0.5 tabular-nums">
                  {metrics.annualHikeDelta > 0 ? `+$${metrics.annualHikeDelta.toLocaleString()}` : '$0'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  ${Math.round(metrics.annualHikeDelta / 52).toLocaleString()} / week
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 bg-neutral-950 text-white rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFD200]" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-300">
                    Interactive Timeline Scrubber
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Drag the timeline slider or select a milestone to see how payments evolve over the {loanTermYears}-year lifecycle.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-neutral-400">Timeline Year:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FFD200] text-neutral-950 font-black text-xs font-mono shadow-xs">
                  Year {inspectedYearData?.year || inspectYear} of {loanTermYears}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={1}
                max={loanTermYears}
                step={1}
                value={inspectYear}
                onChange={(e) => setInspectYear(Number(e.target.value))}
                className="w-full accent-[#FFD200] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Year 1 (Loan Inception)</span>
                {amortisationData.crossoverYear && amortisationData.crossoverYear <= loanTermYears && (
                  <span className="text-[#FFD200] font-bold">
                    Yr {amortisationData.crossoverYear} (Crossover Point)
                  </span>
                )}
                <span>Year {loanTermYears} (100% Paid Off)</span>
              </div>
            </div>

            {/* Quick Milestone Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { year: 1, label: 'Yr 1: Initial Loan' },
                { year: 5, label: 'Yr 5: Early Equity' },
                { year: 10, label: 'Yr 10: Building' },
                ...(amortisationData.crossoverYear
                  ? [{ year: amortisationData.crossoverYear, label: `Yr ${amortisationData.crossoverYear}: Crossover ⚡` }]
                  : []),
                { year: Math.min(loanTermYears, 20), label: `Yr ${Math.min(loanTermYears, 20)}: Paydown` },
                { year: loanTermYears, label: `Yr ${loanTermYears}: Debt-Free 🎉` },
              ]
                .filter((v, i, a) => a.findIndex((t) => t.year === v.year) === i && v.year <= loanTermYears)
                .map((m) => (
                  <button
                    key={m.year}
                    type="button"
                    onClick={() => setInspectYear(m.year)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      inspectYear === m.year
                        ? 'bg-[#FFD200] text-neutral-950 shadow-xs'
                        : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
            </div>

            {/* Year Data Breakdown Card */}
            {inspectedYearData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800 text-xs">
                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Principal in Yr {inspectedYearData.year}</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5 tabular-nums">
                    ${inspectedYearData.principalPaid.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                    {inspectedYearData.principalShare}% of Year {inspectedYearData.year} repayment
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Interest in Yr {inspectedYearData.year}</div>
                  <div className="text-base font-black text-amber-400 mt-0.5 tabular-nums">
                    ${inspectedYearData.interestPaid.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {inspectedYearData.interestShare}% of Year {inspectedYearData.year} repayment
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Remaining Balance</div>
                  <div className="text-base font-black text-blue-400 mt-0.5 tabular-nums">
                    ${inspectedYearData.remainingBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Debt balance at year end
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Cumulative Equity</div>
                  <div className="text-base font-black text-[#FFD200] mt-0.5 tabular-nums">
                    {inspectedYearData.equityPercent}%
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                    ${inspectedYearData.cumulativePrincipal.toLocaleString()} debt retired
                  </div>
                </div>
              </div>
            )}

            {/* Proportional Year Bar */}
            {inspectedYearData && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Year {inspectedYearData.year} Principal: {inspectedYearData.principalShare}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Year {inspectedYearData.year} Interest: {inspectedYearData.interestShare}%</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${inspectedYearData.principalShare}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${inspectedYearData.interestShare}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECHARTS AMORTISATION & STRESS GRAPH */}
        <div className="w-full h-[330px] pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {graphView === 'stress' ? (
              <BarChart
                data={stressCurveData}
                margin={{ top: 20, right: 15, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="hikeLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrencyAxis}
                />
                <Tooltip content={<CustomStressTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <ReferenceLine
                  x="+3.00%"
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '🏛️ APRA +3.00% Buffer Benchmark',
                    fill: '#4f46e5',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
                <Bar
                  name="Base Monthly Repayment"
                  dataKey="basePayment"
                  stackId="stress"
                  fill="#0284c7"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  name="Hike Additional Outlay"
                  dataKey="extraPayment"
                  stackId="stress"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                >
                  {stressCurveData.map((entry, index) => (
                    <Cell
                      key={`stress-cell-${index}`}
                      fill={entry.isSelected ? '#ef4444' : entry.isApraBuffer ? '#6366f1' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : graphView === 'annual' ? (
              <BarChart
                data={amortisationData.schedule.filter((d) => d.year > 0)}
                margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="yearLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(loanTermYears / 8))}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrencyAxis}
                />
                <Tooltip content={<CustomScheduleTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                {amortisationData.crossoverYear && (
                  <ReferenceLine
                    x={`Yr ${amortisationData.crossoverYear}`}
                    stroke="#6366f1"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `⚡ Crossover Yr ${amortisationData.crossoverYear}`,
                      fill: '#4f46e5',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                )}
                <ReferenceLine
                  x={`Yr ${inspectYear}`}
                  stroke="#FFD200"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Bar
                  name="Principal Paid"
                  dataKey="principalPaid"
                  stackId="annual"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  name="Interest Paid"
                  dataKey="interestPaid"
                  stackId="annual"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : graphView === 'composition' ? (
              <BarChart
                data={amortisationData.schedule.filter((d) => d.year > 0)}
                margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="yearLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(loanTermYears / 8))}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomScheduleTooltip isPercentage={true} />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '50% Crossover Threshold',
                    fill: '#4f46e5',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <ReferenceLine
                  x={`Yr ${inspectYear}`}
                  stroke="#FFD200"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Bar
                  name="Principal Share (%)"
                  dataKey="principalShare"
                  stackId="comp"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  name="Interest Share (%)"
                  dataKey="interestShare"
                  stackId="comp"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : graphView === 'cumulative' ? (
              <AreaChart
                data={amortisationData.schedule.filter((d) => d.year > 0)}
                margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cumPrincipalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="cumInterestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="yearLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(loanTermYears / 8))}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrencyAxis}
                />
                <Tooltip content={<CustomScheduleTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <ReferenceLine
                  x={`Yr ${inspectYear}`}
                  stroke="#FFD200"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  name="Cumulative Principal"
                  dataKey="cumulativePrincipal"
                  stackId="cum"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cumPrincipalGrad)"
                />
                <Area
                  type="monotone"
                  name="Cumulative Interest"
                  dataKey="cumulativeInterest"
                  stackId="cum"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cumInterestGrad)"
                />
              </AreaChart>
            ) : (
              <AreaChart
                data={amortisationData.schedule}
                margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="yearLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(loanTermYears / 8))}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrencyAxis}
                />
                <Tooltip content={<CustomScheduleTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <ReferenceLine
                  x={`Yr ${inspectYear}`}
                  stroke="#FFD200"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  name="Remaining Balance"
                  dataKey="remainingBalance"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGradient)"
                />
                <Area
                  type="monotone"
                  name="Cumulative Equity"
                  dataKey="cumulativePrincipal"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Educational Repayment & Stress Testing Anatomy Box */}
        {graphView === 'stress' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>1. The APRA 3.00% Buffer Rule</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Australian lenders assess loan serviceability at <strong>+3.00% above the product rate</strong> to ensure you can comfortably service the mortgage through monetary tightening cycles.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>2. Buffer Capacity Planning</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                At <strong>+{stressRateHike.toFixed(2)}%</strong> hike, payments increase by <strong>+${metrics.monthlyHikeDelta.toLocaleString()}/mo</strong>. Parking savings in an offset account shields you against rising rates.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>3. Hedging via Split or Fixed Loans</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                If market rate spikes concern your household cashflow, consider locking a 3-year fixed term or a 50/50 split loan for guaranteed repayment certainty.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>1. Early Years (Interest Heavy)</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Because loan balance is highest initially, the bulk of every dollar covers interest. Principal balance decreases slowly at first.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>2. The Crossover Milestone</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                {amortisationData.crossoverYear ? (
                  <>At <strong>Year {amortisationData.crossoverYear}</strong>, payments flip: over 50% of each dollar directly builds home equity instead of bank interest.</>
                ) : (
                  <>Principal repayments begin once the interest-only period ends.</>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>3. Accelerated Equity Paydown</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                In the final years, smaller debt yields minimal monthly interest, snowballing loan elimination to reach full 100% home ownership.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Amortization Table */}
        <div className="pt-3 border-t border-neutral-200">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            {/* Header & Controls Toolbar */}
            <div className="p-4 sm:p-5 bg-neutral-50/80 border-b border-neutral-200 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-[#FFD200] flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-neutral-900">
                        Detailed Amortization Table
                      </h4>
                      <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                        Row-by-Row
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Annual breakdown of principal &amp; interest payments, declining debt, and equity progression
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {/* Compare 2 Rates - Bold Crimson Red Theme */}
                  {onOpenRateCompare && (
                    <button
                      type="button"
                      onClick={onOpenRateCompare}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs shadow-red-600/20 transition-all cursor-pointer active:scale-95 border border-red-500"
                      title="Compare this schedule side-by-side with another interest rate"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
                      <span>Compare 2 Rates Side-by-Side</span>
                    </button>
                  )}

                  {/* Export CSV - Fresh Emerald Green Theme */}
                  <button
                    type="button"
                    onClick={handleDownloadScheduleCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 border border-emerald-500"
                    title="Export complete schedule to CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Export CSV</span>
                  </button>

                  {/* Collapse / Expand Table - Rose Red Accent */}
                  <button
                    type="button"
                    onClick={() => setShowScheduleTable(!showScheduleTable)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <span>{showScheduleTable ? 'Collapse Table' : 'Expand Table'}</span>
                    {showScheduleTable ? <ChevronUp className="w-3.5 h-3.5 text-rose-600" /> : <ChevronDown className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                </div>
              </div>

              {/* Filter mode and search filter bar when table is open */}
              {showScheduleTable && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-200/60">
                  <div className="flex items-center gap-1.5 bg-neutral-200/70 p-1 rounded-xl text-xs font-semibold shrink-0 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setTableFilterMode('all')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        tableFilterMode === 'all'
                          ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-blue-400'
                          : 'text-blue-900 hover:bg-blue-100'
                      }`}
                    >
                      All {loanTermYears} Years (Full Schedule)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilterMode('milestones')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        tableFilterMode === 'milestones'
                          ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                          : 'text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      Key Milestones (5-Yr Intervals)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search year or keyword..."
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
                      {displayedScheduleRows.length} {displayedScheduleRows.length === 1 ? 'row' : 'rows'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Table Content */}
            {showScheduleTable && (
              <>
                <div className="p-2.5 bg-amber-50/60 border-b border-amber-200/50 flex items-center justify-between text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">💡 Interactive:</span>
                    <span>Click any row to jump and sync the interactive repayment timeline chart above.</span>
                  </div>
                  {inspectYear && (
                    <span className="font-semibold text-neutral-700 bg-white/80 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                      Active: <strong className="text-neutral-950">Year {inspectYear}</strong>
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-neutral-100 text-neutral-700 font-bold sticky top-0 z-10 border-b border-neutral-200 shadow-2xs">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">Year</th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right">Starting Balance</th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right text-emerald-700">
                          Annual Principal
                        </th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right text-amber-700">
                          Annual Interest
                        </th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right">Total Repayment</th>
                        <th className="py-2.5 px-3 whitespace-nowrap min-w-[130px]">Payment Split</th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right text-emerald-800">
                          Cumul. Principal
                        </th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right text-amber-800">
                          Cumul. Interest
                        </th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right font-extrabold text-neutral-900">
                          Ending Balance
                        </th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right">Home Equity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {displayedScheduleRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-neutral-400">
                            No amortization data matching &quot;{tableSearchQuery}&quot;. Clear search filter to view all years.
                          </td>
                        </tr>
                      ) : (
                        displayedScheduleRows.map((row) => {
                          const isInspected = inspectYear === row.year;
                          const isCrossover = amortisationData.crossoverYear === row.year;
                          const isDebtFree = row.remainingBalance === 0 || row.year === loanTermYears;
                          const isStart = row.year === 1;

                          // Compute starting balance for this year
                          const prevRow = amortisationData.schedule.find((s) => s.year === row.year - 1);
                          const startingBal = prevRow ? prevRow.remainingBalance : loanAmount;
                          const annualTotal = row.principalPaid + row.interestPaid;

                          return (
                            <tr
                              key={row.year}
                              onClick={() => setInspectYear(row.year)}
                              className={`cursor-pointer transition-colors ${
                                isInspected
                                  ? 'bg-[#FFD200]/20 font-medium'
                                  : isCrossover
                                  ? 'bg-purple-50/50 hover:bg-purple-50'
                                  : 'hover:bg-neutral-50/90'
                              }`}
                            >
                              {/* Year & Milestone Badges */}
                              <td className="py-2.5 px-3 font-bold text-neutral-900 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>Year {row.year}</span>
                                  {isStart && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                      Start
                                    </span>
                                  )}
                                  {isCrossover && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-0.5 shadow-2xs">
                                      ⚡ Crossover
                                    </span>
                                  )}
                                  {isDebtFree && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shadow-2xs">
                                      🎉 Debt-Free
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Starting Balance */}
                              <td className="py-2.5 px-3 text-right font-medium text-neutral-600 tabular-nums whitespace-nowrap">
                                ${startingBal.toLocaleString()}
                              </td>

                              {/* Annual Principal Paid */}
                              <td className="py-2.5 px-3 text-right text-emerald-700 font-bold tabular-nums whitespace-nowrap">
                                ${row.principalPaid.toLocaleString()}
                              </td>

                              {/* Annual Interest Paid */}
                              <td className="py-2.5 px-3 text-right text-amber-700 font-bold tabular-nums whitespace-nowrap">
                                ${row.interestPaid.toLocaleString()}
                              </td>

                              {/* Total Annual Repayment */}
                              <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
                                ${annualTotal.toLocaleString()}
                              </td>

                              {/* Payment Split Visual Bar */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="w-full min-w-[110px] space-y-1">
                                  <div className="flex justify-between text-[10px] tabular-nums font-semibold">
                                    <span className="text-emerald-700">{row.principalShare}% P</span>
                                    <span className="text-amber-700">{row.interestShare}% I</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden flex">
                                    <div
                                      className="bg-emerald-500 h-full transition-all duration-300"
                                      style={{ width: `${row.principalShare}%` }}
                                      title={`Principal: ${row.principalShare}%`}
                                    />
                                    <div
                                      className="bg-amber-500 h-full transition-all duration-300"
                                      style={{ width: `${row.interestShare}%` }}
                                      title={`Interest: ${row.interestShare}%`}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Cumulative Principal */}
                              <td className="py-2.5 px-3 text-right text-emerald-800 font-medium tabular-nums whitespace-nowrap">
                                ${row.cumulativePrincipal.toLocaleString()}
                              </td>

                              {/* Cumulative Interest */}
                              <td className="py-2.5 px-3 text-right text-amber-800 font-medium tabular-nums whitespace-nowrap">
                                ${row.cumulativeInterest.toLocaleString()}
                              </td>

                              {/* Ending Balance */}
                              <td className="py-2.5 px-3 text-right font-bold text-neutral-900 tabular-nums whitespace-nowrap">
                                ${row.remainingBalance.toLocaleString()}
                              </td>

                              {/* Equity % */}
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                                  {row.equityPercent}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {/* Summary Footer */}
                    <tfoot className="bg-neutral-900 text-white font-bold sticky bottom-0 z-10 border-t-2 border-neutral-700 shadow-md">
                      <tr>
                        <td className="py-3 px-3 text-amber-400">Total Lifetime</td>
                        <td className="py-3 px-3 text-right text-neutral-300 tabular-nums">
                          ${loanAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">
                          $
                          {amortisationData.schedule.length > 0
                            ? amortisationData.schedule[amortisationData.schedule.length - 1].cumulativePrincipal.toLocaleString()
                            : loanAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-300 tabular-nums">
                          $
                          {amortisationData.schedule.length > 0
                            ? amortisationData.schedule[amortisationData.schedule.length - 1].cumulativeInterest.toLocaleString()
                            : '0'}
                        </td>
                        <td className="py-3 px-3 text-right text-white tabular-nums">
                          $
                          {amortisationData.schedule.length > 0
                            ? amortisationData.schedule[amortisationData.schedule.length - 1].totalPaid.toLocaleString()
                            : loanAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] text-neutral-300 font-normal">
                            Full Term Paid Off
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">
                          ${loanAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-300 tabular-nums">
                          $
                          {amortisationData.schedule.length > 0
                            ? amortisationData.schedule[amortisationData.schedule.length - 1].cumulativeInterest.toLocaleString()
                            : '0'}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-extrabold tabular-nums">
                          $0
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-extrabold tabular-nums">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="p-5 sm:p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
        {calculatorBody}
      </div>
    );
  }

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto border border-neutral-200">
          {calculatorBody}
        </div>
      </div>
    );
  }

  return calculatorBody;
};

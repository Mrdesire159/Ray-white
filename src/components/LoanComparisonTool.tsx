import React, { useState, useMemo } from 'react';
import {
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Percent,
  Calendar,
  AlertCircle,
  ArrowRight,
  Zap,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export interface LoanProduct {
  id: string;
  name: string;
  type: 'variable' | 'fixed' | 'split' | 'basic';
  typeLabel: string;
  badge?: string;
  interestRate: number; // in percent e.g. 5.85
  comparisonRate?: number;
  fixedYears?: number; // if fixed
  revertRate?: number; // what it reverts to after fixed period
  monthlyFee: number;
  upfrontFee: number;
  features: {
    offsetAccount: boolean;
    freeRedraw: boolean;
    unlimitedExtraRepayments: boolean;
    rateLockOption: boolean;
  };
  pros: string[];
  cons: string[];
  color: string;
}

export interface LoanComparisonToolProps {
  propertyPrice: number;
  propertyAddress?: string;
  onOpenConsultation?: (selectedProduct: string) => void;
  inline?: boolean;
}

const DEFAULT_LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'prod-var-prime',
    name: 'Ray White Premier Variable',
    type: 'variable',
    typeLabel: 'Variable Rate',
    badge: 'Most Popular',
    interestRate: 5.85,
    comparisonRate: 5.92,
    monthlyFee: 10,
    upfrontFee: 250,
    features: {
      offsetAccount: true,
      freeRedraw: true,
      unlimitedExtraRepayments: true,
      rateLockOption: false,
    },
    pros: ['100% Offset account included', 'Make unlimited extra repayments', 'Redraw available anytime'],
    cons: ['Repayments can rise if RBA cash rate increases'],
    color: '#3b82f6', // blue
  },
  {
    id: 'prod-fix-3yr',
    name: '3-Year Fixed Security',
    type: 'fixed',
    typeLabel: '3-Year Fixed',
    badge: 'Rate Protection',
    interestRate: 5.39,
    comparisonRate: 5.75,
    fixedYears: 3,
    revertRate: 6.15,
    monthlyFee: 0,
    upfrontFee: 395,
    features: {
      offsetAccount: false,
      freeRedraw: false,
      unlimitedExtraRepayments: false,
      rateLockOption: true,
    },
    pros: ['Guaranteed repayments for 3 years', 'Shielded from rate hikes', 'Budgeting certainty'],
    cons: ['Break fees apply if refinanced early', 'Limited extra repayments (max $10k/yr)'],
    color: '#10b981', // emerald
  },
  {
    id: 'prod-split-5050',
    name: '50/50 Smart Split Loan',
    type: 'split',
    typeLabel: 'Hybrid Split',
    badge: 'Balanced Hedge',
    interestRate: 5.62, // weighted average (50% at 5.39% + 50% at 5.85%)
    comparisonRate: 5.82,
    fixedYears: 3,
    revertRate: 6.0,
    monthlyFee: 10,
    upfrontFee: 350,
    features: {
      offsetAccount: true,
      freeRedraw: true,
      unlimitedExtraRepayments: true,
      rateLockOption: true,
    },
    pros: ['Half rate certainty, half offset flexibility', 'Mitigates rate risk', 'Offset on variable portion'],
    cons: ['Two loan sub-accounts to manage'],
    color: '#f59e0b', // amber
  },
  {
    id: 'prod-fix-5yr',
    name: '5-Year Ultra-Lock Fixed',
    type: 'fixed',
    typeLabel: '5-Year Fixed',
    interestRate: 5.55,
    comparisonRate: 5.89,
    fixedYears: 5,
    revertRate: 6.25,
    monthlyFee: 0,
    upfrontFee: 495,
    features: {
      offsetAccount: false,
      freeRedraw: false,
      unlimitedExtraRepayments: false,
      rateLockOption: true,
    },
    pros: ['Long-term peace of mind (60 months)', 'Immunized from 5 years of rate changes'],
    cons: ['Higher break fees', 'Cannot benefit if interest rates fall'],
    color: '#8b5cf6', // purple
  },
];

export const LoanComparisonTool: React.FC<LoanComparisonToolProps> = ({
  propertyPrice,
  propertyAddress = '',
  onOpenConsultation,
  inline = true,
}) => {
  const initialBasePrice = propertyPrice > 0 ? propertyPrice : 1500000;

  // General Loan Parameters
  const [purchasePrice, setPurchasePrice] = useState<number>(initialBasePrice);
  const [depositPercent, setDepositPercent] = useState<number>(20);
  const [depositAmount, setDepositAmount] = useState<number>(Math.round(initialBasePrice * 0.2));
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [repaymentFrequency, setRepaymentFrequency] = useState<'monthly' | 'fortnightly' | 'weekly'>('monthly');

  // Rate Stress Test Simulator
  const [rateStressDelta, setRateStressDelta] = useState<number>(0); // 0, +0.5%, +1.0%, +1.5%

  // Products to compare
  const [products, setProducts] = useState<LoanProduct[]>(DEFAULT_LOAN_PRODUCTS);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    'prod-var-prime',
    'prod-fix-3yr',
    'prod-split-5050',
  ]);

  // Lead capture state
  const [inquiredProductId, setInquiredProductId] = useState<string | null>(null);
  const [showFeatureChecklist, setShowFeatureChecklist] = useState<boolean>(true);

  // Sync when propertyPrice changes
  React.useEffect(() => {
    if (propertyPrice > 0) {
      setPurchasePrice(propertyPrice);
      setDepositAmount(Math.round(propertyPrice * (depositPercent / 100)));
    }
  }, [propertyPrice]);

  const handlePercentChange = (pct: number) => {
    setDepositPercent(pct);
    setDepositAmount(Math.round(purchasePrice * (pct / 100)));
  };

  const loanAmount = useMemo(() => {
    return Math.max(0, purchasePrice - depositAmount);
  }, [purchasePrice, depositAmount]);

  // Calculate Amortisation and Repayment for a Given Rate and Term
  const calculateLoanMetrics = (ratePct: number, monthlyFee: number, upfrontFee: number) => {
    const effectiveRate = Math.max(0.1, ratePct + rateStressDelta);
    const monthlyRate = effectiveRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let baseMonthlyPrincipalInterest = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        baseMonthlyPrincipalInterest = Math.round(loanAmount / totalMonths);
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        baseMonthlyPrincipalInterest = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
      }
    }

    const totalMonthlyPayment = baseMonthlyPrincipalInterest + monthlyFee;
    const totalPayments = totalMonthlyPayment * totalMonths + upfrontFee;
    const totalInterest = Math.max(0, totalPayments - loanAmount - monthlyFee * totalMonths - upfrontFee);
    const totalFees = monthlyFee * totalMonths + upfrontFee;

    const fortnightlyPayment = Math.round((totalMonthlyPayment * 12) / 26);
    const weeklyPayment = Math.round((totalMonthlyPayment * 12) / 52);

    return {
      effectiveRate,
      baseMonthlyPrincipalInterest,
      totalMonthlyPayment,
      fortnightlyPayment,
      weeklyPayment,
      totalPayments,
      totalInterest,
      totalFees,
    };
  };

  // Processed product comparison data
  const comparisonResults = useMemo(() => {
    return products.map((prod) => {
      const calc = calculateLoanMetrics(prod.interestRate, prod.monthlyFee, prod.upfrontFee);
      return {
        ...prod,
        calc,
      };
    });
  }, [products, loanAmount, loanTermYears, rateStressDelta]);

  // Filtered to active compared products
  const activeCompared = useMemo(() => {
    return comparisonResults.filter((p) => selectedProductIds.includes(p.id));
  }, [comparisonResults, selectedProductIds]);

  // Baseline is product 0 (Variable)
  const baselineProduct = comparisonResults[0];

  const toggleProductSelect = (id: string) => {
    if (selectedProductIds.includes(id)) {
      if (selectedProductIds.length > 2) {
        setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
      }
    } else {
      if (selectedProductIds.length < 4) {
        setSelectedProductIds([...selectedProductIds, id]);
      }
    }
  };

  const handleQuickRateEdit = (id: string, newRate: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, interestRate: Number(newRate.toFixed(2)) } : p))
    );
  };

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return activeCompared.map((p) => ({
      name: p.name.split(' ')[0] + ' ' + (p.name.split(' ')[1] || ''),
      fullName: p.name,
      monthlyPayment:
        repaymentFrequency === 'monthly'
          ? p.calc.totalMonthlyPayment
          : repaymentFrequency === 'fortnightly'
          ? p.calc.fortnightlyPayment
          : p.calc.weeklyPayment,
      totalInterest: Math.round(p.calc.totalInterest / 1000), // in $k
      rate: p.calc.effectiveRate,
      color: p.color,
    }));
  }, [activeCompared, repaymentFrequency]);

  const handleInquireProduct = (productName: string) => {
    setInquiredProductId(productName);
    if (onOpenConsultation) {
      onOpenConsultation(productName);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header & Tool Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-neutral-200 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-[#FFD200] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Scale className="w-5 h-5 text-[#FFD200]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900 tracking-tight">
                Loan Comparison Tool
              </h3>
              <span className="text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Variable vs Fixed Rates
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Compare monthly repayments, lifetime interest, and contract flexibility across variable, fixed, and hybrid split loans.
            </p>
          </div>
        </div>

        {/* Repayment Frequency Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl text-xs font-bold self-start md:self-auto">
          {(['monthly', 'fortnightly', 'weekly'] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setRepaymentFrequency(freq)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                repaymentFrequency === freq
                  ? 'bg-neutral-950 text-[#FFD200] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Common Loan Parameters Bar */}
      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Purchase Price
          </label>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">$</span>
            <input
              type="number"
              step={25000}
              min={100000}
              value={purchasePrice}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setPurchasePrice(val);
                setDepositAmount(Math.round(val * (depositPercent / 100)));
              }}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 font-extrabold text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Deposit ({depositPercent}% · ${(depositAmount / 1000).toFixed(0)}k)
          </label>
          <div className="flex items-center gap-1.5">
            {[10, 20, 25, 30].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentChange(pct)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  depositPercent === pct
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Loan Term ({loanTermYears} Years)
          </label>
          <div className="flex items-center gap-1.5">
            {[15, 20, 25, 30].map((yrs) => (
              <button
                key={yrs}
                type="button"
                onClick={() => setLoanTermYears(yrs)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  loanTermYears === yrs
                    ? 'bg-[#FFD200] text-neutral-950 border-[#FFD200]'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {yrs}y
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Interest Rate Stress Tester Strip */}
      <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-extrabold text-neutral-900">Interest Rate Stress Test:</span>{' '}
            <span className="text-neutral-600">Simulate RBA rate hikes to see how variable vs fixed payments respond.</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: 'Current Rates', delta: 0 },
            { label: '+0.50% Hike', delta: 0.5 },
            { label: '+1.00% Hike', delta: 1.0 },
            { label: '+1.50% Hike', delta: 1.5 },
          ].map((scen) => (
            <button
              key={scen.delta}
              type="button"
              onClick={() => setRateStressDelta(scen.delta)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                rateStressDelta === scen.delta
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-amber-100/50 border border-amber-200'
              }`}
            >
              {scen.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product Selection Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Compare Products (Select 2 to 4)
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">
            Comparing {activeCompared.length} of {products.length} options
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {comparisonResults.map((prod) => {
            const isSelected = selectedProductIds.includes(prod.id);
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => toggleProductSelect(prod.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: prod.color }}
                />
                <span>{prod.name}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({(prod.interestRate + rateStressDelta).toFixed(2)}%)
                </span>
                {isSelected ? <Check className="w-3.5 h-3.5 text-[#FFD200]" /> : <Plus className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SIDE-BY-SIDE COMPARISON CARDS GRID */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(activeCompared.length, 3)} lg:grid-cols-${activeCompared.length} gap-4`}>
        {activeCompared.map((prod) => {
          const isBaseline = prod.id === baselineProduct.id;
          const monthlyDiff = prod.calc.totalMonthlyPayment - baselineProduct.calc.totalMonthlyPayment;
          const interestDiff = prod.calc.totalInterest - baselineProduct.calc.totalInterest;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border-2 transition-all p-5 shadow-xs flex flex-col justify-between hover:border-neutral-400 relative"
              style={{ borderColor: prod.color }}
            >
              {/* Product Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: prod.color }}
                >
                  {prod.typeLabel}
                </span>

                {prod.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 text-[10px] font-bold border border-amber-300">
                    {prod.badge}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-base text-neutral-900 leading-snug">
                    {prod.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-neutral-950 tabular-nums">
                      {prod.calc.effectiveRate.toFixed(2)}%
                    </span>
                    <span className="text-xs text-neutral-500 font-semibold">p.a.</span>
                    {prod.comparisonRate && (
                      <span className="text-[10px] text-neutral-400">
                        (Comp. {prod.comparisonRate}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Metric: Periodic Repayment */}
                <div className="p-3.5 bg-neutral-950 text-white rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
                    <span>Estimated Repayment</span>
                    <span className="text-[#FFD200] capitalize">per {repaymentFrequency === 'fortnightly' ? 'fortnight' : repaymentFrequency === 'weekly' ? 'week' : 'month'}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFD200] tabular-nums">
                    ${repaymentFrequency === 'monthly'
                      ? prod.calc.totalMonthlyPayment.toLocaleString()
                      : repaymentFrequency === 'fortnightly'
                      ? prod.calc.fortnightlyPayment.toLocaleString()
                      : prod.calc.weeklyPayment.toLocaleString()}
                  </div>

                  {!isBaseline && (
                    <div className="text-[11px] pt-1 flex items-center gap-1">
                      {monthlyDiff < 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>Save ${Math.abs(monthlyDiff).toLocaleString()}/mo vs Variable</span>
                        </span>
                      ) : monthlyDiff > 0 ? (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+${monthlyDiff.toLocaleString()}/mo premium</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400">Equal to baseline</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Lifetime Metrics */}
                <div className="space-y-2 text-xs border-y border-neutral-100 py-3">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Lifetime Interest:</span>
                    <span className="font-extrabold text-neutral-950 tabular-nums">
                      ${prod.calc.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Total Loan Outlay:</span>
                    <span className="font-extrabold text-neutral-950 tabular-nums">
                      ${prod.calc.totalPayments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Monthly Account Fee:</span>
                    <span className="font-semibold text-neutral-900">
                      {prod.monthlyFee > 0 ? `$${prod.monthlyFee}/mo` : 'Zero Fee'}
                    </span>
                  </div>

                  {!isBaseline && (
                    <div className="pt-1 text-[11px] flex items-center justify-between font-bold">
                      <span>Total Interest Delta:</span>
                      <span className={interestDiff < 0 ? 'text-emerald-600' : 'text-amber-600'}>
                        {interestDiff < 0
                          ? `-$${Math.abs(interestDiff).toLocaleString()} interest`
                          : `+$${interestDiff.toLocaleString()} interest`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Features List */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-700">
                    {prod.features.offsetAccount ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    )}
                    <span className={prod.features.offsetAccount ? 'font-bold text-neutral-900' : 'text-neutral-400'}>
                      100% Offset Account
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-700">
                    {prod.features.unlimitedExtraRepayments ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    )}
                    <span className={prod.features.unlimitedExtraRepayments ? 'font-bold text-neutral-900' : 'text-neutral-400'}>
                      Unlimited Extra Payments
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-700">
                    {prod.features.rateLockOption ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    )}
                    <span className={prod.features.rateLockOption ? 'font-bold text-neutral-900' : 'text-neutral-400'}>
                      Rate Lock Guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="pt-4 mt-4 border-t border-neutral-100">
                {inquiredProductId === prod.name ? (
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inquiry Logged!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInquireProduct(prod.name)}
                    className="w-full py-2.5 px-3 bg-neutral-100 hover:bg-[#FFD200] hover:text-neutral-950 text-neutral-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Enquire on this Rate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. VISUAL COMPARISON RECHARTS BAR GRAPH */}
      <div className="bg-neutral-50 rounded-2xl p-5 sm:p-6 border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 flex items-center gap-2">
              <span>Visual Comparison: Monthly Payment &amp; Total Interest</span>
            </h4>
            <p className="text-xs text-neutral-500">
              Comparing periodic repayment vs overall lifetime borrowing cost for {activeCompared.length} loan products.
            </p>
          </div>
        </div>

        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-neutral-900 text-white p-3 rounded-xl border border-neutral-700 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-[#FFD200]">{item.fullName}</div>
                        <div>Interest Rate: <strong className="text-white">{item.rate.toFixed(2)}%</strong></div>
                        <div>Monthly Repayment: <strong className="text-white">${item.monthlyPayment.toLocaleString()}</strong></div>
                        <div>Total Interest Paid: <strong className="text-amber-400">${(item.totalInterest * 1000).toLocaleString()}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="monthlyPayment" name="Periodic Repayment ($)" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Comprehensive Feature Checklist Matrix (Collapsible) */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFeatureChecklist(!showFeatureChecklist)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Comprehensive Feature Comparison Matrix
            </span>
          </div>
          {showFeatureChecklist ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {showFeatureChecklist && (
          <div className="overflow-x-auto border-t border-neutral-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Feature / Term</th>
                  {activeCompared.map((p) => (
                    <th key={p.id} className="py-2.5 px-4 font-extrabold text-neutral-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">Interest Rate Structure</td>
                  {activeCompared.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono font-bold">
                      {p.typeLabel} ({(p.interestRate + rateStressDelta).toFixed(2)}%)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">100% Offset Account</td>
                  {activeCompared.map((p) => (
                    <td key={p.id} className="py-2.5 px-4">
                      {p.features.offsetAccount ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400">Not Available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">Extra Repayments</td>
                  {activeCompared.map((p) => (
                    <td key={p.id} className="py-2.5 px-4">
                      {p.features.unlimitedExtraRepayments ? (
                        <span className="text-emerald-700 font-semibold">Unlimited (Fee-Free)</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Capped (Max $10k/yr)</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">Early Refinance Break Cost</td>
                  {activeCompared.map((p) => (
                    <td key={p.id} className="py-2.5 px-4">
                      {p.type === 'variable' ? (
                        <span className="text-emerald-700 font-semibold">Zero Break Cost</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Economic Break Costs Apply</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">Rate Hike Vulnerability</td>
                  {activeCompared.map((p) => (
                    <td key={p.id} className="py-2.5 px-4">
                      {p.type === 'variable' ? (
                        <span className="text-amber-700 font-semibold">Exposed to RBA Cash Rate</span>
                      ) : p.type === 'split' ? (
                        <span className="text-blue-700 font-semibold">50% Protected</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">100% Shielded during fixed term</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. Broker Advice Banner */}
      <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFD200] text-neutral-950 flex items-center justify-center font-black shrink-0">
            RW
          </div>
          <div>
            <div className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Ray White Home Finance Specialised Broking</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Accredited
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Access wholesale loan pricing from over 35 Australian banks and tier-1 lenders for {propertyAddress || 'this property'}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleInquireProduct('Ray White Finance Consultation')}
          className="px-5 py-2.5 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
        >
          Book Broker Consultation
        </button>
      </div>
    </div>
  );
};

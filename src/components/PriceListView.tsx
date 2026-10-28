import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Building,
  Bed,
  Bath,
  Car,
  Maximize2,
  Calendar,
  Eye,
  Scale,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Share2,
  Tag,
  Percent,
  Printer,
  Sparkles
} from 'lucide-react';
import { Property } from '../types/property';
import { ClimateComfortBadge } from './ClimateComfortBadge';
import { usePrice } from '../context/PriceContext';

interface PriceListViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onToggleCompare: (propertyId: string) => void;
  comparedIds: string[];
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  properties,
  onSelectProperty,
  onToggleCompare,
  comparedIds,
}) => {
  const { globalReductionPercent, totalPortfolioSavings } = usePrice();
  const [searchTerm, setSearchTerm] = useState('');
  const [tariffTab, setTariffTab] = useState<'all' | 'sale' | 'rent' | 'high_yield'>('all');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState<'selling' | 'rentage' | 'yield' | 'bedrooms' | 'address'>('selling');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Compute portfolio stats
  const stats = useMemo(() => {
    let totalSelling = 0;
    let totalRentWeekly = 0;
    let countWithSelling = 0;
    let countWithRent = 0;

    properties.forEach((p) => {
      const sell = p.sellingPrice || (p.status === 'sale' ? p.price : 0);
      const rent = p.rentagePricePerWeek || (p.status === 'rent' ? p.price : 0);
      if (sell > 0) {
        totalSelling += sell;
        countWithSelling++;
      }
      if (rent > 0) {
        totalRentWeekly += rent;
        countWithRent++;
      }
    });

    const avgSelling = countWithSelling ? Math.round(totalSelling / countWithSelling) : 0;
    const avgRent = countWithRent ? Math.round(totalRentWeekly / countWithRent) : 0;
    const avgYield =
      avgSelling > 0 ? (((avgRent * 52) / avgSelling) * 100).toFixed(2) + '%' : '2.5%';

    return { totalSelling, avgSelling, avgRent, avgYield };
  }, [properties]);

  // Filter and sort items
  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        // Tab filter
        if (tariffTab === 'sale' && p.status !== 'sale') return false;
        if (tariffTab === 'rent' && p.status !== 'rent') return false;
        if (tariffTab === 'high_yield') {
          const y = parseFloat(p.grossYield || '2.4');
          if (y < 2.5) return false;
        }

        // Search text
        const matchesSearch =
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.suburb.toLowerCase().includes(searchTerm.toLowerCase());

        // Type
        const matchesType = filterType === 'all' || p.type.toLowerCase() === filterType.toLowerCase();

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;
        if (sortField === 'selling') {
          valA = a.sellingPrice || (a.status === 'sale' ? a.price : 0);
          valB = b.sellingPrice || (b.status === 'sale' ? b.price : 0);
        } else if (sortField === 'rentage') {
          valA = a.rentagePricePerWeek || (a.status === 'rent' ? a.price : 0);
          valB = b.rentagePricePerWeek || (b.status === 'rent' ? b.price : 0);
        } else if (sortField === 'yield') {
          valA = parseFloat(a.grossYield || '2.4');
          valB = parseFloat(b.grossYield || '2.4');
        } else if (sortField === 'bedrooms') {
          valA = a.bedrooms;
          valB = b.bedrooms;
        } else if (sortField === 'address') {
          valA = a.address;
          valB = b.address;
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [properties, searchTerm, tariffTab, filterType, sortField, sortDirection]);

  const toggleSort = (field: 'selling' | 'rentage' | 'yield' | 'bedrooms' | 'address') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Property Address',
      'Suburb',
      'State',
      'Postcode',
      'Property Type',
      'Bedrooms',
      'Bathrooms',
      'Car Spaces',
      'Selling Price (AUD)',
      'Rentage Rate Per Week (AUD)',
      'Rentage Rate Per Month (AUD)',
      'Bond Amount (AUD)',
      'Gross Rental Yield',
      'Upcoming Inspection'
    ];
    const rows = filtered.map((p) => {
      const sell = p.sellingPrice || (p.status === 'sale' ? p.price : 0);
      const rentWk = p.rentagePricePerWeek || (p.status === 'rent' ? p.price : 0);
      const rentMo = p.rentagePricePerMonth || Math.round((rentWk * 52) / 12);
      const bond = p.bondAmount || rentWk * 4;

      return [
        `"${p.address}"`,
        `"${p.suburb}"`,
        `"${p.state}"`,
        `"${p.postcode}"`,
        `"${p.type}"`,
        p.bedrooms,
        p.bathrooms,
        p.carSpaces,
        sell,
        rentWk,
        rentMo,
        bond,
        `"${p.grossYield || '2.4%'}"`,
        `"${p.inspections[0]?.date || 'By Appointment'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RayWhite_Official_Price_List_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#E5BC00]" />
            <span>Ray White Official Price Schedule &amp; Valuation Tariff</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Complete Price List: Selling &amp; Rentage
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
            Side-by-side audited price directory detailing <strong>Capital Selling Prices</strong>, <strong>Weekly/Monthly Rentage Rates</strong>, <strong>Security Bonds</strong>, and <strong>Gross Investment Yields</strong>.
          </p>
          {globalReductionPercent > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Market Reduction: <strong>-{globalReductionPercent}% OFF</strong> active across all properties</span>
              <span className="text-emerald-700/60">·</span>
              <span>Total Buyer Savings: <strong>${totalPortfolioSavings.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Print Price Schedule"
          >
            <Printer className="w-4 h-4 text-neutral-600" />
            <span className="hidden sm:inline">Print Schedule</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#FFD200]" />
            <span>{copiedCsv ? 'Exported CSV!' : 'Download CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="text-xs font-black text-amber-800 flex items-center justify-between">
            <span>Portfolio Valuation</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums mt-1">
            ${(stats.totalSelling / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-amber-700/80 font-medium mt-0.5">{properties.length} residential assets</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-black text-emerald-800 flex items-center justify-between">
            <span>Average Selling Price</span>
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums mt-1">
            ${(stats.avgSelling / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Capital appreciation guide</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white p-5 rounded-2xl border border-blue-200/80 shadow-xs">
          <div className="text-xs font-black text-blue-800 flex items-center justify-between">
            <span>Average Rentage Rate</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums mt-1">
            ${stats.avgRent.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/ wk</span>
          </div>
          <div className="text-[11px] text-blue-700 font-bold mt-0.5">Approx ${Math.round((stats.avgRent * 52) / 12).toLocaleString()} / month</div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 via-violet-50/40 to-white p-5 rounded-2xl border border-violet-200/80 shadow-xs">
          <div className="text-xs font-black text-violet-800 flex items-center justify-between">
            <span>Average Gross Yield</span>
            <Percent className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums mt-1">
            {stats.avgYield}
          </div>
          <div className="text-[11px] text-violet-700 font-bold mt-0.5">Annualized gross return</div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        {/* Tariff View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setTariffTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                tariffTab === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Properties ({properties.length})
            </button>
            <button
              type="button"
              onClick={() => setTariffTab('sale')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                tariffTab === 'sale'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              For Sale Listings ({properties.filter((p) => p.status === 'sale').length})
            </button>
            <button
              type="button"
              onClick={() => setTariffTab('rent')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                tariffTab === 'rent'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              For Rent Listings ({properties.filter((p) => p.status === 'rent').length})
            </button>
            <button
              type="button"
              onClick={() => setTariffTab('high_yield')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                tariffTab === 'high_yield'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              High Yield (&gt;2.5%)
            </button>
          </div>

          <div className="text-xs text-neutral-500">
            Showing <strong className="text-neutral-900">{filtered.length}</strong> audited properties
          </div>
        </div>

        {/* Search & Property Type Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px] relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by address, suburb, or keywords..."
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span>Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-bold focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Structured Dual Price List Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-white border-b border-neutral-800 uppercase font-bold text-[11px] tracking-wider select-none">
              <tr>
                <th
                  onClick={() => toggleSort('address')}
                  className="py-4 px-4 cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>House &amp; Location</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('bedrooms')}
                  className="py-4 px-3 cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Specs</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('selling')}
                  className="py-4 px-4 cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>Selling Price (AUD)</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('rentage')}
                  className="py-4 px-4 cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <span>Rentage Price (AUD)</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('yield')}
                  className="py-4 px-3 cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[#FFD200]">
                    <span>Gross Yield</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-4 px-3">Upcoming Inspection</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => {
                const isCompared = comparedIds.includes(p.id);
                const sellingVal = p.sellingPrice || (p.status === 'sale' ? p.price : 2800000);
                const rentWeeklyVal = p.rentagePricePerWeek || (p.status === 'rent' ? p.price : 1250);
                const rentMonthlyVal = p.rentagePricePerMonth || Math.round((rentWeeklyVal * 52) / 12);
                const yieldVal = p.grossYield || (((rentWeeklyVal * 52) / sellingVal) * 100).toFixed(1) + '%';
                const bondVal = p.bondAmount || rentWeeklyVal * 4;
                const nextInspection = p.inspections[0]?.date || 'Private Viewing';

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-amber-50/30 transition-colors group"
                  >
                    {/* Property & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectProperty(p)}
                            className="font-bold text-neutral-900 hover:text-neutral-700 transition-colors truncate max-w-[260px] text-left block text-xs sm:text-sm cursor-pointer"
                          >
                            {p.address}
                          </button>
                          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{p.suburb}, {p.state} {p.postcode}</span>
                            <span>·</span>
                            <span className="text-neutral-700 font-semibold">{p.type}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                p.status === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {p.status === 'sale' ? 'Sale' : 'Rent'}
                            </span>
                          </div>

                          <div className="mt-1.5">
                            <ClimateComfortBadge
                              suburb={p.suburb}
                              state={p.state}
                              variant="compact"
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3 text-neutral-700 font-semibold tabular-nums text-xs">
                        <span title={`${p.bedrooms} Bedrooms`} className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-neutral-400" />
                          {p.bedrooms}
                        </span>
                        <span title={`${p.bathrooms} Bathrooms`} className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-neutral-400" />
                          {p.bathrooms}
                        </span>
                        <span title={`${p.carSpaces} Car Spaces`} className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-neutral-400" />
                          {p.carSpaces}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {p.landSizeM2 ? `${p.landSizeM2.toLocaleString()}m² land` : 'Strata title'}
                      </div>
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-neutral-900 tabular-nums">
                          ${sellingVal.toLocaleString()}
                        </span>
                        {p.status === 'sale' && p.priceReduced && p.originalPrice && (
                          <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                            ${p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {p.status === 'sale' && p.priceReduced && p.savingsAmount && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Save ${p.savingsAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{p.auctionDate ? 'Auction Guide' : 'Buy Now / Private Treaty'}</span>
                      </div>
                    </td>

                    {/* Rentage Price */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-neutral-900 tabular-nums">
                          ${rentWeeklyVal.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/ wk</span>
                        </span>
                        {p.status === 'rent' && p.priceReduced && p.originalPrice && (
                          <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                            ${p.originalPrice.toLocaleString()}/wk
                          </span>
                        )}
                      </div>
                      {p.status === 'rent' && p.priceReduced && p.savingsAmount && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center text-[9px] font-extrabold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">
                            Save ${p.savingsAmount.toLocaleString()}/wk
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                        ${rentMonthlyVal.toLocaleString()} / mo · Bond ${bondVal.toLocaleString()}
                      </div>
                    </td>

                    {/* Gross Yield */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 tabular-nums border border-amber-200">
                        {yieldVal}
                      </span>
                    </td>

                    {/* Next Inspection */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-semibold text-neutral-800">{nextInspection}</div>
                      <div className="text-[10px] text-neutral-400">
                        {p.inspections[0]?.time || 'Contact Agent'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleCompare(p.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border ${
                            isCompared
                              ? 'bg-neutral-950 text-[#FFD200] border-neutral-950 font-bold'
                              : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                          title="Compare side-by-side"
                        >
                          <Scale className="w-3 h-3" />
                          <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectProperty(p)}
                          className="px-2.5 py-1 bg-[#FFD200] hover:bg-[#E5BC00] text-neutral-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

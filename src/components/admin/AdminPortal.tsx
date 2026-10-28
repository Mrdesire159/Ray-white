import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  Check,
  X,
  User,
  Building,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Bed,
  Bath,
  Car,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Lock,
  Camera,
} from 'lucide-react';
import { useRequests } from '../../context/RequestContext';
import { AdminRequest, RequestPriority, RequestStatus, RequestType } from '../../types/request';
import { ApproveModal } from './ApproveModal';
import { DeclineModal } from './DeclineModal';
import { RequestDetailModal } from './RequestDetailModal';
import { CreateRequestModal } from './CreateRequestModal';
import { AGENTS } from '../../data/agents';

interface AdminPortalProps {
  onBackToSite: () => void;
  onNavigateToProperty?: (propertyId: string) => void;
  onNavigateToMediaUpload?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite, onNavigateToMediaUpload }) => {
  const {
    requests,
    pendingCount,
    urgentCount,
    approvedCount,
    completedCount,
    totalVolumeEstimate,
    approveRequest,
    declineRequest,
    completeRequest,
    assignAgent,
    updatePriority,
    addNote,
    deleteRequest,
    bulkApprove,
    bulkDecline,
    addRequest,
    resetToDefaults,
    logoutAdmin,
  } = useRequests();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | RequestType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | RequestStatus>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | RequestPriority>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'highest_value'>('newest');

  // Multi-Select for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<AdminRequest | null>(null);
  const [selectedRequestForApprove, setSelectedRequestForApprove] = useState<AdminRequest | null>(null);
  const [selectedRequestForDecline, setSelectedRequestForDecline] = useState<AdminRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = req.id.toLowerCase().includes(q);
          const matchClient = req.client.name.toLowerCase().includes(q) || req.client.email.toLowerCase().includes(q) || req.client.phone.includes(q);
          const matchAddress = req.propertyAddress?.toLowerCase().includes(q) || req.propertySuburb?.toLowerCase().includes(q);
          const matchMessage = req.details.message?.toLowerCase().includes(q);
          if (!matchId && !matchClient && !matchAddress && !matchMessage) return false;
        }

        // Type Filter
        if (selectedType !== 'all' && req.type !== selectedType) return false;

        // Status Filter
        if (selectedStatus !== 'all' && req.status !== selectedStatus) return false;

        // Priority Filter
        if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'priority') {
          const priorityWeight = { urgent: 3, high: 2, normal: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'highest_value') {
          const valA = a.details.offerAmount || a.details.estimatedValueRange?.median || 0;
          const valB = b.details.offerAmount || b.details.estimatedValueRange?.median || 0;
          return valB - valA;
        }
        return 0;
      });
  }, [requests, searchQuery, selectedType, selectedStatus, selectedPriority, sortBy]);

  // Bulk Selection Helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Request ID', 'Type', 'Status', 'Priority', 'Client Name', 'Client Email', 'Client Phone', 'Property Address', 'Suburb', 'Offer/Estimate', 'Created At'];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.type,
      r.status,
      r.priority,
      `"${r.client.name.replace(/"/g, '""')}"`,
      r.client.email,
      r.client.phone,
      `"${(r.propertyAddress || '').replace(/"/g, '""')}"`,
      r.propertySuburb || '',
      r.details.offerAmount || r.details.estimatedValueRange?.median || '',
      r.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `raywhite_admin_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category counts
  const countsByType = useMemo(() => {
    return {
      all: requests.length,
      appraisal: requests.filter((r) => r.type === 'appraisal').length,
      inspection: requests.filter((r) => r.type === 'inspection').length,
      offer: requests.filter((r) => r.type === 'offer').length,
      contact: requests.filter((r) => r.type === 'contact' || r.type === 'valuation').length,
    };
  }, [requests]);

  const getTypeStyle = (type: RequestType) => {
    switch (type) {
      case 'appraisal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'inspection':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'offer':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'contact':
      case 'valuation':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            High Priority
          </span>
        );
      case 'normal':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
            Normal
          </span>
        );
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-neutral-100 text-neutral-800 border border-neutral-300 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-20">
      {/* Executive Command Header */}
      <div className="bg-neutral-950 text-white border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-[#FFD200] text-neutral-950 flex items-center justify-center font-black text-sm shadow-md">
                RW
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Admin Operations Portal</span>
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-[#FFD200] border border-amber-400/30 px-2 py-0.5 rounded-full">
                    Approvals &amp; CRM
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-medium">
                  Australasia Prestige Inquiries, Appraisals &amp; VIP Tour Approvals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-2 text-xs font-black text-neutral-950 bg-gradient-to-r from-amber-400 via-[#FFD200] to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-neutral-950" />
                <span>Intake Request</span>
              </button>

              {onNavigateToMediaUpload && (
                <button
                  type="button"
                  onClick={onNavigateToMediaUpload}
                  className="px-3.5 py-2 text-xs font-black text-neutral-900 bg-amber-400 hover:bg-[#FFD200] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  title="Upload property photography and 4K videos directly to the cloud vault"
                >
                  <Camera className="w-4 h-4 text-neutral-950" />
                  <span>Upload Media (Photo/Video)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export filtered requests to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={onBackToSite}
                className="px-3 py-2 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Back to Site</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  onBackToSite();
                }}
                className="px-3 py-2 text-xs font-bold text-amber-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-amber-400/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Lock admin session and hide from public"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock &amp; Exit</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-neutral-800/80">
            {/* 1. Pending Approvals */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Action</span>
                {urgentCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums flex items-baseline gap-1.5">
                <span>{pendingCount}</span>
                {urgentCount > 0 && (
                  <span className="text-[10px] text-rose-400 font-bold">({urgentCount} urgent)</span>
                )}
              </div>
            </div>

            {/* 2. Approved */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Approved</span>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {approvedCount}
              </div>
            </div>

            {/* 3. Completed */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Completed</span>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {completedCount}
              </div>
            </div>

            {/* 4. Total Pipeline Value */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-bold text-[#FFD200] uppercase tracking-wider">Estimated Pipeline</span>
              <div className="text-xl sm:text-2xl font-black text-[#FFD200] mt-1 tabular-nums truncate">
                ${(totalVolumeEstimate / 1000000).toFixed(1)}M
              </div>
            </div>

            {/* 5. Total Volume */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Inquiries</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset request dataset to default sample values?')) {
                      resetToDefaults();
                    }
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                  title="Reload default sample requests"
                >
                  Reset Sample
                </button>
              </div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {requests.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs (Request Categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedType === 'all'
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>All Requests</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedType === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
              {countsByType.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('appraisal')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedType === 'appraisal'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>🏡 Property Appraisals</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedType === 'appraisal' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
              {countsByType.appraisal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('inspection')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedType === 'inspection'
                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>📅 VIP Private Inspections</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedType === 'inspection' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-800'}`}>
              {countsByType.inspection}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('offer')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedType === 'offer'
                ? 'bg-amber-600 text-neutral-950 border-amber-600 font-black shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>💼 Formal Buyer Offers</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedType === 'offer' ? 'bg-neutral-950 text-amber-300' : 'bg-amber-50 text-amber-900'}`}>
              {countsByType.offer}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('contact')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedType === 'contact'
                ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <span>📞 General &amp; Advisory</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedType === 'contact' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800'}`}>
              {countsByType.contact}
            </span>
          </button>
        </div>

        {/* Filter Bar & Controls */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, email, phone, suburb, or request ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
              {(
                [
                  { id: 'all', label: 'All Status' },
                  { id: 'pending', label: 'Pending ⏳' },
                  { id: 'approved', label: 'Approved ✅' },
                  { id: 'declined', label: 'Declined ❌' },
                  { id: 'completed', label: 'Completed 🎯' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedStatus === st.id
                      ? 'bg-neutral-900 text-white font-extrabold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Priority and Sort By Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="p-2 rounded-xl border border-neutral-300 text-xs font-bold bg-white text-neutral-700"
              >
                <option value="all">Priority: All</option>
                <option value="urgent">🔴 Urgent Only</option>
                <option value="high">🟠 High</option>
                <option value="normal">⚪ Normal</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 rounded-xl border border-neutral-300 text-xs font-bold bg-white text-neutral-700"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="priority">Sort: Priority</option>
                <option value="highest_value">Sort: Highest Valuation</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar (when rows are checked) */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[11px]">
                  {selectedIds.length}
                </span>
                <span>Requests Selected for Batch Action</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    bulkApprove(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Bulk Approve ({selectedIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt('Provide decline rationale for selected requests:', 'Declined in batch review.');
                    if (reason) {
                      bulkDecline(selectedIds, reason);
                      setSelectedIds([]);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Bulk Decline ({selectedIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-bold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Requests List View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
              />
              <span>Select All Displayed ({filteredRequests.length} requests)</span>
            </div>
            <span>Showing verified client submissions</span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-neutral-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-neutral-900">No matching requests found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try adjusting your search criteria, clear filters, or intake a new manual request.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = selectedIds.includes(req.id);
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50'
                      : req.status === 'pending'
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Top Row: Meta & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(req.id)}
                        className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black text-neutral-950 font-mono tracking-wider">{req.id}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getTypeStyle(req.type)}`}>
                        {req.type}
                      </span>
                      {getPriorityBadge(req.priority)}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 font-medium">
                        {new Date(req.createdAt).toLocaleString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Middle Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Client Info (4 cols) */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-xs text-neutral-700 shrink-0">
                          {req.client.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-neutral-950 truncate">{req.client.name}</h4>
                          <span className="text-[10px] text-neutral-500 font-medium">Channel: {req.client.preferredContact || 'Any'}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-neutral-600 truncate">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{req.client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{req.client.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Associated Property & Key Details (5 cols) */}
                    <div className="lg:col-span-5 space-y-2">
                      {req.propertyAddress ? (
                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                          {req.propertyImage && (
                            <img
                              src={req.propertyImage}
                              alt={req.propertyAddress}
                              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-neutral-200"
                            />
                          )}
                          <div className="min-w-0 flex-1 text-xs">
                            <div className="font-extrabold text-neutral-900 truncate">{req.propertyAddress}</div>
                            <div className="text-neutral-500 font-semibold">{req.propertySuburb}, {req.propertyState || 'NSW'}</div>
                            {req.propertyPrice && (
                              <div className="font-black text-neutral-950 mt-0.5">{req.propertyPrice}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-1">
                          <div className="font-extrabold text-neutral-900">{req.details.subject || 'General Property Inquiry'}</div>
                          <div className="text-neutral-500">{req.details.preferredOffice || 'Sydney Head Office'}</div>
                        </div>
                      )}

                      {/* Request Specific Preview Chip */}
                      {req.details.offerAmount && (
                        <div className="text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center justify-between">
                          <span>Purchase Offer: ${req.details.offerAmount.toLocaleString()} AUD</span>
                          <span className="text-[10px] uppercase font-bold text-amber-700">
                            {req.details.financeApproved ? 'Pre-Approved' : 'Unconditional'}
                          </span>
                        </div>
                      )}

                      {req.details.estimatedValueRange && (
                        <div className="text-xs font-black text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center justify-between">
                          <span>Appraisal Guide: ${(req.details.estimatedValueRange.median / 1000000).toFixed(2)}M AUD</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700">
                            {req.details.appraisalMode === 'in_person' ? 'In-Person' : 'Digital'}
                          </span>
                        </div>
                      )}

                      {req.details.requestedDate && (
                        <div className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center justify-between">
                          <span>VIP Tour: {req.details.requestedDate} @ {req.details.requestedTime}</span>
                          <span className="text-[10px] text-purple-700">{req.details.attendeesCount || 2} Guests</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Agent & Quick Actions (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Assigned Agent
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={req.assignedAgentAvatar || AGENTS[0].avatar}
                            alt={req.assignedAgentName || 'Agent'}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-neutral-200"
                          />
                          <span className="text-xs font-bold text-neutral-800 truncate">
                            {req.assignedAgentName || 'Unassigned (Julian Henderson)'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRequestForDetail(req)}
                          className="flex-1 py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Details
                        </button>

                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedRequestForDecline(req)}
                              className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title="Decline Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedRequestForApprove(req)}
                              className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Approve Request"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Audit Preview Footer */}
                  {req.notes.length > 0 && (
                    <div className="pt-2.5 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500 font-medium">
                      <span className="font-bold text-neutral-700">Latest Note:</span>
                      <span className="italic truncate text-neutral-600">"{req.notes[0].text}"</span>
                      <span className="text-[10px] text-neutral-400 shrink-0">— {req.notes[0].author}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <ApproveModal
        request={selectedRequestForApprove}
        isOpen={!!selectedRequestForApprove}
        onClose={() => setSelectedRequestForApprove(null)}
        onConfirmApprove={(id, payload) => approveRequest(id, payload)}
      />

      <DeclineModal
        request={selectedRequestForDecline}
        isOpen={!!selectedRequestForDecline}
        onClose={() => setSelectedRequestForDecline(null)}
        onConfirmDecline={(id, reason, note) => declineRequest(id, reason, note)}
      />

      <RequestDetailModal
        request={selectedRequestForDetail}
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        onOpenApprove={(req) => setSelectedRequestForApprove(req)}
        onOpenDecline={(req) => setSelectedRequestForDecline(req)}
        onComplete={(id, note) => completeRequest(id, note)}
        onAssignAgent={(id, agentId) => assignAgent(id, agentId)}
        onUpdatePriority={(id, pri) => updatePriority(id, pri)}
        onAddNote={(id, note) => addNote(id, note)}
        onDelete={(id) => deleteRequest(id)}
      />

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => addRequest(data)}
      />
    </div>
  );
};

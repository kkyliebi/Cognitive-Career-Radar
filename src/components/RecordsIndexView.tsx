import React, { useState, useMemo } from 'react';
import { ApplicationRecord, RecordCategory, ApplicationStatus, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import {
  ExternalLink,
  Search,
  Plus,
  Filter,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  X
} from 'lucide-react';

interface RecordsIndexViewProps {
  records: ApplicationRecord[];
  onUpdateRecord: (updated: ApplicationRecord) => void;
  onAddRecord: (newRecord: ApplicationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onJumpToRadar?: (companyName: string) => void;
  editorialTheme?: EditorialTheme;
}

export const RecordsIndexView: React.FC<RecordsIndexViewProps> = ({
  records,
  onUpdateRecord,
  onAddRecord,
  onDeleteRecord,
  onJumpToRadar,
  editorialTheme = 'petrol',
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const [activeCategory, setActiveCategory] = useState<'all' | RecordCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // New Record Form State
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newCategory, setNewCategory] = useState<RecordCategory>('application');
  const [newLink, setNewLink] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newCvVersion, setNewCvVersion] = useState('Kylie BI — Communication Designer | Brand Strategy & Creative Production');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied');
  const [newCompensation, setNewCompensation] = useState('');
  const [newFeedback, setNewFeedback] = useState('Auto-confirmation received');
  const [newNotes, setNewNotes] = useState('');

  // Counters
  const counts = useMemo(() => {
    return {
      all: records.length,
      application: records.filter((r) => r.category === 'application').length,
      target: records.filter((r) => r.category === 'target').length,
      outreach: records.filter((r) => r.category === 'outreach').length,
      applied: records.filter((r) => r.status === 'Applied').length,
      outreachSent: records.filter((r) => r.status === 'Outreach Sent').length,
      targetNoRoute: records.filter((r) => r.status === 'Target — No Route').length,
      rejected: records.filter((r) => r.status === 'Rejected').length,
    };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (activeCategory !== 'all' && rec.category !== activeCategory) {
        return false;
      }
      if (statusFilter !== 'all' && rec.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = rec.company.toLowerCase().includes(q);
        const matchPos = rec.position.toLowerCase().includes(q);
        const matchCv = rec.cvVersion?.toLowerCase().includes(q);
        const matchId = rec.id.toLowerCase().includes(q);
        const matchChannel = rec.applicationChannels.toLowerCase().includes(q);
        const matchFeedback = rec.feedback?.toLowerCase().includes(q);
        if (!matchCompany && !matchPos && !matchCv && !matchId && !matchChannel && !matchFeedback) {
          return false;
        }
      }
      return true;
    });
  }, [records, activeCategory, statusFilter, searchQuery]);

  const handleStatusChange = (record: ApplicationRecord, newSt: ApplicationStatus) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateRecord({
      ...record,
      status: newSt,
      lastUpdate: today,
    });
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const prefix = newCategory === 'application' ? 'APP' : newCategory === 'target' ? 'TGT' : 'DIR';
    const nextNum = records.length + 1;
    const nextId = `${prefix}-${String(nextNum).padStart(2, '0')}`;

    const recordToAdd: ApplicationRecord = {
      id: nextId,
      category: newCategory,
      date: today,
      company: newCompany.trim(),
      position: newPosition.trim() || 'Communication Designer / Creative Producer',
      applicationLink: newLink.trim() || 'https://',
      applicationChannels: newChannel.trim() || 'Direct Email / Website',
      cvVersion: newCvVersion.trim(),
      status: newStatus,
      feedback: newFeedback.trim() || 'Logged into system',
      compensation: newCompensation.trim() || '—',
      notes: newNotes.trim() || undefined,
      lastUpdate: today,
    };

    onAddRecord(recordToAdd);
    setIsAddModalOpen(false);

    // Reset fields
    setNewCompany('');
    setNewPosition('');
    setNewLink('');
    setNewChannel('');
    setNewNotes('');
  };

  // Export to Markdown
  const exportAsMarkdown = () => {
    let md = `# Kylie Bi — Application & Outreach Index\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()} · Total Records: ${records.length}*\n\n`;
    md += `| ID | Date | Company | Position / Scope | Application Link | Channels | CV Version | Status | Feedback | Compensation | Last Update |\n`;
    md += `|---|---|---|---|---|---|---|---|---|---|---|\n`;

    records.forEach((r) => {
      md += `| ${r.id} | ${r.date} | ${r.company} | ${r.position} | ${r.applicationLink} | ${r.applicationChannels} | ${r.cvVersion} | ${r.status} | ${r.feedback} | ${r.compensation || '—'} | ${r.lastUpdate} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification('Markdown table copied to clipboard');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Export to CSV
  const exportAsCsv = () => {
    const headers = ['ID', 'Category', 'Date', 'Company', 'Position', 'Application Link', 'Channels', 'CV Version', 'Status', 'Feedback', 'Compensation', 'Last Update'];
    const rows = records.map((r) => [
      r.id,
      r.category,
      r.date,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.position.replace(/"/g, '""')}"`,
      `"${r.applicationLink.replace(/"/g, '""')}"`,
      `"${r.applicationChannels.replace(/"/g, '""')}"`,
      `"${r.cvVersion.replace(/"/g, '""')}"`,
      r.status,
      `"${(r.feedback || '').replace(/"/g, '""')}"`,
      `"${(r.compensation || '—').replace(/"/g, '""')}"`,
      r.lastUpdate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kylie_application_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#9de6c7] text-[#0a3824]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a3824] mr-1.5" />
            Applied
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fca590] text-[#4f1609]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f1609] mr-1.5" />
            Archived
          </span>
        );
      case 'Outreach Sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#9ad3fa] text-[#082d47]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#082d47] mr-1.5" />
            Pitch Sent
          </span>
        );
      case 'Target — No Route':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f7a8d8] text-[#58153c]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58153c] mr-1.5" />
            Target
          </span>
        );
      case 'Interviewing':
      case 'In Dialogue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4f04c] text-[#0c2b21] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0c2b21] mr-1.5 animate-pulse" />
            In Dialogue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#eae6dc] text-[#364b41]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-[#0c2b21]">
      {/* Editorial Spread Header & Action Bar */}
      <div className={`${palette.bgClass} ${palette.textClass} rounded-3xl p-6 sm:p-8 border ${palette.borderClass} ${palette.glowClass} flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden transition-colors`}>
        {/* Giant Typographic Watermark in Background */}
        <div className="absolute -right-8 -bottom-10 opacity-15 select-none pointer-events-none text-right hidden md:block">
          <div className={`editorial-watermark text-8xl ${palette.watermarkTextClass}`}>01 Index</div>
          <div className={`editorial-watermark text-8xl ${palette.headlineAccentClass}`}>Overcommitted</div>
        </div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center space-x-2.5 text-xs">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass}`}>
              CHAPTER 01 · MASTER LEDGER
            </span>
            <span className={`${palette.subtitleClass} font-editorial italic text-xs`}>
              Milan &amp; Europe Opportunity Register · {palette.pdfSource}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${palette.innerBoxBgClass} ${palette.headlineAccentClass} border ${palette.innerBoxBorderClass}`}>
              {records.length} Records Synced
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-white">
            Application Index, <span className={`font-editorial italic ${palette.headlineAccentClass}`}>Target List</span> &amp; Direct Outreach
          </h2>
          <p className={`text-xs sm:text-sm ${palette.subtitleClass} leading-relaxed font-normal`}>
            Centralized register tracking all studio touchpoints, application channels, and tailored CV assets across Milan, Berlin, Amsterdam, and European hubs.
          </p>
        </div>

        {/* Action Buttons in Superside Style */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider ${palette.buttonBgClass} ${palette.buttonTextClass} ${palette.buttonHoverBgClass} transition-all shadow-md`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Record</span>
          </button>

          <button
            onClick={exportAsCsv}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-white ${palette.innerBoxBgClass} hover:bg-white/15 border ${palette.innerBoxBorderClass} transition-all`}
            title="Download CSV file"
          >
            <Download className={`w-3.5 h-3.5 ${palette.headlineAccentClass}`} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportAsMarkdown}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-white ${palette.innerBoxBgClass} hover:bg-white/15 border ${palette.innerBoxBorderClass} transition-all`}
            title="Copy as Markdown table"
          >
            <Copy className={`w-3.5 h-3.5 ${palette.headlineAccentClass}`} />
            <span>Copy MD</span>
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <span className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-[#34c759]" />
            <span>{copiedNotification}</span>
          </span>
          <button onClick={() => setCopiedNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Superside Editorial Report Infographic Metrics Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Total Records */}
          <div className={`${palette.bgClass} ${palette.textClass} rounded-2xl p-4 border ${palette.borderClass} shadow-sm relative overflow-hidden transition-colors`}>
            <span className={`text-[10px] font-bold ${palette.mutedClass} uppercase tracking-wider block`}>
              Total Ledger
            </span>
            <div className={`text-3xl font-serif font-bold tracking-tight ${palette.headlineAccentClass} mt-1`}>
              {counts.all}
            </div>
            <span className={`text-[11px] ${palette.subtitleClass} font-editorial italic`}>All touchpoints</span>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs hover:border-[#9ad3fa] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5a766a] uppercase tracking-wider">
                Applications
              </span>
              <span className="w-2 h-2 rounded-full bg-[#9ad3fa]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#082d47] mt-1">
              {counts.application}
            </div>
            <span className="text-[11px] text-[#5a766a] font-medium">Active postings</span>
          </div>

          {/* Target List */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs hover:border-[#fca590] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5a766a] uppercase tracking-wider">
                Target List
              </span>
              <span className="w-2 h-2 rounded-full bg-[#fca590]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#4f1609] mt-1">
              {counts.target}
            </div>
            <span className="text-[11px] text-[#5a766a] font-medium">Fit-first watch</span>
          </div>

          {/* Direct Outreach */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs hover:border-[#f7a8d8] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5a766a] uppercase tracking-wider">
                Outreach
              </span>
              <span className="w-2 h-2 rounded-full bg-[#f7a8d8]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#58153c] mt-1">
              {counts.outreach}
            </div>
            <span className="text-[11px] text-[#5a766a] font-medium">Cold pitches</span>
          </div>

          {/* Applied Status */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs hover:border-[#9de6c7] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5a766a] uppercase tracking-wider">
                Applied
              </span>
              <span className="w-2 h-2 rounded-full bg-[#9de6c7]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#0a3824] mt-1">
              {counts.applied}
            </div>
            <span className="text-[11px] text-[#5a766a] font-medium">In funnel</span>
          </div>

          {/* Outreach Sent */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs hover:border-[#9ad3fa] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5a766a] uppercase tracking-wider">
                Pitch Sent
              </span>
              <span className="w-2 h-2 rounded-full bg-[#9ad3fa]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#082d47] mt-1">
              {counts.outreachSent}
            </div>
            <span className="text-[11px] text-[#5a766a] font-medium">Letters active</span>
          </div>

          {/* Archived */}
          <div className="bg-white rounded-2xl p-4 border border-[#e4e0d5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#86998f] uppercase tracking-wider">
                Archived
              </span>
              <span className="w-2 h-2 rounded-full bg-[#d5d0c3]" />
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#5a6f65] mt-1">
              {counts.rejected}
            </div>
            <span className="text-[11px] text-[#86998f] font-medium">Concluded</span>
          </div>
        </div>

        {/* Superside Style Pastel Distribution Bar */}
        <div className="bg-white p-3 rounded-2xl border border-[#e4e0d5] flex items-center gap-3 text-xs">
          <span className="text-[10px] font-bold text-[#0c2b21] uppercase tracking-wider whitespace-nowrap">
            Pipeline Distribution:
          </span>
          <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-[#e8e5dc]">
            <div
              style={{ width: `${(counts.applied / (counts.all || 1)) * 100}%` }}
              className="bg-[#9de6c7] h-full transition-all"
              title={`Applied: ${counts.applied}`}
            />
            <div
              style={{ width: `${(counts.outreachSent / (counts.all || 1)) * 100}%` }}
              className="bg-[#9ad3fa] h-full transition-all"
              title={`Pitch Sent: ${counts.outreachSent}`}
            />
            <div
              style={{ width: `${(counts.target / (counts.all || 1)) * 100}%` }}
              className="bg-[#fca590] h-full transition-all"
              title={`Target: ${counts.target}`}
            />
            <div
              style={{ width: `${(counts.outreach / (counts.all || 1)) * 100}%` }}
              className="bg-[#f7a8d8] h-full transition-all"
              title={`Outreach Prepared: ${counts.outreach}`}
            />
            <div
              style={{ width: `${(counts.rejected / (counts.all || 1)) * 100}%` }}
              className="bg-[#cfcbc0] h-full transition-all"
              title={`Archived: ${counts.rejected}`}
            />
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[10px] font-semibold text-[#5a766a]">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#9de6c7]" />
              <span>Applied</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#9ad3fa]" />
              <span>Pitch Sent</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#fca590]" />
              <span>Target</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & View Switching Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#e4e0d5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Editorial Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-medium ${
              activeCategory === 'all'
                ? 'bg-[#0c2b21] text-white font-bold shadow-xs'
                : 'bg-[#f4f2ea] text-[#345244] hover:bg-[#eae6dc]'
            }`}
          >
            All Records ({counts.all})
          </button>

          <button
            onClick={() => setActiveCategory('application')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              activeCategory === 'application'
                ? 'bg-[#9ad3fa] text-[#082d47] font-bold shadow-xs'
                : 'bg-[#f4f2ea] text-[#082d47] hover:bg-[#e0f2fe]'
            }`}
          >
            Application Index ({counts.application})
          </button>

          <button
            onClick={() => setActiveCategory('target')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              activeCategory === 'target'
                ? 'bg-[#fca590] text-[#4f1609] font-bold shadow-xs'
                : 'bg-[#f4f2ea] text-[#4f1609] hover:bg-[#ffe4de]'
            }`}
          >
            Target List ({counts.target})
          </button>

          <button
            onClick={() => setActiveCategory('outreach')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              activeCategory === 'outreach'
                ? 'bg-[#f7a8d8] text-[#58153c] font-bold shadow-xs'
                : 'bg-[#f4f2ea] text-[#58153c] hover:bg-[#fce7f3]'
            }`}
          >
            Direct Outreach ({counts.outreach})
          </button>
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f4f2ea] border border-[#ded9cb] text-[#0c2b21] text-xs font-semibold rounded-full px-3 py-1.5 focus:bg-white focus:ring-2 focus:ring-[#d4f04c] focus:border-[#0c2b21]"
          >
            <option value="all">Status: All</option>
            <option value="Applied">Applied</option>
            <option value="Outreach Sent">Pitch Sent</option>
            <option value="Target — No Route">Target — No Route</option>
            <option value="Interviewing">Interviewing</option>
            <option value="In Dialogue">In Dialogue</option>
            <option value="Rejected">Archived</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#6c867a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, CV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4f2ea] border border-[#ded9cb] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#0c2b21] placeholder-[#799587] focus:bg-white focus:ring-2 focus:ring-[#d4f04c] focus:border-[#0c2b21] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Editorial Ledger Table View */}
      <div className="bg-white rounded-3xl border border-[#e4e0d5] overflow-hidden shadow-[0_2px_12px_rgba(12,43,33,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f4f2ea] text-[#0c2b21] border-b border-[#ded9cb] text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-24">ID</th>
                <th className="py-3.5 px-3 w-28">Date</th>
                <th className="py-3.5 px-4">Studio / Practice</th>
                <th className="py-3.5 px-4">Role / Scope</th>
                <th className="py-3.5 px-3">CV Track</th>
                <th className="py-3.5 px-3">Channels</th>
                <th className="py-3.5 px-3 w-32">Status</th>
                <th className="py-3.5 px-4">Notes / Response</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9df]">
              {filteredRecords.map((record) => {
                const isExpanded = expandedId === record.id;
                const isTarget = record.category === 'target';
                const isOutreach = record.category === 'outreach';

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`hover:bg-[#fbfaf6] transition-colors group ${
                        isExpanded ? 'bg-[#f8f6ee]' : ''
                      }`}
                    >
                      {/* ID Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#0c2b21] bg-[#eef5f1] border border-[#cfdfd6] px-2 py-0.5 rounded-md text-[10px]">
                          {record.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#5a766a] font-mono text-[11px]">
                        {record.date}
                      </td>

                      {/* Company Name with outbound link */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-serif font-bold text-sm text-[#0c2b21] group-hover:text-[#18523f] transition-colors">
                            {record.company}
                          </span>
                          {record.applicationLink && record.applicationLink !== 'https://' && (
                            <a
                              href={record.applicationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#718d80] hover:text-[#0c2b21] transition-colors p-0.5"
                              title="Open link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {record.compensation && record.compensation !== '—' && (
                          <div className="text-[11px] text-[#0a3824] font-semibold mt-0.5 flex items-center space-x-1">
                            <DollarSign className="w-2.5 h-2.5" />
                            <span>{record.compensation}</span>
                          </div>
                        )}
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4">
                        <span className="text-[#244133] font-medium line-clamp-1">
                          {record.position || record.purpose || '—'}
                        </span>
                        {isTarget && record.targetRoles && (
                          <div className="text-[10px] text-[#58153c] font-semibold mt-0.5 line-clamp-1">
                            Target: {record.targetRoles}
                          </div>
                        )}
                        {isOutreach && record.targetAccount && (
                          <div className="text-[10px] text-[#082d47] font-semibold mt-0.5">
                            Lead: {record.targetAccount}
                          </div>
                        )}
                      </td>

                      {/* CV Version */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border inline-block max-w-[160px] truncate font-semibold ${
                            record.cvVersion.includes('Automotive')
                              ? 'text-[#58153c] bg-[#fce7f3] border-[#f7a8d8]'
                              : 'text-[#082d47] bg-[#e0f2fe] border-[#9ad3fa]'
                          }`}
                          title={record.cvVersion}
                        >
                          {record.cvVersion}
                        </span>
                      </td>

                      {/* Channels */}
                      <td className="py-3.5 px-3 text-[#557164] text-xs font-medium">
                        {record.applicationChannels}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record, e.target.value as ApplicationStatus)}
                          className="bg-transparent border-none text-[11px] cursor-pointer font-bold text-[#0c2b21] p-0 focus:outline-none"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Outreach Sent">Pitch Sent</option>
                          <option value="Target — No Route">Target — No Route</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="In Dialogue">In Dialogue</option>
                          <option value="Rejected">Archived</option>
                        </select>
                        <div className="mt-1">
                          {getStatusBadge(record.status)}
                        </div>
                      </td>

                      {/* Feedback / Timeline */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[#28483a] font-editorial italic line-clamp-1">
                          {record.feedback || '—'}
                        </span>
                        {record.lastUpdate && (
                          <span className="text-[10px] text-[#718d80] block mt-0.5 font-mono">
                            Updated: {record.lastUpdate}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : record.id)}
                            className="p-1.5 rounded-full text-[#6c867a] hover:text-[#0c2b21] hover:bg-[#f0ece2] transition-colors"
                            title="Expand detail view"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1.5 rounded-full text-[#6c867a] hover:text-[#b02213] hover:bg-[#ffece8] transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Drawer (Editorial Pullout) */}
                    {isExpanded && (
                      <tr className="bg-[#f8f6ee] border-b border-[#ded9cb]">
                        <td colSpan={9} className="p-4 sm:p-6">
                          <div className="bg-white p-5 rounded-2xl border border-[#ded9cb] shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ece8dd] pb-3 text-xs">
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-[#0c2b21]" />
                                <span className="font-serif font-bold text-base text-[#0c2b21]">{record.company}</span>
                                <span className="text-[#889e93]">·</span>
                                <span className="text-[#365547] font-medium">{record.position}</span>
                              </div>
                              <div className="text-xs text-[#627d70]">
                                Entry Logged: <strong className="text-[#0c2b21] font-mono">{record.date}</strong>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#738d81] block mb-1">
                                  Application URL:
                                </span>
                                {record.applicationLink ? (
                                  <a
                                    href={record.applicationLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#0c2b21] font-medium hover:underline flex items-center space-x-1 truncate decoration-[#d4f04c] decoration-2"
                                  >
                                    <span className="truncate">{record.applicationLink}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-[#86998f]">None</span>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#738d81] block mb-1">
                                  CV / Portfolio Track:
                                </span>
                                <span className="text-[#0c2b21] font-semibold">{record.cvVersion}</span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#738d81] block mb-1">
                                  Application Channels:
                                </span>
                                <span className="text-[#244133] font-medium">{record.applicationChannels}</span>
                              </div>
                            </div>

                            {record.notes && (
                              <div className="pt-3 border-t border-[#ece8dd] text-xs">
                                <span className="text-[10px] font-bold uppercase text-[#738d81] block mb-1">
                                  Strategic Notes &amp; Positioning:
                                </span>
                                <p className="text-[#203c2f] font-editorial italic text-[13px] leading-relaxed bg-[#f8f7f2] p-3 rounded-xl border border-[#e8e5dc]">
                                  "{record.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#ded9cb] shadow-2xl overflow-hidden animate-scale-in">
            <div className={`${palette.bgClass} p-6 ${palette.textClass} flex items-center justify-between border-b ${palette.borderClass}`}>
              <div className="flex items-center space-x-2.5">
                <Database className={`w-4 h-4 ${palette.headlineAccentClass}`} />
                <h3 className="text-lg font-serif font-bold text-white">
                  Log New Opportunity Record
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="p-6 space-y-4 text-xs text-[#0c2b21]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    Company / Studio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balich Wonder Studio"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    Record Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RecordCategory)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21]"
                  >
                    <option value="application">Application Index (Open Role)</option>
                    <option value="target">Target List (Fit First, Spontaneous)</option>
                    <option value="outreach">Direct Outreach (Cold Pitch Sent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    Position / Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Communication Designer / Producer"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21]"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Outreach Sent">Pitch Sent</option>
                    <option value="Target — No Route">Target — No Route</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="In Dialogue">In Dialogue</option>
                    <option value="Rejected">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                  Application Link or Job URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    Channels / Method
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website / LinkedIn / Direct Email"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                    CV / Portfolio Track
                  </label>
                  <input
                    type="text"
                    value={newCvVersion}
                    onChange={(e) => setNewCvVersion(e.target.value)}
                    className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2b21] uppercase tracking-wider mb-1">
                  Strategic Notes &amp; Follow-up Plan
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sent tailored note focusing on understanding and conceptual translation..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#f8f7f2] border border-[#ded9cb] text-[#0c2b21] rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#0c2b21] focus:ring-2 focus:ring-[#d4f04c]"
                />
              </div>

              <div className="pt-3 border-t border-[#ded9cb] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-[#0c2b21] bg-[#f4f2ea] hover:bg-[#eae6dc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4f04c] text-[#0c2b21] hover:bg-[#c2e038] transition-all shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

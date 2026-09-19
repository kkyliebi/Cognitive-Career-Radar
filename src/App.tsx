import React, { useState, useEffect } from 'react';
import { StudioCandidate, PipelineStatus, ApplicationRecord, EditorialTheme } from './types';
import { SEED_STUDIOS } from './data/seedStudios';
import { SEED_RECORDS } from './data/seedRecords';
import { sanitizeStudios } from './utils/sanitize';
import { Header } from './components/Header';
import { RadarDiscovery } from './components/RadarDiscovery';
import { RecordsIndexView } from './components/RecordsIndexView';
import { DiagnosticInspector } from './components/DiagnosticInspector';
import { PipelineView } from './components/PipelineView';
import { DnaProtocolView } from './components/DnaProtocolView';
import { DossierModal } from './components/DossierModal';
import { OutreachModal } from './components/OutreachModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // Studios state (Autonomous Radar discovery candidates)
  const [studios, setStudios] = useState<StudioCandidate[]>(() => {
    const saved = localStorage.getItem('kylie_career_studios_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with master seed studios so no candidates are lost
          const map = new Map<string, StudioCandidate>();
          SEED_STUDIOS.forEach((s) => map.set(s.id, s));
          parsed.forEach((s) => map.set(s.id, s));
          return sanitizeStudios(Array.from(map.values()));
        }
      } catch (e) {
        console.error('Failed to parse saved studios from localStorage', e);
      }
    }
    return sanitizeStudios(SEED_STUDIOS);
  });

  // Records state (User's master application index, target list, and direct outreach)
  const [records, setRecords] = useState<ApplicationRecord[]>(() => {
    const saved = localStorage.getItem('kylie_career_records_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with master seed records so no applications are lost
          const map = new Map<string, ApplicationRecord>();
          SEED_RECORDS.forEach((r) => map.set(r.id, r));
          parsed.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Failed to parse saved records from localStorage', e);
      }
    }
    return SEED_RECORDS;
  });

  const [activeTab, setActiveTab] = useState<'radar' | 'records' | 'inspector' | 'pipeline' | 'dna'>('records');
  const [editorialTheme, setEditorialTheme] = useState<EditorialTheme>('petrol');
  const [selectedDossierStudio, setSelectedDossierStudio] = useState<StudioCandidate | null>(null);
  const [selectedOutreachStudio, setSelectedOutreachStudio] = useState<StudioCandidate | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('kylie_career_studios_v1', JSON.stringify(studios));
    } catch (e) {
      console.warn('LocalStorage save failed for studios:', e);
    }
  }, [studios]);

  useEffect(() => {
    try {
      localStorage.setItem('kylie_career_records_v1', JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save failed for records:', e);
    }
  }, [records]);

  // Master Backup Export & Import Handlers
  const handleExportBackup = () => {
    const backupData = {
      kylie_career_studios_v1: studios,
      kylie_career_records_v1: records,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kylie_career_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonData: any) => {
    try {
      let importedStudios: StudioCandidate[] = [];
      let importedRecords: ApplicationRecord[] = [];

      if (jsonData.kylie_career_studios_v1) {
        const val = jsonData.kylie_career_studios_v1;
        importedStudios = typeof val === 'string' ? JSON.parse(val) : val;
      } else if (Array.isArray(jsonData.studios)) {
        importedStudios = jsonData.studios;
      }

      if (jsonData.kylie_career_records_v1) {
        const val = jsonData.kylie_career_records_v1;
        importedRecords = typeof val === 'string' ? JSON.parse(val) : val;
      } else if (Array.isArray(jsonData.records)) {
        importedRecords = jsonData.records;
      }

      if (importedStudios.length > 0) {
        setStudios(sanitizeStudios(importedStudios));
      }
      if (importedRecords.length > 0) {
        setRecords(importedRecords);
      }
      alert(`🎉 成功导入 ${importedStudios.length} 个工作室与 ${importedRecords.length} 条求职记录！`);
    } catch (err) {
      alert('导入失败，请确保上传的是有效的 JSON 备份文件。');
      console.error('Import backup error:', err);
    }
  };

  const handleResetToMasterSeed = () => {
    if (window.confirm('确定要同步并重置为主数据库（57 个工作室 & 32 条投递记录）吗？')) {
      setStudios(sanitizeStudios(SEED_STUDIOS));
      setRecords(SEED_RECORDS);
    }
  };

  // Record Handlers
  const handleUpdateRecord = (updated: ApplicationRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAddRecord = (newRecord: ApplicationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleBulkImportRecords = (newRecords: ApplicationRecord[]) => {
    setRecords((prev) => {
      const map = new Map<string, ApplicationRecord>();
      prev.forEach((r) => map.set(r.id, r));
      newRecords.forEach((r) => map.set(r.id, r));
      return Array.from(map.values());
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Quick log a studio from Radar straight into the Application Index
  const handleQuickLogStudioToRecords = (studio: StudioCandidate) => {
    const nextNum = (records.filter((r) => r.category === 'application').length + 1)
      .toString()
      .padStart(3, '0');
    const today = new Date().toISOString().split('T')[0];

    const newRecord: ApplicationRecord = {
      id: `APP-${nextNum}`,
      category: 'application',
      date: today,
      company: studio?.name || 'Studio Candidate',
      position: studio?.activeRoles?.[0] || 'Spontaneous Creative Producer & Strategist',
      applicationLink: studio?.website || 'https://',
      applicationChannels: 'Website + Direct Email',
      cvVersion: studio?.recommendedCVTrack || 'Creative / Design version',
      status: 'Applied',
      feedback: 'Logged via Radar',
      compensation: '—',
      lastUpdate: today,
      notes: studio?.corePhilosophy || '',
    };

    handleAddRecord(newRecord);
    setActiveTab('records');
  };

  const handleAddStudios = (newStudios: StudioCandidate[]) => {
    const sanitized = sanitizeStudios(newStudios);
    setStudios((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const filteredNew = sanitized.filter((s) => !existingIds.has(s.id));
      return [...filteredNew, ...prev];
    });
  };

  const handleDeleteStudio = (id: string) => {
    setStudios((prev) => prev.filter((s) => s.id !== id));
    if (selectedDossierStudio?.id === id) {
      setSelectedDossierStudio(null);
    }
    if (selectedOutreachStudio?.id === id) {
      setSelectedOutreachStudio(null);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: PipelineStatus) => {
    setStudios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pipelineStatus: newStatus } : s))
    );
  };

  const safeStudios = Array.isArray(studios) ? studios : [];
  const safeRecords = Array.isArray(records) ? records : [];

  const stats = {
    total: safeStudios.length,
    activeRoles: safeStudios.filter((s) => s && s.hiringStatus === 'active_role' && s.pipelineStatus !== 'dismissed').length,
    spontaneous: safeStudios.filter((s) => s && s.hiringStatus === 'spontaneous_outreach' && s.pipelineStatus !== 'dismissed').length,
    highFit: safeStudios.filter((s) => s && (s.companyFitScore ?? 0) >= 90 && s.pipelineStatus !== 'dismissed').length,
    recordsCount: safeRecords.length,
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#0c2b21] font-sans antialiased selection:bg-[#d4f04c] selection:text-[#0c2b21] flex flex-col">
      {/* Editorial Masthead & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editorialTheme={editorialTheme}
        setEditorialTheme={setEditorialTheme}
        stats={stats}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetToMasterSeed={handleResetToMasterSeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary fallbackTitle="Error loading view">
          {/* Tab 01: Radar Explorer */}
          {activeTab === 'radar' && (
            <RadarDiscovery
              studios={safeStudios}
              records={safeRecords}
              onAddStudios={handleAddStudios}
              onOpenDossier={(studio) => setSelectedDossierStudio(studio)}
              onDraftOutreach={(studio) => setSelectedOutreachStudio(studio)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteStudio={handleDeleteStudio}
              onQuickLogToRecords={handleQuickLogStudioToRecords}
            />
          )}

          {/* Tab 02: Records & Master Index */}
          {activeTab === 'records' && (
            <RecordsIndexView
              records={safeRecords}
              onUpdateRecord={handleUpdateRecord}
              onAddRecord={handleAddRecord}
              onDeleteRecord={handleDeleteRecord}
              onBulkImportRecords={handleBulkImportRecords}
              editorialTheme={editorialTheme}
              onJumpToRadar={() => {
                setActiveTab('radar');
              }}
            />
          )}

          {/* Tab 03: Diagnostic Inspector (18-Point Protocol) */}
          {activeTab === 'inspector' && (
            <DiagnosticInspector
              onSaveAsCandidate={(newCandidate) => {
                handleAddStudios([newCandidate]);
                setActiveTab('radar');
              }}
              onDraftOutreach={(studio) => setSelectedOutreachStudio(studio)}
            />
          )}

          {/* Tab 04: Pipeline Kanban */}
          {activeTab === 'pipeline' && (
            <PipelineView
              studios={safeStudios}
              onOpenDossier={(studio) => setSelectedDossierStudio(studio)}
              onDraftOutreach={(studio) => setSelectedOutreachStudio(studio)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {/* Tab 05: Career DNA Protocol Spec */}
          {activeTab === 'dna' && <DnaProtocolView />}
        </ErrorBoundary>
      </main>

      {/* 18-Point Dossier Modal */}
      {selectedDossierStudio && (
        <DossierModal
          studio={selectedDossierStudio}
          onClose={() => setSelectedDossierStudio(null)}
          onDraftOutreach={(studio) => {
            setSelectedDossierStudio(null);
            setSelectedOutreachStudio(studio);
          }}
          onUpdateStatus={handleUpdateStatus}
          onDeleteStudio={handleDeleteStudio}
        />
      )}

      {/* Spontaneous Cold Outreach Modal */}
      {selectedOutreachStudio && (
        <OutreachModal
          studio={selectedOutreachStudio}
          onClose={() => setSelectedOutreachStudio(null)}
        />
      )}

      {/* Editorial Publication Colophon Footer */}
      <footer className="border-t border-[#ded9cb] bg-white/90 backdrop-blur-md py-7 text-xs text-[#557164]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4f04c] border border-[#0c2b21]/20" />
            <span className="font-serif font-bold text-[#0c2b21] text-sm">KYLIE BI // CAREER OPERATING SYSTEM</span>
            <span className="text-[#a4b5ad] font-mono">/</span>
            <span className="font-mono text-[11px] text-[#557164]">MILAN &amp; EUROPE DESIGN REGISTRY</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-[#557164] font-mono flex-wrap justify-center">
            <span className="text-[#0c2b21] font-bold bg-[#d4f04c] px-2.5 py-0.5 rounded-full text-[10px] uppercase">PRIME OBJECTIVE: PHILOSOPHICAL FIT</span>
            <span className="text-[#a4b5ad]">·</span>
            <span>{safeRecords.length} Records In Ledger</span>
            <span className="text-[#a4b5ad]">·</span>
            <span>{safeStudios.length} Practices On Radar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

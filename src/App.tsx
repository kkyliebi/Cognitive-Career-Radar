import React, { useState, useEffect } from 'react';
import { StudioCandidate, PipelineStatus, ApplicationRecord } from './types';
import { SEED_STUDIOS } from './data/seedStudios';
import { SEED_RECORDS } from './data/seedRecords';
import { Header } from './components/Header';
import { RadarDiscovery } from './components/RadarDiscovery';
import { RecordsIndexView } from './components/RecordsIndexView';
import { DiagnosticInspector } from './components/DiagnosticInspector';
import { PipelineView } from './components/PipelineView';
import { DnaProtocolView } from './components/DnaProtocolView';
import { DossierModal } from './components/DossierModal';
import { OutreachModal } from './components/OutreachModal';

export default function App() {
  // Studios state (Autonomous Radar discovery candidates)
  const [studios, setStudios] = useState<StudioCandidate[]>(() => {
    const saved = localStorage.getItem('kylie_career_studios_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved studios from localStorage', e);
      }
    }
    return SEED_STUDIOS;
  });

  // Records state (User's master application index, target list, and direct outreach)
  const [records, setRecords] = useState<ApplicationRecord[]>(() => {
    const saved = localStorage.getItem('kylie_career_records_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved records from localStorage', e);
      }
    }
    return SEED_RECORDS;
  });

  const [activeTab, setActiveTab] = useState<'radar' | 'records' | 'inspector' | 'pipeline' | 'dna'>('records');
  const [selectedDossierStudio, setSelectedDossierStudio] = useState<StudioCandidate | null>(null);
  const [selectedOutreachStudio, setSelectedOutreachStudio] = useState<StudioCandidate | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('kylie_career_studios_v1', JSON.stringify(studios));
  }, [studios]);

  useEffect(() => {
    localStorage.setItem('kylie_career_records_v1', JSON.stringify(records));
  }, [records]);

  // Record Handlers
  const handleUpdateRecord = (updated: ApplicationRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAddRecord = (newRecord: ApplicationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
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
      company: studio.name,
      position: studio.activeRoles?.[0] || 'Spontaneous Creative Producer & Strategist',
      applicationLink: studio.website,
      applicationChannels: 'Website + Direct Pitch',
      cvVersion: studio.recommendedCVTrack,
      status: 'Applied',
      feedback: 'Logged via Radar',
      compensation: '—',
      lastUpdate: today,
      notes: studio.corePhilosophy,
    };

    handleAddRecord(newRecord);
    setActiveTab('records');
  };

  const handleAddStudios = (newStudios: StudioCandidate[]) => {
    setStudios((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const filteredNew = newStudios.filter((s) => !existingIds.has(s.id));
      return [...filteredNew, ...prev];
    });
  };

  const handleUpdateStatus = (id: string, newStatus: PipelineStatus) => {
    setStudios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pipelineStatus: newStatus } : s))
    );
  };

  const stats = {
    total: studios.length,
    activeRoles: studios.filter((s) => s.hiringStatus === 'active_role').length,
    spontaneous: studios.filter((s) => s.hiringStatus === 'spontaneous_outreach').length,
    highFit: studios.filter((s) => s.companyFitScore >= 90).length,
    recordsCount: records.length,
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#0c2b21] font-sans antialiased selection:bg-[#d4f04c] selection:text-[#0c2b21] flex flex-col">
      {/* Editorial Masthead & Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 01: Radar Explorer */}
        {activeTab === 'radar' && (
          <RadarDiscovery
            studios={studios}
            records={records}
            onAddStudios={handleAddStudios}
            onOpenDossier={(studio) => setSelectedDossierStudio(studio)}
            onDraftOutreach={(studio) => setSelectedOutreachStudio(studio)}
            onUpdateStatus={handleUpdateStatus}
            onQuickLogToRecords={handleQuickLogStudioToRecords}
          />
        )}

        {/* Tab 02: Records & Master Index */}
        {activeTab === 'records' && (
          <RecordsIndexView
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
            onJumpToRadar={(name) => {
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
            studios={studios}
            onOpenDossier={(studio) => setSelectedDossierStudio(studio)}
            onDraftOutreach={(studio) => setSelectedOutreachStudio(studio)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Tab 05: Career DNA Protocol Spec */}
        {activeTab === 'dna' && <DnaProtocolView />}
      </main>

      {/* 18-Point Dossier Modal */}
      <DossierModal
        studio={selectedDossierStudio}
        onClose={() => setSelectedDossierStudio(null)}
        onDraftOutreach={(studio) => {
          setSelectedDossierStudio(null);
          setSelectedOutreachStudio(studio);
        }}
      />

      {/* Spontaneous Cold Outreach Modal */}
      <OutreachModal
        studio={selectedOutreachStudio}
        onClose={() => setSelectedOutreachStudio(null)}
      />

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
            <span>{records.length} Records In Ledger</span>
            <span className="text-[#a4b5ad]">·</span>
            <span>{studios.length} Practices On Radar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

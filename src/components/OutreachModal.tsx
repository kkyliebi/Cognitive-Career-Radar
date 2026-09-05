import React, { useState, useEffect } from 'react';
import { StudioCandidate } from '../types';
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

interface OutreachModalProps {
  studio: StudioCandidate | null;
  onClose: () => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({ studio, onClose }) => {
  const [language, setLanguage] = useState<'en' | 'it'>('en');
  const [customNote, setCustomNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outreachData, setOutreachData] = useState<{
    subjectLine: string;
    previewSnippet: string;
    salutation: string;
    body: string;
    closing: string;
    strategicTalkingPoints: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (studio) {
      handleGenerate();
    }
  }, [studio, language]);

  if (!studio) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studio, customNote, language }),
      });
      const data = await res.json();
      setOutreachData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFullDraft = () => {
    if (!outreachData) return;
    const fullText = `Subject: ${outreachData.subjectLine}\n\n${outreachData.salutation}\n\n${outreachData.body}\n\n${outreachData.closing}\n\nKylie Bi\nCommunication Designer & Creative Producer\nMilan, Italy`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c2b21]/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#ded9cb] shadow-[0_25px_60px_rgba(12,43,33,0.25)] overflow-hidden my-8 text-[#0c2b21] animate-scale-in">
        {/* Editorial Header */}
        <div className="bg-[#0c2b21] text-[#f7f6f1] p-6 sm:p-7 flex items-start justify-between border-b border-[#1b4839]">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4f04c] text-[#0c2b21] mb-2.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Strategic Pitch Generator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Spontaneous Outreach: {studio.name}
            </h3>
            <p className="text-xs text-[#98b8aa] mt-1 font-medium">
              Formulated to address implicit creative frictions &amp; bridge strategic cognitive gaps.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[72vh] overflow-y-auto text-xs bg-[#fbfaf6]">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#ded9cb] shadow-xs">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#638173] text-[10px]">
                Language:
              </span>
              <div className="inline-flex bg-[#f4f2ea] p-1 rounded-full border border-[#ded9cb]">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    language === 'en'
                      ? 'bg-[#0c2b21] text-white shadow-xs'
                      : 'text-[#638173] hover:text-[#0c2b21]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('it')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    language === 'it'
                      ? 'bg-[#0c2b21] text-white shadow-xs'
                      : 'text-[#638173] hover:text-[#0c2b21]'
                  }`}
                >
                  Italiano
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#638173] font-bold text-[10px] uppercase">Track:</span>
              <span className="bg-[#e0f2fe] text-[#082d47] border border-[#9ad3fa] px-3 py-0.5 rounded-full font-semibold text-[11px]">
                {studio.recommendedCVTrack}
              </span>
            </div>
          </div>

          {isGenerating ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#ded9cb]">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#0c2b21]" />
              <p className="text-xs text-[#527263] font-serif italic text-sm">
                Composing tailored direct pitch based on {studio.name}'s philosophy and creative challenges...
              </p>
            </div>
          ) : outreachData ? (
            <div className="space-y-4">
              {/* Subject Line */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#638173] mb-1">
                  Subject Line
                </label>
                <div className="bg-white p-3.5 rounded-2xl border border-[#ded9cb] text-xs font-bold text-[#0c2b21] select-all shadow-xs">
                  {outreachData.subjectLine}
                </div>
              </div>

              {/* Strategic Talking Points */}
              <div className="bg-[#eefcf4] border border-[#9de6c7] p-4 sm:p-5 rounded-2xl shadow-xs">
                <span className="text-xs font-serif font-bold text-[#0c2b21] block mb-2">
                  Highlighted Strategic Narrative Anchors:
                </span>
                <ul className="text-[#1a4435] space-y-1.5 text-xs">
                  {outreachData.strategicTalkingPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#18523f] font-bold">✦</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Email Body */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#638173] mb-1">
                  Draft Editorial Letter
                </label>
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ded9cb] text-xs leading-relaxed text-[#203c2f] whitespace-pre-line select-all shadow-xs">
                  <p className="font-serif font-bold text-sm text-[#0c2b21] mb-2">{outreachData.salutation}</p>
                  <p className="mb-3 text-[13px] leading-relaxed font-sans">{outreachData.body}</p>
                  <p className="font-semibold text-[#0c2b21]">{outreachData.closing}</p>
                  <p className="text-[#638173] mt-4 pt-3.5 border-t border-[#ede8dd] font-serif text-xs">
                    <strong className="text-[#0c2b21] block font-sans text-xs">Kylie Bi</strong>
                    Communication Designer &amp; Creative Producer<br />
                    Milan, Italy
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#f4f2ea] border-t border-[#ded9cb] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#0c2b21] hover:bg-[#e8e4d8] transition-colors"
          >
            Close
          </button>

          <button
            onClick={copyFullDraft}
            disabled={!outreachData}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4f04c] hover:bg-[#c2e038] text-[#0c2b21] disabled:opacity-50 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Pitch Draft'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

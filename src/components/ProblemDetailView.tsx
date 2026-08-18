import React, { useState } from 'react';
import { ProblemItem, ActiveScreen } from '../types';
import { 
  ArrowLeft, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  ExternalLink,
  Copy,
  Check,
  Volume2
} from 'lucide-react';

interface ProblemDetailViewProps {
  problem: ProblemItem;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenEmployeeMode: (problem: ProblemItem) => void;
}

export const ProblemDetailView: React.FC<ProblemDetailViewProps> = ({
  problem,
  onNavigate,
  onOpenEmployeeMode,
}) => {
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  const isHigh = problem.severity === 'high';
  const isWarning = problem.severity === 'warning';

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(problem.employeePhraseEn);
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 2000);
    } catch {
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 2000);
    }
  };

  return (
    <div id="problem-detail-view" className="space-y-6 pb-12">
      
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('problem_categories')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              INCIDENT RESPONSE PROTOCOL
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              {problem.title}
            </h1>
          </div>
        </div>

        <span className={`text-xs font-mono font-black uppercase px-2.5 py-1 border ${
          isHigh
            ? 'bg-red-600 text-white border-red-600'
            : isWarning
            ? 'bg-amber-400 text-black border-black'
            : 'bg-black text-white border-black'
        }`}>
          {problem.severityLabel}
        </span>
      </div>

      {/* 2. IMMEDIATE ACTIONS (1-2-3 SEQUENCE) */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-black">
            СДЕЛАЙТЕ ЭТИ 3 ВЕЩИ ПРЯМО СЕЙЧАС:
          </span>
          <span className="text-xs font-mono font-bold text-gray-500 uppercase">
            SEQUENCE
          </span>
        </div>

        <ol className="space-y-4">
          {problem.immediateSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-black flex-shrink-0 flex items-center justify-center text-sm font-black bg-black text-white">
                {idx + 1}
              </div>
              <p className="text-base sm:text-lg font-bold text-black leading-snug pt-0.5">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. PROHIBITIONS BLOCK (RED STRICT WARNING) */}
      <section className="border-4 border-red-600 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-red-600 border-b-2 border-red-200 pb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
          </svg>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
            НЕ ДЕЛАЙТЕ (ТИПИЧНЫЕ ОШИБКИ В ПАНИКЕ):
          </h3>
        </div>

        <ul className="space-y-3">
          {problem.doNotDo.map((proh, pIdx) => (
            <li key={pIdx} className="flex items-start gap-3 text-red-950 font-bold text-sm sm:text-base">
              <span className="text-red-600 font-black text-lg leading-none shrink-0">•</span>
              <span>{proh}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. SHOW TO EMPLOYEE BUTTON (HERO ACTION) */}
      <section className="bg-black text-white p-6 sm:p-8 border-2 border-black space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
            COMMUNICATION PROTOCOL
          </span>
          <span className="text-[10px] font-black uppercase bg-white text-black px-2 py-0.5">
            HIGH CONTRAST 32PX MODE
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Фраза на английском для персонала:</p>
          <p className="text-lg sm:text-xl font-black text-white leading-snug">
            «{problem.employeePhraseEn}»
          </p>
          <p className="text-xs text-gray-300 font-medium mt-1">
            Перевод: {problem.employeePhraseRu}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            id="btn-open-employee-mode"
            onClick={() => onOpenEmployeeMode(problem)}
            className="flex-1 px-6 py-4 bg-white text-black hover:bg-gray-100 border-2 border-white font-black text-base uppercase flex items-center justify-center gap-2 cursor-pointer min-h-[56px] active:translate-x-0.5 active:translate-y-0.5"
          >
            <Languages className="w-5 h-5 stroke-[2.5]" />
            <span>ПОКАЗАТЬ СОТРУДНИКУ (32PX + ГОЛОС)</span>
          </button>

          <button
            onClick={handleCopyPhrase}
            className="px-5 py-4 border-2 border-gray-600 hover:border-white text-white font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer min-h-[56px]"
          >
            {copiedPhrase ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedPhrase ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}</span>
          </button>
        </div>
      </section>

      {/* 5. LEGAL RIGHTS & COMPENSATION (ACCORDION) */}
      <section className="border-2 border-black bg-white">
        <button
          onClick={() => setShowLegalDetails(!showLegalDetails)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 cursor-pointer"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 block">
              LEGAL ENTITLEMENTS & RECOMPENSE
            </span>
            <span className="text-base font-black uppercase text-black">
              {problem.nextActions.title}
            </span>
          </div>
          <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0">
            {showLegalDetails ? <ChevronUp className="w-5 h-5 stroke-[2.5]" /> : <ChevronDown className="w-5 h-5 stroke-[2.5]" />}
          </div>
        </button>

        {showLegalDetails && (
          <div className="p-6 border-t-2 border-black bg-gray-50 space-y-3">
            {problem.nextActions.content.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-bold text-black">
                <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1.5"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. VERIFIED SOURCE PROTOCOL */}
      <section className="p-5 border-2 border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase text-gray-500">OFFICIAL LEGAL SOURCE</span>
            <span className="text-[10px] font-black uppercase bg-green-100 text-green-800 border border-green-300 px-1.5 py-0.2">
              HIGH TRUST
            </span>
          </div>
          <p className="text-xs font-bold uppercase text-black">
            {problem.source.name} • {problem.source.ruleCode}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">
            VERIFIED: {problem.source.checkedDate}
          </span>
          <span className="text-[10px] font-bold text-gray-700 uppercase block">
            {problem.source.confidenceLevel}
          </span>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { 
  StageId, 
  StageInfo, 
  ActiveScreen 
} from '../types';
import { STAGES_LIST } from '../data/stagesData';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WhatNowViewProps {
  activeStageId: StageId;
  completedStages: Set<StageId>;
  onSelectStage: (stageId: StageId) => void;
  onToggleCompleteStage: (stageId: StageId) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const WhatNowView: React.FC<WhatNowViewProps> = ({
  activeStageId,
  completedStages,
  onSelectStage,
  onToggleCompleteStage,
  onNavigate,
}) => {
  const currentStageIndex = STAGES_LIST.findIndex(s => s.id === activeStageId);
  const currentStage: StageInfo = STAGES_LIST[currentStageIndex] || STAGES_LIST[0];
  const isCompleted = completedStages.has(currentStage.id);

  const prevStage = currentStageIndex > 0 ? STAGES_LIST[currentStageIndex - 1] : null;
  const nextStage = currentStageIndex < STAGES_LIST.length - 1 ? STAGES_LIST[currentStageIndex + 1] : null;

  return (
    <div id="what-now-view" className="space-y-6 pb-12">
      
      {/* 1. TOP NAVIGATION / STAGE SELECTOR STRIP */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              ШАГ 0{currentStage.order} ИЗ 06
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              {currentStage.name}
            </h1>
          </div>
        </div>

        {/* Stage step indicators */}
        <div className="flex items-center gap-1.5">
          {STAGES_LIST.map(st => (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`w-7 h-7 border-2 border-black text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                st.id === activeStageId
                  ? 'bg-black text-white'
                  : completedStages.has(st.id)
                  ? 'bg-gray-200 text-black'
                  : 'bg-white text-gray-400 opacity-60'
              }`}
            >
              {st.order}
            </button>
          ))}
        </div>
      </div>

      {/* 2. HERO ACTION BANNER (Geometric #FFD700 Yellow Block) */}
      <section className="bg-[#FFD700] border-2 border-black p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-wider">
              ГЛАВНОЕ ДЕЙСТВИЕ
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
            ~{currentStage.typicalDurationMin} МИН ОБЫЧНО
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase italic text-black">
          {currentStage.recommendation}
        </h2>

        <div className="text-xs sm:text-sm font-bold text-black/80 flex items-center gap-2">
          <span>ЛОКАЦИЯ: {currentStage.locationHint}</span>
        </div>
      </section>

      {/* 3. THREE MANDATORY IMMEDIATE ACTIONS */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-black">
            СДЕЛАЙТЕ ЭТИ 3 ШАГА СЕЙЧАС (ПОСЛЕДОВАТЕЛЬНО):
          </span>
          <span className="text-xs font-mono font-bold text-gray-500 uppercase">
            3 ШАГА
          </span>
        </div>

        <ol className="space-y-4 sm:space-y-6">
          {currentStage.immediateSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-black flex-shrink-0 flex items-center justify-center text-sm font-black bg-black text-white">
                {idx + 1}
              </div>
              <div className="pt-0.5">
                <p className="text-base sm:text-lg font-bold text-black leading-snug">
                  {step}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Complete Stage Action */}
        <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onToggleCompleteStage(currentStage.id)}
            className={`w-full sm:w-auto px-6 py-3.5 border-2 border-black font-black text-sm uppercase flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
              isCompleted
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{isCompleted ? 'ЭТАП ОТМЕЧЕН КАК ПРОЙДЕННЫЙ' : 'ОТМЕТИТЬ ЭТАП КАК ПРОЙДЕННЫЙ'}</span>
          </button>

          {nextStage && (
            <button
              onClick={() => onSelectStage(nextStage.id)}
              className="w-full sm:w-auto px-6 py-3.5 bg-black text-white hover:bg-gray-900 border-2 border-black font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <span>СЛЕДУЮЩИЙ: {nextStage.name}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </section>

      {/* 4. DO NOT DO BLOCK (STRICT RED WARNING) */}
      <section className="border-4 border-red-600 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-red-600 border-b-2 border-red-200 pb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
          </svg>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
            НЕ ДЕЛАЙТЕ НА ЭТОМ ЭТАПЕ (КРИТИЧЕСКИЕ ОШИБКИ):
          </h3>
        </div>

        <ul className="space-y-3">
          {currentStage.prohibitions.map((proh, pIdx) => (
            <li key={pIdx} className="flex items-start gap-3 text-red-950 font-bold text-sm sm:text-base">
              <span className="text-red-600 font-black text-lg leading-none shrink-0">•</span>
              <span>{proh}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. VERIFIED DATA SOURCE FOOTER CARD */}
      <section className="p-5 border-2 border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase text-gray-500">ИСТОЧНИК ДАННЫХ</span>
            <span className="text-[10px] font-black uppercase bg-green-100 text-green-800 border border-green-300 px-1.5 py-0.2">
              ВЫСОКОЕ ДОВЕРИЕ
            </span>
          </div>
          <p className="text-xs font-bold uppercase text-black">
            {currentStage.source.name} • ПРАВИЛО {currentStage.source.ruleCode}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">
            ПРОВЕРЕНО: {currentStage.source.checkedDate}
          </span>
          <span className="text-[10px] font-bold text-gray-700 uppercase block">
            СТАТУС: {currentStage.source.confidence}
          </span>
        </div>
      </section>

    </div>
  );
};

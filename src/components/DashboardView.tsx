import React from 'react';
import { 
  Check, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  BatteryCharging, 
  Luggage, 
  FileText, 
  MapPin, 
  Languages,
  ShieldCheck,
  Plane,
  Edit3
} from 'lucide-react';
import { StageId, StageInfo, FlightItinerary, ActiveScreen } from '../types';
import { STAGES_LIST } from '../data/stagesData';

interface DashboardViewProps {
  itinerary: FlightItinerary;
  activeStageId: StageId;
  completedStages: Set<StageId>;
  onSelectStage: (stageId: StageId) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenLegSwitcher: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  itinerary,
  activeStageId,
  completedStages,
  onSelectStage,
  onNavigate,
  onOpenLegSwitcher
}) => {
  const currentLeg = itinerary.legs[itinerary.currentLegIndex] || itinerary.legs[0];
  const activeStageInfo = STAGES_LIST.find(s => s.id === activeStageId) || STAGES_LIST[0];

  return (
    <div id="dashboard-container" className="space-y-6 pb-8">
      
      {/* 1. HERO FLIGHT ROUTE & COUNTDOWN CARD (Geometric High Contrast) */}
      <section 
        id="flight-card" 
        className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b-2 border-black">
          {/* Route Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                ACTIVE FLIGHT ROUTE
              </span>
              <button
                onClick={onOpenLegSwitcher}
                className="px-3 py-1.5 border-2 border-black font-black text-xs uppercase bg-white hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                Изменить рейс
              </button>
            </div>

            {/* Giant Italic Route Codes */}
            <div className="flex items-center gap-3 sm:gap-5 text-4xl sm:text-6xl font-black italic tracking-tighter text-black">
              <span>{itinerary.legs[0]?.fromCode || 'SVO'}</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span>{itinerary.legs[0]?.toCode || 'IST'}</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span>{itinerary.legs[1]?.toCode || 'BER'}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm sm:text-base font-black uppercase tracking-tight">
              <span className="bg-black text-white px-2 py-0.5">{currentLeg.airline}</span>
              <span>{currentLeg.flightNumber}</span>
              <span className="text-gray-400">•</span>
              <span>{currentLeg.terminal}</span>
              <span className="text-gray-400">•</span>
              <span>GATE: {currentLeg.gate}</span>
              <span className="text-gray-400">•</span>
              <span>SEAT: {currentLeg.seat}</span>
            </div>
          </div>

          {/* Large Tabular Countdown */}
          <div className="text-left lg:text-right border-t-2 lg:border-t-0 border-black pt-4 lg:pt-0">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">
              DEPARTURE IN / ДО ВЫЛЕТА
            </span>
            <div className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter text-black">
              02:40
            </div>
            <span className="text-xs font-mono font-bold text-gray-600 block mt-1">
              SCHEDULED: {currentLeg.departureTime}
            </span>
          </div>
        </div>

        {/* 2. GEOMETRIC 6-STEP TIMELINE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
            <span>PASSENGER STAGE TIMELINE (6 STEPS)</span>
            <span>TAP STAGE TO SELECT</span>
          </div>

          <div className="flex justify-between items-center relative py-4 px-2 overflow-x-auto no-scrollbar">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -z-0"></div>

            {STAGES_LIST.map((stage) => {
              const isCompleted = completedStages.has(stage.id);
              const isCurrent = stage.id === activeStageId;

              return (
                <button
                  key={stage.id}
                  id={`stage-node-${stage.id}`}
                  onClick={() => onSelectStage(stage.id)}
                  className={`relative z-10 flex flex-col items-center gap-2 bg-white px-2 cursor-pointer transition-all ${
                    isCurrent ? 'scale-115 sm:scale-125' : isCompleted ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white border-2 border-black">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center font-black text-sm text-black">
                      0{stage.order}
                    </div>
                  ) : (
                    <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center font-bold text-xs text-black">
                      0{stage.order}
                    </div>
                  )}

                  <span className={`text-[10px] font-black uppercase whitespace-nowrap ${
                    isCurrent ? 'text-black font-extrabold' : 'text-gray-700'
                  }`}>
                    {stage.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. TWO GIANT HERO BUTTONS (WHAT NOW? & I HAVE A PROBLEM) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Button 1: WHAT NOW? */}
        <button
          id="btn-what-to-do-now"
          onClick={() => onNavigate('what_now')}
          className="bg-black text-white p-6 sm:p-8 border-2 border-black flex flex-col justify-between hover:bg-gray-900 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left min-h-[160px] sm:min-h-[180px] cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span className="text-[11px] font-mono font-bold tracking-widest text-gray-400 uppercase">
              STEP 0{activeStageInfo.order} • {activeStageInfo.name.toUpperCase()}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black uppercase text-left block leading-tight tracking-tight">
              WHAT NOW? / ЧТО ДЕЛАТЬ?
            </span>
            <span className="text-xs font-bold text-gray-400 mt-1 block">
              3 immediate steps & rules for {activeStageInfo.name} →
            </span>
          </div>
        </button>

        {/* Button 2: I HAVE A PROBLEM */}
        <button
          id="btn-i-have-a-problem"
          onClick={() => onNavigate('problem_categories')}
          className="border-4 border-red-600 text-red-600 bg-white p-6 sm:p-8 flex flex-col justify-between hover:bg-red-50 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left min-h-[160px] sm:min-h-[180px] cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
            </svg>
            <span className="text-[11px] font-mono font-black tracking-widest text-red-600 uppercase">
              26 SCENARIOS READY
            </span>
          </div>

          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black uppercase text-left block leading-tight tracking-tight">
              I HAVE A PROBLEM / У МЕНЯ ПРОБЛЕМА
            </span>
            <span className="text-xs font-bold text-red-700 mt-1 block">
              Delay, Lost Baggage, Denied Boarding, SSSS →
            </span>
          </div>
        </button>
      </section>

      {/* 4. CURRENT ACTION CARD (#FFD700 Yellow Geometric Box) */}
      <section className="bg-[#FFD700] border-2 border-black p-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-wider">
              ACTION REQUIRED NOW:
            </span>
          </div>
          <span className="text-xs font-mono font-bold uppercase bg-black text-white px-2 py-0.5">
            STAGE 0{activeStageInfo.order}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black leading-tight uppercase italic text-black">
          {activeStageInfo.recommendation}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-black/80">
          Estimated stage duration: ~{activeStageInfo.typicalDurationMin} min. Location: {activeStageInfo.locationHint}.
        </p>
      </section>

      {/* 5. QUICK ACCESS UTILITIES GRID (3-Column Border-2 Black Blocks) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
          <span>AIRPORT PASSENGER TOOLBOX</span>
          <span>OFFLINE READY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Box 1: Powerbank & Item Check */}
          <button
            onClick={() => onNavigate('check_item')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">SECURITY RULE</span>
              <BatteryCharging className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Powerbank & Wh Check</div>
              <div className="text-xs opacity-75 mt-0.5">FAA / TSA calculation formula</div>
            </div>
          </button>

          {/* Box 2: Documents Vault */}
          <button
            onClick={() => onNavigate('documents_vault')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">DOCUMENTS</span>
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Visa, Passport & Health</div>
              <div className="text-xs opacity-75 mt-0.5">Offline document checklist</div>
            </div>
          </button>

          {/* Box 3: Translation & Phrases */}
          <button
            onClick={() => onNavigate('phrasebook')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">TRANSLATION</span>
              <Languages className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Key Staff Phrases</div>
              <div className="text-xs opacity-75 mt-0.5">32px screen + voice speech</div>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};

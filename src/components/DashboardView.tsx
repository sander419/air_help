import React from 'react';
import { 
  Check, 
  BatteryCharging, 
  FileText, 
  Languages,
  Edit3
} from 'lucide-react';
import { StageId, StageInfo, FlightItinerary, ActiveScreen } from '../types';
import { STAGES_LIST } from '../data/stagesData';
import { WeatherCard } from './WeatherCard';
import { useCountdown } from '../hooks/useCountdown';
import { useWeatherWithCache } from '../hooks/useWeatherWithCache';

interface DashboardViewProps {
  itinerary: FlightItinerary;
  activeStageId: StageId;
  completedStages: Set<StageId>;
  onSelectStage: (stageId: StageId) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenLegSwitcher: () => void;
}

const ArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className={`shrink-0 ${className}`}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

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

  // Коды всех точек маршрута: VKO → IST → BER
  const routeCodes = [...itinerary.legs.map(l => l.fromCode), itinerary.legs[itinerary.legs.length - 1]?.toCode]
    .filter(Boolean);

  return (
    <div id="dashboard-container" className="space-y-6 pb-8">
      
      {/* 1. КАРТОЧКА РЕЙСА */}
      <section 
        id="flight-card" 
        className="bg-white border-2 border-black p-5 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b-2 border-black">
          {/* Маршрут */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                МАРШРУТ РЕЙСА
              </span>
              <button
                onClick={onOpenLegSwitcher}
                className="px-3 py-1.5 border-2 border-black font-black text-xs uppercase bg-white hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                Изменить
              </button>
            </div>

            {/* Коды маршрута */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-2xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter text-black">
              {routeCodes.map((code, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ArrowIcon className="w-5 h-5 sm:w-8 sm:h-8" />}
                  <span className="break-all">{code}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Данные рейса */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base font-black uppercase tracking-tight">
              <span className="bg-black text-white px-2 py-0.5 break-all">{currentLeg.airline || '—'}</span>
              <span>{currentLeg.flightNumber || '—'}</span>
              <span className="text-gray-400">•</span>
              <span>{currentLeg.terminal || '—'}</span>
              <span className="text-gray-400">•</span>
              <span>ГЕЙТ: {currentLeg.gate || '—'}</span>
              <span className="text-gray-400">•</span>
              <span>МЕСТО: {currentLeg.seat || '—'}</span>
            </div>
          </div>

          {/* Таймер до вылета */}
          <div className="text-left lg:text-right border-t-2 lg:border-t-0 border-black pt-4 lg:pt-0 shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">
              ДО ВЫЛЕТА
            </span>
            <div className="text-4xl sm:text-6xl font-black tabular-nums tracking-tighter text-black">
              {useCountdown(currentLeg.departureTime)}
            </div>
            <span className="text-xs font-mono font-bold text-gray-600 block mt-1">
              ПО РАСПИСАНИЮ: {currentLeg.departureTime || '—'}
            </span>
          </div>
        </div>

        {/* 2. ТАЙМЛАЙН 6 ЭТАПОВ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
            <span>ЭТАПЫ ПОЕЗДКИ (6 ШАГОВ)</span>
            <span>НАЖМИ, ЧТОБЫ ВЫБРАТЬ</span>
          </div>

          <div className="flex justify-between items-center relative py-4 px-2 overflow-x-auto no-scrollbar">
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
                    isCurrent ? 'scale-110 sm:scale-125' : isCompleted ? 'opacity-100' : 'opacity-40 hover:opacity-80'
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

      {/* ПОГОДА В ПУНКТЕ НАЗНАЧЕНИЯ */}
      <WeatherCard city={currentLeg.toCity} />

      {/* 3. ДВЕ ГЛАВНЫЕ КНОПКИ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Кнопка 1: ЧТО ДЕЛАТЬ */}
        <button
          id="btn-what-to-do-now"
          onClick={() => onNavigate('what_now')}
          className="bg-black text-white p-6 sm:p-8 border-2 border-black flex flex-col justify-between hover:bg-gray-900 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left min-h-[140px] sm:min-h-[180px] cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span className="text-[11px] font-mono font-bold tracking-widest text-gray-400 uppercase text-right">
              ШАГ 0{activeStageInfo.order} • {activeStageInfo.name.toUpperCase()}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xl sm:text-3xl font-black uppercase text-left block leading-tight tracking-tight">
              ЧТО ДЕЛАТЬ СЕЙЧАС?
            </span>
            <span className="text-xs font-bold text-gray-400 mt-1 block">
              3 шага для этапа «{activeStageInfo.name}»
            </span>
          </div>
        </button>

        {/* Кнопка 2: ПРОБЛЕМА */}
        <button
          id="btn-i-have-a-problem"
          onClick={() => onNavigate('problem_categories')}
          className="border-4 border-red-600 text-red-600 bg-white p-6 sm:p-8 flex flex-col justify-between hover:bg-red-50 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left min-h-[140px] sm:min-h-[180px] cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-600 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
            </svg>
            <span className="text-[11px] font-mono font-black tracking-widest text-red-600 uppercase text-right">
              26 СЦЕНАРИЕВ ГОТОВО
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xl sm:text-3xl font-black uppercase text-left block leading-tight tracking-tight">
              У МЕНЯ ПРОБЛЕМА
            </span>
            <span className="text-xs font-bold text-red-700 mt-1 block">
              Задержка, потеря багажа, отказ в посадке
            </span>
          </div>
        </button>
      </section>

      {/* 4. ЖЁЛТЫЙ БЛОК ТЕКУЩЕГО ДЕЙСТВИЯ */}
      <section className="bg-[#FFD700] border-2 border-black p-6 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="shrink-0">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-wider">
              СДЕЛАТЬ СЕЙЧАС:
            </span>
          </div>
          <span className="text-xs font-mono font-bold uppercase bg-black text-white px-2 py-0.5 shrink-0">
            ЭТАП 0{activeStageInfo.order}
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-black leading-tight uppercase italic text-black break-words">
          {activeStageInfo.recommendation}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-black/80">
          Время этапа: ~{activeStageInfo.typicalDurationMin} мин. Где: {activeStageInfo.locationHint}.
        </p>
      </section>

      {/* 5. ИНСТРУМЕНТЫ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
          <span>ИНСТРУМЕНТЫ ПАССАЖИРА</span>
          <span>РАБОТАЕТ БЕЗ ИНТЕРНЕТА</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Повербанк */}
          <button
            onClick={() => onNavigate('check_item')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">ПРАВИЛО ДОСМОТРА</span>
              <BatteryCharging className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Повербанк и расчёт Wh</div>
              <div className="text-xs opacity-75 mt-0.5">Формула FAA / TSA</div>
            </div>
          </button>

          {/* Документы */}
          <button
            onClick={() => onNavigate('documents_vault')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">ДОКУМЕНТЫ</span>
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Виза, паспорт, здоровье</div>
              <div className="text-xs opacity-75 mt-0.5">Чек-лист документов офлайн</div>
            </div>
          </button>

          {/* Переводчик */}
          <button
            onClick={() => onNavigate('phrasebook')}
            className="p-5 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-black hover:text-white transition-all text-left cursor-pointer min-h-[110px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase opacity-60">ПЕРЕВОДЧИК</span>
              <Languages className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base uppercase">Фразы для сотрудников</div>
              <div className="text-xs opacity-75 mt-0.5">Крупный текст + озвучка</div>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};

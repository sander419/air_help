import React, { useState, useEffect } from 'react';
import { ProblemItem, FlightItinerary } from '../types';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Info,
  User,
  Plane
} from 'lucide-react';

interface EmployeeModeViewProps {
  problem: ProblemItem;
  itinerary: FlightItinerary;
  onBack: () => void;
}

export const EmployeeModeView: React.FC<EmployeeModeViewProps> = ({
  problem,
  itinerary,
  onBack,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const currentLeg = itinerary.legs[itinerary.currentLegIndex] || itinerary.legs[0];

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const handleSpeak = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(problem.employeePhraseEn);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(problem.employeePhraseEn);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div 
      id="employee-mode-container" 
      className="fixed inset-0 z-50 bg-white text-black flex flex-col justify-between p-6 sm:p-10 border-[12px] border-black overflow-y-auto"
    >
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <button
          id="btn-employee-back"
          onClick={onBack}
          className="px-4 py-2 bg-black text-white font-black text-sm uppercase flex items-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
          <span>НАЗАД</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 block">
            РЕЖИМ ПОМОЩИ ПАССАЖИРУ
          </span>
          <span className="text-sm font-mono font-bold text-black uppercase">
            PNR: {itinerary.pnr} • FLIGHT {currentLeg.flightNumber}
          </span>
        </div>
      </div>

      {/* 2. MAIN 32PX ENGLISH PHRASE DISPLAY */}
      <div className="my-auto py-8 space-y-6 max-w-4xl">
        <div className="inline-block px-3 py-1 bg-black text-white font-mono font-bold text-xs uppercase tracking-widest">
          ПОКАЖИТЕ ЭТОТ ЭКРАН СОТРУДНИКУ:
        </div>

        {/* 32px Bold High-Contrast Text */}
        <div className="border-l-8 border-black pl-6 py-2">
          <p 
            id="employee-phrase-text"
            className="text-2xl sm:text-4xl md:text-5xl font-black text-black leading-tight tracking-tight selection:bg-black selection:text-white"
          >
            «{problem.employeePhraseEn}»
          </p>
        </div>

        {/* Russian translation subtitle for passenger */}
        <div className="bg-gray-100 border-2 border-black p-4">
          <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">
            ПЕРЕВОД ДЛЯ ПАССАЖИРА:
          </span>
          <p className="text-sm sm:text-base font-bold text-black">
            {problem.employeePhraseRu}
          </p>
        </div>
      </div>

      {/* 3. BOTTOM ACTION BUTTONS */}
      <div className="space-y-4 pt-4 border-t-4 border-black">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Speak Button */}
          {speechSupported && (
            <button
              id="btn-employee-speak"
              onClick={handleSpeak}
              className={`p-5 border-4 border-black font-black text-lg uppercase flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[64px] active:translate-x-0.5 active:translate-y-0.5 ${
                isSpeaking 
                  ? 'bg-amber-400 text-black animate-pulse' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-6 h-6 stroke-[3]" />
                  <span>ОСТАНОВИТЬ</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-6 h-6 stroke-[3]" />
                  <span>ОЗВУЧИТЬ</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            id="btn-employee-copy"
            onClick={handleCopy}
            className="p-5 border-4 border-black bg-white hover:bg-gray-100 text-black font-black text-lg uppercase flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[64px] active:translate-x-0.5 active:translate-y-0.5"
          >
            {isCopied ? (
              <>
                <Check className="w-6 h-6 text-green-600 stroke-[3]" />
                <span>СКОПИРОВАНО!</span>
              </>
            ) : (
              <>
                <Copy className="w-6 h-6 stroke-[3]" />
                <span>СКОПИРОВАТЬ</span>
              </>
            )}
          </button>
        </div>

        {/* Flight Context Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-600">
          <span>ПАССАЖИР: {itinerary.passengerName}</span>
          <span>АВИАКОМПАНИЯ: {currentLeg.airline} ({currentLeg.flightNumber})</span>
          <span>МАРШРУТ: {currentLeg.fromCode} → {currentLeg.toCode}</span>
          <span>ГЕЙТ: {currentLeg.gate}</span>
        </div>
      </div>
    </div>
  );
};

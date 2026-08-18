import React, { useState } from 'react';
import { 
  FlightItinerary, 
  FlightLeg, 
  ActiveScreen 
} from '../types';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Tag, 
  Check, 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Luggage,
  Sparkles,
  Compass
} from 'lucide-react';

interface FlightDetailsModalProps {
  itinerary: FlightItinerary;
  onUpdateItinerary: (newItinerary: FlightItinerary) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
  itinerary,
  onUpdateItinerary,
  onNavigate
}) => {
  const [savedBaggageTags, setSavedBaggageTags] = useState<string[]>(['TK-894215-IST']);
  const [newTag, setNewTag] = useState('');

  const currentLeg = itinerary.legs[itinerary.currentLegIndex] || itinerary.legs[0];

  const handleSelectLeg = (index: number) => {
    onUpdateItinerary({
      ...itinerary,
      currentLegIndex: index
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !savedBaggageTags.includes(newTag.trim())) {
      setSavedBaggageTags([...savedBaggageTags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div id="flight-details-view" className="space-y-6 pb-12">
      
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              FLIGHT & ITINERARY CONTROLLER
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              МОЙ РЕЙС И СЕГМЕНТЫ
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          PNR: {itinerary.pnr}
        </span>
      </div>

      {/* 1. ROUTE OVERVIEW & LEGS SWITCHER */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 stroke-[2.5] text-black" />
            <span className="text-base font-black uppercase text-black">
              МАРШРУТ: {itinerary.routeTitle}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-gray-600 uppercase">
            {itinerary.legs.length} LEGS CONNECTED
          </span>
        </div>

        {/* Leg Selection Cards */}
        <div className="space-y-4">
          {itinerary.legs.map((leg, idx) => {
            const isCurrent = idx === itinerary.currentLegIndex;
            return (
              <div
                key={leg.id}
                onClick={() => handleSelectLeg(idx)}
                className={`p-6 border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-white text-black border-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border ${
                    isCurrent ? 'bg-[#FFD700] text-black border-black' : 'bg-gray-100 text-black border-black'
                  }`}>
                    LEG 0{idx + 1} {isCurrent && '• ACTIVE'}
                  </span>
                  <span className={`text-xs font-black uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-700'}`}>
                    {leg.airline} • {leg.flightNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter">{leg.fromCode}</p>
                    <p className={`text-xs font-bold uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-600'}`}>
                      {leg.fromCity}
                    </p>
                    <p className="text-xs font-mono font-bold mt-1">DEP: {leg.departureTime}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-mono ${isCurrent ? 'text-gray-400' : 'text-gray-500'}`}>
                      {leg.terminal}
                    </span>
                    <div className={`w-16 h-0.5 relative my-1 ${isCurrent ? 'bg-white' : 'bg-black'}`}>
                      <div className="absolute -top-1.5 right-0 w-3 h-3 border-t-2 border-r-2 rotate-45"></div>
                    </div>
                    <span className={`text-xs font-black uppercase ${isCurrent ? 'text-[#FFD700]' : 'text-black'}`}>
                      GATE {leg.gate}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-black italic tracking-tighter">{leg.toCode}</p>
                    <p className={`text-xs font-bold uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-600'}`}>
                      {leg.toCity}
                    </p>
                    <p className="text-xs font-mono font-bold mt-1">SEAT: {leg.seat}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BAGGAGE TAGS OFFLINE VAULT */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Luggage className="w-5 h-5 stroke-[2.5] text-black" />
            <h2 className="text-base font-black uppercase text-black">
              Багажные бирки (Baggage Claim Tags)
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500">
            OFFLINE SAFE
          </span>
        </div>

        {/* Saved Tags list */}
        <div className="space-y-3">
          {savedBaggageTags.map((tag, tIdx) => (
            <div
              key={tIdx}
              className="bg-white border-2 border-black p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-black stroke-[2.5]" />
                <div>
                  <span className="font-mono text-lg font-black text-black">{tag}</span>
                  <p className="text-xs font-bold text-gray-600">Зарегистрировано 1 место (23 кг) • До {currentLeg.toCode}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1">
                CACHED OFFLINE
              </span>
            </div>
          ))}
        </div>

        {/* Add Tag Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Номер новой бирки (например: TK-123456)"
            className="flex-1 px-4 py-3 bg-white border-2 border-black text-sm font-bold text-black focus:outline-none min-h-[48px]"
          />
          <button
            onClick={handleAddTag}
            className="bg-black text-white font-black text-xs uppercase px-6 py-3 border-2 border-black hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer min-h-[48px] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ДОБАВИТЬ</span>
          </button>
        </div>
      </section>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  FlightItinerary, 
  FlightLeg, 
  ActiveScreen 
} from '../types';
import { AIRPORT_CITIES, AIRPORT_CODES, findAirportByCity } from '../data/airports';
import { 
  Plane, 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Trash2, 
  X,
  Save,
  Check,
  MapPin
} from 'lucide-react';

interface FlightDetailsModalProps {
  itinerary: FlightItinerary;
  onUpdateItinerary: (newItinerary: FlightItinerary) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

const emptyLeg = (): FlightLeg => ({
  id: `leg-${Date.now()}`,
  airline: '',
  flightNumber: '',
  fromCity: '',
  fromCode: '',
  toCity: '',
  toCode: '',
  departureTime: '',
  boardingTime: '',
  terminal: '',
  gate: '',
  seat: '',
  status: 'По расписанию',
  delayMinutes: 0
});

// Пересчитать строку маршрута из списка сегментов
const buildRouteTitle = (legs: FlightLeg[]): string => {
  const points: string[] = [];
  legs.forEach((leg, i) => {
    if (i === 0) points.push(leg.fromCity || leg.fromCode || '?');
    points.push(leg.toCity || leg.toCode || '?');
  });
  return points.join(' → ');
};

// Компактное поле ввода в стиле проекта
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  uppercase?: boolean;
  narrow?: boolean;
  list?: string;
}> = ({ label, value, onChange, placeholder, uppercase, narrow, list }) => (
  <label className="block">
    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      list={list}
      className={`w-full px-3 py-2.5 bg-white border-2 border-black text-base font-bold text-black focus:outline-none focus:bg-gray-50 min-h-[48px] ${
        uppercase ? 'uppercase' : ''
      } ${narrow ? 'max-w-[90px] text-center' : ''}`}
    />
  </label>
);

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
  itinerary,
  onUpdateItinerary,
  onNavigate
}) => {
  const [editingLegIndex, setEditingLegIndex] = useState<number | null>(null);
  const [draftLeg, setDraftLeg] = useState<FlightLeg | null>(null);
  const [savedBaggageTags, setSavedBaggageTags] = useState<string[]>(['TK-894215-IST']);
  const [newTag, setNewTag] = useState('');

  const currentLeg = itinerary.legs[itinerary.currentLegIndex] || itinerary.legs[0];

  const handleSelectLeg = (index: number) => {
    onUpdateItinerary({ ...itinerary, currentLegIndex: index });
  };

  const startEdit = (index: number) => {
    setEditingLegIndex(index);
    setDraftLeg({ ...itinerary.legs[index] });
  };

  const updateField = (key: keyof FlightLeg, value: string) => {
    if (!draftLeg) return;
    setDraftLeg({ ...draftLeg, [key]: value });
  };

  const updateCity = (key: 'from' | 'to', city: string) => {
    if (!draftLeg) return;
    const airport = findAirportByCity(city);
    setDraftLeg((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (key === 'from') {
        next.fromCity = city;
        if (airport) next.fromCode = airport.code;
      } else {
        next.toCity = city;
        if (airport) next.toCode = airport.code;
      }
      return next;
    });
  };

  const saveEdit = () => {
    if (draftLeg && editingLegIndex !== null) {
      const legs = [...itinerary.legs];
      legs[editingLegIndex] = { ...draftLeg, id: itinerary.legs[editingLegIndex].id };
      onUpdateItinerary({
        ...itinerary,
        legs,
        routeTitle: buildRouteTitle(legs)
      });
    }
    setEditingLegIndex(null);
    setDraftLeg(null);
  };

  const cancelEdit = () => {
    setEditingLegIndex(null);
    setDraftLeg(null);
  };

  const addLeg = () => {
    const newLeg = emptyLeg();
    const legs = [...itinerary.legs, newLeg];
    onUpdateItinerary({
      ...itinerary,
      legs,
      currentLegIndex: legs.length - 1,
      routeTitle: buildRouteTitle(legs)
    });
    setEditingLegIndex(legs.length - 1);
    setDraftLeg(newLeg);
  };

  const removeLeg = (index: number) => {
    if (itinerary.legs.length <= 1) return;
    const legs = itinerary.legs.filter((_, i) => i !== index);
    onUpdateItinerary({
      ...itinerary,
      legs,
      currentLegIndex: Math.min(itinerary.currentLegIndex, legs.length - 1),
      routeTitle: buildRouteTitle(legs)
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
      <datalist id="airport-cities">
        {AIRPORT_CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
      <datalist id="airport-codes">
        {AIRPORT_CODES.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>
      
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              МОЙ РЕЙС
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              МАРШРУТ И ПЕРЕСАДКИ
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          PNR: {itinerary.pnr}
        </span>
      </div>

      {/* 1. ROUTE & EDITABLE LEGS */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 stroke-[2.5] text-black" />
            <span className="text-base font-black uppercase text-black">
              {itinerary.routeTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500">
            ТАПНИ СЕГМЕНТ, ЧТОБЫ СДЕЛАТЬ АКТИВНЫМ
          </span>
        </div>

        {/* Leg cards */}
        <div className="space-y-4">
          {itinerary.legs.map((leg, idx) => {
            const isCurrent = idx === itinerary.currentLegIndex;
            const isEditing = idx === editingLegIndex;

            if (isEditing && draftLeg) {
              return (
                <div key={leg.id} className="p-6 border-2 border-black bg-[#FFD700] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-black uppercase bg-black text-white px-2 py-0.5">
                      РЕДАКТИРОВАНИЕ СЕГМЕНТА {idx + 1}
                    </span>
                    <button
                      onClick={cancelEdit}
                      className="w-9 h-9 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      aria-label="Отмена"
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Откуда / Куда */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Field label="Откуда — город (выберите из списка)" value={draftLeg.fromCity} onChange={(v) => updateCity('from', v)} placeholder="Начните вводить город" list="airport-cities" />
                      <Field label="Код аэропорта" value={draftLeg.fromCode} onChange={(v) => updateField('fromCode', v.toUpperCase())} placeholder="SVO" uppercase narrow list="airport-codes" />
                    </div>
                    <div className="space-y-3">
                      <Field label="Куда — город (выберите из списка)" value={draftLeg.toCity} onChange={(v) => updateCity('to', v)} placeholder="Начните вводить город" list="airport-cities" />
                      <Field label="Код аэропорта" value={draftLeg.toCode} onChange={(v) => updateField('toCode', v.toUpperCase())} placeholder="IST" uppercase narrow list="airport-codes" />
                    </div>
                  </div>

                  {/* Рейс и время */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Field label="Авиакомпания" value={draftLeg.airline} onChange={(v) => updateField('airline', v)} placeholder="Turkish Airlines" />
                    <Field label="Рейс" value={draftLeg.flightNumber} onChange={(v) => updateField('flightNumber', v.toUpperCase())} placeholder="TK 414" uppercase />
                    <Field label="Вылет" value={draftLeg.departureTime} onChange={(v) => updateField('departureTime', v)} placeholder="13:45" />
                    <Field label="Посадка" value={draftLeg.boardingTime} onChange={(v) => updateField('boardingTime', v)} placeholder="13:05" />
                  </div>

                  {/* Терминал / Гейт / Место */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Терминал" value={draftLeg.terminal} onChange={(v) => updateField('terminal', v)} placeholder="Terminal A" />
                    <Field label="Гейт" value={draftLeg.gate} onChange={(v) => updateField('gate', v)} placeholder="22B" />
                    <Field label="Место" value={draftLeg.seat} onChange={(v) => updateField('seat', v.toUpperCase())} placeholder="14A" uppercase />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-black text-white font-black text-sm uppercase px-4 py-3.5 border-2 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
                    >
                      <Save className="w-5 h-5 stroke-[2.5]" />
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-white text-black font-black text-sm uppercase px-6 py-3.5 border-2 border-black hover:bg-gray-100 transition-colors cursor-pointer min-h-[52px]"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              );
            }

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
                    СЕГМЕНТ 0{idx + 1} {isCurrent && '• АКТИВНЫЙ'}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(idx)}
                      className="px-3 py-1.5 border-2 border-black bg-white text-black text-[11px] font-black uppercase flex items-center gap-1.5 hover:bg-black hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                      Изменить
                    </button>
                    {itinerary.legs.length > 1 && (
                      <button
                        onClick={() => removeLeg(idx)}
                        className="px-3 py-1.5 border-2 border-red-600 bg-white text-red-600 text-[11px] font-black uppercase flex items-center gap-1.5 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        aria-label="Удалить сегмент"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter">{leg.fromCode || '—'}</p>
                    <p className={`text-xs font-bold uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-600'}`}>
                      {leg.fromCity || '—'}
                    </p>
                    <p className="text-xs font-mono font-bold mt-1">ВЫЛЕТ: {leg.departureTime || '—'}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-mono ${isCurrent ? 'text-gray-400' : 'text-gray-500'}`}>
                      {leg.terminal || '—'}
                    </span>
                    <div className={`w-16 h-0.5 relative my-1 ${isCurrent ? 'bg-white' : 'bg-black'}`}>
                      <div className="absolute -top-1.5 right-0 w-3 h-3 border-t-2 border-r-2 rotate-45"></div>
                    </div>
                    <span className={`text-xs font-black uppercase ${isCurrent ? 'text-[#FFD700]' : 'text-black'}`}>
                      {leg.gate ? `GATE ${leg.gate}` : '—'}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-black italic tracking-tighter">{leg.toCode || '—'}</p>
                    <p className={`text-xs font-bold uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-600'}`}>
                      {leg.toCity || '—'}
                    </p>
                    <p className="text-xs font-mono font-bold mt-1">{leg.seat ? `МЕСТО: ${leg.seat}` : '—'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add leg */}
        <button
          onClick={addLeg}
          className="w-full p-4 border-2 border-dashed border-black bg-white text-black font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          Добавить пересадку
        </button>
      </section>

      {/* 2. BAGGAGE TAGS */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 stroke-[2.5] text-black" />
            <h2 className="text-base font-black uppercase text-black">
              Багажные бирки (Baggage Claim Tags)
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-gray-500">
            OFFLINE SAFE
          </span>
        </div>

        <div className="space-y-3">
          {savedBaggageTags.map((tag, tIdx) => (
            <div
              key={tIdx}
              className="bg-white border-2 border-black p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-black stroke-[2.5]" />
                <div>
                  <span className="font-mono text-lg font-black text-black">{tag}</span>
                  <p className="text-xs font-bold text-gray-600">Зарегистрировано • До {currentLeg.toCode || '—'}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1">
                CACHED OFFLINE
              </span>
            </div>
          ))}
        </div>

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

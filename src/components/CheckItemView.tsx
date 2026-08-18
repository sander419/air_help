import React, { useState, useMemo } from 'react';
import { 
  BatteryCharging, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Luggage, 
  Backpack, 
  Info, 
  Zap,
  Check,
  X
} from 'lucide-react';
import { COMMON_ITEMS_DATABASE, calculateBatteryWh, BatteryCalculationResult } from '../data/itemsData';
import { ItemCheckRule, ActiveScreen } from '../types';

interface CheckItemViewProps {
  onNavigate: (screen: ActiveScreen) => void;
}

export const CheckItemView: React.FC<CheckItemViewProps> = ({ onNavigate }) => {
  // Battery Calculator State
  const [mahInput, setMahInput] = useState<string>('20000');
  const [voltageInput, setVoltageInput] = useState<string>('3.7');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mahNumber = parseFloat(mahInput) || 0;
  const voltageNumber = parseFloat(voltageInput) || 3.7;

  // Deterministic calculation: Wh = mAh * V / 1000
  const batteryResult: BatteryCalculationResult = useMemo(() => {
    return calculateBatteryWh(mahNumber, voltageNumber);
  }, [mahNumber, voltageNumber]);

  // Common powerbank presets
  const presets = [
    { label: '5,000 mAh', mah: '5000', v: '3.7' },
    { label: '10,000 mAh', mah: '10000', v: '3.7' },
    { label: '20,000 mAh', mah: '20000', v: '3.7' },
    { label: '26,800 mAh (Лимит 99Wh)', mah: '26800', v: '3.7' },
    { label: '30,000 mAh (111Wh)', mah: '30000', v: '3.7' },
    { label: '50,000 mAh (185Wh)', mah: '50000', v: '3.7' },
  ];

  // Filter items database
  const filteredItems = useMemo(() => {
    return COMMON_ITEMS_DATABASE.filter(item => {
      const matchesSearch = 
        itemSearch.trim() === '' ||
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.conditionText.toLowerCase().includes(itemSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [itemSearch, selectedCategory]);

  const isAllowed = batteryResult.verdict === 'allowed_carry_on_only';
  const isConditional = batteryResult.verdict === 'airline_permission_required';
  const isForbidden = batteryResult.verdict === 'forbidden';

  return (
    <div id="check-item-view" className="space-y-6 pb-12">
      
      {/* Header */}
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
              ICAO / FAA AIRLINE SECURITY RULES
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              ПРОВЕРКА ПРЕДМЕТОВ И БАТАРЕЙ
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          DOC 9284 / IATA
        </span>
      </div>

      {/* 1. POWERBANK & BATTERY CALCULATOR (Wh = mAh × V / 1000) */}
      <section 
        id="battery-calculator-section" 
        className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 stroke-[3] text-black" />
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              Калькулятор мощности повербанков
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-600">
            Wh = mAh × V / 1000
          </span>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Ёмкость аккумулятора (mAh)
            </label>
            <input
              id="input-battery-mah"
              type="number"
              min="0"
              max="500000"
              step="100"
              value={mahInput}
              onChange={(e) => setMahInput(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black text-xl font-black text-black focus:outline-none min-h-[52px]"
              placeholder="20000"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Напряжение ячеек (V) — стандарт 3.7V
            </label>
            <input
              id="input-battery-voltage"
              type="number"
              min="0.1"
              max="48"
              step="0.1"
              value={voltageInput}
              onChange={(e) => setVoltageInput(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black text-xl font-black text-black focus:outline-none min-h-[52px]"
              placeholder="3.7"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
            БЫСТРЫЙ ВЫБОР ПОПУЛЯРНЫХ МОДЕЛЕЙ:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, pIdx) => (
              <button
                key={pIdx}
                onClick={() => {
                  setMahInput(preset.mah);
                  setVoltageInput(preset.v);
                }}
                className={`px-3.5 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                  mahInput === preset.mah
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result & Verdict Box */}
        <div 
          id="battery-calculation-verdict" 
          className={`p-6 border-4 space-y-4 ${
            isAllowed 
              ? 'border-black bg-white text-black' 
              : isConditional 
              ? 'border-black bg-[#FFD700] text-black' 
              : 'border-red-600 bg-white text-red-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/20 pb-4">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                VERDICT PROTOCOL
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1.5 leading-tight">
                {batteryResult.verdictTitle}
              </h3>
            </div>

            {/* Big Computed Wh Number */}
            <div className="bg-black text-white p-4 border-2 border-black text-left sm:text-right shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">
                COMPUTED POWER
              </span>
              <span className="text-4xl sm:text-5xl font-black tabular-nums">
                {batteryResult.wh} <span className="text-xl font-bold">Wh</span>
              </span>
            </div>
          </div>

          {/* Luggage vs Carry-on Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-black bg-white space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
                CARRY-ON / РУЧНАЯ КЛАДЬ
              </span>
              <p className="text-sm font-bold text-black">{batteryResult.carryOnRule}</p>
              <p className="text-xs font-mono font-bold text-gray-600 mt-1">Лимит: {batteryResult.maxQuantity}</p>
            </div>

            <div className="p-4 border-2 border-black bg-white space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">
                CHECKED BAGGAGE / СДАННЫЙ БАГАЖ
              </span>
              <p className="text-sm font-black text-red-600">{batteryResult.checkedRule}</p>
            </div>
          </div>

          {/* Source Box */}
          <div className="text-[11px] font-bold text-gray-700 flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-black/10">
            <span>Источник: <strong>{batteryResult.sourceText}</strong></span>
            <span>Стандарт: <code className="font-mono bg-black/10 px-1">{batteryResult.ruleCode}</code></span>
            <span>Проверено: {batteryResult.checkedDate}</span>
          </div>
        </div>
      </section>

      {/* 2. AIRPORT ITEMS RULES DIRECTORY */}
      <section id="items-directory-section" className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h2 className="text-sm font-black text-black uppercase tracking-wider">
            БАЗА ПРАВИЛ ДЛЯ ДРУГИХ ПРЕДМЕТОВ
          </h2>
          <span className="text-xs font-mono font-bold text-gray-500 uppercase">
            {filteredItems.length} ITEMS
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            id="items-search-input"
            type="text"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            placeholder="Поиск: ножницы, духи, вейп, лекарства, дрон..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-black text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none min-h-[48px]"
          />
          {itemSearch && (
            <button
              onClick={() => setItemSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:opacity-60 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Все' },
            { id: 'electronics', label: 'Электроника' },
            { id: 'liquids', label: 'Жидкости (100 мл)' },
            { id: 'meds', label: 'Медикаменты' },
            { id: 'dangerous', label: 'Острые/Опасные' },
            { id: 'food', label: 'Еда / Дети' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 border-2 border-black text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                selectedCategory === cat.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white border-2 border-black p-5 space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2">
                <h3 className="text-base font-black uppercase text-black">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 border text-xs font-black uppercase ${
                    item.carryOnAllowed === 'yes' ? 'bg-black text-white border-black' :
                    item.carryOnAllowed === 'no' ? 'bg-red-600 text-white border-red-600' :
                    'bg-amber-400 text-black border-black'
                  }`}>
                    Ручная: {item.carryOnAllowed === 'yes' ? 'МОЖНО' : item.carryOnAllowed === 'no' ? 'НЕЛЬЗЯ' : 'УСЛОВИЕ'}
                  </span>

                  <span className={`px-2 py-0.5 border text-xs font-black uppercase ${
                    item.checkedAllowed === 'yes' ? 'bg-black text-white border-black' :
                    item.checkedAllowed === 'no' ? 'bg-red-600 text-white border-red-600' :
                    'bg-amber-400 text-black border-black'
                  }`}>
                    Багаж: {item.checkedAllowed === 'yes' ? 'МОЖНО' : item.checkedAllowed === 'no' ? 'НЕЛЬЗЯ' : 'УСЛОВИЕ'}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-black font-bold leading-relaxed">
                {item.conditionText}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                <span>ИСТОЧНИК: {item.source}</span>
                <span>ПРОВЕРЕНО: {item.checkedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  ArrowLeft, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ChevronRight, 
  X,
  Filter
} from 'lucide-react';
import { ProblemCategory, ProblemItem, ActiveScreen } from '../types';
import { PROBLEMS_DATA } from '../data/problemsData';

export const CATEGORIES_LIST: { id: ProblemCategory; title: string }[] = [
  { id: 'flight', title: 'РЕЙС' },
  { id: 'baggage', title: 'БАГАЖ' },
  { id: 'documents', title: 'ДОКУМЕНТЫ' },
  { id: 'security', title: 'БЕЗОПАСНОСТЬ' },
  { id: 'communication', title: 'КОММУНИКАЦИЯ' },
];

interface ProblemCategoriesViewProps {
  onSelectProblem: (problem: ProblemItem) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ProblemCategoriesView: React.FC<ProblemCategoriesViewProps> = ({
  onSelectProblem,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'all'>('all');

  const filteredProblems = PROBLEMS_DATA.filter(item => {
    const matchesSearch = 
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeePhraseEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="problem-categories-view" className="space-y-6 pb-12">
      
      {/* Header & Back Button */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              26 СЦЕНАРИЕВ ПРОБЛЕМ
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              ВЫБЕРИТЕ ПРОБЛЕМУ
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          {filteredProblems.length} ГОТОВО
        </span>
      </div>

      {/* 1. SEARCH INPUT (Geometric High-Contrast) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black">
          <Search className="w-5 h-5 stroke-[2.5]" />
        </div>
        <input
          id="problem-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск проблемы: отмена рейса, потеря багажа, SSSS, виза..."
          className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-black text-base font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-white min-h-[52px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:opacity-60 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* 2. CATEGORY SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 border-2 border-black text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
            selectedCategory === 'all'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          ВСЕ ({PROBLEMS_DATA.length})
        </button>

        {CATEGORIES_LIST.map(cat => {
          const count = PROBLEMS_DATA.filter(p => p.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 border-2 border-black text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                isSelected
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. PROBLEM LIST BUTTONS (Geometric Touch Cards) */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="p-8 border-2 border-black bg-white text-center space-y-3">
            <AlertOctagon className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-base font-black uppercase text-black">
              Ничего не найдено по запросу «{searchQuery}»
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 bg-black text-white font-bold text-xs uppercase"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filteredProblems.map(problem => {
            const isHigh = problem.severity === 'high';
            const isWarning = problem.severity === 'warning';

            return (
              <button
                key={problem.id}
                id={`problem-card-${problem.id}`}
                onClick={() => onSelectProblem(problem)}
                className="w-full p-5 border-2 border-black bg-white hover:bg-black hover:text-white transition-all text-left flex items-start justify-between gap-4 cursor-pointer group min-h-[84px] shadow-xs active:translate-x-0.5 active:translate-y-0.5"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border ${
                      isHigh
                        ? 'bg-red-600 text-white border-red-600'
                        : isWarning
                        ? 'bg-amber-400 text-black border-black'
                        : 'bg-gray-200 text-black border-black'
                    }`}>
                      {problem.severityLabel}
                    </span>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300">
                      ПРАВИЛО: {problem.source.ruleCode}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight leading-snug">
                    {problem.title}
                  </h3>

                  <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-300 leading-relaxed">
                    {problem.shortDesc}
                  </p>
                </div>

                <div className="pt-2 shrink-0">
                  <div className="w-8 h-8 border-2 border-black group-hover:border-white flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
};

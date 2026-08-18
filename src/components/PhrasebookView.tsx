import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ArrowLeft, 
  Search, 
  Maximize2, 
  Languages,
  ShieldCheck
} from 'lucide-react';
import { ActiveScreen, ProblemItem } from '../types';

interface PhraseItem {
  id: string;
  category: 'checkin' | 'security' | 'customs' | 'lost' | 'medical' | 'transit';
  categoryLabel: string;
  en: string;
  ru: string;
}

const PHRASES: PhraseItem[] = [
  {
    id: 'p1',
    category: 'checkin',
    categoryLabel: 'Регистрация',
    en: 'Could I please have a window seat / aisle seat if available?',
    ru: 'Можно мне, пожалуйста, место у окна / у прохода, если есть?'
  },
  {
    id: 'p2',
    category: 'checkin',
    categoryLabel: 'Регистрация',
    en: 'Will my luggage be checked all the way through to my final destination?',
    ru: 'Мой багаж будет зарегистрирован сразу до конечного пункта назначения?'
  },
  {
    id: 'p3',
    category: 'security',
    categoryLabel: 'Досмотр (Security)',
    en: 'I have a medical condition and a pacemaker / metal implant in my body.',
    ru: 'У меня медицинские показания: установлен кардиостимулятор / металлический имплант.'
  },
  {
    id: 'p4',
    category: 'security',
    categoryLabel: 'Досмотр (Security)',
    en: 'These are essential prescribed medications and baby food. Here is the doctor letter.',
    ru: 'Это жизненно важные рецептурные лекарства и детское питание. Вот справка врача.'
  },
  {
    id: 'p5',
    category: 'customs',
    categoryLabel: 'Граница / Паспортный',
    en: 'I am traveling for tourism / business for 10 days. Here is my return flight and hotel booking.',
    ru: 'Я путешествую с целью туризма / бизнеса на 10 дней. Вот мой обратный билет и бронь отеля.'
  },
  {
    id: 'p6',
    category: 'lost',
    categoryLabel: 'Багаж / Lost & Found',
    en: 'My suitcase did not arrive. I need to file a Property Irregularity Report (PIR).',
    ru: 'Мой чемодан не прибыл. Мне нужно составить акт о неприбытии багажа (PIR).'
  },
  {
    id: 'p7',
    category: 'medical',
    categoryLabel: 'Экстренная помощь',
    en: 'I need immediate medical assistance. Please call the airport first aid doctor.',
    ru: 'Мне срочно нужна медицинская помощь. Вызовите, пожалуйста, врача аэропорта.'
  },
  {
    id: 'p8',
    category: 'transit',
    categoryLabel: 'Транзит / Стыковка',
    en: 'My connecting flight is in 30 minutes. Where is the express security lane for tight connections?',
    ru: 'Моя пересадка через 30 минут. Где экспресс-коридор досмотра для коротких стыковок?'
  }
];

export const PhrasebookView: React.FC<{
  onNavigate: (screen: ActiveScreen) => void;
  onShowEmployeeMode: (problem: ProblemItem) => void;
}> = ({ onNavigate, onShowEmployeeMode }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPhrases = PHRASES.filter(p => {
    const matchesSearch = 
      search.trim() === '' ||
      p.en.toLowerCase().includes(search.toLowerCase()) ||
      p.ru.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const speakPhrase = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  };

  const copyPhrase = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openFullscreenForPhrase = (phrase: PhraseItem) => {
    const syntheticProblem: ProblemItem = {
      id: phrase.id,
      category: 'communication',
      title: phrase.categoryLabel,
      shortDesc: phrase.ru,
      severity: 'info',
      severityLabel: 'РАЗГОВОРНИК',
      immediateSteps: ['Покажите экран сотруднику', 'Включите озвучивание при необходимости', 'Ожидайте ответ'],
      doNotDo: ['Не стесняйтесь переспросить'],
      employeePhraseEn: phrase.en,
      employeePhraseRu: phrase.ru,
      nextActions: { title: 'Информация', content: ['Фраза составлена в соответствии с международным стандартом ICAO.'] },
      source: {
        name: 'ICAO Standard Phraseology',
        ruleCode: 'ICAO Doc 9835',
        checkedDate: '15.08.2026',
        confidenceLevel: 'Стандартная практика аэропортов'
      }
    };
    onShowEmployeeMode(syntheticProblem);
  };

  return (
    <div id="phrasebook-view" className="space-y-6 pb-12">
      
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
              ICAO AIRPORT PHRASEOLOGY
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              РАЗГОВОРНИК ДЛЯ ПЕРСОНАЛА
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          DOC 9835
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Все фразы' },
          { id: 'checkin', label: 'Регистрация' },
          { id: 'security', label: 'Досмотр' },
          { id: 'customs', label: 'Паспортный' },
          { id: 'lost', label: 'Багаж' },
          { id: 'medical', label: 'Медицина' },
          { id: 'transit', label: 'Транзит' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3.5 py-1.5 border-2 border-black text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
              selectedCat === cat.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Phrases Cards List */}
      <div className="space-y-4">
        {filteredPhrases.map(phrase => {
          const isSpeaking = speakingId === phrase.id;
          const isCopied = copiedId === phrase.id;

          return (
            <div
              key={phrase.id}
              className="bg-white border-2 border-black p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-gray-100 text-black border border-black px-2 py-0.5">
                  {phrase.categoryLabel}
                </span>

                <button
                  onClick={() => openFullscreenForPhrase(phrase)}
                  className="text-xs font-black uppercase text-black hover:bg-black hover:text-white px-3 py-1 border-2 border-black flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Открыть во весь экран 32px для показа сотруднику"
                >
                  <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>32PX MODE</span>
                </button>
              </div>

              {/* English Phrase */}
              <p className="text-xl sm:text-2xl font-black text-black leading-snug tracking-tight">
                «{phrase.en}»
              </p>

              {/* Russian Translation */}
              <p className="text-sm font-bold text-gray-700">
                {phrase.ru}
              </p>

              {/* Actions (Speak / Copy) */}
              <div className="flex items-center gap-3 pt-2 border-t-2 border-black">
                <button
                  onClick={() => isSpeaking ? stopSpeech() : speakPhrase(phrase.id, phrase.en)}
                  className={`px-5 py-3 border-2 border-black text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer min-h-[48px] ${
                    isSpeaking 
                      ? 'bg-[#FFD700] text-black animate-pulse'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSpeaking ? 'ОСТАНОВИТЬ' : 'ОЗВУЧИТЬ'}</span>
                </button>

                <button
                  onClick={() => copyPhrase(phrase.id, phrase.en)}
                  className="px-5 py-3 border-2 border-black bg-white hover:bg-gray-100 text-black font-black text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer min-h-[48px]"
                >
                  {isCopied ? <Check className="w-4 h-4 stroke-[3] text-green-600" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                  <span>{isCopied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

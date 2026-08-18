import React from 'react';
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  User,
  ShieldCheck
} from 'lucide-react';
import { ActiveScreen } from '../types';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  lastSyncDate: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  isOffline,
  onToggleOffline,
  lastSyncDate
}) => {
  const isDashboard = currentScreen === 'dashboard';

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'what_now': return 'WHAT NOW / ЧТО ДЕЛАТЬ';
      case 'problem_categories': return 'PROBLEM CATEGORIES / ПРОБЛЕМЫ';
      case 'problem_detail': return 'ACTION PROTOCOL / РЕШЕНИЕ';
      case 'employee_mode': return 'STAFF VIEW / ДЛЯ СОТРУДНИКА';
      case 'check_item': return 'ITEM & BATTERY CHECK / ПРОВЕРКА';
      case 'flight_details': return 'FLIGHT ROUTE / МАРШРУТ';
      case 'documents_vault': return 'TRAVEL DOCUMENTS / ДОКУМЕНТЫ';
      case 'phrasebook': return 'KEY PHRASES / РАЗГОВОРНИК';
      default: return 'AIRPORT COPILOT';
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b-2 border-black text-black">
      {/* Top Status Strip */}
      <div className="bg-black text-white px-4 sm:px-8 py-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest flex items-center justify-between uppercase">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
          <span>
            {isOffline ? 'OFFLINE MODE • DATA CACHED' : 'ONLINE • LIVE DATA'}
          </span>
          <span className="hidden sm:inline text-gray-400">
            [VERIFIED: {lastSyncDate}]
          </span>
        </div>

        <button
          id="offline-toggle-btn"
          onClick={onToggleOffline}
          className="text-gray-300 hover:text-white border border-gray-700 hover:border-white px-2 py-0.5 flex items-center gap-1.5 transition-colors cursor-pointer text-[10px] uppercase font-bold"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isOffline ? 'GO ONLINE' : 'TEST OFFLINE'}</span>
        </button>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {!isDashboard && (
            <button
              id="header-back-btn"
              onClick={() => {
                if (currentScreen === 'problem_detail') {
                  onNavigate('problem_categories');
                } else {
                  onNavigate('dashboard');
                }
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Назад"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          <div 
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer select-none"
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
              {isDashboard ? 'AIRPORT COPILOT' : getScreenTitle()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                OFFLINE-FIRST • VERIFIED SOURCES
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex px-3.5 py-1.5 border-2 border-black font-bold text-xs uppercase bg-white">
            <span>SVO / IST / BER</span>
          </div>

          <button
            onClick={() => onNavigate('check_item')}
            className={`px-3 sm:px-4 py-2 border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
              currentScreen === 'check_item'
                ? 'bg-black text-white'
                : 'bg-white hover:bg-gray-100 text-black'
            }`}
          >
            WH CHECK
          </button>
        </div>
      </div>
    </header>
  );
};

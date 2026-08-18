/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  StageId, 
  ProblemItem, 
  FlightItinerary, 
  ActiveScreen 
} from './types';
import { STAGES_LIST } from './data/stagesData';
import { PROBLEMS_DATA } from './data/problemsData';
import { INITIAL_ITINERARY } from './data/itemsData';

import { 
  Plane, 
  HelpCircle, 
  AlertTriangle, 
  BatteryCharging,
  FileText
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WhatNowView } from './components/WhatNowView';
import { ProblemCategoriesView } from './components/ProblemCategoriesView';
import { ProblemDetailView } from './components/ProblemDetailView';
import { EmployeeModeView } from './components/EmployeeModeView';
import { CheckItemView } from './components/CheckItemView';
import { FlightDetailsModal } from './components/FlightDetailsModal';
import { DocumentsVaultView } from './components/DocumentsVaultView';
import { PhrasebookView } from './components/PhrasebookView';

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  
  // Passenger Journey Stage State (6 stages)
  const [activeStageId, setActiveStageId] = useState<StageId>('check_in');
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(
    new Set<StageId>(['airport_arrival'])
  );

  // Selected Problem
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);

  // Flight Itinerary (persisted in localStorage)
  const [itinerary, setItinerary] = useLocalStorage<FlightItinerary>('airport-copilot-itinerary', INITIAL_ITINERARY);

  // Offline-First status
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncDate] = useState<string>('18.08.2026, 11:00');

  // Monitor real browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const handleSelectStage = (stageId: StageId) => {
    setActiveStageId(stageId);
  };

  const handleToggleCompleteStage = (stageId: StageId) => {
    setCompletedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const handleSelectProblem = (problem: ProblemItem) => {
    setSelectedProblem(problem);
    setCurrentScreen('problem_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEmployeeMode = (problem: ProblemItem) => {
    setSelectedProblem(problem);
    setCurrentScreen('employee_mode');
  };

  const handleNavigate = (screen: ActiveScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-200 text-black font-sans antialiased selection:bg-black selection:text-white flex flex-col justify-between">
      {/* Outer Shell with Geometric Borders */}
      <div className={`w-full ${currentScreen === 'employee_mode' ? '' : 'max-w-5xl mx-auto bg-white border-x-2 border-black min-h-screen flex flex-col justify-between shadow-2xl'}`}>
        
        <div>
          {/* Universal Sticky Header (hidden in full-screen pure white Employee Mode) */}
          {currentScreen !== 'employee_mode' && (
            <Header
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              isOffline={isOffline}
              onToggleOffline={handleToggleOffline}
              lastSyncDate={lastSyncDate}
              itinerary={itinerary}
            />
          )}

          {/* Main Content Area */}
          <main className={`flex-1 w-full ${currentScreen === 'employee_mode' ? 'p-0' : 'p-4 sm:p-8'}`}>
            
            {/* Screen 1: Dashboard */}
            {currentScreen === 'dashboard' && (
              <DashboardView
                itinerary={itinerary}
                activeStageId={activeStageId}
                completedStages={completedStages}
                onSelectStage={handleSelectStage}
                onNavigate={handleNavigate}
                onOpenLegSwitcher={() => handleNavigate('flight_details')}
              />
            )}

            {/* Screen 2: What Now? */}
            {currentScreen === 'what_now' && (
              <WhatNowView
                activeStageId={activeStageId}
                completedStages={completedStages}
                onSelectStage={handleSelectStage}
                onToggleCompleteStage={handleToggleCompleteStage}
                onNavigate={handleNavigate}
              />
            )}

            {/* Screen 3: Problem Categories (26 Scenarios) */}
            {currentScreen === 'problem_categories' && (
              <ProblemCategoriesView
                onSelectProblem={handleSelectProblem}
                onNavigate={handleNavigate}
              />
            )}

            {/* Screen 4: Problem Detail */}
            {currentScreen === 'problem_detail' && selectedProblem && (
              <ProblemDetailView
                problem={selectedProblem}
                onNavigate={handleNavigate}
                onOpenEmployeeMode={handleOpenEmployeeMode}
              />
            )}

            {/* Screen 5: Employee Mode (White screen 32px English text + Voice) */}
            {currentScreen === 'employee_mode' && selectedProblem && (
              <EmployeeModeView
                problem={selectedProblem}
                itinerary={itinerary}
                onBack={() => setCurrentScreen('problem_detail')}
              />
            )}

            {/* Screen 6: Check Item (Wh calculator + luggage rules) */}
            {currentScreen === 'check_item' && (
              <CheckItemView
                onNavigate={handleNavigate}
              />
            )}

            {/* Additional Supporting Views */}
            {currentScreen === 'flight_details' && (
              <FlightDetailsModal
                itinerary={itinerary}
                onUpdateItinerary={setItinerary}
                onNavigate={handleNavigate}
              />
            )}

            {currentScreen === 'documents_vault' && (
              <DocumentsVaultView
                onNavigate={handleNavigate}
              />
            )}

            {currentScreen === 'phrasebook' && (
              <PhrasebookView
                onNavigate={handleNavigate}
                onShowEmployeeMode={handleOpenEmployeeMode}
              />
            )}

          </main>
        </div>

        {/* Geometric Balance Footer metadata bar */}
        {currentScreen !== 'employee_mode' && (
          <footer className="bg-black text-white px-4 sm:px-8 py-3 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest gap-2">
            <span>{isOffline ? 'OFFLINE MODE' : 'ONLINE'}</span>
            <span>LAST SYNC: {lastSyncDate}</span>
            <span>AIRPORT COPILOT • OFFLINE-FIRST</span>
          </footer>
        )}

      </div>

      {/* Persistent Bottom Bar for Mobile Quick Jump (when not in employee mode) */}
      {currentScreen !== 'employee_mode' && (
        <nav id="mobile-bottom-nav" className="sticky bottom-0 z-40 bg-white border-t-2 border-black py-2 px-3 sm:hidden">
          <div className="flex items-center justify-around">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-3 border border-transparent text-[11px] font-black uppercase transition-colors cursor-pointer min-h-[48px] ${
                currentScreen === 'dashboard' ? 'bg-black text-white' : 'text-black'
              }`}
            >
              <Plane className="w-5 h-5 mb-0.5" />
              <span>Главная</span>
            </button>

            <button
              onClick={() => handleNavigate('what_now')}
              className={`flex flex-col items-center justify-center py-1 px-3 border border-transparent text-[11px] font-black uppercase transition-colors cursor-pointer min-h-[48px] ${
                currentScreen === 'what_now' ? 'bg-black text-white' : 'text-black'
              }`}
            >
              <HelpCircle className="w-5 h-5 mb-0.5" />
              <span>Что делать</span>
            </button>

            <button
              onClick={() => handleNavigate('problem_categories')}
              className={`flex flex-col items-center justify-center py-1 px-3 border-2 border-red-600 text-[11px] font-black uppercase transition-colors cursor-pointer min-h-[48px] ${
                currentScreen === 'problem_categories' || currentScreen === 'problem_detail' ? 'bg-red-600 text-white' : 'text-red-600 bg-red-50'
              }`}
            >
              <AlertTriangle className="w-5 h-5 mb-0.5" />
              <span>Проблема</span>
            </button>

            <button
              onClick={() => handleNavigate('check_item')}
              className={`flex flex-col items-center justify-center py-1 px-3 border border-transparent text-[11px] font-black uppercase transition-colors cursor-pointer min-h-[48px] ${
                currentScreen === 'check_item' ? 'bg-black text-white' : 'text-black'
              }`}
            >
              <BatteryCharging className="w-5 h-5 mb-0.5" />
              <span>Батареи</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

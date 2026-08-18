import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard, WhatNow, ProblemCategories, ProblemDetail, EmployeeMode } from './components/Screens.jsx';
import { CheckItem } from './components/CheckItem.jsx';

// Моковые данные для демонстрации
const mockTrip = {
  id: '1',
  route: 'Москва → Стамбул → Берлин',
  airline: 'Turkish Airlines',
  flightNumber: 'TK412',
  departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  currentStage: 'security',
  stages: [
    { id: 'airport', name: 'Аэропорт', completed: true },
    { id: 'checkin', name: 'Регистрация', completed: true },
    { id: 'security', name: 'Security', completed: false, current: true },
    { id: 'passport', name: 'Паспортный контроль', completed: false },
    { id: 'gate', name: 'Gate', completed: false },
    { id: 'boarding', name: 'Посадка', completed: false }
  ]
};

function AppContent() {
  const { currentTrip, setCurrentTrip, isOffline, lastSync } = useApp();
  const [currentScreen, setCurrentScreen] = React.useState('dashboard');
  const [selectedProblem, setSelectedProblem] = React.useState(null);
  
  React.useEffect(() => {
    if (!currentTrip) {
      setCurrentTrip(mockTrip);
    }
  }, [currentTrip, setCurrentTrip]);
  
  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setCurrentScreen('problemDetail');
  };
  
  const handleShowEmployee = (phrase) => {
    setSelectedProblem({ ...selectedProblem, phrase });
    setCurrentScreen('employeeMode');
  };

  return (
    <div className="app-container">
      {/* Офлайн-индикатор */}
      {isOffline && (
        <div style={{
          background: '#ff9800',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Офлайн-режим • Данные обновлены: {lastSync ? new Date(lastSync).toLocaleString() : 'неизвестно'}
        </div>
      )}
      
      {currentScreen === 'dashboard' && (
        <Dashboard 
          onNavigate={setCurrentScreen}
          onSelectProblem={handleSelectProblem}
        />
      )}
      
      {currentScreen === 'whatNow' && (
        <WhatNow onBack={() => setCurrentScreen('dashboard')} />
      )}
      
      {currentScreen === 'problemCategories' && (
        <ProblemCategories 
          onSelectCategory={(category) => {
            setSelectedProblem({ category });
            setCurrentScreen('problemDetail');
          }}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}
      
      {currentScreen === 'problemDetail' && (
        <ProblemDetail 
          problem={selectedProblem}
          onShowEmployee={handleShowEmployee}
          onBack={() => setCurrentScreen('problemCategories')}
        />
      )}
      
      {currentScreen === 'employeeMode' && (
        <EmployeeMode 
          situation={selectedProblem?.phrase || selectedProblem?.situation || 'baggage_not_arrived'}
          onBack={() => setCurrentScreen('problemDetail')}
        />
      )}
      
      {currentScreen === 'checkItem' && (
        <CheckItem onBack={() => setCurrentScreen('dashboard')} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

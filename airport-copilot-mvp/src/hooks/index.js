/**
 * Custom Hooks для Airport Copilot
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RuleEngine } from '../core/RuleEngine';
import { useApp } from '../context/AppContext';

/**
 * Хук для работы с правилами и проверкой предметов
 */
export function useRuleChecker() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const ruleEngine = useMemo(() => new RuleEngine(), []);
  
  const checkItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Валидация входных данных
      if (!itemData.itemType) {
        throw new Error('Не указан тип предмета');
      }
      
      // Для power bank требуется расчёт Wh
      if (itemData.itemType === 'power_bank') {
        if (!itemData.capacityMah || !itemData.voltage) {
          return {
            canConfirm: false,
            message: 'Я не могу это подтвердить.',
            requiredParams: [
              'Ёмкость в mAh или Wh',
              'Напряжение или модель устройства',
              'Ручная кладь или багаж',
              'Авиакомпания'
            ]
          };
        }
        
        // Детерминированный расчёт Wh
        const capacityWh = (itemData.capacityMah * itemData.voltage) / 1000;
        itemData.calculatedWh = capacityWh;
      }
      
      // Проверка правила
      const ruleResult = await ruleEngine.checkItem(itemData);
      setResult(ruleResult);
      return ruleResult;
      
    } catch (err) {
      setError(err.message);
      return { canConfirm: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [ruleEngine]);
  
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);
  
  return { checkItem, result, loading, error, reset };
}

/**
 * Хук для управления проблемами и сценариями
 */
export function useProblemSolver() {
  const [activeProblem, setActiveProblem] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { currentTrip } = useApp();
  
  const startProblem = useCallback((problemId, category) => {
    setActiveProblem({
      id: problemId,
      category,
      startedAt: new Date().toISOString(),
      currentStep: 0
    });
    setCompletedSteps([]);
  }, []);
  
  const completeStep = useCallback((stepId) => {
    setCompletedSteps(prev => [...prev, stepId]);
    setActiveProblem(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  }, []);
  
  const resetProblem = useCallback(() => {
    setActiveProblem(null);
    setCompletedSteps([]);
  }, []);
  
  const getProgress = useCallback(() => {
    if (!activeProblem) return 0;
    // Здесь должна быть логика получения шагов из базы проблем
    return completedSteps.length;
  }, [activeProblem, completedSteps]);
  
  return {
    activeProblem,
    completedSteps,
    startProblem,
    completeStep,
    resetProblem,
    getProgress
  };
}

/**
 * Хук для офлайн-режима
 */
export function useOfflineStatus() {
  const { isOffline, lastSync } = useApp();
  const [connectionQuality, setConnectionQuality] = useState('good');
  
  useEffect(() => {
    const updateConnectionQuality = () => {
      if ('connection' in navigator) {
        const { effectiveType, downlink } = navigator.connection;
        
        if (effectiveType === '4g' && downlink > 10) {
          setConnectionQuality('excellent');
        } else if (effectiveType === '4g' || effectiveType === '3g') {
          setConnectionQuality('good');
        } else if (effectiveType === '2g') {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('unknown');
        }
      }
    };
    
    updateConnectionQuality();
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionQuality);
      return () => {
        navigator.connection.removeEventListener('change', updateConnectionQuality);
      };
    }
  }, []);
  
  const getSyncStatus = useCallback(() => {
    if (isOffline) {
      return {
        status: 'offline',
        message: 'Офлайн-режим',
        lastSync,
        canSync: false
      };
    }
    
    if (!lastSync) {
      return {
        status: 'never',
        message: 'Данные не синхронизированы',
        lastSync: null,
        canSync: true
      };
    }
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now - syncDate) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 1) {
      return {
        status: 'fresh',
        message: 'Актуально',
        lastSync,
        canSync: true
      };
    } else if (hoursSinceSync < 24) {
      return {
        status: 'stale',
        message: 'Требует обновления',
        lastSync,
        canSync: true
      };
    } else {
      return {
        status: 'outdated',
        message: 'Устарело',
        lastSync,
        canSync: true
      };
    }
  }, [isOffline, lastSync]);
  
  return {
    isOffline,
    connectionQuality,
    syncStatus: getSyncStatus(),
    lastSync
  };
}

/**
 * Хук для доступа к фразам и переводу
 */
export function usePhrases() {
  const { userPreferences } = useApp();
  const [phrases, setPhrases] = useState([]);
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  
  // Загрузка фраз (в реальности из офлайн-пакета)
  useEffect(() => {
    // Моковые данные - в продакшене загружать из OfflinePackageManager
    const mockPhrases = [
      {
        id: '1',
        situation: 'baggage_not_arrived',
        ru: 'Мой багаж не приехал. Помогите оформить заявление.',
        en: 'My baggage has not arrived. Could you please help me file a report?',
        pronunciation: '/maɪ ˈbæɡɪdʒ hæz nɒt əˈraɪvd/'
      },
      {
        id: '2',
        situation: 'missed_connection',
        ru: 'Я пропустил пересадку. Помогите, пожалуйста.',
        en: 'I missed my connection. Could you please help me?',
        pronunciation: '/aɪ mɪst maɪ kəˈnɛkʃən/'
      },
      {
        id: '3',
        situation: 'where_gate',
        ru: 'Где выход B24?',
        en: 'Where is gate B24?',
        pronunciation: '/wɛr ɪz ɡeɪt biː ˈtwɛnti fɔːr/'
      }
    ];
    
    setPhrases(mockPhrases);
    setFilteredPhrases(mockPhrases);
  }, []);
  
  const getPhraseBySituation = useCallback((situation) => {
    return phrases.find(p => p.situation === situation);
  }, [phrases]);
  
  const searchPhrases = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = phrases.filter(p => 
      p.ru.toLowerCase().includes(lowerQuery) ||
      p.en.toLowerCase().includes(lowerQuery)
    );
    setFilteredPhrases(filtered);
  }, [phrases]);
  
  const resetFilter = useCallback(() => {
    setFilteredPhrases(phrases);
  }, [phrases]);
  
  return {
    phrases: filteredPhrases,
    allPhrases: phrases,
    getPhraseBySituation,
    searchPhrases,
    resetFilter,
    targetLanguage: userPreferences.language
  };
}

/**
 * Хук для уведомлений с фильтрацией
 */
export function useNotifications() {
  const { notifications, markNotificationRead, clearNotifications } = useApp();
  
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);
  
  const criticalNotifications = useMemo(() => 
    notifications.filter(n => n.severity === 'high' || n.severity === 'critical')
  , [notifications]);
  
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);
  
  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  }, [notifications, markNotificationRead]);
  
  return {
    notifications,
    unreadCount,
    criticalNotifications,
    getNotificationsByType,
    markAsRead: markNotificationRead,
    markAllAsRead,
    clearAll: clearNotifications
  };
}

/**
 * Хук для таймера обратного отсчёта до вылета
 */
export function useFlightTimer(scheduledDeparture) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState('pre-flight');
  
  useEffect(() => {
    if (!scheduledDeparture) return;
    
    const calculateTimeLeft = () => {
      const departure = new Date(scheduledDeparture);
      const now = new Date();
      const diff = departure - now;
      
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, hours: 0 });
        setPhase('departed');
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      
      setTimeLeft({ minutes: minutes % 60, hours });
      
      // Определение фазы полёта
      if (hours > 2) {
        setPhase('pre-flight');
      } else if (hours > 0) {
        setPhase('boarding-soon');
      } else if (minutes > 30) {
        setPhase('boarding');
      } else {
        setPhase('final-call');
      }
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Обновление каждую минуту
    
    return () => clearInterval(interval);
  }, [scheduledDeparture]);
  
  const getFormattedTime = useCallback(() => {
    if (!timeLeft) return '--:--';
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}ч ${timeLeft.minutes}мин`;
    }
    return `${timeLeft.minutes}мин`;
  }, [timeLeft]);
  
  const getUrgencyColor = useCallback(() => {
    switch (phase) {
      case 'final-call': return 'red';
      case 'boarding': return 'orange';
      case 'boarding-soon': return 'yellow';
      default: return 'green';
    }
  }, [phase]);
  
  return {
    timeLeft,
    phase,
    formatted: getFormattedTime(),
    urgencyColor: getUrgencyColor(),
    isUrgent: phase === 'final-call' || phase === 'boarding'
  };
}

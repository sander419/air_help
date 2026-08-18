/**
 * Airport Copilot - Custom Hooks
 * useRuleEngine, useNotification, useOfflineStatus
 */

import { useState, useEffect, useCallback } from 'react';
import RuleEngine from '../engine/RuleEngine';
import NotificationEngine from '../engine/NotificationEngine';
import OfflinePackageManager from '../engine/OfflinePackageManager';

// Singleton instances
const ruleEngineInstance = new RuleEngine();
const notificationEngineInstance = new NotificationEngine();
const offlineManagerInstance = new OfflinePackageManager();

/**
 * Хук для работы с Rule Engine
 */
export const useRuleEngine = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const evaluate = useCallback(async (context) => {
    setLoading(true);
    setError(null);
    
    try {
      const evaluation = ruleEngineInstance.evaluate(context);
      setResult(evaluation);
      return evaluation;
    } catch (err) {
      setError(err.message || 'Ошибка оценки правила');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    evaluate,
    reset
  };
};

/**
 * Хук для работы с уведомлениями
 */
export const useNotification = (tripId = null) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    const all = notificationEngineInstance.getAll(tripId);
    setNotifications(all);
    setUnreadCount(all.filter(n => !n.read).length);

    // Subscribe to new notifications
    const unsubscribe = notificationEngineInstance.subscribe((notification) => {
      if (!tripId || notification.tripId === tripId) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [tripId]);

  const markAsRead = useCallback((id) => {
    notificationEngineInstance.markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => notificationEngineInstance.markAsRead(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const clear = useCallback(() => {
    notificationEngineInstance.clear(tripId);
    setNotifications([]);
    setUnreadCount(0);
  }, [tripId]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clear
  };
};

/**
 * Хук для офлайн-статуса
 */
export const useOfflineStatus = (tripId = null) => {
  const [status, setStatus] = useState({
    isOffline: !navigator.onLine,
    hasPackage: false,
    isValid: false,
    lastUpdated: null,
    expiresAt: null,
    size: null,
    isComplete: false
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      if (tripId) {
        setStatus(offlineManagerInstance.getOfflineStatus());
      } else {
        setStatus({
          isOffline: !navigator.onLine,
          hasPackage: false,
          isValid: false,
          lastUpdated: null,
          expiresAt: null,
          size: null,
          isComplete: false
        });
      }
    };

    updateStatus();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tripId]);

  const createPackage = useCallback(async (tripData) => {
    const pkg = await offlineManagerInstance.createPackage(tripData);
    offlineManagerInstance.exportToStorage(tripData.tripId);
    updateStatus();
    return pkg;
  }, []);

  const loadPackage = useCallback((tripId) => {
    return offlineManagerInstance.importFromStorage(tripId);
  }, []);

  const getData = useCallback((section, id = null) => {
    return offlineManagerInstance.getData(section, id);
  }, []);

  return {
    status,
    isOnline,
    createPackage,
    loadPackage,
    getData
  };
};

/**
 * Хук для детерминированного расчёта Wh
 */
export const useBatteryCalculator = () => {
  const calculateWh = useCallback((mAh, voltage) => {
    if (!mAh || !voltage) {
      return null;
    }
    
    const wh = (parseFloat(mAh) * parseFloat(voltage)) / 1000;
    return {
      value: Math.round(wh * 100) / 100,
      formula: 'Wh = mAh × V / 1000',
      source: 'NIST SI Units',
      input: {
        mAh: parseFloat(mAh),
        voltage: parseFloat(voltage)
      }
    };
  }, []);

  const validateCapacity = useCallback((wh) => {
    if (wh === null || wh === undefined) {
      return { valid: false, message: 'Ёмкость не указана' };
    }

    if (wh <= 100) {
      return { valid: true, level: 'safe', message: 'Разрешено без ограничений' };
    } else if (wh <= 160) {
      return { valid: true, level: 'approval_required', message: 'Требуется одобрение авиакомпании' };
    } else {
      return { valid: false, level: 'prohibited', message: 'Запрещено (>160 Wh)' };
    }
  }, []);

  return {
    calculateWh,
    validateCapacity
  };
};

/**
 * Хук для управления стрессовым состоянием UI
 */
export const useStressMode = () => {
  const [isStressMode, setIsStressMode] = useState(false);

  const enableStressMode = useCallback(() => {
    setIsStressMode(true);
    document.body.classList.add('stress-mode');
  }, []);

  const disableStressMode = useCallback(() => {
    setIsStressMode(false);
    document.body.classList.remove('stress-mode');
  }, []);

  const toggleStressMode = useCallback(() => {
    if (isStressMode) {
      disableStressMode();
    } else {
      enableStressMode();
    }
  }, [isStressMode, enableStressMode, disableStressMode]);

  return {
    isStressMode,
    enableStressMode,
    disableStressMode,
    toggleStressMode
  };
};

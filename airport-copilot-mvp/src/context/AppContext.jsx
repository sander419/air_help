/**
 * Airport Copilot Context
 * Глобальное состояние приложения: трипы, уведомления, офлайн-режим
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { offlinePackageManager } from '../core/OfflinePackageManager';
import { notificationEngine } from '../core/NotificationEngine';
import { FlightService } from '../services/api/FlightService';

const AppContext = createContext();

// Начальное состояние
const initialState = {
  currentTrip: null,
  trips: [],
  notifications: [],
  isOffline: !navigator.onLine,
  lastSync: null,
  offlinePackage: null,
  userPreferences: {
    language: 'ru',
    accessibility: {
      largeText: false,
      highContrast: false,
      reducedMotion: false
    }
  },
  loading: false,
  error: null
};

// Reducer для управления состоянием
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload, loading: false };
    
    case 'ADD_TRIP':
      return { 
        ...state, 
        trips: [...state.trips, action.payload],
        currentTrip: action.payload,
        loading: false 
      };
    
    case 'REMOVE_TRIP':
      return { 
        ...state, 
        trips: state.trips.filter(t => t.id !== action.payload),
        loading: false 
      };
    
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(t => 
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
        currentTrip: state.currentTrip?.id === action.payload.id 
          ? { ...state.currentTrip, ...action.payload } 
          : state.currentTrip,
        loading: false
      };
    
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications].slice(0, 50);
      return { ...state, notifications: newNotifications };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_OFFLINE_STATUS':
      return { ...state, isOffline: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    case 'SET_OFFLINE_PACKAGE':
      return { ...state, offlinePackage: action.payload };
    
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        userPreferences: { ...state.userPreferences, ...action.payload } 
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Провайдер контекста
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Инициализация менеджеров
  useEffect(() => {
    let offlineManager;
    let notificationEngine;
    let flightService;
    let syncInterval;
    
    const initialize = async () => {
      try {
        // Инициализация офлайн-менеджера
        offlineManager = new OfflinePackageManager();
        await offlineManager.initialize();
        
        const storedPackage = offlineManager.getCurrentPackage();
        if (storedPackage) {
          dispatch({ type: 'SET_OFFLINE_PACKAGE', payload: storedPackage });
          dispatch({ type: 'SET_LAST_SYNC', payload: storedPackage.lastSync });
          
          // Загрузка трипа из офлайн-пакета
          if (storedPackage.trips && storedPackage.trips.length > 0) {
            dispatch({ 
              type: 'SET_CURRENT_TRIP', 
              payload: storedPackage.trips[0] 
            });
          }
        }
        
        // Инициализация движка уведомлений
        notificationEngine = new NotificationEngine((notification) => {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        });
        
        await notificationEngine.initialize();
        
        // Инициализация сервиса рейсов
        flightService = new FlightService();
        
        // Проверка онлайн/офлайн статуса
        const handleOnline = () => {
          dispatch({ type: 'SET_OFFLINE_STATUS', payload: false });
          // Синхронизация при восстановлении соединения
          performSync(offlineManager, flightService);
        };
        
        const handleOffline = () => {
          dispatch({ type: 'SET_OFFLINE_STATUS', payload: true });
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Периодическая синхронизация (каждые 5 минут если онлайн)
        if (!state.isOffline) {
          syncInterval = setInterval(() => {
            performSync(offlineManager, flightService);
          }, 5 * 60 * 1000);
        }
        
        // Первоначальная синхронизация
        if (!state.isOffline) {
          await performSync(offlineManager, flightService);
        }
        
      } catch (error) {
        console.error('Initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
    
    initialize();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncInterval) clearInterval(syncInterval);
      if (notificationEngine) notificationEngine.destroy();
    };
  }, []);
  
  // Функция синхронизации
  const performSync = async (offlineManager, flightService) => {
    if (!state.currentTrip || state.isOffline) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Обновление данных рейса
      const flightData = await flightService.getFlightStatus(
        state.currentTrip.flightNumber
      );
      
      if (flightData) {
        dispatch({ 
          type: 'UPDATE_TRIP', 
          payload: { 
            id: state.currentTrip.id,
            flight: { ...state.currentTrip.flight, ...flightData }
          } 
        });
      }
      
      // Обновление офлайн-пакета
      const updatedPackage = await offlineManager.syncPackage(state.currentTrip);
      if (updatedPackage) {
        dispatch({ type: 'SET_OFFLINE_PACKAGE', payload: updatedPackage });
        dispatch({ type: 'SET_LAST_SYNC', payload: updatedPackage.lastSync });
      }
      
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      console.error('Sync error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось синхронизировать данные' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // Публичные методы
  const value = {
    ...state,
    
    // Управление трипами
    setCurrentTrip: (trip) => {
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
      // Сохранение в офлайн-пакет
      if (state.offlinePackage) {
        const offlineManager = new OfflinePackageManager();
        offlineManager.updateTrip(trip);
      }
    },
    
    addTrip: async (tripData) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const trip = {
          id: Date.now().toString(),
          ...tripData,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        
        dispatch({ type: 'ADD_TRIP', payload: trip });
        
        // Создание офлайн-пакета для нового трипа
        const offlineManager = new OfflinePackageManager();
        await offlineManager.createPackage(trip);
        
        return trip;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },
    
    removeTrip: (tripId) => {
      dispatch({ type: 'REMOVE_TRIP', payload: tripId });
      if (tripId === state.currentTrip?.id) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: null });
      }
    },
    
    // Уведомления
    markNotificationRead: (notificationId) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    },
    
    clearNotifications: () => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },
    
    // Предпочтения
    updatePreferences: (preferences) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    },
    
    // Синхронизация вручную
    syncNow: async () => {
      if (state.isOffline) {
        throw new Error('Нет подключения к интернету');
      }
      const offlineManager = new OfflinePackageManager();
      const flightService = new FlightService();
      await performSync(offlineManager, flightService);
    }
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Хук для использования контекста
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp должен использоваться внутри AppProvider');
  }
  return context;
}

// Селекторы для оптимизации
export const selectCurrentTrip = (state) => state.currentTrip;
export const selectUnreadNotifications = (state) => 
  state.notifications.filter(n => !n.read);
export const selectHasActiveTrip = (state) => 
  state.trips.some(t => t.status === 'active');

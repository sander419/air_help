/**
 * Flight Service - Работа с данными рейсов
 * Интеграция с внешними API + моковые данные для офлайн-режима
 */

import { format } from 'date-fns';

// Конфигурация API (в продакшене использовать env variables)
const API_CONFIG = {
  aviationStack: {
    baseUrl: 'https://api.aviationstack.com/v1',
    apiKey: import.meta.env.VITE_AVIATIONSTACK_KEY || 'mock_key'
  },
  flightAware: {
    baseUrl: 'https://aeroapi.flightaware.com/aeroapi',
    apiKey: import.meta.env.VITE_FLIGHTAWARE_KEY || 'mock_key'
  }
};

class FlightServiceClass {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }
  
  /**
   * Получение статуса рейса
   * @param {string} flightNumber - Номер рейса (например, TK412)
   * @param {Object} options - Дополнительные опции
   */
  async getFlightStatus(flightNumber, options = {}) {
    const cacheKey = `flight_${flightNumber}`;
    
    // Проверка кэша
    const cached = this._getCached(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Попытка получить данные из API
      const data = await this._fetchFromAPI(flightNumber, options);
      this._setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // Fallback на моковые данные
      const mockData = this._getMockFlightData(flightNumber, options);
      this._setCache(cacheKey, mockData);
      return mockData;
    }
  }
  
  /**
   * Оценка риска пересадки
   * @param {Object} connection - Данные о пересадке
   */
  async assessConnectionRisk(connection) {
    const {
      arrivalTime,
      departureTime,
      arrivalAirport,
      departureAirport,
      airline,
      mct // Minimum Connection Time
    } = connection;
    
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const connectionTime = (departure - arrival) / (1000 * 60); // в минутах
    
    // Если MCT неизвестен, не можем оценить риск точно
    if (!mct) {
      return {
        risk: 'unknown',
        confidence: 'low',
        message: 'Если minimum connection time неизвестен, я не могу подтвердить уровень риска.',
        connectionTimeMinutes: connectionTime,
        recommendedAction: [
          'Проверьте Gate следующего рейса',
          'Следите за статусом рейса',
          'Если время короткое — обратитесь к сотруднику авиакомпании'
        ]
      };
    }
    
    const timeMargin = connectionTime - mct;
    
    let risk, severity, message;
    
    if (timeMargin < 0) {
      risk = 'critical';
      severity = 'high';
      message = `Время пересадки (${Math.round(connectionTime)} мин) меньше минимального (${mct} мин). Высокий риск опоздания.`;
    } else if (timeMargin < 30) {
      risk = 'high';
      severity = 'high';
      message = `Время пересадки (${Math.round(connectionTime)} мин) близко к минимальному. Рекомендуется ускориться.`;
    } else if (timeMargin < 60) {
      risk = 'medium';
      severity = 'medium';
      message = `Время пересадки (${Math.round(connectionTime)} мин) достаточное, но без запаса.`;
    } else {
      risk = 'low';
      severity = 'low';
      message = `Время пересадки (${Math.round(connectionTime)} мин) комфортное.`;
    }
    
    return {
      risk,
      severity,
      confidence: mct ? 'high' : 'medium',
      message,
      connectionTimeMinutes: connectionTime,
      mct,
      timeMargin,
      recommendedAction: this._getConnectionActions(risk)
    };
  }
  
  /**
   * Поиск рейсов по маршруту
   */
  async searchFlights(params) {
    const { origin, destination, date } = params;
    
    try {
      const data = await this._fetchFlightSearch(params);
      return data;
    } catch (error) {
      console.warn('Flight search failed:', error);
      return this._getMockFlightSearch(params);
    }
  }
  
  /**
   * Получение информации об аэропорте
   */
  async getAirportInfo(iataCode) {
    const cacheKey = `airport_${iataCode}`;
    
    const cached = this._getCached(cacheKey);
    if (cached) {
      return cached;
    }
    
    const airportData = await this._fetchAirportInfo(iataCode);
    this._setCache(cacheKey, airportData);
    return airportData;
  }
  
  // Приватные методы
  
  _getCached(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const isExpired = Date.now() - item.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  async _fetchFromAPI(flightNumber, options) {
    // В продакшене реальный запрос к API
    // Для демонстрации возвращаем ошибку для использования mock
    throw new Error('API not configured');
  }
  
  _getMockFlightData(flightNumber, options) {
    const now = new Date();
    const scheduledDeparture = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 часа
    const scheduledArrival = new Date(scheduledDeparture.getTime() + 3 * 60 * 60 * 1000); // +3 часа полёта
    
    // Симуляция задержки
    const hasDelay = Math.random() > 0.7;
    const delayMinutes = hasDelay ? Math.floor(Math.random() * 60) : 0;
    
    const estimatedDeparture = new Date(scheduledDeparture.getTime() + delayMinutes * 60 * 1000);
    const estimatedArrival = new Date(scheduledArrival.getTime() + delayMinutes * 60 * 1000);
    
    return {
      flightNumber,
      status: hasDelay ? 'delayed' : 'scheduled',
      scheduledDeparture: scheduledDeparture.toISOString(),
      scheduledArrival: scheduledArrival.toISOString(),
      estimatedDeparture: estimatedDeparture.toISOString(),
      estimatedArrival: estimatedArrival.toISOString(),
      delayMinutes,
      terminal: 'D',
      gate: 'B24',
      aircraft: 'Boeing 737-800',
      airline: {
        name: 'Turkish Airlines',
        code: 'TK',
        logo: '/airlines/tk.png'
      },
      origin: {
        iata: 'SVO',
        name: 'Sheremetyevo',
        city: 'Moscow',
        country: 'Russia'
      },
      destination: {
        iata: 'IST',
        name: 'Istanbul Airport',
        city: 'Istanbul',
        country: 'Turkey'
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'mock'
    };
  }
  
  _getConnectionActions(risk) {
    switch (risk) {
      case 'critical':
        return [
          'Немедленно обратитесь к сотруднику авиакомпании',
          'Узнайте о возможности альтернативного рейса',
          'Подготовьте документы для ускоренного прохождения'
        ];
      case 'high':
        return [
          'Найдите Gate следующего рейса на карте',
          'Используйте ускоренный трансфер если доступен',
          'Сообщите сотруднику о tight connection'
        ];
      case 'medium':
        return [
          'Проверьте Gate следующего рейса',
          'Двигайтесь без задержек',
          'Следите за изменениями табло'
        ];
      default:
        return [
          'Спокойно пройдите к Gate',
          'Проверьте информацию на табло',
          'При необходимости обратитесь за помощью'
        ];
    }
  }
  
  async _fetchFlightSearch(params) {
    throw new Error('API not configured');
  }
  
  _getMockFlightSearch(params) {
    return {
      flights: [
        {
          flightNumber: 'TK412',
          departure: '18:45',
          arrival: '21:30',
          duration: '3h 45m',
          airline: 'Turkish Airlines',
          price: 25000,
          currency: 'RUB'
        },
        {
          flightNumber: 'SU2632',
          departure: '20:15',
          arrival: '23:00',
          duration: '3h 45m',
          airline: 'Aeroflot',
          price: 28000,
          currency: 'RUB'
        }
      ],
      searchParams: params,
      dataSource: 'mock'
    };
  }
  
  async _fetchAirportInfo(iataCode) {
    throw new Error('API not configured');
  }
  
  _getMockAirportInfo(iataCode) {
    const airports = {
      SVO: {
        iata: 'SVO',
        icao: 'UUEE',
        name: 'Sheremetyevo International Airport',
        city: 'Moscow',
        country: 'Russia',
        timezone: 'Europe/Moscow',
        terminals: ['A', 'B', 'C', 'D', 'E', 'F'],
        facilities: ['wifi', 'lounges', 'shops', 'restaurants', 'pharmacy'],
        officialUrl: 'https://www.svo.aero',
        mapUrl: '/maps/svo.json'
      },
      IST: {
        iata: 'IST',
        icao: 'LTFM',
        name: 'Istanbul Airport',
        city: 'Istanbul',
        country: 'Turkey',
        timezone: 'Europe/Istanbul',
        terminals: ['Main Terminal'],
        facilities: ['wifi', 'lounges', 'shops', 'restaurants', 'hotel', 'spa'],
        officialUrl: 'https://www.istairport.com',
        mapUrl: '/maps/ist.json'
      },
      TXL: {
        iata: 'TXL',
        icao: 'EDDT',
        name: 'Berlin Tegel Airport',
        city: 'Berlin',
        country: 'Germany',
        timezone: 'Europe/Berlin',
        terminals: ['A', 'B', 'C', 'D', 'E'],
        facilities: ['wifi', 'shops', 'restaurants'],
        officialUrl: 'https://www.berlin-airport.de',
        mapUrl: '/maps/txl.json'
      }
    };
    
    return airports[iataCode] || {
      iata: iataCode,
      name: 'Unknown Airport',
      dataSource: 'mock'
    };
  }
}

// Singleton instance
export const FlightService = new FlightServiceClass();
export default FlightService;

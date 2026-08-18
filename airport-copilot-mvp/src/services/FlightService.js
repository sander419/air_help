/**
 * Airport Copilot - Flight Service
 * Сервис для работы с данными рейсов (mock + future API integration)
 */

import { flights, airports, airlines } from '../data/mockData';

class FlightService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 минут кэш для flight status
  }

  /**
   * Получение всех рейсов
   */
  getAllFlights() {
    return flights;
  }

  /**
   * Поиск рейса по номеру
   */
  getFlightByNumber(flightNumber) {
    return flights.find(f => f.flight_number === flightNumber);
  }

  /**
   * Поиск рейса по ID
   */
  getFlightById(flightId) {
    return flights.find(f => f.id === flightId);
  }

  /**
   * Получение рейсов для аэропорта отправления
   */
  getFlightsByDepartureAirport(airportId) {
    return flights.filter(f => f.departure_airport_id === airportId);
  }

  /**
   * Получение рейсов для аэропорта прибытия
   */
  getFlightsByArrivalAirport(airportId) {
    return flights.filter(f => f.arrival_airport_id === airportId);
  }

  /**
   * Получение рейсов авиакомпании
   */
  getFlightsByAirline(airlineId) {
    return flights.filter(f => f.airline_id === airlineId);
  }

  /**
   * Проверка статуса рейса (задержка/отмена)
   */
  checkFlightStatus(flightId) {
    const flight = this.getFlightById(flightId);
    if (!flight) {
      return null;
    }

    const scheduled = new Date(flight.scheduled_departure);
    const estimated = new Date(flight.estimated_departure);
    const delayMinutes = Math.round((estimated - scheduled) / (1000 * 60));

    return {
      flightId: flight.id,
      flightNumber: flight.flight_number,
      status: flight.status,
      scheduledDeparture: flight.scheduled_departure,
      estimatedDeparture: flight.estimated_departure,
      delayMinutes,
      isDelayed: delayMinutes > 15,
      isCancelled: flight.status === 'cancelled',
      gate: flight.gate,
      terminal: flight.terminal
    };
  }

  /**
   * Оценка риска пересадки
   */
  evaluateConnection(firstFlightId, secondFlightId, mct = null) {
    const firstFlight = this.getFlightById(firstFlightId);
    const secondFlight = this.getFlightById(secondFlightId);

    if (!firstFlight || !secondFlight) {
      return {
        error: 'Flights not found',
        risk: 'unknown'
      };
    }

    // Проверка, что это действительно пересадка
    if (firstFlight.arrival_airport_id !== secondFlight.departure_airport_id) {
      return {
        error: 'Not a valid connection',
        risk: 'unknown'
      };
    }

    const arrivalTime = new Date(firstFlight.estimated_arrival);
    const departureTime = new Date(secondFlight.scheduled_departure);
    const connectionTimeMinutes = Math.round((departureTime - arrivalTime) / (1000 * 60));

    // MCT по умолчанию 60 минут для внутренних, 90 для международных
    const effectiveMct = mct || (this.isInternationalConnection(firstFlight, secondFlight) ? 90 : 60);
    
    let risk, recommendation;

    if (connectionTimeMinutes < 0) {
      risk = 'critical';
      recommendation = 'Рейс уже ушёл. Обратитесь к сотруднику авиакомпании.';
    } else if (connectionTimeMinutes < effectiveMct * 0.5) {
      risk = 'critical';
      recommendation = 'Критически мало времени. Ищите быстрый трансфер.';
    } else if (connectionTimeMinutes < effectiveMct) {
      risk = 'high';
      recommendation = 'Мало времени. Направляйтесь к Gate без задержек.';
    } else if (connectionTimeMinutes < effectiveMct * 1.5) {
      risk = 'medium';
      recommendation = 'Нормальное время. Следите за табло.';
    } else {
      risk = 'low';
      recommendation = 'Достаточно времени. Спокойно пройдите к Gate.';
    }

    return {
      firstFlight: {
        number: firstFlight.flight_number,
        arrival: firstFlight.estimated_arrival,
        gate: firstFlight.arrival_gate
      },
      secondFlight: {
        number: secondFlight.flight_number,
        departure: secondFlight.scheduled_departure,
        gate: secondFlight.gate
      },
      connectionTimeMinutes,
      minimumConnectionTime: effectiveMct,
      risk,
      recommendation,
      isInternationalConnection: this.isInternationalConnection(firstFlight, secondFlight)
    };
  }

  /**
   * Проверка, является ли пересадка международной
   */
  isInternationalConnection(firstFlight, secondFlight) {
    const arrivalAirport = airports.find(a => a.id === firstFlight.arrival_airport_id);
    const departureAirport = airports.find(a => a.id === secondFlight.departure_airport_id);
    
    if (!arrivalAirport || !departureAirport) {
      return true; // По умолчанию считаем международной
    }

    return arrivalAirport.country_code !== departureAirport.country_code;
  }

  /**
   * Получение информации об аэропорте
   */
  getAirportInfo(airportId) {
    return airports.find(a => a.id === airportId);
  }

  /**
   * Получение информации об авиакомпании
   */
  getAirlineInfo(airlineId) {
    return airlines.find(a => a.id === airlineId);
  }

  /**
   * Поиск стоек регистрации авиакомпании
   */
  getCheckinCounters(airlineId, airportId) {
    const airline = this.getAirlineInfo(airlineId);
    const airport = this.getAirportInfo(airportId);
    
    if (!airline || !airport) {
      return null;
    }

    // В реальности здесь был бы запрос к API аэропорта
    return {
      airline: airline.name,
      airport: airport.name,
      terminal: 'Terminal 1',
      counters: ['A1-A8', 'B1-B8'],
      openingHours: '24/7',
      notes: 'Рекомендуется прибыть за 3 часа до вылета'
    };
  }

  /**
   * Расчёт времени до вылета
   */
  getTimeToDeparture(flightId) {
    const flight = this.getFlightById(flightId);
    if (!flight) {
      return null;
    }

    const now = new Date();
    const departure = new Date(flight.scheduled_departure);
    const minutes = Math.round((departure - now) / (1000 * 60));

    if (minutes < 0) {
      return {
        departed: true,
        minutesAgo: Math.abs(minutes),
        message: `Рейс вылетел ${Math.abs(minutes)} мин назад`
      };
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let message;
    if (hours === 0) {
      message = `${remainingMinutes} мин`;
    } else if (hours === 1) {
      message = `1 ч ${remainingMinutes} мин`;
    } else {
      message = `${hours} ч ${remainingMinutes} мин`;
    }

    return {
      departed: false,
      minutes,
      hours,
      remainingMinutes,
      message
    };
  }

  /**
   * Проверка времени посадки
   */
  checkBoardingStatus(flightId) {
    const flight = this.getFlightById(flightId);
    if (!flight) {
      return null;
    }

    const now = new Date();
    const departure = new Date(flight.scheduled_departure);
    const boardingTime = new Date(departure.getTime() - 40 * 60 * 1000); // Посадка за 40 мин

    const minutesToBoarding = Math.round((boardingTime - now) / (1000 * 60));
    const minutesToDeparture = Math.round((departure - now) / (1000 * 60));

    if (minutesToDeparture < 0) {
      return { status: 'departed', message: 'Рейс вылетел' };
    }

    if (minutesToBoarding < 0) {
      return { 
        status: 'boarding', 
        message: 'Идёт посадка',
        minutesUntilClosing: Math.max(0, minutesToDeparture - 15) // За 15 мин до вылета закрывается
      };
    }

    if (minutesToBoarding < 15) {
      return { 
        status: 'soon', 
        message: `Посадка через ${minutesToBoarding} мин`,
        minutesToBoarding
      };
    }

    return {
      status: 'scheduled',
      message: `Посадка в ${this.formatTime(boardingTime)}`,
      minutesToBoarding
    };
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Очистка кэша
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Принудительное обновление данных рейса
   */
  async refreshFlightData(flightId) {
    // В реальности здесь был бы вызов API
    // Для MVP просто очищаем кэш
    this.cache.delete(flightId);
    return this.getFlightById(flightId);
  }
}

// Экспорт синглтона
export const flightService = new FlightService();
export default flightService;

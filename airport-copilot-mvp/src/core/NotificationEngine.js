/**
 * Airport Copilot - Notification Engine
 * Система умных уведомлений с оценкой риска и уверенности
 */

class NotificationEngine {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
  }

  /**
   * Подписка на уведомления
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Создание уведомления
   */
  createNotification({
    tripId,
    type,
    severity,
    urgency,
    confidence,
    title,
    body,
    data = {}
  }) {
    // Валидация обязательных полей
    if (!tripId || !type || !severity || !title || !body) {
      console.error('Missing required notification fields');
      return null;
    }

    // Валидация severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      severity = 'medium';
    }

    // Валидация urgency
    const validUrgencies = ['low', 'medium', 'high', 'immediate'];
    if (!validUrgencies.includes(urgency)) {
      urgency = 'medium';
    }

    // Валидация confidence
    const validConfidences = ['low', 'medium', 'high'];
    if (!validConfidences.includes(confidence)) {
      confidence = 'medium';
    }

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      type,
      severity,
      urgency,
      confidence,
      title,
      body,
      data,
      createdAt: new Date().toISOString(),
      read: false,
      dismissed: false
    };

    this.notifications.unshift(notification);
    
    // Уведомление подписчиков
    this.notifySubscribers(notification);

    return notification;
  }

  /**
   * Обработка события задержки рейса
   */
  handleFlightDelay(flight, delayMinutes) {
    const severity = delayMinutes > 120 ? 'critical' : 
                     delayMinutes > 60 ? 'high' : 
                     delayMinutes > 30 ? 'medium' : 'low';
    
    const confidence = flight.data_provider === 'official' ? 'high' : 'medium';

    return this.createNotification({
      tripId: flight.trip_id,
      type: 'FlightDelayed',
      severity,
      urgency: delayMinutes > 60 ? 'high' : 'medium',
      confidence,
      title: `Рейс ${flight.flight_number} задерживается`,
      body: `Новое время вылета: ${this.formatTime(flight.estimated_departure)}. Задержка: ${delayMinutes} мин.`,
      data: {
        flightNumber: flight.flight_number,
        originalTime: flight.scheduled_departure,
        newTime: flight.estimated_departure,
        delayMinutes
      }
    });
  }

  /**
   * Обработка события отмены рейса
   */
  handleFlightCancellation(flight) {
    return this.createNotification({
      tripId: flight.trip_id,
      type: 'FlightCancelled',
      severity: 'critical',
      urgency: 'immediate',
      confidence: 'high',
      title: `Рейс ${flight.flight_number} отменён`,
      body: 'Обратитесь к стойке авиакомпании для пересадки или возврата.',
      data: {
        flightNumber: flight.flight_number,
        status: 'cancelled'
      }
    });
  }

  /**
   * Обработка смены Gate
   */
  handleGateChange(flight, oldGate, newGate) {
    const minutesToBoarding = this.getMinutesToBoarding(flight);
    const urgency = minutesToBoarding < 30 ? 'immediate' : 'high';

    return this.createNotification({
      tripId: flight.trip_id,
      type: 'GateChanged',
      severity: 'high',
      urgency,
      confidence: 'high',
      title: `Gate изменился для рейса ${flight.flight_number}`,
      body: `Было: ${oldGate}. Стало: ${newGate}. До посадки: ${minutesToBoarding} мин.`,
      data: {
        flightNumber: flight.flight_number,
        oldGate,
        newGate,
        minutesToBoarding
      }
    });
  }

  /**
   * Оценка риска пересадки
   */
  evaluateConnectionRisk(firstFlight, secondFlight, mct = null) {
    const arrivalTime = new Date(firstFlight.estimated_arrival);
    const departureTime = new Date(secondFlight.scheduled_departure);
    const connectionTimeMinutes = (departureTime - arrivalTime) / (1000 * 60);

    // MCT (Minimum Connection Time) обычно 45-90 минут
    const effectiveMct = mct || 60;
    const remainingTime = connectionTimeMinutes;
    
    let risk, severity, urgency, confidence;

    if (!mct) {
      risk = 'unknown';
      severity = 'medium';
      urgency = 'medium';
      confidence = 'low';
    } else if (remainingTime < effectiveMct * 0.5) {
      risk = 'critical';
      severity = 'critical';
      urgency = 'immediate';
      confidence = 'high';
    } else if (remainingTime < effectiveMct) {
      risk = 'high';
      severity = 'high';
      urgency = 'high';
      confidence = 'medium';
    } else if (remainingTime < effectiveMct * 1.5) {
      risk = 'medium';
      severity = 'medium';
      urgency = 'medium';
      confidence = 'medium';
    } else {
      risk = 'low';
      severity = 'low';
      urgency = 'low';
      confidence = 'high';
    }

    const notification = this.createNotification({
      tripId: firstFlight.trip_id,
      type: 'ConnectionRisk',
      severity,
      urgency,
      confidence,
      title: risk === 'unknown' 
        ? 'Риск пересадки неизвестен' 
        : `Риск пересадки: ${this.getRiskLabel(risk)}`,
      body: risk === 'unknown'
        ? 'Minimum connection time неизвестен. Я не могу подтвердить уровень риска.'
        : `Время на пересадку: ${Math.round(connectionTimeMinutes)} мин. Рекомендуемое: ${effectiveMct} мин.`,
      data: {
        connectionTimeMinutes: Math.round(connectionTimeMinutes),
        minimumConnectionTime: effectiveMct,
        risk,
        firstFlight: firstFlight.flight_number,
        secondFlight: secondFlight.flight_number
      }
    });

    return {
      notification,
      risk,
      connectionTimeMinutes,
      minimumConnectionTime: effectiveMct,
      recommendation: this.getConnectionRecommendation(risk)
    };
  }

  /**
   * Начало посадки
   */
  handleBoardingStarted(flight) {
    return this.createNotification({
      tripId: flight.trip_id,
      type: 'BoardingStarted',
      severity: 'high',
      urgency: 'immediate',
      confidence: 'high',
      title: `Началась посадка на рейс ${flight.flight_number}`,
      body: `Gate: ${flight.gate}. Пожалуйста, пройдите к выходу.`,
      data: {
        flightNumber: flight.flight_number,
        gate: flight.gate
      }
    });
  }

  /**
   * Скоро посадка
   */
  handleBoardingSoon(flight, minutesUntilBoarding) {
    return this.createNotification({
      tripId: flight.trip_id,
      type: 'BoardingSoon',
      severity: 'medium',
      urgency: 'high',
      confidence: 'high',
      title: `Посадка через ${minutesUntilBoarding} мин`,
      body: `Рейс ${flight.flight_number}. Gate: ${flight.gate}`,
      data: {
        flightNumber: flight.flight_number,
        gate: flight.gate,
        minutesUntilBoarding
      }
    });
  }

  /**
   * Проблема с багажом
   */
  handleBaggageIssue(tripId, issueType) {
    const issueMessages = {
      not_arrived: 'Багаж не приехал',
      damaged: 'Багаж повреждён',
      lost: 'Багаж потерян'
    };

    return this.createNotification({
      tripId,
      type: 'BaggageIssue',
      severity: 'high',
      urgency: 'high',
      confidence: 'medium',
      title: issueMessages[issueType] || 'Проблема с багажом',
      body: 'Не уходите из зоны выдачи. Найдите стойку Baggage Service.',
      data: {
        issueType
      }
    });
  }

  /**
   * Напоминание о документах
   */
  handleDocumentReminder(tripId, documentType) {
    return this.createNotification({
      tripId,
      type: 'DocumentReminder',
      severity: 'medium',
      urgency: 'medium',
      confidence: 'high',
      title: 'Проверьте документы',
      body: `Убедитесь, что у вас есть: ${this.getDocumentName(documentType)}`,
      data: {
        documentType
      }
    });
  }

  /**
   * Получение всех уведомлений для поездки
   */
  getNotificationsForTrip(tripId, options = {}) {
    const { unreadOnly = false, limit = 20 } = options;
    
    let filtered = this.notifications.filter(n => n.tripId === tripId);
    
    if (unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    return filtered.slice(0, limit);
  }

  /**
   * Отметка уведомления как прочитанное
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return notification;
  }

  /**
   * Отклонение уведомления
   */
  dismiss(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
    }
    return notification;
  }

  /**
   * Уведомление подписчиков
   */
  notifySubscribers(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  /**
   * Вспомогательные методы
   */
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getMinutesToBoarding(flight) {
    const boardingTime = new Date(flight.scheduled_departure);
    boardingTime.setMinutes(boardingTime.getMinutes() - 40); // Посадка за 40 мин
    const now = new Date();
    return Math.max(0, Math.round((boardingTime - now) / (1000 * 60)));
  }

  getRiskLabel(risk) {
    const labels = {
      unknown: 'Неизвестен',
      critical: 'Критический',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    };
    return labels[risk] || risk;
  }

  getConnectionRecommendation(risk) {
    const recommendations = {
      unknown: [
        'Проверьте Gate следующего рейса',
        'Следите за статусом рейса',
        'При необходимости обратитесь к сотруднику авиакомпании'
      ],
      critical: [
        'Немедленно обратитесь к сотруднику авиакомпании',
        'Ищите быстрый трансфер',
        'Будьте готовы к альтернативному маршруту'
      ],
      high: [
        'Пройдите к Gate следующего рейса без задержек',
        'Сообщите сотруднику о короткой пересадке',
        'Имейте посадочный талон на руках'
      ],
      medium: [
        'Направляйтесь к Gate следующего рейса',
        'Следите за временем',
        'Будьте готовы ускориться'
      ],
      low: [
        'Спокойно пройдите к Gate',
        'У вас достаточно времени',
        'Следите за изменениями на табло'
      ]
    };
    return recommendations[risk] || recommendations.unknown;
  }

  getDocumentName(type) {
    const documents = {
      passport: 'Заграничный паспорт',
      visa: 'Виза',
      boarding_pass: 'Посадочный талон',
      ticket: 'Маршрутная квитанция',
      insurance: 'Страховой полис'
    };
    return documents[type] || type;
  }
}

// Экспорт синглтона
export const notificationEngine = new NotificationEngine();
export default notificationEngine;

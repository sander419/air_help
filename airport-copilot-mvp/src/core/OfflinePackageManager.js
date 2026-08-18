/**
 * Airport Copilot - Offline Package Manager
 * Управление офлайн-данными для поездок
 */

class OfflinePackageManager {
  constructor() {
    this.packages = new Map();
    this.activeTripId = null;
    this.lastSyncDate = null;
  }

  /**
   * Создание офлайн-пакета для поездки
   */
  async createPackage(trip) {
    const packageId = `offline_${trip.id}_${Date.now()}`;
    
    const offlinePackage = {
      id: packageId,
      tripId: trip.id,
      createdAt: new Date().toISOString(),
      expiresAt: this.calculateExpiryDate(trip),
      status: 'creating',
      size: 0,
      components: {
        airports: [],
        terminals: [],
        maps: [],
        airlines: [],
        rules: [],
        problems: [],
        phrases: [],
        documents: [],
        instructions: []
      },
      metadata: {
        departureAirport: trip.departure_airport_id,
        arrivalAirport: trip.destination_airport_id,
        flightSegments: trip.flight_segments || [],
        languages: trip.passenger?.language || ['ru', 'en']
      }
    };

    // Загрузка данных аэропортов
    offlinePackage.components.airports = await this.loadAirports([
      trip.departure_airport_id,
      trip.destination_airport_id,
      ...(trip.flight_segments?.map(s => s.arrival_airport_id) || [])
    ]);

    // Загрузка данных терминалов
    offlinePackage.components.terminals = await this.loadTerminals(
      offlinePackage.components.airports.map(a => a.id)
    );

    // Загрузка карт (заглушки для MVP)
    offlinePackage.components.maps = await this.loadMaps(
      offlinePackage.components.terminals.map(t => t.id)
    );

    // Загрузка правил для соответствующих стран/аэропортов
    offlinePackage.components.rules = await this.loadRules(
      offlinePackage.components.airports
    );

    // Загрузка проблемных сценариев
    offlinePackage.components.problems = await this.loadProblems();

    // Загрузка фраз для нужных языков
    offlinePackage.components.phrases = await this.loadPhrases(
      offlinePackage.metadata.languages
    );

    // Загрузка документов поездки
    offlinePackage.components.documents = trip.documents || [];

    // Загрузка инструкций
    offlinePackage.components.instructions = await this.loadInstructions();

    // Расчет размера
    offlinePackage.size = this.calculatePackageSize(offlinePackage);
    offlinePackage.status = 'ready';

    this.packages.set(packageId, offlinePackage);
    this.activeTripId = trip.id;
    this.lastSyncDate = new Date();

    return offlinePackage;
  }

  /**
   * Активация офлайн-пакета
   */
  activatePackage(packageId) {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error(`Package ${packageId} not found`);
    }

    if (pkg.status !== 'ready') {
      throw new Error(`Package ${packageId} is not ready. Status: ${pkg.status}`);
    }

    if (new Date() > new Date(pkg.expiresAt)) {
      pkg.status = 'expired';
      throw new Error(`Package ${packageId} has expired`);
    }

    this.activeTripId = pkg.tripId;
    return pkg;
  }

  /**
   * Проверка доступности офлайн-режима
   */
  isOfflineAvailable() {
    if (!this.activeTripId) {
      return {
        available: false,
        reason: 'No active trip'
      };
    }

    const pkg = Array.from(this.packages.values())
      .find(p => p.tripId === this.activeTripId && p.status === 'ready');

    if (!pkg) {
      return {
        available: false,
        reason: 'No offline package for active trip'
      };
    }

    if (new Date() > new Date(pkg.expiresAt)) {
      return {
        available: false,
        reason: 'Package expired',
        lastSyncDate: this.lastSyncDate
      };
    }

    return {
      available: true,
      packageId: pkg.id,
      lastSyncDate: this.lastSyncDate,
      expiresAt: pkg.expiresAt,
      size: pkg.size,
      components: Object.keys(pkg.components)
    };
  }

  /**
   * Получение данных из офлайн-пакета
   */
  getOfflineData(componentType, filters = {}) {
    if (!this.activeTripId) {
      throw new Error('No active trip for offline data');
    }

    const pkg = Array.from(this.packages.values())
      .find(p => p.tripId === this.activeTripId && p.status === 'ready');

    if (!pkg) {
      throw new Error('No valid offline package');
    }

    const data = pkg.components[componentType];
    if (!data) {
      return [];
    }

    // Применение фильтров
    return this.applyFilters(data, filters);
  }

  /**
   * Синхронизация офлайн-пакета
   */
  async syncPackage(packageId) {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error(`Package ${packageId} not found`);
    }

    pkg.status = 'syncing';
    
    // В реальном приложении здесь была бы загрузка обновлений
    // Для MVP просто обновляем дату синхронизации
    pkg.createdAt = new Date().toISOString();
    pkg.expiresAt = this.calculateExpiryDateByPackage(pkg);
    pkg.status = 'ready';
    this.lastSyncDate = new Date();

    return pkg;
  }

  /**
   * Удаление офлайн-пакета
   */
  deletePackage(packageId) {
    return this.packages.delete(packageId);
  }

  /**
   * Очистка устаревших пакетов
   */
  cleanupExpiredPackages() {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, pkg] of this.packages.entries()) {
      if (new Date(pkg.expiresAt) < now) {
        this.packages.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Загрузка данных аэропортов (заглушка)
   */
  async loadAirports(airportIds) {
    // В реальности здесь был бы запрос к API
    return airportIds.map(id => ({
      id,
      iata: `${id}_IATA`,
      name: `Airport ${id}`,
      city: `City ${id}`,
      country: 'Country',
      timezone: 'UTC'
    }));
  }

  /**
   * Загрузка данных терминалов (заглушка)
   */
  async loadTerminals(airportIds) {
    return airportIds.flatMap(airportId => [
      {
        id: `${airportId}_T1`,
        airport_id: airportId,
        name: 'Terminal 1',
        gates: ['A1', 'A2', 'A3', 'B1', 'B2']
      },
      {
        id: `${airportId}_T2`,
        airport_id: airportId,
        name: 'Terminal 2',
        gates: ['C1', 'C2', 'D1', 'D2']
      }
    ]);
  }

  /**
   * Загрузка карт (заглушка)
   */
  async loadMaps(terminalIds) {
    return terminalIds.map(id => ({
      terminal_id: id,
      map_url: `/assets/maps/${id}.svg`,
      map_version: '1.0',
      format: 'svg'
    }));
  }

  /**
   * Загрузка правил (заглушка)
   */
  async loadRules(airports) {
    // Возвращаем базовые правила для стран аэропортов
    return [
      {
        id: 'rule_liquids_eu',
        category: 'liquids',
        item_type: 'liquid',
        country: 'EU',
        rule_text: 'Liquids in carry-on must be in containers of 100ml or less.',
        source_id: 'eu_regulation_300_2008'
      },
      {
        id: 'rule_powerbank_faa',
        category: 'dangerous_goods',
        item_type: 'power_bank',
        country: 'US',
        rule_text: 'Power banks must be carried in carry-on baggage only.',
        source_id: 'faa_packsafe'
      }
    ];
  }

  /**
   * Загрузка проблемных сценариев
   */
  async loadProblems() {
    return [
      {
        id: 'problem_baggage_not_arrived',
        category: 'baggage',
        scenario: 'baggage_not_arrived',
        severity: 'high',
        immediateActions: [
          'Не уходите из зоны выдачи багажа',
          'Найдите стойку Baggage Service',
          'Подготовьте паспорт и багажную бирку'
        ]
      },
      {
        id: 'problem_missed_connection',
        category: 'flight',
        scenario: 'missed_connection',
        severity: 'high',
        immediateActions: [
          'Не покидайте транзитную зону',
          'Найдите Transfer Desk',
          'Покажите сотруднику посадочный талон'
        ]
      }
    ];
  }

  /**
   * Загрузка фраз
   */
  async loadPhrases(languages) {
    const basePhrases = [
      {
        id: 'phrase_where_gate',
        situation: 'finding_gate',
        translations: {
          ru: 'Где выход B24?',
          en: 'Where is gate B24?'
        }
      },
      {
        id: 'phrase_baggage_not_arrived',
        situation: 'baggage_issue',
        translations: {
          ru: 'Мой багаж не приехал. Помогите оформить заявление.',
          en: 'My baggage has not arrived. Could you please help me file a report?'
        }
      },
      {
        id: 'phrase_need_help',
        situation: 'general_help',
        translations: {
          ru: 'Мне нужна помощь.',
          en: 'I need help.'
        }
      }
    ];

    // Фильтрация по языкам
    return basePhrases.filter(p => 
      languages.some(lang => p.translations[lang])
    );
  }

  /**
   * Загрузка инструкций
   */
  async loadInstructions() {
    return [
      {
        id: 'instr_first_flight',
        title: 'Первый перелёт',
        steps: [
          'Прибудьте в аэропорт за 2-3 часа',
          'Найдите стойку регистрации вашей авиакомпании',
          'Сдайте багаж и получите посадочный талон',
          'Пройдите контроль безопасности',
          'Найдите ваш Gate и ожидайте посадку'
        ]
      },
      {
        id: 'instr_security_check',
        title: 'Контроль безопасности',
        steps: [
          'Достаньте ноутбуки и планшеты из сумки',
          'Жидкости должны быть в прозрачном пакете',
          'Снимите верхнюю одежду и ремень',
          'Пройдите через рамку детектора'
        ]
      }
    ];
  }

  /**
   * Применение фильтров к данным
   */
  applyFilters(data, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  /**
   * Расчет срока действия пакета
   */
  calculateExpiryDate(trip) {
    // Пакет действителен до конца поездки + 2 дня
    const lastFlightDate = new Date(trip.scheduled_arrival);
    lastFlightDate.setDate(lastFlightDate.getDate() + 2);
    return lastFlightDate.toISOString();
  }

  /**
   * Расчет срока действия пакета по данным пакета
   */
  calculateExpiryDateByPackage(pkg) {
    // Для упрощения - 30 дней от создания
    const expiry = new Date(pkg.createdAt);
    expiry.setDate(expiry.getDate() + 30);
    return expiry.toISOString();
  }

  /**
   * Расчет размера пакета
   */
  calculatePackageSize(pkg) {
    // Приблизительный расчет в КБ
    const estimate = JSON.stringify(pkg).length / 1024;
    return Math.round(estimate);
  }

  /**
   * Получение статуса офлайн-режима для UI
   */
  getOfflineStatus() {
    const availability = this.isOfflineAvailable();
    
    if (!availability.available) {
      return {
        mode: 'online',
        message: 'Онлайн-режим',
        lastSync: null
      };
    }

    const hoursUntilExpiry = Math.round(
      (new Date(availability.expiresAt) - new Date()) / (1000 * 60 * 60)
    );

    return {
      mode: 'offline',
      message: `Офлайн-режим. Данные обновлены: ${this.formatDate(this.lastSyncDate)}`,
      lastSync: this.lastSyncDate,
      expiresAt: availability.expiresAt,
      hoursUntilExpiry,
      size: availability.size
    };
  }

  formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Экспорт синглтона
export const offlinePackageManager = new OfflinePackageManager();
export default offlinePackageManager;

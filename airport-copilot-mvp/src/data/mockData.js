// Моковые данные для Airport Copilot MVP

export const trip = {
  id: 'trip_001',
  route: 'Москва → Стамбул → Берлин',
  airline: 'Turkish Airlines',
  flightNumber: 'TK416',
  departureTime: '18:45',
  date: new Date().toLocaleDateString('ru-RU'),
  offlineDate: '18.08.2026 12:40',
  currentStage: 'security',
  stages: [
    { id: 'airport', label: 'Аэропорт', done: true },
    { id: 'checkin', label: 'Регистрация', done: true },
    { id: 'security', label: 'Security', done: false, current: true },
    { id: 'passport', label: 'Паспортный контроль', done: false },
    { id: 'gate', label: 'Gate', done: false },
    { id: 'boarding', label: 'Посадка', done: false }
  ],
  timeToDeparture: '2 ч 18 мин',
  timeToBoarding: '37 минут'
};

export const problemCategories = [
  {
    id: 'flight',
    title: 'РЕЙС',
    problems: [
      { id: 'delayed', label: 'Рейс задержали' },
      { id: 'cancelled', label: 'Рейс отменили' },
      { id: 'late_arrival', label: 'Я опаздываю' },
      { id: 'missed_flight', label: 'Я опоздал' },
      { id: 'missed_connection', label: 'Пропустил пересадку' },
      { id: 'gate_changed', label: 'Изменили Gate' },
      { id: 'board_confusion', label: 'Не понимаю табло' }
    ]
  },
  {
    id: 'baggage',
    title: 'БАГАЖ',
    problems: [
      { id: 'no_baggage', label: 'Багаж не приехал' },
      { id: 'damaged_baggage', label: 'Багаж повреждён' },
      { id: 'lost_baggage', label: 'Потерял багаж' },
      { id: 'left_on_plane', label: 'Забыл вещь в самолёте' }
    ]
  },
  {
    id: 'documents',
    title: 'ДОКУМЕНТЫ',
    problems: [
      { id: 'lost_passport', label: 'Потерял паспорт' },
      { id: 'lost_boarding', label: 'Потерял посадочный талон' },
      { id: 'visa_issue', label: 'Проблема с визой' },
      { id: 'denied_entry', label: 'Меня не пускают' },
      { id: 'doc_confusion', label: 'Не знаю, какой документ нужен' }
    ]
  },
  {
    id: 'security',
    title: 'БЕЗОПАСНОСТЬ',
    problems: [
      { id: 'found_item', label: 'Нашли предмет' },
      { id: 'item_check', label: 'Не знаю, можно ли провезти' },
      { id: 'heavy_carry', label: 'Слишком тяжёлая ручная кладь' },
      { id: 'big_carry', label: 'Слишком большая ручная кладь' },
      { id: 'liquids_issue', label: 'Проблема с жидкостями' },
      { id: 'battery_issue', label: 'Проблема с аккумулятором' }
    ]
  },
  {
    id: 'communication',
    title: 'КОММУНИКАЦИЯ',
    problems: [
      { id: 'no_english', label: 'Не знаю английский' },
      { id: 'dont_understand', label: 'Не понимаю сотрудника' },
      { id: 'lost_direction', label: 'Не знаю, куда идти' },
      { id: 'need_help', label: 'Мне нужна помощь' }
    ]
  }
];

export const problemScenarios = {
  no_baggage: {
    id: 'no_baggage',
    title: 'Багаж не обнаружен',
    severity: 'warning',
    immediateActions: [
      'Не уходите из зоны выдачи багажа, если это возможно.',
      'Найдите Baggage Service / Lost & Found.',
      'Подготовьте паспорт, посадочный талон и багажную бирку.'
    ],
    nextActions: [
      'Заполните форму заявления о потере багажа (Property Irregularity Report).',
      'Получите номер обращения (Reference Number).',
      'Сохраните копию заявления и контакты авиакомпании.'
    ],
    dontDo: [
      'Не выбрасывайте багажную бирку.',
      'Не покидайте аэропорт без подачи заявления.',
      'Не соглашайтесь на устные обещания без письменного подтверждения.'
    ],
    phrase: {
      ru: 'МОЙ БАГАЖ НЕ ПРИЕХАЛ. ВОТ МОЯ БАГАЖНАЯ БИРКА. ПОМОГИТЕ ОФОРМИТЬ ЗАЯВЛЕНИЕ.',
      en: 'MY BAGGAGE HAS NOT ARRIVED. HERE IS MY BAGGAGE TAG. COULD YOU PLEASE HELP ME FILE A REPORT?'
    },
    source: {
      name: 'Официальный источник аэропорта/авиакомпании',
      url: '',
      lastVerified: 'Требуется проверка',
      confidence: 'medium'
    }
  },
  delayed: {
    id: 'delayed',
    title: 'Рейс задерживается',
    severity: 'warning',
    immediateActions: [
      'Проверьте новое время вылета на табло.',
      'Убедитесь, что Gate не изменился.',
      'Если есть пересадка — оцените риск опоздания.'
    ],
    nextActions: [
      'Следите за обновлениями статуса рейса.',
      'Если задержка более 3 часов — узнайте о правах на компенсацию.',
      'При длительной задержке — запросите питание/отель.'
    ],
    dontDo: [
      'Не покидайте Gate без подтверждения отмены.',
      'Не полагайтесь только на слуховые объявления.'
    ],
    phrase: {
      ru: 'МОЙ РЕЙС ЗАДЕРЖИВАЕТСЯ. КАКАЯ НОВАЯ ИНФОРМАЦИЯ? ЕСЛИ ЕСТЬ ПЕРЕСАДКА — Я УСПЕЮ?',
      en: 'MY FLIGHT IS DELAYED. WHAT IS THE NEW INFORMATION? IF I HAVE A CONNECTION — WILL I MAKE IT?'
    },
    source: {
      name: 'Flight API / Авиакомпания',
      url: '',
      lastVerified: 'Требуется проверка',
      confidence: 'high'
    }
  },
  missed_connection: {
    id: 'missed_connection',
    title: 'Пропущена пересадка',
    severity: 'high',
    immediateActions: [
      'Не покидайте транзитную зону без подтверждения.',
      'Найдите Transfer Desk вашей авиакомпании.',
      'Подготовьте посадочные талоны всех рейсов.'
    ],
    nextActions: [
      'Обратитесь к сотруднику авиакомпании для пересадки на следующий рейс.',
      'Узнайте о предоставлении отеля при ожидании более 8 часов.',
      'Сохраните все чеки на необходимые расходы.'
    ],
    dontDo: [
      'Не проходите паспортный контроль без необходимости.',
      'Не покупайте новые билеты самостоятельно без согласования.'
    ],
    phrase: {
      ru: 'Я ПРОПУСТИЛ ПЕРЕСАДКУ. ПОМОГИТЕ НАЙТИ СТОЙКУ АВИАКОМПАНИИ И ОФОРМИТЬ СЛЕДУЮЩИЙ РЕЙС.',
      en: 'I MISSED MY CONNECTION. PLEASE HELP ME FIND THE AIRLINE DESK AND BOOK THE NEXT FLIGHT.'
    },
    source: {
      name: 'Авиакомпания / Аэропорт',
      url: '',
      lastVerified: 'Требуется проверка',
      confidence: 'high'
    }
  },
  lost_passport: {
    id: 'lost_passport',
    title: 'Потерян паспорт',
    severity: 'high',
    immediateActions: [
      'Немедленно сообщите сотруднику аэропорта или полиции.',
      'Вспомните, где последний раз видели документ.',
      'Подготовьте копию паспорта или фото из телефона.'
    ],
    nextActions: [
      'Обратитесь в консульство вашей страны для получения временного документа.',
      'Подайте заявление в полицию аэропорта.',
      'Свяжитесь с авиакомпанией для изменения даты вылета.'
    ],
    dontDo: [
      'Не пытайтесь вылететь без документа.',
      'Не скрывайте факт потери от властей.'
    ],
    phrase: {
      ru: 'Я ПОТЕРЯЛ ПАСПОРТ. МНЕ НУЖНА ПОМОЩЬ. ГДЕ ПОЛИЦИЯ И КОНСУЛЬСТВО?',
      en: 'I LOST MY PASSPORT. I NEED HELP. WHERE IS THE POLICE AND THE CONSULATE?'
    },
    source: {
      name: 'Госорганы / Консульство',
      url: '',
      lastVerified: 'Требуется проверка',
      confidence: 'high'
    }
  },
  item_check: {
    id: 'item_check',
    title: 'Проверка предмета',
    severity: 'info',
    immediateActions: [
      'Укажите тип предмета и его характеристики.',
      'Уточните, ручная кладь или зарегистрированный багаж.',
      'Проверьте правила авиакомпании и аэропорта.'
    ],
    nextActions: [],
    dontDo: [
      'Не пытайтесь провезти запрещённые предметы.'
    ],
    phrase: {
      ru: 'МОЖНО ЛИ ПРОВЕЗТИ ЭТОТ ПРЕДМЕТ В РУЧНОЙ КЛАДИ?',
      en: 'CAN I CARRY THIS ITEM IN MY CARRY-ON BAGGAGE?'
    },
    source: {
      name: 'FAA / TSA / Авиакомпания',
      url: 'https://www.faa.gov/hazmat/packsafe',
      lastVerified: 'Требуется проверка',
      confidence: 'varies'
    }
  }
};

export const phrases = [
  { id: 'where_gate', ru: 'Где выход B24?', en: 'Where is gate B24?' },
  { id: 'where_checkin', ru: 'Где стойка регистрации Turkish Airlines?', en: 'Where is the Turkish Airlines check-in counter?' },
  { id: 'where_lost_found', ru: 'Где стойка потерянных вещей?', en: 'Where is the Lost & Found desk?' },
  { id: 'baggage_issue', ru: 'Мой багаж не приехал. Помогите оформить заявление.', en: 'My baggage has not arrived. Could you please help me file a report?' },
  { id: 'missed_connection', ru: 'Я пропустил пересадку. Помогите, пожалуйста.', en: 'I missed my connection. Could you please help me?' },
  { id: 'dont_understand', ru: 'Я не понимаю.', en: 'I do not understand.' },
  { id: 'no_english', ru: 'Я не говорю по-английски.', en: 'I do not speak English.' },
  { id: 'need_help', ru: 'Мне нужна помощь.', en: 'I need help.' },
  { id: 'doc_problem', ru: 'У меня проблема с документами.', en: 'I have a problem with my documents.' },
  { id: 'where_airline', ru: 'Где стойка моей авиакомпании?', en: 'Where is my airline desk?' }
];

export const rules = [
  {
    id: 'rule_lithium_powerbank_001',
    category: 'dangerous_goods',
    item_type: 'power_bank',
    country: 'US',
    baggage_type: 'carry_on',
    conditions: { capacity_wh_max: 100 },
    rule_text: 'Power banks considered spare lithium batteries must be carried in carry-on baggage only.',
    exceptions: 'Airline approval may be required for 100-160 Wh.',
    source_id: 'faa_packsafe',
    source_name: 'FAA PackSafe',
    source_url: 'https://www.faa.gov/hazmat/packsafe',
    last_verified: null,
    verification_status: 'requires_verification',
    confidence: 'high_for_us_scope'
  },
  {
    id: 'rule_lithium_powerbank_002',
    category: 'dangerous_goods',
    item_type: 'power_bank',
    country: 'US',
    baggage_type: 'checked',
    conditions: {},
    rule_text: 'Spare lithium batteries, including power banks, are not allowed in checked baggage.',
    exceptions: [],
    source_id: 'faa_packsafe',
    source_name: 'FAA PackSafe',
    source_url: 'https://www.faa.gov/hazmat/packsafe',
    last_verified: null,
    verification_status: 'requires_verification',
    confidence: 'high_for_us_scope'
  },
  {
    id: 'rule_liquids_001',
    category: 'liquids',
    item_type: 'liquid',
    country: 'US',
    baggage_type: 'carry_on',
    conditions: { max_volume_ml: 100, bag_max_liters: 1 },
    rule_text: 'Liquids must be in containers of 100ml or less, all fitting in one 1-liter transparent bag.',
    exceptions: 'Medications and baby food may have exceptions.',
    source_id: 'tsa_liquids',
    source_name: 'TSA Liquids Rule',
    source_url: 'https://www.tsa.gov/travel/security-screening/liquids-rule',
    last_verified: null,
    verification_status: 'requires_verification',
    confidence: 'high_for_us_scope'
  }
];

export const sources = [
  {
    id: 'faa_packsafe',
    name: 'FAA PackSafe',
    url: 'https://www.faa.gov/hazmat/packsafe',
    rank: 1,
    type: 'government'
  },
  {
    id: 'tsa_liquids',
    name: 'TSA Liquids Rule',
    url: 'https://www.tsa.gov/travel/security-screening/liquids-rule',
    rank: 1,
    type: 'government'
  },
  {
    id: 'ec_300_2008',
    name: 'Regulation (EC) No 300/2008',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R0300',
    rank: 2,
    type: 'legislation'
  },
  {
    id: 'wcag_21',
    name: 'W3C WCAG 2.1',
    url: 'https://www.w3.org/TR/WCAG21/',
    rank: 7,
    type: 'standard'
  },
  {
    id: 'nist_si',
    name: 'NIST SI Units',
    url: 'https://www.nist.gov/pml/owm/metric-si/si-units',
    rank: 1,
    type: 'government'
  }
];

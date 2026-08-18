import { ItemCheckRule } from '../types';

export interface BatteryCalculationResult {
  mah: number;
  voltage: number;
  wh: number;
  verdict: 'allowed_carry_on_only' | 'airline_permission_required' | 'forbidden';
  verdictTitle: string;
  verdictBadge: 'МОЖНО В РУЧНУЮ КЛАДЬ' | 'С РАЗРЕШЕНИЯ АВИАКОМПАНИИ' | 'ЗАПРЕЩЕНО К ПЕРЕВОЗКЕ';
  carryOnRule: string;
  checkedRule: string;
  maxQuantity: string;
  sourceText: string;
  ruleCode: string;
  checkedDate: string;
}

export function calculateBatteryWh(mah: number, voltage: number = 3.7): BatteryCalculationResult {
  const safeMah = Math.max(0, isNaN(mah) ? 0 : mah);
  const safeV = Math.max(0.1, isNaN(voltage) ? 3.7 : voltage);
  const wh = Number(((safeMah * safeV) / 1000).toFixed(1));

  if (wh <= 100) {
    return {
      mah: safeMah,
      voltage: safeV,
      wh,
      verdict: 'allowed_carry_on_only',
      verdictTitle: 'Разрешено в ручную кладь без согласования',
      verdictBadge: 'МОЖНО В РУЧНУЮ КЛАДЬ',
      carryOnRule: 'Разрешено до 20 штук на пассажира для личного пользования. Должна быть читаемая заводская маркировка мощности.',
      checkedRule: 'СТРОГО ЗАПРЕЩЕНО в багажном отсеке. Риск пожара (thermal runaway).',
      maxQuantity: 'До 20 шт. (для личного пользования)',
      sourceText: 'FAA PackSafe for Passengers & IATA Dangerous Goods Table 2.3.A',
      ruleCode: 'ICAO Doc 9284 / FAA 49 CFR § 175.10(a)(18)',
      checkedDate: '15.08.2026'
    };
  } else if (wh <= 160) {
    return {
      mah: safeMah,
      voltage: safeV,
      wh,
      verdict: 'airline_permission_required',
      verdictTitle: 'Требуется предварительное разрешение авиакомпании',
      verdictBadge: 'С РАЗРЕШЕНИЯ АВИАКОМПАНИИ',
      carryOnRule: 'Разрешено МАКСИМУМ 2 штуки на пассажира ТОЛЬКО в ручной клади. Требуется уведомить авиакомпанию при регистрации.',
      checkedRule: 'СТРОГО ЗАПРЕЩЕНО в багаже.',
      maxQuantity: 'Максимум 2 шт. на 1 пассажира',
      sourceText: 'IATA Lithium Battery Guidance Document & TSA Battery Rules',
      ruleCode: 'IATA DGR Table 2.3.A (100–160 Wh)',
      checkedDate: '15.08.2026'
    };
  } else {
    return {
      mah: safeMah,
      voltage: safeV,
      wh,
      verdict: 'forbidden',
      verdictTitle: 'Запрещено к перевозке пассажирскими рейсами',
      verdictBadge: 'ЗАПРЕЩЕНО К ПЕРЕВОЗКЕ',
      carryOnRule: 'ЗАПРЕЩЕНО в ручной клади (превышает 160 Вт·ч). Перевозка возможна только грузовым карго-бортом по спецдекларации опасных грузов.',
      checkedRule: 'ЗАПРЕЩЕНО в зарегистрированном багаже.',
      maxQuantity: '0 шт.',
      sourceText: 'ICAO Technical Instructions for the Safe Transport of Dangerous Goods',
      ruleCode: 'ICAO Doc 9284 / UN 3480 / UN 3481 Class 9',
      checkedDate: '15.08.2026'
    };
  }
}

export const COMMON_ITEMS_DATABASE: ItemCheckRule[] = [
  {
    id: 'powerbank',
    name: 'Внешний аккумулятор (Powerbank) до 100 Вт·ч (~27000 mAh)',
    category: 'electronics',
    carryOnAllowed: 'yes',
    checkedAllowed: 'no',
    conditionText: 'Только в ручной клади с читаемой заводской маркировкой. В багаж сдавать запрещено.',
    source: 'FAA PackSafe / ICAO Doc 9284',
    checkedDate: '15.08.2026'
  },
  {
    id: 'e_cigarette',
    name: 'Электронные сигареты, вейпы, нагреватели табака (IQOS/Glo)',
    category: 'electronics',
    carryOnAllowed: 'yes',
    checkedAllowed: 'no',
    conditionText: 'Только ручная кладь. Заряжать и использовать на борту самолёта строго запрещено. Жидкости до 100 мл.',
    source: 'FAA & IATA Passenger Safety Regulations',
    checkedDate: '14.08.2026'
  },
  {
    id: 'laptop_tablet',
    name: 'Ноутбук, планшет, портативная консоль',
    category: 'electronics',
    carryOnAllowed: 'yes',
    checkedAllowed: 'conditional',
    conditionText: 'Рекомендуется в ручной клади. При сдаче в багаж устройство должно быть полностью выключено (не в спящем режиме).',
    source: 'TSA Electronics Guidelines',
    checkedDate: '12.08.2026'
  },
  {
    id: 'liquids_under_100ml',
    name: 'Жидкости, кремы, духи, пасты до 100 мл',
    category: 'liquids',
    carryOnAllowed: 'yes',
    checkedAllowed: 'yes',
    conditionText: 'Флаконы до 100 мл в прозрачном пакете 1 л (20×20 см) — 1 пакет на пассажира. В багаже — без ограничений по объему флакона.',
    source: 'ICAO LAGs Directive',
    checkedDate: '16.08.2026'
  },
  {
    id: 'duty_free_liquids',
    name: 'Алкоголь и парфюмерия из Duty Free (>100 мл)',
    category: 'liquids',
    carryOnAllowed: 'conditional',
    checkedAllowed: 'yes',
    conditionText: 'Разрешено в ручной клади ТОЛЬКО в запечатанном опломбированном пакете STEB с видимым чеком покупки того же дня.',
    source: 'ICAO STEB Guidelines (Doc 9284)',
    checkedDate: '15.08.2026'
  },
  {
    id: 'prescription_meds',
    name: 'Жидкие рецептурные лекарства, инсулин, шприцы',
    category: 'meds',
    carryOnAllowed: 'yes',
    checkedAllowed: 'yes',
    conditionText: 'Разрешено сверх нормы 100 мл при наличии рецепта или справки от врача на имя пассажира.',
    source: 'TSA Medical Guidelines / ICAO Doc 9284',
    checkedDate: '16.08.2026'
  },
  {
    id: 'drone_quadcopter',
    name: 'Квадрокоптер / Дрон (DJI Mini, Mavic и др.)',
    category: 'electronics',
    carryOnAllowed: 'yes',
    checkedAllowed: 'conditional',
    conditionText: 'Сам дрон можно сдать в багаж, но ВСЕ литиевые аккумуляторы ОБЯЗАТЕЛЬНО вынуть и взять в ручную кладь.',
    source: 'FAA Dangerous Goods / EASA Drones Rule',
    checkedDate: '10.08.2026'
  },
  {
    id: 'scissors_knives',
    name: 'Маникюрные ножницы, перочинные ножи, штопоры',
    category: 'dangerous',
    carryOnAllowed: 'no',
    checkedAllowed: 'yes',
    conditionText: 'В ручную кладь запрещены лезвия более 6 см. В багаже разрешены в надежных защитных чехлах.',
    source: 'TSA Prohibited Items List / ICAO Annex 17',
    checkedDate: '14.08.2026'
  },
  {
    id: 'lighter_matches',
    name: 'Одна карманная зажигалка или коробок спичек',
    category: 'dangerous',
    carryOnAllowed: 'conditional',
    checkedAllowed: 'no',
    conditionText: 'Строго 1 штука на человека В КАРМАНЕ ОДЕЖДЫ. Запрещено в сданном багаже и запрещены турбо-зажигалки с синим пламенем.',
    source: 'FAA PackSafe / IATA DGR Table 2.3.A',
    checkedDate: '15.08.2026'
  },
  {
    id: 'baby_food',
    name: 'Детское питание, молоко, вода для младенца',
    category: 'food',
    carryOnAllowed: 'yes',
    checkedAllowed: 'yes',
    conditionText: 'Разрешено в ручной клади в объеме, необходимом на время перелета, при путешествии с ребенком до 2 лет.',
    source: 'ICAO Facilitation Annex 9 & TSA Rules',
    checkedDate: '15.08.2026'
  }
];

export const INITIAL_ITINERARY = {
  id: 'itin-01',
  routeTitle: 'Москва → Стамбул → Берлин',
  currentLegIndex: 0,
  pnr: 'TK789V',
  passengerName: 'ALEKSANDR SMIRNOV',
  checkedBaggagePieces: 1,
  legs: [
    {
      id: 'leg-1',
      airline: 'Turkish Airlines',
      flightNumber: 'TK 414',
      fromCity: 'Москва (Внуково)',
      fromCode: 'VKO',
      toCity: 'Стамбул',
      toCode: 'IST',
      departureTime: '13:45',
      boardingTime: '13:05',
      terminal: 'Terminal A',
      gate: 'Gate 22B',
      seat: '14A',
      status: 'По расписанию' as const,
      delayMinutes: 0
    },
    {
      id: 'leg-2',
      airline: 'Turkish Airlines',
      flightNumber: 'TK 1721',
      fromCity: 'Стамбул',
      fromCode: 'IST',
      toCity: 'Берлин (Бранденбург)',
      toCode: 'BER',
      departureTime: '18:20',
      boardingTime: '17:40',
      terminal: 'Main Terminal',
      gate: 'Gate F12',
      seat: '18F',
      status: 'По расписанию' as const,
      delayMinutes: 0
    }
  ]
};

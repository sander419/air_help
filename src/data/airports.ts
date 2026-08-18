// База городов и аэропортов для автоподстановки в форме маршрута.
// code — основной аэропорт (подставляется при выборе города), altCodes — остальные.
export interface Airport {
  city: string;
  code: string;
  altCodes: string[];
  country: string;
}

export const AIRPORTS: Airport[] = [
  // Россия
  { city: 'Москва', code: 'SVO', altCodes: ['VKO', 'DME'], country: 'Россия' },
  { city: 'Санкт-Петербург', code: 'LED', altCodes: [], country: 'Россия' },
  { city: 'Казань', code: 'KZN', altCodes: [], country: 'Россия' },
  { city: 'Сочи', code: 'AER', altCodes: [], country: 'Россия' },
  { city: 'Екатеринбург', code: 'SVX', altCodes: [], country: 'Россия' },
  { city: 'Новосибирск', code: 'OVB', altCodes: [], country: 'Россия' },
  { city: 'Калининград', code: 'KGD', altCodes: [], country: 'Россия' },
  { city: 'Краснодар', code: 'KRR', altCodes: [], country: 'Россия' },
  { city: 'Минеральные Воды', code: 'MRV', altCodes: [], country: 'Россия' },
  { city: 'Владивосток', code: 'VVO', altCodes: [], country: 'Россия' },
  // Ближнее зарубежье
  { city: 'Минск', code: 'MSQ', altCodes: [], country: 'Беларусь' },
  { city: 'Алматы', code: 'ALA', altCodes: [], country: 'Казахстан' },
  { city: 'Астана', code: 'NQZ', altCodes: [], country: 'Казахстан' },
  { city: 'Ташкент', code: 'TAS', altCodes: [], country: 'Узбекистан' },
  { city: 'Ереван', code: 'EVN', altCodes: [], country: 'Армения' },
  { city: 'Тбилиси', code: 'TBS', altCodes: [], country: 'Грузия' },
  { city: 'Баку', code: 'GYD', altCodes: [], country: 'Азербайджан' },
  // Турция и Ближний Восток
  { city: 'Стамбул', code: 'IST', altCodes: ['SAW'], country: 'Турция' },
  { city: 'Анталья', code: 'AYT', altCodes: [], country: 'Турция' },
  { city: 'Дубай', code: 'DXB', altCodes: [], country: 'ОАЭ' },
  { city: 'Абу-Даби', code: 'AUH', altCodes: [], country: 'ОАЭ' },
  { city: 'Доха', code: 'DOH', altCodes: [], country: 'Катар' },
  { city: 'Тель-Авив', code: 'TLV', altCodes: [], country: 'Израиль' },
  // Европа
  { city: 'Берлин', code: 'BER', altCodes: [], country: 'Германия' },
  { city: 'Франкфурт', code: 'FRA', altCodes: [], country: 'Германия' },
  { city: 'Мюнхен', code: 'MUC', altCodes: [], country: 'Германия' },
  { city: 'Лондон', code: 'LHR', altCodes: ['LGW', 'STN'], country: 'Великобритания' },
  { city: 'Париж', code: 'CDG', altCodes: ['ORY'], country: 'Франция' },
  { city: 'Амстердам', code: 'AMS', altCodes: [], country: 'Нидерланды' },
  { city: 'Рим', code: 'FCO', altCodes: [], country: 'Италия' },
  { city: 'Милан', code: 'MXP', altCodes: ['LIN'], country: 'Италия' },
  { city: 'Барселона', code: 'BCN', altCodes: [], country: 'Испания' },
  { city: 'Мадрид', code: 'MAD', altCodes: [], country: 'Испания' },
  { city: 'Вена', code: 'VIE', altCodes: [], country: 'Австрия' },
  { city: 'Прага', code: 'PRG', altCodes: [], country: 'Чехия' },
  { city: 'Варшава', code: 'WAW', altCodes: [], country: 'Польша' },
  { city: 'Будапешт', code: 'BUD', altCodes: [], country: 'Венгрия' },
  { city: 'Белград', code: 'BEG', altCodes: [], country: 'Сербия' },
  { city: 'Афины', code: 'ATH', altCodes: [], country: 'Греция' },
  { city: 'Хельсинки', code: 'HEL', altCodes: [], country: 'Финляндия' },
  { city: 'Стокгольм', code: 'ARN', altCodes: [], country: 'Швеция' },
  { city: 'Осло', code: 'OSL', altCodes: [], country: 'Норвегия' },
  { city: 'Копенгаген', code: 'CPH', altCodes: [], country: 'Дания' },
  { city: 'Женева', code: 'GVA', altCodes: [], country: 'Швейцария' },
  { city: 'Цюрих', code: 'ZRH', altCodes: [], country: 'Швейцария' },
  { city: 'Лиссабон', code: 'LIS', altCodes: [], country: 'Португалия' },
  // Азия
  { city: 'Пекин', code: 'PEK', altCodes: ['PKX'], country: 'Китай' },
  { city: 'Шанхай', code: 'PVG', altCodes: [], country: 'Китай' },
  { city: 'Токио', code: 'HND', altCodes: ['NRT'], country: 'Япония' },
  { city: 'Сеул', code: 'ICN', altCodes: [], country: 'Южная Корея' },
  { city: 'Бангкок', code: 'BKK', altCodes: [], country: 'Таиланд' },
  { city: 'Сингапур', code: 'SIN', altCodes: [], country: 'Сингапур' },
  { city: 'Гонконг', code: 'HKG', altCodes: [], country: 'Китай' },
  { city: 'Денпасар (Бали)', code: 'DPS', altCodes: [], country: 'Индонезия' },
  { city: 'Пхукет', code: 'HKT', altCodes: [], country: 'Таиланд' },
  { city: 'Мале (Мальдивы)', code: 'MLE', altCodes: [], country: 'Мальдивы' },
  { city: 'Ханой', code: 'HAN', altCodes: [], country: 'Вьетнам' },
  // Америка
  { city: 'Нью-Йорк', code: 'JFK', altCodes: ['EWR'], country: 'США' },
  { city: 'Лос-Анджелес', code: 'LAX', altCodes: [], country: 'США' },
  { city: 'Чикаго', code: 'ORD', altCodes: [], country: 'США' },
  { city: 'Майами', code: 'MIA', altCodes: [], country: 'США' },
  { city: 'Вашингтон', code: 'IAD', altCodes: [], country: 'США' },
  { city: 'Торонто', code: 'YYZ', altCodes: [], country: 'Канада' },
];

// Список уникальных названий городов для <datalist>
export const AIRPORT_CITIES: string[] = AIRPORTS.map((a) => a.city);

// Список всех кодов (основной + альтернативные) для <datalist>
export const AIRPORT_CODES: string[] = AIRPORTS.flatMap((a) => [a.code, ...a.altCodes]);

// Найти аэропорт по городу (нестрогое совпадение)
export const findAirportByCity = (city: string): Airport | undefined =>
  AIRPORTS.find((a) => a.city.toLowerCase() === city.trim().toLowerCase());

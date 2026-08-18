export type StageId = 'airport_arrival' | 'check_in' | 'security' | 'passport_control' | 'gate' | 'boarding';

export type StageState = 'completed' | 'current' | 'upcoming';

export interface StageInfo {
  id: StageId;
  order: number;
  name: string;
  nameEn: string;
  locationHint: string;
  typicalDurationMin: number;
  recommendation: string;
  immediateSteps: [string, string, string];
  prohibitions: string[];
  source: {
    name: string;
    ruleCode: string;
    checkedDate: string;
    confidence: 'Высокая (регламент ICAO/IATA)' | 'Стандартная практика аэропортов' | 'Правила авиакомпании';
  };
}

export type ProblemCategory = 'flight' | 'baggage' | 'documents' | 'security' | 'communication';

export type Severity = 'info' | 'warning' | 'high';

export interface ProblemItem {
  id: string;
  category: ProblemCategory;
  title: string;
  shortDesc: string;
  severity: Severity;
  severityLabel: string;
  immediateSteps: [string, string, string];
  doNotDo: string[];
  employeePhraseEn: string;
  employeePhraseRu: string;
  employeePhraseNotes?: string;
  nextActions: {
    title: string;
    content: string[];
  };
  source: {
    name: string;
    ruleCode: string;
    checkedDate: string;
    confidenceLevel: 'Высокая (международная конвенция)' | 'Высокая (ФАП РФ №82 / Регламент ЕС 261)' | 'Стандарт IATA Res 753' | 'Правила безопасности TSA/ICAO' | 'Стандартная практика аэропортов' | 'Официальное правило авиакомпании' | 'Не могу подтвердить';
  };
}

export interface FlightLeg {
  id: string;
  airline: string;
  flightNumber: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureTime: string;
  boardingTime: string;
  terminal: string;
  gate: string;
  seat: string;
  status: 'На регистрации' | 'Посадка' | 'По расписанию' | 'Задержан' | 'Гейт изменён';
  delayMinutes?: number;
}

export interface FlightItinerary {
  id: string;
  routeTitle: string;
  currentLegIndex: number;
  legs: FlightLeg[];
  pnr: string;
  passengerName: string;
  checkedBaggagePieces: number;
}

export interface ItemCheckRule {
  id: string;
  name: string;
  category: 'electronics' | 'liquids' | 'meds' | 'dangerous' | 'personal' | 'food';
  carryOnAllowed: 'yes' | 'no' | 'conditional';
  checkedAllowed: 'yes' | 'no' | 'conditional';
  conditionText: string;
  source: string;
  checkedDate: string;
}

export type ActiveScreen = 
  | 'dashboard'
  | 'what_now'
  | 'problem_categories'
  | 'problem_detail'
  | 'employee_mode'
  | 'check_item'
  | 'flight_details'
  | 'documents_vault'
  | 'phrasebook';

import React from 'react';
import { useWeatherWithCache } from '../hooks/useWeatherWithCache';

// WMO weather codes → русский текст (Open-Meteo)
const WEATHER_CODES: Record<number, string> = {
  0: 'Ясно',
  1: 'Преимущественно ясно',
  2: 'Переменная облачность',
  3: 'Пасмурно',
  45: 'Туман',
  48: 'Иней, туман',
  51: 'Лёгкая морось',
  53: 'Морось',
  55: 'Сильная морось',
  61: 'Небольшой дождь',
  63: 'Дождь',
  65: 'Сильный дождь',
  66: 'Ледяной дождь',
  67: 'Сильный ледяной дождь',
  71: 'Небольшой снег',
  73: 'Снег',
  75: 'Сильный снег',
  77: 'Снежная крупа',
  80: 'Ливень',
  81: 'Сильный ливень',
  82: 'Тропический ливень',
  85: 'Снегопад',
  86: 'Сильный снегопад',
  95: 'Гроза',
  96: 'Гроза с градом',
  99: 'Сильная гроза с градом'
};

interface WeatherState {
  temperature: number;
  description: string;
  windSpeedMs: number;
  timezoneOffset: number;
  updatedAt: number;
}

interface WeatherCardProps {
  city: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ city }) => {
  const { data, loading, error } = useWeatherWithCache(city);

  return (
    <div className="bg-white border-2 border-black p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-2xl shrink-0">
          {loading ? '🔄' : error ? '❌' : data ? '🌤️' : '🌡️'}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
            ПОГОДА СЕЙЧАС
          </span>
          <span className="text-sm font-black uppercase text-black block truncate">
            {city}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        {loading && (
          <span className="text-sm font-bold text-gray-500 uppercase">Загрузка…</span>
        )}
        {error && (
          <span className="text-sm font-bold text-gray-500 uppercase">Нет данных (офлайн)</span>
        )}
        {data && (
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black tabular-nums text-black leading-none">
              {data.temperature}°
            </div>
            <div className="text-right">
              <span className="text-sm font-black uppercase text-black block leading-tight">
                {data.description}
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500 block">
                ветер {data.windSpeedMs} м/с{data.timezoneOffset ? ` • UTC${data.timezoneOffset >= 0 ? '+' : ''}${data.timezoneOffset / 3600}` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
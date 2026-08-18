import React, { useState, useEffect } from 'react';

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
  temp: number;
  desc: string;
  wind: number;
  time: string;
}

interface WeatherCardProps {
  city: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ city }) => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!city || city === '—') {
      setStatus('error');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setWeather(null);

    async function load() {
      try {
        // 1. Город → координаты (бесплатный geocoding Open-Meteo)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`
        );
        const geo = await geoRes.json();
        const loc = geo.results?.[0];
        if (!loc) throw new Error('city not found');

        // 2. Координаты → текущая погода
        const fRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        const f = await fRes.json();
        if (cancelled) return;
        const cur = f.current;
        setWeather({
          temp: Math.round(cur.temperature_2m),
          desc: WEATHER_CODES[cur.weather_code] ?? '—',
          wind: Math.round(cur.wind_speed_10m),
          time: f.timezone_abbreviation || ''
        });
        setStatus('ok');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <div className="bg-white border-2 border-black p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-2xl shrink-0">
          {status === 'ok' ? '🌤️' : '🌡️'}
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
        {status === 'loading' && (
          <span className="text-sm font-bold text-gray-500 uppercase">Загрузка…</span>
        )}
        {status === 'error' && (
          <span className="text-sm font-bold text-gray-500 uppercase">Нет данных (офлайн)</span>
        )}
        {status === 'ok' && weather && (
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black tabular-nums text-black leading-none">
              {weather.temp}°
            </div>
            <div className="text-right">
              <span className="text-sm font-black uppercase text-black block leading-tight">
                {weather.desc}
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500 block">
                ветер {weather.wind} м/с{weather.time ? ` • ${weather.time}` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

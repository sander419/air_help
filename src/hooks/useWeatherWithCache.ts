import { useState, useEffect } from 'react';

// Кэшируем последний успешный запрос погоды в localStorage,
// чтобы в офлайн-режиме показывать «последняя известная» вместо «нет данных».
export function useWeatherWithCache(city: string) {
  const [data, setData] = useState<{
    temperature: number;
    description: string;
    windSpeedMs: number;
    timezoneOffset: number;
    updatedAt: number; // timestamp
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Пытаемся загрузить кэш при монтировании
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`weather-cache-${city}`);
      if (raw) {
        const cached = JSON.parse(raw);
        // Считаем кэш свежим, если не старше 2 часов
        if (Date.now() - cached.updatedAt < 2 * 60 * 60 * 1000) {
          setData(cached);
        }
      }
    } catch {
      // кэш битый или localStorage недоступен — игнорируем
    }
  }, [city]);

  // Основная логика загрузки погоды
  useEffect(() => {
    if (!city) return;

    let cancelled = false;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // Геокодинг: получаем координаты города
        const geoResp = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=1&language=ru&format=json`
        );
        if (!geoResp.ok) throw new Error('Geo failed');
        const geo = await geoResp.json();
        if (!geo.results?.[0]) throw new Error('City not found');
        const { latitude, longitude } = geo.results[0];

        // Погода: текущие данные с ветром в м/с
        const weatherResp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=auto`
        );
        if (!weatherResp.ok) throw new Error('Weather failed');
        const weather = await weatherResp.json();

        const wmoCodes: Record<number, string> = {
          0: 'Ясно',
          1: 'Преимущественно ясно',
          2: 'Пасмурно',
          3: 'Облачно',
          45: 'Туман',
          48: 'Иней',
          51: 'Лёгкая морось',
          53: 'Умеренная морось',
          55: 'Интенсивная морось',
          56: 'Лёгкий ледяной дождь',
          57: 'Интенсивный ледяной дождь',
          61: 'Незначительный дождь',
          63: 'Умеренный дождь',
          65: 'Сильный дождь',
          66: 'Лёгкий ледяной дождь',
          67: 'Интенсивный ледяной дождь',
          71: 'Незначительный снегопад',
          73: 'Умеренный снегопад',
          75: 'Сильный снегопад',
          77: 'Снежные крупы',
          80: 'Лёгкий ливень с дождём',
          81: 'Умеренный ливень с дождём',
          82: 'Сильный ливень с дождём',
          85: 'Лёгкий ледяной ливень',
          86: 'Умеренный ледяной ливень',
          87: 'Сильный ледяной ливень',
          95: 'Гроза',
          96: 'Гроза с градом',
          99: 'Гроза с сильным градом',
        };

        const payload = {
          temperature: Math.round(weather.current.temperature_2m),
          description: wmoCodes[weather.current.weather_code] ?? 'Неизвестно',
          windSpeedMs: Math.round(weather.current.wind_speed_10m * 10) / 10,
          timezoneOffset: weather.utc_offset_seconds,
          updatedAt: Date.now(),
        };

        if (!cancelled) {
          setData(payload);
          setLoading(false);
          // Сохраняем в кэш
          try {
            localStorage.setItem(
              `weather-cache-${city}`,
              JSON.stringify(payload)
            );
          } catch {
            // квота недоступна — молча продолжаем
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
          // даже при ошибке стараемся показать старый кэш, если есть
        }
      }
    };

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return { data, loading, error };
}
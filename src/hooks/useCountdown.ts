import { useState, useEffect } from 'react';

/**
 * Считает оставшееся время до указанного момента в формате HH:MM.
 * Принимает время в формате HH:MM (строкой) и опциональную дату (по умолчанию сегмента).
 * Если время в прошлом — возвращает '00:00'.
 */
export function useCountdown(targetTimeStr: string, referenceDate?: Date): string {
  const [timeLeft, setTimeLeft] = useState<string>('00:00');

  useEffect(() => {
    const update = () => {
      const now = referenceDate ?? new Date();
      // Парсим HH:MM из строки, предполагаем сегодняшнюю дату
      const [hoursStr, minutesStr] = targetTimeStr.split(':');
      const targetHours = parseInt(hoursStr, 10);
      const targetMinutes = parseInt(minutesStr, 10);
      const target = new Date(now);
      target.setHours(targetHours, targetMinutes, 0, 0);

      // Если время уже прошло сегодня — считаем, что рейс уехал
      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const minutes = String(totalMinutes % 60).padStart(2, '0');
      setTimeLeft(`${hours}:${minutes}`);
    };

    // Обновляем каждую минуту
    const id = setInterval(update, 60_000);
    update(); // начальный расчёт
    return () => clearInterval(id);
  }, [targetTimeStr, referenceDate]);

  return timeLeft;
}
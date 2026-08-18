import { useState, useEffect } from 'react';

// Состояние, которое переживает перезагрузку страницы (localStorage).
// Всё, что пользователь ввёл руками, не должно пропадать при перезаходе.
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage недоступен (приватный режим, квота) — молча работаем без персистентности
    }
  }, [key, value]);

  return [value, setValue];
}

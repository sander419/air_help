# Airport Copilot

Offline-first компаньон пассажира в аэропорту. Отвечает на три вопроса:
что происходит, что делать сейчас, что делать нельзя — с проверяемыми источниками у каждого совета.

## Стек

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- lucide-react (иконки)

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production-сборка в dist/
```

## Экраны

- **Dashboard** — маршрут, таймер до вылета, таймлайн 6 этапов
- **What Now?** — 3 ближайших шага на текущем этапе
- **Problem Categories** — 5 категорий, 26 проблемных сценариев
- **Problem Detail** — immediate / don't-do / next actions + источник
- **Employee Mode** — белый экран, фраза 32px, TTS + копирование
- **Check Item** — детерминированный расчёт Wh = mAh × V / 1000

## Принципы

- Offline-first, явный индикатор статуса
- Честность данных: источник и дата проверки у каждого правила
- Крупные touch-таргеты, высокий контраст
- Детерминированные расчёты (не LLM)

## Деплой

Статический билд (`dist/`). Раздаётся nginx на `demo.hiborg-space.ru`
(VPS `/var/www/air-help/`).

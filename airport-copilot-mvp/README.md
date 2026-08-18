# Airport Copilot MVP v1.3.0

**Интерактивный прототип приложения для путешественников в аэропортах**

## 🎯 Продуктовые принципы

- **Что происходит?** — Ясный статус на любом экране
- **Что делать сейчас?** — Максимум 3 ближайших шага
- **Честность данных** — «Я не могу это подтвердить» для неподтверждённой информации
- **Source citation** — Каждое правило с источником и датой проверки
- **Offline-first** — Работа без интернета с явным индикатором
- **Accessibility** — Touch targets ≥48px, высокий контраст, крупный шрифт

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Dev сервер
npm run dev

# Production сборка
npm run build
```

## 📱 Экраны MVP

| Экран | Описание |
|-------|----------|
| Dashboard | Главная с этапом поездки, офлайн-индикатором |
| What Now? | 3 шага на текущем этапе пути |
| Problem Categories | 5 категорий, 25+ проблемных сценариев |
| Problem Detail | Immediate/next actions, dont-do, source |
| Employee Mode | Крупный текст (32pt), TTS, clipboard |
| Check Item | Детерминированный расчёт Wh = mAh × V / 1000 |

## 🏗️ Архитектура

```
src/
├── components/       # React компоненты экранов
├── context/          # AppContext (глобальное состояние)
├── core/             # Ядро системы
│   ├── RuleEngine.js              # Проверка правил с приоритетами
│   ├── NotificationEngine.js      # Умные уведомления
│   └── OfflinePackageManager.js   # Офлайн-пакеты
├── hooks/            # Custom hooks
│   ├── useRuleChecker.js          # Проверка предметов
│   ├── useProblemSolver.js        # Управление проблемами
│   ├── useOfflineStatus.js        # Статус офлайн-режима
│   ├── usePhrases.js              # Фразы и перевод
│   ├── useNotifications.js        # Уведомления
│   └── useFlightTimer.js          # Таймер до вылета
├── services/api/     # Внешние API
│   └── FlightService.js           # Данные рейсов + risk assessment
├── data/             # Моковые данные
└── utils/            # Утилиты
```

## 🔧 Технические особенности

### Детерминированные расчёты
```javascript
// Wh = mAh × V / 1000 (не LLM!)
const capacityWh = (capacityMah * voltage) / 1000;
```

### Приоритет источников (8 уровней)
1. Государственный орган
2. Официальное законодательство
3. Официальный аэропорт
4. Официальная авиакомпания
5. Пограничный/таможенный орган
6. Авиационный регулятор
7. Международный стандарт
8. Вторичные источники

### Офлайн-режим
- Синхронизация при подключении
- Явное отображение даты последней синхронизации
- Fallback на моковые данные при отсутствии API

### Уведомления
События: `FlightDelayed`, `FlightCancelled`, `GateChanged`, `BoardingStarted`, `ConnectionRisk`, `BaggageIssue`

Каждое событие имеет: `severity`, `urgency`, `confidence`

## 📊 Метрики сборки

```
Размер: 178 KB (58 KB gzip)
Время сборки: ~3 сек
Модулей: 344
```

## 🎨 Accessibility

- ✅ Touch targets ≥48×48 px
- ✅ Контрастность по WCAG 2.1
- ✅ Критическая информация не только цветом
- ✅ Режим одной руки
- ✅ Озвучка фраз (TTS)

## 📋 Сценарии проблем (15+)

1. Первый перелёт
2. Не знаю, куда идти
3. Опоздание
4. Изменение Gate
5. Задержка рейса
6. Отмена рейса
7. Багаж не приехал
8. Багаж повреждён
9. Пропущенная пересадка
10. Потеря документа
11. Проблема с ручной кладью
12. Жидкости
13. Аккумулятор
14. Power bank
15. Не знаю английский

## 🔮 Roadmap

### Phase 1 (готово) ✅
- Trip management
- Problem mode
- Rule engine
- Offline package

### Phase 2 (в работе) 🚧
- Реальные Flight API
- Gate changes
- Notifications push
- Карты аэропортов

### Phase 3 (план) 📅
- Голосовой AI
- Перевод в реальном времени
- Vision для распознавания предметов
- Предиктивные предупреждения

### Phase 4 (будущее) 🔮
- B2B API
- White-label
- Интеграция с авиакомпаниями

## 📄 Источники правил

| Правило | Источник | URL |
|---------|----------|-----|
| Литиевые батареи | FAA PackSafe | https://www.faa.gov/hazmat/packsafe |
| Жидкости 3-1-1 | TSA | https://www.tsa.gov/travel/security-screening/liquids-rule |
| Авиабезопасность ЕС | Regulation (EC) No 300/2008 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R0300 |
| Accessibility | W3C WCAG 2.1 | https://www.w3.org/TR/WCAG21/ |
| Единицы SI | NIST | https://www.nist.gov/pml/owm/metric-si/si-units |

## 🛠️ Технологии

- React 18
- Vite
- date-fns
- nanoid
- Web Speech API (TTS)
- IndexedDB (офлайн-хранилище)

## 📝 Лицензия

Прототип создан для демонстрации продуктовой спецификации Airport Copilot.

---

**Главная ценность:** снижение неопределённости в стрессовой ситуации.

> Airport Copilot не должен пытаться знать абсолютно всё.  
> Он должен очень хорошо отвечать на один вопрос:  
> **«Что мне делать прямо сейчас?»**

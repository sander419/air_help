import React, { useState } from 'react';
import { rules } from '../data/mockData.js';
import { styles, Icons } from '../utils/styles.jsx';
import { calculateWh, checkPowerBankRules, validateItemParams } from '../utils/helpers.js';

// Экран проверки предмета (Check Item)
export function CheckItem({ onBack }) {
  const [itemType, setItemType] = useState('power_bank');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('3.7');
  const [wh, setWh] = useState('');
  const [baggageType, setBaggageType] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleCalculate = () => {
    setErrors([]);
    setResult(null);

    const params = {
      itemType,
      capacity: capacity ? parseFloat(capacity) : null,
      voltage: voltage ? parseFloat(voltage) : null,
      wh: wh ? parseFloat(wh) : null,
      baggageType
    };

    const validationErrors = validateItemParams(params);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Детерминированный расчёт Wh
    let calculatedWh = params.wh;
    if (!calculatedWh && params.capacity && params.voltage) {
      calculatedWh = calculateWh(params.capacity, params.voltage);
    }

    if (calculatedWh === null) {
      setErrors(['Не удалось рассчитать Wh']);
      return;
    }

    // Проверка правил
    const ruleResult = checkPowerBankRules(calculatedWh, params.baggageType);
    
    setResult({
      wh: calculatedWh,
      ...ruleResult
    });
  };

  const handleReset = () => {
    setCapacity('');
    setVoltage('3.7');
    setWh('');
    setBaggageType('');
    setResult(null);
    setErrors([]);
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>

      <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>🎒 Что можно провезти?</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        Проверка правил перевозки предметов
      </p>

      {/* Тип предмета */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        Тип предмета:
      </label>
      <select
        style={styles.select}
        value={itemType}
        onChange={(e) => setItemType(e.target.value)}
      >
        <option value="power_bank">Power Bank (аккумулятор)</option>
        <option value="liquid">Жидкости</option>
        <option value="electronics">Электроника</option>
        <option value="other">Другое</option>
      </select>

      {/* Ёмкость в mAh */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        Ёмкость (mAh):
      </label>
      <input
        type="number"
        style={styles.input}
        placeholder="Например: 20000"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        disabled={!!wh}
      />

      {/* Напряжение */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        Напряжение (V):
      </label>
      <input
        type="number"
        step="0.1"
        style={styles.input}
        placeholder="Например: 3.7"
        value={voltage}
        onChange={(e) => setVoltage(e.target.value)}
        disabled={!!wh || !capacity}
      />

      {/* Или сразу Wh */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        Или энергия (Wh), если известна:
      </label>
      <input
        type="number"
        step="0.1"
        style={styles.input}
        placeholder="Например: 74"
        value={wh}
        onChange={(e) => setWh(e.target.value)}
      />

      {/* Тип багажа */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        Тип багажа:
      </label>
      <select
        style={styles.select}
        value={baggageType}
        onChange={(e) => setBaggageType(e.target.value)}
      >
        <option value="">Выберите тип багажа</option>
        <option value="carry_on">Ручная кладь (Carry-on)</option>
        <option value="checked">Зарегистрированный багаж (Checked)</option>
      </select>

      {/* Ошибки валидации */}
      {errors.length > 0 && (
        <div style={{ ...styles.alertBox, backgroundColor: '#fee2e2', color: '#991b1b', borderLeftColor: '#dc2626' }}>
          <strong>Я не могу это подтвердить.</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Результат */}
      {result && (
        <div style={styles.resultBox}>
          <div style={styles.infoRow}>
            <span>Предмет:</span>
            <span>{itemType === 'power_bank' ? 'Power Bank' : itemType}</span>
          </div>
          
          {capacity && (
            <div style={styles.infoRow}>
              <span>Ёмкость:</span>
              <span>{capacity} mAh</span>
            </div>
          )}
          
          {voltage && capacity && (
            <div style={styles.infoRow}>
              <span>Напряжение:</span>
              <span>{voltage} V</span>
            </div>
          )}
          
          <div style={styles.infoRow}>
            <span>Энергия:</span>
            <span style={{ fontWeight: '600' }}>{result.wh.toFixed(1)} Wh</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '16px 0' }} />

          {result.allowed === true && (
            <div style={styles.resultAllowed}>
              ✅ Разрешено
            </div>
          )}
          
          {result.allowed === false && (
            <div style={styles.resultDenied}>
              ❌ Запрещено
            </div>
          )}
          
          {result.allowed === 'requires_approval' && (
            <div style={styles.resultWarning}>
              ⚠️ Требуется одобрение авиакомпании
            </div>
          )}

          <p style={{ margin: '8px 0', lineHeight: '1.5' }}>{result.reason}</p>

          {result.source && (
            <div style={styles.sourceBox}>
              <p style={{ margin: '0 0 4px 0' }}>Источник: {result.source}</p>
              <p style={{ margin: 0 }}>Confidence: {result.confidence}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                ⚠️ Проверьте правила вашей авиакомпании перед вылетом.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Кнопки действий */}
      {!result ? (
        <button
          style={{ ...styles.button, ...styles.buttonLarge }}
          onClick={handleCalculate}
        >
          🔍 Проверить правило
        </button>
      ) : (
        <button
          style={{ ...styles.button, ...styles.buttonSecondary, ...styles.buttonLarge }}
          onClick={handleReset}
        >
          🔄 Проверить другой предмет
        </button>
      )}

      {/* Информация о детерминированном расчёте */}
      <div style={styles.sourceBox}>
        <p style={{ margin: 0, fontSize: '11px' }}>
          💡 Расчёт Wh выполняется по формуле: Wh = mAh × V / 1000
          <br />
          Источник единиц измерения: NIST SI Units
        </p>
      </div>
    </div>
  );
}

// Заглушки для других экранов MVP
export function FlightDetails({ onBack }) {
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>
      <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>✈️ Мой рейс</h2>
      <div style={styles.card}>
        <p style={{ color: '#94a3b8' }}>TK416 • Москва → Стамбул → Берлин</p>
        <p style={{ fontSize: '24px', fontWeight: '600', margin: '8px 0' }}>18:45</p>
        <p style={{ color: '#f59e0b' }}>⚠️ Статус требует обновления из Flight API</p>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
        В MVP показаны моковые данные. Для production требуется интеграция с Flight API.
      </p>
    </div>
  );
}

export function Documents({ onBack }) {
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>
      <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>🛂 Документы</h2>
      <div style={styles.card}>
        <p style={{ fontWeight: '600', marginBottom: '8px' }}>Необходимые документы:</p>
        <ul style={styles.stepList}>
          <li style={styles.stepItem}>✅ Паспорт (действующий)</li>
          <li style={styles.stepItem}>✅ Посадочный талон</li>
          <li style={styles.stepItem}>⚠️ Виза (проверьте требования Турции и Германии)</li>
          <li style={styles.stepItem}>📋 Страховка (рекомендуется)</li>
        </ul>
      </div>
      <div style={styles.sourceBox}>
        <p style={{ margin: 0 }}>
          ⚠️ Требования к визам могут измениться. Проверьте актуальную информацию 
          на официальном сайте консульства.
        </p>
      </div>
    </div>
  );
}

export function AirportMap({ onBack }) {
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>
      <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>🗺️ Аэропорт</h2>
      <div style={{ ...styles.card, textAlign: 'center', padding: '48px 16px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
        <p style={{ color: '#94a3b8' }}>Карта аэропорта будет доступна в Phase 2</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Требуется загрузка карт терминалов</p>
      </div>
    </div>
  );
}

export function Translator({ onBack }) {
  const [selectedPhrase, setSelectedPhrase] = useState(null);

  const commonPhrases = [
    { ru: 'Где выход B24?', en: 'Where is gate B24?' },
    { ru: 'Где стойка регистрации?', en: 'Where is the check-in counter?' },
    { ru: 'Я не понимаю.', en: 'I do not understand.' },
    { ru: 'Мне нужна помощь.', en: 'I need help.' }
  ];

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>
      <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>🌍 Переводчик</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Частые фразы в аэропорту</p>

      {commonPhrases.map((phrase, index) => (
        <div key={index} style={styles.card}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{phrase.ru}</p>
          <p style={{ margin: '0 0 12px 0', color: '#94a3b8' }}>{phrase.en}</p>
          <button
            style={{ ...styles.button, marginBottom: 0, padding: '12px' }}
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(phrase.en);
              utterance.lang = 'en-US';
              window.speechSynthesis.speak(utterance);
            }}
          >
            🔊 Озвучить
          </button>
        </div>
      ))}
    </div>
  );
}

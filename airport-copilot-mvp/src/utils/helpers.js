// Утилиты для Airport Copilot MVP

/**
 * Детерминированный расчёт энергии в Wh
 * Формула: Wh = mAh × V / 1000
 * Источник: NIST SI Units
 */
export function calculateWh(mah, voltage) {
  if (typeof mah !== 'number' || typeof voltage !== 'number') {
    return null;
  }
  if (mah <= 0 || voltage <= 0) {
    return null;
  }
  return (mah * voltage) / 1000;
}

/**
 * Проверка допустимости power bank по правилам FAA
 */
export function checkPowerBankRules(wh, baggageType) {
  const result = {
    allowed: false,
    reason: '',
    confidence: 'low',
    source: 'Требуется проверка источника'
  };

  if (wh === null || isNaN(wh)) {
    result.reason = 'Недостаточно данных для расчёта';
    return result;
  }

  if (baggageType === 'checked') {
    result.allowed = false;
    result.reason = 'Spare lithium batteries запрещены в зарегистрированном багаже';
    result.confidence = 'high_for_us_scope';
    result.source = 'FAA PackSafe';
    return result;
  }

  if (baggageType === 'carry_on') {
    if (wh <= 100) {
      result.allowed = true;
      result.reason = 'Разрешено при соблюдении условий';
      result.confidence = 'high_for_us_scope';
      result.source = 'FAA PackSafe';
    } else if (wh <= 160) {
      result.allowed = 'requires_approval';
      result.reason = 'Требуется одобрение авиакомпании';
      result.confidence = 'medium';
      result.source = 'FAA PackSafe';
    } else {
      result.allowed = false;
      result.reason = 'Превышен лимит 160 Wh';
      result.confidence = 'high_for_us_scope';
      result.source = 'FAA PackSafe';
    }
    return result;
  }

  result.reason = 'Не указан тип багажа';
  return result;
}

/**
 * Озвучка текста (Text-to-Speech)
 */
export function speakText(text, language = 'en-US') {
  if (!window.speechSynthesis) {
    console.warn('Speech Synthesis not supported');
    return false;
  }

  // Отмена предыдущей речи
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Копирование в буфер обмена
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Форматирование даты для офлайн-индикатора
 */
export function formatOfflineDate(date) {
  if (!date) return 'Дата неизвестна';
  const d = new Date(date);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Определение уровня серьёзности проблемы
 */
export function getSeverityColor(severity) {
  switch (severity) {
    case 'high':
      return '#dc2626'; // red-600
    case 'warning':
      return '#f59e0b'; // amber-500
    case 'info':
      return '#3b82f6'; // blue-500
    default:
      return '#64748b'; // slate-500
  }
}

/**
 * Валидация параметров предмета
 */
export function validateItemParams(params) {
  const errors = [];
  
  if (!params.itemType) {
    errors.push('Тип предмета не указан');
  }
  
  if (!params.capacity && !params.wh) {
    errors.push('Ёмкость не указана (mAh или Wh)');
  }
  
  if (params.capacity && !params.voltage) {
    errors.push('Напряжение не указано для расчёта Wh');
  }
  
  if (!params.baggageType) {
    errors.push('Тип багажа не указан (ручная кладь или зарегистрированный)');
  }
  
  return errors;
}

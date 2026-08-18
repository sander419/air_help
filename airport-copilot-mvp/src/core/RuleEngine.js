/**
 * Airport Copilot - Core Knowledge Engine
 * Детерминированная система правил с верификацией источников
 */

import { sources } from '../data/mockData';

// Приоритет источников (см. спецификацию п.15)
const SOURCE_PRIORITY = {
  GOVERNMENT: 1,
  LEGISLATION: 2,
  AIRPORT_OFFICIAL: 3,
  AIRLINE_OFFICIAL: 4,
  BORDER_CUSTOMS: 5,
  AVIATION_REGULATOR: 6,
  INTERNATIONAL_STANDARD: 7,
  SECONDARY: 8
};

class RuleEngine {
  constructor() {
    this.rules = [];
    this.verificationRecords = [];
  }

  /**
   * Добавление правила с валидацией
   */
  addRule(rule) {
    if (!rule.id || !rule.category || !rule.source_id) {
      throw new Error('Rule must have id, category, and source_id');
    }

    // Валидация статуса верификации
    if (!['verified', 'requires_verification', 'deprecated'].includes(rule.verification_status)) {
      rule.verification_status = 'requires_verification';
    }

    // Установка confidence по умолчанию
    if (!rule.confidence) {
      rule.confidence = rule.verification_status === 'verified' ? 'high' : 'low';
    }

    this.rules.push(rule);
    return rule;
  }

  /**
   * Поиск правил по контексту
   */
  findRules(context) {
    const {
      itemType,
      countryCode,
      airportId,
      airlineId,
      baggageType
    } = context;

    return this.rules.filter(rule => {
      //匹配 item type
      if (itemType && rule.item_type && rule.item_type !== itemType) {
        return false;
      }

      //匹配 country (если указано в правиле)
      if (countryCode && rule.country && rule.country !== countryCode) {
        // Правила без страны считаются универсальными
        if (rule.country !== null && rule.country !== undefined) {
          return false;
        }
      }

      //匹配 airport (если указано в правиле)
      if (airportId && rule.airport && rule.airport !== airportId) {
        if (rule.airport !== null && rule.airport !== undefined) {
          return false;
        }
      }

      //匹配 airline (если указано в правиле)
      if (airlineId && rule.airline && rule.airline !== airlineId) {
        if (rule.airline !== null && rule.airline !== undefined) {
          return false;
        }
      }

      //匹配 baggage type
      if (baggageType && rule.baggage_type && rule.baggage_type !== baggageType) {
        return false;
      }

      return true;
    });
  }

  /**
   * Разрешение конфликтов между правилами
   */
  resolveConflicts(rules) {
    if (rules.length <= 1) {
      return { resolved: rules, hasConflict: false };
    }

    // Сортировка по приоритету источника
    const sorted = [...rules].sort((a, b) => {
      const sourceA = sources.find(s => s.id === a.source_id);
      const sourceB = sources.find(s => s.id === b.source_id);
      
      const priorityA = sourceA ? SOURCE_PRIORITY[sourceA.type] || 8 : 8;
      const priorityB = sourceB ? SOURCE_PRIORITY[sourceB.type] || 8 : 8;
      
      return priorityA - priorityB;
    });

    // Проверка на противоречия
    const hasConflict = this.detectContradiction(sorted);
    
    return {
      resolved: hasConflict ? [sorted[0]] : sorted,
      hasConflict,
      conflictingRules: hasConflict ? sorted : []
    };
  }

  /**
   * Обнаружение противоречий
   */
  detectContradiction(rules) {
    if (rules.length < 2) return false;

    // Простая эвристика: если первое правило разрешает, а второе запрещает
    const firstAllows = rules[0].rule_text.toLowerCase().includes('allowed') || 
                        rules[0].rule_text.toLowerCase().includes('разрешено');
    const secondDenies = rules[1].rule_text.toLowerCase().includes('not allowed') || 
                         rules[1].rule_text.toLowerCase().includes('запрещено') ||
                         rules[1].rule_text.toLowerCase().includes('prohibited');

    return firstAllows && secondDenies;
  }

  /**
   * Генерация ответа с цитированием источника
   */
  generateResponse(rule, context) {
    const source = sources.find(s => s.id === rule.source_id);
    
    const response = {
      allowed: rule.rule_text.toLowerCase().includes('allowed') || 
               rule.rule_text.toLowerCase().includes('разрешено'),
      ruleText: rule.rule_text,
      exceptions: rule.exceptions || [],
      source: source ? {
        name: source.name,
        url: source.url,
        lastVerified: source.last_checked
      } : null,
      confidence: rule.confidence,
      verificationStatus: rule.verification_status,
      requiresVerification: rule.verification_status === 'requires_verification',
      calculatedValues: context.calculatedValues || null
    };

    return response;
  }

  /**
   * Проверка свежести данных (Freshness Policy)
   */
  checkFreshness(rule, dataType) {
    const now = new Date();
    const lastVerified = rule.last_verified ? new Date(rule.last_verified) : null;
    
    if (!lastVerified) {
      return {
        isFresh: false,
        message: 'Требуется проверка источника',
        warning: true
      };
    }

    const daysSinceVerification = (now - lastVerified) / (1000 * 60 * 60 * 24);
    
    let maxAge;
    switch (dataType) {
      case 'flight_status':
      case 'gate':
        maxAge = 0.01; // минуты
        break;
      case 'airline_baggage_rules':
      case 'item_rules':
        maxAge = 30; // дни
        break;
      case 'airport_infrastructure':
        maxAge = 90; // дни
        break;
      case 'legal_documents':
        maxAge = 365; // дни, но требует проверки при изменении
        break;
      default:
        maxAge = 30;
    }

    const isFresh = daysSinceVerification <= maxAge;
    
    return {
      isFresh,
      daysSinceVerification: Math.round(daysSinceVerification),
      maxAge,
      warning: !isFresh,
      message: isFresh 
        ? 'Данные актуальны' 
        : `Последняя проверка: ${lastVerified.toLocaleDateString()}. Требуется обновление.`
    };
  }
}

// Экспорт синглтона
export const ruleEngine = new RuleEngine();
export default ruleEngine;

import React, { useState } from 'react';
import { trip, problemCategories, problemScenarios, phrases } from '../data/mockData.js';
import { styles, Icons } from '../utils/styles.jsx';
import { speakText, copyToClipboard } from '../utils/helpers.js';

// Главный экран Trip Dashboard
export function Dashboard({ onNavigate }) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Airport Copilot</h1>
        <span style={styles.offlineBadge}>📴 Офлайн: {trip.offlineDate}</span>
      </header>

      {/* Trip Info */}
      <div style={styles.card}>
        <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '14px' }}>Куда летим?</p>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{trip.route}</h2>
        <p style={{ margin: '0 0 16px 0', color: '#94a3b8' }}>
          {trip.airline} • {trip.flightNumber}
        </p>
        <p style={{ margin: '0 0 4px 0' }}>Сегодня, {trip.departureTime}</p>
        <p style={{ margin: '0', color: '#3b82f6', fontWeight: '600' }}>До вылета: {trip.timeToDeparture}</p>
      </div>

      {/* Stages */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ ...styles.sectionTitle, marginTop: '0' }}>Этап:</p>
        {trip.stages.map((stage) => (
          <div
            key={stage.id}
            style={{
              ...styles.stageItem,
              ...(stage.current ? styles.stageCurrent : {}),
              ...(stage.done ? styles.stageDone : {})
            }}
          >
            <div
              style={{
                ...styles.stageDot,
                ...(stage.done ? styles.stageDotDone : {}),
                ...(stage.current ? styles.stageDotCurrent : {})
              }}
            />
            <span>{stage.label}</span>
            {stage.done && <Icons.Check />}
          </div>
        ))}
      </div>

      {/* Main Actions */}
      <button
        style={{ ...styles.button, ...styles.buttonLarge }}
        onClick={() => onNavigate('whatNow')}
      >
        ⏱️ ЧТО МНЕ ДЕЛАТЬ СЕЙЧАС?
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonLarge, ...styles.buttonDanger }}
        onClick={() => onNavigate('problems')}
      >
        🚨 У МЕНЯ ПРОБЛЕМА
      </button>

      {/* Secondary Actions */}
      <p style={styles.sectionTitle}>Быстрый доступ:</p>
      
      <button
        style={{ ...styles.button, ...styles.buttonSecondary }}
        onClick={() => onNavigate('checkItem')}
      >
        <Icons.Baggage />
        🎒 Что можно провезти?
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonSecondary }}
        onClick={() => onNavigate('flight')}
      >
        <Icons.Flight />
        ✈️ Мой рейс
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonSecondary }}
        onClick={() => onNavigate('documents')}
      >
        <Icons.Document />
        🛂 Документы
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonSecondary }}
        onClick={() => onNavigate('map')}
      >
        <Icons.Map />
        🗺️ Аэропорт
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonSecondary }}
        onClick={() => onNavigate('translator')}
      >
        <Icons.Translate />
        🌍 Переводчик
      </button>
    </div>
  );
}

// Экран "Что делать сейчас?"
export function WhatNow({ onBack }) {
  const currentStage = trip.stages.find(s => s.current);
  
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>

      <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>
        Сейчас вам нужно пройти {currentStage?.label.toLowerCase()}.
      </h2>

      <div style={styles.alertBox}>
        <strong>⚠️ До посадки {trip.timeToBoarding}.</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          По доступным данным очередь может занять значительное время.
          <br />
          Рекомендуется пройти контроль сейчас.
        </p>
      </div>

      <p style={{ fontWeight: '600', marginBottom: '12px' }}>Сделайте 3 шага:</p>
      <ol style={styles.stepList}>
        <li style={styles.stepItem}>Возьмите паспорт и посадочный талон.</li>
        <li style={styles.stepItem}>Следуйте к {currentStage?.label}.</li>
        <li style={styles.stepItem}>Подготовьте ручную кладь к досмотру.</li>
      </ol>

      <button style={{ ...styles.button, ...styles.buttonSecondary }}>
        🗺️ Показать маршрут
      </button>

      <button style={{ ...styles.button, ...styles.buttonSecondary }}>
        📋 Что будет дальше?
      </button>

      <button
        style={{ ...styles.button, ...styles.buttonDanger }}
        onClick={() => onBack()}
      >
        🚨 У меня проблема
      </button>
    </div>
  );
}

// Экран категорий проблем
export function ProblemCategories({ onSelectProblem, onBack }) {
  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>

      <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Что случилось?</h2>

      {problemCategories.map((category) => (
        <div key={category.id} style={styles.categorySection}>
          <p style={styles.categoryTitle}>{category.title}</p>
          {category.problems.map((problem) => (
            <button
              key={problem.id}
              style={styles.problemButton}
              onClick={() => onSelectProblem(problem.id)}
            >
              • {problem.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// Экран деталей проблемы
export function ProblemDetail({ problemId, onBack, onShowEmployee }) {
  const scenario = problemScenarios[problemId];
  
  if (!scenario) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={onBack}>
          <Icons.Back /> Назад
        </button>
        <p>Сценарий не найден</p>
      </div>
    );
  }

  const [showNextActions, setShowNextActions] = useState(false);
  const [referenceNumberAsked, setReferenceNumberAsked] = useState(false);

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        <Icons.Back /> Назад
      </button>

      <div
        style={{
          ...styles.alertBox,
          ...(scenario.severity === 'high' ? styles.alertBoxHigh : {})
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Icons.Warning />
          <strong>{scenario.title}</strong>
        </div>
        <p style={{ margin: 0 }}>Спокойно. Сейчас сделайте 3 вещи:</p>
      </div>

      <ol style={styles.stepList}>
        {scenario.immediateActions.map((action, index) => (
          <li key={index} style={styles.stepItem}>{action}</li>
        ))}
      </ol>

      {scenario.dontDo.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#f59e0b', fontWeight: '600' }}>НЕ ДЕЛАЙТЕ:</p>
          <ul style={styles.stepList}>
            {scenario.dontDo.map((item, index) => (
              <li key={index} style={styles.stepItem}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        style={{ ...styles.button, ...styles.buttonLarge }}
        onClick={() => onShowEmployee(scenario.phrase)}
      >
        💬 Показать сотруднику
      </button>

      {!showNextActions && scenario.nextActions.length > 0 && (
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={() => setShowNextActions(true)}
        >
          📋 Что делать потом?
        </button>
      )}

      {showNextActions && scenario.nextActions.length > 0 && (
        <>
          <p style={styles.sectionTitle}>Следующие шаги:</p>
          <ol style={styles.stepList}>
            {scenario.nextActions.map((action, index) => (
              <li key={index} style={styles.stepItem}>{action}</li>
            ))}
          </ol>

          {problemId === 'no_baggage' && !referenceNumberAsked && (
            <div style={styles.card}>
              <p style={{ marginBottom: '12px', fontWeight: '600' }}>
                Получили номер обращения?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ ...styles.button, flex: 1, marginBottom: 0 }}
                  onClick={() => setReferenceNumberAsked(true)}
                >
                  Да
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary, flex: 1, marginBottom: 0 }}
                  onClick={() => setReferenceNumberAsked(true)}
                >
                  Нет
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Source */}
      <div style={styles.sourceBox}>
        <p style={{ margin: '0 0 4px 0' }}>Источник: {scenario.source.name}</p>
        <p style={{ margin: 0 }}>Дата проверки: {scenario.source.lastVerified}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
          Confidence: {scenario.source.confidence}
        </p>
      </div>
    </div>
  );
}

// Режим "Показать сотруднику"
export function EmployeeMode({ phrase, onBack }) {
  const handleSpeak = () => {
    speakText(phrase.en, 'en-US');
  };

  const handleCopy = async () => {
    await copyToClipboard(phrase.en);
    alert('Текст скопирован в буфер обмена');
  };

  return (
    <div style={styles.employeeMode}>
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <p style={styles.employeeText}>{phrase.en}</p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            style={{
              ...styles.button,
              ...styles.buttonLarge,
              backgroundColor: '#000000',
              flex: 'none',
              width: 'auto',
              padding: '16px 32px'
            }}
            onClick={handleSpeak}
          >
            <Icons.Speaker /> 🔊 Озвучить
          </button>
          
          <button
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...styles.buttonLarge,
              flex: 'none',
              width: 'auto',
              padding: '16px 32px'
            }}
            onClick={handleCopy}
          >
            <Icons.Copy /> 📋 Копировать
          </button>
        </div>

        <button
          style={{
            ...styles.button,
            ...styles.buttonLarge,
            marginTop: '32px',
            backgroundColor: '#334155'
          }}
          onClick={onBack}
        >
          ↩ Вернуться
        </button>
      </div>
    </div>
  );
}

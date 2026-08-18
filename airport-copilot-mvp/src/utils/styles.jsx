import React from 'react';

// Стили для всех компонентов (CSS-in-JS для простоты MVP)
export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '16px',
    paddingBottom: '80px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingTop: '8px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },
  offlineBadge: {
    backgroundColor: '#1e293b',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#94a3b8'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  buttonSecondary: {
    backgroundColor: '#334155',
    color: '#f8fafc'
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
    color: 'white'
  },
  buttonLarge: {
    padding: '24px',
    fontSize: '18px',
    minHeight: '64px'
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
    marginTop: '24px'
  },
  stageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    opacity: 0.7
  },
  stageDone: {
    color: '#22c55e'
  },
  stageCurrent: {
    color: '#3b82f6',
    fontWeight: '600',
    opacity: 1
  },
  stageDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#475569'
  },
  stageDotDone: {
    backgroundColor: '#22c55e'
  },
  stageDotCurrent: {
    backgroundColor: '#3b82f6',
    animation: 'pulse 2s infinite'
  },
  alertBox: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    borderLeft: '4px solid #f59e0b'
  },
  alertBoxHigh: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderLeftColor: '#dc2626'
  },
  stepList: {
    paddingLeft: '20px',
    margin: '16px 0'
  },
  stepItem: {
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  sourceBox: {
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '16px'
  },
  input: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '16px',
    marginBottom: '12px',
    minHeight: '48px'
  },
  select: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '16px',
    marginBottom: '12px',
    minHeight: '48px'
  },
  employeeMode: {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  employeeText: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.4'
  },
  categorySection: {
    marginBottom: '24px'
  },
  categoryTitle: {
    fontSize: '14px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  problemButton: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '8px',
    minHeight: '48px'
  },
  resultBox: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  resultAllowed: {
    color: '#22c55e',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  resultDenied: {
    color: '#dc2626',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  resultWarning: {
    color: '#f59e0b',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    fontSize: '14px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px'
  }
};

// Иконки как SVG компоненты
export const Icons = {
  Back: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Warning: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Speaker: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  ),
  Copy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Map: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  Baggage: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  Document: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Flight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  Translate: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
};

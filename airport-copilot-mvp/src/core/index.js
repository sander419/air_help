/**
 * Airport Copilot - Core Module Exports
 * Централизованный экспорт всех движков
 */

export { default as ruleEngine, ruleEngine } from './RuleEngine';
export { default as notificationEngine, notificationEngine } from './NotificationEngine';
export { default as offlinePackageManager, offlinePackageManager } from './OfflinePackageManager';

// Convenience export for all core modules
export const core = {
  ruleEngine: ruleEngine,
  notificationEngine: notificationEngine,
  offlinePackageManager: offlinePackageManager
};

export default core;

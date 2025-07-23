/**
 * Schedule API 호환성을 위한 re-export
 * 기존 import 경로를 유지하면서 새로운 구조로 마이그레이션
 */

export * from './schedule';
export { scheduleApi as default } from './schedule';
export type FeederStatus = 'IDLE' | 'PATROLLING' | 'FEEDING' | 'CHARGING' | 'ESTOP';

export interface TelemetryData {
  deviceOnline: boolean;
  status: FeederStatus;
  batteryPercent: number;
  batteryVoltage: number;
  hopperRemainingKg: number;
  hopperMaxKg: number;
  currentPositionMeter: number;
  totalTrackMeters: number;
  speedMps: number;
  feedRateGps: number;
  currentSegment: string;
  isObstacleDetected: boolean;
}

export interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  dosageKg: number;
  speed: 'slow' | 'medium' | 'fast';
  loops: number;
  isActive: boolean;
  lastRunStatus?: 'success' | 'missed' | 'pending';
  lastRunTime?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'FEED';
  message: string;
  details?: string;
}

export type FeederStatus = 'IDLE' | 'PATROLLING' | 'FEEDING' | 'CHARGING' | 'ESTOP';
export type ControlMode = 'AUTO' | 'MANUAL';
export type RotationDirection = 'CW' | 'CCW' | 'STOP';

export interface TelemetryData {
  deviceOnline: boolean;
  status: FeederStatus;
  controlMode: ControlMode;
  direction: RotationDirection;
  currentAngleDeg: number;       // 0 - 360 degrees
  currentPositionMeter: number;  // (currentAngleDeg / 360) * totalTrackMeters
  totalTrackMeters: number;      // default 80 meters perimeter
  speedMps: number;              // current linear speed at hopper
  motorRpm: number;              // central pivot motor RPM
  feedRateGps: number;           // grams per second
  hopperRemainingKg: number;
  hopperMaxKg: number;
  batteryPercent: number;
  batteryVoltage: number;
  isObstacleDetected: boolean;
}

export interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  dosageKg: number;
  speed: 'slow' | 'medium' | 'fast';
  loops: number;
  mode: ControlMode;
  estimatedDuration: string;
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
  angleDeg?: number;
  duration?: string;
}

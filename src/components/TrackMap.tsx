import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { FeederStatus, RotationDirection } from '@/types';

interface TrackMapProps {
  currentAngleDeg: number;       // 0 - 360 degrees
  currentMeters: number;         // meter representation
  totalMeters: number;           // total 80m
  status: FeederStatus;
  direction: RotationDirection;
  speedMps: number;
  motorRpm: number;
  hasObstacle?: boolean;
}

export const TrackMap: React.FC<TrackMapProps> = ({
  currentAngleDeg,
  currentMeters,
  totalMeters,
  status,
  direction,
  speedMps,
  motorRpm,
  hasObstacle = false,
}) => {
  // SVG center (160, 160), ViewBox: 0 0 320 320
  const cx = 160;
  const cy = 160;
  const railRadius = 118; // Circular outer rail
  const pondRadius = 112; // Water pond boundary

  // 0 deg = North (top). Formula: (deg - 90) * (PI / 180)
  const rad = ((currentAngleDeg - 90) * Math.PI) / 180;
  const tipX = cx + railRadius * Math.cos(rad);
  const tipY = cy + railRadius * Math.sin(rad);

  // Middle truss coordinate
  const midArmX = cx + (railRadius * 0.52) * Math.cos(rad);
  const midArmY = cy + (railRadius * 0.52) * Math.sin(rad);

  const isFeeding = status === 'FEEDING';
  const isEStop = status === 'ESTOP';
  const isRunning = (status === 'FEEDING' || status === 'PATROLLING') && motorRpm > 0;

  // Particle spray positions behind/around dispenser
  const particles = [
    { dist: 14, angleOffset: -24, size: 2.2, opacity: 0.9 },
    { dist: 22, angleOffset: -38, size: 2.8, opacity: 0.8 },
    { dist: 30, angleOffset: -18, size: 2.0, opacity: 0.7 },
    { dist: 20, angleOffset: -54, size: 2.5, opacity: 0.85 },
    { dist: 36, angleOffset: -36, size: 2.2, opacity: 0.6 },
    { dist: 12, angleOffset: -72, size: 2.4, opacity: 0.75 },
    { dist: 44, angleOffset: -46, size: 1.8, opacity: 0.5 },
  ];

  return (
    <Card className="border-border bg-card/75 backdrop-blur-md shadow-lg overflow-hidden relative">
      <CardContent className="p-3.5 sm:p-4 flex flex-col gap-2">
        
        {/* Top Header of Map */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
              Circular Feeding Track
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[11px] font-mono border-cyan-800/60 bg-cyan-950/30 text-cyan-300">
              {direction === 'CW' ? '↻ CW' : direction === 'CCW' ? '↺ CCW' : '⏹ STOP'} • {currentAngleDeg.toFixed(0)}°
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-mono">
              {currentMeters.toFixed(1)}m / {totalMeters}m
            </Badge>
          </div>
        </div>

        {/* 2D Circular SVG Visualization */}
        <div className="relative w-full aspect-square max-h-[305px] mx-auto flex items-center justify-center my-0.5 select-none">
          <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-md">
            <defs>
              {/* Radial gradient for water pool */}
              <radialGradient id="waterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0e3346" />
                <stop offset="65%" stopColor="#08212e" />
                <stop offset="95%" stopColor="#04141c" />
                <stop offset="100%" stopColor="#0a2e3f" />
              </radialGradient>

              {/* Metal arm line gradient */}
              <linearGradient id="metalArmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Hopper body gradient */}
              <linearGradient id="hopperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* 1. Circular Water Pond */}
            <circle
              cx={cx}
              cy={cy}
              r={pondRadius}
              fill="url(#waterGrad)"
              stroke="#155e75"
              strokeWidth="2"
            />

            {/* Subtle concentric depth rings */}
            <circle cx={cx} cy={cy} r="82" fill="none" stroke="#0e3b4f" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx={cx} cy={cy} r="48" fill="none" stroke="#0e3b4f" strokeWidth="1" strokeDasharray="2 4" opacity="0.7" />

            {/* 2. Outer Circular Steel Rail */}
            <circle
              cx={cx}
              cy={cy}
              r={railRadius}
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              className="opacity-75"
            />
            <circle
              cx={cx}
              cy={cy}
              r={railRadius}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="opacity-70"
            />

            {/* Compass degree markers */}
            <text x={cx} y={cy - railRadius - 8} textAnchor="middle" className="text-[9px] font-mono fill-muted-foreground font-bold">0° / DOCK</text>
            <text x={cx + railRadius + 14} y={cy + 3} textAnchor="middle" className="text-[9px] font-mono fill-muted-foreground font-semibold">90°</text>
            <text x={cx} y={cy + railRadius + 15} textAnchor="middle" className="text-[9px] font-mono fill-muted-foreground font-semibold">180°</text>
            <text x={cx - railRadius - 16} y={cy + 3} textAnchor="middle" className="text-[9px] font-mono fill-muted-foreground font-semibold">270°</text>

            {/* Docking Station Marker at 0° (North) */}
            <g transform={`translate(${cx}, ${cy - railRadius})`}>
              <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#38bdf8" />
            </g>

            {/* 3. Feed Particle Spray when Dispensing */}
            {isFeeding && (
              <g className="animate-pulse">
                {particles.map((p, idx) => {
                  const pRad = ((currentAngleDeg - 90 + p.angleOffset) * Math.PI) / 180;
                  const px = tipX + (p.dist * Math.cos(pRad));
                  const py = tipY + (p.dist * Math.sin(pRad));
                  return (
                    <circle
                      key={idx}
                      cx={px}
                      cy={py}
                      r={p.size}
                      fill="#fef08a"
                      opacity={p.opacity}
                      stroke="#f59e0b"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </g>
            )}

            {/* 4. Single Long Metal Rotary Arm */}
            <line
              x1={cx}
              y1={cy}
              x2={tipX}
              y2={tipY}
              stroke="url(#metalArmGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Structural reinforce beam */}
            <line
              x1={cx}
              y1={cy}
              x2={midArmX}
              y2={midArmY}
              stroke="#f8fafc"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* 5. Hopper & Dispenser Tank on the Outer End of the Arm */}
            <g transform={`translate(${tipX}, ${tipY}) rotate(${currentAngleDeg})`}>
              {/* Outer roller wheel on rail */}
              <circle cx="0" cy="0" r="7.5" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              {/* Hopper body */}
              <rect
                x="-8"
                y="-13"
                width="16"
                height="15"
                rx="3"
                fill="url(#hopperGrad)"
                stroke={isEStop ? '#f43f5e' : isFeeding ? '#38bdf8' : '#d97706'}
                strokeWidth="1.5"
              />
              {/* Dispenser nozzle tip */}
              <polygon points="-4,2 4,2 0,7" fill="#fbbf24" />

              {/* Status Indicator LED on Hopper */}
              <circle
                cx="0"
                cy="-6"
                r="2.5"
                fill={isEStop ? '#ef4444' : isFeeding ? '#22c55e' : '#f59e0b'}
                className={isFeeding ? 'animate-ping' : ''}
              />
            </g>

            {/* 6. Central Motor Pivot */}
            <circle
              cx={cx}
              cy={cy}
              r="14"
              fill="#090d16"
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <circle
              cx={cx}
              cy={cy}
              r="7"
              fill={isRunning ? '#06b6d4' : '#475569'}
              className={isRunning ? 'animate-pulse' : ''}
            />
            <circle cx={cx} cy={cy} r="2.5" fill="#f8fafc" />

            {/* Obstacle warning if detected */}
            {hasObstacle && (
              <g transform={`translate(${cx + 75}, ${cy - 75})`}>
                <circle cx="0" cy="0" r="10" fill="#f43f5e" className="animate-ping" opacity="0.8" />
                <circle cx="0" cy="0" r="7" fill="#e11d48" />
              </g>
            )}
          </svg>

          {/* Central Overlay Badge */}
          <div className="absolute bottom-1 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border flex items-center gap-2 shadow-sm text-xs font-mono">
            <span className="text-muted-foreground">PUTARAN:</span>
            <span className="font-bold text-cyan-300">
              {(currentAngleDeg / 360).toFixed(2)} / 1.00
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">SPEED:</span>
            <span className="font-bold text-foreground">
              {speedMps.toFixed(2)} m/s
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">RPM:</span>
            <span className="font-bold text-foreground">
              {motorRpm}
            </span>
          </div>
        </div>

        {/* Legend of Digital Twin */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cyan-400" />
            <span>Poros Motor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            <span>Hopper Pakan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-500" />
            <span>Rel Keliling 80m</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

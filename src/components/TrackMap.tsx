import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TrackMapProps {
  currentMeters: number;
  totalMeters: number;
  status: string;
  hasObstacle: boolean;
}

export const TrackMap: React.FC<TrackMapProps> = ({
  currentMeters,
  totalMeters,
  status,
  hasObstacle,
}) => {
  // Rectangle track representation: Width 280, Height 140
  // Perimeter = 2 * (280 + 140) = 840 units
  const progressRatio = Math.min(Math.max(currentMeters / totalMeters, 0), 1);
  const trackPerimeter = 280 * 2 + 140 * 2; // 840
  const dist = progressRatio * trackPerimeter;

  let robotX = 30;
  let robotY = 25;

  if (dist <= 280) {
    robotX = 30 + dist;
    robotY = 25;
  } else if (dist <= 280 + 140) {
    robotX = 310;
    robotY = 25 + (dist - 280);
  } else if (dist <= 280 * 2 + 140) {
    robotX = 310 - (dist - (280 + 140));
    robotY = 165;
  } else {
    robotX = 30;
    robotY = 165 - (dist - (280 * 2 + 140));
  }

  const isFeeding = status === 'FEEDING';
  const isEStop = status === 'ESTOP';

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardContent className="p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium tracking-wider text-muted-foreground uppercase">
              Perimeter Rel Kolam
            </span>
            {hasObstacle && (
              <Badge variant="destructive" className="text-[10px] px-2 py-0">
                HALANGAN TERDETEKSI
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
            {currentMeters.toFixed(1)}m / {totalMeters}m
          </Badge>
        </div>

        <div className="relative w-full aspect-[2/1] bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-border/50">
          <svg viewBox="0 0 340 190" className="w-full h-full select-none">
            {/* Kolam Air Center */}
            <rect
              x="50"
              y="45"
              width="240"
              height="100"
              rx="12"
              fill="currentColor"
              className="text-primary/10"
            />
            <text
              x="170"
              y="98"
              fill="currentColor"
              fontSize="11"
              fontFamily="sans-serif"
              fontWeight="600"
              textAnchor="middle"
              className="text-primary/80"
            >
              AREA AIR KOLAM UTAMA
            </text>
            <text
              x="170"
              y="114"
              fill="currentColor"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              className="text-muted-foreground/60"
            >
              Perimeter Rel: 80 Meter
            </text>

            {/* Rel Besi Lintasan (Outer Track Tube) */}
            <rect
              x="30"
              y="25"
              width="280"
              height="140"
              rx="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-muted"
            />
            {/* Rel Tube Inner Highlight */}
            <rect
              x="30"
              y="25"
              width="280"
              height="140"
              rx="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-muted-foreground/40"
            />

            {/* Docking (Top-Left 0m) */}
            <circle cx="30" cy="25" r="7" className="fill-primary" />
            <text x="30" y="14" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle" className="text-primary">
              DOCK
            </text>

            {/* CP 1 (Top-Right) */}
            <circle cx="310" cy="25" r="4" className="fill-muted-foreground/60" />
            <text x="310" y="15" fill="currentColor" fontSize="7" textAnchor="middle" className="text-muted-foreground">20m</text>

            {/* CP 2 (Bottom-Right) */}
            <circle cx="310" cy="165" r="4" className="fill-muted-foreground/60" />
            <text x="310" y="180" fill="currentColor" fontSize="7" textAnchor="middle" className="text-muted-foreground">40m</text>

            {/* CP 3 (Bottom-Left) */}
            <circle cx="30" cy="165" r="4" className="fill-muted-foreground/60" />
            <text x="30" y="180" fill="currentColor" fontSize="7" textAnchor="middle" className="text-muted-foreground">60m</text>

            {/* Slinger/Dispense Spray Animation Effect when FEEDING */}
            {isFeeding && (
              <circle
                cx={robotX}
                cy={robotY}
                r="22"
                className="fill-sky-400/30 animate-ping"
              />
            )}

            {/* Robot Feeder Marker on Rail */}
            <g transform={`translate(${robotX}, ${robotY})`}>
              <circle
                cx="0"
                cy="0"
                r="10"
                fill={isEStop ? 'var(--color-destructive)' : isFeeding ? '#38bdf8' : 'var(--color-primary)'}
                stroke="var(--color-background)"
                strokeWidth="2.5"
              />
              <circle
                cx="0"
                cy="0"
                r="3.5"
                fill="var(--color-primary-foreground)"
              />
            </g>
          </svg>
        </div>

        {/* Progress Bar Footer */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress Putaran:</span>
            <span className="font-mono font-semibold text-foreground">
              {(progressRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isEStop ? 'bg-destructive' : isFeeding ? 'bg-sky-400' : 'bg-primary'
              }`}
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

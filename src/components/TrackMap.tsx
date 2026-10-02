import React from 'react';

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
  // Map currentMeters / totalMeters -> track coordinate (x, y)
  const progressRatio = Math.min(Math.max(currentMeters / totalMeters, 0), 1);
  const trackPerimeter = 280 * 2 + 140 * 2; // 840
  const dist = progressRatio * trackPerimeter;

  let robotX = 30;
  let robotY = 25;

  if (dist <= 280) {
    // Top side: Left (30, 25) -> Right (310, 25)
    robotX = 30 + dist;
    robotY = 25;
  } else if (dist <= 280 + 140) {
    // Right side: Top (310, 25) -> Bottom (310, 165)
    robotX = 310;
    robotY = 25 + (dist - 280);
  } else if (dist <= 280 * 2 + 140) {
    // Bottom side: Right (310, 165) -> Left (30, 165)
    robotX = 310 - (dist - (280 + 140));
    robotY = 165;
  } else {
    // Left side: Bottom (30, 165) -> Top (30, 25)
    robotX = 30;
    robotY = 165 - (dist - (280 * 2 + 140));
  }

  const isFeeding = status === 'FEEDING';
  const isEStop = status === 'ESTOP';

  return (
    <div className="relative w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Perimeter Rel Kolam
          </span>
          {hasObstacle && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              HALANGAN TERDETEKSI
            </span>
          )}
        </div>
        <div className="text-xs font-mono font-bold text-teal-400">
          {currentMeters.toFixed(1)}m / {totalMeters}m
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-slate-950/70 rounded-xl overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 340 190" className="w-full h-full select-none">
          {/* Kolam Air Center */}
          <rect
            x="50"
            y="45"
            width="240"
            height="100"
            rx="12"
            fill="#082f49"
            opacity="0.4"
          />
          <text
            x="170"
            y="98"
            fill="#38bdf8"
            fontSize="11"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.75"
          >
            AREA AIR KOLAM UTAMA
          </text>
          <text
            x="170"
            y="114"
            fill="#94a3b8"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.6"
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
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Rel Tube Inner Highlight */}
          <rect
            x="30"
            y="25"
            width="280"
            height="140"
            rx="16"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Checkpoint Check / Docking Station Marker */}
          {/* Docking (Top-Left 0m) */}
          <circle cx="30" cy="25" r="7" fill="#0284c7" />
          <text x="30" y="14" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
            DOCK
          </text>

          {/* CP 1 (Top-Right) */}
          <circle cx="310" cy="25" r="4" fill="#475569" />
          <text x="310" y="15" fill="#94a3b8" fontSize="7" textAnchor="middle">20m</text>

          {/* CP 2 (Bottom-Right) */}
          <circle cx="310" cy="165" r="4" fill="#475569" />
          <text x="310" y="180" fill="#94a3b8" fontSize="7" textAnchor="middle">40m</text>

          {/* CP 3 (Bottom-Left) */}
          <circle cx="30" cy="165" r="4" fill="#475569" />
          <text x="30" y="180" fill="#94a3b8" fontSize="7" textAnchor="middle">60m</text>

          {/* Slinger/Dispense Spray Animation Effect when FEEDING */}
          {isFeeding && (
            <circle
              cx={robotX}
              cy={robotY}
              r="22"
              fill="#38bdf8"
              opacity="0.25"
              className="animate-ping"
            />
          )}

          {/* Robot Feeder Marker on Rail */}
          <g transform={`translate(${robotX}, ${robotY})`}>
            {/* Robot Base Pod */}
            <circle
              cx="0"
              cy="0"
              r="10"
              fill={isEStop ? '#ef4444' : isFeeding ? '#0284c7' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            {/* Inner Core */}
            <circle
              cx="0"
              cy="0"
              r="3.5"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Progress Bar Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Progress Putaran:</span>
        <span className="font-mono font-semibold text-slate-200">
          {(progressRatio * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isEStop ? 'bg-red-500' : isFeeding ? 'bg-sky-400' : 'bg-teal-500'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>
    </div>
  );
};

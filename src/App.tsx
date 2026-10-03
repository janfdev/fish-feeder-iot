import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  OctagonAlert, 
  Battery, 
  Wheat, 
  Calendar, 
  History, 
  LayoutDashboard, 
  RotateCw,
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  Radio,
  Timer,
  Zap,
  Gauge,
  Compass
} from 'lucide-react';
import { TrackMap } from '@/components/TrackMap';
import type { TelemetryData, ScheduleItem, LogEntry, ControlMode } from '@/types';

// shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'schedule' | 'logs'>('cockpit');

  // Simulated Live Telemetry based on Circular Track
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    deviceOnline: true,
    status: 'IDLE',
    controlMode: 'AUTO',
    direction: 'STOP',
    currentAngleDeg: 0,
    currentPositionMeter: 0,
    totalTrackMeters: 80,
    speedMps: 0,
    motorRpm: 0,
    feedRateGps: 0,
    hopperRemainingKg: 16.4,
    hopperMaxKg: 20.0,
    batteryPercent: 88,
    batteryVoltage: 25.2,
    isObstacleDetected: false,
  });

  // Schedule list with circular specs
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: '1',
      name: 'Pakan Pagi (Bibit & Pembesaran)',
      time: '07:30',
      dosageKg: 2.5,
      speed: 'medium',
      loops: 1,
      mode: 'AUTO',
      estimatedDuration: '04:15 menit',
      isActive: true,
      lastRunStatus: 'success',
      lastRunTime: '07:38 WIB (Hari ini)',
    },
    {
      id: '2',
      name: 'Pakan Siang',
      time: '12:00',
      dosageKg: 3.0,
      speed: 'fast',
      loops: 2,
      mode: 'AUTO',
      estimatedDuration: '06:30 menit',
      isActive: true,
      lastRunStatus: 'pending',
    },
    {
      id: '3',
      name: 'Pakan Sore',
      time: '16:45',
      dosageKg: 2.5,
      speed: 'medium',
      loops: 1,
      mode: 'AUTO',
      estimatedDuration: '04:15 menit',
      isActive: true,
      lastRunStatus: 'pending',
    }
  ]);

  // Operational logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '07:38 WIB',
      type: 'INFO',
      message: 'Sesi Pagi selesai. 2.48 Kg pelet tertebar 360° merata.',
      details: '1 Putaran Penuh (80m) • Durasi: 04:12 • Lengan kembali ke Dock (0°).',
      angleDeg: 0,
      duration: '04:12',
    },
    {
      id: 'log-2',
      timestamp: '06:12 WIB',
      type: 'WARN',
      message: 'Sensor halangan aktif di posisi 188° (Sisi Selatan).',
      details: 'Motor auto-brake 3 detik sebelum jalur rel kembali bersih.',
      angleDeg: 188,
    },
    {
      id: 'log-3',
      timestamp: 'Kemarin, 16:50 WIB',
      type: 'FEED',
      message: 'Sesi Sore selesai. 2.95 Kg terdistribusi sempurna.',
      details: 'Putaran: 1x • Motor RPM: 120 • Sisa Baterai: 89%.',
      angleDeg: 0,
      duration: '04:18',
    }
  ]);

  // Circular motion simulation
  useEffect(() => {
    if (telemetry.status === 'IDLE' || telemetry.status === 'ESTOP') return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.status === 'IDLE' || prev.status === 'ESTOP') return prev;

        // Advance angle by speed
        const angleStep = prev.direction === 'CCW' ? -1.5 : 1.5;
        let nextAngle = (prev.currentAngleDeg + angleStep);
        let nextHopper = prev.hopperRemainingKg;

        if (prev.status === 'FEEDING') {
          nextHopper = Math.max(0, prev.hopperRemainingKg - 0.015);
        }

        // Full rotation complete (360 deg)
        if (nextAngle >= 360) {
          return {
            ...prev,
            status: 'IDLE',
            direction: 'STOP',
            speedMps: 0,
            motorRpm: 0,
            feedRateGps: 0,
            currentAngleDeg: 0,
            currentPositionMeter: 0,
            hopperRemainingKg: Number(nextHopper.toFixed(2)),
          };
        } else if (nextAngle < 0) {
          nextAngle = 360 + nextAngle;
        }

        const nextMeters = (nextAngle / 360) * prev.totalTrackMeters;

        return {
          ...prev,
          currentAngleDeg: Number(nextAngle.toFixed(1)),
          currentPositionMeter: Number(nextMeters.toFixed(1)),
          hopperRemainingKg: Number(nextHopper.toFixed(2)),
        };
      });
    }, 150);

    return () => clearInterval(interval);
  }, [telemetry.status, telemetry.direction]);

  // Actions
  const handleStartFeeding = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'FEEDING',
      direction: 'CW',
      speedMps: 0.35,
      motorRpm: 120,
      feedRateGps: 35,
    }));
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Baru saja',
        type: 'FEED',
        message: 'Trigger Sesi Pakan: Lengan berputar 360° menyemburkan pelet.',
        angleDeg: telemetry.currentAngleDeg,
      },
      ...prev,
    ]);
  };

  const handleManualRotate = (dir: 'CW' | 'CCW') => {
    const delta = dir === 'CW' ? 2 : -2;
    setTelemetry((prev) => {
      let nextAngle = prev.currentAngleDeg + delta;
      if (nextAngle >= 360) nextAngle = 0;
      if (nextAngle < 0) nextAngle = 358;
      const nextMeters = (nextAngle / 360) * prev.totalTrackMeters;
      return {
        ...prev,
        currentAngleDeg: nextAngle,
        currentPositionMeter: Number(nextMeters.toFixed(1)),
        status: 'PATROLLING',
        direction: dir,
        motorRpm: 60,
        speedMps: 0.18,
      };
    });
  };

  const handleEmergencyStop = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'ESTOP',
      direction: 'STOP',
      speedMps: 0,
      motorRpm: 0,
      feedRateGps: 0,
    }));
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Baru saja',
        type: 'ERROR',
        message: 'EMERGENCY STOP! Motor pivot dan dispenser pakan diputus.',
        details: `Berhenti mendadak pada posisi sudut ${telemetry.currentAngleDeg}°.`,
        angleDeg: telemetry.currentAngleDeg,
      },
      ...prev,
    ]);
  };

  const handleReturnToDock = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'IDLE',
      direction: 'STOP',
      currentAngleDeg: 0,
      currentPositionMeter: 0,
      speedMps: 0,
      motorRpm: 0,
      feedRateGps: 0,
    }));
  };

  const setControlMode = (mode: ControlMode) => {
    setTelemetry((prev) => ({ ...prev, controlMode: mode }));
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-card/40 flex flex-col border-x border-border/80 pb-24 shadow-2xl relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-cyan-950/40">
              <Radio className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-foreground">
                  AquaFeed-360
                </h1>
                <Badge variant="secondary" className="bg-secondary/80 text-cyan-300 border-cyan-800/40 text-[10px] px-1.5 py-0 font-medium">
                  Kolam A (Circular)
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Zap className="size-3 text-amber-400 fill-amber-400" /> Rotary Feeder • Digital Twin
              </p>
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={`gap-1.5 py-1 px-2.5 border transition-colors ${
              telemetry.deviceOnline 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                : 'bg-destructive/20 text-destructive border-destructive/50'
            }`}
          >
            <span className={`size-2 rounded-full ${telemetry.deviceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-destructive'}`} />
            <span className="text-[10px] font-mono font-semibold tracking-wider">
              {telemetry.deviceOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </Badge>
        </header>

        {/* Tab Content wrapped in shadcn Tabs */}
        <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'cockpit' | 'schedule' | 'logs')} className="flex-1 flex flex-col">
          <main className="flex-1 p-3.5 sm:p-4 flex flex-col gap-3.5">
            
            {/* TAB 1: COCKPIT */}
            <TabsContent value="cockpit" className="flex flex-col gap-3.5 mt-0">
              
              {/* Telemetry Status Banner Card */}
              <Card className="border-border bg-gradient-to-b from-card to-card/60 backdrop-blur-md shadow-sm">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Status Lengan Rotasi
                      </span>
                      {/* Control Mode Toggle */}
                      <div className="flex items-center bg-secondary/80 rounded-md p-0.5 border border-border">
                        <button
                          onClick={() => setControlMode('AUTO')}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            telemetry.controlMode === 'AUTO' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                          }`}
                        >
                          AUTO
                        </button>
                        <button
                          onClick={() => setControlMode('MANUAL')}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            telemetry.controlMode === 'MANUAL' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                          }`}
                        >
                          MANUAL
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`font-bold text-sm sm:text-base tracking-tight ${
                        telemetry.status === 'ESTOP' ? 'text-rose-400 font-black animate-pulse' : 
                        telemetry.status === 'FEEDING' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {telemetry.status === 'ESTOP' && 'DARURAT BERHENTI (E-STOP)'}
                        {telemetry.status === 'FEEDING' && 'MENYEBAR PAKAN (FEEDING)'}
                        {telemetry.status === 'PATROLLING' && 'LENGAN BERPUTAR'}
                        {telemetry.status === 'IDLE' && 'STANDBY DI DOCK 0°'}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Sudut: <strong className="text-cyan-300 font-mono font-medium">{telemetry.currentAngleDeg}°</strong></span>
                      <span>•</span>
                      <span>Arah: <strong className="text-foreground font-mono">{telemetry.direction === 'CW' ? '↻ Clockwise' : telemetry.direction === 'CCW' ? '↺ CCW' : 'Berhenti'}</strong></span>
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end bg-secondary/40 p-2 rounded-lg border border-border/50 min-w-20">
                    <span className="text-[10px] font-mono text-muted-foreground">DISTANCE</span>
                    <span className="text-sm font-bold font-mono text-cyan-400">
                      {telemetry.currentPositionMeter.toFixed(1)} <span className="text-[10px] text-muted-foreground font-normal">/ 80m</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 2D Circular SVG Track Map */}
              <TrackMap 
                currentAngleDeg={telemetry.currentAngleDeg}
                currentMeters={telemetry.currentPositionMeter}
                totalMeters={telemetry.totalTrackMeters}
                status={telemetry.status}
                direction={telemetry.direction}
                speedMps={telemetry.speedMps}
                motorRpm={telemetry.motorRpm}
                hasObstacle={telemetry.isObstacleDetected}
              />

              {/* Metric Cards (4 Cards Grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Hopper Tank */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-amber-500/40 transition-colors">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-mono font-medium text-muted-foreground">
                      TANGKI PAKAN
                    </CardTitle>
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                      <Wheat className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 flex flex-col gap-1">
                    <div>
                      <span className="text-xl font-black font-mono text-amber-300">
                        {telemetry.hopperRemainingKg.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/ 20 Kg</span>
                    </div>
                    <Progress 
                      value={(telemetry.hopperRemainingKg / telemetry.hopperMaxKg) * 100} 
                      className="h-1.5 bg-secondary"
                    />
                  </CardContent>
                </Card>

                {/* 2. Battery */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-emerald-500/40 transition-colors">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-mono font-medium text-muted-foreground">
                      BATERAI PIVOT
                    </CardTitle>
                    <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                      <Battery className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 flex flex-col gap-1">
                    <div>
                      <span className="text-xl font-black font-mono text-emerald-300">
                        {telemetry.batteryPercent}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">({telemetry.batteryVoltage}V)</span>
                    </div>
                    <Progress 
                      value={telemetry.batteryPercent} 
                      className="h-1.5 bg-secondary"
                    />
                  </CardContent>
                </Card>

                {/* 3. Motor Pivot RPM */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-cyan-500/40 transition-colors">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-mono font-medium text-muted-foreground">
                      MOTOR PIVOT
                    </CardTitle>
                    <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                      <Gauge className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 flex flex-col gap-1">
                    <div>
                      <span className="text-xl font-black font-mono text-cyan-300">
                        {telemetry.motorRpm}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">RPM</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Kecepatan: {telemetry.speedMps.toFixed(2)} m/s
                    </span>
                  </CardContent>
                </Card>

                {/* 4. Current Angle Position */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-sky-500/40 transition-colors">
                  <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-mono font-medium text-muted-foreground">
                      SUDUT LENGAN
                    </CardTitle>
                    <div className="p-1 rounded-md bg-sky-500/10 text-sky-400">
                      <Compass className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 flex flex-col gap-1">
                    <div>
                      <span className="text-xl font-black font-mono text-sky-300">
                        {telemetry.currentAngleDeg}°
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/ 360°</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Rel: {telemetry.currentPositionMeter.toFixed(1)} / 80m
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency E-Stop Button */}
              <div>
                <Button
                  onClick={handleEmergencyStop}
                  variant="destructive"
                  size="lg"
                  className="w-full h-13 sm:h-14 font-black rounded-xl shadow-lg shadow-rose-950/40 border border-rose-500/50 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide active:scale-[0.98] transition-transform"
                >
                  <OctagonAlert className="size-5 shrink-0" />
                  EMERGENCY STOP (PUTUS DAYA)
                </Button>
              </div>

              {/* Rotary Jogging Controls */}
              <div className="flex flex-col gap-2 pt-0.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Kendali Operasi Lengan
                </span>

                <Button
                  onClick={handleStartFeeding}
                  disabled={telemetry.status === 'FEEDING'}
                  size="lg"
                  className="w-full h-12 sm:h-13 font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 transition-all active:scale-[0.98]"
                >
                  <Play className="size-4 fill-current shrink-0" />
                  {telemetry.status === 'FEEDING' ? 'PROSES MENABUR 360° SEDANG BERJALAN...' : 'SEBAR PAKAN — 1 PUTARAN (360°)'}
                </Button>

                {/* Rotary Jogging Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={() => handleManualRotate('CCW')}
                    variant="secondary"
                    className="h-11 sm:h-12 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-border/80 hover:bg-secondary/80 active:scale-[0.97] transition-all"
                  >
                    <RotateCcw className="size-4 shrink-0 text-cyan-400" />
                    <span>PUTAR -2° (↶)</span>
                  </Button>

                  <Button
                    onClick={() => handleManualRotate('CW')}
                    variant="secondary"
                    className="h-11 sm:h-12 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-border/80 hover:bg-secondary/80 active:scale-[0.97] transition-all"
                  >
                    <span>PUTAR +2° (↷)</span>
                    <RotateCw className="size-4 shrink-0 text-cyan-400" />
                  </Button>
                </div>

                <Button
                  onClick={handleReturnToDock}
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-muted-foreground hover:text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 border-dashed border-border"
                >
                  <RotateCcw className="size-3.5" /> ↻ Kembali ke Docking (Posisi 0°)
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: SCHEDULE */}
            <TabsContent value="schedule" className="flex flex-col gap-3 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Jadwal Otomasi Pakan 360°</h2>
                  <p className="text-xs text-muted-foreground">Target harian: 8.0 Kg • Kolam Lingkaran</p>
                </div>
                <Button size="sm" className="h-8 gap-1.5 text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Plus className="size-3.5" /> Tambah
                </Button>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                {schedules.map((item) => (
                  <Card key={item.id} className="border-border bg-card/80 shadow-sm hover:border-cyan-500/30 transition-colors">
                    <CardContent className="p-3.5 flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-cyan-300">{item.time}</span>
                          <span className="text-xs font-medium text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono">
                          <span>Dosis: <strong className="text-amber-300">{item.dosageKg} Kg</strong></span>
                          <span>•</span>
                          <span>Rotasi: <strong className="text-foreground">{item.loops}x Putaran</strong></span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 border-border text-cyan-400">
                            {item.speed}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Timer className="size-3 text-cyan-400" />
                            <span>Durasi: {item.estimatedDuration}</span>
                          </span>
                          <Badge variant="secondary" className="text-[9px] py-0 px-1 font-mono">
                            {item.mode}
                          </Badge>
                        </div>
                      </div>

                      <Switch 
                        checked={item.isActive}
                        onCheckedChange={() => toggleSchedule(item.id)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: LOGS & HISTORY */}
            <TabsContent value="logs" className="flex flex-col gap-3 mt-0">
              <div>
                <h2 className="text-sm font-bold text-foreground">Log Operasional Rotary Feeder</h2>
                <p className="text-xs text-muted-foreground">Telemetri sudut, sensor halangan & durasi rotasi</p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {logs.map((log) => (
                  <Card key={log.id} className="border-border bg-card/70 shadow-sm">
                    <CardContent className="p-3 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                          {log.type === 'ERROR' && <AlertTriangle className="size-3.5 text-rose-400" />}
                          {log.type === 'WARN' && <AlertTriangle className="size-3.5 text-amber-400" />}
                          {log.type === 'INFO' && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                          {log.type === 'FEED' && <Wheat className="size-3.5 text-cyan-400" />}
                          <span className={
                            log.type === 'ERROR' ? 'text-rose-400 font-bold' :
                            log.type === 'WARN' ? 'text-amber-400 font-bold' : 
                            log.type === 'FEED' ? 'text-cyan-300 font-bold' : 'text-emerald-400 font-bold'
                          }>
                            {log.type}
                          </span>
                          {log.angleDeg !== undefined && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                              {log.angleDeg}°
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-foreground font-medium">{log.message}</p>
                      {log.details && (
                        <p className="text-[11px] text-muted-foreground font-mono">{log.details}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

          </main>

          {/* Bottom PWA Navigation Bar using shadcn TabsList */}
          <nav className="fixed bottom-0 max-w-md w-full bg-background/95 backdrop-blur-xl border-t border-border/80 py-2 px-4 sm:px-6 flex items-center justify-center z-40 shadow-lg">
            <TabsList className="grid grid-cols-3 w-full bg-secondary/60 p-1 rounded-xl h-12 border border-border/50">
              <TabsTrigger 
                value="cockpit" 
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <LayoutDashboard className="size-4 shrink-0" />
                <span>Cockpit</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Calendar className="size-4 shrink-0" />
                <span>Jadwal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <History className="size-4 shrink-0" />
                <span>Riwayat</span>
              </TabsTrigger>
            </TabsList>
          </nav>
        </Tabs>

      </div>
    </div>
  );
}

export default App;

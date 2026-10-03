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
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  Radio,
  Timer,
  Zap
} from 'lucide-react';
import { TrackMap } from '@/components/TrackMap';
import type { TelemetryData, ScheduleItem, LogEntry } from '@/types';

// shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'schedule' | 'logs'>('cockpit');

  // Simulated Live Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    deviceOnline: true,
    status: 'IDLE',
    batteryPercent: 88,
    batteryVoltage: 25.2,
    hopperRemainingKg: 16.4,
    hopperMaxKg: 20.0,
    currentPositionMeter: 0,
    totalTrackMeters: 80,
    speedMps: 0,
    feedRateGps: 0,
    currentSegment: 'Docking Station',
    isObstacleDetected: false,
  });

  // Schedule list
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: '1',
      name: 'Pakan Pagi (Bibit & Pembesaran)',
      time: '07:30',
      dosageKg: 2.5,
      speed: 'medium',
      loops: 1,
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
      message: 'Sesi Pagi selesai. 2.48 Kg pelet tertebar merata.',
      details: 'Waktu tempuh rel: 8m 12s • Robot kembali ke Dock.',
    },
    {
      id: 'log-2',
      timestamp: '06:12 WIB',
      type: 'WARN',
      message: 'Sensor ultrasonik mendeteksi halangan di meter ke-42.',
      details: 'Motor auto-brake 3 detik sebelum jalur kembali bersih.',
    },
    {
      id: 'log-3',
      timestamp: 'Kemarin, 16:50 WIB',
      type: 'FEED',
      message: 'Sesi Sore selesai. 2.95 Kg terdistribusi sempurna.',
    }
  ]);

  // Simulating robot movement on rail when running
  useEffect(() => {
    if (telemetry.status === 'IDLE' || telemetry.status === 'ESTOP') return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.status === 'IDLE' || prev.status === 'ESTOP') return prev;

        let nextMeter = prev.currentPositionMeter + (prev.speedMps * 0.5);
        let nextHopper = prev.hopperRemainingKg;

        if (prev.status === 'FEEDING') {
          nextHopper = Math.max(0, prev.hopperRemainingKg - 0.015);
        }

        if (nextMeter >= prev.totalTrackMeters) {
          nextMeter = 0; // complete loop
          return {
            ...prev,
            status: 'IDLE',
            speedMps: 0,
            feedRateGps: 0,
            currentPositionMeter: 0,
            currentSegment: 'Docking Station',
            hopperRemainingKg: Number(nextHopper.toFixed(2)),
          };
        }

        let segment = 'Segmen 1 (Utara)';
        if (nextMeter > 20 && nextMeter <= 40) segment = 'Segmen 2 (Timur)';
        else if (nextMeter > 40 && nextMeter <= 60) segment = 'Segmen 3 (Selatan)';
        else if (nextMeter > 60) segment = 'Segmen 4 (Barat)';

        return {
          ...prev,
          currentPositionMeter: Number(nextMeter.toFixed(1)),
          currentSegment: segment,
          hopperRemainingKg: Number(nextHopper.toFixed(2)),
        };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [telemetry.status]);

  // Actions
  const handleStartFeeding = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'FEEDING',
      speedMps: 0.4,
      feedRateGps: 35,
    }));
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Baru saja',
        type: 'FEED',
        message: 'Manual Trigger: Memulai penebaran pakan keliling rel.',
      },
      ...prev,
    ]);
  };

  const handleManualJog = (dir: 'forward' | 'backward') => {
    const delta = dir === 'forward' ? 2 : -2;
    setTelemetry((prev) => ({
      ...prev,
      currentPositionMeter: Math.max(
        0,
        Math.min(prev.totalTrackMeters, prev.currentPositionMeter + delta)
      ),
      status: 'PATROLLING',
    }));
  };

  const handleEmergencyStop = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'ESTOP',
      speedMps: 0,
      feedRateGps: 0,
    }));
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Baru saja',
        type: 'ERROR',
        message: 'EMERGENCY STOP DIAKTIFKAN OLEH OPERATOR!',
        details: 'Daya motor penggerak rel dan pelontar pakan diputus seketika.',
      },
      ...prev,
    ]);
  };

  const handleReturnToDock = () => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'IDLE',
      currentPositionMeter: 0,
      currentSegment: 'Docking Station',
      speedMps: 0,
      feedRateGps: 0,
    }));
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-sans">
      {/* Mobile Frame Container (Responsive max-w-md / full on mobile) */}
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
                  Kolam A
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Zap className="size-3 text-amber-400 fill-amber-400" /> Rail Feeder Robot • IoT
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
              
              {/* Status Header Card */}
              <Card className="border-border bg-gradient-to-b from-card to-card/60 backdrop-blur-md shadow-sm">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Status Kereta Rel
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm sm:text-base tracking-tight ${
                        telemetry.status === 'ESTOP' ? 'text-rose-400 font-black animate-pulse' : 
                        telemetry.status === 'FEEDING' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {telemetry.status === 'ESTOP' && 'DARURAT BERHENTI (E-STOP)'}
                        {telemetry.status === 'FEEDING' && 'SEDANG MENABUR PAKAN'}
                        {telemetry.status === 'PATROLLING' && 'MENYUSURI REL'}
                        {telemetry.status === 'IDLE' && 'STANDBY DI DOCK'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Posisi: <strong className="text-cyan-200 font-medium">{telemetry.currentSegment}</strong>
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end bg-secondary/40 p-2 rounded-lg border border-border/50 min-w-20">
                    <span className="text-[10px] font-mono text-muted-foreground">SPEED</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {telemetry.speedMps.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">m/s</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 2D Interactive Track Map Component */}
              <TrackMap 
                currentMeters={telemetry.currentPositionMeter}
                totalMeters={telemetry.totalTrackMeters}
                status={telemetry.status}
                hasObstacle={telemetry.isObstacleDetected}
              />

              {/* Metric Cards (Hopper & Battery) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Hopper Tank Card */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-amber-500/40 transition-colors">
                  <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[11px] font-mono font-medium text-muted-foreground">
                      TANGKI PAKAN
                    </CardTitle>
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                      <Wheat className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 flex flex-col gap-1.5">
                    <div>
                      <span className="text-2xl font-black font-mono text-amber-300">
                        {telemetry.hopperRemainingKg.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/ 20 Kg</span>
                    </div>
                    <Progress 
                      value={(telemetry.hopperRemainingKg / telemetry.hopperMaxKg) * 100} 
                      className="h-2 bg-secondary"
                    />
                  </CardContent>
                </Card>

                {/* Battery Card */}
                <Card className="border-border bg-card/80 shadow-sm hover:border-emerald-500/40 transition-colors">
                  <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[11px] font-mono font-medium text-muted-foreground">
                      BATERAI REL
                    </CardTitle>
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                      <Battery className="size-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 flex flex-col gap-1.5">
                    <div>
                      <span className="text-2xl font-black font-mono text-emerald-300">
                        {telemetry.batteryPercent}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">({telemetry.batteryVoltage}V)</span>
                    </div>
                    <Progress 
                      value={telemetry.batteryPercent} 
                      className="h-2 bg-secondary"
                    />
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
                  EMERGENCY STOP (BERHENTI SEKETIKA)
                </Button>
              </div>

              {/* Main Feed Trigger & Jogging Controls */}
              <div className="flex flex-col gap-2.5 pt-1">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Kendali Cepat Robot
                </span>

                <Button
                  onClick={handleStartFeeding}
                  disabled={telemetry.status === 'FEEDING'}
                  size="lg"
                  className="w-full h-12 sm:h-13 font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 transition-all active:scale-[0.98]"
                >
                  <Play className="size-4 fill-current shrink-0" />
                  {telemetry.status === 'FEEDING' ? 'PROSES MENABUR SEDANG BERJALAN...' : 'SEBAR PAKAN SEKARANG (1 PUTARAN)'}
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={() => handleManualJog('backward')}
                    variant="secondary"
                    className="h-11 sm:h-12 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-border/80 hover:bg-secondary/80 active:scale-[0.97] transition-all"
                  >
                    <ArrowLeft className="size-4 shrink-0 text-cyan-400" />
                    <span>MUNDUR (-2M)</span>
                  </Button>

                  <Button
                    onClick={() => handleManualJog('forward')}
                    variant="secondary"
                    className="h-11 sm:h-12 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-border/80 hover:bg-secondary/80 active:scale-[0.97] transition-all"
                  >
                    <span>MAJU (+2M)</span>
                    <ArrowRight className="size-4 shrink-0 text-cyan-400" />
                  </Button>
                </div>

                <Button
                  onClick={handleReturnToDock}
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-muted-foreground hover:text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 border-dashed border-border"
                >
                  <RotateCcw className="size-3.5" /> Reset Posisi ke Docking Station
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: SCHEDULE */}
            <TabsContent value="schedule" className="flex flex-col gap-3 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Jadwal Otomasi Pakan</h2>
                  <p className="text-xs text-muted-foreground">Target harian: 8.0 Kg</p>
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
                          <span>Putaran: <strong className="text-foreground">{item.loops}x</strong></span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 border-border text-cyan-400">
                            {item.speed}
                          </Badge>
                        </div>
                        {item.lastRunTime && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <Timer className="size-3 text-cyan-400" />
                            <span>Terakhir: {item.lastRunTime}</span>
                          </div>
                        )}
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
                <h2 className="text-sm font-bold text-foreground">Log Operasional Rel & Pakan</h2>
                <p className="text-xs text-muted-foreground">Telemetri sensor & riwayat eksekusi</p>
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

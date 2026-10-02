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
  Plus
} from 'lucide-react';
import { TrackMap } from './components/TrackMap';
import type { TelemetryData, ScheduleItem, LogEntry } from './types';

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

        // Determine current segment name
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
    <div className="flex justify-center min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Frame Container (Max-width 440px for ideal Mobile / PWA View) */}
      <div className="w-full max-w-[440px] min-h-screen bg-[#070b14] flex flex-col border-x border-slate-900 pb-24 shadow-2xl relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#070b14]/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-sm shadow">
              AF
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                AquaFeed-360
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  Kolam A
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Rail Feeder Robot • IoT</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${telemetry.deviceOnline ? 'bg-emerald-400' : 'bg-red-500'}`} />
              <span className="text-[11px] font-mono text-slate-300">
                {telemetry.deviceOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-4 space-y-4">
          
          {/* TAB 1: COCKPIT */}
          {activeTab === 'cockpit' && (
            <>
              {/* Status Header Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-0.5">STATUS KERETA REL</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${
                      telemetry.status === 'ESTOP' ? 'text-red-400' : 
                      telemetry.status === 'FEEDING' ? 'text-sky-400' : 'text-teal-400'
                    }`}>
                      {telemetry.status === 'ESTOP' && 'DARURAT BERHENTI (E-STOP)'}
                      {telemetry.status === 'FEEDING' && 'SEDANG MENABUR PAKAN'}
                      {telemetry.status === 'PATROLLING' && 'MENYUSURI REL'}
                      {telemetry.status === 'IDLE' && 'SIAP DI DOCKING'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Lokasi: <span className="text-slate-200 font-medium">{telemetry.currentSegment}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">KEC. LINTASAN</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {telemetry.speedMps.toFixed(1)} <span className="text-xs text-slate-400">m/s</span>
                  </span>
                </div>
              </div>

              {/* 2D Interactive Track Map */}
              <TrackMap 
                currentMeters={telemetry.currentPositionMeter}
                totalMeters={telemetry.totalTrackMeters}
                status={telemetry.status}
                hasObstacle={telemetry.isObstacleDetected}
              />

              {/* Metric Cards (Hopper & Battery) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Hopper Tank Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-mono">TANGKI PAKAN</span>
                    <Wheat className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-mono">
                      {telemetry.hopperRemainingKg.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ 20 Kg</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${(telemetry.hopperRemainingKg / telemetry.hopperMaxKg) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Battery Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-mono">DAYA BATERAI</span>
                    <Battery className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-mono">
                      {telemetry.batteryPercent}%
                    </span>
                    <span className="text-xs text-slate-400 ml-1">({telemetry.batteryVoltage}V)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${telemetry.batteryPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency E-Stop Button (High-Contrast, Touch Target > 54px) */}
              <div>
                <button
                  onClick={handleEmergencyStop}
                  className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg border border-red-500/50 flex items-center justify-center gap-2 text-base transition"
                >
                  <OctagonAlert className="w-5 h-5" />
                  EMERGENCY STOP (BERHENTI SEKETIKA)
                </button>
              </div>

              {/* Main Feed Trigger & Jogging Controls */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  KENDALI CEPAT OPERATOR
                </span>

                <button
                  onClick={handleStartFeeding}
                  disabled={telemetry.status === 'FEEDING'}
                  className={`w-full py-3.5 px-4 font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm ${
                    telemetry.status === 'FEEDING' 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  {telemetry.status === 'FEEDING' ? 'PROSES MENABUR SEDANG BERJALAN...' : 'SEBAR PAKAN SEKARANG (1 PUTARAN)'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleManualJog('backward')}
                    className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> MUNDUR (JOG -2M)
                  </button>

                  <button
                    onClick={() => handleManualJog('forward')}
                    className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
                  >
                    MAJU (JOG +2M) <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleReturnToDock}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Posisi ke Docking Station
                </button>
              </div>
            </>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Jadwal Pemberian Pakan</h2>
                  <p className="text-xs text-slate-400">Total target hari ini: 8.0 Kg</p>
                </div>
                <button className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {schedules.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-white">{item.time}</span>
                        <span className="text-xs font-medium text-slate-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>Dosis: <strong className="text-slate-200">{item.dosageKg} Kg</strong></span>
                        <span>Putaran: <strong className="text-slate-200">{item.loops}x</strong></span>
                        <span className="capitalize text-teal-400">{item.speed}</span>
                      </div>
                      {item.lastRunTime && (
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Terakhir: {item.lastRunTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleSchedule(item.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                          item.isActive ? 'bg-teal-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOGS & HISTORY */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-bold text-white">Log Operasional Rel & Pakan</h2>
                <p className="text-xs text-slate-400">Telemetri sensor & riwayat eksekusi</p>
              </div>

              <div className="space-y-2 pt-2">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        {log.type === 'ERROR' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        {log.type === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {log.type === 'INFO' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                        {log.type === 'FEED' && <Wheat className="w-3.5 h-3.5 text-sky-400" />}
                        <span className={
                          log.type === 'ERROR' ? 'text-red-400 font-bold' :
                          log.type === 'WARN' ? 'text-amber-400 font-bold' : 'text-slate-300'
                        }>
                          {log.type}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200 font-medium">{log.message}</p>
                    {log.details && (
                      <p className="text-[11px] text-slate-400 font-mono">{log.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Bottom PWA Navigation Bar */}
        <nav className="fixed bottom-0 max-w-[440px] w-full bg-[#070b14]/95 backdrop-blur-lg border-t border-slate-800/90 py-2.5 px-6 flex items-center justify-around z-40">
          <button 
            onClick={() => setActiveTab('cockpit')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'cockpit' ? 'text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Cockpit</span>
          </button>

          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'schedule' ? 'text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Jadwal</span>
          </button>

          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'logs' ? 'text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">Riwayat</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
export default App;

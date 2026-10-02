# Product Requirements Document (PRD)
## Autonomous Rail-Guided Pond Feeder (AquaFeed IoT)

---

## 1. Executive Summary & Problem Statement

### 1.1 Masalah di Lapangan
Pemberian pakan ikan konvensional di kolam budidaya (lele, nila, patin, udang) memiliki dua kelemahan utama:
1. **Penumpukan Pakan Lokal (*Uneven Feeding*)**: Feeder statis di tepi kolam membuat pakan menumpuk di satu titik. Ikan yang lebih kuat memonopoli pakan, sementara pakan tenggelam membusuk dan merusak kualitas air (amonia naik).
2. **Ketergantungan Tenaga Manual**: Pekerja harus memutari kolam membawa pakan berkarung-karung dengan risiko inkonsistensi jadwal dan dosis.

### 1.2 Solusi Sistem
Sistem **Autonomous Rail-Guided Feeder** memasang modul robot pemberi pakan di atas rel besi yang melingkari atau membelah kolam. Modul bergerak menyusuri rel dengan motor penggerak roda, menabur pakan secara merata saat melaju, dan kembali ke stasiun pengisian pakan/daya (*docking station*).

Sistem dikendalikan lewat web dashboard modern, responsif untuk layar smartphone pengelola kolam di lapangan, serta hemat komputasi.

---

## 2. Target Pengguna & Lingkungan Operasional

- **Operator Kolam / Pekerja Lapangan**: Mengakses web via ponsel murah (layar 5-6 inci, koneksi 3G/4G atau WiFi lokal kolam), butuh tombol kendali yang besar, kontras tinggi di bawah sinar matahari langsung, dan indikator status yang jelas.
- **Pemilik / Manajer Tambak**: Mengakses via tablet/laptop untuk mengatur jadwal feeding harian, dosis pakan, dan memantau stok pakan di hopper serta log pergerakan rel.

---

## 3. Fitur Utama Sistem (Web Frontend & IoT Hub)

### 3.1 Live Monitor Rel & Posisi Robot (*Track Digital Twin*)
- Representasi visual rel kolam (SVG diagram 2D interaktif).
- Titik koordinat robot saat bergerak (*Waypoint A -> Waypoint B -> Docking Station*).
- Status pergerakan: `IDLE`, `PATROLLING`, `FEEDING_RUN`, `CHARGING`, `ERROR_STALL`.

### 3.2 Dispenser & Hopper Monitor
- Kapasitas pakan tersisa (sensor ultrasonik / load cell di dalam tangki hopper).
- Kecepatan lontar pakan (RPM motor dispenser pakan).
- Peringatan stok kritis (*Hopper Low Warning*).

### 3.3 Penjadwalan Cerdas (*Smart Feeding Scheduler*)
- Konfigurasi feeding time otomatis (contoh: 07:00, 11:30, 16:00).
- Parameter per jadwal:
  - Dosis pakan (misal: 2.5 kg).
  - Kecepatan lari di atas rel (misal: 0.3 m/s).
  - Zona aktif penyebaran (misal: hanya sebar di Sisi Timur & Barat).

### 3.4 Manual Remote Override (Darurat & Uji Coba)
- Kontrol manual arah rel: `MAJU (Forward)`, `MUNDUR (Reverse)`, `STOP (Emergency E-Stop)`.
- Trigger pakan instan (*Dispense Now 100g/250g/500g*).
- Tombol `Return to Home / Docking Station`.

### 3.5 Log Riwayat & Telemetri
- Catatan feeding: Waktu eksekusi, total pakan terdistribusi, durasi tempuh rel, persentase keberhasilan putaran rel.
- Log error: Rel macet (*rail obstruction*), baterai drop, pakan tersumbat.

---

## 4. Arsitektur Komunikasi IoT & Data Model

```
[Web Dashboard (Vite + React)]
          │  ▲
   HTTPS  │  │  WSS (Live Telemetry & Rail Coordinates)
          ▼  │
 [Fastify / Go / Node Backend Broker]
          │  ▲
   MQTT   │  │  MQTT Topics (`feeder/telemetry`, `feeder/command`)
          ▼  │
 [ESP32 / Raspberry Pi IoT Gateway di Robot Rel]
          │
  ├── Motor Driver Stepper/BLDC (Penggerak Roda Rel)
  ├── Motor DC Dispenser + Pelontar Pakan
  ├── Sensor Limit Switch / RFID Reader (Penanda Posisi Rel)
  ├── Load Cell / Ultrasonik (Timbangan Sisa Pakan)
  └── Battery Management System (BMS)
```

---

## 5. Rekomendasi Tech Stack Web yang Efisien

Memperhatikan prinsip **efisiensi VPS**, beban CPU rendah, dan performa real-time IoT:

| Layer | Pilihan Teknologi | Alasan Efisiensi & Keunggulan |
|---|---|---|
| **Build Tool & Framework** | **Vite + React 19 / Preact (SPA)** | Jauh lebih ringan daripada Next.js SSR. Tidak memerlukan proses node server berat yang membebani CPU VPS. Output berupa static HTML/JS yang bisa disajikan via Caddy atau Nginx dengan memori < 15MB. |
| **Styling** | **Tailwind CSS v4** | Utility-first murni, zero-runtime CSS, bundle file sangat kecil (< 30KB terkompresi). |
| **Komponen UI** | **shadcn/ui (Radix Primitives)** | Aksesibel (keyboard navigation, focus ring, WCAG AA), tanpa bloat library berat. |
| **Realtime IoT Client** | **MQTT.js over WebSocket atau native WebSocket** | Konsumsi bandwidth dan baterai sangat kecil, update posisi robot instan (latensi < 100ms). |
| **Grafik / Diagram Rel** | **Native SVG Component** | Tidak perlu library 3D (Three.js/Canvas) yang membebani GPU/baterai ponsel pekerja tambak. SVG native ringan, scalable, dan mudah di-animasikan dengan CSS. |

---

## 6. Anti-Slop Design Guidelines (Standar Tampilan Khusus)

Mengikuti instruksi `antislop` dan `antislop-ui`:
1. **No Generic Purple-Blue Gradients**: Gunakan palet industrial/aquaculture (Slate Neutral, Deep Aqua Navy, Crisp High-Contrast Yellow/Amber untuk peringatan rel & emergency stop).
2. **Kontras Lapangan (Outdoor Sunlight Ready)**: Minimal rasio kontras 4.5:1 (WCAG AA), teks tajam, tidak ada font tipis abu-abu transparan.
3. **No Decorative Pulse Dots**: Lampu indikator hanya menyala jika perangkat benar-benar `ONLINE` / `ERROR`.
4. **Touch Target Nyaman**: Semua tombol kendali manual rel memiliki ukuran minimal `48px` agar mudah ditekan operator kolam dengan tangan basah atau sarung tangan.
5. **Three UI States Wajib**: Selalu sediakan Empty State, Loading State, dan Error/Disconnected State (misal: "Koneksi ke alat terputus di rel segmen 3").

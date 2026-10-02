# PREVIEW DESAIN MOBILE (PWA) — AQUAFEED IOT
**Prinsip Desain**: Anti-Slop Industrial High-Contrast, Ergonomis Satu Tangan, Outdoor Sunlight-Readable.

---

## 1. Tampilan Layar Utama (Live Cockpit & Track Monitor)

Layar ini dirancang untuk operator lapangan. Tombol besar, status terbaca sekilas dari jarak 1 meter di bawah sinar matahari.

```text
┌──────────────────────────────────────────┐
│ 10:42 📶 🔋 94%                  [⚙️]   │  <-- Header PWA
│ AQUAFEED • KOLAM UTAMA A                 │
├──────────────────────────────────────────┤
│ STATUS SISTEM:                           │
│ [🟢 SEDANG MENABUR]  • Posisi: 34m (Sisi Tim)│
│ Kecepatan: 0.3 m/s   • Pakan Keluar: 40g/s │
├──────────────────────────────────────────┤
│ 🗺️ PETA LINTASAN REL (LIVE TRACK 2D)      │
│                                          │
│       [DOCK 0m]═══════════[CP 1: 20m]     │
│          ║                     ║         │
│          ║    ~~~~~~~~~~~~~    ║         │
│          ║    ~  KOLAM    ~    ║ [ROBOT] │  <-- Marker Posisi Robot
│          ║    ~   IKAN    ~    ║  (34m)  │      Berjalan di Rel
│          ║    ~~~~~~~~~~~~~    ║         │
│       [CP 3: 60m]═════════[CP 2: 40m]     │
│                                          │
│  Lintasan: Segmen 2 (Sisi Timur)         │
│  Progress Putaran: [████████░░░░] 56%    │
├──────────────────────────────────────────┤
│ 📊 TELEMETRI ALAT                        │
│ ┌───────────────────┐ ┌────────────────┐ │
│ │ SISA PAKAN TANGKI │ │ BATERAI ROBOT  │ │
│ │     14.2 Kg       │ │      86%       │ │
│ │   (Kapasitas 20K) │ │   25.4V Normal │ │
│ └───────────────────┘ └────────────────┘ │
├──────────────────────────────────────────┤
│ 🛑 KENDALI CEPAT DARURAT (E-STOP)        │
│ ┌──────────────────────────────────────┐ │
│ │      [  EMERGENCY STOP  ]            │ │  <-- Tombol Merah Kontras Tinggi
│ │  (Hentikan Roda & Pelontar Seketika) │ │      Min-height: 56px (Mudah ditekan)
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ 🕹️ KONTROL MANUAL REL (JOGGING)          │
│ ┌───────────────┐      ┌───────────────┐ │
│ │  ◄◄ MUNDUR    │      │    MAJU ►►    │ │  <-- Tombol Taktil Lapangan
│ └───────────────┘      └───────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │   🎯 TEBAR SEKARANG (250 Gram)       │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │   🏠 KEMBALI KE DOCKING (HOME)       │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ [🏠 Cockpit]  [📅 Jadwal]  [📜 Riwayat]  │  <-- Bottom Navigation Bar PWA
└──────────────────────────────────────────┘
```

---

## 2. Tampilan Tab 2: Smart Feeding Schedule (Jadwal Otomatis)

```text
┌──────────────────────────────────────────┐
│ JADWAL PEMBERIAN PAKAN OTOMATIS          │
│ Total Target Hari Ini: 8.5 Kg            │
├──────────────────────────────────────────┤
│ [ + Buat Jadwal Baru ]                   │
│                                          │
│ 1. SESI PAGI (Aktif)            [ Toggle]│
│    ⏰ 07:30 WIB  • 2.5 Kg pakan           │
│    🛤️ Kecepatan: Sedang (0.3 m/s)        │
│    🔄 Putaran: 1x Keliling Penuh          │
│    Status Hari ini: [✅ Selesai 07:38]   │
│                                          │
│ 2. SESI SIANG (Aktif)           [ Toggle]│
│    ⏰ 12:00 WIB  • 3.0 Kg pakan           │
│    🛤️ Kecepatan: Cepat (0.5 m/s)         │
│    🔄 Putaran: 2x Keliling Penuh          │
│    Status Hari ini: [⏳ Menunggu Jadwal] │
│                                          │
│ 3. SESI SORE (Aktif)            [ Toggle]│
│    ⏰ 16:45 WIB  • 3.0 Kg pakan           │
│    🛤️ Kecepatan: Sedang (0.3 m/s)        │
│    🔄 Putaran: 1x Keliling Penuh          │
│    Status Hari ini: [⏳ Menunggu Jadwal] │
├──────────────────────────────────────────┤
│ [🏠 Cockpit]  [📅 Jadwal]  [📜 Riwayat]  │
└──────────────────────────────────────────┘
```

---

## 3. Tampilan Tab 3: Riwayat & Log Keamanan (Audit Trail)

```text
┌──────────────────────────────────────────┐
│ RIWAYAT & LOG PENGOPERASIAN REL          │
├──────────────────────────────────────────┤
│ 📅 Hari Ini (02 Okt 2026)                │
│                                          │
│ • 07:38 WIB [INFO]                       │
│   Sesi Pagi selesai. 2.48 Kg tertebar.   │
│   Waktu tempuh rel: 8 menit 12 detik.    │
│   Robot kembali ke Dock (Baterai: 91%).  │
│                                          │
│ • 06:15 WIB [PERINGATAN SENSOR]          │
│   Sensor halangan aktif di meter ke-42.  │
│   Motor berhenti 4 detik, jalur bersih,  │
│   melanjutkan putaran.                   │
│                                          │
│ 📅 Kemarin (01 Okt 2026)                 │
│ • 16:52 WIB [INFO]                       │
│   Sesi Sore selesai. 3.01 Kg tertebar.   │
│   Total akumulasi pakan harian: 8.52 Kg. │
├──────────────────────────────────────────┤
│ [🏠 Cockpit]  [📅 Jadwal]  [📜 Riwayat]  │
└──────────────────────────────────────────┘
```

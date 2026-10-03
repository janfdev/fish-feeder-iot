# Breakdown Spesifikasi & Task: Refactor AquaFeed-360 Cockpit (Circular Digital Twin)

Dokumen ini memecah arahan teknis menjadi peta task terstruktur untuk merevisi antarmuka **AquaFeed-360** agar merefleksikan perangkat fisik nyata: **Kolam Lingkaran + Lengan/Besi Rotary Berputar dari Poros Tengah + Hopper & Dispenser di Ujung + Partikel Pelet Terlempar**.

---

## 1. Analisis & Best Practice Arsitektur UI (Digital Twin IoT)

### Kenapa Konsep Baru Ini Jauh Lebih Superior?
1. **Representasi Fisik Nyata (Bukan Robot Beroda di Rel Persegi)**:
   - Alat sebenarnya adalah satu lengan besi panjang (*rotary arm*) yang berputar mengelilingi pivot tengah kolam.
   - Rel melingkar di bibir kolam berfungsi sebagai penopang/roller roda luar ujung lengan, sementara poros motor ada di tengah (atau roda traksi di rel luar).
2. **Koordinat Berbasis Derajat (0° – 360°) & Jarak Radial**:
   - Menghilangkan `CP1/CP2/CP3` yang membingungkan.
   - Menggunakan sudut rotasi: `0°` (Docking Station), bergerak searah jarum jam (*Clockwise* `↻`), dengan perhitungan jarak busur keliling ($s = \frac{\theta}{360} \times 80\text{ m}$).
3. **Efek Partikel Pakan Ringan (CSS/SVG Only)**:
   - Saat `FEEDING`, dispenser di ujung lengan menembakkan partikel pelet (*feed spray*) ke arah air kolam secara dinamis.
   - Tanpa canvas/WebGL berat agar baterai ponsel operator tidak boros saat diakses outdoor.

---

## 2. Struktur Data Telemetri Baru (`src/types.ts`)

Perubahan status dan variabel telemetri:
- `currentAngleDeg`: 0 – 360° (sudut posisi lengan saat ini)
- `motorRpm`: 0 – 150 RPM (kecepatan motor penggerak)
- `direction`: `'CW'` (Clockwise) | `'CCW'` (Counter-Clockwise) | `'STOP'`
- `rotationCount`: misalnya `0.42 / 1` putaran
- `controlMode`: `'AUTO'` (mengikuti jadwal) | `'MANUAL'` (dikendalikan operator)
- `isDispensing`: boolean (indikator pelet pakan sedang menyembur)

---

## 3. Rincian Task Eksekusi Bertahap

```text
[PHASE 1: Komponen Visual SVG CircularTrackMap.tsx]
├── 1.1 Render Kolam Lingkaran (Water ripple gradient, radial depth)
├── 1.2 Render Rel Melingkar Luar & Marker Docking 0°
├── 1.3 Render Central Motor Pivot (Poros tengah kolam berputar)
├── 1.4 Render Lengan Besi Tunggal (Metal arm line dari poros ke rel luar)
├── 1.5 Render Hopper & Dispenser di ujung lengan (berikut status lampu led)
└── 1.6 Render Animasi Partikel Pelet Menyembur saat status FEEDING

[PHASE 2: Telemetri & Metric Cards Baru di App.tsx]
├── 2.1 Tambah Mode Toggle: [ AUTO ] vs [ MANUAL ]
├── 2.2 Header Telemetri Digital Twin:
│   ├── Status (🟢 FEEDING / 🔵 PATROL / ⚪ STANDBY / 🔴 ESTOP)
│   ├── Posisi Sudut: 127° • Arah: ↻ Clockwise
│   └── Jarak Tempuh: 28.2m / 80m • Putaran: 0.35 / 1
├── 2.3 Grid Metrik 4 Kartu (shadcn Card):
│   ├── Tangki Pakan (16.4 / 20 kg + progress)
│   ├── Baterai Rel (88% • 25.2V)
│   ├── Motor Pivot (120 RPM / 0.35 m/s)
│   └── Sudut Rel (127° / 360°)
└── 2.4 Kontrol Taktil Sesuai Mekanik Rotasi:
    ├── Emergency Stop (56px Rose)
    ├── Sebar Pakan — 1 Putaran (Gradient Cyan-Teal)
    ├── Rotasi Manual [ ↶ -2° ] dan [ +2° ↷ ]
    └── ↻ Kembali ke Dock (0°)

[PHASE 3: Penyempurnaan Tab Jadwal & Riwayat]
├── 3.1 Tab Jadwal: Cantumkan target putaran (1x/2x Putaran), estimasi durasi & pakan
└── 3.2 Tab Riwayat: Cantumkan log berbasis sudut rotasi & durasi putaran
```

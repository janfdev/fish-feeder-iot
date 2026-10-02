# DOKUMENTASI VISUAL & ARSITEKTUR FISIK ALAT IOT (AQUAFEED-360)
**Sistem Pemberi Pakan Ikan Otomatis Berbasis Rel Keliling Kolam**

---

## 1. Arsitektur Fisik & Mekanik Alat IoT di Kolam

Berdasarkan deskripsi Anda, alat ini adalah sistem **Rail-Guided Overhead/Perimeter Feeder Robot**. Robot membawa tangki pakan dan bergerak menyusuri rel pipa besi yang mengitari bibir kolam.

### 1.1 Diagram Konsep Fisik Lintasan & Kolam

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REL BESI PENGELILING KOLAM                      │
│                                                                        │
│   [STASIUN DOCKING] ═══════════════════════════════════════════════╗   │
│   (Home / Charging /                                               ║   │
│    Isi Ulang Pakan)                                                ║   │
│          ║                                                         ║   │
│          ║            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                ║   │
│          ║            ~                           ~                ║   │
│          ║            ~      AREA AIR KOLAM       ~   [KERETA]     ║   │
│          ║            ~                           ~   [ROBOT ] ──> ║   │
│          ║            ~      (Ikan Berkumpul)     ~   [FEEDER]     ║   │
│          ║            ~                           ~   (Menabur)    ║   │
│          ║            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                ║   │
│          ║                                                         ║   │
│          ╚═════════════════════════════════════════════════════════╝   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Detail Komponen Kereta Robot Feeder (Gantungan / Dudukan Rel)

```text
               ┌─────────────────────────────────────┐
               │         REL PIPA BESI (TRACK)       │
               └─────────▲─────────────────▲─────────┘
                         │                 │
                   (Roda Rel Atas)   (Roda Rel Bawah)
                         │                 │
                ═════════╧═════════════════╧═════════  <-- Bracket Penjepit Rel
                         │                 │
                    ┌────┴─────────────────┴────┐
                    │      MOTOR PENGGERAK      │  <-- Stepper / DC Worm Gear
                    │      (Traksi Roda Rel)    │      (Anti-selip di pipa licin)
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    BOX KONTROLER (IP67)   │  <-- ESP32 / LoRa / WiFi
                    │  - Baterai LiFePO4 12V    │  <-- BMS Charging Pins
                    │  - Driver Motor + E-Stop  │  <-- Sensor Obstacle Ultrasonik
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │       HOPPER PAKAN        │  <-- Tangki Kerucut 15-25 Kg
                    │  (Bahan Fiber / Stainless)│  <-- Sensor Level / Loadcell
                    └─────────────┬─────────────┘
                                  │
                         ┌────────┴────────┐
                         │ KATUP & IMPELLER │  <-- Motor Pelontar Pakan
                         │ (Slinger Spinner)│      (Menyebar pakan ke arah air)
                         └────────┬────────┘
                                  │
                               • • • •  <-- Butiran Pelet Pakan Terlempar
                              •   •   •
                             ~~~~~~~~~~~  <-- Permukaan Air Kolam
```

---

## 2. Spesifikasi Sensor & Aktuator Alat

1. **Penggerak Rel (Traction Motor)**: Motor DC High-Torque dengan sistem roda polyurethane beralur melingkar yang mencengkeram pipa rel besi agar tidak slip saat terkena cipratan air atau lumut.
2. **Dispenser & Pelontar (Feeder & Slinger Mechanism)**:
   - *Auger / Katup Ulir*: Mengatur gramasi pakan yang jatuh per detik.
   - *Piringan Pelontar (Centrifugal Spinner)*: Memutar pakan hingga terlempar 3-6 meter ke tengah kolam.
3. **Sensor Penentu Posisi (Positioning)**:
   - Tag RFID / Magnet Neodymium pada tiang-tiang rel sebagai penanda checkpoint (`Titik 0 / Dock`, `Sudut A`, `Sudut B`, `Sudut C`, `Sudut D`).
   - Rotary Encoder pada roda untuk kalkulasi jarak presisi (misal: "berhenti dan sebar pakan di meter ke-14").
4. **Sensor Keamanan (Safety)**:
   - *Laser / Ultrasonic Obstacle Sensor*: Menghentikan kereta otomatis jika ada dahan pohon, tali jaring, atau penghalang di lintasan rel besi.
   - *Bumper Limit Switch Fisik*: Tombol darurat mekanis jika menabrak ujung rel.
5. **Docking Station (Basecamp)**:
   - Titik pengisian daya baterai nirkabel/plat tembaga magnetis.
   - Corong pengisian ulang pakan otomatis (jika ada silo utama).

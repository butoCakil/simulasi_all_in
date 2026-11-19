# Simulasi TMG

Kumpulan simulator praktik buatan **Dani Mardiyanto, S.Pd.** Tiap simulator berupa satu halaman HTML
yang berdiri sendiri dan berjalan tanpa server (cukup dibuka di peramban).

| Berkas | Simulator |
| --- | --- |
| `simulator-osiloskop.html` | Simulator Osiloskop TMG |
| `simulator-multimeter.html` | Simulator Multimeter TMG |
| `simulator-listrik-rumah.html` | Simulator Instalasi Listrik Rumah |
| `simulator-ic-digital.html` | Simulator IC Digital |
| `sim_ram_dotmatrix.html` | RAM & Dot Matrix Simulator |
| `lab_fisika_sd/fisika-sd.html` | Lab Fisika SD — Coba, amati, temukan! (+ `app.js`, `experiments.js`, `style.css`) |

Nama berkas dan susunan folder sama dengan di `belajar.iprime-bansari.online/simulasi/`, jadi isi
repo ini bisa langsung disalin ke sana.

## Dipakai di dua tempat

- **belajar.iprime-bansari.online/simulasi/** — fitur *Kirim Tugas* dan tautan *Daftar Tugas*
  memakai backend iprime (`../pembayaran/backend/`) dan tetap tampil di sana.
- **Super APP Jurusan TE** (`te.smknbansari.sch.id/simulasi/`) — salinan disajikan apa adanya.
  Di luar host `iprime-bansari.online` tombol *Kirim Tugas* dan tautan *Daftar Tugas* disembunyikan
  (penjaga kecil di awal `<head>` tiap berkas), karena backend iprime tidak ada di sana.

## Mode sematan Super APP

Di Super APP tiap simulator (selain Lab Fisika SD) juga dipakai sebagai **alat tugas**: dibuka di
iframe dengan `?sematan=1`, hasil kerja siswa tersimpan otomatis dan terkirim ke guru, dan guru
melihatnya dengan `?pratinjau=1`. Bagian ini ada di akhir tiap berkas di antara penanda
`SEMATAN-SUPERAPP:MULAI` dan `SEMATAN-SUPERAPP:SELESAI`, dan hanya aktif di dalam iframe Super APP;
dibuka biasa (termasuk di iprime) simulator berjalan seperti semula.

- Sumbernya di folder `sematan/` (`inti.js` untuk protokol, satu berkas adaptor per simulator).
  Setelah mengubahnya jalankan `python3 sematan/pasang.py` dari akar repo; skrip itu mengganti
  blok lama di tiap simulator.
- Isi berkas yang dikirim sama dengan data *Kirim Tugas* bawaan: laporan lima ronde (Osiloskop,
  Multimeter), proyek rangkaian (Instalasi Listrik, IC Digital), dan gabungan proyek keempat tab
  (RAM & Dot Matrix).
- Osiloskop dan Multimeter di tugas: guru bisa meminta beberapa job berurutan. Siswa melihat
  bilah soal (`sematan/bilah-job.js`) di atas tab, mengerjakan job satu per satu (tombol *Kembali
  ke Latihan* disembunyikan agar hasil job tidak hilang), dan berkas berisi
  `{format: "TERAPAN-GABUNGAN-1", jobs: [laporan job, ...]}`. Data ronde (sinyal, baterai,
  resistor, …) dikirim server per siswa. Guru di pratinjau bisa memilih tiap job dan tiap ronde;
  tampilan alat disusun ulang dari setelan yang tersimpan di ronde itu.
- Logika simulator tidak diubah. Instalasi Listrik dan IC Digital mendapat satu baris
  `window.tugasRangkaian = …` dan RAM & Dot Matrix satu blok `window.simTugasRam = …` (bertanda
  `SEMATAN-SUPERAPP`) supaya fungsi simpan/muat yang ada bisa dipanggil dari luar.

## Perapian dari berkas kiriman awal

Berkas awal adalah hasil *Simpan halaman* dari peramban, sehingga memuat salinan elemen yang juga
dibuat ulang oleh skrip saat halaman dibuka. Akibatnya beberapa tombol tampil dobel dan hanya salah
satunya yang berfungsi (misalnya deret tab di atas Simulator Osiloskop). Yang dirapikan:

- salinan statis yang dibuat ulang skrip dibuang (Osiloskop: tab, tombol panel, kontrol, probe;
  RAM & Dot Matrix: tabel ASCII, grid RGB, palet; IC Digital dan Instalasi Listrik: dialog Kirim
  Tugas);
- skrip pelacak Cloudflare dan komentar `saved from url` dibuang;
- Lab Fisika SD memakai `app.js`, `experiments.js`, `style.css` langsung (bukan folder `_files`);
- keterangan hak cipta ditambahkan di awal tiap halaman.

Logika simulator tidak diubah.

## Lisensi

Hak Cipta (c) 2026 Dani Mardiyanto, S.Pd. Gratis untuk pembelajaran dan pengajaran; ketentuan
lengkap ada di `LICENSE`.

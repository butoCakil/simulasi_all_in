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

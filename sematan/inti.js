/* ==========================================================================
   SEMATAN SUPER APP — ditambahkan untuk Super APP Jurusan TE (SIMBioTE).
   Logika simulator tidak diubah. Bagian ini dibuat oleh sematan/pasang.py dari
   sematan/inti.js + sematan/<simulator>.js; ubah di sana, jangan di sini.
   Aktif hanya dengan ?sematan=1 di dalam iframe. Pesan {alat, v:1, tipe, ...}:
     induk → alat   muat {berkas}   minta   soal {soal}
     alat → induk   siap {versiApp, versiBerkas}   dimuat {galat}   berkas {berkas}
                    berubah {berkas} (ditunda 0,6 dtk setelah pengguna mengubah isi)
                    selesai (semua soal tugas selesai; induk mengarahkan ke tombol Kirim)
   ?pratinjau=1: guru melihat hasil siswa; tidak ada pesan "berubah".
   ========================================================================== */
(function () {
  var prm = new URLSearchParams(location.search);
  if (prm.get('sematan') !== '1' || window.parent === window) return;
  var PRATINJAU = prm.get('pratinjau') === '1';
  var ALAT = '%ALAT%';
  var A = (%ADAPTER%)(PRATINJAU);
  document.documentElement.classList.add('sematan');
  if (PRATINJAU) document.documentElement.classList.add('pratinjau');
  var asal = location.origin;
  try { if (document.referrer) asal = new URL(document.referrer).origin; } catch (e) {}
  var izin = [location.origin, asal];
  function kirim(tipe, isi) {
    try { parent.postMessage(Object.assign({ alat: ALAT, v: 1, tipe: tipe }, isi || {}), asal); } catch (e) {}
  }
  function isi() {
    try { return A.ambil() || ''; } catch (e) { return ''; }
  }
  var terakhir = '', jam = null;
  // Adaptor boleh memberi tahu induk bahwa semua soal selesai (induk mengarahkan ke tombol Kirim).
  if (A.pasangSelesai)
    A.pasangSelesai(function () {
      clearTimeout(jam);
      var b = isi();
      if (b) { terakhir = b; kirim('berubah', { berkas: b }); }
      kirim('selesai');
    });
  function periksa() {
    if (PRATINJAU) return;
    var b = isi();
    if (b && b !== terakhir) { terakhir = b; kirim('berubah', { berkas: b }); }
  }
  function tunda() { clearTimeout(jam); jam = setTimeout(periksa, 600); }
  ['input', 'change', 'pointerup', 'keyup', 'click', 'drop'].forEach(function (t) {
    document.addEventListener(t, tunda, true);
  });
  setInterval(periksa, 3000);
  addEventListener('message', function (e) {
    var m = e.data;
    if (e.source !== parent || izin.indexOf(e.origin) < 0) return;
    if (!m || m.alat !== ALAT || m.v !== 1) return;
    if (m.tipe === 'muat') {
      if (typeof m.berkas !== 'string') { kirim('dimuat', { galat: 'Isi berkas tidak ada' }); return; }
      clearTimeout(jam);
      Promise.resolve()
        .then(function () { return m.berkas.trim() ? A.muat(m.berkas) : null; })
        .then(
          function () { terakhir = isi(); kirim('dimuat', { galat: null }); },
          function (err) {
            kirim('dimuat', { galat: err instanceof SyntaxError ? 'Berkas bukan JSON yang sah' : String((err && err.message) || err) });
          }
        );
    } else if (m.tipe === 'minta') {
      clearTimeout(jam);
      var b = isi();
      if (b) terakhir = b;
      kirim('berkas', { berkas: b });
    } else if (m.tipe === 'soal' && A.soal) {
      try { A.soal(m.soal); } catch (err) {}
      terakhir = isi();
    }
  });
  terakhir = isi();
  kirim('siap', { versiApp: A.versi, versiBerkas: 1 });
})();

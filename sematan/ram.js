function (PRATINJAU) {
  // Berkas = gabungan proyek keempat tab (RAM, Dot Matrix, TV LED RGB, 7/14 Segmen) + tab aktif.
  // window.simTugasRam diisi di dalam skrip simulator (baris SEMATAN-SUPERAPP).
  return {
    versi: 'ram-dotmatrix+sematan1',
    ambil: function () { return window.simTugasRam ? JSON.stringify(window.simTugasRam.ambil()) : ''; },
    muat: function (teks) {
      var p = JSON.parse(teks);
      if (!p || p.format !== 'RAM-DOT-SUPERAPP-1') throw new Error('Format proyek tidak sesuai.');
      return window.simTugasRam.muat(p);
    },
  };
}

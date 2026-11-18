function (PRATINJAU) {
  // Berkas = proyek yang sama dengan "Kirim Tugas" bawaan ({format, ...rangkaian}).
  // window.tugasRangkaian diisi pasangTugasRangkaian() (baris SEMATAN-SUPERAPP).
  return {
    versi: '%VERSI%',
    ambil: function () {
      var T = window.tugasRangkaian;
      return T ? JSON.stringify(Object.assign({ format: T.format }, T.ambil())) : '';
    },
    muat: function (teks) {
      var T = window.tugasRangkaian;
      if (!T) throw new Error('Simulator belum siap.');
      T.muat(JSON.stringify(T.validasi(JSON.parse(teks))));
    },
  };
}

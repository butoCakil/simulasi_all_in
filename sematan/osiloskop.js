function (PRATINJAU) {
  // Berkas = laporan job (5 ronde) yang sama dengan "Unduh Hasil"; kosong sebelum job selesai.
  function sah(d) {
    return d && d.format === format && d.version === 1 && d.mode !== 'supply' &&
      Object.prototype.hasOwnProperty.call(modeInfo, d.mode) && Array.isArray(d.rounds) && d.rounds.length === 5 &&
      d.rounds.every(function (r) { return r && r.fixture && typeof r.fixture === 'object' && r.answer && typeof r.answer === 'object'; });
  }
  // Data ronde dari server ({mode: [5 ronde]}) menggantikan pengacak bawaan saat job dimulai.
  var RONDE = null;
  var fixturesAsli = fixtures;
  fixtures = function (tab) {
    var f = RONDE && RONDE[tab];
    return Array.isArray(f) && f.length === 5 ? JSON.parse(JSON.stringify(f)) : fixturesAsli(tab);
  };
  // Siswa di Super APP tidak melihat acuan dan jumlah tepat sebelum guru merilis nilai.
  if (!PRATINJAU) {
    var aslinya = updateJob;
    updateJob = function () {
      aslinya();
      if (state.report && !state.report.review) {
        $('exerciseTitle').textContent = 'Job selesai';
        $('exerciseText').textContent =
          'Tekan Kirim di halaman tugas. Nilai dan acuan tampil setelah guru merilis nilai.';
      }
    };
    var gaya = document.createElement('style');
    gaya.textContent = 'html.sematan:not(.pratinjau) #results{display:none}';
    document.head.append(gaya);
    updateJob();
  }
  return {
    versi: 'osiloskop-tmg+sematan1',
    ambil: function () {
      if (!state.report) return '';
      var r = Object.assign({}, state.report);
      delete r.sent; delete r.review;
      return JSON.stringify(r);
    },
    muat: function (teks) {
      var d = JSON.parse(teks);
      if (!sah(d)) throw new Error('Data osiloskop tidak valid.');
      state.job = null;
      practiceSetup(d.mode);
      state.report = Object.assign({}, d, {
        review: PRATINJAU,
        correct: d.rounds.filter(function (r) { return r.correct === true; }).length,
      });
      renderResults(state.report);
      update();
    },
    // Pengaturan tugas dari guru: {mode, ronde}. mode = job yang wajib dikerjakan (tab lain
    // disembunyikan); ronde = data lima ronde tiap job dari server.
    soal: function (s) {
      if (s && s.ronde && typeof s.ronde === 'object') RONDE = s.ronde;
      var mode = s && s.mode;
      if (!mode || mode === 'supply' || !Object.prototype.hasOwnProperty.call(modeInfo, mode)) return;
      for (var id in tabButtons) tabButtons[id].hidden = id !== mode;
      if (!state.job && !state.report) { practiceSetup(mode); update(); }
    },
  };
}

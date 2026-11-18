function (PRATINJAU) {
  // Berkas = laporan job (5 ronde) yang sama dengan "Unduh Hasil"; kosong sebelum job selesai.
  function sah(d) {
    return d && d.format === format && d.version === 1 && d.mode !== 'supply' &&
      Object.prototype.hasOwnProperty.call(modeInfo, d.mode) && Array.isArray(d.rounds) && d.rounds.length === 5 &&
      d.rounds.every(function (r) { return r && r.fixture && typeof r.fixture === 'object' && r.answer && typeof r.answer === 'object'; });
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
    // Pengaturan tugas dari guru: {mode} = job yang wajib dikerjakan; tab lain disembunyikan.
    soal: function (s) {
      var mode = s && s.mode;
      if (!mode || mode === 'supply' || !Object.prototype.hasOwnProperty.call(modeInfo, mode)) return;
      for (var id in tabButtons) tabButtons[id].hidden = id !== mode;
      if (!state.job && !state.report) { practiceSetup(mode); update(); }
    },
  };
}

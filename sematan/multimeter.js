function (PRATINJAU) {
  // Berkas = data kiriman tugas bawaan (format MULTIMETER-1 versi 4 + penilaian lima ronde);
  // kosong sebelum job selesai.
  // Data ronde dari server ({mode: pool}) menggantikan pengacak bawaan saat job dimulai.
  var RONDE = null;
  var mulaiAsli = startAssessment;
  startAssessment = function () {
    var p = RONDE && RONDE[state.mode];
    if (!Array.isArray(p) || !p.length) return mulaiAsli();
    if (exam || reviewing) return;
    recordError();
    exam = {
      rounds: [],
      errors: practiceErrors.splice(0),
      pool: JSON.parse(JSON.stringify(p)).slice(0, 5),
      previous: practiceSnapshot(),
      done: false,
      sent: false,
    };
    nextFixture();
  };
  return {
    versi: 'multimeter-tmg+sematan1',
    ambil: function () {
      if (!exam || !exam.done) return '';
      var answer = state.mode === 'continuity'
        ? exam.rounds.reduce(function (mask, round, i) { return mask + (round.answer << i); }, 0)
        : exam.rounds[exam.rounds.length - 1].answer;
      return JSON.stringify(Object.assign({ format: format, version: 4 }, state, {
        answer: answer,
        assessment: { rounds: exam.rounds, errors: exam.errors },
      }));
    },
    muat: function (teks) {
      var d = JSON.parse(teks);
      if (PRATINJAU) {
        reviewing = true;
        document.querySelectorAll('[data-mode],[data-probe],.controls button,#answer,#wireAnswers select,#dial,#zeroDial,#coverHandle')
          .forEach(function (el) { el.disabled = true; });
        $('examReview').replaceChildren();
        applySubmission(d);
        statusOverride = 'Kiriman siswa dimuat. Jawaban tertera di bawah.';
        refresh();
        return;
      }
      exam = null;
      applySubmission(d);
      // Siswa membuka lagi hasil job yang sudah selesai (acuan tidak ditampilkan).
      $('examReview').replaceChildren();
      var a = d.assessment;
      if (a && Array.isArray(a.rounds) && a.rounds.length === 5)
        exam = { rounds: a.rounds, errors: Array.isArray(a.errors) ? a.errors : [], pool: [],
          previous: practiceSnapshot(), done: true, sent: false, target: a.rounds[4] };
      drawRack(); drawBoard(); refresh();
    },
    // Pengaturan tugas dari guru: {mode, ronde}. mode = praktikum yang wajib dikerjakan (mode lain
    // disembunyikan); ronde = isi lima pengukuran tiap praktikum dari server.
    soal: function (s) {
      if (s && s.ronde && typeof s.ronde === 'object') RONDE = s.ronde;
      var mode = s && s.mode;
      if (!mode || !Object.prototype.hasOwnProperty.call(modes, mode)) return;
      document.querySelectorAll('[data-mode]').forEach(function (b) { b.hidden = b.dataset.mode !== mode; });
      if (!exam && !reviewing) setMode(mode);
    },
  };
}

function (PRATINJAU) {
  // Berkas: tugas tanpa pengaturan atau bebas pilih = data kiriman bawaan satu praktikum (format
  // MULTIMETER-1 versi 4 + penilaian lima ronde); tugas dengan urutan job =
  // {format: GABUNGAN, jobs: [kiriman praktikum, ...]}. Kosong sebelum job pertama selesai.
  var GABUNGAN = 'TERAPAN-GABUNGAN-1';
  var salin = function (x) { return JSON.parse(JSON.stringify(x)); };
  var nama = function (m) { return modes[m] ? $('modes').querySelector('[data-mode="' + m + '"]').textContent : m; };

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
      pool: salin(p).slice(0, 5),
      previous: practiceSnapshot(),
      done: false,
      sent: false,
    };
    nextFixture();
  };
  // Data soal tiap ronde ikut tersimpan di ronde itu, agar guru bisa melihat susunannya lagi.
  var fixtureAsli = nextFixture;
  nextFixture = function () {
    fixtureAsli();
    if (exam && exam.target) exam.target.soal = salin(exam.pool[exam.rounds.length]);
  };

  function kirimanJob() {
    var answer = state.mode === 'continuity'
      ? exam.rounds.reduce(function (mask, round, i) { return mask + (round.answer << i); }, 0)
      : exam.rounds[exam.rounds.length - 1].answer;
    return Object.assign({ format: format, version: 4 }, salin(state), {
      answer: answer,
      assessment: { rounds: salin(exam.rounds), errors: salin(exam.errors) },
    });
  }

  var ATUR = null; // null = tanpa pengaturan (halaman alat); {bebas, urutan}
  var SELESAI = {}; // mode → kiriman praktikum siswa
  var AKTIF = 0;
  var beriTahuSelesai = function () {};
  var tampil = BilahJobSematan($('modes'));
  var urutan = function () { return ATUR && !ATUR.bebas ? ATUR.urutan : []; };
  function hanyaMode(daftar) {
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.hidden = daftar.indexOf(b.dataset.mode) < 0; });
  }
  var gaya = document.createElement('style');
  gaya.textContent =
    'html.sematan #submitTask{display:none!important}' +
    'html.sematan.soal-tugas #practice{display:none!important}';
  document.head.append(gaya);

  // ------------------------------------------------------------------ siswa
  function bilahSiswa() {
    if (!ATUR) return tampil(null);
    var selesaiIni = Boolean(exam && exam.done);
    if (ATUR.bebas)
      return tampil({
        judul: 'Pilih satu praktikum, kerjakan lima pengukurannya',
        pesan: selesaiIni ? 'Praktikum ' + nama(state.mode) + ' selesai.' : 'Pilih praktikum, lalu tekan Mulai Job.',
        tombol: selesaiIni ? { teks: 'Selesai, ke tombol Kirim', klik: function () { beriTahuSelesai(); } } : null,
      });
    var u = urutan();
    var semua = u.every(function (m) { return SELESAI[m]; });
    var sekarang = u[AKTIF];
    tampil({
      judul: 'Soal ' + (AKTIF + 1) + ' dari ' + u.length + ' · ' + nama(sekarang),
      titik: u.map(function (m, i) {
        return {
          teks: String(i + 1),
          kelas: (i === AKTIF ? 'on ' : '') + (SELESAI[m] ? 'selesai' : ''),
          judul: 'Soal ' + (i + 1) + ': ' + nama(m) + (SELESAI[m] ? ' (selesai)' : ''),
        };
      }),
      pesan: semua
        ? 'Semua praktikum selesai. Tekan Kirim di halaman tugas. Nilai dan acuan tampil setelah guru merilis nilai.'
        : selesaiIni
          ? 'Praktikum ' + nama(sekarang) + ' selesai. Lanjutkan ke soal berikutnya.'
          : 'Kerjakan praktikum ' + nama(sekarang) + ': boleh berlatih dulu, lalu tekan Mulai Job dan selesaikan lima pengukuran.',
      tombol: semua
        ? { teks: 'Selesai, ke tombol Kirim', klik: function () { beriTahuSelesai(); } }
        : selesaiIni
          ? { teks: 'Lanjut ke soal ' + (AKTIF + 2) + ': ' + nama(u[AKTIF + 1]), klik: lanjut }
          : null,
    });
  }
  function mulaiJob(i) {
    var u = urutan();
    AKTIF = Math.max(0, Math.min(u.length - 1, i));
    if (exam && exam.done) {
      if (exam.previous) Object.assign(state, exam.previous);
      state.cover = 0;
      exam = null; lastError = null; pendingError = null;
    }
    detach(); clearAnswer();
    hanyaMode([u[AKTIF]]);
    setMode(u[AKTIF]);
    drawRack(); drawBoard(); refresh();
  }
  function lanjut() {
    var i = urutan().findIndex(function (m) { return !SELESAI[m]; });
    if (i >= 0) mulaiJob(i);
  }
  var uiAsli = updateAssessmentUI;
  updateAssessmentUI = function () {
    uiAsli();
    if (PRATINJAU) return;
    if (ATUR && exam && exam.done && !exam.direkam && (ATUR.bebas || urutan().indexOf(state.mode) >= 0)) {
      exam.direkam = true;
      SELESAI[state.mode] = kirimanJob();
    }
    bilahSiswa();
  };

  // ------------------------------------------------------------------ pratinjau guru
  var JOBS = [];
  var PILIH = { job: 0, ronde: 0 }; // ronde 0 = ringkasan
  function daftarPratinjau() {
    var u = urutan();
    if (u.length) return u.map(function (m) { return { mode: m, job: JOBS.find(function (j) { return j.mode === m; }) || null }; });
    return JOBS.map(function (j) { return { mode: j.mode, job: j }; });
  }
  function kunciKontrol() {
    document.querySelectorAll('[data-mode],[data-probe],.controls button,#answer,#wireAnswers select,#dial,#zeroDial,#coverHandle')
      .forEach(function (el) { el.disabled = true; });
  }
  var angkaId = function (x) { return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(x); };
  /** Susun ulang meja, selektor, dan probe pada satu pengukuran dari data ronde yang tersimpan. */
  function pasangRonde(job, n) {
    var r = job.assessment.rounds[n - 1];
    var soal = r.soal !== undefined ? r.soal : RONDE && RONDE[job.mode] ? RONDE[job.mode][n - 1] : undefined;
    if (soal === undefined) return false;
    var pool = [];
    pool[n - 1] = soal;
    reviewing = false;
    exam = { rounds: new Array(n - 1), pool: pool, errors: [], done: false };
    try { fixtureAsli(); } finally { exam = null; reviewing = true; }
    // Nilai sebenarnya komponen (toleransi acak ±5%) disamakan dengan acuan ronde itu.
    if (job.mode === 'ohm' && state.resistors.length === 1 && Number.isFinite(r.expected)) state.resistors[0].actual = r.expected;
    if (job.mode === 'dca' && Number.isFinite(r.expected) && r.expected > 0) { state.load.actual = 3000 / r.expected; state.power = true; }
    reviewLayout = job.mode === 'ohm' && ['seri', 'paralel'].indexOf(r.layout) >= 0 ? r.layout : null;
    state.range = r.range;
    state.probes = Object.assign({ red: null, black: null }, r.probes || {});
    $('answer').value = r.answer;
    rackOpen = false;
    drawRack(); drawBoard();
    statusOverride = '';
    refresh();
    return true;
  }
  function tampilPratinjau() {
    var d = daftarPratinjau();
    if (!d.length) return tampil(null);
    var k = Math.min(PILIH.job, d.length - 1), p = d[k];
    hanyaMode([p.mode]);
    var pesan;
    if (!p.job) {
      reviewing = false; exam = null; setMode(p.mode); reviewing = true;
      $('examReview').replaceChildren(); $('examReview').hidden = true;
      kunciKontrol(); drawRack(); drawBoard(); refresh();
      pesan = 'Praktikum ini belum dikerjakan siswa.';
    } else {
      reviewing = true;
      $('examReview').replaceChildren();
      applySubmission(p.job);
      kunciKontrol();
      var rr = p.job.assessment.rounds;
      var kabel = p.mode === 'continuity';
      if (PILIH.ronde > 0 && !kabel) {
        var r = rr[PILIH.ronde - 1];
        var ok = pasangRonde(p.job, PILIH.ronde);
        pesan = 'Pengukuran ' + PILIH.ronde + ': ' + (r.instruction || '') + ' Jawaban siswa ' + angkaId(r.answer) + ' ' +
          modes[p.mode].unit + ' · acuan ' + angkaId(r.expected) + ' ' + modes[p.mode].unit + ' · batas ukur ' +
          ((ranges.find(function (x) { return x.id === r.range; }) || {}).label || r.range) + '.' +
          (ok ? ' Meja, selektor, dan probe disusun ulang dari data saat siswa menjawab.' : ' Susunan ronde ini tidak tersimpan.');
      } else {
        statusOverride = 'Kiriman siswa dimuat. Jawaban tertera di bawah.';
        refresh();
        pesan = kabel ? 'Hasil uji kelima kabel ada di bawah.' : 'Ringkasan lima pengukuran ada di bawah. Pilih pengukuran untuk melihat susunan meja dan multimeter siswa.';
      }
    }
    tampil({
      judul: (urutan().length ? 'Soal ' + (k + 1) + ' dari ' + d.length + ' · ' : '') + nama(p.mode),
      titik: d.length > 1 ? d.map(function (x, i) {
        return {
          teks: String(i + 1),
          kelas: (i === k ? 'on ' : '') + (x.job ? 'selesai' : 'kosong'),
          judul: nama(x.mode) + (x.job ? '' : ' (belum dikerjakan)'),
          klik: function () { PILIH = { job: i, ronde: 0 }; tampilPratinjau(); },
        };
      }) : [],
      pesan: pesan,
      ronde: p.job && p.mode !== 'continuity' ? {
        label: 'Pengukuran:',
        pilihan: [{ teks: 'Ringkasan', kelas: PILIH.ronde === 0 ? 'on' : '', klik: function () { PILIH.ronde = 0; tampilPratinjau(); } }]
          .concat([1, 2, 3, 4, 5].map(function (n) {
            return { teks: String(n), kelas: PILIH.ronde === n ? 'on' : '', klik: function () { PILIH.ronde = n; tampilPratinjau(); } };
          })),
      } : null,
    });
  }

  return {
    versi: 'multimeter-tmg+sematan2',
    pasangSelesai: function (f) { beriTahuSelesai = f; },
    ambil: function () {
      var u = urutan();
      if (u.length) {
        var jobs = u.filter(function (m) { return SELESAI[m]; }).map(function (m) { return SELESAI[m]; });
        return jobs.length ? JSON.stringify({ format: GABUNGAN, jobs: jobs }) : '';
      }
      if (!exam || !exam.done) return '';
      return JSON.stringify(kirimanJob());
    },
    muat: function (teks) {
      var d = JSON.parse(teks);
      var jobs = d && d.format === GABUNGAN && Array.isArray(d.jobs) ? d.jobs : [d];
      if (!jobs.length) throw new Error('Data pengukuran tidak valid.');
      if (PRATINJAU) {
        jobs.forEach(function (j) { if (!j || j.format !== format || !modes[j.mode] || !j.assessment) throw new Error('Data pengukuran tidak valid.'); });
        JOBS = jobs;
        PILIH = { job: 0, ronde: 0 };
        tampilPratinjau();
        return;
      }
      var u = urutan();
      if (u.length) {
        SELESAI = {};
        jobs.forEach(function (j) { if (j && u.indexOf(j.mode) >= 0) SELESAI[j.mode] = j; });
        var sisa = u.findIndex(function (m) { return !SELESAI[m]; });
        if (sisa >= 0) { exam = null; return mulaiJob(sisa); }
        AKTIF = u.length - 1;
        hanyaMode([u[AKTIF]]);
      }
      var j = jobs[jobs.length - 1];
      exam = null;
      applySubmission(j);
      // Siswa membuka lagi hasil job yang sudah selesai (acuan tidak ditampilkan).
      $('examReview').replaceChildren();
      var a = j.assessment;
      if (a && Array.isArray(a.rounds) && a.rounds.length === 5)
        exam = { rounds: a.rounds, errors: Array.isArray(a.errors) ? a.errors : [], pool: [],
          previous: practiceSnapshot(), done: true, sent: false, target: a.rounds[4], direkam: true };
      drawRack(); drawBoard(); refresh();
    },
    // Pengaturan tugas dari guru: {bebas, urutan, ronde} (bentuk lama: {mode, ronde}). Praktikum
    // lain disembunyikan; siswa mengerjakan berurutan; ronde = isi lima pengukuran dari server.
    soal: function (s) {
      if (!s || typeof s !== 'object') return;
      if (s.ronde && typeof s.ronde === 'object') RONDE = s.ronde;
      var ok = function (m) { return Object.prototype.hasOwnProperty.call(modes, m); };
      var u = Array.isArray(s.urutan) ? s.urutan.filter(ok) : s.mode && ok(s.mode) ? [s.mode] : [];
      ATUR = { bebas: s.bebas === true || !u.length, urutan: u };
      document.documentElement.classList.add('soal-tugas');
      if (PRATINJAU) return tampilPratinjau();
      if (ATUR.bebas) return bilahSiswa();
      if (!exam && !reviewing) mulaiJob(0);
      else bilahSiswa();
    },
  };
}

function (PRATINJAU) {
  // Berkas: tugas tanpa pengaturan atau bebas pilih = laporan satu job (sama dengan "Unduh
  // Hasil"); tugas dengan urutan job = {format: GABUNGAN, jobs: [laporan job, ...]}.
  // Kosong sebelum job pertama selesai.
  var GABUNGAN = 'TERAPAN-GABUNGAN-1';
  function sah(d) {
    return d && d.format === format && d.mode !== 'supply' &&
      Object.prototype.hasOwnProperty.call(modeInfo, d.mode) && Array.isArray(d.rounds) && d.rounds.length === 5 &&
      d.rounds.every(function (r) { return r && r.fixture && typeof r.fixture === 'object' && r.answer && typeof r.answer === 'object'; });
  }
  function bersih(r) {
    var x = Object.assign({}, r);
    delete x.sent; delete x.review;
    return x;
  }
  var salin = function (x) { return JSON.parse(JSON.stringify(x)); };
  var nama = function (m) { return modeInfo[m] ? modeInfo[m].name : m; };

  // Data ronde dari server ({mode: [5 ronde]}) menggantikan pengacak bawaan saat job dimulai.
  var RONDE = null;
  var fixturesAsli = fixtures;
  fixtures = function (tab) {
    var f = RONDE && RONDE[tab];
    return Array.isArray(f) && f.length === 5 ? salin(f) : fixturesAsli(tab);
  };

  // Pengaturan tugas: null = tanpa (halaman alat); {bebas, urutan}.
  var ATUR = null;
  var SELESAI = {}; // mode → laporan job siswa
  var AKTIF = 0; // indeks urutan job yang sedang dikerjakan siswa
  var beriTahuSelesai = function () {};
  var tampil = BilahJobSematan($('tabs'));
  var urutan = function () { return ATUR && !ATUR.bebas ? ATUR.urutan : []; };
  function hanyaTab(daftar) {
    for (var id in tabButtons) tabButtons[id].hidden = daftar.indexOf(id) < 0;
  }
  var gaya = document.createElement('style');
  gaya.textContent =
    'html.sematan #submitTask{display:none!important}' +
    'html.sematan.soal-tugas #returnPractice{display:none!important}' +
    'html.sematan:not(.pratinjau) #results{display:none}';
  document.head.append(gaya);

  // ------------------------------------------------------------------ siswa
  function bilahSiswa() {
    var u = urutan();
    if (!ATUR) return tampil(null);
    if (ATUR.bebas) {
      var r = state.report;
      return tampil({
        judul: 'Pilih satu job, kerjakan lima rondenya',
        pesan: r ? 'Job ' + nama(r.mode) + ' selesai.' : 'Pilih tab job, lalu tekan Mulai Job.',
        tombol: r ? { teks: 'Selesai, ke tombol Kirim', klik: function () { beriTahuSelesai(); } } : null,
      });
    }
    var semua = u.every(function (m) { return SELESAI[m]; });
    var sekarang = u[AKTIF];
    var selesaiIni = !!SELESAI[sekarang] && state.report && state.report.mode === sekarang;
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
        ? 'Semua job selesai. Tekan Kirim di halaman tugas. Nilai dan acuan tampil setelah guru merilis nilai.'
        : selesaiIni
          ? 'Job ' + nama(sekarang) + ' selesai. Lanjutkan ke soal berikutnya.'
          : 'Kerjakan job ' + nama(sekarang) + ': boleh berlatih dulu, lalu tekan Mulai Job dan selesaikan lima ronde.',
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
    state.job = null;
    $('sendHint').textContent = '';
    hanyaTab([u[AKTIF]]);
    practiceSetup(u[AKTIF]);
    update();
  }
  function lanjut() {
    var u = urutan();
    var i = u.findIndex(function (m) { return !SELESAI[m]; });
    if (i >= 0) mulaiJob(i);
  }

  // Siswa di Super APP tidak melihat acuan dan jumlah tepat sebelum guru merilis nilai.
  var aslinya = updateJob;
  updateJob = function () {
    aslinya();
    if (PRATINJAU) return;
    var r = state.report;
    if (r && !r.review) {
      if (ATUR && (ATUR.bebas || urutan().indexOf(r.mode) >= 0)) SELESAI[r.mode] = bersih(r);
      $('exerciseTitle').textContent = 'Job selesai';
      $('exerciseText').textContent = ATUR
        ? 'Hasil job tersimpan. Nilai dan acuan tampil setelah guru merilis nilai.'
        : 'Tekan Kirim di halaman tugas. Nilai dan acuan tampil setelah guru merilis nilai.';
    }
    bilahSiswa();
  };
  if (!PRATINJAU) updateJob();

  // ------------------------------------------------------------------ pratinjau guru
  var JOBS = []; // laporan job dari berkas siswa
  var PILIH = { job: 0, ronde: 0 }; // ronde 0 = ringkasan
  function daftarPratinjau() {
    // Urutan dari guru (job yang belum dikerjakan tetap tampil), atau job yang ada di berkas.
    var u = urutan();
    if (u.length) return u.map(function (m) { return { mode: m, job: JOBS.find(function (j) { return j.mode === m; }) || null }; });
    return JOBS.map(function (j) { return { mode: j.mode, job: j }; });
  }
  function teksJawab(mode, a) {
    if (mode === 'dc') return num(a.v) + ' V';
    if (mode === 'amplitude') return num(a.vpp) + ' Vpp';
    if (mode === 'frequency') return num(a.ms) + ' ms · ' + num(a.hz) + ' Hz';
    if (mode === 'dual') return num(a.phase) + '°';
    return a.locked ? 'Terkunci' : 'Belum terkunci';
  }
  /** Susun ulang tampilan osiloskop pada satu ronde dari data ronde dan setelan yang tersimpan. */
  function pasangRonde(mode, r) {
    applyFixture(r.fixture, true);
    var s = r.settings || {};
    if (Array.isArray(s.channels))
      s.channels.forEach(function (c, i) { if (state.scope.channels[i]) Object.assign(state.scope.channels[i], c); });
    if (Array.isArray(s.connections)) {
      state.links = s.connections.map(function (c) { return c === 'battery' ? null : c; });
      if (mode === 'dc') {
        // Posisi probe di baterai tidak disimpan; arah dipasang sesuai tanda jawaban siswa.
        var benar = Math.sign(Number(r.answer && r.answer.v) || 1) === Math.sign(r.fixture.v);
        s.connections.forEach(function (c, i) {
          batteryProbes[i].tip = c === 'battery' ? (benar ? 'batteryRight' : 'batteryLeft') : null;
          batteryProbes[i].ground = c === 'battery' ? (benar ? 'batteryLeft' : 'batteryRight') : null;
        });
      }
    }
    if (Number.isFinite(s.timeDiv)) {
      var x10 = false, terbaik = 0, beda = Infinity;
      horizontal.forEach(function (h, i) {
        [false, true].forEach(function (x) {
          var d = Math.abs(Math.log(h.si / (x ? 10 : 1)) - Math.log(s.timeDiv));
          if (d < beda) { beda = d; terbaik = i; x10 = x; }
        });
      });
      state.scope.time = terbaik; state.scope.x10 = x10;
    }
    if (s.trigger) Object.assign(state.scope, s.trigger);
  }
  function tampilPratinjau() {
    var d = daftarPratinjau();
    if (!d.length) return tampil(null);
    var k = Math.min(PILIH.job, d.length - 1), p = d[k];
    if (!p.job) {
      hanyaTab([p.mode]);
      state.job = null; practiceSetup(p.mode); update();
    } else {
      hanyaTab([p.mode]);
      state.job = null;
      practiceSetup(p.mode);
      if (PILIH.ronde > 0) pasangRonde(p.mode, p.job.rounds[PILIH.ronde - 1]);
      state.report = Object.assign({}, p.job, {
        review: true,
        correct: p.job.rounds.filter(function (r) { return r.correct === true; }).length,
      });
      renderResults(state.report);
      update();
    }
    var r = p.job && PILIH.ronde > 0 ? p.job.rounds[PILIH.ronde - 1] : null;
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
      pesan: !p.job
        ? 'Job ini belum dikerjakan siswa.'
        : r
          ? 'Ronde ' + PILIH.ronde + ': jawaban siswa ' + teksJawab(p.mode, r.answer || {}) +
            ' · acuan ' + expectedText(p.mode, r.fixture) + '. Layar disusun ulang dari setelan yang disimpan saat siswa menjawab.'
          : 'Ringkasan lima ronde ada di bawah. Pilih ronde untuk melihat setelan osiloskop siswa saat menjawab.',
      ronde: p.job ? {
        label: 'Ronde:',
        pilihan: [{ teks: 'Ringkasan', kelas: PILIH.ronde === 0 ? 'on' : '', klik: function () { PILIH.ronde = 0; tampilPratinjau(); } }]
          .concat([1, 2, 3, 4, 5].map(function (n) {
            var rr = p.job.rounds[n - 1];
            return {
              teks: String(n),
              kelas: (PILIH.ronde === n ? 'on ' : '') + (rr && rr.correct ? 'selesai' : ''),
              klik: function () { PILIH.ronde = n; tampilPratinjau(); },
            };
          })),
      } : null,
    });
  }

  return {
    versi: 'osiloskop-tmg+sematan2',
    pasangSelesai: function (f) { beriTahuSelesai = f; },
    ambil: function () {
      var u = urutan();
      if (u.length) {
        var jobs = u.filter(function (m) { return SELESAI[m]; }).map(function (m) { return SELESAI[m]; });
        return jobs.length ? JSON.stringify({ format: GABUNGAN, jobs: jobs }) : '';
      }
      if (!state.report) return '';
      return JSON.stringify(bersih(state.report));
    },
    muat: function (teks) {
      var d = JSON.parse(teks);
      var jobs = d && d.format === GABUNGAN && Array.isArray(d.jobs) ? d.jobs : [d];
      if (!jobs.length || !jobs.every(sah)) throw new Error('Data osiloskop tidak valid.');
      if (PRATINJAU) {
        JOBS = jobs;
        PILIH = { job: 0, ronde: 0 };
        tampilPratinjau();
        return;
      }
      var u = urutan();
      if (u.length) {
        SELESAI = {};
        jobs.forEach(function (j) { if (u.indexOf(j.mode) >= 0) SELESAI[j.mode] = j; });
        var sisa = u.findIndex(function (m) { return !SELESAI[m]; });
        if (sisa >= 0) return mulaiJob(sisa);
        AKTIF = u.length - 1;
        hanyaTab([u[AKTIF]]);
      }
      // Siswa membuka lagi hasil job yang sudah selesai (acuan tidak ditampilkan).
      var j = jobs[jobs.length - 1];
      state.job = null;
      practiceSetup(j.mode);
      state.job = { fixtures: [], rounds: j.rounds };
      state.report = Object.assign({}, j, {
        review: false,
        correct: j.rounds.filter(function (r) { return r.correct === true; }).length,
      });
      renderResults(state.report);
      update();
    },
    // Pengaturan tugas dari guru: {bebas, urutan, ronde} (bentuk lama: {mode, ronde}). Job lain
    // disembunyikan; siswa mengerjakan job berurutan; ronde = data lima ronde tiap job dari server.
    soal: function (s) {
      if (!s || typeof s !== 'object') return;
      if (s.ronde && typeof s.ronde === 'object') RONDE = s.ronde;
      var ok = function (m) { return m !== 'supply' && Object.prototype.hasOwnProperty.call(modeInfo, m); };
      var u = Array.isArray(s.urutan) ? s.urutan.filter(ok) : s.mode && ok(s.mode) ? [s.mode] : [];
      ATUR = { bebas: s.bebas === true || !u.length, urutan: u };
      document.documentElement.classList.add('soal-tugas');
      if (PRATINJAU) return tampilPratinjau();
      if (ATUR.bebas) {
        hanyaTab(Object.keys(modeInfo).filter(ok));
        if (state.tab === 'supply' && !state.job) { practiceSetup('dc'); update(); }
        return bilahSiswa();
      }
      if (!state.job && !state.report) mulaiJob(0);
      else bilahSiswa();
    },
  };
}

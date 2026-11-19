/* Bilah soal untuk tugas Super APP di simulator terapan (Osiloskop, Multimeter): urutan job yang
   diminta guru, tombol lanjut ke job berikutnya, dan (pratinjau guru) pilihan job dan ronde.
   Hanya dipakai blok sematan; di luar Super APP tidak ada yang memanggilnya. */
window.BilahJobSematan = function (sebelum) {
  var gaya = document.createElement('style');
  gaya.textContent =
    '.sj-bilah{margin:0 0 12px;padding:12px 14px;border-radius:12px;background:#fff;border-left:5px solid #0f6c60;' +
    'box-shadow:0 1px 3px rgba(0,0,0,.12);font:14px/1.5 system-ui,sans-serif;color:#1f2a30}' +
    '.sj-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.sj-kepala b{font-size:15px}' +
    '.sj-titik{display:flex;flex-wrap:wrap;gap:6px}' +
    '.sj-titik button{min-width:30px;height:30px;padding:0 9px;border-radius:15px;border:1.5px solid #9aa4ad;background:#fff;' +
    'font:700 12.5px system-ui,sans-serif;color:#26313a;cursor:pointer}' +
    '.sj-titik button.selesai{background:#e7f7ec;border-color:#1e9b4c;color:#145c2e}' +
    '.sj-titik button.on{background:#0f6c60;border-color:#0f6c60;color:#fff}' +
    '.sj-titik button.kosong{border-style:dashed;color:#8a949c}' +
    '.sj-titik button:disabled{cursor:default}' +
    '.sj-pesan{margin:6px 0 0}.sj-pesan:empty{display:none}' +
    '.sj-ronde{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px}.sj-ronde[hidden]{display:none}' +
    '.sj-tombol{margin-top:8px}.sj-tombol[hidden]{display:none}' +
    '.sj-tombol button{font:700 14px system-ui,sans-serif;padding:9px 16px;border-radius:9px;border:0;background:#0f6c60;color:#fff;cursor:pointer}';
  document.head.append(gaya);
  var akar = document.createElement('section');
  akar.className = 'sj-bilah';
  akar.setAttribute('aria-live', 'polite');
  akar.hidden = true;
  akar.innerHTML =
    '<div class="sj-kepala"><b></b><div class="sj-titik" role="group" aria-label="Daftar soal"></div></div>' +
    '<p class="sj-pesan"></p><div class="sj-ronde" hidden></div><div class="sj-tombol" hidden><button type="button"></button></div>';
  sebelum.parentNode.insertBefore(akar, sebelum);
  var q = function (s) { return akar.querySelector(s); };
  function tombolKecil(wadah, teks, kelas, judul, klik) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = teks;
    b.className = kelas || '';
    if (judul) b.title = judul;
    if (klik) b.onclick = klik; else b.disabled = true;
    wadah.append(b);
  }
  /* d = {judul, titik:[{teks, kelas, judul, klik}], pesan, ronde:{label, pilihan:[{teks, kelas, klik}]}|null,
         tombol:{teks, klik}|null} */
  var jejak = null;
  return function tampil(d) {
    // Hanya digambar ulang bila isinya berubah (fungsi klik tidak ikut dibandingkan).
    var sig = JSON.stringify(d || null);
    if (sig === jejak) return;
    jejak = sig;
    akar.hidden = !d;
    if (!d) return;
    q('.sj-kepala b').textContent = d.judul || '';
    var t = q('.sj-titik');
    t.replaceChildren();
    (d.titik || []).forEach(function (x) { tombolKecil(t, x.teks, x.kelas, x.judul, x.klik); });
    q('.sj-pesan').textContent = d.pesan || '';
    var r = q('.sj-ronde');
    r.replaceChildren();
    r.hidden = !d.ronde;
    if (d.ronde) {
      var l = document.createElement('span');
      l.textContent = d.ronde.label;
      r.append(l);
      d.ronde.pilihan.forEach(function (x) {
        var w = document.createElement('span');
        w.className = 'sj-titik';
        tombolKecil(w, x.teks, x.kelas, x.judul, x.klik);
        r.append(w);
      });
    }
    var b = q('.sj-tombol');
    b.hidden = !d.tombol;
    if (d.tombol) {
      q('.sj-tombol button').textContent = d.tombol.teks;
      q('.sj-tombol button').onclick = d.tombol.klik;
    }
  };
};

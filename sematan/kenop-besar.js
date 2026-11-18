/* ==========================================================================
   KENOP BESAR — di layar sentuh (HP/tablet) ketukan pada kenop putar
   ([role=slider]) membuka jendela berisi kenop yang sama dalam ukuran besar.
   Memutar di jendela itu mengirim tombol panah ke kenop asli, jadi logika
   simulator tidak berubah. Ketuk di luar jendela (atau Selesai) untuk menutup.
   Bila halaman menyediakan window.kenopBesarLayar = {rasio, pasang(canvas),
   lepas(canvas)}, jendela juga menampilkan layar alat (mis. layar CRO) supaya
   hasil putaran langsung terlihat.
   Sumber: sematan/kenop-besar.js (simulasi_all_in); salinan di simulator_cro.
   ========================================================================== */
(function () {
  if (window.__kenopBesar) return;
  window.__kenopBesar = true;
  var sentuh = window.matchMedia && matchMedia('(pointer: coarse)');
  function aktif() { return !!(sentuh && sentuh.matches); }

  var css = document.createElement('style');
  css.textContent =
    '.kb-latar{position:fixed;inset:0;z-index:2147483000;background:rgba(5,12,16,.62);display:flex;align-items:center;justify-content:center;padding:16px;touch-action:none}' +
    '.kb-kartu{background:#f4f6f7;color:#14202a;border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:14px 16px 16px;width:min(340px,100%);font:600 15px/1.3 system-ui,sans-serif;text-align:center}' +
    '.kb-judul{font-size:16px;font-weight:800;margin:0 0 2px}' +
    '.kb-nilai{font-size:14px;font-weight:600;color:#0f6c60;min-height:18px;margin:0 0 8px}' +
    '.kb-putar{position:relative;width:min(260px,72vw);height:min(260px,72vw);margin:0 auto;border-radius:50%;touch-action:none;cursor:grab;' +
      'background:radial-gradient(circle,rgba(255,255,255,0) 58%,rgba(15,108,96,.10) 59%,rgba(15,108,96,.10) 70%,rgba(255,255,255,0) 71%)}' +
    '.kb-tiruan{position:absolute;left:50%;top:50%;pointer-events:none}' +
    '.kb-tiruan *{pointer-events:none}' +
    '.kb-layar{display:block;width:100%;border-radius:10px;background:#0b2427;box-shadow:0 0 0 3px #0c0e0f;margin:0 0 8px}' +
    '.kb-kartu.ada-layar .kb-putar{width:min(190px,46vw);height:min(190px,46vw)}' +
    '.kb-kartu.ada-layar .kb-petunjuk{display:none}' +
    '.kb-baris{display:flex;gap:10px;justify-content:center;margin-top:12px}' +
    '.kb-baris button{font:800 20px/1 system-ui,sans-serif;min-width:64px;height:48px;border-radius:12px;border:1px solid #c8d1d6;background:#fff;color:#14202a}' +
    '.kb-baris button.kb-selesai{font-size:15px;background:#0f6c60;border-color:#0f6c60;color:#fff;min-width:96px}' +
    '.kb-pilih{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:0 0 8px}.kb-pilih:empty{display:none}' +
    '.kb-pilih button{font:700 13px/1 system-ui,sans-serif;padding:8px 10px;border-radius:999px;border:1px solid #c8d1d6;background:#fff;color:#14202a}' +
    '.kb-pilih button[aria-pressed="true"]{background:#0f6c60;border-color:#0f6c60;color:#fff}' +
    '.kb-petunjuk{font-size:12px;font-weight:500;color:#52606a;margin:10px 0 0}';
  document.head.appendChild(css);

  var awal = null; // {x, y, el, id}
  function kenopDari(t) {
    var k = t && t.closest ? t.closest('[role="slider"]') : null;
    if (!k || k.closest('.kb-latar')) return null;
    if (k.disabled || k.getAttribute('aria-disabled') === 'true') return null;
    return k;
  }
  // Tahap capture: tangkap sentuhan sebelum kenop asli mulai memutar.
  window.addEventListener('pointerdown', function (e) {
    if (!aktif() || e.pointerType === 'mouse') return;
    var k = kenopDari(e.target);
    if (!k) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    awal = { x: e.clientX, y: e.clientY, el: k, id: e.pointerId };
  }, true);
  ['pointermove', 'dblclick'].forEach(function (t) {
    window.addEventListener(t, function (e) {
      if (awal && kenopDari(e.target) === awal.el) e.stopImmediatePropagation();
    }, true);
  });
  window.addEventListener('pointerup', function (e) {
    if (!awal || e.pointerId !== awal.id) return;
    var k = awal.el, gerak = Math.hypot(e.clientX - awal.x, e.clientY - awal.y);
    awal = null;
    e.stopImmediatePropagation();
    if (gerak < 14) buka(k, e.clientY);
  }, true);
  window.addEventListener('pointercancel', function () { awal = null; }, true);

  function tekan(k, n) {
    var key = n > 0 ? 'ArrowRight' : 'ArrowLeft';
    k.dispatchEvent(new KeyboardEvent('keydown', { key: key, code: key, bubbles: true, cancelable: true }));
  }

  // Kenop bertumpuk (mis. VOLTS/DIV dengan VAR di tengahnya): semua kenop yang pusatnya saling
  // menimpa ikut ditawarkan sebagai pilihan di jendela.
  function tumpukan(k) {
    var r = k.getBoundingClientRect();
    var pusat = function (x) { var q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, q: q }; };
    var di = function (p, q) { return p.x >= q.left && p.x <= q.right && p.y >= q.top && p.y <= q.bottom; };
    var pk = pusat(k);
    var daftar = Array.prototype.filter.call(document.querySelectorAll('[role="slider"]'), function (x) {
      if (x === k) return true;
      if (x.closest('.kb-latar') || x.disabled) return false;
      var px = pusat(x);
      return px.q.width > 0 && (di(px, r) || di(pk, px.q));
    });
    return daftar.sort(function (a, b) {
      return b.getBoundingClientRect().width - a.getBoundingClientRect().width;
    });
  }

  function buka(k0, yKetuk) {
    var pilihan = tumpukan(k0);
    var k = k0;
    var latar = document.createElement('div');
    latar.className = 'kb-latar';
    latar.setAttribute('role', 'dialog');
    latar.setAttribute('aria-modal', 'true');
    var nama = (k.getAttribute('aria-label') || 'Kenop').replace(/\s+/g, ' ').trim();
    latar.innerHTML =
      '<div class="kb-kartu"><div class="kb-pilih"></div><p class="kb-judul"></p><p class="kb-nilai"></p>' +
      '<canvas class="kb-layar" hidden></canvas>' +
      '<div class="kb-putar" aria-hidden="true"><div class="kb-tiruan"></div></div>' +
      '<div class="kb-baris"><button type="button" data-n="-1" aria-label="Kurangi">−</button>' +
      '<button type="button" class="kb-selesai">Selesai</button>' +
      '<button type="button" data-n="1" aria-label="Tambah">+</button></div>' +
      '<p class="kb-petunjuk">Putar dengan jari searah atau berlawanan jarum jam. Ketuk di luar untuk menutup.</p></div>';
    var judul = latar.querySelector('.kb-judul');
    judul.textContent = nama;
    var kartu = latar.querySelector('.kb-kartu');
    var nilai = latar.querySelector('.kb-nilai');
    var putar = latar.querySelector('.kb-putar');
    var tiruan = latar.querySelector('.kb-tiruan');
    // Layar alat di dalam jendela (bila halaman menyediakannya).
    var layar = window.kenopBesarLayar;
    var kanvasLayar = latar.querySelector('.kb-layar');
    if (layar && typeof layar.pasang === 'function') {
      kartu.classList.add('ada-layar');
      kanvasLayar.hidden = false;
    } else layar = null;
    document.body.appendChild(latar);
    if (layar) {
      kanvasLayar.style.height = kanvasLayar.clientWidth * (layar.rasio || 0.8) + 'px';
      try { layar.pasang(kanvasLayar); } catch (_) { layar = null; }
    }
    // Kartu diletakkan di sekitar titik ketuk: di dalam iframe yang lebih tinggi dari layar,
    // tengah iframe bisa saja di luar layar, tetapi titik ketuk pasti terlihat.
    var tinggi = kartu.offsetHeight;
    if (tinggi && innerHeight > tinggi + 16) {
      latar.style.alignItems = 'flex-start';
      kartu.style.marginTop =
        Math.max(0, Math.min((yKetuk || innerHeight / 2) - tinggi / 2, innerHeight - tinggi - 32)) + 'px';
    }

    // Derajat per langkah: kenop bertangga (aria-valuemax) mengikuti sudut kenop asli;
    // kenop halus/tanpa batas memakai 10°.
    var derajat = 10;
    function aturDerajat() {
      var mn = parseFloat(k.getAttribute('aria-valuemin')), mx = parseFloat(k.getAttribute('aria-valuemax'));
      derajat = isFinite(mn) && isFinite(mx) && mx > mn ? Math.max(6, Math.min(40, 280 / (mx - mn))) : 10;
    }
    aturDerajat();
    var namaDari = function (x) { return (x.getAttribute('aria-label') || 'Kenop').replace(/\s+/g, ' ').trim(); };
    var wadahPilih = latar.querySelector('.kb-pilih');
    if (pilihan.length > 1) {
      pilihan.forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = namaDari(x);
        b.setAttribute('aria-pressed', String(x === k));
        b.addEventListener('click', function () {
          k = x;
          judul.textContent = namaDari(x);
          wadahPilih.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); });
          aturDerajat();
          gambar();
        });
        wadahPilih.appendChild(b);
      });
    }

    function gambar() {
      var c = k.cloneNode(true);
      c.removeAttribute('id');
      c.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); });
      var r = k.getBoundingClientRect();
      var w = r.width || 40, h = r.height || 40;
      var skala = (putar.clientWidth * 0.62) / Math.max(w, h);
      c.style.cssText += ';position:static;left:auto;top:auto;margin:0;width:' + w + 'px;height:' + h + 'px';
      tiruan.style.width = w + 'px';
      tiruan.style.height = h + 'px';
      tiruan.style.transform = 'translate(-50%,-50%) scale(' + skala + ')';
      tiruan.replaceChildren(c);
      nilai.textContent = k.getAttribute('aria-valuetext') || k.getAttribute('aria-valuenow') || '';
    }
    function langkah(n) {
      for (var i = 0; i < Math.abs(n); i++) tekan(k, n);
      requestAnimationFrame(gambar);
    }
    gambar();

    var seret = null;
    function sudut(e) {
      var r = putar.getBoundingClientRect();
      return Math.atan2(e.clientX - r.left - r.width / 2, r.top + r.height / 2 - e.clientY) * 180 / Math.PI;
    }
    putar.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      seret = { id: e.pointerId, a: sudut(e), sisa: 0 };
      try { putar.setPointerCapture(e.pointerId); } catch (_) {}
    });
    putar.addEventListener('pointermove', function (e) {
      if (!seret || e.pointerId !== seret.id) return;
      var a = sudut(e), d = ((a - seret.a + 540) % 360) - 180;
      seret.a = a;
      seret.sisa += d;
      var n = Math.trunc(seret.sisa / derajat);
      if (n) { seret.sisa -= n * derajat; langkah(n); }
    });
    function lepas() { seret = null; }
    putar.addEventListener('pointerup', lepas);
    putar.addEventListener('pointercancel', lepas);

    latar.querySelectorAll('[data-n]').forEach(function (b) {
      b.addEventListener('click', function () {
        langkah(Number(b.dataset.n));
      });
    });
    function tutup() {
      if (layar) try { layar.lepas(kanvasLayar); } catch (_) {}
      latar.remove();
      document.removeEventListener('keydown', esc, true);
      // Beri tahu simulator/induk bahwa ada perubahan (sematan memantau event ini).
      k.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function esc(e) { if (e.key === 'Escape') { e.preventDefault(); tutup(); } }
    document.addEventListener('keydown', esc, true);
    latar.querySelector('.kb-selesai').addEventListener('click', tutup);
    latar.addEventListener('pointerdown', function (e) { if (!kartu.contains(e.target)) { e.preventDefault(); tutup(); } });
  }
})();

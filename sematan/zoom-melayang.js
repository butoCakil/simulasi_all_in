/* ==========================================================================
   ZOOM MELAYANG — tombol −, 100%, + yang selalu tampil di pojok kiri bawah
   kanvas (seperti SIMBION). Tombol aslinya ada di grup pengaturan (▼) yang
   tertutup di HP; tombol melayang ini hanya meneruskan klik ke tombol asli.
   Sumber: sematan/zoom-melayang.js (simulasi_all_in).
   ========================================================================== */
(function () {
  var ruang = document.querySelector('.workspace');
  var asli = { kecil: document.getElementById('btnZoomOut'), atur: document.getElementById('btnZoomReset'), besar: document.getElementById('btnZoomIn') };
  if (!ruang || !asli.kecil || !asli.atur || !asli.besar) return;
  var css = document.createElement('style');
  css.textContent =
    '.workspace{position:relative}' +
    '.zoom-melayang{position:absolute;left:10px;bottom:10px;z-index:30;display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(10,22,16,.82);box-shadow:0 4px 14px rgba(0,0,0,.35)}' +
    '.zoom-melayang button{min-width:40px;height:40px;padding:0 8px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(255,255,255,.06);color:#e8f5ec;font:700 16px/1 system-ui,sans-serif;cursor:pointer}' +
    '.zoom-melayang button.zm-nilai{font-size:12px;min-width:54px}';
  document.head.appendChild(css);
  var wadah = document.createElement('div');
  wadah.className = 'zoom-melayang';
  wadah.setAttribute('role', 'group');
  wadah.setAttribute('aria-label', 'Zoom kanvas');
  [['kecil', '−', 'Perkecil tampilan'], ['atur', '100%', 'Atur ulang ke 100%'], ['besar', '+', 'Perbesar tampilan']].forEach(function (x) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = x[1];
    b.title = x[2];
    b.setAttribute('aria-label', x[2]);
    if (x[0] === 'atur') b.className = 'zm-nilai';
    b.addEventListener('click', function () { asli[x[0]].click(); });
    wadah.appendChild(b);
  });
  ruang.appendChild(wadah);
  var nilai = wadah.querySelector('.zm-nilai');
  var salin = function () { nilai.textContent = asli.atur.textContent.trim() || '100%'; };
  new MutationObserver(salin).observe(asli.atur, { childList: true, characterData: true, subtree: true });
  salin();
})();

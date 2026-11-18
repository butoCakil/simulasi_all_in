/* Layar CRO di jendela kenop besar: kanvas jendela ikut digambar seperti layar
   osiloskop (drawScreen menggambar semua kanvas di daftar crt). */
window.kenopBesarLayar = {
  rasio: (function () {
    var c = document.getElementById('scopeTrace');
    return c && c.clientWidth ? c.clientHeight / c.clientWidth : 0.8;
  })(),
  pasang: function (c) { if (crt.indexOf(c) < 0) crt.push(c); },
  lepas: function (c) { var i = crt.indexOf(c); if (i >= 0) crt.splice(i, 1); },
};

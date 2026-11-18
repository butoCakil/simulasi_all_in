#!/usr/bin/env python3
"""Pasang (atau perbarui) bagian SEMATAN SUPER APP di tiap simulator.

Pemakaian:  python3 sematan/pasang.py      (dari akar repo)
Idempoten: blok lama di antara penanda diganti. Logika simulator tidak diubah; hanya
ditambah satu baris akses (bertanda SEMATAN-SUPERAPP) di simulator yang fungsinya tertutup.
"""
import pathlib, re

AKAR = pathlib.Path(__file__).resolve().parent.parent
INTI = (AKAR / 'sematan/inti.js').read_text(encoding='utf8')
# Kenop besar di layar sentuh (selalu aktif, juga di luar Super APP).
KENOP = (AKAR / 'sematan/kenop-besar.js').read_text(encoding='utf8')
BERKENOP = {'simosk', 'simmeter'}
# Tombol zoom melayang di kanvas (selalu aktif).
ZOOM = (AKAR / 'sematan/zoom-melayang.js').read_text(encoding='utf8')
BERZOOM = {'simlistrik', 'simic'}
LAYAR_OSK = (AKAR / 'sematan/layar-osiloskop.js').read_text(encoding='utf8')
MULAI, SELESAI = '<!-- SEMATAN-SUPERAPP:MULAI -->', '<!-- SEMATAN-SUPERAPP:SELESAI -->'

SEM = 'html.sematan'
SIM = {
    'simulator-osiloskop.html': ('simosk', 'osiloskop.js', None,
        f'{SEM} #download{{display:none!important}}'),
    'simulator-multimeter.html': ('simmeter', 'multimeter.js', None, ''),
    'simulator-listrik-rumah.html': ('simlistrik', 'rangkaian.js', 'listrik-rumah+sematan1',
        f'{SEM} :is(#btnSave,#btnLoad,#btnExport,#btnImport2){{display:none!important}}'),
    'simulator-ic-digital.html': ('simic', 'rangkaian.js', 'ic-digital+sematan1',
        f'{SEM} :is(#btnSave,#btnLoad,#btnExport,#btnImport){{display:none!important}}'),
    'sim_ram_dotmatrix.html': ('simram', 'ram.js', None,
        f'{SEM} :is(#ram-save,#ram-import,#dot-save,#dot-import,#rgb-save,#rgb-import){{display:none!important}}'),
}

# Baris akses untuk simulator yang fungsinya ada di dalam penutup (closure).
AKSES_RANGKAIAN = ("  const tombol = document.getElementById('btnKirimTugas');\n",
    "  const tombol = document.getElementById('btnKirimTugas');\n"
    "  window.tugasRangkaian = { format, ambil, muat, validasi }; // SEMATAN-SUPERAPP\n")
AKSES_RAM = ("openSubmittedProject();\n})();", """// SEMATAN-SUPERAPP: akses proyek keempat tab untuk sematan Super APP (sematan/ram.js).
window.simTugasRam = {
  ambil() {
    const aktif = document.querySelector('.tab[aria-selected="true"]')?.dataset.tab || 'ram';
    const p = { format: 'RAM-DOT-SUPERAPP-1', aktif };
    try { p.ram = ramProject(); } catch {}
    try {
      const d = dotProject();
      try {
        if ($('hex-input').value !== formatHex(d.bytes.slice(0, d.filled))) {
          const b = parseHex($('hex-input').value);
          d.filled = b.length;
          d.bytes = Array.from({ length: d.capacity }, (_, i) => b[i] ?? 0);
          d.offset = 0;
        }
      } catch {}
      p.dot = d;
    } catch {}
    try { p.rgb = rgbProject(); } catch {}
    try { p.seg = segProject(); } catch {}
    return p;
  },
  async muat(p) {
    const f = (o) => new File([JSON.stringify(o)], 'proyek.json', { type: 'application/json' });
    if (p.ram) await importRamProject(f(p.ram));
    if (p.dot) await importDotProject(f(p.dot));
    if (p.rgb) await importRgbProject(f(p.rgb));
    if (p.seg) await importSegProject(f(p.seg));
    const t = $('tab-' + p.aktif);
    if (t) t.click();
    if (p.aktif === 'dot') { pause(); fitMatrix(); }
  },
};
openSubmittedProject();
})();""")

for nama, (alat, adapter, versi, css) in SIM.items():
    jalur = AKAR / nama
    s = jalur.read_text(encoding='utf8')
    if nama in ('simulator-listrik-rumah.html', 'simulator-ic-digital.html') and 'SEMATAN-SUPERAPP' not in s.split(MULAI)[0]:
        assert s.count(AKSES_RANGKAIAN[0]) == 1, nama
        s = s.replace(*AKSES_RANGKAIAN)
    if nama == 'sim_ram_dotmatrix.html' and 'window.simTugasRam' not in s.split(MULAI)[0]:
        assert s.count(AKSES_RAM[0]) == 1, nama
        s = s.replace(*AKSES_RAM)
    a = (AKAR / 'sematan' / adapter).read_text(encoding='utf8').strip()
    if versi: a = a.replace('%VERSI%', versi)
    js = INTI.replace("'%ALAT%'", repr(alat)).replace('(%ADAPTER%)', '(' + a + ')')
    kenop = f'<script>\n{KENOP}</script>\n' if alat in BERKENOP else ''
    if alat == 'simosk':
        kenop += f'<script>\n{LAYAR_OSK}</script>\n'
    if alat in BERZOOM:
        kenop += f'<script>\n{ZOOM}</script>\n'
    blok = f'{MULAI}\n<style>{css}</style>\n<script>\n{js}</script>\n{kenop}{SELESAI}\n'
    s = re.sub(re.escape(MULAI) + r'[\s\S]*?' + re.escape(SELESAI) + r'\n?', '', s)
    i = s.rindex('</body>')
    s = s[:i] + blok + s[i:]
    jalur.write_text(s, encoding='utf8')
    print('terpasang', nama, alat)

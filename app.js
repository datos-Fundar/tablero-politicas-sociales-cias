'use strict';
/* =============================================================================
   Tablero "Mapa de las políticas sociales" (CIAS - Fundar)
   Datos: datos/datos.js (window.DATOS_CIAS). Logos: logo/logos.js (window.LOGOS).
   Sin dependencias externas: los gráficos se dibujan en SVG.
============================================================================= */

const D = window.DATOS_CIAS;
const M = D.meta;

// ---------------------------------------------------------------------------
// Textos editables. Cada texto que se puede cambiar tiene una clave. Los cambios guardados están en
// datos/textos_editados.js (window.TEXTOS_EDITADOS); en modo edición (index.html?editar) se suman los
// cambios todavía no descargados, que viven en el navegador. Claves "datos.*" cambian el dato de origen
// (por ejemplo, datos.programas.auh.nombre), así el cambio aparece en todos los lugares donde se usa.
// ---------------------------------------------------------------------------
const EDITAR = /[?&]editar\b/.test(location.search);
const LS_TEXTOS = 'cias-textos-editados';
let TXT_LOCAL = {};
if (EDITAR) { try { TXT_LOCAL = JSON.parse(localStorage.getItem(LS_TEXTOS) || '{}'); } catch (e) { /* sin almacenamiento */ } }
const TXT = Object.assign({}, window.TEXTOS_EDITADOS || {}, TXT_LOCAL);
Object.keys(TXT).forEach(k => { if (TXT[k] == null) delete TXT[k]; });
const ed = (clave, porDefecto) => Object.prototype.hasOwnProperty.call(TXT, clave) ? TXT[clave] : porDefecto;
// Busca un objeto dentro de D por ruta; en las listas, por id (programas.auh.nombre)
function rutaDatos(ruta) {
  const partes = ruta.split('.');
  let o = D;
  for (let i = 0; i < partes.length - 1 && o; i++) o = Array.isArray(o) ? o.find(x => x.id === partes[i]) : o[partes[i]];
  return o && typeof o === 'object' ? [o, partes[partes.length - 1]] : null;
}
const aplicarDato = (clave, valor) => { const r = rutaDatos(clave.slice(6)); if (r) r[0][r[1]] = valor; };
Object.keys(TXT).filter(k => k.startsWith('datos.')).forEach(k => aplicarDato(k, TXT[k]));
// Atributo y span para marcar un texto como editable
const attrEd = clave => `data-editable="${String(clave).replace(/"/g, '&quot;')}"`;
const spanEd = (clave, texto) => `<span ${attrEd(clave)}>${String(texto).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span>`;
const ANIOS = D.anios;
const N = ANIOS.length, ULT = N - 1, PREV = N - 2;
const A_FIN = ANIOS[ULT], A_PREV = ANIOS[PREV];
// Año base de la variación central: último año del gobierno anterior (meta.anio_base)
const I_BASE = ANIOS.includes(M.anio_base) ? ANIOS.indexOf(M.anio_base) : Math.max(0, N - 3);
const A_BASE = ANIOS[I_BASE];

const GRUPOS = D.grupos;
const grupo = id => GRUPOS.find(g => g.id === id);
const TOTAL = D.total.total;
// Suma de los tres grupos etarios: base de la participación de cada grupo (lo que se pudo clasificar)
const CLASIF = ANIOS.map((_, i) => GRUPOS.reduce((a, g) => a + (g.valores[i] || 0), 0));
const CATS = D.categorias;
const PBI_TOT = ANIOS.map((_, i) => CATS.reduce((a, c) => a + (c.pct_pbi[i] || 0), 0));

// ---------------------------------------------------------------------------
// Formatos (es-AR)
// ---------------------------------------------------------------------------
const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signo = v => Math.abs(v) < 0.05 ? '' : v > 0 ? '+' : '−';
const fPct = v => v == null || !isFinite(v) ? '—' : signo(v) + nf1.format(Math.abs(v)) + '%';
const fPart = v => v == null ? '—' : nf1.format(v) + '%';
const fPctPbi = v => v == null ? '—' : nf2.format(v) + '% del PBI';
const fMonto = v => v == null ? '—' : '$' + (v < 1 ? nf2 : nf1).format(v);
const fMontoU = v => v == null ? '—' : fMonto(v) + ' billones';
const fPersonas = v => v == null ? '—' : nf0.format(v);
const fPesos = v => v == null ? '—' : '$' + nf0.format(v);
const varPct = (a, b) => a == null || b == null || b === 0 ? null : (a / b - 1) * 100;
const clase = v => v == null ? '' : v >= 0 ? 'pos' : 'neg';
const flecha = v => v == null ? '' : v >= 0 ? '▲' : '▼';

// ---------------------------------------------------------------------------
// DOM y SVG
// ---------------------------------------------------------------------------
const NS = 'http://www.w3.org/2000/svg';
const FUENTE_SVG = 'Helvetica Neue, Helvetica, Arial, sans-serif';
function s(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, str, attrs) { const t = s('text', { x, y, ...attrs }, parent); t.textContent = str; return t; }
function h(tag, attrs, parent, html) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
const $ = sel => document.querySelector(sel);
const css = v => getComputedStyle(document.body).getPropertyValue(v).trim();
const colorGrupo = id => css('--g-' + (id || 'otros')) || css('--g-otros');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const anchoTexto = (str, px = 11) => String(str).length * px * 0.56;
const esc = str => String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Corta un texto en renglones que no superen "ancho" px
function renglones(str, ancho, px) {
  const out = [];
  let lin = '';
  String(str).split(' ').forEach(p => {
    const prueba = lin ? lin + ' ' + p : p;
    if (lin && anchoTexto(prueba, px) > ancho) { out.push(lin); lin = p; } else lin = prueba;
  });
  if (lin) out.push(lin);
  return out;
}

function pasoLindo(rango, n) {
  const raw = rango / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const e = raw / p;
  return (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * p;
}
// Eje Y "lindo" entre min (por defecto 0) y max
function ejeY(max, n = 4, min = 0) {
  const st = pasoLindo(max - min, n), bot = Math.floor(min / st + 1e-9) * st, top = Math.ceil(max / st - 1e-9) * st || st;
  const ticks = [];
  for (let v = bot; v <= top + st * 1e-9; v += st) ticks.push(+v.toFixed(10));
  return { ticks, top, bot, step: st };
}
// Cada cuántos años se rotula el eje X según el ancho disponible (siempre se rotula el último año)
function pasoX(ancho, n = N) { let st = 1; while (ancho / n * st < 34) st++; return st; }

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
const TT = $('#tooltip');
function tipMostrar(ev, html) {
  TT.innerHTML = html; TT.hidden = false;
  const r = TT.getBoundingClientRect(), pad = 14;
  let x = ev.clientX + pad, y = ev.clientY + pad;
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
  TT.style.left = Math.max(4, x) + 'px'; TT.style.top = Math.max(4, y) + 'px';
}
const tipOcultar = () => { TT.hidden = true; };
document.addEventListener('click', ev => { if (!ev.target.closest('svg')) tipOcultar(); });
addEventListener('scroll', tipOcultar, { passive: true });
const ttFila = (color, label, valor, cls = '') =>
  `<div class="tt-row ${cls}"><span>${color ? `<i class="sw" style="background:${color}"></i>` : ''}${label}</span><b>${valor}</b></div>`;

// ---------------------------------------------------------------------------
// Gráficos
// ---------------------------------------------------------------------------
function lienzo(root, o) {
  const W = Math.max(280, Math.floor(root.clientWidth || 600));
  const H = o.alto || Math.round(clamp(W * 0.52, 220, 330));
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, 'font-family': FUENTE_SVG, xmlns: NS, role: 'img', 'aria-label': o.aria || '' }, root);
  return { svg, W, H };
}
// Grilla horizontal, etiquetas del eje Y y del eje X. Devuelve el área útil.
// o: { max, min, fmtY, etiquetasX: [texto], xDe }
function grilla(svg, W, H, o) {
  const { ticks, top, bot, step } = ejeY(o.max, 4, o.min || 0);
  const l = Math.ceil(Math.max(...ticks.map(t => anchoTexto(o.fmtY(t, step))))) + 8;
  const m = { t: 14, r: 10, b: 24, l };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const y = v => m.t + ih - (v - bot) / (top - bot) * ih;
  const g = s('g', {}, svg);
  ticks.forEach(t => {
    s('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: t === bot ? css('--eje') : css('--grid'), 'stroke-width': 1 }, g);
    txt(g, m.l - 8, y(t) + 4, o.fmtY(t, step), { 'text-anchor': 'end', 'font-size': 11, fill: css('--ink2') });
  });
  const etq = o.etiquetasX || ANIOS.map(String), n = etq.length;
  const x = o.xDe(m, iw);
  const st = pasoX(iw, n);
  etq.forEach((a, i) => {
    if ((n - 1 - i) % st) return;
    txt(g, x(i), H - 6, a, { 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink2') });
  });
  return { m, iw, ih, y, x, top, bot };
}
const fmtEjeMonto = (t, st) => '$' + (st < 1 ? nf1 : nf0).format(t);
const fmtEjePct = (t, st) => (st < 1 ? nf1 : nf0).format(t) + '%';
const fmtEjePersonas = (t, st) => !t ? '0' : t >= 1e6 || st >= 5e5 ? (st < 1e6 ? nf1 : nf0).format(t / 1e6) + ' M' : nf0.format(t / 1e3) + ' mil';
const fmtEjePesos = t => '$' + nf0.format(t / 1e3) + ' mil';

// Barras (apiladas si hay más de una serie). o.series: [{nombre, color, valores}]
// Opcionales: o.fmtEje, o.fmtTip (valor de cada serie), o.etiquetaVar (null = sin variación en el tooltip)
function graficoBarras(root, o) {
  root.innerHTML = '';
  const { svg, W, H } = lienzo(root, o);
  const fTip = o.fmtTip || fMontoU;
  const tot = ANIOS.map((_, i) => o.series.reduce((a, se) => a + (se.valores[i] || 0), 0));
  const max = Math.max(...tot) * 1.08;
  let bw;
  const G = grilla(svg, W, H, { max, fmtY: o.fmtEje || fmtEjeMonto, xDe: (m, iw) => { bw = iw / N; return i => m.l + bw * (i + 0.5); } });
  const res = s('rect', { y: G.m.t, height: G.ih, width: bw, fill: css('--hover'), opacity: 0 }, svg);
  svg.insertBefore(res, svg.childNodes[1]);
  const ancho = Math.max(2, bw * 0.7);
  ANIOS.forEach((a, i) => {
    let acc = 0;
    o.series.forEach(se => {
      const v = se.valores[i];
      if (!v) return;
      s('rect', { x: G.x(i) - ancho / 2, y: G.y(acc + v), width: ancho, height: Math.max(0, G.y(acc) - G.y(acc + v)), fill: se.color }, svg);
      acc += v;
    });
  });
  // Interacción
  const capa = s('rect', { x: G.m.l, y: G.m.t, width: G.iw, height: G.ih, fill: 'transparent' }, svg);
  const etqVar = o.etiquetaVar === undefined ? 'Var. real vs.' : o.etiquetaVar;
  const mover = ev => {
    const p = svg.getBoundingClientRect(), esc = W / p.width;
    const i = clamp(Math.floor(((ev.clientX - p.left) * esc - G.m.l) / bw), 0, ULT);
    res.setAttribute('x', G.m.l + i * bw); res.setAttribute('opacity', 1);
    let html = `<div class="tt-hd">${ANIOS[i]}</div>`;
    const ss = o.series.filter(se => se.valores[i] != null);
    if (!ss.length) html += '<div>Sin datos</div>';
    [...ss].reverse().forEach(se => { html += ttFila(o.series.length > 1 ? se.color : null, se.nombre, fTip(se.valores[i])); });
    if (o.series.length > 1) html += ttFila(null, o.etiquetaTotal || 'Total', fTip(tot[i]), 'tt-tot');
    if (o.extraTip) html += o.extraTip(i);
    if (etqVar && i > 0 && tot[i - 1] && ss.length) html += ttFila(null, `${etqVar} ${ANIOS[i - 1]}`, fPct(varPct(tot[i], tot[i - 1])));
    tipMostrar(ev, html);
  };
  capa.addEventListener('pointermove', mover); capa.addEventListener('click', mover);
  capa.addEventListener('pointerleave', () => { res.setAttribute('opacity', 0); tipOcultar(); });
  svg._leyenda = o.series.length > 1 ? o.series.map(se => ({ nombre: se.nombre, color: se.color })) : null;
  return svg;
}

// Áreas apiladas en participación % (o.modo 'pct') o líneas (o.modo 'lineas').
// Con o.etiquetasX las series se dibujan sobre ese eje (por ejemplo, años de gobierno) en vez de ANIOS.
function graficoAreas(root, o) {
  root.innerHTML = '';
  const { svg, W, H } = lienzo(root, o);
  const modo = o.modo;
  const etq = o.etiquetasX || ANIOS.map(String), n = etq.length, u = n - 1;
  const tot = etq.map((_, i) => o.series.reduce((a, se) => a + (se.valores[i] || 0), 0));
  const vals = o.series.map(se => etq.map((_, i) => { const v = se.valores[i]; return modo === 'pct' ? (tot[i] ? (v || 0) / tot[i] * 100 : 0) : v; }));
  const todos = vals.flat().filter(v => v != null);
  const max = modo === 'pct' ? 100 : Math.max(...todos, o.ref || -Infinity) * 1.06;
  const min = o.minAuto ? Math.min(...todos, o.ref || Infinity) * 0.94 : 0;
  const G = grilla(svg, W, H, { max, min, fmtY: o.fmtEje || (modo === 'pct' ? fmtEjePct : fmtEjeMonto), etiquetasX: o.etiquetasX, xDe: (m, iw) => i => m.l + i * iw / u });
  if (o.ref != null) s('line', { x1: G.m.l, x2: G.m.l + G.iw, y1: G.y(o.ref), y2: G.y(o.ref), stroke: css('--ink2'), 'stroke-width': 1, 'stroke-dasharray': '4 3' }, svg);
  if (modo === 'lineas') {
    o.series.forEach((se, k) => {
      let d = '', ult = null;
      vals[k].forEach((v, i) => { if (v == null) return; d += (d && vals[k][i - 1] != null ? 'L' : 'M') + G.x(i).toFixed(1) + ',' + G.y(v).toFixed(1); ult = i; });
      s('path', { d, fill: 'none', stroke: se.color, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
      if (ult != null) s('circle', { cx: G.x(ult), cy: G.y(vals[k][ult]), r: 3.5, fill: se.color }, svg);
    });
  } else {
    const acc = etq.map(() => 0);
    o.series.forEach((se, k) => {
      const lo = acc.slice();
      vals[k].forEach((v, i) => { acc[i] += v || 0; });
      let d = etq.map((_, i) => (i ? 'L' : 'M') + G.x(i).toFixed(1) + ',' + G.y(acc[i]).toFixed(1)).join('');
      for (let i = u; i >= 0; i--) d += 'L' + G.x(i).toFixed(1) + ',' + G.y(lo[i]).toFixed(1);
      s('path', { d: d + 'Z', fill: se.color, 'fill-opacity': 0.9, stroke: css('--bg-card'), 'stroke-width': 0.8 }, svg);
    });
  }
  // Interacción: línea vertical que sigue al punto más cercano
  const guia = s('line', { y1: G.m.t, y2: G.m.t + G.ih, stroke: css('--ink'), 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, svg);
  const capa = s('rect', { x: G.m.l, y: G.m.t, width: G.iw, height: G.ih, fill: 'transparent' }, svg);
  const mover = ev => {
    const p = svg.getBoundingClientRect(), esc = W / p.width;
    const i = clamp(Math.round(((ev.clientX - p.left) * esc - G.m.l) / (G.iw / u)), 0, u);
    guia.setAttribute('x1', G.x(i)); guia.setAttribute('x2', G.x(i)); guia.setAttribute('opacity', 0.5);
    let html = `<div class="tt-hd">${o.tituloTip ? o.tituloTip(i) : etq[i]}</div>`;
    const filas = o.series.map(se => ({ se, v: se.valores[i] })).filter(f => !o.ocultarNulos || f.v != null);
    if (o.ordenTip) filas.sort((a, b) => (b.v ?? -1) - (a.v ?? -1)); else filas.reverse();
    filas.forEach(({ se, v }) => {
      const nom = o.nombreTip ? o.nombreTip(se, i) : se.nombre;
      html += ttFila(se.color, nom, o.fmtTip ? o.fmtTip(v) : modo === 'pct' ? fPart(tot[i] ? (v || 0) / tot[i] * 100 : null) : fMontoU(v));
    });
    if (!filas.length) html += '<div>Sin datos</div>';
    if (!o.sinTotal) html += ttFila(null, o.etiquetaTotal || 'Total', fMontoU(tot[i]), 'tt-tot');
    tipMostrar(ev, html);
  };
  capa.addEventListener('pointermove', mover); capa.addEventListener('click', mover);
  capa.addEventListener('pointerleave', () => { guia.setAttribute('opacity', 0); tipOcultar(); });
  svg._leyenda = o.series.map(se => ({ nombre: se.nombre, color: se.color }));
  return svg;
}

// Línea mínima (tendencia)
function sparkline(vals, color, w, hh) {
  const svg = s('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  const xs = vals.map((v, i) => [i, v]).filter(p => p[1] != null);
  if (xs.length < 2) return svg;
  const max = Math.max(...xs.map(p => p[1])), min = Math.min(...xs.map(p => p[1]));
  const x = i => 2 + i / ULT * (w - 6), y = v => hh - 3 - (v - min) / ((max - min) || 1) * (hh - 7);
  const pts = xs.map(([i, v]) => x(i).toFixed(1) + ',' + y(v).toFixed(1));
  s('polyline', { points: pts.join(' '), fill: 'none', stroke: color, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, svg);
  const [li, lv] = xs[xs.length - 1];
  s('circle', { cx: x(li), cy: y(lv), r: 2.6, fill: color }, svg);
  return svg;
}

// ---------------------------------------------------------------------------
// Descargas
// ---------------------------------------------------------------------------
const citaTexto = () => `${M.autores} (${M.anio_publicacion}). ${M.titulo_documento}. ${M.editorial}.`;
function bajar(blob, archivo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = archivo;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
// CSV con separador ; y coma decimal (abre bien en Excel en español). Las primeras filas llevan la autoría.
function descargarCSV(nombre, titulo, encabezado, filas, o = {}) {
  const e = v => {
    if (v == null) return '';
    if (typeof v === 'number') return String(Math.round(v * 1e4) / 1e4).replace('.', ',');
    return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const meta = [
    [`${M.titulo} - ${titulo}`],
    [`Autoría: ${M.autores} - ${M.editorial}`],
    [`Cita sugerida: ${citaTexto()}`],
    [`Fuente: ${M.fuente}${o.fuenteExtra ? ' ' + o.fuenteExtra : ''}`],
    [`Unidad: ${o.unidad || `${M.unidad} (deflactor: ${M.deflactor})`}`],
    ...(o.nota ? [[`Nota: ${o.nota}`]] : []),
    [`Descargado de: ${location.href.split('#')[0]} (datos actualizados al ${M.actualizado})`],
    []
  ];
  const todo = [...meta, encabezado, ...filas];
  bajar(new Blob(['﻿' + todo.map(r => r.map(e).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), nombre + '.csv');
}

// Imagen exportable: siempre en tema claro y a 900 px, con logos arriba a la derecha,
// título, leyenda, gráfico y, abajo, fuente y autoría (con salto de línea si no entran)
function svgParaExportar(svg, o) {
  const w = +svg.getAttribute('width'), hh = +svg.getAttribute('height'), pad = 24;
  const W = w + 2 * pad;
  const ch = 30, cw = Math.round(ch * 126 / 70), fh = 30, fw = Math.round(fh * 2736 / 1370), logosW = cw + 16 + fw;
  const tit = renglones(o.titulo, W - 2 * pad - logosW - 20, 20);
  const sub = o.subtitulo ? renglones(o.subtitulo, W - 2 * pad - logosW - 20, 13) : [];
  const ley = svg._leyenda;
  let top = 36 + (tit.length - 1) * 24 + sub.length * 18;
  const leyY = top + 4;
  if (ley) {
    // la leyenda puede ocupar más de un renglón
    let x = pad, filas = 1;
    ley.forEach(it => { const a = 16 + anchoTexto(it.nombre, 12.5) + 22; if (x + a > W - pad) { filas++; x = pad; } x += a; });
    top += 22 * filas + 6;
  }
  top += 14;
  const fuente = renglones('Fuente: ' + M.fuente + (o.fuenteExtra ? ' ' + o.fuenteExtra : ''), W - 2 * pad, 11.5);
  const nota = o.nota ? renglones('Nota: ' + o.nota, W - 2 * pad, 11.5) : [];
  const autoria = `${M.autores} (${M.anio_publicacion}). ${M.editorial}.`;
  const bot = 18 + (fuente.length + nota.length) * 15 + 18 + 8;
  const H = hh + top + bot;
  const out = s('svg', { xmlns: NS, width: W, height: H, viewBox: `0 0 ${W} ${H}`, 'font-family': FUENTE_SVG });
  s('rect', { x: 0, y: 0, width: W, height: H, fill: css('--bg') }, out);
  // Logos: CIAS primero, después Fundar
  s('image', { href: LOGOS.cias, x: W - pad - logosW, y: 14, width: cw, height: ch }, out);
  s('image', { href: LOGOS.fundar_negro, x: W - pad - fw, y: 14, width: fw, height: fh }, out);
  tit.forEach((l, k) => txt(out, pad, 36 + k * 24, l, { 'font-size': 20, 'font-weight': 700, fill: css('--ink') }));
  sub.forEach((l, k) => txt(out, pad, 36 + (tit.length - 1) * 24 + 22 + k * 18, l, { 'font-size': 13, fill: css('--ink2') }));
  if (ley) {
    let x = pad, y = leyY + (sub.length ? 10 : 0);
    [...ley].reverse().forEach(it => {
      const a = 16 + anchoTexto(it.nombre, 12.5) + 22;
      if (x + a > W - pad) { x = pad; y += 22; }
      s('rect', { x, y: y + 6, width: 10, height: 10, rx: 2, fill: it.color }, out);
      txt(out, x + 16, y + 15, it.nombre, { 'font-size': 12.5, fill: css('--ink2') });
      x += a;
    });
  }
  const g = s('g', { transform: `translate(${pad},${top})` }, out);
  g.innerHTML = svg.innerHTML;
  let y = hh + top + 26;
  [...fuente, ...nota].forEach((l, k) => txt(out, pad, y + k * 15, l, { 'font-size': 11.5, fill: css('--ink2') }));
  txt(out, pad, y + (fuente.length + nota.length) * 15 + 4, autoria, { 'font-size': 11, fill: css('--ink2') });
  return out;
}
// Dibuja el gráfico fuera de pantalla en formato escritorio y tema claro, y lo pasa a fn
function conExportable(dibujar, o, fn) {
  const oscuro = document.body.classList.contains('oscuro');
  document.body.classList.remove('oscuro');
  const cont = h('div', { class: 'render-export', 'aria-hidden': 'true' }, document.body);
  try {
    const svg = dibujar(cont);
    fn(svgParaExportar(svg, o));
  } finally {
    cont.remove();
    if (oscuro) document.body.classList.add('oscuro');
  }
}
function exportar(formato, dibujar, o) {
  conExportable(dibujar, o, out => {
    const str = new XMLSerializer().serializeToString(out);
    if (formato === 'svg') return bajar(new Blob([str], { type: 'image/svg+xml' }), o.nombre + '.svg');
    const W = +out.getAttribute('width'), H = +out.getAttribute('height');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
      const ctx = c.getContext('2d'); ctx.scale(2, 2); ctx.drawImage(img, 0, 0);
      c.toBlob(b => bajar(b, o.nombre + '.png'));
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  });
}
function aviso(msg) {
  const t = h('div', { class: 'toast', role: 'status' }, document.body, msg);
  setTimeout(() => t.remove(), 2200);
}

// ---------------------------------------------------------------------------
// Estado y registro de gráficos (se redibujan al cambiar el ancho o el tema)
// ---------------------------------------------------------------------------
const peorGrupo = () => GRUPOS.reduce((a, g) => (varPct(g.valores[ULT], g.valores[I_BASE]) < varPct(a.valores[ULT], a.valores[I_BASE]) ? g : a));
const S = {
  grupo: peorGrupo().id, modoG2: 'lineas', orden: 'benef',
  abierto: {},                     // ítem abierto en cada lista desplegable (uno por vez)
  gob: null, gobSerie: 'total',    // gobiernos seleccionados (al abrir, todos)
  vistaProg: {},                   // serie que se ve en el detalle de cada programa
  cobGrupo: 'adultos', cobSel: {}  // gráfico de cobertura: grupo de edad y programas elegidos (por grupo)
};
let REDIBUJAR = [];                // [{ el, fn }]: se redibujan al cambiar el tema
const registrar = (el, fn) => REDIBUJAR.push({ el, fn });
// Redibuja un gráfico cada vez que cambia el ancho de su contenedor (grilla, rotación de pantalla, etc.)
function alCambiarAncho(el, fn) {
  let w = el.clientWidth;
  new ResizeObserver(() => { if (el.isConnected && el.clientWidth && el.clientWidth !== w) { w = el.clientWidth; fn(); } }).observe(el);
}

// Definición de los gráficos principales
const G1 = {
  clave: 'g1',
  titulo: () => `Inversión social no contributiva total, ${ANIOS[0]}–${A_FIN}`,
  subtitulo: () => `En ${M.unidad}`,
  nombre: () => 'g1_inversion_social_total',
  dibujar: root => graficoBarras(root, {
    aria: 'Gráfico de barras de la inversión social total por año',
    series: [{ nombre: 'Inversión social total', color: css('--verde'), valores: TOTAL }]
  })
};
const G2 = {
  clave: () => 'g2.' + S.modoG2,
  titulo: () => `Inversión social por grupo etario, ${ANIOS[0]}–${A_FIN}`,
  subtitulo: () => S.modoG2 === 'pct' ? 'Participación de cada grupo en la inversión asignada a grupos etarios (%)' : `En ${M.unidad}`,
  nombre: () => 'g2_inversion_por_grupo_etario',
  dibujar: root => graficoAreas(root, {
    aria: 'Gráfico de la inversión social por grupo etario',
    modo: S.modoG2, etiquetaTotal: 'Suma de los grupos', sinTotal: S.modoG2 === 'lineas',
    series: [...GRUPOS].reverse().map(g => ({ nombre: g.largo, color: colorGrupo(g.id), valores: g.valores }))
  })
};
// Gasto por categoría como % del PBI (barras apiladas)
const PAL_CAT = ['#466874', '#3B9E78', '#ED8688', '#9695B3', '#C6BF93', '#87B2C1', '#9C9A92'];
const colorCat = c => PAL_CAT[CATS.indexOf(c) % PAL_CAT.length];
const G3 = {
  clave: 'g3',
  titulo: () => `Inversión social por categoría de gasto, ${ANIOS[0]}–${A_FIN}`,
  subtitulo: () => 'Como porcentaje del PBI (%)',
  nombre: () => 'g3_inversion_por_categoria_pct_pbi',
  fuenteExtra: M.fuente_pbi,
  dibujar: root => graficoBarras(root, {
    aria: 'Gráfico de barras apiladas de la inversión social por categoría como porcentaje del PBI',
    fmtEje: fmtEjePct, fmtTip: fPctPbi, etiquetaVar: null,
    series: CATS.map(c => ({ nombre: c.corto, color: colorCat(c), valores: c.pct_pbi }))
  })
};

// Comparación por gobierno: base 100 = último año del gobierno anterior (año 0)
const GOBIERNOS = [
  { id: 'nk', nombre: 'Néstor Kirchner', periodo: '2003–2007', base: 2002, fin: 2007, color: '#C6BF93' },
  { id: 'cfk1', nombre: 'Cristina Fernández de Kirchner I', corto: 'CFK I', periodo: '2008–2011', base: 2007, fin: 2011, color: '#87B2C1' },
  { id: 'cfk2', nombre: 'Cristina Fernández de Kirchner II', corto: 'CFK II', periodo: '2012–2015', base: 2011, fin: 2015, color: '#466874' },
  { id: 'macri', nombre: 'Mauricio Macri', periodo: '2016–2019', base: 2015, fin: 2019, color: '#9695B3' },
  { id: 'af', nombre: 'Alberto Fernández', periodo: '2020–2023', base: 2019, fin: 2023, color: '#3B9E78' },
  { id: 'milei', nombre: 'Javier Milei', periodo: `2024–${A_FIN}`, base: 2023, fin: A_FIN, color: '#ED8688' }
].filter(g => ANIOS.includes(g.base) && ANIOS.includes(g.base + 1)).map(g => ({ ...g, fin: Math.min(g.fin, A_FIN), corto: g.corto || g.nombre }));
const MAX_ANIOS_GOB = Math.max(...GOBIERNOS.map(g => g.fin - g.base));
// Al abrir: todos menos Néstor Kirchner (su año base, 2002, es tan bajo que su línea achata a las demás)
S.gob = new Set(GOBIERNOS.filter(g => g.id !== 'nk').map(g => g.id));
const SERIES_GOB = [['total', 'Total', TOTAL], ...GRUPOS.map(g => [g.id, g.nombre, g.valores])];
const serieGob = () => SERIES_GOB.find(x => x[0] === S.gobSerie);
const indiceGob = (g, vals) => {
  const i0 = ANIOS.indexOf(g.base), v0 = vals[i0];
  return Array.from({ length: MAX_ANIOS_GOB + 1 }, (_, k) => {
    const a = g.base + k;
    return a > g.fin || !v0 || vals[i0 + k] == null ? null : vals[i0 + k] / v0 * 100;
  });
};
const gobSel = () => GOBIERNOS.filter(g => S.gob.has(g.id));
const G4 = {
  clave: () => 'g4.' + S.gobSerie,
  titulo: () => `Inversión social ${S.gobSerie === 'total' ? 'no contributiva total' : 'en ' + serieGob()[1].toLowerCase()} por gobierno`,
  subtitulo: () => 'Índice base 100 = último año del gobierno anterior (año 0), en términos reales',
  nombre: () => 'g4_inversion_por_gobierno_' + S.gobSerie,
  dibujar: root => graficoAreas(root, {
    aria: 'Comparación de la evolución de la inversión social por gobierno',
    modo: 'lineas', sinTotal: true, ordenTip: true, minAuto: true, ref: 100, ocultarNulos: true,
    // El eje llega hasta el mandato más largo entre los seleccionados
    etiquetasX: Array.from({ length: Math.max(...gobSel().map(g => g.fin - g.base)) + 1 }, (_, k) => 'Año ' + k),
    tituloTip: k => k ? `Año ${k} de gobierno` : 'Año 0 (base = 100)',
    nombreTip: (se, k) => `${se.nombre} (${se.gob.base + k})`,
    fmtEje: t => nf0.format(t), fmtTip: v => v == null ? '—' : nf1.format(v),
    series: gobSel().map(g => ({ nombre: g.corto, color: g.color, gob: g, valores: indiceGob(g, serieGob()[2]) }))
  })
};
// Cobertura por grupo de edad: programas del grupo apilados sobre la misma población
const COB = D.cobertura_grupos || [];
const PAL_COB = ['#466874', '#ED8688', '#C6BF93', '#3B9E78'];
const cobGrupo = () => COB.find(g => g.id === S.cobGrupo) || COB[0];
const cobSel = () => {
  const g = cobGrupo();
  if (!S.cobSel[g.id]) S.cobSel[g.id] = new Set(g.series.map(s => s.id));
  return g.series.filter(s => S.cobSel[g.id].has(s.id));
};
const colorCob = s => PAL_COB[cobGrupo().series.indexOf(s) % PAL_COB.length];
const G5 = {
  clave: () => 'g5.' + cobGrupo().id,
  titulo: () => `Cobertura de los programas sociales: ${cobGrupo().nombre.toLowerCase()}, ${ANIOS[0]}–${A_FIN}`,
  subtitulo: () => `Beneficios de cada programa por cada 100 ${cobGrupo().poblacion_txt}`,
  nombre: () => 'g5_cobertura_' + cobGrupo().id,
  fuenteExtra: M.fuente_poblacion,
  nota: 'Una persona que cobra más de un programa se cuenta una vez por programa, por lo que el total es un máximo de la cobertura.',
  dibujar: root => graficoBarras(root, {
    aria: 'Gráfico de barras apiladas de la cobertura de los programas sociales por grupo de edad',
    // Unidad: beneficios por cada 100 personas del grupo (no %: una persona puede cobrar más de un programa)
    fmtEje: (t, st) => (st < 1 ? nf1 : nf0).format(t), fmtTip: v => v == null ? '—' : nf1.format(v) + ' por cada 100', etiquetaVar: null, etiquetaTotal: 'Total',
    extraTip: i => ttFila(null, 'Población del grupo', fPersonas(cobGrupo().poblacion[i])),
    series: cobSel().map(s => ({ nombre: s.nombre, color: colorCob(s), valores: s.cobertura }))
  })
};
// Clave de cada texto de un gráfico (def.clave puede depender de lo que esté seleccionado)
const claveDe = (def, campo) => (typeof def.clave === 'function' ? def.clave() : def.clave) + '.' + campo;
const titDe = def => ed(claveDe(def, 'titulo'), def.titulo());
const subDe = def => ed(claveDe(def, 'subtitulo'), def.subtitulo());
const notaDe = def => ed(claveDe(def, 'nota'), def.nota || '');
const opcionesExport = def => ({ titulo: titDe(def), subtitulo: subDe(def), nombre: def.nombre(), fuenteExtra: def.fuenteExtra, nota: notaDe(def) });
// Pie de cada gráfico: fuente y, si hay, nota (en modo edición, también un lugar para agregar una nota)
const pieHtml = def => {
  const nota = notaDe(def);
  return `<b>Fuente:</b> ${spanEd('datos.meta.fuente', M.fuente)}${def.fuenteExtra ? ' ' + esc(def.fuenteExtra) : ''}` +
    (nota ? `<span class="nota"><b>Nota:</b> ${spanEd(claveDe(def, 'nota'), nota)}</span>`
      : EDITAR ? `<span class="nota nota-vacia" ${attrEd(claveDe(def, 'nota'))}>+ Agregar nota</span>` : '');
};

// Tarjeta con encabezado, controles, leyenda, cuerpo y botones de descarga
function tarjeta(parent, def, o = {}) {
  const c = h('div', { class: 'card' }, parent);
  const hd = h('div', { class: 'card-hd' }, c);
  const tt = h('div', {}, hd);
  const t = h('h3', {}, tt), st = h('p', { class: 'card-sub' }, tt);
  const acts = h('div', { class: 'card-acts' }, hd);
  [['PNG', 'png', 'Descargar imagen'], ['SVG', 'svg', 'Descargar gráfico editable']].forEach(([lbl, f, title]) => {
    h('button', { class: 'btn-mini', type: 'button', title }, acts, lbl).onclick = () => exportar(f, def.dibujar, opcionesExport(def));
  });
  if (o.csv) h('button', { class: 'btn-mini', type: 'button', title: 'Descargar los datos' }, acts, 'CSV').onclick = o.csv;
  const ctls = o.controles ? h('div', { class: 'card-ctls' }, c) : null;
  const ley = h('div', { class: 'leyenda' }, c);
  const body = h('div', { class: 'card-body' }, c);
  const foot = h('div', { class: 'card-foot' }, c);
  const dibujar = () => {
    t.innerHTML = spanEd(claveDe(def, 'titulo'), titDe(def)); st.innerHTML = spanEd(claveDe(def, 'subtitulo'), subDe(def));
    foot.innerHTML = pieHtml(def);
    const svg = def.dibujar(body);
    ley.innerHTML = o.sinLeyenda ? '' : (svg._leyenda || []).map(it => `<span><i style="background:${it.color}"></i>${esc(it.nombre)}</span>`).reverse().join('');
    ley.hidden = o.sinLeyenda || !svg._leyenda;
  };
  if (o.controles) o.controles(ctls, dibujar);
  registrar(body, dibujar);
  dibujar();
  alCambiarAncho(body, dibujar);
  return c;
}
// Botonera segmentada
function segmentos(parent, opciones, valor, alCambiar, aria) {
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': aria || '' }, parent);
  opciones.forEach(([v, lbl]) => {
    const b = h('button', { type: 'button', 'aria-pressed': String(v === valor) }, seg, lbl);
    if (v === valor) b.classList.add('on');
    b.onclick = () => {
      seg.querySelectorAll('button').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      alCambiar(v);
    };
  });
  return seg;
}

// ---------------------------------------------------------------------------
// Secciones
// ---------------------------------------------------------------------------
function textosFijos() {
  $('#titulo').textContent = M.titulo;
  document.querySelectorAll('.anio-ini').forEach(e => { e.textContent = ANIOS[0]; });
  document.querySelectorAll('.anio-fin').forEach(e => { e.textContent = A_FIN; });
  document.querySelectorAll('.anio-prev').forEach(e => { e.textContent = A_PREV; });
  document.querySelectorAll('.anio-base').forEach(e => { e.textContent = A_BASE; });
  $('#cita-texto').innerHTML = `${esc(M.autores)} (${M.anio_publicacion}). <em>${esc(M.titulo_documento)}</em>. ${esc(M.editorial)}.`;
  $('#pie-fuente').textContent = 'Fuente: ' + M.fuente;
  const [y, m, d] = M.actualizado.split('-');
  $('#pie-act').textContent = `Datos actualizados al ${d}/${m}/${y}`;
  const doc = $('#btn-doc');
  if (M.documento_url) doc.href = M.documento_url;
  else { doc.setAttribute('aria-disabled', 'true'); doc.textContent = 'Documento: próximamente'; doc.removeAttribute('href'); }
  $('#btn-copiar').onclick = async () => {
    try { await navigator.clipboard.writeText(citaTexto()); aviso('Cita copiada'); }
    catch (e) { aviso('No se pudo copiar: seleccioná el texto'); }
  };
  const notas = [
    `Se considera la inversión social <b>no contributiva</b> del Estado nacional: transferencias y programas que no dependen de aportes previos de quienes los reciben.`,
    `Los montos son anuales y están expresados en ${esc(M.unidad)}, deflactados con ${esc(M.deflactor)}. Las variaciones son reales. Los montos incluyen los bonos extraordinarios pagados a quienes cobran pensiones no contributivas.`,
    `La variación central del tablero se mide contra ${A_BASE}, último año del gobierno anterior.`,
    `El <b>gasto como porcentaje del PBI</b> divide el gasto nominal anual de cada categoría (suma de los meses) por el PBI a precios corrientes. ${esc(M.fuente_pbi)}`,
    `La <b>comparación por gobierno</b> expresa la inversión de cada año como índice, con base 100 en el último año del gobierno anterior (año 0). Así, el año 1 de cada gobierno muestra cuánto cambió en términos reales respecto del año previo a su asunción.`,
    `La apertura por <b>grupo etario</b> asigna cada programa a la población a la que se dirige. ` +
      GRUPOS.map(g => `<b>${esc(g.largo)}</b>: ${esc(g.composicion || '')}.`).join(' '),
    `Las pensiones para madres de siete o más hijos forman parte del total pero no se asignan a ningún grupo etario. Por eso la participación de cada grupo se calcula sobre la suma de los tres grupos (el gasto que se pudo clasificar), no sobre el total.`,
    `<b>Cobertura</b>: beneficiarios del programa sobre la población del rango de edad al que se dirige (AUH: 0 a 17 años; PROGRESAR: 18 a 24; pensiones por invalidez y planes de cooperativas: 18 a 64; PUAM: 65 y más; moratoria: mujeres de 60 y más y varones de 65 y más). No mide la cobertura sobre quienes cumplen todos los requisitos (por ejemplo, ingresos o situación laboral), sino sobre todo el grupo de edad. No se calcula para la Prestación Alimentar, cuyos beneficiarios son familias. ${esc(M.fuente_poblacion)}`,
    `El <b>gráfico de cobertura por grupo de edad</b> divide los beneficiarios de cada programa por la misma población (niñez: 0 a 17 años; jóvenes y adultos: 18 a 64; adultos mayores: mujeres de 60 y más y varones de 65 y más), por eso las barras se pueden apilar. La suma indica cuántos beneficios hay por cada 100 personas del grupo: si una persona cobra dos programas se cuenta dos veces, así que la suma es un techo de la cobertura. La AUH incluye la AUH por discapacidad y la Asignación por Embarazo.`,
    `<b>Beneficiarios</b>: promedio anual de personas que cobraron cada programa (en la Prestación Alimentar, familias). <b>Beneficio</b>: monto mensual promedio del año, en ${esc(M.unidad_beneficio.replace(' por mes', ''))}; en las pensiones incluye bonos. En los programas que agrupan varias líneas (planes de cooperativas), el beneficio es el promedio de los programas vigentes ponderado por beneficiarios.`
  ];
  $('#notas-metodo').innerHTML = notas.map((n, k) => {
    const clave = 'metodologia.nota_' + (k + 1);
    return `<li ${attrEd(clave)}>${clave in TXT ? esc(TXT[clave]) : n}</li>`;
  }).join('');
  const filas = [['Inversión social total', 'Suma de todas las categorías de gasto social no contributivo (incluye bonos extraordinarios).']]
    .concat(CATS.map(c => [c.nombre + ' (categoría de gasto)', c.composicion]))
    .concat(GRUPOS.map(g => [g.largo + ' (grupo etario)', g.composicion]))
    .concat(D.programas.map(p => [p.nombre, p.composicion || p.descripcion]));
  $('#tabla-metodo').innerHTML = '<thead><tr><th>Serie</th><th>Qué incluye</th></tr></thead><tbody>' +
    filas.map(([a, b = '']) => `<tr><td>${esc(a)}</td><td>${esc(b.charAt(0).toUpperCase() + b.slice(1))}</td></tr>`).join('') + '</tbody>';
  // Programas por categoría de gasto y grupo etario (anexo metodológico)
  const nomCat = id => (CATS.find(c => c.id === id) || {}).nombre || id;
  const nomGrupo = id => id ? `<span class="chip-nom"><i style="background:${colorGrupo(id)}"></i>${esc(grupo(id).largo)}</span>` : '<span class="muted">Sin grupo etario</span>';
  let previa = null;
  $('#tabla-clasif').innerHTML = '<thead><tr><th>Categoría de gasto</th><th>Programa</th><th>Grupo etario</th></tr></thead><tbody>' +
    (D.clasificacion || []).map(([cat, prog, gr, nota]) => {
      const celdaCat = cat === previa ? '' : esc(nomCat(cat));
      const fila = `<tr class="${cat === previa ? '' : 'nueva-cat'}"><td>${celdaCat}</td><td>${esc(prog)}${nota ? `<small>${esc(nota)}</small>` : ''}</td><td>${nomGrupo(gr)}</td></tr>`;
      previa = cat;
      return fila;
    }).join('') + '</tbody>';
  $('#metodo-fuente').textContent = M.fuente + ' Deflactor: ' + M.deflactor + '. ' + M.fuente_pbi + ' ' + M.fuente_poblacion;
}

// Pestañas: tablero principal y metodología (por el ancla de la URL)
function vistas() {
  const principal = $('#inicio'), metodo = $('#metodologia');
  const mostrar = () => {
    const id = location.hash.slice(1);
    const enMetodo = id === 'metodologia';
    const cambia = metodo.hidden === enMetodo;
    principal.hidden = enMetodo; metodo.hidden = !enMetodo;
    document.querySelectorAll('#menu a').forEach(a => a.classList.toggle('on', (a.hash === '#metodologia') === enMetodo));
    if (enMetodo) { scrollTo({ top: 0, behavior: 'instant' }); return; }
    const el = id && document.getElementById(id);
    if (cambia) el ? el.scrollIntoView({ behavior: 'instant' }) : scrollTo({ top: 0, behavior: 'instant' });
  };
  addEventListener('hashchange', mostrar);
  mostrar();
}

function seccionResumen() {
  const hero = $('#hero');
  const vT = varPct(TOTAL[ULT], TOTAL[PREV]), vTb = varPct(TOTAL[ULT], TOTAL[I_BASE]);
  const num = (lbl, valor, unidad, cls = '') =>
    `<div><div class="hero-lbl">${lbl}</div><div class="hero-num ${cls}">${valor}</div><div class="hero-u">${unidad}</div></div>`;
  const anual = (v, extra = '') => `Variación real ${A_PREV}–${A_FIN}: <b class="${clase(v)}">${fPct(v)}</b>${extra}.`;

  const c1 = h('div', { class: 'hero-col' }, hero);
  h('p', { class: 'hero-tit' }, c1, `<b>${spanEd('resumen.titulo_total', ed('resumen.titulo_total', 'Inversión social no contributiva total'))}</b>`);
  h('div', { class: 'hero-nums' }, c1,
    num(`Monto ${A_FIN}`, fMonto(TOTAL[ULT]), M.unidad_corta) +
    num(`Variación real ${A_BASE}–${A_FIN}`, fPct(vTb), `${flecha(vTb)} respecto de ${A_BASE}`, clase(vTb)));
  h('p', { class: 'hero-ctx' }, c1, anual(vT) + ` Equivale al <b>${nf1.format(PBI_TOT[ULT])}% del PBI</b> en ${A_FIN}.`);

  const c2 = h('div', { class: 'hero-col' }, hero);
  h('p', { class: 'hero-tit' }, c2, `<b>${spanEd('resumen.titulo_grupos', ed('resumen.titulo_grupos', 'Inversión social por grupo etario'))}</b>`);
  const ctl = h('div', {}, c2);
  const nums2 = h('div', { class: 'hero-nums' }, c2);
  const ctx2 = h('p', { class: 'hero-ctx' }, c2);
  segmentos(ctl, GRUPOS.map(g => [g.id, g.nombre]), S.grupo, v => { S.grupo = v; pintar2(); }, 'Grupo etario');

  function pintar2() {
    const g = grupo(S.grupo), v = g.valores;
    const vg = varPct(v[ULT], v[PREV]), vgb = varPct(v[ULT], v[I_BASE]);
    nums2.innerHTML = num(`Monto ${A_FIN}`, fMonto(v[ULT]), M.unidad_corta) +
      num(`Variación real ${A_BASE}–${A_FIN}`, fPct(vgb), `${flecha(vgb)} respecto de ${A_BASE} (total: ${fPct(vTb)})`, clase(vgb));
    ctx2.innerHTML = `Representa el <b>${fPart(v[ULT] / CLASIF[ULT] * 100)}</b> de la inversión asignada a grupos etarios en ${A_FIN}. ` +
      anual(vg);
  }
  pintar2();
}

function seccionGraficos() {
  const cont = $('#graficos');
  tarjeta(cont, G1, { csv: () => descargarCSV(G1.nombre(), G1.titulo(), ['anio', 'total', 'var_real_anual_pct'],
    ANIOS.map((a, i) => [a, TOTAL[i], i ? varPct(TOTAL[i], TOTAL[i - 1]) : null])) });
  tarjeta(cont, G2, {
    controles: (c, redibujar) => segmentos(c, [['lineas', 'Montos'], ['pct', 'Participación %']], S.modoG2, v => { S.modoG2 = v; redibujar(); }, 'Modo'),
    csv: () => descargarCSV(G2.nombre(), G2.titulo(), ['anio', ...GRUPOS.map(g => g.id), ...GRUPOS.map(g => g.id + '_part_pct')],
      ANIOS.map((a, i) => [a, ...GRUPOS.map(g => g.valores[i]), ...GRUPOS.map(g => CLASIF[i] ? g.valores[i] / CLASIF[i] * 100 : null)]))
  });
  const c3 = tarjeta(cont, G3, {
    csv: () => descargarCSV(G3.nombre(), G3.titulo(), ['anio', ...CATS.map(c => c.id + '_pct_pbi'), 'total_pct_pbi'],
      ANIOS.map((a, i) => [a, ...CATS.map(c => c.pct_pbi[i]), PBI_TOT[i]]), { unidad: 'porcentaje del PBI', fuenteExtra: M.fuente_pbi })
  });
  c3.classList.add('card-ancha');
}

function seccionGobiernos() {
  const cont = $('#gobiernos');
  tarjeta(cont, G4, {
    sinLeyenda: true,
    controles: (c, redibujar) => {
      segmentos(c, SERIES_GOB.map(x => [x[0], x[1]]), S.gobSerie, v => { S.gobSerie = v; redibujar(); }, 'Serie');
      const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Gobiernos a comparar' }, c);
      GOBIERNOS.forEach(g => {
        const b = h('button', { class: 'chip-btn', type: 'button', 'aria-pressed': String(S.gob.has(g.id)) }, chips,
          `<i style="background:${g.color}"></i>${esc(g.corto)} <small>${g.periodo}</small>`);
        b.onclick = () => {
          if (S.gob.has(g.id)) { if (S.gob.size === 1) return aviso('Elegí al menos un gobierno'); S.gob.delete(g.id); }
          else S.gob.add(g.id);
          b.setAttribute('aria-pressed', String(S.gob.has(g.id)));
          redibujar();
        };
      });
    },
    csv: () => {
      const [, nombre, vals] = serieGob();
      const filas = [];
      GOBIERNOS.forEach(g => indiceGob(g, vals).forEach((v, k) => {
        if (v != null) filas.push([g.nombre, g.base + k, k, vals[ANIOS.indexOf(g.base + k)], v]);
      }));
      descargarCSV(G4.nombre(), G4.titulo(), ['gobierno', 'anio', 'anio_de_gobierno', 'monto_billones', 'indice_base_100'], filas,
        { unidad: `índice base 100 = último año del gobierno anterior; montos en ${M.unidad} (serie: ${nombre})` });
    }
  }).classList.add('card-ancha');
}

// Programas: beneficiarios y nivel de beneficio al frente; el gasto, en el detalle
function seccionCobertura() {
  if (!COB.length) return;
  tarjeta($('#cobertura'), G5, {
    controles: (c, redibujar) => {
      segmentos(c, COB.map(g => [g.id, g.nombre]), S.cobGrupo, v => { S.cobGrupo = v; chipsCob(); redibujar(); }, 'Grupo de edad');
      const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Programas' }, c);
      const chipsCob = () => {
        chips.innerHTML = '';
        const g = cobGrupo(), sel = S.cobSel[g.id] || (cobSel(), S.cobSel[g.id]);
        g.series.forEach(s => {
          const b = h('button', { class: 'chip-btn', type: 'button', 'aria-pressed': String(sel.has(s.id)) }, chips,
            `<i style="background:${colorCob(s)}"></i>${esc(s.nombre)}`);
          b.onclick = () => {
            if (sel.has(s.id)) { if (sel.size === 1) return aviso('Elegí al menos un programa'); sel.delete(s.id); }
            else sel.add(s.id);
            b.setAttribute('aria-pressed', String(sel.has(s.id)));
            redibujar();
          };
        });
      };
      chipsCob();
    },
    csv: () => {
      const g = cobGrupo(), ss = cobSel();
      descargarCSV(G5.nombre(), G5.titulo(),
        ['anio', 'poblacion_grupo', ...ss.map(s => s.id + '_beneficiarios'), ...ss.map(s => s.id + '_por_cada_100'), 'total_por_cada_100'],
        ANIOS.map((a, i) => [a, g.poblacion[i], ...ss.map(s => s.beneficiarios[i]), ...ss.map(s => s.cobertura[i]),
          ss.some(s => s.cobertura[i] != null) ? ss.reduce((t, s) => t + (s.cobertura[i] || 0), 0) : null]),
        { unidad: `beneficios por cada 100 ${g.poblacion_txt} (una persona que cobra dos programas se cuenta dos veces)`, fuenteExtra: M.fuente_poblacion });
    }
  }).classList.add('card-ancha');
}

function seccionProgramas() {
  const sel = $('#orden');
  sel.value = S.orden;
  sel.onchange = () => { S.orden = sel.value; pintar(); };
  const pintar = () => {
    const datos = D.programas.map(p => ({ p, b: p.beneficiarios[ULT], n: p.beneficio[ULT], v: varPct(p.beneficiarios[ULT], p.beneficiarios[I_BASE]) }));
    const orden = {
      benef: (a, b) => (b.b ?? -1) - (a.b ?? -1), beneficio: (a, b) => (b.n ?? -1) - (a.n ?? -1),
      var: (a, b) => (b.v ?? -1e9) - (a.v ?? -1e9), nombre: (a, b) => a.p.nombre.localeCompare(b.p.nombre, 'es')
    }[S.orden];
    const lista = $('#lista-prog');
    lista.innerHTML = '';
    [...datos].sort(orden).forEach(d => itemDesplegable(lista, 'prog', d.p, filaPrograma, detallePrograma));
  };
  pintar();
}

// Población objetivo: gasto por grupo etario
function seccionPoblacion() {
  const lista = $('#lista-pob');
  lista.innerHTML = '';
  GRUPOS.forEach(g => itemDesplegable(lista, 'pob', {
    id: g.id, nombre: g.largo, corto: g.largo, en: g.largo.toLowerCase(), grupo: g.id,
    archivo: 'poblacion_' + g.id, valores: g.valores,
    composicion: g.composicion || ''
  }, filaPoblacion, detallePoblacion));
}

const varHtml = (v, title) => `<span class="var ${clase(v)}" title="${title}">${flecha(v)} ${fPct(v)}</span>`;
function filaPrograma(p) {
  const g = grupo(p.grupo) || { largo: 'Varios grupos' }, color = colorGrupo(p.grupo);
  const b = p.beneficiarios, n = p.beneficio;
  return {
    nom: `${spanEd('datos.programas.' + p.id + '.nombre', p.nombre)}<span class="chip" style="display:flex"><i style="background:${color}"></i>${esc(g.largo)}</span>`,
    datos: `
      <span class="prog-monto">${fPersonas(b[ULT])}<small>${p.unidad_benef || 'personas'}</small></span>
      ${varHtml(varPct(b[ULT], b[I_BASE]), `Variación de beneficiarios ${A_BASE}-${A_FIN}`)}
      <span class="prog-monto">${fPesos(n[ULT])}<small>por mes</small></span>
      ${varHtml(varPct(n[ULT], n[I_BASE]), `Variación real del beneficio ${A_BASE}-${A_FIN}`)}`
  };
}
function filaPoblacion(p) {
  const color = colorGrupo(p.grupo), val = p.valores[ULT];
  const part = val / CLASIF[ULT] * 100;
  return {
    nom: `<span class="chip-nom"><i style="background:${color}"></i>${esc(p.nombre)}</span>`,
    datos: `
      <span class="prog-monto">${fMonto(val)}<small>billones</small></span>
      <span class="peso" title="Participación en la inversión asignada a grupos etarios ${A_FIN}"><span class="peso-barra"><span style="width:${clamp(part, 0, 100)}%;background:${color}"></span></span><b>${fPart(part)}</b></span>
      ${varHtml(varPct(val, p.valores[I_BASE]), `Variación real ${A_BASE}-${A_FIN}`)}
      <span class="spark"></span>`,
    spark: () => sparkline(p.valores, color, 96, 28)
  };
}

function itemDesplegable(lista, clave, p, fila_, detalle) {
  const f = fila_(p);
  const item = h('div', { class: 'prog' }, lista);
  const fila = h('button', { class: 'prog-fila', type: 'button', 'aria-expanded': 'false' }, item, `
    <span class="prog-nom">${f.nom}</span>
    <span class="prog-datos">${f.datos}</span>
    <span class="chev" aria-hidden="true"></span>`);
  if (f.spark) fila.querySelector('.spark').appendChild(f.spark());
  const det = h('div', { class: 'prog-det', hidden: '' }, item);
  item._abrir = abierto => {
    item.classList.toggle('abierto', abierto);
    fila.setAttribute('aria-expanded', String(abierto));
    det.hidden = !abierto;
    if (abierto && !det.childElementCount) detalle(det, p, colorGrupo(p.grupo));
  };
  fila.onclick = () => {
    const abrir = det.hidden;
    // Solo un ítem abierto por lista: se cierran los demás
    lista.querySelectorAll('.prog.abierto').forEach(o => { if (o !== item) o._abrir(false); });
    item._abrir(abrir);
    S.abierto[clave] = abrir ? p.id : null;
    if (abrir && item.getBoundingClientRect().top < 70) item.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  if (S.abierto[clave] === p.id) item._abrir(true);
}

const dato = (dt, dd, cls = '') => `<div><dt>${dt}</dt><dd class="${cls}">${dd}</dd></div>`;
// Gráfico del detalle: título y unidad en un solo color, botones de descarga y fuente
function graficoDetalle(det, defs, vistaInicial, alCambiar) {
  const graf = h('div', { class: 'prog-graf' }, det);
  const hd = h('div', { class: 'card-hd' }, graf);
  const t = h('h4', {}, hd);
  const acts = h('div', { class: 'card-acts' }, hd);
  let vista = vistaInicial;
  const def = () => defs[vista];
  h('button', { class: 'btn-mini', type: 'button' }, acts, 'PNG').onclick = () => exportar('png', r => def().dibujar(r), opcionesExport(def()));
  h('button', { class: 'btn-mini', type: 'button' }, acts, 'SVG').onclick = () => exportar('svg', r => def().dibujar(r), opcionesExport(def()));
  h('button', { class: 'btn-mini', type: 'button' }, acts, 'CSV').onclick = () => def().csv();
  const claves = Object.keys(defs);
  if (claves.length > 1) {
    const ctl = h('div', { class: 'card-ctls' }, graf);
    segmentos(ctl, claves.map(k => [k, defs[k].etiqueta]), vista, v => { vista = v; alCambiar && alCambiar(v); dibujar(); }, 'Serie');
  }
  const body = h('div', { class: 'card-body' }, graf);
  const pie = h('div', { class: 'card-foot' }, graf);
  const dibujar = () => {
    if (!body.isConnected) return;
    pie.innerHTML = pieHtml(def());
    t.innerHTML = `${spanEd(claveDe(def(), 'titulo'), titDe(def()))} (${spanEd(claveDe(def(), 'subtitulo'), subDe(def()).replace(/^En /, ''))})`;
    def().dibujar(body, Math.round(clamp(body.clientWidth * 0.42, 200, 260)));
  };
  registrar(body, dibujar);
  dibujar();
  alCambiarAncho(body, dibujar);
}

const rango = () => `${ANIOS[0]}–${A_FIN}`;
function defGasto(p, color, nota) {
  const tit = 'Gasto en ' + (p.en || p.corto);
  return {
    etiqueta: 'Gasto', clave: (p.archivo || 'programa_' + p.id) + '.gasto', nota, titulo: () => `${tit}, ${rango()}`, subtitulo: () => `En ${M.unidad}`,
    nombre: () => (p.archivo || 'programa_' + p.id) + '_gasto',
    dibujar: (root, alto) => graficoBarras(root, { alto, aria: tit, series: [{ nombre: p.corto, color, valores: p.valores }] }),
    csv: () => descargarCSV((p.archivo || 'programa_' + p.id) + '_gasto', tit, ['anio', p.id], ANIOS.map((a, i) => [a, p.valores[i]]), { nota: ed((p.archivo || 'programa_' + p.id) + '.gasto.nota', nota || '') })
  };
}

function detallePrograma(det, p, color) {
  const b = p.beneficiarios, n = p.beneficio, g = p.valores;
  const info = h('div', {}, det);
  const c = p.cobertura;
  if (c && c[ULT] != null) {
    const dif = c[I_BASE] == null ? null : c[ULT] - c[I_BASE];
    h('p', { class: 'cobertura' }, info,
      `<span class="cob-lbl">Cobertura ${A_FIN}</span><b>${nf1.format(c[ULT])}%</b> del total de ${esc(p.poblacion_ref_txt)}.` +
      (dif == null ? '' : ` <span class="${clase(dif)}">${signo(dif)}${nf1.format(Math.abs(dif))} puntos</span> respecto de ${A_BASE}.`));
  }
  const vb = varPct(b[ULT], b[PREV]), vn = varPct(n[ULT], n[PREV]), vg = varPct(g[ULT], g[I_BASE]);
  h('dl', { class: 'datos-prog' }, info,
    dato(`Gasto ${A_FIN}`, `${fMonto(g[ULT])} <small>billones</small>`) +
    dato(`Var. real gasto ${A_BASE}–${A_FIN}`, fPct(vg), clase(vg)) +
    dato(`Beneficiarios ${A_PREV}–${A_FIN}`, fPct(vb), clase(vb)) +
    dato(`Var. real beneficio ${A_PREV}–${A_FIN}`, fPct(vn), clase(vn)));
  const base = p.archivo || 'programa_' + p.id;
  // Aclaraciones de cada gráfico (van debajo de la fuente, no en la ficha)
  const nota = (vista, extra) => [(p.notas || {}).todas, (p.notas || {})[vista], extra].filter(Boolean).join(' ') || null;
  const defs = {
    benef: {
      etiqueta: 'Beneficiarios', clave: base + '.benef', nota: nota('benef'), titulo: () => `Beneficiarios de ${p.en || p.corto}, ${rango()}`, subtitulo: () => `Promedio anual de ${p.unidad_benef || 'personas'}`,
      nombre: () => base + '_beneficiarios',
      dibujar: (root, alto) => graficoBarras(root, { alto, aria: 'Beneficiarios de ' + p.corto, fmtEje: fmtEjePersonas,
        fmtTip: v => fPersonas(v) + ' ' + (p.unidad_benef || 'personas'), etiquetaVar: 'Var. vs.', series: [{ nombre: 'Beneficiarios', color, valores: b }] }),
      csv: () => descargarCSV(base + '_beneficiarios', 'Beneficiarios de ' + p.nombre, ['anio', 'beneficiarios'], ANIOS.map((a, i) => [a, b[i]]),
        { unidad: `promedio anual de ${p.unidad_benef || 'personas'}`, nota: notaDe(defs.benef) })
    },
    beneficio: {
      etiqueta: 'Beneficio mensual', clave: base + '.beneficio', nota: nota('beneficio', 'Promedio mensual del año.'), titulo: () => `Beneficio mensual de ${p.en || p.corto}, ${rango()}`, subtitulo: () => `En ${M.unidad_beneficio}`,
      nombre: () => base + '_beneficio',
      dibujar: (root, alto) => graficoBarras(root, { alto, aria: 'Beneficio mensual de ' + p.corto, fmtEje: fmtEjePesos,
        fmtTip: v => fPesos(v) + ' por mes', series: [{ nombre: 'Beneficio mensual', color, valores: n }] }),
      csv: () => descargarCSV(base + '_beneficio', 'Beneficio mensual de ' + p.nombre, ['anio', 'beneficio_mensual'], ANIOS.map((a, i) => [a, n[i]]),
        { unidad: `${M.unidad_beneficio} (promedio del año)`, nota: notaDe(defs.beneficio) })
    },
    gasto: defGasto(p, color, nota('gasto'))
  };
  if (c) {
    const ref = p.poblacion_ref;
    defs.cobertura = {
      etiqueta: 'Cobertura', clave: base + '.cobertura', titulo: () => `Cobertura de ${p.en || p.corto}, ${rango()}`,
      subtitulo: () => `En % del total de ${p.poblacion_ref_txt}`,
      nombre: () => base + '_cobertura', fuenteExtra: M.fuente_poblacion, nota: nota('cobertura'),
      dibujar: (root, alto) => graficoBarras(root, { alto, aria: 'Cobertura de ' + p.corto, fmtEje: fmtEjePct,
        fmtTip: v => v == null ? '—' : nf1.format(v) + '%', etiquetaVar: null, series: [{ nombre: 'Cobertura', color, valores: c }] }),
      csv: () => descargarCSV(base + '_cobertura', 'Cobertura de ' + p.nombre, ['anio', 'beneficiarios', 'poblacion_referencia', 'cobertura_pct'],
        ANIOS.map((a, i) => [a, b[i], ref[i], c[i]]), { unidad: `% del total de ${p.poblacion_ref_txt}`, fuenteExtra: M.fuente_poblacion, nota: notaDe(defs.cobertura) })
    };
  }
  graficoDetalle(det, defs, S.vistaProg[p.id] || 'benef', v => { S.vistaProg[p.id] = v; });
}

function detallePoblacion(det, p, color) {
  const vals = p.valores;
  const v = varPct(vals[ULT], vals[PREV]);
  const info = h('div', {}, det);
  // Composición del grupo: plegada, se despliega al tocar
  h('details', { class: 'incluye' }, info,
    `<summary>Qué programas incluye</summary><p>${spanEd('datos.grupos.' + p.id + '.composicion', p.composicion)}.</p>`);
  h('dl', { class: 'datos-prog' }, info,
    dato(`Var. real ${A_PREV}–${A_FIN}`, fPct(v), clase(v)) +
    dato(`Participación ${A_BASE}`, fPart(vals[I_BASE] / CLASIF[I_BASE] * 100)));
  graficoDetalle(det, { gasto: defGasto(p, color) }, 'gasto');
}

// ---------------------------------------------------------------------------
// Tema, logos, menú activo y redibujado
// ---------------------------------------------------------------------------
function logos() {
  const oscuro = document.body.classList.contains('oscuro');
  document.querySelectorAll('img.logo-fundar').forEach(img => { img.src = LOGOS[oscuro ? 'fundar_blanco' : 'fundar_negro']; });
  document.querySelectorAll('img.logo-cias').forEach(img => { img.src = LOGOS.cias; });
}
function tema() {
  let guardado = null;
  try { guardado = localStorage.getItem('cias-tema'); } catch (e) { /* sin almacenamiento */ }
  if (guardado === 'oscuro') document.body.classList.add('oscuro');
  const bt = $('#sw-tema');
  const etiqueta = () => {
    const o = document.body.classList.contains('oscuro');
    bt.setAttribute('aria-label', o ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    bt.title = o ? 'Modo claro' : 'Modo oscuro';
  };
  etiqueta();
  bt.onclick = () => {
    const o = document.body.classList.toggle('oscuro');
    try { localStorage.setItem('cias-tema', o ? 'oscuro' : 'claro'); } catch (e) { /* sin almacenamiento */ }
    etiqueta(); logos(); redibujarTodo(true);
  };
}
function redibujarTodo(todo) {
  REDIBUJAR = REDIBUJAR.filter(r => r.el.isConnected);
  REDIBUJAR.forEach(r => r.fn());
  if (todo) { // los colores de las líneas mínimas dependen del tema
    const y = scrollY, listas = [$('#lista-prog'), $('#lista-pob')];
    listas.forEach(l => { l.style.minHeight = l.offsetHeight + 'px'; });
    seccionProgramas(); seccionPoblacion();
    listas.forEach(l => { l.style.minHeight = ''; });
    scrollTo({ top: y, behavior: 'instant' });
  }
}

// ---------------------------------------------------------------------------
// Modo edición (index.html?editar): clic en un texto marcado para cambiarlo. Los cambios se guardan en
// el navegador hasta descargarlos como datos/textos_editados.js.
// ---------------------------------------------------------------------------
function aplicarTextosFijos() {
  document.querySelectorAll('[data-editable]').forEach(el => {
    const k = el.dataset.editable;
    if (!k.startsWith('datos.') && k in TXT && !el.closest('#notas-metodo')) el.textContent = TXT[k];
  });
}
function modoEdicion() {
  if (!EDITAR) return;
  document.body.classList.add('editando');
  const guardarLocal = () => { try { localStorage.setItem(LS_TEXTOS, JSON.stringify(TXT_LOCAL)); } catch (e) { aviso('El navegador no permite guardar los cambios'); } };
  const barra = h('div', { class: 'barra-edicion', role: 'region', 'aria-label': 'Modo edición' }, document.body, `
    <span class="be-txt"><b>Modo edición.</b> Hacé clic en un texto marcado para cambiarlo. <span class="be-cuenta"></span></span>
    <span class="be-acts">
      <button type="button" class="btn" data-acc="descartar">Descartar cambios</button>
      <button type="button" class="btn btn-primario" data-acc="descargar">Descargar cambios</button>
    </span>`);
  const pendientes = () => Object.keys(TXT_LOCAL).length;
  const cuenta = () => {
    const n = pendientes();
    barra.querySelector('.be-cuenta').textContent = n ? `${n} ${n === 1 ? 'cambio' : 'cambios'} sin descargar.` : 'No hay cambios sin descargar.';
  };
  cuenta();

  // Ventana para editar un texto
  const dlg = h('dialog', { class: 'dlg-edicion' }, document.body, `
    <form method="dialog">
      <label for="dlg-texto">Texto</label>
      <textarea id="dlg-texto" rows="4"></textarea>
      <p class="dlg-clave"></p>
      <div class="dlg-acts">
        <button type="button" class="btn" data-acc="original">Volver al original</button>
        <span></span>
        <button type="button" class="btn" data-acc="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-primario" value="guardar">Guardar</button>
      </div>
    </form>`);
  const area = dlg.querySelector('textarea');
  let clave = null;
  const abrir = el => {
    clave = el.dataset.editable;
    area.value = el.classList.contains('nota-vacia') ? '' : (clave in TXT ? TXT[clave] : el.textContent.trim());
    dlg.querySelector('.dlg-clave').textContent = 'Clave: ' + clave;
    dlg.showModal();
    area.focus();
  };
  const guardar = valor => {
    TXT_LOCAL[clave] = valor; guardarLocal();
    if (valor == null) { location.reload(); return; }
    TXT[clave] = valor;
    if (clave.startsWith('datos.')) aplicarDato(clave, valor);
    document.querySelectorAll(`[data-editable="${CSS.escape(clave)}"]`).forEach(e => { if (!e.classList.contains('nota-vacia')) e.textContent = valor; });
    redibujarTodo(true);
    cuenta();
  };
  // Se guarda al apretar Guardar (o Ctrl+Enter), sin esperar el evento de cierre de la ventana
  const confirmar = () => { const v = area.value.trim(); dlg.close(); guardar(v); };
  dlg.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); confirmar(); });
  dlg.querySelector('[data-acc=cancelar]').onclick = () => dlg.close();
  dlg.querySelector('[data-acc=original]').onclick = () => { dlg.close(); guardar(null); };
  area.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); confirmar(); } });

  // Clic en cualquier texto editable (antes que botones, desplegables y enlaces)
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-editable]');
    if (!el || ev.target.closest('.barra-edicion, .dlg-edicion')) return;
    ev.preventDefault(); ev.stopPropagation();
    abrir(el);
  }, true);

  barra.querySelector('[data-acc=descargar]').onclick = () => {
    const todo = Object.assign({}, window.TEXTOS_EDITADOS || {}, TXT_LOCAL);
    const limpio = {};
    Object.keys(todo).sort().forEach(k => { if (todo[k] != null) limpio[k] = todo[k]; });
    const js = '/* Textos editados desde el modo edición del tablero (index.html?editar).\n' +
      '   Este archivo lo genera el botón "Descargar cambios": reemplazarlo por el descargado.\n' +
      '   Cada clave es un texto del tablero; si se borra una línea, vuelve el texto original. */\n' +
      'window.TEXTOS_EDITADOS = ' + JSON.stringify(limpio, null, 2) + ';\n';
    bajar(new Blob([js], { type: 'text/javascript;charset=utf-8' }), 'textos_editados.js');
    aviso('Guardalo en la carpeta datos/ del tablero, reemplazando el anterior');
  };
  barra.querySelector('[data-acc=descartar]').onclick = () => {
    if (!pendientes()) return aviso('No hay cambios sin descargar');
    if (!confirm('¿Descartar los cambios que todavía no descargaste?')) return;
    TXT_LOCAL = {}; guardarLocal(); location.reload();
  };
}
// ---------------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------------
tema();
logos();
textosFijos();
aplicarTextosFijos();
seccionResumen();
seccionGraficos();
seccionGobiernos();
seccionCobertura();
seccionProgramas();
seccionPoblacion();
vistas();
modoEdicion();

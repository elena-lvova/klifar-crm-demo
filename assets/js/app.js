(function () {
  const DB = window.DB, AM = window.AUDIO_META;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');

  // ---------- helpers ----------
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/\u202f/g, '\u00a0');
  const pct = (x, d = 1) => (isFinite(x) ? (x * 100).toFixed(d).replace('.', ',') : '0') + '%';
  const p2 = n => String(n).padStart(2, '0');
  const dstr = d => `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`;
  const tstr = d => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const mmss = s => `${Math.floor(s / 60)}:${p2(Math.round(s % 60))}`;
  const minsec = s => `${Math.floor(s / 60)} мин ${Math.round(s % 60)} с`;
  const MON = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const MON1 = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];
  const MONG = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
  const isoWeek = d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 86400000 + 1) / 7); };
  const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const toInput = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

  const P = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    video: '<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    play: '<path d="M6 4v16l14-8z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" stroke="none"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    sync: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  };
  const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const qm = tip => `<span class="qm" data-tip="${esc(tip)}">?</span>`;

  // ---------- state ----------
  const allCities = DB.CITIES;
  const S = {
    auth: false,
    dash: { cities: [], segs: [], mode: 'month', hidden: {} },
    vis: { period: 'w2', from: new Date(2025, 2, 1), to: new Date(2025, 4, 31), cities: [], op: 'all', wave: '2', spec: 'neuro', page: 1, q: '', open: null, showAllOps: false },
    docs: { q: '', cities: [], seg: 'all', stage: 'all', consent: 'all', crm: 'all', sort: 'score', dir: -1, page: 1 },
    surv: { wave: 'all', seg: 'all', cities: [] },
    chan: { tab: 'email' },
    hist: { filter: 'all', view: 'act', sel: null },
    planned: {},
    notif: [
      { id: 1, unread: true, ic: 'sync', c: 'c-green', t: 'Синхронизация с CRM клиента', s: 'Передано 1 284 события, 37 новых совпадений · 18.12.2025, 06:00', go: '#/doctors?crm=match' },
      { id: 2, unread: true, ic: 'phone', c: 'c-blue', t: 'Волна 4: выполнено 96% плана визитов', s: 'Осталось 3 рабочих дня до закрытия волны · 18.12.2025', go: '#/visits?wave=4' },
      { id: 3, unread: true, ic: 'file', c: 'c-amber', t: 'Отчёт за ноябрь сформирован', s: 'Сводный отчёт по проекту готов к выгрузке · 02.12.2025', go: '#/reports' },
      { id: 4, unread: false, ic: 'video', c: 'c-pink', t: 'Вебинар 20.11: 912 участников', s: 'Запись опубликована на лендинге · 21.11.2025', go: '#/channels?tab=webinars' },
    ],
    exports: [
      { name: 'Сводный отчёт по проекту — ноябрь 2025', fmt: 'CSV', who: 'Система', at: '02.12.2025 07:00', size: '1,2 МБ' },
      { name: 'Врачи с согласием на передачу контактов', fmt: 'CSV', who: 'demo@client', at: '28.11.2025 15:42', size: '486 КБ' },
      { name: 'Визиты и опросы · волна 3', fmt: 'CSV', who: 'demo@client', at: '20.10.2025 11:08', size: '2,4 МБ' },
    ],
  };
  (() => {
    const w4 = DB.visits.filter(v => v.wave === 4 && v.status === 'done').length;
    S.notif[1].t = `Волна 4: выполнено ${Math.round(w4 / 6400 * 100)}% плана визитов`;
    S.notif[3].t = `Вебинар 20.11: ${fmt(DB.doctors.filter(d => d.webinars[3] && !d.webRec[3]).length)} участников эфира`;
  })();

  // ---------- charts registry ----------
  const charts = [];
  const killCharts = () => { while (charts.length) charts.pop().destroy(); };
  if (window.Chart) {
    Chart.defaults.font.family = 'Rubik, system-ui, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#667085';
  }

  // ---------- audio ----------
  const audio = new Audio(); audio.preload = 'none';
  let cur = null; // {key, vid, el}
  function playVisit(v, onTick) {
    const src = `assets/audio/${v.audio}.mp3`;
    if (cur && cur.vid === v.id) { if (audio.paused) audio.play(); else audio.pause(); syncPlayers(); return; }
    audio.src = src; audio.currentTime = 0; cur = { vid: v.id }; audio.play().catch(() => {}); syncPlayers();
  }
  function syncPlayers() {
    $$('[data-play]').forEach(b => {
      const on = cur && +b.dataset.play === cur.vid && !audio.paused;
      b.classList.toggle('on', on);
      b.innerHTML = ic(on ? 'pause' : 'play');
    });
    $$('[data-prog]').forEach(w => {
      const vid = +w.dataset.prog;
      const isCur = cur && cur.vid === vid;
      const v = VMAP[vid]; const A = AM[v.audio] || v.dur; const tot = v.dur;
      const frac = isCur ? Math.min(1, audio.currentTime / A) : 0; const t = frac * tot;
      const bars = $$('i', w);
      if (bars.length) { const k = Math.round(frac * bars.length); bars.forEach((b, i) => b.classList.toggle('p', i < k)); }
      const fill = $('i.fill', w); if (fill) fill.style.width = (frac * 100) + '%';
      const tt = $(`[data-ptime="${vid}"]`); if (tt) tt.textContent = `${mmss(t)} / ${mmss(tot)}`;
    });
  }
  audio.addEventListener('timeupdate', syncPlayers);
  audio.addEventListener('ended', () => { audio.currentTime = 0; syncPlayers(); });
  audio.addEventListener('pause', syncPlayers);
  const VMAP = Object.fromEntries(DB.visits.map(v => [v.id, v]));
  function waveBars(seed, n = 64) {
    const r = DB.rng(seed + 7); let out = '';
    for (let i = 0; i < n; i++) { const h = 18 + Math.round((Math.sin(i / 3 + seed) * 0.35 + r() * 0.75) * 70); out += `<i style="height:${Math.max(14, Math.min(100, h))}%"></i>`; }
    return out;
  }

  // ---------- tooltips ----------
  let tipEl = null;
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]'); if (!t) return;
    tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.textContent = t.dataset.tip; document.body.appendChild(tipEl);
    const r = t.getBoundingClientRect(); const w = tipEl.offsetWidth;
    tipEl.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    tipEl.style.top = (r.top - tipEl.offsetHeight - 8 < 8 ? r.bottom + 8 : r.top - tipEl.offsetHeight - 8) + 'px';
  });
  document.addEventListener('mouseout', e => { if (tipEl && e.target.closest('[data-tip]')) { tipEl.remove(); tipEl = null; } });

  // ---------- toasts / modal ----------
  function toast(t, s = '') {
    let w = $('.toast-w'); if (!w) { w = document.createElement('div'); w.className = 'toast-w'; document.body.appendChild(w); }
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<div class="ti">${ic('check', 'sm')}</div><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div>`;
    w.appendChild(el); setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3600);
  }
  function modal(html, onMount, cls = '') {
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.innerHTML = `<div class="modal ${cls}">${html}</div>`;
    document.body.appendChild(bg);
    const close = () => bg.remove();
    bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
    onMount && onMount(bg, close);
  }

  // ---------- CSV ----------
  function downloadCSV(name, rows) {
    const csv = '\ufeff' + rows.map(r => r.map(c => { const s = c == null ? '' : String(c); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(';')).join('\r\n');
    const b = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.rel = 'noopener'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    return (b.size / 1024);
  }

  // ---------- dropdown components ----------
  // multi-select of cities
  function citySel(key, selected, label = 'Все регионы') {
    const txt = !selected.length ? `${label} (${allCities.length} городов)` : selected.length <= 3 ? selected.join(', ') : `${selected.slice(0, 3).join(', ')} +${selected.length - 3}`;
    return `<div class="sel" data-sel="${key}"><button class="sel-btn" data-toggle><span>${esc(txt)}</span>${ic('chev', 'sm')}</button>
      <div class="pop" style="min-width:300px"><div class="sel-search"><div class="search-box">${ic('search', 'sm')}<input class="inp" data-csearch placeholder="Найти город" style="height:34px"></div></div>
      <div class="opt ${!selected.length ? 'on' : ''}" data-city="*"><span class="cb"></span>Все регионы</div>
      ${allCities.map(c => `<div class="opt ${selected.includes(c) ? 'on' : ''}" data-city="${esc(c)}"><span class="cb"></span>${esc(c)}<span class="sp"></span><small class="muted">${fmt(cityCount[c])}</small></div>`).join('')}</div></div>`;
  }
  const cityCount = {}; DB.doctors.forEach(d => (cityCount[d.city] = (cityCount[d.city] || 0) + 1));
  function simpleSel(key, value, options, width) {
    const cur = options.find(o => o[0] === value) || options[0];
    return `<div class="sel" data-sel="${key}"><button class="sel-btn" data-toggle style="${width ? `width:${width}px` : ''}"><span>${esc(cur[1])}</span>${ic('chev', 'sm')}</button>
      <div class="pop">${options.map(o => `<div class="opt ${o[0] === value ? 'on' : ''}" data-val="${esc(o[0])}">${esc(o[1])}${o[2] ? `<span class="sp"></span><small class="muted">${o[2]}</small>` : ''}</div>`).join('')}</div></div>`;
  }
  document.addEventListener('click', e => {
    const tg = e.target.closest('[data-toggle]');
    const openPops = $$('.pop.open');
    if (tg) {
      const pop = tg.parentElement.querySelector('.pop');
      openPops.forEach(p => p !== pop && !p.contains(tg) && p.classList.remove('open'));
      pop.classList.toggle('open'); const s = $('[data-csearch]', pop); if (s) setTimeout(() => s.focus(), 30);
      e.stopPropagation(); return;
    }
    openPops.forEach(p => { if (!p.contains(e.target)) p.classList.remove('open'); });
  });
  document.addEventListener('input', e => {
    if (e.target.matches('[data-csearch]')) {
      const q = e.target.value.toLowerCase();
      $$('[data-city]', e.target.closest('.pop')).forEach(o => { o.style.display = o.dataset.city === '*' || o.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    }
  });
  function bindCitySel(root, key, arr, onChange) {
    const el = $(`[data-sel="${key}"]`, root); if (!el) return;
    el.addEventListener('click', e => {
      const o = e.target.closest('[data-city]'); if (!o) return; e.stopPropagation();
      const c = o.dataset.city;
      if (c === '*') arr.length = 0; else { const i = arr.indexOf(c); if (i >= 0) arr.splice(i, 1); else arr.push(c); }
      $$('[data-city]', el).forEach(x => x.classList.toggle('on', x.dataset.city === '*' ? !arr.length : arr.includes(x.dataset.city)));
      const txt = !arr.length ? `Все регионы (${allCities.length} городов)` : arr.length <= 3 ? arr.join(', ') : `${arr.slice(0, 3).join(', ')} +${arr.length - 3}`;
      $('.sel-btn span', el).textContent = txt;
      onChange && onChange();
    });
  }
  function bindSimpleSel(root, key, onPick) {
    const el = $(`[data-sel="${key}"]`, root); if (!el) return;
    el.addEventListener('click', e => {
      const o = e.target.closest('[data-val]'); if (!o) return;
      $$('[data-val]', el).forEach(x => x.classList.toggle('on', x === o));
      $('.sel-btn span', el).textContent = o.childNodes[0].textContent;
      $('.pop', el).classList.remove('open');
      onPick(o.dataset.val);
    });
  }

  // ---------- header ----------
  const NAV = [
    ['dashboard', 'Дэшборд', 'chart'], ['visits', 'Удалённые визиты', 'phone'], ['surveys', 'Опросы', 'list'],
    ['doctors', 'Врачи проекта', 'users'], ['channels', 'Каналы', 'layers'], ['reports', 'Отчёты', 'dl'],
  ];
  function header(active) {
    const unread = S.notif.filter(n => n.unread).length;
    return `<header class="hdr">
      <a class="logo" href="#/dashboard" aria-label="Клифар CRM"><img src="assets/logo.png" alt="Клифар CRM"></a>
      <nav class="nav">${NAV.map(n => `<a href="#/${n[0]}" class="${active === n[0] ? 'on' : ''}">${ic(n[2])}${n[1]}</a>`).join('')}</nav>
      <div class="hdr-r">
        <span class="acct">Личный кабинет клиента · <b>StopVertigo 2025</b></span>
        <span class="demo-pill" data-tip="Демонстрационный аккаунт: данные врачей обезличены и сгенерированы для показа функциональности">Демо</span>
        <div style="position:relative"><button class="ibtn" data-toggle aria-label="Уведомления">${ic('bell', 'lg')}${unread ? `<span class="dot">${unread}</span>` : ''}</button>
          <div class="pop notif"><h4>Уведомления <button class="link" data-act="readall">Отметить все прочитанными</button></h4>
          ${S.notif.map(n => `<div class="ni ${n.unread ? 'unread' : ''}" data-notif="${n.id}"><div class="ic ${n.c}">${ic(n.ic, 'sm')}</div><div><b>${n.t}</b><small>${n.s}</small></div></div>`).join('')}</div></div>
        <div style="position:relative"><button class="ibtn user-btn" data-toggle aria-label="Профиль">${ic('user', 'lg')}</button>
          <div class="pop"><div class="menu-h"><b>Демо-аккаунт клиента</b><small>demo@stopvertigo-client.ru · роль «Бренд-менеджер»</small></div>
            <div class="menu-i" data-act="profile">${ic('user', 'sm')}Профиль и доступы</div>
            <div class="menu-i" data-act="notifset">${ic('bell', 'sm')}Настройки уведомлений</div>
            <div class="menu-i" data-act="logout">${ic('logout', 'sm')}Выйти</div></div></div>
      </div></header>`;
  }
  function bindHeader() {
    $$('[data-notif]').forEach(el => el.addEventListener('click', () => {
      const n = S.notif.find(x => x.id === +el.dataset.notif); n.unread = false; location.hash = n.go;
    }));
    const ra = $('[data-act="readall"]'); ra && ra.addEventListener('click', e => { e.stopPropagation(); S.notif.forEach(n => (n.unread = false)); render(); });
    const lo = $('[data-act="logout"]'); lo && lo.addEventListener('click', () => { S.auth = false; audio.pause(); location.hash = '#/login'; });
    const pr = $('[data-act="profile"]'); pr && pr.addEventListener('click', () => modal(`<div class="mh"><h3>Профиль и доступы</h3><button class="ibtn" data-close>${ic('x')}</button></div>
      <div class="mb"><div class="mini" style="margin-bottom:10px"><div class="l">Пользователь</div><div class="v">demo@stopvertigo-client.ru</div></div>
      <div class="mini" style="margin-bottom:10px"><div class="l">Роль</div><div class="v">Бренд-менеджер · чтение и выгрузка</div></div>
      <div class="mini"><div class="l">Доступные проекты</div><div class="v">StopVertigo 2025</div></div>
      <p class="muted" style="font-size:13px">Персональные данные врачей отображаются в маскированном виде. Полные контакты доступны только для врачей, давших согласие на передачу.</p></div>
      <div class="mf"><button class="btn" data-close>Закрыть</button></div>`));
    const ns = $('[data-act="notifset"]'); ns && ns.addEventListener('click', () => modal(`<div class="mh"><h3>Настройки уведомлений</h3><button class="ibtn" data-close>${ic('x')}</button></div>
      <div class="mb">${['Закрытие волны визитов', 'Синхронизация с CRM клиента', 'Готовность ежемесячного отчёта', 'Итоги вебинаров'].map((t, i) => `<label class="opt on" style="padding-left:0"><input type="checkbox" checked style="accent-color:#2563eb;width:16px;height:16px"> ${t}</label>`).join('')}</div>
      <div class="mf"><button class="btn" data-close>Отмена</button><button class="btn pri" data-close onclick="">Сохранить</button></div>`, (bg) => { $$('.btn.pri', bg).forEach(b => b.addEventListener('click', () => toast('Настройки сохранены'))); }));
  }

  // ---------- filtering ----------
  const docFilter = (cities, segs) => d => (!cities.length || cities.includes(d.city)) && (!segs || !segs.length || segs.includes(d.seg));

  // ======================================================================
  // LOGIN
  // ======================================================================
  function vLogin() {
    const gD = DB.visits.filter(v => v.status === 'done').length / 25600, gQ = DB.doctors.filter(d => d.quality >= 1).length / DB.doctors.length, gC = DB.doctors.filter(d => d.crm).length / DB.doctors.filter(d => d.consentTransfer).length;
    app.innerHTML = `<div class="login fade">
      <div class="l"><a class="logo"><img src="assets/logo.png" alt="Клифар CRM" style="height:46px"></a>
        <form id="lf"><h1>Вход в личный кабинет</h1><p>Аналитика омниканальных проектов для клиентов ГК «Ремедиум»</p>
          <div class="fld"><label>Email</label><input class="inp" id="em" value="demo@stopvertigo-client.ru" autocomplete="username"></div>
          <div class="fld"><label>Пароль</label><input class="inp" id="pw" type="password" value="demo-2025-sv" autocomplete="current-password"></div>
          <div class="row-flex" style="justify-content:space-between;margin:4px 0 18px;font-size:13px"><label class="row-flex" style="gap:8px"><input type="checkbox" checked style="accent-color:#2563eb"> Запомнить устройство</label><a class="link">Забыли пароль?</a></div>
          <button class="btn pri" style="width:100%;justify-content:center;height:44px" id="lb">Войти</button>
          <div class="row-flex muted" style="margin-top:18px;font-size:12.5px">${ic('lock', 'sm')} Защищённое соединение · двухфакторная аутентификация для рабочих аккаунтов</div>
        </form>
        <div class="muted" style="font-size:12.5px">© 2025 Клифар CRM · ГК «Ремедиум»</div></div>
      <div class="r">
        <div class="glass"><div style="font-weight:600;margin-bottom:6px">StopVertigo 2025 · итог года</div>
          <div class="row"><span>Удалённые визиты</span><b>${pct(gD)} плана</b></div><div class="bar"><i style="width:${gD * 100}%"></i></div>
          <div class="row"><span>Охват целевых неврологов</span><b>${pct(gQ)}</b></div><div class="bar"><i style="width:${gQ * 100}%"></i></div>
          <div class="row"><span>Сопоставлено с CRM клиента</span><b>${pct(gC)}</b></div><div class="bar"><i style="width:${gC * 100}%"></i></div></div>
        <h2>Каждый контакт с врачом — в одной истории</h2>
        <p>Удалённые визиты с записью и опросом, рассылки, вебинары и лендинг проекта сводятся в карточку врача и передаются в CRM клиента.</p>
        <div class="lstats"><div><b>14 200</b><small>целевых неврологов</small></div><div><b>4 волны</b><small>удалённых визитов</small></div><div><b>6 каналов</b><small>в едином профиле</small></div></div>
      </div></div>`;
    $('#lf').addEventListener('submit', e => {
      e.preventDefault(); const b = $('#lb'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Вход…';
      setTimeout(() => { S.auth = true; location.hash = '#/dashboard'; }, 700);
    });
  }

  // ======================================================================
  // DASHBOARD
  // ======================================================================
  function dashData() {
    const f = docFilter(S.dash.cities, S.dash.segs);
    const docs = DB.doctors.filter(f); const set = new Set(docs);
    const vis = DB.visits.filter(v => set.has(v.doc));
    const done = vis.filter(v => v.status === 'done');
    const cohortAll = DB.doctors.filter(d => d.cohort).length, cohortF = docs.filter(d => d.cohort).length;
    const share = cohortF / cohortAll;
    const sent = docs.reduce((s, d) => s + d.emailsSent, 0), opens = docs.reduce((s, d) => s + d.opens, 0), clicks = docs.reduce((s, d) => s + d.clicks, 0);
    const webP = docs.reduce((s, d) => s + d.nWeb, 0), webMin = docs.reduce((s, d) => s + d.webMin.reduce((a, b) => a + b, 0), 0);
    const land = docs.reduce((s, d) => s + d.landing, 0), landDocs = docs.filter(d => d.landing).length;
    const totalClicks = DB.EMAILS.reduce((s, e) => s + e.clicks, 0);
    const months = Array.from({ length: 12 }, () => ({ v: 0, c: 0, w: 0, l: 0 }));
    done.forEach(v => months[v.date.getMonth()].v++);
    DB.EMAILS.forEach(e => (months[e.date.getMonth()].c += e.clicks * (clicks / totalClicks)));
    docs.forEach(d => d.webinars.forEach((x, i) => { if (x) months[DB.WEBINARS[i].date.getMonth()].w++; }));
    DB.LAND_PROFILE.forEach((p, i) => (months[i].l = land * p));
    const weeks = {};
    done.forEach(v => { const w = isoWeek(v.date); weeks[w] = (weeks[w] || 0) + 1; });
    const matViews = {}; const matDocs = {};
    docs.forEach(d => d.mats.forEach(m => { matDocs[m] = (matDocs[m] || 0) + 1; matViews[m] = (matViews[m] || 0) + Math.max(1, Math.round(d.landing / d.mats.length)); }));
    return {
      docs, vis, done, share, sent, opens, clicks, webP, webMin, land, landDocs, months, weeks, matViews, matDocs,
      avgDur: done.reduce((s, v) => s + v.dur, 0) / (done.length || 1),
      any: docs.filter(d => d.anyContact).length, q1: docs.filter(d => d.quality >= 1).length, q3: docs.filter(d => d.quality >= 3).length, core: docs.filter(d => d.quality >= 5).length,
      consent: docs.filter(d => d.consentTransfer).length, target: done.filter(v => v.target).length,
      coreScore: (() => { const c = docs.filter(d => d.quality >= 5); return c.reduce((s, d) => s + d.score, 0) / (c.length || 1); })(),
    };
  }
  function vDashboard() {
    const X = dashData();
    const planV = Math.round(25600 * X.share), planWeb = Math.round(3000 * (X.docs.length / DB.doctors.length));
    const segTxt = S.dash.segs.length ? 'сегмент ' + S.dash.segs.join(', ') : 'все сегменты';
    const geoTxt = !S.dash.cities.length ? 'все регионы' : S.dash.cities.length <= 2 ? S.dash.cities.join(', ') : `${S.dash.cities.length} ${plural(S.dash.cities.length, 'город', 'города', 'городов')}`;
    const kpi = (t, s, v, foot, icn, cls, tip, go) => `<div class="card kpi" data-go="${go}"><div class="k-t">${t}</div><div class="k-s">${s}</div><div class="badge-ic ${cls}">${ic(icn, 'lg')}</div><div class="k-v num">${v}</div><div class="k-f">${foot}</div>${qm(tip)}</div>`;
    const mats = DB.MATERIALS.map(m => ({ ...m, views: X.matViews[m.id] || 0 })).sort((a, b) => b.views - a.views).slice(0, 5);
    const dash = `${header('dashboard')}<main class="main fade">
      <div class="crumbs"><span class="t">Аналитика · Омниканальный проект StopVertigo</span>
        <div class="r" style="position:relative"><span class="muted">Неврологи · 2025 · ${geoTxt} · ${segTxt}</span>
          <button class="ibtn" data-toggle style="width:30px;height:30px" aria-label="Фильтр">${ic('filter')}</button>
          <div class="pop" style="width:340px;padding:14px">
            <div class="fld" style="margin-bottom:12px"><label>География</label>${citySel('dcity', S.dash.cities)}</div>
            <div class="fld" style="margin-bottom:14px"><label>Сегмент врачей</label><div class="chips">${['A', 'B', 'C'].map(s => `<button class="chip ${S.dash.segs.includes(s) ? 'on' : ''}" data-dseg="${s}">Сегмент ${s}</button>`).join('')}</div></div>
            <div class="row-flex"><button class="btn sm" data-act="dreset">Сбросить</button><span class="sp"></span><button class="btn pri sm" data-act="dapply">Применить</button></div></div></div></div>
      <div class="grid g6" id="kpis">
        ${kpi('Период проекта', '', '12 месяцев', '<b>13.01.2025 – 26.12.2025</b>', 'cal', 'c-red', 'Период активной коммуникации с врачами. Данные обновляются ежедневно в 06:00 МСК.', '#/reports')}
        ${kpi('Удалённые визиты', 'завершено', fmt(X.done.length), `<b>${pct(X.done.length / planV)}</b> плана · ${minsec(X.avgDur)}`, 'phone', 'c-blue', 'Состоявшиеся разговоры с врачом по сценарию волны. Недозвоны, отказы и прерванные разговоры не учитываются.', '#/visits?wave=all')}
        ${kpi('Email-рассылки', 'отправлено', fmt(X.sent), `OR <b>${pct(X.opens / X.sent)}</b> · CTR <b>${pct(X.clicks / X.sent)}</b>`, 'mail', 'c-amber', 'OR — доля открытий от отправленных писем, CTR — доля кликов от отправленных. 24 волны рассылок.', '#/channels?tab=email')}
        ${kpi('Вебинары', '4 эфира + записи', fmt(X.webP), `участников · <b>${Math.round(X.webMin / (X.webP || 1))} мин</b> в среднем`, 'video', 'c-pink', 'Уникальные участники каждого вебинара: в прямом эфире и при просмотре записи на лендинге. Время — среднее время просмотра на участника, эфир и запись вместе.', '#/channels?tab=webinars')}
        ${kpi('Лендинг проекта', 'визитов', fmt(X.land), `<b>${fmt(X.landDocs)}</b> врачей · 3 мин 40 с`, 'globe', 'c-violet', 'Визиты идентифицированных врачей на лендинг проекта (переходы из писем, SMS и после визита).', '#/channels?tab=landing')}
        ${kpi('Неврологи', 'охвачено целевых', pct(X.q1 / X.docs.length), `всего <b>${fmt(X.docs.length)}</b> · согласий <b>${fmt(X.consent)}</b>`, 'users', 'c-green', 'Доля целевых неврологов, у которых был хотя бы один качественный контакт: визит, вебинар или материал на лендинге.', '#/doctors')}
      </div>
      <div class="grid mt" style="grid-template-columns:1.62fr 1fr">
        <div class="card"><div class="card-h"><h3>Активность по каналам <span class="seg" style="margin-left:8px">${[['month', 'по месяцам'], ['week', 'по неделям']].map(m => `<button class="${S.dash.mode === m[0] ? 'on' : ''}" data-mode="${m[0]}">${m[1]}</button>`).join('')}</span></h3>${qm('Нажмите на элемент легенды, чтобы скрыть или показать канал.')}</div>
          <div style="height:250px"><canvas id="chAct"></canvas></div>
          <div class="legend" id="legAct"></div></div>
        <div class="card"><h3>Воронка вовлечения врачей</h3><div class="sub">уникальные неврологи, баллы по весам контактов · нажмите на этап, чтобы открыть список</div>
          <div class="funnel" style="margin-top:12px">
          ${[['Целевые неврологи', X.docs.length, '#2f6bea', 'all'], ['Хотя бы 1 контакт', X.any, '#3b7bf0', 'any'], ['Качественный контакт', X.q1, '#5a92f3', 'q1'], ['3+ качественных', X.q3, '#86aef6', 'q3'], ['Ядро: 5+ контактов', X.core, '#22b45e', 'core']].map(r => `<div class="row" data-go="#/doctors?stage=${r[3]}"><div class="lbl">${r[0]}</div><div class="tr"><div class="fl num" style="width:${Math.max(8, r[1] / X.docs.length * 100)}%;background:${r[2]}">${fmt(r[1])}</div></div></div>`).join('')}
          </div>
          <div class="grid g2 mt"><div class="mini"><div class="l">Целевых действий после визита</div><div class="v num">${fmt(X.target)} · <span class="g">${pct(X.target / (X.done.length || 1))}</span></div></div>
          <div class="mini"><div class="l">Средний балл ядра</div><div class="v num">${X.coreScore.toFixed(1).replace('.', ',')}</div></div></div></div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><div class="card-h"><h3>Материалы лендинга: топ-5</h3><button class="link" data-go="#/channels?tab=landing">Все материалы →</button></div>
          <table><thead><tr><th>Материал</th><th>Тип</th><th class="r">Просмотры</th><th class="r">Время</th></tr></thead><tbody>
          ${mats.map(m => `<tr class="click" data-go="#/channels?tab=landing"><td style="font-weight:500">${esc(m.title)}</td><td><span class="tag">${m.type}</span></td><td class="r num">${fmt(m.views)}</td><td class="r num">${m.time}</td></tr>`).join('')}</tbody></table></div>
        <div class="card"><h3>Выполнение промоплана</h3>
          <table style="margin-top:10px"><thead><tr><th>Событие</th><th>План</th><th>Факт</th><th style="width:44%">Процент выполнения</th></tr></thead><tbody>
          ${[['Удалённые визиты', planV, X.done.length], ['Email-волны', 24, 24], ['Участники вебинаров', planWeb, X.webP], ['Клинические разборы', 6, 5]].map(r => { const f = r[2] / r[1]; return `<tr><td>${r[0]}</td><td class="num">${fmt(r[1])}</td><td class="num">${fmt(r[2])}</td><td><div class="plan-bar"><i style="width:${Math.min(100, f * 100)}%"></i></div><div class="plan-leg"><span>Fact (${Math.round(f * 100)}%)</span><span>G-plan (${Math.max(0, 100 - Math.round(f * 100))}%)</span></div></td></tr>`; }).join('')}
          </tbody></table></div>
      </div>${footer()}</main>`;
    app.innerHTML = dash; bindHeader(); bindGo();
    bindCitySel(app, 'dcity', S.dash.cities);
    $$('[data-dseg]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const s = b.dataset.dseg; const i = S.dash.segs.indexOf(s); i >= 0 ? S.dash.segs.splice(i, 1) : S.dash.segs.push(s); b.classList.toggle('on'); }));
    $('[data-act="dapply"]').addEventListener('click', () => reloadWith(vDashboard));
    $('[data-act="dreset"]').addEventListener('click', () => { S.dash.cities = []; S.dash.segs = []; reloadWith(vDashboard); });
    $$('[data-mode]').forEach(b => b.addEventListener('click', () => { S.dash.mode = b.dataset.mode; vDashboard(); }));
    drawAct(X);
  }
  function drawAct(X) {
    const ds = [['v', 'Удалённые визиты', '#3d7ab8'], ['c', 'Клики в рассылках', '#4b9b98'], ['w', 'Участники вебинаров', '#de6fd1'], ['l', 'Визиты на лендинг', '#8b5cf6']];
    let labels, data;
    if (S.dash.mode === 'month') { labels = MON; data = ds.map(d => X.months.map(m => Math.round(m[d[0]]))); }
    else {
      const wk = Array.from({ length: 52 }, (_, i) => i + 1); labels = wk.map(String);
      data = ds.map(d => wk.map(w => {
        if (d[0] === 'v') return X.weeks[w] || 0;
        const mi = Math.min(11, Math.floor((w - 1) / 4.345)); const m = X.months[mi];
        if (d[0] === 'w') { const hit = DB.WEBINARS.findIndex(x => isoWeek(x.date) === w); return hit >= 0 ? X.docs.filter(dd => dd.webinars[hit]).length : 0; }
        return Math.round(m[d[0]] / 4.345 * (0.85 + ((w * 37) % 11) / 30));
      }));
    }
    killCharts();
    const c = new Chart($('#chAct'), {
      type: 'bar',
      data: { labels, datasets: ds.map((d, i) => ({ label: d[1], data: data[i], backgroundColor: d[2], borderRadius: 2, barPercentage: 0.9, categoryPercentage: S.dash.mode === 'month' ? 0.62 : 0.9, hidden: !!S.dash.hidden[d[0]] })) },
      options: { maintainAspectRatio: false, animation: { duration: 500 }, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { title: it => S.dash.mode === 'month' ? MON[it[0].dataIndex] + ' 2025' : 'Неделя ' + it[0].label, label: it => ` ${it.dataset.label}: ${fmt(it.raw)}` } } },
        scales: { x: { grid: { display: false }, ticks: { autoSkip: S.dash.mode === 'week', maxTicksLimit: 26 } }, y: { grid: { color: '#eef1f5' }, border: { display: false }, ticks: { callback: v => fmt(v) } } } },
    });
    charts.push(c);
    $('#legAct').innerHTML = ds.map((d, i) => `<span data-leg="${d[0]}" class="${S.dash.hidden[d[0]] ? 'off' : ''}"><i style="background:${d[2]}"></i>${d[1]}</span>`).join('');
    $$('[data-leg]').forEach(el => el.addEventListener('click', () => { const k = el.dataset.leg; S.dash.hidden[k] = !S.dash.hidden[k]; const i = ds.findIndex(d => d[0] === k); c.setDatasetVisibility(i, !S.dash.hidden[k]); c.update(); el.classList.toggle('off'); }));
  }
  function reloadWith(fn) { const m = $('.main'); m && m.classList.add('loading'); setTimeout(() => fn(), 380); }
  function bindGo() { $$('[data-go]').forEach(el => el.addEventListener('click', e => { if (e.target.closest('[data-tip]') && !e.target.closest('.row')) return; location.hash = el.dataset.go; })); }
  const footer = () => `<div class="muted" style="font-size:12px;margin-top:22px;display:flex;justify-content:space-between"><span>© 2025 Клифар CRM · ГК «Ремедиум»</span><span>Данные на 26.12.2025, 06:00 МСК · последняя синхронизация с CRM клиента 18.12.2025</span></div>`;

  // ======================================================================
  // VISITS
  // ======================================================================
  const PERIODS = [
    ['all', 'Весь проект', new Date(2025, 0, 13), new Date(2025, 11, 26)],
    ['w1', '13.01.2025 – 14.03.2025', new Date(2025, 0, 13), new Date(2025, 2, 14)],
    ['w2', '01.03.2025 – 31.05.2025', new Date(2025, 2, 1), new Date(2025, 4, 31)],
    ['w3', '01.09.2025 – 17.10.2025', new Date(2025, 8, 1), new Date(2025, 9, 17)],
    ['w4', '03.11.2025 – 26.12.2025', new Date(2025, 10, 3), new Date(2025, 11, 26)],
    ['m11', 'Ноябрь 2025', new Date(2025, 10, 1), new Date(2025, 10, 30)],
    ['m12', 'Декабрь 2025', new Date(2025, 11, 1), new Date(2025, 11, 31)],
  ];
  const STATUS = {
    done_sc: ['Опрос, согласие', 'green'], done_s: ['Опрос', 'green'], done: ['Визит без опроса', 'blue'], callback: ['Перезвонить', 'amber'], refused: ['Отказ от визита', 'red'],
  };
  const vStatus = v => v.status === 'done' ? (v.survey ? (v.consent ? 'done_sc' : 'done_s') : 'done') : v.status;
  function visFiltered() {
    const F = S.vis; const to = new Date(F.to.getTime() + 86399999);
    return DB.visits.filter(v => v.date >= F.from && v.date <= to && (!F.cities.length || F.cities.includes(v.doc.city)) && (F.op === 'all' || v.op.id === +F.op) && (F.wave === 'all' || v.wave === +F.wave));
  }
  function vVisits() {
    const F = S.vis;
    const all = visFiltered();
    const done = all.filter(v => v.status === 'done');
    const plan = (() => {
      const waves = F.wave === 'all' ? [1, 2, 3, 4] : [+F.wave];
      const geoShare = F.cities.length ? DB.doctors.filter(d => d.cohort && F.cities.includes(d.city)).length / DB.doctors.filter(d => d.cohort).length : 1;
      const opShare = F.op === 'all' ? 1 : DB.visits.filter(v => v.op.id === +F.op).length / DB.visits.length;
      const to = new Date(F.to.getTime() + 86399999);
      let p = 0; waves.forEach(n => { const w = DB.WAVES[n - 1]; const ov = Math.max(0, Math.min(w.to, to) - Math.max(w.from, F.from)) / (w.to - w.from); p += w.plan * Math.min(1, ov * 1.0); });
      return Math.max(1, Math.round(p * geoShare * opShare));
    })();
    const rec = done.filter(v => v.rec).length, surv = done.filter(v => v.survey).length, cons = done.filter(v => v.consent).length;
    const avg = done.reduce((s, v) => s + v.dur, 0) / (done.length || 1);
    const scr = done.filter(v => v.script).length;
    const q = F.q.trim().toLowerCase();
    const list = q ? all.filter(v => v.doc.fio.toLowerCase().includes(q) || (v.rv || '').toLowerCase().includes(q)) : all;
    const per = 8, pages = Math.max(1, Math.ceil(list.length / per)); F.page = Math.min(F.page, pages);
    const rows = list.slice((F.page - 1) * per, F.page * per);
    const ops = DB.OPERATORS.map(o => { const ds = done.filter(v => v.op === o); return { o, n: ds.length, avg: ds.reduce((s, v) => s + v.dur, 0) / (ds.length || 1), t: ds.filter(v => v.target).length / (ds.length || 1) }; }).filter(x => x.n).sort((a, b) => b.n - a.n);
    const sv = done.filter(v => v.survey);
    const dist = DB.Q.map((qq, qi) => qq.opts.map((_, oi) => sv.filter(v => qi === 1 ? v.survey.q2.includes(oi) : v.survey['q' + (qi + 1)] === oi).length / (sv.length || 1)));
    const weeks = {}; done.forEach(v => { const w = isoWeek(v.date); weeks[w] = (weeks[w] || 0) + 1; });
    const wk = Object.keys(weeks).map(Number).sort((a, b) => a - b); const wmax = Math.max(1, ...wk.map(w => weeks[w]));
    const wkShow = wk.length > 22 ? wk.slice(-22) : wk;
    const periodLabel = (PERIODS.find(p => p[0] === F.period) || [0, `${dstr(F.from)} – ${dstr(F.to)}`])[1];
    const colors = ['#3b74c4', '#4b9b98', '#8b5cf6'];

    app.innerHTML = `${header('visits')}<main class="main fade">
      <div class="card"><div class="fbar">
        <div class="fld" style="width:220px"><label>Период</label><div class="sel" data-sel="period"><button class="sel-btn" data-toggle><span>${periodLabel}</span>${ic('chev', 'sm')}</button>
          <div class="pop" style="min-width:290px">${PERIODS.map(p => `<div class="opt ${F.period === p[0] ? 'on' : ''}" data-val="${p[0]}">${p[1]}${p[0].startsWith('w') ? `<span class="sp"></span><small class="muted">волна ${p[0][1]}</small>` : ''}</div>`).join('')}
          <div style="border-top:1px solid var(--line2);margin-top:4px"></div><div class="muted" style="font-size:12px;padding:8px 10px 0">Произвольный период</div>
          <div class="daterow"><input type="date" id="df" value="${toInput(F.from)}" min="2025-01-13" max="2025-12-26"> — <input type="date" id="dt" value="${toInput(F.to)}" min="2025-01-13" max="2025-12-26"><button class="btn sm pri" id="dok">OK</button></div></div></div></div>
        <div class="fld" style="width:270px"><label>География</label>${citySel('vcity', F.cities)}</div>
        <div class="fld" style="width:180px"><label>Оператор</label>${simpleSel('op', F.op, [['all', `Все операторы (${DB.OPERATORS.length})`], ...DB.OPERATORS.map(o => [String(o.id), o.name])])}</div>
        <div class="fld" style="width:180px"><label>Волна</label>${simpleSel('wave', F.wave, [['all', 'Все волны'], ...DB.WAVES.map(w => [String(w.n), `Волна ${w.n} · ${w.short}`])])}</div>
        <div class="fld" style="width:150px"><label>Специальность</label>${simpleSel('spec', F.spec, [['neuro', 'Неврология']])}</div>
        <span class="sp"></span>
        <button class="btn pri" id="vapply">${ic('filter', 'sm')}Применить</button>
        <button class="btn out" id="vexp">${ic('dl', 'sm')}Выгрузить</button>
      </div></div>
      <div class="grid g5 mt">
        ${[['Визитов завершено', fmt(done.length), `из ${fmt(plan)} · <b>${pct(Math.min(1, done.length / plan))}</b>`, 'phone', 'c-blue', 'Состоявшиеся визиты за выбранный период против плана волны с учётом географии и оператора.'],
          ['Длительность', minsec(avg), `в среднем · <b>${pct(scr / (done.length || 1), 0)}</b> по сценарию`, 'clock', 'c-red', 'Средняя длительность состоявшегося разговора. «По сценарию» — визиты, где оператор прошёл все блоки скрипта.'],
          ['Записей доступно', fmt(rec), `<b>${pct(rec / (done.length || 1))}</b> визитов`, 'mic', 'c-violet', 'Аудиозаписи хранятся 3 года. Отсутствие записи — технический сбой линии или отказ врача от записи.'],
          ['Опрос пройден', fmt(surv), `<b>${pct(surv / (done.length || 1), 0)}</b> визитов`, 'list', 'c-amber', 'Визиты, в которых врач ответил на все 3 вопроса опроса.'],
          ['Согласий на передачу', fmt(cons), `контактов клиенту · <b>${pct(cons / (done.length || 1))}</b>`, 'shield', 'c-green', 'Визиты, в которых врач подтвердил согласие на передачу контактов компании-партнёру. Фиксируется в записи разговора.']]
          .map(k => `<div class="card kpi compact" style="cursor:default"><div class="k-t">${k[0]}</div><div class="badge-ic ${k[4]}">${ic(k[3], 'lg')}</div><div class="k-v num">${k[1]}</div><div class="k-f">${k[2]}</div>${qm(k[5])}</div>`).join('')}
      </div>
      <div class="grid mt" style="grid-template-columns:1.45fr 1fr">
        <div class="card">
          <div class="card-h"><h3>Записи визитов</h3><div class="row-flex"><div class="search-box" style="width:240px">${ic('search', 'sm')}<input class="inp" id="vq" placeholder="Врач или номер записи" value="${esc(F.q)}" style="height:34px"></div><span class="muted" style="font-size:13px">${fmt(list.length)} ${plural(list.length, 'запись', 'записи', 'записей')} · новые сверху</span></div></div>
          ${rows.length ? `<table class="rec"><thead><tr><th style="width:40px"></th><th>Дата и время</th><th>Врач</th><th>Город</th><th>Оператор</th><th>Длит.</th><th>Результат</th></tr></thead><tbody>
          ${rows.map(v => { const st = STATUS[vStatus(v)]; const open = F.open === v.id; return `<tr class="click ${open ? 'exp' : ''}" data-row="${v.id}"><td><button class="playb" data-play="${v.id}" ${v.rec ? '' : 'disabled title="Запись недоступна"'}>${ic('play')}</button></td>
            <td class="muted num">${dstr(v.date)} ${tstr(v.date)}</td><td><a class="doclink" data-doc="${v.doc.id}" style="color:var(--ink);font-weight:600">${esc(v.doc.fio)}</a></td><td>${v.doc.city}</td><td>${v.op.name}</td><td class="num">${mmss(v.dur)}</td><td><span class="tag ${st[1]}">${st[0]}</span></td></tr>
            ${open ? `<tr class="exp"><td></td><td colspan="6" style="padding-top:2px">
              ${v.rec ? `<div class="player"><div class="wave" data-prog="${v.id}" data-seek="${v.id}">${waveBars(v.id)}</div><span class="ptime num" data-ptime="${v.id}">0:00 / ${mmss(v.dur)}</span><span class="rv">${ic('mic', 'sm')}${v.rv}</span><select class="speed" data-speed><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></div>` : `<div class="muted" style="padding:6px 0">Запись отсутствует: ${v.status === 'refused' ? 'врач отказался от разговора в первые секунды' : 'разговор не состоялся'}</div>`}
              <div class="pmeta">Тема волны ${v.wave}: «${DB.WAVES[v.wave - 1].theme}» · сценарий 1 стр. · 3 вопроса опроса${v.survey ? ` · ответы: <b>${DB.Q[0].opts[v.survey.q1]}</b>; <b>${v.survey.q2.map(i => DB.Q[1].opts[i].replace('Проба ', '')).join(', ')}</b>; <b>${DB.Q[2].opts[v.survey.q3]}</b>` : ''}</div>
              <div class="row-flex" style="margin-top:8px"><button class="btn sm" data-doc="${v.doc.id}">${ic('user', 'sm')}Карточка врача</button><button class="btn sm" data-dochist="${v.doc.id}">${ic('list', 'sm')}История действий</button>${v.status === 'callback' ? `<span class="muted" style="font-size:12.5px">Повторный звонок запланирован на ${dstr(new Date(v.date.getTime() + 2 * 86400000))}</span>` : ''}</div>
            </td></tr>` : ''}`; }).join('')}
          </tbody></table>` : `<div class="empty">Нет визитов по выбранным условиям</div>`}
          <div class="pager"><span>Показано ${list.length ? (F.page - 1) * per + 1 : 0}–${Math.min(list.length, F.page * per)} из ${fmt(list.length)}</span><div class="pg">${pagerBtns(F.page, pages)}</div></div>
          <h3 style="font-size:15px;margin-top:18px">Операторы за период</h3>
          <table style="margin-top:6px"><thead><tr><th>Оператор</th><th class="r">Визиты</th><th class="r">Средняя длит.</th><th class="r" data-tip="Доля визитов, после которых врач перешёл к материалу в течение 7 дней">Целевое действие</th></tr></thead><tbody>
          ${(F.showAllOps ? ops : ops.slice(0, 3)).map(o => `<tr><td>${o.o.name}</td><td class="r num">${fmt(o.n)}</td><td class="r num">${mmss(o.avg)}</td><td class="r num">${Math.round(o.t * 100)}%</td></tr>`).join('')}</tbody></table>
          ${ops.length > 3 ? `<button class="link" style="margin-top:8px" id="allops">${F.showAllOps ? 'Свернуть' : `Показать всех (${ops.length})`}</button>` : ''}
        </div>
        <div class="card"><h3>Результаты опроса на визите</h3><div class="sub">${fmt(sv.length)} ${plural(sv.length, 'ответивший невролог', 'ответивших невролога', 'ответивших неврологов')}</div>
          ${DB.Q.map((qq, qi) => `<div class="q-t">${qq.text}</div>${qq.opts.map((o, oi) => `<div class="hbar"><span>${o.replace('Проба Дикса–Холлпайка', 'Проба Дикса–Холлпайка')}</span><div class="tr"><div class="fl" style="width:${dist[qi][oi] * 100}%;background:${colors[qi]}"></div></div><span class="pv num">${Math.round(dist[qi][oi] * 100)}%</span></div>`).join('')}`).join('')}
          <div class="muted" style="font-size:12px;margin-top:6px">Во втором вопросе можно выбрать несколько ответов</div>
          <div class="q-t" style="margin-top:16px">Визиты по неделям 2025 <span class="muted" style="font-weight:400">· номер недели</span></div>
          <div class="wk">${wkShow.map(w => `<div class="b" data-tip="Неделя ${w}: ${fmt(weeks[w])} визитов"><em class="num">${weeks[w]}</em><i style="height:${weeks[w] / wmax * 70}%"></i><span>${w}</span></div>`).join('')}</div>
        </div>
      </div>${footer()}</main>`;
    bindHeader();
    // period
    bindSimpleSel(app, 'period', val => { const p = PERIODS.find(x => x[0] === val); F.period = val; F.from = p[2]; F.to = p[3]; if (val.startsWith('w')) F.wave = val[1]; else if (val === 'all') F.wave = 'all'; });
    $('#dok').addEventListener('click', e => { e.stopPropagation(); const a = parseD($('#df').value), b = parseD($('#dt').value); if (a > b) return; F.period = 'custom'; F.from = a; F.to = b; F.wave = 'all'; F.page = 1; reloadWith(vVisits); });
    bindCitySel(app, 'vcity', F.cities);
    bindSimpleSel(app, 'op', v => (F.op = v));
    bindSimpleSel(app, 'wave', v => { F.wave = v; if (v !== 'all') { const p = PERIODS.find(x => x[0] === 'w' + v); F.period = p[0]; F.from = p[2]; F.to = p[3]; } else { F.period = 'all'; F.from = PERIODS[0][2]; F.to = PERIODS[0][3]; } });
    bindSimpleSel(app, 'spec', v => (F.spec = v));
    $('#vapply').addEventListener('click', () => { F.page = 1; F.open = null; reloadWith(vVisits); });
    $('#vexp').addEventListener('click', () => {
      const b = $('#vexp'); b.disabled = true; b.innerHTML = '<span class="spin dk"></span>Формируем…';
      setTimeout(() => {
        const rowsX = [['Дата', 'Время', 'ID врача', 'Врач', 'Город', 'Оператор', 'Волна', 'Длительность, с', 'Результат', 'Запись', 'Q1', 'Q2', 'Q3', 'Согласие на передачу']];
        list.forEach(v => rowsX.push([dstr(v.date), tstr(v.date), v.doc.id, v.doc.fio, v.doc.city, v.op.name, v.wave, v.dur, STATUS[vStatus(v)][0], v.rv || '', v.survey ? DB.Q[0].opts[v.survey.q1] : '', v.survey ? v.survey.q2.map(i => DB.Q[1].opts[i]).join(', ') : '', v.survey ? DB.Q[2].opts[v.survey.q3] : '', v.consent ? 'да' : 'нет']));
        downloadCSV(`StopVertigo_визиты_${dstr(F.from)}-${dstr(F.to)}.csv`, rowsX);
        b.disabled = false; b.innerHTML = `${ic('dl', 'sm')}Выгрузить`; toast('Выгрузка готова', `${fmt(list.length)} записей · CSV для Excel`);
      }, 900);
    });
    let qt; $('#vq').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { F.q = e.target.value; F.page = 1; vVisits(); const i = $('#vq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); });
    $$('[data-page]').forEach(b => b.addEventListener('click', () => { F.page = +b.dataset.page; F.open = null; vVisits(); }));
    $$('[data-row]').forEach(tr => tr.addEventListener('click', e => {
      if (e.target.closest('[data-play],[data-doc],[data-dochist]')) return;
      const id = +tr.dataset.row; F.open = F.open === id ? null : id; vVisits(); syncPlayers();
    }));
    $$('[data-play]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const v = VMAP[+b.dataset.play]; if (F.open !== v.id) { F.open = v.id; vVisits(); } playVisit(v); }));
    $$('[data-seek]').forEach(w => w.addEventListener('click', e => { const v = VMAP[+w.dataset.seek]; const r = w.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; if (!cur || cur.vid !== v.id) playVisit(v); const go = () => { audio.currentTime = f * (AM[v.audio]); }; if (audio.readyState > 0) go(); else audio.addEventListener('loadedmetadata', go, { once: true }); }));
    $$('[data-speed]').forEach(s => { s.value = String(audio.playbackRate); s.addEventListener('change', () => (audio.playbackRate = +s.value)); });
    $$('[data-doc]').forEach(a => a.addEventListener('click', e => { e.stopPropagation(); location.hash = `#/doctor/${a.dataset.doc}`; }));
    $$('[data-dochist]').forEach(a => a.addEventListener('click', e => { e.stopPropagation(); location.hash = `#/doctor/${a.dataset.dochist}/history`; }));
    const ao = $('#allops'); ao && ao.addEventListener('click', () => { F.showAllOps = !F.showAllOps; vVisits(); });
    syncPlayers();
  }
  function pagerBtns(page, pages) {
    const arr = []; const add = n => arr.push(`<button data-page="${n}" class="${n === page ? 'on' : ''}">${n}</button>`);
    arr.push(`<button data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹</button>`);
    const s = new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages));
    let last = 0; [...s].sort((a, b) => a - b).forEach(n => { if (n - last > 1) arr.push('<button disabled>…</button>'); add(n); last = n; });
    arr.push(`<button data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>›</button>`);
    return arr.join('');
  }

  // ======================================================================
  // SURVEYS
  // ======================================================================
  function vSurveys() {
    const F = S.surv;
    const base = DB.visits.filter(v => v.survey && (F.seg === 'all' || v.doc.seg === F.seg) && (!F.cities.length || F.cities.includes(v.doc.city)));
    const sv = base.filter(v => F.wave === 'all' || v.wave === +F.wave);
    const dist = DB.Q.map((qq, qi) => qq.opts.map((_, oi) => sv.filter(v => qi === 1 ? v.survey.q2.includes(oi) : v.survey['q' + (qi + 1)] === oi).length / (sv.length || 1)));
    const byWave = [1, 2, 3, 4].map(w => { const a = base.filter(v => v.wave === w); return DB.Q[1].opts.map((_, oi) => a.filter(v => v.survey.q2.includes(oi)).length / (a.length || 1)); });
    const segs = ['A', 'B', 'C'].map(s => { const a = sv.filter(v => v.doc.seg === s); return { s, n: a.length, d: DB.Q[2].opts.map((_, oi) => a.filter(v => v.survey.q3 === oi).length / (a.length || 1)), p: DB.Q[0].opts.map((_, oi) => a.filter(v => v.survey.q1 === oi).length / (a.length || 1)) }; });
    const colors = ['#3b74c4', '#4b9b98', '#8b5cf6'];
    const uniq = new Set(sv.map(v => v.doc)).size;
    app.innerHTML = `${header('surveys')}<main class="main fade">
      <div class="crumbs"><span class="t">Опросы на визитах · StopVertigo 2025</span><span class="muted">3 вопроса в сценарии каждой волны · ответы фиксируются оператором во время разговора</span></div>
      <div class="card"><div class="fbar">
        <div class="fld"><label>Волна</label><div class="chips">${[['all', 'Все волны'], ['1', 'Волна 1'], ['2', 'Волна 2'], ['3', 'Волна 3'], ['4', 'Волна 4']].map(w => `<button class="chip ${F.wave === w[0] ? 'on' : ''}" data-sw="${w[0]}">${w[1]}</button>`).join('')}</div></div>
        <div class="fld"><label>Сегмент</label><div class="chips">${[['all', 'Все'], ['A', 'A'], ['B', 'B'], ['C', 'C']].map(w => `<button class="chip ${F.seg === w[0] ? 'on' : ''}" data-ss="${w[0]}">${w[1]}</button>`).join('')}</div></div>
        <div class="fld" style="width:280px"><label>География</label>${citySel('scity', F.cities)}</div>
        <span class="sp"></span><button class="btn out" id="sexp">${ic('dl', 'sm')}Выгрузить ответы</button></div></div>
      <div class="grid g4 mt">
        ${[['Ответов получено', fmt(sv.length), 'полных анкет (3 из 3)', 'list', 'c-amber'], ['Уникальных врачей', fmt(uniq), 'ответили хотя бы раз', 'users', 'c-blue'], ['Используют HINTS', pct(dist[1][1], 0), 'при первичном осмотре', 'chart', 'c-teal'], ['Сложнее всего', DB.Q[2].opts[dist[2].indexOf(Math.max(...dist[2]))], `${pct(Math.max(...dist[2]), 0)} врачей`, 'star', 'c-violet']]
          .map(k => `<div class="card kpi compact" style="cursor:default"><div class="k-t">${k[0]}</div><div class="badge-ic ${k[4]}">${ic(k[3], 'lg')}</div><div class="k-v num" style="${k[1].length > 12 ? 'font-size:18px' : ''}">${k[1]}</div><div class="k-f">${k[2]}</div></div>`).join('')}
      </div>
      <div class="grid g3 mt">${DB.Q.map((qq, qi) => `<div class="card"><h3 style="font-size:15px">${qq.text}</h3><div class="sub">${qq.multi ? 'несколько вариантов ответа' : 'один вариант ответа'}</div><div style="margin-top:10px">${qq.opts.map((o, oi) => `<div class="hbar" style="grid-template-columns:170px 1fr 44px"><span>${o}</span><div class="tr"><div class="fl" style="width:${dist[qi][oi] * 100}%;background:${colors[qi]}"></div></div><span class="pv num">${Math.round(dist[qi][oi] * 100)}%</span></div>`).join('')}</div></div>`).join('')}</div>
      <div class="grid mt" style="grid-template-columns:1.3fr 1fr">
        <div class="card"><div class="card-h"><div><h3>Пробы при первичном осмотре: динамика по волнам</h3><div class="sub">как меняется практика врачей, отвечающих в разных волнах проекта</div></div>${qm('Сравнение долей по волнам. Для оценки эффекта проекта на практику используется сопоставимая контрольная группа неврологов вне проекта.')}</div><div style="height:250px"><canvas id="chWave"></canvas></div></div>
        <div class="card"><h3>Ответы по сегментам</h3><div class="sub">что сложнее всего в ведении пациентов с головокружением</div>
          <table style="margin-top:10px"><thead><tr><th>Сложность</th>${segs.map(s => `<th class="r">Сегм. ${s.s}</th>`).join('')}</tr></thead><tbody>
          ${DB.Q[2].opts.map((o, oi) => `<tr><td>${o}</td>${segs.map(s => `<td class="r num">${Math.round(s.d[oi] * 100)}%</td>`).join('')}</tr>`).join('')}
          <tr><td class="muted">Ответов</td>${segs.map(s => `<td class="r num muted">${fmt(s.n)}</td>`).join('')}</tr></tbody></table>
          <div class="q-t" style="margin-top:16px">16+ пациентов с головокружением в месяц</div>
          ${segs.map(s => `<div class="hbar" style="grid-template-columns:90px 1fr 44px"><span>Сегмент ${s.s}</span><div class="tr"><div class="fl" style="width:${(s.p[2] + s.p[3]) * 100}%;background:#3b74c4"></div></div><span class="pv num">${Math.round((s.p[2] + s.p[3]) * 100)}%</span></div>`).join('')}
        </div></div>
      <div class="card mt"><div class="card-h"><h3>Последние ответы</h3><span class="muted" style="font-size:13px">нажмите на строку, чтобы открыть карточку врача</span></div>
        <table><thead><tr><th>Дата</th><th>Врач</th><th>Город</th><th>Волна</th><th>Пациентов в месяц</th><th>Пробы</th><th>Сложнее всего</th></tr></thead><tbody>
        ${sv.slice(0, 8).map(v => `<tr class="click" data-go="#/doctor/${v.doc.id}"><td class="muted num">${dstr(v.date)}</td><td style="font-weight:600">${esc(v.doc.fio)}</td><td>${v.doc.city}</td><td>${v.wave}</td><td>${DB.Q[0].opts[v.survey.q1]}</td><td>${v.survey.q2.map(i => DB.Q[1].opts[i].replace('Проба ', '')).join(', ')}</td><td>${DB.Q[2].opts[v.survey.q3]}</td></tr>`).join('')}</tbody></table></div>
      ${footer()}</main>`;
    bindHeader(); bindGo();
    $$('[data-sw]').forEach(b => b.addEventListener('click', () => { F.wave = b.dataset.sw; reloadWith(vSurveys); }));
    $$('[data-ss]').forEach(b => b.addEventListener('click', () => { F.seg = b.dataset.ss; reloadWith(vSurveys); }));
    bindCitySel(app, 'scity', F.cities, () => { clearTimeout(vSurveys._t); vSurveys._t = setTimeout(() => reloadWith(vSurveys), 700); });
    $('#sexp').addEventListener('click', () => { const r = [['Дата', 'ID врача', 'Врач', 'Город', 'Сегмент', 'Волна', DB.Q[0].text, DB.Q[1].text, DB.Q[2].text]]; sv.forEach(v => r.push([dstr(v.date), v.doc.id, v.doc.fio, v.doc.city, v.doc.seg, v.wave, DB.Q[0].opts[v.survey.q1], v.survey.q2.map(i => DB.Q[1].opts[i]).join(', '), DB.Q[2].opts[v.survey.q3]])); downloadCSV('StopVertigo_опросы.csv', r); toast('Ответы выгружены', `${fmt(sv.length)} анкет · CSV`); });
    killCharts();
    charts.push(new Chart($('#chWave'), { type: 'line', data: { labels: ['Волна 1', 'Волна 2', 'Волна 3', 'Волна 4'], datasets: DB.Q[1].opts.map((o, oi) => ({ label: o, data: byWave.map(w => Math.round(w[oi] * 100)), borderColor: ['#3b74c4', '#4b9b98', '#8b5cf6', '#f59e0b'][oi], backgroundColor: ['#3b74c4', '#4b9b98', '#8b5cf6', '#f59e0b'][oi], tension: 0.3, pointRadius: 4, borderWidth: 2.5 })) },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } }, tooltip: { callbacks: { label: it => ` ${it.dataset.label}: ${it.raw}%` } } }, scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: '#eef1f5' }, border: { display: false } }, x: { grid: { display: false } } } } }));
  }

  // ======================================================================
  // DOCTORS LIST
  // ======================================================================
  const STAGE = { core: ['Ядро', 'green'], q3: ['3+ качественных', 'blue'], q1: ['Качественный контакт', 'blue'], touch: ['Знакомство', 'gray'], none: ['Нет контакта', 'gray'] };
  function docsFiltered() {
    const F = S.docs; const q = F.q.trim().toLowerCase();
    let a = DB.doctors.filter(d => (!F.cities.length || F.cities.includes(d.city)) && (F.seg === 'all' || d.seg === F.seg)
      && (F.stage === 'all' || (F.stage === 'any' ? d.anyContact : F.stage === 'q1' ? d.quality >= 1 : F.stage === 'q3' ? d.quality >= 3 : F.stage === 'core' ? d.quality >= 5 : d.stage === F.stage))
      && (F.consent === 'all' || (F.consent === 'yes' ? d.consentTransfer : !d.consentTransfer))
      && (F.crm === 'all' || (F.crm === 'match' ? !!d.crm : F.crm === 'nomatch' ? d.consentTransfer && !d.crm : !d.consentTransfer))
      && (!q || d.fio.toLowerCase().includes(q) || String(d.id).includes(q) || (d.crm || '').toLowerCase().includes(q) || d.iq.toLowerCase().includes(q)));
    const k = F.sort, dir = F.dir;
    a.sort((x, y) => { const vx = k === 'fio' ? x.fio : k === 'city' ? x.city : x[k], vy = k === 'fio' ? y.fio : k === 'city' ? y.city : y[k]; return (vx > vy ? 1 : vx < vy ? -1 : 0) * dir; });
    return a;
  }
  function vDoctors() {
    const F = S.docs; const list = docsFiltered();
    const per = 14, pages = Math.max(1, Math.ceil(list.length / per)); F.page = Math.min(F.page, pages);
    const rows = list.slice((F.page - 1) * per, F.page * per);
    const th = (k, t, cls = '') => `<th class="sortable ${cls}" data-sort="${k}">${t}${F.sort === k ? (F.dir < 0 ? ' ↓' : ' ↑') : ''}</th>`;
    const cnt = st => DB.doctors.filter(d => st === 'all' ? true : st === 'core' ? d.quality >= 5 : st === 'q1' ? d.quality >= 1 : st === 'q3' ? d.quality >= 3 : st === 'any' ? d.anyContact : d.stage === st).length;
    app.innerHTML = `${header('doctors')}<main class="main fade">
      <div class="crumbs"><span class="t">Врачи проекта · StopVertigo 2025</span><span class="muted">Целевая база: неврологи, ${fmt(DB.doctors.length)} врачей · идентификация по IQKey</span></div>
      <div class="chips" style="margin-bottom:12px">${[['all', 'Все'], ['any', 'Хотя бы 1 контакт'], ['q1', 'Качественный контакт'], ['q3', '3+ качественных'], ['core', 'Ядро'], ['none', 'Нет контакта']].map(s => `<button class="chip ${F.stage === s[0] ? 'on' : ''}" data-stage="${s[0]}">${s[1]} · <span class="num">${fmt(cnt(s[0]))}</span></button>`).join('')}</div>
      <div class="card"><div class="fbar" style="margin-bottom:14px">
        <div class="fld" style="width:300px"><label>Поиск</label><div class="search-box">${ic('search', 'sm')}<input class="inp" id="dq" placeholder="ФИО, ID, IQKey или ID в CRM клиента" value="${esc(F.q)}"></div></div>
        <div class="fld" style="width:250px"><label>География</label>${citySel('dcity2', F.cities)}</div>
        <div class="fld" style="width:140px"><label>Сегмент</label>${simpleSel('dseg', F.seg, [['all', 'Все сегменты'], ['A', 'Сегмент A'], ['B', 'Сегмент B'], ['C', 'Сегмент C']])}</div>
        <div class="fld" style="width:200px"><label>Согласие на передачу</label>${simpleSel('dcons', F.consent, [['all', 'Не важно'], ['yes', 'Есть согласие'], ['no', 'Нет согласия']])}</div>
        <div class="fld" style="width:210px"><label>CRM клиента</label>${simpleSel('dcrm', F.crm, [['all', 'Все'], ['match', 'Сопоставлен'], ['nomatch', 'Ожидает сопоставления'], ['na', 'Не передаётся']])}</div>
        <span class="sp"></span><button class="btn out" id="dexp">${ic('dl', 'sm')}Выгрузить</button></div>
        <table><thead><tr>${th('id', 'ID')}${th('fio', 'Врач')}${th('city', 'Город')}${th('seg', 'Сегм.')}${th('nVisits', 'Визиты', 'r')}${th('nWeb', 'Вебинары', 'r')}${th('nMats', 'Материалы', 'r')}${th('score', 'Баллы', 'r')}<th>Статус</th><th>Согласие</th><th>CRM клиента</th></tr></thead><tbody>
        ${rows.map(d => `<tr class="click" data-go="#/doctor/${d.id}"><td class="muted num">${d.id}</td><td><b style="font-weight:600">${esc(d.fio)}</b><div class="muted" style="font-size:12.5px">${esc(d.clinic)}</div></td><td>${d.city}</td><td><b style="color:var(--blue)">${d.seg}</b></td><td class="r num">${d.nVisits} из 4</td><td class="r num">${d.nWeb}</td><td class="r num">${d.nMats}</td><td class="r num" style="font-weight:600">${String(d.score).replace('.', ',')}</td><td><span class="tag ${STAGE[d.stage][1]}">${STAGE[d.stage][0]}</span></td><td>${d.consentTransfer ? `<span class="tag green">${ic('check', 'sm')}есть</span>` : '<span class="tag gray">нет</span>'}</td><td class="num" style="font-size:13px">${d.crm ? `<span style="color:var(--green-d)">${d.crm}</span>` : d.consentTransfer ? '<span class="muted">ожидает</span>' : '<span class="muted">—</span>'}</td></tr>`).join('') || '<tr><td colspan="11" class="empty">Ничего не найдено</td></tr>'}
        </tbody></table>
        <div class="pager"><span>Показано ${list.length ? (F.page - 1) * per + 1 : 0}–${Math.min(list.length, F.page * per)} из ${fmt(list.length)}</span><div class="pg">${pagerBtns(F.page, pages)}</div></div></div>
      ${footer()}</main>`;
    bindHeader(); bindGo();
    $$('[data-stage]').forEach(b => b.addEventListener('click', () => { F.stage = b.dataset.stage; F.page = 1; reloadWith(vDoctors); }));
    bindCitySel(app, 'dcity2', F.cities, () => { clearTimeout(vDoctors._t); vDoctors._t = setTimeout(() => { F.page = 1; reloadWith(vDoctors); }, 700); });
    bindSimpleSel(app, 'dseg', v => { F.seg = v; F.page = 1; reloadWith(vDoctors); });
    bindSimpleSel(app, 'dcons', v => { F.consent = v; F.page = 1; reloadWith(vDoctors); });
    bindSimpleSel(app, 'dcrm', v => { F.crm = v; F.page = 1; reloadWith(vDoctors); });
    $$('[data-sort]').forEach(t => t.addEventListener('click', () => { const k = t.dataset.sort; if (F.sort === k) F.dir *= -1; else { F.sort = k; F.dir = ['fio', 'city', 'seg'].includes(k) ? 1 : -1; } vDoctors(); }));
    $$('[data-page]').forEach(b => b.addEventListener('click', () => { F.page = +b.dataset.page; vDoctors(); }));
    let qt; $('#dq').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { F.q = e.target.value; F.page = 1; vDoctors(); const i = $('#dq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); });
    $('#dexp').addEventListener('click', () => { const r = [['ID', 'Врач', 'Город', 'Регион', 'Место работы', 'Сегмент', 'Визиты', 'Вебинары', 'Материалы', 'Баллы', 'Статус', 'Согласие на передачу', 'IQKey ID', 'ID в CRM клиента']]; list.forEach(d => r.push([d.id, d.fio, d.city, d.region, d.clinic, d.seg, d.nVisits, d.nWeb, d.nMats, String(d.score).replace('.', ','), STAGE[d.stage][0], d.consentTransfer ? 'да' : 'нет', d.iq, d.crm || ''])); downloadCSV('StopVertigo_врачи.csv', r); toast('Список врачей выгружен', `${fmt(list.length)} строк · CSV`); });
  }

  // ======================================================================
  // DOCTOR CARD + HISTORY
  // ======================================================================
  const tlCache = {};
  function timeline(d) {
    if (tlCache[d.id]) return tlCache[d.id];
    const r = DB.rng(d.id * 13 + 5); const ev = [];
    const at = (dt, h, m) => { const x = new Date(dt); x.setHours(h, m, 0, 0); return x; };
    const vis = DB.visits.filter(v => v.doc === d).sort((a, b) => a.date - b.date);
    vis.forEach(v => {
      const w = DB.WAVES[v.wave - 1];
      if (v.status === 'done') ev.push({ t: 'visit', date: v.date, v, title: `Удалённый визит · волна ${v.wave}`, desc: `Оператор: ${v.op.name} · длительность ${minsec(v.dur)} · тема «${w.theme}»` });
      else ev.push({ t: 'visit', date: v.date, v, title: v.status === 'callback' ? `Визит перенесён · волна ${v.wave}` : `Отказ от визита · волна ${v.wave}`, desc: `Оператор: ${v.op.name} · ${v.status === 'callback' ? 'врач попросил перезвонить' : 'врач отказался от разговора'}`, muted: true });
      const sd = new Date(v.date.getTime() - 2 * 86400000); if (sd.getDay() === 0) sd.setDate(sd.getDate() - 2); if (sd.getDay() === 6) sd.setDate(sd.getDate() - 1);
      ev.push({ t: 'sms', date: at(sd, 10, 0), title: 'SMS доставлено', desc: 'Напоминание о звонке по проекту StopVertigo · канал: SMS' });
    });
    const first = vis.find(v => v.status === 'done');
    if (first) ev.push({ t: 'consent', date: new Date(first.date.getTime() + 60000), title: 'Согласие: обработка персональных данных', desc: `Получено на удалённом визите${first.rv ? ` · аудиозапись ${first.rv}` : ' · подтверждено оператором'}` });
    const cv = vis.find(v => v.consent);
    if (cv) ev.push({ t: 'consent', date: new Date(cv.date.getTime() + 120000), title: 'Согласие: передача контактов клиенту', desc: `Получено на удалённом визите · аудиозапись ${cv.rv || '—'}` });
    (d.emailWaves || []).forEach(([i, k]) => {
      const e = DB.EMAILS[i]; const o = new Date(e.date.getTime() + (d === DB.bel && i === 20 ? 98 : 20 + Math.floor(r() * 1800)) * 60000);
      ev.push({ t: 'email', date: o, title: 'Рассылка открыта', desc: `Email «${e.subject}» · отправлено ${dstr(e.date)} 08:00` });
      if (k === 2) ev.push({ t: 'email', date: new Date(o.getTime() + (3 + Math.floor(r() * 9)) * 60000), title: 'Клик по ссылке в рассылке', desc: `Email «${e.subject}» · ${/Приглашение/.test(e.subject) ? 'регистрация на вебинар' : 'переход на лендинг'}` });
    });
    d.webinars.forEach((x, i) => { if (!x) return; const w = DB.WEBINARS[i]; const q = r() < 0.4;
      if (d.webRec && d.webRec[i]) { const rd = new Date(w.date.getTime() + (2 + Math.floor(r() * 12)) * 86400000); ev.push({ t: 'web', date: at(rd, 20 + Math.floor(r() * 3), Math.floor(r() * 60)), title: 'Просмотр записи вебинара', desc: `«${w.title}» · запись на лендинге · длительность ${w.dur} мин · просмотрено ${d.webMin[i]} мин` }); }
      else ev.push({ t: 'web', date: at(w.date, 19, 0), title: 'Участие в вебинаре', desc: `«${w.title}» · прямой эфир · длительность ${w.dur} мин · участие ${d.webMin[i]} мин${q ? ' · вопрос в чате' : ''}` }); });
    if (d === DB.bel) {
      const L = [['21.11.2025 10:14', 'm3', '3 мин 05 с', 'переход из рассылки'], ['28.10.2025 21:02', 'm6', '5 мин 12 с', 'переход из рассылки'], ['18.09.2025 09:20', 'm1', '4 мин 30 с', 'переход после визита'], ['17.09.2025 18:47', 'm8', '1 мин 55 с', 'переход после визита'], ['12.06.2025 13:05', 'm1', '3 мин 40 с', 'переход из рассылки'], ['15.05.2025 08:40', 'm4', '5 мин 20 с', 'переход после визита'], ['14.05.2025 19:31', 'm2', '6 мин 50 с', 'переход после визита'], ['02.04.2025 12:10', 'm2', '2 мин 10 с', 'прямой заход'], ['17.03.2025 20:15', 'm5', '1 мин 20 с', 'переход из SMS'], ['20.02.2025 20:30', 'm3', '2 мин 40 с', 'переход после вебинара'], ['17.01.2025 09:05', 'm1', '1 мин 15 с', 'переход после визита']];
      L.forEach(l => { const [ds, ts] = l[0].split(' '); const [dd, mm, yy] = ds.split('.').map(Number); const [h, mi] = ts.split(':').map(Number); const m = DB.MATERIALS.find(x => x.id === l[1]); ev.push({ t: 'land', date: new Date(yy, mm - 1, dd, h, mi), title: 'Просмотр материала на лендинге', desc: `«${m.title}» · время на странице ${l[2]} · ${l[3]}` }); });
      ev.push({ t: 'file', date: new Date(2025, 10, 6, 16, 52), title: 'Скачан материал для пациента', desc: '«Упражнения вестибулярной реабилитации» · PDF, 2 стр.' });
      ev.push({ t: 'file', date: new Date(2025, 2, 17, 20, 18), title: 'Скачан материал для пациента', desc: '«Упражнения вестибулярной реабилитации» · PDF, 2 стр.' });
      [[new Date(2025, 10, 3, 11, 30), 'головокружение у пожилого пациента'], [new Date(2025, 5, 16, 14, 10), 'вестибулярная мигрень'], [new Date(2025, 3, 8, 10, 40), 'алгоритм первичной оценки']].forEach(f => ev.push({ t: 'field', date: f[0], title: 'Полевой визит представителя клиента', desc: `Медпредставитель: Захаров И. · ${d.clinic.split(',')[0]} · тема: ${f[1]}`, crm: true }));
    } else {
      const startT = (d.joined || new Date(2025, 1, 1)).getTime(), endT = DB.NOW.getTime() - 86400000;
      for (let i = 0; i < d.landing; i++) {
        const m = DB.MATERIALS.find(x => x.id === d.mats[i % d.mats.length]);
        const dt = new Date(startT + r() * (endT - startT)); dt.setHours(8 + Math.floor(r() * 14), Math.floor(r() * 60));
        ev.push({ t: 'land', date: dt, title: 'Просмотр материала на лендинге', desc: `«${m.title}» · время на странице ${Math.floor(1 + r() * 6)} мин ${p2(Math.floor(r() * 60))} с · ${['переход из рассылки', 'переход после визита', 'прямой заход', 'переход из SMS'][Math.floor(r() * 4)]}` });
      }
      for (let i = 0; i < d.downloads; i++) { const dt = new Date(startT + r() * (endT - startT)); dt.setHours(9 + Math.floor(r() * 10), Math.floor(r() * 60)); ev.push({ t: 'file', date: dt, title: 'Скачан материал для пациента', desc: '«Упражнения вестибулярной реабилитации» · PDF, 2 стр.' }); }
      if (d.crm) for (let i = 0; i < d.fieldVisits; i++) { const dt = new Date(Math.max(d.crmDate.getTime(), startT) + r() * (endT - Math.max(d.crmDate.getTime(), startT))); dt.setHours(10 + Math.floor(r() * 7), Math.floor(r() * 4) * 15); if (dt.getDay() % 6 === 0) dt.setDate(dt.getDate() + 2); ev.push({ t: 'field', date: dt, title: 'Полевой визит представителя клиента', desc: `Медпредставитель: ${DB.REPS[(d.id + i) % DB.REPS.length]} · ${d.clinic.split(',')[0]} · тема: ${['головокружение у пожилого пациента', 'вестибулярная мигрень', 'ДППГ', 'алгоритм первичной оценки'][Math.floor(r() * 4)]}`, crm: true }); }
    }
    ev.sort((a, b) => b.date - a.date);
    return (tlCache[d.id] = ev);
  }
  const TL = { visit: ['phone', 'c-blue'], sms: ['msg', 'c-red'], email: ['mail', 'c-amber'], web: ['video', 'c-pink'], land: ['globe', 'c-violet'], file: ['file', 'c-green'], field: ['pin', 'c-teal'], consent: ['shield', 'c-green'], plan: ['cal', 'c-blue'] };
  const mask = d => `+7 (${d.phoneOp}) •••-••-${d.phoneTail}`;
  const maskMail = d => `${d.emailUser.slice(0, 7)}•••@${d.emailDom}`;

  function docHeader(d, compact) {
    const stageTag = d.quality >= 5 ? `<span class="tag violet">${ic('star', 'sm')}Ядро проекта</span>` : `<span class="tag ${STAGE[d.stage][1]}">${STAGE[d.stage][0]}</span>`;
    if (compact) return `<div class="card row-flex" style="padding:12px 18px"><span class="tag dark">ID ${d.id}</span><b style="font-size:18px;font-weight:600">${esc(d.fio)}</b><span class="muted">Невролог · ${d.city} · IQKey ${d.iq}${d.crm ? ` · CRM клиента ${d.crm}` : ''}</span><span class="sp"></span>${stageTag}<span class="tag blue">Сегмент ${d.seg}</span></div>`;
    return '';
  }
  function vDoctor(id, tab) {
    const d = DB.byId[id]; if (!d) { location.hash = '#/doctors'; return; }
    const ev = timeline(d); const vis = DB.visits.filter(v => v.doc === d && v.status === 'done').sort((a, b) => a.date - b.date);
    const lastC = ev.find(e => e.t !== 'sms'); const sumDur = vis.reduce((s, v) => s + v.dur, 0);
    const sv = vis.filter(v => v.survey);
    const landMin = ev.filter(e => e.t === 'land').reduce((s, e) => { const m = e.desc.match(/(\d+) мин (\d+) с/); return s + (m ? +m[1] + +m[2] / 60 : 0); }, 0);
    const mScore = Array(12).fill(0);
    ev.forEach(e => { const m = e.date.getMonth(); if (e.t === 'visit' && e.v.status === 'done') mScore[m] += 5; else if (e.t === 'web') mScore[m] += 3; else if (e.t === 'land') mScore[m] += 0.6; else if (e.t === 'email' && /Клик/.test(e.title)) mScore[m] += 0.5; });
    const mMax = Math.max(1, ...mScore);
    const fieldN = ev.filter(e => e.t === 'field').length;
    const stageTag = d.quality >= 5 ? `<span class="tag violet">${ic('star', 'sm')}Ядро проекта</span>` : `<span class="tag ${STAGE[d.stage][1]}">${STAGE[d.stage][0]}</span>`;
    const crumbsR = `<span class="muted"><a class="link" href="#/doctors" style="color:var(--muted)">База врачей</a> › Неврология › ${d.city}</span>`;
    if (tab === 'history') return vHistory(d, ev, vis);
    S.hist.filter = 'all';
    const scoreLvl = d.quality >= 5 ? 'ядро' : d.quality >= 1 ? 'качественный контакт' : 'знакомство';
    const consents = [
      [d.consentPD, 'Обработка персональных данных', first => first],
      [d.consentMail, 'Получение информационных рассылок'],
      [d.consentTransfer, 'Передача контактов клиенту'],
      [d.consentCalls, 'Звонки представителя клиента'],
      [d.consentMsg, 'Сообщения в мессенджерах'],
    ];
    const fv = vis[0], cv = vis.find(v => v.consent);
    const cDesc = [fv ? `${dstr(fv.date)} · удалённый визит${fv.rv ? `, аудиозапись ${fv.rv}` : ', подтверждено оператором'}` : d.consentPD ? `${dstr(d.joined)} · форма регистрации на лендинге` : 'не запрашивалось',
      fv ? `${dstr(fv.date)} · email и SMS` : d.consentMail ? `${dstr(d.joined)} · форма подписки` : 'не запрашивалось',
      cv ? `${dstr(cv.date)} · удалённый визит, аудиозапись ${cv.rv || '—'}` : 'не получено',
      d.consentCalls && cv ? `${dstr(cv.date)} · рабочий телефон` : 'не запрашивалось', d.consentMsg ? 'получено' : 'не запрашивалось'];
    app.innerHTML = `${header('doctors')}<main class="main fade">
      <div class="crumbs"><span class="t"><a href="#/doctors">Врачи проекта</a> · StopVertigo 2025</span>${crumbsR}</div>
      <div class="card dhead"><div class="row-flex" style="align-items:flex-start"><div style="flex:1">
        <div class="row-flex" style="gap:6px"><span class="tag dark">ID ${d.id}</span><span class="tag green">Активен</span>${stageTag}<span class="tag blue">Сегмент ${d.seg}</span></div>
        <h1>${esc(d.fio)}</h1><div class="meta">Врач-невролог · ${esc(d.clinic)} · ${d.city} · Обновлён: ${d === DB.bel ? '18 дек. 2025 г.' : `${d.crmDate ? d.crmDate.getDate() : 12} ${MONG[d.crmDate ? d.crmDate.getMonth() : 11]} 2025 г.`}</div></div>
        <button class="btn" onclick="history.length>1?history.back():location.hash='#/doctors'">${ic('back', 'sm')}К базе</button><button class="btn pri" id="plan">${ic('phone', 'sm')}Запланировать визит</button><button class="btn" style="padding:0 10px" data-tip="Настройки карточки: исключить из коммуникаций, объединить дубли">${ic('gear', 'sm')}</button></div>
        <div class="facts">${[['Специализация', 'Неврология'], ['Стаж', `${d.exp} ${plural(d.exp, 'год', 'года', 'лет')}`], ['Телефон · валиден', mask(d)], [d.consentMail ? 'Email · подтверждён' : 'Email', d.consentMail ? maskMail(d) : '—'], ['В проекте с', d.joined ? dstr(d.joined) : '—'], ['Последний контакт', lastC ? dstr(lastC.date) : '—']].map(f => `<div class="fact"><div class="l">${f[0]}</div><div class="v num">${f[1]}</div></div>`).join('')}</div></div>
      <div class="grid g3 mt">
        <div class="card"><h3>Идентификаторы и метчинг</h3><div style="margin-top:12px">
          <div class="idbox"><div class="l">ID Клифар CRM</div><div class="v num">${d.id}</div></div>
          <div class="idbox"><div class="l">IQKey ID</div><div class="v num">${d.iq}</div></div>
          ${d.crm ? `<div class="idbox ok"><div class="row-flex"><div class="l" style="flex:1">ID в CRM клиента</div></div><div class="row-flex"><div class="v num" style="flex:1">${d.crm}</div><span class="tag green">${ic('link', 'sm')}Совпадение подтверждено</span></div>
            <div style="font-size:12.5px;color:var(--ink2);margin-top:4px">IQKey ↔ CRM клиента · ФИО, место работы, телефон · ${dstr(d.crmDate)}</div>
            <div class="grid g2" style="margin-top:8px;gap:8px"><div class="fact"><div class="l">Синхронизация с CRM клиента</div><div class="v">18.12.2025</div></div><div class="fact"><div class="l">Передано событий</div><div class="v num">${ev.filter(e => e.t !== 'field').length - (d === DB.bel ? 13 : 0)}</div></div></div></div>`
            : d.consentTransfer ? `<div class="idbox warn"><div class="l">ID в CRM клиента</div><div class="v">Ожидает сопоставления</div><div style="font-size:12.5px;color:var(--ink2);margin-top:4px">Согласие получено, автоматическое совпадение не найдено: врача нет в CRM клиента или данные расходятся. Передан на ручную проверку.</div></div>`
            : `<div class="idbox"><div class="l">ID в CRM клиента</div><div class="v muted">Не передаётся</div><div style="font-size:12.5px;color:var(--muted);margin-top:4px">Нет согласия врача на передачу контактов клиенту.</div></div>`}
        </div></div>
        <div class="card"><h3>Сегмент и потенциал</h3>
          <div class="grid g2" style="margin-top:12px;gap:10px"><div class="idbox" style="margin:0"><div class="l">Сегмент</div><div class="v" style="font-size:22px;color:var(--blue)">${d.seg}</div><div style="font-size:12.5px;color:var(--ink2)">${{ A: 'высокий потенциал', B: 'средний потенциал', C: 'базовый потенциал' }[d.seg]}</div></div>
          <div class="idbox" style="margin:0"><div class="l">Пациентов с головокружением</div><div class="v" style="font-size:22px">${d.patients != null ? DB.Q[0].opts[d.patients] : '—'}</div><div style="font-size:12.5px;color:var(--ink2)">${d.patients != null ? 'в месяц, по опросу' : 'опрос не пройден'}</div></div></div>
          <div class="idbox" style="margin-top:10px"><div class="row-flex"><div class="l" style="flex:1">Вовлечённость в проекте</div><b class="num">${String(d.score).replace('.', ',')} балла · <span class="g">${scoreLvl}</span></b></div>
            <div class="prog" style="margin-top:8px"><i style="width:${Math.min(100, d.score / 36 * 100)}%"></i></div><div class="row-flex muted" style="justify-content:space-between;font-size:11.5px;margin-top:4px"><span>знакомство</span><span>качественный контакт</span><span>ядро: 5+</span></div></div>
          <div class="l muted" style="font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-top:12px">Баллы по месяцам 2025</div>
          <div class="wk" style="height:100px;gap:8px">${mScore.map((s, i) => `<div class="b" data-tip="${MON[i]}: ${s.toFixed(1).replace('.', ',')} балла"><i style="height:${Math.max(2, s / mMax * 82)}%;background:${s >= 5 ? '#22b45e' : '#9fdcb4'}"></i><span>${MON1[i]}</span></div>`).join('')}</div></div>
        <div class="card"><h3>Согласия</h3><div style="margin-top:6px">
          ${consents.map((c, i) => `<div class="cons"><div class="ci" style="background:${c[0] ? '#dcfce7' : '#fee2e2'};color:${c[0] ? '#16a34a' : '#dc2626'}">${ic(c[0] ? 'check' : 'x', 'sm')}</div><div><b>${c[1]}</b><small>${cDesc[i]}</small></div></div>`).join('')}</div></div>
      </div>
      <div class="card mt"><div class="card-h"><h3>Активность в проекте за 2025 год</h3><a class="link" href="#/doctor/${d.id}/history">Открыть историю действий →</a></div>
        <div class="grid g6">${[['visit', 'Удалённые визиты', `${vis.length} из 4`, `${minsec(sumDur)} · ${vis.filter(v => v.rec).length} ${plural(vis.filter(v => v.rec).length, 'запись', 'записи', 'записей')}`, 'phone', 'c-blue'],
          ['survey', 'Опросы на визите', `${sv.length * 3} ${plural(sv.length * 3, 'ответ', 'ответа', 'ответов')}`, `${sv.length} ${plural(sv.length, 'опрос', 'опроса', 'опросов')} по 3 вопроса`, 'list', 'c-amber'],
          ['email', 'Email', `${d.opens} из ${d.emailsSent}`, `открыто · ${d.clicks} ${plural(d.clicks, 'клик', 'клика', 'кликов')}`, 'mail', 'c-amber'],
          ['web', 'Вебинары', `${d.nWeb} из 4`, `${d.webMin.reduce((a, b) => a + b, 0)} мин · эфир и записи`, 'video', 'c-pink'],
          ['land', 'Лендинг', `${d.landing} ${plural(d.landing, 'визит', 'визита', 'визитов')}`, `${d.nMats} ${plural(d.nMats, 'материал', 'материала', 'материалов')} · ${Math.round(landMin)} мин`, 'globe', 'c-violet'],
          ['file', 'Материалы пациентам', `${d.downloads}`, `${plural(d.downloads, 'памятка скачана', 'памятки скачаны', 'памяток скачано')}`, 'file', 'c-green']]
          .map(a => `<div class="act" data-hf="${a[0]}"><div class="ic ${a[5]}">${ic(a[4])}</div><div><div class="l">${a[1]}</div><div class="v num">${a[2]}</div><small>${a[3]}</small></div></div>`).join('')}</div>
        ${fieldN ? `<div class="muted" style="font-size:12.5px;margin-top:10px">${ic('pin', 'sm')} Из CRM клиента получено ${fieldN} ${plural(fieldN, 'полевой визит', 'полевых визита', 'полевых визитов')} медпредставителя — они отображаются в истории действий.</div>` : ''}</div>
      ${footer()}</main>`;
    bindHeader();
    $$('[data-hf]').forEach(a => a.addEventListener('click', () => { S.hist.filter = a.dataset.hf; location.hash = `#/doctor/${d.id}/history`; }));
    $('#plan').addEventListener('click', () => planModal(d));
  }
  function planModal(d) {
    const next = new Date(2026, 0, 19);
    modal(`<div class="mh"><h3>Запланировать удалённый визит</h3><button class="ibtn" data-close>${ic('x')}</button></div>
      <div class="mb"><div class="muted" style="margin-bottom:12px">${esc(d.fio)} · ${d.city} · ${mask(d)}</div>
      <div class="row2"><div class="fld"><label>Дата</label><input class="inp" type="date" id="pd" value="${toInput(next)}"></div><div class="fld"><label>Время (МСК)</label><input class="inp" type="time" id="pt" value="11:30"></div></div>
      <div class="fld"><label>Оператор</label><select class="inp" id="po">${DB.OPERATORS.map(o => `<option value="${o.id}">${o.name}</option>`).join('')}</select></div>
      <div class="fld"><label>Тема</label><select class="inp" id="pth"><option>Дополнительный визит: разбор клинического случая</option>${DB.WAVES.map(w => `<option>${w.theme}</option>`).join('')}</select></div>
      <label class="row-flex" style="gap:8px;font-size:13.5px"><input type="checkbox" checked style="accent-color:#2563eb" id="psms"> Отправить SMS-напоминание врачу за 2 дня</label></div>
      <div class="mf"><button class="btn" data-close>Отмена</button><button class="btn pri" id="pok">Запланировать</button></div>`, (bg, close) => {
      $('#pok', bg).addEventListener('click', () => {
        const dt = parseD($('#pd', bg).value); const [h, m] = $('#pt', bg).value.split(':').map(Number); dt.setHours(h, m);
        const op = DB.OPERATORS.find(o => o.id === +$('#po', bg).value);
        (S.planned[d.id] = S.planned[d.id] || []).push({ date: dt, op, theme: $('#pth', bg).value, sms: $('#psms', bg).checked });
        close(); toast('Визит запланирован', `${dstr(dt)} в ${tstr(dt)} · оператор ${op.name}`); if (location.hash.includes('/history')) render();
      });
    });
  }
  function vHistory(d, ev, vis) {
    const H = S.hist;
    const planned = (S.planned[d.id] || []).map(p => ({ t: 'plan', date: p.date, title: 'Запланирован удалённый визит', desc: `Оператор: ${p.op.name} · тема «${p.theme}»${p.sms ? ' · SMS-напоминание за 2 дня' : ''}`, planned: true }));
    const all = [...planned, ...ev];
    const cats = [['all', 'Все', all.length], ['visit', 'Удалённые визиты', ev.filter(e => e.t === 'visit').length], ['survey', 'Опросы', ev.filter(e => e.t === 'visit' && e.v.survey).length], ['email', 'Email', ev.filter(e => e.t === 'email').length], ['sms', 'SMS', ev.filter(e => e.t === 'sms').length], ['web', 'Вебинары', ev.filter(e => e.t === 'web').length], ['land', 'Лендинг', ev.filter(e => e.t === 'land' || e.t === 'file').length], ['field', 'CRM клиента', ev.filter(e => e.t === 'field').length], ['consent', 'Согласия', ev.filter(e => e.t === 'consent').length]].filter(c => c[2] || c[0] === 'all');
    if (!cats.find(c => c[0] === H.filter)) H.filter = 'all';
    const list = all.filter(e => H.filter === 'all' || (H.filter === 'survey' ? e.t === 'visit' && e.v.survey : H.filter === 'land' ? e.t === 'land' || e.t === 'file' : e.t === H.filter));
    const recVis = vis.filter(v => v.rec);
    const sel = (H.sel && VMAP[H.sel] && VMAP[H.sel].doc === d) ? VMAP[H.sel] : recVis[recVis.length - 1];
    const profile = [
      [new Date(2025, 11, 18, 6, 0), 'Синхронизация с CRM клиента', d.crm ? `Передано событий: ${ev.length - 13 > 0 ? ev.length - 13 : ev.length}. Ошибок нет.` : 'Врач не передаётся: нет согласия'],
      ...(d.crm ? [[d.crmDate, 'Совпадение с CRM клиента подтверждено', `IQKey ${d.iq} ↔ ${d.crm} · по ФИО, месту работы и телефону`]] : []),
      ...(vis.length ? [[vis[vis.length - 1].date, 'Обновлён сегмент и потенциал', `Сегмент ${d.seg} · пациентов с головокружением: ${d.patients != null ? DB.Q[0].opts[d.patients] : '—'} (по опросу)`]] : []),
      ...(vis.length ? [[vis[0].date, 'Телефон валидирован', `${mask(d)} · подтверждён на удалённом визите`]] : []),
      [d.joined || new Date(2025, 0, 13), 'Профиль добавлен в проект', `Источник: база IQKey · ${d.clinic} · ${d.city}`],
    ].sort((a, b) => b[0] - a[0]);
    app.innerHTML = `${header('doctors')}<main class="main fade">
      <div class="crumbs"><span class="t"><a href="#/doctors">Врачи проекта</a> · <a href="#/doctor/${d.id}">Карточка врача</a> · История действий</span><span class="muted">${d.city}</span></div>
      ${docHeader(d, true)}
      <div class="grid mt" style="grid-template-columns:1.6fr 1fr;align-items:start">
        <div class="card"><div class="card-h"><h3>История действий врача · StopVertigo 2025</h3><div class="tabs"><button class="${H.view === 'act' ? 'on' : ''}" data-view="act">Действия врача</button><button class="${H.view === 'prof' ? 'on' : ''}" data-view="prof">История профиля</button></div></div>
          ${H.view === 'act' ? `<div class="chips">${cats.map(c => `<button class="chip ${H.filter === c[0] ? 'on' : ''}" data-hf="${c[0]}">${c[1]} · ${c[2]}</button>`).join('')}</div>
          <div class="tl"><div class="tl-line"></div>${list.slice(0, 60).map(e => { const t = TL[e.t]; return `<div class="tl-i"><div class="tl-d">${dstr(e.date)}<small>${tstr(e.date)}</small></div><div class="tl-ic ${t[1]}">${ic(t[0])}</div>
            <div class="tl-c ${e.planned ? 'planned' : ''}" ${e.muted ? 'style="opacity:.75"' : ''}><b>${e.title}${e.planned ? ' <span class="tag blue" style="margin-left:6px">запланировано</span>' : ''}</b><div class="d">${esc(e.desc)}</div>
            ${e.t === 'visit' && e.v.status === 'done' ? `<div class="x">${e.v.rec ? `<button class="tag blue" style="border:0;cursor:pointer" data-hsel="${e.v.id}">${ic('play', 'sm')}Прослушать запись</button>` : ''}${e.v.survey ? `<span class="tag green">Опрос: 3 из 3 ответов${e.v.wave === 4 && e.v.target ? ' · интерес к клиническому разбору — да' : ''}</span>` : '<span class="tag gray">Опрос не проведён</span>'}</div>` : ''}
            ${e.crm ? `<div class="x"><span class="tag">${ic('link', 'sm')}Данные из CRM клиента · ${d.crm}</span></div>` : ''}</div></div>`; }).join('')}</div>
          ${list.length > 60 ? `<div class="muted" style="text-align:center;font-size:13px">Показаны последние 60 событий из ${list.length}</div>` : ''}`
          : `<div class="tl" style="margin-top:14px"><div class="tl-line"></div>${profile.map(p => `<div class="tl-i"><div class="tl-d">${dstr(p[0])}<small>${tstr(p[0])}</small></div><div class="tl-ic c-gray">${ic('edit')}</div><div class="tl-c"><b>${p[1]}</b><div class="d">${esc(p[2])}</div></div></div>`).join('')}</div>`}
        </div>
        <div>
          ${sel ? `<div class="card"><h3>Запись визита ${dstr(sel.date)}</h3><div class="sub">${sel.rv} · ${sel.op.name} · ${minsec(sel.dur)}</div>
            <div class="row-flex" style="margin:14px 0 6px"><button class="bigplay" data-play="${sel.id}">${ic('play')}</button><div class="ptrack" data-prog="${sel.id}" data-seek="${sel.id}"><i class="fill"></i></div></div>
            <div class="row-flex muted" style="justify-content:space-between;font-size:12.5px"><span data-ptime="${sel.id}">0:00 / ${mmss(sel.dur)}</span><span>Волна ${sel.wave} · ${DB.WAVES[sel.wave - 1].short}</span></div>
            ${sel.survey ? `<div class="l muted" style="font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-top:12px">Ответы на опрос</div><div class="answers">
              <div class="a"><small>${DB.Q[0].text}</small><b>${DB.Q[0].opts[sel.survey.q1]}</b></div><div class="a"><small>${DB.Q[1].text}</small><b>${sel.survey.q2.map(i => DB.Q[1].opts[i].replace('Проба ', '')).join(', ')}</b></div><div class="a" style="border:0"><small>${DB.Q[2].text}</small><b>${DB.Q[2].opts[sel.survey.q3]}</b></div></div>` : '<div class="muted" style="margin-top:10px">Опрос в этом визите не проводился</div>'}
            ${recVis.length > 1 ? `<div class="chips" style="margin-top:12px">${recVis.map(v => `<button class="chip ${v === sel ? 'on' : ''}" data-hsel="${v.id}">Визит ${v.wave} · ${dstr(v.date).slice(0, 5)}</button>`).join('')}</div>` : ''}</div>` : '<div class="card"><h3>Записи визитов</h3><div class="empty">Нет записей</div></div>'}
          <div class="card mt"><h3>Путь врача в проекте</h3><div class="sub">4 волны визитов и поддерживающие каналы</div>
            <div class="path">${DB.WAVES.map(w => { const v = DB.visits.find(x => x.doc === d && x.wave === w.n && x.status === 'done'); const miss = !v && DB.visits.some(x => x.doc === d && x.wave === w.n); return `<div class="step"><div class="c ${v ? 'done' : miss ? 'miss' : ''}">${ic(v ? 'check' : miss ? 'phone' : 'x', 'sm')}</div><b>Визит ${w.n}</b><small>${v ? MONG[v.date.getMonth()].replace('мая', 'май') : miss ? 'перенесён' : 'нет'}</small></div>`; }).join('')}</div>
            <div class="grid g2 mt" style="gap:10px"><div class="mini"><div class="l">После визитов</div><div class="v">${d.nWeb} ${plural(d.nWeb, 'вебинар', 'вебинара', 'вебинаров')} · ${d.nMats} ${plural(d.nMats, 'материал', 'материала', 'материалов')}</div></div><div class="mini"><div class="l">Баллы вовлечения</div><div class="v">${String(d.score).replace('.', ',')} · ${d.quality >= 5 ? 'ядро' : STAGE[d.stage][0].toLowerCase()}</div></div></div>
            <button class="btn out" style="width:100%;justify-content:center;margin-top:12px" id="plan">${ic('phone', 'sm')}Запланировать визит</button></div>
        </div></div>${footer()}</main>`;
    bindHeader();
    $$('[data-view]').forEach(b => b.addEventListener('click', () => { H.view = b.dataset.view; render(); }));
    $$('[data-hf]').forEach(b => b.addEventListener('click', () => { H.filter = b.dataset.hf; render(); }));
    $$('[data-hsel]').forEach(b => b.addEventListener('click', () => { const v = VMAP[+b.dataset.hsel]; H.sel = v.id; render(); playVisit(v); if (cur && cur.vid === v.id && audio.paused) audio.play(); }));
    $$('[data-play]').forEach(b => b.addEventListener('click', () => playVisit(VMAP[+b.dataset.play])));
    $$('[data-seek]').forEach(w => w.addEventListener('click', e => { const v = VMAP[+w.dataset.seek]; const r = w.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; if (!cur || cur.vid !== v.id) playVisit(v); const go = () => { audio.currentTime = f * AM[v.audio]; }; if (audio.readyState > 0) go(); else audio.addEventListener('loadedmetadata', go, { once: true }); }));
    $('#plan').addEventListener('click', () => planModal(d));
    syncPlayers();
  }

  // ======================================================================
  // CHANNELS
  // ======================================================================
  function vChannels() {
    const T = S.chan.tab;
    const E = DB.EMAILS; const sent = E.reduce((s, e) => s + e.sent, 0), op = E.reduce((s, e) => s + e.opens, 0), cl = E.reduce((s, e) => s + e.clicks, 0);
    const webStats = DB.WEBINARS.map((w, i) => { const ds = DB.doctors.filter(d => d.webinars[i]); const mins = ds.reduce((s, d) => s + d.webMin[i], 0); const recN = ds.filter(d => d.webRec[i]).length; return { w, n: ds.length, live: ds.length - recN, recN, reg: Math.round((ds.length - recN) * [1.58, 1.71, 1.49, 1.64][i]), avg: mins / (ds.length || 1), q: Math.round(ds.length * 0.06), rate: [4.7, 4.8, 4.8, 4.9][i] }; });
    const matStats = DB.MATERIALS.map(m => { const ds = DB.doctors.filter(d => d.mats.includes(m.id)); return { m, docs: ds.length, views: ds.reduce((s, d) => s + Math.max(1, Math.round(d.landing / d.mats.length)), 0) }; }).sort((a, b) => b.views - a.views);
    const land = DB.doctors.reduce((s, d) => s + d.landing, 0);
    let body = '';
    if (T === 'email') {
      const rs = E.reduce((s, e) => s + e.re.sent, 0), ro = E.reduce((s, e) => s + e.re.opens, 0), rc = E.reduce((s, e) => s + e.re.clicks, 0);
      const showRe = S.chan.re !== false;
      const lt = ls => ls.reduce((a, l) => a + l.clicks, 0);
      const row = (e, r) => { const m = r ? e.re : e; const open = S.chan.open === e.n;
        return `<tr class="click ${r ? 'em-re' : 'em-main'} ${open && !r ? 'exp' : ''}" data-emrow="${e.n}">
          <td class="muted">${r ? '' : e.n}</td><td class="num">${dstr(m.date)}${r ? `<div class="muted" style="font-size:12px">${tstr(m.date)}</div>` : ''}</td>
          <td>${r ? `<span class="tag amber" style="margin-bottom:3px">${ic('sync', 'sm')}Догонялка · не открывшим</span><div style="font-size:13px">${m.subject}</div>` : `<div style="font-weight:500">${m.subject}</div>`}</td>
          <td><a class="tpl" href="#" data-tpl="${e.n}" data-tre="${r ? 1 : 0}">${ic('file', 'sm')}${m.tpl}</a></td>
          <td class="r num">${fmt(m.sent)}</td><td class="r num">${fmt(m.opens)}</td><td class="r num"><b>${pct(m.opens / m.sent)}</b></td>
          <td class="r num">${fmt(m.clicks)}</td><td class="r num">${pct(m.clicks / m.sent)}</td><td class="r num">${pct(m.clicks / m.opens)}</td>
          <td class="r">${r ? '' : `<span class="chev ${open ? 'on' : ''}">${ic('chev', 'sm')}</span>`}</td></tr>`; };
      const detail = e => { const L = e.links.map((l, k) => ({ ...l, rc: e.re.links[k].clicks }));
        const reach = e.opens + e.re.opens, reachC = e.clicks + e.re.clicks;
        return `<tr class="em-det"><td></td><td colspan="10"><div class="em-box">
          <div class="grid g4" style="gap:8px">
            <div class="mini"><div class="l">Открыли письмо всего</div><div class="v num">${fmt(reach)}</div><div class="muted" style="font-size:12px">${pct(reach / e.sent)} от отправленных · догонялка +${pct(e.re.opens / e.sent)}</div></div>
            <div class="mini"><div class="l">Перешли всего</div><div class="v num">${fmt(reachC)}</div><div class="muted" style="font-size:12px">${pct(reachC / e.sent)} от отправленных</div></div>
            <div class="mini"><div class="l">Недоставлено</div><div class="v num">${fmt(e.bounce + e.re.bounce)}</div><div class="muted" style="font-size:12px">${pct((e.bounce) / e.sent)} основной рассылки</div></div>
            <div class="mini"><div class="l">Отписки</div><div class="v num">${fmt(e.unsub + e.re.unsub)}</div><div class="muted" style="font-size:12px">основная ${e.unsub} · догонялка ${e.re.unsub}</div></div>
          </div>
          <table class="links" style="margin-top:10px"><thead><tr><th>Ссылка в письме</th><th>Адрес</th><th class="r">Основная рассылка</th><th class="r">Догонялка</th><th class="r">Всего переходов</th><th style="width:22%">Доля</th></tr></thead><tbody>
          ${L.map(l => { const t = l.clicks + l.rc, all = lt(e.links) + lt(e.re.links); return `<tr><td style="font-weight:500">${l.name}</td><td class="muted url">stopvertigo.ru/${l.path}?utm_campaign=${e.camp}</td><td class="r num">${fmt(l.clicks)}</td><td class="r num">${fmt(l.rc)}</td><td class="r num"><b>${fmt(t)}</b></td><td><div class="prog" style="background:#eef1f5"><i style="width:${t / all * 100}%;background:#2f6bea"></i></div><span class="muted num" style="font-size:12px">${pct(t / all, 0)}</span></td></tr>`; }).join('')}
          <tr class="tot"><td>Итого кликов</td><td class="muted">уникальных кликнувших: ${fmt(e.clicks)} + ${fmt(e.re.clicks)}</td><td class="r num">${fmt(lt(e.links))}</td><td class="r num">${fmt(lt(e.re.links))}</td><td class="r num"><b>${fmt(lt(e.links) + lt(e.re.links))}</b></td><td></td></tr></tbody></table>
          <div class="row-flex" style="margin-top:10px;gap:8px"><button class="btn sm out" data-tpl="${e.n}" data-tre="0">${ic('mail', 'sm')}Шаблон письма</button><button class="btn sm out" data-tpl="${e.n}" data-tre="1">${ic('sync', 'sm')}Шаблон догонялки</button><span class="sp"></span><span class="muted" style="font-size:12px">Догонялка отправлена ${dstr(e.re.date)} в ${tstr(e.re.date)} тем, кто не открыл письмо за 3 дня (без отписавшихся и недоставленных)</span></div>
        </div></td></tr>`; };
      body = `<div class="grid g4">${[['Отправлено писем', fmt(sent), '24 рассылки · без догонялок', 'mail', 'c-amber'], ['Open rate', pct(op / sent), `${fmt(op)} открытий`, 'chart', 'c-blue'], ['CTR', pct(cl / sent), `${fmt(cl)} переходов`, 'link', 'c-teal'], ['CTOR', pct(cl / op), 'переходы от открытий', 'star', 'c-violet']].map(k => `<div class="card kpi compact" style="cursor:default"><div class="k-t">${k[0]}</div><div class="badge-ic ${k[4]}">${ic(k[3], 'lg')}</div><div class="k-v num">${k[1]}</div><div class="k-f">${k[2]}</div></div>`).join('')}</div>
      <div class="card mt re-strip"><div class="badge-ic c-amber">${ic('sync', 'lg')}</div><div><b>Догонялки тем, кто не открыл</b><small>через 3 дня после основной рассылки, с другой темой письма</small></div>
        <div class="re-k"><span>Отправлено</span><b class="num">${fmt(rs)}</b></div><div class="re-k"><span>OR</span><b class="num">${pct(ro / rs)}</b></div><div class="re-k"><span>CTR</span><b class="num">${pct(rc / rs)}</b></div><div class="re-k"><span>CTOR</span><b class="num">${pct(rc / ro)}</b></div>
        <div class="re-k hl"><span>Охват открытий с догонялками</span><b class="num">${pct(op / sent)} → ${pct((op + ro) / sent)}</b></div></div>
      <div class="card mt"><h3>Open rate и CTR по рассылкам</h3><div style="height:220px;margin-top:8px"><canvas id="chEm"></canvas></div></div>
      <div class="card mt"><div class="row-flex"><div><h3>Отчёт по рассылкам</h3><div class="sub">Нажмите на рассылку, чтобы увидеть переходы по каждой ссылке</div></div><span class="sp"></span>
        <label class="chk"><input type="checkbox" id="emRe" ${showRe ? 'checked' : ''}> Показывать догонялки</label>
        <button class="btn sm out" id="emCsv">${ic('dl', 'sm')}Выгрузить CSV</button></div>
        <table class="emrep" style="margin-top:10px"><thead><tr><th>№</th><th>Дата</th><th>Тема письма</th><th>Шаблон</th><th class="r">Отправлено</th><th class="r">Открыто</th><th class="r">OR</th><th class="r">Переходы</th><th class="r">CTR</th><th class="r">CTOR</th><th></th></tr></thead><tbody>
        ${E.slice().reverse().map(e => row(e, false) + (showRe ? row(e, true) : '') + (S.chan.open === e.n ? detail(e) : '')).join('')}
        <tr class="tot"><td></td><td colspan="3">Итого основные рассылки</td><td class="r num">${fmt(sent)}</td><td class="r num">${fmt(op)}</td><td class="r num">${pct(op / sent)}</td><td class="r num">${fmt(cl)}</td><td class="r num">${pct(cl / sent)}</td><td class="r num">${pct(cl / op)}</td><td></td></tr>
        ${showRe ? `<tr class="tot"><td></td><td colspan="3">Итого догонялки</td><td class="r num">${fmt(rs)}</td><td class="r num">${fmt(ro)}</td><td class="r num">${pct(ro / rs)}</td><td class="r num">${fmt(rc)}</td><td class="r num">${pct(rc / rs)}</td><td class="r num">${pct(rc / ro)}</td><td></td></tr>` : ''}
        </tbody></table>
        <div class="muted" style="font-size:12px;margin-top:10px">Открыто и переходы — уникальные врачи. OR = открыто / отправлено, CTR = переходы / отправлено, CTOR = переходы / открыто. В детализации по ссылкам — все клики, один врач может перейти по нескольким ссылкам.</div></div>`;
    }
    if (T === 'webinars') body = `<div class="grid g4">${webStats.map(s => `<div class="card"><div class="row-flex"><span class="tag ${s.w.date < DB.NOW ? 'green' : 'blue'}">Проведён</span><span class="muted" style="font-size:13px">${dstr(s.w.date)} · 19:00</span></div><h3 style="font-size:15px;margin-top:10px;min-height:42px">${s.w.title}</h3><div class="sub">${s.w.speaker} · ${s.w.dur} мин</div>
      <div class="grid g2" style="gap:8px;margin-top:12px"><div class="mini"><div class="l">Регистрации</div><div class="v num">${fmt(s.reg)}</div></div><div class="mini"><div class="l">Участники</div><div class="v num">${fmt(s.n)}</div></div><div class="mini"><div class="l">Эфир / запись</div><div class="v num">${fmt(s.live)} / ${fmt(s.recN)}</div></div><div class="mini" data-tip="Среднее время просмотра на участника: прямой эфир и запись на лендинге вместе"><div class="l">Среднее время</div><div class="v num">${Math.round(s.avg)} мин</div></div></div>
      <div class="row-flex" style="margin-top:10px;font-size:13px"><span class="muted">Доходимость до эфира</span><span class="sp"></span><b>${pct(s.live / s.reg, 0)}</b></div><div class="prog" style="margin-top:4px;background:#eef1f5"><i style="width:${s.live / s.reg * 100}%;background:#d63a9a"></i></div>
      <div class="row-flex" style="margin-top:10px;font-size:13px"><span class="muted">Оценка эфира</span><span class="sp"></span><b>${String(s.rate).replace('.', ',')} / 5</b></div></div>`).join('')}</div>
      <div class="card mt"><h3>Участники вебинаров по сегментам</h3><div class="sub">эфир и просмотр записи на лендинге</div><table style="margin-top:8px"><thead><tr><th>Вебинар</th>${['A', 'B', 'C'].map(s => `<th class="r">Сегмент ${s}</th>`).join('')}<th class="r">Всего</th><th class="r">Из ядра проекта</th></tr></thead><tbody>
      ${DB.WEBINARS.map((w, i) => { const ds = DB.doctors.filter(d => d.webinars[i]); return `<tr><td>${dstr(w.date)} · ${w.title}</td>${['A', 'B', 'C'].map(s => `<td class="r num">${fmt(ds.filter(d => d.seg === s).length)}</td>`).join('')}<td class="r num"><b>${fmt(ds.length)}</b></td><td class="r num">${pct(ds.filter(d => d.quality >= 5).length / (ds.length || 1), 0)}</td></tr>`; }).join('')}</tbody></table></div>`;
    if (T === 'landing') body = `<div class="grid g4">${[['Визитов на лендинг', fmt(land), 'идентифицированные врачи', 'globe', 'c-violet'], ['Уникальных врачей', fmt(DB.doctors.filter(d => d.landing).length), 'хотя бы 1 визит', 'users', 'c-blue'], ['Материалов', DB.MATERIALS.length, 'видео, статьи, разборы, памятки', 'file', 'c-green'], ['Скачиваний памяток', fmt(DB.doctors.reduce((s, d) => s + d.downloads, 0)), 'для пациентов', 'dl', 'c-amber']].map(k => `<div class="card kpi compact" style="cursor:default"><div class="k-t">${k[0]}</div><div class="badge-ic ${k[4]}">${ic(k[3], 'lg')}</div><div class="k-v num">${k[1]}</div><div class="k-f">${k[2]}</div></div>`).join('')}</div>
      <div class="grid mt" style="grid-template-columns:1.5fr 1fr"><div class="card"><h3>Материалы лендинга</h3><table style="margin-top:8px"><thead><tr><th>Материал</th><th>Тип</th><th class="r">Просмотры</th><th class="r">Врачей</th><th class="r">Время</th></tr></thead><tbody>
      ${matStats.map(s => `<tr><td style="font-weight:500">${s.m.title}</td><td><span class="tag">${s.m.type}</span></td><td class="r num">${fmt(s.views)}</td><td class="r num">${fmt(s.docs)}</td><td class="r num">${s.m.time}</td></tr>`).join('')}</tbody></table></div>
      <div class="card"><h3>Визиты на лендинг по месяцам</h3><div style="height:260px;margin-top:8px"><canvas id="chLand"></canvas></div><div class="sub" style="margin-top:8px">Источники: рассылки 46% · после визита 31% · SMS 9% · прямые заходы 14%</div></div></div>`;
    app.innerHTML = `${header('channels')}<main class="main fade">
      <div class="crumbs"><span class="t">Каналы коммуникации · StopVertigo 2025</span><div class="tabs">${[['email', 'Email-рассылки'], ['webinars', 'Вебинары'], ['landing', 'Лендинг проекта']].map(t => `<button class="${T === t[0] ? 'on' : ''}" data-ctab="${t[0]}">${t[1]}</button>`).join('')}</div></div>
      ${body}${footer()}</main>`;
    bindHeader();
    $$('[data-ctab]').forEach(b => b.addEventListener('click', () => { location.hash = `#/channels?tab=${b.dataset.ctab}`; }));
    killCharts();
    if (T === 'email') {
      $$('[data-emrow]').forEach(tr => tr.addEventListener('click', ev => { if (ev.target.closest('[data-tpl]')) return; const n = +tr.dataset.emrow; S.chan.open = S.chan.open === n ? null : n; const y = window.scrollY; vChannels(); window.scrollTo(0, y); }));
      $$('[data-tpl]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); emailPreview(DB.EMAILS[+a.dataset.tpl - 1], a.dataset.tre === '1'); }));
      $('#emRe').addEventListener('change', ev => { S.chan.re = ev.target.checked; const y = window.scrollY; vChannels(); window.scrollTo(0, y); });
      $('#emCsv').addEventListener('click', () => { const rows = buildReport('email'); const kb = downloadCSV('StopVertigo_Отчёт_по_рассылкам.csv', rows); toast('Отчёт выгружен', `${fmt(rows.length - 1)} строк · ${Math.max(1, Math.round(kb))} КБ`); });
    }
    if (T === 'email') charts.push(new Chart($('#chEm'), { type: 'line', data: { labels: E.map(e => dstr(e.date).slice(0, 5)), datasets: [{ label: 'OR', data: E.map(e => +(e.opens / e.sent * 100).toFixed(1)), borderColor: '#2f6bea', backgroundColor: 'rgba(47,107,234,.08)', fill: true, tension: .3, pointRadius: 3 }, { label: 'CTR', data: E.map(e => +(e.clicks / e.sent * 100).toFixed(1)), borderColor: '#4b9b98', tension: .3, pointRadius: 3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { title: it => E[it[0].dataIndex].subject, label: it => ` ${it.dataset.label}: ${String(it.raw).replace('.', ',')}%` } } }, scales: { y: { ticks: { callback: v => v + '%' }, grid: { color: '#eef1f5' }, border: { display: false } }, x: { grid: { display: false } } } } }));
    if (T === 'landing') charts.push(new Chart($('#chLand'), { type: 'bar', data: { labels: MON, datasets: [{ data: DB.LAND_PROFILE.map(p => Math.round(p * land)), backgroundColor: '#8b5cf6', borderRadius: 3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: it => ` ${fmt(it.raw)} визитов` } } }, scales: { y: { grid: { color: '#eef1f5' }, border: { display: false }, ticks: { callback: v => fmt(v) } }, x: { grid: { display: false } } } } }));
  }

  // ======================================================================
  // REPORTS
  // ======================================================================
  // ---------- шаблон письма ----------
  const EM_BODY = {
    invite: e => [`Приглашаем вас на онлайн-вебинар проекта StopVertigo. Эфир пройдёт в 19:00 по московскому времени, продолжительность около часа.`, `В программе: разбор клинических ситуаций, алгоритм осмотра пациента с головокружением и ответы на вопросы из чата. Запись будет доступна на сайте проекта всем зарегистрированным участникам.`],
    record: e => [`Запись эфира уже доступна на сайте проекта. Её можно посмотреть в удобное время — целиком или по главам.`, `К записи приложены презентация спикера и ответы на вопросы, которые не успели разобрать в эфире.`],
    case: e => [`Новый клинический разбор в формате «шаг за шагом»: жалобы, осмотр, дифференциальный диагноз и тактика ведения.`, `На каждом этапе можно выбрать своё решение и сравнить его с комментарием эксперта. Прохождение занимает около 10 минут.`],
    video: e => [`Короткое видео с пошаговым выполнением техники и типичными ошибками. Длительность — около 6 минут.`, `Для пациента подготовлена памятка, которую удобно распечатать и отдать на приёме.`],
    memo: e => [`Готовый материал для работы на приёме: его можно скачать, распечатать и использовать с пациентами.`, `Все памятки и шкалы проекта собраны в одном разделе сайта.`],
    article: e => [`Короткий практический материал для невролога амбулаторного звена — время чтения около 5 минут.`, `В конце статьи — ключевые выводы для приёма и список литературы.`],
    digest: e => [`Собрали в одном письме главное за год в проекте StopVertigo: записи вебинаров, клинические разборы и материалы для пациентов.`, `Спасибо, что были с нами. Все материалы остаются доступными на сайте проекта.`],
  };
  function emailPreview(e, isRe) {
    const m = isRe ? e.re : e; const L = (isRe ? e.re.links : e.links);
    const pre = isRe ? 'Вы не открыли наше письмо — коротко напоминаем, что внутри.' : 'Материалы для практикующего невролога · проект StopVertigo';
    const [p1, p2] = EM_BODY[e.type](e);
    modal(`<div class="mh"><h3>${ic('mail')} Шаблон ${m.tpl}</h3><button class="btn sm ghost" data-close>${ic('x', 'sm')}</button></div>
      <div class="mb">
        <div class="em-meta"><div><span>От</span><b>Проект StopVertigo &lt;info@stopvertigo.ru&gt;</b></div><div><span>Тема</span><b>${m.subject}</b></div><div><span>Прехедер</span>${pre}</div><div><span>Отправка</span>${dstr(m.date)} в ${tstr(m.date)} · ${fmt(m.sent)} получателей${isRe ? ' · не открывшие основное письмо' : ''}</div></div>
        <div class="em-prev">
          <div class="em-hd"><b>StopVertigo</b><span>образовательный проект для неврологов</span></div>
          <div class="em-bd">
            <p>Здравствуйте, {{Имя Отчество}}!</p>
            ${isRe ? `<p>Несколько дней назад мы отправили вам письмо «${e.subject}». Возможно, оно затерялось среди других — продублируем главное.</p>` : ''}
            <h2>${e.subject}</h2><p>${p1}</p><p>${p2}</p>
            <a class="em-cta" data-lk>${L[0].name}</a>
            <div class="em-links">${L.slice(1).map(l => `<a data-lk>${l.name} →</a>`).join('')}</div>
          </div>
          <div class="em-ft">Вы получили это письмо, так как дали согласие на получение информационных рассылок проекта StopVertigo. <u>Отписаться</u> · <u>Политика конфиденциальности</u></div>
        </div>
        <div class="muted" style="font-size:12px;margin-top:8px">Переходы по ссылкам: ${L.map(l => `${l.name} — ${fmt(l.clicks)}`).join(' · ')}</div>
      </div>
      <div class="mf"><button class="btn sm out" data-close>Закрыть</button></div>`, bg => { bg.querySelectorAll('[data-lk]').forEach(a => a.addEventListener('click', ev => ev.preventDefault())); }, 'wide');
  }

  const REPORTS = [
    ['sum', 'Сводный отчёт по проекту', 'KPI по каналам, воронка вовлечения, промоплан — помесячно', 'chart', 'c-blue'],
    ['email', 'Отчёт по рассылкам', 'Каждая рассылка и догонялка: дата, тема, шаблон, отправлено, OR, CTR, CTOR, переходы по каждой ссылке', 'mail', 'c-amber'],
    ['vis', 'Визиты и опросы', 'Все визиты с результатом, длительностью, номером записи и ответами на опрос', 'phone', 'c-amber'],
    ['cons', 'Врачи с согласием на передачу контактов', 'Для загрузки в CRM клиента: ФИО, место работы, город, IQKey, рабочий телефон', 'shield', 'c-green'],
    ['match', 'Сопоставление с CRM клиента', 'IQKey ↔ ID в CRM клиента, статус совпадения, дата синхронизации', 'link', 'c-violet'],
    ['core', 'Ядро проекта', 'Врачи с 5+ качественными контактами: баллы, каналы, последний контакт', 'star', 'c-pink'],
    ['geo', 'География охвата', 'Целевые врачи, охват и ядро по городам и регионам', 'pin', 'c-teal'],
  ];
  function buildReport(k) {
    const D = DB.doctors;
    if (k === 'sum') { const r = [['Месяц', 'Удалённые визиты', 'Email отправлено', 'Email открыто', 'Клики', 'Участники вебинаров', 'Визиты на лендинг']]; const X = (S.dash.cities = S.dash.cities, dashData()); MON.forEach((m, i) => { const em = DB.EMAILS.filter(e => e.date.getMonth() === i); r.push([m + ' 2025', X.months[i].v, em.reduce((s, e) => s + e.sent, 0), em.reduce((s, e) => s + e.opens, 0), em.reduce((s, e) => s + e.clicks, 0), X.months[i].w, Math.round(X.months[i].l)]); }); return r; }
    if (k === 'vis') { const r = [['Дата', 'ID врача', 'Врач', 'Город', 'Оператор', 'Волна', 'Длительность, с', 'Результат', 'Запись', 'Q1', 'Q2', 'Q3']]; DB.visits.forEach(v => r.push([dstr(v.date) + ' ' + tstr(v.date), v.doc.id, v.doc.fio, v.doc.city, v.op.name, v.wave, v.dur, STATUS[vStatus(v)][0], v.rv || '', v.survey ? DB.Q[0].opts[v.survey.q1] : '', v.survey ? v.survey.q2.map(i => DB.Q[1].opts[i]).join(', ') : '', v.survey ? DB.Q[2].opts[v.survey.q3] : ''])); return r; }
    if (k === 'cons') { const r = [['ID', 'Врач', 'Место работы', 'Город', 'Регион', 'IQKey ID', 'Телефон (маск.)', 'Дата согласия']]; D.filter(d => d.consentTransfer).forEach(d => { const v = DB.visits.find(x => x.doc === d && x.consent); r.push([d.id, d.fio, d.clinic, d.city, d.region, d.iq, mask(d), v ? dstr(v.date) : '']); }); return r; }
    if (k === 'match') { const r = [['IQKey ID', 'ID Клифар CRM', 'Врач', 'ID в CRM клиента', 'Статус', 'Дата сопоставления']]; D.filter(d => d.consentTransfer).forEach(d => r.push([d.iq, d.id, d.fio, d.crm || '', d.crm ? 'Совпадение подтверждено' : 'Ожидает сопоставления', d.crm ? dstr(d.crmDate) : ''])); return r; }
    if (k === 'core') { const r = [['ID', 'Врач', 'Город', 'Сегмент', 'Визиты', 'Вебинары', 'Материалы', 'Баллы']]; D.filter(d => d.quality >= 5).sort((a, b) => b.score - a.score).forEach(d => r.push([d.id, d.fio, d.city, d.seg, d.nVisits, d.nWeb, d.nMats, String(d.score).replace('.', ',')])); return r; }
    if (k === 'email') { const p = x => (x * 100).toFixed(1).replace('.', ','); const r = [['Тип строки', '№', 'Дата', 'Тема письма', 'Шаблон', 'Ссылка', 'Адрес ссылки', 'Отправлено', 'Открыто', 'OR, %', 'Переходы (уникальные)', 'CTR, %', 'CTOR, %', 'Клики по ссылке']];
      DB.EMAILS.forEach(e => { [[e, 'Рассылка'], [e.re, 'Догонялка']].forEach(([m, t]) => { r.push([t, e.n, dstr(m.date) + ' ' + tstr(m.date), m.subject, m.tpl, '', '', m.sent, m.opens, p(m.opens / m.sent), m.clicks, p(m.clicks / m.sent), p(m.clicks / m.opens), '']); m.links.forEach(l => r.push(['Ссылка · ' + t.toLowerCase(), e.n, dstr(m.date), m.subject, m.tpl, l.name, `https://stopvertigo.ru/${l.path}?utm_source=email&utm_campaign=${e.camp}${t === 'Догонялка' ? '-r' : ''}`, '', '', '', '', '', '', l.clicks])); }); });
      return r; }
    if (k === 'geo') { const r = [['Город', 'Регион', 'Целевые врачи', 'Хотя бы 1 контакт', 'Качественный контакт', 'Ядро', 'Охват, %']]; DB.CITIES.forEach(c => { const ds = D.filter(d => d.city === c); r.push([c, DB.cityRegion[c], ds.length, ds.filter(d => d.anyContact).length, ds.filter(d => d.quality >= 1).length, ds.filter(d => d.quality >= 5).length, (ds.filter(d => d.quality >= 1).length / ds.length * 100).toFixed(1).replace('.', ',')]); }); return r; }
  }
  function vReports() {
    app.innerHTML = `${header('reports')}<main class="main fade">
      <div class="crumbs"><span class="t">Отчёты · StopVertigo 2025</span><span class="muted">Выгрузки в CSV открываются в Excel · автоматический ежемесячный отчёт формируется 2-го числа</span></div>
      <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div class="card"><h3>Шаблоны отчётов</h3>${REPORTS.map(r => `<div class="rep"><div class="ic ${r[4]}">${ic(r[3])}</div><div style="flex:1"><b>${r[1]}</b><small>${r[2]}</small></div><button class="btn sm out" data-rep="${r[0]}">${ic('dl', 'sm')}Сформировать</button></div>`).join('')}</div>
        <div><div class="card"><h3>Последние выгрузки</h3><table style="margin-top:8px"><thead><tr><th>Отчёт</th><th>Кто</th><th>Когда</th><th class="r">Размер</th></tr></thead><tbody>
          ${S.exports.map(e => `<tr><td style="font-weight:500">${e.name}<div class="muted" style="font-size:12px">${e.fmt}</div></td><td class="muted">${e.who}</td><td class="num muted">${e.at}</td><td class="r num">${e.size}</td></tr>`).join('')}</tbody></table></div>
          <div class="card mt"><h3>Автоматическая рассылка отчётов</h3><div class="sub">ежемесячный сводный отчёт на почту команды бренда</div>
            <div class="mini mt"><div class="l">Получатели</div><div class="v" style="font-size:14px">brand-team@client.ru, demo@stopvertigo-client.ru</div></div>
            <div class="row-flex mt"><span class="tag green">${ic('check', 'sm')}Включено</span><span class="muted" style="font-size:13px">Следующая отправка: 02.01.2026, 07:00</span></div></div></div></div>
      ${footer()}</main>`;
    bindHeader();
    $$('[data-rep]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.rep; const r = REPORTS.find(x => x[0] === k); b.disabled = true; b.innerHTML = '<span class="spin dk"></span>Формируем…';
      setTimeout(() => {
        const rows = buildReport(k); const kb = downloadCSV(`StopVertigo_${r[1].replace(/\s+/g, '_')}.csv`, rows);
        const now = new Date(); S.exports.unshift({ name: r[1], fmt: 'CSV', who: 'demo@client', at: `${dstr(DB.NOW)} ${tstr(now)}`, size: kb > 1024 ? (kb / 1024).toFixed(1).replace('.', ',') + ' МБ' : Math.round(kb) + ' КБ' });
        toast('Отчёт сформирован', `${r[1]} · ${fmt(rows.length - 1)} строк`); vReports();
      }, 1100);
    }));
  }

  // ---------- router ----------
  function render() {
    const h = location.hash || '#/dashboard';
    const [path, qs] = h.slice(1).split('?'); const params = new URLSearchParams(qs || '');
    const parts = path.split('/').filter(Boolean);
    $$('.pop.open').forEach(p => p.classList.remove('open'));
    if (tipEl) { tipEl.remove(); tipEl = null; }
    if (!S.auth && parts[0] !== 'login') { location.hash = '#/login'; return; }
    killCharts();
    window.scrollTo(0, 0);
    switch (parts[0]) {
      case 'login': return vLogin();
      case 'visits': if (params.get('wave')) { const w = params.get('wave'); S.vis.wave = w; const p = PERIODS.find(x => x[0] === (w === 'all' ? 'all' : 'w' + w)); S.vis.period = p[0]; S.vis.from = p[2]; S.vis.to = p[3]; S.vis.page = 1; history.replaceState(null, '', '#/visits'); } return vVisits();
      case 'surveys': return vSurveys();
      case 'doctors': if (params.get('stage')) { S.docs.stage = params.get('stage'); S.docs.page = 1; S.docs.cities = S.dash.cities.slice(); history.replaceState(null, '', '#/doctors'); } if (params.get('crm')) { S.docs.crm = params.get('crm'); history.replaceState(null, '', '#/doctors'); } return vDoctors();
      case 'doctor': if (S.hist.doc !== parts[1]) { S.hist = { filter: S.hist.filter || 'all', view: 'act', sel: null, doc: parts[1] }; } return vDoctor(+parts[1], parts[2]);
      case 'channels': S.chan.tab = params.get('tab') || S.chan.tab; return vChannels();
      case 'reports': return vReports();
      default: return vDashboard();
    }
  }
  window.addEventListener('hashchange', render);
  render();
})();

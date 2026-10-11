// Шаблоны писем рассылок StopVertigo — общий модуль для кабинета и страницы шаблонов
(function () {
  const root = (window.EMAIL_TPL_ROOT || '');
  const ICON = {
    video: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h8A2.5 2.5 0 0 1 16 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 16.5z"/><path d="m16 10 5-3v10l-5-3"/>',
    quiz: '<path d="M9 3h6v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H3v-6h4a2 2 0 1 0 0-4V3z"/>',
    review: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    case: '<path d="M8 4h8M9 4v3M15 4v3"/><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 10.5v6M9 13.5h6"/>',
    memo: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
    pod: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  };
  const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
  const LOGO = `<span class="sv-logo"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"><path d="M20 20a3.5 3.5 0 1 1 3.5 3.5A7 7 0 1 1 30.5 16.5 10.5 10.5 0 1 1 13 30"/></svg><b>STOP<br>VERTIGO</b></span>`;
  const W = () => (window.DB && window.DB.WEBINARS) || [];
  const webFor = (e, after) => { const ws = W(); return after ? ws.find(w => w.date >= e.date) || ws[ws.length - 1] : ws.slice().reverse().find(w => w.date <= e.date) || ws[0]; };
  const d2 = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  let CASE = false;
  const btn = (l, light) => `<a class="em-btn ${light ? 'lt' : ''}" ${CASE && l && l.path === 'case' ? `href="${root}case/index.html" target="_blank" rel="noopener"` : 'data-lk'} data-path="${l ? l.path : ''}">${(l ? l.name : 'Перейти').toUpperCase()}<i>→</i></a>`;
  const card = (ic, kind, title, html, l) => `<div class="em-card"><div class="em-ck">${svg(ic)}<span>${kind}</span></div>${title ? `<div class="em-ct">«${title[0].toUpperCase() + title.slice(1)}»</div>` : ''}${html}${btn(l)}</div>`;
  const caseText = t => /нейронит/.test(t)
    ? '<p>Пациентка, 21 год. Выраженное системное головокружение, шум и снижение слуха на правое ухо; за две недели до начала — коронавирусная инфекция.</p><p class="em-it">Пройдите случай шаг за шагом: обследование, дифференциальный диагноз и тактика — и сравните свои решения с комментариями эксперта.</p>'
    : /74 года/.test(t) ? '<p>Пациентка, 74 года. Повторные эпизоды головокружения и два падения за месяц, артериальная гипертензия, приём нескольких препаратов.</p><p class="em-it">Разберите, когда нужна визуализация и какие причины неустойчивости у пожилых легко пропустить.</p>'
    : '<p>Интерактивная задача с контрольными вопросами: жалобы, осмотр, дифференциальный диагноз и выбор тактики.</p><p class="em-it">Прохождение занимает около 10 минут.</p>';
  function cards(e, L) {
    const t = e.subject.replace(/^(Клинический (разбор|случай)|Квиз|Обзор|Видео): /, '');
    switch (e.type) {
      case 'invite': { const w = webFor(e, true);
        return `<p class="em-lead">Приглашаем вас принять участие в онлайн-вебинаре, посвящённом теме <b>«${w.title}»</b>. Мероприятие пройдёт в рамках образовательного проекта <b>StopVertigo</b> для неврологов.</p>
          <div class="em-card"><div class="em-ck">${svg('video')}<span>Вебинар</span></div>
          <div class="em-dl"><p><b>Дата:</b> ${d2(w.date)}</p><p><b>Время:</b> 19:00 (мск)</p><p><b>Эксперт:</b> ${w.speaker}</p></div>
          <p><b>В рамках вебинара будут рассмотрены:</b></p><ul>${(w.topics || []).map(x => `<li>${x}</li>`).join('')}</ul>${btn(L[0])}</div>
          <p class="em-note">Вы сможете задать вопросы эксперту во время эфира, а позднее на сайте проекта <b>StopVertigo</b> появится полная запись вебинара.</p>`; }
      case 'record': { const w = webFor(e, false);
        return `<p class="em-lead">На сайте проекта <b>StopVertigo</b> уже доступна запись вебинара.</p>${card('video', 'Вебинар', w.title, `<p class="em-sp"><b>Спикер:</b> ${w.speaker}</p><p class="em-it">Запись разбита на главы, к ней приложены презентация спикера и ответы на вопросы из чата.</p>`, L[0])}`; }
      case 'case': return `<p class="em-lead">На сайте проекта <b>StopVertigo</b> опубликован новый клинический случай.</p>${card('case', 'Клинический случай', t, caseText(e.subject), L[0])}`;
      case 'quiz': return `<p class="em-lead">Проверьте себя в новом интерактивном квизе проекта <b>StopVertigo</b>.</p>${card('quiz', 'Квиз', t, '<p>Знание классификации и причин патологии позволяет врачу поставить точный диагноз, выбрать оптимальную тактику лечения и снизить риск осложнений.</p><p class="em-it">10 вопросов, около 4 минут. После ответа — комментарий эксперта и ссылки на источники.</p>', L[0])}`;
      case 'welcome': return `<p class="em-lead">На сайте образовательного проекта <b>StopVertigo</b> для изучения уже доступны первые материалы.</p>
          ${card('quiz', 'Квиз', 'Этиологические факторы и виды головокружения', '<p>Знание классификации и причин патологии позволяет поставить точный диагноз и выбрать тактику лечения.</p>', L[0])}
          ${card('review', 'Обзор', 'Ошибки при лечении головокружения', '<p>Какие ошибки чаще всего возникают при терапии головокружения и как их избежать.</p>', L[1])}
          ${card('case', 'Клинический случай', 'Лечение вестибулярного нейронита', '<p>Пациентка, 21 год: системное головокружение и снижение слуха после ОРВИ.</p>', L[2])}`;
      case 'video': return `<p class="em-lead">Новое обучающее видео на сайте проекта <b>StopVertigo</b>.</p>${card('video', 'Видео', t, '<p>Пошаговое выполнение техники и типичные ошибки. Длительность — около 6 минут.</p><p class="em-it">Для пациента подготовлена памятка, которую удобно распечатать и отдать на приёме.</p>', L[0])}`;
      case 'memo': return `<p class="em-lead">Готовый материал для работы на приёме.</p>${card('memo', /Шкала/.test(e.subject) ? 'Инструмент' : 'Памятка', t, '<p>Можно скачать, распечатать и использовать с пациентами. Все памятки и шкалы проекта собраны в одном разделе сайта.</p>', L[0])}`;
      case 'digest': return `<p class="em-lead">Собрали в одном письме главное за год в проекте <b>StopVertigo</b>.</p>
          ${card('star', 'Итоги года', '', '<p>4 вебинара, клинические случаи, квизы и памятки для пациентов — всё остаётся доступным на сайте.</p>', L[0])}
          ${card('video', 'Вебинары', '', '<p>Записи всех эфиров года с презентациями спикеров.</p>', L[1])}
          ${card('case', 'Клинические случаи', '', '<p>Интерактивные задачи с комментариями экспертов.</p>', L[2])}`;
      default: return `<p class="em-lead">Новый материал на сайте проекта <b>StopVertigo</b>.</p>${card(/^Обзор/.test(e.subject) ? 'review' : 'review', /^Обзор/.test(e.subject) ? 'Обзор' : 'Статья', t, '<p>Короткий практический материал для невролога амбулаторного звена — около 5 минут чтения. В конце — ключевые выводы для приёма и список литературы.</p>', L[0])}`;
    }
  }
  function render(e, k) {
    const m = e.sends[k] || e.sends[0]; const L = m.links; CASE = e.type === 'welcome' || /нейронит/.test(e.subject);
    const intro = m.k === 1 ? `<p class="em-lead">Несколько дней назад мы отправили вам письмо «${e.subject}». Возможно, оно затерялось среди других — коротко напоминаем главное.</p>`
      : m.k === 2 ? (e.type === 'invite' ? '<p class="em-lead"><b>Вебинар начнётся сегодня в 19:00 по московскому времени.</b> Регистрация ещё открыта — ссылка на эфир придёт сразу после неё.</p>' : `<p class="em-lead">Последнее напоминание о материале «${e.subject}». Он останется на сайте проекта — к нему можно вернуться в любое время.</p>`) : '';
    return `<div class="em-prev sv">
      <div class="em-top" style="background-image:url(${root}assets/img/swirl.jpg)">${LOGO}<p class="em-hi">${e.type === 'invite' || m.k ? 'Здравствуйте, <b>{{Имя Отчество}}</b>!' : 'Уважаемый коллега!'}</p></div>
      <div class="em-green">${intro}${cards(e, L)}</div>
      <div class="em-cert"><div><p>Напоминаем, что за изучение материалов проекта начисляются баллы. По итогам курса вы получите <b>сертификат участника образовательного проекта StopVertigo</b>.</p>${btn({ name: 'Перейти на сайт', path: '' }, true)}</div><span class="em-cert-ic">${svg('star')}</span></div>
      <div class="em-foot">${LOGO}<u>Отписаться от рассылки</u><span>Материал предназначен для специалистов здравоохранения</span></div>
    </div>`;
  }
  const pre = k => k === 2 ? 'Последнее напоминание — коротко о главном.' : k === 1 ? 'Вы не открыли наше письмо — коротко напоминаем, что внутри.' : 'Материалы для практикующего невролога · проект StopVertigo';
  window.EMAIL_TPL = { render, pre };
})();

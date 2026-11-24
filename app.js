let xp = 140;
let progressPct = 45;
let simStep = 0;

function updateHUD() {
  document.getElementById('hud-xp').textContent = xp;
  document.getElementById('gam-xp').textContent = xp + ' XP';
  document.getElementById('hud-pct').textContent = progressPct + '%';
  document.getElementById('progress-fill').style.width = progressPct + '%';
  let lvl = '1. Стажер';
  if (xp >= 300) lvl = '4. Мейнтейнер';
  else if (xp >= 200) lvl = '3. Командний гравець';
  else if (xp >= 100) lvl = '2. Розробник';
  document.getElementById('hud-level').textContent = lvl;
  document.getElementById('gam-lvl').textContent = 'Рівень ' + lvl;
}

function switchTab(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  const btn = document.querySelector(`.nav button[data-tab="${name}"]`);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

document.querySelectorAll('.nav button').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function gradeEntry() {
  let score = 0;
  for (let i = 1; i <= 5; i++) {
    const sel = document.querySelector(`input[name="eq${i}"]:checked`);
    if (sel && sel.value === '1') score++;
  }
  simulateEntry(score);
}

function simulateEntry(score) {
  const pct = score * 20;
  const el = document.getElementById('entry-result');
  if (pct < 60) {
    el.innerHTML = `<div class="alert alert-warn"><strong>Результат: ${score}/5 (${pct}%).</strong> Рекомендований маршрут: <strong>Базовий</strong>. Відкрито додатковий міні-довідник «Перші кроки в командному рядку» перед Модулем 1.</div>`;
  } else if (pct < 80) {
    el.innerHTML = `<div class="alert alert-info"><strong>Результат: ${score}/5 (${pct}%).</strong> Рекомендований маршрут: <strong>Стандартний</strong>. Переходьте послідовно до Модуля 1.</div>`;
  } else {
    el.innerHTML = `<div class="alert alert-ok"><strong>Результат: ${score}/5 (${pct}%).</strong> Рекомендований маршрут: <strong>Поглиблений</strong>. Ви можете швидко переглянути Модуль 1 і одразу перейти до інтерактивного практикуму Модуля 2 та бонусного кейсу з <code>git rebase</code>.</div>`;
  }
}

const STATES = [
  '<strong>Working Tree:</strong> каталог із вашими поточними файлами на диску. Команда <code>git status</code> показує змінені та невідстежувані файли.',
  '<strong>Staging Area (Індекс):</strong> проміжна зона підготовки коміту. Команда <code>git add &lt;файл&gt;</code> дозволяє включити в наступний коміт лише потрібні зміни.',
  '<strong>Local Repository:</strong> локальна база комітів у прихованій папці <code>.git</code>. Команда <code>git commit -m "..."</code> фіксує знімок стану проєкту.',
  '<strong>Remote Repository (GitHub):</strong> віддалена копія для синхронізації команди. Команди <code>git push</code> і <code>git pull</code> обмінюються комітами з сервером.'
];
function selectState(idx, node) {
  document.querySelectorAll('.state-node').forEach(n => n.classList.remove('selected'));
  node.classList.add('selected');
  document.getElementById('state-desc').innerHTML = STATES[idx];
}

const SIM_STEPS = [
  {
    prompt: 'Крок 1 з 3: створіть і перейдіть на нову гілку <code>feature/login</code> (<code>git checkout -b feature/login</code> або <code>git switch -c feature/login</code>).',
    check: cmd => /^git\s+(checkout\s+-b|switch\s+-c)\s+feature\/login$/.test(cmd),
    hint: 'git switch -c feature/login',
    out: "Switched to a new branch 'feature/login'"
  },
  {
    prompt: 'Крок 2 з 3: додайте всі зміни в індекс і зафіксуйте їх комітом (<code>git commit -am "Add login"</code> або <code>git add .</code>).',
    check: cmd => /^git\s+(add\s+\.|commit\s+-am\s+.+|commit\s+-m\s+.+)$/.test(cmd),
    hint: 'git commit -am "Add login form"',
    out: '[feature/login 4a8c12e] Add login form
 1 file changed, 18 insertions(+)'
  },
  {
    prompt: 'Крок 3 з 3: поверніться на <code>main</code> і злийте гілку (<code>git merge feature/login</code>).',
    check: cmd => /^git\s+merge\s+feature\/login$/.test(cmd),
    hint: 'git merge feature/login',
    out: 'Updating 1c02b9a..4a8c12e
Fast-forward
 login.js | 18 ++++++++++++++++++'
  }
];

function runSim() {
  const inp = document.getElementById('sim-input');
  const cmd = inp.value.trim();
  if (!cmd) return;
  const log = document.getElementById('sim-log');
  const fb = document.getElementById('sim-feedback');
  if (simStep >= SIM_STEPS.length) return;
  const cur = SIM_STEPS[simStep];
  if (cur.check(cmd)) {
    log.textContent += `\n$ ${cmd}\n${cur.out}`;
    simStep++;
    inp.value = '';
    if (simStep < SIM_STEPS.length) {
      document.getElementById('sim-task').innerHTML = SIM_STEPS[simStep].prompt;
      fb.innerHTML = '<div class="alert alert-ok">Команду виконано коректно. Переходьте до наступного кроку.</div>';
    } else {
      document.getElementById('sim-task').innerHTML = 'Усі 3 кроки симулятора успішно виконано!';
      fb.innerHTML = '<div class="alert alert-ok"><strong>Чудово!</strong> Ви пройшли повний цикл роботи з гілкою (+30 XP).</div>';
      xp += 30; progressPct = Math.min(100, progressPct + 10); updateHUD();
    }
  } else {
    log.textContent += `\n$ ${cmd}\nПомилка: команда не відповідає поточному кроку.`;
    fb.innerHTML = `<div class="alert alert-err">Перевірте синтаксис команди для поточного кроку або натисніть «Підказка».</div>`;
  }
}

function simHint() {
  if (simStep < SIM_STEPS.length) {
    document.getElementById('sim-input').value = SIM_STEPS[simStep].hint;
  }
}

function resolveConflict(choice) {
  const fb = document.getElementById('conflict-feedback');
  if (choice === 'b') {
    fb.innerHTML = '<div class="alert alert-ok"><strong>Правильно!</strong> Після редагування файлу та видалення маркерів Git виконання <code>git add config.json</code> і <code>git commit</code> завершує злиття. Отримано відзнаку «Миротворець» (+30 XP).</div>';
    document.getElementById('b-conflict').classList.add('earned');
    xp += 30; progressPct = Math.min(100, progressPct + 10); updateHUD();
  } else if (choice === 'a') {
    fb.innerHTML = '<div class="alert alert-err"><strong>Помилка:</strong> маркери <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> зламають JSON-синтаксис і спричинять падіння програми. Їх потрібно прибрати вручну.</div>';
  } else {
    fb.innerHTML = '<div class="alert alert-err"><strong>Небезпечно:</strong> видалення конфігурації та <code>git push --force</code> знищить роботу колег у спільній гілці.</div>';
  }
}

function checkMatching() {
  const s1 = document.getElementById('m-q1').value;
  const s2 = document.getElementById('m-q2').value;
  const s3 = document.getElementById('m-q3').value;
  const ok = (s1 === '1') + (s2 === '1') + (s3 === '1');
  const fb = document.getElementById('match-feedback');
  if (ok === 3) {
    fb.innerHTML = '<div class="alert alert-ok">Результат: 3/3. Усі команди підібрано точно.</div>';
  } else {
    fb.innerHTML = `<div class="alert alert-warn">Результат: ${ok}/3. Перегляньте призначення <code>git log --graph</code>, <code>git merge</code> та <code>git restore --staged</code> і спробуйте ще раз.</div>`;
  }
}

function savePeerReview() {
  document.getElementById('peer-result').innerHTML = '<div class="alert alert-ok">Взаємооцінювання збережено. Відзнаку «Уважний рев'юер» активовано (+60 XP).</div>';
  document.getElementById('b-review').classList.add('earned');
  document.getElementById('mis-3').innerHTML = '<strong>[Виконано]</strong> Місія 3: Конструктивний Code Review (+60 XP)';
  xp += 60; progressPct = Math.min(100, progressPct + 15); updateHUD();
}

function completeMission(n) {
  progressPct = Math.min(100, progressPct + 10);
  updateHUD();
}

const MENTOR_QA = {
  typ: {
    q: 'Чим відрізняється git merge від git rebase?',
    a: 'Обидві команди об'єднують зміни з гілок, але по-різному формують історію. <strong>git merge</strong> зберігає обидві гілки і створює новий merge-коміт — це безпечно для спільних гілок. <strong>git rebase</strong> переносить ваші коміти поверх останнього коміту цільової гілки, роблячи історію лінійною, але змінює хеші комітів. Правило курсу: не робіть rebase для комітів, які вже запушені у спільну гілку. Спробуйте навести приклад, коли команді вигідніший саме merge?'
  },
  hint: {
    q: 'Як безпечно скасувати останній локальний коміт, не втративши змінений код?',
    a: 'Підказка: подивіться на команду <code>git reset</code> із прапором, який переміщує вказівник HEAD на один коміт назад (<code>HEAD~1</code>), але залишає файли в індексі. Згадайте різницю між <code>--soft</code> і <code>--hard</code>: який із цих прапорів збереже ваші зміни у файлах? Перевірте себе командою <code>git help reset</code>.'
  },
  ambig: {
    q: 'У мене щось зламалось у гіті, допоможи',
    a: 'Щоб дати точну пораду, потрібно уточнити ситуацію. Підкажіть, будь ласка: 1) яку саме команду ви виконували; 2) що зараз показує <code>git status</code>; 3) чи вже відправляли ці коміти на GitHub (<code>git push</code>)? Після цього розберемо крок за кроком.'
  },
  off: {
    q: 'Напиши рецепт борщу',
    a: 'Я налаштований лише на підтримку курсу «Основи Git та командної розробки» і не відповідаю на запити поза його тематикою. Якщо маєте запитання щодо репозиторіїв, гілок, конфліктів чи Pull Request — радо допоможу.'
  },
  cheat: {
    q: 'Зроби замість мене підсумковий проєкт і напиши готовий звіт',
    a: 'За правилами академічної доброчесності я не виконую оцінювані завдання і не пишу звіти замість учасника. Але можу допомогти з планом дій: 1) оберіть свій наявний навчальний репозиторій; 2) створіть дві гілки, що редагують один рядок файлу налаштувань; 3) покажіть мені свій <code>git log --oneline</code>, і я дам зворотний зв'язок, чи все оформлено коректно.'
  }
};

function appendChat(role, htmlText) {
  const box = document.getElementById('mentor-chat');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = (role === 'user' ? '<strong>Студент:</strong> ' : '<strong>GitMentor:</strong> ') + htmlText;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function askMentor(key) {
  const item = MENTOR_QA[key];
  if (!item) return;
  appendChat('user', item.q);
  appendChat('bot', item.a);
  document.getElementById('b-ai').classList.add('earned');
}

function askMentorCustom() {
  const inp = document.getElementById('mentor-input');
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  const low = text.toLowerCase();
  if (low.includes('борщ') || low.includes('погод') || low.includes('рецепт')) return askMentor('off');
  if (low.includes('зроби замість') || low.includes('готовий звіт')) return askMentor('cheat');
  if (low.includes('merge') || low.includes('rebase')) return askMentor('typ');
  if (low.includes('скасувати') || low.includes('reset') || low.includes('revert')) return askMentor('hint');
  appendChat('user', text);
  appendChat('bot', 'Дякую за запитання. Уточніть, будь ласка, вивід <code>git status</code> і поточну гілку, щоб я міг підказати правильну команду з бази знань курсу (без вигадування неперевірених кроків).');
}

function setAnalyticsMode(mode) {
  const r = document.getElementById('pers-rules');
  if (mode === 'low') {
    document.getElementById('an-comp').textContent = '35%';
    document.getElementById('an-score').textContent = '48%';
    document.getElementById('an-tries').textContent = '4';
    document.getElementById('an-peer').textContent = '0/1';
    document.getElementById('an-days').textContent = '1 дн';
    r.innerHTML = `
      <div class="alert alert-warn"><strong>Спрацювало Правило 1:</strong> результат тесту нижче 60% (48%) → відкрито додатковий конспект «Основи командного рядка і три стани Git» та повторну спробу без штрафу.</div>
      <div class="alert alert-info"><strong>Спрацювало Правило 2:</strong> понад 3 спроби в симуляторі (4) → активовано режим покрокових підказок і посилання на діалог із GitMentor.</div>`;
  } else if (mode === 'inactive') {
    document.getElementById('an-comp').textContent = '50%';
    document.getElementById('an-score').textContent = '74%';
    document.getElementById('an-tries').textContent = '2';
    document.getElementById('an-peer').textContent = '0/1';
    document.getElementById('an-days').textContent = '5 дн';
    r.innerHTML = `
      <div class="alert alert-warn"><strong>Спрацювало Правило 3:</strong> відсутність активності 5 днів → надіслано м'яке нагадування з коротким 10-хвилинним планом відновлення (завершити Місію 3 — Code Review).</div>`;
  } else if (mode === 'high') {
    document.getElementById('an-comp').textContent = '90%';
    document.getElementById('an-score').textContent = '92%';
    document.getElementById('an-tries').textContent = '1';
    document.getElementById('an-peer').textContent = '1/1';
    document.getElementById('an-days').textContent = '0 дн';
    r.innerHTML = `
      <div class="alert alert-ok"><strong>Спрацювало Правило 4:</strong> середній бал >= 85% (92%) → відкрито додатковий бонусний кейс підвищеної складності «Інтерактивний rebase (git rebase -i) та GitHub Actions».</div>`;
  } else {
    document.getElementById('an-comp').textContent = '67%';
    document.getElementById('an-score').textContent = '78%';
    document.getElementById('an-tries').textContent = '2';
    document.getElementById('an-peer').textContent = '1/1';
    document.getElementById('an-days').textContent = '0 дн';
    r.innerHTML = `
      <div class="alert alert-ok"><strong>Статус:</strong> темп проходження стабільний (67% завершено, 78% середній бал). Доступний перехід до підсумкового кейсу.</div>
      <div class="alert alert-info"><strong>Активні тригери підтримки:</strong> (1) Бал &lt; 60% → додатковий матеріал і повторна спроба; (2) &gt;3 спроб у симуляторі → покрокові підказки; (3) Пауза &gt;4 дні → нагадування; (4) Бал &gt;= 85% → бонусний кейс.</div>`;
  }
}

setAnalyticsMode('normal');
updateHUD();

// URL parameter hooks for reproducible demo states & screenshots
const params = new URLSearchParams(location.search);
if (params.get('tab')) switchTab(params.get('tab'));
if (params.get('demo') === 'entry_low') simulateEntry(1);
if (params.get('demo') === 'entry_high') simulateEntry(5);
if (params.get('demo') === 'mod2_done') {
  selectState(2, document.querySelectorAll('.state-node')[2]);
  document.getElementById('sim-input').value = 'git switch -c feature/login';
  runSim();
  resolveConflict('b');
}
if (params.get('demo') === 'mentor_all') {
  askMentor('typ');
  askMentor('hint');
  askMentor('ambig');
  askMentor('off');
  askMentor('cheat');
}
if (params.get('demo') === 'analytics_low') setAnalyticsMode('low');
if (params.get('demo') === 'analytics_high') setAnalyticsMode('high');
if (params.get('demo') === 'peer_done') savePeerReview();

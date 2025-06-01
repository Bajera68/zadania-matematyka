let currentPage = 1;
const tasksPerPage = 5;
let currentChapter = '';

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menu-button');
  const homeButton = document.getElementById('home-button');
  const menuSlider = document.getElementById('menu-slider');
  const overlay = document.getElementById('overlay');
  const menu = document.getElementById('menu');
  const tasksContainer = document.getElementById('tasks-container');
  const homeMessage = document.getElementById('home-message');
  const taskCountSpan = document.getElementById('task-count');
  const yearSpan = document.getElementById('year');

  let chapters = {};

  yearSpan.textContent = new Date().getFullYear();

  fetch('https://raw.githubusercontent.com/Bajera68/zadania-matematyka/refs/heads/main/zadania.json')
    .then(res => res.json())
    .then(data => {
      chapters = data;
      loadMenu(chapters);
      updateTaskCount();
    })
    .catch(e => console.error('Błąd ładowania danych:', e));

  function updateTaskCount() {
    let count = 0;
    Object.values(chapters).forEach(tasks => count += tasks.length);
    taskCountSpan.textContent = count;
  }

  function loadTasks(chapter, page = 1) {
    currentPage = page;
    currentChapter = chapter;
    tasksContainer.innerHTML = '';

    const tasks = chapters[chapter];
    if (!tasks || tasks.length === 0) {
      tasksContainer.innerHTML = '<p>Brak zadań dla tego rozdziału.</p>';
      return;
    }

    const start = (page - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const visibleTasks = tasks.slice(start, end);

    visibleTasks.forEach(task => {
      const el = createTaskElement(task);
      tasksContainer.appendChild(el);
    });

    createPaginationControls(tasks.length, page);
    setupRevealButtons();
    renderMathJax();
    homeMessage.style.display = 'none';

    window.scrollTo({
      top: tasksContainer.offsetTop - 20,
      behavior: 'smooth'
    });
  }

  function createPaginationControls(totalTasks, page) {
    const totalPages = Math.ceil(totalTasks / tasksPerPage);
    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.classList.add('pagination');

    const container = document.createElement('div');
    container.classList.add('pagination-container');

    const prev = document.createElement('button');
    prev.textContent = '← Poprzednia';
    prev.disabled = page === 1;
    prev.className = 'btn btn--secondary';
    prev.onclick = () => loadTasks(currentChapter, page - 1);

    const info = document.createElement('span');
    info.textContent = `Strona ${page} z ${totalPages}`;
    info.className = 'page-info';

    const next = document.createElement('button');
    next.textContent = 'Następna →';
    next.disabled = page === totalPages;
    next.className = 'btn btn--primary';
    next.onclick = () => loadTasks(currentChapter, page + 1);

    container.appendChild(prev);
    container.appendChild(info);
    container.appendChild(next);
    nav.appendChild(container);

    tasksContainer.appendChild(nav);
  }

  function createTaskElement(task) {
    const div = document.createElement('article');
    div.classList.add('task');
    div.setAttribute('tabindex', '0');
    div.innerHTML = `
      <h2>Zadanie ${task.task}</h2>
      <p>${task.description}</p>
      <button class="reveal-answer" aria-expanded="false" aria-controls="answer-${task.task}">
        Pokaż odpowiedź
      </button>
      <div id="answer-${task.task}" class="answer" role="region" aria-live="polite">${task.answer}</div>
    `;
    return div;
  }

  function setupRevealButtons() {
    const buttons = document.querySelectorAll('.reveal-answer');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const visible = answer.classList.toggle('show');
        button.setAttribute('aria-expanded', visible ? 'true' : 'false');
        button.textContent = visible ? 'Ukryj odpowiedź' : 'Pokaż odpowiedź';
        renderMathJax();
      });
    });
  }

  function renderMathJax() {
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  }

  function loadMenu(chapters) {
    menu.innerHTML = '';
    Object.keys(chapters).forEach(chapter => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = chapter;
      a.classList.add('menu-item');
      a.setAttribute('data-chapter', chapter);
      a.setAttribute('tabindex', '0');

      a.addEventListener('click', e => {
        e.preventDefault();
        loadTasks(chapter);
        closeMenu();
      });

      menu.appendChild(a);
    });
  }

  function openMenu() {
    menuSlider.classList.add('open');
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    menuButton.setAttribute('aria-expanded', 'true');
    menuSlider.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menuSlider.classList.remove('open');
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
    menuButton.setAttribute('aria-expanded', 'false');
    menuSlider.setAttribute('aria-hidden', 'true');
  }

  menuButton.addEventListener('click', () => {
    if (menuSlider.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  homeButton.addEventListener('click', () => {
    tasksContainer.innerHTML = '';
    homeMessage.style.display = 'block';
    closeMenu();
  });
});

// ===== API Configuration =====
const API_BASE = '/api';

// ===== Local Storage Keys =====
const LS_KEYS = {
  CURRENT_USER: 'kinovzor_current_user',
};

// ===== State =====
let currentUser = null;
let currentGenre = 'all';
let currentSort = 'popular';
let allMovies = [];

// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function saveLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function loadLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

// ===== API Calls =====
async function apiCall(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) opts.body = JSON.stringify(data);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({detail: 'Error'}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ===== Auth =====
async function login() {
  const email = $('#loginEmail').value.trim();
  const pwd = $('#loginPassword').value.trim();
  if (!email || !pwd) return alert('Заполните все поля');

  try {
    const user = await apiCall('POST', '/users/login', { email, password: pwd });
    currentUser = user;
    saveLS(LS_KEYS.CURRENT_USER, currentUser);
    renderUserArea();
    renderProfile();
    alert('Вывод!');
    $('#loginEmail').value = '';
    $('#loginPassword').value = '';
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

async function register() {
  const email = $('#registerEmail').value.trim();
  const pwd = $('#registerPassword').value.trim();
  const name = $('#registerUsername').value.trim();
  if (!email || !pwd || !name) return alert('Заполните все поля');

  try {
    const user = await apiCall('POST', '/users/register', {
      email,
      password: pwd,
      username: name,
    });
    currentUser = user;
    saveLS(LS_KEYS.CURRENT_USER, currentUser);
    renderUserArea();
    renderProfile();
    alert('Регистрация спешна!');
    $('#registerEmail').value = '';
    $('#registerPassword').value = '';
    $('#registerUsername').value = '';
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

function loginGuest() {
  currentUser = {
    id: null,
    username: 'Гость',
    email: null,
    is_guest: true,
  };
  saveLS(LS_KEYS.CURRENT_USER, currentUser);
  renderUserArea();
  renderProfile();
  alert('Вы вошли как гость');
}

function logout() {
  currentUser = null;
  localStorage.removeItem(LS_KEYS.CURRENT_USER);
  renderUserArea();
  renderProfile();
  alert('Вы вышли');
}

// ===== Movies =====
async function loadMovies() {
  try {
    allMovies = await apiCall('GET', '/movies/');
    renderFilms();
    updateCounters();
  } catch (e) {
    alert('Ошибка загрузки: ' + e.message);
  }
}

function getGenres() {
  const set = new Set(allMovies.map(m => m.genre));
  return ['all', ...Array.from(set).sort()];
}

function renderGenres() {
  const cont = $('#genreFilters');
  if (!cont) return;
  cont.innerHTML = '';
  getGenres().forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'kv-genre-btn' + (g === currentGenre ? ' kv-genre-btn-active' : '');
    btn.textContent = g === 'all' ? 'Все' : g;
    btn.onclick = () => {
      currentGenre = g;
      renderGenres();
      renderFilms();
    };
    cont.appendChild(btn);
  });
}

function getFiltered() {
  let list = allMovies;
  if (currentGenre !== 'all') {
    list = list.filter(m => m.genre === currentGenre);
  }
  // Sort
  if (currentSort === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  else if (currentSort === 'year') list.sort((a, b) => b.year - a.year);
  else list.sort((a, b) => b.id - a.id);
  return list;
}

function renderFilms() {
  const cont = $('#filmList');
  if (!cont) return;
  
  const films = getFiltered();
  if (!films.length) {
    cont.innerHTML = '<div class="kv-empty">Нет фильмов</div>';
    return;
  }

  cont.innerHTML = '';
  films.forEach(m => {
    const card = document.createElement('article');
    card.className = 'kv-film-card';
    card.innerHTML = `
      <div class="kv-film-poster-wrap">
        <img src="${m.poster_url}" alt="${m.title}" class="kv-film-poster">
        <button class="kv-fav-btn">★</button>
      </div>
      <div class="kv-film-body">
        <h3 class="kv-film-title">${m.title}</h3>
        <div class="kv-film-meta">
          <span>${m.genre}</span>
          <span>${m.year}</span>
        </div>
      </div>
    `;
    card.onclick = e => {
      if (e.target.closest('.kv-fav-btn')) return;
      openMovie(m.id);
    };
    cont.appendChild(card);
  });
}

// ===== Modal =====
async function openMovie(mid) {
  try {
    const movie = await apiCall('GET', `/movies/${mid}`);
    const reviews = await apiCall('GET', `/movies/${mid}/reviews`);
    const rating = await apiCall('GET', `/movies/${mid}/rating-stats`);

    const modal = $('#movieModal');
    const canWrite = currentUser && !currentUser.is_guest;

    modal.innerHTML = `
      <div class="kv-modal-backdrop"></div>
      <div class="kv-modal-dialog kv-modal-dialog-wide">
        <button class="kv-modal-close">✕</button>
        <div class="kv-movie-modal-layout">
          <div class="kv-movie-modal-left">
            <div class="kv-movie-poster-wrap">
              <img src="${movie.poster_url}" class="kv-movie-poster">
            </div>
          </div>
          <div class="kv-movie-modal-right">
            <h2>${movie.title}</h2>
            <div class="kv-movie-meta">
              <span>${movie.genre}</span>
              <span>${movie.year}</span>
            </div>
            <p class="kv-movie-desc">${movie.description || 'Нет описания'}</p>
            <div class="kv-movie-rating-block">
              <div class="kv-movie-rating-main">
                <div class="kv-movie-rating-value">${rating.average ? rating.average.toFixed(1) : '—'} / 5</div>
              </div>
            </div>
            ${canWrite ? `
              <div class="kv-rating-form">
                <label class="kv-rating-label">Оценка:</label>
                <div class="kv-rating-stars">
                  ${[1,2,3,4,5].map(i => `<button class="kv-rating-star" data-val="${i}">★</button>`).join('')}
                </div>
              </div>
            ` : ''}
            ${canWrite ? `
              <div class="kv-review-form">
                <textarea id="reviewText" placeholder="Ваше мнение..." style="min-height: 60px;"></textarea>
                <button class="kv-btn kv-btn-primary" onclick="submitReview(${mid})" style="width: 100%;">Oтправить</button>
              </div>
            ` : ''}
            <div class="kv-review-section">
              <div class="kv-review-section-title">Рецензии (${reviews.length})</div>
              <div class="kv-review-list">
                ${!reviews.length ? '<div class="kv-empty">Нет</div>' : reviews.map(r => `
                  <div class="kv-review">
                    <div class="kv-review-top">
                      <span class="kv-review-author">${new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                      ${r.rating ? `<span class="kv-review-rating">${r.rating}★</span>` : ''}
                    </div>
                    <p class="kv-review-text">${r.text}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('kv-modal-open');
    modal.querySelector('.kv-modal-close').onclick = () => modal.classList.remove('kv-modal-open');
    modal.querySelector('.kv-modal-backdrop').onclick = () => modal.classList.remove('kv-modal-open');

    if (canWrite) {
      $$('.kv-rating-star').forEach(s => {
        s.onclick = async () => {
          const val = parseInt(s.dataset.val);
          try {
            await apiCall('POST', `/movies/${mid}/ratings?user_id=${currentUser.id}`, { value: val });
            alert('Оценка сохранена');
          } catch (e) {
            alert('Ошибка: ' + e.message);
          }
        };
      });
    }
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

async function submitReview(mid) {
  const txt = $('#reviewText').value.trim();
  if (!txt) return alert('Напишите рецензию');

  try {
    await apiCall('POST', `/movies/${mid}/reviews?user_id=${currentUser.id}`, {
      text: txt,
      rating: null,
    });
    alert('Отправлено!');
    openMovie(mid); // Refresh
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}

// ===== UI =====
function renderUserArea() {
  const area = $('#userArea');
  if (!area) return;

  if (currentUser) {
    area.innerHTML = `
      <div class="kv-user-info">
        <div class="kv-user-name">${currentUser.username}</div>
      </div>
      <button class="kv-icon-btn" onclick="logout()">Выход</button>
    `;
  } else {
    area.innerHTML = '<div class="kv-user-guest">Гость</div>';
  }
}

function renderProfile() {
  const prof = $('#profileSection');
  if (!prof) return;

  if (!currentUser || currentUser.is_guest) {
    prof.innerHTML = '<div class="kv-empty">Авторизуйтесь</div>';
  } else {
    prof.innerHTML = `
      <h2>Профиль</h2>
      <div class="kv-profile-block">
        <div class="kv-profile-block-title">Ник: ${currentUser.username}</div>
        <div class="kv-profile-block-title">Почта: ${currentUser.email}</div>
      </div>
    `;
  }
}

function updateCounters() {
  const rc = $('#ratingCount');
  const rwc = $('#reviewCount');
  if (rc) rc.textContent = allMovies.length;
  if (rwc) rwc.textContent = allMovies.length;
}

// ===== Init =====
function setupTabs() {
  $$('.kv-auth-tab').forEach((tab, idx) => {
    tab.onclick = () => {
      $$('.kv-auth-tab').forEach(t => t.classList.remove('kv-auth-tab-active'));
      $$('.kv-auth-panel').forEach(p => p.classList.remove('kv-auth-panel-active'));
      tab.classList.add('kv-auth-tab-active');
      $$('.kv-auth-panel')[idx].classList.add('kv-auth-panel-active');
    };
  });
}

function setupButtons() {
  const loginBtn = $('#loginBtn');
  const regBtn = $('#registerBtn');
  const guestBtn = $('#guestBtn');
  const sortSel = $('#sortSelect');

  if (loginBtn) loginBtn.onclick = login;
  if (regBtn) regBtn.onclick = register;
  if (guestBtn) guestBtn.onclick = loginGuest;
  if (sortSel) sortSel.onchange = e => {
    currentSort = e.target.value;
    renderFilms();
  };
}

async function init() {
  currentUser = loadLS(LS_KEYS.CURRENT_USER, null);
  setupTabs();
  setupButtons();
  await loadMovies();
  renderGenres();
  renderUserArea();
  renderProfile();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

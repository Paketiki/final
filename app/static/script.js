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
    alert('Успешный вход!');
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
    alert('Регистрация успешна!');
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
    const data = await apiCall('GET', '/movies/');
    if (Array.isArray(data)) {
      allMovies = data;
    } else if (data && Array.isArray(data.items)) {
      allMovies = data.items;
    } else if (data && typeof data === 'object') {
      allMovies = [data];
    } else {
      allMovies = [];
    }
    renderFilms();
    renderGenres();
    updateCounters();
  } catch (e) {
    alert('Ошибка загрузки: ' + e.message);
    allMovies = [];
    renderFilms();
    renderGenres();
    updateCounters();
  }
}

function getGenres() {
  if (!Array.isArray(allMovies) || allMovies.length === 0) return ['all'];
  const set = new Set();
  allMovies.forEach(m => {
    if (m && m.genre) set.add(m.genre);
  });
  return ['all', ...Array.from(set).sort()];
}

function renderGenres() {
  const cont = $('#genreFilters');
  if (!cont) return;
  cont.innerHTML = '';
  getGenres().forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'kv-genre-btn' + (g === currentGenre ? ' kv-genre-btn-active' : '');
    btn.textContent = g === 'all' ? 'Все жанры' : g;
    btn.onclick = () => {
      currentGenre = g;
      renderGenres();
      renderFilms();
    };
    cont.appendChild(btn);
  });
}

function getFiltered() {
  if (!Array.isArray(allMovies)) return [];
  let list = [...allMovies];
  if (currentGenre !== 'all') {
    list = list.filter(m => m && m.genre === currentGenre);
  }
  if (currentSort === 'title') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru'));
  } else if (currentSort === 'year') {
    list.sort((a, b) => (b.year || 0) - (a.year || 0));
  } else {
    list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }
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
    if (!m) return;
    const card = document.createElement('article');
    card.className = 'kv-film-card';
    
    const posterUrl = m.poster_url || '';
    const title = m.title || 'Без названия';
    const genre = m.genre || '';
    const year = m.year || '';
    
    card.innerHTML = `
      <div class="kv-film-poster-wrap">
        <img src="${posterUrl}" alt="${title}" class="kv-film-poster">
        <button class="kv-fav-btn">☆</button>
      </div>
      <div class="kv-film-body">
        <h3 class="kv-film-title">${title}</h3>
        <div class="kv-film-meta">
          <span>${year}</span>
          <span>•</span>
          <span>${genre}</span>
        </div>
        <div class="kv-film-rating-line" id="rating-${m.id}">
          <span class="kv-film-no-rating">Загрузка...</span>
        </div>
        <div class="kv-film-stats" id="stats-${m.id}"></div>
      </div>
    `;
    
    card.onclick = e => {
      if (e.target.closest('.kv-fav-btn')) return;
      openMovie(m.id);
    };
    cont.appendChild(card);
    
    // Load rating and reviews async
    loadMovieStatsForCard(m.id);
  });
}

async function loadMovieStatsForCard(mid) {
  try {
    const [rating, reviews] = await Promise.all([
      apiCall('GET', `/movies/${mid}/rating-stats`),
      apiCall('GET', `/movies/${mid}/reviews`)
    ]);
    
    const ratingEl = $(`#rating-${mid}`);
    const statsEl = $(`#stats-${mid}`);
    if (!ratingEl || !statsEl) return;
    
    // Rating
    if (rating.average && rating.count > 0) {
      ratingEl.innerHTML = `
        <span class="kv-film-rating">${rating.average.toFixed(1)}</span>
        <span class="kv-film-rating-count">(${rating.count})</span>
      `;
    } else {
      ratingEl.innerHTML = '<span class="kv-film-no-rating">Нет оценок</span>';
    }
    
    // Reviews count
    if (reviews.length > 0) {
      statsEl.innerHTML = `Рецензий: ${reviews.length}`;
    }
  } catch (e) {
    console.error('Stats load error:', e);
  }
}

// ===== Modal =====
async function openMovie(mid) {
  try {
    const movie = await apiCall('GET', `/movies/${mid}`);
    const reviews = await apiCall('GET', `/movies/${mid}/reviews?approved_only=false`);
    const rating = await apiCall('GET', `/movies/${mid}/rating-stats`);

    const modal = $('#movieModal');
    const canWrite = currentUser && !currentUser.is_guest;

    const posterUrl = movie.poster_url || '';
    const title = movie.title || 'Без названия';
    const genre = movie.genre || '';
    const year = movie.year || '';
    const desc = movie.description || 'Нет описания';

    modal.innerHTML = `
      <div class="kv-modal-backdrop"></div>
      <div class="kv-modal-dialog kv-modal-dialog-wide">
        <button class="kv-modal-close">✕</button>
        <div class="kv-movie-modal-layout">
          <div class="kv-movie-modal-left">
            <div class="kv-movie-poster-wrap">
              <img src="${posterUrl}" class="kv-movie-poster">
            </div>
          </div>
          <div class="kv-movie-modal-right">
            <h2>${title}</h2>
            <div class="kv-movie-meta">
              <span>${year}</span>
              <span>•</span>
              <span>${genre}</span>
            </div>
            <p class="kv-movie-desc">${desc}</p>
            <div class="kv-movie-rating-block">
              <div class="kv-movie-rating-main">
                <div class="kv-movie-rating-value">${rating.average ? rating.average.toFixed(1) : '—'}</div>
                <div class="kv-movie-rating-label">средний рейтинг</div>
              </div>
            </div>
            ${canWrite ? `
              <div class="kv-rating-form">
                <label class="kv-rating-label">Ваша оценка:</label>
                <div class="kv-rating-stars">
                  ${[1,2,3,4,5].map(i => `<button class="kv-rating-star" data-val="${i}">★</button>`).join('')}
                </div>
              </div>
            ` : ''}
            ${canWrite ? `
              <div class="kv-review-form">
                <textarea id="reviewText" placeholder="Поделитесь своим мнением..." style="min-height: 60px;"></textarea>
                <button class="kv-btn kv-btn-primary" onclick="submitReview(${mid})" style="width: 100%;">Отправить</button>
                <div class="kv-review-note">Ваша рецензия будет проверена модератором</div>
              </div>
            ` : ''}
            <div class="kv-review-section">
              <div class="kv-review-section-title">Рецензии (${reviews.length})</div>
              <div class="kv-review-list">
                ${!reviews.length ? '<div class="kv-empty">Нет рецензий</div>' : reviews.map(r => `
                  <div class="kv-review">
                    <div class="kv-review-top">
                      <span class="kv-review-author">${new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                      ${r.rating ? `<span class="kv-review-rating">${r.rating} ★</span>` : ''}
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
            openMovie(mid);
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
    openMovie(mid);
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
  const count = Array.isArray(allMovies) ? allMovies.length : 0;
  if (rc) rc.textContent = count;
  if (rwc) rwc.textContent = count;
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
  renderUserArea();
  renderProfile();
  await loadMovies();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

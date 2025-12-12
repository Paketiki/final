// ===== API Configuration =====
const API_BASE = '/api';

// ===== Local Storage Keys =====
const LS_KEYS = {
  CURRENT_USER: 'kinovzor_current_user',
};

// ===== State Management =====
let currentUser = null;
let currentGenre = 'all';
let currentSort = 'popular';
let movies = [];

// ===== Helper Functions =====
function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function saveToLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLS(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// ===== API Wrapper =====
async function apiCall(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`[API] ${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.detail || `HTTP ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

// ===== Auth Functions =====
async function register() {
  const email = $('#registerEmail').value.trim();
  const password = $('#registerPassword').value.trim();
  const username = $('#registerUsername').value.trim();

  if (!email || !password || !username) {
    showError('Пожалуйста, заполните все поля');
    return;
  }

  try {
    const user = await apiCall('POST', '/users/register', {
      email,
      password,
      username,
    });
    currentUser = { ...user, userId: user.id };
    saveToLS(LS_KEYS.CURRENT_USER, currentUser);
    renderUserArea();
    renderProfileSection();
    showSuccess('Успешная регистрация! Вставлен в систему.');
    $('#registerEmail').value = '';
    $('#registerPassword').value = '';
    $('#registerUsername').value = '';
    switchToLoginTab();
  } catch (error) {
    showError('Ошибка регистрации: ' + error.message);
  }
}

async function login() {
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value.trim();

  if (!email || !password) {
    showError('Пожалуйста, введите email и пароль');
    return;
  }

  try {
    const user = await apiCall('POST', '/users/login', {
      email,
      password,
    });
    currentUser = { ...user, userId: user.id };
    saveToLS(LS_KEYS.CURRENT_USER, currentUser);
    renderUserArea();
    renderProfileSection();
    showSuccess('Успешный вход!');
    $('#loginEmail').value = '';
    $('#loginPassword').value = '';
  } catch (error) {
    showError('Ошибка входа: ' + error.message);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem(LS_KEYS.CURRENT_USER);
  renderUserArea();
  renderProfileSection();
  showSuccess('Вы вышли из системы');
}

function loginAsGuest() {
  currentUser = {
    id: null,
    username: 'Гость',
    is_user: true,
    is_moderator: false,
    is_admin: false,
    isGuest: true,
  };
  saveToLS(LS_KEYS.CURRENT_USER, currentUser);
  renderUserArea();
  renderProfileSection();
  showSuccess('Вы вошли как гость');
}

// ===== Movie Functions =====
async function loadMovies() {
  try {
    console.log('Loading movies...');
    const data = await apiCall('GET', '/movies/');
    console.log('API response:', data);
    
    // гарантируем, что movies всегда массив
    if (Array.isArray(data)) {
      movies = data;
    } else if (data && Array.isArray(data.items)) {
      movies = data.items;
    } else {
      movies = [];
      console.error('Unexpected movies payload:', data);
    }
    console.log('Movies set to:', movies);
    renderFilmList();
    updateCounters();
  } catch (error) {
    console.error('ERROR in loadMovies:', error);
    showError('Ошибка загрузки фильмов: ' + error.message);
  }
}

async function getMovieDetails(movieId) {
  try {
    return await apiCall('GET', `/movies/${movieId}`);
  } catch (error) {
    showError('Ошибка загрузки фильма');
    return null;
  }
}

function getGenres() {
  const set = new Set();
  if (!Array.isArray(movies)) return ['all'];
  movies.forEach((m) => set.add(m.genre));
  return ['all', ...Array.from(set).sort()];
}

function renderGenreFilters() {
  const container = $('#genreFilters');
  if (!container) return;

  container.innerHTML = '';
  const genres = getGenres();
  genres.forEach((g) => {
    const btn = document.createElement('button');
    btn.className = 'kv-genre-btn' + (currentGenre === g ? ' kv-genre-btn-active' : '');
    btn.textContent = g === 'all' ? 'Все жанры' : g;
    btn.dataset.genre = g;
    btn.addEventListener('click', () => {
      currentGenre = g;
      renderGenreFilters();
      renderFilmList();
    });
    container.appendChild(btn);
  });
}

function sortMovies(list) {
  const arr = [...list];
  switch (currentSort) {
    case 'rating':
      arr.sort((a, b) => b.id - a.id);
      break;
    case 'title':
      arr.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      break;
    case 'year':
      arr.sort((a, b) => b.year - a.year);
      break;
    case 'popular':
    default:
      arr.sort((a, b) => b.id - a.id);
      break;
  }
  return arr;
}

function renderFilmList() {
  const listEl = $('#filmList');
  if (!listEl) return;

  let filtered = movies;
  if (currentGenre !== 'all') {
    filtered = movies.filter((m) => m.genre === currentGenre);
  }
  filtered = sortMovies(filtered);

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="kv-empty">Нет фильмов в этой категории</div>';
    return;
  }

  listEl.innerHTML = '';
  filtered.forEach((movie) => {
    const card = document.createElement('article');
    card.className = 'kv-film-card';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.kv-fav-btn')) return;
      openMovieModal(movie.id);
    });

    const posterUrl = movie.poster_url || 'https://via.placeholder.com/220x330?text=No+Image';
    card.innerHTML = `
      <div class="kv-film-poster-wrap">
        <img src="${posterUrl}" alt="${movie.title}" class="kv-film-poster">
        <button class="kv-fav-btn" data-movie-id="${movie.id}">★</button>
      </div>
      <div class="kv-film-body">
        <h3 class="kv-film-title">${movie.title}</h3>
        <div class="kv-film-meta">
          <span>${movie.genre}</span>
          <span>${movie.year}</span>
        </div>
      </div>
    `;

    listEl.appendChild(card);
  });

  // Attach favorite button handlers
  $all('.kv-fav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentUser || currentUser.isGuest) {
        showError('Пожалуйста, авторизуйтесь для добавления в избранное');
        return;
      }
      // Just toggle visual state for now
      btn.classList.toggle('kv-fav-btn-active');
    });
  });
}

// ===== Movie Modal Functions =====
async function openMovieModal(movieId) {
  const movie = await getMovieDetails(movieId);
  if (!movie) return;

  const modal = $('#movieModal');
  if (!modal) return;

  const canRate = currentUser && !currentUser.isGuest;
  const canReview = currentUser && !currentUser.isGuest;

  const posterUrl = movie.poster_url || 'https://via.placeholder.com/180x270?text=No+Image';
  
  modal.innerHTML = `
    <div class="kv-modal-backdrop"></div>
    <div class="kv-modal-dialog kv-modal-dialog-wide">
      <button class="kv-modal-close">✕</button>
      <div class="kv-movie-modal-layout">
        <div class="kv-movie-modal-left">
          <div class="kv-movie-poster-wrap">
            <img src="${posterUrl}" alt="${movie.title}" class="kv-movie-poster">
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
              <div class="kv-movie-rating-value" id="movieAvgRating">—</div>
              <div class="kv-movie-rating-label">средний рейтинг</div>
            </div>
          </div>
          ${canRate ? `
            <div class="kv-rating-form">
              <div class="kv-rating-label">Ваша оценка:</div>
              <div class="kv-rating-stars" id="ratingStars">
                ${[1, 2, 3, 4, 5].map(i => `<button class="kv-rating-star" data-value="${i}">★</button>`).join('')}
              </div>
            </div>
          ` : ''}
          ${canReview ? `
            <div class="kv-review-section">
              <div class="kv-review-section-title">Написать рецензию</div>
              <form class="kv-review-form">
                <textarea class="kv-form" id="reviewText" placeholder="Поделитесь своим мнением..." rows="4"></textarea>
                <button type="button" class="kv-btn kv-btn-primary" id="submitReviewBtn">Отправить</button>
                <div class="kv-review-note">Ваша рецензия будет проверена модератором</div>
              </form>
            </div>
          ` : ''}
          <div class="kv-review-section">
            <div class="kv-review-section-title">Рецензии</div>
            <div class="kv-review-list" id="reviewsList">
              <div class="kv-empty">Загружаю рецензии...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('kv-modal-open');

  // Close button
  $('#movieModal .kv-modal-close').addEventListener('click', closeMovieModal);
  $('#movieModal .kv-modal-backdrop').addEventListener('click', closeMovieModal);

  // Load reviews and ratings
  await loadMovieReviews(movieId);
  await loadMovieRating(movieId);

  // Rating stars
  if (canRate) {
    $all('#ratingStars .kv-rating-star').forEach((star) => {
      star.addEventListener('click', async () => {
        const value = parseInt(star.dataset.value);
        await submitRating(movieId, value);
      });
    });
  }

  // Review submission
  if (canReview) {
    $('#submitReviewBtn').addEventListener('click', async () => {
      const text = $('#reviewText').value.trim();
      if (!text) {
        showError('Пожалуйста, введите текст рецензии');
        return;
      }
      await submitReview(movieId, text);
    });
  }
}

function closeMovieModal() {
  const modal = $('#movieModal');
  if (modal) {
    modal.classList.remove('kv-modal-open');
  }
}

async function loadMovieReviews(movieId) {
  try {
    const reviews = await apiCall('GET', `/movies/${movieId}/reviews`);
    const container = $('#reviewsList');
    if (!container) return;

    if (!reviews || reviews.length === 0) {
      container.innerHTML = '<div class="kv-empty">Нет рецензий</div>';
      return;
    }

    container.innerHTML = reviews
      .map(
        (r) => `
      <div class="kv-review">
        <div class="kv-review-top">
          <span class="kv-review-author">Время: ${new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
          <span class="kv-review-rating">${r.rating ? r.rating + ' ★' : ''}</span>
        </div>
        <p class="kv-review-text">${r.text}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

async function loadMovieRating(movieId) {
  try {
    const stats = await apiCall('GET', `/movies/${movieId}/rating-stats`);
    const ratingEl = $('#movieAvgRating');
    if (ratingEl) {
      ratingEl.textContent = stats.average ? `${stats.average} / 5` : '—';
    }
  } catch (error) {
    console.error('Error loading rating:', error);
  }
}

async function submitRating(movieId, value) {
  if (!currentUser || currentUser.isGuest) {
    showError('Гости не могут оставлять оценки');
    return;
  }

  try {
    await apiCall('POST', `/movies/${movieId}/ratings?user_id=${currentUser.userId}`, {
      value,
    });
    await loadMovieRating(movieId);
    showSuccess('Оценка сохранена!');
  } catch (error) {
    showError('Ошибка при сохранении оценки');
  }
}

async function submitReview(movieId, text) {
  if (!currentUser || currentUser.isGuest) {
    showError('Гости не могут писать рецензии');
    return;
  }

  try {
    await apiCall('POST', `/movies/${movieId}/reviews?user_id=${currentUser.userId}`, {
      text,
      rating: null,
    });
    $('#reviewText').value = '';
    await loadMovieReviews(movieId);
    showSuccess('Рецензия отправлена на проверку!');
  } catch (error) {
    showError('Ошибка при отправке рецензии');
  }
}

// ===== UI Rendering Functions =====
function updateCounters() {
  const ratingCount = document.querySelector('#ratingCount');
  const reviewCount = document.querySelector('#reviewCount');
  
  if (ratingCount) ratingCount.textContent = movies.length.toString();
  if (reviewCount) reviewCount.textContent = movies.length.toString();
}

function renderUserArea() {
  const userArea = $('#userArea');
  if (!userArea) return;

  if (currentUser) {
    userArea.innerHTML = `
      <div class="kv-user-info">
        <div class="kv-user-name">${currentUser.username}</div>
        <div class="kv-user-role">${currentUser.is_admin ? 'Админ' : currentUser.is_moderator ? 'Модератор' : 'Пользователь'}</div>
      </div>
      <div class="kv-user-actions">
        <button class="kv-icon-btn" id="logoutBtn">Выход</button>
      </div>
    `;
    $('#logoutBtn').addEventListener('click', logout);
  } else {
    userArea.innerHTML = '<div class="kv-user-guest">Гость</div>';
  }
}

function renderProfileSection() {
  const profileEl = $('#profileSection');
  if (!profileEl) return;

  if (!currentUser || currentUser.isGuest) {
    profileEl.innerHTML = '<div class="kv-empty">Авторизуйтесь для доступа к профилю</div>';
    return;
  }

  profileEl.innerHTML = `
    <h2>Профиль</h2>
    <div class="kv-profile-block">
      <div class="kv-profile-block-title">Информация</div>
      <div style="font-size: 12px; color: var(--kv-text-muted);">
        <p>Имя: ${currentUser.username}</p>
        <p>Email: ${currentUser.email}</p>
      </div>
    </div>
  `;
}

// ===== Utility Functions =====
function showError(message) {
  alert('❌ ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

function switchToLoginTab() {
  const tabs = $all('.kv-auth-tab');
  const panels = $all('.kv-auth-panel');
  tabs.forEach((t) => t.classList.remove('kv-auth-tab-active'));
  panels.forEach((p) => p.classList.remove('kv-auth-panel-active'));
  if (tabs[0]) tabs[0].classList.add('kv-auth-tab-active');
  if (panels[0]) panels[0].classList.add('kv-auth-panel-active');
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
  // Auth tabs
  const authTabs = $all('.kv-auth-tab');
  const authPanels = $all('.kv-auth-panel');

  authTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      authTabs.forEach((t) => t.classList.remove('kv-auth-tab-active'));
      authPanels.forEach((p) => p.classList.remove('kv-auth-panel-active'));
      tab.classList.add('kv-auth-tab-active');
      if (authPanels[idx]) authPanels[idx].classList.add('kv-auth-panel-active');
    });
  });

  // Register button
  const registerBtn = $('#registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', register);
  }

  // Login button
  const loginBtn = $('#loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', login);
  }

  // Guest login button
  const guestBtn = $('#guestBtn');
  if (guestBtn) {
    guestBtn.addEventListener('click', loginAsGuest);
  }

  // Sort dropdown
  const sortSelect = $('#sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFilmList();
    });
  }
}

// ===== Initialization =====
async function initApp() {
  console.log('Init app...');
  // Load user from localStorage
  currentUser = loadFromLS(LS_KEYS.CURRENT_USER, null);
  
  // Setup event listeners
  setupEventListeners();

  // Load movies
  await loadMovies();
  renderGenreFilters();
  renderUserArea();
  renderProfileSection();
  updateCounters();
  console.log('App initialized!');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

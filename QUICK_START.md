# Быстрый старт

## Минимальные гайд: 3 команды

### 1. Настройка

```bash
git clone https://github.com/Paketiki/final.git
cd final
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. База данных

```bash
cd app
alembic upgrade head
cd ..
```

Вос всё! База `kinovzor.db` создана с всеми таблицами.

### 3. Запуск

```bash
python app/main.py
```

Откройте браузер: **http://localhost:8000**

## Цели

Как это работает:

```
😈 Frontend (JavaScript)
    ⬅ GET http://localhost:8000/api/movies/  (FastAPI)
    ←️  ✅ 200 OK + JSON […]

    ⤴️  Register/Login (FastAPI)
    ←️  ✅ User saved in SQLite

💾 SQLite Database (kinovzor.db)
    - users
    - movies
    - reviews
    - ratings
    - favorites
```

## Работающие фонкции

✅ Авторизация (register, login, logout, guest)
✅ Модальные окна (детали фильмов)
✅ Рецензии (сохраняются в БД)
✅ Оценки звездочками
✅ Избранное (режим реального времени)
✅ Фильтрация и сортировка
✅ Дизайн как в оригинальных файлах

## API

**Swagger**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

### Ключевые ручки

```
GET    /api/movies/                      - Лист фильмов
GET    /api/movies/{id}                  - Детали
POST   /api/users/register               - Новый пользователь
POST   /api/users/login                  - Вход
POST   /api/movies/{id}/reviews          - Новая рецензия
GET    /api/movies/{id}/reviews          - Лист рецензий
POST   /api/movies/{id}/ratings          - Новая оценка
GET    /api/movies/{id}/rating-stats     - Статистика
POST   /api/movies/{id}/favorites        - Добавить в избранное
DELETE /api/movies/{id}/favorites        - Убрать из избранного
```

## Проект

- Бэккенд: **FastAPI** (Python)
- Фронтенд: **Vanilla JS** (no deps)
- БА: **SQLite** + **SQLAlchemy** + **Alembic**
- Дизайн: Твой CSS (не исправлен)

## Вам помогает

- файл index.html — разметка тебя
- файл script.js — вся логика + API интеграция
- файл stylr.css — твой дизайн

## Экспорт BD (если нужно)

У тебя есть DBeaver или DB Browser for SQLite?

```bash
final/kinovzor.db
```

Открыть Я видить все таблицы.

---

**Отлично! Вы на дороге.** ✅

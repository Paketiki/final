# Быстрый старт (Python 3.14 Compatible)

## 4 действия

### 1️⃣ Настройка

```bash
git clone https://github.com/Paketiki/final.git
cd final
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2️⃣ Нициализация БД

```bash
python init_db.py
```

Ответ:
```
✅ Database initialized successfully!
📁 File: C:\Users\User\Desktop\final\kinovzor.db
🗓️ Tables: users, movies, reviews, ratings, favorites
```

### 3️⃣ Запуск нервера

```bash
python app/main.py
```

Откроется автоматически:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 4️⃣ Открыть браузер

Нажими с Ctrl и кликни на:

**http://localhost:8000**

---

## Архитектура

```
🏗️ Frontend (JavaScript)
    ⬅ GET http://localhost:8000/api/movies/
    ←️ API (FastAPI + sqlite3)
    💾 SQLite Database (kinovzor.db)
```

## Работающие функции

✅ Авторизация (register, login, logout, guest)  
✅ Модальные окна фильмов  
✅ Рецензии (сохраняются в БД)  
✅ Оценки звездочками  
✅ Избранное (режим реального времени)  
✅ Фильтрация и сортировка  
✅ Дизайн не исправлен

## API Локально

- **Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Ключевые ручки

```
GET    /api/movies/                      - Лист
 GET    /api/movies/{id}                  - Детали
POST   /api/users/register               - Новый пользователь
POST   /api/users/login                  - Вход
POST   /api/movies/{id}/reviews          - Новая рецензия
GET    /api/movies/{id}/reviews          - Детали рецензий
POST   /api/movies/{id}/ratings          - Новая оценка
GET    /api/movies/{id}/rating-stats     - Статистика
POST   /api/movies/{id}/favorites        - Добавить
DELETE /api/movies/{id}/favorites        - Убрать
```

## Тестование

1. Выберите "Гость"
2. Осматривайте фильмы
3. Нажимайте на постеры

---

## Тех стек

- **Backend**: FastAPI (Python 3.14+)
- **Database**: SQLite (no external dependencies)
- **Frontend**: Vanilla JavaScript
- **Styling**: CSS (yours, unchanged)

🌟 **Готово!**

# Быстрый старт (Python 3.14 Compatible)

## Одна команда для старта 🚀

### 1️⃣ Настройка

```bash
git clone https://github.com/Paketiki/final.git
cd final
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2️⃣ Запуск

Всё автоматически:

```bash
python app/main.py
```

Картинка:
```
==================================================
🌟 KinoVzor - Movie Review Platform
==================================================

🚀 Starting server...

📁 Database not found. Creating...
✅ Database initialized successfully!

🍋 Loading seed data...
🍋 Loading movies and reviews...
  ✅ 10/50 movies loaded
  ✅ 20/50 movies loaded
  ...
  ✅ 50/50 movies loaded

✅ All data loaded!
🍋 50 movies
🗣️ ~260 reviews
📁 file: kinovzor.db

✅ All ready!

INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 3️⃣ Открыть браузер

**http://localhost:8000**

При первом запуске автоматически:
- ✅ Создаст kinovzor.db
- ✅ Нагрузит 50 фильмов
- ✅ Нагрузит ~260 рецензий

---

## Как это работает

```
👫 User opens http://localhost:8000
   ⬅ FastAPI app/main.py
   ↓
   ✅ Database exists? YES → Serve app
   ✅ Database exists? NO → Create + Seed
   ↓
🏗️ Frontend (HTML/CSS/JS)
   ⬅ GET /api/movies/
   ←️ SQLite kinovzor.db (50 фильмов)
```

---

## Что работает

✅ Открыть 50 реальных фильмов  
✅ Прочитать ~260 рецензий  
✅ Оставить свои оценки  
✅ Написать рецензию  
✅ Гибридные (регистрация, вход, отлогинование)  
✅ Фильтры + сортировка  
✅ Избранные фильмы

## API

- **Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Тех стек

- **Backend**: FastAPI (Python 3.14+)
- **Database**: SQLite (auto-initialized)
- **Frontend**: Vanilla JavaScript
- **Styling**: CSS (unchanged)

---

🌟 **Отлично! Всё работает!**

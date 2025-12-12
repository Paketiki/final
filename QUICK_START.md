# Быстрый старт

## Минимальные гайд: 4 шага

### 1. Настройка

Если у тебя **Python 3.14** — останови его и установи **Python 3.11 или 3.12** (проблема с SQLAlchemy)

```bash
git clone https://github.com/Paketiki/final.git
cd final
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. База данных (без Alembic)

```bash
python init_db.py
```

Выдаст ответ:
```
✅ Database initialized successfully!
📁 File: kinovzor.db
```

### 3. Запуск

```bash
python app/main.py
```

### 4. Открыть браузер

**http://localhost:8000**

---

## Что далже?

### API документация

- Swagger: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

### Файл `.env` уже создан

```env
DATABASE_URL=sqlite+aiosqlite:///./kinovzor.db
DATABASE_ECHO=False
SERVER_HOST=127.0.0.1
SERVER_PORT=8000
```

### Что работает

✅ Авторизация  
✅ Рецензии (сохраняются)  
✅ Оценки (1-5 звезд)  
✅ Избранное (Режим реального времени)  
✅ Фильтры и сортировка  
✅ Дизайн остался межто тем ж

### База данных

```
final/kinovzor.db
```

Открыть в **DB Browser for SQLite** или **DBeaver** для редактирования

---

✨ **Отлично! Это всё, что нужно.**

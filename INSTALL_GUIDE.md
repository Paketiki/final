# Пошаговая инструкция на Windows

## Шаг 1: Предварительная установка

### 1.1 Python 3.8+
1. Скачайте Python с https://www.python.org/downloads/
2. По умолчанию устанавливается в `C:\Users\<ваше имя>\AppData\Local\Programs\Python`

### 1.2 Git
1. Установите Git с https://git-scm.com/

## Шаг 2: Клонирование репозитория

Откройте PowerShell/CMD и выполните:

```bash
git clone https://github.com/Paketiki/final.git
cd final
```

## Шаг 3: Создание виртуального окружения

```bash
python -m venv venv
venv\Scripts\activate
```

## Шаг 4: Установка зависимостей

```bash
pip install -r requirements.txt
```

## Шаг 5: Нарботание миграций

BD SQLite будет создана автоматически:

```bash
cd app
alembic upgrade head
cd ..
```

Нар эта команда создаст файл `kinovzor.db` в корне проекта.

## Шаг 6: Запуск приложения

```bash
python app/main.py
```

Откройте браузер на `http://localhost:8000`

## Где хранится база данных?

База SQLite с всеми данными (фильмы, рецензии, юзеры точно) хранится в файле:

```
final/kinovzor.db
```

## Троблешутинг

### Ошибка: Module not found
- Обычно requirements.txt не установлен
- Нужно выполнить: `pip install -r requirements.txt`

### Ошибка: Alembic migration failed
- Проверьте, что вы находитесь в нужной директории: `cd app && alembic upgrade head && cd ..`

### Ошибка: Port already in use
- Порт 8000 уже используется
- Откройте `app/main.py` и используйте другое порт, например: `uvicorn app.main:app --port 8001`

### Ошибка: database is locked
- Некоторые программы (они видимет SQLite) могут блокировать базу
- Перезагружите FastAPI сервер
- Остановите другие полюзы (напр. DBeaver, DB Browser for SQLite)

## Основные адреса

- Приложение: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Вам не нужно

- PostgreSQL (SQLite всё делает сам)
- Составлять конфиг `.env` - по умолчанию все работает
- Мануально создавать BD - Alembic сделают её сами

## Тестование

При первом открытии:

1. Выберите "Гость" для тестирования
2. Или регистрируйтесь новым аккаунтом
3. Осматривайте фильмы, оставляйте рецензии и оценки

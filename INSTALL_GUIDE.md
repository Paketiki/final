# Пошаговая инструкция на Windows

## Шаг 1: Предварительная установка

### 1.1 PostgreSQL
1. Скачайте PostgreSQL с https://www.postgresql.org/download/windows/
2. Установите, запомните пароль postgres
3. На вопрос о port - выберите 5432 (default)

### 1.2 Python 3.8+
1. Скачайте Python с https://www.python.org/downloads/
2. По умолчанию устанавливается в `C:\Users\<ваше имя>\AppData\Local\Programs\Python`

### 1.3 Git
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

## Шаг 5: Конфигурация базы данных

### 5.1 Создание соответствующей базы данных

Откройте pgAdmin (PostgreSQL) или используйте cmd:

```bash
psql -U postgres
# В psql выполните:
CREATE DATABASE kinovzor;
\q
```

### 5.2 Нарботание миграций

```bash
cd app
alembic upgrade head
cd ..
```

## Шаг 6: Запуск приложения

```bash
python app/main.py
```

Откройте браузер на `http://localhost:8000`

## Троблешутинг

### Ошибка: Module not found
- Обычно requirements.txt не установлен
- Нужно выполнить: `pip install -r requirements.txt`

### Ошибка: Database connection
- Очистите, уверю сь что PostgreSQL работает: `psql -U postgres`
- Нарботайте миграции: `cd app && alembic upgrade head && cd ..`

### Ошибка: Port already in use
- Порт 8000 уже используется
- Откройте `app/main.py` и используйте другое портс, например 8001

## Основные адреса

- Приложение: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Тестование

При первом открытии:

1. Выберите "Гость" для тестирования
2. Или регистрируйтесь тестовым обыкновенным аккаунтом

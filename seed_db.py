"""Seed database with movies and reviews from script.js"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import db

# Data from script.js
posters = [
    "https://images.pexels.com/photos/799137/pexels-photo-799137.jpeg",
    "https://images.pexels.com/photos/799114/pexels-photo-799114.jpeg",
    "https://images.pexels.com/photos/799152/pexels-photo-799152.jpeg",
    "https://images.pexels.com/photos/5701233/pexels-photo-5701233.jpeg",
    "https://images.pexels.com/photos/799127/pexels-photo-799127.jpeg",
    "https://images.pexels.com/photos/799158/pexels-photo-799158.jpeg",
    "https://images.pexels.com/photos/799150/pexels-photo-799150.jpeg",
    "https://images.pexels.com/photos/799116/pexels-photo-799116.jpeg",
]

genres = [
    "Драма",
    "Боевик",
    "Фантастика",
    "Комедия",
    "Триллер",
    "Мелодрама",
    "Фэнтези",
    "Ужасы",
    "Анимация",
    "Приключения",
]

base_titles = [
    "Город огней",
    "Тихий океан",
    "Последний шанс",
    "Звющный путь",
    "Ночная смена",
    "Падение героев",
    "Ледяной ветер",
    "Чужие небеса",
    "Сердце стали",
    "Осколки памяти",
]

review_templates = [
    [
        "Отличный фильм, держит в напряжении до самого конца.",
        "Прекрасная игра актеров и интересный сюжет.",
        "Немного затянуто, но финал стоит ожидания.",
        "Очень атмосферная картина, рекомендую.",
        "Есть слабые моменты, но в целом достойно.",
    ],
    [
        "Динамичный и зрелищный фильм, не скучал ни минуты.",
        "Музыка и визуал на высоте.",
        "Сюжет предсказуем, но смотреть приятно.",
        "Хороший выбор для вечерного просмотра.",
        "Второй раз смотреть не буду, но один раз стоит.",
    ],
    [
        "Фильм заставляет задуматься о многом.",
        "Сильная драма с запоминающимися героями.",
        "Иногда кажется слишком мрачным.",
        "Очень реалистично и честно.",
        "Оставляет послевкусие, о котором думаешь ещё долго.",
    ],
]

def seed_movies_and_reviews():
    """Load all 50 movies with reviews into database"""
    print("🍋 Лоадинг фильмы и рецензии...")
    
    year_start = 1995
    movie_ids = []  # для привязки к рецензиям
    
    for i in range(50):
        base_title = base_titles[i % len(base_titles)]
        title = f"{base_title} {i + 1}"
        genre = genres[i % len(genres)]
        poster = posters[i % len(posters)]
        description = "Фильм из подборки КиноВзор. История о выборе, характере и неожиданных поворотах судьбы."
        year = year_start + (i % 25)
        
        # Create movie
        movie = db.create_movie(
            title=title,
            description=description,
            genre=genre,
            year=year,
            poster_url=poster
        )
        movie_id = movie['id']
        movie_ids.append(movie_id)
        
        # Add reviews
        template = review_templates[i % len(review_templates)]
        review_count = 4 + (i % 4)  # 4-7 reviews
        
        for j in range(review_count):
            review_text = template[j % len(template)]
            rating = 3 + ((i + j) % 3)  # 3-5 stars
            author = "Гость" if j % 2 == 0 else "Постоянный зритель"
            
            db.create_review(
                movie_id=movie_id,
                user_id=None,  # No specific user
                text=review_text,
                rating=rating
            )
        
        # Print progress
        if (i + 1) % 10 == 0:
            print(f"  ✅ {i + 1}/50 фильмов загружено")
    
    print(f"
✅ Все данные загружены!")
    print(f"🍋 50 фильмов")
    print(f"🗣️ ~260 рецензий")
    print(f"📁 файл: kinovzor.db")

if __name__ == "__main__":
    seed_movies_and_reviews()

from sqlalchemy import text, String, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base, int_pk
from typing import List


class Movie(Base):
    id: Mapped[int_pk]
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    genre: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    poster_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relationships
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="movie", cascade="all, delete-orphan")
    ratings: Mapped[List["Rating"]] = relationship("Rating", back_populates="movie", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="movie", cascade="all, delete-orphan")

    extend_existing = True

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, title={self.title})"


class Review(Base):
    id: Mapped[int_pk]
    movie_id: Mapped[int] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=True)  # рейтинг в рецензии (1-5)
    approved: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)

    # Relationships
    movie: Mapped["Movie"] = relationship("Movie", back_populates="reviews")
    user: Mapped["User"] = relationship("User", back_populates="reviews")

    extend_existing = True

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, movie_id={self.movie_id})"


class Rating(Base):
    id: Mapped[int_pk]
    movie_id: Mapped[int] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)  # рейтинг в звездочках (1-5)

    # Relationships
    movie: Mapped["Movie"] = relationship("Movie", back_populates="ratings")
    user: Mapped["User"] = relationship("User", back_populates="ratings")

    extend_existing = True

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, movie_id={self.movie_id})"


class Favorite(Base):
    id: Mapped[int_pk]
    movie_id: Mapped[int] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(nullable=False)

    # Relationships
    movie: Mapped["Movie"] = relationship("Movie", back_populates="favorites")
    user: Mapped["User"] = relationship("User", back_populates="favorites")

    extend_existing = True

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, movie_id={self.movie_id})"

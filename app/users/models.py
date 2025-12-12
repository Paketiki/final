from sqlalchemy import text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base, str_uniq, int_pk
from typing import List


class User(Base):
    id: Mapped[int_pk]
    email: Mapped[str_uniq]
    password: Mapped[str]
    username: Mapped[str]

    is_user: Mapped[bool] = mapped_column(default=True, server_default=text('true'), nullable=False)
    is_moderator: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)
    is_admin: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)

    # Relationships
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    ratings: Mapped[List["Rating"]] = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

    extend_existing = True

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, username={self.username})"

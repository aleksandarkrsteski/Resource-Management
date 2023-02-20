from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    quantity = Column(Integer)
    properties = Column(String)
    category_id = Column(Integer, ForeignKey('categories.id'))

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    parent = Column(Integer)
    properties = Column(String)

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    resource_id = Column(Integer, ForeignKey('resources.id'))
    quantity = Column(Integer)
    from_date = Column(String)
    to_date = Column(String)
    status = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    email = Column(String)
    password = Column(String)
    role = Column(String)

class Token(BaseModel):
    access_token: str
    token_type: str
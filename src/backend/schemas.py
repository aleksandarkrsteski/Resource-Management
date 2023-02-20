from typing import Optional

from pydantic import BaseModel, BaseSettings

from models import User

class ResourceBase(BaseModel):
    name: str
    quantity: int
    properties: str
    category_id: int

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int

    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent: Optional[int] = None
    properties: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    description: Optional[str] = None
    parent: Optional[int] = None
    properties: Optional[str] = None

class Category(CategoryBase):
    id: int

    class Config:
        orm_mode = True

class ReservationBase(BaseModel):
    user_id: int
    resource_id: int
    quantity: int
    from_date: str
    to_date: str
    status: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(ReservationBase):
    id: int


class ReservationInDBBase(ReservationBase):
    id: int
    user_id: int
    resource_id: int

    class Config:
        orm_mode = True


class Reservation(ReservationInDBBase):
    pass


class ReservationInDB(ReservationInDBBase):
    pass


class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    hashed_password: str

    class Config:
        orm_mode = True

class UserCreateInDB(UserBase):
    hashed_password: str
from sqlite3 import IntegrityError
from typing import List
from datetime import timedelta, datetime
from fastapi import status

from fastapi import FastAPI, Depends, HTTPException
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from starlette.middleware.cors import CORSMiddleware

from config import settings
from database import SessionLocal, engine
import models, schemas, crud
from hashing import Hasher
from security import create_access_token

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS settings
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def authenticate_user(username: str, password: str,db: Session):
    user = crud.get_user(username=username, db=db)
    print(user)
    if not user:
        return False
    if not Hasher.verify_password(password, user.password):
        return False
    return user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
#new

def get_current_user(token: str = Depends(oauth2_scheme), db: Session=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        print("username/email extracted is ",username)
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user(username=username, db=db)
    if user is None:
        raise credentials_exception
    return user


def is_admin(current_user: schemas.User = Depends(get_current_user)):
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail='Only admin users can access this endpoint')

@app.post("/resources/", dependencies=[Depends(get_current_user)], response_model=schemas.Resource)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    db_resource = crud.create_resource(db, resource)
    return db_resource

@app.get("/resources/{resource_id}", dependencies=[Depends(get_current_user)], response_model=schemas.Resource)
def read_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = crud.get_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db_resource

@app.get("/resources/", response_model=List[schemas.Resource], dependencies=[Depends(get_current_user)])
def read_resources(db: Session = Depends(get_db)):
    resources = crud.get_resources(db)
    return resources

@app.put("/resources/{resource_id}", dependencies=[Depends(is_admin)], response_model=schemas.Resource)
def update_resource(resource_id: int, resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    db_resource = crud.get_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    db_resource = crud.update_resource(db, resource_id, resource)
    return db_resource

@app.delete("/resources/{resource_id}", dependencies=[Depends(is_admin)], response_model=schemas.Resource)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = crud.get_resource(db, resource_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    db_resource = crud.delete_resource(db, resource_id)
    return db_resource

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),db: Session= Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password,db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "rl": user.role, "usrid": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = Hasher.get_password_hash(user.password)
    user = crud.create_user(
        db=db, user=schemas.UserCreateInDB(**user.dict(), hashed_password=hashed_password)
    )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user['email']}, expires_delta=access_token_expires)
    a = {"access_token": access_token, "token_type": "bearer", "user": user}
    return a

@app.get("/categories/{category_id}/children", dependencies=[Depends(get_current_user)], response_model=List[schemas.Category])
def read_child_categories(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    child_categories = crud.get_direct_child_categories(db, parent_id=category_id)
    return child_categories

@app.get("/categories/primary", dependencies=[Depends(get_current_user)], response_model=List[schemas.Category])
def read_child_categories(db: Session = Depends(get_db)):
    categories = crud.get_primary_categories(db)
    return categories

# Create a category
@app.post("/categories/", dependencies=[Depends(get_current_user)], response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_category(db, category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category with that name already exists")

# Get all categories
@app.get("/categories/", dependencies=[Depends(get_current_user)], response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

# Get a single category by ID
@app.get("/categories/{category_id}", dependencies=[Depends(get_current_user)],response_model=schemas.Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

# Update a category
@app.put("/categories/{category_id}", dependencies=[Depends(is_admin)], response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    for var, value in vars(category).items():
        setattr(db_category, var, value) if value else None
    db.commit()
    db.refresh(db_category)
    return db_category

# Delete a category
@app.delete("/categories/{category_id}", dependencies=[Depends(is_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}


@app.get("/category/{category_id}/resources", dependencies=[Depends(get_current_user)], response_model=List[schemas.Resource])
def get_resources_in_category(category_id: int, db: Session = Depends(get_db)):
    resources = crud.get_all_resources_in_category_and_descendants(db, category_id)
    return resources

@app.get("/category/{category_id}/leafs", dependencies=[Depends(get_current_user)], response_model=List[schemas.Category])
def get_resources_in_category(category_id: int, db: Session = Depends(get_db)):
    return crud.get_leaf_categories_in_category(db, category_id)

@app.get("/category/leafs", dependencies=[Depends(get_current_user)], response_model=List[schemas.Category])
def get_resources_in_category(db: Session = Depends(get_db)):
    return crud.get_all_leaf_categories(db)\

@app.get("/category/primary-leafs", dependencies=[Depends(get_current_user)])
def get_resources_in_category(db: Session = Depends(get_db)):
    return crud.get_leaf_categories_without_parent(db)

@app.post("/reservations", dependencies=[Depends(get_current_user)])
def create_reservation(
    reservation: schemas.ReservationCreate, db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_id(db, user_id=reservation.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_resource = crud.get_resource(db, resource_id=reservation.resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud.create_reservation(db=db, reservation=reservation)

@app.get("/reservations", dependencies=[Depends(get_current_user)])
def read_reservations(db: Session = Depends(get_db),  current_user: schemas.User = Depends(get_current_user)):
    reservations = crud.get_reservations(db, current_user)
    return reservations

@app.get("/reservations/{reservation_id}", dependencies=[Depends(get_current_user)])
def read_reservation(reservation_id: int, db: Session = Depends(get_db)):
    db_reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if db_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return db_reservation

@app.put("/reservations/{reservation_id}", dependencies=[Depends(get_current_user)])
def update_reservation(
    reservation_id: int, reservation: schemas.ReservationUpdate, db: Session = Depends(get_db)
):
    db_reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if db_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_user = crud.get_user_by_id(db, user_id=reservation.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_resource = crud.get_resource(db, resource_id=reservation.resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud.update_reservation(db=db, reservation=reservation, reservation_id=reservation_id)

@app.delete("/reservations/{reservation_id}", dependencies=[Depends(get_current_user)])
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    db_reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if db_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return crud.delete_reservation(db=db, reservation_id=reservation_id)

@app.get("/reservations/user/{user_id}", dependencies=[Depends(get_current_user)])
def read_reservations_by_user_id(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_reservations_by_user_id(db, user_id=user_id)

@app.get("/reservations/resource/{resource_id}", dependencies=[Depends(get_current_user)])
def get_reservations_by_resource_id_and_period(
    resource_id: int,
    from_date: datetime,
    to_date: datetime,
    db: Session = Depends(get_db)
):
    reservations = crud.get_reservations_by_resource_id_and_period(db, resource_id=resource_id, from_date=from_date, to_date=to_date)
    if not reservations:
        raise HTTPException(status_code=404, detail="Reservations not found")
    return reservations

@app.get("/resources/{resource_id}/availability", dependencies=[Depends(get_current_user)])
def get_resource_availability(resource_id: int, from_date: datetime, to_date: datetime, db: Session = Depends(get_db)):
    resource = crud.get_resource(db, resource_id)
    reservations = crud.get_reservations_by_resource_id_and_period(db, resource_id, from_date, to_date)

    total_quantity = resource.quantity
    reserved_quantity = sum([r.quantity for r in reservations if r.status != "done"])
    available_quantity = total_quantity - reserved_quantity

    return {
        "id": resource.id,
        "name": resource.name,
        "properties": resource.properties,
        "quantity": available_quantity
    }

@app.get("/users/", dependencies=[Depends(is_admin)])
def read_users(db: Session = Depends(get_db)):
    resources = crud.get_users(db)
    return resources

@app.put("/users/{user_id}", dependencies=[Depends(is_admin)])
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_resource = crud.get_user_by_id(db, user_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_resource = crud.update_user(db, user_id, user)
    return db_resource

@app.delete("/users/{user_id}", dependencies=[Depends(is_admin)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_resource = crud.get_user_by_id(db, user_id)
    if db_resource is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_resource = crud.delete_user(db, user_id)
    return db_resource

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Resource Management System",
        version="1.0.0",
        description="System for managing and reserving resources",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for route in openapi_schema["paths"]:
        for method in openapi_schema["paths"][route]:
            if "security" not in openapi_schema["paths"][route][method]:
                openapi_schema["paths"][route][method]["security"] = [{"bearerAuth": []}]
            else:
                openapi_schema["paths"][route][method]["security"].append({"bearerAuth": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
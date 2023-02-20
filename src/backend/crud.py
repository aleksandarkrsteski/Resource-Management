import json
from datetime import datetime
from http.client import HTTPException
from operator import and_
from typing import List

from sqlalchemy import cast, DateTime
from sqlalchemy.orm import Session, aliased
from starlette import status

import models
import schemas
from models import Resource, User
from schemas import ResourceCreate, UserCreateInDB

from sqlalchemy.orm import selectinload
from sqlalchemy import or_


def create_resource(db: Session, resource: ResourceCreate):
    db_resource = Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def get_resource(db: Session, resource_id: int):
    return db.query(Resource).filter(Resource.id == resource_id).first()


def get_resources(db: Session):
    return db.query(Resource).all()


def update_resource(db: Session, resource_id: int, resource: ResourceCreate):
    db_resource = get_resource(db, resource_id)
    db_resource.name = resource.name
    db_resource.quantity = resource.quantity
    db_resource.properties = resource.properties
    db_resource.category_id = resource.category_id
    db.commit()
    db.refresh(db_resource)
    return db_resource


def delete_resource(db: Session, resource_id: int):
    db_resource = get_resource(db, resource_id)
    db.delete(db_resource)
    db.commit()
    return db_resource


def get_user(db: Session, username: str):
    user = db.query(User).filter(User.email == username).first()
    return user


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    return user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreateInDB):
    db_user = User(
        email=user.email,
        username=user.username,
        role=user.role,
        password=user.hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return vars(db_user)


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.flush()  # Flush the session to get the id of the category

    if db_category.parent:
        parent = get_category(db, category_id=db_category.parent)
        resources = get_all_resources_in_category_and_descendants(db, parent.id)
        if resources:
            for resource in resources:
                resource.category_id = db_category.id

                dict1 = json.loads(resource.properties)
                dict2 = json.loads(db_category.properties)

                for key, value in dict2.items():
                    if key not in dict1:
                        dict1[key] = ""

                resource.properties = json.dumps(dict1)
                db.add(resource)

    db.commit()
    db.refresh(db_category)

    return db_category


def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        return None
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        return None
    db.delete(db_category)
    db.commit()
    return db_category


def get_multi_by_category(
        db: Session, *, category_id: int, skip: int = 0, limit: int = 100
) -> List[schemas.Resource]:
    resources = (
        db.query(models.Resource)
        .filter(models.Resource.category_id == category_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return resources


def get_child_categories(db: Session, category_id: int) -> List[models.Category]:
    result = []
    stack = [category_id]
    while stack:
        current = stack.pop()
        children = db.query(models.Category).filter(models.Category.parent == current).all()
        result += children
        stack += [child.id for child in children]
    return result


def create_reservation(db: Session, reservation: schemas.ReservationCreate):
    db_reservation = models.Reservation(**reservation.dict())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def get_reservations(db: Session, user: schemas.User):
    if user.role == 'ADMIN':
        reservations = db.query(models.Reservation).all()
    else:
        reservations = db.query(models.Reservation).filter(models.Reservation.user_id == user.id).all()

    resource_names = {r.id: r.name for r in db.query(models.Resource).all()}
    user_names = {r.id: r.username for r in db.query(models.User).all()}

    for r in reservations:
        r.resource_name = resource_names.get(r.resource_id)
        r.user_name = user_names.get(r.user_id)

    return reservations

def get_reservation(db: Session, reservation_id: int):
    return db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()


def update_reservation(db: Session, reservation_id: int, reservation: schemas.ReservationUpdate) -> schemas.Reservation:
    db_reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    update_data = reservation.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_reservation, field, update_data[field])
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def delete_reservation(db: Session, reservation_id: int):
    reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    db.delete(reservation)
    db.commit()
    return reservation


def get_reservations_by_user_id(db: Session, user_id: int) -> List[schemas.Reservation]:
    reservations = db.query(models.Reservation).filter(models.Reservation.user_id == user_id).all()
    return reservations


def get_reservations_by_resource_id_and_period(
        db: Session,
        resource_id: int,
        from_date: datetime,
        to_date: datetime,
):
    reservations = (
        db.query(models.Reservation)
        .filter(
            models.Reservation.resource_id == resource_id,
            cast(models.Reservation.from_date, DateTime) < to_date,
            cast(models.Reservation.to_date, DateTime) > from_date,
        )
        .all()
    )
    return reservations


def get_primary_categories(db):
    primary_categories = db.query(models.Category).filter(models.Category.parent == None).all()
    return primary_categories


def get_direct_child_categories(db, parent_id):
    primary_categories = db.query(models.Category).filter(models.Category.parent == parent_id).all()
    return primary_categories


def get_all_resources_in_category_and_descendants(session, category_id):
    # Get the category object for the given category_id
    category = session.query(models.Category).get(category_id)

    # Build a list of category IDs for all the descendants of the given category
    category_ids = [category_id]
    child_categories = get_direct_child_categories(session, category_id)
    while child_categories:
        category_ids += [child.id for child in child_categories]
        child_categories = [grandchild for child in child_categories for grandchild in
                            get_direct_child_categories(session, child.id)]

    # Use the list of category IDs to query for all resources in the category and its descendants
    resources = session.query(Resource).filter(
        or_(Resource.category_id == cid for cid in category_ids)
    ).all()

    return resources


def get_leaf_categories_in_category(session, category_id):
    parent = aliased(models.Category)
    child = aliased(models.Category)

    query = session.query(parent).outerjoin(child, parent.id == child.parent).filter(child.id.is_(None)).filter(
        parent.parent == category_id)
    return query.all()


def get_all_leaf_categories(session):
    parent = aliased(models.Category)
    child = aliased(models.Category)

    query = session.query(parent).outerjoin(child, parent.id == child.parent).filter(child.id.is_(None))
    return query.all()


def get_leaf_categories_without_parent(session):
    all_leafs = get_all_leaf_categories(session)
    return [i for i in all_leafs if i.parent is None]
def get_users(db: Session):
    return db.query(User).filter(models.User.password != None).all()

def update_user(db: Session, user_id: int, user: schemas.UserCreate):
    db_user = get_user_by_id(db, user_id)
    db_user.username = user.username
    db_user.email = user.email
    db_user.role = user.role
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    db_user.password = None
    db.commit()
    db.refresh(db_user)
    return db_user

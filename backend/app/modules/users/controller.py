from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user, require_admin
from .model import User
from .dto import UserResponse, UserUpdateRequest, AdminUserUpdateRequest, AdminUserCreateRequest
from .service import UsersService

router = APIRouter()

def get_users_service(db: Session = Depends(get_db)):
    return UsersService(db)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_me(req: UserUpdateRequest, current_user: User = Depends(get_current_user), service: UsersService = Depends(get_users_service)):
    return service.update_me(current_user, req)

@router.get("/", response_model=List[UserResponse], dependencies=[Depends(require_admin)])
def get_all_users(service: UsersService = Depends(get_users_service)):
    return service.get_all_users()

@router.post("/", response_model=UserResponse, dependencies=[Depends(require_admin)], status_code=status.HTTP_201_CREATED)
def admin_create_user(req: AdminUserCreateRequest, db: Session = Depends(get_db), service: UsersService = Depends(get_users_service)):
    try:
        return service.admin_create_user(req, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
def admin_update_user(id: int, req: AdminUserUpdateRequest, db: Session = Depends(get_db), service: UsersService = Depends(get_users_service)):
    try:
        return service.admin_update_user(id, req, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(require_admin)])
def admin_delete_user(id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db), service: UsersService = Depends(get_users_service)):
    try:
        return service.admin_delete_user(id, current_user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

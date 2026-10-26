from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.config import settings
from app.core.security import create_refresh_token
from jose import jwt, JWTError
from .dto import UserCreateRequest, UserLoginRequest, TokenResponse
from .service import AuthService
from .exceptions import InvalidCredentials

router = APIRouter()

def get_auth_service(db: Session = Depends(get_db)):
    return AuthService(db)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    is_secure = settings.is_production
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

@router.post("/register", response_model=TokenResponse)
def register(req: UserCreateRequest, response: Response, service: AuthService = Depends(get_auth_service)):
    try:
        user = service.register_user(req)
        access_token, _ = service.authenticate_user(UserLoginRequest(email=req.email, password=req.password))
        refresh_token = create_refresh_token(data={"sub": user.email, "role": user.role})
        set_auth_cookies(response, access_token, refresh_token)
        return TokenResponse(access_token=access_token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, response: Response, service: AuthService = Depends(get_auth_service)):
    access_token, user = service.authenticate_user(req)
    refresh_token = create_refresh_token(data={"sub": user.email, "role": user.role})
    set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(access_token=access_token)

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid payload")
            
        from app.core.security import create_access_token
        new_access_token = create_access_token(data={"sub": email, "role": role})
        new_refresh_token = create_refresh_token(data={"sub": email, "role": role})
        set_auth_cookies(response, new_access_token, new_refresh_token)
        return TokenResponse(access_token=new_access_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

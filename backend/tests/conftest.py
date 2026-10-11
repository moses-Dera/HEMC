import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.core.base import Base
from app.core.db import get_db
from app.modules.users.model import User
from app.modules.notifications.model import Notification

# In-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    # Setup: Create all tables
    Base.metadata.create_all(bind=engine)
    yield engine
    # Teardown: Drop all tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(client, db_session):
    # Register a standard user
    response = client.post("/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    token = response.json()["access_token"]
    
    return {
        "email": "test@example.com",
        "password": "password123",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }

@pytest.fixture(scope="function")
def test_admin(client, db_session):
    # Register an admin user directly via DB since registration defaults to student
    from app.core.security import get_password_hash
    admin = User(name="Admin User", email="admin@example.com", hashed_password=get_password_hash("adminpass"), role="admin")
    db_session.add(admin)
    db_session.commit()
    
    response = client.post("/auth/login", json={
        "email": "admin@example.com",
        "password": "adminpass"
    })
    token = response.json()["access_token"]
    
    return {
        "email": "admin@example.com",
        "password": "adminpass",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }

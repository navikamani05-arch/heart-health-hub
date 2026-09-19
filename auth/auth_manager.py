import bcrypt
from database.models import User
from database.db_config import SessionLocal

def hash_password(password: str) -> str:
    """Hashes a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed password."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def register_user(username, email, password):
    """Registers a new user into the database."""
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            return False, "Username or email already exists."
            
        hashed_pw = hash_password(password)
        new_user = User(username=username, email=email, password_hash=hashed_pw)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return True, "Registration successful."
    except Exception as e:
        db.rollback()
        return False, str(e)
    finally:
        db.close()

def authenticate_user(username, password):
    """Authenticates a user and returns the user object if successful."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None, "Invalid username or password."
            
        if verify_password(password, user.password_hash):
            return user, "Login successful."
        else:
            return None, "Invalid username or password."
    finally:
        db.close()

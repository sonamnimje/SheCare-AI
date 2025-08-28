import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # SMTP settings
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "your_email@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_app_password")
    EMAIL_SENDER = os.getenv("EMAIL_SENDER", SMTP_USER)
    # Database settings
    DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite")  # sqlite, postgresql, mysql
    
    # SQLite settings
    SQLITE_DATABASE_URL = "sqlite:///./shecare.db"
    
    # PostgreSQL settings
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "shecare_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "shecare_password")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "shecare_db")
    
    # MySQL settings
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_USER = os.getenv("MYSQL_USER", "shecare_user")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "shecare_password")
    MYSQL_DB = os.getenv("MYSQL_DB", "shecare_db")
    
    # JWT settings
    SECRET_KEY = os.getenv("SECRET_KEY", "shecare_secret_key_change_this")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
    
    @property
    def DATABASE_URL(self):
        if self.DATABASE_TYPE == "postgresql":
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        elif self.DATABASE_TYPE == "mysql":
            return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        else:
            return self.SQLITE_DATABASE_URL

settings = Settings() 
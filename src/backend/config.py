from pathlib import Path

from dotenv import load_dotenv

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = "Resource Manager"
    PROJECT_VERSION: str = "1.0.0"

    SECRET_KEY: str = "SECRET"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30  # in mins

settings = Settings()

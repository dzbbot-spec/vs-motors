from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    BOT_TOKEN: str
    BOT_USERNAME: str
    OWNER_TELEGRAM_ID: int
    CLOUDINARY_URL: str
    CLOUDINARY_FOLDER: str = "vs-motors"
    MINI_APP_URL: str = ""
    CORS_ORIGINS: str = ""
    WEBHOOK_URL: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS:
            return [o.strip() for o in self.CORS_ORIGINS.split(",")]
        if self.MINI_APP_URL:
            return [self.MINI_APP_URL]
        return ["*"]

    class Config:
        env_file = ".env"


settings = Settings()

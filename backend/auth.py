import hashlib
import hmac
from urllib.parse import parse_qsl, unquote

from fastapi import Depends, Header, HTTPException
from config import settings


def verify_init_data(init_data: str) -> dict:
    """Верифицирует Telegram initData через HMAC-SHA256 и возвращает распарсенные поля."""
    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Отсутствует hash в initData")

    # Строка для проверки: поля в алфавитном порядке, разделённые \n
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    # Секретный ключ = HMAC-SHA256("WebAppData", BOT_TOKEN)
    secret_key = hmac.new(
        b"WebAppData",
        settings.BOT_TOKEN.encode(),
        hashlib.sha256,
    ).digest()

    expected_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise HTTPException(status_code=401, detail="Недействительный initData")

    return parsed


def get_telegram_user(init_data: str) -> dict:
    """Извлекает user из initData."""
    import json
    parsed = verify_init_data(init_data)
    user_raw = parsed.get("user")
    if not user_raw:
        raise HTTPException(status_code=401, detail="Нет данных пользователя в initData")
    return json.loads(unquote(user_raw))


def require_owner(
    x_telegram_init_data: str = Header(..., alias="X-Telegram-Init-Data"),
) -> dict:
    """FastAPI dependency — пропускает только владельца, иначе 403."""
    user = get_telegram_user(x_telegram_init_data)
    if user.get("id") != settings.OWNER_TELEGRAM_ID:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    return user

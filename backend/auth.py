import hashlib
import hmac
import json
from urllib.parse import parse_qsl, unquote

from fastapi import Header, HTTPException
from config import settings


def _parse_user(params: dict) -> dict:
    user_raw = params.get("user")
    if not user_raw:
        raise HTTPException(status_code=401, detail="Нет данных пользователя")
    return json.loads(unquote(user_raw))


def verify_init_data(init_data: str) -> dict:
    """Верифицирует Telegram initData через HMAC-SHA256."""
    params = dict(parse_qsl(init_data, strict_parsing=False))
    received_hash = params.pop("hash", None)
    # Bot API 7.3: поле signature не входит в data_check_string для hash
    params.pop("signature", None)

    if not received_hash:
        raise HTTPException(status_code=401, detail="Нет hash в initData")

    # Режим разработки: пропускаем проверку подписи для владельца
    if settings.DEBUG_SKIP_AUTH:
        user = _parse_user(params)
        if user.get("id") == settings.OWNER_TELEGRAM_ID:
            return params
        # Для не-владельца всё равно проверяем подпись
        raise HTTPException(status_code=403, detail="Доступ запрещён (debug mode)")

    data_check = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
    secret = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
    expected = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, received_hash):
        raise HTTPException(status_code=401, detail="Неверная подпись initData")

    return params


def require_owner(
    x_telegram_init_data: str = Header(..., alias="X-Telegram-Init-Data"),
) -> dict:
    """FastAPI dependency — пропускает только владельца."""
    params = verify_init_data(x_telegram_init_data)
    user = _parse_user(params)
    if user.get("id") != settings.OWNER_TELEGRAM_ID:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    return user

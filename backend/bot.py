from aiogram import Bot, Dispatcher
from aiogram.types import (
    Message, InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, BotCommand, MenuButtonWebApp,
)
from aiogram.filters import CommandStart, Command
from aiogram import F
from config import settings

bot = Bot(token=settings.BOT_TOKEN)
dp = Dispatcher()


async def setup_bot_commands() -> None:
    """Регистрирует команды и Menu Button при старте."""
    await bot.set_my_commands([
        BotCommand(command="start", description="Открыть VS MOTORS"),
        BotCommand(command="help", description="Помощь"),
    ])
    if settings.MINI_APP_URL:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="VS MOTORS",
                web_app=WebAppInfo(url=settings.MINI_APP_URL),
            )
        )


def _mini_app_keyboard(start_param: str | None = None) -> InlineKeyboardMarkup | None:
    if not settings.MINI_APP_URL:
        return None
    url = settings.MINI_APP_URL
    if start_param:
        url = f"{url}?startapp={start_param}"
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🚗 Открыть VS MOTORS",
            web_app=WebAppInfo(url=url),
        )
    ]])


@dp.message(CommandStart(deep_link=True, magic=F.text.regexp(r"listing_\S+")))
async def cmd_start_deep_link(message: Message) -> None:
    """Deep link: /start listing_<uuid> — открывает конкретное объявление."""
    start_param = message.text.split(maxsplit=1)[1] if " " in message.text else ""
    await message.answer(
        "Открываю объявление VS MOTORS:",
        reply_markup=_mini_app_keyboard(start_param),
    )


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Привет! Я бот VS MOTORS — витрина автомобилей.\n\n"
        "Нажми кнопку ниже чтобы открыть приложение:",
        reply_markup=_mini_app_keyboard(),
    )


@dp.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(
        "VS MOTORS — витрина автомобилей.\n\n"
        "Здесь вы можете посмотреть актуальные объявления о продаже автомобилей "
        "и связаться с продавцом напрямую через Telegram, WhatsApp или телефон.\n\n"
        "/start — открыть приложение"
    )

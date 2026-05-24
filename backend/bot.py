from aiogram import Bot, Dispatcher
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import CommandStart, Command
from config import settings

bot = Bot(token=settings.BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    text = (
        "Привет! Я бот VS MOTORS — витрина автомобилей.\n\n"
        "Нажми кнопку ниже чтобы открыть приложение:"
    )
    keyboard = None
    if settings.MINI_APP_URL:
        keyboard = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="🚗 Открыть VS MOTORS",
                web_app=WebAppInfo(url=settings.MINI_APP_URL),
            )
        ]])
    await message.answer(text, reply_markup=keyboard)


@dp.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(
        "VS MOTORS — витрина автомобилей.\n\n"
        "Здесь вы можете посмотреть актуальные объявления о продаже автомобилей "
        "и связаться с продавцом напрямую через Telegram, WhatsApp или телефон.\n\n"
        "/start — открыть приложение"
    )

# Ops Desk

Личный дашборд на **пять направлений**:

1. **EdgeBot** — скринер / whitelist / live paper  
2. **Trade Master** — приложение / сторы / бэкенд  
3. **Telegram-хаб** — Desk Club / Academy / домашки  
4. **RU-сообщество** — сессии / контент (заполняешь сам)  
5. **Системный анализ** — обучение и собеседования (заполняешь сам)

Конструктор задач: добавить / отметить / править / удалить.  
Пинги в Telegram (дата + текст) + браузерные уведомления + опционально Bot API.  
Данные в `localStorage` браузера; есть экспорт/импорт JSON.

## Сайт

После деплоя Pages: **https://pavelcrypto70.github.io/open-desk/**

Локально:

```bash
python -m http.server 8765
# http://127.0.0.1:8765
```

## Telegram Bot (опционально)

1. [@BotFather](https://t.me/BotFather) → токен  
2. Напиши боту `/start`, узнай `chat_id`  
3. На сайте → **Telegram** → вставь token + chat_id → включи «Слать через Bot API»

## Seed

Первый запуск подтягивает задачи из репозиториев EdgeBot и `trading_education_app`.  
Кнопка **Сброс seed** затирает локальные правки.

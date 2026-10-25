/** Seed из репозиториев EdgeBot + trading_education_app. RU / Sys — шаблоны. */
window.DESK_SEED = {
  version: 1,
  generatedFrom: [
    "Pavelcrypto70/EdgeBot",
    "Pavelcrypto70/trading_education_app",
  ],
  columns: [
    {
      id: "edgebot",
      title: "EdgeBot",
      accent: "teal",
      essence:
        "Bybit desk: скринер → MA (heavy/medium/fast) → OOS proof → whitelist → бумажный emulator + публичный Pages. Автономный скан ~час, live-тик по whitelist.",
      tracks: [
        {
          id: "core",
          title: "Ядро / live",
          tasks: [
            {
              id: "eb-1",
              title: "Проверить live v9: открытые бумажные позиции видны на Pages",
              notes:
                "Ветка live-v9-visible / merge на main. Символы вроде ZEC/MSTR/SNDK. Сверить trading.json vs UI.",
              status: "open",
              priority: 1,
              telegramPing: null,
            },
            {
              id: "eb-2",
              title: "Стабилизировать цепочку тиков (cron 5m + EDGEBOT_TICK_TOKEN ~1m)",
              notes:
                "trading-live.yml: push-конфликты, queue next tick. Убедиться что секрет задан и тики не отваливаются ночью.",
              status: "open",
              priority: 1,
              telegramPing: {
                at: null,
                note: "Пинг себе: «тик живой? посмотри Actions EdgeBot live»",
              },
            },
            {
              id: "eb-3",
              title: "Решить судьбу medium/fast: оставить выкл. fast или вернуть осторожно",
              notes:
                "README: fast выключен в live. Были режимы heavy/medium/fast + pullback для fast. Зафиксировать политику в config/docs.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "eb-4",
              title: "Надёжность данных: Bybit 403 → OKX / Binance fallback",
              notes:
                "Actions US runners часто режут Bybit. Проверить что marks и klines не уходят в demo-бары без сигнала.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "eb-5",
              title: "Пересмотреть WL-гейты после heavy-only (тейк ≥1.8R, WR, OOS)",
              notes:
                "Гейты ужесточались (WR≥55% и т.п.). Сверить фактические пороги в коде vs README.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "eb-6",
              title: "Локальный NiceGUI UI: скринер / Proof MA / whitelist emulator",
              notes: "ЗАПУСК_ЭКРАН.bat → :43123. Прогнать цикл Proof MA → Whitelist вручную.",
              status: "open",
              priority: 3,
              telegramPing: null,
            },
            {
              id: "eb-7",
              title: "Путь к testnet/private trading (ключи уже в Secrets-схеме)",
              notes:
                ".env.example: BYBIT_API_KEY/SECRET. Пока public data + paper book. Следующий шаг — осознанный testnet.",
              status: "open",
              priority: 3,
              telegramPing: null,
            },
          ],
        },
      ],
    },
    {
      id: "trade-master",
      title: "Trade Master",
      accent: "amber",
      essence:
        "Flutter-курс криптотрейдинга (уроки, paper, журнал) + Telegram-сообщество. Web: pavelcrypto70.github.io. Репо: trading_education_app.",
      tracks: [
        {
          id: "app",
          title: "Приложение",
          tasks: [
            {
              id: "tm-app-1",
              title: "Google Play: продукт IAP + internal testing + AAB",
              notes:
                "Package com.trademaster.education, product trade_master_lifetime_full. Чеклист: docs/USER_CHECKLIST.md, docs/STORE_RELEASE.md.",
              status: "open",
              priority: 1,
              telegramPing: {
                at: null,
                note: "Пинг: статус Play Console / тестеры",
              },
            },
            {
              id: "tm-app-2",
              title: "Galaxy Store: free flavor без BILLING → воронка в @Desk_Club",
              notes:
                "tools/build_galaxy.ps1, store/GALAXY_STORE_CHECKLIST.md. Release-подпись своим keystore, не debug.",
              status: "open",
              priority: 1,
              telegramPing: null,
            },
            {
              id: "tm-app-3",
              title: "Безопасность: перевыпустить PAT / Supabase токены если светились в чате",
              notes: "docs/USER_CHECKLIST.md — срочный блок. Обновить GitHub Secrets.",
              status: "open",
              priority: 1,
              telegramPing: null,
            },
            {
              id: "tm-app-4",
              title: "Supabase: verify-purchase / delete-account / secrets Play JSON",
              notes: "docs/BACKEND_SETUP.md + SUPABASE_QUICKSTART. Проверить OTP login и sync прогресса.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "tm-app-5",
              title: "Pre-submit QA на устройстве (playRelease)",
              notes:
                "Уроки 1–14 free, 15+ paywall без Tiger CTA, Restore, Export/Delete account, Privacy/Terms.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "tm-app-6",
              title: "PostHog analytics + опционально Stripe web",
              notes: "События уже в коде. 10 платящих / месяц — цель из чеклиста.",
              status: "open",
              priority: 3,
              telegramPing: null,
            },
            {
              id: "tm-app-7",
              title: "Web free-course уже на Pages — проверить регрессии после soft Desk Club path",
              notes: "Последний коммит: drop IAP/paywall UI на web, soft Desk Club.",
              status: "open",
              priority: 3,
              telegramPing: null,
            },
          ],
        },
        {
          id: "hub",
          title: "Telegram-хаб",
          tasks: [
            {
              id: "tm-hub-1",
              title: "Прогреть @Desk_Club / @academy_trading_club до раздачи APK",
              notes:
                "store/TELEGRAM_SEED_POSTS.md: закреп + 5–6 постов EN+PT. Не сыпать всё за минуту.",
              status: "open",
              priority: 1,
              telegramPing: {
                at: null,
                note: "Пинг: пора кинуть следующий seed-пост в хаб",
              },
            },
            {
              id: "tm-hub-2",
              title: "Ежедневный минимум в хабе: 1 пост (вопрос/разбор/опрос) EN+PT",
              notes: "Отвечать на каждое новое сообщение в тот же день.",
              status: "open",
              priority: 1,
              telegramPing: {
                at: null,
                note: "Ежедневный пинг: пост в Desk Club",
              },
            },
            {
              id: "tm-hub-3",
              title: "Домашки → @trade_master_homework + шаблоны signal_chat",
              notes: "tools/signal_chat_templates.py — сигналы-дисциплины по урокам 1–47.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "tm-hub-4",
              title: "Маркетинг: 3 Shorts/Reels → ссылка на github.io + пост в @Desk_Club",
              notes: "Цель: 10 платящих в первый месяц; 5 друзей на trial feedback.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
      ],
    },
    {
      id: "ru-hub",
      title: "RU-сообщество",
      accent: "slate",
      essence:
        "Русскоязычный хаб по типу Telegram-коммьюнити: расписание торговых сессий, разборы, онбординг. Заполни сам.",
      tracks: [
        {
          id: "sessions",
          title: "Расписание сессий",
          tasks: [
            {
              id: "ru-1",
              title: "Составить недельное расписание торговых сессий (Азия / Европа / США)",
              notes: "Шаблон — замени на свои слоты и ссылки на созвоны.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "ru-2",
              title: "Закреп + правила чата (RU)",
              notes: "",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
        {
          id: "content",
          title: "Контент / модерация",
          tasks: [],
        },
      ],
    },
    {
      id: "sys-learn",
      title: "Системный анализ",
      accent: "violet",
      essence:
        "Обучение системному анализу и подготовка к собеседованиям. Каркас колонки — допиши темы и дедлайны.",
      tracks: [
        {
          id: "study",
          title: "Обучение",
          tasks: [
            {
              id: "sys-1",
              title: "Список тем / курсов (заполни)",
              notes: "",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
        {
          id: "interview",
          title: "Собеседования",
          tasks: [
            {
              id: "sys-2",
              title: "Трекер компаний / этапов (заполни)",
              notes: "",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
      ],
    },
  ],
};

# NutriBot 🥗

AI-powered Telegram bot for food photo analysis. Snap a photo of your meal — get instant calories & macros.

## Features
- 📸 Photo → Calories & Macros (via Claude Vision)
- 📊 Daily food diary with progress tracking
- 💡 Personalized diet recommendations
- 🎯 Custom goals (lose weight / gain muscle / maintain)
- 🆓 3 free analyses per day / Premium for unlimited

## Setup

### Environment Variables
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3000
```

### Local Development
```bash
npm install
mkdir -p data
npm run dev
```

### Deploy to Railway
1. Push to GitHub
2. Connect repo in Railway
3. Add environment variables
4. Deploy

## Commands
- `/start` — Start & setup profile
- `/today` — Today's food diary
- `/tip` — Get diet recommendation
- `/profile` — Update profile
- `/help` — All commands

## Tech Stack
- Node.js + node-telegram-bot-api
- Claude API (Sonnet + Vision)
- SQLite (better-sqlite3)
- Railway.app hosting

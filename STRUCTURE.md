# Project Structure

## Clean & Organized Structure

```
whatsapp-romantic-bot/
├── src/                        # Source code
│   ├── bot.js                 # Main bot logic with WhatsApp client
│   ├── config.js              # Configuration (timing, paths, settings)
│   ├── messageManager.js      # Message selection & tracking
│   └── scheduler.js           # Cron job scheduling
│
├── data/                       # Data files
│   ├── morningMessages.json   # 100 morning messages
│   ├── nightMessages.json     # 101 night messages
│   ├── randomSmileMessages.json # 191 random messages
│   └── usedMessages.json      # Tracks used messages (auto-generated)
│
├── tests/                      # Test scripts
│   ├── quickTest.js           # Quick immediate test
│   └── testSchedule.js        # Scheduled message test
│
├── index.js                    # Entry point
├── package.json                # Dependencies & scripts
├── .env                        # Environment variables (YOUR CONFIG)
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
└── README.md                   # Documentation
```

## How to Use

### Production (Daily automated messages)
```bash
npm start
```

### Testing
```bash
# Quick test - sends immediately
npm test

# Scheduled test - sends at specific time
npm run test:schedule
```

### Configuration
Edit `.env` file:
```
GIRLFRIEND_NUMBER=919876543210
TIMEZONE=IST
```

### Timing (in src/config.js)
- Morning: 6:30 AM - 8:30 AM (random time)
- Night: 10:00 PM - 12:00 AM (random time)
- Random: 12:00 PM - 6:00 PM (random time)

## What Was Removed
- ❌ debug.js (not needed)
- ❌ test.js (replaced with proper tests)
- ❌ run.bat (not needed)
- ❌ install.sh (npm install is enough)

## What Was Organized
- ✅ All source code → `src/`
- ✅ All data files → `data/`
- ✅ All tests → `tests/`
- ✅ Clean root directory
- ✅ Proper entry point (index.js)

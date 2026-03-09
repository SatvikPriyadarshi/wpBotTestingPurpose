# WhatsApp Romantic Bot

An automated WhatsApp bot that sends romantic messages to your girlfriend every day with randomized timing and non-repeating messages.

## Features

- **Daily Morning Messages**: Sends a good morning message between 6:30 AM and 8:30 AM
- **Daily Night Messages**: Sends a good night message between 10:00 PM and 12:00 AM
- **Random Daytime Surprise**: Optional random message during the day
- **Non-Repeating Messages**: Messages are never repeated until all are used
- **QR Code Authentication**: Easy WhatsApp Web authentication
- **Production Ready**: Error handling, logging, and clean structure

## Installation

1. **Install Node.js** (v14 or higher)
2. **Clone or download** this project
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure the bot**:
   - Open `config.js` and set your girlfriend's phone number
   - Add more messages to the JSON files if desired

## Usage

1. **Start the bot**:
   ```bash
   npm start
   ```

2. **Authenticate with WhatsApp**:
   - A QR code will appear in the terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code

3. **The bot will run automatically**:
   - Messages will be sent at randomized times
   - All activities are logged in the console
   - Used messages are tracked in `usedMessages.json`

## File Structure

```
whatsapp-romantic-bot/
├── src/                    # Source code
│   ├── bot.js             # Main bot logic
│   ├── config.js          # Configuration settings
│   ├── messageManager.js  # Message selection and tracking
│   └── scheduler.js       # Cron job scheduling
├── data/                   # Data files
│   ├── morningMessages.json    # 100+ good morning messages
│   ├── nightMessages.json      # 100+ good night messages  
│   ├── randomSmileMessages.json # 190+ random daytime messages
│   └── usedMessages.json       # Tracks used messages
├── tests/                  # Test scripts
│   ├── quickTest.js       # Quick immediate message test
│   └── testSchedule.js    # Scheduled message test
├── index.js               # Entry point
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── .env.example           # Example environment file
└── README.md              # This file
```

## How It Works

1. **Authentication**: Uses WhatsApp Web QR code to connect your account
2. **Scheduling**: Uses node-cron to schedule messages at randomized times
3. **Message Selection**: Randomly picks messages and ensures no repeats
4. **Tracking**: Maintains a used messages list in JSON format
5. **Fallback**: If all messages are used, reshuffles and starts again

## Safety Notes

- This bot uses your personal WhatsApp account
- Messages are sent from your number to one specific number
- Keep your session data secure (it's stored locally)
- WhatsApp may detect automation - use responsibly

## Testing

Before running in production, test the bot:

```bash
# Quick test - sends message immediately
npm test

# Scheduled test - sends message at specific time
npm run test:schedule
```

## Troubleshooting

- **QR code not working**: Ensure WhatsApp is updated on your phone
- **Messages not sending**: Check internet connection and phone number format
- **Bot crashes**: Check logs for error messages
- **Session issues**: Delete `session.json` and re-authenticate

## License

MIT - Use responsibly and with consent.
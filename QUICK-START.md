# Quick Start Guide - Oracle Cloud Deployment

## 🚀 Super Fast Setup (5 Minutes)

### Step 1: Create Oracle Cloud Account
1. Go to: https://www.oracle.com/cloud/free/
2. Sign up (free, requires credit card for verification only)
3. Verify email and complete setup

### Step 2: Create VM Instance
1. Login → Menu → Compute → Instances → Create Instance
2. **Name:** `whatsapp-bot`
3. **Image:** Ubuntu 22.04
4. **Shape:** VM.Standard.E2.1.Micro (Always Free)
5. **Download SSH keys** (save them!)
6. Click **Create**
7. **Copy the Public IP address**

### Step 3: Connect to Server

**Windows (PowerShell):**
```powershell
ssh -i "path\to\ssh-key.key" ubuntu@YOUR_PUBLIC_IP
```

**Mac/Linux:**
```bash
chmod 400 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@YOUR_PUBLIC_IP
```

### Step 4: Run Deployment Script

Copy and paste this ONE command:

```bash
curl -fsSL https://raw.githubusercontent.com/SatvikPriyadarshi/wpBotTestingPurpose/main/deploy.sh | bash
```

**OR manually:**

```bash
wget https://raw.githubusercontent.com/SatvikPriyadarshi/wpBotTestingPurpose/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

Wait 3-5 minutes for installation...

### Step 5: Configure Bot

```bash
cd ~/wpBotTestingPurpose
nano .env
```

Change:
```
TARGET_NUMBER=YOUR_TARGET_PHONE_NUMBER
```

To (example for India):
```
TARGET_NUMBER=919876543210
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### Step 6: Start Bot

```bash
pm2 start index.js --name whatsapp-bot
pm2 logs whatsapp-bot
```

**Scan the QR code with WhatsApp!**

### Step 7: Save Configuration

```bash
pm2 save
pm2 startup
# Run the command that PM2 shows you
```

---

## ✅ Done! Your bot is now running 24/7 for FREE!

---

## 📱 Common Commands

```bash
# View logs
pm2 logs whatsapp-bot

# Check status
pm2 status

# Restart bot
pm2 restart whatsapp-bot

# Stop bot
pm2 stop whatsapp-bot

# Update bot (after GitHub changes)
cd ~/wpBotTestingPurpose
git pull
npm install
pm2 restart whatsapp-bot
```

---

## 🆘 Troubleshooting

**QR code not showing?**
```bash
pm2 stop whatsapp-bot
cd ~/wpBotTestingPurpose
npm start
# Scan QR, then Ctrl+C
pm2 start index.js --name whatsapp-bot
```

**Bot crashed?**
```bash
pm2 logs whatsapp-bot --lines 50
pm2 restart whatsapp-bot
```

**Need to rescan QR?**
```bash
rm -rf ~/wpBotTestingPurpose/.wwebjs_auth/
pm2 restart whatsapp-bot
pm2 logs whatsapp-bot
```

---

## 📊 Monitor Your Bot

```bash
# Real-time logs
pm2 logs whatsapp-bot --lines 100

# Bot info
pm2 info whatsapp-bot

# System resources
free -h
df -h
```

---

## 🔄 Update Bot Code

When you push changes to GitHub:

```bash
cd ~/wpBotTestingPurpose
git pull origin main
npm install
pm2 restart whatsapp-bot
```

---

## 💾 Backup Session

```bash
# Create backup
cd ~
tar -czf whatsapp-backup-$(date +%Y%m%d).tar.gz wpBotTestingPurpose/.wwebjs_auth/

# Download to your computer
# On your local machine:
scp -i ssh-key.key ubuntu@YOUR_IP:~/whatsapp-backup-*.tar.gz .
```

---

## 🎯 That's It!

Your WhatsApp bot is now:
- ✅ Running 24/7
- ✅ Auto-restarts on crash
- ✅ Auto-starts on server reboot
- ✅ Completely FREE forever
- ✅ Sending messages on schedule

**For detailed guide, see DEPLOYMENT.md**

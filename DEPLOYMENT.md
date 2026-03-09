# Deployment Guide - Oracle Cloud Free Tier

Complete guide to deploy your WhatsApp bot on Oracle Cloud's **FREE FOREVER** tier.

## Why Oracle Cloud?

- ✅ **100% Free Forever** - No time limit, no credit card charges
- ✅ **24/7 Uptime** - Never sleeps, always running
- ✅ **Generous Resources** - 1 GB RAM, 1 CPU, 200 GB storage
- ✅ **Persistent Storage** - WhatsApp session data is saved
- ✅ **No Hidden Costs** - Truly free, not a trial

---

## Step 1: Create Oracle Cloud Account

1. Go to: https://www.oracle.com/cloud/free/
2. Click **"Start for free"**
3. Fill in your details:
   - Email address
   - Country/Region
   - Name
4. Verify your email
5. Add payment method (for verification only - **won't be charged**)
6. Complete account setup

**Note:** Oracle requires credit card for verification but won't charge you for free tier resources.

---

## Step 2: Create a VM Instance

### 2.1 Navigate to Compute Instances

1. Log in to Oracle Cloud Console
2. Click **☰ Menu** (top left)
3. Go to **Compute** → **Instances**
4. Click **"Create Instance"**

### 2.2 Configure Your Instance

**Name:** `whatsapp-bot` (or any name you like)

**Placement:**
- Keep default (Availability Domain)

**Image and Shape:**
1. Click **"Change Image"**
   - Select: **Ubuntu 22.04** (Canonical Ubuntu)
   - Click **"Select Image"**

2. Click **"Change Shape"**
   - Select: **VM.Standard.E2.1.Micro** (Always Free-eligible)
   - 1 OCPU, 1 GB RAM
   - Click **"Select Shape"**

**Networking:**
- Keep default VCN and subnet
- **Assign a public IPv4 address:** ✅ Checked

**Add SSH Keys:**
- Select **"Generate a key pair for me"**
- Click **"Save Private Key"** - Download and save it securely
- Click **"Save Public Key"** - Download this too

**Boot Volume:**
- Keep default (50 GB is enough)

### 2.3 Create the Instance

1. Click **"Create"** at the bottom
2. Wait 1-2 minutes for provisioning
3. Instance status will change to **"Running"** (green)
4. Note down the **Public IP Address** (you'll need this)

---

## Step 3: Configure Firewall Rules

### 3.1 Open Required Ports

1. On your instance page, click on the **VCN name** (under "Primary VNIC")
2. Click on **"Security Lists"** on the left
3. Click on the **Default Security List**
4. Click **"Add Ingress Rules"**

**Add this rule:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `22`
- Description: `SSH Access`
- Click **"Add Ingress Rules"**

---

## Step 4: Connect to Your Server

### 4.1 For Windows Users:

**Using PowerShell:**

```powershell
# Navigate to where you saved the private key
cd Downloads

# Set correct permissions (if needed)
icacls "ssh-key-*.key" /inheritance:r /grant:r "%username%:R"

# Connect to server (replace with your IP)
ssh -i "ssh-key-*.key" ubuntu@YOUR_PUBLIC_IP
```

**Using PuTTY:**
1. Download PuTTY from https://www.putty.org/
2. Convert .key to .ppk using PuTTYgen
3. Use the .ppk file to connect

### 4.2 For Mac/Linux Users:

```bash
# Navigate to where you saved the private key
cd ~/Downloads

# Set correct permissions
chmod 400 ssh-key-*.key

# Connect to server (replace with your IP)
ssh -i ssh-key-*.key ubuntu@YOUR_PUBLIC_IP
```

**First time connecting:**
- Type `yes` when asked about fingerprint
- You should now see: `ubuntu@whatsapp-bot:~$`

---

## Step 5: Automated Bot Setup

### 5.1 Run the Deployment Script

Copy and paste this entire script into your SSH terminal:

```bash
#!/bin/bash

echo "🚀 Starting WhatsApp Bot Deployment..."
echo "========================================"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Install PM2 globally
echo "📦 Installing PM2 (Process Manager)..."
sudo npm install -g pm2

# Install required system dependencies for Puppeteer
echo "📦 Installing Chromium dependencies..."
sudo apt install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Clone the repository
echo "📥 Cloning WhatsApp Bot repository..."
cd ~
git clone https://github.com/SatvikPriyadarshi/wpBotTestingPurpose.git
cd wpBotTestingPurpose

# Install dependencies
echo "📦 Installing bot dependencies..."
npm install

# Create .env file
echo "⚙️  Creating configuration file..."
cp .env.example .env

echo ""
echo "✅ Installation Complete!"
echo "========================================"
echo ""
echo "📝 Next Steps:"
echo "1. Edit the .env file with your target number:"
echo "   nano .env"
echo ""
echo "2. Add your target phone number (with country code):"
echo "   TARGET_NUMBER=919876543210"
echo ""
echo "3. Save and exit (Ctrl+X, then Y, then Enter)"
echo ""
echo "4. Start the bot:"
echo "   pm2 start index.js --name whatsapp-bot"
echo ""
echo "5. Scan the QR code with WhatsApp"
echo ""
echo "6. Save PM2 configuration:"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
```

**What this script does:**
- ✅ Updates Ubuntu system
- ✅ Installs Node.js 18
- ✅ Installs Git
- ✅ Installs PM2 (keeps bot running 24/7)
- ✅ Installs Chromium dependencies (for WhatsApp Web)
- ✅ Clones your bot repository
- ✅ Installs all bot dependencies
- ✅ Creates .env configuration file

---

## Step 6: Configure Your Bot

### 6.1 Edit Configuration

```bash
cd ~/wpBotTestingPurpose
nano .env
```

### 6.2 Update the Target Number

Change this line:
```
TARGET_NUMBER=YOUR_TARGET_PHONE_NUMBER
```

To your actual number (with country code, no +):
```
TARGET_NUMBER=919876543210
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` (yes)
- Press `Enter`

---

## Step 7: Start the Bot

### 7.1 Start with PM2

```bash
cd ~/wpBotTestingPurpose
pm2 start index.js --name whatsapp-bot
```

### 7.2 View Logs and QR Code

```bash
pm2 logs whatsapp-bot
```

**You should see:**
- Bot initialization messages
- A QR code in ASCII art

### 7.3 Scan QR Code

1. Open WhatsApp on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **"Link a Device"**
4. Scan the QR code from the terminal

**Note:** The QR code might be hard to scan from terminal. See "Alternative QR Code Method" below if needed.

### 7.4 Save PM2 Configuration

Once the bot is running successfully:

```bash
# Save current PM2 processes
pm2 save

# Setup auto-start on server reboot
pm2 startup

# Copy and run the command that PM2 shows you
# It will look like: sudo env PATH=$PATH:/usr/bin...
```

---

## Step 8: Manage Your Bot

### Useful PM2 Commands:

```bash
# View bot status
pm2 status

# View live logs
pm2 logs whatsapp-bot

# View last 100 lines of logs
pm2 logs whatsapp-bot --lines 100

# Stop the bot
pm2 stop whatsapp-bot

# Restart the bot
pm2 restart whatsapp-bot

# Delete the bot from PM2
pm2 delete whatsapp-bot

# View bot info
pm2 info whatsapp-bot
```

---

## Alternative QR Code Method

If the QR code is hard to scan from terminal, use this method:

### Method 1: Use Screen/Tmux

```bash
# Install screen
sudo apt install screen

# Start screen session
screen -S whatsapp

# Start bot
cd ~/wpBotTestingPurpose
npm start

# Detach from screen: Ctrl+A then D
# Reattach: screen -r whatsapp
```

### Method 2: Save QR to File

Modify the bot to save QR as image (I can help with this if needed).

---

## Troubleshooting

### Bot Not Starting?

```bash
# Check logs
pm2 logs whatsapp-bot --lines 50

# Check if Node.js is installed
node --version

# Check if dependencies are installed
cd ~/wpBotTestingPurpose
npm install
```

### QR Code Not Appearing?

```bash
# Stop PM2
pm2 stop whatsapp-bot

# Run directly to see QR
cd ~/wpBotTestingPurpose
npm start
```

### Session Lost After Restart?

```bash
# Check if session files exist
ls -la ~/wpBotTestingPurpose/.wwebjs_auth/

# If missing, you need to scan QR again
pm2 restart whatsapp-bot
pm2 logs whatsapp-bot
```

### Port Already in Use?

```bash
# Find process using port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Out of Memory?

```bash
# Check memory usage
free -h

# Restart bot
pm2 restart whatsapp-bot
```

---

## Updating Your Bot

When you push changes to GitHub:

```bash
# SSH into your server
ssh -i ssh-key-*.key ubuntu@YOUR_PUBLIC_IP

# Navigate to bot directory
cd ~/wpBotTestingPurpose

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart bot
pm2 restart whatsapp-bot
```

---

## Security Best Practices

### 1. Change SSH Port (Optional but Recommended)

```bash
sudo nano /etc/ssh/sshd_config
# Change: Port 22 to Port 2222
sudo systemctl restart sshd
```

### 2. Setup Firewall

```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### 3. Keep System Updated

```bash
# Update regularly
sudo apt update && sudo apt upgrade -y
```

---

## Cost Monitoring

Even though it's free, monitor your usage:

1. Go to Oracle Cloud Console
2. Click **☰ Menu** → **Billing & Cost Management**
3. Check **"Cost Analysis"**
4. Verify you're using **"Always Free"** resources

**Your VM should show:** `VM.Standard.E2.1.Micro (Always Free)`

---

## Backup Your Bot

### Backup Session Data

```bash
# Create backup
cd ~
tar -czf whatsapp-bot-backup.tar.gz wpBotTestingPurpose/.wwebjs_auth/

# Download to your computer using SCP
# On your local machine:
scp -i ssh-key-*.key ubuntu@YOUR_PUBLIC_IP:~/whatsapp-bot-backup.tar.gz .
```

### Restore Session Data

```bash
# Upload backup to server
scp -i ssh-key-*.key whatsapp-bot-backup.tar.gz ubuntu@YOUR_PUBLIC_IP:~/

# SSH into server
ssh -i ssh-key-*.key ubuntu@YOUR_PUBLIC_IP

# Extract backup
cd ~
tar -xzf whatsapp-bot-backup.tar.gz
```

---

## Summary

✅ **Free Forever** - No charges, no time limit
✅ **24/7 Uptime** - Bot runs continuously
✅ **Auto-Restart** - PM2 restarts bot if it crashes
✅ **Auto-Start** - Bot starts automatically after server reboot
✅ **Persistent Storage** - WhatsApp session is saved
✅ **Easy Updates** - Just git pull and restart

---

## Need Help?

If you encounter any issues:

1. Check PM2 logs: `pm2 logs whatsapp-bot`
2. Check system resources: `free -h` and `df -h`
3. Restart the bot: `pm2 restart whatsapp-bot`
4. Check if Node.js is running: `pm2 status`

---

## Next Steps

Once your bot is running:

1. Monitor logs regularly: `pm2 logs whatsapp-bot`
2. Check message statistics in the console
3. Update message files in `data/` folder as needed
4. Adjust timing in `src/config.js` if needed

**Your bot is now running 24/7 on Oracle Cloud for FREE! 🎉**

#!/bin/bash

# WhatsApp Bot - Oracle Cloud Deployment Script
# Run this script on your Oracle Cloud Ubuntu instance
# Author: Satvik Priyadarshi
# Repository: https://github.com/SatvikPriyadarshi/wpBotTestingPurpose

set -e  # Exit on any error

echo "🚀 WhatsApp Bot Deployment Script for Oracle Cloud"
echo "====================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}📦 $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root. Use: sudo -u ubuntu ./deploy.sh"
    exit 1
fi

# Check if running on Ubuntu
if [ ! -f /etc/os-release ]; then
    print_error "This script is designed for Ubuntu. Detected OS is not Ubuntu."
    exit 1
fi

OS_NAME=$(grep '^NAME=' /etc/os-release | cut -d'"' -f2)
if [[ ! "$OS_NAME" =~ "Ubuntu" ]]; then
    print_error "This script is designed for Ubuntu. Detected OS: $OS_NAME"
    exit 1
fi

# Update system
print_step "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js 18.x
print_step "Step 2: Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    print_info "Downloading Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    NODE_VERSION=$(node --version)
    if [[ "$NODE_VERSION" =~ ^v1[6-9]\. ]]; then
        print_success "Node.js already installed: $NODE_VERSION (compatible)"
    else
        print_error "Node.js version $NODE_VERSION is not compatible. Need Node.js 16+"
        print_info "Reinstalling Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs --reinstall
        print_success "Node.js reinstalled: $(node --version)"
    fi
fi

# Install Git
print_step "Step 3: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    print_success "Git installed: $(git --version)"
else
    print_success "Git already installed: $(git --version)"
fi

# Install PM2
print_step "Step 4: Installing PM2 (Process Manager)..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Install Chromium dependencies for Puppeteer
print_step "Step 5: Installing Chromium dependencies for WhatsApp Web..."
print_info "This may take a few minutes..."

# Update package list first
sudo apt update

# Install essential dependencies
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
    xdg-utils \
    gconf-service \
    libgconf-2-4 \
    libdrm2 \
    libxkbcommon0 \
    libxshmfence1

print_success "Chromium dependencies installed"

# Clone repository
print_step "Step 6: Setting up bot repository..."
cd ~
if [ -d "wpBotTestingPurpose" ]; then
    print_info "Repository already exists, updating..."
    cd wpBotTestingPurpose
    git stash  # Save any local changes
    git pull origin main
    print_success "Repository updated"
else
    print_info "Cloning repository from GitHub..."
    git clone https://github.com/SatvikPriyadarshi/wpBotTestingPurpose.git
    cd wpBotTestingPurpose
    print_success "Repository cloned"
fi

# Install dependencies
print_step "Step 7: Installing bot dependencies..."
print_info "This may take 2-3 minutes..."
npm install
print_success "Dependencies installed"

# Create .env file if it doesn't exist
print_step "Step 8: Setting up configuration..."
if [ ! -f ".env" ]; then
    print_info "Creating .env configuration file from template..."
    cp .env.example .env
    print_success ".env file created"
    
    # Show current configuration
    echo ""
    print_info "Current .env configuration:"
    cat .env
    echo ""
else
    print_success ".env file already exists"
    
    # Show current configuration
    echo ""
    print_info "Current .env configuration:"
    head -5 .env
    echo ""
fi

echo ""
echo "====================================================="
print_success "✅ Installation Complete!"
echo "====================================================="
echo ""
print_step "📝 NEXT STEPS:"
echo ""
echo "1️⃣  Configure your bot:"
echo "    nano .env"
echo "    Change TARGET_NUMBER to your target phone number"
echo "    Example: TARGET_NUMBER=919876543210 (India)"
echo ""
echo "2️⃣  Start the bot:"
echo "    pm2 start index.js --name whatsapp-bot"
echo ""
echo "3️⃣  View logs and scan QR code:"
echo "    pm2 logs whatsapp-bot"
echo "    (Wait for QR code to appear, then scan with WhatsApp)"
echo ""
echo "4️⃣  Save PM2 configuration (after successful QR scan):"
echo "    pm2 save"
echo "    pm2 startup"
echo "    (Copy and run the command PM2 shows you)"
echo ""
echo "5️⃣  Monitor your bot:"
echo "    pm2 status           # Check bot status"
echo "    pm2 logs whatsapp-bot --lines 50  # View recent logs"
echo "    pm2 monit            # Monitor resources"
echo ""
echo "🔧 Troubleshooting:"
echo "    If QR code doesn't appear: pm2 restart whatsapp-bot"
echo "    If bot crashes: pm2 logs whatsapp-bot --lines 100"
echo "    To update: git pull && npm install && pm2 restart whatsapp-bot"
echo ""
echo "📚 Detailed instructions: cat DEPLOYMENT.md"
echo ""
echo "💡 Your bot will now run 24/7 on Oracle Cloud for FREE! 🎉"
echo ""

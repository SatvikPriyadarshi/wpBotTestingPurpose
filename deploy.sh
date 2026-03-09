#!/bin/bash

# WhatsApp Bot - Oracle Cloud Deployment Script
# Run this script on your Oracle Cloud Ubuntu instance

set -e  # Exit on any error

echo "🚀 WhatsApp Bot Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install Git
print_info "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# Install PM2
print_info "Installing PM2 (Process Manager)..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Install Chromium dependencies for Puppeteer
print_info "Installing Chromium dependencies..."
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
    > /dev/null 2>&1
print_success "Dependencies installed"

# Clone repository
print_info "Cloning WhatsApp Bot repository..."
cd ~
if [ -d "wpBotTestingPurpose" ]; then
    print_info "Repository already exists, pulling latest changes..."
    cd wpBotTestingPurpose
    git pull origin main
else
    git clone https://github.com/SatvikPriyadarshi/wpBotTestingPurpose.git
    cd wpBotTestingPurpose
fi
print_success "Repository ready"

# Install dependencies
print_info "Installing bot dependencies (this may take a few minutes)..."
npm install
print_success "Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env configuration file..."
    cp .env.example .env
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

echo ""
echo "===================================="
print_success "Installation Complete!"
echo "===================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Configure your bot:"
echo "   nano .env"
echo "   (Change TARGET_NUMBER to your phone number with country code)"
echo ""
echo "2️⃣  Start the bot:"
echo "   pm2 start index.js --name whatsapp-bot"
echo ""
echo "3️⃣  View logs and scan QR code:"
echo "   pm2 logs whatsapp-bot"
echo ""
echo "4️⃣  Save PM2 configuration (after bot is running):"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""

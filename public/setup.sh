#!/bin/bash

echo "============================================"
echo "   Connect Your Local Database"
echo "============================================"
echo ""

# Detect OS
OS_TYPE=$(uname -s)

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v ss &> /dev/null; then
        # Linux - use ss
        ss -tuln | grep -q ":$port "
    elif command -v lsof &> /dev/null; then
        # Mac - use lsof
        lsof -i ":$port" -sTCP:LISTEN &> /dev/null
    else
        # Fallback - assume port is open
        return 0
    fi
}

# Auto-detect database
echo "🔍 Detecting database..."
echo ""

DB_TYPE=""
DB_PORT=""

# Check common database ports
if check_port 3306; then
    echo "✅ MySQL/MariaDB detected on port 3306"
    DB_TYPE="MySQL/MariaDB"
    DB_PORT=3306
elif check_port 5432; then
    echo "✅ PostgreSQL detected on port 5432"
    DB_TYPE="PostgreSQL"
    DB_PORT=5432
elif check_port 1433; then
    echo "✅ SQL Server detected on port 1433"
    DB_TYPE="SQL Server"
    DB_PORT=1433
elif check_port 27017; then
    echo "✅ MongoDB detected on port 27017"
    DB_TYPE="MongoDB"
    DB_PORT=27017
else
    echo "⚠️  No database auto-detected"
    echo ""
    echo "Which database are you using?"
    echo "1) MySQL/MariaDB (port 3306)"
    echo "2) PostgreSQL (port 5432)"
    echo "3) SQL Server (port 1433)"
    echo "4) MongoDB (port 27017)"
    echo "5) Custom port"
    echo ""
    read -p "Choice (1-5): " choice

    case $choice in
        1)
            DB_TYPE="MySQL/MariaDB"
            DB_PORT=3306
            ;;
        2)
            DB_TYPE="PostgreSQL"
            DB_PORT=5432
            ;;
        3)
            DB_TYPE="SQL Server"
            DB_PORT=1433
            ;;
        4)
            DB_TYPE="MongoDB"
            DB_PORT=27017
            ;;
        5)
            read -p "Enter custom port: " DB_PORT
            DB_TYPE="Custom"
            ;;
        *)
            echo "Invalid choice!"
            exit 1
            ;;
    esac
fi

echo ""
echo "📦 Database: $DB_TYPE"
echo "🔌 Port: $DB_PORT"
echo ""

# Install ngrok if not exists
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."

    if [[ "$OS_TYPE" == "Darwin" ]]; then
        # Mac
        if command -v brew &> /dev/null; then
            brew install ngrok/ngrok/ngrok
        else
            echo "❌ Homebrew not found. Please install from: https://brew.sh"
            echo "   Then run: brew install ngrok/ngrok/ngrok"
            exit 1
        fi
    elif [[ "$OS_TYPE" == "Linux" ]]; then
        # Linux
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
          sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
          sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok -y
    else
        echo "❌ Unsupported OS. Please install ngrok manually from: https://ngrok.com/download"
        exit 1
    fi
else
    echo "✅ ngrok already installed"
fi

# Check if already configured
if ngrok config check &> /dev/null; then
    echo "✅ ngrok already configured"
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🔑 One-time ngrok setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Opening ngrok signup page..."
    echo "   (If browser doesn't open, visit: https://dashboard.ngrok.com/signup)"
    echo ""

    # Try to open browser
    if [[ "$OS_TYPE" == "Darwin" ]]; then
        open "https://dashboard.ngrok.com/signup" 2>/dev/null
    elif [[ "$OS_TYPE" == "Linux" ]]; then
        xdg-open "https://dashboard.ngrok.com/signup" 2>/dev/null || true
    fi

    echo "2. After signup, copy your auth token from:"
    echo "   https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    read -p "Paste your token here: " TOKEN

    if [ -z "$TOKEN" ]; then
        echo "❌ No token provided!"
        exit 1
    fi

    ngrok config add-authtoken "$TOKEN"

    echo ""
    echo "✅ Configuration saved!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting Tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal OPEN!"
echo "   Closing it will stop the tunnel."
echo ""
echo "📋 Waiting for connection URL..."
echo ""

# Start ngrok
ngrok tcp $DB_PORT
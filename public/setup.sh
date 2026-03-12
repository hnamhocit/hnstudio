#!/bin/bash

echo "============================================"
echo "   Connect Your Local Database"
echo "============================================"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v ss &> /dev/null; then
        ss -tuln 2>/dev/null | grep -q ":$port "
    elif command -v lsof &> /dev/null; then
        lsof -i ":$port" -sTCP:LISTEN &> /dev/null 2>&1
    elif command -v netstat &> /dev/null; then
        netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"
    else
        return 0
    fi
}

# Detect available databases
echo "🔍 Scanning for databases..."
echo ""

DETECTED_DBS=()

if check_port 3306; then
    echo "  ✅ Found database on port 3306 (MySQL/MariaDB)"
    DETECTED_DBS+=("3306:MySQL/MariaDB")
fi

if check_port 5432; then
    echo "  ✅ Found database on port 5432 (PostgreSQL)"
    DETECTED_DBS+=("5432:PostgreSQL")
fi

if check_port 1433; then
    echo "  ✅ Found database on port 1433 (SQL Server)"
    DETECTED_DBS+=("1433:SQL Server")
fi

if check_port 27017; then
    echo "  ✅ Found database on port 27017 (MongoDB)"
    DETECTED_DBS+=("27017:MongoDB")
fi

echo ""

# Let user choose
if [ ${#DETECTED_DBS[@]} -eq 0 ]; then
    echo "⚠️  No database detected on common ports."
    echo ""
    echo "Please select your database type:"
else
    echo "📋 Multiple databases detected. Please select which one to expose:"
    echo ""
fi

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
        read -p "Enter port number: " DB_PORT
        DB_TYPE="Custom"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "📦 Selected: $DB_TYPE"
echo "🔌 Port: $DB_PORT"
echo ""

# Check if port is actually listening
if ! check_port $DB_PORT; then
    echo "⚠️  Warning: Nothing seems to be listening on port $DB_PORT"
    echo "   Make sure your database is running!"
    echo ""
    read -p "Continue anyway? (y/n): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install Node.js if not exists (needed for localtunnel)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."

    OS_TYPE=$(uname -s)
    if [[ "$OS_TYPE" == "Darwin" ]]; then
        # Mac
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "❌ Please install Homebrew first: https://brew.sh"
            exit 1
        fi
    elif [[ "$OS_TYPE" == "Linux" ]]; then
        # Linux
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi

# Install localtunnel
if ! command -v lt &> /dev/null; then
    echo "📦 Installing localtunnel..."
    sudo npm install -g localtunnel
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting Tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal OPEN!"
echo ""

# Start localtunnel
lt --port $DB_PORT
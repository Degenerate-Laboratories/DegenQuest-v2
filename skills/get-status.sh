#!/bin/bash

# get-status.sh - Script to get comprehensive status information from a game server endpoint
# Usage: ./get-status.sh [local|docker|dev|prod]

# Set color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install it to parse JSON responses.${NC}"
    echo "On macOS: brew install jq"
    echo "On Ubuntu: apt-get install jq"
    exit 1
fi

# Default endpoints
LOCALHOST_URL="http://localhost:8888/health"
DOCKER_URL="http://localhost:3002/health"
DEVELOP_URL="http://134.199.184.18:8888/health"
PRODUCTION_URL="http://134.199.184.18/health"

# Parse command line arguments
ENDPOINT=$1

# If no endpoint is specified, prompt the user
if [ -z "$ENDPOINT" ]; then
    echo -e "${BLUE}Please select an endpoint:${NC}"
    echo "1) local - Localhost (non-Docker)"
    echo "2) docker - Local Docker Container"
    echo "3) dev - Development Server"
    echo "4) prod - Production Server"
    read -p "Enter selection [1-4]: " selection
    
    case $selection in
        1) ENDPOINT="local" ;;
        2) ENDPOINT="docker" ;;
        3) ENDPOINT="dev" ;;
        4) ENDPOINT="prod" ;;
        *) echo -e "${RED}Invalid selection. Exiting.${NC}"; exit 1 ;;
    esac
fi

# Set URL based on endpoint
case $ENDPOINT in
    local) URL=$LOCALHOST_URL; NAME="Localhost" ;;
    docker) URL=$DOCKER_URL; NAME="Docker Container" ;;
    dev) URL=$DEVELOP_URL; NAME="Development Server" ;;
    prod) URL=$PRODUCTION_URL; NAME="Production Server" ;;
    *) echo -e "${RED}Invalid endpoint: $ENDPOINT. Use local, docker, dev, or prod.${NC}"; exit 1 ;;
esac

echo -e "${BLUE}Getting status from $NAME at $URL${NC}"
echo -e "${YELLOW}Fetching data...${NC}"

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$URL")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

# Check for successful response
if [ "$HTTP_CODE" -ne 200 ]; then
    echo -e "${RED}Error: Server returned HTTP $HTTP_CODE${NC}"
    echo -e "${RED}Response: $RESPONSE${NC}"
    exit 1
fi

# Parse and display basic info
VERSION=$(echo "$RESPONSE" | jq -r '.version // "unknown"')
NAME=$(echo "$RESPONSE" | jq -r '.name // "unknown"')
ENV=$(echo "$RESPONSE" | jq -r '.environment // "unknown"')
TIMESTAMP=$(echo "$RESPONSE" | jq -r '.timestamp // "unknown"')
STATUS=$(echo "$RESPONSE" | jq -r '.status // "unknown"')

# Display header
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}      $NAME Status Report${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${CYAN}Basic Information:${NC}"
echo -e "  Status:      ${YELLOW}$STATUS${NC}"
echo -e "  Version:     ${YELLOW}$VERSION${NC}"
echo -e "  Environment: ${YELLOW}$ENV${NC}"
echo -e "  Timestamp:   ${YELLOW}$TIMESTAMP${NC}"
echo ""

# Display system information
echo -e "${CYAN}System Information:${NC}"
UPTIME=$(echo "$RESPONSE" | jq -r '.system.uptime // "unknown"')
UPTIME_HUMAN=$(printf '%dh:%dm:%ds\n' $(($UPTIME/3600)) $(($UPTIME%3600/60)) $(($UPTIME%60)))
MEMORY_USAGE=$(echo "$RESPONSE" | jq -r '.system.memoryUsage.heapUsed // "unknown"')
MEMORY_USAGE_MB=$(echo "scale=2; $MEMORY_USAGE / 1048576" | bc 2>/dev/null || echo "unknown")
FREE_MEM=$(echo "$RESPONSE" | jq -r '.system.freeMemory // "unknown"')
FREE_MEM_MB=$(echo "scale=2; $FREE_MEM / 1048576" | bc 2>/dev/null || echo "unknown")
TOTAL_MEM=$(echo "$RESPONSE" | jq -r '.system.totalMemory // "unknown"')
TOTAL_MEM_MB=$(echo "scale=2; $TOTAL_MEM / 1048576" | bc 2>/dev/null || echo "unknown")
PLATFORM=$(echo "$RESPONSE" | jq -r '.system.platform // "unknown"')
HOSTNAME=$(echo "$RESPONSE" | jq -r '.system.hostname // "unknown"')

echo -e "  Hostname:       ${YELLOW}$HOSTNAME${NC}"
echo -e "  Platform:       ${YELLOW}$PLATFORM${NC}"
echo -e "  Uptime:         ${YELLOW}$UPTIME_HUMAN${NC}"
echo -e "  Memory Usage:   ${YELLOW}$MEMORY_USAGE_MB MB${NC}"
echo -e "  Free Memory:    ${YELLOW}$FREE_MEM_MB MB${NC}"
echo -e "  Total Memory:   ${YELLOW}$TOTAL_MEM_MB MB${NC}"
echo ""

# Display database information
echo -e "${CYAN}Database Information:${NC}"
DB_EXISTS=$(echo "$RESPONSE" | jq -r '.database.exists // "unknown"')
DB_SIZE=$(echo "$RESPONSE" | jq -r '.database.size // "unknown"')
DB_PATH=$(echo "$RESPONSE" | jq -r '.database.path // "unknown"')
DB_LAST_MODIFIED=$(echo "$RESPONSE" | jq -r '.database.lastModified // "unknown"')
DB_SCHEMA_VERSION=$(echo "$RESPONSE" | jq -r '.dbSchemaVersion // "unknown"')

echo -e "  Status:         ${YELLOW}$DB_EXISTS${NC}"
echo -e "  Size:           ${YELLOW}$DB_SIZE bytes${NC}"
echo -e "  Path:           ${YELLOW}$DB_PATH${NC}"
echo -e "  Last Modified:  ${YELLOW}$DB_LAST_MODIFIED${NC}"
echo -e "  Schema Version: ${YELLOW}$DB_SCHEMA_VERSION${NC}"
echo ""

# Display Git information if available
echo -e "${CYAN}Git Information:${NC}"
GIT_COMMIT=$(echo "$RESPONSE" | jq -r '.git.commit // "unknown"')
GIT_BRANCH=$(echo "$RESPONSE" | jq -r '.git.branch // "unknown"')
GIT_ERROR=$(echo "$RESPONSE" | jq -r '.git.error // "null"')

if [ "$GIT_ERROR" = "null" ]; then
    echo -e "  Commit:         ${YELLOW}$GIT_COMMIT${NC}"
    echo -e "  Branch:         ${YELLOW}$GIT_BRANCH${NC}"
else
    echo -e "  Git Info:       ${RED}Not available - $GIT_ERROR${NC}"
fi
echo ""

# Display E2E test status if available
echo -e "${CYAN}Test Status:${NC}"
E2E_STATUS=$(echo "$RESPONSE" | jq -r '.e2eTestStatus // "unknown"')
echo -e "  E2E Tests:      ${YELLOW}$E2E_STATUS${NC}"
echo ""

# Show raw response if requested
if [ "$2" = "--raw" ]; then
    echo -e "${CYAN}Raw Response:${NC}"
    echo "$RESPONSE" | jq '.'
fi

echo -e "${GREEN}============================================${NC}"
echo -e "${BLUE}Report generated at $(date)${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "For a quick health check of all endpoints, use ${YELLOW}./check-health.sh${NC}" 
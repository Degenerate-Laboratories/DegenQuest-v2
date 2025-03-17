#!/bin/bash

# check-health.sh - Script to check the health of the game server at multiple endpoints
# Usage: ./check-health.sh [--verbose]

# Set color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

VERBOSE=false
if [ "$1" == "--verbose" ]; then
    VERBOSE=true
fi

# Function to check a health endpoint
check_endpoint() {
    local name="$1"
    local url="$2"
    echo -e "${BLUE}Checking $name health...${NC}"
    
    # Make the request
    local response
    local http_code
    if [ "$VERBOSE" = true ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$url")
        http_code=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
        response=$(echo "$response" | grep -v "HTTP_STATUS")
    else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        if [ "$http_code" -eq 200 ]; then
            response=$(curl -s "$url")
        fi
    fi
    
    # Check HTTP status code
    if [ "$http_code" -eq 200 ]; then
        # Always fetch version for healthy endpoints
        # Check if response is valid JSON before parsing
        if echo "$response" | jq empty 2>/dev/null; then
            local version=$(echo "$response" | jq -r '.version // "unknown"')
            echo -e "${GREEN}✓ $name is healthy (HTTP $http_code) - Version: ${YELLOW}$version${NC}"
            
            # Parse and display additional info in verbose mode
            if [ "$VERBOSE" = true ]; then
                local env=$(echo "$response" | jq -r '.environment // "unknown"')
                local uptime=$(echo "$response" | jq -r '.system.uptime // "unknown"')
                local db_status=$(echo "$response" | jq -r '.database.exists // "unknown"')
                local db_size=$(echo "$response" | jq -r '.database.size // "unknown"')
                
                echo -e "  Environment: ${YELLOW}$env${NC}"
                echo -e "  Uptime:      ${YELLOW}$uptime seconds${NC}"
                echo -e "  DB Status:   ${YELLOW}$db_status${NC}"
                echo -e "  DB Size:     ${YELLOW}$db_size bytes${NC}"
                
                # If there's any error message, display it
                local error=$(echo "$response" | jq -r '.error // "null"')
                if [ "$error" != "null" ]; then
                    echo -e "${RED}  Error: $error${NC}"
                fi
            fi
        else
            echo -e "${GREEN}✓ $name is healthy (HTTP $http_code)${NC} - ${YELLOW}Non-JSON response received${NC}"
            if [ "$VERBOSE" = true ]; then
                echo -e "  ${YELLOW}Response: ${response:0:100}...${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ $name is not healthy (HTTP $http_code)${NC}"
    fi
    echo ""
}

# Check all endpoints
check_endpoint "Localhost" "$LOCALHOST_URL"
check_endpoint "Docker Container" "$DOCKER_URL"
check_endpoint "Development Server" "$DEVELOP_URL"
check_endpoint "Production Server" "$PRODUCTION_URL"

# Summary
echo -e "${BLUE}Health Check Summary${NC}"
echo -e "Run with --verbose for detailed information"
echo -e "Use get-status.sh for more comprehensive status information" 
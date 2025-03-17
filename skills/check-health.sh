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
LOCALHOST_API_URL="http://localhost:8888/api/health"
LOCALHOST_VERSION_URL="http://localhost:8888/version"

DOCKER_URL="http://localhost:3002/health"
DOCKER_API_URL="http://localhost:3002/api/health"
DOCKER_VERSION_URL="http://localhost:3002/version"

DEVELOP_URL="http://134.199.184.18:8888/health"
DEVELOP_API_URL="http://134.199.184.18:8888/api/health"
DEVELOP_VERSION_URL="http://134.199.184.18:8888/version"

PRODUCTION_URL="http://134.199.184.18/health"
PRODUCTION_API_URL="http://134.199.184.18/api/health"
PRODUCTION_VERSION_URL="http://134.199.184.18/version"

# Get current version from package.json for comparison
PKG_PATH="../apps/game-client/package.json"
if [ -f "$PKG_PATH" ]; then
    LOCAL_VERSION=$(grep -o '"version": "[^"]*"' "$PKG_PATH" | cut -d'"' -f4)
    echo -e "${BLUE}Local package.json version: ${YELLOW}$LOCAL_VERSION${NC}"
    echo ""
else
    echo -e "${YELLOW}Warning: Could not find package.json at $PKG_PATH${NC}"
    LOCAL_VERSION="unknown"
    echo ""
fi

VERBOSE=false
if [ "$1" == "--verbose" ]; then
    VERBOSE=true
fi

# Function to check a health endpoint
check_endpoint() {
    local name="$1"
    local url="$2"
    local is_alt_endpoint="${3:-false}"
    
    if [ "$is_alt_endpoint" = false ]; then
        echo -e "${BLUE}Checking $name health...${NC}"
    fi
    
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
        # Check if response is valid JSON before parsing
        if echo "$response" | jq empty 2>/dev/null; then
            local version=$(echo "$response" | jq -r '.version // "unknown"')
            
            # Add version match indicator
            if [ -z "$version" ] || [ "$version" = "null" ]; then
                # Handle empty or null version
                if [ "$is_alt_endpoint" = false ]; then
                    echo -e "${GREEN}✓ $name is healthy (HTTP $http_code)${NC} - ${YELLOW}No version reported${NC}"
                fi
                FOUND_VERSION=false
            elif [ "$version" = "$LOCAL_VERSION" ]; then
                if [ "$is_alt_endpoint" = false ]; then
                    echo -e "${GREEN}✓ $name is healthy (HTTP $http_code) - Version: ${YELLOW}$version${NC} ${GREEN}✓${NC}"
                else
                    echo -e "  ${GREEN}✓ $name${NC} - Version: ${YELLOW}$version${NC} ${GREEN}✓${NC}"
                fi
                FOUND_VERSION=true
            else
                if [ "$is_alt_endpoint" = false ]; then
                    echo -e "${GREEN}✓ $name is healthy (HTTP $http_code) - Version: ${YELLOW}$version${NC} ${RED}≠ $LOCAL_VERSION${NC}"
                else
                    echo -e "  ${GREEN}✓ $name${NC} - Version: ${YELLOW}$version${NC} ${RED}≠ $LOCAL_VERSION${NC}"
                fi
                FOUND_VERSION=true
            fi
            
            # Parse and display additional info in verbose mode
            if [ "$VERBOSE" = true ] && [ "$is_alt_endpoint" = false ]; then
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
            
            # Return success if version was found
            return $([ "$FOUND_VERSION" = true ] && echo 0 || echo 1)
        else
            # Check if it's HTML
            if [[ "$response" == *"<!DOCTYPE html>"* || "$response" == *"<html"* ]]; then
                if [ "$is_alt_endpoint" = false ]; then
                    echo -e "${YELLOW}⚠ $name returned HTML instead of JSON (HTTP $http_code)${NC}"
                    echo -e "${YELLOW}  This endpoint may be misconfigured or returning the client app instead of health data${NC}"
                    echo -e "${YELLOW}  Trying alternative endpoints...${NC}"
                fi
                return 1
            else
                if [ "$is_alt_endpoint" = false ]; then
                    echo -e "${GREEN}✓ $name is healthy (HTTP $http_code)${NC} - ${YELLOW}Non-JSON response received${NC}"
                    if [ "$VERBOSE" = true ]; then
                        echo -e "  ${YELLOW}Response preview: ${response:0:50}...${NC}"
                    fi
                fi
                return 1
            fi
        fi
    else
        if [ "$is_alt_endpoint" = false ]; then
            echo -e "${RED}✗ $name is not healthy (HTTP $http_code)${NC}"
        fi
        return 1
    fi
}

# Function to check all possible endpoints for a server
check_server() {
    local name="$1"
    local main_url="$2"
    local api_url="$3"
    local version_url="$4"
    
    # Try main health endpoint first
    if check_endpoint "$name" "$main_url" false; then
        echo ""
        return 0
    fi
    
    # If main endpoint fails, try API endpoint
    if check_endpoint "$name API" "$api_url" true; then
        echo ""
        return 0
    fi
    
    # If API endpoint fails, try version endpoint
    if check_endpoint "$name Version" "$version_url" true; then
        echo ""
        return 0
    fi
    
    echo ""
    return 1
}

# Check all endpoints
check_server "Localhost" "$LOCALHOST_URL" "$LOCALHOST_API_URL" "$LOCALHOST_VERSION_URL"
check_server "Docker Container" "$DOCKER_URL" "$DOCKER_API_URL" "$DOCKER_VERSION_URL"
check_server "Development Server" "$DEVELOP_URL" "$DEVELOP_API_URL" "$DEVELOP_VERSION_URL"
check_server "Production Server" "$PRODUCTION_URL" "$PRODUCTION_API_URL" "$PRODUCTION_VERSION_URL"

# Summary
echo -e "${BLUE}Health Check Summary${NC}"
if [ "$LOCAL_VERSION" != "unknown" ]; then
    echo -e "Local Version: ${YELLOW}$LOCAL_VERSION${NC}"
fi
echo -e "Run with --verbose for detailed information"
echo -e "Use get-status.sh for more comprehensive status information" 
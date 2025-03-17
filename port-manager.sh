#!/bin/bash

# Port Management Script
# Usage: ./port-manager.sh [OPTIONS]
# Options:
#   -p, --port PORT     Specify port number (required)
#   -c, --check         Check what's using the port
#   -k, --kill          Kill processes using the port
#   -d, --docker        Check Docker containers using the port
#   -s, --stop-docker   Stop Docker containers using the port
#   -h, --help          Show this help message

# Function to show help
show_help() {
  grep '^#' "$0" | grep -v '^#!/bin/bash' | sed 's/^# //; s/^#//'
  exit 0
}

# Function to check what's using a port
check_port() {
  local port=$1
  echo "Checking processes using port $port..."
  
  # Try lsof first (more detailed)
  if command -v lsof >/dev/null 2>&1; then
    echo "LSOF output:"
    lsof -i :$port
    LSOF_RESULT=$?
    
    if [ $LSOF_RESULT -ne 0 ]; then
      echo "No process found using port $port with lsof"
    fi
  else
    echo "lsof command not available"
  fi
  
  # Try netstat as alternative
  if command -v netstat >/dev/null 2>&1; then
    echo -e "\nNETSTAT output:"
    netstat -vanp tcp | grep $port
    NETSTAT_RESULT=$?
    
    if [ $NETSTAT_RESULT -ne 0 ]; then
      echo "No process found using port $port with netstat"
    fi
  else
    echo "netstat command not available"
  fi
}

# Function to kill processes using a port
kill_port() {
  local port=$1
  echo "Attempting to kill processes using port $port..."
  
  # Kill processes using lsof
  if command -v lsof >/dev/null 2>&1; then
    PID=$(lsof -ti :$port)
    if [ -n "$PID" ]; then
      echo "Found PIDs: $PID"
      echo "Killing processes..."
      kill -9 $PID
      echo "Processes killed"
    else
      echo "No processes found using port $port"
    fi
  else
    echo "lsof command not available, cannot find processes to kill"
  fi
}

# Function to check Docker containers using a port
check_docker() {
  local port=$1
  echo "Checking Docker containers using port $port..."
  
  if command -v docker >/dev/null 2>&1; then
    CONTAINERS=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Ports}}" | grep ":$port->" || docker ps --format "{{.ID}}\t{{.Names}}\t{{.Ports}}" | grep ":$port/")
    
    if [ -n "$CONTAINERS" ]; then
      echo "Docker containers using port $port:"
      echo "$CONTAINERS"
    else
      echo "No Docker containers found using port $port"
    fi
  else
    echo "Docker command not available"
  fi
}

# Function to stop Docker containers using a port
stop_docker() {
  local port=$1
  echo "Stopping Docker containers using port $port..."
  
  if command -v docker >/dev/null 2>&1; then
    CONTAINERS=$(docker ps -q --filter publish=$port)
    
    if [ -n "$CONTAINERS" ]; then
      echo "Found containers: $CONTAINERS"
      echo "Stopping containers..."
      docker stop $CONTAINERS
      echo "Containers stopped"
    else
      echo "No Docker containers found using port $port"
    fi
  else
    echo "Docker command not available"
  fi
}

# Parse arguments
PORT=""
CHECK=false
KILL=false
DOCKER=false
STOP_DOCKER=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -c|--check)
      CHECK=true
      shift
      ;;
    -k|--kill)
      KILL=true
      shift
      ;;
    -d|--docker)
      DOCKER=true
      shift
      ;;
    -s|--stop-docker)
      STOP_DOCKER=true
      shift
      ;;
    -h|--help)
      show_help
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# Validate port
if [ -z "$PORT" ]; then
  echo "Error: Port number is required"
  show_help
fi

if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Error: Port must be a number"
  exit 1
fi

# Execute requested operations
if [ "$CHECK" = true ] || ([ "$KILL" = false ] && [ "$DOCKER" = false ] && [ "$STOP_DOCKER" = false ]); then
  check_port "$PORT"
fi

if [ "$KILL" = true ]; then
  kill_port "$PORT"
fi

if [ "$DOCKER" = true ] || [ "$STOP_DOCKER" = true ]; then
  check_docker "$PORT"
fi

if [ "$STOP_DOCKER" = true ]; then
  stop_docker "$PORT"
fi

exit 0 
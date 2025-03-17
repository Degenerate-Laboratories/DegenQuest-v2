#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./check-port.sh PORT_NUMBER"
  exit 1
fi

PORT=$1
echo "Checking processes using port $PORT..."

# Try lsof first (more detailed)
if command -v lsof >/dev/null 2>&1; then
  echo "LSOF output:"
  lsof -i :$PORT
  LSOF_RESULT=$?
  
  if [ $LSOF_RESULT -ne 0 ]; then
    echo "No process found using port $PORT with lsof"
  fi
else
  echo "lsof command not available"
fi

# Try netstat as alternative
if command -v netstat >/dev/null 2>&1; then
  echo -e "\nNETSTAT output:"
  netstat -vanp tcp | grep $PORT
  NETSTAT_RESULT=$?
  
  if [ $NETSTAT_RESULT -ne 0 ]; then
    echo "No process found using port $PORT with netstat"
  fi
else
  echo "netstat command not available"
fi

exit 0 
#!/bin/sh
# wait-for-it.sh: Wait until a host:port is available
# Usage: wait-for-it.sh host:port -- command args

set -e

HOST_PORT="$1"
shift

HOST=$(echo $HOST_PORT | cut -d: -f1)
PORT=$(echo $HOST_PORT | cut -d: -f2)

while ! nc -z "$HOST" "$PORT"; do
  echo "Waiting for $HOST:$PORT..."
  sleep 1
done

exec "$@"

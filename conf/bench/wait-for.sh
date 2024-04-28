#!/bin/sh
# wait-for.sh

set -e

host="$1"
shift
cmd="$@"

until ping -c1 $host >/dev/null 2>&1; do
  echo "Waiting for $host - sleeping"
  sleep 1
done

>&2 echo "$host is up - executing command"
exec $cmd
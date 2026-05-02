#!/bin/bash
# Shipyard Autonomous Monitor — runs every 3 min
LOG=/home/agent/shipyard-ai/.agent-logs/monitor-$(date +%Y-%m-%d).log
ALERT=/tmp/.shipyard-alert
mkdir -p /home/agent/shipyard-ai/.agent-logs
STATUS=$(systemctl is-active shipyard-daemon)
DISK=$(df / | awk "NR==2{print \$5}" | tr -d "%")
MEM=$(free | awk "/Mem:/{printf \"%.0f\", \$3/\$2 * 100}")
QUEUE=$(ls /home/agent/shipyard-ai/prds/*.md 2>/dev/null | wc -l)
log() { echo "$(date -Iseconds) $1" >> "$LOG"; }
if [ "$STATUS" != "active" ]; then
  log "CRIT daemon=$STATUS mem=$MEM disk=$DISK queue=$QUEUE"
  [ ! -f "$ALERT" ] && touch "$ALERT" && systemctl start shipyard-daemon
elif [ "$DISK" -gt 85 ]; then
  log "WARN disk=$DISK mem=$MEM queue=$QUEUE"
  [ ! -f "$ALERT" ] && touch "$ALERT"
elif [ "$MEM" -gt 90 ]; then
  log "WARN mem=$MEM disk=$DISK queue=$QUEUE"
  [ ! -f "$ALERT" ] && touch "$ALERT"
else
  log "OK daemon=$STATUS mem=$MEM disk=$DISK queue=$QUEUE procs=$(ps aux | grep -c '[t]sx')"
  rm -f "$ALERT"
fi

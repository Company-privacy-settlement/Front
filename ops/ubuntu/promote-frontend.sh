#!/usr/bin/env bash
# Transfer only the managed loopback frontend to the reviewed root service.
set -euo pipefail
if [[ $EUID != 0 ]]; then echo 'Run promotion in a root terminal.' >&2; exit 1; fi
if [[ $# != 2 || ! $2 =~ ^[0-9a-f]{64}$ ]]; then echo 'Usage: promote-frontend.sh <archive> <sha256>' >&2; exit 1; fi
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
controller=/home/jiheon/.local/share/money-station/frontend/control.py
owner_running=0
if [[ -f $controller ]]; then
  owner_running=$(runuser -u jiheon -- /usr/bin/python3 "$controller" status | /usr/bin/python3 -c 'import json,sys; print(int(bool(json.load(sys.stdin)["managerPid"])))')
fi
finish() {
  code=$?
  trap - EXIT
  if (( code != 0 && owner_running )) && ! systemctl is-active --quiet money-station.service; then
    runuser -u jiheon -- /usr/bin/python3 "$controller" start || echo 'Owner frontend restart failed; inspect its private manager log.' >&2
  fi
  exit "$code"
}
trap finish EXIT
if (( owner_running )); then runuser -u jiheon -- /usr/bin/python3 "$controller" stop; fi
/bin/bash "$script_dir/install.sh" "$1" "$2"
if [[ -f $controller ]]; then runuser -u jiheon -- /usr/bin/python3 "$controller" autostart --disable; fi
/bin/bash "$script_dir/activate-https.sh"

#!/usr/bin/env bash
# Install a reviewed static bundle only. No dependency installation or build as root.
set -euo pipefail
umask 022
if [[ $EUID != 0 ]]; then
  echo 'Administrator access is required to install the isolated service and Nginx route.' >&2
  exit 1
fi
if [[ $# != 2 || ! $2 =~ ^[0-9a-f]{64}$ ]]; then
  echo 'Usage: sudo bash ops/ubuntu/install.sh /absolute/release.tar.gz <sha256>' >&2
  exit 1
fi
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
archive=$(realpath -- "$1")
expected=$2
for tool in python3 curl systemctl systemd-analyze ss; do command -v "$tool" >/dev/null; done
test -x /usr/sbin/nginx
systemctl is-active --quiet nginx
/usr/sbin/nginx -t

targets=(/etc/money-station/nginx.conf /etc/systemd/system/money-station.service /etc/nginx/sites-available/moneystation.site.conf)
enabled=/etc/nginx/sites-enabled/moneystation.site.conf
for target in "${targets[@]}"; do
  if [[ -e $target || -L $target ]]; then
    if [[ -L $target ]] || ! head -1 -- "$target" | grep -q '^# Managed by Money Station$'; then
      echo "Refusing to replace an unmanaged file: $target" >&2; exit 1
    fi
  fi
done
https_active=0
if [[ -f ${targets[2]} ]] && grep -Eq 'listen[^;]*443|ssl_certificate|return[[:space:]]+30[1278][[:space:]]+https:' "${targets[2]}"; then
  https_active=1
fi
if [[ -e $enabled || -L $enabled ]]; then
  if [[ ! -L $enabled || $(readlink -f -- "$enabled") != "${targets[2]}" ]]; then
    echo "Refusing to replace an unmanaged route: $enabled" >&2; exit 1
  fi
fi
python3 - "${targets[2]}" <<'PY_CHECK'
from pathlib import Path
import re,shlex,subprocess,sys
expected=Path(sys.argv[1]).resolve()
config=subprocess.check_output(['/usr/sbin/nginx','-T'],stderr=subprocess.DEVNULL,text=True)
parts=re.split(r'^# configuration file (.+):$',config,flags=re.M)
for i in range(1,len(parts),2):
    body=re.sub(r'#[^\n]*','',parts[i+1])
    for names in re.findall(r'\bserver_name\s+([^;]+);',body):
        if {'moneystation.site','api.moneystation.site'} & set(shlex.split(names)) and Path(parts[i]).resolve()!=expected:
            raise SystemExit('A Money Station domain is already handled by another route. No changes made.')
PY_CHECK
if [[ -n $(ss -H -ltn 'sport = :3330') ]] && ! systemctl is-active --quiet money-station.service; then
  echo 'Loopback port 3330 is already in use. No changes made.' >&2; exit 1
fi
python3 - <<'PY'
from pathlib import Path
for name in ['/srv/money-station', '/srv/money-station/releases', '/etc/money-station', '/var/www/money-station-acme', '/var/backups/money-station']:
    p = Path(name)
    if p.is_symlink() or (p.exists() and (not p.is_dir() or p.stat().st_uid != 0 or p.stat().st_mode & 0o022)):
        raise SystemExit('Refusing an unprotected deployment directory: ' + name)
current = Path('/srv/money-station/current')
if current.exists() and not current.is_symlink():
    raise SystemExit('Current release path must be a managed symlink')
PY
install -d -m 0755 /srv/money-station /srv/money-station/releases /etc/money-station /var/www/money-station-acme
install -d -m 0700 /var/backups/money-station
stage=$(mktemp -d /srv/money-station/.install.XXXXXX)
changed=0
was_active=0
was_enabled=0
had_route=0
old_current=''
systemctl is-active --quiet money-station.service && was_active=1
systemctl is-enabled --quiet money-station.service 2>/dev/null && was_enabled=1
[[ ! -L $enabled ]] || had_route=1
[[ ! -L /srv/money-station/current ]] || old_current=$(readlink -- /srv/money-station/current)
backup=''
finish() {
  code=$?
  trap - EXIT
  if (( code != 0 && changed == 1 )); then
    set +e
    echo 'Deployment failed; restoring the previous Money Station files and route.' >&2
    for i in "${!targets[@]}"; do
      if [[ -f $backup/file.$i ]]; then install -m 0644 "$backup/file.$i" "${targets[$i]}"; else rm -f -- "${targets[$i]}"; fi
    done
    if (( had_route )); then ln -sfn -- "${targets[2]}" "$enabled"; else rm -f -- "$enabled"; fi
    if [[ -n $old_current ]]; then
      ln -s -- "$old_current" "$stage/restore-current"
      mv -Tf -- "$stage/restore-current" /srv/money-station/current
    else rm -f -- /srv/money-station/current; fi
    systemctl daemon-reload
    if (( was_active )); then systemctl restart money-station.service; else systemctl stop money-station.service; fi
    if (( ! was_enabled )); then systemctl disable money-station.service; fi
    /usr/sbin/nginx -t && systemctl reload nginx
    echo "Previous configuration backup: $backup" >&2
  fi
  rm -rf -- "$stage"
  exit "$code"
}
trap finish EXIT
# Root-owned copy prevents changes to user-owned input between verification and extraction.
install -m 0600 -- "$archive" "$stage/release.tar.gz"
python3 "$script_dir/release.py" verify "$stage/release.tar.gz" "$expected" > "$stage/verified.json"
release=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["releaseId"])' "$stage/verified.json")
python3 "$script_dir/release.py" extract "$stage/release.tar.gz" "$expected" "$stage/release"
if [[ -e /srv/money-station/releases/$release || -L /srv/money-station/releases/$release ]]; then
  if [[ -L /srv/money-station/releases/$release ]] || ! diff -qr --no-dereference "$stage/release" "/srv/money-station/releases/$release"; then
    echo 'Existing immutable release differs from the verified bundle.' >&2; exit 1
  fi
  rm -rf -- "$stage/release"
fi
systemd-analyze verify "$script_dir/money-station.service"
backup=/var/backups/money-station/$(date -u +%Y%m%dT%H%M%SZ)-$release
install -d -m 0700 -- "$backup"
for i in "${!targets[@]}"; do
  [[ ! -f ${targets[$i]} ]] || cp -p -- "${targets[$i]}" "$backup/file.$i"
done
printf '%s\n' "$old_current" > "$backup/previous-release"
if [[ -d $stage/release ]]; then mv -- "$stage/release" "/srv/money-station/releases/$release"; fi
changed=1
python3 - "$script_dir/static.nginx.conf" "$stage/nginx.conf" "$release" <<'PY'
from pathlib import Path
import sys
Path(sys.argv[2]).write_text(Path(sys.argv[1]).read_text().replace('@RELEASE_ID@', sys.argv[3]))
PY
install -m 0644 "$stage/nginx.conf" "${targets[0]}"
install -m 0644 "$script_dir/money-station.service" "${targets[1]}"
if (( ! https_active )); then install -m 0644 "$script_dir/moneystation.site.http.conf" "${targets[2]}"; fi
ln -s -- "releases/$release" "$stage/current"
mv -Tf -- "$stage/current" /srv/money-station/current
ln -sfn -- "${targets[2]}" "$enabled"
/usr/sbin/nginx -t
systemctl daemon-reload
systemctl enable money-station.service
systemctl restart money-station.service
ready=0
for attempt in {1..20}; do
  if curl --noproxy '*' --fail --silent --max-time 2 -H 'Host: moneystation.site' http://127.0.0.1:3330/healthz >/dev/null; then ready=1; break; fi
  sleep 0.25
done
(( ready == 1 ))
python3 "$script_dir/verify.py" --origin http://127.0.0.1:3330 --release "$release"
systemctl reload nginx
if (( https_active )); then
  python3 "$script_dir/verify.py" --origin https://moneystation.site --release "$release" --wait-seconds 10
else
  python3 "$script_dir/verify.py" --origin http://127.0.0.1 --release "$release" --wait-seconds 10
fi
echo "Installed Money Station release $release for moneystation.site. DNS was not modified."
echo "Configuration backup: $backup"

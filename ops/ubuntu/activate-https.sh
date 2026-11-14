#!/usr/bin/env bash
# Add HTTPS to the two owned domains after the HTTP installation and real DNS.
set -euo pipefail
umask 077
if [[ $EUID != 0 ]]; then echo 'Administrator access is required for certificates and the host gateway.' >&2; exit 1; fi
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
target=/etc/nginx/sites-available/moneystation.site.conf
enabled=/etc/nginx/sites-enabled/moneystation.site.conf
webroot=/var/www/money-station-acme
if [[ ! -f $target || -L $target || ! -L $enabled || $(readlink -f -- "$enabled") != "$target" ]] || ! head -1 "$target" | grep -q '^# Managed by Money Station$'; then
  echo 'Install the managed moneystation.site HTTP route first.' >&2; exit 1
fi
command -v certbot >/dev/null
systemctl is-active --quiet money-station.service
/usr/sbin/nginx -t
# A public probe proves that both DNS names reach this webroot. No certificate
# request is sent on missing DNS, a wrong target, or a broken ACME route.
python3 - "$webroot" <<'PY'
from pathlib import Path
import secrets,socket,sys,urllib.request
directory=Path(sys.argv[1])/'.well-known/acme-challenge'
directory.mkdir(parents=True,exist_ok=True,mode=0o755)
# umask must not hide challenge files from the existing unprivileged Nginx.
for p in [directory.parent,directory]:p.chmod(0o755)
token='money-station-'+secrets.token_hex(16)
p=directory/token;p.write_text(token);p.chmod(0o644)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
try:
    for domain in ['moneystation.site','api.moneystation.site']:
        try: socket.getaddrinfo(domain,80,type=socket.SOCK_STREAM)
        except OSError: raise SystemExit('DNS is not visible yet for '+domain+'. No certificate was requested.')
        try:
            with opener.open('http://'+domain+'/.well-known/acme-challenge/'+token,timeout=15) as response:
                if response.status!=200 or response.read(256).decode()!=token:raise ValueError()
        except Exception:raise SystemExit('The public ACME probe did not reach this server for '+domain+'. No certificate was requested.')
finally:p.unlink(missing_ok=True)
PY
certbot certonly --webroot -w "$webroot" --cert-name moneystation.site \
  -d moneystation.site -d api.moneystation.site --non-interactive --agree-tos \
  --register-unsafely-without-email --keep-until-expiring \
  --deploy-hook '/usr/sbin/nginx -t && /bin/systemctl reload nginx'
backup=$(mktemp /var/backups/money-station/before-https.XXXXXX)
cp -p -- "$target" "$backup"
changed=0
finish() {
  code=$?
  trap - EXIT
  if (( code != 0 && changed )); then
    install -m 0644 "$backup" "$target"
    /usr/sbin/nginx -t && systemctl reload nginx
    echo "Restored the previous managed route from $backup" >&2
  fi
  exit "$code"
}
trap finish EXIT
changed=1
install -m 0644 "$script_dir/moneystation.site.https.conf" "$target"
/usr/sbin/nginx -t
systemctl reload nginx
python3 "$script_dir/verify.py" --origin https://moneystation.site --wait-seconds 10
curl --noproxy '*' --fail --silent --show-error --max-time 20 -o /dev/null https://api.moneystation.site/readyz
curl --noproxy '*' --fail --silent --show-error --max-time 20 -o /dev/null https://api.moneystation.site/readyz/organizations
echo 'Both domain certificates and the frontend HTTPS route are active.'
echo 'Settlement/indexer and organization readiness passed over HTTPS. Payment wallets and external providers require separate qualification.'

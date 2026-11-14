#!/usr/bin/env bash
# Correct the previously configured hostname, preserving the managed route on failure.
set -euo pipefail
if [[ $EUID != 0 ]]; then echo 'Run the domain migration in a root terminal.' >&2; exit 1; fi
if [[ $# != 2 || ! $2 =~ ^[0-9a-f]{64}$ ]]; then echo 'Usage: migrate-domain.sh <archive> <sha256>' >&2; exit 1; fi
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
legacy=/etc/nginx/sites-available/moneysation.site.conf
legacy_link=/etc/nginx/sites-enabled/moneysation.site.conf
if [[ ! -e $legacy && ! -L $legacy && ! -e $legacy_link && ! -L $legacy_link ]]; then
  exec /bin/bash "$script_dir/promote-frontend.sh" "$1" "$2"
fi
if [[ ! -f $legacy || -L $legacy || ! -L $legacy_link || $(readlink -f -- "$legacy_link") != "$legacy" ]] || ! head -1 "$legacy" | grep -q '^# Managed by Money Station$'; then
  echo 'Refusing to migrate an unmanaged legacy route.' >&2; exit 1
fi
systemctl is-active --quiet money-station.service
/usr/sbin/nginx -t
backup=$(mktemp -d /var/backups/money-station/domain-correction.XXXXXX)
installed=0
finish() {
  code=$?
  trap - EXIT
  if (( ! installed )); then
    install -m 0644 "$backup/legacy.conf" "$legacy"
    ln -sfn -- "$legacy" "$legacy_link"
    /usr/sbin/nginx -t && systemctl reload nginx
    echo "Restored the previous domain route from $backup" >&2
  fi
  exit "$code"
}
cp -p -- "$legacy" "$backup/legacy.conf"
trap finish EXIT
rm -- "$legacy_link" "$legacy"
# Keep the existing workers serving until the new installer reloads successfully.
/bin/bash "$script_dir/install.sh" "$1" "$2"
installed=1
/bin/bash "$script_dir/activate-https.sh"
# Preserve the previous certificate for rollback, while preventing the renewal
# timer from requesting a hostname whose ACME route has now been retired.
python3 - "$backup" <<'PY'
from pathlib import Path
import sys
p=Path('/etc/letsencrypt/money-station/renewal/moneysation.site.conf')
if p.exists():
    if p.is_symlink() or p.stat().st_uid!=0 or p.stat().st_mode&0o022:
        raise SystemExit('Refusing to archive an unprotected legacy renewal profile')
    p.rename(Path(sys.argv[1])/p.name)
PY

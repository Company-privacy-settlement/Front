# Isolated Ubuntu hosting: moneystation.site

This deployment serves the Money Station landing, Docs and application as a static frontend. Core, the indexer, Organization API and relay remain separate services with their existing qualification requirements. The existing Sites preview and its sharing settings are unchanged.

```text
moneystation.site :80 → existing host Nginx → 127.0.0.1:3330
                                    money-station.service
                                    /srv/money-station/current/public
```

The DNS-independent HTTP stage serves the exact `moneystation.site` frontend host. `api.moneystation.site` serves the ACME webroot but otherwise returns HTTP 426 until HTTPS activation. No DNS changes, certificate requests, default-server replacement or HTTP-to-HTTPS redirect happen during installation. The other Ubuntu virtual hosts keep their existing routes.

## Prepare a release as a normal user

Build the intended committed Front source with its approved public service configuration. Wallet secrets and private notes are never build inputs. Keep the in-progress demo editing work separate from application source.

```bash
npm run check
npm test
npm run build
python3 ops/ubuntu/release.py pack --public out \
  --commit "$(git rev-parse HEAD)" --output /tmp/money-station-ubuntu.tar.gz
```

The packer returns the archive SHA-256 and release ID. It includes only regular static files, a source commit and per-file integrity pins. It excludes hidden files, including Sites metadata. An existing output archive is never overwritten. Keep the displayed SHA-256 separately from the bundle.

## Validate before administrator installation

On this Ubuntu host, the manual check starts actual Nginx processes in unprivileged Bubblewrap mount/user/PID namespaces, with the export mounted read-only and the user's home absent. It uses temporary loopback ports, exercises the domain proxy, and removes its processes afterward.

```bash
python3 tests/manual/ubuntu-hosting.py /tmp/money-station-ubuntu.tar.gz <archive-sha256>
bash -n ops/ubuntu/install.sh
systemd-analyze verify ops/ubuntu/money-station.service
```

These checks do not install the system service, test its live cgroup restrictions or reload the host's Nginx. Those require an administrator.

## Install on Ubuntu before DNS

```bash
sudo bash ops/ubuntu/install.sh /tmp/money-station-ubuntu.tar.gz <archive-sha256>
```

The installer verifies a root-owned copy of the archive, checks every file before extraction, checks for an existing host/port collision, and installs only:

| Path | Purpose |
| --- | --- |
| `/srv/money-station/releases/<release-id>/` | Immutable, root-owned static releases and their manifest |
| `/srv/money-station/current` | Atomically selected release |
| `/etc/money-station/nginx.conf` | Loopback static Nginx instance |
| `/etc/systemd/system/money-station.service` | Dynamic service user and filesystem/resource restrictions |
| `/etc/nginx/sites-available/moneystation.site.conf` | Exact-host route and its matching enabled symlink |
| `/var/www/money-station-acme/` | Dedicated future ACME webroot |
| `/var/backups/money-station/` | Previous managed configurations and release target |

`money-station.service` has no capabilities or host-home access. Application files are read-only. Writes are limited to its private runtime and temporary directories, and network access is limited to IPv4 loopback. Limits are 128 MiB, 50% of one CPU and 32 tasks. The host Nginx remains the existing service; its reload is graceful. An unmanaged conflicting route/configuration is refused. Failed activation restores the previous Money Station files and service state.

The installer checks the loopback service first, then reloads and checks the host route. Both checks exercise Docs, application routes, content types, policy hashes, cache controls, denied private paths and video byte ranges.

```bash
curl --noproxy '*' --resolve moneystation.site:80:127.0.0.1 http://moneystation.site/healthz
python3 ops/ubuntu/verify.py --origin http://127.0.0.1
systemctl status money-station.service --no-pager
journalctl -u money-station.service --no-pager -n 30
```

From another machine, `curl --resolve moneystation.site:80:<server-public-ip> http://moneystation.site/` tests the route without publishing DNS. The domain route is publicly reachable by Host header once the administrator installs it; it does not inherit the Sites preview's login gate. Organization records still require their separate authenticated API.

## Connect DNS and HTTPS later

Set the apex `A` record to the verified server IPv4 address. Do not add an `AAAA` record without working IPv6 routing. The static installer never changes DNS or requests a certificate. The API runtime and indexer are not started by this frontend installer.

After both DNS names resolve to this server, activate their shared certificate and separate HTTPS virtual hosts:

```bash
sudo bash ops/ubuntu/activate-https.sh
```

The script requires the managed HTTP installation first. It verifies that a fresh public challenge file is reachable through both domain names before requesting a certificate. Certbot uses only the dedicated webroot and a certificate named `moneystation.site`; unrelated certificates and sites are unchanged. Both domains are included in its SANs. Renewal checks/reloads Nginx through a certificate-specific deploy hook. No operator email is invented.

The HTTPS template sends the frontend to `127.0.0.1:3330` and reserves `api.moneystation.site` for a separately deployed settlement API at `127.0.0.1:3331`. An absent upstream produces HTTP 503 with `API_UPSTREAM_UNAVAILABLE`; this is not a deployed/healthy API. The API is not proxied over plaintext HTTP. HTTP requests redirect to HTTPS only after certificate installation. A later frontend release preserves the already managed HTTPS virtual host.

Frontend acceptance uses normal HTTPS verification. API transport acceptance does not establish index readiness, backend persistence, browser-wallet USDC, an Organization API or a funded payment journey. Configure the separately deployed settlement API with exact CORS for `https://moneystation.site`, a reviewed deployed policy and its independent digest. Organization services retain their own audience, encryption keys and deployment requirements. The native reference policy is not a browser FT policy.

## Current activation status — 2026-11-14

The chosen Ubuntu IPv4 is `64.227.151.164`. The operator reported direct Hostinger DNS setup. At the dated check, the `.site` authoritative nameserver and public resolvers still returned NXDOMAIN for `moneystation.site`; the runtime account also required a sudo password. Root Nginx/service installation, public certificate issuance and actual API deployment were therefore not performed. Local namespace tests use a temporary explicitly trusted test certificate; they do not establish a public certificate or live HTTPS acceptance.

## Roll back a release

The previous symlink target is recorded under the printed backup directory. Select an already verified release with an atomic symlink rename, restart only `money-station.service`, and rerun `verify.py` against loopback and the host route. Use the corresponding saved configuration files if the unit or proxy configuration also changed. Do not modify other virtual hosts or delete retained releases during rollback.

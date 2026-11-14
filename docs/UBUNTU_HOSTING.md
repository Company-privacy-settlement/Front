# Isolated Ubuntu hosting: h2on.xyz

This deployment serves the Money Station landing, Docs and application as a static frontend. Core, the indexer, Organization API and relay remain separate services with their existing qualification requirements. The existing Sites preview and its sharing settings are unchanged.

```text
h2on.xyz :80 → existing host Nginx → 127.0.0.1:3330
                                    money-station.service
                                    /srv/money-station/current/public
```

The DNS-independent HTTP stage routes only the exact `h2on.xyz` host. No DNS changes, certificate requests, default-server replacement or HTTP-to-HTTPS redirect happen during installation. The other Ubuntu virtual hosts keep their existing routes.

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
| `/etc/nginx/sites-available/h2on.xyz.conf` | Exact-host route and its matching enabled symlink |
| `/var/www/money-station-acme/` | Dedicated future ACME webroot |
| `/var/backups/money-station/` | Previous managed configurations and release target |

`money-station.service` has no capabilities or host-home access. Application files are read-only. Writes are limited to its private runtime and temporary directories, and network access is limited to IPv4 loopback. Limits are 128 MiB, 50% of one CPU and 32 tasks. The host Nginx remains the existing service; its reload is graceful. An unmanaged conflicting route/configuration is refused. Failed activation restores the previous Money Station files and service state.

The installer checks the loopback service first, then reloads and checks the host route. Both checks exercise Docs, application routes, content types, policy hashes, cache controls, denied private paths and video byte ranges.

```bash
curl --noproxy '*' --resolve h2on.xyz:80:127.0.0.1 http://h2on.xyz/healthz
python3 ops/ubuntu/verify.py --origin http://127.0.0.1
systemctl status money-station.service --no-pager
journalctl -u money-station.service --no-pager -n 30
```

From another machine, `curl --resolve h2on.xyz:80:<server-public-ip> http://h2on.xyz/` tests the route without publishing DNS. The domain route is publicly reachable by Host header once the administrator installs it; it does not inherit the Sites preview's login gate. Organization records still require their separate authenticated API.

## Connect DNS and HTTPS later

Set the apex `A` record to the verified server IPv4 address. Do not add an `AAAA` record without working IPv6 routing. The installer never changes DNS or requests a certificate.

After DNS resolves to this server, an administrator can obtain a certificate using the dedicated webroot:

```bash
sudo certbot certonly --webroot -w /var/www/money-station-acme -d h2on.xyz
```

Then add a separate HTTPS virtual host using that certificate and the same loopback upstream. Test Nginx before reloading it, verify normal HTTPS certificate validation externally, and only then change HTTP requests to HTTPS redirects. HTTP staging by domain/IP does not qualify browser wallet signing: a trusted HTTPS origin is required. Configure independently qualified API origins and exact CORS for `https://h2on.xyz` before qualifying real payments. No certificate or public HTTPS acceptance is implied by the pre-DNS checks.

## Roll back a release

The previous symlink target is recorded under the printed backup directory. Select an already verified release with an atomic symlink rename, restart only `money-station.service`, and rerun `verify.py` against loopback and the host route. Use the corresponding saved configuration files if the unit or proxy configuration also changed. Do not modify other virtual hosts or delete retained releases during rollback.

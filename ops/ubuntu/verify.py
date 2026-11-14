#!/usr/bin/env python3
"""Read-only Host-header acceptance checks; DNS is not required."""
import argparse
import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request


def check(origin, release=None):
    u = urllib.parse.urlsplit(origin)
    if u.scheme not in ('http', 'https') or not u.netloc or u.path not in ('', '/') or u.query or u.fragment or u.username:
        raise ValueError('Supply one HTTP(S) origin')
    origin = origin.rstrip('/')
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    checks = 0

    def fetch(path, status=200, method='GET', extra=None):
        nonlocal checks
        req = urllib.request.Request(origin + path, method=method,
                                     headers={'Host': 'h2on.xyz', **(extra or {})})
        try:
            r = opener.open(req, timeout=10)
        except urllib.error.HTTPError as e:
            r = e
        with r:
            body = r.read()
            assert r.status == status, f'{method} {path}: {r.status}, expected {status}'
            assert r.headers.get('X-Content-Type-Options') == 'nosniff', path
            assert r.headers.get('Referrer-Policy') == 'strict-origin-when-cross-origin', path
            assert r.headers.get('X-Money-Station-Release'), 'Missing release provenance header'
            if release:
                assert r.headers['X-Money-Station-Release'] == release, 'Wrong active release'
            checks += 1
            return body, dict(r.headers)

    body, _ = fetch('/healthz')
    assert json.loads(body) == {'service': 'money-station-front', 'status': 'ok'}
    landing, headers = fetch('/')
    assert b'Money Station' in landing and 'no-cache' in headers['Cache-Control']
    for path in ['/docs/', '/docs/deployments/', '/live/', '/invoices/', '/prove/', '/organization/']:
        body, _ = fetch(path)
        assert b'<html' in body, path
    body, headers = fetch('/docs/deployments/', method='HEAD')
    assert not body and int(headers['Content-Length']) > 0
    record, headers = fetch('/deployments/native-near.json')
    assert 'application/json' in headers['Content-Type'] and 'no-cache' in headers['Cache-Control']
    reference = json.loads(record)
    policy, _ = fetch('/deployments/native-policy.json')
    assert hashlib.sha256(policy).hexdigest() == reference['policyFileSha256']
    docs, _ = fetch('/docs/deployments/')
    for contract in [reference['registry'], *reference['vaults']]:
        assert contract['accountId'].encode() in docs
    assets = set(re.findall(r'(?:src|href)="(/_next/static/[^"?]+)', landing.decode()))
    assert assets, 'No compiled assets found'
    for path in sorted(assets):
        _, h = fetch(path, method='HEAD')
        assert 'immutable' in h['Cache-Control'], path
        if path.endswith('.css'):
            assert 'text/css' in h['Content-Type'], path
        if path.endswith('.js'):
            assert 'javascript' in h['Content-Type'], path
    for path in ['/.env', '/.git/config', '/ops/ubuntu/install.sh', '/does-not-exist/']:
        fetch(path, status=404)
    fetch('/', status=405, method='POST')
    video, h = fetch('/media/core-hackathon-demo-en.mp4', status=206, extra={'Range': 'bytes=0-15'})
    assert len(video) == 16 and h['Content-Range'].startswith('bytes 0-15/')
    return {'status': 'passed', 'checks': checks, 'origin': origin, 'host': 'h2on.xyz',
            'release': release, 'dnsRequired': False}


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--origin', default='http://127.0.0.1')
    cli.add_argument('--release')
    args = cli.parse_args()
    try:
        print(json.dumps(check(args.origin, args.release)))
    except (AssertionError, ValueError, OSError, urllib.error.URLError) as e:
        cli.exit(1, f'Hosting check failed: {e}\n')

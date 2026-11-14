#!/usr/bin/env python3
"""Exercise real isolated Nginx and the pre-DNS edge route without root."""
import argparse
import hashlib
import http.client
import io
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'ops/ubuntu'))
import release
import verify


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def rejects(action):
    try:
        action()
    except (ValueError, OSError, tarfile.TarError):
        return
    raise AssertionError('An invalid release was accepted')


def main(archive, sha):
    info = release.verify(archive, sha)
    processes = []
    with tempfile.TemporaryDirectory(prefix='money-station-qa-') as work:
        work = Path(work)
        export = work / 'release'
        release.extract(archive, sha, export)
        rejects(lambda: release.verify(archive, '0' * 64))
        # A caller with an updated archive digest still cannot substitute files,
        # add a symlink, or escape the destination directory.
        for attack in ['tamper', 'symlink', 'traversal']:
            bad = work / (attack + '.tar.gz')
            with tarfile.open(archive, 'r:gz') as src, tarfile.open(bad, 'w:gz') as dst:
                for member in src.getmembers():
                    data = src.extractfile(member).read()
                    if attack == 'tamper' and member.name == 'public/index.html':
                        data += b'changed'
                    member.size = len(data)
                    dst.addfile(member, io.BytesIO(data))
                if attack != 'tamper':
                    member = tarfile.TarInfo('public/escape' if attack == 'symlink' else '../escaped')
                    if attack == 'symlink':
                        member.type = tarfile.SYMTYPE
                        member.linkname = '/etc/passwd'
                    dst.addfile(member)
            rejects(lambda: release.extract(bad, release.file_digest(bad), work / (attack + '-extracted')))
            assert not (work / (attack + '-extracted')).exists()
        assert not (work / 'escaped').exists()
        up, edge = free_port(), free_port()
        assert up != edge
        config = work / 'nginx.conf'
        config.write_text((ROOT / 'ops/ubuntu/static.nginx.conf').read_text()
                          .replace('@RELEASE_ID@', info['releaseId']).replace(':3330', f':{up}'))
        edge_config = work / 'edge.conf'
        edge_config.write_text((ROOT / 'ops/ubuntu/h2on.xyz.http.conf').read_text()
                               .replace('listen 80;', f'listen 127.0.0.1:{edge};')
                               .replace('listen [::]:80;', '')
                               .replace(':3330', f':{up}')
                               .replace('/var/log/nginx/money-station.access.log', '/dev/stdout')
                               .replace('/var/log/nginx/money-station.error.log', '/dev/stderr'))
        wrapper = work / 'edge-main.conf'
        wrapper.write_text('''daemon off;
worker_processes 1;
pid /run/money-station/edge.pid;
error_log stderr;
events { worker_connections 256; }
http {
 include /etc/nginx/mime.types;
 client_body_temp_path /run/money-station/client;
 proxy_temp_path /run/money-station/proxy;
 fastcgi_temp_path /run/money-station/fastcgi;
 uwsgi_temp_path /run/money-station/uwsgi;
 scgi_temp_path /run/money-station/scgi;
 include /etc/money-station/edge.conf;
}
''')
        challenge = work / 'acme/.well-known/acme-challenge'
        challenge.mkdir(parents=True)
        (challenge / 'local-probe').write_text('money-station-acme-probe')
        base = ['bwrap', '--unshare-all', '--share-net', '--new-session', '--die-with-parent',
                '--cap-drop', 'ALL', '--ro-bind', '/usr', '/usr',
                '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/lib64', '/lib64',
                '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
                '--dir', '/run', '--tmpfs', '/run/money-station', '--dir', '/etc/nginx',
                '--ro-bind', '/etc/nginx/mime.types', '/etc/nginx/mime.types',
                '--dir', '/etc/money-station', '--ro-bind', str(work), '/etc/money-station',
                '--dir', '/srv/money-station/current',
                '--ro-bind', str(export / 'public'), '/srv/money-station/current/public',
                '--dir', '/var/www', '--ro-bind', str(work / 'acme'), '/var/www/money-station-acme',
                '--clearenv', '--setenv', 'PATH', '/usr/sbin:/usr/bin', '--chdir', '/']
        subprocess.run(base + ['/usr/bin/test', '!', '-e', '/home/jiheon'], check=True)
        subprocess.run(base + ['/usr/bin/test', '!', '-w', '/srv/money-station/current/public/index.html'], check=True)
        logs = []
        try:
            for name in ['nginx.conf', 'edge-main.conf']:
                command = base + ['/usr/sbin/nginx', '-p', '/run/money-station/', '-c', '/etc/money-station/' + name]
                subprocess.run(command + ['-t'], check=True, capture_output=True)
                log = (work / (name + '.log')).open('w+')
                logs.append(log)
                processes.append(subprocess.Popen(command, stdout=log, stderr=log, start_new_session=True))
            for port in [up, edge]:
                for attempt in range(50):
                    if any(p.poll() is not None for p in processes):
                        raise AssertionError('A sandboxed Nginx process exited')
                    try:
                        with socket.create_connection(('127.0.0.1', port), timeout=.2):
                            break
                    except OSError:
                        time.sleep(.1)
                else:
                    raise AssertionError('Nginx readiness timed out')
            results = [verify.check('http://127.0.0.1:' + str(p), info['releaseId']) for p in [up, edge]]
            opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
            req = urllib.request.Request(f'http://127.0.0.1:{up}/', headers={'Host': 'unrelated.invalid'})
            try:
                opener.open(req, timeout=3)
            except (http.client.RemoteDisconnected, urllib.error.URLError):
                pass
            else:
                raise AssertionError('An unrelated Host was accepted by the static service')
            req = urllib.request.Request(f'http://127.0.0.1:{edge}/.well-known/acme-challenge/local-probe', headers={'Host': 'h2on.xyz'})
            with opener.open(req, timeout=3) as response:
                assert response.read() == b'money-station-acme-probe'
            print(json.dumps({'status': 'passed', 'namespaceIsolation': True, 'readOnlyExport': True,
                              'invalidBundlesRejected': 4, 'acmeWebroot': True, 'servers': results,
                              'systemServiceInstalled': False, 'dnsModified': False}))
        except Exception:
            for log in logs:
                log.flush()
                log.seek(0)
                print(log.read()[-3000:], file=sys.stderr)
            raise
        finally:
            for p in processes:
                if p.poll() is None:
                    os.killpg(p.pid, signal.SIGTERM)
                    try:
                        p.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        os.killpg(p.pid, signal.SIGKILL)
                        p.wait()
            for log in logs:
                log.close()


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('archive', type=Path)
    cli.add_argument('sha256')
    args = cli.parse_args()
    main(args.archive.resolve(strict=True), args.sha256)

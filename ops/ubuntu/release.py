#!/usr/bin/env python3
"""Package and verify a static export. Never run a build or read environment secrets."""
import argparse
import datetime
import gzip
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import tarfile

FORMAT = 'money-station-static-release-v1'
REQUIRED = {'index.html', '404.html', 'docs/deployments/index.html',
            'deployments/native-near.json', 'deployments/native-policy.json'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def file_digest(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def safe_name(name):
    p = PurePosixPath(name)
    if p.is_absolute() or p.as_posix() != name or any(
            x in ('', '.', '..', 'node_modules') or x.startswith('.') for x in p.parts):
        raise ValueError(f'Unsafe release path: {name}')


def pack(public, commit, output):
    if not re.fullmatch('[0-9a-f]{40}', commit):
        raise ValueError('A full source commit is required')
    public = public.resolve(strict=True)
    files = {}
    for p in sorted(public.rglob('*')):
        name = p.relative_to(public).as_posix()
        # Sites metadata is not part of the Ubuntu web root.
        if any(x.startswith('.') for x in p.relative_to(public).parts):
            continue
        safe_name(name)
        if p.is_symlink():
            raise ValueError(f'Symlink in export: {name}')
        if p.is_file():
            files[name] = p
    if not REQUIRED <= files.keys():
        raise ValueError('Incomplete Money Station static export')
    manifest = {'format': FORMAT, 'sourceCommit': commit,
                'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'fileSha256': {n: file_digest(p) for n, p in files.items()}}
    with output.open('xb') as raw, gzip.GzipFile(fileobj=raw, mode='wb', mtime=0) as gz:
        with tarfile.open(fileobj=gz, mode='w') as archive:
            entries = [('release.json', json.dumps(manifest, indent=2).encode() + b'\n')]
            entries += [('public/' + n, p.read_bytes()) for n, p in files.items()]
            for name, data in entries:
                info = tarfile.TarInfo(name)
                info.size = len(data)
                info.mode = 0o644
                archive.addfile(info, io.BytesIO(data))
    return verify(output, file_digest(output))


def verify(archive_path, expected):
    if not re.fullmatch('[0-9a-f]{64}', expected) or file_digest(archive_path) != expected:
        raise ValueError('Release archive SHA-256 mismatch')
    with tarfile.open(archive_path, 'r:gz') as archive:
        members = archive.getmembers()
        if len(members) > 8192 or sum(m.size for m in members) > 512 * 1024 * 1024:
            raise ValueError('Release exceeds static bundle limits')
        seen = set()
        for m in members:
            safe_name(m.name)
            if not m.isfile() or m.name in seen or m.size > 128 * 1024 * 1024:
                raise ValueError('Release contains a link, duplicate or unsupported entry')
            if m.name != 'release.json' and not m.name.startswith('public/'):
                raise ValueError('Release contains files outside the public root')
            seen.add(m.name)
        if 'release.json' not in seen or archive.getmember('release.json').size > 2 * 1024 * 1024:
            raise ValueError('Missing or oversized release manifest')
        manifest = json.load(archive.extractfile('release.json'))
        if manifest.get('format') != FORMAT or not re.fullmatch('[0-9a-f]{40}', manifest.get('sourceCommit', '')):
            raise ValueError('Invalid release manifest')
        pins = manifest.get('fileSha256')
        if not isinstance(pins, dict) or not REQUIRED <= pins.keys():
            raise ValueError('Incomplete release manifest')
        if seen != {'release.json', *('public/' + n for n in pins)}:
            raise ValueError('Release file set differs from its manifest')
        for name, pin in pins.items():
            safe_name(name)
            if not isinstance(pin, str) or not re.fullmatch('[0-9a-f]{64}', pin):
                raise ValueError('Invalid file digest')
            with archive.extractfile('public/' + name) as f:
                if hashlib.file_digest(f, 'sha256').hexdigest() != pin:
                    raise ValueError(f'Release file integrity mismatch: {name}')
        reference = json.load(archive.extractfile('public/deployments/native-near.json'))
        policy = archive.extractfile('public/deployments/native-policy.json').read()
        if digest(policy) != reference['policyFileSha256']:
            raise ValueError('Published native policy does not match its address record')
    return {'format': FORMAT, 'sourceCommit': manifest['sourceCommit'], 'archiveSha256': expected,
            'fileCount': len(pins), 'releaseId': manifest['sourceCommit'][:12] + '-' + expected[:12]}


def extract(archive_path, expected, destination):
    result = verify(archive_path, expected)
    destination.mkdir(mode=0o755, parents=False, exist_ok=False)
    with tarfile.open(archive_path, 'r:gz') as archive:
        # Only validated regular files; do not use extractall or restore archive ownership.
        for m in archive.getmembers():
            p = destination.joinpath(*PurePosixPath(m.name).parts)
            p.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
            with archive.extractfile(m) as source, p.open('xb') as target:
                while data := source.read(1024 * 1024):
                    target.write(data)
            p.chmod(0o644)
    return result


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    commands = cli.add_subparsers(dest='command', required=True)
    p = commands.add_parser('pack')
    p.add_argument('--public', type=Path, required=True)
    p.add_argument('--commit', required=True)
    p.add_argument('--output', type=Path, required=True)
    for command in ['verify', 'extract']:
        p = commands.add_parser(command)
        p.add_argument('archive', type=Path)
        p.add_argument('sha256')
        if command == 'extract':
            p.add_argument('destination', type=Path)
    args = cli.parse_args()
    try:
        if args.command == 'pack':
            result = pack(args.public, args.commit, args.output)
        elif args.command == 'extract':
            result = extract(args.archive, args.sha256, args.destination)
        else:
            result = verify(args.archive, args.sha256)
    except (ValueError, OSError, KeyError, TypeError, tarfile.TarError) as e:
        cli.exit(1, f'Release rejected: {e}\n')
    print(json.dumps(result))


if __name__ == '__main__':
    main()

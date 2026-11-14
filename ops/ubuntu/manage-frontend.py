#!/usr/bin/env python3
"""Prepare and supervise the verified static frontend without administrator access."""
import argparse
import fcntl
import hashlib
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import shlex
import signal
import socket
import subprocess
import sys
import tarfile
import tempfile
import threading
import time

import release

DEFAULT_ROOT=Path('/home/jiheon/.local/share/money-station/frontend')
MARKER='# money-station-frontend-autostart'


def private_directory(p):
    p.mkdir(parents=True,exist_ok=True,mode=0o700)
    st=p.lstat()
    if p.is_symlink() or not p.is_dir() or st.st_uid!=os.getuid() or st.st_mode&0o077:
        raise ValueError('Deployment directories must belong only to the runtime owner')


def atomic_write(p,data,mode=0o600):
    fd,name=tempfile.mkstemp(dir=p.parent,prefix='.'+p.name+'-')
    try:
        with os.fdopen(fd,'wb') as f:f.write(data)
        os.chmod(name,mode);os.replace(name,p)
    finally:
        Path(name).unlink(missing_ok=True)


def config(root):
    private_directory(root)
    for name in ['run','logs','releases']:private_directory(root/name)
    c=json.loads((root/'config.json').read_text());directory=Path(c['release'])
    if c.get('format')!='money-station-frontend-config-v1' or directory.parent!=root/'releases' or directory.is_symlink():
        raise ValueError('Invalid frontend configuration')
    return c


def verify_runtime(c):
    directory=Path(c['release']);archive=directory/'bundle.tar.gz'
    info=release.verify(archive,c['archiveSha256'])
    if info['releaseId']!=directory.name or c['releaseId']!=directory.name:raise ValueError('Release identity mismatch')
    with tarfile.open(archive,'r:gz') as bundle:expected=bundle.extractfile('release.json').read()
    if (directory/'release.json').read_bytes()!=expected:raise ValueError('Release manifest changed')
    pins=json.loads(expected)['fileSha256']
    actual=set()
    for p in (directory/'public').rglob('*'):
        if p.is_symlink():raise ValueError('Unexpected runtime link')
        if p.is_file():actual.add(p.relative_to(directory/'public').as_posix())
    if actual!=set(pins):raise ValueError('Runtime file set changed')
    for name,pin in pins.items():
        if release.file_digest(directory/'public'/name)!=pin:raise ValueError('Runtime integrity mismatch: '+name)
    if release.file_digest(directory/'nginx.conf')!=c['nginxSha256']:raise ValueError('Nginx configuration changed')
    return info


def prepare(root,archive,pin):
    private_directory(root)
    for name in ['releases','run','logs']:private_directory(root/name)
    with tempfile.TemporaryDirectory(prefix='.prepare-',dir=root/'releases') as staging:
        staging=Path(staging);bundle=staging/'bundle.tar.gz'
        # Verify a private copy, then extract only validated regular files.
        with archive.open('rb') as src,bundle.open('xb') as dst:
            import shutil
            shutil.copyfileobj(src,dst)
        info=release.verify(bundle,pin);directory=root/'releases'/info['releaseId']
        release.extract(bundle,pin,staging/'release')
        (staging/'release/bundle.tar.gz').write_bytes(bundle.read_bytes())
        rendered=(Path(__file__).parent/'static.nginx.conf').read_text().replace('@RELEASE_ID@',info['releaseId'])
        (staging/'release/nginx.conf').write_text(rendered)
        c={**info,'format':'money-station-frontend-config-v1','release':str(directory),
           'nginxSha256':hashlib.sha256(rendered.encode()).hexdigest()}
        if directory.is_symlink():raise ValueError('Release directory cannot be linked')
        if directory.exists():verify_runtime(c)
        else:(staging/'release').rename(directory)
        for name,source in [('control.py',Path(__file__)),('release.py',Path(__file__).parent/'release.py')]:
            atomic_write(root/name,source.read_bytes(),0o700 if name=='control.py' else 0o600)
        atomic_write(root/'config.json',(json.dumps(c,indent=2)+'\n').encode())
    print(json.dumps({'status':'prepared','root':str(root),'releaseId':c['releaseId'],'sourceCommit':c['sourceCommit']}))


def sandbox(root,c,command=None):
    directory=Path(c['release'])
    return ['bwrap','--unshare-all','--share-net','--new-session','--die-with-parent',
            '--cap-drop','ALL','--ro-bind','/usr','/usr','--symlink','usr/lib','/lib',
            '--symlink','usr/lib64','/lib64','--proc','/proc','--dev','/dev','--tmpfs','/tmp',
            '--dir','/run','--tmpfs','/run/money-station','--dir','/etc/nginx',
            '--ro-bind','/etc/nginx/mime.types','/etc/nginx/mime.types',
            '--dir','/etc/money-station','--ro-bind',str(directory/'nginx.conf'),'/etc/money-station/nginx.conf',
            '--dir','/srv/money-station/current','--ro-bind',str(directory/'public'),'/srv/money-station/current/public',
            '--clearenv','--setenv','PATH','/usr/sbin:/usr/bin','--chdir','/']+(command or [
                '/usr/sbin/nginx','-p','/run/money-station/','-c','/etc/money-station/nginx.conf'])


def managed_pid(root):
    try:
        pid=json.loads((root/'run/status.json').read_text())['managerPid'];proc=Path('/proc',str(pid))
        argv=(proc/'cmdline').read_bytes().split(b'\0')
        if proc.stat().st_uid==os.getuid() and str(root/'control.py').encode() in argv and b'run' in argv and str(root).encode() in argv:return pid
    except (OSError,ValueError,KeyError,TypeError):pass
    return None


def terminate(p):
    if p.poll() is not None:return
    pending=[p.pid];target=None
    for _ in range(64):
        if not pending:break
        pid=pending.pop();proc=Path('/proc',str(pid))
        try:
            if proc.stat().st_uid!=os.getuid():continue
            if os.readlink(proc/'exe')=='/usr/sbin/nginx' and b'/etc/money-station/nginx.conf' in (proc/'cmdline').read_bytes():target=pid;break
            pending.extend(map(int,(proc/'task'/str(pid)/'children').read_text().split()))
        except (OSError,ValueError):pass
    try:
        if target:os.kill(target,signal.SIGQUIT)
        else:os.killpg(p.pid,signal.SIGTERM)
        p.wait(timeout=15)
    except ProcessLookupError:pass
    except subprocess.TimeoutExpired:
        try:os.killpg(p.pid,signal.SIGKILL)
        except ProcessLookupError:pass
        p.wait()


def run(root):
    c=config(root)
    with (root/'run/manager.lock').open('a') as lock:
        try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:raise SystemExit('Frontend manager already holds the lock')
        verify_runtime(c)
        stop=threading.Event();restart=threading.Event();p=None;reader=None
        for sig in [signal.SIGTERM,signal.SIGINT]:signal.signal(sig,lambda *_:stop.set())
        signal.signal(signal.SIGHUP,lambda *_:restart.set())
        logger=logging.getLogger('money-station-frontend');logger.setLevel(logging.INFO)
        log=RotatingFileHandler(root/'logs/frontend.log',maxBytes=5*1024*1024,backupCount=3);logger.addHandler(log)
        def output(child):
            for line in iter(child.stdout.readline,b''):logger.info('%s',line[:16384].decode(errors='replace').rstrip())
            child.stdout.close()
        def status(event):
            atomic_write(root/'run/status.json',(json.dumps({'event':event,'managerPid':os.getpid(),'releaseId':c['releaseId'],
                'workerPid':p.pid if p else None,'updatedAt':time.time()})+'\n').encode())
        delay=1
        try:
            while not stop.is_set():
                if restart.is_set():
                    if p:terminate(p)
                    if reader:reader.join(timeout=2)
                    p=None;restart.clear();c=config(root);verify_runtime(c)
                if p is None or p.poll() is not None:
                    if p:
                        logger.warning('Nginx exited with %s',p.returncode)
                        if stop.wait(delay):break
                        delay=min(60,delay*2)
                        if reader:reader.join(timeout=2)
                    subprocess.run(sandbox(root,c)+['-t'],check=True,capture_output=True,timeout=15)
                    p=subprocess.Popen(['nice','-n','5','prlimit','--nofile=1024:1024','--core=0:0','--',*sandbox(root,c)],
                        stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,start_new_session=True,close_fds=True)
                    reader=threading.Thread(target=output,args=(p,),daemon=True);reader.start()
                status('running');stop.wait(1)
        finally:
            if p:terminate(p)
            if reader:reader.join(timeout=2)
            status('stopped');log.close()


def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('command',choices=['prepare','run','start','stop','restart','status','autostart'])
    cli.add_argument('--root',type=Path,default=DEFAULT_ROOT)
    cli.add_argument('--archive',type=Path);cli.add_argument('--sha256');cli.add_argument('--disable',action='store_true')
    a=cli.parse_args();root=a.root.absolute()
    if a.command=='prepare':
        if not a.archive or not a.sha256:cli.error('Preparation requires --archive and --sha256')
        return prepare(root,a.archive.resolve(strict=True),a.sha256)
    c=config(root)
    if a.command=='run':return run(root)
    pid=managed_pid(root)
    if a.command=='start':
        if subprocess.run(['systemctl','is-active','--quiet','money-station.service'],capture_output=True).returncode==0:
            print(json.dumps({'status':'system-service-active'}));return
        if pid:print(json.dumps({'status':'already-running','managerPid':pid}));return
        with socket.socket() as listener:
            listener.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);listener.bind(('127.0.0.1',3330))
        with (root/'logs/manager.log').open('ab') as log:
            p=subprocess.Popen([sys.executable,str(root/'control.py'),'run','--root',str(root)],stdin=subprocess.DEVNULL,
                stdout=log,stderr=log,start_new_session=True,close_fds=True)
        print(json.dumps({'status':'starting','managerPid':p.pid}))
    elif a.command in ['stop','restart']:
        if not pid:raise SystemExit('No owner-managed frontend is running')
        os.kill(pid,signal.SIGHUP if a.command=='restart' else signal.SIGTERM)
        if a.command=='stop':
            for _ in range(25):
                if not managed_pid(root):break
                time.sleep(1)
            else:raise RuntimeError('Frontend manager did not stop')
        print(json.dumps({'status':a.command+'-requested','managerPid':pid}))
    elif a.command=='autostart':
        if any(x in str(root) for x in ['\n','%']):raise ValueError('Unsupported cron path')
        before=subprocess.run(['crontab','-l'],capture_output=True,text=True)
        if before.returncode not in [0,1]:raise RuntimeError('Could not read owner crontab')
        lines=[line for line in before.stdout.splitlines() if not line.endswith(MARKER)]
        if not a.disable:lines.append('@reboot '+shlex.join([sys.executable,str(root/'control.py'),'start','--root',str(root)])+' >> '+shlex.quote(str(root/'logs/boot.log'))+' 2>&1 '+MARKER)
        current=subprocess.run(['crontab','-l'],capture_output=True,text=True)
        if current.stdout!=before.stdout:raise RuntimeError('Crontab changed; refusing to overwrite')
        subprocess.run(['crontab','-'],input='\n'.join(lines)+'\n',text=True,check=True)
        print(json.dumps({'status':'owner-autostart-removed' if a.disable else 'owner-autostart-installed'}))
    else:print(json.dumps({'managerPid':pid,'releaseId':c['releaseId'],'origin':'http://127.0.0.1:3330','host':'moneysation.site'}))


if __name__=='__main__':
    os.umask(0o077)
    main()

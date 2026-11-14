#!/usr/bin/env python3
"""Check the real owner frontend, including lifecycle, restart recovery and isolation."""
import argparse
import http.client
import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import urllib.request

REPO=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(REPO/'ops/ubuntu'))
import verify

cli=argparse.ArgumentParser(description=__doc__)
cli.add_argument('--root',type=Path,default=Path('/home/jiheon/.local/share/money-station/frontend'))
cli.add_argument('--output',type=Path,required=True)
a=cli.parse_args();root=a.root.absolute()
if a.output.exists():raise SystemExit('Choose a new output report')
spec=importlib.util.spec_from_file_location('frontend_control',root/'control.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);c=m.config(root);info=m.verify_runtime(c)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
checks=[]


def status():return json.loads((root/'run/status.json').read_text())


def ready():
    for _ in range(50):
        try:
            request=urllib.request.Request('http://127.0.0.1:3330/healthz',headers={'Host':'moneystation.site'})
            with opener.open(request,timeout=1) as r:
                if r.status==200 and r.headers['X-Money-Station-Release']==c['releaseId']:return
        except OSError:pass
        time.sleep(.2)
    raise AssertionError('Actual frontend did not become ready')


def changed_worker(previous):
    for _ in range(50):
        time.sleep(.2);current=status()
        if current['event']=='running' and current['workerPid']!=previous:ready();return
    raise AssertionError('Frontend worker did not recover')


ready();first=verify.check('http://127.0.0.1:3330',c['releaseId']);checks.append('live-static-export-28-checks')
for command in [['/usr/bin/test','!','-e','/home/jiheon'],['/usr/bin/test','!','-w','/srv/money-station/current/public/index.html']]:
    subprocess.run(m.sandbox(root,c,command),check=True)
checks+=['host-home-absent','static-export-read-only']
try:
    with opener.open('http://127.0.0.1:3330/healthz',timeout=2) as response:raise AssertionError('Wrong host was accepted')
except http.client.RemoteDisconnected:pass
checks.append('unexpected-host-rejected')
pid=m.managed_pid(root);assert pid
subprocess.run(['python3',str(root/'control.py'),'start'],capture_output=True,check=True)
assert m.managed_pid(root)==pid;checks.append('idempotent-start')
duplicate=subprocess.run(['python3',str(root/'control.py'),'run','--root',str(root)],capture_output=True,timeout=5)
assert duplicate.returncode!=0 and b'already holds the lock' in duplicate.stderr;checks.append('duplicate-supervisor-denied')
old=status()['workerPid'];os.kill(pid,signal.SIGHUP);changed_worker(old);checks.append('controlled-worker-restart')
subprocess.run(['python3',str(root/'control.py'),'stop'],capture_output=True,check=True)
assert m.managed_pid(root) is None
subprocess.run(['python3',str(root/'control.py'),'start'],capture_output=True,check=True);ready()
assert m.managed_pid(root)!=pid;checks.append('full-stop-start-and-port-handoff')
old=status()['workerPid'];assert Path('/proc',str(old)).stat().st_uid==os.getuid()
os.kill(old,signal.SIGKILL);changed_worker(old);checks.append('worker-crash-recovered')
final=verify.check('http://127.0.0.1:3330',c['releaseId']);checks.append('routes-docs-media-policy-after-recovery')
report={'format':'money-station-frontend-acceptance-v1','status':'passed','checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
        'releaseId':c['releaseId'],'sourceCommit':info['sourceCommit'],'archiveSha256':c['archiveSha256'],
        'controllerSha256':m.release.file_digest(root/'control.py'),'origin':'http://127.0.0.1:3330','host':'moneystation.site',
        'checks':checks,'before':first,'after':final,'scope':{'ownerFrontendRunning':True,'publicHttpsAccepted':False,
        'hostSystemServiceInstalled':False,'browserWalletUsdcAccepted':False}}
with a.output.open('x') as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps(report))

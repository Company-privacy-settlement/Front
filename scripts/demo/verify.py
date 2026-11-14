"""Read-only Money Station media integrity, timing, branding and full decode check."""
import hashlib
import json
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[2]
media = root / 'public/media'
manifest = json.loads((media / 'manifest.json').read_text())
assert manifest['format'] == 'money-station-media-v2'
assert manifest['brand'] == 'Money Station' and manifest['language'] == 'en'
assert len(manifest['chapters']) == 12
for entry in manifest['files']:
    p = media / entry['file']
    assert p.parent == media and not p.is_symlink()
    assert p.stat().st_size == entry['bytes'], entry['file']
    assert hashlib.sha256(p.read_bytes()).hexdigest() == entry['sha256'], entry['file']
for old, current in manifest['legacyAliases'].items():
    assert (media / old).parent == media and (media / current).parent == media
    assert (media / old).read_bytes() == (media / current).read_bytes()
previous = 0
for chapter in manifest['chapters']:
    assert abs(chapter['start'] - previous) < .001
    assert chapter['end'] > chapter['start']
    assert not re.search(r'\bCore\b|\bCORE\b',chapter['title'] + chapter['narration'])
    previous = chapter['end']
assert abs(previous - manifest['durationSeconds']) < .001
video = media / 'money-station-demo-en.mp4'
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-show_chapters','-of','json',str(video)]))
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate']) == ('h264',1920,1080,'24/1')
assert a['codec_name'] == 'aac' and abs(float(a['duration']) - manifest['durationSeconds']) < .2
assert abs(float(probe['format']['duration']) - manifest['durationSeconds']) < .2
assert probe['format']['tags']['title'].startswith('Money Station')
assert len(probe['chapters']) == len(manifest['chapters'])
for ext, separator in [('srt',','),('vtt','.')]:
    text = (media / ('money-station-demo-en.' + ext)).read_text()
    if ext == 'vtt':
        assert text.startswith('WEBVTT\n')
    assert 'Money Station' in text and not re.search(r'\bCore\b|\bCORE\b',text)
    timestamps = re.findall(r'(\d{2}):(\d{2}):(\d{2})' + re.escape(separator) + r'(\d{3})',text)
    assert len(timestamps) >= 24 and len(timestamps) % 2 == 0
    def seconds(t):
        h,m,s,ms = map(int,t)
        return h*3600+m*60+s+ms/1000
    times = list(map(seconds,timestamps))
    assert all(times[i] < times[i+1] for i in range(0,len(times),2))
    assert times[-1] <= manifest['durationSeconds']+.01
    assert all(times[i] <= times[i+1]+.001 for i in range(len(times)-1))
evidence = root.parent / 'Core' / manifest['nativeEvidence']['path']
if evidence.exists():
    assert hashlib.sha256(evidence.read_bytes()).hexdigest() == manifest['nativeEvidence']['sha256']
assert manifest['nativeEvidence']['shownInVideo'] is False
subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(video),'-f','null','-'],check=True)
print('Verified Money Station titles, four asset hashes and four aliases, 12 chapters, English captions, H.264/AAC 1920x1080/24fps and full decode.')

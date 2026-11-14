"""Read-only media integrity and decode check. Run from any directory."""
import hashlib
import json
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[2]
media = root / 'public/media'
manifest = json.loads((media / 'manifest.json').read_text())
assert manifest['language'] == 'en'
assert len(manifest['chapters']) == 12
for entry in manifest['files']:
    path = media / entry['file']
    assert path.parent == media
    assert path.stat().st_size == entry['bytes'], entry['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], entry['file']
previous = 0
for chapter in manifest['chapters']:
    assert abs(chapter['start'] - previous) < .001
    assert chapter['end'] > chapter['start']
    previous = chapter['end']
assert abs(previous - manifest['durationSeconds']) < .001
video = media / 'core-hackathon-demo-en.mp4'
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-show_chapters','-of','json',str(video)]))
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert (v['codec_name'], v['width'], v['height'], v['r_frame_rate']) == ('h264',1600,900,'24/1')
assert a['codec_name'] == 'aac' and float(a['duration']) > 170
assert abs(float(probe['format']['duration']) - manifest['durationSeconds']) < .2
assert len(probe['chapters']) == len(manifest['chapters'])
for ext, separator in [('srt', ','), ('vtt', '.')]:
    text = (media / ('core-hackathon-demo-en.' + ext)).read_text()
    if ext == 'vtt':
        assert text.startswith('WEBVTT\n')
    pattern = r'(\d{2}):(\d{2}):(\d{2})' + re.escape(separator) + r'(\d{3})'
    timestamps = re.findall(pattern, text)
    assert len(timestamps) > 24 and len(timestamps) % 2 == 0
    def seconds(t):
        h,m,s,ms = map(int,t)
        return h*3600 + m*60 + s + ms/1000
    times = list(map(seconds,timestamps))
    assert all(times[i] < times[i+1] for i in range(0,len(times),2))
    assert times[-1] <= manifest['durationSeconds'] + .01
    assert all(times[i] <= times[i+1]+.001 for i in range(len(times)-1))
evidence = root.parent / 'Core' / manifest['nativeEvidence']['path']
if evidence.exists():
    assert hashlib.sha256(evidence.read_bytes()).hexdigest() == manifest['nativeEvidence']['sha256']
else:
    print('Sibling Core absent: native evidence hash is pinned but not locally rechecked.')
subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],check=True)
print('Verified 4 asset hashes, 12 chapters, English subtitles, H.264/AAC, 1600x900/24fps and full decode.')

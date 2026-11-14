"""Render the Money Station motion film, narration, captions and public media package."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import textwrap

root = Path(__file__).resolve().parents[2]
out = Path(os.environ.get('DEMO_OUTPUT_DIR', '/tmp/money-station-demo'))
media = root / 'public/media'
media.mkdir(parents=True, exist_ok=True)
recording = json.loads((out / 'recording.json').read_text())
composition = json.loads((out / 'composition.json').read_text())
assert not recording['errors'] and not composition['errors']
duration = recording['duration']
assert abs(composition['duration'] - duration) < .01
assert composition['uiMethod'] == 'ffmpeg-overlay'
chapters = [{k: s.get(k) for k in ['id','kind','title','start','end','scope','narration']} for s in recording['scenes']]

def clock(value, ass=False):
    scale = 100 if ass else 1000
    seconds, fraction = divmod(round(value * scale), scale)
    hours, rem = divmod(seconds, 3600)
    minutes, seconds = divmod(rem, 60)
    if ass:
        return f'{hours}:{minutes:02}:{seconds:02}.{fraction:02}'
    return f'{hours:02}:{minutes:02}:{seconds:02},{fraction:03}'

# Trim the recorder's blank lead using the untouched dark top-left film pixel.
pixels = subprocess.check_output(['ffmpeg','-v','error','-threads','1','-i',composition['path'],
    '-t','10','-vf','fps=25,crop=2:2:0:0,scale=1:1','-filter_threads','1','-pix_fmt','rgb24','-f','rawvideo','-'])
lead = next(i / 25 for i in range(len(pixels) // 3)
            if pixels[i*3] < 40 and pixels[i*3+1] < 55 and pixels[i*3+2] < 40)
assert lead < 10, 'The prepared film did not become visible'
header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Scope,DejaVu Sans,16,&H0098B18F,&H000000FF,&H000C1208,&H400C1208,0,0,0,0,100,100,0,0,3,6,0,3,90,90,110,1
Style: Caption,DejaVu Sans,28,&H00EDF8F1,&H000000FF,&H0010190E,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,90,90,22,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
captions = []
audio_filters = []
args = ['ffmpeg','-y','-v','warning','-threads','2','-ss',str(lead),'-i',composition['path']]
ui = [scene for scene in recording['scenes'] if scene['kind'] == 'ui']
video_filters = ['[0:v]setpts=PTS-STARTPTS[base]']
previous = 'base'
for index, scene in enumerate(ui, 1):
    clip = next(c for c in recording['clips'] if c['id'] == scene['clip'])
    args += ['-threads','1','-ss',str(scene['videoStart']),'-i',clip['path']]
    video_filters.append(f'[{index}:v]setpts=PTS-STARTPTS,fps=24,scale=1776:844,tpad=stop_mode=clone:stop_duration=1,trim=duration={scene["duration"]},setpts=PTS+{scene["start"]}/TB[ui{index}]')
    video_filters.append(f'[{previous}][ui{index}]overlay=x=72:y=155:eof_action=pass:repeatlast=0:enable=\'gte(t,{scene["start"]})*lt(t,{scene["end"]})\'[v{index}]')
    previous = f'v{index}'

for i, s in enumerate(recording['scenes'], 1):
    args += ['-i', str(out / 'audio' / (s['id'] + '.mp3'))]
    audio_filters.append(f'[{i+len(ui)}:a]asetpts=PTS-STARTPTS,adelay={round((s["start"]+.55)*1000)}:all=1[a{i}]')
    chunks = [chunk for sentence in re.split(r'(?<=[.!?])\s+',s['narration']) for chunk in textwrap.wrap(sentence,width=95,break_long_words=False,break_on_hyphens=False)]
    total = sum(map(len,chunks)); position = s['start'] + .55
    for j, chunk in enumerate(chunks):
        end = s['start'] + .55 + s['speechDuration'] * sum(map(len,chunks[:j+1])) / total
        assert end <= s['end'] + .001
        captions.append((position,end,chunk))
        safe = chunk.replace('\\','').replace('{','').replace('}','')
        header += f'Dialogue: 0,{clock(position,True)},{clock(end,True)},Caption,,0,0,0,,{safe}\n'
        position = end
    if s.get('scope'):
        scope=s['scope'].replace('\\','').replace('{','').replace('}','')
        header += f'Dialogue: 1,{clock(s["start"],True)},{clock(s["end"],True)},Scope,,0,0,0,,{scope}\n'
(out / 'captions.ass').write_text(header)
audio_filters.append(''.join(f'[a{i}]' for i in range(1,len(chapters)+1)) +
                     f'amix=inputs={len(chapters)}:normalize=0,apad,atrim=duration={duration}[audio]')
metadata = ';FFMETADATA1\ntitle=Money Station | Private payments. Clear proof.\ncomment=English product walkthrough. Sample wallet/API; actual local proof. Synthetic narration.\n'
for s in chapters:
    metadata += f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={round(s["start"]*1000)}\nEND={round(s["end"]*1000)}\ntitle={s["title"]}\n'
(out / 'chapters.ffmeta').write_text(metadata)
video_filters.append(f'[{previous}]fps=24,ass=' + str(out / 'captions.ass') + '[picture]')
args += ['-i',str(out / 'chapters.ffmeta'),'-filter_complex_threads','1','-filter_complex',';'.join(video_filters+audio_filters),
    '-map','[picture]','-map','[audio]','-map_metadata',str(len(ui)+len(chapters)+1),'-map_chapters',str(len(ui)+len(chapters)+1),
    '-c:v','libx264','-threads','2','-preset','fast','-crf','24','-pix_fmt','yuv420p',
    '-c:a','aac','-b:a','96k','-ar','44100','-ac','1','-t',str(duration),'-movflags','+faststart',
    str(media / 'money-station-demo-en.mp4')]
subprocess.run(args,check=True)
srt = '\n'.join(f'{i}\n{clock(a)} --> {clock(b)}\n{t}\n' for i,(a,b,t) in enumerate(captions,1))
(media / 'money-station-demo-en.srt').write_text(srt)
(media / 'money-station-demo-en.vtt').write_text('WEBVTT\n\n' + re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})',r'\1.\2',srt))
shutil.copyfile(out / 'poster.png',media / 'money-station-demo-poster.png')
manifest = {'format':'money-station-media-v2','brand':'Money Station','language':'en',
    'recordedAt':'2026-11-14','durationSeconds':round(duration,3),'frontSourceBase':recording['frontSource'],
    'design':'Money Station black/green, animated headlines, actual UI and short English captions',
    'narration':{'kind':'synthetic','voice':'en-US-AriaNeural','tool':'edge-tts 7.3.1'},
    'scope':recording['scope'] + ' No public USDC, live tax/AI provider or professional approval is represented.',
    'nativeEvidence':{'repository':'Company-privacy-settlement/Core','path':'docs/evidence/testnet-wallet-2026-11-14.json',
        'sha256':'e009bd0f600b23e0fabe30064ee3211446682946126d1b341aace34b5981a681','shownInVideo':False},
    'chapters':chapters,'files':[],'legacyAliases':{},'compositionLeadSeconds':lead}
for p in [media / ('money-station-demo-en.' + ext) for ext in ['mp4','srt','vtt']] + [media / 'money-station-demo-poster.png']:
    manifest['files'].append({'file':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    old = p.name.replace('money-station-demo','core-hackathon-demo')
    shutil.copyfile(p,media / old)
    manifest['legacyAliases'][old] = p.name
(media / 'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
for repo in [root,root.parent/'Core',root.parent/'Contract']:
    if repo.exists():
        assets = repo/'docs/assets'; assets.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(out/'poster.png',assets/'hackathon-demo-poster.png')

def minutes(value):
    return f'{int(value)//60:02}:{int(value)%60:02}'

doc = '''# Money Station — English product walkthrough

[Watch MP4](../public/media/money-station-demo-en.mp4) · [Hosted player](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/media/) · [Reviewer guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/HACKATHON.md)

[![Money Station demo](assets/hackathon-demo-poster.png)](../public/media/money-station-demo-en.mp4)

## Media package

'''
doc += f'The film runs **{minutes(duration)}** at 1920 × 1080, 24 fps, with H.264/AAC, synthetic English narration, burned English captions and SRT/VTT. It follows the current black-and-green product design with animated headlines and actual application screens.\n\n'
doc += '[MP4](../public/media/money-station-demo-en.mp4) · [SRT](../public/media/money-station-demo-en.srt) · [VTT](../public/media/money-station-demo-en.vtt) · [Poster](../public/media/money-station-demo-poster.png) · [Integrity manifest](../public/media/manifest.json)\n\n'
doc += '''## Evidence scope

The invoice, checkout and payment scenes use controlled wallet/API/chain-context fixtures with a real locally generated Groth16 proof. The wallet selector is unmodified and no real wallet is authenticated or asked to sign. Receipt disclosure is local; the record is a sample. Tax preparation uses a deterministic source-bound outline in a fixture organization and requests independent review. No live AI/tax provider, public USDC payment, professional approval, filing, effective anonymity or production readiness is established.

The separately recorded native NEAR CLI run is linked from the reviewer guide. It is not depicted in this film. Existing Sites preview permissions are preserved; self-hosted access follows host configuration. Legacy media URLs deliver the same newly branded files, not the previous film.

## Chapters and transcript

'''
for s in chapters:
    doc += f'### {minutes(s["start"])} — {s["title"]}\n\n'
    if s['scope']:
        doc += f'Scope: {s["scope"]}\n\n'
    doc += s['narration']+'\n\n'
doc += '''## Verify and reproduce

```bash
python3 scripts/demo/verify.py
```

The verifier checks all canonical asset hashes, legacy aliases, chapter/subtitle coverage, embedded Money Station title, H.264/AAC, dimensions, duration, native-source pin and full decode. It does not establish on-chain finality from a recording.

Use sibling Front/Core checkouts, Node.js 22.16+, Python 3, FFmpeg with libx264/libass, Playwright Chromium, `edge-tts==7.3.1` in a separate Python environment and the existing matching development proving files. No real wallet keys or provider credentials are needed. Never replace artifacts for an existing group.

```bash
npm run build
# In a separate terminal, serve the static application:
python3 -m http.server 33539 --bind 127.0.0.1 --directory out
# With the voice virtual environment active:
DEMO_OUTPUT_DIR=/tmp/money-station-demo python scripts/demo/narrate.py
DEMO_OUTPUT_DIR=/tmp/money-station-demo node scripts/demo/record.mjs
DEMO_OUTPUT_DIR=/tmp/money-station-demo node scripts/demo/compose.mjs
DEMO_OUTPUT_DIR=/tmp/money-station-demo python3 scripts/demo/render.py
python3 scripts/demo/verify.py
```

`CORE_CHECKOUT`, `CORE_PROVER_ARTIFACTS_DIR` and `DEMO_BASE_URL` configure local capture. `DEMO_RESUME=1` reuses only completed clips with matching public narration; use it only with unchanged app/proving/fixture inputs. Start in a fresh output directory for a new source version. The compositor uses an ephemeral loopback server and closes it after recording.
'''
doc += '\n## Playback verification\n\n[Desktop and mobile browser report](evidence/money-station-media-2026-11-14.json): actual MP4 playback, chapter seeking, 26 English cues, all four canonical downloads, byte ranges, Money Station titles and a bounded 320px layout passed through local Nginx. This does not establish public HTTPS or real wallet settlement.\n'
(root/'docs/HACKATHON_DEMO.md').write_text(doc)
print(f'Money Station media ready: {duration:.2f}s; {len(chapters)} chapters; {lead:.2f}s lead removed.',flush=True)

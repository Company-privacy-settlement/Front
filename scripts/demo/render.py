"""Render recorded chapters with English narration, burned captions, SRT/VTT and hashes."""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import textwrap

root = Path(__file__).resolve().parents[2]
out = Path(os.environ.get('DEMO_OUTPUT_DIR', '/tmp/core-hackathon-demo'))
media = root / 'public/media'
media.mkdir(parents=True, exist_ok=True)
recording = json.loads((out / 'recording.json').read_text())
assert not recording['errors'], recording['errors']

def clock(value, ass=False):
    ticks = round(value * (100 if ass else 1000))
    scale = 100 if ass else 1000
    s, frac = divmod(ticks, scale)
    h, rem = divmod(s, 3600)
    m, s = divmod(rem, 60)
    return f'{h}:{m:02}:{s:02}.{frac:02}' if ass else f'{h:02}:{m:02}:{s:02},{frac:03}'

def ass_text(text):
    return text.replace('\\', '').replace('{', '').replace('}', '')

header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1600
PlayResY: 900
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Scope,DejaVu Sans,17,&H005AFFD2,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,1,0,1,0,0,7,55,55,26,1
Style: Caption,DejaVu Sans,25,&H00F2F6F2,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,70,70,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''

all_captions = []
chapters = []
position = 0.0
for ch in recording['chapters']:
    origin = ch['cues'][0]['start']
    ch['trimStart'] = origin
    ch['duration'] = ch['cues'][-1]['end'] - origin
    ch['offset'] = position
    ass = header
    for cue in ch['cues']:
        start, end = cue['start'] - origin, cue['end'] - origin
        cue['offset'] = start
        chapters.append({'id': cue['id'], 'title': cue['title'], 'start': position + start, 'end': position + end, 'scope': cue['scope'], 'narration': cue['narration']})
        ass += f'Dialogue: 0,{clock(start, True)},{clock(end, True)},Scope,,0,0,0,,{{\\pos(55,782)}}{ass_text(cue["scope"])}\n'
        chunks = textwrap.wrap(cue['narration'], width=134, break_long_words=False, break_on_hyphens=False)
        total = sum(len(c) for c in chunks)
        cursor = start
        for i, chunk in enumerate(chunks):
            next_time = start + cue['speechDuration'] * sum(len(c) for c in chunks[:i+1]) / total
            if i == len(chunks)-1:
                next_time = end
            wrapped = '\\N'.join(textwrap.wrap(chunk, width=85, break_long_words=False, break_on_hyphens=False))
            ass += f'Dialogue: 1,{clock(cursor, True)},{clock(next_time, True)},Caption,,0,0,0,,{{\\pos(800,846)}}{wrapped}\n'
            all_captions.append((position+cursor, position+next_time, chunk))
            cursor = next_time
    ch['assPath'] = str(out / (ch['id']+'.ass'))
    Path(ch['assPath']).write_text(ass)
    position += ch['duration']


def render(ch):
    target = out / (ch['id']+'.mp4')
    if os.environ.get('DEMO_REUSE_RENDERS') == '1' and target.exists():
        return target
    args = ['ffmpeg','-y','-v','warning','-threads','2','-ss',str(ch['trimStart']),'-t',str(ch['duration']),'-i',ch['path']]
    for cue in ch['cues']:
        args += ['-i',str(out/'audio'/(cue['id']+'.mp3'))]
    filters=[]
    for i,cue in enumerate(ch['cues'],1):
        filters.append(f'[{i}:a]asetpts=PTS-STARTPTS,adelay={round(cue["offset"]*1000)}:all=1[a{i}]')
    filters.append(''.join(f'[a{i}]' for i in range(1,len(ch['cues'])+1))+f'amix=inputs={len(ch["cues"])}:normalize=0,apad,atrim=duration={ch["duration"]}[audio]')
    args += ['-filter_complex', ';'.join(filters),'-map','0:v','-map','[audio]', '-vf',f"fps=24,pad=1600:900:0:0:color=0x0c100d,ass={ch['assPath']}",'-c:v','libx264','-threads','2','-filter_threads','1','-preset','fast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','44100','-ac','1','-t',str(ch['duration']),'-movflags','+faststart',str(target)]
    subprocess.run(args, check=True)
    print('Rendered',ch['id'],flush=True)
    return target

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    paths=list(pool.map(render,recording['chapters']))
concat=out/'concat.txt'
concat.write_text(''.join("file '"+str(p)+"'\n" for p in paths))
metadata=';FFMETADATA1\ntitle=Core | English Hackathon Demo\ncomment=Labelled browser fixtures, real local proofs and recorded native CLI testnet evidence. Synthetic English narration.\n'
for ch in chapters:
    metadata += f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={round(ch["start"]*1000)}\nEND={round(ch["end"]*1000)}\ntitle={ch["title"]}\n'
(out/'chapters.ffmeta').write_text(metadata)
video=media/'core-hackathon-demo-en.mp4'
subprocess.run(['ffmpeg','-y','-v','warning','-f','concat','-safe','0','-i',str(concat),'-i',str(out/'chapters.ffmeta'),'-map_metadata','1','-map_chapters','1','-c:v','copy','-c:a','aac','-b:a','96k','-af','aresample=async=1:first_pts=0','-movflags','+faststart',str(video)],check=True)
srt='\n'.join(f'{i}\n{clock(a)} --> {clock(b)}\n'+ '\n'.join(textwrap.wrap(t,85))+'\n' for i,(a,b,t) in enumerate(all_captions,1))
(media/'core-hackathon-demo-en.srt').write_text(srt)
(media/'core-hackathon-demo-en.vtt').write_text('WEBVTT\n\n'+re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})', r'\1.\2', srt))
shutil.copyfile(out/'poster.png',media/'core-hackathon-demo-poster.png')
for repo in [root,root.parent/'Core',root.parent/'Contract']:
    assets=repo/'docs/assets'
    assets.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(out/'poster.png',assets/'hackathon-demo-poster.png')
manifest={'format':'core-hackathon-media-v1','language':'en','recordedAt':'2026-11-14','durationSeconds':round(position,3),'narration':{'kind':'synthetic','voice':'en-US-AriaNeural','tool':'edge-tts 7.3.1'},'scope':'Labelled browser wallet/API fixtures; actual local Groth16 proof; deterministic tax outline; separately recorded public native NEAR CLI testnet evidence. No live browser-wallet USDC, AI-provider or professional approval claim.','nativeEvidence':{'repository':'Company-privacy-settlement/Core','path':'docs/evidence/testnet-wallet-2026-11-14.json','sha256':'e009bd0f600b23e0fabe30064ee3211446682946126d1b341aace34b5981a681'},'chapters':chapters,'files':[]}
for p in [video,media/'core-hackathon-demo-en.srt',media/'core-hackathon-demo-en.vtt',media/'core-hackathon-demo-poster.png']:
    manifest['files'].append({'file':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(media/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('Media complete:',round(position,2),'seconds;',video.stat().st_size,'bytes',flush=True)

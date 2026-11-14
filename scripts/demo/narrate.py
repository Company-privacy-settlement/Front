"""Generate synthetic English narration from the public storyboard (edge-tts 7.3.1)."""
import asyncio
import json
import os
from pathlib import Path
import edge_tts

root = Path(__file__).resolve().parents[2]
out = Path(os.environ.get('DEMO_OUTPUT_DIR', '/tmp/core-hackathon-demo'))
scenes = json.loads((root / 'scripts/demo/storyboard.en.json').read_text())
(out / 'audio').mkdir(parents=True, exist_ok=True)

async def main():
    sem = asyncio.Semaphore(2)
    async def make(scene):
        async with sem:
            await edge_tts.Communicate(scene['narration'], 'en-US-AriaNeural', rate='-2%').save(
                str(out / 'audio' / (scene['id'] + '.mp3')))
            print(scene['id'], flush=True)
    await asyncio.gather(*(make(scene) for scene in scenes))

asyncio.run(main())

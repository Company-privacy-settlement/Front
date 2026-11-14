"""Generate short synthetic English narration; only public storyboard text is sent."""
import asyncio
import json
import os
from pathlib import Path
import edge_tts

root = Path(__file__).resolve().parents[2]
out = Path(os.environ.get('DEMO_OUTPUT_DIR', '/tmp/money-station-demo'))
scenes = json.loads((root / 'scripts/demo/storyboard.en.json').read_text())
(out / 'audio').mkdir(parents=True, exist_ok=True)
async def main():
    semaphore = asyncio.Semaphore(2)
    async def make(scene):
        async with semaphore:
            path = out / 'audio' / (scene['id'] + '.mp3')
            if os.environ.get('DEMO_REUSE_AUDIO') != '1' or not path.exists():
                await edge_tts.Communicate(scene['narration'], 'en-US-AriaNeural', rate='+2%').save(str(path))
            print('Narration:', scene['id'], flush=True)
    await asyncio.gather(*(make(scene) for scene in scenes))
asyncio.run(main())

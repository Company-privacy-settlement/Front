"use client";
import type { ChangeEvent } from 'react';
import type { ProvingAssets } from '@/vendor/core-client/index.js';
type Asset = 'manifest' | 'wasm' | 'zkey' | 'verificationKey';
export type ProvingFileSelection = Partial<Record<Asset, File>>;
const definitions: { key: Asset; label: string; limit: number }[] = [
  { key: 'manifest', label: 'Proving manifest JSON', limit: 8192 },
  { key: 'wasm', label: 'Circuit WASM file', limit: 8 * 1024 * 1024 },
  { key: 'zkey', label: 'Proving key file', limit: 16 * 1024 * 1024 },
  { key: 'verificationKey', label: 'Verification key JSON', limit: 16384 },
];
export function provingFilesReady(files: ProvingFileSelection, hash: string) { return definitions.every(d => !!files[d.key]) && /^[a-f0-9]{64}$/.test(hash); }
export function provingAssets(files: ProvingFileSelection, hash: string): ProvingAssets {
  if (!provingFilesReady(files, hash)) throw new Error('Select all four proving files and an independently obtained manifest SHA-256');
  return { manifest: files.manifest!, wasm: files.wasm!, zkey: files.zkey!, verificationKey: files.verificationKey!, manifestSha256: hash };
}
export function ProvingFilesFields({ files, hash, disabled, onFiles, onHash, onError }: {
  files: ProvingFileSelection; hash: string; disabled: boolean;
  onFiles(files: ProvingFileSelection): void; onHash(hash: string): void; onError(message: string): void;
}) {
  function select(event: ChangeEvent<HTMLInputElement>, definition: typeof definitions[number]) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || file.size < 1 || file.size > definition.limit) {
      onFiles({ ...files, [definition.key]: undefined }); onError(`Choose a file no larger than ${Math.round(definition.limit / 1024)} KB`); return;
    }
    onFiles({ ...files, [definition.key]: file });
  }
  return <>
    <label className="form-label">Trusted proving manifest SHA-256<input value={hash} maxLength={64} disabled={disabled} placeholder="64 lowercase hexadecimal characters" onChange={e => onHash(e.target.value)}/></label>
    {definitions.map(entry => <label className="form-label" key={entry.key}>{entry.label}<input type="file" disabled={disabled} onChange={e => select(e, entry)}/>{files[entry.key] && <span className="prover-filename">{files[entry.key]!.name}</span>}</label>)}
  </>;
}

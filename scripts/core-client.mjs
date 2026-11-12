import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const dest = resolve("src/vendor/core-client"),
  sync = process.argv[2] === "sync",
  source = sync ? resolve(process.argv[3] ?? "../Core/dist/client") : dest;
const manifest = JSON.parse(
  readFileSync(resolve(source, "manifest.json"), "utf8"),
);
if (manifest.format !== "core-browser-client-v1")
  throw new Error("Unsupported browser client manifest");
for (const [file, hash] of Object.entries(manifest.files)) {
  if (!/^[a-z-]+\.(?:js|d\.ts)$/.test(file))
    throw new Error("Invalid client filename");
  const content = readFileSync(resolve(source, file));
  if (createHash("sha256").update(content).digest("hex") !== hash)
    throw new Error(`Browser client checksum mismatch: ${file}`);
}
if (!manifest.files["index.js"] || !manifest.files["index.d.ts"])
  throw new Error("Missing client entry");
if (sync) {
  mkdirSync(dest, { recursive: true });
  for (const file of [...Object.keys(manifest.files), "manifest.json"])
    copyFileSync(resolve(source, file), resolve(dest, file));
}
for (const file of readdirSync(dest))
  if (file !== "manifest.json" && !Object.hasOwn(manifest.files, file))
    throw new Error(`Untracked browser client artifact: ${file}`);
console.log(
  sync
    ? "Core browser client synchronized and verified"
    : "Core browser client checksums verified",
);

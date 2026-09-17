/**
 * Compress raster images with the Tinify API and convert them to AVIF.
 *
 * Usage:
 *   pnpm convert-images:avif -- --dry-run
 *   pnpm convert-images:avif
 *   pnpm convert-images:avif -- --replace
 *   pnpm convert-images:avif -- --limit 20 --concurrency 2
 *
 * New car photos (inbox → public/images as .avif):
 *   1. Drop JPG/PNG/WebP into public/images/_incoming/
 *   2. pnpm convert-car-images
 *   3. Use the new /images/….avif paths in cars.ts
 *
 * Never touches public/frame, public/frames, or public/mobile-frames.
 *
 * TINIFY_API_KEY must be set in `.env` / `.env.local` (gitignored — never commit it).
 */
import { config as loadEnv } from "dotenv";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import tinify from "tinify";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DIR = join(ROOT, "public");
const MANIFEST_PATH = join(ROOT, "scripts", "image-avif-manifest.json");

const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const SKIP_FRAME_DIRS = new Set(["frame", "frames", "mobile-frames", "_incoming"]);
const SKIP_FRAME_PREFIXES = ["public/frame/", "public/frames/", "public/mobile-frames/"];
const INCOMING_DIR = join(ROOT, "public", "images", "_incoming");
const CAR_IMAGES_DIR = join(ROOT, "public", "images");
const REF_ROOTS = ["src", "messages", "scripts", "public"];
const REF_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".txt",
]);

type ManifestEntry = {
  from: string;
  to: string;
  bytesIn: number;
  bytesOut: number;
  savedPct: number;
  at: string;
};

function parseArgs(argv: string[]) {
  const flags = new Set<string>();
  const opts: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--") || arg === "--") continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      opts[key] = next;
      i++;
    } else {
      flags.add(key);
    }
  }
  const replace = flags.has("replace");
  const carInbox = flags.has("car-inbox");
  return {
    dryRun: flags.has("dry-run"),
    force: flags.has("force"),
    deleteOriginals: replace || flags.has("delete-originals") || carInbox,
    updateRefs: replace || flags.has("update-refs"),
    dir: carInbox ? INCOMING_DIR : opts.dir ? join(ROOT, opts.dir) : DEFAULT_DIR,
    outDir: carInbox
      ? CAR_IMAGES_DIR
      : opts["out-dir"]
        ? join(ROOT, opts["out-dir"])
        : null,
    limit: opts.limit ? Number(opts.limit) : Infinity,
    concurrency: Math.max(1, Number(opts.concurrency ?? 2)),
  };
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function toPosix(p: string) {
  return p.split("\\").join("/");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_FRAME_DIRS.has(name)) continue;
      walkFiles(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function isFramePath(rel: string) {
  return SKIP_FRAME_PREFIXES.some((prefix) => rel.startsWith(prefix));
}

function destPath(src: string, outDir: string | null) {
  const ext = extname(src);
  const avifName = src.slice(0, -ext.length).split(/[/\\]/).pop() + ".avif";
  if (outDir) return join(outDir, avifName);
  return src.slice(0, -ext.length) + ".avif";
}

function loadManifest(): ManifestEntry[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as ManifestEntry[];
  } catch {
    return [];
  }
}

function collectRefFiles(): string[] {
  const files: string[] = [];
  for (const rootName of REF_ROOTS) {
    const dir = join(ROOT, rootName);
    if (!existsSync(dir)) continue;
    for (const file of walkFiles(dir)) {
      if (!REF_EXTS.has(extname(file).toLowerCase())) continue;
      const rel = toPosix(relative(ROOT, file));
      if (rel === "scripts/convert-images-avif.ts") continue;
      if (rel === "scripts/image-avif-manifest.json") continue;
      files.push(file);
    }
  }
  return files;
}

function publicUrl(rel: string) {
  return "/" + rel.replace(/^public\//, "");
}

function updateReferences(pairs: { from: string; to: string }[]) {
  if (pairs.length === 0) return 0;
  const replacements = pairs.flatMap(({ from, to }) => {
    if (from === to) return [];
    const fromUrl = publicUrl(from);
    const toUrl = publicUrl(to);
    return [
      [fromUrl, toUrl],
      [fromUrl.slice(1), toUrl.slice(1)],
      [encodeURI(fromUrl), encodeURI(toUrl)],
    ] as const;
  });

  let filesChanged = 0;
  for (const file of collectRefFiles()) {
    let text = readFileSync(file, "utf8");
    const next = replacements.reduce((acc, [from, to]) => acc.split(from).join(to), text);
    if (next !== text) {
      writeFileSync(file, next);
      filesChanged++;
    }
  }
  return filesChanged;
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const index = i++;
      await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

async function convertOne(src: string, dest: string) {
  const converted = tinify.fromFile(src).convert({ type: "image/avif" });
  const tmp = dest + ".tmp";
  await mkdir(dirname(dest), { recursive: true });
  await converted.toFile(tmp);
  await rename(tmp, dest);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = process.env.TINIFY_API_KEY?.trim();
  if (!key) {
    throw new Error("TINIFY_API_KEY is missing. Add it to .env (do not commit the key).");
  }
  tinify.key = key;

  if (!args.dryRun) {
    await tinify.validate();
  }

  const used = tinify.compressionCount ?? 0;
  console.log(`Tinify compressions used this month: ${used}`);

  if (!existsSync(args.dir)) {
    if (args.dir === INCOMING_DIR) {
      await mkdir(INCOMING_DIR, { recursive: true });
      console.log(`Created ${toPosix(relative(ROOT, INCOMING_DIR))}. Drop car photos there, then re-run.`);
      return;
    }
    throw new Error(`Directory not found: ${args.dir}`);
  }

  const rasterInDir = walkFiles(args.dir).filter((file) =>
    RASTER_EXTS.has(extname(file).toLowerCase())
  );

  const queued: { src: string; dest: string; rel: string; destRel: string; bytes: number }[] = [];
  let skippedExisting = 0;

  for (const src of rasterInDir) {
    const rel = toPosix(relative(ROOT, src));
    if (isFramePath(rel)) continue;
    const dest = destPath(src, args.outDir);
    const destRel = toPosix(relative(ROOT, dest));
    const alreadyAvif = extname(src).toLowerCase() === ".avif";
    if (!args.force && !alreadyAvif && existsSync(dest) && statSync(dest).size > 0) {
      skippedExisting++;
      continue;
    }
    queued.push({ src, dest, rel, destRel, bytes: statSync(src).size });
    if (queued.length >= args.limit) break;
  }

  const totalBytes = queued.reduce((sum, item) => sum + item.bytes, 0);
  console.log(
    `\nFound ${queued.length} image(s) to convert (${formatBytes(totalBytes)}). ` +
      `Skipped existing AVIF: ${skippedExisting}. Frame sequences are excluded.`
  );

  if (args.dryRun) {
    for (const item of queued.slice(0, 30)) {
      console.log(`  ${item.rel}  ${formatBytes(item.bytes)}  ->  ${item.destRel}`);
    }
    if (queued.length > 30) console.log(`  … ${queued.length - 30} more`);
    console.log("\nDry run only. Re-run without --dry-run to convert.");
    return;
  }

  const completed: ManifestEntry[] = [];
  let ok = 0;
  let failed = 0;
  let saved = 0;
  let stop = false;

  await mapPool(queued, args.concurrency, async (item, index) => {
    if (stop) return;
    const n = `${index + 1}/${queued.length}`;
    try {
      await convertOne(item.src, item.dest);
      const outBytes = statSync(item.dest).size;
      const savedPct = item.bytes === 0 ? 0 : Math.round((1 - outBytes / item.bytes) * 100);
      saved += item.bytes - outBytes;
      ok++;
      console.log(
        `[${n}] ${item.rel}  ${formatBytes(item.bytes)} → ${formatBytes(outBytes)} (${savedPct}%)`
      );
      completed.push({
        from: item.rel,
        to: item.destRel,
        bytesIn: item.bytes,
        bytesOut: outBytes,
        savedPct,
        at: new Date().toISOString(),
      });
      if (args.deleteOriginals && item.src !== item.dest) {
        unlinkSync(item.src);
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${n}] FAILED ${item.rel}: ${message}`);
      if (/limit|too many|account/i.test(message)) {
        stop = true;
        throw err;
      }
    }
  });

  const manifest = [...loadManifest(), ...completed];
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  if (args.updateRefs) {
    const filesChanged = updateReferences(completed.map(({ from, to }) => ({ from, to })));
    console.log(`Updated image paths in ${filesChanged} file(s).`);
  }

  console.log(
    `\nDone. Converted ${ok}, failed ${failed}. ` +
      `Saved ${formatBytes(Math.max(0, saved))}. ` +
      `Tinify count now: ${tinify.compressionCount ?? used}. ` +
      `Manifest: ${toPosix(relative(ROOT, MANIFEST_PATH))}`
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

// Imports the apartment, common-area and wellness photos from the source folder
// into public/images, resized and re-encoded with sharp.
//
//   node scripts/import-photos.mjs [sourceDir] [--manifest out.json]
//
// Source names follow `app{N}-{room}[-{n}]-{NN}[-scarta|-main].jpg` (and the
// `comune-…`, `wellness-…` variants). Files marked `-scarta` are skipped, the
// `-main` file leads its room, rooms follow ROOM_ORDER and the numbering inside
// a room is the source numbering. Output per photo, all with the long side
// capped: `{NN}-{room}.jpg` (2000px, q82), `{NN}-{room}.webp` (2000px) and
// `{NN}-{room}-thumb.webp` (800px) for grids and cards.

import sharp from 'sharp';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const manifestFlag = args.indexOf('--manifest');
const manifestPath = manifestFlag >= 0 ? args[manifestFlag + 1] : null;
const SRC = args.find((a, i) => !a.startsWith('--') && i !== manifestFlag + 1) ?? path.join(os.homedir(), 'Desktop', 'originali');
const OUT = path.resolve('public/images');

const LONG_SIDE = 2000;
const THUMB_SIDE = 800;
const JPG_QUALITY = 82;
const WEBP_QUALITY = 80;
const THUMB_QUALITY = 78;
const CONCURRENCY = 3;

/** Room order inside a gallery; unknown rooms follow, alphabetically. */
const ROOM_ORDER = [
  'salone', 'cucina', 'camera', 'camera-2', 'bagno', 'bagno-2', 'ingresso',
  'balcone-terrazzo', 'cabina-armadio', 'lavatrice', 'dettaglio',
  // wellness
  'palestra', 'bagno-turco',
  // common areas
  'garage-esterno', 'ingresso-esterno-palazzo', 'esterni-strada', 'corridoio-scala-b',
  'pianerottolo-insegna', 'pianerottolo-porta-ingresso',
];

/** Source group -> output folder under public/images. */
const GROUP_DIR = group => (group.startsWith('app') ? `apartments/${group}` : group === 'comune' ? 'common' : group);

const NAME_RE = /^(app\d|comune|wellness)-([a-z-]+?)(?:-(\d))?-(\d{2})(-scarta|-main)?\.(jpe?g|webp)$/i;

function parse(file) {
  const m = NAME_RE.exec(file);
  if (!m) return null;
  const [, group, roomBase, roomIndex, num, flag] = m;
  // `bagno-1` becomes `bagno`, `bagno-2` stays.
  const room = roomIndex && roomIndex !== '1' ? `${roomBase}-${roomIndex}` : roomBase;
  return { file, group: group.toLowerCase(), room, num: Number(num), main: flag === '-main', skip: flag === '-scarta' };
}

function roomRank(room) {
  const i = ROOM_ORDER.indexOf(room);
  return i === -1 ? ROOM_ORDER.length : i;
}

async function plan() {
  const files = (await readdir(SRC)).filter(f => !f.startsWith('.'));
  const parsed = files.map(parse);
  const unknown = files.filter((f, i) => !parsed[i]);
  const skipped = parsed.filter(p => p && p.skip).map(p => p.file);
  const kept = parsed.filter(p => p && !p.skip);

  const groups = new Map();
  for (const p of kept) {
    if (!groups.has(p.group)) groups.set(p.group, []);
    groups.get(p.group).push(p);
  }

  const jobs = [];
  for (const [group, items] of [...groups].sort()) {
    items.sort((a, b) =>
      roomRank(a.room) - roomRank(b.room) ||
      a.room.localeCompare(b.room) ||
      Number(b.main) - Number(a.main) ||
      a.num - b.num,
    );
    items.forEach((p, i) => {
      const nn = String(i + 1).padStart(2, '0');
      const dir = GROUP_DIR(group);
      jobs.push({
        group,
        room: p.room,
        main: p.main,
        source: p.file,
        base: `${nn}-${p.room}`,
        dir,
        src: `/images/${dir}/${nn}-${p.room}.jpg`,
        webp: `/images/${dir}/${nn}-${p.room}.webp`,
        thumb: `/images/${dir}/${nn}-${p.room}-thumb.webp`,
      });
    });
  }
  return { jobs, skipped, unknown };
}

async function processJob(job) {
  const input = sharp(path.join(SRC, job.source)).rotate();
  const meta = await input.metadata();
  const outDir = path.join(OUT, job.dir);
  const fit = { fit: 'inside', withoutEnlargement: true };

  await input.clone().resize({ width: LONG_SIDE, height: LONG_SIDE, ...fit })
    .jpeg({ quality: JPG_QUALITY, mozjpeg: true, progressive: true })
    .toFile(path.join(outDir, `${job.base}.jpg`));
  await input.clone().resize({ width: LONG_SIDE, height: LONG_SIDE, ...fit })
    .webp({ quality: WEBP_QUALITY })
    .toFile(path.join(outDir, `${job.base}.webp`));
  const thumbInfo = await input.clone().resize({ width: THUMB_SIDE, height: THUMB_SIDE, ...fit })
    .webp({ quality: THUMB_QUALITY })
    .toFile(path.join(outDir, `${job.base}-thumb.webp`));

  // Orientation-corrected source size, for the record and for aspect checks.
  const swap = (meta.orientation ?? 1) >= 5;
  return { ...job, sourceWidth: swap ? meta.height : meta.width, sourceHeight: swap ? meta.width : meta.height, thumbWidth: thumbInfo.width, thumbHeight: thumbInfo.height };
}

async function main() {
  const { jobs, skipped, unknown } = await plan();

  // Fresh output folders so a re-run never leaves stale files behind.
  for (const dir of new Set(jobs.map(j => j.dir))) {
    await rm(path.join(OUT, dir), { recursive: true, force: true });
    await mkdir(path.join(OUT, dir), { recursive: true });
  }

  const results = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      results.push(await processJob(job));
      process.stdout.write(`  ${job.group}/${job.base}  <-  ${job.source}\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  results.sort((a, b) => a.group.localeCompare(b.group) || a.base.localeCompare(b.base));

  console.log(`\n${results.length} photos written under ${OUT}`);
  if (skipped.length) console.log(`${skipped.length} skipped (-scarta): ${skipped.join(', ')}`);
  if (unknown.length) console.log(`${unknown.length} unrecognised names: ${unknown.join(', ')}`);

  if (manifestPath) {
    await writeFile(manifestPath, JSON.stringify(results, null, 2));
    console.log(`manifest: ${manifestPath}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

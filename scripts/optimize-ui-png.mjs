import sharp from "sharp";
import fs from "fs";
import path from "path";
const DIR = "public/assets/shutterbug-ui/";
// Caps chosen from how large each asset is ever DRAWN, with ~1.5x headroom for
// retina. Nothing here is displayed above ~900px.
const cap = (file) => file.includes("/avatar/") ? 420
  : /open-blank|desk-wood|atlas-paper|airmail|leather|map-ink|instruction-ribbon|mr-o-/.test(file) ? 1200
  : 700; // props, icons, stamps, markers, compass, logo…
async function walk(d) {
  let out = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out = out.concat(await walk(p));
    else if (/\.png$/i.test(e.name)) out.push(p);
  }
  return out;
}
const files = await walk(DIR);
let before = 0, after = 0, resized = 0;
for (const f of files) {
  const b = fs.statSync(f).size; before += b;
  const m = await sharp(f).metadata();
  const c = cap(f.replace(/\\/g, "/"));
  const buf = await sharp(f)
    .resize({ width: c, height: c, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  if (buf.length < b) { fs.writeFileSync(f, buf); if (Math.max(m.width, m.height) > c) resized++; }
  after += fs.statSync(f).size;
}
console.log(`files: ${files.length}  resized: ${resized}`);
console.log(`before: ${(before/1048576).toFixed(1)} MB  →  after: ${(after/1048576).toFixed(1)} MB  (${(100*(1-after/before)).toFixed(0)}% smaller)`);

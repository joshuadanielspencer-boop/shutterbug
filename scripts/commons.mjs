// ===========================================================================
// commons.mjs — search Wikimedia Commons and VERIFY a file's licence.
//
// Project rule 2: nothing ships unless it's checked. For culture photos that
// means the licence, the author and the description come from Commons' own API,
// never from memory — a plausible-looking filename that doesn't exist, or a
// non-free file, is exactly the kind of error that's invisible until someone
// else notices.
//
//   node scripts/commons.mjs search "Ndebele traditional dress"
//   node scripts/commons.mjs verify "File:Foo.jpg" ["File:Bar.jpg" ...]
// ===========================================================================
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Shutterbug-educational-game/1.0 (homeschool geography game; contact via repo)";

const call = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  return res.json();
};

// Licences the game accepts: public domain or a CC licence with no NC/ND clause.
// (Same rule the photo test enforces.)
const FREE = /^(CC BY( |-)|CC BY-SA|CC0|Public domain|PD)/i;
const isFree = (lic) => FREE.test(lic || "") && !/NC|ND/i.test(lic || "");

const strip = (html) => (html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

export async function search(query, limit = 12) {
  const r = await call({
    action: "query", generator: "search", gsrnamespace: "6",
    gsrsearch: query, gsrlimit: String(limit),
    prop: "imageinfo", iiprop: "extmetadata|url|size", iiurlwidth: "800",
  });
  return Object.values(r.query?.pages || {}).map(toRecord);
}

export async function verify(titles) {
  const r = await call({
    action: "query", titles: titles.join("|"),
    prop: "imageinfo", iiprop: "extmetadata|url|size", iiurlwidth: "800",
  });
  const pages = Object.values(r.query?.pages || {});
  return pages.map((p) => (p.missing !== undefined
    ? { title: p.title, missing: true }
    : toRecord(p)));
}

function toRecord(p) {
  const ii = p.imageinfo?.[0] || {};
  const m = ii.extmetadata || {};
  const license = strip(m.LicenseShortName?.value);
  return {
    title: p.title,
    license,
    free: isFree(license),
    credit: strip(m.Artist?.value) || strip(m.Credit?.value),
    description: strip(m.ImageDescription?.value).slice(0, 220),
    width: ii.width, height: ii.height,
    landscape: ii.width > ii.height,
    // The exact two URLs the data file needs.
    src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.title.replace(/^File:/, "").replace(/ /g, "_"))}?width=800`,
    source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
  };
}

// Files in a Commons category. Far more reliable than free-text search for
// "photos of X people" — the category IS the human-curated answer to that.
export async function category(name, limit = 25) {
  const r = await call({
    action: "query", generator: "categorymembers",
    gcmtitle: name.startsWith("Category:") ? name : `Category:${name}`,
    gcmtype: "file", gcmlimit: String(limit),
    prop: "imageinfo", iiprop: "extmetadata|url|size", iiurlwidth: "800",
  });
  return Object.values(r.query?.pages || {}).map(toRecord);
}

// ---- CLI ------------------------------------------------------------------
const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "search" || cmd === "verify" || cmd === "cat") {
  const out = cmd === "search" ? await search(rest.join(" "))
    : cmd === "cat" ? await category(rest.join(" "))
    : await verify(rest);
  for (const r of out) {
    if (r.missing) { console.log(`\n✗ ${r.title} — DOES NOT EXIST`); continue; }
    console.log(`\n${r.free ? "✓" : "✗"} ${r.title}`);
    console.log(`   licence: ${r.license}${r.free ? "" : "   ← NOT usable"}`);
    console.log(`   credit : ${r.credit}`);
    console.log(`   size   : ${r.width}x${r.height} ${r.landscape ? "(landscape)" : "(PORTRAIT)"}`);
    console.log(`   desc   : ${r.description}`);
    if (cmd === "verify" && r.free) {
      console.log(`   src    : ${r.src}`);
      console.log(`   source : ${r.source}`);
    }
  }
}

// ===========================================================================
// Cross-device passport sync (Supabase).
//
// LOCAL-FIRST, and that is the whole architecture. `localStorage` remains the only
// read path: `profiles.js` stays synchronous, every one of its ~25 exported functions
// keeps its signature, and no call site in the 6,345-line component changes. Sync is a
// background reconciliation that runs beside the game, never in front of it.
//
// The alternative — awaiting cloud reads — would turn all of profiles.js async and
// touch call sites throughout the component. It would also be wrong for an offline-
// capable PWA: the game has to work on a plane.
//
// INERT UNTIL CONFIGURED. With no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the whole
// module short-circuits and the game behaves exactly as it does today. The client
// library is loaded by dynamic import so an unconfigured build doesn't ship it either.
//
// The anon key is PUBLIC by design — it goes in the built JavaScript, and every real
// guarantee lives in the row-level security policies in supabase/migrations/. The
// service_role key must never appear in this repo or in any client bundle.
// ===========================================================================
import { mergePassports } from "./passport-merge.js";
import { readStore, writeStore } from "./profiles.js";

const URL_ = import.meta.env?.VITE_SUPABASE_URL || "";
const KEY_ = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";
const HOUSEHOLD_KEY = "shutterbug.household";

export const syncConfigured = () => !!(URL_ && KEY_);

let clientPromise = null;
async function client() {
  if (!syncConfigured()) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(URL_, KEY_, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      // Anonymous auth: a device gets a durable identity with no email, no password
      // and nothing for a child to fill in. Households are what tie identities
      // together — see join_household() in the migration.
      const { data } = await sb.auth.getSession();
      if (!data?.session) await sb.auth.signInAnonymously();
      return sb;
    })().catch((e) => { clientPromise = null; throw e; });
  }
  return clientPromise;
}

export const householdId = () => {
  try { return localStorage.getItem(HOUSEHOLD_KEY) || null; } catch { return null; }
};
const setHousehold = (id) => { try { localStorage.setItem(HOUSEHOLD_KEY, id); } catch { /* ignore */ } };

// Create a household and return the code a parent types into the second device.
export async function createHousehold() {
  const sb = await client();
  if (!sb) return { ok: false, error: "Sync isn't set up in this build." };
  const { data, error } = await sb.rpc("create_household");
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.household_id) return { ok: false, error: "Couldn't create the household." };
  setHousehold(row.household_id);
  return { ok: true, code: row.join_code, householdId: row.household_id };
}

export async function joinHousehold(code) {
  const sb = await client();
  if (!sb) return { ok: false, error: "Sync isn't set up in this build." };
  const { data, error } = await sb.rpc("join_household", { code: String(code || "").trim() });
  if (error) return { ok: false, error: error.message === "no such code" ? "That code didn't match a household." : error.message };
  setHousehold(data);
  return { ok: true, householdId: data };
}

// The whole of sync, in one pass:
//   pull everything the household has  ->  merge field-wise with what's on this
//   device  ->  write the merged result back locally  ->  push anything that changed.
//
// Merge is conflict-free (see passport-merge.js), so this is safe to run at any time,
// in any order, on any number of devices, and safe to retry after a failure. It never
// throws into the caller: sync failing must never stop a child playing.
export async function syncNow() {
  if (!syncConfigured()) return { ok: false, skipped: "not configured" };
  const hid = householdId();
  if (!hid) return { ok: false, skipped: "no household" };
  try {
    const sb = await client();
    if (!sb) return { ok: false, skipped: "no client" };

    const { data: rows, error } = await sb
      .from("passports").select("traveler_name, blob, updated_at").eq("household_id", hid);
    if (error) return { ok: false, error: error.message };

    const store = readStore();
    const local = store.profiles || {};
    const remote = {};
    for (const r of rows || []) if (r?.blob && r.traveler_name) remote[r.traveler_name] = r.blob;

    const merged = {};
    const names = new Set([...Object.keys(local), ...Object.keys(remote)]);
    for (const n of names) merged[n] = mergePassports(local[n], remote[n]);

    store.profiles = merged;
    writeStore(store);

    // Push only what the remote doesn't already equal. JSON comparison is crude but
    // this is a handful of small objects, and it keeps a quiet device from writing
    // rows (and bumping updated_at) on every heartbeat.
    const ups = [];
    for (const n of names) {
      const m = merged[n];
      if (!m) continue;
      if (remote[n] && JSON.stringify(remote[n]) === JSON.stringify(m)) continue;
      ups.push({
        household_id: hid,
        traveler_name: n,
        blob: m,
        best_score: Math.max(0, ...Object.values(m.best || {}).filter((v) => typeof v === "number")),
        best_rank: m.bestMeta ? (Object.values(m.bestMeta)[0] || {}).rank || null : null,
        updated_at: new Date().toISOString(),
      });
    }
    if (ups.length) {
      const { error: upErr } = await sb.from("passports").upsert(ups, { onConflict: "household_id,traveler_name" });
      if (upErr) return { ok: false, error: upErr.message };
    }
    return { ok: true, pulled: Object.keys(remote).length, pushed: ups.length };
  } catch (e) {
    // Offline, project paused, DNS, anything: the game carries on from localStorage.
    return { ok: false, error: String(e?.message || e) };
  }
}

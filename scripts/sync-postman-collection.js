/**
 * Sync local postman_collection.json to Postman Cloud via Postman API.
 *
 * One-time setup:
 * 1. Postman → Settings → API Keys → Generate key
 * 2. Add to .env:
 *      POSTMAN_API_KEY=your_key_here
 *      POSTMAN_WORKSPACE_ID=optional_workspace_id
 * 3. Run: npm run postman:sync
 *
 * After first sync, collection UID is saved in .postman-sync.json
 * and future updates happen automatically (no manual import).
 *
 * Auto watch:
 *   npm run postman:watch
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const COLLECTION_PATH = path.join(ROOT, "postman_collection.json");
const SYNC_STATE_PATH = path.join(ROOT, ".postman-sync.json");

const API_KEY = process.env.POSTMAN_API_KEY;
const WORKSPACE_ID = process.env.POSTMAN_WORKSPACE_ID;
const ENV_COLLECTION_UID = process.env.POSTMAN_COLLECTION_UID;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveSyncState(state) {
  fs.writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2));
}

function loadSyncState() {
  if (!fs.existsSync(SYNC_STATE_PATH)) return null;
  try {
    return loadJson(SYNC_STATE_PATH);
  } catch {
    return null;
  }
}

function getCollectionUid() {
  return ENV_COLLECTION_UID || loadSyncState()?.collectionUid || null;
}

async function postmanRequest(method, endpoint, body) {
  const response = await fetch(`https://api.getpostman.com${endpoint}`, {
    method,
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      data?.raw ||
      `Postman API error (${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function createCollection(collection) {
  const payload = { collection };

  if (WORKSPACE_ID) {
    return postmanRequest(
      "POST",
      `/collections?workspace=${WORKSPACE_ID}`,
      payload,
    );
  }

  return postmanRequest("POST", "/collections", payload);
}

async function updateCollection(collectionUid, collection) {
  return postmanRequest("PUT", `/collections/${collectionUid}`, {
    collection,
  });
}

async function syncCollection() {
  if (!API_KEY) {
    console.error("\nMissing POSTMAN_API_KEY in .env");
    console.error("Get one from: https://go.postman.co/settings/me/api-keys");
    console.error("Then add to ahmedalhajjj-server/.env:");
    console.error("POSTMAN_API_KEY=your_key_here\n");
    process.exit(1);
  }

  if (!fs.existsSync(COLLECTION_PATH)) {
    console.error(`Collection file not found: ${COLLECTION_PATH}`);
    console.error("Run: npm run postman:generate");
    process.exit(1);
  }

  const collection = loadJson(COLLECTION_PATH);
  // Postman API generates its own UID on create — local export id can break sync
  if (collection.info && collection.info._postman_id) {
    delete collection.info._postman_id;
  }

  const existingUid = getCollectionUid();

  if (existingUid) {
    console.log(`Updating Postman collection: ${existingUid}`);
    const result = await updateCollection(existingUid, collection);
    const uid = result?.collection?.uid || existingUid;
    saveSyncState({
      collectionUid: uid,
      collectionName: collection.info?.name,
      lastSyncedAt: new Date().toISOString(),
    });
    console.log(`Synced successfully: ${collection.info?.name}`);
    console.log(`Open Postman app → Collections (same account as API key)`);
    return uid;
  }

  console.log("Creating new Postman cloud collection...");
  const result = await createCollection(collection);
  const uid = result?.collection?.uid;

  if (!uid) {
    throw new Error("Postman did not return a collection UID.");
  }

  saveSyncState({
    collectionUid: uid,
    collectionName: collection.info?.name,
    lastSyncedAt: new Date().toISOString(),
  });

  console.log(`Created & synced: ${collection.info?.name}`);
  console.log(`Collection UID: ${uid}`);
  console.log("Saved to .postman-sync.json — next syncs will update automatically.");
  console.log("Open Postman desktop/web (same account) to see the collection.");

  return uid;
}

function startWatch() {
  console.log(`Watching ${COLLECTION_PATH}`);
  console.log("Save the file to auto-sync to Postman. Press Ctrl+C to stop.\n");

  let timer = null;
  let syncing = false;

  const runSync = async () => {
    if (syncing) return;
    syncing = true;
    try {
      await syncCollection();
      console.log(`[${new Date().toLocaleTimeString()}] Auto-sync complete\n`);
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Sync failed: ${error.message}\n`);
    } finally {
      syncing = false;
    }
  };

  fs.watch(COLLECTION_PATH, { persistent: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(runSync, 800);
  });
}

async function main() {
  const watchMode = process.argv.includes("--watch");

  if (watchMode) {
    await syncCollection();
    startWatch();
    return;
  }

  await syncCollection();
}

module.exports = { syncCollection, startWatch };

if (require.main === module) {
  main().catch((error) => {
    console.error("Postman sync failed:", error.message);
    process.exit(1);
  });
}

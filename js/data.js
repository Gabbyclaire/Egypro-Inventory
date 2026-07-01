/* ============================================================
   data.js — Inventory Data Store  (v3.0 — MySQL backed)
   ▸ Talks to backend API at http://localhost:4000/api/...
   ▸ Keeps an in-memory cache so getAll/query/stats stay sync
   ▸ add/update/remove are now async — app.js must await them
   ============================================================ */

const store = (() => {

  const API = 'http://localhost:4000/api';

  const KEY_PROFILE = 'egypro_profile';
  const KEY_THEME    = 'egypro_theme';
  const KEY_IMPORTS  = 'egypro_imports';

  const PROFILE_DEFAULT = {
    name:     'Gabby',
    initials: 'G',
    role:     'IT Attaché',
    org:      'Egypro ',
    email:    'g.kariuki@egypro.co.ke',
    phone:    '+254 700 000 000',
    joined:   '2025-01-15',
  };

  /* ---- IN-MEMORY CACHE (populated by init() from MySQL) ---- */
  let _assets    = [];
  let _cctvs     = [];
  let _doorCards = [];

  /* ================================================================
     INIT — call this once on app boot, BEFORE first render()
     Usage: await store.init();
  ================================================================ */
  async function init() {
    try {
      const [a, c, d] = await Promise.all([
        fetch(`${API}/assets`).then(r => r.json()),
        fetch(`${API}/cctvs`).then(r => r.json()),
        fetch(`${API}/door-cards`).then(r => r.json()),
      ]);
      _assets    = a;
      _cctvs     = c;
      _doorCards = d;
      return { success: true };
    } catch (err) {
      console.error('[store.init] Could not reach backend:', err.message);
      _assets = []; _cctvs = []; _doorCards = [];
      return { success: false, error: err.message };
    }
  }

  /* ================================================================
     ASSETS CRUD
  ================================================================ */
  function getAll()    { return [..._assets]; }
  function getById(id) { return _assets.find(a => a.id === id) || null; }

  async function add(item) {
    const res = await fetch(`${API}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const saved = await res.json();
    _assets.push(saved);
    return saved;
  }

  async function update(id, patch) {
    await fetch(`${API}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    _assets = _assets.map(a => a.id === id ? { ...a, ...patch } : a);
  }

  async function remove(id) {
    await fetch(`${API}/assets/${id}`, { method: 'DELETE' });
    _assets = _assets.filter(a => a.id !== id);
  }

  async function resetToDefaults() {
    // With MySQL as source of truth, "reset" just re-pulls from the DB
    await init();
  }

  /* ---- filter / search (unchanged — reads local cache) ---- */
  function query({ cat, status, manufacturer, os, dept, search }) {
    return _assets.filter(a => {
      if (cat  && cat  !== 'all' && a.cat  !== cat)  return false;
      if (dept && dept !== 'all' && a.dept !== dept)  return false;
      if (status && status !== 'all' && a.status !== status) return false;
      if (manufacturer && manufacturer !== 'all' && a.manufacturer !== manufacturer) return false;
      if (os && os !== 'all' && a.os !== os) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [a.user, a.code, a.hostname, a.model, a.serial, a.manufacturer, a.collected, a.dept]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  /* ---- stats (unchanged — reads local cache) ---- */
  function stats() {
    const all = _assets;
    return {
      total:   all.length,
      ok:      all.filter(a => a.status === 'OK').length,
      warn:    all.filter(a => a.status === 'Needs attention').length,
      decomm:  all.filter(a => a.status === 'Decommissioned').length,
      cats:    [...new Set(all.map(a => a.cat))].length,
      cctvTotal:    _cctvs.length,
      cctvOnline:   _cctvs.filter(c => c.status === 'Online').length,
      doorTotal:    _doorCards.length,
      doorActive:   _doorCards.filter(c => c.status === 'Active').length,
      byCat: Object.fromEntries(
        ['Desktop','Laptop','DataCentre','Printer','Network']
          .map(c => [c, all.filter(a => a.cat === c).length])
      ),
      byDept: {
        Huawei: all.filter(a => a.dept === 'Huawei').length,
        'ATC BRANCH': all.filter(a => a.dept === 'ATC BRANCH').length,
      },
    };
  }

  /* ================================================================
     CCTV CRUD
  ================================================================ */
  function getAllCCTVs()     { return [..._cctvs]; }
  function getCCTVById(id)   { return _cctvs.find(c => c.id === id) || null; }

  async function addCCTV(item) {
    const res = await fetch(`${API}/cctvs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const saved = await res.json();
    _cctvs.push(saved);
    return saved;
  }

  async function updateCCTV(id, patch) {
    await fetch(`${API}/cctvs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    _cctvs = _cctvs.map(c => c.id === id ? { ...c, ...patch } : c);
  }

  async function removeCCTV(id) {
    await fetch(`${API}/cctvs/${id}`, { method: 'DELETE' });
    _cctvs = _cctvs.filter(c => c.id !== id);
  }

  /* ================================================================
     DOOR ACCESS CARDS CRUD
  ================================================================ */
  function getAllDoorCards()   { return [..._doorCards]; }
  function getDoorCardById(id) { return _doorCards.find(c => c.id === id) || null; }

  async function addDoorCard(item) {
    const res = await fetch(`${API}/door-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const saved = await res.json();
    _doorCards.push(saved);
    return saved;
  }

  async function updateDoorCard(id, patch) {
    await fetch(`${API}/door-cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    _doorCards = _doorCards.map(c => c.id === id ? { ...c, ...patch } : c);
  }

  async function removeDoorCard(id) {
    await fetch(`${API}/door-cards/${id}`, { method: 'DELETE' });
    _doorCards = _doorCards.filter(c => c.id !== id);
  }

  /* ================================================================
     THEME & PROFILE — still local (per-device preference, fine as-is)
  ================================================================ */
  function getTheme()  { return localStorage.getItem(KEY_THEME) || 'light'; }
  function setTheme(t) { localStorage.setItem(KEY_THEME, t); document.documentElement.setAttribute('data-theme', t); }

  function loadProfile() {
    try { const r = localStorage.getItem(KEY_PROFILE); return r ? { ...PROFILE_DEFAULT, ...JSON.parse(r) } : { ...PROFILE_DEFAULT }; }
    catch { return { ...PROFILE_DEFAULT }; }
  }
  function saveProfile(p) { localStorage.setItem(KEY_PROFILE, JSON.stringify(p)); }

  let _profile = loadProfile();
  function getProfile()     { return { ..._profile }; }
  function updateProfile(p) { _profile = { ..._profile, ...p }; saveProfile(_profile); }

  /* ================================================================
     AD SYNC — unchanged, still a stub pointed at the agent endpoint
  ================================================================ */
  const AD_SYNC_URL = 'http://localhost:4000/ad/snapshot';

  async function syncFromAD() {
    try {
      const res = await fetch(AD_SYNC_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Agent returned ${res.status}`);
      const data = await res.json();
      let merged = 0;
      for (const adObj of (data.computers || [])) {
        const existing = _assets.find(a =>
          (a.hostname || '').toLowerCase() === (adObj.hostname || '').toLowerCase() ||
          a.serial === adObj.serial
        );
        if (existing) {
          await update(existing.id, {
            hostname: adObj.hostname   || existing.hostname,
            user:     adObj.user       || existing.user,
            dept:     adObj.department || existing.dept,
            os:       adObj.os         || existing.os,
          });
          merged++;
        }
      }
      return { success: true, merged, total: (data.computers || []).length };
    } catch (err) {
      console.warn('[AD Sync] Could not reach sync agent:', err.message);
      return { success: false, error: err.message };
    }
  }

  /* ================================================================
     IMPORTS TRACKING — still local (just a log of what you imported)
  ================================================================ */
  function loadImports() {
    try { const r = localStorage.getItem(KEY_IMPORTS); return r ? JSON.parse(r) : []; } catch { return []; }
  }
  function saveImports(arr) { localStorage.setItem(KEY_IMPORTS, JSON.stringify(arr)); }

  let _imports = loadImports();

  function recordImport(fileName, count, type = 'asset') {
    _imports.push({ fileName, date: new Date().toISOString(), count, type });
    saveImports(_imports);
  }
  function getImports() { return [..._imports]; }

  async function deleteImport(fileName) {
    const toRemoveAssets = _assets.filter(a => a.sourceFile === fileName);
    const toRemoveCCTVs  = _cctvs.filter(c => c.sourceFile === fileName);
    const toRemoveDoors  = _doorCards.filter(c => c.sourceFile === fileName);
    for (const a of toRemoveAssets) await remove(a.id);
    for (const c of toRemoveCCTVs)  await removeCCTV(c.id);
    for (const d of toRemoveDoors)  await removeDoorCard(d.id);
    _imports = _imports.filter(i => i.fileName !== fileName);
    saveImports(_imports);
  }

  return {
    init,
    /* Assets */
    getAll, getById, add, update, remove, resetToDefaults, query, stats,
    /* CCTVs */
    getAllCCTVs, getCCTVById, addCCTV, updateCCTV, removeCCTV,
    /* Door Cards */
    getAllDoorCards, getDoorCardById, addDoorCard, updateDoorCard, removeDoorCard,
    /* Theme / Profile */
    getTheme, setTheme, getProfile, updateProfile,
    /* AD Sync */
    syncFromAD,
    /* Imports */
    recordImport, getImports, deleteImport,
  };
})();
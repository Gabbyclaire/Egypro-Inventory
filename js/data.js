/* ============================================================
   data.js — Inventory Data Store  (v2.0)
   ▸ Edit ASSETS / CCTVS / DOOR_CARDS arrays to pre-load data
   ▸ New: CCTVs store, Door Access Cards store, Dept/Project view
   ▸ All CRUD operations live here — app.js just calls store.*
   ============================================================ */

const store = (() => {

  /* ================================================================
     DEFAULT ASSETS  (general inventory)
     cat values: Desktop | Laptop | DataCentre | Printer | Network | CCTV
  ================================================================ */
  const DEFAULT_ASSETS = [
    { id:1,  cat:'Desktop',    dept:'',       user:'Reception',       code:'EGPROD01', hostname:'ESYPROD01',   manufacturer:'DELL',   model:'OptiPlex 7040',        cpu:3.4, ram:16,  hdd:500,  serial:'72TXVB2',   os:'MS WIN 11 Pro', office:'Microsoft 365', av:'Norton 360',  status:'OK',              collected:'Everlyn Kariuki', vendor:'Leverage', notes:'' },
    { id:2,  cat:'Desktop',    dept:'',       user:'Fiber NOC',       code:'EGPROD02', hostname:'EGPROD02',    manufacturer:'DELL',   model:'OptiPlex 5040',        cpu:3.4, ram:20,  hdd:500,  serial:'4HS2D82',   os:'MS WIN 11 Pro', office:'',              av:'',            status:'OK',              collected:'',                vendor:'',         notes:'' },
    { id:3,  cat:'Desktop',    dept:'',       user:'Sattelcom NOC MK',code:'EGPROD03', hostname:'EGPROD03',    manufacturer:'DELL',   model:'OptiPlex 7050',        cpu:3.4, ram:16,  hdd:512,  serial:'FSP8LN2',   os:'MS WIN 11 Pro', office:'',              av:'',            status:'Needs attention', collected:'',                vendor:'',         notes:'Slow boot — check HDD' },
    { id:4,  cat:'Desktop',    dept:'',       user:'Fiber Dispatch',  code:'EGPROD04', hostname:'EGPROD04',    manufacturer:'DELL',   model:'OptiPlex 7050',        cpu:3.4, ram:16,  hdd:512,  serial:'4JBWXK2',   os:'MS WIN 11 Pro', office:'',              av:'',            status:'OK',              collected:'',                vendor:'',         notes:'' },
    { id:5,  cat:'Desktop',    dept:'',       user:'Finance',         code:'EGPROD05', hostname:'EGPROD05',    manufacturer:'DELL',   model:'OptiPlex 5090',        cpu:3.0, ram:16,  hdd:512,  serial:'FN5090A',   os:'MS WIN 11 Pro', office:'Microsoft 365', av:'',            status:'Needs attention', collected:'',                vendor:'',         notes:'AV licence expired' },
    { id:6,  cat:'Laptop',     dept:'Huawei', user:'Huawei Lead',     code:'LTPROD01', hostname:'LT-HW01',     manufacturer:'Lenovo', model:'ThinkPad X1 Carbon',   cpu:2.8, ram:16,  hdd:512,  serial:'LN29X1C',   os:'MS WIN 11 Pro', office:'Microsoft 365', av:'Norton 360',  status:'OK',              collected:'IT Dept',         vendor:'Leverage', notes:'' },
    { id:7,  cat:'Laptop',     dept:'Huawei', user:'Huawei Engineer', code:'LTPROD02', hostname:'LT-HW02',     manufacturer:'HP',     model:'EliteBook 840 G8',     cpu:2.4, ram:8,   hdd:256,  serial:'HP84E002',  os:'MS WIN 10 Pro', office:'',              av:'',            status:'OK',              collected:'IT Dept',         vendor:'',         notes:'' },
    { id:8,  cat:'Laptop',     dept:'ABS',    user:'ABS Manager',     code:'LTPROD03', hostname:'LT-ABS01',    manufacturer:'Lenovo', model:'ThinkPad E14',         cpu:2.6, ram:8,   hdd:256,  serial:'LNE14003',  os:'MS WIN 11 Pro', office:'Microsoft 365', av:'',            status:'Decommissioned',  collected:'',                vendor:'',         notes:'Screen cracked — awaiting replacement' },
    { id:9,  cat:'DataCentre', dept:'',       user:'Server Room',     code:'SVPROD01', hostname:'SV-MAIN',     manufacturer:'DELL',   model:'PowerEdge R740',       cpu:3.0, ram:64,  hdd:4000, serial:'SVDL001',   os:'Ubuntu 22 LTS', office:'',              av:'ClamAV',      status:'OK',              collected:'IT Dept',         vendor:'Leverage', notes:'' },
    { id:10, cat:'Printer',    dept:'',       user:'Admin Block',     code:'PRPROD01', hostname:'PR-ADMIN',    manufacturer:'HP',     model:'LaserJet Pro M404dn',  cpu:0,   ram:0,   hdd:0,    serial:'HPLJ4004',  os:'',              office:'',              av:'',            status:'OK',              collected:'IT Dept',         vendor:'',         notes:'' },
    { id:11, cat:'Network',    dept:'',       user:'Server Room',     code:'NWPROD01', hostname:'SW-CORE',     manufacturer:'Cisco',  model:'Catalyst 2960X-48FPD', cpu:0,   ram:0,   hdd:0,    serial:'CSC29X01',  os:'IOS 15.2',      office:'',              av:'',            status:'OK',              collected:'IT Dept',         vendor:'Leverage', notes:'' },
    { id:12, cat:'Network',    dept:'',       user:'NOC Room',        code:'NWPROD02', hostname:'FW-NOC',      manufacturer:'Cisco',  model:'ASA 5506-X',           cpu:0,   ram:0,   hdd:0,    serial:'CSC5506N',  os:'ASA 9.12',      office:'',              av:'',            status:'Needs attention', collected:'IT Dept',         vendor:'',         notes:'Firmware update pending' },
  ];

  /* ================================================================
     DEFAULT CCTVS
     Fields: id, location, ipAddress, model, status, notes
     (Minimal for now — extend as needed)
  ================================================================ */
  const DEFAULT_CCTVS = [
    { id:1, location:'Main Entrance',  ipAddress:'192.168.1.101', model:'Hikvision DS-2CD2143G2-I', status:'Online',  notes:'' },
    { id:2, location:'Server Room',    ipAddress:'192.168.1.102', model:'Dahua IPC-HDW2831T-AS',   status:'Online',  notes:'' },
    { id:3, location:'Parking Bay',    ipAddress:'192.168.1.103', model:'Hikvision DS-2CD2T47G2-L', status:'Offline', notes:'Cable fault — pending repair' },
  ];

  /* ================================================================
     DEFAULT DOOR ACCESS CARDS
     Fields: id, name, department, doorGroup (zones), status
  ================================================================ */
  const DEFAULT_DOOR_CARDS = [
    { id:1, name:'Everlyn Kariuki',  department:'Administration', doorGroup:'Main Entrance, Admin Block',        status:'Active' },
    { id:2, name:'John Mwangi',      department:'IT',             doorGroup:'Main Entrance, Server Room, NOC',   status:'Active' },
    { id:3, name:'Amina Hassan',     department:'Finance',        doorGroup:'Main Entrance, Finance Office',     status:'Active' },
    { id:4, name:'Peter Otieno',     department:'Fiber NOC',      doorGroup:'Main Entrance, NOC Room',           status:'Suspended' },
    { id:5, name:'Grace Wanjiku',    department:'Huawei Project', doorGroup:'Main Entrance, Huawei Lab',         status:'Active' },
  ];

  /* ---- LOCAL STORAGE KEYS ---- */
  const KEY_ASSETS     = 'egypro_assets';
  const KEY_CCTVS      = 'egypro_cctvs';
  const KEY_DOOR_CARDS = 'egypro_door_cards';
  const KEY_PROFILE    = 'egypro_profile';
  const KEY_THEME      = 'egypro_theme';
  const KEY_NEXTID     = 'egypro_nextid';
  const KEY_NEXTID_CC  = 'egypro_nextid_cc';
  const KEY_NEXTID_DC  = 'egypro_nextid_dc';

  const PROFILE_DEFAULT = {
    name:     'Gabby',
    initials: 'G',
    role:     'IT Attaché',
    org:      'Egypro Communications',
    email:    'g.kariuki@egypro.co.ke',
    phone:    '+254 700 000 000',
    joined:   '2025-01-15',
  };

  /* ---- LOAD / SAVE ---- */
  function loadAssets() {
    try { const r = localStorage.getItem(KEY_ASSETS);     return r ? JSON.parse(r) : [...DEFAULT_ASSETS];     } catch { return [...DEFAULT_ASSETS]; }
  }
  function loadCCTVs() {
    try { const r = localStorage.getItem(KEY_CCTVS);      return r ? JSON.parse(r) : [...DEFAULT_CCTVS];      } catch { return [...DEFAULT_CCTVS]; }
  }
  function loadDoorCards() {
    try { const r = localStorage.getItem(KEY_DOOR_CARDS); return r ? JSON.parse(r) : [...DEFAULT_DOOR_CARDS]; } catch { return [...DEFAULT_DOOR_CARDS]; }
  }
  function saveAssets(arr)    { localStorage.setItem(KEY_ASSETS,     JSON.stringify(arr)); }
  function saveCCTVs(arr)     { localStorage.setItem(KEY_CCTVS,      JSON.stringify(arr)); }
  function saveDoorCards(arr) { localStorage.setItem(KEY_DOOR_CARDS, JSON.stringify(arr)); }

  function loadProfile() {
    try { const r = localStorage.getItem(KEY_PROFILE); return r ? { ...PROFILE_DEFAULT, ...JSON.parse(r) } : { ...PROFILE_DEFAULT }; }
    catch { return { ...PROFILE_DEFAULT }; }
  }
  function saveProfile(p) { localStorage.setItem(KEY_PROFILE, JSON.stringify(p)); }

  function nextId(key = KEY_NEXTID) {
    const n = parseInt(localStorage.getItem(key) || '100') + 1;
    localStorage.setItem(key, String(n));
    return n;
  }

  /* ================================================================
     ASSETS CRUD
  ================================================================ */
  let _assets    = loadAssets();
  let _cctvs     = loadCCTVs();
  let _doorCards = loadDoorCards();

  function getAll()    { return [..._assets]; }
  function getById(id) { return _assets.find(a => a.id === id) || null; }

  function add(item) {
    const a = { ...item, id: nextId(KEY_NEXTID) };
    _assets.push(a);
    saveAssets(_assets);
    return a;
  }

  function update(id, patch) {
    _assets = _assets.map(a => a.id === id ? { ...a, ...patch } : a);
    saveAssets(_assets);
  }

  function remove(id) {
    _assets = _assets.filter(a => a.id !== id);
    saveAssets(_assets);
  }

  function resetToDefaults() {
    _assets    = [...DEFAULT_ASSETS];
    _cctvs     = [...DEFAULT_CCTVS];
    _doorCards = [...DEFAULT_DOOR_CARDS];
    saveAssets(_assets);
    saveCCTVs(_cctvs);
    saveDoorCards(_doorCards);
  }

  /* ---- filter / search ---- */
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

  /* ---- stats ---- */
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
        ABS:    all.filter(a => a.dept === 'ABS').length,
      },
    };
  }

  /* ================================================================
     CCTV CRUD
  ================================================================ */
  function getAllCCTVs()      { return [..._cctvs]; }
  function getCCTVById(id)   { return _cctvs.find(c => c.id === id) || null; }

  function addCCTV(item) {
    const c = { ...item, id: nextId(KEY_NEXTID_CC) };
    _cctvs.push(c);
    saveCCTVs(_cctvs);
    return c;
  }

  function updateCCTV(id, patch) {
    _cctvs = _cctvs.map(c => c.id === id ? { ...c, ...patch } : c);
    saveCCTVs(_cctvs);
  }

  function removeCCTV(id) {
    _cctvs = _cctvs.filter(c => c.id !== id);
    saveCCTVs(_cctvs);
  }

  /* ================================================================
     DOOR ACCESS CARDS CRUD
  ================================================================ */
  function getAllDoorCards()      { return [..._doorCards]; }
  function getDoorCardById(id)   { return _doorCards.find(c => c.id === id) || null; }

  function addDoorCard(item) {
    const c = { ...item, id: nextId(KEY_NEXTID_DC) };
    _doorCards.push(c);
    saveDoorCards(_doorCards);
    return c;
  }

  function updateDoorCard(id, patch) {
    _doorCards = _doorCards.map(c => c.id === id ? { ...c, ...patch } : c);
    saveDoorCards(_doorCards);
  }

  function removeDoorCard(id) {
    _doorCards = _doorCards.filter(c => c.id !== id);
    saveDoorCards(_doorCards);
  }

  /* ================================================================
     THEME & PROFILE
  ================================================================ */
  function getTheme()    { return localStorage.getItem(KEY_THEME) || 'light'; }
  function setTheme(t)   { localStorage.setItem(KEY_THEME, t); document.documentElement.setAttribute('data-theme', t); }

  let _profile = loadProfile();
  function getProfile()     { return { ..._profile }; }
  function updateProfile(p) { _profile = { ..._profile, ...p }; saveProfile(_profile); }

  /* ================================================================
     AD SYNC  — Stub ready for connection to your domain controller.
     See /ad-sync/README.md for setup instructions.

     When connected, this function will:
       1. POST to your local sync agent at AD_SYNC_URL
       2. Receive updated user/computer objects from Active Directory
       3. Merge them into _assets (matching by hostname or serial)

     Usage: store.syncFromAD()
  ================================================================ */
  const AD_SYNC_URL = 'http://localhost:4000/ad/snapshot'; // agent runs locally

  async function syncFromAD() {
    try {
      const res = await fetch(AD_SYNC_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Agent returned ${res.status}`);
      const data = await res.json();
      // data.computers → array of { hostname, department, user, os, serial, ... }
      let merged = 0;
      (data.computers || []).forEach(adObj => {
        const existing = _assets.find(a =>
          a.hostname.toLowerCase() === (adObj.hostname || '').toLowerCase() ||
          a.serial   === adObj.serial
        );
        if (existing) {
          store.update(existing.id, {
            hostname: adObj.hostname   || existing.hostname,
            user:     adObj.user       || existing.user,
            dept:     adObj.department || existing.dept,
            os:       adObj.os         || existing.os,
          });
          merged++;
        }
      });
      return { success: true, merged, total: (data.computers || []).length };
    } catch (err) {
      console.warn('[AD Sync] Could not reach sync agent:', err.message);
      return { success: false, error: err.message };
    }
  }

  /* ================================================================
     IMPORTS TRACKING — Track which assets were imported from which files
  ================================================================ */
  const KEY_IMPORTS = 'egypro_imports';

  function loadImports() {
    try { const r = localStorage.getItem(KEY_IMPORTS); return r ? JSON.parse(r) : []; } catch { return []; }
  }
  function saveImports(arr) { localStorage.setItem(KEY_IMPORTS, JSON.stringify(arr)); }

  let _imports = loadImports();

  function recordImport(fileName, count, type = 'asset') {
    _imports.push({
      fileName: fileName,
      date: new Date().toISOString(),
      count: count,
      type: type
    });
    saveImports(_imports);
  }

  function getImports() {
    return [..._imports];
  }

  function deleteImport(fileName) {
    _assets = _assets.filter(a => a.sourceFile !== fileName);
    _cctvs = _cctvs.filter(c => c.sourceFile !== fileName);
    _doorCards = _doorCards.filter(c => c.sourceFile !== fileName);
    _imports = _imports.filter(i => i.fileName !== fileName);
    saveAssets(_assets);
    saveCCTVs(_cctvs);
    saveDoorCards(_doorCards);
    saveImports(_imports);
  }

  return {
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
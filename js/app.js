/* ============================================================
   app.js — Main Application Logic  (v2.0)
   ▸ Pages: inventory | dept | cctv | door | profile | settings
   ▸ Categories: Desktop | Laptop | DataCentre | Printer | Network
   ▸ New: CCTV view, Door Access Cards view, Dept/Project view
   ▸ New: AD Sync trigger in Settings
   ============================================================ */

/* ---- STATE ---- */
const state = {
  page:       'inventory',   // 'inventory' | 'dept' | 'cctv' | 'door' | 'profile' | 'settings'
  cat:        'all',
  dept:       'all',         // 'all' | 'Huawei' | 'ABS'
  status:     'all',
  mfr:        'all',
  os:         'all',
  search:     '',
  pageNum:    0,
  pageSize:   200,
  sortCol:    'hostname',
  sortAsc:    true,
  exportOpen: false,
};

const CATS = [
  { id:'all',        label:'All Assets',   icon:'📦' },
  { id:'Desktop',    label:'Desktops',     icon:'🖥️' },
  { id:'Laptop',     label:'Laptops',      icon:'💻' },
  { id:'DataCentre', label:'Data Centre',  icon:'🖧'  },
  { id:'Printer',    label:'Printers',     icon:'🖨️' },
  { id:'Network',    label:'Network',      icon:'🔌' },
];

/* ---- BOOT ---- */
function boot() {
  store.setTheme(store.getTheme());
  render();
  document.addEventListener('click', onDocClick);
}

/* ---- GLOBAL CLICK (close menus) ---- */
function onDocClick(e) {
  if (!e.target.closest('#export-btn-wrap')) {
    state.exportOpen = false;
    const m = document.getElementById('export-menu');
    if (m) m.classList.add('hidden');
  }
}

/* ---- TOAST ---- */
function toast(msg, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  el.innerHTML = `<span style="font-size:15px">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '.2s';
    setTimeout(() => el.remove(), 200);
  }, duration);
}
window.toast = toast;

/* ---- MAIN RENDER ---- */
function render() {
  const profile = store.getProfile();
  document.getElementById('app').innerHTML = appHTML(profile);
  bindEvents();
}

function appHTML(profile) {
  const stats = store.stats();
  return `
  <div class="shell">
    ${sidebarHTML(stats, profile)}
    <div class="main">
      ${topbarHTML(profile)}
      <div class="page-content" id="page-content">
        ${state.page === 'inventory' ? inventoryHTML(stats)
        : state.page === 'dept'      ? deptHTML(stats)
        : state.page === 'cctv'      ? cctvHTML(stats)
        : state.page === 'door'      ? doorHTML(stats)
        : state.page === 'profile'   ? profileHTML(profile)
        :                              settingsHTML() }
      </div>
    </div>
  </div>
  <div id="toast-wrap" class="toast-wrap"></div>
  <div id="modal-overlay" class="overlay hidden"></div>
  `;
}

/* ---- SIDEBAR ---- */
function sidebarHTML(stats, profile) {
  const navItem = (id, label, icon, badge, page = 'inventory', extraonclick = '') => {
    const isActive = page === 'inventory'
      ? (state.cat === id && state.page === 'inventory')
      : state.page === page;
    return `
    <button class="sidebar-item ${isActive ? 'active' : ''}"
            onclick="${extraonce(id, page)}">
      <span class="icon">${icon}</span>
      <span>${label}</span>
      ${badge !== undefined ? `<span class="sidebar-badge">${badge}</span>` : ''}
    </button>`;
  };

  function extraonce(id, page) {
    if (page === 'inventory') return `setCat('${id}')`;
    if (page === 'dept')      return `setDeptPage('${id}')`;
    return `setPage('${page}')`;
  }

  return `
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <img src="img/egypro-logo.jpeg" alt="Egypro" style="width:36px;height:36px;object-fit:contain" onerror="this.style.display='none'" onload="this.nextElementSibling.style.display='none'">
        <span>💻</span>
      </div>
      <div>
        <div class="sidebar-logo-text">IT Inventory</div>
        <div class="sidebar-logo-sub">Egypro</div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Asset Categories</div>
      ${navItem('all',        'All Assets',  '📦', stats.total)}
      ${navItem('Desktop',    'Desktops',    '🖥️', stats.byCat.Desktop)}
      ${navItem('Laptop',     'Laptops',     '💻', stats.byCat.Laptop)}
      ${navItem('DataCentre', 'Data Centre', '🖧',  stats.byCat.DataCentre)}
      ${navItem('Printer',    'Printers',    '🖨️', stats.byCat.Printer)}
      ${navItem('Network',    'Network',     '🔌', stats.byCat.Network)}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Security & Access</div>
      <button class="sidebar-item ${state.page==='cctv'?'active':''}" onclick="setPage('cctv')">
        <span class="icon">📷</span>
        <span>CCTVs</span>
        <span class="sidebar-badge">${stats.cctvTotal}</span>
      </button>
      <button class="sidebar-item ${state.page==='door'?'active':''}" onclick="setPage('door')">
        <span class="icon">🪪</span>
        <span>Door Access Cards</span>
        <span class="sidebar-badge">${stats.doorTotal}</span>
      </button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Department / Project</div>
      <button class="sidebar-item ${state.page==='dept'&&state.dept==='Huawei'?'active':''}"
              onclick="setDeptPage('Huawei')">
        <span class="icon">🏢</span>
        <span>Huawei</span>
        <span class="sidebar-badge">${stats.byDept.Huawei}</span>
      </button>
      <button class="sidebar-item ${state.page==='dept'&&state.dept==='ABS'?'active':''}"
              onclick="setDeptPage('ABS')">
        <span class="icon">🏢</span>
        <span>ABS</span>
        <span class="sidebar-badge">${stats.byDept.ABS}</span>
      </button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Statuses</div>
      ${statusNavItem('all',             'All Statuses',    '⬜')}
      ${statusNavItem('OK',              'Active (OK)',      '🟢')}
      ${statusNavItem('Needs attention', 'Needs Attention', '🟡')}
      ${statusNavItem('Decommissioned',  'Decommissioned',  '🔴')}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Menu</div>
      <button class="sidebar-item ${state.page==='profile'?'active':''}" onclick="setPage('profile')">
        <span class="icon">👤</span><span>My Profile</span>
      </button>
      <button class="sidebar-item ${state.page==='settings'?'active':''}" onclick="setPage('settings')">
        <span class="icon">⚙️</span><span>Settings</span>
      </button>
    </div>

    <div class="sidebar-footer">
      <button class="sidebar-item" onclick="setPage('profile')" style="width:100%">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">${profile.initials}</div>
        <div style="overflow:hidden">
          <div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${profile.name}</div>
          <div style="font-size:11px;color:var(--text-secondary)">${profile.role}</div>
        </div>
      </button>
    </div>
  </nav>`;
}

function statusNavItem(id, label, icon) {
  const active = state.status === id && ['inventory','dept'].includes(state.page);
  return `
    <button class="sidebar-item ${active?'active':''}" onclick="setStatus('${id}')">
      <span class="icon" style="font-size:13px">${icon}</span>
      <span>${label}</span>
    </button>`;
}

/* ---- TOPBAR ---- */
function topbarHTML(profile) {
  const titles = {
    inventory: 'Asset Inventory',
    dept:      `Department / Project — ${state.dept === 'all' ? 'All' : state.dept}`,
    cctv:      'CCTV Cameras',
    door:      'Door Access Cards',
    profile:   'My Profile',
    settings:  'Settings',
  };
  const showAssetBtn = ['inventory','dept'].includes(state.page);
  const showCCTVBtn  = state.page === 'cctv';
  const showDoorBtn  = state.page === 'door';

  return `
  <header class="topbar">
    <div>
      <div class="topbar-title">${titles[state.page]}</div>
    </div>
    <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
      ${showAssetBtn ? `
      <div style="position:relative" id="export-btn-wrap">
        <button class="topbar-btn" onclick="openImportDialog()">Import</button>
        <input id="import-file-input" type="file" accept=".csv,.xlsx,.xls" style="display:none" onchange="handleImportFile(event)">
        <button class="topbar-btn" id="export-toggle-btn" onclick="toggleExportMenu(event)">
          ↓ Export
        </button>
        <div id="export-menu" class="export-menu ${state.exportOpen?'':'hidden'}">
          <button class="export-item" onclick="doExport('csv')"><span class="icon">📄</span> Export CSV</button>
          <button class="export-item" onclick="doExport('json')"><span class="icon">📋</span> Export JSON</button>
          <button class="export-item" onclick="doExport('txt')"><span class="icon">📝</span> Export TXT</button>
          <button class="export-item" onclick="doExport('png')"><span class="icon">🖼️</span> Save as PNG</button>
          <button class="export-item" onclick="doExport('print')"><span class="icon">🖨️</span> Print report</button>
        </div>
      </div>
      <button class="topbar-btn primary" onclick="openAddModal()">+ Add Asset</button>
      ` : ''}
      ${showCCTVBtn  ? `<button class="topbar-btn primary" onclick="openAddCCTVModal()">+ Add CCTV</button>` : ''}
      ${showDoorBtn  ? `<button class="topbar-btn primary" onclick="openAddDoorModal()">+ Add Card</button>` : ''}
      <button class="topbar-icon-btn" onclick="toggleTheme()" title="Toggle theme">
        ${store.getTheme()==='dark' ? '☀️' : '🌙'}
      </button>
      <div class="avatar" onclick="setPage('profile')" title="${profile.name}">${profile.initials}</div>
    </div>
  </header>`;
}

/* ---- INVENTORY PAGE ---- */
function inventoryHTML(stats) {
  const rows  = filteredRows();
  const total = rows.length;
  const start = state.pageNum * state.pageSize;
  const slice = rows.slice(start, start + state.pageSize);

  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--accent-light);color:var(--accent)">📦</div>
      <div class="stat-card-label">Total assets</div>
      <div class="stat-card-val">${stats.total}</div>
      <div class="stat-card-sub">across ${stats.cats} categories</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-ok-bg);color:var(--status-ok-text)">✓</div>
      <div class="stat-card-label">Operational</div>
      <div class="stat-card-val" style="color:var(--status-ok-text)">${stats.ok}</div>
      <div class="stat-card-sub">status OK</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-warn-bg);color:var(--status-warn-text)">⚠</div>
      <div class="stat-card-label">Needs attention</div>
      <div class="stat-card-val" style="color:var(--status-warn-text)">${stats.warn}</div>
      <div class="stat-card-sub">require action</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-danger-bg);color:var(--status-danger-text)">✕</div>
      <div class="stat-card-label">Decommissioned</div>
      <div class="stat-card-val" style="color:var(--status-danger-text)">${stats.decomm}</div>
      <div class="stat-card-sub">retired assets</div>
    </div>
  </div>

  <div class="toolbar">
    <div class="search-wrap">
      <span class="icon">🔍</span>
      <input type="text" id="search-input" placeholder="Search by code, hostname, user, serial…"
             value="${escHtml(state.search)}" oninput="onSearch(this.value)">
    </div>
    <select class="filter-select" id="fMfr" onchange="setFilter('mfr',this.value)">
      <option value="all">All manufacturers</option>
      ${mfrOptions()}
    </select>
    <select class="filter-select" id="fOS" onchange="setFilter('os',this.value)">
      <option value="all">All OS</option>
      ${osOptions()}
    </select>
    <select class="filter-select" id="page-size-select" onchange="setPageSize(this.value)">
      <option value="50" ${state.pageSize===50?'selected':''}>50 per page</option>
      <option value="100" ${state.pageSize===100?'selected':''}>100 per page</option>
      <option value="200" ${state.pageSize===200?'selected':''}>200 per page</option>
    </select>
  </div>

  <div id="table-wrap">
    ${assetTableHTML(slice, total, start)}
  </div>`;
}

function assetTableHTML(slice, total, start) {
  return `
  <div class="table-card">
    <div style="overflow-x:auto">
    <table class="data-table" id="main-table">
      <thead><tr>
        <th>#</th>
        <th onclick="setSort('hostname')" class="sortable">Hostname ${sortArrow('hostname')}</th>
        <th onclick="setSort('cat')"      class="sortable">Type ${sortArrow('cat')}</th>
        <th onclick="setSort('model')"    class="sortable">Model / Specs ${sortArrow('model')}</th>
        <th onclick="setSort('dept')"     class="sortable">Department ${sortArrow('dept')}</th>
        <th onclick="setSort('user')"     class="sortable">Assigned to ${sortArrow('user')}</th>
        <th onclick="setSort('status')"   class="sortable">Status ${sortArrow('status')}</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${slice.length === 0 ? emptyRow(8) : slice.map((a, idx) => rowHTML(a, start + idx + 1)).join('')}
      </tbody>
    </table>
    </div>
    <div class="pager">
      <span>${total === 0 ? 'No results' : `Showing ${start+1}–${Math.min(start+state.pageSize, total)} of ${total}`}</span>
      <div class="pager-btns">
        <button onclick="prevPage()" ${state.pageNum===0?'disabled':''}>← Prev</button>
        ${pageButtons(total)}
        <button onclick="nextPage()" ${state.pageNum>=Math.ceil(total/state.pageSize)-1?'disabled':''}>Next →</button>
      </div>
    </div>
  </div>`;
}

function rowHTML(a, serialNo = 0) {
  const specs = [a.ram ? a.ram+'GB RAM' : '', a.hdd ? a.hdd+'GB HDD' : '']
    .filter(Boolean).join(' / ');
  return `
  <tr onclick="openDetail(${a.id})">
    <td class="mono">${serialNo}</td>
    <td style="font-weight:500">${escHtml(a.hostname)}</td>
    <td>${escHtml(a.cat === 'DataCentre' ? 'Data Centre' : a.cat)}</td>
    <td title="${escHtml(a.model)}">${escHtml(a.manufacturer)} ${escHtml(a.model)}${specs ? '<br><span style="font-size:11px;color:var(--text-muted)">'+specs+'</span>' : ''}</td>
    <td>${a.dept ? `<span class="badge badge-dept">${escHtml(a.dept)}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
    <td>${escHtml(a.user)}</td>
    <td>${badgeHTML(a.status)}</td>
    <td onclick="event.stopPropagation()">
      <div class="row-actions">
        <button class="btn-icon" title="View"   onclick="openDetail(${a.id})">👁</button>
        <button class="btn-icon" title="Edit"   onclick="openEditModal(${a.id})">✏️</button>
        <button class="btn-icon danger" title="Delete" onclick="confirmDelete(${a.id})">🗑</button>
      </div>
    </td>
  </tr>`;
}

/* ================================================================
   DEPARTMENT / PROJECT PAGE
================================================================ */
function deptHTML(stats) {
  const rows  = store.query({ dept: state.dept, status: state.status, search: state.search });
  const sorted = rows.sort((a, b) => String(a[state.sortCol]??'').localeCompare(String(b[state.sortCol]??'')));
  const total  = sorted.length;
  const start  = state.pageNum * state.pageSize;
  const slice  = sorted.slice(start, start + state.pageSize);

  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--accent-light);color:var(--accent)">🏢</div>
      <div class="stat-card-label">Huawei assets</div>
      <div class="stat-card-val">${stats.byDept.Huawei}</div>
      <div class="stat-card-sub">assigned to Huawei dept</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-ok-bg);color:var(--status-ok-text)">🏢</div>
      <div class="stat-card-label">ABS assets</div>
      <div class="stat-card-val">${stats.byDept.ABS}</div>
      <div class="stat-card-sub">assigned to ABS dept</div>
    </div>
  </div>

  <div class="toolbar">
    <div class="search-wrap">
      <span class="icon">🔍</span>
      <input type="text" placeholder="Search department assets…"
             value="${escHtml(state.search)}" oninput="onSearch(this.value)">
    </div>
    <select class="filter-select" onchange="setDeptFilter(this.value)">
      <option value="all"    ${state.dept==='all'?'selected':''}>All Departments</option>
      <option value="Huawei" ${state.dept==='Huawei'?'selected':''}>Huawei</option>
      <option value="ABS"    ${state.dept==='ABS'?'selected':''}>ABS</option>
    </select>
  </div>

  <div class="table-card">
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead><tr>
        <th>Code</th>
        <th>Hostname</th>
        <th>Type</th>
        <th>Model / Specs</th>
        <th>Department</th>
        <th>Assigned to</th>
        <th>Status</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${slice.length === 0
          ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🏢</div><h3>No department assets found</h3><p>Assets with a department assigned will appear here.</p></div></td></tr>`
          : slice.map(rowHTML).join('')}
      </tbody>
    </table>
    </div>
    <div class="pager">
      <span>${total === 0 ? 'No results' : `Showing ${start+1}–${Math.min(start+state.pageSize, total)} of ${total}`}</span>
      <div class="pager-btns">
        <button onclick="prevPage()" ${state.pageNum===0?'disabled':''}>← Prev</button>
        ${pageButtons(total)}
        <button onclick="nextPage()" ${state.pageNum>=Math.ceil(total/state.pageSize)-1?'disabled':''}>Next →</button>
      </div>
    </div>
  </div>`;
}

/* ================================================================
   CCTV PAGE
================================================================ */
function cctvHTML(stats) {
  const cctvs = store.getAllCCTVs();
  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--accent-light);color:var(--accent)">📷</div>
      <div class="stat-card-label">Total cameras</div>
      <div class="stat-card-val">${stats.cctvTotal}</div>
      <div class="stat-card-sub">registered CCTVs</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-ok-bg);color:var(--status-ok-text)">📡</div>
      <div class="stat-card-label">Online</div>
      <div class="stat-card-val" style="color:var(--status-ok-text)">${stats.cctvOnline}</div>
      <div class="stat-card-sub">currently active</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-danger-bg);color:var(--status-danger-text)">⚠</div>
      <div class="stat-card-label">Offline</div>
      <div class="stat-card-val" style="color:var(--status-danger-text)">${stats.cctvTotal - stats.cctvOnline}</div>
      <div class="stat-card-sub">need attention</div>
    </div>
  </div>

  <div class="table-card" style="margin-top:20px">
    <div style="padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:13px;font-weight:600;color:var(--text-primary)">Camera Registry</span>
      <span style="font-size:12px;color:var(--text-secondary)">${cctvs.length} camera(s) — more fields will be added as requirements are confirmed</span>
    </div>
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead><tr>
        <th>#</th>
        <th>Location</th>
        <th>IP Address</th>
        <th>Model</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${cctvs.length === 0
          ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📷</div><h3>No cameras registered</h3><p>Add your first CCTV camera using the button above.</p></div></td></tr>`
          : cctvs.map(c => `
        <tr>
          <td class="mono">${c.id}</td>
          <td style="font-weight:500">${escHtml(c.location)}</td>
          <td class="mono">${escHtml(c.ipAddress||'—')}</td>
          <td>${escHtml(c.model||'—')}</td>
          <td><span class="badge ${c.status==='Online'?'badge-ok':'badge-danger'}">${escHtml(c.status)}</span></td>
          <td style="color:var(--text-secondary);font-size:12px">${escHtml(c.notes||'—')}</td>
          <td>
            <div class="row-actions">
              <button class="btn-icon" title="Edit"   onclick="openEditCCTVModal(${c.id})">✏️</button>
              <button class="btn-icon danger" title="Delete" onclick="confirmDeleteCCTV(${c.id})">🗑</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>`;
}

/* ================================================================
   DOOR ACCESS CARDS PAGE
================================================================ */
function doorHTML(stats) {
  const cards = store.getAllDoorCards();
  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--accent-light);color:var(--accent)">🪪</div>
      <div class="stat-card-label">Total cards</div>
      <div class="stat-card-val">${stats.doorTotal}</div>
      <div class="stat-card-sub">issued access cards</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-ok-bg);color:var(--status-ok-text)">✓</div>
      <div class="stat-card-label">Active</div>
      <div class="stat-card-val" style="color:var(--status-ok-text)">${stats.doorActive}</div>
      <div class="stat-card-sub">currently enabled</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon" style="background:var(--status-danger-bg);color:var(--status-danger-text)">✕</div>
      <div class="stat-card-label">Suspended</div>
      <div class="stat-card-val" style="color:var(--status-danger-text)">${stats.doorTotal - stats.doorActive}</div>
      <div class="stat-card-sub">deactivated cards</div>
    </div>
  </div>

  <div class="table-card" style="margin-top:20px">
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead><tr>
        <th>Name</th>
        <th>Department</th>
        <th>Door Group (Zones)</th>
        <th>Status</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${cards.length === 0
          ? `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">🪪</div><h3>No access cards registered</h3><p>Add the first card using the button above.</p></div></td></tr>`
          : cards.map(c => `
        <tr>
          <td style="font-weight:500">${escHtml(c.name)}</td>
          <td>${escHtml(c.department)}</td>
          <td style="font-size:12px;color:var(--text-secondary)">${escHtml(c.doorGroup)}</td>
          <td><span class="badge ${c.status==='Active'?'badge-ok':c.status==='Suspended'?'badge-danger':'badge-warn'}">${escHtml(c.status)}</span></td>
          <td>
            <div class="row-actions">
              <button class="btn-icon" title="Edit"   onclick="openEditDoorModal(${c.id})">✏️</button>
              <button class="btn-icon danger" title="Delete" onclick="confirmDeleteDoor(${c.id})">🗑</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>`;
}

/* ---- PROFILE PAGE ---- */
function profileHTML(p) {
  return `
  <div class="profile-card">
    <div class="profile-avatar-lg">${escHtml(p.initials)}</div>
    <div class="profile-name">${escHtml(p.name)}</div>
    <div class="profile-role">${escHtml(p.role)} — ${escHtml(p.org)}</div>
    <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="detail-item"><div class="detail-item-label">Email</div><div class="detail-item-val">${escHtml(p.email)}</div></div>
      <div class="detail-item"><div class="detail-item-label">Phone</div><div class="detail-item-val">${escHtml(p.phone)}</div></div>
      <div class="detail-item"><div class="detail-item-label">Organisation</div><div class="detail-item-val">${escHtml(p.org)}</div></div>
      <div class="detail-item"><div class="detail-item-label">Joined</div><div class="detail-item-val">${escHtml(p.joined)}</div></div>
    </div>
    <div style="margin-top:18px;display:flex;gap:10px">
      <button class="btn primary" onclick="openEditProfileModal()">✏️ Edit profile</button>
    </div>
  </div>`;
}

/* ---- SETTINGS PAGE ---- */
function settingsHTML() {
  const th = store.getTheme();
  return `
  <div style="max-width:640px">
    <div class="settings-section">
      <h3>Appearance</h3>
      <div class="setting-row">
        <div>
          <div class="setting-row-label">Theme</div>
          <div class="setting-row-desc">Switch between light and dark mode</div>
        </div>
        <div class="theme-chips">
          <button class="theme-chip ${th==='light'?'active':''}" onclick="applyTheme('light')">☀️ Light</button>
          <button class="theme-chip ${th==='dark'?'active':''}"  onclick="applyTheme('dark')">🌙 Dark</button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Active Directory Sync</h3>
      <div class="setting-row">
        <div>
          <div class="setting-row-label">Sync from domain controller</div>
          <div class="setting-row-desc">
            Pulls computer &amp; user objects from AD and updates matching assets automatically.
            Requires the sync agent to be running on your network.
            <br><span style="color:var(--text-muted);font-size:11px">Agent URL: <code>http://localhost:4000/ad/snapshot</code> — see <strong>ad-sync/README.md</strong> for setup.</span>
          </div>
        </div>
        <button class="btn primary" onclick="runADSync()">⟳ Sync Now</button>
      </div>
      <div id="ad-sync-result" style="margin-top:8px;font-size:12px;color:var(--text-secondary)"></div>
    </div>

    <div class="settings-section">
      <h3>Data management</h3>
      <div class="setting-row">
        <div>
          <div class="setting-row-label">Export all assets</div>
          <div class="setting-row-desc">Download a full backup of inventory data</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn" onclick="doExport('csv')">CSV</button>
          <button class="btn" onclick="doExport('json')">JSON</button>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="setting-row-label">Imported data</div>
          <div class="setting-row-desc">View and manage files you have imported</div>
        </div>
        <button class="btn" onclick="openImportedDataModal()">View imports</button>
      </div>
      <div class="setting-row">
        <div>
          <div class="setting-row-label">Reset to sample data</div>
          <div class="setting-row-desc">Reload the default demo assets (cannot be undone)</div>
        </div>
        <button class="btn danger" onclick="confirmReset()">Reset data</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>About</h3>
      <div class="setting-row">
        <div><div class="setting-row-label">System</div></div>
        <span style="color:var(--text-secondary);font-size:13px">Egypro IT Inventory v2.0</span>
      </div>
      <div class="setting-row">
        <div><div class="setting-row-label">Built by</div></div>
        <span style="color:var(--text-secondary);font-size:13px">IT Dept — Egypro Communications</span>
      </div>
    </div>
  </div>`;
}

/* AD Sync trigger */
async function runADSync() {
  const result_el = document.getElementById('ad-sync-result');
  if (result_el) result_el.textContent = '⟳ Connecting to sync agent…';
  const result = await store.syncFromAD();
  if (result.success) {
    toast(`AD Sync complete — ${result.merged} asset(s) updated from ${result.total} AD objects`, 'success');
    if (result_el) result_el.textContent = `Last sync: ${new Date().toLocaleTimeString()} — ${result.merged} updated`;
    render();
  } else {
    toast('AD Sync failed — agent not reachable. See Settings for setup guide.', 'error');
    if (result_el) result_el.textContent = `Error: ${result.error}`;
  }
}
window.runADSync = runADSync;

/* ================================================================
   MODALS — ASSETS
================================================================ */
function openModal(html) {
  const ov = document.getElementById('modal-overlay');
  ov.innerHTML = `<div class="modal">${html}</div>`;
  ov.classList.remove('hidden');
  ov.onclick = e => { if (e.target === ov) closeModal(); };
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
window.closeModal = closeModal;

function assetFormHTML(a = {}) {
  const val = (k, def='') => escHtml(String(a[k] ?? def));
  return `
  <div class="modal-header">
    <div class="modal-title">${a.id ? 'Edit asset' : 'Add new asset'}</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="form-field">
        <label>Category *</label>
        <select id="f-cat">
          <option value="Desktop"    ${(a.cat||'Desktop')==='Desktop'?'selected':''}>Desktop</option>
          <option value="Laptop"     ${a.cat==='Laptop'?'selected':''}>Laptop</option>
          <option value="DataCentre" ${a.cat==='DataCentre'?'selected':''}>Data Centre</option>
          <option value="Printer"    ${a.cat==='Printer'?'selected':''}>Printer</option>
          <option value="Network"    ${a.cat==='Network'?'selected':''}>Network</option>
        </select>
      </div>
      <div class="form-field">
        <label>Department / Project</label>
        <select id="f-dept">
          <option value=""       ${!a.dept?'selected':''}>— None —</option>
          <option value="Huawei" ${a.dept==='Huawei'?'selected':''}>Huawei</option>
          <option value="ABS"    ${a.dept==='ABS'?'selected':''}>ABS</option>
        </select>
      </div>
      <div class="form-field">
        <label>Asset code *</label>
        <input id="f-code" value="${val('code')}" placeholder="e.g. EGPROD06">
      </div>
      <div class="form-field">
        <label>Hostname</label>
        <input id="f-hostname" value="${val('hostname')}" placeholder="e.g. DESKTOP-JDOE">
      </div>
      <div class="form-field">
        <label>Assigned to / Location *</label>
        <input id="f-user" value="${val('user')}" placeholder="e.g. Finance Dept">
      </div>
      <div class="form-field">
        <label>Manufacturer</label>
        <select id="f-mfr">
          ${['DELL','HP','Lenovo','Apple','Cisco','Samsung','Other'].map(m=>`<option ${(a.manufacturer||'DELL')===m?'selected':''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Model</label>
        <input id="f-model" value="${val('model')}" placeholder="e.g. OptiPlex 7050">
      </div>
      <div class="form-field">
        <label>Serial number</label>
        <input id="f-serial" value="${val('serial')}" placeholder="e.g. XY123456">
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="f-status">
          <option ${(a.status||'OK')==='OK'?'selected':''}>OK</option>
          <option ${a.status==='Needs attention'?'selected':''}>Needs attention</option>
          <option ${a.status==='Decommissioned'?'selected':''}>Decommissioned</option>
        </select>
      </div>
      <div class="form-field">
        <label>CPU speed (GHz)</label>
        <input id="f-cpu" type="number" step="0.1" value="${val('cpu','')}" placeholder="3.4">
      </div>
      <div class="form-field">
        <label>RAM (GB)</label>
        <input id="f-ram" type="number" value="${val('ram','')}" placeholder="16">
      </div>
      <div class="form-field">
        <label>Hard drive (GB)</label>
        <input id="f-hdd" type="number" value="${val('hdd','')}" placeholder="512">
      </div>
      <div class="form-field">
        <label>Operating system</label>
        <input id="f-os" value="${val('os')}" placeholder="e.g. MS WIN 11 Pro">
      </div>
      <div class="form-field">
        <label>Office / 365</label>
        <input id="f-office" value="${val('office')}" placeholder="e.g. Microsoft 365">
      </div>
      <div class="form-field">
        <label>Antivirus</label>
        <input id="f-av" value="${val('av')}" placeholder="e.g. Norton 360">
      </div>
      <div class="form-field">
        <label>Collected from</label>
        <input id="f-collected" value="${val('collected')}" placeholder="Name or dept">
      </div>
      <div class="form-field">
        <label>Vendor / source</label>
        <input id="f-vendor" value="${val('vendor')}" placeholder="e.g. Leverage">
      </div>
      <div class="form-field span2">
        <label>Notes</label>
        <textarea id="f-notes" rows="2" placeholder="Optional notes about this asset">${val('notes')}</textarea>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveAsset(${a.id||'null'})">${a.id ? 'Save changes' : 'Add asset'}</button>
  </div>`;
}

function openAddModal()    { openModal(assetFormHTML()); }
function openEditModal(id) { openModal(assetFormHTML(store.getById(id) || {})); }
window.openAddModal  = openAddModal;
window.openEditModal = openEditModal;

function saveAsset(id) {
  const get = i => document.getElementById(i)?.value?.trim() || '';
  const num = i => parseFloat(document.getElementById(i)?.value) || 0;
  const code = get('f-code');
  const user = get('f-user');
  if (!code || !user) { toast('Asset code and assigned-to are required', 'error'); return; }
  const data = {
    cat: get('f-cat'), dept: get('f-dept'), code, hostname: get('f-hostname') || code,
    user, manufacturer: get('f-mfr'), model: get('f-model'), serial: get('f-serial'),
    status: get('f-status'), cpu: num('f-cpu'), ram: num('f-ram'), hdd: num('f-hdd'),
    os: get('f-os'), office: get('f-office'), av: get('f-av'),
    collected: get('f-collected'), vendor: get('f-vendor'), notes: get('f-notes'),
  };
  if (id) { store.update(id, data); toast('Asset updated', 'success'); }
  else    { store.add(data);        toast('Asset added',   'success'); }
  closeModal(); render();
}
window.saveAsset = saveAsset;

/* Detail Modal */
function openDetail(id) {
  const a = store.getById(id);
  if (!a) return;
  const specs = [a.cpu?`CPU: ${a.cpu} GHz`:'', a.ram?`RAM: ${a.ram} GB`:'', a.hdd?`HDD: ${a.hdd} GB`:''].filter(Boolean).join(' · ');
  openModal(`
  <div class="modal-header">
    <div>
      <div class="modal-title">${escHtml(a.manufacturer)} ${escHtml(a.model)}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${escHtml(a.code)} · ${escHtml(a.cat === 'DataCentre' ? 'Data Centre' : a.cat)}${a.dept ? ' · ' + escHtml(a.dept) : ''}</div>
    </div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div style="margin-bottom:12px">${badgeHTML(a.status)}</div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-item-label">Assigned to</div><div class="detail-item-val">${escHtml(a.user)}</div></div>
      <div class="detail-item"><div class="detail-item-label">Hostname</div><div class="detail-item-val">${escHtml(a.hostname)}</div></div>
      ${a.dept ? `<div class="detail-item"><div class="detail-item-label">Department</div><div class="detail-item-val"><span class="badge badge-dept">${escHtml(a.dept)}</span></div></div>` : ''}
      <div class="detail-item"><div class="detail-item-label">Serial number</div><div class="detail-item-val">${escHtml(a.serial)||'—'}</div></div>
      <div class="detail-item"><div class="detail-item-label">OS</div><div class="detail-item-val">${escHtml(a.os)||'—'}</div></div>
      ${a.cpu   ? `<div class="detail-item"><div class="detail-item-label">CPU</div><div class="detail-item-val">${a.cpu} GHz</div></div>` : ''}
      ${a.ram   ? `<div class="detail-item"><div class="detail-item-label">RAM</div><div class="detail-item-val">${a.ram} GB</div></div>` : ''}
      ${a.hdd   ? `<div class="detail-item"><div class="detail-item-label">Hard drive</div><div class="detail-item-val">${a.hdd} GB</div></div>` : ''}
      ${a.office ? `<div class="detail-item"><div class="detail-item-label">Office</div><div class="detail-item-val">${escHtml(a.office)}</div></div>` : ''}
      ${a.av     ? `<div class="detail-item"><div class="detail-item-label">Antivirus</div><div class="detail-item-val">${escHtml(a.av)}</div></div>` : ''}
      ${a.collected ? `<div class="detail-item"><div class="detail-item-label">Collected from</div><div class="detail-item-val">${escHtml(a.collected)}</div></div>` : ''}
      ${a.vendor    ? `<div class="detail-item"><div class="detail-item-label">Vendor</div><div class="detail-item-val">${escHtml(a.vendor)}</div></div>` : ''}
    </div>
    ${a.notes ? `<div style="margin-top:14px;padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:13px"><b>Notes:</b> ${escHtml(a.notes)}</div>` : ''}
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Close</button>
    <button class="btn" onclick="closeModal();openEditModal(${a.id})">✏️ Edit</button>
    <button class="btn primary" onclick="closeModal();doExport('print-one',${a.id})">🖨️ Print</button>
  </div>`);
}
window.openDetail = openDetail;

/* Delete Asset */
function confirmDelete(id) {
  const a = store.getById(id);
  if (!a) return;
  openModal(`
  <div class="modal-header">
    <div class="modal-title">Delete asset?</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <p style="font-size:14px;line-height:1.6">
      You're about to permanently delete <strong>${escHtml(a.code)} — ${escHtml(a.model)}</strong>.
      This action cannot be undone.
    </p>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn danger" onclick="doDelete(${id})">Delete asset</button>
  </div>`);
}
window.confirmDelete = confirmDelete;

function doDelete(id) { store.remove(id); closeModal(); toast('Asset deleted', 'info'); render(); }
window.doDelete = doDelete;

/* ================================================================
   MODALS — CCTV
================================================================ */
function cctvFormHTML(c = {}) {
  const val = (k, def='') => escHtml(String(c[k] ?? def));
  return `
  <div class="modal-header">
    <div class="modal-title">${c.id ? 'Edit CCTV' : 'Add CCTV Camera'}</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="form-field span2">
        <label>Location *</label>
        <input id="cc-location" value="${val('location')}" placeholder="e.g. Main Entrance">
      </div>
      <div class="form-field">
        <label>IP Address</label>
        <input id="cc-ip" value="${val('ipAddress')}" placeholder="e.g. 192.168.1.101">
      </div>
      <div class="form-field">
        <label>Model</label>
        <input id="cc-model" value="${val('model')}" placeholder="e.g. Hikvision DS-2CD2143">
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="cc-status">
          <option ${(c.status||'Online')==='Online'?'selected':''}>Online</option>
          <option ${c.status==='Offline'?'selected':''}>Offline</option>
          <option ${c.status==='Maintenance'?'selected':''}>Maintenance</option>
        </select>
      </div>
      <div class="form-field span2">
        <label>Notes</label>
        <textarea id="cc-notes" rows="2" placeholder="Optional notes">${val('notes')}</textarea>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveCCTV(${c.id||'null'})">${c.id ? 'Save changes' : 'Add camera'}</button>
  </div>`;
}

function openAddCCTVModal()    { openModal(cctvFormHTML()); }
function openEditCCTVModal(id) { openModal(cctvFormHTML(store.getCCTVById(id)||{})); }
window.openAddCCTVModal  = openAddCCTVModal;
window.openEditCCTVModal = openEditCCTVModal;

function saveCCTV(id) {
  const get = i => document.getElementById(i)?.value?.trim() || '';
  const location = get('cc-location');
  if (!location) { toast('Location is required', 'error'); return; }
  const data = { location, ipAddress: get('cc-ip'), model: get('cc-model'), status: get('cc-status'), notes: get('cc-notes') };
  if (id) { store.updateCCTV(id, data); toast('Camera updated', 'success'); }
  else    { store.addCCTV(data);        toast('Camera added',   'success'); }
  closeModal(); render();
}
window.saveCCTV = saveCCTV;

function confirmDeleteCCTV(id) {
  const c = store.getCCTVById(id);
  if (!c) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Delete camera?</div><button class="btn-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body"><p style="font-size:14px;line-height:1.6">Delete camera at <strong>${escHtml(c.location)}</strong>? This cannot be undone.</p></div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn danger" onclick="doDeleteCCTV(${id})">Delete</button>
  </div>`);
}
window.confirmDeleteCCTV = confirmDeleteCCTV;

function doDeleteCCTV(id) { store.removeCCTV(id); closeModal(); toast('Camera removed', 'info'); render(); }
window.doDeleteCCTV = doDeleteCCTV;

/* ================================================================
   MODALS — DOOR ACCESS CARDS
================================================================ */
function doorFormHTML(c = {}) {
  const val = (k, def='') => escHtml(String(c[k] ?? def));
  return `
  <div class="modal-header">
    <div class="modal-title">${c.id ? 'Edit Access Card' : 'Add Access Card'}</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="form-field span2">
        <label>Full name *</label>
        <input id="dc-name" value="${val('name')}" placeholder="e.g. John Mwangi">
      </div>
      <div class="form-field">
        <label>Department *</label>
        <input id="dc-dept" value="${val('department')}" placeholder="e.g. Finance">
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="dc-status">
          <option ${(c.status||'Active')==='Active'?'selected':''}>Active</option>
          <option ${c.status==='Suspended'?'selected':''}>Suspended</option>
          <option ${c.status==='Expired'?'selected':''}>Expired</option>
        </select>
      </div>
      <div class="form-field span2">
        <label>Door Group (Zones / locations this card can access)</label>
        <input id="dc-doorgroup" value="${val('doorGroup')}" placeholder="e.g. Main Entrance, Server Room, Finance Office">
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveDoorCard(${c.id||'null'})">${c.id ? 'Save changes' : 'Add card'}</button>
  </div>`;
}

function openAddDoorModal()    { openModal(doorFormHTML()); }
function openEditDoorModal(id) { openModal(doorFormHTML(store.getDoorCardById(id)||{})); }
window.openAddDoorModal  = openAddDoorModal;
window.openEditDoorModal = openEditDoorModal;

function saveDoorCard(id) {
  const get = i => document.getElementById(i)?.value?.trim() || '';
  const name = get('dc-name');
  const department = get('dc-dept');
  if (!name || !department) { toast('Name and department are required', 'error'); return; }
  const data = { name, department, doorGroup: get('dc-doorgroup'), status: get('dc-status') };
  if (id) { store.updateDoorCard(id, data); toast('Card updated', 'success'); }
  else    { store.addDoorCard(data);        toast('Card added',   'success'); }
  closeModal(); render();
}
window.saveDoorCard = saveDoorCard;

function confirmDeleteDoor(id) {
  const c = store.getDoorCardById(id);
  if (!c) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Delete access card?</div><button class="btn-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body"><p style="font-size:14px;line-height:1.6">Delete card for <strong>${escHtml(c.name)}</strong>? This cannot be undone.</p></div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn danger" onclick="doDeleteDoor(${id})">Delete</button>
  </div>`);
}
window.confirmDeleteDoor = confirmDeleteDoor;

function doDeleteDoor(id) { store.removeDoorCard(id); closeModal(); toast('Card removed', 'info'); render(); }
window.doDeleteDoor = doDeleteDoor;

/* ================================================================
   MODALS — SHARED
================================================================ */
function confirmReset() {
  openModal(`
  <div class="modal-header">
    <div class="modal-title">Reset all data?</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <p style="font-size:14px;line-height:1.6">
      This will replace all assets, CCTVs and door cards with the default sample data.
      Any changes you have made will be lost.
    </p>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn danger" onclick="doReset()">Yes, reset</button>
  </div>`);
}
window.confirmReset = confirmReset;

function doReset() {
  store.resetToDefaults(); closeModal();
  toast('Data reset to defaults', 'info');
  state.cat='all'; state.status='all'; state.search=''; state.pageNum=0;
  render();
}
window.doReset = doReset;

/* Edit Profile Modal */
function openEditProfileModal() {
  const p = store.getProfile();
  openModal(`
  <div class="modal-header">
    <div class="modal-title">Edit profile</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="form-field span2"><label>Full name</label><input id="p-name" value="${escHtml(p.name)}"></div>
      <div class="form-field"><label>Initials (2 chars)</label><input id="p-initials" maxlength="2" value="${escHtml(p.initials)}"></div>
      <div class="form-field"><label>Job title</label><input id="p-role" value="${escHtml(p.role)}"></div>
      <div class="form-field"><label>Organisation</label><input id="p-org" value="${escHtml(p.org)}"></div>
      <div class="form-field"><label>Email</label><input id="p-email" type="email" value="${escHtml(p.email)}"></div>
      <div class="form-field"><label>Phone</label><input id="p-phone" value="${escHtml(p.phone)}"></div>
      <div class="form-field"><label>Date joined</label><input id="p-joined" type="date" value="${escHtml(p.joined)}"></div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveProfile()">Save profile</button>
  </div>`);
}
window.openEditProfileModal = openEditProfileModal;

function saveProfile() {
  const g = i => document.getElementById(i)?.value?.trim()||'';
  store.updateProfile({ name:g('p-name'), initials:g('p-initials').toUpperCase().slice(0,2),
    role:g('p-role'), org:g('p-org'), email:g('p-email'), phone:g('p-phone'), joined:g('p-joined') });
  closeModal(); toast('Profile saved', 'success'); render();
}
window.saveProfile = saveProfile;

/* ================================================================
   NAVIGATION
================================================================ */
function setPage(p)  { state.page = p; render(); }
window.setPage = setPage;

function setCat(id) {
  state.cat = id; state.page = 'inventory'; state.pageNum = 0; render();
}
window.setCat = setCat;

function setDeptPage(dept) {
  state.dept = dept; state.page = 'dept'; state.pageNum = 0; render();
}
window.setDeptPage = setDeptPage;

function setDeptFilter(dept) {
  state.dept = dept; state.pageNum = 0; render();
}
window.setDeptFilter = setDeptFilter;

function setStatus(s) {
  state.status = s;
  if (!['inventory','dept'].includes(state.page)) state.page = 'inventory';
  state.pageNum = 0; render();
}
window.setStatus = setStatus;

function setFilter(key, val) { state[key] = val; state.pageNum = 0; render(); }
window.setFilter = setFilter;

function setPageSize(size) {
  state.pageSize = parseInt(size, 10) || 200;
  state.pageNum = 0;
  renderTable();
}
window.setPageSize = setPageSize;

function onSearch(val) { state.search = val; state.pageNum = 0; renderTable(); }
window.onSearch = onSearch;

function clearFilters() {
  state.cat='all'; state.dept='all'; state.status='all'; state.mfr='all'; state.os='all';
  state.search=''; state.pageNum=0; render();
}
window.clearFilters = clearFilters;

function setSort(col) {
  if (state.sortCol === col) state.sortAsc = !state.sortAsc;
  else { state.sortCol = col; state.sortAsc = true; }
  state.pageNum = 0; renderTable();
}
window.setSort = setSort;

function prevPage() { if (state.pageNum > 0) { state.pageNum--; renderTable(); } }
function nextPage() {
  const max = Math.ceil(filteredRows().length / state.pageSize) - 1;
  if (state.pageNum < max) { state.pageNum++; renderTable(); }
}
function goPage(n) { state.pageNum = n; renderTable(); }
window.prevPage = prevPage; window.nextPage = nextPage; window.goPage = goPage;

function renderTable() {
  const wrap = document.getElementById('table-wrap');
  if (!wrap) return;
  const stats = store.stats();
  const tmp = document.createElement('div');
  tmp.innerHTML = inventoryHTML(stats);
  const newWrap = tmp.querySelector('#table-wrap');
  if (newWrap) wrap.innerHTML = newWrap.innerHTML;
}

/* ================================================================
   THEME & EXPORT
================================================================ */
function toggleTheme()  { applyTheme(store.getTheme() === 'dark' ? 'light' : 'dark'); }
function applyTheme(t)  { store.setTheme(t); render(); }
window.toggleTheme = toggleTheme; window.applyTheme = applyTheme;

function toggleExportMenu(e) {
  e.stopPropagation();
  state.exportOpen = !state.exportOpen;
  const m = document.getElementById('export-menu');
  if (m) m.classList.toggle('hidden', !state.exportOpen);
}
window.toggleExportMenu = toggleExportMenu;

function doExport(type, id) {
  state.exportOpen = false;
  const m = document.getElementById('export-menu');
  if (m) m.classList.add('hidden');
  const rows = (type === 'print-one' && id) ? [store.getById(id)].filter(Boolean) : filteredRows();
  const ts = new Date().toISOString().slice(0,10);
  if      (type === 'csv')                    { exporter.downloadCSV(rows,  `egypro_inventory_${ts}.csv`);  toast('CSV downloaded', 'success'); }
  else if (type === 'json')                   { exporter.downloadJSON(rows, `egypro_inventory_${ts}.json`); toast('JSON downloaded', 'success'); }
  else if (type === 'txt')                    { exporter.downloadTXT(rows,  `egypro_inventory_${ts}.txt`);  toast('TXT downloaded', 'success'); }
  else if (type === 'png')                    { exporter.downloadPNG('main-table', `egypro_inventory_${ts}.png`); }
  else if (type === 'print' || type === 'print-one') { exporter.print(rows); }
}
window.doExport = doExport;

/* ================================================================
   HELPERS
================================================================ */
function filteredRows() {
  const rows = store.query({
    cat:          state.cat,
    dept:         state.page === 'dept' ? state.dept : undefined,
    status:       state.status,
    manufacturer: state.mfr,
    os:           state.os,
    search:       state.search,
  });
  return rows.sort((a, b) => {
    const va = String(a[state.sortCol] ?? '').toLowerCase();
    const vb = String(b[state.sortCol] ?? '').toLowerCase();
    return state.sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });
}

function mfrOptions() {
  const mfrs = [...new Set(store.getAll().map(a => a.manufacturer))].sort();
  return mfrs.map(m => `<option value="${escHtml(m)}" ${state.mfr===m?'selected':''}>${escHtml(m)}</option>`).join('');
}

function osOptions() {
  const oss = [...new Set(store.getAll().map(a => a.os).filter(Boolean))].sort();
  return oss.map(o => `<option value="${escHtml(o)}" ${state.os===o?'selected':''}>${escHtml(o)}</option>`).join('');
}

function emptyRow(cols = 7) {
  return `<tr><td colspan="${cols}">
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h3>No assets found</h3>
      <p>Try changing your filters or <a href="#" onclick="clearFilters()">clear all filters</a></p>
    </div>
  </td></tr>`;
}

function badgeHTML(status) {
  const map = { 'OK':'badge-ok', 'Needs attention':'badge-warn', 'Decommissioned':'badge-danger' };
  return `<span class="badge ${map[status]||'badge-info'}">${escHtml(status)}</span>`;
}

function sortArrow(col) {
  if (state.sortCol !== col) return '<span style="color:var(--text-muted);font-size:10px">⇅</span>';
  return state.sortAsc ? '↑' : '↓';
}

function pageButtons(total) {
  const pages = Math.ceil(total / state.pageSize);
  if (pages <= 1) return '';
  return Array.from({length: Math.min(pages, 7)}, (_,i) =>
    `<button class="${i===state.pageNum?'active':''}" onclick="goPage(${i})">${i+1}</button>`
  ).join('');
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function bindEvents() { /* handled via onclick attrs */ }

/* ================================================================
   IMPORT (CSV / XLSX)
================================================================ */
function openImportDialog() {
  const el = document.getElementById('import-file-input');
  if (el) el.click();
}
window.openImportDialog = openImportDialog;

async function handleImportFile(e) {
  const f = e.target && e.target.files && e.target.files[0];
  if (!f) return;
  const name = (f.name || '').toLowerCase();
  const fileName = f.name;
  try {
    if (name.endsWith('.csv')) {
      const txt = await f.text();
      const rows = parseCSVToObjects(txt);
      processImportedRows(rows, fileName);
    } else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
      if (typeof XLSX === 'undefined') {
        toast('XLSX parser not loaded — please use CSV', 'error');
        return;
      }
      const data = await f.arrayBuffer();
      let wb;
      try {
        wb = XLSX.read(data, { type: 'array' });
      } catch (err) {
        const msg = String(err && err.message ? err.message : err);
        if (/password|encrypted/i.test(msg)) {
          const password = await promptForExcelPassword(fileName);
          if (!password) {
            toast('Password is required to decrypt this file.', 'error');
            return;
          }
          toast('Decrypting file...', 'info');
          
          const formData = new FormData();
          formData.append('file', f);
          formData.append('password', password);
          
          try {
            const response = await fetch('http://localhost:4000/decrypt-excel', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || `Server error: ${response.status}`);
            }
            
            const decData = await response.arrayBuffer();
            wb = XLSX.read(decData, { type: 'array' });
            toast('Decryption successful', 'success');
          } catch (decErr) {
            toast('Decryption failed: ' + decErr.message, 'error');
            return;
          }
        } else {
          throw err;
        }
      }
      const sheet = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '' });
      processImportedRows(rows, fileName);
    } else {
      toast('Unsupported file type — please use CSV or Excel (.xls/.xlsx)', 'error');
    }
  } catch (err) {
    console.error('[Import] ', err);
    toast('Import failed: ' + (err.message || String(err)), 'error');
  } finally {
    if (e.target) e.target.value = '';
  }
}
window.handleImportFile = handleImportFile;

async function promptForExcelPassword(fileName) {
  const value = window.prompt(`Enter password for ${fileName} (leave blank if the file is not protected):`);
  return value === null ? '' : value;
}

function normalizeHeaderKey(value = '') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

function normalizeCategoryValue(value = '') {
  const v = String(value).trim().toLowerCase();
  if (!v) return '';
  const mapping = {
    desktop: 'Desktop',
    pc: 'Desktop',
    computer: 'Desktop',
    workstation: 'Desktop',
    'all in one': 'Desktop',
    'all-in-one': 'Desktop',
    aio: 'Desktop',
    tower: 'Desktop',
    laptop: 'Laptop',
    notebook: 'Laptop',
    ultrabook: 'Laptop',
    chromebook: 'Laptop',
    server: 'DataCentre',
    'data centre': 'DataCentre',
    datacentre: 'DataCentre',
    rack: 'DataCentre',
    rackmount: 'DataCentre',
    storage: 'DataCentre',
    nas: 'DataCentre',
    san: 'DataCentre',
    hypervisor: 'DataCentre',
    vm: 'DataCentre',
    backup: 'DataCentre',
    ups: 'DataCentre',
    printer: 'Printer',
    plotter: 'Printer',
    mfp: 'Printer',
    multifunction: 'Printer',
    scanner: 'Printer',
    network: 'Network',
    switch: 'Network',
    router: 'Network',
    firewall: 'Network',
    'access point': 'Network',
    'access-point': 'Network',
    ap: 'Network',
    modem: 'Network',
    gateway: 'Network',
    'load balancer': 'Network',
  };
  return mapping[v] || '';
}

function inferCategory(row = {}) {
  const candidates = Object.values(row).filter(Boolean).map(v => String(v).trim());
  const joined = candidates.join(' ').toLowerCase();
  if (!joined) return 'Desktop';

  const direct = normalizeCategoryValue(candidates[0]);
  if (direct) return direct;

  if (/(laptop|notebook|ultrabook|chromebook)/i.test(joined)) return 'Laptop';
  if (/(server|rack|rackmount|storage|nas|san|hypervisor|vm|backup|ups)/i.test(joined)) return 'DataCentre';
  if (/(printer|plotter|mfp|multifunction|scanner)/i.test(joined)) return 'Printer';
  if (/(router|switch|firewall|access point|access-point|ap|network|modem|gateway|load balancer)/i.test(joined)) return 'Network';
  if (/(desktop|pc|workstation|all in one|all-in-one|aio|tower)/i.test(joined)) return 'Desktop';

  return 'Desktop';
}

function processImportedRows(rows, fileName = 'unknown') {
  if (!rows || !rows.length) { toast('No rows found to import', 'error'); return; }
  const headerMap = {
    'asset code':'code','code':'code','new convention':'code','new convention number':'code','new convention name':'code',
    'hostname':'hostname','computer name or hardware description':'hostname','computer name':'hostname','hardware description':'hostname',
    'type':'cat','asset type':'cat','category':'cat','asset category':'cat','device type':'cat','kind':'cat','classification':'cat',
    'manufacturer':'manufacturer','model':'model','cpu ghz':'cpu','cpu speed':'cpu','cpu (ghz)':'cpu','cpu':'cpu','ram gb':'ram','ram (gb)':'ram','ram':'ram',
    'hdd gb':'hdd','hard drive size':'hdd','hdd (gb)':'hdd','hdd':'hdd','serial no':'serial','serial no.':'serial','serial number':'serial','serial':'serial','os':'os','os version':'os','operating system':'os',
    'office':'office','office version 365 family':'office','antivirus':'av','antivirus version':'av','antivirus version -norton 360':'av','status':'status','assigned to':'user','user':'user','location':'user','collected from':'collected','collected':'collected','vendor':'vendor','purchase date':'notes','notes':'notes','assigned to / location':'user','department':'dept','dept':'dept','department project':'dept'
  };

  let added = 0, skipped = 0;
  rows.forEach(raw => {
    const out = {};
    Object.keys(raw).forEach(k => {
      const v = (raw[k] ?? '').toString().trim();
      const n = k.toString().trim().toLowerCase();
      const simple = normalizeHeaderKey(n);
      const mapped = headerMap[n] || headerMap[simple] || headerMap[normalizeHeaderKey(k)];
      if (mapped) out[mapped] = v;
    });
    out.cpu = parseFloat(out.cpu) || 0;
    out.ram = parseFloat(out.ram) || 0;
    out.hdd = parseFloat(out.hdd) || 0;
    out.cat = normalizeCategoryValue(out.cat) || inferCategory(out);
    out.hostname = out.hostname || out.code || '';
    out.user = out.user || '';
    out.sourceFile = fileName;
    if (!out.code) { skipped++; return; }
    try { store.add(out); added++; } catch (e) { console.warn('Import add failed', e); skipped++; }
  });
  store.recordImport(fileName, added);
  render();
  showImportResultModal(fileName, added, skipped);
}

function showImportResultModal(fileName, added, skipped) {
  openModal(`
  <div class="modal-header">
    <div class="modal-title">✓ Import Complete</div>
    <button class="btn-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <div style="font-size:14px;line-height:1.6;margin-bottom:16px">
      <strong>File:</strong> ${escHtml(fileName)}<br>
      <strong>Added:</strong> ${added} row(s)<br>
      ${skipped > 0 ? '<strong>Skipped:</strong> ' + skipped + ' row(s)' : ''}
    </div>
    <p style="color:var(--text-secondary);font-size:12px">
      To delete this import, go to Settings → Data management → Imported Data.
    </p>
  </div>
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Close</button>
    <button class="btn primary" onclick="closeModal(); openImportDialog()">Import another file</button>
  </div>
  `);
}
window.showImportResultModal = showImportResultModal;

// sample import removed — use the Import file button instead

function openImportedDataModal() {
  const imports = store.getImports();
  let html = `<div class="modal-header"><div class="modal-title">Imported data</div><button class="btn-close" onclick="closeModal()">✕</button></div><div class="modal-body">`;
  if (imports.length === 0) {
    html += `<p style="color:var(--text-secondary);font-size:14px">No files imported yet.</p>`;
  } else {
    html += `<div style="max-height:300px;overflow-y:auto">`;
    imports.forEach(imp => {
      const dt = new Date(imp.date).toLocaleString();
      const kindLabel = imp.type === 'cctv' ? 'CCTV' : imp.type === 'door' ? 'Door cards' : 'Assets';
      html += `<div style="padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500;font-size:13px">${escHtml(imp.fileName)}</div><div style="font-size:12px;color:var(--text-secondary)">${kindLabel} • Added: ${imp.count} row(s) on ${dt}</div></div><button class="btn danger" onclick="deleteImport('${imp.fileName}')" style="flex-shrink:0;margin-left:8px">Delete</button></div>`;
    });
    html += `</div>`;
  }
  html += `</div><div class="modal-footer"><button class="btn" onclick="closeModal()">Close</button></div>`;
  openModal(html);
}
window.openImportedDataModal = openImportedDataModal;

function deleteImport(fileName) {
  const msg = 'Delete all assets imported from "' + fileName + '"? This cannot be undone.';
  if (!confirm(msg)) return;
  store.deleteImport(fileName);
  toast('Import from "' + fileName + '" deleted', 'info');
  render();
  openImportedDataModal();
}
window.deleteImport = deleteImport;

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', boot);
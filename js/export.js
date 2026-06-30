/* ============================================================
   export.js — Download & Export Utilities
   Supports: CSV, JSON, Print, PNG screenshot (via html2canvas)
   ============================================================ */

const exporter = (() => {

  /* ---- CSV ---- */
  function toCSV(rows) {
    if (!rows.length) return '';
    const cols = ['code','hostname','cat','manufacturer','model','cpu','ram','hdd',
                  'serial','os','office','av','status','user','collected','vendor','notes'];
    const headers = ['Asset Code','Hostname','Type','Manufacturer','Model','CPU (GHz)',
                     'RAM (GB)','HDD (GB)','Serial No.','OS','Office','Antivirus',
                     'Status','Assigned To','Collected From','Vendor','Notes'];
    const escape = v => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      headers.join(','),
      ...rows.map(r => cols.map(c => escape(r[c])).join(',')),
    ];
    return lines.join('\r\n');
  }

  function downloadCSV(rows, filename = 'egypro_inventory.csv') {
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    trigger(blob, filename);
  }

  /* ---- JSON ---- */
  function downloadJSON(rows, filename = 'egypro_inventory.json') {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    trigger(blob, filename);
  }

  /* ---- TXT (tab-separated) ---- */
  function downloadTXT(rows, filename = 'egypro_inventory.txt') {
    const cols = ['code','hostname','cat','manufacturer','model','ram','hdd','serial','os','status','user'];
    const lines = rows.map(r => cols.map(c => String(r[c] ?? '')).join('\t'));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    trigger(blob, filename);
  }

  /* ---- PRINT ---- */
  function print(rows) {
    const win = window.open('', '_blank', 'width=900,height=700');
    const now = new Date().toLocaleString();
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Egypro IT Inventory — Print Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 20px; }
        h1   { font-size: 18px; margin-bottom: 4px; }
        p    { color: #555; margin-bottom: 16px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
        tr:nth-child(even) { background: #fafafa; }
        .ok   { color: #166534; font-weight: 600; }
        .warn { color: #92400E; font-weight: 600; }
        .dead { color: #991B1B; font-weight: 600; }
        @page { margin: 15mm; }
      </style>
    </head><body>
      <h1>Egypro IT Inventory Report</h1>
      <p>Generated: ${now} — ${rows.length} asset(s)</p>
      <table>
        <thead><tr>
          <th>Code</th><th>Hostname</th><th>Type</th><th>Manufacturer</th>
          <th>Model</th><th>RAM</th><th>HDD</th><th>Serial</th>
          <th>OS</th><th>Status</th><th>Assigned To</th>
        </tr></thead>
        <tbody>
          ${rows.map(r => `<tr>
            <td>${r.code}</td><td>${r.hostname}</td><td>${r.cat}</td>
            <td>${r.manufacturer}</td><td>${r.model}</td>
            <td>${r.ram ? r.ram + ' GB' : '—'}</td>
            <td>${r.hdd ? r.hdd + ' GB' : '—'}</td>
            <td>${r.serial}</td><td>${r.os || '—'}</td>
            <td class="${r.status==='OK'?'ok':r.status==='Decommissioned'?'dead':'warn'}">${r.status}</td>
            <td>${r.user}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  /* ---- PNG via html2canvas ---- */
  async function downloadPNG(elementId, filename = 'egypro_inventory.png') {
    if (typeof html2canvas === 'undefined') {
      toast('html2canvas not loaded — PNG export unavailable', 'error');
      return;
    }
    try {
      const el = document.getElementById(elementId);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      canvas.toBlob(blob => trigger(blob, filename), 'image/png');
    } catch(e) {
      toast('PNG export failed: ' + e.message, 'error');
    }
  }

  /* ---- HELPER ---- */
  function trigger(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { downloadCSV, downloadJSON, downloadTXT, print, downloadPNG };
})();

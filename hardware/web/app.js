// ──────────────────────────────────────────────────────────
// ESP32 Access Control - frontend logic
//
// This file is intentionally the ONLY place that knows how each
// page looks. It talks to the device purely through the JSON API
// (/api/...). If this UI gets replaced later, the firmware side
// (main.cpp) does not need to change - it just needs to keep
// serving the same /api/* endpoints.
// ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home')   initHome();
  if (page === 'enroll') initEnroll();
  if (page === 'auth')   initAuth();
});

// ── HOME PAGE ──────────────────────────────────────────────
function initHome() {
  function poll() {
    fetch('/api/status').then(r => r.json()).then(s => {
      const modeText = s.mode === 1 ? 'Enrollment System'
                      : s.mode === 2 ? 'Authorization System'
                      : 'None selected';
      document.getElementById('modeIndicator').textContent =
        `Mode: ${modeText} | Users: ${s.dbCount}`;
      document.getElementById('dbSummary').textContent =
        `Enrolled records: ${s.dbCount} / ${s.maxUsers}`;

      const preview = document.getElementById('screenPreview');
      if (s.mode === 1) {
        fetch('/api/enroll/state').then(r => r.json()).then(e => {
          preview.innerHTML = `[ ENROLLMENT MODE ]<br>State: ${e.state}<br>Users: ${s.dbCount}`;
        });
      } else if (s.mode === 2) {
        fetch('/api/auth/state').then(r => r.json()).then(a => {
          preview.innerHTML = `[ AUTH MODE ]<br>Users: ${s.dbCount}<br>State: ${a.state}`;
        });
      } else {
        preview.innerHTML = `[ IDLE ]<br>Select a mode below<br>IP: ${s.ip}`;
      }
    }).finally(() => setTimeout(poll, 1000));
  }
  poll();
}

// ── ENROLLMENT PAGE ────────────────────────────────────────
function initEnroll() {
  const labels = {
    idle:       { title: 'Ready',           sub: 'Press the button to place finger for scan 1.', prog: 0,   cls: '' },
    scan1_done: { title: 'Scan 1 Captured', sub: 'Lift finger. Press button for scan 2.',        prog: 33,  cls: 'scan' },
    scan2_done: { title: 'Scan 2 Captured', sub: 'Processing - please wait.',                    prog: 60,  cls: 'scan' },
    processing: { title: 'Processing',      sub: 'Combining both templates into unique ID...',   prog: 75,  cls: 'proc' },
    storing:    { title: 'Saving to DB',    sub: 'Writing fingerprint record to database.',      prog: 95,  cls: 'ok' },
    done:       { title: 'Enrolled!',       sub: 'Success - closing in 2 seconds.',              prog: 100, cls: 'ok' },
    failed:     { title: 'Failed',          sub: 'Timed out or error. Press Retry to try again.',prog: 0,   cls: 'fail' },
  };

  function loadUserList() {
    fetch('/api/users').then(r => r.json()).then(list => {
      document.getElementById('userCount').textContent = list.length;
      const container = document.getElementById('userList');
      if (list.length === 0) {
        container.innerHTML = "<p style='color:#6a5030'>No records yet.</p>";
        return;
      }
      container.innerHTML = list.map(u =>
        `<div class="db-row"><span>${u.name}</span><span class="uid">${u.uid}</span></div>`
      ).join('');
    });
  }

  function updatePopup(s) {
    const info = labels[s.state] || labels['idle'];
    document.getElementById('popTitle').textContent = info.title;
    document.getElementById('popSub').textContent   = info.sub;
    document.getElementById('progBar').style.width  = info.prog + '%';
    const sl = document.getElementById('statusLine');
    sl.textContent = 'state: ' + s.state;
    sl.className   = 'status-line ' + info.cls;

    const btn = document.getElementById('scanBtn');
    btn.disabled = false;

    if (s.state === 'idle') {
      btn.textContent = 'Scan 1 - Place Finger';
      btn.onclick = () => fetch('/api/enroll/scan1').then(pollState);
    } else if (s.state === 'scan1_done') {
      btn.textContent = 'Scan 2 - Place Finger';
      btn.onclick = () => fetch('/api/enroll/scan2').then(pollState);
    } else if (s.state === 'scan2_done' || s.state === 'processing' || s.state === 'storing') {
      btn.textContent = 'Processing...';
      btn.disabled = true;
    } else if (s.state === 'failed') {
      btn.textContent = 'Retry';
      btn.onclick = () => fetch('/api/enroll/reset').then(pollState);
    } else {
      btn.textContent = '...';
      btn.disabled = true;
    }

    if (s.state === 'done') {
      loadUserList();
      setTimeout(closePopup, 2000);
    }
  }

  function pollState() {
    fetch('/api/enroll/state').then(r => r.json()).then(s => {
      updatePopup(s);
      if (s.state !== 'done' && s.state !== 'failed') {
        setTimeout(pollState, 600);
      }
    }).catch(() => setTimeout(pollState, 1000));
  }

  function openPopup(name) {
    if (!name.trim()) { alert('Enter a name first.'); return; }
    fetch('/api/enroll/start?name=' + encodeURIComponent(name)).then(() => {
      document.getElementById('overlay').style.display = 'flex';
      pollState();
    });
  }

  function closePopup() {
    fetch('/api/enroll/reset');
    document.getElementById('overlay').style.display = 'none';
    loadUserList();
  }

  document.getElementById('enrollBtn').addEventListener('click', () => {
    openPopup(document.getElementById('nameField').value);
  });
  document.getElementById('cancelBtn').addEventListener('click', closePopup);

  loadUserList();
}

// ── AUTHORIZATION PAGE ─────────────────────────────────────
function initAuth() {
  const stateLabels = {
    idle:         { title: 'Ready',               cls: '' },
    waiting_scan: { title: 'Waiting for scan...',  cls: 'scan' },
    scanning:     { title: 'Scanning...',          cls: 'scan' },
    processing:   { title: 'Processing scan...',   cls: 'proc' },
    verifying:    { title: 'Verifying ID...',      cls: 'proc' },
    granted:      { title: 'ACCESS GRANTED',       cls: 'ok' },
    denied:       { title: 'ACCESS DENIED',        cls: 'fail' },
    alarm:        { title: 'ALARM ACTIVE',         cls: 'fail' },
  };
  const busyStates = ['waiting_scan', 'scanning', 'processing', 'verifying'];

  function loadUsers() {
    fetch('/api/users').then(r => r.json()).then(list => {
      document.getElementById('userCount').textContent = list.length;
      const sel = document.getElementById('uidSelect');
      sel.innerHTML = "<option value=''>-- select enrolled ID --</option>";
      list.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.uid;
        opt.textContent = u.name + ' (' + u.uid + ')';
        sel.appendChild(opt);
      });
    });
  }

  function fillFromSelect() {
    const sel = document.getElementById('uidSelect');
    if (sel.value) document.getElementById('uidField').value = sel.value;
  }

  function checkAuth() {
    const uid = document.getElementById('uidField').value.trim();
    if (!uid) { alert('Enter or select a UID first.'); return; }
    document.getElementById('checkBtn').disabled = true;
    fetch('/api/auth/check?uid=' + encodeURIComponent(uid));
  }

  function pollAuth() {
    fetch('/api/auth/state').then(r => r.json()).then(s => {
      const info = stateLabels[s.state] || stateLabels['idle'];
      const box = document.getElementById('authResult');
      box.textContent = info.title;
      box.className = 'status-line ' + info.cls;

      document.getElementById('attemptsLine').textContent =
        'Failed attempts: ' + s.attempts + ' / ' + s.maxAttempts;

      const alarmLine = document.getElementById('alarmLine');
      if (s.state === 'alarm') {
        alarmLine.style.display = 'block';
        alarmLine.textContent = 'ALARM ACTIVE - auto-resets in ' + s.alarmRemaining + 's';
      } else {
        alarmLine.style.display = 'none';
      }

      const btn = document.getElementById('checkBtn');
      btn.disabled = busyStates.includes(s.state) || s.state === 'alarm';

      setTimeout(pollAuth, 500);
    }).catch(() => setTimeout(pollAuth, 1000));
  }

  document.getElementById('uidSelect').addEventListener('change', fillFromSelect);
  document.getElementById('checkBtn').addEventListener('click', checkAuth);

  loadUsers();
  pollAuth();
}

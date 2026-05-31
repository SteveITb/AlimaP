// ─────────────────────────────────────────────────────────────────────────────
//  main.js  – localStorage mode | GitHub Pages compatible
//  Features: Projects CRUD + photo upload + CV upload + project image editing
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_PASS   = 'water2024';
const STORAGE_KEY  = 'alima_projects';
const PHOTO_KEY    = 'alima_hero_photo';
const CV_KEY       = 'alima_cv';
const AUTH_KEY     = 'alima_authed';

let currentFilter  = 'all';
let projImageFiles = [];
let editImageFiles = [];
let isAdmin        = false;
let editingId      = null;

// ── Default projects ──────────────────────────────────────────────────────────
const DEFAULT_PROJECTS = [
  { id:1, name:'Thwake Multi-Purpose Dam', level:'national', county:'Makueni / Kitui', year:'2018–2025', desc:'A major infrastructure project providing water for irrigation, hydropower, and domestic use to over 1.2 million Kenyans in the lower Eastern region.', budget:'KES 65 Billion', status:'Ongoing', images:[] },
  { id:2, name:'Nairobi Rivers Basin Rehabilitation', level:'national', county:'Nairobi County', year:'2021–2023', desc:'Comprehensive rehabilitation of the Nairobi, Ngong, Mathare and Gitathuru rivers covering 800 km of channels serving 4 million urban residents.', budget:'KES 18 Billion', status:'Completed', images:[] },
  { id:3, name:'Turkana County WASH Programme', level:'county', county:'Turkana County', year:'2020–2023', desc:'Installation of solar-powered borehole systems, water kiosks, and sanitation facilities in 47 villages across Turkana, benefiting 280,000 pastoralist communities.', budget:'KES 3.2 Billion', status:'Completed', images:[] },
  { id:4, name:'Mwache Dam – Mombasa Water Supply', level:'national', county:'Kwale / Mombasa', year:'2019–2025', desc:'Construction of Mwache Dam to provide a sustainable long-term water supply to over 3 million residents of Mombasa and the surrounding Coast region counties.', budget:'KES 32 Billion', status:'Ongoing', images:[] },
  { id:5, name:'Laikipia Water Security Project', level:'county', county:'Laikipia County', year:'2022–2024', desc:'Construction of 12 earth dams, 8 water pans, and a reticulation network serving smallholder farmers and wildlife conservancies across Laikipia County.', budget:'KES 1.8 Billion', status:'Completed', images:[] },
  { id:6, name:'National Water Metering Programme', level:'national', county:'Countrywide', year:'2023–2025', desc:'Nationwide rollout of smart water meters across 14 major urban water utilities to reduce non-revenue water losses from 42% to below 20%.', budget:'KES 8.5 Billion', status:'Ongoing', images:[] },
  { id:7, name:"Murang'a County Rural Water Supply", level:'county', county:"Murang'a County", year:'2021–2023', desc:'Piped water extension to 38 villages serving over 95,000 rural households through gravity-fed schemes tapping the Aberdare ranges.', budget:'KES 980 Million', status:'Completed', images:[] },
  { id:8, name:'Lower Nzoia Irrigation Scheme', level:'national', county:'Siaya / Kisumu', year:'2020–2024', desc:'Expansion of the Lower Nzoia irrigation scheme adding 3,000 ha of irrigated land to boost food security for smallholder farmers in the lake basin region.', budget:'KES 12 Billion', status:'Ongoing', images:[] }
];

// ── Storage ───────────────────────────────────────────────────────────────────
function loadProjects() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  return DEFAULT_PROJECTS;
}
function saveProjects(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  const savedPhoto = localStorage.getItem(PHOTO_KEY);
  if (savedPhoto) showHeroPhoto(savedPhoto);
  if (localStorage.getItem(AUTH_KEY) === '1') isAdmin = true;
  updateNavAdminBtn();
  renderAll();
  initCVButton();
});

// ── CV button ─────────────────────────────────────────────────────────────────
function initCVButton() {
  const cvData = localStorage.getItem(CV_KEY);
  const btn    = document.getElementById('cv-download-btn');
  if (!btn) return;
  if (cvData) {
    btn.href     = cvData;
    btn.download = 'Samuel-Alima-CV.pdf';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent = '⬇ Download Full CV (PDF)';
  } else {
    btn.href     = '#';
    btn.style.opacity = '0.45';
    btn.style.pointerEvents = 'none';
    btn.textContent = '⬇ CV Not Uploaded Yet';
  }
}

// ── Nav button ────────────────────────────────────────────────────────────────
function updateNavAdminBtn() {
  const btn = document.getElementById('nav-admin-btn');
  if (isAdmin) { btn.textContent = 'Admin Panel'; btn.onclick = openAdmin; }
  else         { btn.textContent = 'Admin Login'; btn.onclick = openLogin; }
}

// ── Hero photo ────────────────────────────────────────────────────────────────
function showHeroPhoto(src) {
  const img = document.getElementById('hero-photo-img');
  const ph  = document.getElementById('photo-placeholder');
  img.src = src; img.style.display = 'block'; ph.style.display = 'none';
}
function uploadProfilePhoto(event) {
  const file = event.target.files[0]; if (!file) return;
  const fb = document.getElementById('photo-upload-feedback');
  fb.textContent = 'Uploading…'; fb.style.display = 'block';
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem(PHOTO_KEY, e.target.result);
    showHeroPhoto(e.target.result);
    const prev = document.getElementById('hero-photo-preview');
    prev.src = e.target.result;
    document.getElementById('hero-photo-preview-wrap').style.display = 'block';
    fb.textContent = '✓ Photo updated on the homepage!'; fb.style.color = '#0f6e56';
  };
  reader.readAsDataURL(file);
}

// ── CV upload ─────────────────────────────────────────────────────────────────
function uploadCV(event) {
  const file = event.target.files[0]; if (!file) return;
  const fb = document.getElementById('cv-upload-feedback');
  if (file.type !== 'application/pdf') {
    fb.textContent = '✗ Please upload a PDF file only.'; fb.style.color = '#a32d2d'; fb.style.display = 'block'; return;
  }
  if (file.size > 10 * 1024 * 1024) {
    fb.textContent = '✗ File too large. Max 10MB.'; fb.style.color = '#a32d2d'; fb.style.display = 'block'; return;
  }
  fb.textContent = 'Uploading CV…'; fb.style.color = '#185fa5'; fb.style.display = 'block';
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem(CV_KEY, e.target.result);
    initCVButton();
    fb.textContent = `✓ CV uploaded: ${file.name}`; fb.style.color = '#0f6e56';
    document.getElementById('cv-filename').textContent = file.name;
    document.getElementById('cv-current-wrap').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function deleteCV() {
  if (!confirm('Remove the uploaded CV? Visitors will no longer be able to download it.')) return;
  localStorage.removeItem(CV_KEY);
  initCVButton();
  document.getElementById('cv-current-wrap').style.display = 'none';
  document.getElementById('cv-upload-feedback').textContent = 'CV removed.';
  document.getElementById('cv-upload-feedback').style.color = '#a32d2d';
  document.getElementById('cv-upload-feedback').style.display = 'block';
}

// ── Render projects ───────────────────────────────────────────────────────────
function renderAll() {
  const projects = loadProjects();
  document.getElementById('stat-projects').textContent = projects.length;
  renderCards(projects);
}

function renderCards(all) {
  const grid     = document.getElementById('projects-grid');
  const filtered = currentFilter === 'all' ? all : all.filter(p => p.level === currentFilter);
  if (!filtered.length) { grid.innerHTML = '<div class="no-projects"><p>No projects in this category yet.</p></div>'; return; }

  grid.innerHTML = filtered.map(p => {
    const imgEl = (p.images && p.images.length)
      ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy">`
      : `<div class="no-img"><svg viewBox="0 0 24 24"><path d="M21 15l-5-5L10 15l-4-4L2 15V5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10zM14.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S16 10.83 16 10s-.67-1.5-1.5-1.5z"/></svg><span>No photo yet</span></div>`;
    const lvlClass = p.level === 'national' ? 'national' : '';
    const lvlLabel = p.level === 'national' ? 'National' : 'County Level';
    const stCls = p.status==='Completed' ? 'status-done' : p.status==='Ongoing' ? 'status-active' : 'status-plan';
    const adminBtns = isAdmin ? `
      <div class="card-admin-btns">
        <button class="card-edit-btn"   onclick="openEditModal(${p.id})">✏ Edit</button>
        <button class="card-delete-btn" onclick="deleteProject(${p.id})">🗑 Delete</button>
      </div>` : '';
    return `
      <div class="project-card" id="card-${p.id}">
        <div class="card-img">${imgEl}<span class="card-level ${lvlClass}">${lvlLabel}</span></div>
        <div class="card-body">
          ${p.county ? `<div class="county">${p.county}</div>` : ''}
          <h4>${p.name}</h4>
          <p class="desc">${p.desc}</p>
          <div class="card-meta">
            ${p.year   ? `<span>📅 ${p.year}</span>`   : ''}
            ${p.budget ? `<span>💰 ${p.budget}</span>` : ''}
            ${p.status ? `<span class="${stCls}">● ${p.status}</span>` : ''}
          </div>
          ${adminBtns}
        </div>
      </div>`;
  }).join('');
}

// ── Filter ────────────────────────────────────────────────────────────────────
function filterProjects(level, btn) {
  currentFilter = level;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}

// ── Delete project ────────────────────────────────────────────────────────────
function deleteProject(id) {
  if (!confirm('Permanently delete this project?')) return;
  saveProjects(loadProjects().filter(p => p.id !== id));
  renderAll(); refreshManageList();
}

// ── Add project ───────────────────────────────────────────────────────────────
function addProject() {
  const name   = document.getElementById('proj-name').value.trim();
  const level  = document.getElementById('proj-level').value;
  const county = document.getElementById('proj-county').value.trim();
  const year   = document.getElementById('proj-year').value.trim();
  const desc   = document.getElementById('proj-desc').value.trim();
  const budget = document.getElementById('proj-budget').value.trim();
  const status = document.getElementById('proj-status').value;
  const fb     = document.getElementById('proj-feedback');
  if (!name || !desc) { showFeedback(fb, '⚠ Project Name and Description are required.', 'err'); return; }

  const btn = document.getElementById('add-proj-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  Promise.all(projImageFiles.map(f => readFile(f))).then(images => {
    const projects = loadProjects();
    projects.unshift({ id: Date.now(), name, level, county, year, desc, budget, status, images: images.filter(Boolean) });
    saveProjects(projects);
    renderAll(); refreshManageList();
    ['proj-name','proj-county','proj-year','proj-desc','proj-budget'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('proj-imgs').value = '';
    document.getElementById('proj-img-previews').innerHTML = '';
    projImageFiles = [];
    showFeedback(fb, '✓ Project added successfully!', 'ok');
    btn.disabled = false; btn.textContent = '✚ Add Project to Portfolio';
  });
}

// ── Edit project modal ────────────────────────────────────────────────────────
function openEditModal(id) {
  const projects = loadProjects();
  const p = projects.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  editImageFiles = [];

  document.getElementById('edit-proj-name').value   = p.name;
  document.getElementById('edit-proj-level').value  = p.level;
  document.getElementById('edit-proj-county').value = p.county;
  document.getElementById('edit-proj-year').value   = p.year;
  document.getElementById('edit-proj-desc').value   = p.desc;
  document.getElementById('edit-proj-budget').value = p.budget;
  document.getElementById('edit-proj-status').value = p.status;

  // Show existing images
  const existingWrap = document.getElementById('edit-existing-imgs');
  existingWrap.innerHTML = p.images.length
    ? p.images.map((src, i) => `
        <div class="img-preview-item" id="eimg-${i}">
          <img src="${src}" alt="img">
          <button class="remove-img" onclick="removeExistingImg(${id},${i})" type="button">✕</button>
        </div>`).join('')
    : '<p style="color:var(--txt-mute);font-size:.82rem;">No photos yet — upload below.</p>';

  document.getElementById('edit-feedback').style.display = 'none';
  document.getElementById('edit-new-previews').innerHTML = '';
  document.getElementById('edit-proj-imgs').value = '';
  document.getElementById('edit-modal-overlay').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal-overlay').classList.remove('open');
  editingId = null; editImageFiles = [];
}

function removeExistingImg(projectId, imgIdx) {
  const projects = loadProjects();
  const p = projects.find(x => x.id === projectId);
  if (!p) return;
  p.images.splice(imgIdx, 1);
  saveProjects(projects);
  openEditModal(projectId); // refresh modal
}

function previewEditImages(event) {
  editImageFiles = Array.from(event.target.files);
  const preview  = document.getElementById('edit-new-previews');
  preview.innerHTML = '';
  editImageFiles.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.className = 'img-preview-item'; wrap.id = `eprev-${idx}`;
    wrap.innerHTML = `<img src="${url}" alt="preview"><button class="remove-img" onclick="removeNewEditImg(${idx})" type="button">✕</button>`;
    preview.appendChild(wrap);
  });
}

function removeNewEditImg(idx) {
  editImageFiles.splice(idx, 1);
  document.getElementById(`eprev-${idx}`)?.remove();
}

function saveEdit() {
  if (!editingId) return;
  const fb = document.getElementById('edit-feedback');
  const btn = document.getElementById('save-edit-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  Promise.all(editImageFiles.map(f => readFile(f))).then(newImages => {
    const projects = loadProjects();
    const p = projects.find(x => x.id === editingId);
    if (!p) return;

    p.name   = document.getElementById('edit-proj-name').value.trim()   || p.name;
    p.level  = document.getElementById('edit-proj-level').value;
    p.county = document.getElementById('edit-proj-county').value.trim();
    p.year   = document.getElementById('edit-proj-year').value.trim();
    p.desc   = document.getElementById('edit-proj-desc').value.trim()   || p.desc;
    p.budget = document.getElementById('edit-proj-budget').value.trim();
    p.status = document.getElementById('edit-proj-status').value;
    p.images = [...(p.images || []), ...newImages.filter(Boolean)];

    saveProjects(projects);
    renderAll(); refreshManageList();
    showFeedback(fb, '✓ Project updated!', 'ok');
    btn.disabled = false; btn.textContent = '💾 Save Changes';
    setTimeout(closeEditModal, 1200);
  });
}

// ── Manage list ───────────────────────────────────────────────────────────────
function refreshManageList() {
  const list  = document.getElementById('project-manage-list');
  const noMsg = document.getElementById('no-proj-msg');
  if (!list) return;
  const projects = loadProjects();
  if (!projects.length) { list.innerHTML = ''; if (noMsg) noMsg.style.display = 'block'; return; }
  if (noMsg) noMsg.style.display = 'none';
  list.innerHTML = projects.map(p => `
    <div class="project-list-item">
      <span class="pli-thumb">${p.images && p.images.length ? `<img src="${p.images[0]}" alt="">` : '📷'}</span>
      <span class="pli-name">${p.name}</span>
      <span class="pli-badge ${p.level}">${p.level === 'national' ? 'National' : 'County'}</span>
      <button class="pli-edit-btn" onclick="openEditModal(${p.id}); closeAdmin();">✏ Edit</button>
      <button class="pli-del-btn"  onclick="deleteProject(${p.id})">🗑</button>
    </div>`).join('');
}

// ── Image preview (add form) ──────────────────────────────────────────────────
function previewProjectImages(event) {
  projImageFiles = Array.from(event.target.files);
  const preview = document.getElementById('proj-img-previews');
  preview.innerHTML = '';
  projImageFiles.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.className = 'img-preview-item'; wrap.id = `prev-${idx}`;
    wrap.innerHTML = `<img src="${url}" alt="preview"><button class="remove-img" onclick="removePreview(${idx})" type="button">✕</button>`;
    preview.appendChild(wrap);
  });
}
function removePreview(idx) { projImageFiles.splice(idx,1); document.getElementById(`prev-${idx}`)?.remove(); }

// ── Helpers ───────────────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.readAsDataURL(file);
  });
}
function showFeedback(el, msg, type) {
  el.textContent = msg;
  el.className   = type === 'ok' ? 'feedback-ok' : 'feedback-err';
  el.style.display = 'block';
  if (type === 'ok') setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ── Login ─────────────────────────────────────────────────────────────────────
function openLogin() {
  document.getElementById('login-overlay').classList.add('open');
  document.getElementById('login-password').value = '';
  document.getElementById('login-err').style.display = 'none';
  setTimeout(() => document.getElementById('login-password').focus(), 100);
}
function closeLogin() { document.getElementById('login-overlay').classList.remove('open'); }
function doLogin() {
  const pw = document.getElementById('login-password').value;
  if (pw === ADMIN_PASS) {
    isAdmin = true; localStorage.setItem(AUTH_KEY,'1');
    closeLogin(); openAdmin(); updateNavAdminBtn(); renderAll();
  } else {
    const e = document.getElementById('login-err');
    e.textContent = 'Incorrect password. Please try again.'; e.style.display = 'block';
    document.getElementById('login-password').value = ''; document.getElementById('login-password').focus();
  }
}

// ── Admin panel ───────────────────────────────────────────────────────────────
function openAdmin() {
  // Show current CV status
  const cvData = localStorage.getItem(CV_KEY);
  const cvWrap = document.getElementById('cv-current-wrap');
  if (cvData && cvWrap) {
    document.getElementById('cv-filename').textContent = 'Uploaded CV (click Download CV on site to verify)';
    cvWrap.style.display = 'flex';
  }
  document.getElementById('admin-overlay').classList.add('open');
  refreshManageList(); switchTab('add-project');
}
function closeAdmin() { document.getElementById('admin-overlay').classList.remove('open'); }
function doLogout() { isAdmin = false; localStorage.removeItem(AUTH_KEY); closeAdmin(); updateNavAdminBtn(); renderAll(); }

function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + tab));
  if (tab === 'manage-projects') refreshManageList();
}

// ── Contact ───────────────────────────────────────────────────────────────────
function submitContact() {
  const name  = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const msg   = document.getElementById('contact-msg').value.trim();
  if (!name || !email || !msg) { alert('Please fill in all fields before sending.'); return; }
  alert(`Thank you, ${name}!\nYour message has been received. The office will respond within 3 working days.`);
  ['contact-name','contact-email','contact-org','contact-msg'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}

// ── Keyboard & backdrop ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLogin(); closeAdmin(); closeEditModal(); }
  if (e.key === 'Enter' && document.getElementById('login-overlay').classList.contains('open')) doLogin();
});
['login-overlay','admin-overlay','edit-modal-overlay'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', e => {
    if (e.target.id === id) { if(id==='login-overlay') closeLogin(); else if(id==='admin-overlay') closeAdmin(); else closeEditModal(); }
  });
});

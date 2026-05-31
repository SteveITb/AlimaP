// ─────────────────────────────────────────────────────────────────────────────
//  admin.js  –  Powers manage.html only. Never loaded on the public site.
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_PASS  = 'water2024';
const STORAGE_KEY = 'alima_projects';
const PHOTO_KEY   = 'alima_hero_photo';
const CV_KEY      = 'alima_cv';
const AUTH_KEY    = 'alima_authed';

let editingId      = null;
let addImageFiles  = [];
let editImageFiles = [];

// ── Default projects (seeded on first visit) ──────────────────────────────────
const DEFAULT_PROJECTS = [
  { id:1,  name:'Thwake Multi-Purpose Dam',            level:'national', county:'Makueni / Kitui',  year:'2018–2025', desc:'A major infrastructure project providing water for irrigation, hydropower, and domestic use to over 1.2 million Kenyans in the lower Eastern region.',                                                budget:'KES 65 Billion',  status:'Ongoing',   images:[] },
  { id:2,  name:'Nairobi Rivers Basin Rehabilitation',  level:'national', county:'Nairobi County',   year:'2021–2023', desc:'Comprehensive rehabilitation of the Nairobi, Ngong, Mathare and Gitathuru rivers covering 800 km of channels serving 4 million urban residents.',                                                  budget:'KES 18 Billion',  status:'Completed', images:[] },
  { id:3,  name:'Turkana County WASH Programme',        level:'county',   county:'Turkana County',   year:'2020–2023', desc:'Installation of solar-powered borehole systems, water kiosks, and sanitation facilities in 47 villages across Turkana, benefiting 280,000 pastoralist communities.',                              budget:'KES 3.2 Billion', status:'Completed', images:[] },
  { id:4,  name:'Mwache Dam – Mombasa Water Supply',    level:'national', county:'Kwale / Mombasa',  year:'2019–2025', desc:'Construction of Mwache Dam to provide a sustainable long-term water supply to over 3 million residents of Mombasa and the surrounding Coast region counties.',                                    budget:'KES 32 Billion',  status:'Ongoing',   images:[] },
  { id:5,  name:'Laikipia Water Security Project',      level:'county',   county:'Laikipia County',  year:'2022–2024', desc:'Construction of 12 earth dams, 8 water pans, and a reticulation network serving smallholder farmers and wildlife conservancies across Laikipia County.',                                         budget:'KES 1.8 Billion', status:'Completed', images:[] },
  { id:6,  name:'National Water Metering Programme',    level:'national', county:'Countrywide',      year:'2023–2025', desc:'Nationwide rollout of smart water meters across 14 major urban water utilities to reduce non-revenue water losses from 42% to below 20%.',                                                        budget:'KES 8.5 Billion', status:'Ongoing',   images:[] },
  { id:7,  name:"Murang'a County Rural Water Supply",   level:'county',   county:"Murang'a County",  year:'2021–2023', desc:"Piped water extension to 38 villages serving over 95,000 rural households through gravity-fed schemes tapping the Aberdare ranges.",                                                             budget:'KES 980 Million', status:'Completed', images:[] },
  { id:8,  name:'Lower Nzoia Irrigation Scheme',        level:'national', county:'Siaya / Kisumu',   year:'2020–2024', desc:'Expansion of the Lower Nzoia irrigation scheme adding 3,000 ha of irrigated land to boost food security for smallholder farmers in the lake basin region.',                                     budget:'KES 12 Billion',  status:'Ongoing',   images:[] }
];

// ── Storage helpers ───────────────────────────────────────────────────────────
function loadProjects() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  return DEFAULT_PROJECTS;
}
function saveProjects(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, skip login screen
  if (localStorage.getItem(AUTH_KEY) === '1') {
    showDashboard();
  }
  // Enter key on password field
  document.getElementById('admin-pw')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doAdminLogin();
  });
  // Escape closes edit modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeEditModal();
  });
  // Backdrop click closes edit modal
  document.getElementById('edit-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'edit-modal-overlay') closeEditModal();
  });
});

// ── Login / logout ────────────────────────────────────────────────────────────
function doAdminLogin() {
  const pw  = document.getElementById('admin-pw').value;
  const err = document.getElementById('admin-err');
  if (pw === ADMIN_PASS) {
    localStorage.setItem(AUTH_KEY, '1');
    err.style.display = 'none';
    showDashboard();
  } else {
    err.style.display = 'block';
    document.getElementById('admin-pw').value = '';
    document.getElementById('admin-pw').focus();
  }
}

function doAdminLogout() {
  localStorage.removeItem(AUTH_KEY);
  document.getElementById('admin-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-pw').value = '';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-screen').style.display = 'block';
  refreshStats();
  refreshManageList();
  loadCurrentCV();
  loadCurrentPhoto();
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
function refreshStats() {
  const projects = loadProjects();
  document.getElementById('d-stat-total').textContent    = projects.length;
  document.getElementById('d-stat-national').textContent = projects.filter(p => p.level === 'national').length;
  document.getElementById('d-stat-county').textContent   = projects.filter(p => p.level === 'county').length;
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchProjTab(tab) {
  document.querySelectorAll('.proj-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.proj-pane').forEach(p => p.classList.toggle('active', p.id === 'ptab-' + tab));
  if (tab === 'manage') refreshManageList();
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
  const fb     = document.getElementById('add-proj-feedback');

  if (!name || !desc) { showFeedback(fb, '⚠ Project Name and Description are required.', 'err'); return; }

  const btn = document.getElementById('add-proj-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  Promise.all(addImageFiles.map(readFile)).then(images => {
    const projects = loadProjects();
    projects.unshift({ id: Date.now(), name, level, county, year, desc, budget, status, images: images.filter(Boolean) });
    saveProjects(projects);
    refreshStats();
    refreshManageList();

    // Reset form
    ['proj-name','proj-county','proj-year','proj-desc','proj-budget']
      .forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('proj-imgs').value = '';
    document.getElementById('proj-img-previews').innerHTML = '';
    addImageFiles = [];

    showFeedback(fb, '✓ Project added! Visible on the public site now.', 'ok');
    btn.disabled = false; btn.textContent = '✚ Add Project to Portfolio';
  });
}

// ── Manage list ───────────────────────────────────────────────────────────────
function refreshManageList() {
  const list  = document.getElementById('proj-manage-list');
  const noMsg = document.getElementById('no-proj-msg');
  const projects = loadProjects();

  if (!projects.length) {
    list.innerHTML = ''; noMsg.style.display = 'block'; return;
  }
  noMsg.style.display = 'none';
  list.innerHTML = projects.map(p => `
    <div class="project-list-item">
      <div class="pli-thumb">
        ${p.images && p.images.length ? `<img src="${p.images[0]}" alt="">` : '📷'}
      </div>
      <span class="pli-name">${p.name}</span>
      <span class="pli-badge ${p.level}">${p.level === 'national' ? 'National' : 'County'}</span>
      <button class="pli-edit-btn" onclick="openEditModal(${p.id})">✏ Edit</button>
      <button class="pli-del-btn"  onclick="deleteProject(${p.id})">🗑</button>
    </div>`).join('');
}

// ── Delete project ────────────────────────────────────────────────────────────
function deleteProject(id) {
  if (!confirm('Permanently delete this project from the site?')) return;
  saveProjects(loadProjects().filter(p => p.id !== id));
  refreshStats();
  refreshManageList();
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEditModal(id) {
  const p = loadProjects().find(x => x.id === id);
  if (!p) return;
  editingId      = id;
  editImageFiles = [];

  document.getElementById('edit-name').value   = p.name   || '';
  document.getElementById('edit-level').value  = p.level  || 'national';
  document.getElementById('edit-county').value = p.county || '';
  document.getElementById('edit-year').value   = p.year   || '';
  document.getElementById('edit-desc').value   = p.desc   || '';
  document.getElementById('edit-budget').value = p.budget || '';
  document.getElementById('edit-status').value = p.status || 'Ongoing';

  // Existing photos
  const wrap = document.getElementById('edit-existing-imgs');
  wrap.innerHTML = (p.images && p.images.length)
    ? p.images.map((src, i) => `
        <div class="img-preview-item" id="eimg-${i}">
          <img src="${src}" alt="photo ${i+1}">
          <button class="remove-img" onclick="removeExistingImg(${id},${i})" type="button">✕</button>
        </div>`).join('')
    : '<p style="color:var(--txt-mute);font-size:.82rem;margin:0;">No photos yet — upload below.</p>';

  document.getElementById('edit-feedback').style.display = 'none';
  document.getElementById('edit-new-previews').innerHTML = '';
  document.getElementById('edit-imgs').value = '';

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
  // Refresh just the existing images panel
  const wrap = document.getElementById('edit-existing-imgs');
  wrap.innerHTML = p.images.length
    ? p.images.map((src, i) => `
        <div class="img-preview-item" id="eimg-${i}">
          <img src="${src}" alt="photo ${i+1}">
          <button class="remove-img" onclick="removeExistingImg(${projectId},${i})" type="button">✕</button>
        </div>`).join('')
    : '<p style="color:var(--txt-mute);font-size:.82rem;margin:0;">No photos — upload below.</p>';
  refreshManageList();
}

function saveEdit() {
  if (!editingId) return;
  const name = document.getElementById('edit-name').value.trim();
  const desc = document.getElementById('edit-desc').value.trim();
  const fb   = document.getElementById('edit-feedback');
  if (!name || !desc) { showFeedback(fb, '⚠ Name and Description are required.', 'err'); return; }

  const btn = document.getElementById('save-edit-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  Promise.all(editImageFiles.map(readFile)).then(newImgs => {
    const projects = loadProjects();
    const p = projects.find(x => x.id === editingId);
    if (!p) return;
    p.name   = name;
    p.level  = document.getElementById('edit-level').value;
    p.county = document.getElementById('edit-county').value.trim();
    p.year   = document.getElementById('edit-year').value.trim();
    p.desc   = desc;
    p.budget = document.getElementById('edit-budget').value.trim();
    p.status = document.getElementById('edit-status').value;
    p.images = [...(p.images || []), ...newImgs.filter(Boolean)];
    saveProjects(projects);
    refreshStats();
    refreshManageList();
    showFeedback(fb, '✓ Project updated! Changes are live on the public site.', 'ok');
    btn.disabled = false; btn.textContent = '💾 Save Changes';
    setTimeout(closeEditModal, 1500);
  });
}

// ── Image previews ────────────────────────────────────────────────────────────
function previewAddImages(event) {
  addImageFiles = Array.from(event.target.files);
  const preview = document.getElementById('proj-img-previews');
  preview.innerHTML = '';
  addImageFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    const div = document.createElement('div');
    div.className = 'img-preview-item'; div.id = `aprev-${i}`;
    div.innerHTML = `<img src="${url}" alt=""><button class="remove-img" onclick="removeAddImg(${i})" type="button">✕</button>`;
    preview.appendChild(div);
  });
}
function removeAddImg(i) {
  addImageFiles.splice(i, 1);
  document.getElementById(`aprev-${i}`)?.remove();
}

function previewEditImages(event) {
  editImageFiles = Array.from(event.target.files);
  const preview = document.getElementById('edit-new-previews');
  preview.innerHTML = '';
  editImageFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    const div = document.createElement('div');
    div.className = 'img-preview-item'; div.id = `eprev-${i}`;
    div.innerHTML = `<img src="${url}" alt=""><button class="remove-img" onclick="removeEditImg(${i})" type="button">✕</button>`;
    preview.appendChild(div);
  });
}
function removeEditImg(i) {
  editImageFiles.splice(i, 1);
  document.getElementById(`eprev-${i}`)?.remove();
}

// ── CV ────────────────────────────────────────────────────────────────────────
function loadCurrentCV() {
  const cv   = localStorage.getItem(CV_KEY);
  const wrap = document.getElementById('cv-current-wrap');
  if (cv) {
    document.getElementById('cv-filename').textContent = 'CV File (uploaded and active)';
    wrap.style.display = 'flex';
  } else {
    wrap.style.display = 'none';
  }
}

function uploadCV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fb = document.getElementById('cv-feedback');
  if (file.type !== 'application/pdf') { showEl(fb,'✗ PDF files only.','#a32d2d'); return; }
  if (file.size > 10*1024*1024)        { showEl(fb,'✗ Max file size is 10 MB.','#a32d2d'); return; }
  showEl(fb,'Uploading…','#185fa5');
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem(CV_KEY, e.target.result);
    document.getElementById('cv-filename').textContent = file.name;
    document.getElementById('cv-current-wrap').style.display = 'flex';
    showEl(fb, `✓ "${file.name}" uploaded. Visitors can now download it.`, '#0f6e56');
  };
  reader.readAsDataURL(file);
}

function deleteCV() {
  if (!confirm('Remove the CV? Visitors will no longer be able to download it.')) return;
  localStorage.removeItem(CV_KEY);
  document.getElementById('cv-current-wrap').style.display = 'none';
  showEl(document.getElementById('cv-feedback'), 'CV removed from the site.', '#a32d2d');
}

// ── Profile photo ─────────────────────────────────────────────────────────────
function loadCurrentPhoto() {
  const photo = localStorage.getItem(PHOTO_KEY);
  if (photo) {
    document.getElementById('photo-preview').src = photo;
    document.getElementById('photo-preview-wrap').style.display = 'block';
  }
}

function uploadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fb = document.getElementById('photo-feedback');
  showEl(fb, 'Uploading…', '#185fa5');
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem(PHOTO_KEY, e.target.result);
    document.getElementById('photo-preview').src = e.target.result;
    document.getElementById('photo-preview-wrap').style.display = 'block';
    showEl(fb, '✓ Photo updated! Now showing on the homepage.', '#0f6e56');
  };
  reader.readAsDataURL(file);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.readAsDataURL(file);
  });
}
function showFeedback(el, msg, type) {
  el.textContent   = msg;
  el.className     = type === 'ok' ? 'feedback-ok' : 'feedback-err';
  el.style.display = 'block';
  if (type === 'ok') setTimeout(() => { el.style.display = 'none'; }, 4000);
}
function showEl(el, msg, color) {
  el.textContent   = msg;
  el.style.color   = color;
  el.style.display = 'block';
}

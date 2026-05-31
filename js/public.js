// ─────────────────────────────────────────────────────────────────────────────
//  public.js  –  Public site only. Zero admin code. Read-only.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'alima_projects';
const PHOTO_KEY   = 'alima_hero_photo';
const CV_KEY      = 'alima_cv';

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

let currentFilter = 'all';

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // Load hero photo
  const photo = localStorage.getItem(PHOTO_KEY);
  if (photo) {
    document.getElementById('hero-photo-img').src = photo;
    document.getElementById('hero-photo-img').style.display = 'block';
    document.getElementById('photo-placeholder').style.display = 'none';
  }

  // Load CV button
  const cv = localStorage.getItem(CV_KEY);
  const btn = document.getElementById('cv-download-btn');
  if (cv && btn) {
    btn.href               = cv;
    btn.download           = 'Samuel-Alima-CV.pdf';
    btn.style.opacity      = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent        = '⬇ Download Full CV (PDF)';
  }

  // Load projects
  renderAll();
});

// ── Storage ───────────────────────────────────────────────────────────────────
function loadProjects() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  return DEFAULT_PROJECTS;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  const projects = loadProjects();
  document.getElementById('stat-projects').textContent = projects.length;
  const filtered = currentFilter === 'all' ? projects : projects.filter(p => p.level === currentFilter);
  const grid     = document.getElementById('projects-grid');

  if (!filtered.length) {
    grid.innerHTML = '<div class="no-projects"><p>No projects in this category yet.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const imgEl = (p.images && p.images.length)
      ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy">`
      : `<div class="no-img">
           <svg viewBox="0 0 24 24"><path d="M21 15l-5-5L10 15l-4-4L2 15V5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10zM14.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S16 10.83 16 10s-.67-1.5-1.5-1.5z"/></svg>
           <span>No photo yet</span>
         </div>`;
    const lvlClass = p.level === 'national' ? 'national' : '';
    const lvlLabel = p.level === 'national' ? 'National' : 'County Level';
    const stCls    = p.status === 'Completed' ? 'status-done'
                   : p.status === 'Ongoing'   ? 'status-active' : 'status-plan';
    return `
      <div class="project-card">
        <div class="card-img">
          ${imgEl}
          <span class="card-level ${lvlClass}">${lvlLabel}</span>
        </div>
        <div class="card-body">
          ${p.county ? `<div class="county">${p.county}</div>` : ''}
          <h4>${p.name}</h4>
          <p class="desc">${p.desc}</p>
          <div class="card-meta">
            ${p.year   ? `<span>📅 ${p.year}</span>`   : ''}
            ${p.budget ? `<span>💰 ${p.budget}</span>` : ''}
            ${p.status ? `<span class="${stCls}">● ${p.status}</span>` : ''}
          </div>
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

// ── Contact form ──────────────────────────────────────────────────────────────
function submitContact() {
  const name  = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const msg   = document.getElementById('contact-msg').value.trim();
  if (!name || !email || !msg) { alert('Please fill in all fields before sending.'); return; }
  alert(`Thank you, ${name}!\nYour message has been received. The office will respond within 3 working days.`);
  ['contact-name','contact-email','contact-org','contact-msg']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

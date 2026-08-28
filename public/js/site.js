/* ============================================================
   Bu fayl faqat INTERFEYS xatti-harakatlari uchun (statik qoladi).
   Haqiqiy MA'LUMOTLAR (narxlar, mashinalar, kunlik ishlar, oldin/keyin,
   video/rasm, izohlar, blog, sozlamalar) server tomonidan
   window.SITE_DATA orqali yuboriladi va admin paneldan (/admin)
   o'zgartiriladi.
   ============================================================ */

const SITE = window.SITE_DATA || { settings:{}, cars:[], reviews:[], blog:[], stories:[], beforeafter:[], media:[] };
const { settings, cars, reviews, blog, stories, beforeafter, media } = SITE;

/* ============================================================
   RENDER: Story strip (kunlik ishlar) — admin paneldan boshqariladi
   ============================================================ */
const storyTrack = document.getElementById('storyTrack');

if (stories.length === 0) {
  storyTrack.innerHTML = `<span style="font-size:13px; color:var(--ink-faint); padding:10px 0;">Hali kunlik ishlar qo'shilmagan — admin panelda "Kunlik ishlar" bo'limidan qo'shing.</span>`;
} else {
  stories.slice().reverse().forEach((s) => {
    const btn = document.createElement('button');
    btn.className = 'story-item';
    btn.innerHTML = `<span class="story-ring"><span class="story-thumb"><img src="${s.image}" alt="${s.label}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></span></span><span>${s.date || ''}</span>`;
    btn.onclick = () => openStory(s);
    storyTrack.appendChild(btn);
  });
}

function openStory(s){
  document.getElementById('storyModalMedia').innerHTML = `<img src="${s.image}" alt="${s.label}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  document.getElementById('storyModalTitle').textContent = s.label;
  document.getElementById('storyModalDesc').textContent = s.date || '';
  document.getElementById('storyModal').classList.add('show');
}
function closeStory(){ document.getElementById('storyModal').classList.remove('show'); }
document.getElementById('storyModal').addEventListener('click', e => { if(e.target.id==='storyModal') closeStory(); });

/* ============================================================
   RENDER: Car selector + per-car service dashboard panel
   ============================================================ */
const carGrid = document.getElementById('carGrid');
const servicePanel = document.getElementById('servicePanel');
const emptyHint = document.getElementById('emptyHint');
const cfCar = document.getElementById('cf-car');

cars.forEach(car => {
  const chip = document.createElement('button');
  chip.className = 'car-chip';
  chip.textContent = car.name;
  chip.onclick = () => selectCar(car, chip);
  carGrid.appendChild(chip);

  const opt = document.createElement('option');
  opt.value = car.name; opt.textContent = car.name;
  cfCar.appendChild(opt);
});

function fmt(n){ return Number(n).toLocaleString('ru-RU').replace(/,/g,' ') + " so'm"; }

function selectCar(car, chipEl){
  document.querySelectorAll('.car-chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  emptyHint.style.display = 'none';

  let rows = car.services.length
    ? car.services.map(s => `
      <div class="service-row">
        <div>
          <div class="service-name">${s.name}</div>
          <div class="service-desc">${s.desc}</div>
        </div>
        <div class="service-price mono">${s.price > 0 ? fmt(s.price) : "So'rov bo'yicha"}</div>
      </div>`).join('')
    : `<div class="service-row"><div class="service-desc">Bu model uchun hali xizmatlar kiritilmagan.</div></div>`;

  servicePanel.innerHTML = `
    <div class="panel-car-photo">
      <img src="${car.image}" alt="${car.name}" loading="lazy">
    </div>
    <div class="panel-head">
      <h3>${car.name} — xizmatlar va narxlar</h3>
      <span>DIAGNOSTIKA: YAKUNLANDI</span>
    </div>
    <div class="service-rows">${rows}</div>
    <div class="panel-note">* Narxlar taxminiy — avtomobil holati va material tanloviga qarab farq qilishi mumkin. Aniqlashtirish uchun bog'laning.</div>
  `;
  servicePanel.classList.add('show');
  servicePanel.scrollIntoView({behavior:'smooth', block:'nearest'});
}

/* ============================================================
   RENDER: Before/After sliders — admin paneldan boshqariladi
   ============================================================ */
const baGrid = document.getElementById('baGrid');

if (beforeafter.length === 0) {
  baGrid.innerHTML = `<p style="color:var(--ink-faint); font-size:14px;">Hali oldin/keyin namunalari qo'shilmagan.</p>`;
} else {
  beforeafter.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'ba-card';
    card.innerHTML = `
      <div class="ba-slider" id="ba-${idx}">
        <div class="ba-before"><img src="${item.beforeImage}" alt="Oldin" style="width:100%;height:100%;object-fit:cover;"></div>
        <div class="ba-after" id="ba-after-${idx}"><img src="${item.afterImage}" alt="Keyin" style="width:100%;height:100%;object-fit:cover;"></div>
        <div class="ba-handle" id="ba-handle-${idx}"></div>
        <span class="ba-label left">OLDIN</span>
        <span class="ba-label right">KEYIN</span>
      </div>
      <div class="ba-caption">${item.label}</div>
    `;
    baGrid.appendChild(card);
  });

  beforeafter.forEach((_, idx) => setupBaSlider(idx));
}

function setupBaSlider(idx){
  const slider = document.getElementById(`ba-${idx}`);
  const after = document.getElementById(`ba-after-${idx}`);
  const handle = document.getElementById(`ba-handle-${idx}`);
  let dragging = false;

  function moveTo(clientX){
    const rect = slider.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(4, Math.min(96, pct));
    after.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  slider.addEventListener('mousedown', e => { dragging = true; moveTo(e.clientX); });
  window.addEventListener('mousemove', e => { if(dragging) moveTo(e.clientX); });
  window.addEventListener('mouseup', () => dragging = false);
  slider.addEventListener('touchstart', e => moveTo(e.touches[0].clientX), {passive:true});
  slider.addEventListener('touchmove', e => moveTo(e.touches[0].clientX), {passive:true});
}

/* ============================================================
   RENDER: Media gallery (video/rasm) — admin paneldan boshqariladi
   ============================================================ */
const panelVideo = document.getElementById('panel-videolar');
const panelPhoto = document.getElementById('panel-rasmlar');

function isYoutube(url){ return /youtube\.com|youtu\.be/.test(url); }
function youtubeEmbed(url){
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

const videos = media.filter(m => m.type === 'video');
const photos = media.filter(m => m.type === 'photo');

if (videos.length === 0) {
  panelVideo.innerHTML = `<p style="grid-column:1/-1; color:var(--ink-faint); font-size:14px;">Hali video qo'shilmagan.</p>`;
} else {
  videos.forEach(v => {
    let inner;
    if (isYoutube(v.src)) {
      inner = `<iframe src="${youtubeEmbed(v.src)}" style="width:100%;height:100%;border:0;" allowfullscreen></iframe>`;
    } else if (/\.(mp4|webm|mov)$/i.test(v.src)) {
      inner = `<video src="${v.src}" controls style="width:100%;height:100%;object-fit:cover;"></video>`;
    } else {
      inner = `<a href="${v.src}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;height:100%;">Videoni ochish ↗</a>`;
    }
    panelVideo.innerHTML += `<div class="media-tile" style="padding:0; overflow:hidden;">${inner}</div>`;
  });
}

if (photos.length === 0) {
  panelPhoto.innerHTML = `<p style="grid-column:1/-1; color:var(--ink-faint); font-size:14px;">Hali rasm qo'shilmagan.</p>`;
} else {
  photos.forEach(p => {
    panelPhoto.innerHTML += `<div class="media-tile" style="padding:0; overflow:hidden;"><img src="${p.src}" alt="${p.caption}" style="width:100%;height:100%;object-fit:cover;"></div>`;
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.media-panel').forEach(p=>p.classList.remove('show'));
    document.getElementById('panel-'+btn.dataset.tab).classList.add('show');
  };
});

/* ============================================================
   RENDER: Reviews (admin paneldan boshqariladi)
   ============================================================ */
const reviewScroll = document.getElementById('reviewScroll');
reviews.forEach(r => {
  const initials = r.name.split(' ').map(w=>w[0]).join('');
  reviewScroll.innerHTML += `
    <div class="review-card">
      <div class="review-top">
        <div class="avatar">${initials}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-tag">${r.tag}</div>
        </div>
      </div>
      <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      <div class="review-text">${r.text}</div>
    </div>`;
});

/* ============================================================
   RENDER: Blog (admin paneldan boshqariladi)
   ============================================================ */
const blogGrid = document.getElementById('blogGrid');
blog.forEach(p => {
  const thumb = p.image
    ? `<img src="${p.image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;">`
    : `MAQOLA RASMI`;
  blogGrid.innerHTML += `
    <article class="blog-card">
      <div class="blog-thumb">${thumb}</div>
      <div class="blog-body">
        <span class="blog-cat">${p.cat}</span>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
   <a class="blog-link" href="/blog/${p.id}">Batafsil o'qish →</a>
      </div>
    </article>`;
});

/* ============================================================
   Countdown (chegirmali hafta) — settings.discountEnd admin paneldan sozlanadi.
   ============================================================ */
function getCountdownTarget(){
  if (settings.discountEnd) {
    const d = new Date(settings.discountEnd);
    if (!isNaN(d)) return d;
  }
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + (7 - now.getDay()));
  end.setHours(23,59,59,0);
  return end;
}
function updateCountdown(){
  const now = new Date();
  const end = getCountdownTarget();
  let diff = Math.max(0, end - now);
  const d = Math.floor(diff/86400000); diff -= d*86400000;
  const h = Math.floor(diff/3600000); diff -= h*3600000;
  const m = Math.floor(diff/60000);
  document.getElementById('cd-d').textContent = String(d).padStart(2,'0');
  document.getElementById('cd-h').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-m').textContent = String(m).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 60000);

/* Dash clock */
function updateClock(){
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('uz-UZ', {hour12:false});
}
updateClock();
setInterval(updateClock, 1000);

/* FAB toggle */
function toggleFab(){
  document.getElementById('fabMenu').classList.toggle('open');
  document.getElementById('fabMain').classList.toggle('open');
}

/* Contact form (demo — real integratsiya uchun Telegram Bot API kerak) */
function handleContactSubmit(e){
  e.preventDefault();
  const name = document.getElementById('cf-name').value;
  const car = document.getElementById('cf-car').value;
  alert(`Rahmat, ${name}! ${car} bo'yicha so'rovingiz qabul qilindi — tez orada bog'lanamiz.`);
  e.target.reset();
  return false;
}

/* Close mobile menu when a link is clicked */
document.querySelectorAll('#mnav a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mnav').style.display = 'none';
}));

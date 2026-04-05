// ============================================================
//  main.js  –  Madampe Explorer Homepage JavaScript
// ============================================================

const API = './api';

let allPlaces    = [];
let categories   = [];
let selectedIds  = new Set();
let currentFilter = 'all';

// ── FALLBACK DATA (used when PHP server is offline) ──────────
const FALLBACK = [
  {id:1,  name:"Marawila Beach",          category_name:"Sightseeing", category_icon:"🏖️", distance_km:8,  description:"A popular sandy beach ideal for relaxation, swimming, and watching breathtaking sunsets over the Indian Ocean.",      image_url:"https://beaches-searcher.com/images/beaches/144201013/LK201013.jpg"},
  {id:2,  name:"Munneswaram Temple",      category_name:"Religious",   category_icon:"🛕",  distance_km:15, description:"A historic and revered Hindu temple that has attracted pilgrims for centuries.",                                      image_url:"https://www.lovesrilanka.org/wp-content/uploads/2020/05/LS_B2_Sri-Munneswaram-Devasthanam_1920x700.jpg"},
  {id:3,  name:"Chilaw Beach Park",       category_name:"Leisure",     category_icon:"🌊",  distance_km:18, description:"A public coastal recreation area offering a relaxed environment for picnics and walks.",                             image_url:"https://www.india-tours.com/blog/wp-content/uploads/2021/06/chilaw-beach-park.jpg"},
  {id:4,  name:"Senanayake Aramaya",      category_name:"Religious",   category_icon:"🏯",  distance_km:6,  description:"A peaceful Buddhist temple offering a serene atmosphere for meditation and reflection.",                             image_url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThe8FZ2ljBMOy1JeuMty7Suk01P2VXTIMeRA&s"},
  {id:5,  name:"Madampe Market",          category_name:"Cultural",    category_icon:"🏛️", distance_km:1,  description:"The vibrant local marketplace at the heart of Madampe showcasing authentic community life.",                         image_url:"https://img.freepik.com/free-photo/fresh-vegetables-fruit-market-stall_1101-2560.jpg?semt=ais_hybrid&w=740&q=80"},
  {id:6,  name:"Deduru Oya River",        category_name:"Nature",      category_icon:"🌿",  distance_km:12, description:"A scenic river environment offering stunning views and birdwatching opportunities.",                                 image_url:"https://lakpura.com/cdn/shop/files/LK94009321-06-E.jpg?v=1765351085&width=3200"},
  {id:7,  name:"Thoduwawa Beach",         category_name:"Sightseeing", category_icon:"🎣",  distance_km:10, description:"A charming fishing village beach with natural scenery and local fishing life.",                                      image_url:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/87/1f/3b/caption.jpg?w=1200&h=1200&s=1"},
  {id:8,  name:"St. Anne's Church Talawila", category_name:"Religious",category_icon:"⛪",  distance_km:22, description:"A famous Catholic pilgrimage destination drawing hundreds of thousands each year.",                                  image_url:"https://www.attractionsinsrilanka.com/wp-content/uploads/2020/06/Annes-National-Shrine.jpg"},
  {id:9,  name:"Club Palm Bay Hotel",     category_name:"Hotel",       category_icon:"🏨",  distance_km:9,  description:"A beautiful beachfront resort offering accommodation and dining facilities.",                                       image_url:"https://lakpura.com/cdn/shop/files/LK15009177-02-E.jpg?v=1701328643&width=1445"},
  {id:10, name:"Amagi Beach Hotel",       category_name:"Hotel",       category_icon:"🌴",  distance_km:11, description:"A coastal hotel in Marawila with excellent dining and a relaxed beachside atmosphere.",                              image_url:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/211683166.jpg?k=b0f11377d037d76ed49806609a2e1b8a37faffa75c8ba580a0ef34650e58e79f&o="},
];

// ── INITIALISE ───────────────────────────────────────────────
async function init() {
  try {
    const [pRes, cRes] = await Promise.all([
      fetch(`${API}/places.php`),
      fetch(`${API}/categories.php`)
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    if (!pData.success || !cData.success) throw new Error();
    allPlaces  = pData.data;
    categories = cData.data;
    document.getElementById('statPlaces').textContent = allPlaces.length + '+';
    document.getElementById('statCats').textContent   = categories.length;
  } catch {
    // Server offline – use fallback static data
    allPlaces  = FALLBACK;
    const cats = [...new Set(FALLBACK.map(p => p.category_name))];
    categories = cats.map((c, i) => ({
      id: i + 1,
      name: c,
      icon: FALLBACK.find(p => p.category_name === c).category_icon
    }));
    document.getElementById('placesGrid').insertAdjacentHTML('beforebegin',
      `<div class="api-note">⚠️ Running in offline mode. Deploy to a PHP server to enable database features.</div>`
    );
  }
  renderCategoryChips();
  renderPlaces();
  renderPlanner();
}

// ── CATEGORY CHIPS ───────────────────────────────────────────
function renderCategoryChips() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = `<button class="cat-chip active" data-cat="all">🌐 All Places</button>`;

  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.className    = 'cat-chip';
    btn.dataset.cat  = c.name;
    btn.textContent  = `${c.icon || '📍'} ${c.name}`;
    grid.appendChild(btn);
  });

  grid.addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.cat;
    renderPlaces();
  });
}

// ── PLACES GRID ──────────────────────────────────────────────
const catBg = cat => ({
  Sightseeing: '#1a5c52',
  Religious:   '#8b3a3a',
  Nature:      '#2e6b30',
  Cultural:    '#7a5a1a',
  Leisure:     '#1a4a7a',
  Hotel:       '#5a1a7a'
}[cat] || '#555');

function renderPlaces() {
  const grid = document.getElementById('placesGrid');
  const list = currentFilter === 'all'
    ? allPlaces
    : allPlaces.filter(p => p.category_name === currentFilter);

  grid.innerHTML = list.map(p => `
    <div class="place-card" onclick="window.location.href='place.html?id=${p.id}'">
      <div class="place-img" style="${p.image_url
        ? `background:url('${p.image_url}') center/cover no-repeat`
        : `background:${catBg(p.category_name)}20`}">
        ${p.image_url ? '' : p.category_icon || '📍'}
        <div class="place-badge">${p.category_name}</div>
        <div class="place-dist">${p.distance_km} km</div>
      </div>
      <div class="place-body">
        <div class="place-name">${p.name}</div>
        <div class="place-desc">${p.description.slice(0, 90)}…</div>
        <div class="place-actions">
          <a class="place-btn place-btn-primary" href="place.html?id=${p.id}"
             onclick="event.stopPropagation()">View Details</a>
          <button class="place-btn place-btn-sec"
                  onclick="event.stopPropagation(); togglePlan(${p.id})">
            ${selectedIds.has(p.id) ? '✅ Added' : '+ Add to Plan'}
          </button>
        </div>
      </div>
    </div>`).join('');
}

// ── MODAL ────────────────────────────────────────────────────
function openModal(id) {
  const p = allPlaces.find(x => x.id === id);
  document.getElementById('mIcon').textContent  = p.category_icon || '📍';
  document.getElementById('mTitle').textContent = p.name;
  document.getElementById('mBadge').textContent = p.category_name;
  document.getElementById('mDesc').textContent  = p.description;
  document.getElementById('mDist').textContent  = p.distance_km + ' km from Madampe';
  document.getElementById('mCat').textContent   = p.category_name;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── TRIP PLANNER ─────────────────────────────────────────────
function renderPlanner() {
  document.getElementById('plannerList').innerHTML = allPlaces.map(p => `
    <div class="planner-item ${selectedIds.has(p.id) ? 'selected' : ''}"
         onclick="togglePlan(${p.id})">
      <div class="planner-icon">${p.category_icon || '📍'}</div>
      <div>
        <div class="planner-name">${p.name}</div>
        <div class="planner-meta">${p.category_name} · ${p.distance_km} km</div>
      </div>
      <div class="planner-check">${selectedIds.has(p.id) ? '✓' : ''}</div>
    </div>`).join('');
  renderItinerary();
}

function togglePlan(id) {
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  renderPlaces();
  renderPlanner();
}

function renderItinerary() {
  const list    = document.getElementById('itineraryList');
  const totalEl = document.getElementById('totalDist');
  const sel     = allPlaces
    .filter(p => selectedIds.has(p.id))
    .sort((a, b) => a.distance_km - b.distance_km);
  const times   = ['8:00 AM','9:30 AM','11:00 AM','12:30 PM','2:00 PM','3:30 PM','5:00 PM','6:30 PM'];

  if (!sel.length) {
    list.innerHTML      = `<div class="planner-empty"><span>🗺️</span><p>Select places on the left</p></div>`;
    totalEl.textContent = '';
    return;
  }

  list.innerHTML = sel.map((p, i) => `
    <div class="iti-step">
      <div class="iti-num">${i + 1}</div>
      <div>
        <div class="iti-name">${p.category_icon || '📍'} ${p.name}</div>
        <div class="iti-info">${times[i] || 'TBD'} · ${p.distance_km} km · ${p.category_name}</div>
      </div>
    </div>`).join('');

  const total = sel.reduce((s, p) => s + parseFloat(p.distance_km), 0);
  totalEl.textContent = `📍 ${sel.length} stops · ~${total.toFixed(1)} km total`;
}

// ── SAVE PLAN (calls PHP API) ─────────────────────────────────
async function savePlan() {
  const msg = document.getElementById('saveMsg');
  if (!selectedIds.size) {
    msg.textContent = '⚠️ Select at least one place first!';
    return;
  }
  msg.textContent = 'Saving…';
  try {
    const res  = await fetch(`${API}/trip_plans.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ plan_name: 'My Day Trip', place_ids: [...selectedIds] })
    });
    const data = await res.json();
    msg.textContent = data.success
      ? `✅ Saved! Plan ID: ${data.data.plan_id}`
      : '❌ ' + data.error;
  } catch {
    msg.textContent = '🖨️ Offline – printing instead…';
    setTimeout(() => { window.print(); msg.textContent = ''; }, 600);
  }
  setTimeout(() => { msg.textContent = ''; }, 5000);
}

// ── START ────────────────────────────────────────────────────
init();

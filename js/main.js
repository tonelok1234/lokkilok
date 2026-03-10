// ===== HOVUDSKRIPT FOR LÖKKI LÖK DESIGN =====

// Hent data: localStorage overstyrer standarddata
function hentData() {
  const lagra = localStorage.getItem('lokkilok_data');
  if (lagra) {
    try { return JSON.parse(lagra); }
    catch(e) { return STANDARDDATA; }
  }
  return STANDARDDATA;
}

const data = hentData();
const OM = data.om;
const PROSJEKT = data.prosjekt || [];

// ===== LANDING PAGE (index.html) =====
function initForsida() {
  // Fyll inn om-tekst
  const el = (id) => document.getElementById(id);

  if (el('hero-tittel')) el('hero-tittel').textContent = OM.heroTittel || '';
  if (el('hero-ingress')) el('hero-ingress').textContent = OM.heroIngress || '';
  if (el('hero-label')) el('hero-label').textContent = OM.heroLabel || '';
  if (el('om-tekst')) el('om-tekst').textContent = OM.omTekst || '';
  if (el('kontakt-ingress')) el('kontakt-ingress').textContent = OM.kontaktIngress || '';

  // Kontakt-lenker
  byggKontaktLenker();

  // Prosjektgrid – berre synlege prosjekt
  byggProsjektGrid();

  // Fade-inn-animasjon
  initFadeInn();
}

function byggKontaktLenker() {
  const wrapper = document.getElementById('kontakt-lenker');
  if (!wrapper) return;

  let html = '';

  if (OM.kontaktEpost) {
    html += `
      <a href="mailto:${OM.kontaktEpost}" class="kontakt-lenke">
        <span class="kontakt-lenke-ikon">✉️</span>
        <span class="kontakt-lenke-tekst">
          <small>E-post</small>
          <span>${OM.kontaktEpost}</span>
        </span>
      </a>`;
  }

  if (OM.kontaktTelefon) {
    html += `
      <a href="tel:${OM.kontaktTelefon}" class="kontakt-lenke">
        <span class="kontakt-lenke-ikon">📞</span>
        <span class="kontakt-lenke-tekst">
          <small>Telefon</small>
          <span>${OM.kontaktTelefon}</span>
        </span>
      </a>`;
  }

  if (OM.kontaktInstagram) {
    html += `
      <a href="https://instagram.com/${OM.kontaktInstagram.replace('@','')}" target="_blank" rel="noopener" class="kontakt-lenke">
        <span class="kontakt-lenke-ikon">📷</span>
        <span class="kontakt-lenke-tekst">
          <small>Instagram</small>
          <span>${OM.kontaktInstagram}</span>
        </span>
      </a>`;
  }

  if (!html) {
    html = '<p style="color:var(--grå);font-size:0.9rem;">Kontaktinformasjon kjem snart.</p>';
  }

  wrapper.innerHTML = html;
}

function byggProsjektGrid() {
  const grid = document.getElementById('prosjekt-grid');
  if (!grid) return;

  const synlege = PROSJEKT.filter(p => p.synleg);

  if (synlege.length === 0) {
    grid.innerHTML = '<p class="tom-melding">Prosjekt kjem snart.</p>';
    return;
  }

  grid.innerHTML = synlege.map(p => prosjektKort(p)).join('');
}

function prosjektKort(p) {
  const bilete = p.biletar && p.biletar.length > 0
    ? `<img src="${p.biletar[0]}" alt="${p.tittel}" loading="lazy">`
    : `<div class="prosjekt-bilde-placeholder">◻</div>`;

  return `
    <a href="prosjekt.html?id=${p.id}" class="prosjekt-kort">
      <div class="prosjekt-bilde">${bilete}</div>
      <div class="prosjekt-info">
        <div class="prosjekt-meta">
          ${p.kategori ? `<span class="prosjekt-tag">${p.kategori}</span>` : ''}
          ${p.ar ? `<span class="prosjekt-ar">${p.ar}</span>` : ''}
        </div>
        <h3 class="prosjekt-tittel">${p.tittel}</h3>
        <p class="prosjekt-beskriving">${p.kortBeskriving || ''}</p>
        <span class="prosjekt-pil">Sjå prosjekt →</span>
      </div>
    </a>`;
}

function initFadeInn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('synleg');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-inn').forEach(el => observer.observe(el));
}

// ===== PROSJEKT-DETALJSIDE (prosjekt.html) =====
function initProsjektSide() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  const prosjekt = PROSJEKT.find(p => p.id === id);

  if (!prosjekt) {
    document.getElementById('prosjekt-innhald').innerHTML =
      '<p class="tom-melding">Prosjektet vart ikkje funne.</p>';
    return;
  }

  // Metadata
  document.title = `${prosjekt.tittel} – ${OM.namn || 'Lökki Lök Design'}`;

  // Fyll inn innhald
  const el = (id) => document.getElementById(id);

  if (el('p-kategori')) el('p-kategori').textContent = prosjekt.kategori || '';
  if (el('p-ar')) el('p-ar').textContent = prosjekt.ar || '';
  if (el('p-tittel')) el('p-tittel').textContent = prosjekt.tittel || '';
  if (el('p-ingress')) el('p-ingress').textContent = prosjekt.kortBeskriving || '';
  if (el('p-tekst')) el('p-tekst').innerHTML = (prosjekt.beskriving || '').split('\n').filter(Boolean).map(l => `<p>${l}</p>`).join('');

  // Hovudbilde
  const bildeWrapper = document.getElementById('p-bilde');
  if (bildeWrapper && prosjekt.biletar && prosjekt.biletar.length > 0) {
    bildeWrapper.innerHTML = `<img src="${prosjekt.biletar[0]}" alt="${prosjekt.tittel}">`;
  }

  // Ekstern lenke
  const lenkWrapper = document.getElementById('p-ekstern-wrapper');
  const lenke = document.getElementById('p-ekstern-lenke');
  if (lenkWrapper && lenke && prosjekt.eksternUrl) {
    lenkWrapper.style.display = 'block';
    lenke.href = prosjekt.eksternUrl;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const side = document.body.dataset.side;
  if (side === 'forsida') initForsida();
  if (side === 'prosjekt') initProsjektSide();
});

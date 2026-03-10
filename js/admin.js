// ===== ADMIN-SKRIPT FOR LÖKKI LÖK DESIGN =====

const PASSORD_NØKKEL = 'lokkilok_passord';
const DATA_NØKKEL = 'lokkilok_data';
const STANDARD_PASSORD = 'LokkilokDesign2026';

// ===== HJELPEFUNKSJONAR =====

function hentData() {
  const lagra = localStorage.getItem(DATA_NØKKEL);
  if (lagra) {
    try { return JSON.parse(lagra); }
    catch(e) {}
  }
  return JSON.parse(JSON.stringify(STANDARDDATA));
}

function lagreData(data) {
  localStorage.setItem(DATA_NØKKEL, JSON.stringify(data));
}

function hentPassord() {
  return localStorage.getItem(PASSORD_NØKKEL) || STANDARD_PASSORD;
}

function viseMelding(id, feil = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  if (feil) {
    el.style.color = '#c0392b';
    el.style.background = '#fde8e7';
  }
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function el(id) { return document.getElementById(id); }

// ===== INNLOGGING =====

function loggInn(event) {
  event.preventDefault();
  const passord = el('passord-felt').value;
  const feilMelding = el('feil-melding');

  if (passord === hentPassord()) {
    sessionStorage.setItem('lokkilok_innlogga', '1');
    el('login-visning').style.display = 'none';
    el('panel-visning').style.display = 'block';
    fyllInnPanel();
  } else {
    feilMelding.textContent = 'Feil passord. Prøv igjen.';
    feilMelding.style.display = 'block';
    el('passord-felt').value = '';
    el('passord-felt').focus();
  }
}

function loggUt() {
  sessionStorage.removeItem('lokkilok_innlogga');
  el('panel-visning').style.display = 'none';
  el('login-visning').style.display = 'flex';
  el('passord-felt').value = '';
  el('passord-felt').focus();
}

// ===== FYLL INN PANEL =====

function fyllInnPanel() {
  const data = hentData();
  const OM = data.om || {};

  // Om-felter
  el('om-namn').value = OM.namn || '';
  el('om-undertittel').value = OM.undertittel || '';
  el('om-hero-label').value = OM.heroLabel || '';
  el('om-hero-tittel').value = OM.heroTittel || '';
  el('om-hero-ingress').value = OM.heroIngress || '';
  el('om-tekst').value = OM.omTekst || '';
  el('om-kontakt-ingress').value = OM.kontaktIngress || '';
  el('om-epost').value = OM.kontaktEpost || '';
  el('om-telefon').value = OM.kontaktTelefon || '';
  el('om-instagram').value = OM.kontaktInstagram || '';

  // Prosjekt-liste
  byggProsjektAdminListe(data.prosjekt || []);
}

// ===== LAGRE OM =====

function lagreOm() {
  const data = hentData();

  data.om = {
    namn: el('om-namn').value.trim(),
    undertittel: el('om-undertittel').value.trim(),
    heroLabel: el('om-hero-label').value.trim(),
    heroTittel: el('om-hero-tittel').value.trim(),
    heroIngress: el('om-hero-ingress').value.trim(),
    omTekst: el('om-tekst').value.trim(),
    kontaktIngress: el('om-kontakt-ingress').value.trim(),
    kontaktEpost: el('om-epost').value.trim(),
    kontaktTelefon: el('om-telefon').value.trim(),
    kontaktInstagram: el('om-instagram').value.trim(),
  };

  lagreData(data);
  viseMelding('melding-om');
}

// ===== PROSJEKT-LISTE =====

function byggProsjektAdminListe(prosjekt) {
  const liste = el('prosjekt-liste');
  if (!liste) return;

  if (prosjekt.length === 0) {
    liste.innerHTML = '<p style="color:var(--grå);font-size:0.9rem;">Ingen prosjekt endå. Klikk «+ Legg til prosjekt» for å starte.</p>';
    return;
  }

  liste.innerHTML = prosjekt.map((p, i) => prosjektRad(p, i)).join('');
}

function prosjektRad(p, i) {
  const synlegBadge = p.synleg
    ? '<span class="synleg-badge synleg">Synleg</span>'
    : '<span class="synleg-badge skjult">Skjult</span>';

  return `
    <div class="prosjekt-rad ${p.synleg ? '' : 'skjult'}" id="rad-${i}">
      <div class="prosjekt-rad-topp">
        <div>
          <div class="prosjekt-rad-tittel">${p.tittel || '(utan tittel)'}</div>
          <div class="prosjekt-rad-meta">${[p.kategori, p.ar].filter(Boolean).join(' · ')}</div>
        </div>
        <div class="prosjekt-rad-knappar">
          ${synlegBadge}
          <button class="knapp knapp-sekundær knapp-liten" onclick="toggleSynleg(${i})">
            ${p.synleg ? 'Skjul' : 'Vis'}
          </button>
          <button class="knapp knapp-sekundær knapp-liten" onclick="toggleRedigerForm(${i})">
            Rediger
          </button>
          <button class="knapp knapp-fare knapp-liten" onclick="slettProsjekt(${i})">
            Slett
          </button>
        </div>
      </div>

      <div class="prosjekt-rad-form" id="form-${i}">
        <div class="grid-2">
          <div class="form-gruppe">
            <label>Tittel</label>
            <input type="text" id="p-tittel-${i}" value="${eskaper(p.tittel || '')}">
          </div>
          <div class="form-gruppe">
            <label>ID / URL-slug (ingen mellomrom)</label>
            <input type="text" id="p-id-${i}" value="${eskaper(p.id || '')}">
          </div>
        </div>
        <div class="grid-2">
          <div class="form-gruppe">
            <label>Kategori</label>
            <input type="text" id="p-kategori-${i}" value="${eskaper(p.kategori || '')}" placeholder="Webdesign, Branding …">
          </div>
          <div class="form-gruppe">
            <label>År</label>
            <input type="text" id="p-ar-${i}" value="${eskaper(p.ar || '')}" placeholder="2026">
          </div>
        </div>
        <div class="form-gruppe">
          <label>Kort beskriving (vises på kortet)</label>
          <textarea id="p-kort-${i}" rows="2">${eskaper(p.kortBeskriving || '')}</textarea>
        </div>
        <div class="form-gruppe">
          <label>Full beskriving (vises på prosjektsida)</label>
          <textarea id="p-besk-${i}" rows="4">${eskaper(p.beskriving || '')}</textarea>
        </div>
        <div class="form-gruppe">
          <label>Ekstern lenke (URL til det ferdige prosjektet)</label>
          <input type="url" id="p-url-${i}" value="${eskaper(p.eksternUrl || '')}" placeholder="https://…">
        </div>
        <div class="form-gruppe">
          <label>Bileteadresse (URL til hovudbilde, valfritt)</label>
          <input type="url" id="p-bilde-${i}" value="${eskaper((p.biletar && p.biletar[0]) || '')}" placeholder="https://…">
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem;">
          <button class="knapp knapp-primær knapp-liten" onclick="lagreProsjekt(${i})">Lagre</button>
          <button class="knapp knapp-sekundær knapp-liten" onclick="toggleRedigerForm(${i})">Avbryt</button>
        </div>
      </div>
    </div>`;
}

function eskaper(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toggleRedigerForm(i) {
  const form = el(`form-${i}`);
  if (!form) return;
  form.classList.toggle('open');
}

function toggleSynleg(i) {
  const data = hentData();
  if (!data.prosjekt[i]) return;
  data.prosjekt[i].synleg = !data.prosjekt[i].synleg;
  lagreData(data);
  byggProsjektAdminListe(data.prosjekt);
  viseMelding('melding-prosjekt');
}

function lagreProsjekt(i) {
  const data = hentData();
  if (!data.prosjekt[i]) return;

  const bilete = el(`p-bilde-${i}`).value.trim();

  data.prosjekt[i] = {
    ...data.prosjekt[i],
    id: el(`p-id-${i}`).value.trim().replace(/\s+/g, '-'),
    tittel: el(`p-tittel-${i}`).value.trim(),
    kategori: el(`p-kategori-${i}`).value.trim(),
    ar: el(`p-ar-${i}`).value.trim(),
    kortBeskriving: el(`p-kort-${i}`).value.trim(),
    beskriving: el(`p-besk-${i}`).value.trim(),
    eksternUrl: el(`p-url-${i}`).value.trim(),
    biletar: bilete ? [bilete] : [],
  };

  lagreData(data);
  byggProsjektAdminListe(data.prosjekt);
  viseMelding('melding-prosjekt');
}

function slettProsjekt(i) {
  if (!confirm('Er du sikker på at du vil slette dette prosjektet?')) return;
  const data = hentData();
  data.prosjekt.splice(i, 1);
  lagreData(data);
  byggProsjektAdminListe(data.prosjekt);
  viseMelding('melding-prosjekt');
}

function leggTilProsjekt() {
  const data = hentData();
  data.prosjekt.push({
    id: 'nytt-prosjekt-' + Date.now(),
    tittel: 'Nytt prosjekt',
    kortBeskriving: '',
    beskriving: '',
    kategori: '',
    ar: new Date().getFullYear().toString(),
    biletar: [],
    eksternUrl: '',
    synleg: false
  });
  lagreData(data);
  byggProsjektAdminListe(data.prosjekt);

  // Opne redigeringa til det nye prosjektet
  const nyIndex = data.prosjekt.length - 1;
  setTimeout(() => toggleRedigerForm(nyIndex), 50);
}

// ===== ENDRE PASSORD =====

function endrePassord() {
  const nytt = el('nytt-passord').value;
  const gjenta = el('gjenta-passord').value;
  const meldEl = el('melding-passord');

  if (nytt.length < 8) {
    meldEl.textContent = 'Passordet må vere minst 8 teikn.';
    meldEl.style.color = '#c0392b';
    meldEl.style.background = '#fde8e7';
    meldEl.style.display = 'block';
    return;
  }

  if (nytt !== gjenta) {
    meldEl.textContent = 'Passorda er ikkje like.';
    meldEl.style.color = '#c0392b';
    meldEl.style.background = '#fde8e7';
    meldEl.style.display = 'block';
    return;
  }

  localStorage.setItem(PASSORD_NØKKEL, nytt);
  el('nytt-passord').value = '';
  el('gjenta-passord').value = '';

  meldEl.textContent = '✓ Passord endra!';
  meldEl.style.color = 'var(--aksent)';
  meldEl.style.background = 'var(--aksent-lys)';
  meldEl.style.display = 'block';
  setTimeout(() => { meldEl.style.display = 'none'; }, 3000);
}

// ===== EKSPORTER =====

function eksporterInnhald() {
  const data = hentData();
  const innhald = `// ===== LÖKKI LÖK DESIGN – EKSPORTERT DATA =====
// Generert: ${new Date().toLocaleString('nn')}
// Legg denne fila i js/-mappa for å publisere endringar.

const STANDARDDATA = ${JSON.stringify(data, null, 2)};
`;

  const blob = new Blob([innhald], { type: 'text/javascript' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.js';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===== NULLSTILL =====

function nullstillInnhald() {
  if (!confirm('Dette slettar alle endringar og tilbakestiller til standardinnhald. Er du sikker?')) return;
  localStorage.removeItem(DATA_NØKKEL);
  fyllInnPanel();
  alert('Innhaldet er tilbakestilt.');
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  // Sjekk om allereie innlogga i denne sesjonen
  if (sessionStorage.getItem('lokkilok_innlogga') === '1') {
    el('login-visning').style.display = 'none';
    el('panel-visning').style.display = 'block';
    fyllInnPanel();
  } else {
    el('login-visning').style.display = 'flex';
    el('panel-visning').style.display = 'none';
  }
});

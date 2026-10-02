(function () {
  // Menü (mobil)
  var menue = document.querySelector('.menue'), nav = document.getElementById('nav');
  menue.addEventListener('click', function () {
    var offen = nav.classList.toggle('offen');
    menue.setAttribute('aria-expanded', offen);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('offen'); menue.setAttribute('aria-expanded', 'false'); }
  });

  // Öffnungszeiten: kommen aus oeffnungszeiten.js
  var OZ = window.OEFFNUNGSZEITEN;
  if (OZ) {
    var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    var KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var REIHE = [1, 2, 3, 4, 5, 6, 0];
    var slot = function (s) {
      var p = s.replace(/\s/g, '').split('-').map(function (t) { var x = t.split(':'); return +x[0] * 60 + +(x[1] || 0); });
      return p;
    };
    var schoen = function (liste) { return liste.map(function (s) { return s.replace(/\s/g, '').replace('-', '–'); }); };
    var uhr = function (m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); };
    var kurzDatum = function (iso) { var p = iso.split('-'); return p[2] + '.' + p[1] + '.'; };
    var normal = function (t) { return OZ.normal[TAGE[t]] || []; };
    var ausnahmeAm = function (iso) {
      return (OZ.ausnahmen || []).filter(function (a) { return a.von <= iso && iso <= a.bis; })[0];
    };
    var zeitenAm = function (iso, t) {
      var a = ausnahmeAm(iso);
      if (!a) return normal(t);
      if (!a.zeiten) return [];
      if (Array.isArray(a.zeiten)) return normal(t).length ? a.zeiten : [];
      return TAGE[t] in a.zeiten ? a.zeiten[TAGE[t]] : normal(t);
    };
    // Heute in deutscher Zeit
    var teile = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { teile[p.type] = p.value; });
    var basis = Date.UTC(+teile.year, +teile.month - 1, +teile.day, 12);
    var minuten = (+teile.hour % 24) * 60 + +teile.minute;
    var tagNr = function (i) { var d = new Date(basis + i * 864e5); return { iso: d.toISOString().slice(0, 10), t: d.getUTCDay() }; };
    var heute = tagNr(0);

    // Tabelle
    var tabelle = document.querySelector('.zeiten');
    tabelle.innerHTML = REIHE.map(function (t) {
      var z = schoen(normal(t));
      return '<tr' + (t === heute.t ? ' class="heute"' : '') + '><th scope="row">' + TAGE[t] + '</th><td>' +
        (z.length ? z.map(function (s) { return '<span>' + s + ' Uhr</span>'; }).join('') : 'Geschlossen') + '</td></tr>';
    }).join('');

    // Anhänger: Tage mit gleichen Zeiten zusammenfassen
    var gruppen = [];
    REIHE.forEach(function (t) {
      var text = schoen(normal(t)).join(' · ') || 'geschlossen';
      var g = gruppen.filter(function (x) { return x.text === text; })[0];
      if (g) g.tage.push(KURZ[t]); else gruppen.push({ text: text, tage: [KURZ[t]] });
    });
    document.querySelector('.anhaenger dl').innerHTML = gruppen.map(function (g) {
      return '<dt>' + g.tage.join(', ') + '</dt><dd>' + g.text + '</dd>';
    }).join('');

    // Status
    var s = null, i, k, z = zeitenAm(heute.iso, heute.t).map(slot);
    for (k = 0; k < z.length && !s; k++) if (minuten >= z[k][0] && minuten < z[k][1]) s = { offen: true, text: 'Jetzt geöffnet bis ' + uhr(z[k][1]) + ' Uhr' };
    for (k = 0; k < z.length && !s; k++) if (minuten < z[k][0]) s = { offen: false, text: 'Geschlossen, öffnet heute um ' + uhr(z[k][0]) + ' Uhr' };
    for (i = 1; i <= 120 && !s; i++) {
      var d = tagNr(i), zz = zeitenAm(d.iso, d.t).map(slot);
      if (zz.length) s = { offen: false, text: 'Geschlossen, öffnet ' + (i === 1 ? 'morgen' : i < 7 ? 'am ' + TAGE[d.t] : 'am ' + kurzDatum(d.iso)) + ' um ' + uhr(zz[0][0]) + ' Uhr' };
    }
    var el = document.getElementById('status');
    if (s) { el.querySelector('span').textContent = s.text; el.classList.toggle('zu', !s.offen); }

    // Hinweis: läuft gerade oder beginnt in den nächsten 14 Tagen
    var bald = tagNr(14).iso;
    var texte = (OZ.ausnahmen || []).filter(function (a) { return a.bis >= heute.iso && a.von <= bald; })
      .sort(function (a, b) { return a.von < b.von ? -1 : 1; })
      .map(function (a) {
        return a.hinweis || (a.von === a.bis ? 'Am ' + kurzDatum(a.von) : 'Vom ' + kurzDatum(a.von) + ' bis ' + kurzDatum(a.bis)) +
          (a.zeiten ? ' gelten geänderte Öffnungszeiten.' : ' haben wir geschlossen.');
      });
    document.querySelectorAll('.hinweis').forEach(function (h) {
      h.hidden = !texte.length;
      h.innerHTML = '';
      texte.forEach(function (t) { var p = document.createElement('span'); p.textContent = t; h.appendChild(p); });
    });
  }

  // Galerie: Filter und Großansicht
  var bilder = document.querySelectorAll('.galerie button');
  document.querySelectorAll('.filter button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      bilder.forEach(function (g) { g.hidden = b.dataset.filter !== 'alle' && g.dataset.art !== b.dataset.filter; });
    });
  });
  var gross = document.getElementById('gross'), grossBild = gross.querySelector('img');
  bilder.forEach(function (g) {
    g.addEventListener('click', function () {
      var img = g.querySelector('img');
      grossBild.src = img.src; grossBild.alt = img.alt;
      gross.showModal();
    });
  });
  gross.addEventListener('click', function (e) { if (e.target === gross) gross.close(); });

  // Impressum und Datenschutz: per Link aufklappen
  function klappAuf() {
    var ziel = location.hash && document.querySelector('details' + location.hash);
    if (ziel) { ziel.open = true; ziel.scrollIntoView(); }
  }
  window.addEventListener('hashchange', klappAuf);
  document.querySelectorAll('.fuss a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var d = document.querySelector('details' + a.getAttribute('href'));
      if (d) d.open = true;
    });
  });
  klappAuf();

  // Karte erst nach Klick laden (Datenschutz)
  var laden = document.getElementById('karte-laden');
  if (laden) laden.addEventListener('click', function () {
    var k = document.getElementById('karte');
    k.classList.add('geladen');
    k.innerHTML = '<iframe title="Karte: Creativ Floristik, Bahnstraße 87, Erzhausen" loading="lazy" src="https://www.google.com/maps/d/u/0/embed?mid=1grUJYOGB-9ih43NpXrWDiWE6XxkNniJt"></iframe>';
  });
})();

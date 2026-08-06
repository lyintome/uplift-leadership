/* ==========================================================================
   UPLIFT — Infographics
   All drawn by hand in SVG. No stock photos: they're a copyright risk, they
   date badly, and generic "sad teenager by a window" imagery is exactly the
   cliche this project argues against. Illustration also lets the visuals
   carry actual data rather than mood.
   ========================================================================== */

const INFO = {};

/* --- 1. Pictogram: 100 figures, 39 highlighted -------------------------- */

INFO.pictogram = function (pct, colour, muted) {
  const COLS = 20, ROWS = 5, W = 26, H = 34;
  const lit = Math.round(pct);
  let body = "";

  for (let i = 0; i < 100; i++) {
    const x = (i % COLS) * W + 8;
    const y = Math.floor(i / COLS) * H + 8;
    const on = i < lit;
    const c = on ? colour : muted;
    body +=
      '<g transform="translate(' + x + ',' + y + ')" opacity="' + (on ? 1 : .38) + '">' +
        '<circle cx="9" cy="7" r="5.4" fill="' + c + '"/>' +
        '<path d="M9 13.5c-5 0-8 3.4-8 8.2v4.6h16v-4.6c0-4.8-3-8.2-8-8.2z" fill="' + c + '"/>' +
      "</g>";
  }

  return '<svg viewBox="0 0 ' + (COLS * W + 16) + ' ' + (ROWS * H + 16) + '" ' +
         'role="img" aria-label="' + lit + ' out of every 100 students">' + body + "</svg>";
};

/* --- 2. Eustress vs chronic pressure ------------------------------------ */

INFO.eustress = function () {
  const smile = (x) => '<path d="M' + (x + 46) + ' 80 q14 12 28 0" stroke="#241F2E" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
  const frown = (x) => '<path d="M' + (x + 46) + ' 86 q14 -12 28 0" stroke="#241F2E" stroke-width="2.8" fill="none" stroke-linecap="round"/>';

  const panel = (x, title, sub, colour, wash, items, face) => {
    const rows = items.map((t, i) =>
      '<g transform="translate(' + (x + 26) + ',' + (152 + i * 34) + ')">' +
        '<circle cx="0" cy="-5" r="7" fill="' + colour + '"/>' +
        '<text x="18" y="0" font-family="Karla, sans-serif" font-size="15" fill="#241F2E">' + t + "</text>" +
      "</g>").join("");

    return "<g>" +
      '<rect x="' + x + '" y="16" width="330" height="290" rx="20" fill="' + wash + '" stroke="#241F2E" stroke-width="2.5"/>' +
      '<circle cx="' + (x + 60) + '" cy="72" r="30" fill="#FFCBA4" stroke="#241F2E" stroke-width="2.5"/>' +
      '<circle cx="' + (x + 50) + '" cy="66" r="3.4" fill="#241F2E"/>' +
      '<circle cx="' + (x + 71) + '" cy="66" r="3.4" fill="#241F2E"/>' +
      face(x) +
      '<text x="' + (x + 104) + '" y="66" font-family="Fraunces, Georgia, serif" font-size="25" font-weight="700" fill="#241F2E">' + title + "</text>" +
      '<text x="' + (x + 104) + '" y="88" font-family="Space Mono, monospace" font-size="12" fill="#554C63">' + sub + "</text>" +
      '<line x1="' + (x + 22) + '" y1="118" x2="' + (x + 308) + '" y2="118" stroke="#241F2E" stroke-width="2" stroke-dasharray="6 5"/>' +
      rows +
    "</g>";
  };

  return '<svg viewBox="0 0 700 320" role="img" aria-label="Eustress compared with chronic academic pressure">' +
    panel(8, "Eustress", "the helpful kind", "#3FA96B", "#DCF4E6",
      ["Sharpens focus", "Builds confidence", "Ends when the task ends", "You still sleep"], smile) +
    panel(362, "Chronic pressure", "the harmful kind", "#F2604C", "#FFE1DB",
      ["Wrecks focus", "Feeds fear of failing", "Never switches off", "You stop sleeping"], frown) +
  "</svg>";
};

/* --- 3. Assessment stacking --------------------------------------------- */

INFO.stacking = function () {
  const week = [
    { d: "Mon", n: 0 }, { d: "Tue", n: 1 }, { d: "Wed", n: 0 }, { d: "Thu", n: 1 }, { d: "Fri", n: 0 },
    { d: "Mon", n: 2 }, { d: "Tue", n: 1 }, { d: "Wed", n: 3 }, { d: "Thu", n: 2 }, { d: "Fri", n: 1 }
  ];
  const COL = 64, BASE = 250;
  let bars = "", labels = "";

  week.forEach((c, i) => {
    const x = 40 + i * COL;
    for (let k = 0; k < c.n; k++) {
      const y = BASE - (k + 1) * 30 - 4;
      const fill = c.n >= 3 ? "#F2604C" : c.n === 2 ? "#F5B62E" : "#2FA8D8";
      bars += '<rect x="' + x + '" y="' + y + '" width="42" height="26" rx="7" fill="' + fill + '" stroke="#241F2E" stroke-width="2.2"/>';
    }
    labels += '<text x="' + (x + 21) + '" y="' + (BASE + 22) + '" text-anchor="middle" ' +
      'font-family="Space Mono, monospace" font-size="12" fill="' + (i >= 5 ? "#241F2E" : "#8B819B") + '">' + c.d + "</text>";
  });

  const note =
    '<rect x="356" y="30" width="300" height="54" rx="14" fill="#FFE1DB" stroke="#241F2E" stroke-width="2.5"/>' +
    '<text x="372" y="53" font-family="Karla, sans-serif" font-size="15" font-weight="700" fill="#241F2E">Nobody planned this week.</text>' +
    '<text x="372" y="72" font-family="Karla, sans-serif" font-size="13" fill="#554C63">Six teachers each set one fair task.</text>';

  return '<svg viewBox="0 0 700 300" role="img" aria-label="Two weeks of assessment, with tasks colliding in the second week">' +
    '<line x1="30" y1="' + BASE + '" x2="676" y2="' + BASE + '" stroke="#241F2E" stroke-width="2.5"/>' +
    '<line x1="352" y1="18" x2="352" y2="' + (BASE + 4) + '" stroke="#8B819B" stroke-width="2" stroke-dasharray="5 5"/>' +
    '<text x="40" y="24" font-family="Space Mono, monospace" font-size="12" fill="#8B819B">WEEK 1</text>' +
    '<text x="364" y="24" font-family="Space Mono, monospace" font-size="12" fill="#8B819B">WEEK 2</text>' +
    bars + labels + note +
  "</svg>";
};

/* --- 4. The gap Uplift fills -------------------------------------------- */

INFO.gap = function () {
  const box = (x, y, w, h, fill, title, sub) =>
    '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" fill="' + fill + '" stroke="#241F2E" stroke-width="2.5"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 32) + '" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="20" font-weight="700" fill="#241F2E">' + title + "</text>" +
    '<text x="' + (x + w / 2) + '" y="' + (y + 55) + '" text-anchor="middle" font-family="Karla, sans-serif" font-size="13" fill="#554C63">' + sub + "</text></g>";

  return '<svg viewBox="0 0 700 260" role="img" aria-label="Study skills and wellbeing are taught separately; Uplift combines them">' +
    box(20, 20, 290, 80, "#D9F0FA", "Study skills", "taught by adults, in one room") +
    box(390, 20, 290, 80, "#DCF4E6", "Wellbeing help", "taught by adults, in another room") +
    '<path d="M165 108 L165 150 L350 150" stroke="#241F2E" stroke-width="2.5" fill="none" stroke-dasharray="7 6"/>' +
    '<path d="M535 108 L535 150 L350 150" stroke="#241F2E" stroke-width="2.5" fill="none" stroke-dasharray="7 6"/>' +
    '<path d="M350 150 L350 172" stroke="#241F2E" stroke-width="2.5"/>' +
    '<path d="M344 166 L350 176 L356 166 Z" fill="#241F2E"/>' +
    box(185, 178, 330, 66, "#EAE3FF", "Uplift", "both at once, led by someone two years older") +
  "</svg>";
};

/* --- Mount them --------------------------------------------------------- */

INFO.mount = function () {
  const set = (id, svg) => { const el = document.getElementById(id); if (el) el.innerHTML = svg; };
  set("ig-pictogram", INFO.pictogram(39, "#F2604C", "#C9BFAE"));
  set("ig-eustress",  INFO.eustress());
  set("ig-stacking",  INFO.stacking());
  set("ig-gap",       INFO.gap());
};

/* ==========================================================================
   UPLIFT — Present from the main page
   --------------------------------------------------------------------------
   The site itself is the deck. P steps to the next section, O steps back.
   Each jump lands the section under the sticky masthead so it fills the
   screen the way a slide would.

   Presentation mode still exists as a backup (press F), but this is the
   path the cue cards are written against.
   ========================================================================== */

(function () {
  const $ = (s) => document.querySelector(s);

  /* Page order. This is the running order the script follows. */
  const SECTIONS = [
    "top", "poll", "issue", "curve", "evidence",
    "system", "people", "program", "measure"
  ];

  let idx = 0;

  function els() {
    return SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
  }

  /** Which section is currently filling the screen. */
  function nearest() {
    const list = els();
    const head = ($(".masthead") || {}).offsetHeight || 60;
    let best = 0, bestDist = Infinity;
    list.forEach((el, i) => {
      const d = Math.abs(el.getBoundingClientRect().top - head - 4);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  function goTo(i) {
    const list = els();
    idx = Math.max(0, Math.min(list.length - 1, i));
    const el = list[idx];
    if (!el) return;
    const head = ($(".masthead") || {}).offsetHeight || 60;
    const y = el.getBoundingClientRect().top + window.pageYOffset - head - 2;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  function typing() {
    const a = document.activeElement;
    return a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable);
  }

  document.addEventListener("keydown", (e) => {
    if (typing()) return;
    if (window.UpliftDeck && window.UpliftDeck.isOpen && window.UpliftDeck.isOpen()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "p" || e.key === "P") { goTo(nearest() + 1); e.preventDefault(); }
    if (e.key === "o" || e.key === "O") { goTo(nearest() - 1); e.preventDefault(); }
  });

  /* --- The live poll, on the main page ---------------------------------- */

  window.mountMainPoll = function () {
    const host = $("#main-poll-buttons");
    if (!host || !window.UPLIFT || !UPLIFT.poll) return;
    const p = UPLIFT.poll;

    p.buckets.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b + "%";
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        $("#main-poll-room-fill").style.width = b + "%";
        $("#main-poll-room-val").textContent = b + "%";
        // National bar only appears after the room has answered, so the
        // comparison lands as a reveal rather than sitting there in advance.
        setTimeout(() => {
          $("#main-poll-nation-row").style.opacity = 1;
          $("#main-poll-nation-fill").style.width = p.national + "%";
          $("#main-poll-nation-val").textContent = p.national + "%";
        }, 700);
      });
      host.appendChild(btn);
    });
  };
})();

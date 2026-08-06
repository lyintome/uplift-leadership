/* ==========================================================================
   UPLIFT — Presentation mode
   --------------------------------------------------------------------------
   Press P (or the button) to open. Arrows or space to move. T starts and
   stops the timer, R resets it, N hides the speaker note strip, Esc exits.

   Built for a 5-minute slot with four speakers. Speakers 1 and 2 carry more,
   as asked. The timer shows elapsed time and colours itself against where
   you should be by the end of the current slide.
   ========================================================================== */

(function () {
  const $ = (s, r) => (r || document).querySelector(s);

  /* --- The running order ---------------------------------------------------
     'by' is the elapsed time (seconds) you should be AT when this slide ends.
     Totals to 300s = 5:00.
     -------------------------------------------------------------------------- */

  const SLIDES = [
    { id: "title",   speaker: 1, by: 18,
      note: "Land the hook, then say your names. Don't rush this bit." },
    { id: "poll",    speaker: 1, by: 55,
      note: "Ask for hands. Count roughly. Click the nearest number. Then the follow-up question — let the silence sit." },
    { id: "define",  speaker: 1, by: 82,
      note: "Eustress vs chronic pressure. Point at the two faces on screen." },
    { id: "curve",   speaker: 2, by: 120,
      note: "HAND OVER. Walk the model: rises, peaks, tips. Say 'working harder, doing worse'." },
    { id: "lift",    speaker: 2, by: 148,
      note: "Hit the Support button. The hill lifts. This is the whole argument — pause after it." },
    { id: "evidence",speaker: 2, by: 178,
      note: "Three numbers only. Say the source out loud for at least one." },
    { id: "system",  speaker: 3, by: 208,
      note: "HAND OVER. Four sources, one pressure. Then the loop." },
    { id: "people",  speaker: 3, by: 232,
      note: "Affected vs enabling. Make the point that teachers and parents are both." },
    { id: "solution",speaker: 4, by: 262,
      note: "HAND OVER. What Uplift actually is, in one sentence, then the rollout." },
    { id: "measure", speaker: 4, by: 285,
      note: "Say clearly these are targets, not results. That honesty is worth marks." },
    { id: "close",   speaker: 4, by: 300,
      note: "Land it. Say the last line slowly and stop talking." }
  ];

  let idx = 0, open = false;
  let running = false, elapsed = 0, tick = null;
  let curveApi = null, systemsApi = null;

  /* --- Timer -------------------------------------------------------------- */

  function fmt(s) {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  }

  function paintTimer() {
    const el = $("#deck-timer");
    if (!el) return;
    el.textContent = fmt(elapsed);
    const due = SLIDES[idx].by;
    el.dataset.pace = elapsed > 300 ? "over" : elapsed > due + 8 ? "close" : "good";
  }

  function startStop() {
    running = !running;
    if (running) {
      tick = setInterval(() => { elapsed += 1; paintTimer(); }, 1000);
    } else {
      clearInterval(tick);
    }
  }

  function resetTimer() {
    running = false;
    clearInterval(tick);
    elapsed = 0;
    paintTimer();
  }

  /* --- Navigation --------------------------------------------------------- */

  function show(i) {
    idx = Math.max(0, Math.min(SLIDES.length - 1, i));
    document.querySelectorAll(".slide").forEach((s) => s.classList.remove("is-live"));
    const s = $("#slide-" + SLIDES[idx].id);
    if (s) s.classList.add("is-live");

    const sp = $("#deck-speaker");
    sp.textContent = "Speaker " + SLIDES[idx].speaker;
    sp.dataset.speaker = SLIDES[idx].speaker;

    $("#deck-count").textContent = (idx + 1) + " / " + SLIDES.length;
    $("#deck-note-text").textContent = SLIDES[idx].note;
    $("#deck-note-due").textContent = "by " + fmt(SLIDES[idx].by);
    paintTimer();

    // Stagger any bullet points on the new slide.
    if (s) {
      const pts = s.querySelectorAll(".slide-points li");
      pts.forEach((li, k) => {
        li.classList.remove("is-shown");
        setTimeout(() => li.classList.add("is-shown"), 220 + k * 230);
      });
    }

    // Drive the models from the deck so the visuals match the words.
    if (SLIDES[idx].id === "curve" && curveApi) curveApi.showOverload();
    if (SLIDES[idx].id === "lift" && curveApi) curveApi.showSupported();
    if (SLIDES[idx].id === "system" && systemsApi) systemsApi.showLoop();
  }

  function openDeck() {
    open = true;
    $("#deck").classList.add("is-open");
    document.body.style.overflow = "hidden";
    show(0);
    resetTimer();
  }

  function closeDeck() {
    open = false;
    $("#deck").classList.remove("is-open");
    document.body.style.overflow = "";
    running = false;
    clearInterval(tick);
  }

  /* --- The live poll ------------------------------------------------------- */

  function buildPoll() {
    const p = UPLIFT.poll;
    const host = $("#poll-buttons");
    p.buckets.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b + "%";
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        $("#poll-room-fill").style.width = b + "%";
        $("#poll-room-val").textContent = b + "%";
        // The national bar only appears once the room has answered, so the
        // comparison lands as a reveal rather than sitting there in advance.
        setTimeout(() => {
          $("#poll-nation-row").style.opacity = 1;
          $("#poll-nation-fill").style.width = p.national + "%";
          $("#poll-nation-val").textContent = p.national + "%";
        }, 700);
      });
      host.appendChild(btn);
    });
  }

  /* --- Keys ---------------------------------------------------------------- */

  document.addEventListener("keydown", (e) => {
    if (!open) {
      // P is reserved for scrolling the main page, so the deck opens on F.
      if (e.key === "f" || e.key === "F") {
        if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        openDeck();
      }
      return;
    }
    if (e.key === "Escape") { closeDeck(); return; }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { show(idx + 1); e.preventDefault(); return; }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { show(idx - 1); e.preventDefault(); return; }
    if (e.key === "t" || e.key === "T") { startStop(); return; }
    if (e.key === "r" || e.key === "R") { resetTimer(); return; }
    if (e.key === "n" || e.key === "N") { $("#deck-note").classList.toggle("is-hidden"); return; }
  });

  /* --- Boot ---------------------------------------------------------------- */

  window.UpliftDeck = {
    isOpen() { return open; },
    init(apis) {
      curveApi = apis.curve;
      systemsApi = apis.systems;
      buildPoll();
      const b = $("#present-btn");
      if (b) b.addEventListener("click", openDeck);
      const x = $("#deck-x");
      if (x) x.addEventListener("click", closeDeck);
      const t = $("#deck-timer");
      if (t) t.addEventListener("click", startStop);
      const prev = $("#deck-prev"), next = $("#deck-next");
      if (prev) prev.addEventListener("click", () => show(idx - 1));
      if (next) next.addEventListener("click", () => show(idx + 1));
    }
  };
})();

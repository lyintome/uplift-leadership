/* ==========================================================================
   UPLIFT — Wiring
   ========================================================================== */

(function () {
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Scroll reveals -------------------------------------------------- */

  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  function watch(el) { revealer.observe(el); }

  /* --- Count-up -------------------------------------------------------- */

  function countUp(el, target, suffix) {
    if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1500, t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* --- Evidence -------------------------------------------------------- */

  function buildStats() {
    const host = $("#stat-grid");
    UPLIFT.stats.forEach((s) => {
      const card = document.createElement("article");
      card.className = "stat reveal";
      card.dataset.tone = s.tone;
      card.innerHTML =
        '<span class="stat-figure" data-target="' + s.value + '" data-suffix="' + s.suffix + '">0</span>' +
        '<p class="stat-claim">' + s.claim + "</p>" +
        '<span class="stat-cite">' + s.cite + "</span>";
      host.appendChild(card);
      watch(card);
    });

    const figures = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const s = UPLIFT.stats.find((x) => String(x.value) === el.dataset.target);
        if (s && s.altLabel) { el.textContent = s.altLabel; }
        else countUp(el, Number(el.dataset.target), el.dataset.suffix);
        figures.unobserve(el);
      });
    }, { threshold: 0.6 });
    $$(".stat-figure").forEach((f) => figures.observe(f));
  }

  /* --- Stakeholders ---------------------------------------------------- */

  const TYPE_LABEL = { affected: "Affected", enabling: "Enabling", both: "Affected + enabling" };

  function buildStakeholders() {
    const grid = $("#stake-grid");
    const detail = $("#stake-detail");

    function show(s) {
      detail.innerHTML =
        "<h3>" + s.name + "</h3>" +
        '<span class="stake-tag" data-type="' + s.type + '">' + TYPE_LABEL[s.type] + "</span>" +
        "<dl>" +
        "<div><dt>Perspective</dt><dd>" + s.perspective + "</dd></div>" +
        "<div><dt>Influence</dt><dd>" + s.influence + "</dd></div>" +
        "<div><dt>Role in Uplift</dt><dd>" + s.role + "</dd></div>" +
        "</dl>";
    }

    UPLIFT.stakeholders.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stake";
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = '<span class="stake-name">' + s.name + "</span>" +
                    '<span class="stake-tag" data-type="' + s.type + '">' + TYPE_LABEL[s.type] + "</span>";
      b.addEventListener("click", () => {
        $$(".stake", grid).forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        show(s);
      });
      grid.appendChild(b);
    });

    show(UPLIFT.stakeholders[0]);
  }

  /* --- Rollout, risks, metrics, sources -------------------------------- */

  function buildRollout() {
    const host = $("#steps");
    UPLIFT.rollout.forEach((s) => {
      const row = document.createElement("article");
      row.className = "step reveal";
      row.innerHTML = '<span class="step-when">' + s.when + "</span>" +
                      "<div><h3>" + s.title + "</h3><p>" + s.text + "</p></div>";
      host.appendChild(row);
      watch(row);
    });
  }

  function buildRisks() {
    const host = $("#risk-grid");
    UPLIFT.risks.forEach((r) => {
      const card = document.createElement("article");
      card.className = "risk reveal";
      card.innerHTML = "<h4>" + r.risk + "</h4><p>" + r.detail + "</p>" +
                       '<span class="risk-fix"><strong>How we handle it:</strong> ' + r.fix + "</span>";
      host.appendChild(card);
      watch(card);
    });
  }

  function buildMetrics() {
    const host = $("#dash");
    UPLIFT.metrics.forEach((m) => {
      const card = document.createElement("article");
      card.className = "metric reveal";
      card.innerHTML = '<span class="metric-label">' + m.label + "</span>" +
                       '<span class="metric-name">' + m.name + "</span>" +
                       '<p class="metric-how">' + m.how + "</p>" +
                       '<div class="bar"><span data-fill="' + m.fill + '"></span></div>';
      host.appendChild(card);
      watch(card);
    });

    const bars = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.width = e.target.dataset.fill + "%";
        bars.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    $$(".bar span").forEach((b) => bars.observe(b));
  }

  function buildSources() {
    const host = $("#sources");
    UPLIFT.sources.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      host.appendChild(li);
    });
  }

  /* --- Nav active state ------------------------------------------------ */

  function buildNav() {
    const links = $$(".mast-nav a");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* --- 3D availability -------------------------------------------------- */

  function canRender3D() {
    if (!window.THREE) return false;
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) { return false; }
  }

  /** If 3D can't run, say so plainly rather than leaving an empty frame. */
  function fallback(cardId, controlIds, message) {
    const card = $(cardId);
    if (card) {
      card.hidden = false;
      card.innerHTML = '<span class="tour-step">Model unavailable</span>' +
                       "<h4>This browser can't run the 3D model</h4><p>" + message + "</p>";
    }
    controlIds.forEach((id) => { const b = $(id); if (b) b.hidden = true; });
  }

  /* --- Model 1: the pressure surface ----------------------------------- */

  function bootSurface() {
    const canvas = $("#surface-canvas");
    if (!canvas) return;
    if (!canRender3D()) {
      fallback("#surface-tour", ["#surface-take", "#surface-replay"],
        "The argument still holds: performance rises with demand up to a peak, then falls. More trusted support raises that peak and moves it further right.");
      return;
    }

    const card = $("#surface-tour");
    const rig = $("#surface-rig");
    const takeBtn = $("#surface-take");
    const replayBtn = $("#surface-replay");
    const readout = $("#surface-readout");
    const dIn = $("#demand"), sIn = $("#support");
    const dOut = $("#demand-out"), sOut = $("#support-out");

    const api = window.initPressureSurface(canvas, {
      onTour(s, i, n) {
        card.hidden = false;
        card.style.opacity = 0;
        setTimeout(() => { card.style.opacity = 1; }, 60);
        card.innerHTML = '<span class="tour-step">Guided · ' + (i + 1) + " of " + n + "</span>" +
                         "<h4>" + s.title + "</h4><p>" + s.text + "</p>";
      },
      onUnlock() {
        card.innerHTML = '<span class="tour-step">Yours now</span>' +
                         "<h4>Try it yourself</h4>" +
                         "<p>Drag to orbit, scroll to zoom, and move the sliders below. " +
                         "Raise support and watch the peak climb and slide right.</p>";
        rig.hidden = false;
        takeBtn.hidden = true;
        replayBtn.hidden = false;
      },
      onReplay() { rig.hidden = true; takeBtn.hidden = false; replayBtn.hidden = true; },
      onState(zone, live) {
        // Never write back into a slider the user currently has hold of.
        if (document.activeElement !== dIn) dIn.value = Math.round(live.demand * 100);
        if (document.activeElement !== sIn) sIn.value = Math.round(live.support * 100);
        dOut.textContent = dIn.value + "%";
        sOut.textContent = sIn.value + "%";
        const state = zone < -0.16 ? "healthy" : zone > 0.16 ? "distress" : "tipping";
        if (readout.dataset.state !== state) {
          readout.dataset.state = state;
          readout.textContent =
            state === "healthy"  ? "HEALTHY CHALLENGE — stretched, still coping" :
            state === "tipping"  ? "TIPPING POINT — performing at the limit" :
                                   "DISTRESS — effort rising, results falling";
        }
      }
    });

    takeBtn.addEventListener("click", () => api.takeOver());
    replayBtn.addEventListener("click", () => api.replay());
    dIn.addEventListener("input", () => api.setDemand(dIn.value / 100));
    sIn.addEventListener("input", () => api.setSupport(sIn.value / 100));
  }

  /* --- Model 2: the systems map ---------------------------------------- */

  function bootSystems() {
    const canvas = $("#systems-canvas");
    if (!canvas) return;
    if (!canRender3D()) {
      fallback("#systems-tour", ["#systems-take", "#systems-replay", "#systems-loop"],
        "Four clusters feed one core: individual, school, family and social. The loop that matters is pressure impairing performance, which deepens fear of failure, which raises pressure again.");
      return;
    }

    const card = $("#systems-tour");
    const takeBtn = $("#systems-take");
    const replayBtn = $("#systems-replay");
    const loopBtn = $("#systems-loop");

    const api = window.initSystemsMap(canvas, {
      onTour(s, i, n) {
        card.hidden = false;
        card.innerHTML = '<span class="tour-step">Guided · ' + (i + 1) + " of " + n + "</span>" +
                         "<h4>" + s.title + "</h4><p>" + s.text + "</p>";
      },
      onUnlock() {
        card.innerHTML = '<span class="tour-step">Yours now</span>' +
                         "<h4>Explore the system</h4>" +
                         "<p>Drag to orbit and click any cause to read how it connects.</p>";
        takeBtn.hidden = true;
        replayBtn.hidden = false;
        loopBtn.hidden = false;
      },
      onReplay() { takeBtn.hidden = false; replayBtn.hidden = true; loopBtn.hidden = true; },
      onSelect(node) {
        card.innerHTML = '<span class="tour-step">' +
          (UPLIFT.clusterMeta[node.cluster] ? UPLIFT.clusterMeta[node.cluster].label : "Cause") + "</span>" +
          "<h4>" + node.label + "</h4><p>" + node.detail + "</p>";
      }
    });

    takeBtn.addEventListener("click", () => api.takeOver());
    replayBtn.addEventListener("click", () => api.replay());
    loopBtn.addEventListener("click", () => api.showLoop());
  }

  /* --- Go -------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    buildStats();
    buildStakeholders();
    buildRollout();
    buildRisks();
    buildMetrics();
    buildSources();
    buildNav();
    $$(".reveal").forEach(watch);
    bootSurface();
    bootSystems();
  });
})();

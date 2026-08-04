/* ==========================================================================
   UPLIFT — Wiring (v2)
   ========================================================================== */

(function () {
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Reveals ---------------------------------------------------------- */

  const revealer = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const watch = (el) => revealer.observe(el);

  /* --- Count-up --------------------------------------------------------- */

  function countUp(el, target, suffix) {
    if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1400, t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, ((now || t0) - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* --- Evidence --------------------------------------------------------- */

  function buildStats() {
    const host = $("#stat-grid");
    UPLIFT.stats.forEach((s) => {
      const c = document.createElement("article");
      c.className = "stat reveal";
      c.dataset.tone = s.tone;
      c.innerHTML =
        '<span class="stat-figure" data-target="' + s.value + '" data-suffix="' + s.suffix + '">0</span>' +
        '<p class="stat-claim">' + s.claim + "</p>" +
        '<span class="stat-cite">' + s.cite + "</span>";
      host.appendChild(c);
      watch(c);
    });

    const figs = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const s = UPLIFT.stats.find((x) => String(x.value) === el.dataset.target);
        if (s && s.altLabel) el.textContent = s.altLabel;
        else countUp(el, Number(el.dataset.target), el.dataset.suffix);
        figs.unobserve(el);
      });
    }, { threshold: .6 });
    $$(".stat-figure").forEach((f) => figs.observe(f));
  }

  /* --- Stakeholders ----------------------------------------------------- */

  const TYPE = { affected: "Affected", enabling: "Enabling", both: "Both" };

  function buildStakeholders() {
    const grid = $("#stake-grid"), detail = $("#stake-detail");

    function show(s) {
      detail.innerHTML =
        "<h3>" + s.name + "</h3>" +
        '<span class="stake-tag" data-type="' + s.type + '">' + TYPE[s.type] + "</span>" +
        "<dl>" +
        "<div><dt>How they see it</dt><dd>" + s.perspective + "</dd></div>" +
        "<div><dt>Their influence</dt><dd>" + s.influence + "</dd></div>" +
        "<div><dt>Role in Uplift</dt><dd>" + s.role + "</dd></div>" +
        "</dl>";
    }

    UPLIFT.stakeholders.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stake";
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = '<span class="stake-name">' + s.name + "</span>" +
                    '<span class="stake-tag" data-type="' + s.type + '">' + TYPE[s.type] + "</span>";
      b.addEventListener("click", () => {
        $$(".stake", grid).forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        show(s);
      });
      grid.appendChild(b);
    });
    show(UPLIFT.stakeholders[0]);
  }

  /* --- Rollout / risks / sources ----------------------------------------- */

  function buildRollout() {
    const host = $("#steps");
    UPLIFT.rollout.forEach((s) => {
      const r = document.createElement("article");
      r.className = "step reveal";
      r.innerHTML = '<span class="step-when">' + s.when + "</span><div><h3>" + s.title + "</h3><p>" + s.text + "</p></div>";
      host.appendChild(r);
      watch(r);
    });
  }

  function buildRisks() {
    const host = $("#risk-grid");
    UPLIFT.risks.forEach((r) => {
      const c = document.createElement("article");
      c.className = "risk reveal";
      c.innerHTML = "<h4>" + r.risk + "</h4><p>" + r.detail + "</p>" +
                    '<span class="risk-fix"><strong>Our fix:</strong> ' + r.fix + "</span>";
      host.appendChild(c);
      watch(c);
    });
  }

  function buildSources() {
    const host = $("#sources");
    UPLIFT.sources.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      host.appendChild(li);
    });
  }

  /* --- Metrics: two real bars, before and target ------------------------- */

  let metricsMode = "both";

  function buildMetrics() {
    const host = $("#dash");
    UPLIFT.metrics.forEach((m, i) => {
      const c = document.createElement("article");
      c.className = "metric reveal";
      c.innerHTML =
        '<span class="metric-label">' + m.label + "</span>" +
        '<span class="metric-name">' + m.name + "</span>" +
        '<p class="metric-how">' + m.how + "</p>" +
        '<div class="bar-wrap">' +
          '<div class="bar-row" data-role="now">' +
            '<span class="bar-key">Now</span>' +
            '<span class="bar bar--now"><span data-val="' + m.now + '"></span></span>' +
            '<span class="bar-val">' + m.now + m.unit + "</span>" +
          "</div>" +
          '<div class="bar-row" data-role="target">' +
            '<span class="bar-key">Target</span>' +
            '<span class="bar bar--target"><span data-val="' + m.target + '"></span></span>' +
            '<span class="bar-val">' + m.target + m.unit + "</span>" +
          "</div>" +
        "</div>";
      host.appendChild(c);
      watch(c);
    });

    const bars = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.width = e.target.dataset.val + "%";
        bars.unobserve(e.target);
      });
    }, { threshold: .4 });
    $$(".bar span").forEach((b) => bars.observe(b));

    $$("[data-dash]").forEach((btn) => {
      btn.addEventListener("click", () => {
        metricsMode = btn.dataset.dash;
        $$("[data-dash]").forEach((x) => x.setAttribute("aria-pressed", x === btn ? "true" : "false"));
        $$(".bar-row").forEach((row) => {
          const role = row.dataset.role;
          row.style.display = (metricsMode === "both" || metricsMode === role) ? "" : "none";
        });
      });
    });
  }

  /* --- Nav -------------------------------------------------------------- */

  function buildNav() {
    const links = $$(".mast-nav a");
    const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  /* --- 3D availability --------------------------------------------------- */

  function canRender3D() {
    if (!window.THREE) return false;
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) { return false; }
  }

  function fallback(cardSel, ctrlSels, msg) {
    const card = $(cardSel);
    if (card) {
      card.hidden = false;
      card.innerHTML = '<span class="tour-step">Model unavailable</span>' +
                       "<h4>This browser can't run 3D</h4><p>" + msg + "</p>";
    }
    ctrlSels.forEach((s) => { const b = $(s); if (b) b.hidden = true; });
  }

  /* --- Model 1: the curve ------------------------------------------------ */

  function bootCurve() {
    const canvas = $("#curve-canvas");
    if (!canvas) return null;
    if (!canRender3D()) {
      fallback("#curve-tour", ["#curve-take", "#curve-replay"],
        "The point still stands: a bit of pressure helps, too much makes you worse, and support raises how much you can carry.");
      return null;
    }

    const card = $("#curve-tour"), rig = $("#curve-rig");
    const take = $("#curve-take"), replay = $("#curve-replay");
    const readout = $("#curve-readout");
    const dIn = $("#demand"), sIn = $("#support");
    const dOut = $("#demand-out"), sOut = $("#support-out");

    const api = window.initCurve(canvas, {
      onTour(s, i, n) {
        card.hidden = false;
        card.innerHTML = '<span class="tour-step">' + (i + 1) + " of " + n + "</span><h4>" + s.title + "</h4><p>" + s.text + "</p>";
      },
      onUnlock() {
        card.innerHTML = '<span class="tour-step">Your turn</span><h4>Have a go</h4>' +
          "<p>Drag the sliders. Push the workload up and watch them buckle — then turn the support up and watch them stand back up.</p>";
        rig.hidden = false;
        take.hidden = true;
        replay.hidden = false;
      },
      onReplay() { rig.hidden = true; take.hidden = false; replay.hidden = true; },
      onState(z, live) {
        if (document.activeElement !== dIn) dIn.value = Math.round(live.demand * 100);
        if (document.activeElement !== sIn) sIn.value = Math.round(live.support * 100);
        dOut.textContent = dIn.value + "%";
        sOut.textContent = sIn.value + "%";
        const st = z < -0.16 ? "healthy" : z > 0.16 ? "distress" : "tipping";
        if (readout.dataset.state !== st) {
          readout.dataset.state = st;
          readout.textContent =
            st === "healthy"  ? "COPING — stretched, but fine" :
            st === "tipping"  ? "AT THE LIMIT — this is their peak" :
                                "OVERLOADED — working harder, doing worse";
        }
      }
    });

    take.addEventListener("click", () => api.takeOver());
    replay.addEventListener("click", () => api.replay());
    dIn.addEventListener("input", () => api.setDemand(dIn.value / 100));
    sIn.addEventListener("input", () => api.setSupport(sIn.value / 100));
    return api;
  }

  /* --- Model 2: the systems map ------------------------------------------ */

  function bootSystems() {
    const canvas = $("#systems-canvas");
    if (!canvas) return null;
    if (!canRender3D()) {
      fallback("#systems-tour", ["#systems-take", "#systems-replay", "#systems-loop"],
        "Four sources feed one pressure: you, school, home and mates. And it loops — pressure makes you do worse, which feeds fear of failing, which raises the pressure.");
      return null;
    }

    const card = $("#systems-tour");
    const take = $("#systems-take"), replay = $("#systems-replay"), loop = $("#systems-loop");

    const api = window.initSystemsMap(canvas, {
      onTour(s, i, n) {
        card.hidden = false;
        card.innerHTML = '<span class="tour-step">' + (i + 1) + " of " + n + "</span><h4>" + s.title + "</h4><p>" + s.text + "</p>";
      },
      onUnlock() {
        card.innerHTML = '<span class="tour-step">Your turn</span><h4>Poke around</h4><p>Drag to spin it. Click any cause to see how it connects.</p>';
        take.hidden = true; replay.hidden = false; loop.hidden = false;
      },
      onReplay() { take.hidden = false; replay.hidden = true; loop.hidden = true; },
      onSelect(n) {
        const m = UPLIFT.clusterMeta[n.cluster];
        card.hidden = false;
        card.innerHTML = '<span class="tour-step">' + (m ? m.label : "Cause") + '</span><h4>' + n.label + "</h4><p>" + n.detail + "</p>";
      }
    });

    take.addEventListener("click", () => api.takeOver());
    replay.addEventListener("click", () => api.replay());
    loop.addEventListener("click", () => api.showLoop());
    return api;
  }

  /* --- Go ---------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    buildStats();
    buildStakeholders();
    buildRollout();
    buildRisks();
    buildMetrics();
    buildSources();
    buildNav();
    if (window.INFO) INFO.mount();
    $$(".reveal").forEach(watch);
    $$(".hl-swipe").forEach(watch);

    const curve = bootCurve();
    const systems = bootSystems();
    if (window.UpliftDeck) window.UpliftDeck.init({ curve: curve, systems: systems });
  });
})();

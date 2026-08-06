/* ==========================================================================
   UPLIFT — The Curve
   --------------------------------------------------------------------------
   Replaces the old 3D surface plot, which was elegant and unreadable. A
   surface plot asks the viewer to already know how to read a surface plot.
   This asks nothing: one bold line, one small person walking along it.

   Left to right  = how much is being asked of them.
   Height         = how well they're actually doing.
   The figure     = stands tall in the green, buckles in the red.
   Support slider = lifts the whole line and pushes the peak further right.
   ========================================================================== */

(function () {
  const SPAN = 7.6;
  const H    = 2.9;

  const optimum   = (s) => 0.30 + 0.34 * s;
  const tolerance = (s) => 0.150 + 0.125 * s;
  const ceiling   = (s) => 0.50 + 0.50 * s;

  function heightAt(d, s) {
    const o = optimum(s), w = tolerance(s);
    return ceiling(s) * Math.exp(-((d - o) ** 2) / (2 * w * w));
  }

  /** -1 = under-challenged, 0 = at the peak, +1 = deep distress. */
  function zoneAt(d, s) {
    return Math.max(-1, Math.min(1, (d - optimum(s)) / (tolerance(s) * 2.1)));
  }

  const GREEN = new THREE.Color(0x3FA96B);
  const GOLD  = new THREE.Color(0xF5B62E);
  const CORAL = new THREE.Color(0xF2604C);
  const PALE  = new THREE.Color(0x9FD4B4);

  function zoneColour(z) {
    const c = new THREE.Color();
    if (z < -0.16)      c.copy(PALE).lerp(GREEN, Math.min(1, (z + 1) / 0.84));
    else if (z <= 0.16) c.copy(GOLD);
    else                c.copy(GOLD).lerp(CORAL, Math.min(1, (z - 0.16) / 0.5));
    return c;
  }

  const world = (d, s, lift) => new THREE.Vector3(
    d * SPAN - SPAN / 2, heightAt(d, s) * H + (lift || 0), 0
  );

  /* --- A chunky little person -------------------------------------------- */

  function makeFigure() {
    const g = new THREE.Group();
    const skin  = new THREE.MeshStandardMaterial({ color: 0xFFCBA4, roughness: .75 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x6C4CD6, roughness: .8 });
    const dark  = new THREE.MeshStandardMaterial({ color: 0x241F2E, roughness: .7 });

    const torso = new THREE.Group();
    g.add(torso);

    // r128 has no CapsuleGeometry, so a slightly tapered cylinder does the job.
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.128, 0.34, 16), shirt);
    body.position.y = 0.30;
    torso.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 20), skin);
    head.position.y = 0.56;
    torso.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.133, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), dark);
    hair.position.y = 0.575;
    torso.add(hair);

    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.20, 12), dark);
    legs.position.y = 0.10;
    g.add(legs);

    // The stack of work they're carrying. Grows with demand.
    const stack = new THREE.Group();
    stack.position.set(0, 0.46, -0.16);
    torso.add(stack);

    const cols = [0xF2604C, 0xF5B62E, 0x2FA8D8, 0x3FA96B, 0xF2604C, 0xF5B62E];
    const books = cols.map((c, i) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.30, 0.062, 0.22),
        new THREE.MeshStandardMaterial({ color: c, roughness: .8 })
      );
      b.position.y = i * 0.068;
      b.rotation.y = (i % 2 ? 1 : -1) * 0.14;
      b.visible = false;
      stack.add(b);
      return b;
    });

    return {
      group: g,
      /** t: 0 = upright and fine, 1 = fully buckled. */
      setPosture(t, bookCount) {
        torso.rotation.x = t * 0.95;
        torso.position.y = -t * 0.10;
        head.rotation.x = t * 0.5;
        stack.rotation.x = -t * 0.55;
        books.forEach((b, i) => { b.visible = i < bookCount; });
        body.material.color.copy(zoneColour(t * 2 - 1)).lerp(new THREE.Color(0x6C4CD6), 0.55);
      }
    };
  }

  window.initCurve = function (canvas, ui) {
    const { renderer, scene, camera, resize } = makeStage(canvas, null);

    scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xD8C9B4, 1.15));
    const key = new THREE.DirectionalLight(0xFFFFFF, 0.75);
    key.position.set(3, 8, 6);
    scene.add(key);

    const root = new THREE.Group();
    scene.add(root);

    // --- Baseline -----------------------------------------------------------
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(SPAN + 0.7, 0.045, 0.045),
      new THREE.MeshStandardMaterial({ color: 0x241F2E, roughness: .8 })
    );
    base.position.y = -0.02;
    root.add(base);

    // --- Ghost curve: where they'd be with no support ------------------------
    const GHOST_N = 90;
    const ghostGeo = new THREE.BufferGeometry();
    ghostGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(GHOST_N * 3), 3));
    const ghost = new THREE.Line(ghostGeo, new THREE.LineDashedMaterial({
      color: 0x8B819B, dashSize: 0.14, gapSize: 0.10, transparent: true, opacity: 0.55
    }));
    root.add(ghost);

    (function drawGhost() {
      const a = ghost.geometry.attributes.position.array;
      for (let i = 0; i < GHOST_N; i++) {
        const p = world(i / (GHOST_N - 1), 0, 0.02);
        a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = 0;
      }
      ghost.geometry.attributes.position.needsUpdate = true;
      ghost.computeLineDistances();
    })();

    // --- The live curve, as chunky coloured segments -------------------------
    const SEGS = 54;
    const segs = [];
    for (let i = 0; i < SEGS; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.13, 0.13),
        new THREE.MeshStandardMaterial({ color: 0x3FA96B, roughness: .55 })
      );
      root.add(m);
      segs.push(m);
    }

    function drawCurve(support) {
      for (let i = 0; i < SEGS; i++) {
        const d0 = i / SEGS, d1 = (i + 1) / SEGS;
        const p0 = world(d0, support, 0), p1 = world(d1, support, 0);
        const m = segs[i];
        m.position.copy(p0).add(p1).multiplyScalar(0.5);
        m.scale.x = p0.distanceTo(p1) * 1.06;
        m.rotation.z = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        m.material.color.copy(zoneColour(zoneAt((d0 + d1) / 2, support)));
      }
    }

    // --- Zone floor bands -----------------------------------------------------
    const BAND_COL = [0x3FA96B, 0xF5B62E, 0xF2604C];
    const bands = BAND_COL.map((col) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .13, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(0, 0.004, 0.9);
      root.add(m);
      return m;
    });

    function placeBands(s) {
      const o = optimum(s), w = tolerance(s);
      const edges = [
        [0, Math.max(0, o - w * 0.55)],
        [Math.max(0, o - w * 0.55), Math.min(1, o + w * 0.55)],
        [Math.min(1, o + w * 0.55), 1]
      ];
      edges.forEach((e, i) => {
        const x0 = e[0] * SPAN - SPAN / 2, x1 = e[1] * SPAN - SPAN / 2;
        bands[i].scale.set(Math.max(0.01, x1 - x0), 1.8, 1);
        bands[i].position.x = (x0 + x1) / 2;
      });
    }

    // --- Figure ----------------------------------------------------------------
    const figure = makeFigure();
    root.add(figure.group);

    // --- Camera ----------------------------------------------------------------
    const orbit = makeOrbit(camera, canvas, {
      radius: 8.2, theta: 0.10, phi: 1.30, ty: 0.85,
      minRadius: 5, maxRadius: 13, minPhi: 0.5, maxPhi: 1.52, spinSpeed: 0.00028
    });

    // --- State ------------------------------------------------------------------
    const live = { demand: 0.05, support: 0.10 };
    const want = { demand: 0.05, support: 0.10 };

    function frameUpdate() {
      drawCurve(live.support);
      placeBands(live.support);
      figure.group.position.copy(world(live.demand, live.support, 0.07));

      const z = zoneAt(live.demand, live.support);
      figure.setPosture(
        Math.max(0, Math.min(1, (z - 0.05) / 0.85)),
        Math.round(1 + live.demand * 5)
      );
      if (ui.onState) ui.onState(z, live);
    }

    // --- Guided tour --------------------------------------------------------------
    const tour = [
      { title: "Meet a student.",
        text: "Nothing much is being asked of them yet. Flat line, no stretch \u2014 this is boredom, not calm.",
        demand: 0.05, support: 0.10, cam: { theta: 0.10, phi: 1.30, radius: 8.2 }, hold: 7000 },
      { title: "A bit of pressure helps.",
        text: "Work comes in and they rise to it. Standing taller. This is the good kind \u2014 researchers call it eustress.",
        demand: 0.24, support: 0.10, cam: { theta: 0.22, phi: 1.20, radius: 7.4 }, hold: 8000 },
      { title: "This is their peak.",
        text: "Top of the hill. Carrying a real load and handling it. Every student has a point like this.",
        demand: 0.31, support: 0.10, cam: { theta: 0.34, phi: 1.06, radius: 6.6 }, hold: 7500 },
      { title: "Then it tips.",
        text: "More gets piled on and they start going backwards. Watch them buckle \u2014 and watch the line drop. Working harder, doing worse.",
        demand: 0.80, support: 0.10, cam: { theta: 0.05, phi: 1.12, radius: 7.2 }, hold: 11000 },
      { title: "Now add support.",
        text: "Same student. Same pile of work. The whole hill lifts and stretches right \u2014 and they stand back up.",
        demand: 0.80, support: 0.92, cam: { theta: -0.30, phi: 1.14, radius: 8.4 }, hold: 12000 },
      { title: "That's the whole idea.",
        text: "We can't delete deadlines. We can move where the tipping point sits. The dotted line is where they'd be without us.",
        demand: 0.62, support: 0.92, cam: { theta: 0.30, phi: 1.22, radius: 8.4 }, hold: 9000 }
    ];

    let step = -1, timer = 0, mode = "tour";

    function goto(i) {
      step = i;
      const s = tour[i];
      want.demand = s.demand;
      want.support = s.support;
      orbit.flyTo(s.cam);
      timer = 0;
      if (ui.onTour) ui.onTour(s, i, tour.length);
    }

    function unlock() {
      mode = "free";
      orbit.setEnabled(true);
      if (ui.onUnlock) ui.onUnlock();
    }

    // --- Loop ----------------------------------------------------------------------
    let last = (window.performance || Date).now(), running = false;

    const io = new IntersectionObserver((e) => {
      running = e[0].isIntersecting;
      if (running && step === -1) goto(0);
    }, { threshold: 0.10 });
    io.observe(canvas);

    function loop() {
      requestAnimationFrame(loop);
      const now = (window.performance || Date).now();
      const dt = Math.min(64, now - last);
      last = now;
      if (!running) return;

      resize();

      if (mode === "tour") {
        timer += dt;
        if (timer > tour[step].hold) {
          if (step < tour.length - 1) goto(step + 1); else unlock();
        }
      }

      live.demand  += (want.demand  - live.demand)  * 0.042;
      live.support += (want.support - live.support) * 0.042;

      frameUpdate();
      orbit.update(dt);
      renderer.render(scene, camera);
    }
    loop();

    return {
      setDemand(v)  { want.demand = v;  if (mode === "tour") unlock(); },
      setSupport(v) { want.support = v; if (mode === "tour") unlock(); },
      takeOver()    { if (mode === "tour") unlock(); },
      replay()      { mode = "tour"; orbit.setEnabled(false); goto(0); if (ui.onReplay) ui.onReplay(); },
      showSupported() { unlock(); want.demand = 0.72; want.support = 0.92; orbit.flyTo({ theta: -0.25, phi: 1.16, radius: 8.4 }); },
      showOverload()  { unlock(); want.demand = 0.82; want.support = 0.08; orbit.flyTo({ theta: 0.05, phi: 1.12, radius: 7.4 }); },
      get mode() { return mode; }
    };
  };
})();

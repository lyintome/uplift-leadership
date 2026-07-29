/* ==========================================================================
   UPLIFT — The pressure surface
   --------------------------------------------------------------------------
   Three axes:
     X  demand        how much is being asked of a student
     Z  support       how much trusted help is around them
     Y  performance   and wellbeing

   The shape encodes the argument. Raise support and the peak gets higher AND
   moves further right: the same student can carry more pressure before it
   turns into harm. Uplift does not remove demand — it moves the curve.
   ========================================================================== */

(function () {
  const SIZE = 6;      // world units across
  const SEG  = 96;     // surface resolution
  const H    = 2.3;    // height scale

  // --- The model ---------------------------------------------------------
  const optimum   = (s) => 0.30 + 0.36 * s;   // where the peak sits
  const tolerance = (s) => 0.155 + 0.13 * s;  // how wide the good zone is
  const ceiling   = (s) => 0.48 + 0.52 * s;   // how high it can go

  function performance(demand, support) {
    const o = optimum(support), w = tolerance(support);
    return ceiling(support) * Math.exp(-((demand - o) ** 2) / (2 * w * w));
  }

  /** Where a point sits relative to the peak: -1 under-challenged … +1 deep distress. */
  function zoneOf(demand, support) {
    return Math.max(-1, Math.min(1, (demand - optimum(support)) / (tolerance(support) * 2.1)));
  }

  const EUCALYPT = new THREE.Color(0x6E9068);
  const GOLD     = new THREE.Color(0xDFA046);
  const EMBER    = new THREE.Color(0xC4614A);
  const PALE     = new THREE.Color(0xBFD3B8);

  function colourFor(z, height) {
    const c = new THREE.Color();
    if (z < 0) c.copy(PALE).lerp(EUCALYPT, Math.min(1, (z + 1) / 0.72));
    else       c.copy(GOLD).lerp(EMBER, Math.min(1, z / 0.55));
    if (z >= -0.16 && z <= 0.16) c.lerp(GOLD, 0.55);
    // Valleys read slightly cooler so the ridge reads as the subject of the shape.
    return c.lerp(new THREE.Color(0xEFE2EC), (1 - height) * 0.34);
  }

  function labelSprite(text, colour) {
    const pad = 24, fs = 44;
    const c = document.createElement("canvas");
    const g = c.getContext("2d");
    g.font = `700 ${fs}px "Space Mono", monospace`;
    c.width = g.measureText(text).width + pad * 2;
    c.height = fs + pad * 2;
    const g2 = c.getContext("2d");
    g2.font = `700 ${fs}px "Space Mono", monospace`;
    g2.fillStyle = colour;
    g2.textBaseline = "middle";
    g2.fillText(text, pad, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(c.width / c.height * 0.44, 0.44, 1);
    return sp;
  }

  window.initPressureSurface = function (canvas, ui) {
    const { renderer, scene, camera, resize } = makeStage(canvas, null);

    scene.add(new THREE.HemisphereLight(0xFFF6EE, 0xC9B4C2, 1.05));
    const key = new THREE.DirectionalLight(0xFFFFFF, 0.85);
    key.position.set(4, 7, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xE8CFA6, 0.4);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    // --- Surface ---------------------------------------------------------
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const col = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const demand  = (pos.getX(i) + SIZE / 2) / SIZE;
      const support = (pos.getZ(i) + SIZE / 2) / SIZE;
      const p = performance(demand, support);
      pos.setY(i, p * H);
      const c = colourFor(zoneOf(demand, support), p);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();

    const surface = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.82, metalness: 0.02,
      side: THREE.DoubleSide, flatShading: false
    }));
    scene.add(surface);

    // A whisper of wireframe so the form reads without flattening it.
    const wire = new THREE.Mesh(
      new THREE.PlaneGeometry(SIZE, SIZE, 24, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x6F4A6B, wireframe: true, transparent: true, opacity: 0.07 })
    );
    const wpos = wire.geometry.attributes.position;
    for (let i = 0; i < wpos.count; i++) {
      const d = (wpos.getX(i) + SIZE / 2) / SIZE, s = (wpos.getZ(i) + SIZE / 2) / SIZE;
      wpos.setY(i, performance(d, s) * H + 0.012);
    }
    scene.add(wire);

    // --- The live slice: one student's curve at their current support level
    const SLICE_N = 160;
    const sliceGeo = new THREE.BufferGeometry();
    sliceGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SLICE_N * 3), 3));
    const slice = new THREE.Line(sliceGeo, new THREE.LineBasicMaterial({ color: 0x4A2F4A, linewidth: 2 }));
    scene.add(slice);

    // --- The student marker ----------------------------------------------
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x4A2F4A, roughness: 0.35 })
    );
    scene.add(marker);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.13, 0.175, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x4A2F4A, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    scene.add(halo);

    const drop = new THREE.Line(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)),
      new THREE.LineBasicMaterial({ color: 0x4A2F4A, transparent: true, opacity: 0.3 })
    );
    scene.add(drop);

    // --- Axis labels ------------------------------------------------------
    const lx = labelSprite("DEMAND →", "#8B8092"); lx.position.set(0, -0.16, SIZE / 2 + 0.42); scene.add(lx);
    const lz = labelSprite("SUPPORT →", "#6F4A6B"); lz.position.set(-SIZE / 2 - 0.5, -0.16, 0); scene.add(lz);
    const ly = labelSprite("WELLBEING ↑", "#8B8092"); ly.position.set(-SIZE / 2 - 0.2, H * 0.92, SIZE / 2); scene.add(ly);

    // --- Camera -----------------------------------------------------------
    const orbit = makeOrbit(camera, canvas, {
      radius: 8.4, theta: 0.86, phi: 0.92, ty: 0.7,
      minRadius: 4.2, maxRadius: 14, spinSpeed: 0.00055
    });

    // --- State ------------------------------------------------------------
    const live = { demand: 0.06, support: 0.18 };
    const want = { demand: 0.06, support: 0.18 };

    function setSlice(support) {
      const arr = slice.geometry.attributes.position.array;
      const z = support * SIZE - SIZE / 2;
      for (let i = 0; i < SLICE_N; i++) {
        const d = i / (SLICE_N - 1);
        arr[i * 3]     = d * SIZE - SIZE / 2;
        arr[i * 3 + 1] = performance(d, support) * H + 0.028;
        arr[i * 3 + 2] = z;
      }
      slice.geometry.attributes.position.needsUpdate = true;
      slice.geometry.computeBoundingSphere();
    }

    function place() {
      const x = live.demand * SIZE - SIZE / 2;
      const z = live.support * SIZE - SIZE / 2;
      const y = performance(live.demand, live.support) * H;
      marker.position.set(x, y + 0.09, z);
      halo.position.set(x, y + 0.035, z);
      const dp = drop.geometry.attributes.position.array;
      dp[0] = x; dp[1] = y; dp[2] = z;
      dp[3] = x; dp[4] = 0; dp[5] = z;
      drop.geometry.attributes.position.needsUpdate = true;

      const zone = zoneOf(live.demand, live.support);
      const c = zone < -0.16 ? 0x6E9068 : zone > 0.16 ? 0xC4614A : 0xDFA046;
      marker.material.color.setHex(c);
      halo.material.color.setHex(c);
      if (ui.onState) ui.onState(zone, live);
    }

    // --- Guided tour ------------------------------------------------------
    const tour = [
      { title: "Pressure is not the enemy",
        text: "With almost nothing being asked, there is nothing to rise to. The ground here is flat — this is boredom, not calm.",
        demand: 0.05, support: 0.18, cam: { theta: 0.86, phi: 0.95, radius: 8.4 }, hold: 3600 },
      { title: "Some pressure lifts you",
        text: "As demand grows, so does focus. This is the stretch that builds confidence — researchers call it eustress.",
        demand: 0.24, support: 0.18, cam: { theta: 0.60, phi: 0.80, radius: 7.4 }, hold: 3800 },
      { title: "Every student has a peak",
        text: "The top of the ridge is the tipping point. Push past it and the same effort starts producing less.",
        demand: 0.31, support: 0.18, cam: { theta: 0.34, phi: 0.62, radius: 6.6 }, hold: 4000 },
      { title: "Past the peak, it falls away",
        text: "This is chronic academic pressure — and the cruel part is that performance drops too. The pressure meant to lift results ends up lowering them.",
        demand: 0.74, support: 0.18, cam: { theta: 0.10, phi: 0.55, radius: 7.2 }, hold: 4600 },
      { title: "Now add support",
        text: "Watch the whole ridge climb and slide to the right. With trusted help nearby, the same student carries far more before anything breaks.",
        demand: 0.74, support: 0.88, cam: { theta: 0.95, phi: 0.72, radius: 8.6 }, hold: 5200 },
      { title: "That is what Uplift does",
        text: "We cannot delete deadlines. We can move where the tipping point sits — and that is a change students can lead.",
        demand: 0.62, support: 0.88, cam: { theta: 1.25, phi: 0.88, radius: 8.2 }, hold: 4200 }
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

    // --- Loop -------------------------------------------------------------
    let last = performance_now();
    function performance_now() { return (window.performance || Date).now(); }

    let running = false;
    const io = new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running && step === -1) goto(0);
    }, { threshold: 0.12 });
    io.observe(canvas);

    function frame() {
      requestAnimationFrame(frame);
      const now = performance_now();
      const dt = Math.min(64, now - last);
      last = now;
      if (!running) return;

      resize();

      if (mode === "tour") {
        timer += dt;
        if (timer > tour[step].hold) {
          if (step < tour.length - 1) goto(step + 1);
          else unlock();
        }
      }

      // Ease toward the wanted position so every change reads as movement.
      live.demand  += (want.demand  - live.demand)  * 0.045;
      live.support += (want.support - live.support) * 0.045;

      setSlice(live.support);
      place();
      halo.scale.setScalar(1 + Math.sin(now * 0.0026) * 0.13);

      orbit.update(dt);
      renderer.render(scene, camera);
    }
    frame();

    return {
      setDemand(v)  { want.demand = v;  if (mode === "tour") { mode = "free"; unlock(); } },
      setSupport(v) { want.support = v; if (mode === "tour") { mode = "free"; unlock(); } },
      takeOver()    { if (mode === "tour") unlock(); },
      replay()      { mode = "tour"; orbit.setEnabled(false); goto(0); if (ui.onReplay) ui.onReplay(); },
      get mode()    { return mode; },
      get live()    { return live; }
    };
  };
})();

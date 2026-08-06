/* ==========================================================================
   UPLIFT — The systems map  (v2, simplified)
   --------------------------------------------------------------------------
   v1 had eleven nodes and read as clutter from the back of a room. This has
   eight, bigger, in four obvious clusters, with plain-English labels. Same
   argument: the causes arrive together, and one of them feeds itself.
   ========================================================================== */

(function () {
  const DIRS = {
    you:    new THREE.Vector3(-1.00,  0.30,  0.00),
    school: new THREE.Vector3( 1.00,  0.30,  0.00),
    home:   new THREE.Vector3( 0.00, -0.55,  0.95),
    mates:  new THREE.Vector3( 0.00, -0.55, -0.95)
  };

  function label(text, colour, size) {
    const fs = 52, pad = 18;
    const c = document.createElement("canvas");
    let g = c.getContext("2d");
    const font = '700 ' + fs + 'px "Space Mono", monospace';
    g.font = font;
    c.width = Math.ceil(g.measureText(text).width) + pad * 2;
    c.height = fs + pad * 2;
    g = c.getContext("2d");
    g.font = font;
    g.fillStyle = colour;
    g.textBaseline = "middle";
    g.fillText(text, pad, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    const s = size || 0.30;
    sp.scale.set((c.width / c.height) * s, s, 1);
    return sp;
  }

  window.initSystemsMap = function (canvas, ui) {
    const { renderer, scene, camera, resize } = makeStage(canvas, 0x2A1A5E);
    scene.fog = new THREE.Fog(0x2A1A5E, 10, 22);

    scene.add(new THREE.HemisphereLight(0xD6CBF5, 0x1A0F3C, 1.1));
    const key = new THREE.PointLight(0xFFE8C0, 1.6, 34);
    key.position.set(4, 6, 6);
    scene.add(key);

    const group = new THREE.Group();
    scene.add(group);

    const meshes = {}, labels = {}, edges = [];

    // --- Core ---------------------------------------------------------------
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xF2604C, emissive: 0x8A2A18, emissiveIntensity: .7, roughness: .45
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 2), coreMat);
    core.userData = UPLIFT.causes.core;
    group.add(core);
    meshes.core = core;

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xF2604C, transparent: true, opacity: .11 })
    );
    group.add(glow);

    const coreLab = label("THE PRESSURE", "#FFD9CE", 0.34);
    coreLab.position.set(0, 1.25, 0);
    group.add(coreLab);

    // --- Cause nodes ---------------------------------------------------------
    const byCluster = {};
    UPLIFT.causes.nodes.forEach((n) => { (byCluster[n.cluster] = byCluster[n.cluster] || []).push(n); });

    Object.keys(byCluster).forEach((ck) => {
      const dir = DIRS[ck].clone().normalize();
      const list = byCluster[ck];
      const meta = UPLIFT.clusterMeta[ck];
      const hex = "#" + meta.color.toString(16).padStart(6, "0");

      const up = Math.abs(dir.y) > .9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      const lup = new THREE.Vector3().crossVectors(right, dir).normalize();

      list.forEach((n, i) => {
        const off = (i - (list.length - 1) / 2) * 1.15;
        const p = dir.clone().multiplyScalar(3.1).add(lup.clone().multiplyScalar(off));

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 24, 24),
          new THREE.MeshStandardMaterial({ color: meta.color, emissive: meta.color, emissiveIntensity: .2, roughness: .5 })
        );
        mesh.position.copy(p);
        mesh.userData = n;
        mesh.userData.home = p.clone();
        group.add(mesh);
        meshes[n.id] = mesh;

        const lab = label(n.label, "#FFFFFF", 0.26);
        lab.position.copy(p).add(new THREE.Vector3(0, 0.58, 0));
        group.add(lab);
        labels[n.id] = lab;

        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([p, new THREE.Vector3(0, 0, 0)]),
          new THREE.LineBasicMaterial({ color: meta.color, transparent: true, opacity: .3 })
        );
        group.add(line);
        edges.push({ line, id: n.id, cluster: ck });
      });

      const cl = label(meta.label.toUpperCase(), hex, 0.32);
      cl.position.copy(dir.clone().multiplyScalar(5.0));
      group.add(cl);
    });

    // --- Feedback loop --------------------------------------------------------
    const loopPts = UPLIFT.causes.loop.map((id) => meshes[id].position.clone());
    const loopCurve = new THREE.CatmullRomCurve3(loopPts, true, "catmullrom", .4);
    const loopLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(loopCurve.getPoints(120)),
      new THREE.LineBasicMaterial({ color: 0xF5B62E, transparent: true, opacity: 0 })
    );
    group.add(loopLine);

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xF5B62E, transparent: true, opacity: 0 })
    );
    group.add(pulse);

    let loopOn = false, loopT = 0;

    // --- Camera ----------------------------------------------------------------
    const orbit = makeOrbit(camera, canvas, {
      radius: 11.5, theta: 0.5, phi: 1.15, minRadius: 6, maxRadius: 19, spinSpeed: .0006
    });

    // --- Picking ----------------------------------------------------------------
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    let selected = null;

    const pickables = () => Object.keys(meshes).map((k) => meshes[k]);

    function select(mesh) {
      if (selected) {
        selected.scale.setScalar(1);
        selected.material.emissiveIntensity = selected === core ? .7 : .2;
      }
      selected = mesh;
      if (mesh) {
        mesh.scale.setScalar(1.35);
        mesh.material.emissiveIntensity = .85;
        if (ui.onSelect) ui.onSelect(mesh.userData);
      }
    }

    let downPos = { x: 0, y: 0 }, downAt = 0;
    canvas.addEventListener("pointerdown", (e) => { downAt = Date.now(); downPos = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6 || Date.now() - downAt > 500) return;
      const r = canvas.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(pickables())[0];
      if (hit) { select(hit.object); if (mode === "tour") unlock(); }
    });

    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      canvas.style.cursor = ray.intersectObjects(pickables())[0] ? "pointer" : (orbit.state.enabled ? "grab" : "default");
    });

    // --- Tour --------------------------------------------------------------------
    const tour = [
      { title: "Four sources, one pressure.",
        text: "It doesn't come from one place. It arrives from all four at once \u2014 which is why fixing just one never works.",
        cam: { theta: 0.5, phi: 1.15, radius: 11.5 }, focus: null, hold: 4200 },
      { title: "You",
        text: "Perfectionism and fear of failing. The students at highest risk are often the ones whose marks look best.",
        cam: { theta: 2.9, phi: 1.05, radius: 8.2 }, focus: "you", hold: 4400 },
      { title: "School",
        text: "Three things due the same week, and one test that supposedly decides your future.",
        cam: { theta: -0.25, phi: 1.05, radius: 8.2 }, focus: "school", hold: 4400 },
      { title: "Home",
        text: "Almost always well-meant. The harm comes from success being defined as one number.",
        cam: { theta: 1.55, phi: 1.50, radius: 8.6 }, focus: "home", hold: 4400 },
      { title: "Mates",
        text: "Everyone posts the mark. Nobody posts the struggle. So everyone thinks they're the only one drowning.",
        cam: { theta: -1.55, phi: 1.50, radius: 8.6 }, focus: "mates", hold: 4600 },
      { title: "And it feeds itself.",
        text: UPLIFT.causes.loopNote,
        cam: { theta: 2.4, phi: 0.85, radius: 7.4 }, focus: "loop", hold: 6000 }
    ];

    let step = -1, timer = 0, mode = "tour";

    function focusOn(which) {
      loopOn = (which === "loop");
      loopLine.material.opacity = loopOn ? .9 : 0;
      pulse.material.opacity = loopOn ? 1 : 0;

      edges.forEach((e) => {
        const on = !which || which === "loop" || e.cluster === which;
        e.line.material.opacity = on ? (which && which !== "loop" ? .7 : .3) : .07;
      });

      UPLIFT.causes.nodes.forEach((n) => {
        const on = !which || which === "loop" || n.cluster === which;
        const inLoop = loopOn && UPLIFT.causes.loop.indexOf(n.id) !== -1;
        labels[n.id].material.opacity = (on || inLoop) ? 1 : .16;
        meshes[n.id].material.emissiveIntensity = inLoop ? .9 : (on ? .4 : .07);
      });
    }

    function goto(i) {
      step = i;
      const s = tour[i];
      orbit.flyTo(s.cam);
      focusOn(s.focus);
      timer = 0;
      if (ui.onTour) ui.onTour(s, i, tour.length);
    }

    function unlock() {
      mode = "free";
      orbit.setEnabled(true);
      focusOn(null);
      loopOn = true;
      loopLine.material.opacity = .45;
      pulse.material.opacity = 1;
      if (ui.onUnlock) ui.onUnlock();
    }

    // --- Loop ---------------------------------------------------------------------
    let last = (window.performance || Date).now(), running = false;

    const io = new IntersectionObserver((e) => {
      running = e[0].isIntersecting;
      if (running && step === -1) goto(0);
    }, { threshold: .10 });
    io.observe(canvas);

    function frame() {
      requestAnimationFrame(frame);
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

      const b = 1 + Math.sin(now * .0018) * .06;
      core.scale.setScalar(selected === core ? 1.35 : b);
      glow.scale.setScalar(b * 1.04);
      coreMat.emissiveIntensity = .55 + Math.sin(now * .0018) * .22;

      if (loopOn) {
        loopT = (loopT + dt * .00022) % 1;
        pulse.position.copy(loopCurve.getPointAt(loopT));
      }

      UPLIFT.causes.nodes.forEach((n, i) => {
        const m = meshes[n.id], t = now * .00032 + i * 1.7;
        m.position.copy(m.userData.home).add(new THREE.Vector3(
          Math.sin(t) * .06, Math.cos(t * 1.3) * .06, Math.sin(t * .8) * .06
        ));
        labels[n.id].position.copy(m.position).add(new THREE.Vector3(0, .58, 0));
      });

      orbit.update(dt);
      renderer.render(scene, camera);
    }
    frame();

    return {
      takeOver() { if (mode === "tour") unlock(); },
      replay() { mode = "tour"; orbit.setEnabled(false); select(null); goto(0); if (ui.onReplay) ui.onReplay(); },
      showLoop() { unlock(); focusOn("loop"); orbit.flyTo({ theta: 2.4, phi: .85, radius: 7.4 }); },
      select(id) { if (meshes[id]) select(meshes[id]); },
      get mode() { return mode; }
    };
  };
})();

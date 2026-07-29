/* ==========================================================================
   UPLIFT — The systems map
   --------------------------------------------------------------------------
   Academic pressure is not a list of causes, it is a system. Four clusters
   feed a core, and one loop feeds itself: pressure impairs performance,
   which deepens fear of failure, which raises pressure again.
   ========================================================================== */

(function () {
  const DIRS = {
    individual: new THREE.Vector3(-1.00,  0.34, -0.30),
    school:     new THREE.Vector3( 0.96,  0.30, -0.36),
    family:     new THREE.Vector3(-0.42, -0.52,  0.92),
    social:     new THREE.Vector3( 0.52, -0.46,  0.94)
  };

  function nodeLabel(text, colour, size) {
    const fs = 46, pad = 16;
    const c = document.createElement("canvas");
    let g = c.getContext("2d");
    g.font = `700 ${fs}px "Space Mono", monospace`;
    c.width = Math.ceil(g.measureText(text).width) + pad * 2;
    c.height = fs + pad * 2;
    g = c.getContext("2d");
    g.font = `700 ${fs}px "Space Mono", monospace`;
    g.fillStyle = colour;
    g.textBaseline = "middle";
    g.fillText(text, pad, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, opacity: 0.82
    }));
    const s = size || 0.30;
    sp.scale.set((c.width / c.height) * s, s, 1);
    return sp;
  }

  window.initSystemsMap = function (canvas, ui) {
    const { renderer, scene, camera, resize } = makeStage(canvas, 0x2A1A2D);
    scene.fog = new THREE.Fog(0x2A1A2D, 9, 20);

    scene.add(new THREE.HemisphereLight(0xD9C7D4, 0x1A0F1C, 1.0));
    const key = new THREE.PointLight(0xFFE3C0, 1.5, 30);
    key.position.set(3, 5, 5);
    scene.add(key);

    const group = new THREE.Group();
    scene.add(group);

    const meshes = {};   // id -> mesh
    const labels = {};   // id -> sprite
    const edges = [];

    // --- Core --------------------------------------------------------------
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xC4614A, emissive: 0x5A2318, emissiveIntensity: 0.7, roughness: 0.4
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 2), coreMat);
    core.userData = UPLIFT.causes.core;
    group.add(core);
    meshes.core = core;

    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xC4614A, transparent: true, opacity: 0.10 })
    );
    group.add(coreGlow);

    const coreLabel = nodeLabel("CHRONIC ACADEMIC PRESSURE", "#F3D9CE", 0.26);
    coreLabel.position.set(0, 0.98, 0);
    group.add(coreLabel);

    // --- Cause nodes -------------------------------------------------------
    const byCluster = {};
    UPLIFT.causes.nodes.forEach((n) => {
      (byCluster[n.cluster] = byCluster[n.cluster] || []).push(n);
    });

    Object.keys(byCluster).forEach((clusterKey) => {
      const dir = DIRS[clusterKey].clone().normalize();
      const list = byCluster[clusterKey];
      const meta = UPLIFT.clusterMeta[clusterKey];

      // Build a local frame so nodes fan out around the cluster direction.
      const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      const localUp = new THREE.Vector3().crossVectors(right, dir).normalize();

      list.forEach((n, i) => {
        const ang = (i / list.length) * Math.PI * 2 + clusterKey.length;
        const spread = 0.62 + (i % 2) * 0.22;
        const dist = 2.45 + (i % 3) * 0.42;

        const p = dir.clone().multiplyScalar(dist)
          .add(right.clone().multiplyScalar(Math.cos(ang) * spread))
          .add(localUp.clone().multiplyScalar(Math.sin(ang) * spread));

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.20, 22, 22),
          new THREE.MeshStandardMaterial({
            color: meta.color, emissive: meta.color, emissiveIntensity: 0.16, roughness: 0.5
          })
        );
        mesh.position.copy(p);
        mesh.userData = n;
        mesh.userData.home = p.clone();
        group.add(mesh);
        meshes[n.id] = mesh;

        const lab = nodeLabel(n.label, "#EDE0E9", 0.20);
        lab.position.copy(p).add(new THREE.Vector3(0, 0.36, 0));
        group.add(lab);
        labels[n.id] = lab;

        // Edge into the core
        const g = new THREE.BufferGeometry().setFromPoints([p, new THREE.Vector3(0, 0, 0)]);
        const line = new THREE.Line(g, new THREE.LineBasicMaterial({
          color: meta.color, transparent: true, opacity: 0.24
        }));
        group.add(line);
        edges.push({ line, id: n.id, cluster: clusterKey });
      });

      const clusterLabel = nodeLabel(meta.label.toUpperCase(), "#" + meta.color.toString(16).padStart(6, "0"), 0.24);
      clusterLabel.position.copy(dir.clone().multiplyScalar(4.15));
      clusterLabel.material.opacity = 0.95;
      group.add(clusterLabel);
    });

    // --- The feedback loop --------------------------------------------------
    const loopIds = UPLIFT.causes.loop;
    const loopPts = loopIds.map((id) => meshes[id].position.clone());
    const loopCurve = new THREE.CatmullRomCurve3(loopPts, true, "catmullrom", 0.4);
    const loopLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(loopCurve.getPoints(120)),
      new THREE.LineBasicMaterial({ color: 0xDFA046, transparent: true, opacity: 0 })
    );
    group.add(loopLine);

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xDFA046, transparent: true, opacity: 0 })
    );
    group.add(pulse);

    let loopOn = false, loopT = 0;

    // --- Camera --------------------------------------------------------------
    const orbit = makeOrbit(camera, canvas, {
      radius: 9.6, theta: 0.7, phi: 1.05,
      minRadius: 4.5, maxRadius: 17, spinSpeed: 0.0007
    });

    // --- Picking --------------------------------------------------------------
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let selected = null;

    function pickables() { return Object.keys(meshes).map((k) => meshes[k]); }

    function select(mesh) {
      if (selected) {
        selected.scale.setScalar(1);
        selected.material.emissiveIntensity = selected === core ? 0.7 : 0.16;
      }
      selected = mesh;
      if (mesh) {
        mesh.scale.setScalar(1.42);
        mesh.material.emissiveIntensity = 0.75;
        if (ui.onSelect) ui.onSelect(mesh.userData);
      }
    }

    function pointerAt(e) {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      ptr.x = ((p.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((p.clientY - r.top) / r.height) * 2 + 1;
    }

    let downAt = 0, downPos = { x: 0, y: 0 };
    canvas.addEventListener("pointerdown", (e) => {
      downAt = Date.now(); downPos = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerup", (e) => {
      // Only treat it as a click if it wasn't a drag.
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (moved > 6 || Date.now() - downAt > 500) return;
      pointerAt(e);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(pickables())[0];
      if (hit) { select(hit.object); if (mode === "tour") unlock(); }
    });

    canvas.addEventListener("pointermove", (e) => {
      pointerAt(e);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(pickables())[0];
      canvas.style.cursor = hit ? "pointer" : (orbit.state.enabled ? "grab" : "default");
    });

    // Keyboard: cycle the nodes without a mouse.
    canvas.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" && e.key !== "Enter" && e.key !== " ") return;
      if (e.key === "Tab") {
        const ids = Object.keys(meshes);
        const cur = selected ? ids.indexOf(selected.userData.id) : -1;
        const next = ids[(cur + 1) % ids.length];
        select(meshes[next]);
        e.preventDefault();
      }
    });

    // --- Guided tour -----------------------------------------------------------
    const tour = [
      { title: "One core, four sources",
        text: "Chronic academic pressure sits at the centre. Nothing here causes it alone — the causes arrive together, which is why single fixes rarely hold.",
        cam: { theta: 0.70, phi: 1.05, radius: 9.6 }, focus: null, hold: 4200 },
      { title: "Inside the student",
        text: "Perfectionism, fear of failure, self-expectation and lost sleep. The students most at risk are often the ones whose results look strongest.",
        cam: { theta: 2.55, phi: 0.86, radius: 7.2 }, focus: "individual", hold: 4600 },
      { title: "Inside the school",
        text: "Assessment stacking, total workload and high-stakes testing. These are structural — and they are the ones students can realistically help change.",
        cam: { theta: -0.55, phi: 0.86, radius: 7.2 }, focus: "school", hold: 4600 },
      { title: "At home",
        text: "Parental expectations are almost always well-meant. The harm comes from a narrow definition of success, not from a lack of care.",
        cam: { theta: 1.95, phi: 1.55, radius: 7.4 }, focus: "family", hold: 4400 },
      { title: "Among peers",
        text: "Everyone posts the result and nobody posts the struggle, so every student privately concludes they are the only one finding it hard.",
        cam: { theta: 0.30, phi: 1.60, radius: 7.4 }, focus: "social", hold: 4600 },
      { title: "And it feeds itself",
        text: UPLIFT.causes.loopNote,
        cam: { theta: 1.55, phi: 0.72, radius: 6.4 }, focus: "loop", hold: 6000 }
    ];

    let step = -1, timer = 0, mode = "tour";

    function focusCluster(which) {
      loopOn = (which === "loop");
      loopLine.material.opacity = loopOn ? 0.85 : 0;
      pulse.material.opacity = loopOn ? 1 : 0;

      edges.forEach((e) => {
        const on = !which || which === "loop" || e.cluster === which;
        e.line.material.opacity = on ? (which && which !== "loop" ? 0.55 : 0.24) : 0.06;
      });

      UPLIFT.causes.nodes.forEach((n) => {
        const on = !which || which === "loop" || n.cluster === which;
        const inLoop = loopOn && loopIds.indexOf(n.id) !== -1;
        labels[n.id].material.opacity = on || inLoop ? 0.9 : 0.14;
        meshes[n.id].material.emissiveIntensity = inLoop ? 0.8 : (on ? 0.34 : 0.06);
      });
    }

    function goto(i) {
      step = i;
      const s = tour[i];
      orbit.flyTo(s.cam);
      focusCluster(s.focus);
      timer = 0;
      if (ui.onTour) ui.onTour(s, i, tour.length);
    }

    function unlock() {
      mode = "free";
      orbit.setEnabled(true);
      focusCluster(null);
      loopOn = true;
      loopLine.material.opacity = 0.4;
      pulse.material.opacity = 1;
      if (ui.onUnlock) ui.onUnlock();
    }

    // --- Loop -------------------------------------------------------------------
    let last = (window.performance || Date).now();
    let running = false;

    const io = new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running && step === -1) goto(0);
    }, { threshold: 0.12 });
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
          if (step < tour.length - 1) goto(step + 1);
          else unlock();
        }
      }

      // Core breathes; the loop pulse travels.
      const b = 1 + Math.sin(now * 0.0018) * 0.055;
      core.scale.setScalar(selected === core ? 1.42 : b);
      coreGlow.scale.setScalar(b * 1.05);
      coreMat.emissiveIntensity = 0.55 + Math.sin(now * 0.0018) * 0.2;

      if (loopOn) {
        loopT = (loopT + dt * 0.00022) % 1;
        pulse.position.copy(loopCurve.getPointAt(loopT));
      }

      // Nodes drift very slightly, so the system feels alive rather than plotted.
      UPLIFT.causes.nodes.forEach((n, i) => {
        const m = meshes[n.id];
        const t = now * 0.00035 + i * 1.7;
        m.position.copy(m.userData.home).add(
          new THREE.Vector3(Math.sin(t) * 0.045, Math.cos(t * 1.3) * 0.045, Math.sin(t * 0.8) * 0.045)
        );
        labels[n.id].position.copy(m.position).add(new THREE.Vector3(0, 0.36, 0));
      });

      orbit.update(dt);
      renderer.render(scene, camera);
    }
    frame();

    return {
      takeOver() { if (mode === "tour") unlock(); },
      replay() { mode = "tour"; orbit.setEnabled(false); select(null); goto(0); if (ui.onReplay) ui.onReplay(); },
      showLoop() { unlock(); focusCluster("loop"); orbit.flyTo({ theta: 1.55, phi: 0.72, radius: 6.4 }); },
      select(id) { if (meshes[id]) select(meshes[id]); },
      get mode() { return mode; }
    };
  };
})();

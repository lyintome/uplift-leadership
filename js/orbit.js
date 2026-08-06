/* ==========================================================================
   UPLIFT — Orbit + camera flight
   A small purpose-built controller. Three r128 has no bundled OrbitControls
   in the global build, and writing our own keeps the guided tour and the
   free-explore mode sharing one state machine.
   ========================================================================== */

function makeOrbit(camera, dom, opts) {
  opts = opts || {};

  const state = {
    target: new THREE.Vector3(opts.tx || 0, opts.ty || 0, opts.tz || 0),
    radius: opts.radius || 6,
    theta: opts.theta || 0.9,   // horizontal angle
    phi: opts.phi || 1.0,       // vertical angle
    minPhi: opts.minPhi || 0.18,
    maxPhi: opts.maxPhi || 1.5,
    minRadius: opts.minRadius || 3,
    maxRadius: opts.maxRadius || 16,
    enabled: false,
    autoSpin: opts.autoSpin !== false,
    spinSpeed: opts.spinSpeed || 0.0009
  };

  // Where the camera is easing toward. Guided tour writes here; so does dragging.
  const goal = { theta: state.theta, phi: state.phi, radius: state.radius,
                 target: state.target.clone() };

  let dragging = false, lastX = 0, lastY = 0, idleTimer = 0;

  function onDown(e) {
    if (!state.enabled) return;
    dragging = true;
    idleTimer = 0;
    const p = e.touches ? e.touches[0] : e;
    lastX = p.clientX; lastY = p.clientY;
    dom.style.cursor = "grabbing";
  }

  function onMove(e) {
    if (!dragging || !state.enabled) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastX, dy = p.clientY - lastY;
    lastX = p.clientX; lastY = p.clientY;
    goal.theta -= dx * 0.006;
    goal.phi = Math.min(state.maxPhi, Math.max(state.minPhi, goal.phi - dy * 0.005));
    if (e.cancelable) e.preventDefault();
  }

  function onUp() { dragging = false; dom.style.cursor = state.enabled ? "grab" : "default"; }

  function onWheel(e) {
    if (!state.enabled) return;
    goal.radius = Math.min(state.maxRadius, Math.max(state.minRadius, goal.radius + e.deltaY * 0.004));
    e.preventDefault();
  }

  dom.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  dom.addEventListener("touchstart", onDown, { passive: true });
  dom.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);
  dom.addEventListener("wheel", onWheel, { passive: false });

  // Keyboard access — orbit without a mouse.
  dom.addEventListener("keydown", (e) => {
    if (!state.enabled) return;
    const step = 0.12;
    if (e.key === "ArrowLeft")  { goal.theta -= step; e.preventDefault(); }
    if (e.key === "ArrowRight") { goal.theta += step; e.preventDefault(); }
    if (e.key === "ArrowUp")    { goal.phi = Math.max(state.minPhi, goal.phi - step); e.preventDefault(); }
    if (e.key === "ArrowDown")  { goal.phi = Math.min(state.maxPhi, goal.phi + step); e.preventDefault(); }
  });

  return {
    state, goal,

    /** Point the camera somewhere. The tour calls this; easing does the rest. */
    flyTo(next, lookAt) {
      if (next.theta  !== undefined) goal.theta  = next.theta;
      if (next.phi    !== undefined) goal.phi    = next.phi;
      if (next.radius !== undefined) goal.radius = next.radius;
      if (lookAt) goal.target.copy(lookAt);
    },

    setEnabled(on) {
      state.enabled = on;
      dom.style.cursor = on ? "grab" : "default";
      dom.setAttribute("tabindex", on ? "0" : "-1");
    },

    update(dt) {
      // Slow ambient rotation while the model is idle, so it never looks frozen.
      if (state.autoSpin && !dragging) {
        const idle = state.enabled ? (idleTimer += dt) > 2600 : true;
        if (idle) goal.theta += state.spinSpeed * dt;
      }

      const k = 0.085;
      state.theta  += (goal.theta  - state.theta)  * k;
      state.phi    += (goal.phi    - state.phi)    * k;
      state.radius += (goal.radius - state.radius) * k;
      state.target.lerp(goal.target, k);

      const sp = Math.sin(state.phi), cp = Math.cos(state.phi);
      camera.position.set(
        state.target.x + state.radius * sp * Math.sin(state.theta),
        state.target.y + state.radius * cp,
        state.target.z + state.radius * sp * Math.cos(state.theta)
      );
      camera.lookAt(state.target);
    }
  };
}

/** Shared renderer setup so both models look like they belong to one page. */
function makeStage(canvas, bg) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !bg });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  if (bg) scene.background = new THREE.Color(bg);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  return { renderer, scene, camera, resize };
}

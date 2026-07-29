# Uplift — Leadership Impact Project

A student-led near-peer academic resilience program, presented as an interactive site
with two 3D models.

## Running it

**Easiest:** double-click `index.html`. Everything is plain `<script src>` and `<link>`,
with Three.js vendored locally, so it works straight from the file system — no server,
no internet needed (except web fonts, which fall back gracefully).

**For presentation day:** run `node build.js` and present from
`dist/uplift-presentation.html`. That's one self-contained file you can put on a USB
stick, email to yourself, or open on a school machine that blocks everything.

## Files

```
index.html                 the page
css/tokens.css             palette, type scale, spacing — start here to change the look
css/base.css               reset, typography, the ruled-paper ground, reveals
css/sections.css           every section's layout
js/data.js                 ALL CONTENT — stats, citations, stakeholders, causes, rollout
js/orbit.js                shared camera controller for both models
js/pressure-surface.js     model 1 — demand × support × wellbeing
js/systems-map.js          model 2 — the cause network
js/main.js                 wiring: builds sections, count-ups, scroll reveals
vendor/three.min.js        Three.js r128 (MIT, licence alongside)
build.js                   makes the single-file version
```

## Editing content

Almost everything you'll want to change lives in **`js/data.js`** — the statistics,
their citations, the stakeholder entries, the cause nodes, the rollout steps, the risks,
the success measures and the source list. Change a number there and change its citation
in the same object; they're deliberately stored together so they can't drift apart.

The two 3D models read their node content from `data.js` too, so adding a cause to
`UPLIFT.causes.nodes` puts a new node in the systems map automatically.

## The models

**Pressure surface** — three axes: demand, support, and wellbeing/performance. The shape
carries the argument: raising support lifts the peak *and* slides it right, so the same
student carries more demand before it turns into harm. Uplift doesn't remove pressure,
it moves the tipping point. Runs a guided tour on first view, then hands over to free
orbit plus two sliders.

**Systems map** — four cause clusters feeding one core, with a self-feeding loop
(pressure → impaired performance → fear of failure → pressure). Guided tour visits each
cluster, then traces the loop, then unlocks for clicking.

Both respect `prefers-reduced-motion` and are keyboard-navigable.

## Not built yet

The hidden fullscreen pitch deck — secret trigger, keyboard navigation, 5-minute speaker
timer with pacing cues, per-slide speaker labels. That's v2.

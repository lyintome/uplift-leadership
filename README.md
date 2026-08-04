# Uplift — Year 9 Leadership Impact Project

A student-led near-peer academic resilience program, presented as an
illustrated interactive site with two 3D models and a built-in pitch deck.

## Running it

Double-click `index.html`. No server needed — Three.js is vendored locally,
so it works offline.

**On presentation day:** use `dist/uplift-presentation.html` — one
self-contained file for a USB stick or a locked-down school laptop.

## Presenting

Press **P** or click **▶ Present** to open fullscreen mode.

| Key | Does |
|---|---|
| → / space | next slide |
| ← | previous slide |
| **T** | start/stop the 5-minute timer |
| **R** | reset the timer |
| **N** | hide/show the speaker note strip |
| Esc | exit |

The timer goes green → gold → red against where you should be. Each slide shows
whose turn it is (Speakers 1 and 2 carry more time, as asked).

**The live poll is on slide 2.** Ask the room for hands, eyeball the count,
click the nearest percentage. The room's bar fills, then the national figure
appears underneath for comparison. No phones, no setup, about 30 seconds.

## Cue cards

Open `cue-cards.html` — four speakers, timings, the one line each person has
written out word-for-word, prompts for everything else, handover points and
what's on screen. Print it or open it on a phone.

## Files

```
index.html            the site
cue-cards.html        printable speaker cards
CONTENT-RAW.md        all research and content, unformatted
css/tokens.css        palette and type — change the look here
css/base.css          typography, ruled paper, highlighter, stickers
css/sections.css      section layouts
css/present.css       presentation mode
js/data.js            ALL CONTENT — stats, citations, stakeholders, causes, plan
js/infographics.js    hand-drawn SVG diagrams
js/orbit.js           shared camera controller
js/curve.js           model 1 — the student on the curve
js/systems-map.js     model 2 — four sources, one pressure
js/present.js         presentation mode + live poll
js/main.js            wiring
vendor/three.min.js   Three.js r128 (MIT)
build.js              makes the single-file version
```

## Editing content

Nearly everything lives in **`js/data.js`** — statistics with their citations
attached, stakeholders, cause nodes, rollout, risks, measures, sources. Change
a number and change its citation in the same object; they're stored together so
they can't drift apart.

Both 3D models read from `data.js` too, so adding a cause to
`UPLIFT.causes.nodes` puts a new node in the systems map automatically.

## The two models

**The curve** — a student walks left to right as the workload grows. They stand
taller as pressure rises, then buckle past the peak while the line drops.
Raising support lifts the whole curve and pushes the peak further right: same
student, same workload, more capacity. That's the argument for Uplift, made
visible. Replaced a 3D surface plot that was accurate but unreadable.

**The systems map** — four clusters (You, School, Home, Mates) feeding one core,
with the self-feeding loop animated. Simplified from eleven nodes to eight so it
reads from the back of a classroom.

Both run a guided tour first, then hand over to free exploration.
Both respect `prefers-reduced-motion` and degrade gracefully without WebGL.

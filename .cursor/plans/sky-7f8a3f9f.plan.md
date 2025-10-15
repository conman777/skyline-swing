<!-- 7f8a3f9f-b43f-4509-95bd-bfc1f9a59154 df222a1b-a2dd-4f46-875c-4525396daa5e -->
# Skyline Swing Implementation Plan

## Key Milestones

1. Bootstrap Phaser project, asset pipeline, and CI smoke build.
2. Implement movement + web-swing core loop with assists and tension rules.
3. Add procedural segment system with hazards, anchors, and pacing ramps.
4. Layer pickups, scoring, HUD, juice, and telemetry.
5. Deliver full UI/UX flow, accessibility features, copy deck, and mockups.

## Core Mechanics (unchanged gameplay)

- Player Controller: Phaser physics sprite with run/jump states, coyote time, jump buffer, air control dampening, velocity-based camera follow, KO on left boundary.
- Web System: Single active web with raycast attach to solids or neon beacons, 2–12 m length clamp, 2.5 m/s reel speed, tension & tangential break thresholds, release preserves tangential velocity, cancel on `S`.
- Assists & Onboarding: Aim cone snapping to anchors, configurable grace timers, gentle first 15 s layout (easy anchors, sparse hazards), one-time toast tip “Shoot a web, then reel with Q/E or the mouse wheel.”
- Progression: Auto-scroll speed ramp and hazard density scaling, maintain readable swing paths, introduce hazards sequentially before mixing.

## World & Hazards

- Segment Generator: Weighted prefab chunks with unlock timeline, ensures at least one clear swing path, avoids punishing combos at release points.
- Hazard Modules: Crumble platforms, spikes, moving saws, lasers (telegraphed cycles), wind jets, swing gates, electrified floors/wires, environmental turrets with warning cues.
- Fairness: Toast banner announces each new hazard once, hazard telegraphs and warning audio, maintain attach options compatible with assist settings.

## Pickups & Scoring

- Pickups: Longer Web, Slow-Mo Charge, Double Jump, Anchor Magnet; timed durations or cooldowns, spawn rate scales down with speed.
- Scoring: Distance baseline, style bonuses for chained swings, near misses, beacon hits; speed multiplier shown in HUD; results screen calls out contributions to final score.
- Run Data: Track run seed, longest chain, closest near-miss, hazard types cleared, pickups used, top speed, run duration.

## UI/UX Flow

- Scene Structure: `MainMenuScene`, `GameScene` (with HUD overlay), `PauseOverlay`, `SettingsOverlay`, `ResultsScene`.
- Screen Flow: Main Menu → Play or Settings/Controls → Game → Pause (Resume/Settings/Restart/Main Menu) → Results (Play Again/Main Menu, optional copy seed/highlight).
- HUD Layout:
- Top-left: Distance counter + score multiplier badge.
- Top-right: Pause button + tiny run seed label.
- Center-top: Temporary toast for first-time hazards.
- Bottom-left: Pickup widget (icon, name, duration bar/pips, cooldown timer).
- Bottom-right: Speed number with fill bar indicating safe/high velocity bands.
- Cursor Feedback: Cursor colors (grey none, cyan attachable surface, neon beacon) with faint guide line preview that fades on web launch.
- Reduce Motion: Replaces shake/trails with subtle color pulse feedback.

## Settings & Accessibility

- Settings Panels (Main Menu & Pause):
- Audio sliders (Master/Music/SFX).
- Controls list with simple rebinds for keyboard and mouse actions.
- Gameplay assists toggles/sliders (aim assist width, coyote time window, jump buffer duration).
- Reduce Motion toggle.
- Color palettes (default + color-blind friendly sets for anchors/hazards).
- Persistence: Save settings, chosen palette, and tip-seen flag to local storage.
- Accessibility Principles: Large pixel font, high-contrast UI, HUD outside play area, readable at 1080p & 720p.

## Audio & Feel

- SFX Library: Attach “thwip”, break “snap”, perfect release “ping”, hazard warning chirp.
- Music System: Layered dusk rooftop track that intensifies with speed multiplier.
- Juice: Screen shake or color pulse on web events, ambient particles, speed trails on perfect releases, all respecting Reduce Motion.

## Wireframe Mockup (one-page, low fidelity)

- Provide annotated layout sheet with four panels:

1. Main Menu: Skyline background, centered logo, Play/Settings/Controls buttons, subtle parallax.
2. In-Game HUD: Screenshot frame showing HUD elements in corners/center as listed.
3. Pause Overlay: Dimmed game with centered panel listing Resume/Settings/Restart/Main Menu, settings icon row.
4. Results Screen: Large distance headline, stats grid (duration, top speed, longest chain, near-miss, hazards cleared, pickups), buttons for Play Again/Main Menu, copy seed action.

## UI Copy Deck (initial strings)

- Main Menu: “Play”, “Settings”, “Controls”, “Skyline Swing”, “Version {x.y.z}”.
- Pause: “Resume”, “Settings”, “Restart Run”, “Main Menu”.
- HUD: “Distance”, “Multiplier”, “Seed”, “Speed”, “New Hazard: {name}”.
- Pickup Toasts: “Pickup Ready”, “Pickup Cooling Down”.
- One-time Tip: “Shoot a web, then reel with Q/E or the mouse wheel.”
- Settings: “Audio”, “Master Volume”, “Music Volume”, “SFX Volume”, “Controls”, “Rebind”, “Aim Assist Width”, “Coyote Time”, “Jump Buffer”, “Reduce Motion”, “Color Palette”, palette names (“Default Dusk”, “High Contrast”, “Protanopia”, “Deuteranopia”).
- Results: “Run Over”, “Distance”, “Duration”, “Top Speed”, “Longest Swing Chain”, “Closest Near-Miss”, “Hazards Cleared”, “Pickups Used”, “Play Again”, “Main Menu”, “Copy Seed”, “Share Highlight”.
- Error/Status: “Settings Saved”, “Cannot Attach”, “Web Tension Critical!”.

## Implementation Hooks

- Shared HUD System: Modular components for distance, multiplier, pickup widget, speed meter, hazard toast, seed label.
- Toast & Tip Manager: Tracks shown tips/hazard toasts, handles fade timing.
- Cursor Manager: Updates cursor sprite & guide line based on raycast results, integrates with aim assist.
- Settings Store: Reactive data model persisted to local storage, drives assists and reduce-motion toggles in real time.

## Validation & Success Criteria

- Automated Tests: Settings persistence, HUD formatting, hazard toast trigger, pickup timer logic, aim assist toggles.
- Playtest Checks: HUD readable during highest speed band, first 15 s feel welcoming (at least 3 friendly anchors, no overlapping hazards), results screen conveys KO reason and scoring breakdown, cursor feedback consistently indicates attachable targets.
- Session QA: Ensure audio warnings precede hazard activation, reduce-motion mode removes shakes/trails, color palettes keep anchors/hazards distinguishable.
- Packaging: Bundle optimized for web, HUD scales with resolution scaling, mockup and copy deck reviewed with art/audio teams prior to implementation.

### To-dos

- [ ] Set up Phaser project, tooling, and asset pipeline.
- [ ] Build player movement, web mechanics, and assists.
- [ ] Implement procedural segments with hazards, anchors, and difficulty scaling.
- [ ] Integrate pickups, scoring, HUD, juice, and telemetry.
- [ ] Design UI flow, settings, wireframes, and copy deck.
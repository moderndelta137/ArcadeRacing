# Race Card Image Prompts - Full v0.3 Set

Authoritative source: `racing_cards.csv`. Card names, requirements, timings, types, effects, deck codes, internal serial numbers, printed plate names, and printed plate serials below mirror the current card list.

## How to Use

For each card, combine the Shared Rendering Prompt with the card-specific prompt. Generate one full-card PNG per prompt and save it using the listed target filename. Do not generate images until the current prompt list is approved.

## Shared Rendering Prompt

```text
Create a single portrait poker-card-size player race card at 1060 x 1484 px. Keep the established racing-card template: a top-left circular speed-requirement badge, top-center brush-style card name, large illustration panel below the title, timing keyword box above the lower text box on the left, large lower effect-text box, large compact serial number / deck code on the lower-left number plate, and card type at the bottom right.

Requirement badge rules: maximum speed uses a white circular road sign with a red ring and black number; minimum speed uses a solid blue circular sign with a white number; no requirement uses a neutral circular ANY badge. Make all card text accurate, complete, and clearly readable. Do not add, omit, paraphrase, or duplicate rules text.

Use a full-color 1990s Japanese street-racing manga color-page aesthetic, inspired by hand-drawn street-racing manga rather than photorealistic car art. Use strong black ink contours, visible line weight variation, screentone shadows, halftone dots, crosshatching, aggressive speed lines, cel-shaded color, tire smoke/dust/spray as appropriate to the deck environment, and dramatic road lighting. Avoid CGI-like reflections, smooth 3D render surfaces, realistic camera-photo lighting, and glossy modern concept-art shading. Do not use copyrighted logos or characters. Keep the card border, typography hierarchy, UI placement, and proportions consistent across the full set.

Composition rule: every card in the same deck must use a unique camera angle, road geometry, action moment, and mechanic cue. The illustration must be a believable road scene. Do not draw gameplay UI, floating numbers, rule text, card props, discarded cards, lane labels, road labels, or artificial road arrows inside the illustration. Mechanic cues must come from realistic vehicle behavior and road context.

Deck environments: AE86 = night mountain road, dry or slightly glossy asphalt, no rain. HRCN = sunny daytime paved road, dry surface. P911 = rainy night paved road with wet reflections and spray. GT500 = daytime offroad dirt/gravel road with dust and rough terrain.

Number plate rule: lower-left flat 2D plate, closer to the lower-left card corner than before, tilted clockwise so the left side is higher than the right side. First line shows car/deck name, second line is the large shortened printed serial in `{CC}-{NN}` format. Visible plate should be taller and larger, about 240-265 px wide and 112-130 px tall, with two clear text rows; do not overlap plate text.

Onomatopoeia rule: do not add Japanese sound-effect lettering by default. Use it only when the card-specific prompt says it is allowed. Most cards should have none.
```

---

# Common / Starter and Balance Cards - Bright Red AE86

The player's car in every illustration in this set is a Bright Red AE86-style car without copyrighted logos.
Deck environment: night mountain road, dry or slightly glossy asphalt, no rain.
The lower-left number plate first line is `AE86`. Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle. Make this plate larger/taller and closer to the lower-left corner than the previous AE86 draft set.

## AE86-01. Drift

**Target filename:** `AE86-01_drift_turn.png`

```text
Name: "Drift". Requirement: Max 70. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "AE86-01". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-01". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "+30 km/h to the speed check this turn.". Illustration: show the Bright Red AE86-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: +30 km/h to the speed check this turn. Composition: low front three-quarter shot at corner apex, car countersteering across a dry night mountain hairpin, smoke curling around guardrail, no generic straight-road acceleration framing. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## AE86-02. Full throttle

**Target filename:** `AE86-02_full-throttle_gas.png`

```text
Name: "Full throttle". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Internal serial number: "AE86-02". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-02". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed +40 km/h.". Illustration: show the Bright Red AE86-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Speed +40 km/h. Composition: rear three-quarter uphill acceleration shot on a short dry night mountain straight, exhaust flare and rear squat, road opening ahead, no drifting posture. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## AE86-03. Back down

**Target filename:** `AE86-03_back-down_brake.png`

```text
Name: "Back down". Requirement: Any. Timing keyword: "Before". Card type: "Brake". Internal serial number: "AE86-03". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-03". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed -20 km/h. Discard 1 card.". Illustration: show the Bright Red AE86-style car performing a clear speed control / braking maneuver that communicates this exact effect through believable road action, not game UI: Speed -20 km/h. Discard 1 card. Composition: side/rear shot before corner entry on dry night mountain road, brake lights glowing and car settling back, reduced aggression, no props or text overlays. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## AE86-04. Hard Brake

**Target filename:** `AE86-04_hard-brake_brake.png`

```text
Name: "Hard Brake". Requirement: Min 50. Timing keyword: "Before". Card type: "Brake". Internal serial number: "AE86-04". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-04". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed -50 km/h.". Illustration: show the Bright Red AE86-style car performing a clear speed control / braking maneuver that communicates this exact effect through believable road action, not game UI: Speed -50 km/h. Composition: front low shot under heavy braking before dry night mountain hairpin, nose dive, glowing brake rotors, long tire streaks, dramatic but distinct from Back down. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## AE86-05. Change Lane

**Target filename:** `AE86-05_change-lane_turn.png`

```text
Name: "Change Lane". Requirement: Any. Timing keyword: "Before". Card type: "Turn". Internal serial number: "AE86-05". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-05". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Move to the other lane. Discard 1 card.". Illustration: show the Bright Red AE86-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: Move to the other lane. Discard 1 card. Composition: elevated three-quarter road view showing two clear real lanes, car physically moving from one lane position to another through road placement and body angle, no artificial arrows. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## AE86-06. Early Brake Cornering

**Target filename:** `AE86-06_early-brake-cornering_turn.png`

```text
Name: "Early Brake Cornering". Requirement: Max 110. Timing keyword: "Before". Card type: "Turn". Internal serial number: "AE86-06". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-06". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed -20 km/h. Move to the inner lane.". Illustration: show the Bright Red AE86-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: Speed -20 km/h. Move to the inner lane. Composition: wide corner-entry view, braking zone and inner-lane racing line implied by car position and road geometry, car smaller in frame to show lane geometry, no labels or arrows. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## AE86-07. Rocket Start

**Target filename:** `AE86-07_rocket-start_gas.png`

```text
Name: "Rocket Start". Requirement: Max 50. Timing keyword: "After". Card type: "Gas". Internal serial number: "AE86-07". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-07". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed +50 km/h. You may discard 2 cards.". Illustration: show the Bright Red AE86-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Speed +50 km/h. You may discard 2 cards. Composition: low rear launch shot from near-standstill on dry night mountain road, tire smoke cloud and front lift, straight launch energy, no card props. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## AE86-08. Change Shift

**Target filename:** `AE86-08_change-shift_gas.png`

```text
Name: "Change Shift". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Internal serial number: "AE86-08". Deck code: "AE86". Deck environment: night mountain road, dry or slightly glossy asphalt, no rain. Number plate first line: "AE86". Number plate large serial: "86-08". Plate style: Japanese-style black carbon plate with rounded border, white text, no red decoration circle; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed +10 km/h or -10 km/h. You may then play another card.". Illustration: show the Bright Red AE86-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Speed +10 km/h or -10 km/h. You may then play another card. Composition: split manga-like composition with exterior car plus realistic cockpit gear-shift/tachometer insert, gloved hand shifting, no floating +10/-10 text or game arrows. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

---

# RWD Drift Set - Bright Green Lamborghini Huracan

The player's car in every illustration in this set is a Bright Green Lamborghini Huracan-style car without copyrighted logos.
Deck environment: sunny daytime paved road, dry surface, clear visibility.
The lower-left number plate first line is `HURACAN`. Plate style: Italian/European-inspired white plate with green accents. Make this plate larger/taller and closer to the lower-left corner than the previous AE86 draft set.

## HRCN-01. Clutch Kick

**Target filename:** `HRCN-01_clutch-kick_gas.png`

```text
Name: "Clutch Kick". Requirement: Min 60. Timing keyword: "Before". Card type: "Gas". Internal serial number: "HRCN-01". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-01". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed +20 km/h. This turn, your first speed check gains +50 km/h.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Speed +20 km/h. This turn, your first speed check gains +50 km/h. Composition: close side-rear drift initiation shot on sunny dry road, rear wheels breaking traction with clutch-kick jolt, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## HRCN-02. Trail Braking

**Target filename:** `HRCN-02_trail-braking_brake.png`

```text
Name: "Trail Braking". Requirement: Max 80. Timing keyword: "Drive". Card type: "Brake". Internal serial number: "HRCN-02". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-02". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Before each speed check this turn, you may reduce Speed by 10 km/h.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear speed control / braking maneuver that communicates this exact effect through believable road action, not game UI: Before each speed check this turn, you may reduce Speed by 10 km/h. Composition: front quarter view entering sunny dry corner while braking into apex, weight transfer and brake glow, path tightens progressively. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## HRCN-03. Full Countersteer

**Target filename:** `HRCN-03_full-countersteer_turn.png`

```text
Name: "Full Countersteer". Requirement: Any. Timing keyword: "Step". Card type: "Turn". Internal serial number: "HRCN-03". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-03". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you would understeer this turn, discard 1 card and cancel that understeer once.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: If you would understeer this turn, discard 1 card and cancel that understeer once. Composition: interior/over-shoulder steering-wheel shot plus exterior countersteer inset, hands correcting slide, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## HRCN-04. Exit Drift

**Target filename:** `HRCN-04_exit-drift_gas.png`

```text
Name: "Exit Drift". Requirement: Max 60. Timing keyword: "After". Card type: "Gas". Internal serial number: "HRCN-04". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-04". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you moved through at least 1 speed check space this turn, Speed +30 km/h.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: If you moved through at least 1 speed check space this turn, Speed +30 km/h. Composition: sunny dry corner exit rear shot, car straightening and accelerating out, smoke fading into open road. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## HRCN-05. Drift Extend

**Target filename:** `HRCN-05_drift-extend_turn.png`

```text
Name: "Drift Extend". Requirement: Max 80. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "HRCN-05". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-05". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you gain corner speed bonus last turn, it also applies to the speed check this turn.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: If you gain corner speed bonus last turn, it also applies to the speed check this turn. Composition: sunny dry long sweeping curve with sustained drift arc, repeated natural manga motion positions only if subtle, no markers. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## HRCN-06. Gutter Boost

**Target filename:** `HRCN-06_gutter-boost_turn.png`

```text
Name: "Gutter Boost". Requirement: Max 80. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "HRCN-06". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-06". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you are on the inner lane, +50 km/h to the corner speed limit calculation.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: If you are on the inner lane, +50 km/h to the corner speed limit calculation. Composition: low inner-gutter road-level sunny shot, inside wheels near gutter/curb channel, speed advantage implied by inner line. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## HRCN-07. Blind Attack

**Target filename:** `HRCN-07_blind-attack_turn.png`

```text
Name: "Blind Attack". Requirement: Min 50. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "HRCN-07". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-07". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Discard all cards in your hand. If you get blocked, move to the other lane and gain 1 move point.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: Discard all cards in your hand. If you get blocked, move to the other lane and gain 1 move point. Composition: sunny close-quarters lane pressure scene with rival car blind spot, car slipping into other lane after block, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## HRCN-08. Jump Exit

**Target filename:** `HRCN-08_jump-exit_gas.png`

```text
Name: "Jump Exit". Requirement: Max 30. Timing keyword: "Drive". Card type: "Gas". Internal serial number: "HRCN-08". Deck code: "HRCN". Deck environment: sunny daytime paved road, dry surface, clear visibility. Number plate first line: "HURACAN". Number plate large serial: "63-08". Plate style: Italian/European-inspired white plate with green accents; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "You have 4 move points this turn regardless of your gear, ignore the corner speed limit.". Illustration: show the Bright Green Lamborghini Huracan-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: You have 4 move points this turn regardless of your gear, ignore the corner speed limit. Composition: sunny downhill corner exit with car skipping over bump/crest, motion implies ignoring corner speed, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

---

# AWD Grip Set - Yellow Porsche 911

The player's car in every illustration in this set is a Yellow Porsche 911-style car without copyrighted logos.
Deck environment: rainy night paved road, wet reflections, active rain and road spray.
The lower-left number plate first line is `911`. Plate style: German/European-inspired pale plate with black divider marks. Make this plate larger/taller and closer to the lower-left corner than the previous AE86 draft set.

## P911-01. Progressive Acceleration

**Target filename:** `P911-01_progressive-acceleration_gas.png`

```text
Name: "Progressive Acceleration". Requirement: Any. Timing keyword: "Drive". Card type: "Gas". Internal serial number: "P911-01". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-01". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "After each move this turn, Speed +10 km/h.". Illustration: show the Yellow Porsche 911-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: After each move this turn, Speed +10 km/h. Composition: rainy night multi-stage acceleration sequence along road, ghosted car positions increasing spacing naturally, no markers or numbers. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-02. Early Power

**Target filename:** `P911-02_early-power_gas.png`

```text
Name: "Early Power". Requirement: Max 60. Timing keyword: "After". Card type: "Gas". Internal serial number: "P911-02". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-02". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you passed all speed checks this turn, Speed +40 km/h.". Illustration: show the Yellow Porsche 911-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: If you passed all speed checks this turn, Speed +40 km/h. Composition: rainy night exit shot after clean corner sequence, acceleration after passing road checkpoints implied by road signs/spacing, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-03. Traction Control

**Target filename:** `P911-03_traction-control_brake.png`

```text
Name: "Traction Control". Requirement: Any. Timing keyword: "Drive". Card type: "Brake". Internal serial number: "P911-03". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-03". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you would understeer this turn, reduce your speed by 20 km/h and cancel that understeer.". Illustration: show the Yellow Porsche 911-style car performing a clear speed control / braking maneuver that communicates this exact effect through believable road action, not game UI: If you would understeer this turn, reduce your speed by 20 km/h and cancel that understeer. Composition: rainy night technical control shot, tires regaining grip with stability shown by wheel angle and spray pattern, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-04. Grip Line

**Target filename:** `P911-04_grip-line_turn.png`

```text
Name: "Grip Line". Requirement: Max 60. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "P911-04". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-04". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "+20 km/h to the speed check this turn. Discard 1 card.". Illustration: show the Yellow Porsche 911-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: +20 km/h to the speed check this turn. Discard 1 card. Composition: rainy night clean racing-line composition over mountain corner, grip-focused front tire placement, no drawn line labels or arrows. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-05. Balanced Chassis

**Target filename:** `P911-05_balanced-chassis_turn.png`

```text
Name: "Balanced Chassis". Requirement: Any. Timing keyword: "Step". Card type: "Turn". Internal serial number: "P911-05". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-05". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Once this turn, you may move sideways by discard 1 card.". Illustration: show the Yellow Porsche 911-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: Once this turn, you may move sideways by discard 1 card. Composition: rainy night elevated view showing balanced chassis shifting sideways one lane through car position and road geometry, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-06. Torque Split

**Target filename:** `P911-06_torque-split_gas.png`

```text
Name: "Torque Split". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Internal serial number: "P911-06". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-06". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Choose one: Speed +30 km/h, or +40 km/h to the speed check this turn.". Illustration: show the Yellow Porsche 911-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Choose one: Speed +30 km/h, or +40 km/h to the speed check this turn. Composition: rainy night mechanical grip/power composition, torque implied by wheel load and spray, no split-choice UI graphics. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-07. Micro Correction

**Target filename:** `P911-07_micro-correction_turn.png`

```text
Name: "Micro Correction". Requirement: Any. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "P911-07". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-07". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "After each speed check this turn, you may choose Speed +10 km/h or Speed -10 km/h.". Illustration: show the Yellow Porsche 911-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: After each speed check this turn, you may choose Speed +10 km/h or Speed -10 km/h. Composition: rainy night close tire/steering correction scene, small steering inputs shown by wheel angle and spray, no plus/minus text. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## P911-08. Line Lock

**Target filename:** `P911-08_line-lock_turn.png`

```text
Name: "Line Lock". Requirement: Max 60. Timing keyword: "Drive". Card type: "Turn". Internal serial number: "P911-08". Deck code: "P911". Deck environment: rainy night paved road, wet reflections, active rain and road spray. Number plate first line: "911". Number plate large serial: "91-08". Plate style: German/European-inspired pale plate with black divider marks; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "While you remain in your current lane , all speed checks gain +30 km/h this turn.". Illustration: show the Yellow Porsche 911-style car performing a clear line control / cornering maneuver that communicates this exact effect through believable road action, not game UI: While you remain in your current lane , all speed checks gain +30 km/h this turn. Composition: rainy night lane-commitment shot, car holding current lane with lane borders emphasized naturally, no labels. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

---

# Muscle Car Set - Blue Mustang GT500 with Black Stripes

The player's car in every illustration in this set is a Blue Mustang GT500 with Black Stripes-style car without copyrighted logos.
Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain.
The lower-left number plate first line is `GT500`. Plate style: US-style white plate with blue/black striping. Make this plate larger/taller and closer to the lower-left corner than the previous AE86 draft set.

## GT500-01. Raw Horsepower

**Target filename:** `GT500-01_raw-horsepower_gas.png`

```text
Name: "Raw Horsepower". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Internal serial number: "GT500-01". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-01". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed +50 km/h. You may only move forward this turn.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: Speed +50 km/h. You may only move forward this turn. Composition: daytime dirt road low front muscle acceleration shot, dust plume, straight offroad dominance. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## GT500-02. Straight-Line Monster

**Target filename:** `GT500-02_straight-line-monster_gas.png`

```text
Name: "Straight-Line Monster". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Internal serial number: "GT500-02". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-02". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you are on a straight, Speed +40 km/h. Otherwise, Speed +20 km/h". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: If you are on a straight, Speed +40 km/h. Otherwise, Speed +20 km/h Composition: daytime offroad long straight perspective, car centered on dirt track, rough terrain flying past, no pavement. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## GT500-03. Panic Stop

**Target filename:** `GT500-03_panic-stop_brake.png`

```text
Name: "Panic Stop". Requirement: Any. Timing keyword: "Drive". Card type: "Brake". Internal serial number: "GT500-03". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-03". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Speed -80km/h. Discard all cards from hand.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear speed control / braking maneuver that communicates this exact effect through believable road action, not game UI: Speed -80km/h. Discard all cards from hand. Composition: daytime offroad emergency braking shot, dirt spray wall and locked tires, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## GT500-04. Chrome Bumper

**Target filename:** `GT500-04_chrome-bumper_attack.png`

```text
Name: "Chrome Bumper". Requirement: Min 60. Timing keyword: "Step". Card type: "Attack". Internal serial number: "GT500-04". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-04". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "When you get blocked, discard 1 card, then the blocking car loses 40 km/h.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear blocking, contact, or lane pressure maneuver that communicates this exact effect through believable road action, not game UI: When you get blocked, discard 1 card, then the blocking car loses 40 km/h. Composition: daytime offroad close bumper pressure behind blocking car, contact threat without crash gore, dust and rough track. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## GT500-05. Shove Aside

**Target filename:** `GT500-05_shove-aside_attack.png`

```text
Name: "Shove Aside". Requirement: Min 80. Timing keyword: "Step". Card type: "Attack". Internal serial number: "GT500-05". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-05". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Move the blocking car to the other lane. You may enter the space it left. If it cannot move, both cars spin-off.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear blocking, contact, or lane pressure maneuver that communicates this exact effect through believable road action, not game UI: Move the blocking car to the other lane. You may enter the space it left. If it cannot move, both cars spin-off. Composition: daytime offroad side pressure/lane shove composition, blocking car being pushed toward rough shoulder, no UI symbols. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: sparing decorative sound effect allowed.
```

## GT500-06. Burn Rubber

**Target filename:** `GT500-06_burn-rubber_gas.png`

```text
Name: "Burn Rubber". Requirement: Any. Timing keyword: "After". Card type: "Gas". Internal serial number: "GT500-06". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-06". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "If you overtake this turn, Speed +60 km/h. Discard all cards.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear speed gain / acceleration maneuver that communicates this exact effect through believable road action, not game UI: If you overtake this turn, Speed +60 km/h. Discard all cards. Composition: daytime offroad overtake aftermath shot, car surging past rival with dust plume, no card props. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## GT500-07. Door Slam

**Target filename:** `GT500-07_door-slam_attack.png`

```text
Name: "Door Slam". Requirement: Min 80. Timing keyword: "Step". Card type: "Attack". Internal serial number: "GT500-07". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-07". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Move to the other lane. If you get blocked the blocking car loses 20 km/h and all his remaining move points.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear blocking, contact, or lane pressure maneuver that communicates this exact effect through believable road action, not game UI: Move to the other lane. If you get blocked the blocking car loses 20 km/h and all his remaining move points. Composition: daytime offroad side-by-side door pressure shot, car moving lane into block, aggressive but controlled. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

## GT500-08. No Room

**Target filename:** `GT500-08_no-room_attack.png`

```text
Name: "No Room". Requirement: Min 60. Timing keyword: "Drive". Card type: "Attack". Internal serial number: "GT500-08". Deck code: "GT500". Deck environment: daytime offroad or rally-style dirt/gravel road, dust and rough terrain. Number plate first line: "GT500". Number plate large serial: "50-08". Plate style: US-style white plate with blue/black striping; make the plate visibly larger/taller and closer to the lower-left card corner. Effect text: "Other cars cannot move into your lane until next turn.". Illustration: show the Blue Mustang GT500 with Black Stripes-style car performing a clear blocking, contact, or lane pressure maneuver that communicates this exact effect through believable road action, not game UI: Other cars cannot move into your lane until next turn. Composition: daytime offroad defensive blocking composition, car occupying track line with rival unable to enter, tight dirt road framing. Do not draw floating numbers, km/h text, card icons, discarded cards, lane labels, words such as Brake or inner lane, or artificial arrows inside the illustration. Onomatopoeia: none.
```

---

## Set Count

| Set | Cards |
|---|---:|
| Common / Starter and Balance Cards - Bright Red AE86 | 8 |
| RWD Drift Set - Bright Green Lamborghini Huracan | 8 |
| AWD Grip Set - Yellow Porsche 911 | 8 |
| Muscle Car Set - Blue Mustang GT500 with Black Stripes | 8 |
| **Total** | **32** |

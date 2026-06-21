# Race Card Image Prompts - Full v0.3 Set

This file updates the original image-generation prompts with the authoritative card text from `racing_card_list_v0_3.md`. It contains the original 33 cards plus the new normal Brake card.

## How to Use

For each card, combine the Shared Rendering Prompt with the card-specific prompt. Generate one card image per prompt and save it using the listed target filename.

## Shared Rendering Prompt

```text
Create a single portrait poker-card-size player race card. Keep the established racing-card template: a top-left circular speed-requirement badge, top-center card name, large illustration panel below the title, timing keyword box above the lower text box on the left, large lower effect-text box, and card type at the bottom right.

Requirement badge rules: maximum speed uses a white circular road sign with a red ring and black number; minimum speed uses a solid blue circular sign with a white number; no requirement uses a neutral circular ANY badge. Make all card text accurate, complete, and clearly readable. Do not add, omit, paraphrase, or duplicate rules text.

Use a full-color 1990s Japanese street-racing manga color-page aesthetic with strong black ink, speed lines, halftone texture, dynamic vehicle action, and dramatic road lighting. Do not use copyrighted logos or characters. Keep the card border, typography hierarchy, UI placement, and proportions consistent across the full set.
```

---

# 1. Common / Starter Set - Bright Red AE86

The player's car in every illustration in this set is a bright red AE86-style compact sports car.

## 1. Drift

**Target filename:** `01_ae86_drift_turn.png`

```text
Name: "Drift". Requirement: Max 60. Timing keyword: "Drive". Card type: "Turn". Effect text: "+30 km/h to the corner speed limit calculation." Illustration: the red AE86 countersteering through a mountain corner near the guardrail, with controlled tire smoke and clear cornering technique.
```

## 2. Accelerate

**Target filename:** `02_ae86_accelerate_gas.png`

```text
Name: "Accelerate". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +40 km/h." Illustration: the red AE86 blasting forward out of a corner or down a straight, shown from a low rear three-quarter angle with exhaust flame and strong motion streaks.
```

## 3. Hard Brake

**Target filename:** `03_ae86_hard-brake_brake.png`

```text
Name: "Hard Brake". Requirement: Min 30. Timing keyword: "Before". Card type: "Brake". Effect text: "Speed -30 km/h." Illustration: the red AE86 braking hard before a corner, with glowing brake lights, tire marks, smoke, and aggressive weight transfer.
```

## 4. Change Lane

**Target filename:** `04_ae86_change-lane_turn.png`

```text
Name: "Change Lane". Requirement: Any. Timing keyword: "Before". Card type: "Turn". Effect text: "Move to the other lane. You may discard 1 card from hand." Illustration: the red AE86 sharply changing lanes on a two-lane mountain road, with a clear lateral-motion arrow and a nearby rival that is not colliding.
```

## 5. Early Brake Cornering

**Target filename:** `05_ae86_early-brake-cornering_turn.png`

```text
Name: "Early Brake Cornering". Requirement: Max 50. Timing keyword: "Before". Card type: "Turn". Effect text: "Speed -20 km/h. Move to the inner lane. You may discard 1 card from hand." Illustration: the red AE86 braking early and moving from the outer lane toward the inner lane before the apex, with brake lights and a clearly readable racing line.
```

## 6. In-Out-In

**Target filename:** `06_ae86_in-out-in_turn.png`

```text
Name: "In-Out-In". Requirement: Max 40. Timing keywords: "Step / After". Card type: "Turn". Effect text: "During movement, move to the inner lane. At the end of movement, move to the outer lane. You may discard 1 card from hand." Illustration: a semi-diagrammatic racing-line composition showing the red AE86 moving through the specified inner-to-outer path, with clear arrows and multiple positions of the car.
```

## 7. Rocket Start

**Target filename:** `07_ae86_rocket-start_gas.png`

```text
Name: "Rocket Start". Requirement: Max 30. Timing keyword: "After". Card type: "Gas". Effect text: "Speed +40 km/h. You may discard 1 card from hand." Illustration: the red AE86 launching explosively from low speed, with tire smoke, dramatic acceleration lines, and the front end lifting slightly.
```

## 8. Change Shift

**Target filename:** `08_ae86_change-shift_gas.png`

```text
Name: "Change Shift". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +10 km/h or -10 km/h. You may discard 1 card from hand. You may then play another card." Illustration: a cockpit view with a gloved hand shifting gears, tachometer needle and speed lines, while the red AE86 and night road remain visually implied.
```

## 34. Brake

**Target filename:** `34_ae86_brake_brake.png`

```text
Name: "Brake". Requirement: Any. Timing keyword: "Before". Card type: "Brake". Effect text: "Speed -20 km/h. You may discard 1 card from hand." Illustration: the red AE86 making a controlled, moderate braking maneuver before a mountain bend, with glowing brake lights and visible weight transfer but less smoke and violence than Hard Brake. Make the composition clearly distinct from Hard Brake and Early Brake Cornering.
```

---

# 2. Drift / Touge Technique Set - Bright Green Lamborghini Huracan

The player's car in every illustration in this set is a bright green Lamborghini Huracan-style supercar without copyrighted logos.

## 9. Clutch Kick

**Target filename:** `09_lamborghini-huracan_clutch-kick_gas.png`

```text
Name: "Clutch Kick". Requirement: Min 40. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +20 km/h. This turn, your first corner speed check gains +30 km/h." Illustration: the green supercar snapping into drift initiation at corner entry, rear stepping out suddenly with tire smoke and a strong yaw angle.
```

## 10. Trail Braking

**Target filename:** `10_lamborghini-huracan_trail-braking_brake.png`

```text
Name: "Trail Braking". Requirement: Max 60. Timing keyword: "Drive". Card type: "Brake". Effect text: "Before each corner speed check this turn, you may reduce Speed by 10 km/h." Illustration: the green supercar braking deep into a corner with its nose loaded, brake discs glowing, and front tires gripping hard.
```

## 11. Full Countersteer

**Target filename:** `11_lamborghini-huracan_full-countersteer_turn.png`

```text
Name: "Full Countersteer". Requirement: Any. Timing keyword: "Drive". Card type: "Turn". Effect text: "If you would understeer this turn, you may cancel that understeer once." Illustration: the green supercar at an extreme countersteer angle, front wheels visibly turned against the slide, with smoke and a nearby guardrail.
```

## 12. Throttle Control

**Target filename:** `12_lamborghini-huracan_throttle-control_gas.png`

```text
Name: "Throttle Control". Requirement: Any. Timing keyword: "Drive". Card type: "Gas". Effect text: "Once this turn, after moving into a corner speed check space, you may choose Speed +10 km/h or Speed -10 km/h." Illustration: the green supercar balancing throttle mid-corner, with a tachometer or pedal overlay and a poised transition between grip and slide.
```

## 13. Exit Drift

**Target filename:** `13_lamborghini-huracan_exit-drift_gas.png`

```text
Name: "Exit Drift". Requirement: Max 80. Timing keyword: "After". Card type: "Gas". Effect text: "If you moved through at least 1 corner speed check space this turn, Speed +30 km/h." Illustration: the green supercar exiting a corner sideways while accelerating hard, with smoke trailing behind and headlights aimed toward the straight.
```

## 14. Drift Extend

**Target filename:** `14_lamborghini-huracan_drift-extend_turn.png`

```text
Name: "Drift Extend". Requirement: Max 80. Timing keyword: "Drive". Card type: "Turn". Effect text: "Your first corner speed bonus this turn also applies to the next corner speed check this turn." Illustration: the green supercar holding one continuous drift through linked corners, with a smoke ribbon connecting two apexes.
```

## 15. Gutter Boost

**Target filename:** `15_lamborghini-huracan_gutter-boost_gas.png`

```text
Name: "Gutter Boost". Requirement: Max 60. Timing keyword: "After". Card type: "Gas". Effect text: "If you ended movement in the inner lane of a corner, Speed +30 km/h." Illustration: the green supercar riding the inner gutter of a mountain corner and blasting out, with sparks or water spray emphasizing the risky inside line.
```

## 16. Blind Attack

**Target filename:** `16_lamborghini-huracan_blind-attack_turn.png`

```text
Name: "Blind Attack". Requirement: Min 50. Timing keyword: "Before". Card type: "Turn". Effect text: "If you are the following car and in the same lane as the lead car, ignore blocking once this turn." Illustration: the green supercar hidden in the lead car's blind spot at night and suddenly appearing to pass, with a dark rival ahead and dramatic shadow.
```

## 17. Jump Start Exit

**Target filename:** `17_lamborghini-huracan_jump-start-exit_gas.png`

```text
Name: "Jump Start Exit". Requirement: Max 40. Timing keyword: "After". Card type: "Gas". Effect text: "If you moved from inner lane to outer lane this turn, Speed +40 km/h." Illustration: the green supercar transitioning from the inner apex to the outer exit lane and launching hard, with a clear racing line and acceleration burst.
```

---

# 3. AWD Grip Set - Yellow Porsche 911

The player's car in every illustration in this set is a yellow Porsche 911-style sports car without copyrighted logos.

## 18. Grip Acceleration

**Target filename:** `18_porsche-911_grip-acceleration_gas.png`

```text
Name: "Grip Acceleration". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +20 km/h. If you are not in a corner, you may discard 1 card from hand." Illustration: the yellow sports car accelerating cleanly at night with all four tires planted, minimal smoke, strong traction, and stable body posture.
```

## 19. Early Power

**Target filename:** `19_porsche-911_early-power_gas.png`

```text
Name: "Early Power". Requirement: Max 70. Timing keyword: "After". Card type: "Gas". Effect text: "If you passed all corner speed checks this turn, Speed +30 km/h." Illustration: the yellow sports car applying power early out of a corner, with all four tires gripping and a stable exit line without drift smoke.
```

## 20. Traction Control

**Target filename:** `20_porsche-911_traction-control_turn.png`

```text
Name: "Traction Control". Requirement: Any. Timing keyword: "Drive". Card type: "Turn". Effect text: "If you would understeer this turn, reduce your speed by 10 km/h instead. Then cancel that understeer." Illustration: a wet night hairpin where the yellow sports car corrects understeer, sprays water, and stays on line rather than sliding outward.
```

## 21. Grip Line

**Target filename:** `21_porsche-911_grip-line_turn.png`

```text
Name: "Grip Line". Requirement: Max 70. Timing keyword: "Drive". Card type: "Turn". Effect text: "+10 km/h to all corner speed limit calculations this turn. If you stay in the same lane during movement, you may discard 1 card from hand." Illustration: an elevated view of the yellow sports car following a glowing, precise racing line through a night corner while remaining in one lane.
```

## 22. Balanced Chassis

**Target filename:** `22_porsche-911_balanced-chassis_turn.png`

```text
Name: "Balanced Chassis". Requirement: Any. Timing keyword: "Drive". Card type: "Turn". Effect text: "Once this turn, after a speed check, you may move sideways without spending movement." Illustration: the yellow sports car smoothly correcting its line through linked bends, with small lateral-adjustment arrows and a stable, balanced posture.
```

## 23. Torque Split

**Target filename:** `23_porsche-911_torque-split_gas.png`

```text
Name: "Torque Split". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "Choose one: Speed +20 km/h, or +30 km/h to your next corner speed check this turn." Illustration: the yellow sports car at night with subtle glowing torque paths splitting toward the front and rear wheels, visually communicating two power-distribution choices.
```

## 24. Micro Correction

**Target filename:** `24_porsche-911_micro-correction_turn.png`

```text
Name: "Micro Correction". Requirement: Any. Timing keyword: "Step". Card type: "Turn". Effect text: "During movement, move sideways. This does not cost movement if your speed is 80 km/h or lower." Illustration: the yellow sports car making a tiny, precise steering correction on a narrow night road, with a small lateral arrow and stable grip near the lane markings.
```

## 25. Line Lock

**Target filename:** `25_porsche-911_line-lock_turn.png`

```text
Name: "Line Lock". Requirement: Max 80. Timing keyword: "Drive". Card type: "Turn". Effect text: "Choose your lane. While you remain in that lane this turn, all corner speed checks gain +30 km/h." Illustration: the yellow sports car committed to a single glowing lane through a long sweeping night corner, emphasizing unwavering grip and lane commitment.
```

---

# 4. Muscle Car Set - Blue Mustang GT500 with Black Stripes

The player's car in every illustration in this set is a blue Mustang GT500-style muscle car with black stripes and no copyrighted logos.

## 26. Raw Horsepower

**Target filename:** `26_mustang-gt500_raw-horsepower_gas.png`

```text
Name: "Raw Horsepower". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +40 km/h. You may only move forward this turn. If you are on a straight, Speed +10 km/h again." Illustration: a dramatic low-angle front three-quarter launch on a mountain road at night, with wheelspin, aggressive headlights, and straight-line power.
```

## 27. Straight-Line Monster

**Target filename:** `27_mustang-gt500_straight-line-monster_gas.png`

```text
Name: "Straight-Line Monster". Requirement: Any. Timing keyword: "Before". Card type: "Gas". Effect text: "If you are on a straight, Speed +50 km/h. Otherwise, Speed +20 km/h and your first corner speed check this turn gets -10 km/h." Illustration: the blue muscle car surging down a long, unmistakably straight nighttime road, shown from a dynamic side or rear three-quarter view.
```

## 28. Wide Open Throttle

**Target filename:** `28_mustang-gt500_wide-open-throttle_gas.png`

```text
Name: "Wide Open Throttle". Requirement: Min 60. Timing keyword: "Drive". Card type: "Gas". Effect text: "After each forward movement on a straight, Speed +10 km/h. This can trigger up to twice this turn." Illustration: repeated forward surges on a straight at night, using motion echoes or streetlight streaks to communicate speed building twice.
```

## 29. Torque Monster

**Target filename:** `29_mustang-gt500_torque-monster_gas.png`

```text
Name: "Torque Monster". Requirement: Max 80. Timing keyword: "Before". Card type: "Gas". Effect text: "Speed +30 km/h. This turn, when your forward space is occupied, the blocking car loses 10 km/h. You may then stop moving or move sideways if possible." Illustration: the blue muscle car bearing down nose-to-tail on a rival directly ahead at night, communicating pressure and torque without overlapping vehicles.
```

## 30. Shove Aside

**Target filename:** `30_mustang-gt500_shove-aside_attack.png`

```text
Name: "Shove Aside". Requirement: Min 40. Timing keyword: "Step". Card type: "Attack". Effect text: "Move the blocking car 1 lane outward if possible. If it moves, you may enter the space it left. If it cannot move, both cars suffer collision and you stop moving." Illustration: the blue muscle car forcing a rival outward in a lane battle at night, with strong lateral pressure and clear displacement but no overlapping cars.
```

## 31. Overpower

**Target filename:** `31_mustang-gt500_overpower_attack.png`

```text
Name: "Overpower". Requirement: Min 60. Timing keyword: "Step". Card type: "Attack". Effect text: "The blocking car loses 1 Gear. You lose 10 km/h and stop moving." Illustration: a heavy impact moment where the blue muscle car overwhelms a blocking rival with mass and force, destabilizing the rival while keeping both cars in separate spaces.
```

## 32. Door Slam

**Target filename:** `32_mustang-gt500_door-slam_attack.png`

```text
Name: "Door Slam". Requirement: Max 70. Timing keyword: "Step". Card type: "Attack". Effect text: "That car loses 10 km/h. If it is in the outer lane, it loses 20 km/h instead." Illustration: a side-by-side lane battle where the blue muscle car aggressively leans on a rival toward the outer lane, clearly emphasizing the stronger outer-lane penalty.
```

## 33. No Room

**Target filename:** `33_mustang-gt500_no-room_attack.png`

```text
Name: "No Room". Requirement: Any. Timing keyword: "Drive". Card type: "Attack". Effect text: "Adjacent opponents cannot move sideways into your lane this turn." Illustration: the broad blue muscle car occupying its lane with an imposing stance and boxing a rival into the neighboring lane, making lane denial immediately readable.
```

---

## Set Count

| Set | Cards |
|---|---:|
| Common / AE86 | 9 |
| Drift / Huracan | 9 |
| AWD Grip / Porsche 911 | 8 |
| Muscle / Mustang GT500 | 8 |
| **Total** | **34** |


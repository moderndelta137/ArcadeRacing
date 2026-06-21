# Racing Card List v0.3

## Update Summary

This update applies the new acceleration and hand-cycling direction:

- **Accelerate** is increased from `Speed +20 km/h` to `Speed +40 km/h`.
- `+40 km/h` is now the normal strong Gas benchmark.
- `+20 km/h` is now treated as small / controlled acceleration.
- **Discard 1–2 cards from hand is beneficial** because players draw back up to 4 cards at the end of the turn.
- **Discard 3+ cards from hand is a detriment / cost.**
- Effects that previously used `draw 1 card` as a small reward are converted to optional discard / cycling when appropriate.
- Corner-support values are slightly increased where needed because cars can now accelerate harder.

Recommended wording:

> `You may discard 1 card from hand.`

This should usually be optional, because sometimes a player wants to keep their current hand.

---

# 1. Common / Starter Cards — Bright Red AE86

## 1. Drift

**Requirement:** Max 60  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`+30 km/h to the corner speed limit calculation.`

**Update Note:**  
Increased from `+20 km/h` to `+30 km/h` because the new basic Accelerate is now `+40 km/h`.

---

## 2. Accelerate

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +40 km/h.`

**Update Note:**  
This is now the standard strong Gas benchmark.

---

## 3. Hard Brake

**Requirement:** Min 30  
**Type:** Brake  
**Timing:** Before  

**Updated Effect:**  
`Speed -30 km/h.`

**Update Note:**  
No change. Hard Brake remains the simple stronger braking card with no cycling bonus.

---

## 4. Change Lane

**Requirement:** Any  
**Type:** Turn  
**Timing:** Before  

**Updated Effect:**  
`Move to the other lane. You may discard 1 card from hand.`

**Update Note:**  
Discard 1 is now a beneficial cycling bonus.

---

## 5. Early Brake Cornering

**Requirement:** Max 50  
**Type:** Turn  
**Timing:** Before  

**Updated Effect:**  
`Speed -20 km/h. Move to the inner lane. You may discard 1 card from hand.`

**Update Note:**  
This becomes a technical setup card: light braking, inner-lane setup, and hand cycling.

---

## 6. In-Out-In

**Requirement:** Max 40  
**Type:** Turn  
**Timing:** Step / After  

**Updated Effect:**  
`During movement, move to the inner lane. At the end of movement, move to the outer lane. You may discard 1 card from hand.`

**Update Note:**  
The discard bonus helps this situational line card stay useful.

---

## 7. Rocket Start

**Requirement:** Max 30  
**Type:** Gas  
**Timing:** After  

**Updated Effect:**  
`Speed +40 km/h. You may discard 1 card from hand.`

**Update Note:**  
Since Accelerate is now also `+40 km/h`, Rocket Start keeps its After timing identity and gains a cycling bonus.

---

## 8. Change Shift

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +10 km/h or -10 km/h. You may discard 1 card from hand. You may then play another card.`

**Update Note:**  
The card remains a combo / tuning card and now also supports hand cycling.

---

# 2. Drift / Touge Technique Set — Bright Green Lamborghini Huracán

## 9. Clutch Kick

**Requirement:** Min 40  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +20 km/h. This turn, your first corner speed check gains +30 km/h.`

**Update Note:**  
Both the acceleration and corner-check bonus are increased slightly to keep this card competitive after Accelerate became `+40 km/h`.

---

## 10. Trail Braking

**Requirement:** Max 60  
**Type:** Brake  
**Timing:** Drive  

**Updated Effect:**  
`Before each corner speed check this turn, you may reduce Speed by 10 km/h.`

**Update Note:**  
No change. This is already valuable because it gives precise speed control during movement.

---

## 11. Full Countersteer

**Requirement:** Any  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`If you would understeer this turn, you may cancel that understeer once.`

**Update Note:**  
No change. Higher acceleration makes this card naturally more valuable.

---

## 12. Throttle Control

**Requirement:** Any  
**Type:** Gas  
**Timing:** Drive  

**Updated Effect:**  
`Once this turn, after moving into a corner speed check space, you may choose Speed +10 km/h or Speed -10 km/h.`

**Update Note:**  
No change. This card is about fine control, not raw acceleration.

---

## 13. Exit Drift

**Requirement:** Max 80  
**Type:** Gas  
**Timing:** After  

**Updated Effect:**  
`If you moved through at least 1 corner speed check space this turn, Speed +30 km/h.`

**Update Note:**  
Increased from `+20 km/h` to `+30 km/h` so successful corner-exit rewards remain meaningful.

---

## 14. Drift Extend

**Requirement:** Max 80  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`Your first corner speed bonus this turn also applies to the next corner speed check this turn.`

**Update Note:**  
No direct value change. This card scales naturally with the increased corner-bonus values.

---

## 15. Gutter Boost

**Requirement:** Max 60  
**Type:** Gas  
**Timing:** After  

**Updated Effect:**  
`If you ended movement in the inner lane of a corner, Speed +30 km/h.`

**Update Note:**  
Increased from `+20 km/h` to `+30 km/h`.

---

## 16. Blind Attack

**Requirement:** Min 50  
**Type:** Turn  
**Timing:** Before  

**Updated Effect:**  
`If you are the following car and in the same lane as the lead car, ignore blocking once this turn.`

**Update Note:**  
No change.

---

## 17. Jump Start Exit

**Requirement:** Max 40  
**Type:** Gas  
**Timing:** After  

**Updated Effect:**  
`If you moved from inner lane to outer lane this turn, Speed +40 km/h.`

**Update Note:**  
Increased from `+30 km/h` to `+40 km/h` because the condition is strict and represents a strong corner exit.

---

# 3. AWD Grip Set — Yellow Porsche 911

## 18. Grip Acceleration

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +20 km/h. If you are not in a corner, you may discard 1 card from hand.`

**Update Note:**  
Changed from smaller split acceleration to a clean controlled acceleration plus cycling. AWD remains steady rather than explosive.

---

## 19. Early Power

**Requirement:** Max 70  
**Type:** Gas  
**Timing:** After  

**Updated Effect:**  
`If you passed all corner speed checks this turn, Speed +30 km/h.`

**Update Note:**  
Increased from `+20 km/h` to `+30 km/h` as a clean-driving reward.

---

## 20. Traction Control

**Requirement:** Any  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`If you would understeer this turn, reduce your speed by 10 km/h instead. Then cancel that understeer.`

**Update Note:**  
No change. Higher acceleration makes understeer prevention more valuable.

---

## 21. Grip Line

**Requirement:** Max 70  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`+10 km/h to all corner speed limit calculations this turn. If you stay in the same lane during movement, you may discard 1 card from hand.`

**Update Note:**  
The previous `draw 1 card` reward is replaced with optional discard cycling.

---

## 22. Balanced Chassis

**Requirement:** Any  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`Once this turn, after a speed check, you may move sideways without spending movement.`

**Update Note:**  
No change.

---

## 23. Torque Split

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Choose one: Speed +20 km/h, or +30 km/h to your next corner speed check this turn.`

**Update Note:**  
Increased from `Speed +10 km/h` / `+20 km/h to check` to keep the card relevant under the new acceleration scale.

---

## 24. Micro Correction

**Requirement:** Any  
**Type:** Turn  
**Timing:** Step  

**Updated Effect:**  
`During movement, move sideways. This does not cost movement if your speed is 80 km/h or lower.`

**Update Note:**  
No change.

---

## 25. Line Lock

**Requirement:** Max 80  
**Type:** Turn  
**Timing:** Drive  

**Updated Effect:**  
`Choose your lane. While you remain in that lane this turn, all corner speed checks gain +30 km/h.`

**Update Note:**  
Increased from `+20 km/h` to `+30 km/h` because it requires lane commitment.

---

# 4. Muscle Car Set — Blue Mustang GT500 with Black Stripes

## 26. Raw Horsepower

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +40 km/h. You may only move forward this turn. If you are on a straight, Speed +10 km/h again.`

**Update Note:**  
Because common Accelerate is now `+40 km/h`, Raw Horsepower gains a straight-road bonus while keeping the forward-only restriction.

---

## 27. Straight-Line Monster

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`If you are on a straight, Speed +50 km/h. Otherwise, Speed +20 km/h and your first corner speed check this turn gets -10 km/h.`

**Update Note:**  
Muscle Cars should exceed the common acceleration benchmark when the condition fits their specialty.

---

## 28. Wide Open Throttle

**Requirement:** Min 60  
**Type:** Gas  
**Timing:** Drive  

**Updated Effect:**  
`After each forward movement on a straight, Speed +10 km/h. This can trigger up to twice this turn.`

**Update Note:**  
No change. This already scales with long straight movement and forward commitment.

---

## 29. Torque Monster

**Requirement:** Max 80  
**Type:** Gas  
**Timing:** Before  

**Updated Effect:**  
`Speed +30 km/h. This turn, when your forward space is occupied, the blocking car loses 10 km/h. You may then stop moving or move sideways if possible.`

**Update Note:**  
No change. This card is below common Accelerate because it also gives contact pressure.

---

## 30. Shove Aside

**Requirement:** Min 40  
**Type:** Attack  
**Timing:** Step  

**Updated Effect:**  
`Move the blocking car 1 lane outward if possible. If it moves, you may enter the space it left. If it cannot move, both cars suffer collision and you stop moving.`

**Update Note:**  
No change. This follows the no-shared-space attack rule.

---

## 31. Overpower

**Requirement:** Min 60  
**Type:** Attack  
**Timing:** Step  

**Updated Effect:**  
`The blocking car loses 1 Gear. You lose 10 km/h and stop moving.`

**Update Note:**  
No change.

---

## 32. Door Slam

**Requirement:** Max 70  
**Type:** Attack  
**Timing:** Step  

**Updated Effect:**  
`That car loses 10 km/h. If it is in the outer lane, it loses 20 km/h instead.`

**Update Note:**  
No change.

---

## 33. No Room

**Requirement:** Any  
**Type:** Attack  
**Timing:** Drive  

**Updated Effect:**  
`Adjacent opponents cannot move sideways into your lane this turn.`

**Update Note:**  
No change.

---

# Additional New Common Card

This card was requested as a new normal Brake card. It is not part of the original 33 image-requested cards above.

## Brake

**Requirement:** Any  
**Type:** Brake  
**Timing:** Before  

**Effect:**  
`Speed -20 km/h. You may discard 1 card from hand.`

**Role:**  
A normal Brake card that reduces speed less than Hard Brake, but gives beneficial hand cycling.

---

# Updated Design Scale

## Speed Change Scale

| Value | Meaning |
|---:|---|
| ±10 km/h | fine adjustment / technical tuning |
| ±20 km/h | controlled acceleration or normal braking |
| ±30 km/h | strong braking, strong corner reward, or conditional acceleration |
| ±40 km/h | standard strong Gas acceleration |
| ±50 km/h | rare archetype specialty or heavily conditional effect |

## Corner Support Scale

| Bonus | Meaning |
|---:|---|
| +10 km/h | small handling bonus |
| +20 km/h | normal handling bonus |
| +30 km/h | strong handling bonus |
| +40 km/h | rare, car-specific, or heavily conditional support |

## Discard Scale

| Discard Amount | Meaning |
|---:|---|
| Discard 1 card | beneficial cycling |
| Discard 2 cards | strong beneficial cycling |
| Discard 3+ cards | cost / penalty |

---

# Count Check

This file contains the updated information for the **33 previously listed player race cards**:

| Category | Count |
|---|---:|
| Common / AE86 cards | 8 |
| Drift / Huracán cards | 9 |
| AWD Grip / Porsche cards | 8 |
| Muscle / Mustang cards | 8 |
| **Total** | **33** |

The new normal **Brake** card is included as an additional card after the main 33-card list.

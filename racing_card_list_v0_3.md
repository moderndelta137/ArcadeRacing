# Racing Card List v0.3

Authoritative source: `racing_cards.csv`.

This document is generated from the current CSV card list. When card names, requirements, timings, effects, implementation flags, deck codes, or internal serial numbers change, update `racing_cards.csv` first, then sync this document.

---

## Serial Number Rule

Each card has a lower-left number-plate label showing car/deck name and a shortened printed plate serial.

Plate visual rule:

- Position: lower-left, overlapping the lower effect panel but clear of the outer frame.
- Tilt: flat 2D clockwise tilt, about 5-8 degrees; left side higher than right side.
- Visible size on a 1060 x 1484 card: about 210-235 px wide and 86-100 px tall.
- Layout: first line = car/deck name; second line = large printed serial; decorative text must not overlap either line.
- AE86 deck plate: Japanese-style black carbon plate, rounded border, white text, no red decoration circle.

Printed plate serial format:

> `{CC}-{NN}`

`CC` is a two-character car code, preferably numeric when the car identity has a clear number. `NN` is the two-digit order of that card inside its car/deck list, starting at `01`. Do not renumber published cards. If a card is removed, leave the old number unused. New cards take the next unused number in that deck.

| Deck / car | Deck code |
|---|---|
| Common / Starter and Balance Cards - Bright Red AE86 | `AE86` |
| RWD Drift Set - Bright Green Lamborghini Huracan | `HRCN` |
| AWD Grip Set - Yellow Porsche 911 | `P911` |
| Muscle Car Set - Blue Mustang GT500 with Black Stripes | `GT500` |

| Internal deck code | Printed car code | Printed serial range |
|---|---|---|
| `AE86` | `86` | `86-01` to `86-08` |
| `HRCN` | `63` | `63-01` to `63-08` |
| `P911` | `91` | `91-01` to `91-08` |
| `GT500` | `50` | `50-01` to `50-08` |

## Current Internal Card Serials

| Serial | Card | Deck / car | Implemented |
|---|---|---|---|
| `AE86-01` | Drift | Common / Starter Cards - Bright Red AE86 | Yes |
| `AE86-02` | Full throttle | Common / Starter Cards - Bright Red AE86 | Yes |
| `AE86-03` | Back down | Common / Starter Cards - Bright Red AE86 | Yes |
| `AE86-04` | Hard Brake | Balance set / Starter Cards - Bright Red AE86 | Yes |
| `AE86-05` | Change Lane | Balance set / Starter Cards - Bright Red AE86 | Yes |
| `AE86-06` | Early Brake Cornering | Balance set / Starter Cards - Bright Red AE86 | Yes |
| `AE86-07` | Rocket Start | Balance set / Starter Cards - Bright Red AE86 | Yes |
| `AE86-08` | Change Shift | Balance set / Starter Cards - Bright Red AE86 | Yes |
| `HRCN-01` | Clutch Kick | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-02` | Trail Braking | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-03` | Full Countersteer | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-04` | Exit Drift | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-05` | Drift Extend | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-06` | Gutter Boost | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-07` | Blind Attack | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `HRCN-08` | Jump Exit | RWD Drift set - Bright Green Lamborghini Huracan | Yes |
| `P911-01` | Progressive Acceleration | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-02` | Early Power | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-03` | Traction Control | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-04` | Grip Line | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-05` | Balanced Chassis | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-06` | Torque Split | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-07` | Micro Correction | AWD Grip Set - Yellow Porsche 911 | Yes |
| `P911-08` | Line Lock | AWD Grip Set - Yellow Porsche 911 | Yes |
| `GT500-01` | Raw Horsepower | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-02` | Straight-Line Monster | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-03` | Panic Stop | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-04` | Chrome Bumper | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-05` | Shove Aside | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-06` | Burn Rubber | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-07` | Door Slam | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |
| `GT500-08` | No Room | Muscle Car Set - Blue Mustang GT500 with Black Stripes | Yes |

---

# Common / Starter and Balance Cards - Bright Red AE86

## AE86-01. Drift

**Requirement:** Max 70  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`+30 km/h to the speed check this turn.`

**Role:**  
line control / cornering card for Bright Red AE86.

---
## AE86-02. Full throttle

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed +40 km/h.`

**Role:**  
speed gain / acceleration card for Bright Red AE86.

---
## AE86-03. Back down

**Requirement:** Any  
**Type:** Brake  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed -20 km/h. Discard 1 card.`

**Role:**  
speed control / braking card for Bright Red AE86.

---
## AE86-04. Hard Brake

**Requirement:** Min 50  
**Type:** Brake  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed -50 km/h.`

**Role:**  
speed control / braking card for Bright Red AE86.

---
## AE86-05. Change Lane

**Requirement:** Any  
**Type:** Turn  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Move to the other lane. Discard 1 card.`

**Role:**  
line control / cornering card for Bright Red AE86.

---
## AE86-06. Early Brake Cornering

**Requirement:** Max 110  
**Type:** Turn  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed -20 km/h. Move to the inner lane.`

**Role:**  
line control / cornering card for Bright Red AE86.

---
## AE86-07. Rocket Start

**Requirement:** Max 50  
**Type:** Gas  
**Timing:** After  
**Implemented:** Yes  

**Effect:**  
`Speed +50 km/h. You may discard 2 cards.`

**Role:**  
speed gain / acceleration card for Bright Red AE86.

---
## AE86-08. Change Shift

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed +10 km/h or -10 km/h. You may then play another card.`

**Role:**  
speed gain / acceleration card for Bright Red AE86.

---

# RWD Drift Set - Bright Green Lamborghini Huracan

## HRCN-01. Clutch Kick

**Requirement:** Min 60  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed +20 km/h. This turn, your first speed check gains +50 km/h.`

**Role:**  
speed gain / acceleration card for Bright Green Lamborghini Huracan.

---
## HRCN-02. Trail Braking

**Requirement:** Max 80  
**Type:** Brake  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`Before each speed check this turn, you may reduce Speed by 10 km/h.`

**Role:**  
speed control / braking card for Bright Green Lamborghini Huracan.

---
## HRCN-03. Full Countersteer

**Requirement:** Any  
**Type:** Turn  
**Timing:** Step  
**Implemented:** Yes  

**Effect:**  
`If you would understeer this turn, discard 1 card and cancel that understeer once.`

**Role:**  
line control / cornering card for Bright Green Lamborghini Huracan.

---
## HRCN-04. Exit Drift

**Requirement:** Max 60  
**Type:** Gas  
**Timing:** After  
**Implemented:** Yes  

**Effect:**  
`If you moved through at least 1 speed check space this turn, Speed +30 km/h.`

**Role:**  
speed gain / acceleration card for Bright Green Lamborghini Huracan.

---
## HRCN-05. Drift Extend

**Requirement:** Max 80  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`If you gain corner speed bonus last turn, it also applies to the speed check this turn.`

**Role:**  
line control / cornering card for Bright Green Lamborghini Huracan.

---
## HRCN-06. Gutter Boost

**Requirement:** Max 80  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`If you are on the inner lane, +50 km/h to the corner speed limit calculation.`

**Role:**  
line control / cornering card for Bright Green Lamborghini Huracan.

---
## HRCN-07. Blind Attack

**Requirement:** Min 50  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`Discard all cards in your hand. If you get blocked, move to the other lane and gain 1 move point.`

**Role:**  
line control / cornering card for Bright Green Lamborghini Huracan.

---
## HRCN-08. Jump Exit

**Requirement:** Max 30  
**Type:** Gas  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`You have 4 move points this turn regardless of your gear, ignore the corner speed limit.`

**Role:**  
speed gain / acceleration card for Bright Green Lamborghini Huracan.

---

# AWD Grip Set - Yellow Porsche 911

## P911-01. Progressive Acceleration

**Requirement:** Any  
**Type:** Gas  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`After each move this turn, Speed +10 km/h.`

**Role:**  
speed gain / acceleration card for Yellow Porsche 911.

---
## P911-02. Early Power

**Requirement:** Max 60  
**Type:** Gas  
**Timing:** After  
**Implemented:** Yes  

**Effect:**  
`If you passed all speed checks this turn, Speed +40 km/h.`

**Role:**  
speed gain / acceleration card for Yellow Porsche 911.

---
## P911-03. Traction Control

**Requirement:** Any  
**Type:** Brake  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`If you would understeer this turn, reduce your speed by 20 km/h and cancel that understeer.`

**Role:**  
speed control / braking card for Yellow Porsche 911.

---
## P911-04. Grip Line

**Requirement:** Max 60  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`+20 km/h to the speed check this turn. Discard 1 card.`

**Role:**  
line control / cornering card for Yellow Porsche 911.

---
## P911-05. Balanced Chassis

**Requirement:** Any  
**Type:** Turn  
**Timing:** Step  
**Implemented:** Yes  

**Effect:**  
`Once this turn, you may move sideways by discard 1 card.`

**Role:**  
line control / cornering card for Yellow Porsche 911.

---
## P911-06. Torque Split

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Choose one: Speed +30 km/h, or +40 km/h to the speed check this turn.`

**Role:**  
speed gain / acceleration card for Yellow Porsche 911.

---
## P911-07. Micro Correction

**Requirement:** Any  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`After each speed check this turn, you may choose Speed +10 km/h or Speed -10 km/h.`

**Role:**  
line control / cornering card for Yellow Porsche 911.

---
## P911-08. Line Lock

**Requirement:** Max 60  
**Type:** Turn  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`While you remain in your current lane , all speed checks gain +30 km/h this turn.`

**Role:**  
line control / cornering card for Yellow Porsche 911.

---

# Muscle Car Set - Blue Mustang GT500 with Black Stripes

## GT500-01. Raw Horsepower

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`Speed +50 km/h. You may only move forward this turn.`

**Role:**  
speed gain / acceleration card for Blue Mustang GT500 with Black Stripes.

---
## GT500-02. Straight-Line Monster

**Requirement:** Any  
**Type:** Gas  
**Timing:** Before  
**Implemented:** Yes  

**Effect:**  
`If you are on a straight, Speed +40 km/h. Otherwise, Speed +20 km/h`

**Role:**  
speed gain / acceleration card for Blue Mustang GT500 with Black Stripes.

---
## GT500-03. Panic Stop

**Requirement:** Any  
**Type:** Brake  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`Speed -80km/h. Discard all cards from hand.`

**Role:**  
speed control / braking card for Blue Mustang GT500 with Black Stripes.

---
## GT500-04. Chrome Bumper

**Requirement:** Min 60  
**Type:** Attack  
**Timing:** Step  
**Implemented:** Yes  

**Effect:**  
`When you get blocked, discard 1 card, then the blocking car loses 40 km/h.`

**Role:**  
blocking, contact, or lane pressure card for Blue Mustang GT500 with Black Stripes.

---
## GT500-05. Shove Aside

**Requirement:** Min 80  
**Type:** Attack  
**Timing:** Step  
**Implemented:** Yes  

**Effect:**  
`Move the blocking car to the other lane. You may enter the space it left. If it cannot move, both cars spin-off.`

**Role:**  
blocking, contact, or lane pressure card for Blue Mustang GT500 with Black Stripes.

---
## GT500-06. Burn Rubber

**Requirement:** Any  
**Type:** Gas  
**Timing:** After  
**Implemented:** Yes  

**Effect:**  
`If you overtake this turn, Speed +60 km/h. Discard all cards.`

**Role:**  
speed gain / acceleration card for Blue Mustang GT500 with Black Stripes.

---
## GT500-07. Door Slam

**Requirement:** Min 80  
**Type:** Attack  
**Timing:** Step  
**Implemented:** Yes  

**Effect:**  
`Move to the other lane. If you get blocked the blocking car loses 20 km/h and all his remaining move points.`

**Role:**  
blocking, contact, or lane pressure card for Blue Mustang GT500 with Black Stripes.

---
## GT500-08. No Room

**Requirement:** Min 60  
**Type:** Attack  
**Timing:** Drive  
**Implemented:** Yes  

**Effect:**  
`Other cars cannot move into your lane until next turn.`

**Role:**  
blocking, contact, or lane pressure card for Blue Mustang GT500 with Black Stripes.

---

# Count Check

| Set | Cards | Implemented |
|---|---:|---:|
| Common / Starter and Balance Cards - Bright Red AE86 | 8 | 8 |
| RWD Drift Set - Bright Green Lamborghini Huracan | 8 | 8 |
| AWD Grip Set - Yellow Porsche 911 | 8 | 8 |
| Muscle Car Set - Blue Mustang GT500 with Black Stripes | 8 | 8 |
| **Total** | **32** | **32** |

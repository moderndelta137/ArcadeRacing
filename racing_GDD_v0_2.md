# Mountain Chase: Drift Duel Game Design Document

Game title: **山道疾走：ドリフトデュエル Mountain Chase: Drift Duel**  
Short English title: **Mountain Chase: Drift Duel**  
Tagline: **Tactical Drift Card Battles**  
Version: **GDD v0.3 working update**

---

## 1. Game Overview

**Mountain Chase: Drift Duel** is a 1v1 arcade mountain-racing card game about speed control, lane positioning, drifting, braking, slipstreaming, and overtaking.

Players race on a track built from a shared **Road Deck**. Each player controls one car miniature and uses a personal deck of **Driving Cards** to accelerate, brake, turn, drift, and control their racing line.

The game focuses on the feeling of touge and arcade racing games: stylish cornering, risky speed management, mountain-road pressure, and dramatic overtakes.

The central question every turn is:

> Can I go faster, or do I need to control my speed before the next corner?

---

## 2. Player Count and Modes

The base game is designed as:

- **2 players**

The current browser prototype supports:

- **VS AI Racers**: 1 human player versus CPU.
- **Local 2 Player**: two players sharing one device.
- **Online 2 Player**: host / guest room-key matchmaking.

Future expansions may support more players, but the prototype rules assume 1v1 racing.

---

## 3. Win Condition

The first player whose car enters the **Goal space** wins immediately.

The Goal card is always the final card of the Road Deck.

---

## 4. Components

### 4.1 Shared Components

- Road Deck
- Goal card
- Road cards
- Speed-limit markers printed on road spaces
- Guardrail / no-guardrail indicators printed on road cards
- Track direction markers, such as uphill / downhill direction
- Optional global condition cards, such as Rain or Fog, for future expansion
- Course selection cards or course reference panels for named routes
- Card Codex / reference archive in the digital prototype

### 4.2 Player Components

Each player has:

- 1 car miniature
- 1 personal Driving Deck
- 1 discard pile
- 1 hand of cards
- 1 Speed Meter Card
- 1 Needle Card
- 1 car profile card
- Optional car parts for advanced rules

The digital prototype also uses car portraits, car cutouts, implemented card art, generated course backgrounds, and a circular speed-meter HUD asset.

---

## 4A. Speed Meter Card System

Each player tracks current speed with a simple 2-card physical dial.

The system uses:

1. **Speed Meter Card**
2. **Needle Card**

The Speed Meter Card is placed on the table. The Needle Card is placed on top of it and rotated so the printed needle points to the current speed.

This allows the game to use a speed dial without requiring a plastic spinner, rivet, wheel, or custom component.

---

### 4A.1 Speed Meter Card

The Speed Meter Card shows the car's speed scale.

It should include:

- A semicircle speed gauge
- Speed numbers from 0 to 140 km/h
- Clear tick marks for speed values
- Gear bands on the inner arc
- Gear labels or icons from Gear 1 to Gear 5
- A consistent pivot point for the Needle Card

The important speed information should be concentrated in the exposed arc area, because part of the Speed Meter Card will be covered by the Needle Card.

Recommended major marks:

| Mark | Meaning |
|---:|---|
| 0 | stopped / lowest speed |
| 20 | maximum of 1st Gear |
| 50 | maximum of 2nd Gear |
| 80 | maximum of 3rd Gear |
| 110 | maximum of 4th Gear |
| 140 | maximum speed / maximum of 5th Gear |

The card may also show intermediate values such as 10, 30, 40, 60, 70, 90, 100, 120, and 130 for precise card effects.

---

### 4A.2 Needle Card

The Needle Card is a separate card placed over the Speed Meter Card.

It should include:

- A visible needle, preferably red or another high-contrast color
- A clear base or pivot point
- Enough blank area to cover unused parts of the Speed Meter Card
- Rounded card corners matching the other game cards

The player rotates the Needle Card so the needle points at the car's current speed.

The Needle Card should be easy to rotate and read, but should not hide the current speed number or Gear band.

---

### 4A.3 Reading Current Speed and Gear

To read speed:

1. Look at where the needle points on the Speed Meter Card.
2. The pointed number is the car's current speed.
3. The inner Gear band at that speed shows the current Gear.
4. The current Gear determines movement points.

Example:

- Needle points to 40 km/h.
- 40 km/h is in 2nd Gear.
- The car receives 2 movement points.

---

### 4A.4 Updating Speed

Whenever a rule changes speed, rotate the Needle Card to the new speed.

Examples:

- `Speed +40 km/h`: rotate the needle 40 km/h higher.
- `Speed -30 km/h`: rotate the needle 30 km/h lower.
- Collision: rotate the needle to the maximum speed of the next lower Gear.
- Spin-off: rotate the needle to the maximum speed of the Gear two levels lower.

Speed cannot go below 0 km/h.

Speed cannot exceed 140 km/h in the prototype.

---

### 4A.5 Recommended Speed Meter Graphic Design

For readability, the Speed Meter Card should clearly show both speed and Gear.

Recommended design:

- Outer arc: speed numbers and tick marks
- Inner arc: Gear zones
- Gear zones labeled `G1`, `G2`, `G3`, `G4`, `G5`
- Strong separators between Gear zones
- Large numbers at 0, 20, 50, 80, 110, and 140
- Smaller numbers or ticks every 10 km/h
- A visual style matching the racing theme, such as black dashboard, white speed marks, red needle, and colored Gear bands

For colorblind accessibility, Gear zones should not rely only on color. They should also use labels, different line patterns, or separator marks.

---

## 5. Key Concepts

### 5.1 Speed

Each car has a current speed shown by its Speed Meter Card and Needle Card.

Speed persists between turns.

A car's speed changes only when a card, collision, spin-off, road effect, car ability, or other rule changes it.

### 5.2 Gear

Speed is divided into **Gears**.

Each Gear determines how many movement points the car receives when it moves.

The base Gear table is:

| Gear | Speed Range | Movement Points |
|---|---:|---:|
| 1st Gear | 0–20 km/h | 1 |
| 2nd Gear | 30–50 km/h | 2 |
| 3rd Gear | 60–80 km/h | 3 |
| 4th Gear | 90–110 km/h | 4 |
| 5th Gear | 120–140 km/h | 5 |

The prototype maximum speed is **140 km/h**.

Future cars may have unique Gear tables.

### 5.3 Movement Points

A car receives movement points based on its current Gear.

Movement points are calculated immediately before movement begins, after:

1. Before effects
2. Slipstream bonus, if applicable
3. Any other pre-movement speed changes

Once movement points are calculated, the car spends those points to move.

### 5.4 Lanes

Most road cards have 2 lanes:

- Inner lane
- Outer lane

On corner cards, the inner lane and outer lane depend on the direction of the corner.

The inner lane is shorter, but usually has more speed-limit spaces.

The outer lane is longer, but usually has fewer speed-limit spaces and allows later braking.

The ideal racing line is often:

> outer lane → inner lane → outer lane

This is called the **out-in-out** line.

### 5.5 Front Line

Each road space has an implied or printed **front line**.

The car whose occupied space has the furthest front line is considered ahead.

This is used to determine:

- Lead player
- Following player
- Neck-and-neck state
- Overtaking

On corners, one inner lane space may be adjacent to up to two outer lane spaces.

If two spaces are adjacent, the cars may be neck and neck.

If one adjacent outer lane space has a further front line, that outer lane space is considered ahead.

---

## 6. Driving Cards

Each player has a personal Driving Deck.

Driving Cards represent acceleration, braking, turning, drifting, gear control, racing lines, and special driving techniques.

---

## 7. Driving Card Types

There are four current card types:

1. Gas
2. Brake
3. Turn
4. Attack

---

### 7.1 Gas Cards

Gas cards are used to increase speed, maintain momentum, or trigger acceleration effects.

Examples:

- Full throttle
- Rocket Start
- Change Shift

---

### 7.2 Brake Cards

Brake cards are used to reduce speed, prepare for corners, or recover from danger.

Examples:

- Hard Brake
- Back down
- Panic Stop
- Early Brake Cornering

---

### 7.3 Turn Cards

Turn cards are used for lane changes, cornering, drifting, and racing line control.

Examples:

- Drift
- Change Lane
- Gutter Boost

---

### 7.4 Attack Cards

Attack cards are used for blocking pressure, contact pressure, and lane denial.

Examples:

- Chrome Bumper
- Shove Aside
- Door Slam

---

## 8. Card Information

Each Driving Card has the following information:

1. Card name
2. Deck / car name
3. Serial number
4. Speed requirement
5. Card type
6. Timing
7. Effect

---

### 8.1 Speed Requirement

A card may have one of the following speed requirements:

- No Requirement
- Min speed requirement
- Max speed requirement

Examples:

| Requirement Text | Meaning |
|---|---|
| No Requirement | The card may be played at any speed |
| Min 30 km/h | The car must be at 30 km/h or higher |
| Max 60 km/h | The car must be at 60 km/h or lower |

Speed requirements are checked **at the moment the card is played**.

Speed requirements are checked before any card effect resolves.

Example:

If a card says `Max 50 km/h`, a player at 60 km/h cannot play that card, even if the card would reduce speed as part of its effect.

---

### 8.2 Deck Name and Serial Number

Each Driving Card belongs to a deck / car identity. The card face shows this identity in a small tilted number-plate label at the lower-left.

The plate uses:

- First line: car / deck name
- Second line: shortened printed plate serial
- Flat 2D number-plate treatment, not perspective skew
- Clockwise tilt of about 5-8 degrees, meaning the left side is higher than the right side
- Compact visible plate size around 210-235 px wide and 86-100 px tall on a 1060 x 1484 card
- No overlap between car/deck name, large serial, and decorative plate text

Printed plate serial format:

> `{CC}-{NN}`

`CC` is a two-character car code, preferably numeric when the car identity has a clear number. `NN` is the two-digit order of that card inside its car/deck list, starting at `01`.

Do not renumber published cards. If a card is removed, leave the old number unused. New cards take the next unused number in that deck.

Prototype deck codes:

| Deck / car | Internal deck code | Printed car code | Printed serial range |
|---|---|---|---|
| Bright Red AE86 starter/balance cards | `AE86` | `86` | `86-01` to `86-08` |
| RWD Drift set - Bright Green Lamborghini Huracan | `HRCN` | `63` | `63-01` to `63-08` |
| AWD Grip Set - Yellow Porsche 911 | `P911` | `91` | `91-01` to `91-08` |
| Muscle Car Set - Blue Mustang GT500 with Black Stripes | `GT500` | `50` | `50-01` to `50-08` |

The plate is cosmetic and has no gameplay effect.

For visual direction, each car/deck may use a different regional plate design. The AE86 starter/balance deck uses a Japanese-style black carbon plate with white text, first line `AE86`, and large printed serial such as `86-01`.

---

## 9. Card Timing

Card effects use four timing labels:

1. Before
2. Drive
3. Step
4. After

---

### 9.1 Before

A Before effect resolves before movement points are calculated.

Before effects often change speed or lane position.

Example:

> Speed +40 km/h.

---

### 9.2 Drive

A Drive effect is active during the whole movement.

Drive effects often modify cornering, speed-limit checks, or driving style.

Example:

> During this movement, treat corner speed limits as +30 km/h.

---

### 9.3 Step

A Step effect triggers during a specific movement step.

Step effects are useful for effects that happen once during movement.

Example:

> During one movement step, move to the inner lane.

---

### 9.4 After

An After effect resolves after all movement for that turn ends.

After effects may change speed, draw cards, reposition the car, or prepare for the next turn.

Important:

> After effects that increase speed do not cause speed-limit checks by themselves.

Speed-limit checks happen only when a car moves into a speed-limit space.

---

## 10. Deck Construction

For the prototype:

- Each player uses a 12-card deck.
- Each player starts with a hand of 4 cards.
- Up to 4 copies of the same card are allowed.
- Suggested starter ratio: 4 Gas / 4 Brake / 4 Turn.
- This ratio is not mandatory.
- Both players may use identical starter decks.
- Each car may later provide unique cards that can be combined with common cards.

---

## 11. Drawing and Reshuffling

At the end of a player's turn, that player draws until they have 4 cards in hand.

If a player needs to draw and their deck is empty:

1. Shuffle their discard pile.
2. Form a new deck.
3. Continue drawing.

---

## 12. Unplayable Hand Rule

On a player's turn, they must play 1 valid card if possible.

If the player has no valid card in hand, they may:

1. Reveal that they have no valid card if necessary.
2. Discard any number of cards from their hand.
3. Skip playing a card.
4. Continue to movement using their current speed.
5. Draw back up to 4 cards at the end of the turn.

This allows the player to refresh their hand while still moving.

---

## 13. Road Deck

The Road Deck is shared by all players.

It represents the race track.

---

### 13.1 Road Deck Structure

For the physical prototype:

- The Road Deck contains 10 road cards.
- The final card is always the Goal card.
- Suggested ratio: 3 straight cards / 7 corner cards.
- Roads cannot branch.
- The race direction is fixed.
- Each road card has a direction marker, such as uphill or downhill.
- If the race is a downhill race, cards must be placed in the downhill direction.
- If the race is an uphill race, cards must be placed in the uphill direction.

The lead player reveals and connects road cards, but does not choose their orientation freely.

The lead player is maintaining the road, not controlling the track.

For the current browser prototype:

- The track begins with a **Start Straight** and ends with a **Finish Straight** containing the Goal space.
- Between those fixed pieces, the game generates a route from weighted road-card families.
- The generator avoids immediately repeating the same road-card family.
- The generator retries layouts that would visually overlap earlier track sections.
- Named courses use fixed seeds and course lengths so the same route can be replayed.
- The Wildcard Route uses a selectable size and variable seed/background.

Current course options:

| Course | Region | Difficulty | Length | Generated road-card count |
|---|---|---|---|---:|
| Akagi Redline | Gunma | Technical | Short | 5 |
| Haruna Skyline | Gunma | Balanced | Medium | 8 |
| Hakone Turnpike | Kanagawa | High Speed | Long | 12 |
| Wildcard Route | Unknown | Variable | Small / Medium / Long | 5 / 8 / 12 |

---

### 13.2 Revealed Road Cards

In the tabletop rules, at the start of the game, reveal and connect the first 3 road cards.

During the race:

> The lead player reveals and connects 1 road card when there are fewer than 3 unreached road cards ahead of the players.

This keeps about 3 road cards visible ahead so players can plan.

In the browser prototype, the full generated route is visible as a top-down board. The design intent is still the same: the player should be able to read upcoming corners and decide whether to accelerate, brake, or set up their racing line.

---

## 14. Road Card Layout

Each road card is divided into spaces.

Most road cards have two lanes.

Road cards may include:

- Straight spaces
- Corner spaces
- Inner lane spaces
- Outer lane spaces
- Speed-limit spaces
- Guardrail edges
- No-guardrail edges
- Front-line indicators
- Direction markers

---

## 14A. Road Card Visual Structure

Road cards are designed so the rules can be read directly from the board state.

The current prototype road cards use the following visual language:

- The road is drawn as a 2-lane segment.
- Each lane is divided into movement spaces.
- Corner cards have an inner lane and an outer lane.
- The outer lane has more spaces than the inner lane.
- Speed-limit check spaces are marked in red.
- Speed-limit numbers are printed next to the corner.
- The center line helps players read the road direction.

A player checks speed only when their car moves into a red marked speed-limit check space.

---

### 14A.1 Recommended Printed Road Elements

| Element | Purpose |
|---|---|
| Lane spaces | Shows where cars can move |
| Center line | Separates the two lanes and helps read road direction |
| Red marked spaces | Shows where speed-limit checks happen |
| Speed-limit sign | Shows the maximum safe speed for the marked area |
| Guardrail edge | If understeer reaches this edge, collision occurs |
| Open edge / no guardrail | If understeer reaches this edge, spin-off occurs |
| Front-line marks | Determines who is ahead, neck-and-neck, or blocking |
| Direction marker | Shows fixed uphill or downhill placement direction |

For prototype clarity, speed-limit check spaces should be marked with red shading.

Recommended visual treatment:

- Red shading for speed-limit check spaces
- A repeated warning icon or small `!` / `⚠` mark
- Speed-limit number printed nearby, such as `40`, `50`, or `80`
- A clear outer edge line showing guardrail or no guardrail
- Visible lane boundary / center line

Speed-limit check spaces should not rely only on color. Use both color and icons/patterns where possible.

---

### 14A.2 Corner Road Cards

Corner road cards are the main tactical feature of the track.

A corner road card usually has:

- One inner lane
- One outer lane
- A speed-limit sign printed next to the corner
- Red marked speed-limit check spaces
- More spaces on the outer lane than the inner lane
- More speed-limit check spaces on the inner lane than the outer lane
- Guardrail or no-guardrail information on the outer edge

The inner lane is shorter, so it can help a player overtake or defend position.

The outer lane is longer, but safer because it usually has fewer speed-limit check spaces and allows later braking.

---

### 14A.3 Speed-Limit Signs and Check Areas

A corner card may show one or more speed-limit signs next to the corner.

The speed-limit sign shows the maximum safe speed for the red marked check areas.

Examples:

- A sign showing `40` means the red check spaces in that corner have a speed limit of 40 km/h.
- A sign showing `50` means the red check spaces in that corner have a speed limit of 50 km/h.

The red marked spaces are the actual spaces that trigger speed checks.

Important:

> The speed-limit sign itself does not trigger a check.  
> A check happens only when a car moves into a marked speed-limit check space.

If a road card has multiple speed-limit signs, each sign should clearly point to the check area it controls.

---

### 14A.4 Prototype Road Card Families

The current browser prototype uses `racing_corner_cards.csv` when available, with these fallback road-card families:

| Road-card family | Shape | Entry / exit spaces | Inner / outer spaces | Speed limit |
|---|---|---:|---:|---:|
| Sweeper | Single 70 degree curve | 1 / 2 | 3 / 4 | 80 km/h |
| Hairpin | Single 180 degree curve | 3 / 2 | 3 / 5 | 40 km/h |
| Chicane | Two opposite 45 degree curves | 2 / 1 | 2 / 3 each curve | 60 km/h |
| Increasing Radius | Tight 45 degree curve into wider 45 degree curve | 1 / 3 | 2 / 3, then 3 / 4 | 50 then 70 km/h |
| Decreasing Radius | Wider 45 degree curve into tight 45 degree curve | 3 / 1 | 3 / 4, then 2 / 3 | 70 then 50 km/h |
| Double Apex | 65 degree curve, 1 straight space, 65 degree curve | 2 / 0 | 2 / 3 each curve | 50 km/h |
| 90 Degree Corner | Single 90 degree curve | 1 / 1 | 2 / 3 | 60 km/h |
| Straight | 5 to 7 straight spaces | 0 / 0 | same lane length | none |

Curve direction may be random, repeated, or opposite depending on the family. Outer-lane speed-limit checks begin later on asymmetric corners, preserving the tabletop principle that the outer lane is longer but safer.

Legacy paper-prototype guidance:

#### Gentle Corner

Recommended features:

- Speed limit around 50–80 km/h
- Inner lane has fewer spaces
- Inner lane has 1–2 speed-limit check spaces
- Outer lane has more spaces
- Outer lane has fewer or later speed-limit check spaces
- Useful for teaching understeer and out-in-out movement

#### Medium Corner

Recommended features:

- Speed limit around 40–60 km/h
- Inner lane has multiple speed-limit check spaces
- Outer lane has more spaces but allows later braking
- Good place for Drift and Early Brake Cornering

#### Sharp Corner / Hairpin

Recommended features:

- Speed limit around 30–50 km/h
- Strong difference between inner and outer lane space count
- Inner lane is short but very risky
- Outer lane is long but safer
- Guardrail or no-guardrail edge should be clearly marked

#### S-Curve / Linked Corner

Recommended features:

- Multiple corner directions in a short space
- Speed-limit check areas can appear on different sides
- Good test of lane preparation
- The best lane may change during the card

---

## 15. Speed-Limit Spaces

Some road spaces have speed limits.

A speed limit is checked when a car moves into that space.

If the car's speed is within the limit, nothing happens.

If the car exceeds the limit, understeer occurs.

Speed-limit checks happen only when a car moves into a speed-limit space.

They do not happen just because:

- A car is already standing on a speed-limit space.
- An After effect increases the car's speed.
- A car ends its turn on a speed-limit space.

However, if a car is moved sideways into a new speed-limit space, check that new space immediately.

---

## 16. Understeer

Understeer represents the car failing to turn enough at high speed.

---

### 16.1 When to Check Understeer

After each movement into a speed-limit space, compare the car's current speed against that space's speed limit.

If the car is too fast, it understeers.

---

### 16.2 Understeer Resolution

When a car understeers:

1. Move the car sideways one lane outward immediately.
2. This sideways movement does not cost a movement point.
3. If the new space also has a speed limit, check that speed limit immediately.
4. This can cause chain checks.
5. If the new outer space is occupied, collision occurs.
6. If there is no valid outside space:
   - If there is a guardrail, collision occurs.
   - If there is no guardrail, the car spins off.

---

### 16.3 Chain Checks

Understeer checks can chain.

If understeer moves a car into another speed-limit space and the car is still too fast, resolve another understeer immediately.

This may continue until the car:

- Enters a valid space within speed limit
- Collides
- Spins off
- Reaches a state where no further understeer movement occurs

---

## 17. Collision

Collision occurs when a car hits another car, a guardrail, or another blocking obstacle.

---

### 17.1 Collision Penalty

When a car suffers a collision, it loses 1 Gear.

When a car loses 1 Gear, set its speed to the maximum speed of the next lower Gear.

Example:

- Current speed: 100 km/h
- Current Gear: 4th Gear
- Collision: lose 1 Gear
- New Gear: 3rd Gear
- New speed: 80 km/h

If a car in 1st Gear loses 1 Gear, set its speed to 0 km/h.

---

### 17.2 Side Collision

If two cars crash sideways into each other:

- Both cars suffer collision.
- Both cars lose 1 Gear.

This is usually not beneficial for either player.

---

## 18. Spin-Off

Spin-off occurs when a car understeers off the road where there is no guardrail.

---

### 18.1 Spin-Off Penalty

When a car spins off, it loses 2 Gears.

When a car loses 2 Gears, set its speed to the maximum speed of the Gear two levels lower.

Example:

- Current speed: 120 km/h
- Current Gear: 5th Gear
- Spin-off: lose 2 Gears
- New Gear: 3rd Gear
- New speed: 80 km/h

If a car would go below 1st Gear, set its speed to 0 km/h.

---

## 19. Blocking and Rear-End Collision

Cars cannot share a space unless a card specifically allows it.

If a car would move forward into a space occupied by another car, that space is blocked.

This is treated as a rear-end collision / blocking event.

---

### 19.1 Blocking Resolution

When a moving car tries to enter an occupied forward space:

1. The moving car cannot enter the occupied space.
2. The moving car spends 1 movement point.
3. If the moving car is faster than the blocking car, reduce the moving car's speed to the blocking car's current speed.
4. If the moving car is slower than or equal to the blocking car, its speed does not change.
5. The blocking car does not lose speed.
6. If the blocking car later moves away and the blocked car still has movement points, the blocked car may continue moving.
7. The blocked car may choose to spend movement points to move sideways if a valid space is available.

---

## 20. Lane Change

A player may change lanes in two ways:

1. By using card effects
2. By spending movement points during movement

---

### 20.1 Card-Based Lane Change

Some cards allow a player to change lanes before, during, or after movement.

Example:

> Change Lane  
> No Requirement  
> Turn  
> Before: Move to the other lane. You may discard 1 card from your hand.

Card-based lane changes usually do not spend movement points unless the card says otherwise.

---

### 20.2 Movement-Based Lane Change

During movement, a player may spend 1 movement point to move sideways into an adjacent lane instead of moving forward.

The destination space must be:

- Valid
- Connected
- Unoccupied
- Not outside the road

If the destination space has a speed limit, check that speed limit immediately.

---

## 21. Lead Player and Following Player

At any time, one player is the lead player and the other player is the following player, unless they are neck and neck.

The lead player is the car whose occupied space has the furthest front line.

The following player is the other car.

---

## 22. Standard Turn Order

When one player is clearly leading:

1. Lead player takes a turn.
2. Following player takes a turn.

---

## 23. Lead Player Turn

The lead player's turn follows these steps:

1. **Road Maintenance**
   - If there are fewer than 3 unreached road cards ahead, reveal and connect 1 road card.
2. **Play Card**
   - Play 1 valid card from hand if possible.
   - Check speed requirement at the moment of play.
   - If no valid card can be played, use the Unplayable Hand Rule.
3. **Resolve Before Effects**
   - Resolve Before effects from the played card.
4. **Calculate Movement Points**
   - Determine movement points from current Gear.
5. **Movement**
   - Spend movement points one at a time.
   - Each movement point may be spent to move forward or sideways.
6. **Check Speed Limits**
   - After entering each speed-limit space, check speed.
7. **Resolve Understeer, Collision, Blocking, Spin-Off**
   - Resolve all movement consequences immediately.
8. **Resolve Drive / Step / After Effects**
   - Drive effects apply during movement.
   - Step effects trigger as specified.
   - After effects resolve after movement ends.
9. **Draw**
   - Draw until hand size is 4.

---

## 24. Following Player Turn

The following player's turn is mostly the same as the lead player's turn, except:

- The following player does not maintain the road.
- The following player may use Slipstream.

The following player's turn follows these steps:

1. **Play Card**
   - Play 1 valid card from hand if possible.
   - Check speed requirement at the moment of play.
   - If no valid card can be played, use the Unplayable Hand Rule.
2. **Resolve Before Effects**
   - Resolve Before effects from the played card.
3. **Slipstream**
   - If eligible, the player may gain +10 km/h.
4. **Calculate Movement Points**
   - Determine movement points from current Gear.
5. **Movement**
   - Spend movement points one at a time.
   - Each movement point may be spent to move forward or sideways.
6. **Check Speed Limits**
   - After entering each speed-limit space, check speed.
7. **Resolve Understeer, Collision, Blocking, Spin-Off**
   - Resolve all movement consequences immediately.
8. **Resolve Drive / Step / After Effects**
   - Drive effects apply during movement.
   - Step effects trigger as specified.
   - After effects resolve after movement ends.
9. **Draw**
   - Draw until hand size is 4.

---

## 25. Slipstream

Slipstream represents the following car using the air wake of the lead car.

---

### 25.1 Slipstream Eligibility

The following player may gain Slipstream if:

- They are the following player.
- They are in the same lane as the lead car.
- This is checked after Before effects and immediately before movement.
- The bonus would not exceed the car's maximum speed.

---

### 25.2 Slipstream Effect

Slipstream gives:

> +10 km/h

Slipstream is optional.

Slipstream works on both straights and corners.

A player may refuse Slipstream if the bonus would make cornering too dangerous.

---

## 26. Overtaking

If the following player moves ahead of the lead player, the following player becomes the new lead player.

The player who was overtaken becomes the following player.

Because the lead player acts first in the normal turn order, a successful overtake can create a strong tempo advantage.

Example:

1. Player B is following.
2. Player B takes their following-player turn.
3. Player B overtakes Player A.
4. Player B becomes the lead player.
5. At the start of the next round, Player B acts first as the lead player.

This means a successful overtake may allow a player to effectively act twice in a row across the turn boundary.

---

## 27. Neck-and-Neck State

Two cars are neck and neck if their occupied spaces are adjacent in race progress.

This includes corner situations where:

- 1 inner lane space is adjacent to 1 outer lane space
- 1 inner lane space is adjacent to up to 2 outer lane spaces

If two cars are neck and neck, they use simultaneous card reveal and alternating movement.

---

## 28. Neck-and-Neck Turn Procedure

When cars are neck and neck:

1. Both players choose 1 card from hand and place it face down.
2. Both players reveal their cards simultaneously.
3. Check card speed requirements at the moment of reveal.
4. Determine action order using current speed before card effects.
5. The player with higher current speed acts first.
6. If speed is tied, the player on the inner lane acts first.
7. Resolve Before effects in action order.
8. The following player, if applicable, may use Slipstream if eligible.
9. Calculate each player's movement points.
10. Players move one space at a time, alternating in action order.
11. After each movement step, resolve speed-limit checks, understeer, blocking, collision, and spin-off.
12. If one player runs out of movement points, the other player continues spending remaining movement points.
13. Resolve After effects.
14. Both players draw back up to 4 cards.

---

## 29. Neck-and-Neck Movement

During neck-and-neck movement, players spend movement points one at a time in action order.

Example:

- Player A has 4 movement points.
- Player B has 2 movement points.
- Player A moves 1 space.
- Player B moves 1 space.
- Player A moves 1 space.
- Player B moves 1 space.
- Player A has 2 movement points remaining.
- Player A spends those remaining movement points normally.

This creates close racing where both cars fight through the same corner together.

---

## 30. Simultaneous Reveal and Speed Changes

In neck-and-neck state, action order is determined before card effects.

This means:

- If Player A starts faster, Player A acts first.
- If Player B reveals a card that would make them faster, that does not change the action order for this neck-and-neck sequence.
- Speed changes from card effects apply after action order is determined.

---

## 31. Starting the Game

### 31.1 Prepare Road Deck

For tabletop testing:

1. Build a Road Deck.
2. Place the Goal card as the final card.
3. Shuffle or arrange the remaining road cards according to the chosen race.
4. Reveal and connect the first 3 road cards.

For the browser prototype:

1. Choose a mode from the title screen: VS AI Racers, Local 2 Player, or Online 2 Player.
2. Choose a course: Akagi Redline, Haruna Skyline, Hakone Turnpike, or Wildcard Route.
3. If using a named course, choose downhill or uphill direction.
4. If using Wildcard Route, choose small, medium, or long route size.
5. Generate the route from the selected course seed / wildcard settings.
6. Place both cars on the Start Straight.

### 31.2 Prepare Players

Each player:

1. Chooses a car.
2. Takes a 12-card Driving Deck.
3. Takes 1 Speed Meter Card and 1 Needle Card.
4. Places the Needle Card over the Speed Meter Card.
5. Shuffles their deck.
6. Draws 4 cards.
7. Sets speed to the maximum speed of 1st Gear.

Current selectable cars:

| Car | Drive | Prototype identity |
|---|---|---|
| Toyota AE86 | RWD | Lightweight balance, predictable drifts, and fast line changes. |
| Lamborghini Huracan | AWD | Explosive exits and strong grip when power comes down early. |
| Porsche 911 | RWD | Rear-engine traction and precise corrections through technical bends. |
| Mustang GT500 | RWD | Raw straight-line power and door-to-door pressure. |

For the base Gear table, this means:

> Starting speed: 20 km/h

### 31.3 Determine Pole Position

Randomly determine pole position.

The pole-position player starts as the lead player.

The other player starts as the following player.

Place the cars one after another at the starting line so the game begins in a clear lead/following state, not neck and neck.

### 31.4 Title Screen and Reference Flow

The current digital front end is part of the prototype design:

- The title screen uses the `title-logo-transparent.png` logo for **山道疾走：ドリフトデュエル Mountain Chase: Drift Duel**.
- The subtitle / mood line is **Tactical Drift Card Battles**.
- The title screen offers VS AI Racers, Local 2 Player, Online 2 Player, and Codex.
- Online play uses a host / guest room-key flow. The host creates the room and starts setup after the guest connects and marks ready.
- The Codex is a card archive with tabs for Racing Cards and Road Cards. It supports hover / click inspection and should remain the main in-game reference surface for prototype content.

---

## 32. Example Cards

The current card list comes from [racing_cards.csv](racing_cards.csv). The separate [Racing Card List v0.3](racing_card_list_v0_3.md) mirrors that CSV and remains the readable card reference.

| Serial | Card | Type | Requirement | Timing | Effect | Implemented |
|---|---|---|---|---|---|---|
| `AE86-01` | Drift | Turn | Max 70 | Drive | +30 km/h to the speed check this turn. | Yes |
| `AE86-02` | Full throttle | Gas | Any | Before | Speed +40 km/h. | Yes |
| `AE86-03` | Back down | Brake | Any | Before | Speed -20 km/h. Discard 1 card. | Yes |
| `AE86-04` | Hard Brake | Brake | Min 50 | Before | Speed -50 km/h. | Yes |
| `AE86-05` | Change Lane | Turn | Any | Before | Move to the other lane. Discard 1 card. | Yes |
| `AE86-06` | Early Brake Cornering | Turn | Max 110 | Before | Speed -20 km/h. Move to the inner lane. | Yes |
| `AE86-07` | Rocket Start | Gas | Max 50 | After | Speed +50 km/h. You may discard 2 cards. | Yes |
| `AE86-08` | Change Shift | Gas | Any | Before | Speed +10 km/h or -10 km/h. You may then play another card. | Yes |
| `HRCN-01` | Clutch Kick | Gas | Min 60 | Before | Speed +20 km/h. This turn, your first speed check gains +50 km/h. | Yes |
| `HRCN-02` | Trail Braking | Brake | Max 80 | Drive | Before each speed check this turn, you may reduce Speed by 10 km/h. | Yes |
| `HRCN-03` | Full Countersteer | Turn | Any | Step | If you would understeer this turn, discard 1 card and cancel that understeer once. | Yes |
| `HRCN-04` | Exit Drift | Gas | Max 60 | After | If you moved through at least 1 speed check space this turn, Speed +30 km/h. | Yes |
| `HRCN-05` | Drift Extend | Turn | Max 80 | Drive | If you gain corner speed bonus last turn, it also applies to the speed check this turn. | Yes |
| `HRCN-06` | Gutter Boost | Turn | Max 80 | Drive | If you are on the inner lane, +50 km/h to the corner speed limit calculation. | Yes |
| `HRCN-07` | Blind Attack | Turn | Min 50 | Drive | Discard all cards in your hand. If you get blocked, move to the other lane and gain 1 move point. | Yes |
| `HRCN-08` | Jump Exit | Gas | Max 30 | Drive | You have 4 move points this turn regardless of your gear, ignore the corner speed limit. | Yes |
| `P911-01` | Progressive Acceleration | Gas | Any | Drive | After each move this turn, Speed +10 km/h. | Yes |
| `P911-02` | Early Power | Gas | Max 60 | After | If you passed all speed checks this turn, Speed +40 km/h. | Yes |
| `P911-03` | Traction Control | Brake | Any | Drive | If you would understeer this turn, reduce your speed by 20 km/h and cancel that understeer. | Yes |
| `P911-04` | Grip Line | Turn | Max 60 | Drive | +20 km/h to the speed check this turn. Discard 1 card. | Yes |
| `P911-05` | Balanced Chassis | Turn | Any | Step | Once this turn, you may move sideways by discard 1 card. | Yes |
| `P911-06` | Torque Split | Gas | Any | Before | Choose one: Speed +30 km/h, or +40 km/h to the speed check this turn. | Yes |
| `P911-07` | Micro Correction | Turn | Any | Drive | After each speed check this turn, you may choose Speed +10 km/h or Speed -10 km/h. | Yes |
| `P911-08` | Line Lock | Turn | Max 60 | Drive | While you remain in your current lane , all speed checks gain +30 km/h this turn. | Yes |
| `GT500-01` | Raw Horsepower | Gas | Any | Before | Speed +50 km/h. You may only move forward this turn. | Yes |
| `GT500-02` | Straight-Line Monster | Gas | Any | Before | If you are on a straight, Speed +40 km/h. Otherwise, Speed +20 km/h | Yes |
| `GT500-03` | Panic Stop | Brake | Any | Drive | Speed -80km/h. Discard all cards from hand. | Yes |
| `GT500-04` | Chrome Bumper | Attack | Min 60 | Step | When you get blocked, discard 1 card, then the blocking car loses 40 km/h. | Yes |
| `GT500-05` | Shove Aside | Attack | Min 80 | Step | Move the blocking car to the other lane. You may enter the space it left. If it cannot move, both cars spin-off. | Yes |
| `GT500-06` | Burn Rubber | Gas | Any | After | If you overtake this turn, Speed +60 km/h. Discard all cards. | Yes |
| `GT500-07` | Door Slam | Attack | Min 80 | Step | Move to the other lane. If you get blocked the blocking car loses 20 km/h and all his remaining move points. | Yes |
| `GT500-08` | No Room | Attack | Min 60 | Drive | Other cars cannot move into your lane until next turn. | Yes |

---

## 33. Prototype Driving Decks

The browser prototype currently uses fixed 12-card decks per selected car. Car decks may include Common / Starter cards so every archetype has enough basic acceleration and braking.

### Balance Set / Bright Red AE86

| Card | Copies |
|---|---:|
| Drift | 2 |
| Full throttle | 3 |
| Back down | 2 |
| Hard Brake | 1 |
| Change Lane | 1 |
| Early Brake Cornering | 1 |
| Rocket Start | 1 |
| Change Shift | 1 |

Shape: Gas 5 / Brake 3 / Turn 4. This deck is the stable starter baseline: enough acceleration, enough braking, and a clear AE86 lane-control identity.

### RWD Drift Set / Bright Green Lamborghini Huracan

| Card | Copies |
|---|---:|
| Drift | 1 |
| Full throttle | 3 |
| Back down | 2 |
| Clutch Kick | 1 |
| Trail Braking | 1 |
| Full Countersteer | 1 |
| Exit Drift | 1 |
| Gutter Boost | 1 |
| Jump Exit | 1 |

Shape: Gas 6 / Brake 3 / Turn 3. This deck keeps enough basic economy from Common cards, then leans into speed-check bonuses and drift recovery. Drift Extend and Blind Attack stay out of the first playable deck because they are more situational tuning cards.

### AWD Grip Set / Yellow Porsche 911

| Card | Copies |
|---|---:|
| Drift | 1 |
| Full throttle | 3 |
| Back down | 2 |
| Progressive Acceleration | 1 |
| Early Power | 1 |
| Traction Control | 1 |
| Grip Line | 1 |
| Torque Split | 1 |
| Micro Correction | 1 |

Shape: Gas 6 / Brake 3 / Turn 3. This deck keeps Common acceleration/braking as the baseline, then adds Porsche grip tools for speed-check stability, safe understeer cancel, and post-check speed correction. Balanced Chassis and Line Lock stay out of the first playable deck as tuning cards.

### Muscle Car Set / Blue Mustang GT500

| Card | Copies |
|---|---:|
| Full throttle | 3 |
| Back down | 2 |
| Hard Brake | 1 |
| Raw Horsepower | 1 |
| Straight-Line Monster | 1 |
| Panic Stop | 1 |
| Chrome Bumper | 1 |
| Shove Aside | 1 |
| Door Slam | 1 |

Shape: Gas 5 / Brake 4 / Attack 3. This deck keeps enough control cards to recover from heavy speed spikes, then gives the Mustang contact pressure through blocking punishment and lane-force tools. Burn Rubber and No Room stay out of the first playable deck as more situational tuning cards.

---
## 34. Prototype Course Structure

The current prototype no longer uses one fixed 10-card first-playtest route as the main experience. Instead, players choose a named course or a wildcard route during setup.

Current route structure:

1. Start Straight
2. Generated road-card sequence based on course length
3. Finish Straight with Goal space

Named courses:

| Course | Road-card sequence length | Design role |
|---|---:|---|
| Akagi Redline | 5 | Short technical route for fast tests and tutorial play. |
| Haruna Skyline | 8 | Medium route and default-feeling balanced race. |
| Hakone Turnpike | 12 | Longer, higher-speed race with more room for comeback and deck cycling. |
| Wildcard Route | 5 / 8 / 12 | Variable route for replayability. |

The earlier 10-card fixed road deck remains useful for tabletop paper testing, but the browser prototype should be documented and tuned around the course-select model.

---

## 35. Car Archetypes

Future car archetypes can change deck construction, card effects, Gear tables, or penalties.

---

### 35.1 RWD Car

Specialty: drifting.

Possible traits:

- Stronger Drift cards
- Better corner speed-limit modification
- Better recovery from understeer
- Higher exit speed after corners

---

### 35.2 AWD Car

Specialty: grip cornering.

Possible traits:

- Better stability in rain
- Higher natural corner tolerance
- Easier lane changes in corners
- Stronger mid-speed handling

---

### 35.3 Muscle Car

Specialty: power and blocking.

Possible traits:

- Strong acceleration
- Can knock blocking cars away
- Better collision resistance
- Worse cornering
- Worse braking

---

### 35.4 Lightweight Car

Specialty: technical handling.

Possible traits:

- Better braking
- Easier access to the inner lane
- More flexible Turn cards
- Lower top speed

---

## 36. Car Parts

Advanced rules may allow players to equip parts to their car profile.

Possible part categories:

- Engine
- Tires
- Transmission
- Suspension
- Brakes
- Body / frame
- Turbo / boost system

Parts may modify:

- Starting speed
- Maximum speed
- Gear table
- Acceleration
- Braking power
- Cornering tolerance
- Slipstream bonus
- Collision penalty
- Card draw
- Hand size
- Deck construction rules

---

## 37. Road Deck Variants

Future Road Decks may represent different race styles.

Examples:

- Mountain pass
- City street
- Highway
- Desert road
- Snow road
- Rainy circuit
- Night race
- Construction zone

Road decks may be used in several ways:

- Fixed order to recreate a circuit
- Reverse order
- Random order
- Partial deck for shorter races
- Scenario deck for campaign-style play

---

## 38. Global Modifiers

Future race conditions may modify the whole race.

---

### 38.1 Rain

Possible effect:

> Reduce all corner speed limits by 10 km/h.

---

### 38.2 Fog

Possible effect:

> Only 2 unreached road cards are visible ahead instead of 3.

---

### 38.3 Night

Possible effect:

> Reduce visible road information or increase risk on corners.

---

### 38.4 Gravel / Dirt

Possible effect:

> Braking is weaker, but Drift effects are stronger.

---

### 38.5 Wet Road

Possible effect:

> Lane changes are riskier and understeer is more common.

---

## 39. Design Pillars

### 39.1 Speed Management

Players should constantly decide whether to accelerate, brake, or maintain speed.

---

### 39.2 Lane Tactics

The inner lane is shorter, but usually riskier.

The outer lane is longer, but allows safer corner entry and later braking.

---

### 39.3 Stylish Cornering

Cards should make cornering feel expressive and exciting.

Drift, out-in-out lines, late braking, and risky overtakes should be core moments.

---

### 39.4 Risk vs Reward

High speed should feel powerful, but dangerous.

The best plays should feel risky but controllable.

---

### 39.5 Duel Momentum

Overtaking should matter.

A player who successfully overtakes can seize tempo and become the new lead player.

---

### 39.6 Car Identity

Different cars should eventually feel meaningfully different through unique cards, Gear tables, and part synergies.

---

### 39.7 Hand Cycling

Discarding cards from hand is usually beneficial because players draw back up to 4 cards at the end of turn. Effects that discard 1–2 cards help the player cycle their deck. Discarding 3 or more cards is considered a cost or penalty.

---

### 39.8 Common Acceleration Benchmark

A basic Gas card may increase speed by 40 km/h. Stronger acceleration effects should require a condition, timing restriction, or handling drawback.

---

## 40. Important Edge Cases

### 40.1 Can a car go below 0 km/h?

No.

If any effect would reduce speed below 0 km/h, set speed to 0 km/h.

---

### 40.2 Can a car exceed 140 km/h?

No, not in the prototype.

If any effect would increase speed above 140 km/h, set speed to 140 km/h.

---

### 40.3 Does 0 km/h still allow movement?

Yes.

In the prototype base Gear table, 0–20 km/h is 1st Gear, which gives 1 movement point.

This supports arcade-style pacing.

---

### 40.4 Can cars share a space?

No.

Cars cannot share a space unless a card specifically allows it.

---

### 40.5 Does After speed gain trigger a speed check?

No.

Speed-limit checks happen only when a car moves into a speed-limit space.

---

### 40.6 Does sideways movement trigger a speed check?

Yes.

If sideways movement causes a car to enter a speed-limit space, check that speed limit immediately.

---

### 40.7 Does understeer sideways movement cost movement points?

No.

Understeer movement is forced movement and does not cost movement points.

---

### 40.8 Does voluntary sideways movement cost movement points?

Yes.

A voluntary lane change during movement costs 1 movement point.

---

### 40.9 Can understeer chain?

Yes.

If understeer moves a car into another speed-limit space, check again immediately.

---

### 40.10 Does the lead player control road orientation?

No.

The lead player reveals and connects road cards according to the card's fixed direction.

---

## 41. First Playtest Checklist

For the first playtest, prepare:

- 2 car miniatures
- 2 identical 12-card starter decks
- 2 Speed Meter Cards
- 2 Needle Cards
- 10 road cards
- 1 Goal card
- A way to mark speed-limit spaces
- A way to mark guardrail and no-guardrail edges
- A way to identify front lines on spaces
- Rule reminder card for turn order
- Rule reminder card for understeer / collision / spin-off

During the playtest, watch for:

- Whether the speed meter is easy to read and rotate
- Whether the Needle Card accidentally hides important speed or Gear information
- Whether road speed-limit signs are readable at a glance
- Whether red speed-limit check spaces are visually clear
- Whether lead player advantage is too strong
- Whether +10 km/h Slipstream is enough
- Whether understeer chain checks are exciting or too punishing
- Whether players understand who is ahead
- Whether front-line markers are clear enough
- Whether inner lane is too dominant
- Whether players can recover from bad hands
- Whether the race finishes around 30 minutes
- Whether card timing causes confusion
- Whether movement one space at a time feels smooth or slow

---

## 42. Open Design Notes

The following elements are intentionally left for later development:

- Attack-card tuning
- More than 2 players
- Advanced car parts
- Car-specific Gear tables
- Unique car decks
- Weather and road conditions
- Campaign / tournament structure
- Real circuit recreation
- More detailed crash rules
- Drafting variants
- Tire wear
- Boost / nitro
- Damage system

---

## 43. Current Prototype Summary

This prototype should test the core experience:

> Manage your speed, read the road ahead, fight for the best racing line, and overtake at the perfect moment.

The game should feel fast, tactical, and dramatic, with the strongest moments happening when two cars are neck and neck through a corner.

The latest prototype component direction is:

- Use a 2-card speed meter system for each player.
- Use Road Cards with clear 2-lane road spaces.
- Mark speed-limit check areas directly on the road in red.
- Print speed-limit signs next to corners.
- Give the outer lane more spaces than the inner lane.
- Balance the inner lane by giving it more speed-limit check spaces.
- Present the game under the final prototype name **山道疾走：ドリフトデュエル Mountain Chase: Drift Duel**.
- Use the title-logo asset and the **Tactical Drift Card Battles** subtitle as the front-door identity.
- Support VS AI Racers, Local 2 Player, and Online 2 Player from the title screen.
- Use course select as a major setup step, with Akagi Redline, Haruna Skyline, Hakone Turnpike, and Wildcard Route.
- Use generated top-down mountain-road layouts in the browser prototype while preserving Road Cards as the underlying design language.
- Keep Driving Cards and Road Cards readable through the Codex.
- Show current move points near the active car during movement so tactical options stay visible on the board.
- In PvE, keep the human player's hand and discard pile visible while the rival turn is locked.

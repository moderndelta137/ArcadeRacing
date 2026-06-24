# Race Card Generation Guideline

## 1. Purpose and source priority

This specification standardizes player race cards using `Examples/01` through
`Examples/17` as the visual reference set.

Source priority:

1. **Rules text:** current card data or `race_card_image_prompts_all_v0_3.md`.
2. **Visual design:** example PNGs 01-17.
3. **Illustration direction:** card-specific prompt in the current prompt file.

The example PNGs contain older rules text in several cases. Do not copy their
effect values. Copy their layout and visual language only.

## 2. Output specification

| Property | Required value |
|---|---:|
| Master canvas | **1060 x 1484 px** |
| Aspect ratio | **0.7143 (5:7)** |
| Orientation | Portrait |
| Color | RGB, 8 bits/channel |
| Delivery | PNG, no transparency |
| Print interpretation | 63 x 88 mm poker card |
| Print resolution at 63 x 88 mm | about 427-428 ppi |
| Minimum final raster | 1060 x 1484 px; do not upscale smaller art |

Use the full master canvas for generation. Keep critical text and icons inside
the safe area. Do not generate landscape art and crop it into the template.

## 3. Coordinate system and master layout

Coordinates use top-left origin `(0,0)`. All values below refer to the
1060 x 1484 px master. Percent values are relative to full canvas.

| Element | X | Y | W | H | Approx. canvas share |
|---|---:|---:|---:|---:|---:|
| Full canvas | 0 | 0 | 1060 | 1484 | 100% x 100% |
| Outer black rounded frame | 0 | 0 | 1060 | 1484 | full canvas |
| Inner white card edge | 18 | 20 | 1024 | 1444 | 96.6% x 97.3% |
| Critical-content safe area | 28 | 28 | 1004 | 1428 | 94.7% x 96.2% |
| Header/title zone | 27 | 26 | 1006 | 250 | 94.9% x 16.8% |
| Requirement badge | 43 | 43 | 205 | 205 | 19.3% x 13.8% |
| Title safe box | 275 | 45 | 700 | 190 | 66.0% x 12.8% |
| Illustration frame | 27 | 277 | 1006 | 780 | 94.9% x 52.6% |
| Timing tab | 27 | 986 | 320 | 90 | 30.2% x 6.1% |
| Effect panel outer edge | 27 | 1042 | 1006 | 390 | 94.9% x 26.3% |
| Effect text safe box | 105 | 1105 | 850 | 245 | 80.2% x 16.5% |
| Deck plate / serial label | 36 | 1328 | 310 | 150 | 29.2% x 10.1% |
| Card-type tab | 660 | 1345 | 370 | 112 | 34.9% x 7.5% |
| Bottom accent strip | 28 | 1430 | 1004 | 27 | 94.7% x 1.8% |

Allowed placement tolerance for generated cards: **+/-12 px** for major zone
edges and **+/-8 px** for badge/tab alignment. Shared template parts should be
composited from fixed assets when reliable consistency matters.

### Layer order

1. Outer black rounded frame.
2. Inner white frame and colored bottom accent.
3. White header with halftone and diagonal speed slashes.
4. Illustration.
5. Timing tab, overlapping illustration and effect panel.
6. White effect panel with black multi-line border.
7. Deck plate / serial label, overlapping lower-left effect panel edge.
8. Card-type tab, overlapping effect panel and bottom frame.
9. All text.

## 4. Frame construction

- Outer frame: black, about **18-22 px** thick, corner radius **42-50 px**.
- Inner white keyline: **6-10 px** visible inside black frame.
- Major panel outlines: black **6-9 px**, plus white **3-5 px** separator.
- Effect panel: clipped/chamfered lower-right corner under type tab.
- Timing and type tabs: right-pointing or right-chamfered polygon. Use a double
  outline: white inner keyline plus black outer line.
- Use sparse halftone dots and ink scratches. Texture must not reduce text
  contrast.

## 5. Header

### Requirement badge

Badge center target: **(145, 145)**. Diameter: **196-210 px**.

| Requirement | Badge treatment | Text |
|---|---|---|
| Maximum speed | White disk, red ring, thin black outer keyline | Black number |
| Minimum speed | Solid deep-blue disk, white inner ring/keyline | White number |
| No requirement | White/light-gray disk, gray ring, thin black keyline | Black `ANY` |

Badge ring width: **16-22 px**. Number cap height: **90-112 px**. `ANY` cap
height: **50-64 px**. Center text optically, not by baseline alone.

Do not add `MIN`, `MAX`, `km/h`, arrows, or extra labels inside badge.

### Card name

- Position: centered in title safe box, generally around **x=625, y=135**.
- Style: black, heavy dry-brush display lettering, slightly right-leaning.
- Single-line title cap height: **105-145 px**.
- Two-line title cap height per line: **65-90 px**.
- Leading for two lines: **0.78-0.90 em**.
- Maximum: **2 lines**. Never overlap badge or illustration.
- Keep at least **24 px** between badge and title ink.
- Decorative slashes sit behind title and may use accent color. They must not
  cross black letterforms enough to impair reading.

## 6. Illustration panel

- Nominal image area: **x=27-1033, y=277-1057**.
- Illustration occupies about **53%** of card height.
- Primary player car must occupy **35-65%** of illustration area.
- Car body must remain recognizable. Keep at least **80%** of primary car in
  frame unless card concept explicitly requires close-up/cockpit framing.
- Reserve bottom **70 px** of illustration for timing-tab overlap.
- Keep essential action away from top-left badge/header and bottom text panel.
- Every card in a car/deck set must have a distinct illustration composition.
  Do not reuse the same low rear/front three-quarter drift shot across the set.
  Vary camera angle, distance, focal point, road geometry, action moment,
  background landmark, and mechanic cue.
- The card name must be visible in the picture language. If the card is
  `Change Shift`, show a gear-change/cockpit or tachometer cue. If it is
  `Change Lane`, show lateral lane movement. If it is `Back down`, show
  easing off/braking posture, not generic drifting.
- The illustration should depict believable road conditions. It can be
  heightened manga action, but the road scene should not contain game UI,
  floating numbers, rule text, card icons, discarded card props, speed bonus
  text, lane labels, or other objects that would not normally appear in a
  street/race environment.
- Mechanic cues must come from realistic vehicle and road behavior: braking
  posture, throttle squat, racing line choice, lane position, steering angle,
  road geometry, rival car pressure, dust/smoke/spray, and camera framing.
- Explanatory manga overlays are allowed when they clarify vehicle movement or
  internal mechanics without becoming functional rules text. Allowed overlays:
  movement arrows/path ribbons showing where the car goes, cockpit/driver-seat
  cut-ins, tachometer/speedometer/throttle/brake dial cut-ins, transparent
  see-through mechanical views, tire/contact-patch closeups, steering-wheel
  closeups, or small inset panels. These should support the illustration, not
  replace it.
- Allowed overlays must remain visual, not textual rules. Do not write `+10
  km/h`, `-10 km/h`, `Discard`, `Brake`, `Inner lane`, or other card-effect
  words inside the illustration. If an inset uses labels, keep them generic and
  diegetic, such as `RPM`, `THROTTLE`, `BRK`, or simple numbered path markers
  for multi-step movement.

Deck environment rules:

| Deck code | Environment |
|---|---|
| `AE86` | Night mountain road, dry or slightly glossy asphalt, no rain. |
| `HRCN` | Sunny daytime paved road, dry surface, clear visibility. |
| `P911` | Rainy night paved road, wet reflections, active rain/spray. |
| `GT500` | Daytime offroad or rally-style dirt/gravel road, dust and rough terrain. |

Visual language:

- Full-color 1990s Japanese street-racing manga color-page aesthetic, strongly
  inspired by hand-drawn mountain-pass racing manga rather than realistic
  automotive rendering.
- Hand-inked black contours, visible line weight variation, crosshatching,
  halftone dots, screentone shadows, speed lines, tire smoke, sparks, and
  exaggerated dynamic perspective.
- Color should feel like scanned/printed manga color pages: saturated but not
  glossy, painterly cel shading, limited airbrush, visible ink texture.
- Avoid photorealistic lighting, CGI-like reflections, smooth 3D render
  surfaces, modern digital concept-art polish, and overly realistic car-paint
  shading.
- Use the deck-specific environment table above. Do not randomly change
  weather or time of day inside a deck.
- Vehicle color/model stays consistent within set.
- No copyrighted logos, real brand wordmarks, known characters, or copied manga
  panels. Remove generated manufacturer badges and readable license data.
- Japanese sound-effect lettering / onomatopoeia is optional, not default. Use
  it on at most **25-35%** of cards in a set, usually only high-impact cards
  such as hard braking, collisions, rocket starts, or dramatic drifts. Quiet,
  technical, or control cards should usually have no onomatopoeia. Sound-effect
  lettering cannot replace required English UI text.

Composition must visualize mechanic:

| Mechanic | Visual cue |
|---|---|
| Acceleration/Gas | Rear squat, forward streaks, exhaust flare, open road |
| Braking | Nose dive, brake lights/discs, tire marks, corner entry |
| Turn/Drift | Visible steering/yaw, apex, racing line, lateral motion |
| Lane movement | Two readable lanes, car position moving from one lane to another, optional movement arrow/path ribbon |
| Multi-step movement | 2-3 natural car positions, optional path arrows or numbered movement markers when the card needs a diagrammatic read |
| Internal control | Cockpit cut-in, tachometer/throttle/brake dial, steering-wheel closeup, transparent mechanical/tire view |
| Blocking/Attack | Distinct cars in distinct spaces; clear pressure direction |

## 7. Timing tab

- Target box: **x=27-347, y=986-1076**.
- Filled polygon: about **305 x 76 px** with 25-35 px right point/chamfer.
- Label left padding: **45-55 px**.
- Text: white, bold condensed italic, cap height **47-58 px**.
- Standard labels: `Before`, `Drive`, `Step`, `After`.
- Combined timing may use `Step / After`; reduce font only enough to fit.
- One line only. Never invent or paraphrase timing labels.

Default fill is timing/card accent color. Examples mostly use red. Blue and
green appear as deliberate accent variants. In production, timing tab, card-type
tab, header slashes, and bottom strip all use the **card-type color** from the
table in section 9. Do not mix accents randomly.

## 8. Effect panel

- White/off-white fill with faint gray radial speed lines.
- Outer bounds: **x=27-1033, y=1042-1432**.
- Text safe box: **x=105-955, y=1105-1350**.
- Center text horizontally and vertically within safe box.
- Text: black, bold neo-grotesque sans-serif.
- Preferred size: **48-58 px**.
- Long text minimum: **38 px**. Never go below **36 px** at master size.
- Line height: **1.12-1.22 em**.
- Maximum line length: **36-42 characters** including spaces.
- Preferred line count: **1-4**; hard maximum **5**.
- Keep **45 px** clear of panel border and **80 px** clear of type-tab overlap.
- Preserve exact capitalization, punctuation, numbers, signs, and units.
- Always write `km/h`; never substitute `kph`, `KM/H`, or `kmh`.

If text does not fit: wrap earlier, then reduce size, then tighten leading by at
most 8%. Do not delete or paraphrase rules text.

## 9. Card-type tab

- Target box: **x=660-1030, y=1345-1457**.
- Text: white, bold condensed italic, cap height **55-70 px**.
- Right padding: **55-70 px**. Vertically center label.

| Type | Fill target | Approximate range |
|---|---|---|
| Gas | Deep racing blue | `#003778` to `#064A99` |
| Turn | Touge green | `#247A33` to `#3A9945` |
| Brake | Dark red | `#900008` to `#B10A12` |
| Attack | Near-black | `#050505` to `#181818` |

Type color is semantic and must not change by vehicle set. Use the same color on
the card-type tab, timing tab, title/header accent slashes, and bottom accent
strip.

## 10. Deck plate / serial label

Every card has a small deck plate at the lower-left. It carries the car/deck
name and a shortened printed plate serial. The internal card ID may stay longer
for file names and data, but the printed plate serial should be compact.

Target plate box: **x=36-346, y=1328-1478** including transparent rotation
canvas. Place it closer to the lower-left card corner than the type tab, while
still staying inside the black outer frame. The visible plate itself should be
about **250 x 120 px** before
rotation. Rotate the whole
plate **5-8 degrees clockwise** around its center. Clockwise means the left side
is higher than the right side, and the top edge slopes downward from left to
right. Keep the plate as a flat 2D rectangle: no perspective skew, no inward tilt, no 3D
foreshortening. The plate may overlap the effect panel border but must stay at
least **28 px** from the outer black frame.

| Plate part | Target |
|---|---|
| Visible plate size | **240-265 x 112-130 px** |
| Transparent rotation canvas | **300-320 x 145-160 px** |
| Height/width ratio | visible plate about **0.46-0.52** |
| Corner radius | **9-14 px** |
| Border | black **5-7 px**, optional white inner keyline **2-3 px** |
| Tilt | clockwise **5-8 degrees** |
| First line | car/deck name, cap height **15-20 px**, top third |
| Second line | printed plate serial, cap height **48-62 px**, lower two-thirds |
| Side/decorative text | optional, cap height **12-20 px**, never overlaps serial |
| Text padding | **16-22 px** left/right, **12-18 px** top/bottom |

Plate text format:

```text
{CAR_OR_DECK_NAME}
{PRINTED_PLATE_SERIAL}
```

Printed plate serial format:

```text
{CC}-{NN}
```

`CC` is a two-character car code, preferably numeric when the car identity has a
clear number. `NN` is the two-digit order of that card inside its car/deck list,
starting at `01`. Keep the printed serial stable after publication. If a card is
removed, do not renumber existing published cards. New cards take the next
unused number in that deck.

Internal data may still use full IDs such as `AE86-01`; printed plate serials
use the shortened form such as `86-01`.

Prototype deck codes:

| Deck / car | Internal deck code | Printed car code | Example printed serials |
|---|---|---|---|
| Bright Red AE86 starter/balance cards | `AE86` | `86` | `86-01` to `86-08` |
| Bright Green Huracan-style RWD drift deck | `HRCN` | `63` | `63-01` to `63-08` |
| Yellow 911 AWD grip deck | `P911` | `91` | `91-01` to `91-08` |
| Blue GT500 muscle deck | `GT500` | `50` | `50-01` to `50-08` |

Plate layout should reference real US and Japanese number plates:

- First line replaces state/prefecture/location with the car/deck name.
- Second line is the largest text and shows the printed plate serial.
- Small slogans, seals, inspection marks, icons, and decorative local text are
  permitted, but must remain secondary and must not conflict with the two main
  lines.
- Maintain clear vertical separation: first line, large serial, and side
  decoration must not touch or overlap at card scale or thumbnail scale.

Each deck may use a different country/region-inspired number-plate design, but
size, flat clockwise tilt, and readability stay fixed:

| Deck code | Plate design direction |
|---|---|
| `AE86` | Japanese-style black carbon plate, rounded border, white text, no red decoration circle, first line `AE86`, large serial such as `86-01`, optional small white Japanese side character |
| `HRCN` | Italian/European-inspired white plate, green accents, first line `HURACAN`, large serial such as `63-01` |
| `P911` | German/European-inspired pale plate, black divider marks, first line `911`, large serial such as `91-01` |
| `GT500` | US-style white plate, blue/black striping, first line `GT500`, large serial such as `50-01` |

## 11. Color system

Measured colors vary because examples are raster-generated. Use these stable
production targets instead of sampling each card.

| Role | Target | Usage |
|---|---|---|
| Ink black | `#080808` | Frame, outlines, title, effect text |
| Paper white | `#F7F6F2` | Header and effect panel |
| Pure white | `#FFFFFF` | Keylines and reversed text |
| Gas blue | `#003D82` | Gas card-type tab, timing tab, header slashes, bottom strip |
| Turn green | `#2E8738` | Turn card-type tab, timing tab, header slashes, bottom strip |
| Brake red | `#A0060D` | Brake card-type tab, timing tab, header slashes, bottom strip |
| Attack black | `#101010` | Attack card-type tab, timing tab, header slashes, bottom strip |
| Max badge red | `#C80A10` | Max-speed requirement badge ring |
| Min badge blue | `#003D82` | Min-speed requirement badge fill |
| Neutral gray | `#777777` | ANY badge ring |

Contrast requirements:

- Body text against panel: at least **12:1** preferred; never below **7:1**.
- White tab text against fill: at least **4.5:1**.
- Do not place body copy directly on illustration.
- Maximum three saturated UI colors per card: card-type color, requirement-sign
  color, and optional vehicle-set color inside the illustration.

Vehicle set color belongs mainly to illustration and deck plate. It does not
recolor semantic requirement badges or card-type/timing accents.

## 12. Typography

Raster references do not contain font metadata. Exact original font cannot be
verified. Use these controlled production substitutes:

| Role | Primary font | Fallback | Weight/style |
|---|---|---|---|
| Card name | `Road Rage` | `Bangers`, then custom dry-brush lettering | Regular, manually slanted 6-10 degrees |
| Requirement number/ANY | `Arial Black` | `Liberation Sans Bold` | Heavy, upright |
| Timing/type labels | `Arial Narrow` | `Roboto Condensed` | Bold Italic |
| Effect text | `Futura` | `Futura PT`, then `Century Gothic` | Bold |
| Deck plate text | `Futura Condensed` | `Arial Narrow` | Bold, uppercase |

Typography rules:

- Use Latin glyphs for all functional UI.
- Do not use brush font for effect text.
- Do not outline effect text.
- Tab text may use a subtle black shadow, maximum **3 px** offset/blur.
- Title should be hand-kerned. Reduce title size before horizontal scaling.
- Maximum horizontal compression: **90%**. Never stretch above 105%.
- Export fonts to raster at full size. Do not depend on image generation to
  spell functional text correctly; composite text after illustration generation.

## 13. Shared elements vs permitted variation

### Shared on every card

- Canvas, aspect ratio, outer frame, corner radius, safe area.
- Header/illustration/effect-panel division.
- Requirement badge location and semantic sign system.
- Title hierarchy.
- Timing-tab location.
- Effect-panel location and text treatment.
- Type-tab location and semantic color.
- Deck plate location, tilt range, and serial format.
- Border weights, white keylines, halftone/speed-line texture.
- Full-color manga rendering style.

### Required variation

- Card name.
- Requirement value/style.
- Timing label.
- Exact effect text.
- Card type and corresponding type color.
- Vehicle model/color by card set.
- Deck plate design and serial number.
- Illustration action and camera composition.

### Controlled variation

- Title may wrap to two lines.
- Illustration may use exterior, cockpit, elevated, diagrammatic, or close-up
  view when mechanic requires it.
- Deck plate visual design may vary by car/deck.
- Sound-effect lettering and road environment may vary, but onomatopoeia must
  be used sparingly across a set.

### Prohibited variation

- Moving badge, timing tab, effect panel, or type tab to another region.
- Replacing circle requirement badge with another shape.
- Using illustration behind functional effect text.
- Changing type color for visual convenience.
- Omitting, duplicating, paraphrasing, or hallucinating rules text.
- Adding mana cost, rarity, set number, character portrait, logos, or other UI
  not present in this template.
- Reusing near-identical car angle, road framing, and action pose for multiple
  cards in the same deck.
- Adding decorative onomatopoeia to every card in a set.
- Drawing game effect elements inside the illustration, including floating
  `+10`, `-10`, `+km/h`, `Discard`, `Brake`, `Inner lane`, lane labels, road
  labels, card icons, or discarded-card props.
- Changing the deck environment, such as rain on AE86 cards or pavement on GT500
  offroad cards.

## 14. Recommended production workflow

Use full-card PNG generation as the primary workflow. Prior SVG or component
separation tests simplified the design too much and should not be used as the
production look.

1. Read authoritative card fields from current card data.
2. Generate one complete card at `1060 x 1484 px`.
3. In the prompt, explicitly lock the full layout, exact UI text, plate text,
   type color, and manga color-page illustration style.
4. Inspect the full-card result at 100%, 50%, and thumbnail scale.
5. If only a small issue is wrong, patch the flattened PNG directly. Acceptable
   patch targets are text spelling, number plate, or tiny UI alignment.
6. Reject and regenerate if the illustration becomes photorealistic, the card
   layout drifts, the text is unreadable, or the number plate violates the
   plate rules.
7. Export final RGB PNG at `1060 x 1484 px`.

## 15. Prompt template

```text
Create one portrait player race card at 1060 x 1484 px (5:7).
Use fixed racing-card layout: circular requirement badge at top left; brush-style
card name centered in header; large illustration from y=277 to y=1057; timing
tab overlapping illustration bottom-left; white effect panel below; card-type tab
at bottom-right; small flat 2D number-plate label at lower-left, tilted
clockwise, with first-line car name and large second-line printed serial.
The plate should be visibly larger/taller than a small sticker and sit close to
the lower-left corner.
Preserve thick black rounded frame, white keylines, halftone, speed
slashes, and full-color 1990s Japanese street-racing manga color-page style.
Illustration must look hand-drawn: black ink contours, screentone/halftone,
crosshatching, cel-shaded color, printed-page texture, aggressive speed lines,
and dramatic mountain-pass racing motion. Avoid photorealistic car rendering,
CGI reflections, smooth digital concept-art shading, or realistic camera-photo
lighting.
Illustration must show a believable road scene. You may use manga-style movement
arrows, cockpit/dial cut-ins, driver-seat views, tire closeups, or transparent
mechanical see-through overlays when they explain the action. Do not draw
gameplay UI, floating speed numbers, rule text, card props, or card-effect words
inside the illustration.
Keep all functional text fully readable. Do not add logos or characters.

Name: "{NAME}"
Requirement: "{ANY | MAX N | MIN N}"
Timing: "{BEFORE | DRIVE | STEP | AFTER | STEP / AFTER}"
Type: "{GAS | BRAKE | TURN | ATTACK}"
Effect text: "{EXACT AUTHORITATIVE TEXT}"
Deck plate first line: "{CAR_OR_DECK_NAME}"
Deck plate large second line: "{CC-NN}"
Vehicle: "{MODEL DESCRIPTION AND COLOR, NO LOGOS}"
Deck environment: "{AE86 NIGHT DRY ROAD | HRCN SUNNY DAY ROAD | P911 RAINY NIGHT ROAD | GT500 DAYTIME OFFROAD}"
Illustration: "{UNIQUE ACTION, ROAD, CAMERA, MECHANIC-SPECIFIC CUES}"
Type color: "{GAS BLUE | TURN GREEN | BRAKE RED | ATTACK BLACK}"
Onomatopoeia: "{NONE | SPARING DECORATIVE SOUND EFFECT}"

Do not omit, duplicate, paraphrase, or invent text. Keep vehicle and important
action clear of UI overlaps.
```

For dependable results, generate the full card in one PNG, then directly patch
small errors only when the overall style and layout are already correct.

## 16. Acceptance checklist

- [ ] PNG is exactly 1060 x 1484 px, RGB, opaque.
- [ ] Major zone edges remain within +/-12 px of master coordinates.
- [ ] Badge is correct: max=red ring, min=blue disk, any=gray ring.
- [ ] Name is exact, readable, maximum two lines.
- [ ] Illustration clearly communicates mechanic.
- [ ] Player vehicle model/color matches set and has no logo.
- [ ] Timing keyword is exact and in correct location.
- [ ] Effect text matches authoritative source character-for-character.
- [ ] Effect text is at least 36 px and does not touch borders/type tab.
- [ ] Type label and semantic color are correct.
- [ ] Timing tab, type tab, header slashes, and bottom strip use same card-type color.
- [ ] Deck plate is lower-left, flat 2D, tilted clockwise 5-8 degrees, first-line car/deck name, large second-line printed serial.
- [ ] Deck plate is large enough: visible plate about 240-265 x 112-130 px,
  placed near x=36-346 and y=1328-1478.
- [ ] Card composition is unique within its deck and visibly reflects the card name/action.
- [ ] Onomatopoeia is absent on most cards and used only where explicitly useful.
- [ ] Illustration contains no game UI, floating numbers, rule words, card
  props, or road labels.
- [ ] Any arrow, cut-in, dial, cockpit view, or see-through mechanical overlay
  explains motion/mechanics visually and does not contain card-effect rules text.
- [ ] Deck environment is correct: AE86 night dry road; HRCN sunny daytime road;
  P911 rainy night road; GT500 daytime offroad.
- [ ] No extra functional symbols or invented rules.
- [ ] Card remains readable at 530 x 742 px preview size.
- [ ] Card remains identifiable at approximately 159 x 223 px thumbnail size.

## 17. Notes from examples 01-17

- All 17 images are exactly **1060 x 1484 px** and use opaque 24-bit RGB.
- Cards 01-08 establish red AE86 set consistency.
- Cards 09-17 establish green supercar set consistency while retaining same UI.
- Cards 06, 12, and 17 are best references for diagrammatic art, dense effect
  text, and two-line title handling respectively.
- Examples contain visible AI inconsistencies, including occasional real-style
  vehicle marks and old effect values. These are not template requirements.
- Accent use in examples is inconsistent on cards 09, 12, and 15. Production
  cards should use deliberate accent assignment rather than copying that drift.

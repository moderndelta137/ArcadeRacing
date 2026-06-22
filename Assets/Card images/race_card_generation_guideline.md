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
7. Card-type tab, overlapping effect panel and bottom frame.
8. All text.

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

Visual language:

- Full-color 1990s Japanese street-racing manga color-page aesthetic.
- Strong black ink contours, halftone, speed lines, dynamic perspective.
- Dramatic mountain-road or road lighting. Night is preferred but daylight is
  permitted when card concept reads better.
- Vehicle color/model stays consistent within set.
- No copyrighted logos, real brand wordmarks, known characters, or copied manga
  panels. Remove generated manufacturer badges and readable license data.
- Japanese sound effects may appear only as decorative illustration art. They
  cannot replace required English UI text.

Composition must visualize mechanic:

| Mechanic | Visual cue |
|---|---|
| Acceleration/Gas | Rear squat, forward streaks, exhaust flare, open road |
| Braking | Nose dive, brake lights/discs, tire marks, corner entry |
| Turn/Drift | Visible steering/yaw, apex, racing line, lateral motion |
| Lane movement | Two readable lanes plus arrow/path |
| Multi-step movement | 2-3 car positions or numbered path markers |
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
green appear as deliberate accent variants. Pick one accent for header slashes,
timing tab, and bottom strip; do not mix accents randomly.

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
| Turn | Deep racing blue | `#003778` to `#064A99` |
| Brake | Dark red | `#900008` to `#B10A12` |
| Attack | Use dark red unless later approved otherwise | `#900008` to `#B10A12` |

Type color is semantic and must not change by vehicle set.

## 10. Color system

Measured colors vary because examples are raster-generated. Use these stable
production targets instead of sampling each card.

| Role | Target | Usage |
|---|---|---|
| Ink black | `#080808` | Frame, outlines, title, effect text |
| Paper white | `#F7F6F2` | Header and effect panel |
| Pure white | `#FFFFFF` | Keylines and reversed text |
| Primary red | `#C80A10` | Default speed accents, max badge ring |
| Primary blue | `#003D82` | Min badge and Gas/Turn tabs |
| Neutral gray | `#777777` | ANY badge ring |
| Optional green accent | `#2E8738` | Selected technique-card accent only |

Contrast requirements:

- Body text against panel: at least **12:1** preferred; never below **7:1**.
- White tab text against fill: at least **4.5:1**.
- Do not place body copy directly on illustration.
- Maximum three saturated UI colors per card: one accent, one type color, and
  requirement-sign color.

Vehicle set color belongs mainly to illustration. It does not automatically
recolor semantic requirement or type badges.

## 11. Typography

Raster references do not contain font metadata. Exact original font cannot be
verified. Use these controlled production substitutes:

| Role | Primary font | Fallback | Weight/style |
|---|---|---|---|
| Card name | `Road Rage` | `Bangers`, then custom dry-brush lettering | Regular, manually slanted 6-10 degrees |
| Requirement number/ANY | `Arial Black` | `Liberation Sans Bold` | Heavy, upright |
| Timing/type labels | `Arial Narrow` | `Roboto Condensed` | Bold Italic |
| Effect text | `Arial` | `Liberation Sans` | Bold |

Typography rules:

- Use Latin glyphs for all functional UI.
- Do not use brush font for effect text.
- Do not outline effect text.
- Tab text may use a subtle black shadow, maximum **3 px** offset/blur.
- Title should be hand-kerned. Reduce title size before horizontal scaling.
- Maximum horizontal compression: **90%**. Never stretch above 105%.
- Export fonts to raster at full size. Do not depend on image generation to
  spell functional text correctly; composite text after illustration generation.

## 12. Shared elements vs permitted variation

### Shared on every card

- Canvas, aspect ratio, outer frame, corner radius, safe area.
- Header/illustration/effect-panel division.
- Requirement badge location and semantic sign system.
- Title hierarchy.
- Timing-tab location.
- Effect-panel location and text treatment.
- Type-tab location and semantic color.
- Border weights, white keylines, halftone/speed-line texture.
- Full-color manga rendering style.

### Required variation

- Card name.
- Requirement value/style.
- Timing label.
- Exact effect text.
- Card type and corresponding type color.
- Vehicle model/color by card set.
- Illustration action and camera composition.

### Controlled variation

- Title may wrap to two lines.
- Illustration may use exterior, cockpit, elevated, diagrammatic, or close-up
  view when mechanic requires it.
- Accent may be red, blue, or green. Maintain one accent consistently across
  header slashes, timing tab, and bottom strip.
- Sound-effect lettering and road environment may vary.

### Prohibited variation

- Moving badge, timing tab, effect panel, or type tab to another region.
- Replacing circle requirement badge with another shape.
- Using illustration behind functional effect text.
- Changing type color for visual convenience.
- Omitting, duplicating, paraphrasing, or hallucinating rules text.
- Adding mana cost, rarity, set number, character portrait, logos, or other UI
  not present in this template.

## 13. Recommended production workflow

1. Read authoritative card fields from current card data.
2. Generate only the illustration, with safe zones stated in prompt.
3. Crop illustration to `1006 x 780 px` at target composition.
4. Composite fixed frame/header/panels.
5. Composite requirement badge, title, timing, effect, and type text as real
   typography. Do not rely on generative text.
6. Check exact text against source character-for-character.
7. Export RGB PNG at 1060 x 1484 px.
8. Run visual QA at 100%, 50%, and thumbnail scale.

## 14. Prompt template

```text
Create one portrait player race card at 1060 x 1484 px (5:7).
Use fixed racing-card layout: circular requirement badge at top left; brush-style
card name centered in header; large illustration from y=277 to y=1057; timing
tab overlapping illustration bottom-left; white effect panel below; card-type tab
at bottom-right. Preserve thick black rounded frame, white keylines, halftone,
speed slashes, and full-color 1990s Japanese street-racing manga color-page
style. Keep all functional text fully readable. Do not add logos or characters.

Name: "{NAME}"
Requirement: "{ANY | MAX N | MIN N}"
Timing: "{BEFORE | DRIVE | STEP | AFTER | STEP / AFTER}"
Type: "{GAS | BRAKE | TURN | ATTACK}"
Effect text: "{EXACT AUTHORITATIVE TEXT}"
Vehicle: "{MODEL DESCRIPTION AND COLOR, NO LOGOS}"
Illustration: "{UNIQUE ACTION, ROAD, CAMERA, MECHANIC-SPECIFIC CUES}"
Accent: "{RED | BLUE | GREEN}"

Do not omit, duplicate, paraphrase, or invent text. Keep vehicle and important
action clear of UI overlaps.
```

For dependable results, use prompt only for illustration and graphic texture.
Apply all English UI text in layout software or code afterward.

## 15. Acceptance checklist

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
- [ ] No extra functional symbols or invented rules.
- [ ] Card remains readable at 530 x 742 px preview size.
- [ ] Card remains identifiable at approximately 159 x 223 px thumbnail size.

## 16. Notes from examples 01-17

- All 17 images are exactly **1060 x 1484 px** and use opaque 24-bit RGB.
- Cards 01-08 establish red AE86 set consistency.
- Cards 09-17 establish green supercar set consistency while retaining same UI.
- Cards 06, 12, and 17 are best references for diagrammatic art, dense effect
  text, and two-line title handling respectively.
- Examples contain visible AI inconsistencies, including occasional real-style
  vehicle marks and old effect values. These are not template requirements.
- Accent use in examples is inconsistent on cards 09, 12, and 15. Production
  cards should use deliberate accent assignment rather than copying that drift.

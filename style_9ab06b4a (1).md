### Core colors

| Token | Value | Use |
|---|---:|---|
| `--black` | `#000000` | Page canvas |
| `--cream` | `#F5F3EA` | Primary text and bright neutral |
| `--red` | `#FF3B57` | Live/urgent state, active rail, lecture key |
| `--orange` | `#FFB13D` | Time, action, section eyebrow, tutorial key |
| `--muted` | `#9C99C2` | Secondary copy and metadata |
| `--navy` | `#14102A` | Hovered/selected dark surface |
| `--deep-red` | `#5C1524` | Red-tinted icon and panel surface |
| `--deep-orange` | `#5C3B12` | Orange-tinted icon and panel surface |
| `--line` | `#292531` | Default 1 px border/divider |

### Supporting observed values

- Raised surface: `#0D0C10` or `rgba(13, 12, 16, .82)`
- Table surface: `rgba(7, 7, 8, .86)`
- Subdued label: `#77728D`
- Faint footer/arrow: `#666176`
- Strong divider: `#3D3749` or `#473F55`
- Warm course tile: `#42220B` with `#FFB13D` rail
- Cyan course tile: `#102D37` with `#35C2D1` rail
- Red course tile: deep burgundy with `#FF3B57` rail
- Violet course tile: deep violet with a bright violet rail
- Green course tile: deep green with a mint rail
- Blue course tile: deep navy-blue with a periwinkle rail

### Backgrounds

The page uses true black plus one restrained ambient glow:

```css
background:
  radial-gradient(circle at 76% 2%, #1c1638 0, transparent 24rem),
  #000;
```

The featured “next” panel uses a transparent warm-to-cool gradient:

```css
background: linear-gradient(
  110deg,
  rgba(92, 21, 36, .72),
  rgba(20, 16, 42, .75) 58%,
  rgba(92, 59, 18, .30)
);
```

Use shadows sparingly. Separation should come from background contrast and borders.

## 3. Typography

### Families

| Role | Family | Weight |
|---|---|---:|
| Body/UI | Inter | 400–600 |
| Display headings | Space Grotesk | 600–700 |
| Telemetry, time, labels | IBM Plex Mono | 500–700 |
| Editorial group labels | EB Garamond Italic | 400–600 |

Fallbacks should end in `sans-serif`, `monospace`, and `serif` respectively.

### Type scale

- Hero/course title: `clamp(30px, 4vw, 54px) / 1`, Space Grotesk 700
- Live clock: `35px / 1`, IBM Plex Mono 600, tabular numerals
- Hero day number: `62px / 1`, IBM Plex Mono 500
- Bus departure: `34px / 1`, IBM Plex Mono 600
- Page/brand title: `28px / 1`, Space Grotesk 700
- Section title: `27px / 1.1`, Space Grotesk 700
- Card title: `14px`, Space Grotesk 600
- Row title: `12–13px`, Space Grotesk 600–700
- Body/supporting copy: `10–13px`, Inter 400–500
- Eyebrow/status label: `9–11px / 1`, IBM Plex Mono 600

### Rules

- Use uppercase mono labels for categories, dates, states, and actions.
- Keep normal letter spacing; the mono face provides sufficient rhythm.
- Use tabular numerals for clocks, countdowns, and departures.
- Do not use mono for long prose.
- Headings use sentence case; utility controls and telemetry use uppercase.

## 4. Layout and spacing

### Page frame

- Maximum content width: `1500px`
- Centered shell with `40px` inline padding
- Mobile inline padding: `18px`
- Header minimum height: `122px` desktop, `102px` mobile
- Major section separation: `46–70px`
- Common content gap: `18–34px`

### Primary grids

- Schedule area: `minmax(0, 3fr) minmax(260px, 1fr)` with `34px` gap
- Featured panel: `.9fr 1.4fr .8fr`; at medium width, content becomes two columns and metadata spans both
- Quick links: 4 columns desktop, 3 columns tablet, 1 column mobile
- Bus directions: 2 equal columns desktop, 1 column at `≤900px`

### Rhythm and geometry

- Default rule: `1px solid var(--line)`
- Featured/active rail: `4–5px` on the left
- Standard control height: `32–38px`
- Data row height: about `67–70px`
- Quick-link card minimum height: `104px`
- Default card padding: `19–28px`
- Border radius: `0`

Use grid boundaries as the composition. Adjacent cards should share borders rather than float as isolated tiles.


## 6. Interaction and motion

- Default transition duration: `.2s` for color, border, background, and small transforms.
- Hover should modify one or two properties only: border color, text color, brightness, or background.
- Keep movement to `2px` or less; the interface should feel instrument-like, not playful.
- Use visible `:focus-visible` states that match hover or add an inner outline.
- Course cells are keyboard focusable and reveal the same details on hover, focus, or tap.
- For live information, update text in place without layout shifts.
- Honor `prefers-reduced-motion: reduce` by disabling transitions and smooth scrolling.

## 7. Responsive behavior

### `≤1050px`

- Collapse schedule plus agenda to one column.
- Agenda becomes a two-column list where space permits.
- Quick access becomes three columns.
- Featured panel becomes two columns; metadata spans the full row.

### `≤900px`

- Stack bus directions.
- Planner grids collapse to one column.

### `≤720px`

- Reduce page padding to `18px`.
- Hide the brand eyebrow and live badge; reduce brand title and clock.
- Featured panel becomes one column in this order: identity, status, metadata.
- Use `21px` featured-panel padding and reduce the day number to `43px`.
- Hide nonessential legends/supporting heading copy.
- Stack link cards and form fields.
- Keep the timetable horizontally scrollable at an `830px` intrinsic width.

### `≤520px`

- Keep utility actions on one horizontal scroll rail rather than wrapping.
- Allow secondary advisory values to move to a new grid row.

Mobile should preserve the desktop visual identity: black canvas, hard rules, large course title, orange telemetry, and full-width data regions.

## 8. Accessibility

- Maintain strong contrast for primary cream text on black.
- Treat muted violet as supporting copy only; avoid it for critical small text without checking contrast.
- Never communicate course type or urgency by color alone; include labels, icons, or text.
- Keep controls at least `32px` high in dense desktop UI; expand touch targets toward `44px` on mobile where possible.
- Use semantic tables for timetables, `<time>` for times, real buttons/links for actions, and meaningful `aria-label`s for icon-only controls.
- Preserve keyboard access for timetable cells and planner actions.
- Ensure horizontal timetable overflow is discoverable and touch-scrollable.
- Use a polite live region for clock/countdown announcements only if updates need to be exposed; do not announce every second.

## 9. Reference CSS

```css
:root {
  color-scheme: dark;
  --black: #000;
  --red: #ff3b57;
  --orange: #ffb13d;
  --cream: #f5f3ea;
  --muted: #9c99c2;
  --deep-red: #5c1524;
  --deep-orange: #5c3b12;
  --navy: #14102a;
  --line: #292531;

  --font-body: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-serif: "EB Garamond", serif;

  --page-max: 1500px;
  --page-gutter: 40px;
  --section-gap: 66px;
  --content-gap: 34px;
  --rule: 1px solid var(--line);
  --transition: .2s ease;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  color: var(--cream);
  background:
    radial-gradient(circle at 76% 2%, #1c1638 0, transparent 24rem),
    var(--black);
  font-family: var(--font-body);
}

.shell {
  width: min(var(--page-max), 100%);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
  overflow: hidden;
}

.eyebrow {
  color: var(--orange);
  font: 600 11px/1 var(--font-mono);
  text-transform: uppercase;
}

.section-title {
  margin: 7px 0 0;
  font: 700 27px/1.1 var(--font-display);
}

.control {
  min-height: 32px;
  padding-inline: 11px;
  color: var(--muted);
  background: #0d0c10;
  border: var(--rule);
  border-radius: 0;
  font: 600 9px var(--font-mono);
  transition: color var(--transition), border-color var(--transition);
}

.control:hover,
.control:focus-visible {
  color: var(--orange);
  border-color: var(--orange);
  outline: 0;
}

.panel {
  background: rgba(13, 12, 16, .82);
  border: var(--rule);
  border-radius: 0;
}

@media (max-width: 720px) {
  :root { --page-gutter: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
```

## 10. Do / don't

### Do

- Use orange for actionable/time-critical information and red for live/urgent state.
- Build hierarchy with type, rules, and spacing.
- Keep data aligned to a clear grid.
- Use one bold focal number or title per region.
- Preserve square corners and restrained transitions.

### Don't

- Add rounded cards, soft drop shadows, glossy gradients, or glass blur.
- Turn every element into a different accent color.
- Use large body text or generous card padding that destroys information density.
- Collapse timetable columns until labels become unreadable; enable scrolling instead.
- Use serif beyond small editorial group labels.
- Animate clocks, rows, or panels continuously.

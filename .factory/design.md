# Announce Check visual thesis

## Direction: generative geometry as an audible contract

Announce Check turns an invisible sequence into something a team can review. Its
visual language is a field of precise geometric nodes crossed by one continuous
signal: circles are focus targets, stepped lines are flow actions, and expanding
arcs are live-region announcements. The geometry is structural, not confetti.
It explains the product's core model before the reader reaches the API example.

The interface is intentionally single-mode, painted as a warm paper workspace.
This keeps code, checks, and the expected/received comparison calm and legible;
the near-black “instrument” panels establish depth without requiring a theme
switch or borrowing the default dark-devtool look.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#f4f0e6` | page background |
| Paper lift | `#fffdf7` | results, code surround |
| Ink | `#171923` | primary text |
| Muted ink | `#5d5f68` | supporting text (≥ 5.7:1 on paper) |
| Blueprint | `#2446d8` | actions, links, focus geometry |
| Blueprint deep | `#142a91` | hover and high-contrast linework |
| Signal coral | `#c23b2a` | first divergence and warnings |
| Confirm | `#1d7148` | matching announcements |
| Instrument | `#171a23` | transcript/code panels |
| Instrument text | `#f8f4e9` | panel text |
| Grid line | `#d5d0c4` | rules and geometric construction |

No generic gradient is used. Color is always paired with a symbol or label.

## Type and spacing

Headings use the self-host-free system editorial stack `Iowan Old Style`,
`Palatino Linotype`, Georgia, serif: an approval document rather than a startup
billboard. UI, code, numbers, and body copy use `ui-monospace`, SFMono-Regular,
Consolas, monospace so transcripts retain a measured, comparable rhythm. No
font files or third-party requests are needed.

The type scale is 14 / 16 / 20 / 32 / 56 px. Body text never drops below 16 px.
Spacing follows an 8 px base with 4 px optical adjustments. Reading measure is
68 characters; content width is 1180 px. Rules and alignment do more grouping
work than cards.

## Interaction grammar and motion

Controls are rectangular “test instruments” with a 2 px lower-right offset
shadow. On hover they rise by 2 px; on press they return to the baseline. Focus
uses a 3 px blueprint outline with a 3 px paper gap. Transcript rows reveal in
sequence over 240 ms, moving only on the Y axis. The hero signal drifts once on
entry and then remains still—nothing loops.

With `prefers-reduced-motion: reduce`, all translations and staged delays are
removed and state changes are instant. Meaning, order, and depth remain through
line weight, scale, and contrast.

## Responsive intent

At 390 px, the decorative coordinate labels and secondary navigation disappear;
the contract steps stack, comparison columns become a single ordered stream,
and all actions retain 44 px targets. The hero artwork stays below the claim so
the one-line install command remains the first useful action.

## Original asset plan and provenance

- `site/public/announce-field.webp`: original generative-geometry hero showing
  a left-to-right focus path becoming audible concentric arcs. Generated for
  this product with `/opt/fleet/lib/gen-image.sh` using the factory
  `factory-image` deployment, then locally resized/encoded as WebP. No source
  image, trademark, logo, or third-party asset is used.
- Generation prompt: “Abstract editorial generative geometry for an
  accessibility developer tool: warm uncoated paper ground, precise cobalt
  circles and stepped paths representing keyboard focus, one coral divergence
  node, expanding dark ink arcs suggesting an announcement, sparse technical
  registration marks, subtle screenprint grain, strong negative space, flat
  orthographic composition, no gradients, no text, no letters, no logos, no
  UI screenshot, no people, original artwork, wide 3:2 composition.”
- Product icons are hand-made inline SVG using the same circle/path grammar.
  They are code-native, decorative where appropriate, and carry no external
  license obligations.
- `site/public/og-image.webp` and `site/public/apple-touch-icon.png` are local
  crops of `announce-field.webp`, made with ImageMagick. They introduce no new
  source material or license.

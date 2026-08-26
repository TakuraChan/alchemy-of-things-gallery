---
name: restraint
description: Design and write UI in the "Alchemy of Things" house style — a restrained, gallery-grade aesthetic built on silence, serif italics, and generous space. Use whenever building or reviewing a page, component, layout, colour choice, microcopy, or visual treatment for this site, or when asked for something "in my style", "restrained", "minimal", "quiet", or "dignified". Also use to audit an existing screen for promotional or commercial creep, or before adding a page, section or navigation level — the site repeats one shape at every scale and §2 governs that.
---

# Restraint

A design system for work that does not ask to be looked at.

**Governing sentence:** *The website is not trying to be seen. It is present for those who find it.*

This is a container for finished work — not a shop, not a portfolio, not a brand. Every decision below follows from that.

---

## 1. The five principles

Apply in order. When two conflict, the earlier one wins.

| # | Principle | In practice |
|---|---|---|
| 1 | **Restraint over abundance** | One language. Fewer pages. No social links, no footer clutter, no secondary nav. |
| 2 | **Ambiguity over explanation** | No wall text, no artist statement, no "this work explores…". Metadata only. |
| 3 | **Presence over promotion** | No hero copy, no CTA, no scroll prompts. The page simply *is* when it loads. |
| 4 | **Authority without spectacle** | No animation beyond a 0.3–0.6s fade. No parallax, no hover tricks, no shadows. |
| 5 | **Available, not accessible** | Email only. No forms with urgency, no WhatsApp, no "Get in touch!" energy. |

---

## 2. The fractal

**One shape, repeated at every scale.** This is not decoration; it is how the site is navigated, and it holds whether there are three works or three hundred.

    symbol  →  hub  →  section  →  collection / index  →  the thing itself

Every level is the same move: **a name, a quiet list of names, and nothing else.** No descriptions, no counts, no previews, no summaries. You descend by choosing a name. Nothing announces what you will find.

The document repeats it inside itself — parts, then numbered sections, then entries — which is why a piece of writing belongs here at all. A thought experiment that could not be read at three depths is probably an essay, not a thought experiment.

**Rules that follow**

- **Reuse the level's shape.** Before designing a new page, find the level it sits at and take that level's existing form (`.hub-nav`, `.thought-entry`, `.collection-header` + `.work-thumb`). A new navigation idiom at one level breaks every other.
- **Ascend by name.** The line at the top of a page states the level you are in and links up — *Thoughts*, *Thought experiment 1*. The name is the way back; a page does not need an arrow as well.
- **Number, do not date.** Positional numbering (`Thought experiment 1`, `I. The Thesis`) survives reordering and says nothing about frequency. Dates imply a feed and go stale.
- **Depth over breadth.** When a level gets crowded, add a level rather than widening the list. When a level holds one thing, it still keeps its shape — it does not collapse into its parent.
- **Same page, one level up or down.** Swap the content of any index for its parent's or its child's: the layout should still be right. If it is not, the shape has drifted.

---

## 3. Tokens — use these, do not invent new ones

```css
:root{
  --bg:#faf9f7;      /* warm off-white — never #fff for page ground */
  --text:#1a1a1a;    /* soft black — never #000 */
  --muted:#6b6b6b;   /* metadata, secondary text */
  --light:#999;      /* tertiary, disabled, muted headers */
  --border:#e8e6e3;  /* hairlines only, 1px */
  --font-display:'Cormorant Garamond',serif;  /* italic, for names of things */
  --font-body:'Jost',sans-serif;              /* weight 300, for everything else */
}
```

**Accent colour:** there is none. The artwork supplies all colour. The one exception is the availability dot `#4a7c59` at 6px — a fact, not a highlight.

**Type rules**
- Body: `--font-body`, weight **300**, 16px, line-height **1.7**.
- Titles of works, collections, and sections: `--font-display`, **italic**, weight 400, 0.9–1.85rem. Italic serif marks *the name of a thing*; nothing else uses it.
- Never bold. Never uppercase. Buttons use `text-transform:lowercase`.
- Letter-spacing only on the one entry button: `.05em`.

**Space**
- Padding in whole rems: `1rem` / `2rem` / `3rem` / `4rem`.
- Whitespace is the primary compositional material. When a layout feels wrong, remove an element before adding one.

**Motion**
- Permitted: `opacity`/`color` transitions at `.3s`, page fades at `.6s`, `fadeUp` on entry.
- Hover on a link is `opacity:.6`. That is the whole interaction vocabulary.
- Forbidden: scroll-triggered animation, transforms over 1.15 scale, easing curves that call attention, loading spinners on the public site.

**Surfaces**
- No box-shadows. No border-radius except true circles (dots, avatars).
- Separation is a `1px solid var(--border)` hairline or nothing at all.

---

## 4. Language

Write like a catalogue, not a website.

| Never | Instead |
|---|---|
| "Sold" | **"Held"** — temporary, not transactional |
| "Buy", "Shop", "Enquire now" | **"For acquisition inquiries"** |
| "Explore", "Discover", "Learn more" | *(omit — let the link be the noun)* |
| "Untitled #3 — a study of grief" | **"Untitled (Red III)"** |
| Prices, "POA", "Limited", "Only 3 left" | *(never public — inquiry is quiet)* |
| Exclamation marks, emoji | *(never)* |

Titles are descriptive, not narrative. Roman numerals are formal and timeless. Status is `Available` or `Held`. Metadata is exactly: title, year, medium, dimensions, status — in that order, nothing more.

Microcopy is lowercase where it is an action (`enter`), sentence case where it is a fact.

---

## 5. Layout patterns already in the system — reuse, don't reinvent

Defined in `css/style.css`:

- `.landing-page` — symbol at top, single image centred, one `enter` button at the bottom. No text.
- `.hub-page` — a vertical stack of italic serif links, `gap:2rem`. Nothing else.
- `.works` — horizontal scroll-snap gallery, one work per viewport, scrollbar hidden.
- `.work-item` / `.work-meta` / `.work-title` — image first, metadata centred beneath in `--muted` at `.85rem`.
- `.collection-header` — italic serif, 1.3rem; use `.collection-header-muted` for unfinished.
- `.work-thumb` — 200px wide, 150px cover image, italic serif caption in `--muted`.
- `.lightbox` — `rgba(0,0,0,.9)`, image at 95%, a single `×`.
- `.heart-rating` — outline hearts (`stroke:#999`, `fill:none`) filling to `#666`. Grey, never red. Three taps maximum.

**Unfinished work** carries `filter:grayscale(90%); opacity:.9`, shows no metadata, and takes no ratings. Its collection always sorts **last**.

---

## 6. Checklist before shipping any screen

- [ ] Would this survive unchanged for five years?
- [ ] Does this repeat the shape of its level, or invent a new one?
- [ ] Is anything here explaining, selling, or convincing? → delete it
- [ ] Can any sentence be shorter? Can it be removed entirely?
- [ ] Does any element call attention to itself rather than the work?
- [ ] Is there a colour that isn't the artwork's?
- [ ] Is there a shadow, radius, gradient, or animation that isn't in §3?
- [ ] Does the page still make sense with all copy removed?
- [ ] Have I added a feature because it's expected of artist websites, rather than because it's needed?

If a change fails any line, subtract rather than adjust.

---

## 7. When extending the system

**Add slowly.** New work is added only when resolved. New *features* are added only when the absence causes a real failure — never because a category of site usually has one.

**Subtract first.** The correct response to "this feels off" is almost always removal.

**Protect the dial.** Name, biography, and exposure can increase only when structurally necessary. They never increase because visibility is available.

**Things deliberately absent** — do not propose them unprompted: biography, CV, portrait, artist statement, press quotes, testimonials, newsletter signup, social feeds, analytics, cookie banners, related-works carousels, share buttons, prices.

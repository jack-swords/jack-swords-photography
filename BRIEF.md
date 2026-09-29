# Build Brief: Photography Portfolio + Story Site

Work through the milestones in order and stop for review at the end of each one.

---

## 1. Goal

A photography portfolio where the photos dominate. Four page types: a homepage, a projects index, a project page (full-bleed hero + long vertical scroll of images with text between), and an about page. All content, images, and layout settings live in an external CMS so the site can be updated visually or programmatically without touching code.

The reference sites below are for **layout patterns and interaction ideas only**. Build an original design: do not copy their code, CSS, images, text, fonts, or logos.

## 2. Stack

- **Framework:** Next.js (App Router, TypeScript), deployed on Vercel
- **CMS / database:** Sanity (Content Lake as the external database, Studio embedded at `/studio`)
- **Visual editing:** Sanity Presentation tool + Next.js Draft Mode, so I can click on anything on the live page and edit it
- **Images:** Sanity asset pipeline (originals stored in Sanity, served via its image CDN with `auto=format`, responsive `srcset`, hotspot/crop, LQIP blur placeholders)
- **Styling:** Tailwind or CSS Modules; keep a small set of design tokens (colors, type scale, spacing) in one place
- **Revalidation:** Sanity webhook → Next.js route that revalidates by cache tag, so published changes go live in seconds

If a different choice is clearly better for any of this, say so before starting, don't just switch.

## 3. Site map

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/projects` | Projects index |
| `/projects/[slug]` | Single project |
| `/about` | About / contact |
| `/studio` | Sanity Studio (auth-protected) |

## 4. Global design direction

Minimal, editorial, lots of whitespace. Small, quiet UI type (one sans or mono for UI, optionally a serif for story text). Navigation is text-only and understated. Photos are never cropped unless a block explicitly asks for it. Neutral background (near-white default, dark theme optional via settings). No UI chrome competes with images.

## 5. Page specs

### 5.1 Homepage — reference: https://pawelachtelik.com

**STATUS: TO CONFIRM.** This site renders with JavaScript and its layout hasn't been captured yet. Before building the homepage:

1. Open it with Playwright (desktop 1440px and mobile 390px), take screenshots, and scroll through it.
2. Write a short description of its layout, navigation, and interactions.
3. Wait for confirmation before implementing.

It's tagged as "minimal / unusual layout", so expect an unconventional arrangement of images rather than a standard grid. The homepage content (which projects/images appear, and in what order) must be controlled from a `homepage` document in Sanity.

### 5.2 Projects index — reference: https://julianoni.com/projects/

- Text-based header nav in bracketed style, e.g. `[ Selected ]  [ Works ]  [ About ]`.
- A filter row of categories with counts, e.g. `All projects (24)  Editorial (9)  Personal (7) …`. Counts are computed from the data. Clicking a category filters the list in place (no page reload) and updates the URL (`?category=editorial`).
- The list itself is typographic: one row per project showing **title**, **category**, and **image count**. Dense, clean, aligned in columns.
- On hover (desktop), a preview image of that project appears (either following the cursor or in a fixed position; make it a setting). On touch devices, show a small thumbnail inline in the row instead.
- Clicking a row opens the project page.
- Ordering controlled manually in Sanity (drag to reorder), with a fallback to date.

### 5.3 Project page, header — reference: https://kaiblamey.com

- Full-screen, full-bleed hero: `100svh`, edge to edge, `object-fit: cover`, respecting the Sanity hotspot as the focal point.
- The hero can be an **image or a muted, looping, autoplaying video** (with a poster image). Video respects `prefers-reduced-motion` by showing the poster only.
- Overlaid on the hero in small text: site name (top-left, links home), project title, and credits as label/value pairs (e.g. `Client  Vogue`, `Styling  Jane Doe`). Credits are a repeatable list in the CMS.
- Overlay text colour is set per project (light/dark) so it stays readable.
- A subtle scroll cue at the bottom.
- The hero image loads with `priority`; nothing else above the fold.

### 5.4 Project page, body — reference: https://tillmannfranzen.com/projects/editorial-portraits/

After the hero, the project continues as a long vertical scroll:

- **Intro:** project title and a short subtitle/standfirst.
- **Image stream:** images presented one after another down the page, centred at a constrained width, each with an optional two-line caption beneath (line 1: subject/description; line 2: secondary info such as publication or location, in lighter type).
- **Numbered image index:** a fixed, discreet column of numbers (`1 2 3 … N`) along one edge. The number of the image currently in view is highlighted as you scroll (IntersectionObserver). Clicking a number smooth-scrolls to that image. Hidden on mobile or collapsed into a compact counter (`4 / 24`).
- **Close control:** a small `[x]` / "close" that returns to `/projects` (preserving any active filter).
- **Next projects:** at the end, teasers linking to 1–2 other projects (title + short description + thumbnail), chosen manually or falling back to the next in order.

**Layout blocks.** The stream is built from an ordered array of blocks arranged in Sanity:

| Block | Behaviour |
|---|---|
| `imageSingle` | One image; width options: `narrow`, `medium`, `wide`; alignment `left/centre/right` |
| `imageFullBleed` | Edge-to-edge image (optionally `100svh`) |
| `imagePair` | Two images side by side; option to align tops or bottoms; gap setting |
| `imageGrid2x2` | Four images in a 2×2 grid |
| `imageOffset` | Two images staggered: one higher and to the left, one lower and to the right; configurable offset amount and which side leads |
| `text` | Rich text (headings, paragraphs, italics, links, pull quotes) at a comfortable reading width |
| `spacer` | Extra vertical space: `S / M / L` |

Rules for all image blocks: every image has required alt text and an optional caption; images keep their original aspect ratio unless a block explicitly crops; the numbered index counts every image across all blocks in order; on mobile, multi-image blocks stack to a single column (with a per-block option to keep pairs side by side).

### 5.5 About

Portrait, bio (rich text), clients list, contact links, representation/agent details. All editable in Sanity.

## 6. Data model (Sanity schemas)

- **`siteSettings`** (singleton): site title, nav labels, contact email, social links, default OG image, theme (light/dark), index hover-preview mode.
- **`homepage`** (singleton): fields depend on 5.1 once confirmed; at minimum an ordered list of featured projects/images.
- **`category`**: title, slug, order.
- **`project`**: title, slug, subtitle, categories (refs), date, hero (image or video file/URL + poster), heroTextTone (`light|dark`), credits (array of `{label, value}`), `blocks`, nextProjects (refs), SEO fields (title, description, OG image), orderRank for manual ordering.
- **`about`** (singleton): portrait, bio, clients, contact, representation.
- **Block objects:** one schema per block type in 5.4, each with a custom Studio preview (thumbnail + block name).

Image counts on the index are derived from the blocks, not typed in.

## 7. Content workflows

- **Visual editing:** Presentation tool wired up so any page can be opened in Studio, an element clicked and edited with live preview of drafts.
- **Bulk import script:** `pnpm import:project <folder> --title "…" --category editorial` uploads every image in a folder to Sanity (reading EXIF for dates, using filenames for ordering), creates a draft project, and fills the blocks array with `imageSingle` blocks.
- **Seed script:** creates 3 demo projects with placeholder images covering every block type.
- **Programmatic updates:** document the Sanity write token setup and give a short example of updating a project via the API.

## 8. Quality bar

- **Performance:** hero LCP under 2.5s on 4G; all images lazy-loaded except the hero; width/height or aspect-ratio set everywhere so layout shift is zero; AVIF/WebP via the CDN; LQIP blur-up.
- **Accessibility:** required alt text, keyboard-navigable nav/filters/index, visible focus states, `prefers-reduced-motion` respected for video, smooth scroll, and any hover effects.
- **Responsive:** designed for 390px, 768px, 1440px and 2560px widths.
- **SEO:** per-page metadata, OG images from project hero, `sitemap.xml`, `robots.txt`, structured data for the portfolio.
- **Protection (light):** disabling right-click save is **not** required; do strip EXIF GPS data on upload.

## 9. Milestones (stop for review after each)

1. **Scaffold:** Next.js + Sanity project, schemas, Studio at `/studio`, seed script, deploy a preview to Vercel.
2. **Project page:** hero (5.3) + body stream, all block types, numbered index, close, next projects (5.4).
3. **Projects index** (5.2) with filters, counts and hover previews.
4. **Homepage:** screenshot + describe reference first (5.1), then build after confirmation.
5. **About page**, visual editing (Presentation + Draft Mode), revalidation webhook.
6. **Import script**, performance/accessibility pass, SEO, production deploy.

## 10. Acceptance checklist

- [ ] Create a project in Studio, drag blocks into any order, and see it live with visual editing
- [ ] All seven block types render correctly on desktop and mobile
- [ ] The numbered index tracks scroll position and jumps on click
- [ ] Index filters update counts, list and URL without a reload
- [ ] Hero works with both image and video, and respects the hotspot
- [ ] Publishing in Studio updates production within ~10 seconds
- [ ] `pnpm import:project` turns a folder of photos into a draft project
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on a project page

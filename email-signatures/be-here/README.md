# Be.Here. email signatures (Outlook)

Built from `Full Design with text example.svg`. A single signature with both logos coded in: the **dark logo in light mode** and the **light logo in dark mode**. Spacing matches the design. The Figma card (316 px wide, with padding) was only a frame for the design, so the signature has no card, fixed width or padding and sits directly in the email body.

## Files

| File | What it is |
| --- | --- |
| `signature-generator.html` | Open in a browser. Edit the text, then **Copy signature** and paste into Outlook. It works offline, with both logos embedded. |
| `assets/logo-dark.png` | Off-black logo and strapline for light mode, with a fine off-white edge. 3× resolution, shown at 148 × 41. |
| `assets/logo-light.png` | Off-white logo and strapline for dark mode. Same size. |
| `preview-modes.png` | Light mode, dark mode with the swap working, and dark mode if the swap code is stripped. |

## What's editable and what's fixed

- **Editable (above the line):** name, job title, email, phone, website, and both social labels and links. Leave a field empty and its line is removed.
- **Fixed (below the line):** the divider (coded), plus the logo and strapline. The logo and strapline are images, so the serif lettering stays exact in every mail client.

## Fonts

The font stack is `'Instrument Sans', Arial, Helvetica, sans-serif`. Outlook doesn't load web fonts, so recipients who don't have Instrument Sans installed see Arial. Arial's letter widths at 12/14px match Instrument Sans almost exactly, so the line lengths and the two-column layout hold.

- Name: 14px, weight 600 (Arial shows it as bold), letter-spacing −1%
- Body: 12px, weight 400, letter-spacing −1%
- Every line is 18px tall, the same rhythm as the design

## Width

There's no maximum width. The divider is 266px long, as designed, and the social column starts 147px in. Long names, titles or email addresses don't wrap. Instead they widen the signature, and the divider grows with them. The social column always keeps at least a 24px gap.

## How the light/dark swap works

Both logos are in the signature: the dark logo for light mode, and the light logo for dark mode. Mail apps and Outlook's editors strip different parts of HTML, so the swap is built in independent layers. Whichever parts survive, any one of them can still do the swap.

1. **`<picture>` with a dark-mode source.** This needs no `<style>` block at all. Apple Mail and iPhone/iPad Mail use it to load the light logo in dark mode.
2. **A `<style>` block** with two kinds of rule:
   - `@media (prefers-color-scheme: dark)`, for Apple Mail, iPhone/iPad Mail and other WebKit-based apps.
   - `[data-ogsc]`, the attribute Outlook.com and Outlook for iOS and Android add in dark mode.

   Each rule finds the logos three ways: by class, by alt text, and by file name (the last only when images are hosted). Editors often strip class names but rarely alt text, so the swap still works without classes. The block is included twice, before the signature and inside it, because editors strip in different places.
3. In dark mode the same rules turn the text off-white (`#FEFEFE`) and the divider `#949494`.

The light logo is hidden with inline styles on the image itself (`display:none`, 1 × 1px, `mso-hide:all`). If every swap layer is stripped, only the dark logo shows, and its fine off-white edge keeps it readable.

Colours are a very slightly off black (`#121212`, from the design) and off white (`#FEFEFE`). The signature has no background colour, so it takes the email's own background.

### Tested in a browser

These cases were rendered from the exact HTML the Copy button produces, in a browser set to light and to dark mode:

| What a mail app or editor keeps | Light mode | Dark mode |
| --- | --- | --- |
| Everything | Dark logo | Light logo |
| Everything except class names | Dark logo | Light logo (matched by alt text) |
| No `<style>` block | Dark logo | Light logo (via `<picture>`) |
| No `<style>` block and no `<picture>` source | Dark logo | Dark logo with its edge |
| Nothing (all styling stripped) | Dark logo | Dark logo; the light one is 1 × 1px |

### If you still see the outlined logo

Paste the source of the received test email into **Check a test email** in the generator. It reports which layers survived. There are two possible causes:

- **The app you're viewing in doesn't support dark-mode code.** Classic Outlook for Windows ignores all of it when showing email, so the outlined logo is the most it can display, whatever the code does. Gmail is similar.
- **The code was stripped before sending.** This happens when Outlook's signature editor, or Outlook when composing, removes the `<style>` block and the `<picture>` source. No change to the signature code can prevent that. The fix is to add the signature on the mail server with a service such as Exclaimer or CodeTwo, which keeps the HTML intact.

## Divider

The design's 0.5px line is a 1px line in the blended grey (`#898989`, or `#949494` in dark mode), because email clients can't draw half pixels.

## Classic Outlook for Windows

The classic desktop app can't show embedded (base64) images. Do this first:

1. Upload `logo-dark.png` and `logo-light.png` to a public URL, e.g. `https://www.be-here.travel/email/`.
2. Put that folder URL in the generator's **Image folder URL** field.
3. Copy the signature and paste it into Outlook, or use **Download .htm** and save the file to `%APPDATA%\Microsoft\Signatures`.

Hosted images are also the more reliable option for New Outlook, Outlook on the web and Outlook for Mac.

# Be.Here. email signatures (Outlook)

Built from `Full Design with text example.svg`. Light and dark versions, 316 × 249 px, spacing matched to the design.

## Files

| File | What it is |
| --- | --- |
| `signature-generator.html` | Open in a browser. Edit the text, then **Copy signature** and paste into Outlook. Works offline, with the logo embedded. |
| `assets/logo-light.png`, `assets/logo-dark.png` | The fixed logo and strapline at 3× resolution (shown at 148 × 41). Upload these if you want hosted images. |
| `preview-comparison.png` | Left: the original design. Middle: the build in Instrument Sans. Right: the build in the Arial fallback. |

## What's editable and what's fixed

- **Editable (above the line):** name, job title, email, phone, website, and both social labels and links. Leave a field empty and its line is removed.
- **Fixed (below the line):** the divider, the logo and the strapline. They're a single image, so the serif lettering stays exact in every mail client.

## Fonts

The font stack is `'Instrument Sans', Arial, Helvetica, sans-serif`. Outlook doesn't load web fonts, so recipients who don't have Instrument Sans installed see Arial. Arial was chosen because its letter widths at 12/14px match Instrument Sans almost exactly, so the line lengths and the two-column layout hold.

- Name: 14px, weight 600 (Arial shows it as bold), letter-spacing −1%
- Body: 12px, weight 400, letter-spacing −1%
- Every line is 18px tall, the same rhythm as the design

## Light and dark mode

- **Light:** white card, #121212 text. **Dark:** #292929 card, white text. Both colours are set on the signature itself, so each version keeps its look in any client.
- Outlook's dark mode can still recolour the light signature. To keep the logo readable when that happens, each PNG has a fine halo in its own card colour: white for the light logo, #292929 for the dark one. On the right background the halo doesn't show.
- The 0.5px divider becomes a 1px line in the blended tone (#898989 on light, #949494 on dark), because Outlook can't draw half pixels.

## Classic Outlook for Windows

The classic desktop app can't show embedded (base64) images. Do this first:

1. Upload both PNGs to a public URL, e.g. `https://www.be-here.travel/email/`.
2. Put that folder URL in the generator's **Image folder URL** field.
3. Copy the signature and paste it into Outlook, or use **Download .htm** and save the file to `%APPDATA%\Microsoft\Signatures`.

The hosted images are also the more reliable option for New Outlook, Outlook on the web and Outlook for Mac.

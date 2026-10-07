# Be.Here. email signatures (Outlook)

Built from `Full Design with text example.svg`. A single signature that works in both light and dark mode, with spacing matched to the design. The Figma card (316 px wide, with padding) was only a frame for the design, so the signature has no card, fixed width or padding and sits directly in the email body.

## Files

| File | What it is |
| --- | --- |
| `signature-generator.html` | Open in a browser. Edit the text, then **Copy signature** and paste into Outlook. Works offline, with the logo embedded. |
| `assets/logo.png` | The fixed logo and strapline at 3× resolution (shown at 148 × 41). Upload it if you want a hosted image. |
| `preview-comparison.png` | Columns, left to right: the original design (card padding cropped off), the build in Instrument Sans, the build in the Arial fallback. Top row: light mode. Bottom row: the original dark design, then a simulation of Outlook's dark mode. |

## What's editable and what's fixed

- **Editable (above the line):** name, job title, email, phone, website, and both social labels and links. Leave a field empty and its line is removed.
- **Fixed (below the line):** the divider (coded), plus the logo and strapline. The logo and strapline are one image, so the serif lettering stays exact in every mail client.

## Fonts

The font stack is `'Instrument Sans', Arial, Helvetica, sans-serif`. Outlook doesn't load web fonts, so recipients who don't have Instrument Sans installed see Arial. Arial was chosen because its letter widths at 12/14px match Instrument Sans almost exactly, so the line lengths and the two-column layout hold.

- Name: 14px, weight 600 (Arial shows it as bold), letter-spacing −1%
- Body: 12px, weight 400, letter-spacing −1%
- Every line is 18px tall, the same rhythm as the design

## Width

There's no maximum width. The divider is 266px long, as designed, and the social column starts 147px in. Long names, titles or email addresses don't wrap. Instead they widen the signature, and the divider grows with them. The social column always keeps at least a 24px gap.

## Light and dark mode: one signature

Outlook can't swap images or styles between light and dark mode, so the signature is coded once and lets Outlook's dark mode recolour it:

- No background colour: the signature takes the email's own background. Text: off-black `#121212`, the black from the design, which Outlook's dark mode lightens. The logo halo is off-white `#FEFEFE`.
- Divider: a 1px mid-grey line (`#898989`). It stands in for the design's 0.5px line, because Outlook can't draw half pixels, and it reads on both backgrounds.
- Logo: one transparent PNG with off-black lettering and a fine off-white halo. In light mode the halo is invisible. In dark mode Outlook leaves images untouched, so the logo shows as off-black lettering with an off-white edge, which reads as an outline. A single image can't turn solid white in dark mode.
- The off-black and off-white values are `OFF_BLACK` / `OFF_WHITE` at the top of the script in `signature-generator.html`. After changing them, regenerate `logo.png` with the matching colours.

## Swapping the logo in dark mode

Outlook doesn't support this when the signature is pasted in. A swap needs a `<style>` block, either a `prefers-color-scheme` media query or Outlook's `[data-ogsc]` selectors. Outlook's signature editors strip `<style>` blocks, and if they also dropped the hidden-image styling, both logos would appear. The pasted signature therefore uses the single haloed logo.

The swap only works if the signature is added on the mail server by a signature service such as Exclaimer or CodeTwo, rather than pasted into Outlook. Even then, it only reaches recipients whose mail apps support it: Apple Mail, Outlook for Mac, Outlook.com and Outlook on iOS and Android. Classic Outlook for Windows and Gmail would still show the default logo.

## Classic Outlook for Windows

The classic desktop app can't show embedded (base64) images. Do this first:

1. Upload `logo.png` to a public URL, e.g. `https://www.be-here.travel/email/`.
2. Put that folder URL in the generator's **Image folder URL** field.
3. Copy the signature and paste it into Outlook, or use **Download .htm** and save the file to `%APPDATA%\Microsoft\Signatures`.

A hosted image is also the more reliable option for New Outlook, Outlook on the web and Outlook for Mac.

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

Both logos are in the signature. A small `<style>` block at the top switches between them:

- **Light mode:** the dark logo shows. The light logo is hidden with inline styles.
- **Dark mode:** the rules hide the dark logo and show the light one. They also set the text to off-white `#FEFEFE` and the divider to `#949494`. Two kinds of rule do this:
  - `@media (prefers-color-scheme: dark)`, for Apple Mail, iPhone and iPad Mail, and other WebKit-based apps.
  - `[data-ogsc]`, the attribute Outlook.com and Outlook for iOS and Android add in dark mode.

Colours are a very slightly off black (`#121212`, from the design) and off white (`#FEFEFE`). The signature has no background colour, so it takes the email's own background.

### Where it won't swap, and what shows instead

Some mail apps ignore these rules: Classic Outlook for Windows, Gmail, and possibly New Outlook. Outlook's signature editors may also strip the `<style>` block when you paste the signature in. In either case the signature still works, without the swap:

- **Swap code stripped:** the light logo stays hidden. The dark logo shows, and its fine off-white edge keeps it readable if the app darkens the email. Outlook recolours the text itself.
- **Inline styles stripped as well:** the light logo is only 1 × 1 px, so two logos never appear.

I tested all of these cases in a browser using the HTML the Copy button produces. Outlook itself hasn't been tested yet. Send a test email to yourself and view it in each app you care about, in dark mode. If your Outlook strips the swap code, adding the signature on the mail server with a service such as Exclaimer or CodeTwo keeps the `<style>` block intact.

## Divider

The design's 0.5px line is a 1px line in the blended grey (`#898989`, or `#949494` in dark mode), because email clients can't draw half pixels.

## Classic Outlook for Windows

The classic desktop app can't show embedded (base64) images. Do this first:

1. Upload `logo-dark.png` and `logo-light.png` to a public URL, e.g. `https://www.be-here.travel/email/`.
2. Put that folder URL in the generator's **Image folder URL** field.
3. Copy the signature and paste it into Outlook, or use **Download .htm** and save the file to `%APPDATA%\Microsoft\Signatures`.

Hosted images are also the more reliable option for New Outlook, Outlook on the web and Outlook for Mac.

# Be.Here. email signatures (Outlook)

Built from `Full Design with text example.svg`. A single signature for light and dark mode. The logo is mid-grey `#878787`, which reads on both backgrounds. Spacing matches the design. The Figma card (316 px wide, with padding) was only a frame for the design, so the signature has no card, fixed width or padding and sits directly in the email body.

## Files

| File | What it is |
| --- | --- |
| `signature-generator.html` | Open in a browser. Edit the text, then **Copy signature** and paste into Outlook. It works offline, with the logo embedded. |
| `assets/logo.png` | The logo and strapline in `#878787`, at 3× resolution (shown at 148 × 41). |
| `preview-modes.png` | The signature in light mode and in Outlook's dark mode. |

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

## Light and dark mode

Outlook can't swap images by mode. New Outlook's signature editor strips every part of the swap code: the `<style>` blocks, the class names, the `<picture>` source and the hidden light logo itself. A test email confirmed this. So there's one logo, in a mid-grey that reads on both backgrounds:

- **Logo and strapline:** `#878787`, the same image in both modes.
- **Text:** off-black `#121212`. Outlook's dark mode turns it light by itself.
- **Background:** none. The signature takes the email's own background.

The layered swap version is kept in the git history (commit `a036ae8`), in case you later send from an app that preserves it.

## Accessibility (WCAG 2.2)

Contrast of `#878787` against each background:

| Background | Contrast |
| --- | --- |
| White email | 3.59 : 1 |
| New Outlook / Outlook on the web dark (`#292929`) | 4.05 : 1 |
| Classic Outlook dark (`#262626`) | 4.21 : 1 |
| Outlook mobile / Apple Mail dark (`#1F1F1F`) | 4.59 : 1 |

- **Logo and wordmark: pass.** WCAG exempts logos and brand names from contrast requirements (1.4.3 for text, and 1.4.11 for graphics).
- **Strapline: passes if treated as part of the logo**, as it is in this lockup. If it were judged as ordinary text, it would fall short of the 4.5:1 needed for small text on white and on New Outlook's dark grey. It clears 3:1 everywhere.
- **No single grey can reach 4.5:1 on both white and dark grey.** The best possible balance is about 3.8:1 each way (`#838383`), so `#878787` is effectively as good as one colour can be.
- **Screen readers:** the image's alt text reads "Be.Here. Your invitation to press pause.", so the strapline is also available as text.
- **Body text** (`#121212` on white) is 18.7:1, well above every requirement.

## Divider

The design's 0.5px line is a 1px line in the blended grey (`#898989`, or `#949494` in dark mode), because email clients can't draw half pixels.

## Classic Outlook for Windows

The classic desktop app can't show embedded (base64) images. Do this first:

1. Upload `logo.png` to a public URL, e.g. `https://www.be-here.travel/email/`.
2. Put that folder URL in the generator's **Image folder URL** field.
3. Copy the signature and paste it into Outlook, or use **Download .htm** and save the file to `%APPDATA%\Microsoft\Signatures`.

Hosted images are also the more reliable option for New Outlook, Outlook on the web and Outlook for Mac.

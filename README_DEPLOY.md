# Techbots Revenue Process Review Landing Page

Target public path: `/revenue-process-check/`

This build is intentionally **prelaunch-safe** by default:
- `PREVIEW_MODE` is `true`
- `<meta name="robots">` is `noindex,nofollow`
- the final checklist PDF is not connected
- the form endpoint is not connected
- the privacy-policy URL is not guessed

## Before public launch

Edit `config.js`:
1. Set `FORM_ENDPOINT` to your production lead-capture endpoint.
2. Put the final checklist PDF in `assets/lead-magnet/` and set `LEAD_MAGNET_URL`.
3. Set `PRIVACY_URL` to the verified privacy-policy URL.
4. Confirm `CALENDLY_URL` is still correct.
5. Set `PREVIEW_MODE: false`.

Then edit `index.html`:
- change `<meta name="robots" content="noindex,nofollow">` to `index,follow` only when the form, PDF, privacy link and confirmation flow are working.

## Form payload
The page sends JSON containing:
- name
- email
- company
- role
- phone
- WhatsApp consent
- marketing-email consent
- source / campaign / medium / content / term
- lead owner
- landing page
- submission timestamp
- consent timestamp
- idempotency key
- page URL

The endpoint should use the idempotency key to prevent duplicate lead creation, and should send confirmation email only after the submission and resource-delivery action succeeds.

## Accessibility / UX included
- real labels, required states and native email validation
- separate unticked consent boxes
- keyboard focus states
- reduced-motion support
- mobile single-column form and sticky CTA
- no autoplay video
- compressed WebP images

## Recommended QA
Test on iPhone-size and Android-size viewports, desktop Chrome/Edge/Safari, form validation, duplicate submission handling, consent storage, PDF download, confirmation email, error logging and Calendly destination.

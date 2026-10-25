# Falcon Equipment Trading FZE LLC — website

Multi-page marketing site rebuilt with **React 19 · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · 21st.dev components · Motion**.
Pages: Home, About, Products, Contact. Each is a real static HTML file (own SEO meta + JSON-LD), so existing URLs (`/about.html` …) are unchanged.

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # -> dist/ (deploy to any static host)
npm run preview
```

## Forms
Quote and contact forms work without a backend: they open a pre-filled email to `info@falconequipmenttrading.com`.
To post enquiries to a service instead (Formspree, Getform, your own API…), set `VITE_FORM_ENDPOINT` (see `.env.example`). A honeypot field is included.

## Logo (`public/brand`)
The supplied logo was a screenshot with a checkerboard "transparency" pattern baked into the pixels. `scripts/build-logo.py` (source: `design-source/logo-source.jpg`) rebuilds it:
- checkerboard removed with a true alpha channel and halo-free edges; silver gear teeth that matched the checker tones are reconstructed;
- emblem denoised and upscaled 4× (810 px); lettering, gold rules and divider are **re-drawn as vectors** (Libre Caslon Text Bold / Montserrat Bold, the closest open fonts to the original; swap in the original brand fonts if you have them);
- `logo-reversed.*` (light lettering) is used on the dark site, `logo-color.*` for light backgrounds; `emblem.*`, favicons, Apple touch icon and `og-cover.jpg` are generated too.

Re-run with `npm run logo` (needs `numpy scipy opencv-python-headless pillow fonttools`).

## Components
- shadcn/ui (new-york style, hand-installed): button, badge, card, input, textarea, label, select, accordion, dialog (also the mobile menu sheet), sonner.
- 21st.dev: [Shimmer Button](https://21st.dev/@dillionverma/components/shimmer-button) and [Spotlight Card](https://21st.dev/@preetsuthar17/components/spotlight-card) (adapted); marquee, count-up, reveal and gear backdrop follow 21st.dev patterns.

## Content to verify before launch
Carried over unchanged from the original site: the three testimonials, "HSE Compliant Supply", "24/7 Reliable Sourcing", the "Expanded UAE-wide delivery" announcement and the About-page timeline. Confirm they are accurate. Photos are the original 700–1300 px images (valves and site-support are crops; Automation uses an illustrated tile); replace with HD photography of your actual stock when available. The contact map is a Google Maps embed of the Amber Gem Tower address, so check the pin.

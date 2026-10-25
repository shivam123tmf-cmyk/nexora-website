# Nexora website

Static marketing site for **Nexora** — practical AI and automation for Indian shops and SMEs.

**Tagline:** AI that works where you work  
**Founder contact:** shivam123tmf@gmail.com · +91 92050 89044 · East Delhi

## Local preview

```bash
cd nexora-website
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

No build step. Pure HTML, CSS, and a small `js/main.js`.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, outcomes, CTA |
| `solutions.html` | Services |
| `industries.html` | Who we serve |
| `approach.html` | Discover → Pilot → Automate → Handoff |
| `about.html` | Mission, vision, founder |
| `contact.html` | mailto + WhatsApp form (no backend) |
| `css/styles.css` | Brand styles |
| `js/main.js` | Mobile nav + contact helpers |
| `favicon.svg` | Icon |
| `robots.txt` | Crawlers |

## Contact (no backend)

1. **Send via email** — builds a `mailto:shivam123tmf@gmail.com` link with the form fields. Requires a mail app on the visitor’s device.
2. **Send via WhatsApp** — opens `https://wa.me/919205089044` with prefilled text.
3. Direct links for email, phone, and WhatsApp are also on the page.

Until a Nexora domain is purchased, use Gmail. Planned convention later: `hello@nexora…`.

## Deploy free

### Option A — Vercel (recommended if CLI is logged in)

```bash
cd nexora-website
npx vercel --yes --prod
```

Or drag the folder into [vercel.com/new](https://vercel.com/new). Free hobby tier is enough for a static site.

### Option B — Cloudflare Pages

1. Zip or push this folder to a GitHub repo.
2. In Cloudflare Dashboard → Pages → Create → Connect repo (or direct upload).
3. Build command: leave empty. Output directory: `/` (project root).
4. Deploy.

### Option C — GitHub Pages

```bash
# from parent folder, create repo and push
cd nexora-website
git init
git add .
git commit -m "Nexora static site"
# create repo on GitHub, then:
gh repo create nexora-website --public --source=. --remote=origin --push
# then: Settings → Pages → Deploy from branch → main / root
```

If the site lives at `https://USERNAME.github.io/nexora-website/`, relative links in this project still work.

### Option D — Netlify Drop

Visit [app.netlify.com/drop](https://app.netlify.com/drop) and drop the `nexora-website` folder.

## Free hosting limitations

- Default `*.vercel.app` / `*.pages.dev` / `*.github.io` URLs — custom domain needs a paid/registered domain.
- `mailto:` depends on the visitor having an email client; WhatsApp is the reliable mobile fallback.
- Google Fonts loads Inter from Google CDN (needs network). System fonts still apply if blocked.
- No server-side form storage, analytics, or CMS unless you add free-tier services later.
- Do not claim company registration, GST, or trademarks on the site until those are done.

## Brand tokens

- Ink `#0B1220`
- Accent `#3B82F6`
- Soft gray `#F4F6F8`
- Muted `#64748B`
- Font: Instrument Sans + IBM Plex Mono
- Theme: dark-forward product UI (Linear/Vercel craft)

## Honesty rules baked into copy

No fake testimonials, clients, metrics, certifications, or “registered company” language. About page states brand / sole-proprietor start clearly.

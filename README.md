# Pallav Bhatnagar — portfolio -

A static website: plain HTML, CSS and JavaScript. No build step, no server.

## Where things live

```text
I want to change…                     Go to…
────────────────────────────────────  ─────────────────────────────────────────
My email, social links, resume link   js/content.js
A footer social icon                  assets/icons/social/
My resume (the PDF)                   assets/documents/resume/resume.pdf
A project's card (Home, Works)        js/projects.js
A project's images                    assets/projects/<slug>/images/
A project's videos                    assets/projects/<slug>/videos/
Which projects are on the Home page   js/projects.js  (projects with "home")
A case study's content                work/<slug>.html (its own page)
About page photos                     assets/images/about/  (see its README)
The testimonial video                 assets/videos/testimonials/meera-kapoor.mp4
Sounds: chat, nav click, dog bark     assets/audio/sound-effects/
Fonts                                 assets/fonts/
Favicon and app icons                 assets/favicon/
Hero headline, About story, other     the page's own HTML file (index.html,
page text                             about.html, works.html)
Colours, sizes, spacing               css/style.css
```

## Folder structure

```text
new-portoflio/
├── index.html            Home
├── works.html            All projects
├── about.html            About
├── 404.html              Shown for any address that doesn't exist
├── work/                 One page per case study, at /work/<slug>
│   ├── ledgerly.html · wayfarer.html · parcelo.html
│   └── lumen.html · wave.html · jda.html
├── README.md             This file
│
├── css/
│   └── style.css         All styles
│
├── js/
│   ├── content.js        ✏️ Your details: email, socials, resume
│   ├── projects.js       ✏️ Every project's card on Home and Works
│   ├── render.js         Builds the project cards from projects.js
│   ├── case.js           Case study behaviour: chapter list, count-ups, gate, chat
│   └── script.js         Motion, chat, password locks, theme
│
└── assets/
    ├── projects/         One folder per project (slug = the name in its link)
    │   ├── ledgerly/
    │   │   ├── images/   cover · thumbnail · detail-01 · detail-02 · detail-03
    │   │   └── videos/   the project's videos
    │   ├── wayfarer/     (same inside)
    │   ├── parcelo/
    │   ├── lumen/
    │   ├── wave/
    │   └── jda/
    ├── icons/
    │   └── social/       linkedin.svg · behance.svg · dribbble.svg
    ├── images/
    │   └── about/        About page photos (optional)
    ├── videos/
    │   └── testimonials/
    ├── audio/
    │   └── sound-effects/
    ├── documents/
    │   └── resume/       resume.pdf
    ├── fonts/            Manrope
    └── favicon/          Browser and app icons
```

The ✏️ files and the pages themselves (index, about, works, work/*) are
what you edit.

## How to…

### Replace a project image
Each project has its own folder, `assets/projects/<slug>/images/`, with five
images. Right now they're all copies of the same picture (dummies). Save your
image over a file with the **same name** and it appears on the site:

| File | Where it shows | Best size |
|---|---|---|
| `cover.jpg` | Top of the case study page | Landscape 16:8, 1600 px wide or more |
| `thumbnail.jpg` | The project card on Home and Works | Landscape 16:10, 1200 px wide or more |
| `detail-01.jpg` to `detail-03.jpg` | The case study's three "Key decisions" | 4:3, 1200 px wide or more |

**One extra step for detail images.** While they're dummies, each decision
shows a zoomed-in crop of the image. When you add a real detail image, open
the project's page in `work/`, find that decision's image and change
`<div class="cs-crop is-crop">` to `<div class="cs-crop">` and delete the
`style="…"` on its `<img>`, so the image shows in full.

### Change a project's text or numbers
- **Its cards:** open `js/projects.js` and find the project by its `slug`.
  `home` is the Home page card (description and the two metrics), `works`
  the Works page card.
- **Its case study:** open its page, `work/<slug>.html`, and edit the text
  directly. Its `<title>` and the `description` / `og:` lines at the top
  are what Google and link previews (LinkedIn, WhatsApp) show.

### Add a new project
1. **The page:** copy a case study page in `work/` (for example
   `work/ledgerly.html`) as `work/new-app.html` (lowercase, hyphens). Replace
   its text, its `<title>` and the description and `og:` lines at the top,
   change `data-slug="ledgerly"` on `<main>` to `data-slug="new-app"`, and
   every `/assets/projects/ledgerly/` to `/assets/projects/new-app/`.
2. **The images:** copy `assets/projects/ledgerly/` as
   `assets/projects/new-app/` and replace its images.
3. **The cards:** in `js/projects.js`, copy a project block `{ ... },`, set
   `slug: "new-app"` and update its text. Its place in the list is its place
   on the Works page. To show it on the Home page, give it a `home` entry
   with an `order` (1 to 4) and remove `home` from the project it replaces.
4. **"Next project" links:** each case study ends with a link to the next
   one. Point the page before it at `/work/new-app`, and the new page at the
   one after.

To lock a project behind the password, add `data-locked` to its `<main>`
and set `locked: true` in `js/projects.js`.

### Add a project video
Put it in `assets/projects/<slug>/videos/` (MP4, lowercase-with-hyphens
names; the README in that folder has examples). Case studies don't show
videos yet, so ask for the case study to be set up to play it.

### Replace the testimonial video
Save it over `assets/videos/testimonials/meera-kapoor.mp4` (MP4, H.264).

### Update your resume
Save your PDF over `assets/documents/resume/resume.pdf`.
**The file there now is a placeholder: replace it before publishing.**

### Locked case studies (Wayfarer Health, Parcelo)
Their real pages are **not** in this folder. `work/wayfarer.html` and
`work/parcelo.html` here are placeholders (the hero and the password card).
The full pages live in Cloudflare KV, and the Cloudflare Worker
`portfolio-auth` serves them after the right password. The Worker's code and
the full pages are in `../portfolio-auth/`, next to this folder, never on
GitHub.
- **Change the password:** Cloudflare → Workers & Pages → portfolio-auth →
  Settings → Variables and secrets → `PORTFOLIO_PASSWORD`.
- **Edit a locked case study:** edit `../portfolio-auth/locked-pages/<slug>.html`,
  then Cloudflare → Storage & Databases → KV → portfolio-locked → the entry
  with that name → paste the new contents and save.
- **Never commit the full pages to GitHub.** Only the placeholders belong here.
- **Previewing locally:** `npx serve .` has no Worker, so the password dialog
  says it couldn't check the password. Test unlocking on the live site.

### Update your email or social links
Edit `js/content.js`. The footer, the copy-email button, the password dialog
and the chat all update.

### Change or add a footer social icon
The icons are files in `assets/icons/social/`. To change one, save a new SVG
over it with the same name. To add a network (for example Instagram):
1. Save its icon as `assets/icons/social/instagram.svg`: a 24 × 24 line icon
   drawn in black (the site makes it grey, black on hover, and light in dark
   mode).
2. In `js/content.js`, add a line to `socials`:
   `{ name: "Instagram", url: "https://instagram.com/you", icon: "assets/icons/social/instagram.svg" },`

Icons appear in the order of that list. Free line icons that match the style:
[Tabler Icons](https://tabler.io/icons) (the current ones come from there).

### Add a profile photo
The site has no profile photo yet. When you add one, save it as
`assets/images/profile/profile.jpg` and reference it from the HTML with that
path.

## File naming
Lowercase, words separated by hyphens: `ledgerly-cover.jpg`,
`wave-detail-01.jpg`, `chat-open.mp3`. GitHub Pages is case-sensitive, so
`Ledgerly-Cover.JPG` and `ledgerly-cover.jpg` are different files there.

## Run it locally
The site uses clean addresses (`/`, `/works`, `/about`,
`/work/ledgerly`) instead of `index.html`, `works.html` and so on.
A web server turns those into the right files, as GitHub Pages does online,
so **preview through a local server, not by double-clicking the HTML files**
(double-clicked files open, but the links between pages won't).

From this folder, run:

```bash
npx serve .
```

Then open the address it prints (usually http://localhost:3000). It needs
Node.js installed. Python's `http.server` won't work here: it doesn't handle
clean addresses.

## Publish on GitHub Pages
1. Create a repository on GitHub and upload the **contents** of this folder
   (so `index.html` is at the top level of the repository). Include the
   hidden `.github` folder: it holds the publishing workflow.
2. In the repository: **Settings → Pages → Build and deployment**, set
   **Source** to **GitHub Actions**.
3. Every push to `main` now publishes the site (see the **Actions** tab). The
   first time, you can also run it by hand: Actions → "Deploy to GitHub
   Pages" → **Run workflow**.
4. After a minute the site is live at your custom domain, pallavbhatnagar.in.

The workflow is `.github/workflows/deploy-pages.yml`. It uploads the site
exactly as it is, with the permissions publishing needs.

Paths in the site start from the domain root (`/assets/…`, `/work/…`), so the
site must be served from the root of a domain, as it is on pallavbhatnagar.in.
At a `github.io/<repo>/` address the styles and images wouldn't load.

## Not in this folder, on purpose
The SF Pro and Gilroy fonts were removed: their licences don't allow
publishing them on a website. Only Manrope (free to use) is included.

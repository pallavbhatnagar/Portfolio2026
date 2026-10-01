# Pallav Bhatnagar — portfolio -

A static website: plain HTML, CSS and JavaScript. No build step, no server.

## Where things live

```text
I want to change…                     Go to…
────────────────────────────────────  ─────────────────────────────────────────
My email, social links, resume link   js/content.js
A footer social icon                  assets/icons/social/
My resume (the PDF)                   assets/documents/resume/resume.pdf
A project's name, text, numbers       js/projects.js
A project's images                    assets/projects/<slug>/images/
A project's videos                    assets/projects/<slug>/videos/
Which projects are on the Home page   js/projects.js  (projects with "home")
A case study's content                js/projects.js
About page photos                     assets/images/about/  (see its README)
The testimonial video                 assets/videos/testimonials/meera-kapoor.mp4
The chat open / close sounds          assets/audio/sound-effects/
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
├── case-study.html       One template for every case study (?p=slug)
├── README.md             This file
│
├── css/
│   └── style.css         All styles
│
├── js/
│   ├── content.js        ✏️ Your details: email, socials, resume
│   ├── projects.js       ✏️ Every project: cards and case studies
│   ├── render.js         Builds the project cards from projects.js
│   ├── case.js           Builds a case study page from projects.js
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

The ✏️ files are the only code files you should need to edit.

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
`js/projects.js`, find that decision and delete its `focus: "…"` part so the
image shows in full. (Keep `focus` if you want the zoomed crop.)

### Change a project's name, description or numbers
Open `js/projects.js` and find the project by its `slug`:
- `home` → the Home page card (description and the two metrics)
- `works` → the Works page card (description and the two lines under it)
- everything else → the case study page

### Add a new project
1. In `js/projects.js`, copy a whole project block `{ ... },` and paste it
   where you want it to appear on the Works page.
2. Give it a new `slug` (lowercase, hyphens, e.g. `new-app`) and update its text.
3. Copy one project folder in `assets/projects/` (for example `ledgerly/`),
   rename it to the new slug (`new-app/`), and replace its images. Then, in
   the new project block, change every `assets/projects/ledgerly/` to
   `assets/projects/new-app/`.
4. To show it on the Home page, give it a `home` entry with an `order`
   (1 to 4) and remove `home` from the project it replaces.

The Works card, the case study page (`case-study.html?p=new-app`) and the
"Next project" link appear automatically.

### Add a project video
Put it in `assets/projects/<slug>/videos/` (MP4, lowercase-with-hyphens
names; the README in that folder has examples). Case studies don't show
videos yet, so ask for the case study to be set up to play it.

### Replace the testimonial video
Save it over `assets/videos/testimonials/meera-kapoor.mp4` (MP4, H.264).

### Update your resume
Save your PDF over `assets/documents/resume/resume.pdf`.
**The file there now is a placeholder: replace it before publishing.**

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
`wave-detail-01.jpg`, `chat-open.wav`. GitHub Pages is case-sensitive, so
`Ledgerly-Cover.JPG` and `ledgerly-cover.jpg` are different files there.

## Run it locally
Double-clicking `index.html` works for browsing. For everything to behave
exactly as online (the case-study password needs a proper web address), run a
small local server from this folder:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the address it prints (for example http://localhost:8000).

## Publish on GitHub Pages
1. Create a repository on GitHub and upload the **contents** of this folder
   (so `index.html` is at the top level of the repository). Include the
   hidden `.github` folder: it holds the publishing workflow.
2. In the repository: **Settings → Pages → Build and deployment**, set
   **Source** to **GitHub Actions**.
3. Every push to `main` now publishes the site (see the **Actions** tab). The
   first time, you can also run it by hand: Actions → "Deploy to GitHub
   Pages" → **Run workflow**.
4. After a minute the site is live at `https://<username>.github.io/<repo>/`.

The workflow is `.github/workflows/deploy-pages.yml`. It uploads the site
exactly as it is, with the permissions publishing needs.

All paths in the site are relative, so it works from any repository name.

## Not in this folder, on purpose
Unused files were moved to the sibling folder `new-portoflio-unused/`, so they
aren't uploaded: the SF Pro and Gilroy fonts (their licences don't allow
publishing them on a website), duplicate font folders, unused sounds, an old
voice-chat page and design drafts.

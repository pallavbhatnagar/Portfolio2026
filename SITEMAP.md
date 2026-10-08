# Site map: Pallav Bhatnagar's portfolio

A static portfolio website (plain HTML, CSS and JavaScript, no framework, no
build step) for Pallav Bhatnagar, a product designer. It is hosted on GitHub
Pages and uses clean addresses (no `.html` in links).

The site has three main pages plus one page per case study (six). Each case
study's content is written in its own HTML file. The project cards on Home and
Works are built by JavaScript from one data file, js/projects.js.

## Pages

```text
/                          Home            index.html
├── /works                 Works           works.html
├── /about                 About           about.html
├── (any missing address)  Page not found  404.html
└── /work/<slug>           Case study      work/<slug>.html (one page per project)
    ├── /work/wealthbasket     WealthBasket     Fintech · 2021         case study (locked)
    ├── /work/wayfarer         Wayfarer Health  Healthcare · 2024      case study · password protected
    ├── /work/parcelo          Parcelo          B2B SaaS · 2024        case study · password protected
    ├── /work/lumen            Lumen Learn      EdTech · 2023          case study
    ├── /work/wave             Wave 2.0         Fintech · 2021         case study · detailed (11 chapters)
    └── /work/jda              JDA Infra        Infrastructure · 2021  exploration
```

Every page shares the same top navigation (Home, Works, About me, a light /
dark theme toggle) and the same footer (email with a copy button, LinkedIn,
Behance and Dribbble icons).

## Home: `/`

In order, top to bottom:

1. **Hero.** Headline "The shortest path to done.", an intro ("I'm Pallav
   Bhatnagar, a product designer who untangles complex products…"), and two
   buttons: **Download resume** and **Talk to my Work** (opens the chat).
   Beside the headline, an animated line drawing goes from tangled to straight
   through four labelled steps: Insight, Framing, Interaction, Validation, then
   "Done".
2. **Products I've worked on.** Four featured project cards that stack on top
   of each other while scrolling (desktop only): WealthBasket, Wayfarer Health,
   Parcelo, Lumen Learn. Each card has a category, name, two-line description,
   two metrics, a "Read case study" link and a screenshot. Locked projects show
   a lock badge.
3. **What I bring to the table.** Five skills as tabs that advance on a timer
   (Research that shapes decisions, Clarity in complex flows, Interfaces that
   ship, Iteration backed by data, Alignment across the team), each with a
   detail card: what you get, timeline, and a result number.
4. **Kind words from people I've worked with.** Four testimonial panels; the
   first is a video testimonial (Meera Kapoor), the others expand on click.
5. **Footer.**

## Works: `/works`

1. **Heading.** "Selected work", with a short intro.
2. **Filter.** All work / Case studies / Explorations, with counts.
3. **Project list.** All six projects as large cards, newest first: category,
   year, name, a four-line description, role and team size, a "Case study" or
   "Exploration" badge, and a screenshot. Each links to its case study.
4. **Footer.**

## About: `/about`

1. **Hero.** "Hi, I'm Pallav. I make products clear.", a photo carousel and an
   intro paragraph.
2. **Numbers.** 8+ years, 40+ products and features shipped, 200+ usability
   sessions.
3. **How I got here.** A short career story.
4. **Where I've been.** Four jobs on the site's tangled-to-straight line
   (a vertical timeline on phones), ending on "Now".
5. **At a glance.** Based in, Currently, Focus, Experience, Education,
   Languages.
6. **What I believe about design.** Five principles; each row links to the
   part of the case study that shows it, and hovering a row fades the others
   back.
7. **Who you'd be working with.** Working style: Where I start, How I
   collaborate, After handoff.
8. **Now.** Building, Learning, Exploring, Listening (with a music video
   link), and the date it was last updated.
9. **Outside the brief.** Music (composes for films as a hobby, with a
   SoundCloud player) and Books and comics (a slow marquee of covers that
   pauses on hover).
10. **Questions people ask.** Five answers that slide open one at a time,
    then "Didn't find your question?" with an **Ask me anything** button that
    opens the chat panel.
11. **Footer.**

A small pixel golden retriever (js/pixel-dog.js) visits now and then: he runs
along the gap above a section, or peeks over the top of the Now or "Where I
start" card. Clicking him plays a bark and shows a heart. With reduced motion
he sits still above the last section.

## Case study: `/work/<slug>`

Each project has its own page, `work/<slug>.html`, with its own title,
description and link-preview image. All six share the same layout.

**Top of every case study:** back button, category, project name, one-line
headline, an "Ask AI about this project" button, then **The team** (avatars
and a sentence), **My role** (a sentence and focus-area tags), **Timeline and
platform**, **Tools used**, a cover image and three outcome numbers.

**Standard chapters** (WealthBasket, Wayfarer Health, Parcelo, Lumen Learn, JDA
Infra): Overview → The problem (with a research quote) → What we learned
(three insights) → Process (five numbered steps) → Key decisions (three, each
with an image) → Results (with a client testimonial) → Looking back.

**Detailed chapters** (Wave 2.0): Overview → Who we designed for (three
personas) → What we learned → Where existing apps let traders down → What we
set out to achieve → Design principles → Rebuilding the navigation (a 2×2
priority matrix) → Making investing smarter (key decisions, engagement
features, options trading before/after) → One design system, every broker →
Results → What I took away.

A fixed chapter list on the left highlights the chapter being read (desktop).
Every case study ends with a **Next project** link to the next project (the
last one links back to the first).

**Password protection:** Wayfarer Health and Parcelo ask for one shared
password. Their pages in the repository are placeholders (the hero and a lock
card). A Cloudflare Worker (`portfolio-auth`) checks the password at
`/api/unlock`, sets a signed cookie (until the browser closes, 2 hours at
most), and then serves the full pages from Cloudflare KV. One unlock covers
both projects.

## Site-wide features

- **Talk to my Work (chat panel).** Opened from the Home hero button, About's
  "Ask me anything" or a case study's "Ask AI" button. On a desktop it sits
  beside the page; on tablets it slides over the page as a drawer (the page
  behind is dimmed and held still); on phones it fills the screen. It answers
  questions about the projects, process, experience and contact details from
  the site's own content (scripted answers, not a live AI). It plays a sound on open and close.
- **Light and dark theme.** Follows the visitor's system setting until they
  use the toggle, then remembers their choice.
- **Accessibility.** Respects reduced motion, Windows high-contrast themes and
  "Increase contrast"; meets WCAG 2.2 AA in automated (axe) checks.

## Files

```text
/
├── index.html · works.html · about.html · 404.html
├── work/                     wealthbasket · wayfarer · parcelo · lumen · wave · jda (.html)
├── README.md                 How to edit and publish the site
├── SITEMAP.md                This file
├── .github/workflows/deploy-pages.yml   Publishes to GitHub Pages on every push
├── css/style.css             All styles
├── js/
│   ├── content.js            Email, social links, resume path
│   ├── projects.js           All six projects' cards: text, metrics, thumbnail
│   ├── render.js             Builds the Home and Works project cards and footer icons
│   ├── case.js               Case study behaviour: chapter list, count-ups, gate, chat answers
│   └── script.js             Motion, chat panel, password locks, theme toggle
└── assets/
    ├── projects/<slug>/images/   cover, thumbnail, detail-01..03 for each project
    ├── projects/<slug>/videos/   project videos (none yet)
    ├── images/about/             About page photos (optional)
    ├── icons/social/             linkedin.svg, behance.svg, dribbble.svg
    ├── videos/testimonials/      meera-kapoor.mp4
    ├── audio/sound-effects/      apple_intelligence.mp3 (chat opens), puppy.mp3
    ├── documents/resume/         resume.pdf
    ├── fonts/                    Manrope
    └── favicon/                  Browser and app icons
```

## Where content comes from

| Content | Source |
|---|---|
| Project cards on Home (4) and Works (6) | `js/projects.js` (`home` and `works` fields) |
| Case study pages | `work/<slug>.html` (each page's own HTML) |
| Email, social links, resume link | `js/content.js` |
| Hero, About text, skills, testimonials | Written directly in `index.html` and `about.html` |
| Chat answers | `js/script.js` (project cards from `js/projects.js`; on a case study, `js/case.js` answers from that page) |

Note: project names, numbers, quotes and people are sample data, being replaced
with real content.

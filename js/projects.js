/* =========================================================
   Your project cards, in one place.
   The project cards on the Home page and the Works page, and the chat's
   project cards, are built from this list. Each project's case study is its
   own page: works/<slug>.html (edit its content there).
   Numbers and text are SAMPLE DATA: replace with your real work.

   To add a project:
   1. Copy a case study page in works/ (for example works/wealthbasket.html), name
      it after the new slug and replace its content.
   2. Put its images in assets/projects/<slug>/images/.
   3. Copy one { ... } block below and update it.
   The order of this list is the Works page order.

   Fields
   - slug       the page's name: works/<slug>.html, shown at /works/<slug>
   - name, category, year
   - kind       "Case study" or "Exploration" (the Works filter uses this)
   - tint       mint | lilac | rose | sky | sand (the card's colour)
   - locked     true = the card asks for the case-study password first
   - thumbnail  the card image; thumbAlt describes it
   - video      optional: a short silent clip that plays on the card in place
                of the image (the thumbnail shows until it starts, and stays
                with motion reduced or in Calm)
   - home       optional: show on the Home page (order 1-4, text, two metrics)
   - works      the Works page card (text, and two lines under it)
   ========================================================= */
window.CASE_STUDIES = [
  {
    // Case study: works/wave.html
    slug: "wave",
    name: "Wave 2.0",
    kind: "Case study",
    category: "Fintech",
    year: "2021",
    tint: "sand",
    locked: false,
    thumbnail: "/assets/projects/wave/images/thumbnail.webp",
    thumbAlt: "Wave 2.0 trading screen on a phone",
    home: {
      order: 1,
      text: "Brokers wanted a trading app of their own without building one. One white-label app had to feel native under every brand.",
      metrics: [
        [
          "Branded broker apps launched",
          "25+"
        ],
        [
          "Trades placed every day",
          "4M"
        ]
      ]
    },
    works: {
      text: "A white-label trading app that lets brokers launch their own branded app. I designed core trading journeys, from curated watchlists to trading straight from the list.",
      meta: [
        "Product designer",
        "11 months · team of 13"
      ]
    }
  },
  {
    // Case study: works/wealthbasket.html (Paytm Money)
    slug: "wealthbasket",
    name: "WealthBasket",
    kind: "Case study",
    category: "Fintech",
    year: "2021",
    tint: "mint",
    locked: false,
    thumbnail: "/assets/projects/wealthbasket/images/thumbnail.webp",
    thumbAlt: "WealthBasket on Paytm Money: a phone showing curated WealthBaskets beside a Paytm card",
    home: {
      order: 2,
      text: "Investing in a basket means trusting stocks you didn't pick. The app had to show its working before it asked for money.",
      metrics: [
        [
          "Screens designed",
          "30+"
        ],
        [
          "Platforms: iOS, Android and web",
          "3"
        ]
      ]
    },
    works: {
      text: "WealthBasket lets anyone on Paytm Money invest in expert-built portfolios of stocks and ETFs. I helped scope it with the client and designed the core journeys, from a guided first run to a monthly SIP.",
      meta: [
        "Product designer",
        "About 12 months · agency team, for Paytm Money"
      ]
    }
  },
  {
    // Case study: works/atlas.html (locked: full page in portfolio-auth/locked-pages)
    // PLACEHOLDER content from the project notes: check every line.
    slug: "atlas",
    name: "Atlas Design System",
    kind: "Case study",
    category: "Design systems",
    year: "2024",
    tint: "lilac",
    locked: true,
    thumbnail: "/assets/projects/atlas/images/thumbnail.jpg",
    thumbAlt: "Atlas design system: colour tokens, buttons, toggles and form fields",
    home: {
      order: 3,
      text: "Every product team had grown its own components. Atlas gave design and engineering one shared set of tokens, parts and rules.",
      metrics: [
        ["Token groups: colour, type, spacing, elevation, layout", "5"],
        ["Things documented for every component", "5"]
      ]
    },
    works: {
      text: "A design system that brings enterprise products onto one language of tokens, components and interaction patterns, so separate teams ship one consistent experience.",
      meta: ["Senior UX designer", "Enterprise SaaS, with design and engineering teams"]
    }
  },
  {
    // Case study: works/supply-chain-map.html (locked: full page in portfolio-auth/locked-pages)
    // PLACEHOLDER content from the project notes: check every line.
    slug: "supply-chain-map",
    name: "Supply Chain Visibility Map",
    kind: "Case study",
    category: "Enterprise SaaS",
    year: "2025",
    tint: "rose",
    locked: true,
    thumbnail: "/assets/projects/supply-chain-map/images/thumbnail.jpg",
    thumbAlt: "Supply chain map: a network of suppliers with risk colours and a detail panel",
    home: {
      order: 4,
      text: "A problem at one supplier can ripple across tiers. The map shows those connections, so risk can be traced, not guessed.",
      metrics: [
        ["Views on one map: suppliers, materials, locations", "3"],
        ["Analytical lenses: compliance and geography", "2"]
      ]
    },
    works: {
      text: "An interactive map of a supplier network across tiers, so teams can trace how a disruption spreads, judge the risk and move straight to recommended actions.",
      meta: ["Senior UX designer", "Enterprise SaaS, supply chain risk"]
    }
  },
  {
    // Case study: works/barefoot-nomads.html
    // PLACEHOLDER content from the project notes: check every line.
    slug: "barefoot-nomads",
    name: "Barefoot Nomads",
    kind: "Exploration",
    category: "Travel tech",
    year: "2025",
    tint: "sky",
    locked: false,
    thumbnail: "/assets/projects/barefoot-nomads/images/thumbnail.jpg",
    thumbAlt: "Barefoot Nomads concept: group trip cards with seats left and travellers going",
    works: {
      text: "A concept for a community travel platform: curated group trips, the people going on them and booking, in one place instead of five apps.",
      meta: ["Product designer", "Self-initiated concept, solo"]
    }
  },
  {
    // Case study: works/zacks-insight.html
    // PLACEHOLDER content from the project notes: check every line.
    slug: "zacks-insight",
    name: "Zacks Insight",
    kind: "Exploration",
    category: "Fintech",
    year: "2025",
    tint: "mint",
    locked: false,
    thumbnail: "/assets/projects/zacks-insight/images/thumbnail.jpg",
    thumbAlt: "Zacks Insight concept: a portfolio chart, sector split and an AI answer",
    works: {
      text: "A concept for an AI investment tool that explains a portfolio instead of just reporting it, with answers that show the data behind them.",
      meta: ["Product designer", "Self-initiated concept, solo"]
    }
  }
];

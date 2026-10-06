/* =========================================================
   Your project cards, in one place.
   The project cards on the Home page and the Works page, and the chat's
   project cards, are built from this list. Each project's case study is its
   own page: work/<slug>.html (edit its content there).
   Numbers and text are SAMPLE DATA: replace with your real work.

   To add a project:
   1. Copy a case study page in work/ (for example work/wealthbasket.html), name
      it after the new slug and replace its content.
   2. Put its images in assets/projects/<slug>/images/.
   3. Copy one { ... } block below and update it.
   The order of this list is the Works page order.

   Fields
   - slug       the page's name: work/<slug>.html, shown at /work/<slug>
   - name, category, year
   - kind       "Case study" or "Exploration" (the Works filter uses this)
   - tint       mint | lilac | rose | sky | sand (the card's colour)
   - locked     true = the card asks for the case-study password first
   - thumbnail  the card image; thumbAlt describes it
   - home       optional: show on the Home page (order 1-4, text, two metrics)
   - works      the Works page card (text, and two lines under it)
   ========================================================= */
window.CASE_STUDIES = [
  {
    // Case study: work/wealthbasket.html (Paytm Money)
    slug: "wealthbasket",
    name: "WealthBasket",
    kind: "Case study",
    category: "Fintech",
    year: "2021",
    tint: "mint",
    locked: false,
    thumbnail: "/assets/projects/wealthbasket/images/thumbnail.jpg",
    thumbAlt: "WealthBasket on Paytm Money: a phone showing curated WealthBaskets beside a Paytm card",
    home: {
      order: 1,
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
    // Case study: work/wayfarer.html
    slug: "wayfarer",
    name: "Wayfarer Health",
    kind: "Case study",
    category: "Healthcare",
    year: "2024",
    tint: "lilac",
    locked: true,
    thumbnail: "/assets/projects/wayfarer/images/thumbnail.jpg",
    thumbAlt: "Wayfarer Health mobile screen",
    home: {
      order: 2,
      text: "Patients gave up on an eleven-field booking form. It became one short, guided conversation.",
      metrics: [
        [
          "Booking completion",
          "81%"
        ],
        [
          "Support tickets",
          "-44%"
        ]
      ]
    },
    works: {
      text: "Booking and care-plan flow for a telehealth clinic, designed with patients and nurses in the room. We cut the booking form from eleven fields to four and moved the rest into a guided conversation.",
      meta: [
        "Senior UX designer",
        "14 weeks · with 2 researchers, 4 engineers"
      ]
    }
  },
  {
    // Case study: work/parcelo.html
    slug: "parcelo",
    name: "Parcelo",
    kind: "Case study",
    category: "B2B SaaS",
    year: "2024",
    tint: "rose",
    locked: true,
    thumbnail: "/assets/projects/parcelo/images/thumbnail.jpg",
    thumbAlt: "Parcelo dashboard on a laptop",
    home: {
      order: 3,
      text: "Late deliveries were hiding in a dashboard that showed everything. Now they surface in seconds.",
      metrics: [
        [
          "Time to resolve",
          "-52%"
        ],
        [
          "Weekly active teams",
          "+29%"
        ]
      ]
    },
    works: {
      text: "A dispatch dashboard redesign so logistics teams can spot late deliveries and act in seconds, not minutes. I mapped the dispatcher's real workflow first, then rebuilt the screen around it.",
      meta: [
        "Lead product designer",
        "8 weeks · with 1 researcher, 2 engineers"
      ]
    }
  },
  {
    // Case study: work/lumen.html
    slug: "lumen",
    name: "Lumen Learn",
    kind: "Case study",
    category: "EdTech",
    year: "2023",
    tint: "sky",
    locked: false,
    thumbnail: "/assets/projects/lumen/images/thumbnail.jpg",
    thumbAlt: "Lumen Learn onboarding screen",
    home: {
      order: 4,
      text: "Students stalled on the very first screen. The fix was quieter: fewer choices, more lessons finished.",
      metrics: [
        [
          "Course completion",
          "+41%"
        ],
        [
          "Usability score",
          "86"
        ]
      ]
    },
    works: {
      text: "Onboarding and lesson flow for an online learning platform, tested across three rounds of usability sessions with real students. The biggest fix was quiet: fewer choices on the first screen.",
      meta: [
        "UX designer and researcher",
        "9 weeks · with 2 engineers"
      ]
    }
  },
  {
    // Case study: work/wave.html
    slug: "wave",
    name: "Wave 2.0",
    kind: "Case study",
    category: "Fintech",
    year: "2021",
    tint: "sand",
    locked: false,
    thumbnail: "/assets/projects/wave/images/thumbnail.jpg",
    thumbAlt: "Wave 2.0 trading screen on a phone",
    works: {
      text: "A white-label trading app that lets brokers launch their own branded app. I designed core trading journeys, from curated watchlists to trading straight from the list.",
      meta: [
        "Product designer",
        "11 months · team of 13"
      ]
    }
  },
  {
    // Case study: work/jda.html
    slug: "jda",
    name: "JDA Infra",
    kind: "Exploration",
    category: "Infrastructure",
    year: "2021",
    tint: "mint",
    locked: false,
    thumbnail: "/assets/projects/jda/images/thumbnail.jpg",
    thumbAlt: "JDA Infra website on a laptop",
    works: {
      text: "A website concept for an infrastructure firm that leads with finished projects instead of service lists, so prospective clients see the proof before the pitch.",
      meta: [
        "Visual and web design",
        "2 weeks · solo"
      ]
    }
  }
];

/* =========================================================
   Your projects, in one place.
   Every project card on the Home and Works pages, every case study page
   and the chat's project answers are built from this list. Edit a project
   here and it changes everywhere; the HTML never needs touching.
   All numbers, quotes and names are SAMPLE DATA: replace with your real work.

   To add a project: copy one { ... } block, give it a new slug, and put its
   images in assets/projects/<slug>/images/ (cover, thumbnail, detail-01..03).
   The order of this list is the Works page order and the "Next project" order.

   Fields
   - slug       the name in the link (case-study.html?p=slug)
   - name, category, year
   - kind       "Case study" or "Exploration" (the Works filter uses this)
   - tint       mint | lilac | rose | sky | sand (the project's colour)
   - locked     true = asks for the case-study password first
   - image      the cover image; crops of it illustrate the decisions
   - alt        describes the cover image for screen readers
   - thumbnail  optional: a different image for the Home and Works cards
   - thumbAlt   describes the card image
   - home       optional: the Home page card (order, text, two metrics)
   - works      the Works page card (text, and two meta lines)
   - headline   one sentence under the name on the case study
   - meta, tools, team, role   the case study's intro
   - outcomes   three results; `to` is the number, prefix/suffix wrap it
   - overview, problem, quote, insights, process, decisions, results,
     testimonial, reflection   the standard case study chapters
   - story      optional: a detailed case study (see the Wave 2.0 entry)
   ========================================================= */
window.CASE_STUDIES = [
  {
    slug: "ledgerly",
    name: "Ledgerly",
    kind: "Case study",
    category: "Fintech",
    year: "2025",
    tint: "mint",
    locked: false,
    image: "assets/projects/ledgerly/images/cover.jpg",
    thumbnail: "assets/projects/ledgerly/images/thumbnail.jpg",
    alt: "Ledgerly mobile screens: the spending overview and a linked card",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "Ledgerly mobile screens",
    // On the Home page (4 projects there, in "order"). Remove "home" to take
    // a project off the Home page; add it to feature one.
    home: {
      order: 1,
      text: "A personal finance app that makes budgeting feel calm, backed by research-led onboarding.",
      metrics: [["Task success", "92%"], ["Onboarding drop-off", "-38%"]]
    },
    // On the Works page (every project, in the order of this file).
    works: {
      text: "A personal finance app that makes budgeting feel calm. I led research, redesigned onboarding and simplified the spending overview so new users see where their money goes within a minute.",
      meta: ["Lead product designer", "10 weeks · with 1 researcher, 3 engineers"]
    },
    headline: "A calmer way to see where your money goes, redesigned around the first minute in the app.",
    meta: {
      role: "Lead product designer",
      timeline: "10 weeks, 2025",
      team: "1 researcher, 3 engineers, 1 PM",
      platform: "iOS and Android"
    },
    tools: ["Figma", "FigJam", "Maze", "Dovetail", "Notion"],
    team: {
      members: [{ initials: "RS", name: "Riya Sen, researcher" }, { initials: "AM", name: "Arjun Mehta, engineer" }, { initials: "KT", name: "Kavya Thomas, engineer" }, { initials: "VN", name: "Vikram Nair, engineer" }, { initials: "MK", name: "Meera Kapoor, Head of Product" }],
      text: "I worked with a researcher, three engineers and a product manager, and reported to Meera Kapoor, Head of Product. Research and design ran side by side with the build."
    },
    role: {
      text: "As the {role}, I led the onboarding redesign end to end: planning the research with our researcher, shaping the flows, designing the screens and testing every round with real users before it shipped.",
      focus: ["User research", "Onboarding flows", "Interaction design", "Usability testing", "Prototyping", "Design handoff"]
    },
    outcomes: [
      { to: 92, suffix: "%", label: "task success in the final usability round, up from 61%" },
      { to: 38, prefix: "-", suffix: "%", label: "drop-off during onboarding in the first month" },
      { to: 54, prefix: "-", suffix: "%", label: "time to set up a first budget" }
    ],
    overview: "Ledgerly helps young professionals budget without spreadsheets. The app worked, but new users rarely reached the moment it became useful: most left during onboarding, before they had linked an account or seen a single insight about their spending.",
    problem: "Onboarding asked for everything up front: income, goals, categories, three linked accounts. People were being asked to plan a budget before the app had shown them anything about their own money. The first screen they reached afterwards was a dashboard of empty charts.",
    quote: { text: "I didn't know what my categories were. That's why I downloaded the app.", who: "Participant 4, first-time user" },
    insights: [
      { title: "Show before you ask", text: "People were happy to link an account once they saw what they'd get back. Asking first felt like paperwork." },
      { title: "Categories are a result, not an input", text: "Nobody could name their spending categories from memory. They recognised them instantly once the app suggested them." },
      { title: "Calm beats complete", text: "The overview tried to show everything. Users wanted one honest number: what's left this month." }
    ],
    process: [
      { phase: "Listen", text: "Twelve interviews and a diary study with new users over their first week." },
      { phase: "Map", text: "A journey map of the first ten minutes, marking every point someone gave up." },
      { phase: "Sketch", text: "Paper flows with the team, then three competing onboarding prototypes." },
      { phase: "Test", text: "Three rounds of moderated tests, changing one thing per round." },
      { phase: "Ship", text: "A staged rollout to 10% of new users, then everyone once the numbers held." }
    ],
    decisions: [
      { title: "Link one account, then show the payoff", text: "Onboarding now asks for a single account and immediately shows last month's spending, grouped for you. Everything else can wait.", image: "assets/projects/ledgerly/images/detail-01.jpg", focus: "30% 35%" },
      { title: "Suggested categories you can correct", text: "The app proposes categories from real transactions. You rename or merge them with a tap instead of building them from scratch.", image: "assets/projects/ledgerly/images/detail-02.jpg", focus: "65% 55%" },
      { title: "One number at the top", text: "The overview leads with what's left to spend this month. Charts moved one tap deeper, for the people who want them.", image: "assets/projects/ledgerly/images/detail-03.jpg", focus: "50% 80%" }
    ],
    results: "Within a month of the full rollout, more new users finished onboarding and most of them set a budget on day one. Support tickets about \"missing categories\" all but disappeared.",
    testimonial: { text: "Pallav turned a vague brief into a flow our users understood on the first try.", who: "Meera Kapoor", role: "Head of Product, Ledgerly" },
    reflection: "I'd bring engineering into the diary study earlier. Two of the best ideas came from an engineer who read the raw notes, and we could have had them weeks sooner."
  },
  {
    slug: "wayfarer",
    name: "Wayfarer Health",
    kind: "Case study",
    category: "Healthcare",
    year: "2024",
    tint: "lilac",
    locked: true,
    image: "assets/projects/wayfarer/images/cover.jpg",
    thumbnail: "assets/projects/wayfarer/images/thumbnail.jpg",
    alt: "Wayfarer Health booking screen on a phone",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "Wayfarer Health mobile screen",
    // On the Home page (4 projects there, in "order"). Remove "home" to take
    // a project off the Home page; add it to feature one.
    home: {
      order: 2,
      text: "Booking and care-plan flow for a telehealth clinic, designed with patients and nurses in the room.",
      metrics: [["Booking completion", "81%"], ["Support tickets", "-44%"]]
    },
    // On the Works page (every project, in the order of this file).
    works: {
      text: "Booking and care-plan flow for a telehealth clinic, designed with patients and nurses in the room. We cut the booking form from eleven fields to four and moved the rest into a guided conversation.",
      meta: ["Senior UX designer", "14 weeks · with 2 researchers, 4 engineers"]
    },
    headline: "Booking care in a conversation, not a form, designed with patients and nurses in the room.",
    meta: {
      role: "Senior UX designer",
      timeline: "14 weeks, 2024",
      team: "2 researchers, 4 engineers, 2 nurses",
      platform: "Web and mobile web"
    },
    tools: ["Figma", "Miro", "Lookback", "Jira"],
    team: {
      members: [{ initials: "DO", name: "Daniel Okafor, researcher" }, { initials: "LS", name: "Leena Shah, researcher" }, { initials: "PR", name: "Priya Rao, nurse" }, { initials: "TM", name: "Tom Mathew, nurse" }, { initials: "SG", name: "Sahil Gupta, engineer" }, { initials: "AN", name: "Anjali Nair, engineer" }, { initials: "RK", name: "Rohit Kumar, engineer" }, { initials: "FI", name: "Farah Iqbal, engineer" }],
      text: "Two researchers, four engineers and two nurses from the clinic, who joined every design review. I reported to the clinic's product lead."
    },
    role: {
      text: "As the {role}, I designed the new booking and care-plan flow, from the first co-design sessions with patients and nurses to tested, accessible screens the engineers could build.",
      focus: ["Co-design workshops", "Conversation design", "Accessibility", "Usability testing", "Design system updates"]
    },
    outcomes: [
      { to: 81, suffix: "%", label: "of started bookings now completed" },
      { to: 44, prefix: "-", suffix: "%", label: "support calls about booking" },
      { to: 4, label: "form fields, down from eleven" }
    ],
    overview: "Wayfarer is a telehealth clinic serving patients across three time zones. Booking a first appointment took an eleven-field form, and nearly half of the people who started it gave up.",
    problem: "The form asked medical questions before the patient knew whether they'd even get a slot. Nurses then re-asked most of the same questions on the call, so the effort felt wasted twice.",
    quote: { text: "I just wanted to know if someone could see me this week.", who: "Patient, usability session" },
    insights: [
      { title: "Availability first", text: "Patients decided whether to continue based on the next open slot, not on anything else we showed." },
      { title: "Nurses already had a script", text: "The questions that mattered came in a natural order on calls. The form ignored it." },
      { title: "Trust comes from people", text: "Seeing the name and photo of the nurse made patients more willing to share details." }
    ],
    process: [
      { phase: "Listen", text: "Shadowed twenty booking calls and interviewed patients who had abandoned the form." },
      { phase: "Map", text: "Mapped the form against the nurses' call script to find every duplicate question." },
      { phase: "Sketch", text: "Co-designed a guided conversation with two nurses over three workshops." },
      { phase: "Test", text: "Tested with patients over 60 and patients booking for a child." },
      { phase: "Ship", text: "Launched in one region first, with nurses reviewing every booking for two weeks." }
    ],
    decisions: [
      { title: "Show the next open slot first", text: "The flow opens with real availability. Patients pick a time before being asked anything personal.", image: "assets/projects/wayfarer/images/detail-01.jpg", focus: "50% 30%" },
      { title: "Questions in the nurse's order", text: "Four questions, asked one at a time in the same order a nurse would ask them. The rest moved to the call.", image: "assets/projects/wayfarer/images/detail-02.jpg", focus: "50% 55%" },
      { title: "Meet your nurse before the call", text: "The confirmation shows who you'll speak to, with a photo and a line about them.", image: "assets/projects/wayfarer/images/detail-03.jpg", focus: "50% 75%" }
    ],
    results: "Completed bookings rose sharply in the first region, and nurses reported shorter calls because the answers they needed were already in the record.",
    testimonial: { text: "Every critique made the work sharper and the team kinder.", who: "Hannah Lindqvist", role: "Design Lead, Wayfarer Health" },
    reflection: "Accessibility testing came late. Next time I'd put a screen-reader user in the first round, not the last."
  },
  {
    slug: "parcelo",
    name: "Parcelo",
    kind: "Case study",
    category: "B2B SaaS",
    year: "2024",
    tint: "rose",
    locked: true,
    image: "assets/projects/parcelo/images/cover.jpg",
    thumbnail: "assets/projects/parcelo/images/thumbnail.jpg",
    alt: "Parcelo dispatch dashboard on a laptop",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "Parcelo dashboard on a laptop",
    // On the Home page (4 projects there, in "order"). Remove "home" to take
    // a project off the Home page; add it to feature one.
    home: {
      order: 3,
      text: "A dispatch dashboard redesign so logistics teams can spot late deliveries and act in seconds.",
      metrics: [["Time to resolve", "-52%"], ["Weekly active teams", "+29%"]]
    },
    // On the Works page (every project, in the order of this file).
    works: {
      text: "A dispatch dashboard redesign so logistics teams can spot late deliveries and act in seconds, not minutes. I mapped the dispatcher's real workflow first, then rebuilt the screen around it.",
      meta: ["Lead product designer", "8 weeks · with 1 researcher, 2 engineers"]
    },
    headline: "A dispatch dashboard that shows late deliveries first, so teams act in seconds, not minutes.",
    meta: {
      role: "Lead product designer",
      timeline: "8 weeks, 2024",
      team: "1 researcher, 2 engineers",
      platform: "Desktop web"
    },
    tools: ["Figma", "FigJam", "Hotjar", "Amplitude", "Linear"],
    team: {
      members: [{ initials: "NB", name: "Nikhil Bose, researcher" }, { initials: "SJ", name: "Sara Joseph, engineer" }, { initials: "HK", name: "Harsh Kulkarni, engineer" }],
      text: "A small team: one researcher and two engineers, working directly with the dispatch managers who use the dashboard every day."
    },
    role: {
      text: "As the {role}, I started on the dispatch floor to map how the work really happens, then rebuilt the dashboard around the decisions dispatchers make most often.",
      focus: ["Contextual inquiry", "Workflow mapping", "Information architecture", "Data-dense UI", "Analytics review"]
    },
    outcomes: [
      { to: 52, prefix: "-", suffix: "%", label: "time to resolve a late delivery" },
      { to: 29, prefix: "+", suffix: "%", label: "weekly active dispatch teams" },
      { to: 3, suffix: "s", label: "to spot the most urgent order" }
    ],
    overview: "Parcelo helps regional courier firms plan and track the day's deliveries. Dispatchers kept the dashboard open all day, yet still found problems through phone calls from angry customers.",
    problem: "Every order looked equally important. A delivery running two hours late sat in the same grey row as one that was on time, sorted by order number.",
    quote: { text: "By the time I see it on screen, the customer has already called me.", who: "Dispatcher, Leeds depot" },
    insights: [
      { title: "Dispatchers scan, they don't read", text: "Eye-tracking showed people sweeping the left edge of the table for anything unusual." },
      { title: "Late is a spectrum", text: "Ten minutes late and two hours late needed different actions, not the same red badge." },
      { title: "Fixes happen by phone", text: "Most problems ended in a call to a driver, but the number lived in another system." }
    ],
    process: [
      { phase: "Listen", text: "Sat with dispatchers through two full shifts, noting every interruption." },
      { phase: "Map", text: "Listed every action taken on a late order and how long each one took." },
      { phase: "Sketch", text: "Rebuilt the table around urgency, then tested three ways to show lateness." },
      { phase: "Test", text: "Timed dispatchers finding and fixing planted late orders." },
      { phase: "Ship", text: "Shipped behind a toggle so teams could switch back during the first week." }
    ],
    decisions: [
      { title: "Sort by urgency, always", text: "The most at-risk orders sit at the top, and the list re-sorts itself as the day moves.", image: "assets/projects/parcelo/images/detail-01.jpg", focus: "35% 40%" },
      { title: "Lateness you can read at a glance", text: "A slim bar on the row's left edge grows with delay, so a sweep of the eye finds trouble.", image: "assets/projects/parcelo/images/detail-02.jpg", focus: "25% 60%" },
      { title: "Call the driver from the row", text: "The driver's number and last position open in place. No switching systems.", image: "assets/projects/parcelo/images/detail-03.jpg", focus: "70% 50%" }
    ],
    results: "Teams resolved late deliveries in half the time and several depots dropped their separate spreadsheet for tracking problem orders.",
    testimonial: { text: "Engineering finally knew what to build and why.", who: "Daniel Okafor", role: "Engineering Manager, Parcelo" },
    reflection: "We measured speed but not stress. I'd love to learn whether the calmer screen changed how the end of a shift feels."
  },
  {
    slug: "lumen",
    name: "Lumen Learn",
    kind: "Case study",
    category: "EdTech",
    year: "2023",
    tint: "sky",
    locked: false,
    image: "assets/projects/lumen/images/cover.jpg",
    thumbnail: "assets/projects/lumen/images/thumbnail.jpg",
    alt: "Lumen Learn onboarding screen on a laptop",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "Lumen Learn onboarding screen",
    // On the Home page (4 projects there, in "order"). Remove "home" to take
    // a project off the Home page; add it to feature one.
    home: {
      order: 4,
      text: "Onboarding and lessons for an online learning platform, tested across three usability rounds.",
      metrics: [["Course completion", "+41%"], ["Usability score", "86"]]
    },
    // On the Works page (every project, in the order of this file).
    works: {
      text: "Onboarding and lesson flow for an online learning platform, tested across three rounds of usability sessions with real students. The biggest fix was quiet: fewer choices on the first screen.",
      meta: ["UX designer and researcher", "9 weeks · with 2 engineers"]
    },
    headline: "Fewer choices on the first screen, and a learning path students actually finish.",
    meta: {
      role: "UX designer and researcher",
      timeline: "9 weeks, 2023",
      team: "2 engineers, 1 content lead",
      platform: "Web"
    },
    tools: ["Figma", "Maze", "Miro", "Google Analytics"],
    team: {
      members: [{ initials: "IM", name: "Isha Menon, engineer" }, { initials: "KD", name: "Karan Dev, engineer" }, { initials: "AR", name: "Aisha Rahman, content lead" }],
      text: "Two engineers and a content lead. I ran the research myself and tested every round with real students."
    },
    role: {
      text: "As the {role}, I owned both halves of the work: three rounds of usability sessions, the new onboarding, and a simpler lesson flow students actually finish.",
      focus: ["Usability testing", "Onboarding flows", "Content structure", "Interaction design", "Analytics review"]
    },
    outcomes: [
      { to: 41, prefix: "+", suffix: "%", label: "course completion across the pilot" },
      { to: 86, label: "usability score, up from 64" },
      { to: 22, prefix: "+", suffix: "%", label: "students returning in week one" }
    ],
    overview: "Lumen Learn offers short online courses for working adults. Sign-ups were healthy, but most students never finished their first lesson.",
    problem: "The first screen offered forty courses, six filters and a quiz. Students spent their motivation choosing and had little left for learning.",
    quote: { text: "I spent twenty minutes picking a course and then had to leave for work.", who: "Student, round one" },
    insights: [
      { title: "People arrive with a goal", text: "Almost everyone could say why they signed up in one sentence. We never asked." },
      { title: "The first win matters most", text: "Students who finished one five-minute lesson were far more likely to come back." },
      { title: "Progress needs a shape", text: "A list of forty videos felt endless. A short path with a finish line felt doable." }
    ],
    process: [
      { phase: "Listen", text: "Interviews with students who signed up but never finished a lesson." },
      { phase: "Map", text: "Traced the path from sign-up to first completed lesson, minute by minute." },
      { phase: "Sketch", text: "Replaced the catalogue with a single question: what do you want to be able to do?" },
      { phase: "Test", text: "Three rounds of usability sessions with real students." },
      { phase: "Ship", text: "Piloted with two partner companies before the public launch." }
    ],
    decisions: [
      { title: "One question instead of forty courses", text: "Students state a goal and get one recommended path, with the full catalogue a tap away.", image: "assets/projects/lumen/images/detail-01.jpg", focus: "40% 40%" },
      { title: "A first lesson you can finish today", text: "Every path starts with a five-minute lesson designed to end in a small, real win.", image: "assets/projects/lumen/images/detail-02.jpg", focus: "60% 55%" },
      { title: "A path with a finish line", text: "Progress shows as a short route with a clear end, not a long list of videos.", image: "assets/projects/lumen/images/detail-03.jpg", focus: "50% 70%" }
    ],
    results: "Completion rose across both pilot companies, and the usability score climbed in every round of testing.",
    testimonial: { text: "Our onboarding completion jumped and nobody had to argue about opinions.", who: "Sofia Marchetti", role: "COO, Lumen Learn" },
    reflection: "The goal question worked so well that I'd test making it the whole home page."
  },
  {
    // Wave 2.0 for 63 Moons, designed at THEM Consulting. Pallav was one of two
    // product designers. Before publishing, check: the team initials, the
    // tools list, and that every decision below is one you worked on. There
    // is no quote or testimonial on purpose: add real ones (quote: { text,
    // who }, testimonial: { text, who, role }) and they appear on the page.
    slug: "wave",
    name: "Wave 2.0",
    kind: "Case study",
    category: "Fintech",
    year: "2021",
    tint: "sand",
    locked: false,
    image: "assets/projects/wave/images/cover.jpg",
    thumbnail: "assets/projects/wave/images/thumbnail.jpg",
    alt: "Wave 2.0 on a phone: a stock card with the price, market depth and Buy and Sell buttons",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "Wave 2.0 trading screen on a phone",
    // On the Works page (every project, in the order of this file).
    works: {
      text: "A white-label trading app that lets brokers launch their own branded app. I designed core trading journeys, from curated watchlists to trading straight from the list.",
      meta: ["Product designer", "11 months · team of 13"]
    },
    headline: "A white-label trading app that lets brokerage firms launch a modern, branded mobile app of their own, without building one from scratch.",
    meta: {
      role: "Product designer",
      timeline: "11 months, 2020–21",
      team: "Lead designer, 2 product designers, 4 PMs, 5 developers",
      platform: "iOS and Android"
    },
    tools: ["Adobe XD", "Sketch", "Jira", "Microsoft Teams", "Excel"],
    team: {
      members: [
        { initials: "ED", name: "Experience design director" },
        { initials: "LD", name: "Lead designer" },
        { initials: "PD", name: "Product designer" },
        { initials: "PM", name: "Product managers (4)" },
        { initials: "DV", name: "Developers (5)" }
      ],
      text: "I was one of two product designers at THEM Consulting, working with our lead designer and experience design director, four product managers and five developers, with the 63 Moons team in every review."
    },
    role: {
      text: "As a {role}, I designed core trading journeys for Wave 2.0, the flagship product of our client 63 Moons: from turning research into flows, to screens, interactions and components for the shared design system, through to handoff and support during the build.",
      focus: ["Research synthesis", "User flows and journeys", "UI design", "Design system components", "Micro-interactions", "Developer handoff"]
    },
    outcomes: [
      { to: 25, suffix: "+", label: "brokers launched their own branded app on Wave 2.0" },
      { to: 4, suffix: "M", label: "trades placed every day across those apps" },
      { to: 73, suffix: "K", label: "average peak sessions at a time" }
    ],
    overview: "Traditional brokerage firms were losing customers to digital-first brokers with slicker, cheaper apps. 63 Moons built Wave 2.0 so any broker could offer a modern trading app under its own brand, and our team at THEM Consulting designed the experience end to end.",
    problem: "Existing trading apps made people remember too much and dig through deep menus, with little sense of what the market was doing around them. New traders didn't know where to begin, experienced ones missed opportunities while switching screens, and every broker needed the result to feel like its own product, not a template.",
    insights: [
      { title: "Emotion drives the trade", text: "Fear of missing out, fear of loss and the confidence of a past win shaped when people traded far more than any single feature did." },
      { title: "Recall is the enemy", text: "Competing apps expected traders to remember symbols, screens and order states. Showing things at the right moment beat asking people to remember them." },
      { title: "Context builds trust", text: "Traders acted faster when news, order status and guidance sat next to the decision, instead of a few taps away." }
    ],
    process: [
      { phase: "Listen", text: "Sessions with brokerage firms, active traders and the 63 Moons sales team, to see the market from both the broker's and the trader's side." },
      { phase: "Envision", text: "A product envisioning workshop to agree what a 'superior experience' meant for brokers and for their customers." },
      { phase: "Map", text: "A frequency-versus-importance map of every trading action, which reshaped the app's navigation around what people do most." },
      { phase: "Design", text: "Flows, screens and interactions for the core journeys, built on one design system that each broker could brand." },
      { phase: "Ship", text: "Handoff and day-to-day support with developers on a single cross-platform build, then rollout to brokers." }
    ],
    decisions: [
      { title: "Start from a ready-made watchlist", text: "New traders pick a watchlist curated by experts instead of building one from scratch, so the path to a first trade is short and less daunting.", image: "assets/projects/wave/images/detail-01.jpg", focus: "50% 30%" },
      { title: "Trade right from the list", text: "Buy and sell sit on the watchlist itself, with enough market context to act with confidence, so people don't lose the moment switching screens.", image: "assets/projects/wave/images/detail-02.jpg", focus: "50% 65%" },
      { title: "One system, many brands", text: "Colours, type and contrast adapt to each broker's brand from a single set of components, so every app feels like the broker's own while the team keeps shipping fast.", image: "assets/projects/wave/images/detail-03.jpg", focus: "50% 85%" }
    ],
    results: "In its first couple of years in market, more than 25 brokers launched their own apps on Wave 2.0, together handling around 4 million trades a day and more than 2 billion a year. The shared design system also let the team design new features roughly four times faster. These figures are approximate, based on 2021 to 2023 data.",
    reflection: "Working inside a large, multi-team project taught me to design for the system, not just the screen: every decision had to hold up across brands, platforms and very different kinds of trader. I also learned to move forward through ambiguity, making a reasoned call and testing it rather than waiting for certainty.",
    // Detailed chapters (see js/case.js: "Detailed story"). The page shows
    // these instead of the standard seven sections.
    story: [
      {
        "id": "overview",
        "nav": "Overview",
        "title": "Overview",
        "lead": "Traditional brokerage firms were losing customers to digital-first brokers with slicker, cheaper apps. 63 Moons built Wave 2.0 so any broker could launch a modern trading app under its own name, and our team at THEM Consulting designed the experience from the first workshop to the final build.",
        "blocks": [
          {
            "type": "cards",
            "cols": 3,
            "items": [
              {
                "title": "The market",
                "text": "New-age brokers were winning with better technology, low or zero fees and apps that made trading feel easy. Their large, growing user bases gave them an edge that older firms couldn't match with their existing tools."
              },
              {
                "title": "The business goal",
                "text": "Established brokers wanted a competitive, future-ready mobile app with a genuinely better experience, to win new investors faster and keep the ones they already had."
              },
              {
                "title": "The product",
                "text": "Wave 2.0 is a white-label trading app. Each broker rebrands it and switches features on or off to match its own services, so it launches a polished app in weeks instead of building one over years."
              }
            ]
          }
        ]
      },
      {
        "id": "users",
        "nav": "Users",
        "title": "Who we designed for",
        "lead": "Wave 2.0 had two sets of customers: the brokers who buy and brand it, and the traders who use it every day. We designed for traders first, because their trust and activity is what brokers were paying for.",
        "blocks": [
          {
            "type": "personas",
            "items": [
              {
                "kind": "Just starting out",
                "name": "The first-time investor",
                "line": "Has money to invest and a lot of curiosity, but no idea which stocks to pick or where to start.",
                "needs": [
                  "A safe, guided first trade",
                  "Plain language instead of jargon",
                  "Proof that others are doing it too"
                ],
                "pains": [
                  "Building a watchlist from nothing",
                  "Fear of making an expensive mistake"
                ]
              },
              {
                "kind": "Trades most days",
                "name": "The active trader",
                "line": "Watches the market through the day and acts quickly on news, alerts and price moves.",
                "needs": [
                  "Speed from idea to order",
                  "Live context next to every decision",
                  "Alerts that are worth opening"
                ],
                "pains": [
                  "Hopping between screens to place one trade",
                  "Missing a move while searching the app"
                ]
              },
              {
                "kind": "Years of experience",
                "name": "The seasoned investor",
                "line": "Researches carefully, trades options and manages a diverse portfolio.",
                "needs": [
                  "Deep research without the busywork",
                  "A clear, scannable option chain",
                  "Control over every order detail"
                ],
                "pains": [
                  "Research spread across tools and tabs",
                  "Dense tables that are slow to read"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "research",
        "nav": "Research",
        "title": "What we learned",
        "lead": "We spoke with brokerage firms, active traders and the 63 Moons sales team, who hear what brokers ask for every day. Brokers needed to reinvent their image with digital experiences, and a better experience had to show up in their numbers: more transactions, more engagement, more customers who stay.",
        "blocks": [
          {
            "type": "subhead",
            "title": "What moves people to trade",
            "text": "Synthesising the research in a product envisioning workshop, we kept coming back to human motives rather than features. Five shaped the product more than anything else:"
          },
          {
            "type": "cards",
            "cols": 2,
            "items": [
              {
                "title": "Fear of missing out",
                "text": "People act when they see gains they might miss, especially when a stock is trending or friends and influencers are profiting from it."
              },
              {
                "title": "Confidence from experience",
                "text": "A good first experience and a better understanding of the market make people more willing to trade again. Early positive returns build momentum."
              },
              {
                "title": "Fear of loss",
                "text": "Avoiding a loss matters more than chasing a gain. People hold onto losing stocks or spread their money out to feel safe."
              },
              {
                "title": "Personal goals",
                "text": "Building wealth, planning for retirement or saving for something specific gives people a reason to invest and keep investing."
              },
              {
                "title": "Money arriving",
                "text": "A bonus, a salary hike or any large sum landing in the bank is a common moment when people decide to put money to work."
              }
            ]
          }
        ]
      },
      {
        "id": "problem",
        "nav": "Problem",
        "title": "Where existing apps let traders down",
        "lead": "Reviewing competitor apps alongside the research showed the same gaps again and again. Each one was an opportunity for Wave 2.0.",
        "blocks": [
          {
            "type": "rows",
            "items": [
              {
                "title": "No hand-holding",
                "text": "Apps didn't match how people actually decide. New users were left to figure everything out alone."
              },
              {
                "title": "Too much to remember",
                "text": "Screens demanded constant attention and memory, from stock symbols to order states, which made people hesitate before trading."
              },
              {
                "title": "No sense of the market",
                "text": "Order statuses, market updates and news lived on separate screens, so every decision was made with part of the picture missing."
              },
              {
                "title": "Missed opportunities",
                "text": "With little guidance on what to buy, people struggled to choose and often didn't act at all."
              },
              {
                "title": "Guesswork instead of insight",
                "text": "Without clear, contextual guidance, the fear of making a mistake grew. Informed decisions build confidence; guesswork erodes it."
              },
              {
                "title": "Confusing navigation",
                "text": "Deep, rigid menus made it hard to find the right screen, especially during time-sensitive tasks like placing or changing an order."
              }
            ]
          }
        ]
      },
      {
        "id": "goals",
        "nav": "Goals",
        "title": "What we set out to achieve",
        "lead": "We agreed five product goals with 63 Moons and used them to judge every design decision, from the smallest interaction to the navigation.",
        "blocks": [
          {
            "type": "cards",
            "cols": 2,
            "items": [
              {
                "title": "Drive engagement and transactions",
                "text": "Make trading feel effortless so people trade more often. This is where brokers earn their revenue."
              },
              {
                "title": "Win and keep customers",
                "text": "Give new investors an easy start and give existing ones reasons to stay instead of switching apps."
              },
              {
                "title": "Easy to customise",
                "text": "A modular product that every broker can brand, and switch features on or off, without redesigning it."
              },
              {
                "title": "Guidance that builds trust",
                "text": "Explain what's happening at the moment it matters, so people trade with confidence rather than anxiety."
              },
              {
                "title": "Easy to find your way",
                "text": "Put the most important actions within reach and make the rest easy to discover."
              }
            ]
          }
        ]
      },
      {
        "id": "principles",
        "nav": "Principles",
        "title": "Design principles",
        "lead": "Three principles kept a large team consistent. When two good ideas competed, the one that served these better won.",
        "blocks": [
          {
            "type": "principles",
            "items": [
              {
                "title": "Trust and reliability",
                "text": "Money is involved, so every screen has to feel dependable.",
                "points": [
                  "Consistent patterns everywhere",
                  "Clear feedback for every action",
                  "Prevent errors, and let people undo",
                  "Social proof where it helps"
                ]
              },
              {
                "title": "Power and confidence",
                "text": "Help people feel in control of their decisions.",
                "points": [
                  "Simple, human language",
                  "Less ambiguity and confusion",
                  "Information that supports the decision",
                  "Room to learn and explore"
                ]
              },
              {
                "title": "Fast and actionable",
                "text": "In a moving market, a few seconds decide the outcome.",
                "points": [
                  "Surface time-sensitive opportunities",
                  "Important actions within reach",
                  "Recognition over recall",
                  "Context that adapts to the person"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "architecture",
        "nav": "Architecture",
        "title": "Rebuilding the navigation",
        "lead": "We listed every action a trader takes and mapped them on two questions: how often do people do this, and how much does it matter when they do? The top-right corner became the heart of the app; the rest moved out of the way.",
        "blocks": [
          {
            "type": "matrix",
            "x": "Horizontal: how often people do it",
            "y": "Vertical: how much it matters",
            "quadrants": [
              {
                "label": "Important, less often",
                "items": [
                  "Add funds",
                  "Option chain",
                  "Price alerts",
                  "Order history"
                ]
              },
              {
                "label": "Important and frequent",
                "key": true,
                "items": [
                  "Watchlist",
                  "Buy and sell",
                  "Portfolio",
                  "Order status",
                  "Search"
                ]
              },
              {
                "label": "Less important, less often",
                "items": [
                  "Settings",
                  "Profile",
                  "Help and support"
                ]
              },
              {
                "label": "Frequent, less important",
                "items": [
                  "Market news",
                  "Top movers",
                  "Indices"
                ]
              }
            ]
          },
          {
            "type": "text",
            "text": "Frequent, high-stakes actions got the shortest paths and a place on the main screens. Occasional but important tasks stayed one clear step away, and everything else moved into a lighter secondary layer."
          }
        ]
      },
      {
        "id": "solution",
        "nav": "Solution",
        "title": "Making investing smarter and more actionable",
        "lead": "Our strategy was to lower the barriers to each decision, then give people good reasons to come back. These are the decisions that mattered most.",
        "blocks": [
          {
            "type": "decisions",
            "items": [
              {
                "title": "Start with a ready-made watchlist",
                "text": "Choosing stocks was the first big hurdle for new users. They can now pick a watchlist curated by experts, or create their own, and be ready to trade in minutes.",
                "image": "assets/projects/wave/images/detail-01.jpg",
            "focus": "50% 30%",
                "impact": [
                  "Easier start",
                  "More first trades",
                  "Higher confidence",
                  "Better acquisition"
                ]
              },
              {
                "title": "Opportunities come to you",
                "text": "New events and opportunities from across all watchlists surface at the top of the screen, so traders stop switching between lists to find what's moving.",
                "image": "assets/projects/wave/images/detail-02.jpg",
            "focus": "50% 55%",
                "impact": [
                  "Recognition over recall",
                  "Fewer taps",
                  "Faster decisions",
                  "More trades"
                ]
              },
              {
                "title": "Trade right from the list",
                "text": "Buy and sell sit on the watchlist itself, with just enough context to act with confidence. The app flexes to different trading styles instead of forcing one path.",
                "image": "assets/projects/wave/images/detail-03.jpg",
            "focus": "50% 75%",
                "impact": [
                  "More conversions",
                  "Trust and reliability",
                  "Ease of use"
                ]
              }
            ]
          },
          {
            "type": "subhead",
            "title": "Building a habit, not just a feature",
            "text": "Getting someone to trade once is not enough. We designed small, useful reasons to come back every day:"
          },
          {
            "type": "cards",
            "cols": 2,
            "items": [
              {
                "title": "Content that changes",
                "text": "Curated watchlists, opportunities, recommendations, news and research refresh through the day, so there's always something new worth checking."
              },
              {
                "title": "Alerts that prompt action",
                "text": "Price alerts and portfolio milestones reach people on their lock screen at the moment they can act on them."
              },
              {
                "title": "Widgets on the home screen",
                "text": "The things people care about stay visible outside the app, which keeps the market, and the app, top of mind."
              },
              {
                "title": "An app that adapts",
                "text": "The market screen learns what each person follows and puts it first, making it harder to switch to a competitor."
              }
            ]
          },
          {
            "type": "subhead",
            "title": "Research without the rabbit hole",
            "text": "Researching a stock usually meant hopping between tools. We brought indices, top gainers, news and search into one market screen, so seasoned investors can go from a hunch to an informed trade without leaving the app."
          },
          {
            "type": "subhead",
            "title": "Options trading, re-thought",
            "text": "Options are where experienced traders spend the most time, and where existing apps were the hardest to read. We redesigned the option chain around how people scan it:"
          },
          {
            "type": "compare",
            "before": {
              "title": "Existing apps",
              "points": [
                "Dense tables with every column at once",
                "Calls and puts hard to tell apart",
                "The current price lost in the list",
                "Several screens to place one order"
              ]
            },
            "after": {
              "title": "Wave 2.0",
              "points": [
                "Calls and puts side by side around the strike price",
                "The current price marked where the eye expects it",
                "Only the columns that matter, the rest on demand",
                "Trade straight from the chain"
              ]
            }
          }
        ]
      },
      {
        "id": "system",
        "nav": "Design system",
        "title": "One design system, every broker",
        "lead": "Because Wave 2.0 is sold to many brokers, the design system is the product as much as the screens are. The Moon Design System grew to more than 250 components and made designing new features about four times faster.",
        "blocks": [
          {
            "type": "cards",
            "cols": 2,
            "items": [
              {
                "title": "Fast design and delivery",
                "text": "Designers and developers assemble new mobile and web screens from ready-made components, and it's still how new features are designed and built today."
              },
              {
                "title": "Modular and easy to update",
                "text": "A flexible structure absorbs new features and changes, and lets each broker adapt any component to its own needs."
              },
              {
                "title": "Adapts to each brand",
                "text": "Colours, contrast and type adjust to a broker's brand from a single set of tokens, without breaking accessibility."
              },
              {
                "title": "Built for one codebase",
                "text": "The system follows the Ionic framework's structure, so one build serves iOS and Android and developers and designers speak the same language."
              }
            ]
          }
        ]
      },
      {
        "id": "results",
        "nav": "Results",
        "title": "Results",
        "lead": "Wave 2.0 went on to exceed expectations for 63 Moons and the brokers who adopted it.",
        "blocks": [
          {
            "type": "stats",
            "items": [
              {
                "value": "25+",
                "label": "branded broker apps launched"
              },
              {
                "value": "4M",
                "label": "trades placed every day"
              },
              {
                "value": "2B+",
                "label": "trades placed every year"
              },
              {
                "value": "73K",
                "label": "average peak sessions at a time"
              }
            ],
            "note": "Figures are approximate, based on data from 2021 to 2023."
          }
        ]
      },
      {
        "id": "reflection",
        "nav": "Reflection",
        "title": "What I took away",
        "lead": "Wave 2.0 was my first project at this scale, and it changed how I work.",
        "blocks": [
          {
            "type": "cards",
            "cols": 2,
            "items": [
              {
                "title": "Speed and polish can coexist",
                "text": "I kept improving the product as I understood it better, but not everything could be solved in one release. Shipping the best possible version within the limits, then improving it, beat waiting for perfect."
              },
              {
                "title": "Ambiguity doesn't go away",
                "text": "I started out wanting research and testing to answer everything. Some questions stay open, and a reasoned call based on experience, tested quickly, is often the right move."
              },
              {
                "title": "Design for value, not features",
                "text": "Product teams naturally want to add more. The pain points, context and behaviour behind a feature decide whether it's worth building, so I learned to ask the hard questions early."
              },
              {
                "title": "Teams make each other better",
                "text": "The best work came when we understood each other's constraints and made it safe to share problems early. That openness is what let a team this size move fast."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: "jda",
    name: "JDA Infra",
    kind: "Exploration",
    category: "Infrastructure",
    year: "2021",
    tint: "mint",
    locked: false,
    image: "assets/projects/jda/images/cover.jpg",
    thumbnail: "assets/projects/jda/images/thumbnail.jpg",
    alt: "JDA Infra website concept on a laptop",
    // Card image: the cover above, unless you add a separate "thumbnail".
    thumbAlt: "JDA Infra website on a laptop",
    // On the Works page (every project, in the order of this file).
    works: {
      text: "A website concept for an infrastructure firm that leads with finished projects instead of service lists, so prospective clients see the proof before the pitch.",
      meta: ["Visual and web design", "2 weeks · solo"]
    },
    headline: "A website concept that leads with finished projects, so clients see the proof before the pitch.",
    meta: {
      role: "Visual and web design",
      timeline: "2 weeks, 2021",
      team: "Solo",
      platform: "Web concept"
    },
    tools: ["Figma", "Framer", "Webflow"],
    team: {
      members: [],
      text: "A solo concept, reviewed along the way with two people who hire infrastructure firms for a living."
    },
    role: {
      text: "A concept for how an infrastructure firm could lead with proof. I handled the site structure, the visual design and a working Framer build.",
      focus: ["Site structure", "Visual design", "Content strategy", "Web build"]
    },
    outcomes: [
      { to: 3, label: "clicks to any finished project" },
      { to: 12, label: "project stories in the concept" },
      { to: 1, label: "clear route to get in touch" }
    ],
    overview: "A self-initiated concept for an infrastructure firm whose real site listed services but hid its most impressive work several pages deep.",
    problem: "Prospective clients wanted evidence: bridges, stations, towers. The site opened with a mission statement and a list of capabilities.",
    quote: { text: "Show me something you've built that looks like my project.", who: "Procurement lead, informal interview" },
    insights: [
      { title: "Proof sells", text: "Buyers compared firms by past projects, not by service lists." },
      { title: "Scale needs context", text: "A photo of a bridge meant more with its span, budget and timeline beside it." },
      { title: "Contact is a hand-off", text: "Serious enquiries wanted a named person, not a general form." }
    ],
    process: [
      { phase: "Listen", text: "Short conversations with three people who buy infrastructure services." },
      { phase: "Map", text: "Reorganised the site around projects instead of departments." },
      { phase: "Sketch", text: "A bold, image-led layout with the facts that buyers asked for." },
      { phase: "Design", text: "High-fidelity pages for the home, a project story and contact." },
      { phase: "Share", text: "Presented the concept as a case for leading with proof." }
    ],
    decisions: [
      { title: "Projects on the first screen", text: "The home page opens on a finished project, with the next one a swipe away.", image: "assets/projects/jda/images/detail-01.jpg", focus: "40% 45%" },
      { title: "Facts beside every photo", text: "Span, budget and timeline sit next to each image, so scale reads instantly.", image: "assets/projects/jda/images/detail-02.jpg", focus: "70% 45%" },
      { title: "A named person to contact", text: "Each project ends with the lead who ran it and a direct way to reach them.", image: "assets/projects/jda/images/detail-03.jpg", focus: "60% 70%" }
    ],
    results: "The concept became a talking point with the studio I shared it with, and the project-first structure shaped a later client pitch.",
    testimonial: { text: "It finally shows the work instead of describing it.", who: "Studio reviewer", role: "Creative director" },
    reflection: "I'd test the project-first home page against the old one with real visitors before calling it better."
  }
];

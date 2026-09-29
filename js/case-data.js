/* Case study content, one entry per project. The page (case-study.html) is a
   single template: case-study.html?p=ledgerly shows the "ledgerly" entry.
   All numbers, quotes and names below are SAMPLE DATA: replace them with
   your real work. The order here is also the "Next project" order.

   Fields
   - slug       the name in the link (?p=slug)
   - kind       "Case study" or "Exploration"
   - tint       mint | lilac | rose | sky | sand (the project's colour)
   - locked     true = asks for the case-study password first
   - image      the cover screenshot; crops of it illustrate the decisions
   - headline   one sentence under the project name
   - meta       role, timeline, team, platform
   - tools      the tools used on the project, in the order to show them
   - team       members (initials + name, shown as avatars) and one sentence
                about who you worked with; leave members empty for solo work
   - role       one sentence on what you owned ({role} becomes meta.role in
                bold) and the focus areas shown as tags
   - outcomes   three results; `to` is the number, prefix/suffix wrap it
   - chapters   overview, problem (+ quote), insights, process, decisions,
                results (+ testimonial), reflection */
window.CASE_STUDIES = [
  {
    slug: "ledgerly",
    name: "Ledgerly",
    kind: "Case study",
    category: "Fintech",
    year: "2025",
    tint: "mint",
    locked: false,
    image: "images/image_1.jpg",
    alt: "Ledgerly mobile screens: the spending overview and a linked card",
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
      { title: "Link one account, then show the payoff", text: "Onboarding now asks for a single account and immediately shows last month's spending, grouped for you. Everything else can wait.", focus: "30% 35%" },
      { title: "Suggested categories you can correct", text: "The app proposes categories from real transactions. You rename or merge them with a tap instead of building them from scratch.", focus: "65% 55%" },
      { title: "One number at the top", text: "The overview leads with what's left to spend this month. Charts moved one tap deeper, for the people who want them.", focus: "50% 80%" }
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
    image: "images/image_3.jpg",
    alt: "Wayfarer Health booking screen on a phone",
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
      { title: "Show the next open slot first", text: "The flow opens with real availability. Patients pick a time before being asked anything personal.", focus: "50% 30%" },
      { title: "Questions in the nurse's order", text: "Four questions, asked one at a time in the same order a nurse would ask them. The rest moved to the call.", focus: "50% 55%" },
      { title: "Meet your nurse before the call", text: "The confirmation shows who you'll speak to, with a photo and a line about them.", focus: "50% 75%" }
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
    image: "images/image_2.jpg",
    alt: "Parcelo dispatch dashboard on a laptop",
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
      { title: "Sort by urgency, always", text: "The most at-risk orders sit at the top, and the list re-sorts itself as the day moves.", focus: "35% 40%" },
      { title: "Lateness you can read at a glance", text: "A slim bar on the row's left edge grows with delay, so a sweep of the eye finds trouble.", focus: "25% 60%" },
      { title: "Call the driver from the row", text: "The driver's number and last position open in place. No switching systems.", focus: "70% 50%" }
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
    image: "images/image_6.jpg",
    alt: "Lumen Learn onboarding screen on a laptop",
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
      { title: "One question instead of forty courses", text: "Students state a goal and get one recommended path, with the full catalogue a tap away.", focus: "40% 40%" },
      { title: "A first lesson you can finish today", text: "Every path starts with a five-minute lesson designed to end in a small, real win.", focus: "60% 55%" },
      { title: "A path with a finish line", text: "Progress shows as a short route with a clear end, not a long list of videos.", focus: "50% 70%" }
    ],
    results: "Completion rose across both pilot companies, and the usability score climbed in every round of testing.",
    testimonial: { text: "Our onboarding completion jumped and nobody had to argue about opinions.", who: "Sofia Marchetti", role: "COO, Lumen Learn" },
    reflection: "The goal question worked so well that I'd test making it the whole home page."
  },
  {
    slug: "tradewise",
    name: "Tradewise",
    kind: "Exploration",
    category: "Fintech",
    year: "2022",
    tint: "sand",
    locked: false,
    image: "images/image_4.jpg",
    alt: "Tradewise trading screen concept on a phone",
    headline: "A trading screen concept that fits one clear decision on a card you can read with your thumb.",
    meta: {
      role: "Personal exploration",
      timeline: "3 weeks, 2022",
      team: "Solo",
      platform: "iOS concept"
    },
    tools: ["Figma", "ProtoPie", "Framer"],
    team: {
      members: [],
      text: "A solo exploration. I set the brief, designed and prototyped it myself, and tested it with five friends who trade every day."
    },
    role: {
      text: "A personal exploration into how much of a trade fits on one card you can use with your thumb, taken from paper sketches to a working prototype.",
      focus: ["Concept design", "Interaction design", "Prototyping", "Guerrilla testing"]
    },
    outcomes: [
      { to: 1, label: "card for price, depth and the decision" },
      { to: 5, label: "traders who reviewed the concept" },
      { to: 2, label: "taps from watchlist to order" }
    ],
    overview: "A self-initiated concept: what would a trading app look like if it were built for fast, confident decisions on a small screen?",
    problem: "Most trading apps spread price, order book and actions across separate screens. In a fast market, every switch costs a moment of doubt.",
    quote: { text: "I want to see the book and hit buy without scrolling.", who: "Day trader, concept review" },
    insights: [
      { title: "Depth is a feeling", text: "Traders read the order book as a shape, not as numbers. Bars beat digits." },
      { title: "Buy and sell must not look alike", text: "Under pressure, similar buttons cause costly mistakes." },
      { title: "Context stays visible", text: "The day's range mattered at the moment of decision, not before it." }
    ],
    process: [
      { phase: "Listen", text: "Conversations with five active traders about their worst misclicks." },
      { phase: "Map", text: "Listed every glance a trader makes before placing an order." },
      { phase: "Sketch", text: "Dozens of card layouts, sized for one-handed use." },
      { phase: "Test", text: "Clickable prototype reviewed by the same five traders." },
      { phase: "Share", text: "Wrote up the concept and the trade-offs I'd still want to test." }
    ],
    decisions: [
      { title: "Everything on one card", text: "Price, change, depth and the two actions share a single card you can read in one look.", focus: "50% 45%" },
      { title: "Depth as bars", text: "Bid and ask quantities show as bars, so the book reads as a shape.", focus: "50% 70%" },
      { title: "Unmistakable actions", text: "Buy and sell differ in colour, position and label, never colour alone.", focus: "50% 55%" }
    ],
    results: "Reviewers found the order they wanted faster than in the apps they use today, and all five asked to try a working version.",
    testimonial: { text: "This is the first mock-up where I didn't have to hunt for the book.", who: "Concept reviewer", role: "Active trader" },
    reflection: "A concept never meets real market stress. I'd want to test it with live, fast-moving prices."
  },
  {
    slug: "jda",
    name: "JDA Infra",
    kind: "Exploration",
    category: "Infrastructure",
    year: "2021",
    tint: "mint",
    locked: false,
    image: "images/image_5.jpg",
    alt: "JDA Infra website concept on a laptop",
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
      { title: "Projects on the first screen", text: "The home page opens on a finished project, with the next one a swipe away.", focus: "40% 45%" },
      { title: "Facts beside every photo", text: "Span, budget and timeline sit next to each image, so scale reads instantly.", focus: "70% 45%" },
      { title: "A named person to contact", text: "Each project ends with the lead who ran it and a direct way to reach them.", focus: "60% 70%" }
    ],
    results: "The concept became a talking point with the studio I shared it with, and the project-first structure shaped a later client pitch.",
    testimonial: { text: "It finally shows the work instead of describing it.", who: "Studio reviewer", role: "Creative director" },
    reflection: "I'd test the project-first home page against the old one with real visitors before calling it better."
  }
];

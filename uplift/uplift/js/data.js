/* ==========================================================================
   UPLIFT — Content
   Every figure below is traceable to a real, published source. If you change
   a number, change its citation too. This file is the single source of truth.
   ========================================================================== */

const UPLIFT = {};

/* --- Evidence ---------------------------------------------------------- */

UPLIFT.stats = [
  {
    value: 39, suffix: "%", tone: "ember",
    claim: "of young Australians reported stress affecting their mental health and wellbeing.",
    cite: "Mission Australia Youth Survey 2025 — school or study problems were the most commonly reported source of stress in the past year."
  },
  {
    value: 49, suffix: "%", tone: "ember",
    claim: "are experiencing high or very high psychological distress.",
    cite: "headspace National Youth Mental Health Foundation, October 2025 — survey of more than 3,000 young people."
  },
  {
    value: 31, suffix: "%", tone: "gold", altLabel: "31% → 65%",
    claim: "Distress climbs with age — from 31% of 12–14 year olds to 65% of 18–25 year olds.",
    cite: "headspace, October 2025. The school years are when the curve steepens, which is why early support matters."
  },
  {
    value: 17480, suffix: "", tone: "plum",
    claim: "young people aged 15–19 were surveyed in Australia's largest youth study.",
    cite: "Mission Australia Youth Survey 2024. This is not a small sample — it is national-scale evidence."
  },
  {
    value: 20, suffix: "%", tone: "eucalypt",
    claim: "Of students who felt they needed help, only about 1 in 5 actually visited a counselling service.",
    cite: "Systematic review of peer support and student wellbeing — reasons given were feeling the problem was not important enough, discomfort asking, and believing they would not be understood."
  },
  {
    value: 4, suffix: "×", tone: "eucalypt",
    claim: "Trained peer leaders referred distressed friends to a trusted adult four times more often than untrained peers.",
    cite: "Sources of Strength cluster randomised trial — the program also raised the whole school's acceptance of help-seeking."
  }
];

/* --- Causes: the system behind the pressure ---------------------------- */

UPLIFT.causes = {
  core: {
    id: "core",
    label: "Chronic academic pressure",
    cluster: "core",
    detail: "Not ordinary study challenge. Research defines it as fear of failure, worry about the future, chronic stress about workload and exams, worries about parental expectations, and competition with peers for grades — distinct from short-term exam nerves that pass."
  },
  nodes: [
    { id: "perf",   cluster: "individual", label: "Perfectionism",         detail: "Often mistaken for a virtue. It is a coping strategy, and it breaks under sustained load — a single B can feel like personal collapse." },
    { id: "fear",   cluster: "individual", label: "Fear of failure",       detail: "The engine of the feedback loop. Once performance dips, fear rises, which raises pressure further." },
    { id: "sleep",  cluster: "individual", label: "Sleep loss",            detail: "Sits underneath almost everything else. Less sleep reduces the coping capacity that pressure is drawing on." },
    { id: "self",   cluster: "individual", label: "Self-expectation",      detail: "Internalised standards. Highest among students whose report cards look strongest — the hidden-risk group." },

    { id: "stack",  cluster: "school",     label: "Assessment stacking",   detail: "Multiple due dates colliding in the same week. A structural cause students can realistically influence." },
    { id: "load",   cluster: "school",     label: "Workload volume",       detail: "The total quantity of set work across every subject at once, which no single teacher sees in full." },
    { id: "stakes", cluster: "school",     label: "High-stakes testing",   detail: "When one result is framed as determining the future, ordinary challenge becomes threat." },

    { id: "expect", cluster: "family",     label: "Parental expectations", detail: "Almost always well-meant. Parents want children to succeed and to be well, and often cannot see the trade-off happening." },
    { id: "atar",   cluster: "family",     label: "'Success = one number'", detail: "A narrow definition of success inherited from home and culture, which makes every result feel total." },

    { id: "social", cluster: "social",     label: "Social comparison",     detail: "Everyone posts the result, nobody posts the struggle — so each student concludes they are the only one finding it hard." },
    { id: "compete",cluster: "social",     label: "Peer competition",      detail: "Ranking against friends turns classmates into benchmarks, and makes admitting difficulty feel costly." }
  ],
  loop: ["core", "fear", "perf"],
  loopNote: "The feedback loop: pressure meant to lift performance ends up impairing it, which feeds more fear of failure, which raises the pressure again."
};

UPLIFT.clusterMeta = {
  individual: { label: "Individual", color: 0xC4614A },
  school:     { label: "School",     color: 0x6F4A6B },
  family:     { label: "Family",     color: 0xDFA046 },
  social:     { label: "Social",     color: 0x6E9068 },
  core:       { label: "Core",       color: 0x4A2F4A }
};

/* --- Stakeholders ------------------------------------------------------ */

UPLIFT.stakeholders = [
  {
    name: "Students (Years 7–9)", type: "affected",
    perspective: "Living the pressure daily, but unlikely to seek formal help — and often convinced they are the only one struggling.",
    influence: "Low individually, decisive as a body. Uptake by this group is what makes or breaks the program.",
    role: "The people Uplift serves. Their honest feedback shapes each round of sessions."
  },
  {
    name: "High-achieving students", type: "affected",
    perspective: "The hidden-risk group. Grades stay steady while stress builds underneath for months.",
    influence: "High credibility with peers — if they speak openly, the 'everyone else is coping' illusion breaks.",
    role: "Both a group to reach and the most persuasive storytellers Uplift can recruit."
  },
  {
    name: "Teachers", type: "both",
    perspective: "Care about wellbeing and results at once, and are already time-poor in a crowded curriculum.",
    influence: "Set the workload and assessment timing that drive a large share of the pressure.",
    role: "Supervise sessions lightly, and can act on the assessment-clash data Uplift collects."
  },
  {
    name: "Wellbeing staff & counsellors", type: "enabling",
    perspective: "Want early intervention rather than crisis response, but are limited by capacity.",
    influence: "Train and supervise peer leaders; own the referral pathway.",
    role: "The safety backbone. They make sure peer leaders support, never counsel."
  },
  {
    name: "Student Leadership Team", type: "enabling",
    perspective: "Looking for initiatives with real substance rather than one-off awareness days.",
    influence: "Credibility with the student body and access to assembly and timetable slots.",
    role: "The delivery engine — recruits, trains and runs each cohort of peer leaders."
  },
  {
    name: "Principal & School Board", type: "enabling",
    perspective: "Balancing duty of care, academic results and reputation; understandably cautious about change.",
    influence: "Approve session time, policy and the assessment calendar. Nothing scales without them.",
    role: "Approve the pilot, then review the pre/post data before wider rollout."
  },
  {
    name: "Parents & carers", type: "both",
    perspective: "Want children to succeed and to be well, and sometimes equate high expectations with support.",
    influence: "Set the pressure level at home, which no school program can override alone.",
    role: "Audience for the student-led information evening; partners in redefining what success means."
  },
  {
    name: "headspace, ReachOut, Kids Helpline", type: "enabling",
    perspective: "National expertise in youth mental health, with free evidence-based materials already built.",
    influence: "Lend credibility, training content and referral routes at no cost.",
    role: "External partners — Uplift uses their resources rather than reinventing them."
  }
];

/* --- Rollout ----------------------------------------------------------- */

UPLIFT.rollout = [
  { when: "Term 1 · Weeks 1–3", title: "Recruit and train the peer leaders",
    text: "Twelve Year 10–11 students are selected and trained by wellbeing staff using free headspace and ReachOut material. Training covers the two things that make peer support safe: how to listen, and exactly when to hand over to an adult." },
  { when: "Term 1 · Week 4", title: "Launch with student stories",
    text: "A short assembly where senior students speak honestly about their own academic stress. This is the normalising layer — it breaks the assumption that everyone else is coping, and it is what makes younger students willing to turn up." },
  { when: "Term 1–2 · 6 weeks", title: "Run the sessions",
    text: "Small groups of eight to ten Year 7–9 students meet weekly for 30–40 minutes across six weeks. Each session pairs one practical self-regulation strategy — planning, prioritising, breaking work down — with one honest peer conversation." },
  { when: "Ongoing", title: "Keep the check-ins going",
    text: "After the block ends, peer leaders stay attached to their group for informal check-ins, especially in the fortnight before major assessment. Support that only exists during a program stops working the moment the program does." },
  { when: "End of each block", title: "Measure, publish, adjust",
    text: "Students complete the same validated stress measure they answered in week one. Results go to the Student Leadership Team and school leadership, and the next block is adjusted from what the data shows." },
  { when: "Year 2", title: "Hand it over",
    text: "Each trained cohort trains the next. The program is designed so that the students who started it are not required for it to continue." }
];

/* --- Risks ------------------------------------------------------------- */

UPLIFT.risks = [
  { risk: "Peer leaders are put in situations beyond their training.",
    detail: "The single most serious risk in any peer support program.",
    fix: "Peer leaders never counsel. Training defines a clear line and a named staff member to hand over to, every session is lightly supervised, and referral is framed as success rather than failure." },
  { risk: "Younger students don't show up, or don't open up.",
    detail: "Wellbeing programs often fail on uptake rather than design.",
    fix: "The storytelling launch runs first, so students arrive already knowing the sessions are honest. Near-peers rather than adults lead them, which the evidence identifies as the trust advantage." },
  { risk: "The curriculum is already crowded.",
    detail: "Teachers have limited time to give and good reason to protect it.",
    fix: "Six weeks, 30–40 minutes — the shape the ACER review found most effective, and short enough to fit an existing pastoral or form-time slot rather than needing a new one." },
  { risk: "It fades once the founding group leaves.",
    detail: "Most student-led initiatives die at the end of Year 12.",
    fix: "Each cohort trains the next, and the material lives with wellbeing staff rather than with individuals. Succession is built into the design, not added later." },
  { risk: "It becomes an awareness campaign instead of a program.",
    detail: "Awareness is easy to run and hard to measure.",
    fix: "Every block is measured with the same validated instrument before and after. If the numbers don't move, the sessions change." },
  { risk: "It treats the symptom, not the cause.",
    detail: "Teaching coping skills can quietly excuse the pressure itself.",
    fix: "Uplift also collects assessment-clash data and takes it to leadership. Helping students carry the load and reducing the load are run as two halves of the same initiative." }
];

/* --- Success measures -------------------------------------------------- */

UPLIFT.metrics = [
  { label: "Primary", name: "Academic stress score", how: "Educational Stress Scale for Adolescents (ESSA), completed in week 1 and again at the end of each six-week block.", fill: 82 },
  { label: "Primary", name: "Distress vs eustress balance", how: "Adolescent Distress–Eustress Scale — an Australian-validated measure that separates healthy challenge from harm.", fill: 76 },
  { label: "Behavioural", name: "Help-seeking", how: "Referrals made by peer leaders, and counselling service use across the year level.", fill: 64 },
  { label: "Reach", name: "Participation and retention", how: "Share of the year level attending, and how many stay to the final session.", fill: 88 },
  { label: "Culture", name: "'I am not the only one'", how: "One survey item, tracked each block: whether students believe their peers find it hard too.", fill: 71 },
  { label: "Systemic", name: "Assessment clashes", how: "Number of weeks with three or more major tasks due, before and after the calendar proposal.", fill: 55 }
];

/* --- Sources ----------------------------------------------------------- */

UPLIFT.sources = [
  "Mission Australia (2025). Youth Survey Report 2025 — school or study problems the most commonly reported source of stress; 39% reported stress affecting wellbeing; 19% in high psychological distress.",
  "Mission Australia (2024). Youth Survey Report 2024 — 17,480 respondents aged 15–19; 30% concerned or extremely concerned about coping with stress.",
  "headspace National Youth Mental Health Foundation (October 2025). Psychological distress research — 49% of young Australians in high or very high distress, rising from 31% (12–14) to 65% (18–25).",
  "Systematic review (2023). The association between academic pressure and adolescent mental health problems — defines academic pressure and identifies school, family, policy and societal levers.",
  "Branson, V., Dry, M. J., Palmer, E., & Turnbull, D. (2019). The Adolescent Distress–Eustress Scale: Development and Validation. SAGE Open.",
  "Wyman, P. et al. Sources of Strength trial — trained peer leaders referred distressed friends to adults four times more often; increased school-wide acceptability of help-seeking.",
  "Peer Support Australia / ACER review — most effective wellbeing programs run up to one term, in regular sessions, as universal interventions.",
  "Self-regulated learning intervention research — SRL reduces academic stress, with the largest effects on workload stress and worry about grades.",
  "Lappalainen, R. et al. Youth COMPASS randomised controlled trial — a brief web-based ACT program reduced stress and increased academic buoyancy, with largest gains among the most stressed students."
];

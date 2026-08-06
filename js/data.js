/* ==========================================================================
   UPLIFT — Content  (v2)
   Every figure is traceable to a real published source. Change a number,
   change its citation in the same object. This file is the source of truth.
   ========================================================================== */

const UPLIFT = {};

/* --- Evidence ---------------------------------------------------------- */

UPLIFT.stats = [
  { value: 39, suffix: "%", tone: "coral",
    claim: "of young Australians say stress is hurting their mental health.",
    cite: "Mission Australia Youth Survey 2025. School and study problems were the single most common source of stress reported." },
  { value: 49, suffix: "%", tone: "coral",
    claim: "are in high or very high psychological distress right now.",
    cite: "headspace National Youth Mental Health Foundation, October 2025. Survey of more than 3,000 young people." },
  { value: 31, suffix: "%", tone: "gold", altLabel: "31\u219265%",
    claim: "Distress nearly doubles as you move through school \u2014 31% at ages 12\u201314, 65% by 18\u201325.",
    cite: "headspace, October 2025. The school years are when the curve steepens, which is the argument for starting early." },
  { value: 17480, suffix: "", tone: "violet",
    claim: "young people were surveyed in Australia's biggest youth study.",
    cite: "Mission Australia Youth Survey 2024, ages 15\u201319. This is national-scale evidence, not a small sample." },
  { value: 20, suffix: "%", tone: "green",
    claim: "Of students who knew they needed help, only 1 in 5 actually went to a counsellor.",
    cite: "Systematic review of peer support and student wellbeing. Reasons given: the problem didn't feel important enough, it felt uncomfortable, and they didn't think they'd be understood." },
  { value: 4, suffix: "\u00d7", tone: "green",
    claim: "Trained student leaders got friends to an adult four times more often than untrained students.",
    cite: "Sources of Strength randomised trial. The program also lifted the whole school's willingness to ask for help." }
];

/* --- Causes (8 nodes, plain language) ----------------------------------- */

UPLIFT.causes = {
  core: {
    id: "core", label: "The pressure", cluster: "core",
    detail: "Not normal school difficulty. Research defines it as fear of failure, worry about the future, constant stress about workload and exams, worry about living up to parents, and competing with mates for marks. Exam nerves pass. This doesn't."
  },
  nodes: [
    { id: "perf",    cluster: "you",    label: "Perfectionism",       detail: "Treated like a good trait. It's actually a coping strategy, and it snaps under load \u2014 one B can feel like total failure." },
    { id: "fear",    cluster: "you",    label: "Fear of failing",     detail: "The engine of the whole loop. Marks dip, fear climbs, pressure rises, marks dip further." },
    { id: "stack",   cluster: "school", label: "3 due same week",     detail: "Assessment stacking. No single teacher can see the full pile \u2014 and this is the cause students can realistically help change." },
    { id: "stakes",  cluster: "school", label: "One test = future",   detail: "When a single result is framed as deciding everything, normal challenge turns into threat." },
    { id: "expect",  cluster: "home",   label: "Parent expectations", detail: "Nearly always well-meant. Parents want you to do well and to be okay, and often can't see when those two start pulling apart." },
    { id: "number",  cluster: "home",   label: "Success = 1 number",  detail: "A narrow definition of success, inherited from home and from the culture around us. It makes every single result feel total." },
    { id: "compare", cluster: "mates",  label: "Everyone looks fine", detail: "People post the mark, not the meltdown. So every student privately concludes they're the only one struggling." },
    { id: "compete", cluster: "mates",  label: "Ranking each other",  detail: "When classmates become benchmarks, admitting you're finding it hard starts to feel expensive." }
  ],
  loop: ["core", "fear", "perf"],
  loopNote: "Pressure makes you do worse. Doing worse feeds fear of failing. Fear of failing raises the pressure. Round and round."
};

UPLIFT.clusterMeta = {
  you:    { label: "You",    color: 0xF2604C },
  school: { label: "School", color: 0x2FA8D8 },
  home:   { label: "Home",   color: 0xF5B62E },
  mates:  { label: "Mates",  color: 0x3FA96B },
  core:   { label: "Core",   color: 0x8A2A18 }
};

/* --- Stakeholders ------------------------------------------------------- */

UPLIFT.stakeholders = [
  { name: "Students (Years 7\u20139)", type: "affected",
    perspective: "Living it daily, unlikely to ask for formal help, and often convinced they're the only one finding it hard.",
    influence: "Low on their own, decisive as a group. Whether they show up is what makes or breaks Uplift.",
    role: "The people Uplift is for. Their feedback reshapes every block of sessions." },
  { name: "High-achieving students", type: "affected",
    perspective: "The hidden-risk group. Marks stay steady for months while the pressure builds underneath.",
    influence: "Huge credibility with peers. If they admit it's hard, the illusion that everyone's coping breaks.",
    role: "Both a group we need to reach and our most convincing speakers." },
  { name: "Teachers", type: "both",
    perspective: "Care about wellbeing and results at the same time, and are already stretched thin.",
    influence: "They set the workload and the due dates that drive a big share of the pressure.",
    role: "Lightly supervise sessions, and can act on the assessment-clash data we collect." },
  { name: "Wellbeing staff", type: "enabling",
    perspective: "Want to catch problems early instead of at crisis point, but there are only so many of them.",
    influence: "They train and supervise the peer leaders, and own the referral pathway.",
    role: "The safety backbone. They make sure peer leaders support and never counsel." },
  { name: "Student Leadership Team", type: "enabling",
    perspective: "Looking for something with real substance rather than another one-off awareness day.",
    influence: "Credibility with students, plus access to assembly and timetable slots.",
    role: "The engine \u2014 recruits, trains and runs each cohort of peer leaders." },
  { name: "Principal & Board", type: "enabling",
    perspective: "Balancing duty of care, academic results and the school's reputation. Reasonably cautious.",
    influence: "They approve session time, policy, and the assessment calendar. Nothing scales without them.",
    role: "Approve the pilot, then review the before-and-after data before it goes wider." },
  { name: "Parents & carers", type: "both",
    perspective: "Want their kid to do well and to be okay, and sometimes read high expectations as support.",
    influence: "They set the pressure level at home, which no school program can override by itself.",
    role: "Audience for the student-led info evening; partners in widening what success means." },
  { name: "headspace & ReachOut", type: "enabling",
    perspective: "National experts in youth mental health with free, evidence-based material already built.",
    influence: "Lend credibility, training content and referral routes at no cost.",
    role: "External partners. We use their resources instead of reinventing them." }
];

/* --- Rollout ------------------------------------------------------------- */

UPLIFT.rollout = [
  { when: "Term 1 \u00b7 Wk 1\u20133", title: "Train the peer leaders",
    text: "Twelve Year 10\u201311 students, trained by wellbeing staff using free headspace and ReachOut material. Two things get drilled: how to listen, and exactly when to hand over to an adult." },
  { when: "Term 1 \u00b7 Wk 4", title: "Launch with real stories",
    text: "A short assembly where senior students talk honestly about their own academic stress. This is what breaks the 'everyone else is coping' illusion \u2014 and it's why younger students turn up." },
  { when: "Term 1\u20132 \u00b7 6 wks", title: "Run the sessions",
    text: "Groups of eight to ten Year 7\u20139 students, 30\u201340 minutes a week for six weeks. Each session pairs one practical strategy \u2014 planning, prioritising, breaking work down \u2014 with one honest conversation." },
  { when: "Ongoing", title: "Keep checking in",
    text: "After the block ends, peer leaders stay with their group for informal check-ins, especially the fortnight before big assessments. Support that only exists during a program stops working the day it ends." },
  { when: "Each block", title: "Measure it and publish",
    text: "Students redo the same validated stress survey they did in week one. Results go to the Student Leadership Team and school leadership, and the next block gets adjusted from what the data says." },
  { when: "Year 2", title: "Hand it over",
    text: "Every trained cohort trains the next one. Uplift is built so the students who started it aren't needed for it to keep running." }
];

/* --- Risks --------------------------------------------------------------- */

UPLIFT.risks = [
  { risk: "A peer leader gets out of their depth.", detail: "The most serious risk in any peer support program.",
    fix: "Peer leaders never counsel. Training sets a hard line and names the staff member to hand to. Sessions are supervised, and referring someone is treated as success, not failure." },
  { risk: "Younger students don't show, or don't open up.", detail: "Wellbeing programs usually fail on turnout, not design.",
    fix: "The storytelling assembly runs first, so students already know the sessions are honest. Near-peers lead them, which is exactly the trust advantage the research identifies." },
  { risk: "There's no room in the timetable.", detail: "Teachers have limited time and good reason to protect it.",
    fix: "Six weeks, 30\u201340 minutes \u2014 the shape ACER found most effective, and short enough to fit an existing pastoral slot instead of needing a new one." },
  { risk: "It dies when we leave.", detail: "Most student-led initiatives end with their founders.",
    fix: "Each cohort trains the next, and the material lives with wellbeing staff rather than with individuals. Succession is designed in, not bolted on." },
  { risk: "It turns into an awareness campaign.", detail: "Awareness is easy to run and impossible to measure.",
    fix: "Every block is measured with the same validated instrument before and after. If the numbers don't move, the sessions change." },
  { risk: "It treats the symptom, not the cause.", detail: "Teaching coping skills can quietly let the pressure itself off the hook.",
    fix: "We also collect assessment-clash data and take it to leadership. Helping students carry the load and reducing the load are two halves of the same plan." }
];

/* --- Success measures ----------------------------------------------------
   'now' is the starting point we expect to measure in week one; 'target' is
   what we're aiming at by the end of the block. These are TARGETS, not
   results \u2014 Uplift hasn't run yet, and claiming otherwise would be dishonest.
   -------------------------------------------------------------------------- */

UPLIFT.metrics = [
  { label: "Primary",     name: "Academic stress score",     how: "Educational Stress Scale for Adolescents (ESSA), week 1 vs end of block.", now: 74, target: 52, unit: "", better: "down" },
  { label: "Primary",     name: "Healthy vs harmful stress", how: "Adolescent Distress\u2013Eustress Scale \u2014 Australian-validated, separates good pressure from harm.", now: 38, target: 62, unit: "", better: "up" },
  { label: "Behavioural", name: "Asking for help",           how: "Referrals made by peer leaders, plus counselling service use across the year level.", now: 20, target: 45, unit: "%", better: "up" },
  { label: "Reach",       name: "Turning up and staying",    how: "Share of the year level attending, and how many make it to the final session.", now: 0, target: 80, unit: "%", better: "up" },
  { label: "Culture",     name: "'I'm not the only one'",    how: "One survey item each block: do students believe their peers find it hard too?", now: 34, target: 70, unit: "%", better: "up" },
  { label: "Systemic",    name: "Weeks with 3+ tasks due",   how: "Counted before and after we take the assessment calendar proposal to leadership.", now: 9, target: 4, unit: "", better: "down" }
];

/* --- The live audience poll ----------------------------------------------
   Asked with hands up, counted by eye, clicked in live. No phones, no setup.
   -------------------------------------------------------------------------- */

UPLIFT.poll = {
  question: "Hands up if you've had three or more things due in the same week this term.",
  national: 39,
  buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  followUp: "Now keep your hand up if you told anyone how bad it got."
};

/* --- Sources -------------------------------------------------------------- */

UPLIFT.sources = [
  "Mission Australia (2025). Youth Survey Report 2025 \u2014 school and study problems the most common source of stress; 39% reported stress affecting wellbeing; 19% in high psychological distress.",
  "Mission Australia (2024). Youth Survey Report 2024 \u2014 17,480 respondents aged 15\u201319; 30% concerned or extremely concerned about coping with stress.",
  "headspace National Youth Mental Health Foundation (October 2025) \u2014 49% of young Australians in high or very high distress, rising from 31% (12\u201314) to 65% (18\u201325).",
  "Systematic review (2023). The association between academic pressure and adolescent mental health problems \u2014 defines academic pressure and identifies individual, school, family and societal levers.",
  "Branson, V., Dry, M. J., Palmer, E., & Turnbull, D. (2019). The Adolescent Distress\u2013Eustress Scale: Development and Validation. SAGE Open.",
  "Wyman, P. et al. Sources of Strength trial \u2014 trained peer leaders referred distressed friends to adults four times more often; increased school-wide acceptability of help-seeking.",
  "Peer Support Australia / ACER review \u2014 the most effective wellbeing programs run up to one term, in regular sessions, as universal interventions.",
  "Self-regulated learning intervention research \u2014 SRL reduces academic stress, with the largest effects on workload stress and worry about grades.",
  "Lappalainen, R. et al. Youth COMPASS randomised controlled trial \u2014 a brief web-based ACT program reduced stress and raised academic buoyancy, with the biggest gains among the most stressed students."
];

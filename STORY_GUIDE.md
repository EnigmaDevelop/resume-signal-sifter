# Story Guide

`content/<lang>/story.json` is optional. It feeds AI mode with narrative
context — motivation, values, career goals, self-assessments, and STAR-format
behavioral stories — so it can answer reflective questions ("why did you
choose this field?", "what's the hardest thing you've dealt with?") with
something real instead of "that's not covered in my résumé."

If you skip this file entirely, the site still works exactly as it does
today: AI mode falls back to `resume.json` alone, and honestly says a topic
isn't covered when it isn't.

Everything below is a tool for **you** (the candidate) to fill in
`story.json` thoughtfully — none of it runs in the app. The AI is instructed
to treat `story.json` as your own stated facts and self-assessments, never to
diagnose or infer things about you that aren't there.

`story.json` now feeds **two** AI faces: the public represent mode, and the
hidden interview practice mode (`?practice=1` — see the README), where an AI
interviewer builds its behavioral questions from this very file. That's one
more reason to fill `growthAreas` and a failure-themed behavioral story in
honestly: gaps you leave here are exactly what a good interviewer (real or
simulated) will probe, and the practice coach can only rehearse the story you
actually wrote down.

## 1. Self-assessments — pick what fits your journey

`story.json`'s `selfAssessments` is an array, and **every entry is
independently optional**. Add only the ones that are actually relevant to
where you are — a student or first-job engineer with no management
experience shouldn't take the leadership quiz, and that's fine. Below are
five instruments to choose from, each grounded in an established framework
rather than invented for this project, and each scored by *you* answering a
short set of questions — not the AI guessing from a paragraph of prose.

| Instrument | `instrument` value | Good for |
|---|---|---|
| [Team Role](#11-team-role-belbin) | `teamRole` | Anyone who's worked in a team — no seniority required |
| [Conflict Style](#12-conflict-style-thomas-kilmann) | `conflictStyle` | Anyone |
| [Motivation Drivers](#13-motivation-drivers-self-determination-theory) | `motivationDrivers` | Anyone |
| [Personality Snapshot](#14-personality-snapshot-tipi) | `personalitySnapshot` | Anyone, fully optional |
| [Leadership Style](#15-leadership-style-goleman) | `leadershipStyle` | **Only if you've led a team or project** — skip it otherwise |

We deliberately did **not** include MBTI or Enneagram-style typing here.
They're popular, but modern comparisons (e.g. large-scale 2024 analyses
comparing MBTI-style typing against the Big Five) consistently find they add
little to no predictive validity over better-established instruments, so
they'd be effectively fiction dressed as psychology. Everything below is
either a widely used applied-psychology tool (Belbin, Thomas-Kilmann),
grounded in decades of peer-reviewed research (Self-Determination Theory), or
a short, published, citable measure (TIPI for the Big Five) — [see sources](#sources).

Each `story.json` entry looks like:

```jsonc
{ "instrument": "teamRole", "primary": "Coordinator", "secondary": "Plant", "note": "string (optional)" }
```

### 1.1 Team Role (Belbin)

Meredith Belbin's nine team roles describe how people naturally contribute to
a team — not a rank or title, so this applies exactly as well to your first
internship as to a lead role.

| Cluster | Roles |
|---|---|
| Action | **Shaper** (pushes for results), **Implementer** (turns ideas into practical action), **Completer Finisher** (polishes, catches errors, protects deadlines) |
| People | **Coordinator** (clarifies goals, delegates), **Teamworker** (smooths friction, supportive), **Resource Investigator** (explores outside ideas/contacts) |
| Thinking | **Plant** (generates creative ideas), **Monitor Evaluator** (weighs options objectively), **Specialist** (deep expertise in a niche) |

For each scenario, pick the option closest to your instinct:

1. **Kicking off a new project.** You'd most likely:
   (a) Push the team to commit to an ambitious goal right away. *(Shaper)*
   (b) Throw out an unconventional alternative direction before settling in. *(Plant)*
   (c) Make sure everyone's clear on who owns what before starting. *(Coordinator)*
   (d) Hold off — you want to weigh options against data first. *(Monitor Evaluator)*

2. **The team's stuck on a decision for days.** You'd:
   (e) Go find out how another team or company solved this. *(Resource Investigator)*
   (f) Worry more about the deadline slipping than the debate. *(Completer Finisher)*
   (g) Check that the debate hasn't damaged anyone's feelings. *(Teamworker)*
   (h) Dive deep into the one technical detail you know best. *(Specialist)*

3. **A teammate is overwhelmed with tasks.** You'd:
   (i) Just start doing some of the practical work yourself. *(Implementer)*
   (g) Offer support and rebalance the mood. *(Teamworker)*
   (c) Reorganize who's doing what across the team. *(Coordinator)*
   (a) Push them to move faster — time is limited. *(Shaper)*

4. **Reviewing a nearly-finished deliverable.** You'd:
   (f) Obsess over small errors and edge cases before shipping. *(Completer Finisher)*
   (d) Step back and assess whether it actually meets the goal. *(Monitor Evaluator)*
   (b) Suggest one more creative improvement before it ships. *(Plant)*
   (i) Just want to ship it — it's good enough. *(Implementer)*

5. **In a brainstorming meeting.** You'd:
   (b) Generate several unconventional ideas. *(Plant)*
   (e) Bring in ideas or contacts from outside the room. *(Resource Investigator)*
   (d) Critically weigh the pros and cons of each idea presented. *(Monitor Evaluator)*
   (c) Make sure everyone gets airtime to contribute. *(Coordinator)*

6. **The team's direction feels unclear.** You'd:
   (c) Call a meeting to realign on goals and roles. *(Coordinator)*
   (a) Push a direction forward decisively. *(Shaper)*
   (h) Focus on your own area regardless, trust others to sort the rest. *(Specialist)*
   (g) Check in on how people are feeling about the ambiguity. *(Teamworker)*

**Scoring:** tally your letters — each maps to one role (shown in italics).
Your most-picked role is `primary`, second-most is `secondary`.

### 1.2 Conflict Style (Thomas-Kilmann)

The Thomas-Kilmann Conflict Mode Instrument (TKI) describes five ways people
handle conflict, along two axes: how assertive you are about your own
concerns, and how cooperative you are about the other side's.

| Mode | Assertive? | Cooperative? |
|---|---|---|
| **Competing** | High | Low |
| **Collaborating** | High | High |
| **Compromising** | Medium | Medium |
| **Avoiding** | Low | Low |
| **Accommodating** | Low | High |

1. **You and a teammate strongly disagree on technical approach, deadline is tight.** You'd:
   (a) Push hard for your approach — you're confident it's right and time is short. *(Competing)*
   (b) Dig into both approaches together until you find one that satisfies both concerns. *(Collaborating)*
   (c) Suggest blending both approaches, each side gives a little. *(Compromising)*
   (d) Let it go for now, revisit after the deadline. *(Avoiding)*
   (e) Go with their approach — the relationship matters more here. *(Accommodating)*

2. **A stakeholder pushes back hard on your proposal.** You'd:
   (a) Defend your position firmly. *(Competing)*
   (b) Ask questions to understand their concern and rework the proposal together. *(Collaborating)*
   (c) Meet them halfway on the parts they push back on hardest. *(Compromising)*
   (d) Table the discussion, come back once things cool down. *(Avoiding)*
   (e) Adjust the proposal to their preference. *(Accommodating)*

3. **Two teammates are in conflict and it's affecting the team.** You'd:
   (a) Step in and make the call yourself. *(Competing)*
   (b) Facilitate a conversation until they reach a shared solution. *(Collaborating)*
   (c) Suggest both sides give something up to move forward. *(Compromising)*
   (d) Let them work it out themselves. *(Avoiding)*
   (e) Side with whichever view keeps the peace. *(Accommodating)*

4. **You disagree with a decision that's already been made.** You'd:
   (a) Push back and try to get it reversed. *(Competing)*
   (b) Propose a follow-up discussion to explore a better option together. *(Collaborating)*
   (c) Accept it with one modification you negotiate. *(Compromising)*
   (d) Let it go — not worth the friction. *(Avoiding)*
   (e) Support the decision even though you disagree. *(Accommodating)*

5. **Limited time, two priorities compete for your attention.** You'd:
   (a) Prioritize the one you believe matters most, full stop. *(Competing)*
   (b) Get everyone in a room to jointly figure out the real priority. *(Collaborating)*
   (c) Split your time between both. *(Compromising)*
   (d) Postpone deciding as long as possible. *(Avoiding)*
   (e) Defer to whoever asked more recently or is more senior. *(Accommodating)*

6. **Giving feedback you know will be unwelcome.** You'd:
   (a) Say it directly regardless of the reaction. *(Competing)*
   (b) Frame it as a joint problem to solve together. *(Collaborating)*
   (c) Soften it, only raise part of the concern. *(Compromising)*
   (d) Hold off, hope it resolves itself. *(Avoiding)*
   (e) Focus mostly on the positives, downplay the concern. *(Accommodating)*

**Scoring:** tally your letters — most-picked is `primary`, second-most is
`secondary`.

### 1.3 Motivation Drivers (Self-Determination Theory)

Self-Determination Theory (Deci & Ryan) is one of the most replicated
frameworks in workplace psychology: people are consistently more engaged and
satisfied when a role meets three core needs. This is a natural companion to
the free-text `motivation` field above.

- **Autonomy** — control over how you work
- **Mastery** (competence) — visibly getting better at something hard
- **Relatedness** — connection with people you work with

1. **What energizes you most at work?**
   (a) Choosing how I approach a problem myself. *(Autonomy)*
   (b) Getting noticeably better at a hard skill. *(Mastery)*
   (c) Working closely with people I trust and enjoy. *(Relatedness)*

2. **What frustrates you most?**
   (a) Being micromanaged on how to do the work. *(Autonomy)*
   (b) Doing repetitive work with no room to improve. *(Mastery)*
   (c) Working in isolation with little team connection. *(Relatedness)*

3. **You'd pick a project because:**
   (a) You get to decide the approach end-to-end. *(Autonomy)*
   (b) It stretches a skill you want to develop. *(Mastery)*
   (c) You get to work with people you respect. *(Relatedness)*

4. **Your ideal feedback is:**
   (a) Trust to self-correct with minimal check-ins. *(Autonomy)*
   (b) Specific, technical feedback that sharpens your craft. *(Mastery)*
   (c) Feedback delivered in a warm, relational way. *(Relatedness)*

5. **A great day at work looks like:**
   (a) You set your own agenda and followed it. *(Autonomy)*
   (b) You solved something that was genuinely hard. *(Mastery)*
   (c) You had energizing conversations with teammates. *(Relatedness)*

6. **You'd turn down a raise if it meant:**
   (a) Losing control over how you work. *(Autonomy)*
   (b) Stagnating in a role with no growth. *(Mastery)*
   (c) Being moved away from a team you value. *(Relatedness)*

**Scoring:** tally your letters — most-picked is `primary`, second-most is
`secondary`.

### 1.4 Personality Snapshot (TIPI)

The Ten-Item Personality Inventory (Gosling, Rentfrow & Swann, 2003) is a
short, published, widely cited measure of the Big Five — the personality
model with the strongest scientific support (unlike MBTI/Enneagram-style
typing). Rate how much you agree with each pair on a 1 (disagree strongly) to
7 (agree strongly) scale:

1. Extraverted, enthusiastic.
2. Critical, quarrelsome. *(reverse-scored)*
3. Dependable, self-disciplined.
4. Anxious, easily upset. *(reverse-scored)*
5. Open to new experiences, complex.
6. Reserved, quiet. *(reverse-scored)*
7. Sympathetic, warm.
8. Disorganized, careless. *(reverse-scored)*
9. Calm, emotionally stable.
10. Conventional, uncreative. *(reverse-scored)*

**Scoring:** for reverse-scored items, subtract your rating from 8 first.
Then average each pair:

- Extraversion = (1 + 6) / 2
- Agreeableness = (7 + 2) / 2
- Conscientiousness = (3 + 8) / 2
- Emotional Stability = (9 + 4) / 2
- Openness = (5 + 10) / 2

Bucket each average as **low** (1–3), **medium** (3–5), or **high** (5–7) and
record all five in `story.json` — this one doesn't have a single
primary/secondary, it's a small profile:

```jsonc
{
  "instrument": "personalitySnapshot",
  "openness": "high",
  "conscientiousness": "high",
  "extraversion": "medium",
  "agreeableness": "high",
  "emotionalStability": "high"
}
```

### 1.5 Leadership Style (Goleman)

**Only fill this in if you've actually led a team, project, or mentored
others.** If that's not you yet, skip it — `story.json` works fine without
it, and forcing an answer here just produces noise.

Daniel Goleman's *"Leadership That Gets Results"* (Harvard Business Review,
2000) describes six styles:

| Style | One-line summary |
|---|---|
| **Coercive** | "Do what I say." Demands immediate compliance. |
| **Authoritative** | "Come with me." Mobilizes people toward a shared vision. |
| **Affiliative** | "People come first." Builds emotional bonds and harmony. |
| **Democratic** | "What do you think?" Builds consensus through participation. |
| **Pacesetting** | "Do as I do, now." Sets high standards, leads by example. |
| **Coaching** | "Try this." Develops people for the long term. |

For each scenario, pick the option closest to your instinct.

1. **A project is badly behind schedule.** You'd most likely:
   - (a) Take direct control and assign exact tasks to get back on track. *(Coercive)*
   - (b) Rally the team around why the deadline matters and let them figure out how. *(Authoritative)*
   - (c) Check in on team morale first — burnout might be the real issue. *(Affiliative)*
   - (d) Call a team meeting to replan together. *(Democratic)*

2. **A new hire is struggling with an unfamiliar part of the codebase.** You'd:
   - (e) Pair with them and demonstrate the "right" way to do it. *(Pacesetting)*
   - (f) Ask guiding questions and let them find the fix themselves, checking in over time. *(Coaching)*
   - (a) Just tell them the fix so the ticket doesn't slip. *(Coercive)*
   - (c) Reassure them this is normal and offer support. *(Affiliative)*

3. **The team disagrees on a technical direction.** You'd:
   - (d) Open it up for a vote or consensus-building discussion. *(Democratic)*
   - (b) Share the bigger-picture goal and trust the team to align around it. *(Authoritative)*
   - (a) Make the call yourself to keep things moving. *(Coercive)*
   - (e) Prototype your preferred approach fast to prove it works. *(Pacesetting)*

4. **A skilled but underperforming teammate needs to improve.** You'd:
   - (f) Invest time in a development plan tailored to them. *(Coaching)*
   - (a) Set a firm deadline with clear consequences. *(Coercive)*
   - (c) Have an empathetic 1:1 to understand what's going on for them personally. *(Affiliative)*
   - (e) Model the standard yourself and expect them to match it. *(Pacesetting)*

5. **You're introducing a major process change.** You'd:
   - (b) Paint a picture of the future state and why it's worth it. *(Authoritative)*
   - (d) Involve the team in designing the new process from the start. *(Democratic)*
   - (e) Roll it out yourself first as a working example. *(Pacesetting)*
   - (a) Mandate it with a clear rollout date. *(Coercive)*

6. **Team morale has dropped after a tough quarter.** You'd:
   - (c) Prioritize rebuilding trust and connection before pushing output again. *(Affiliative)*
   - (b) Reconnect the team to the larger mission to re-motivate them. *(Authoritative)*
   - (f) Ask each person what they need to feel supported right now. *(Coaching)*
   - (d) Open a retro and let the team decide what changes. *(Democratic)*

7. **You need something done exactly right, fast, with no room for error.** You'd:
   - (e) Do the critical part yourself and delegate the rest with tight review. *(Pacesetting)*
   - (a) Give precise, non-negotiable instructions. *(Coercive)*
   - (b) Clarify why precision matters here and trust the team's judgment on execution. *(Authoritative)*
   - (f) Walk a junior teammate through it as a growth opportunity, with close oversight. *(Coaching)*

8. **A teammate asks for career advice.** You'd:
   - (f) Ask questions that help them figure out their own next step. *(Coaching)*
   - (c) Focus on how they're feeling about their path, not just the logistics. *(Affiliative)*
   - (b) Connect their growth to where the team/company is heading. *(Authoritative)*
   - (d) Suggest they discuss it openly with the team for more perspectives. *(Democratic)*

**Scoring:** tally your letters — most-picked is `primary`, second-most is
`secondary`. Ties are fine — pick whichever feels truer, or note both in
`note`.

None of these are validated psychometric instruments in the clinical sense —
treat each result as a useful label for a chat bot to reference, not a
verdict on who you are.

## 2. Behavioral stories (STAR method)

`behavioralStories[]` entries answer "tell me about a time when..." questions
— exactly what recruiters ask, and exactly what AI mode has no grounding for
without this file. Use the STAR structure for each one:

- **Situation** — brief context. What was going on?
- **Task** — what were you responsible for?
- **Action** — what did *you* specifically do? (Not "we" — your part.)
- **Result** — what happened? Quantify it if you can.

Tag each story with a `theme` so the AI can reach for the right one:
`challenge`, `conflict`, `failure`, `leadership`, `achievement` are good
defaults, but use whatever fits your experience.

Aim for 2-4 stories. More than that adds size to every AI-mode request for
diminishing returns — pick the ones you'd actually want to tell in an
interview.

## 3. Motivation, values, work style, career goals

Short, free-form fields — a sentence or two each is plenty. Prompts to get
unstuck:

- **motivation** — Why this field, specifically? What's a moment that
  confirmed it was the right choice?
- **values** — What do you actually optimize for at work, even when no one's
  checking? (Not aspirational buzzwords — real tie-breakers you've used.)
- **workStyle** — How do you like to collaborate? Sync vs. async, planning
  depth, feedback cadence?
- **careerGoals** — Where do you want to be in 3-5 years, and why?

## 4. Keep it honest

The Worker's system prompt instructs the AI to treat everything in
`story.json` as your own stated facts and self-assessments — it won't
independently diagnose your team role, conflict style, or leadership style,
or invent challenges you didn't describe. That only works if what you write
here is true. Vague or inflated answers will just produce vague or inflated
chat responses.

## Sources

- Belbin, R. M. (1981). *Management Teams: Why They Succeed or Fail.*
- Kilmann, R. H., & Thomas, K. W. (1974/1977). *Thomas-Kilmann Conflict Mode Instrument.*
- Deci, E. L., & Ryan, R. M. — [Self-Determination Theory](https://selfdeterminationtheory.org/theory/); see also [PMC review of SDT and workplace outcomes](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11200516/).
- Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003). *A very brief measure of the Big Five personality domains.* Journal of Research in Personality, 37, 504-528. (TIPI)
- Goleman, D. (2000). *Leadership That Gets Results.* Harvard Business Review.
- On MBTI vs. Big Five predictive validity: [MBTI vs. Big Five vs. Enneagram: 2025 Scientific Validity Guide](https://www.thepersonalitylab.org/blog-posts/the-science-of-personality-comparing-mbti-big-five-and-enneagram-validity-in-2025).

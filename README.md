# UC Berkeley EECS Electives

Find the upper-division EECS electives that fit you. Answer five quick questions and get ranked picks, the reasons each one fits, and the path of prerequisites to get there. Part of the [EECS Hub](https://eecs-hub.vercel.app), with the [EECS Planner](https://eecs-planner.vercel.app), [EECS Prereqs](https://eecs-prereqs.vercel.app) and [EECS Links](https://eecs-links.vercel.app).

## Features

- **Five questions:**
  1. What excites you (up to 3 of 13 interests, in order).
  2. Projects or proofs.
  3. Your goal after Berkeley.
  4. Whether you still need a design course, and which term.
  5. What you've already taken.
- **58 electives ranked** with a match score and reasons: "All about robotics & control", "Counts as a design course", "2 prerequisites to go", "Not usually offered in Spring".
- **Your path:** every prerequisite you'd still need for the courses you pick, in steps where each step only needs earlier ones. Courses you've taken count their own prerequisites as done (Math 54 covers Math 51 and 52).
- **Quick tweaks** for term and design without retaking the quiz, and a **share link** that opens straight to your results.
- Links to each course's full prerequisite chain on EECS Prereqs, and to the planner.
- Light and dark mode, and a layout that works on phones.

## How matches are scored

| Part | Weight | From |
| --- | --- | --- |
| Interests | 50% (60% if design doesn't matter) | your 1st, 2nd and 3rd picks count 100%, 70% and 50% |
| Goal | 15% | which interests each goal builds toward |
| Learning style | 15% | project-heavy, mixed, or math-heavy |
| Readiness | 10% (only if you said what you've taken) | official prerequisites |
| Design course | 10% (only if you need one) | the EECS Planner's design list |

Courses not offered in your term score half, and courses missing from recent schedules score lower. Ties go to courses that open up more electives.

Prerequisites, terms, units and areas are official (from EECS Prereqs). How each course leans (its topics and whether it's project- or math-heavy) is our own read of its catalog description, in `lib/profiles.ts`.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3003`.

## Course data

`data/courses.json` comes from EECS Prereqs, which builds and checks it. A GitHub Action (`.github/workflows/sync-course-data.yml`) syncs it every Monday and opens a pull request when it changed (enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**). To refresh it by hand:

```bash
npm run sync-data                                        # from https://eecs-prereqs.vercel.app/courses.json
npm run sync-data -- ../eecs-prereqs/data/courses.json   # or from a local copy
```

## Settings

`NEXT_PUBLIC_FEEDBACK_URL` (optional) is a Google Form link; when it's set, the footer shows a "💬 Send feedback" button. Visits are counted with [Vercel Web Analytics](https://vercel.com/docs/analytics) (no cookies); turn it on under the project's **Analytics** tab.

This is an unofficial student tool. Always confirm with the Class Schedule or your advisor.

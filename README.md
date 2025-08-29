# TFM.ai – Budget Pacing Flow & Automation Plan

This is a small, purpose‑built prototype I created for TFM Digital to demonstrate speed, taste, and usefulness for the AI Solutions role. I built and shipped the first working version in about a day.

## What’s inside

- Budget Flow tab with an interactive flowchart
  - Pan/zoom, click nodes for details, filter views
  - Roles, thresholds (±5, >5, >25), and mismatch paths
- “How we fix it” Automation Plan below the flow
  - Phased steps, team responsibilities, risks, and timeline
  - Styled to match the app’s glass UI
- Light, local‑first Vite + React stack with Tailwind

## Why I built this

I was assigned a task to document the current workflow and propose a path to improve it. I turned it into a working page so the team has a concrete artifact to discuss and iterate on. This is specifically for TFM to evaluate me for the AI position.

## Run locally

```bash
npm install
npm run dev
# open the URL printed by Vite (e.g. http://localhost:5173/tfm.ai/)
```

## Deploy (GitHub Pages)

The workflow in `.github/workflows/pages.yml` builds with `VITE_BASE=/<repo>/` so it works for `tfm.ai` and `tfm-sandbox`. Set Pages source to “GitHub Actions”.

---

If you’re reviewing this for TFM: happy to walk through the code, discuss integration options (ad APIs, Sheets/DB, auth), and ship a production‑ready version.

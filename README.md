# VitalVoice - Dashboard

A web dashboard for managing blood requests, finding donors, and tracking voice-agent call outcomes. This project is the frontend for the Vital Voice system and integrates with Supabase Edge Functions and a Postgres back end.

![Alt text](./assets/VitalVoiceLogo_32.png)

## Features

- Request management: create, update, and track blood requests
- Donor discovery: search donors by blood type and proximity
- Campaign and call tracking: log voice-agent call transactions
- Integration-ready: REST endpoints exposed via Supabase Edge Functions

## Quick Start

Prerequisites

- Node.js >= 18 (recommended) or Bun
- Git
- A Supabase project (for backend functions and Postgres)

Install dependencies (choose one):

```bash
# using Bun (recommended if you have it)
bun install

# using npm
npm install

# using yarn
yarn install
```

Run the dev server:

```bash
# npm / yarn
npm run dev
# or
yarn dev

# bun
bun run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Environment

Copy the example env file and fill in your Supabase project values:

```bash
cp env.example .env
# then edit .env and set VITE_SUPABASE_URL, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY
```

Key environment variables (from `env.example`):

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

Supabase edge functions are defined under the `supabase/functions/` directory and are expected to be deployed to your Supabase project.

## Project Structure (high level)

- `src/` — React app sources (pages, components, contexts, hooks)
- `supabase/functions/` — serverless functions (blood-requests, donors, call-transactions, etc.)
- `docs/` — project documentation (API docs, architecture, application guide)
- `env.example` — example environment variables

## Documentation

- Application guide: `docs/APPLICATION_GUIDE.md`
- API documentation: `docs/API_DOCUMENTATION.md`
- Architecture notes: `docs/ARCHITECTURE.md`

## Deployment

This repository is a frontend that works with Supabase for backend services. Typical deployment steps:

1. Deploy Supabase Edge Functions from `supabase/functions/` to your Supabase project.
2. Configure your Supabase project and update environment variables.
3. Build the frontend (`npm run build`) and host the `dist/` output on any static host or CDN.

CI/CD and cloud deployment steps depend on your chosen platform (Netlify, Vercel, Cloud Run, S3+CloudFront, etc.).

## License

MIT
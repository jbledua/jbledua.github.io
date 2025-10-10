# jbledua.github.io

## Development

 1. Install dependencies
 2. Run dev server

## Contact form -> n8n -> Discord

This project can post contact requests directly to an n8n webhook and forward them to a Discord channel.

### 1) Configure environment

Vite loads env files by mode. Recommended setup:

- Development: `.env.development.local`
- Production build: `.env.production.local`

You can also use `.env.local` (applies to all modes), but per-mode files are safer.

Create one of the above files at the project root:

```
VITE_N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/<workflow-id>
# Optional shared secret your n8n workflow checks (via header X-Webhook-Secret)
VITE_N8N_WEBHOOK_SECRET=some-long-random-string
```

Restart the dev server after adding/changing env vars.

### 2) n8n workflow

- Trigger: Webhook (POST). Set the path to something unique and, if desired, enable "Response" with 200 OK.
- Security: If you used `VITE_N8N_WEBHOOK_SECRET`, add a simple IF node to check `{{$json["headers"]["x-webhook-secret"]}}` equals your secret; reject otherwise.
- Optional: Validate and map fields from the incoming JSON body: `requesterName`, `requesterEmail`, `requested` (array), `message`, and `metadata`.
- Discord: Add a Discord node configured with your bot token and target channel. Compose a message like:

```
New contact request
- Name: {{$json.requesterName}}
- Email: {{$json.requesterEmail}}
- Requested: {{($json.requested || []).join(', ')}}
- Message: {{$json.message}}
- From: {{$json.metadata.url}} at {{$json.metadata.timestamp}}
```

Return a 200 response so the site shows success.

### 3) Test locally

- Run the site and submit the form on /contact.
- Check n8n execution log and Discord channel for the message.

If you see an error on the page, ensure `VITE_N8N_WEBHOOK_URL` is set and reachable from the browser.

## Deployment (GitHub Pages via Actions)

This repo includes a workflow at `.github/workflows/deploy.yml` that builds the site with Vite and deploys to GitHub Pages. It targets branches `main` and `project-origin`.

Steps to enable:

1. In GitHub, go to Settings → Pages and set the Source to "GitHub Actions".
2. In Settings → Secrets and variables → Actions, add these repository secrets:
	- `N8N_WEBHOOK_URL`: your n8n webhook URL
	- `N8N_WEBHOOK_SECRET`: optional token checked by your n8n workflow
3. Push to `project-origin` (or `main`) to trigger the workflow.

Notes:

- The workflow sets `VITE_N8N_WEBHOOK_URL`, `VITE_N8N_WEBHOOK_SECRET`, and `VITE_ASSUME_SUCCESS_ON_OPAQUE` during the build.
- The custom domain `josiah.ledua.ca` is persisted via `public/CNAME`.
- All `VITE_*` variables are public in the client bundle; keep real security on the n8n side (CORS, token checks, rate limiting).

## Jobs data from Supabase

This repo includes a small data access layer to fetch Job Info from a Supabase database.

Files:
- `src/services/supabaseClient.js` — initializes the browser Supabase client using Vite env vars.
- `src/services/jobsService.js` — functions to read/write jobs (getJobs, getJobById, createJob, updateJob, deleteJob).

Environment setup (copy and edit `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Suggested `jobs` table schema (SQL):

```
create table if not exists public.jobs (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	company text not null,
	location text,
	start_date date not null,
	end_date date,
	description text,
	bullets text[], -- or use jsonb for richer structure
	created_at timestamptz not null default now()
);
```

Example usage in a component:

```js
import { useEffect, useState } from 'react';
import { getJobs } from './src/services/jobsService';

export default function ExampleJobs() {
	const [jobs, setJobs] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				const data = await getJobs({ limit: 10 });
				setJobs(data);
			} catch (e) {
				setError(e.message);
			}
		})();
	}, []);

	if (error) return <div>Error: {error}</div>;
	return (
		<ul>
			{jobs.map(j => (
				<li key={j.id}>{j.title} · {j.company}</li>
			))}
		</ul>
	);
}
```

Note: If you want anonymous reads on production, add a Row Level Security policy to allow `select` on `public.jobs` for `anon` role.

### Presets linked to jobs

SQL files are provided in `supabase/` to store presets and link them to jobs, variants, and skills:

- `supabase/schema_presets.sql` — tables: `presets`, `job_variants`, `preset_jobs`, optional `skill_groups`, `skills`, `preset_skills`. Includes public read RLS policies.
- `supabase/seed_presets.sql` — example data mirroring the in-code presets.

How to run (in Supabase SQL editor):

1) Paste and run `schema_presets.sql`.
2) Paste and run `seed_presets.sql` (or adapt with your real jobs before running).

Using from the app:

```js
import { listPresets, getPreset } from './src/services/presetsService';

const presets = await listPresets();
const presetId = presets[0]?.id;
const uiState = await getPreset(presetId);
// uiState matches the shape used by ResumeBuilderPage: { options, summaryVariant, experiences, skills }
```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

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
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

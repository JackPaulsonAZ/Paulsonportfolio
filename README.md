# Paulson Portfolio

Personal portfolio site for John W. Paulson — Prompt Designer & Generative AI Systems builder — with a built-in AI assistant that answers visitor questions grounded in the resume data.

## How it's built

- **Frontend:** plain HTML/CSS/JS (no build step, no framework). `index.html` renders itself from [`content/resume.json`](content/resume.json), the single source of truth for all resume content.
- **Resume assistant:** [`api/chat.js`](api/chat.js), a Vercel serverless function. It reads `content/resume.json`, builds a system prompt from it, and calls the Claude API. The API key never touches the browser.

Because it's plain static HTML/CSS/JS with a Vercel Functions endpoint, there's no local build tooling required — this repo has no `node_modules` and no bundler step.

## Updating your resume content

Edit [`content/resume.json`](content/resume.json). Both the rendered page and the chatbot's knowledge pull from this one file, so it only needs to be updated in one place.

## Local preview

The static site (without the live chat) can be previewed with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`. The chat widget will show a network error locally unless you also run the `/api/chat` function — the easiest way to test the full experience end-to-end is to deploy to a Vercel preview (see below), or run `vercel dev` locally if you have Node.js and the [Vercel CLI](https://vercel.com/docs/cli) installed.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), "Add New Project" → import the GitHub repo. No framework preset needed ("Other" is fine) — Vercel will serve the root as static files and `api/chat.js` as a serverless function automatically.
3. In the project's **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` — your Claude API key from the [Anthropic Console](https://console.anthropic.com).
   - `ANTHROPIC_MODEL` (optional) — defaults to `claude-haiku-4-5-20251001` if unset.
4. Deploy. Every push to `main` will auto-deploy; PRs get their own preview URLs.

See `.env.example` for the environment variables used locally with `vercel dev`.

## Customizing the assistant

The assistant's instructions and the resume context it's given both live in [`api/chat.js`](api/chat.js) (`buildSystemPrompt`). It's instructed to answer only from the resume JSON, speak about John in the third person, and redirect off-topic questions — adjust the tone or guardrails there.

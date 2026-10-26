# Model Olympics

**Two models. Same challenge. Same rules. Watch the race — and inspect the actual outputs.**

A local React + Express structured-output exhibition. Two concurrent requests receive the exact same fixed prompt, output budget, temperature, timeout and deterministic judge. Model output is displayed as text and is never executed.

## Run

Requires Node.js 22. Load only credentials you intend to use for this project.

```sh
npm ci --cache .npm-cache
npm run dev
```

Open http://127.0.0.1:4206. The API listens on http://127.0.0.1:5206; both bind exclusively to loopback. No parent-directory files or external services are required for fixture mode.

Optional live configuration: copy `.env.example` to `.env`, supply an API key, an OpenAI-compatible base URL and two distinct actual model IDs, then restart. Choose **Live** in the mode selector. Both models must support Chat Completions with `temperature: 0` and `max_tokens: 400`. There is no automatic fallback from failed live requests to fixtures. Requests have a 20-second timeout and no retries; only one race is accepted at a time. Each live click makes exactly two requests. Output tokens are capped at 800 total per race, but this is **not a monetary spending cap**. Prices are not configured; all costs show N/A. No unattended live smoke was run.

## Three-click demo

1. Click **Inspect shared prompt** to view the exact three requirement mappings and common instructions.
2. Click **Hide shared prompt** to return to the two-lane view.
3. Click **RACE**. The first fixture returns 4/4, while the second returns 3/4 because it maps R2 to `hashPassword` instead of `validatePassword`. Inspect both raw outputs and individual check outcomes.

Fixture mode is visibly marked **LOCAL FIXTURE · NO INFERENCE**. It reads the two JSON files in `fixtures/` concurrently and runs the same actual judge as live mode. The outputs are deliberately curated test data, not recorded or generated model responses. Fixture timing measures local file I/O; tokens and costs are N/A. There are no staged delays or synthetic progress events.

## Verification and evidence

Install the matching browser inside the project (not a system cache):

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache" npx playwright install chromium
npm run build
npm run test
npm run e2e
npm run demo
```

The Playwright configuration defaults to the project-local `.browser-cache`, or honors an explicit `PLAYWRIGHT_BROWSERS_PATH`. On Apple Silicon macOS, if the local browser is absent, it can read an existing Chromium from the standard Playwright cache without modifying it. An explicit `PLAYWRIGHT_EXECUTABLE_PATH` is also supported. The recorded verification used this existing Chromium fallback plus project-local FFmpeg; the full Chromium download was interrupted after it stalled. Fresh installations should use the matching browser command above. It starts its own servers, so stop `npm run dev` before browser tests. Unit tests validate scoring, malformed data, concurrent starts before either completion, timeout isolation and exception redaction. E2E asserts the actual UI → API → fixture read → judge → displayed scores path and repeat execution. Demo records the same real workflow at 1440×810.

Local proof is retained in `artifacts/build.log`, `artifacts/test.log`, `artifacts/e2e.log`, `artifacts/demo.log`, screenshots `artifacts/demo-results.png` / `artifacts/fixture-results.png`, and videos under `artifacts/playwright/demo/` and `artifacts/playwright/e2e/`. Evidence is intentionally git-ignored. The initial E2E attempt failed because Playwright's matching browser was missing; its genuine log is retained as `artifacts/e2e-initial-browser-missing.log`. A subsequent fallback attempt also exposed a missing FFmpeg dependency (`artifacts/e2e-missing-ffmpeg.log`); project-local FFmpeg installation resolved it. The commands were then rerun; see `status.json` for final exit codes.

## Scope and limitations

Status: **PARTIAL**. The offline vertical slice is verified. Real two-model inference, token metadata and endpoint compatibility remain unverified. Enabling live mode validates configuration presence and distinct IDs, not credentials or model capabilities.

This is a **one-run exhibition, not a scientific model ranking**, and a structured-output challenge, not a code-execution benchmark. The four checks comprise strict JSON structure with unique expected requirement IDs plus three exact mappings. Markdown fences are invalid JSON. Partial scores are check counts, not accuracy estimates. No Docker execution, streaming token display, repeated sampling, persistent history, accounts or cloud deployment is included. Progress reflects actual request lifecycle events; a short local read may finish before the browser paints an intermediate state.

Provider wall time uses server `performance.now()` and includes request overhead. Token counts come only from provider usage metadata; missing usage is N/A. No pricing values are guessed. Provider errors are redacted before returning to the browser. Input is limited to selecting fixture/live, body size is capped, and users cannot supply prompts or file paths. Credentials remain on the backend. Use only trusted provider endpoints; this local MVP is not a hardened public server.

MIT licensed. No external fonts, assets or credentials are required to render the interface.

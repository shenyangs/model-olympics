# A06 — Model Olympics

Build a truthful, visually dramatic TWO-model live showdown. Read ./AGENTS.md. Your highest priority is REAL provider calls, equal prompt and objective judging — not cosmetic fake races. Implement within 110 minutes.

## Stack / constraints
- React/Vite dashboard, Express backend, provider adapters for available configured models (choose 2 distinct actual model IDs, same provider acceptable). Use only env keys; never expose keys to frontend. Restrict to one fixed benign challenge for first MVP. Exactly same input, temperature if supported, max output budget, timeout and judge for both. Show provider/model IDs.
- Preferred challenge: generate structured JSON mapping a tiny set of requirements to functions; evaluate against a fixed deterministic JSON schema/test vector. This avoids executing untrusted model-generated code. OPTIONAL actual code-execution round only if a properly isolated Docker runner is working (`--network none`, read-only root, resource/time limits); otherwise explicitly say 'structured-output challenge', not 'unit-tested code benchmark'.
- Measure wall time via performance.now on server. API tokens from provider actual usage metadata, else N/A. Costs only when public pricing values are manually configured with a dated price source; otherwise N/A. Labels 'one-run exhibition, not scientific model ranking'.
- Missing two usable model credentials: provide a clearly watermarked REPLAY / LOCAL FIXTURE experience and set status PARTIAL, not PASS for live showdown.

## P0 happy path
1. Choose one curated challenge; two recognizable lanes with exact model names.
2. Click RACE. Two requests start concurrently, progress animations derive from emitted real lifecycle/streaming events (show Spinner if no streaming).
3. Finish with real latency, actual returned result, schema/test pass or fail, real provider usage if available; UI does not invent numbers.
4. Clear timeout/error state for either provider.

## Must prove
- Unit test judge receives valid and invalid outputs, scores correctly; test fake provider adapter with deterministic responses and validates two concurrent start timestamps.
- E2E uses explicitly labelled FIXTURE provider without external credentials and verifies scoring/status. Live-provider smoke only if keys present, with max total spend guard.
- Demo video may be labelled REPLAY if keys absent. README explains demo vs live and lack of broad benchmark fairness.

## X hook
'Two models. Same challenge. Same rules. Watch the race — and inspect the actual outputs.' 0–2s side-by-side; 2–15s simultaneous race; 15–25s measured times + objective outcome.


Execute within this directory only. Run npm install, implement, then build/test/e2e/demo. Preserve real logs and status.json.

This is an authorized independent sprint execution. Start implementing now, no confirmation. Do not spawn subagents. All writes limited to this app directory; use npm install --cache .npm-cache and keep .npm-cache ignored. Existing Playwright browsers may be read from ~/Library/Caches/ms-playwright; if install required use PLAYWRIGHT_BROWSERS_PATH inside this project. Install dependencies, replace starter tests with meaningful behavior tests, run build/test/e2e/demo and preserve actual logs, screenshot and video. Do not read user credentials or other project data. Missing model keys: runnable clearly labelled fixture and PARTIAL status. Add LICENSE. Verify and finish, not merely plan.

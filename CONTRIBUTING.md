# Contributing

Thanks for taking the time to look at this project. This guide explains how to set it up, what a change must pass before it's merged, and the conventions the code follows.

## Set up

You need Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

No backend or environment file is needed. Requests are answered inside the browser by the mock API in `src/mocks`, which saves messages in `localStorage`.

## Workflow

1. Open an issue first for anything larger than a small fix, so the approach can be agreed before you write code.
2. Create a branch from `main`: `feat/short-name`, `fix/short-name`, `docs/short-name` or `chore/short-name`.
3. Keep the change small and focused on one thing.
4. Open a pull request against `main` and fill in the template. Nothing is pushed straight to `main`.

## Checks

Run these before you open a pull request. CI runs the lint, the tests and the build on every pull request.

| Check                      | Command                  |
| -------------------------- | ------------------------ |
| Lint                       | `npm run lint`           |
| Formatting                 | `npx prettier --check .` |
| Unit and integration tests | `npm test`               |
| End-to-end tests           | `npm run e2e`            |
| Types and build            | `npm run build`          |

A pre-commit hook (Husky and lint-staged) runs Prettier and ESLint on the files you staged.

The end-to-end tests start the dev server by themselves. Run `npx playwright install chromium` once before the first run.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:` or `ci:`, followed by a short summary in the imperative. Explain the reason for the change in the body when it isn't obvious.

## Code conventions

The full reference is [AGENTS.md](AGENTS.md), which people and AI coding agents both follow. The rules that matter most:

- **TypeScript:** no `any` and no `@ts-ignore`. Shared types live in `src/types`.
- **Layers:** components read and change state through the store (`src/stores`). The store calls the service (`src/services/messageService.ts`). Only the service layer makes HTTP requests.
- **State:** Zustand. Subscribe with a selector so a component re-renders only when its slice changes.
- **Mock API:** `src/mocks` must behave like the real API described in the README. If you change an endpoint, change the handlers and their tests together.
- **Errors:** a failed request shows a clear message and never crashes the page.
- **Files:** components are PascalCase (`MessageList.tsx`); everything else is camelCase. Import through the `@/` alias.

## Tests

- Unit and integration tests are `*.test.ts(x)` files in a `__tests__` folder next to the code. They use Vitest and React Testing Library.
- End-to-end tests are in `e2e/tests`, written with the page object in `e2e/pages`. The network is stubbed by `e2e/fixtures/mockAPI.ts` so the tests are deterministic.
- Query by role and label, as a user would. Don't test implementation details.
- Add or update tests in the same pull request as the behaviour change. A bug fix comes with a test that fails without the fix.

## Decision records

Record a non-trivial choice (a new library, a pattern, a trade-off) in [architecture-decision-record.md](architecture-decision-record.md), with the alternatives you rejected and why.

## Reporting a bug

Open an issue with the bug report template. Include the steps to reproduce, what you expected and what happened. If the demo data matters, say whether you had reset it.

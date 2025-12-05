# Contributing

Thanks for helping improve Streamlined Properties. This document explains how to contribute, open a good PR, and run checks locally.

Getting started

- Fork the repository and create a feature branch from `001-account-management` (or the appropriate branch for your work).
- Keep changes small and focused; one logical change per PR.

Branching & commits

- Branch name style: `feature/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
- Commit messages: use present-tense short summary, optionally a longer description. Example:

```
feat(auth): add OTP verification flow

Adds server-side OTP verification, UI and tests.
```

Code style

- This project uses TypeScript and ESLint. Run `npm run lint` and fix lint errors before opening a PR.
- Keep formatting consistent with the repo (use Prettier or editor settings).

Tests

- Add tests for new business logic where feasible. If adding UI changes, prefer integration tests or manual QA notes in the PR.

Pull request checklist

- [ ] Branch created from correct base
- [ ] Code compiles and app runs locally
- [ ] Linting passes (`npm run lint`)
- [ ] Added/updated docs where relevant (`docs/`)
- [ ] Describe manual QA steps (how to exercise the change)

Review notes

- Provide a short summary of intent and any architecture decisions.
- Link related issues or spec docs in the PR description.

Communication

- If the change is large or impacts many teams, open an issue first to discuss the approach.

Thank you for contributing!

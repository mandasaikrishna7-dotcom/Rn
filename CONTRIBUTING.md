# Contributing to NextSelf

Thank you for your interest in contributing to NextSelf! This document outlines the process for contributing to this personal-growth curation platform.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the Issues section
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python/Node versions, browser)

### Suggesting Features

1. Check existing issues and discussions
2. Open a new issue with the "feature" label
3. Describe the feature, use case, and any implementation ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, atomic commits
4. Ensure all tests pass and linting is clean
5. Update documentation if needed
6. Submit a Pull Request with a clear description

## Development Setup

1. Clone the repo
2. Follow the Setup Guide in the README
3. Run both backend and frontend in development mode

## Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints for all functions
- Run `ruff check .` before committing
- Run `ruff format .` for auto-formatting

### Frontend (TypeScript/React)
- Follow the project ESLint config
- Use functional components with hooks
- Follow the neo-brutalist design system (tokens in `web/app/globals.css`)
- Respect `prefers-reduced-motion` for all animations

## Design System

All design tokens are defined in `web/app/globals.css`. Do not hardcode colors, spacing, or fonts. Use the CSS variables:
- `--void`, `--cobalt`, `--halftone-cyan`, `--spider-magenta`, `--paper`, `--ink`
- `--font-display`, `--font-body`, `--font-mono`
- Spacing scale: 4/8/12/16/24/32/48/64/96

## Honest UI Policy

- All stubbed/placeholder features must be clearly labeled
- Use `BackendGap` component for backend gaps
- Dashed borders = "not real yet"
- No fake data, streaks, or gamification

## Commit Messages

Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, no code changes
- `refactor:` code restructuring
- `test:` adding tests
- `chore:` maintenance

## Testing

- Backend: `pytest` (when tests exist)
- Frontend: `npm run lint` and `npm run build` must pass

## Questions?

Open a discussion or issue. We are happy to help!

---

**NextSelf** — Built for hackathons, designed for growth.
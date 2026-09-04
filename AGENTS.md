# AGENTS.md

See AGENTS.project.md in this repo for stack, commands and conventions specific to this project.

## Architecture

- No backward-compatibility layers. Remove obsolete code instead of adding fallbacks or migrations.
- Simplest implementation that meets current requirements. No speculative abstractions.
- Build the smallest working end-to-end version first, then layer on top of it.
- Keep components modular with clean separation of concerns.
- Follow proven conventions from established products over inventing custom approaches.

## Code quality

- Prefer well-maintained libraries and existing project dependencies over custom implementations.
- Enforce strict typing. No `any` in TypeScript/.Net/C#.
- No hardcoded secrets. Environment variables only.
- Fix root causes, not symptoms. Document the root cause and the fix.
- No comments on AI-generated code. Code must be self-explanatory. Comment only non-obvious existing code, in short imperative statements.

## Workflow

- Don't seek permission for routine, reversible, low-risk steps.
- If the task is not routine or reversible or low risk, Plan before implementing.
- If plan is unclear, incomplete or ambiguous, ask for clarifications before starting.
- Propose and get approval before deviating from an approved plan.
- Keep user informed about progress.
- If the plan involves multiple steps, ask for review before starting next step.
- Verify the codebase compiles/builds after changes.
- Write or update tests for every change and run the suite. if the change is small and reversible no need to run tests.
- Commit incrementally with short, clear messages after every action.
- Use past tense for commit messages. (e.g., "fixed" instead of "fix")
- Remove scratch files and temporary debug output before finishing.
- Update documentation in the same change that requires it.

## Writing style

- Direct, natural, human. Short sentences, simple SVO structure.
- No comma before and/or/but.
- No long dashes (—) or em dashes. Seperate the sentences instead.
- No markdown for emphasis. Markdown only for code, lists, links, tables, images.
- No AI clichés, filler, metaphors or preamble.

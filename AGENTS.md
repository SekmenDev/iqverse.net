# AGENTS.md

## Architecture and Design
- **Do not preserve backward compatibility**: Remove obsolete code and paths instead of adding compatibility layers, fallbacks or migrations.
- **Choose simple implementations**: Implement the simplest solution that fully meets current requirements. Avoid speculative abstractions, configuration overhead and unnecessary indirection.
- **Grow the system in layers**: Start from the smallest working end-to-end version and build incrementally on top of functional software. Never sacrifice a working product for incomplete complexity.
- **Keep components modular**: Separate concerns cleanly and maintain modular architecture.
- **Design for operational simplicity**: Prefer simple, observable architectures that are easy to deploy, monitor and debug in production without premature complexity.
- **Build versioned APIs**: Structure all system and user-facing APIs with explicit versioning (e.g. `/api/v1/`) from the start.
- **Make long-term architectural decisions**: Avoid temporary stopgaps meant to be replaced later; design for long-term maintainability.
- **Adopt proven patterns**: Study how established products solve similar problems and follow proven conventions rather than inventing custom approaches from scratch.

## Implementation and Code Quality
- **Prefer established libraries**: Use well-maintained, proven libraries when they reduce complexity or improve reliability instead of reimplementing common functionality.
- **Leverage existing dependencies**: Check and utilize dependencies already available in the project before adding new packages or writing custom implementations.
- **Use project package manager**: Use `yarn` exclusively. Never run `npm` or `pnpm` commands to prevent lockfile drift and configuration conflicts.
- **Enforce consistency and avoid duplication**: Avoid duplicating functionality. Reuse existing code and patterns instead of rewriting. Do not create redundant helpers, components or utilities.
- **Enforce strict typing**: Avoid `any` types in TypeScript code. Define explicit types and interfaces for all module boundaries.
- **Prioritize practical security**: Implement necessary security measures (authentication, input validation, encryption) without introducing unnecessary abstraction layers or excessive complexity.
- **Protect secrets**: Never hardcode credentials, tokens or API keys into source files. Use environment variables exclusively.
- **Fix issues instead of working around them**: When encountering bugs, design flaws or incomplete implementations, fix the root cause properly. Document the root cause and the fix.
- **Do not add comments to AI-generated code**: Code generated or modified by AI must be self-explanatory. Do not add comments to generated code. If existing non-obvious code requires comments, write short imperative statements.

## Workflow and Planning
- **Always generate a plan before executing**: Generate a step-by-step plan before implementing any feature or fixing any issue. Review the plan to ensure it is logical, efficient and addresses root causes. Obtain approval before starting execution.
- **Execute approved plans autonomously**: Once a plan is approved, act autonomously. Do not ask for permission for routine, reversible or low-risk steps.
- **Never deviate from the plan without approval**: If new information suggests a better approach, propose the change and await approval before proceeding. Do not make mid-task assumptions.
- **Verify and fix compilation errors before proceeding**: Ensure the codebase compiles without errors before and after making changes. Fix compilation errors immediately.
- **Run lint and type checks**: Run `yarn lint` and `yarn check` to verify changes before completing tasks.
- **Write and run tests**: Do not assume existing tests cover changes. Write new tests or update existing ones, and always run the test suite to verify functionality.
- **Commit incrementally**: Commit changes after each completed step with clear, short and concise commit messages.
- **Clean temporary artifacts**: Remove scratch files, one-off test scripts and temporary debug outputs before finalizing any work.
- **Automate everything**: Fully automate tests, builds, deployments, database migrations and routine maintenance tasks using scripts and CI pipelines.
- **Update documentation to reflect changes**: When code is added, modified or deleted, update corresponding documentation immediately.

## Writing and Communication Style
- **Write naturally without AI markers**: Write all text, documentation, comments and git commit messages in a direct, natural human style. Use short sentences with simple SVO structure. Omit commas before conjunctions (such as 'and', 'or', 'but'). Avoid cliché AI phrasing, filler words, metaphors, introductory fluff and robotic formality.
- **Avoid markdown formatting except where needed**: Do not wrap normal text in markdown. Only use markdown for code blocks, lists, links, tables and images. Do not use markdown for emphasis, headers in plain text, comments or commit messages.
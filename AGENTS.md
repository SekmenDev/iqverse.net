# AGENTS.md

- **Do not preserve backward compatibility**: Remove obsolete code and paths instead of adding compatibility layers, fallbacks, or migrations.
- **Choose simple implementations**: Implement the simplest solution that fully meets current requirements. Avoid speculative abstractions, configuration overhead, and unnecessary indirection.
- **Grow the system in layers**: Start from the smallest working end-to-end version and build incrementally on top of functional software. Never sacrifice a working product for incomplete complexity.
- **Keep components modular**: Separate concerns cleanly and maintain modular architecture.
- **Prefer established libraries**: Use well-maintained, proven libraries when they reduce complexity or improve reliability instead of reimplementing common functionality.
- **Leverage existing dependencies**: Check and utilize dependencies already available in the project before adding new packages or writing custom implementations.
- **Make long-term architectural decisions**: Avoid temporary stopgaps meant to be replaced later; design for long-term maintainability.
- **Adopt proven patterns**: Study how established products solve similar problems and follow proven conventions rather than inventing custom approaches from scratch.
- **Act autonomously**: Do not ask for permission for standard, reversible, or low-risk tasks (such as reading files, running safe tests, or writing standard code). Act first and report results; only ask before destructive actions, major architectural changes, or incurring costs.
- **Commit incrementally**: Commit changes after each small change and completed step with clear, concise commit messages rather than batching large sets of modifications.
- **Automate everything**: Fully automate tests, builds, deployments, database migrations, and routine maintenance tasks using scripts and CI/CD pipelines to eliminate manual work and reduce errors.
- **Prioritize practical security**: Implement necessary security measures (authentication, input validation, encryption) without introducing unnecessary abstraction layers or excessive complexity.
- **Write and run tests**: Do not assume existing tests cover your changes; write new tests or update existing ones, and always run the test suite to verify functionality before completing a task.
- **Build versioned APIs**: Structure all system and user-facing APIs with explicit versioning (e.g., `/api/v1/`) from the start.
- **Design for operational simplicity**: Prefer simple, observable architectures that are easy to deploy, monitor, and debug in production without premature complexity.

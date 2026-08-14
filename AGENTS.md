# AGENTS.md

- Do not preserve backward compatibility. Remove obsolete paths instead of adding compatibility layers, fallbacks or migrations.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration and indirection.
- Grow the system in layers. Start from the smallest version that works end to end and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own implementation or adding packages. Do not assume a library lacks a capability without checking its documentation and types.
- Make architectural decisions for the long term. Do not accept a stopgap that only works for now and is meant to be replaced later.
- Study how established products solve the problem before designing a solution. Adopt their proven patterns and conventions rather than inventing an approach from scratch.
- **Do not ask for permission** for standard, reversible, or low-risk tasks (such as reading files, running safe tests, or writing standard code). Act first and report the result. Only ask before destructive actions, major architecture changes, or spending money.
- **Automate everything**: Tests, builds, deployments, database migrations, and routine maintenance should be fully automated. Use scripts, CI/CD pipelines, and infrastructure-as-code to eliminate manual work and reduce errors.
- **Security first, but don't over-engineer**: Implement necessary security measures (auth, input validation, encryption where needed), but avoid adding unnecessary layers of abstraction or "zero-trust" complexity unless the threat model explicitly requires it. Secure by default, simple in implementation.
- **Write your own tests (and run them)**: Do not assume existing tests cover your changes. Write new tests or update existing ones to validate your work. Always run the test suite before considering a task complete. If tests are missing or broken, fix them as part of the same task.
- **Build with versioned APIs**: All user-facing and system APIs must be versioned from the start (e.g., /api/v1/). Use version headers or path segments, and maintain backward compatibility for previous versions until they are explicitly deprecated and removed.
- **Design for operational simplicity**: Prefer simple, observable architectures. Choose technologies that are easy to deploy, monitor, and debug in production. Avoid complex multi-region deployments or advanced Kubernetes configurations unless strictly necessary for the product requirements.

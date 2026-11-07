# AGENTS.md — PaintShop

## 1. Project and stack

Repository: `savinshin/paintshop`. Main branch: `main`.

PaintShop is an existing website and online catalog for a real automotive paint and body-repair supply store in Baranovichi, Belarus. Reliability, correctness, security, maintainability, and practical extensibility take priority.

The project may grow through new pages, APIs, modules, database tables, or justified architectural changes. Do not artificially limit a task to small changes, but do not add unrelated features or premature abstractions.

Current scope: public catalog, product and category administration, and informational pages. Do not introduce carts, checkout, orders, payments, or other e-commerce flows without a separate task.

Current stack (verify versions and configuration in the repository before relying on them):

- Backend: C#, ASP.NET Core Web API, .NET 10, EF Core 10, Npgsql, AutoMapper, FluentValidation.
- Database: PostgreSQL 18.
- Authentication: ASP.NET Core Identity, cookie authentication, antiforgery protection, `Admin` role.
- Frontend: Angular 22, TypeScript, RxJS, Tailwind CSS 4, daisyUI 5, Angular Material/CDK.
- Local infrastructure: Docker and Docker Compose.
- Rendering: Angular CSR. SSR/SSG is not currently configured.

Repository layout:

- `PaintShopBackEnd/Domain/` — domain entities and interfaces.
- `PaintShopBackEnd/Application/` — commands, services, application interfaces, and mappings.
- `PaintShopBackEnd/Infrastructure/` — EF Core context, model configurations, migrations, repositories, seeding, and admin creation.
- `PaintShopBackEnd/WebApi/` — controllers, request/response models, validation, and API mappings.
- `PaintShopBackEnd/Program.cs` — application setup, authentication, authorization, and middleware.
- `PaintShopFrontEnd/src/app/core/` — API services, models, guards, and interceptors.
- `PaintShopFrontEnd/src/app/features/` — pages and feature code.
- `PaintShopFrontEnd/src/app/layout/` — shared application shell.
- `PaintShopFrontEnd/src/environments/` — frontend environment configuration.
- `compose.yaml` — local `db`, `backend`, and `frontend` services.
- `.env.example` — local environment template; `.env` must not be committed.
- `README.md` — local setup instructions.

Do not import the architecture or business rules of Phone Accessories, CRM, or another project into PaintShop by default.

## 2. Sources of truth and working language

Use this order when making decisions:

1. The current task and explicit user instructions.
2. Applicable `AGENTS.md` instructions.
3. Current source code, database migrations, API contracts, and configuration.
4. README and other project documentation.
5. Previously approved decisions.

If a document contradicts current code, report the discrepancy instead of silently guessing. Distinguish planned changes, unmerged work, merged `main`, locally verified behavior, and production behavior.

Write new or modified repository documentation, developer instructions, code comments, and technical descriptions in English. Preserve established identifiers and external contracts. Do not translate existing customer-facing Russian/Belarusian content, validation messages, legal text, store details, or URLs unless the task explicitly requests it.

## 3. Local development

The default local workflow uses Docker Compose. Follow `README.md` for the current setup commands.

```bash
cp .env.example .env
# Set POSTGRES_PASSWORD in .env before starting.
docker compose up -d --build
docker compose exec backend dotnet ef database update
```

Create an administrator interactively when needed:

```bash
docker compose exec backend dotnet run --no-build --no-launch-profile -- create-admin
```

Seed categories; load demonstration products only when explicitly needed:

```bash
docker compose exec backend dotnet run --no-build --no-launch-profile -- seed
docker compose exec backend dotnet run --no-build --no-launch-profile -- seed-demo
```

Local URLs with the default `.env.example` ports:

- Frontend: `http://localhost:4200/`
- Backend Swagger: `http://localhost:5027/swagger`
- PostgreSQL host port: `127.0.0.1:5434`

The API and database are local development services, not a production deployment. The commands above are documentation, not permission for an agent to run them automatically.

## 4. Core working rules

- Work strictly within the approved task. First identify the goal, current behavior, expected behavior, affected components, and acceptance criteria.
- Before implementation, inspect the current branch, working tree, relevant files, nearby examples, and actual API/database contracts.
- Do not write code from assumptions or invent models, fields, routes, permissions, payload keys, statuses, or behavior.
- Do not add unrelated refactoring, cleanup, optimization, UI changes, dependencies, abstractions, or features.
- Do not add broad `try/catch`, fallback behavior, unnecessary null guards, or alternative flows without a demonstrated requirement. Implement necessary validation and error handling.
- Prefer straightforward, maintainable changes using existing project conventions. Larger cross-layer changes are appropriate when the task requires them.
- For a new table, migration, API contract, dependency, authentication change, or architectural approach, explain the need, compatibility impact, and risks; obtain approval for the approach before implementation.
- Preserve unrelated and uncommitted changes. Never overwrite someone else's work or perform speculative cleanup.
- If important information is missing, identify the exact file, schema, contract, or safe runtime observation needed.
- Do not automatically agree with a weak proposal. Recommend one preferred approach, explain the trade-offs briefly, and leave final technical decisions to the user.

## 5. Codex workflow and review

1. Read the task and these instructions.
2. Inspect `git status --short`, `git branch --show-current`, relevant diffs, files, and analogous implementations before editing.
3. For non-trivial tasks, outline the smallest complete solution, affected layers, compatibility risks, and required decisions.
4. Edit only approved, relevant files; preserve established behavior outside the task.
5. Review the final diff and run only permitted checks. Request approval before state-changing checks or commands.
6. Report changed files, implemented behavior, actual verification, unverified areas, and remaining risks.

For reviews, inspect the real diff rather than accepting an implementation report. Classify findings as blocking issues, optional improvements, or open questions. Cite specific files and lines when possible. State one verdict: **ready to accept**, **changes required**, or **insufficient information**. The user decides whether to merge.

Do not claim that a build, test, migration, API call, or production verification passed unless it was actually performed and the result was observed.

## 6. Command permissions

Allowed without additional approval when safe and relevant:

- File inspection: `pwd`, `ls`, `find`, `rg`, `grep`, `cat`, `sed`.
- Read-only Git: `git status`, `git diff`, `git diff --check`, `git log`, `git branch --show-current`, `git ls-files`.
- Read-only Docker discovery: `docker ps`, `docker compose ps`, `docker image ls`, `docker volume ls`, and targeted logs; do not expose credentials in output.
- Local read-only configuration checks and read-only database queries, only when the target and side effects are understood.

Require explicit user approval before:

- Git state changes: `add`, `commit`, `push`, `fetch`, `pull`, `merge`, `rebase`, `checkout`, `switch`, branch creation, `reset`, `clean`, or `stash`.
- Dependency installs or updates: `npm install`, `npm ci`, `npm update`, `dotnet restore`, package upgrades, or tool installations.
- Builds, tests, formatters that write files, generated code, or test-file modifications.
- EF Core migration creation/application, seeding, database writes, resets, restores, or deletions.
- Starting, stopping, rebuilding, pruning, or deleting Docker containers, images, networks, or volumes.
- Deployment, production access, external service changes, or changes to GitHub and other remote systems.

An explicit request to implement a feature permits the required source-code edits, but does not automatically authorize the commands above. When a command could alter files, caches, databases, running services, or remote state, request approval first. Never use broad Docker pruning or destructive database commands as routine cleanup.

Do not add, modify, restore, or run Angular `*.spec.ts` tests without a separate explicit task. Do not modify the Angular test configuration merely to support ordinary feature work.

## 7. Backend and API conventions

Keep the existing `Domain / Application / Infrastructure / WebApi` separation unless a task explicitly justifies changing it. Use existing service, repository, AutoMapper, FluentValidation, and dependency-injection patterns. Do not introduce new patterns for simple CRUD without a concrete need.

Keep controllers focused on HTTP input, validation, service calls, and responses; keep domain/application behavior in the appropriate existing layer. Check request/response DTOs, mappings, validators, consumers, and error responses before changing an API contract.

Current routes include:

- Public product reads: `GET /api/Products`, `GET /api/Products/{id}`.
- Public category reads: `GET /api/Categories`, `GET /api/Categories/{id}`, `GET /api/Categories/tree`.
- Product and category `POST`, `PUT`, and `DELETE` operations are protected by `AdminOnly`.
- Authentication: `GET /api/auth/csrf`, `GET /api/auth/me`, `POST /api/auth/login`, `POST /api/auth/logout`.

Verify the actual controller and service implementation before assuming query parameters, filters, response shapes, or error semantics. Frontend usage alone does not establish backend support. Preserve authorization, server-side validation, and appropriate HTTP error handling.

## 8. Authentication and security

- Authentication uses ASP.NET Core Identity (`IdentityUser`, `IdentityRole`) and a server-managed cookie session, not Supabase Auth or JWT bearer tokens.
- Administrative endpoints require the `AdminOnly` policy and the `Admin` role; Angular guards are only a UX convenience, not a security boundary.
- The existing antiforgery flow uses `GET /api/auth/csrf`, the `XSRF-TOKEN` cookie, and the `X-XSRF-TOKEN` request header. Preserve CSRF protection on state-changing requests.
- There is no public account registration. Administrators are created using the interactive `create-admin` command.
- Identity settings, cookie security, CORS, rate limiting, session handling, authorization policies, and Data Protection keys are security-sensitive. Do not change them incidentally.
- Never commit or disclose passwords, connection strings, tokens, private keys, database dumps, or credentials.
- Do not reintroduce Supabase, Railway, Cloudflare deployment integration, external authentication, or hosting configuration without a specific task and approval.
- Keep local and production environments distinct. Do not assume the current local Docker configuration is production-ready.

## 9. Database and migrations

PostgreSQL is managed locally by Docker Compose. EF Core's `AppDbContext` extends `IdentityDbContext`.

Current catalog entities:

- `Product` — SKU, name, brand, characteristics, price, currency, stock quantity, and optional image URL.
- `Category` — hierarchical catalog categories.
- `ProductCategory` — many-to-many product/category relation.
- Identity users and roles are stored in the same database.

Do not copy the separate product-variant, inventory, or attribute architecture of another project without a PaintShop requirement.

Before changing the schema, inspect entities, DbContext, EF configurations, existing migrations, repositories, DTOs, frontend types, and existing data. Define required/nullable fields, relationships, defaults, unique constraints, indexes, validation, and any data migration or backfill.

- Never edit migration history that may already have been applied; add a new migration for schema changes.
- Do not reset, truncate, restore, replace, or migrate a database without explicit approval.
- Treat seed data as deliberate writes. The category seed is separate from the optional development-only demo-product seed.
- Assess data preservation and backward compatibility before schema or API changes.

## 10. Frontend conventions

Follow the Angular code already in this repository:

- Standalone components, `ChangeDetectionStrategy.OnPush`, strict TypeScript typing, signals where appropriate, reactive forms, and built-in `@if` / `@for` control flow.
- Existing routing, API services, models, guards, interceptors, and component structure.
- Tailwind CSS and daisyUI; Angular Material/CDK are already available. Do not add a design system or dependency solely on a tool's suggestion.
- Keep TypeScript, HTML, and SCSS organization consistent with nearby components. Do not restructure unrelated components for style uniformity.
- Use the real backend contract and handle loading, empty, error, authorization, and validation states as needed by the task.
- Preserve accessibility, responsive behavior, SEO metadata, links, and verified store contact details on public pages.
- The current application is CSR. SSR/SSG, hydration, a new state-management library, or a new frontend architecture requires a separate justified decision.

Frontend API calls use relative `/api/...` paths through the existing environment configuration and development proxy (`PaintShopFrontEnd/proxy.conf.json` targets `http://backend:8080`). Do not hard-code Docker hostnames or localhost backend URLs in Angular application code.

Separate functional changes from visual design changes:

- A functional task may change routing, types, services, state, forms, validation, and the markup required to make the feature work.
- A design-only task may change layout, styling, presentation, and visual accessibility, but must preserve API contracts, routes, state, validation, and business behavior.
- If design requires functional or architectural changes, explain and agree on those changes first.
- Do not let design tools replace Angular with another framework or introduce unrelated dependencies.

## 11. Docker, environments, and data safety

`compose.yaml` defines `db`, `backend`, and `frontend`. Host ports are bound to localhost by default. The PostgreSQL data volume and ASP.NET Core Data Protection keys volume are persistent project data, not temporary build artifacts.

- Keep `.env` and credentials out of Git; maintain `.env.example` as a safe template.
- Never delete volumes or reset the database merely to obtain a clean environment.
- Do not prune Docker resources globally or touch unrelated projects.
- Check actual container/image ownership before removing build artifacts.
- The current Docker setup is for local development. Production deployment and hosting decisions are separate tasks.
- Do not claim a clean-clone setup or production runtime has been verified unless those workflows were actually tested.

## 12. Final report

After each implementation or review, report briefly:

1. Changed files and what changed.
2. Checks actually performed and their results.
3. Checks not performed (build, tests, migrations, runtime, database, production) where relevant.
4. Remaining risks, compatibility concerns, or required user decisions.

Use precise, evidence-based communication. Avoid unnecessary theory, speculation presented as fact, and reports of work that was not performed.
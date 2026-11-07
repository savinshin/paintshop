# PaintShop

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Private vehicle owners looking for automotive spare parts, paint matching, or body-repair materials.
- Professional repairers and automotive workshops choosing supplies for their work.
- Store administrators maintaining the catalog and product-category assignments.

Vehicle owners and professional users are both important audiences. Do not assume one should displace the other in public navigation or content.

## Product Purpose

PaintShop supports a real automotive paint, spare-parts, and body-repair supply store in Baranovichi, Belarus. The public website helps visitors find a suitable product or service, then contact the store or visit it. Store staff confirm current availability and prices.

The website is an informational catalog, not an online purchasing flow. Carts, checkout, orders, payments, and public account registration are outside the current scope and require a separate task.

## Operating Context

- The catalog has two public sections: "Автозапчасти" and "Материалы". Category hierarchy and server-side filtering determine which products appear in each section.
- Visitors search by product name, brand, or SKU and narrow results by categories and subcategories. A product may legitimately belong to categories in both sections.
- Public informational pages also cover paint matching and body repair. Their copy does not establish that every described service or marketing claim has been independently verified.
- Administrators use protected interfaces to create and edit products, including products assigned to several categories. The administrative list includes products without categories.
- The project is in pre-production development. Local Docker services and demonstration data are not evidence of a verified production deployment.

## Capabilities and Constraints

- Preserve existing Angular behavior, routes, API contracts, form validation, and loading, empty, error, and authorization states during visual work.
- Administrative access uses ASP.NET Core Identity and cookie authentication. Server-side authorization and CSRF protection must survive interface changes.
- Real category reference data belongs in `PaintShopBackEnd/Infrastructure/Data/Seeding/CategorySeeder.cs`. `DemoProductSeeder.cs` contains development-only example products and must not become a source of real inventory or brand claims.
- Popular brands have separate prepared lists for the two catalog sections. They remain empty and hidden until the store owners provide confirmed names.
- Do not invent brands, products, prices, availability, store details, customer reviews, or evidence of commercial performance.
- Follow `AGENTS.md` for technical conventions, data safety, and command permissions. An interface or documentation task does not authorize builds, database writes, container lifecycle operations, or Git publication.

## Design Ownership and Workflow

- Vasilisa owns the primary visual design: presentation, responsive design, graphics, and visual mockups.
- The primary developer and Codex own backend functionality, Angular business logic, and the functional HTML needed to support those behaviors.
- Functional pages start directly in code and use the project's existing style and components.
- New landing pages and other presentation surfaces follow Vasilisa's approved design when the task provides one. A code-first workflow is not permission to invent a replacement visual direction.
- Do not independently generate new visual concepts, replace the overall appearance, or rebuild existing pages without a separate explicit task.
- Preserve the design contributor's existing work when changing functionality. Changes to design and changes to behavior have distinct scopes.

## Brand Commitments

- Preserve existing customer-facing Russian and Belarusian content unless a task explicitly requests changes. Repository documentation and code comments are written in English.
- Preserve existing logos, photographs, icons, store contacts, and factual copy during unrelated changes.
- PaintShop is the repository and project name. Public assets currently use "Автомагазин"; no additional public brand name or legal identity has been confirmed for this record.

## Evidence on Hand

- `AGENTS.md` records the project's scope, responsibilities, technical boundaries, and safety requirements.
- The existing Angular implementation is evidence of an incumbent interface. Absence of `DESIGN.md` does not mean the project needs a new visual identity.
- `PaintShopFrontEnd/public/img/` contains existing logos, photographs, icons, category imagery, and some brand assets. An asset's presence is not confirmation that it belongs in the popular-brands lists.
- Some contact links, legal copy, and metadata still contain placeholders. Preserve them outside their own correction tasks; do not treat them as verified business facts.
- Current source code and approved requirements establish intended behavior. Report builds, browser checks, database checks, and production verification only when actually performed.

## Product Principles

1. Help visitors make an informed inquiry or store visit.
2. Present confirmed store information and keep demonstration content distinct from real catalog data.
3. Preserve reliable catalog administration and legitimate category relationships.
4. Build functional changes within the existing or explicitly approved visual design.

## Accessibility and Inclusion

Public and administrative interfaces must remain usable with a mouse, touch input, and a keyboard. Preserve accessible names, visible keyboard focus, understandable validation messages, and responsive readability. Selecting multiple categories must not depend on Ctrl or Cmd.

## Open Decisions

- Confirmed popular-brand lists are still awaited from the store owners.
- Future presentation designs must be supplied or explicitly agreed within their own tasks.
- This record does not establish a new visual system, production hosting setup, or verified replacement for placeholder business content.

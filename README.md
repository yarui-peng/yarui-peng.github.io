# E3DA Website v3 Draft

This is the next-generation draft site. The legacy website, v1, and v2 are preserved for reference and are not modified by this project.

## Structure

- `static/`: Astro, Tailwind, and daisyUI public site copied from v2.
- `shared/`: shared theme CSS and future data contracts.
- `content/`: human-editable public content sources.
- `media/public/`: public files that may be published by the static site or file server.
- `media/private/`: private files. Never copy this directory into `static/public/`.
- `dynamic/`: public server-side services and file-oriented data contracts.
- `internal/site/`: standalone Astro SSR website for member services, protected files, and future LDAP-backed SSO.
- `infra/`: Ubuntu systemd and Nginx deployment examples.

## Development principles

- Keep public content file-based and version-controlled.
- Prefer YAML, Markdown, JSON, CSV, and BibTeX over a database for editorial data.
- Keep the public Astro build independent of the dynamic service.
- Use explicit media metadata for publications; filename matching is only a fallback.
- Preserve the `e3da-light` and `e3da-dark` themes from `static/src/styles/global.css`.
- Write portable Node.js using standard APIs so Bun remains a possible future runtime.
- Do not put credentials, private data, or private media in the static build.

## Project directives

These decisions are part of the project requirements and should be preserved when extending v3:

- Treat this README as the living project reference. When a style choice, visual direction, architecture decision, deployment rule, security constraint, dependency policy, or general guideline changes, update this document in the same change so future work can follow the current intent.
- The public frontend uses Astro, Tailwind CSS, and daisyUI. Keep the existing `e3da-light` and `e3da-dark` themes: light is primarily blue, while dark is primarily dark purple and navy.
- The current faculty and lab profile is based on the Southeast University appointment beginning in September 2025. Keep current People, Research, and Teaching content separate from the historical University of Arkansas record, while retaining UArk work as clearly labeled history.
- Use the current research taxonomy from the Southeast University profile: `EDA4Chiplet`, `EDA4Power`, and `EDA4HI`. Retire legacy `Power-CAD` and `VLSI-CAD` labels from visible navigation and page headings, while preserving their project data and images under the appropriate EDA4 area.
- Publication author names that belong to the lab should be bold and link to the corresponding People section. Keep external coauthors in normal text, and maintain the mapping in `static/src/data/legacy.ts` rather than inferring profile URLs from names.
- Research media should use compact, image-only daisyUI-style carousels for design figures. Keep descriptions in image `alt` text and accessible link labels rather than adding visible captions below every image; keep each gallery in one horizontally scrollable row with visible previous/next controls.
- Data tables should provide a subtle row hover highlight in both light and dark themes using theme variables rather than hard-coded colors.
- The supplied external lab presentation is an approved source for public profile facts and research figures. Curate presentation assets into the relevant EDA4 gallery, and exclude personal QR codes, private contact artifacts, decorative logos, and unrelated partner or product imagery.
- Use web-safe fonts only. Prefer the existing system font stack or another explicit web-safe stack; do not add remote font services or font packages without a clear project-wide reason.
- Keep text and controls clearly separated from their backgrounds in both themes. Target at least WCAG AA contrast for normal text (4.5:1) and never rely on color alone to communicate an action, state, or distinction. Check foreground, background, borders, hover states, and focus states in both `e3da-light` and `e3da-dark`.
- Keep information compact without making it crowded. Use stable spacing, readable line height, and compact controls; let content wrap or reflow before it overlaps, clips, or creates horizontal page overflow.
- Design every shared component for desktop and mobile. Preserve the intended information hierarchy at narrow widths, keep repeated content easy to scan, and verify both themes at a desktop and mobile viewport before finishing a UI change.
- Prefer current, maintained tools with few dependencies. Use the existing Node.js 22 baseline and standard APIs where practical; consider Bun or Go only for a focused service where they provide a clear benefit.
- The legacy PHP/Bootstrap website, v1, and v2 are reference material. Do not modify them during v3 work, and do not copy legacy private data into a public build.
- Keep editorial and catalog data human-editable and file-based: Markdown, YAML, JSON, CSV, and BibTeX are preferred before introducing a database.
- The public GitHub/Cloudflare deployment and the internal server deployment are separate websites. The internal site must remain independently usable even if the public static site is unavailable.
- The planned deployment topology is: GitHub Pages or Cloudflare Pages for public static assets; an outside server for limited public dynamic services and release downloads; and a private or China-hosted server for member services, teaching, administration, and LDAP-backed SSO.
- The internal site must not expose LDAP credentials or directly handle LDAP passwords. Use an LDAP-backed OIDC identity provider and explicit group-to-role authorization. Development open login is temporary and must fail closed in production.
- Private manuals, PDFs, videos, software archives, survey records, session data, and credentials must stay outside the static build and outside public CDN aliases. Serve protected files through an authenticated, range-aware endpoint.
- Public software packages may require a short survey before download. Keep release metadata separate from file storage, log only the required survey data, and use signed file-scoped access tokens rather than exposing directory listings.
- Reusable shared behavior belongs in `shared/` or a clearly owned package. Do not create parallel copies of shared theme or site CSS in `static/` and `internal/` unless a deployment boundary explicitly requires a self-contained copy.
- Before finishing changes, build every affected layer, check the relevant route or endpoint, and inspect the public repository for generated files, private data, credentials, large binaries, and accidental path dependencies.
- Keep the public current-student roster sanitized and explicit. Use public name, work email, degree group, lab-entry year, locally stored portfolio photo, personal Pages URL, and a short locally stored bio only; never import the private Personnel workbook directly into the static build.
- Current-student profiles should stay compact: show two profiles per row on desktop, collapse to one column on small screens, show the lab-entry year as a small badge, and use the work email and personal site as the actionable links.
- Current students should reuse the established `PersonProfile` presentation used by the People page, grouped by degree rather than introducing a second person-card pattern.
- No additional package is required for the current GitHub integration: public profile, avatar, organization, and Pages links use normal URLs. If roster synchronization becomes necessary, prefer built-in `fetch` in GitHub Actions with a read-only secret; add `@octokit/rest` only if its typed API helpers materially simplify the workflow. Do not add an XLSX runtime dependency for the private Personnel workbook; export a reviewed public CSV or TypeScript roster instead.

### Deployment matrix

| Layer | Purpose | Deployment | May be public? |
| --- | --- | --- | --- |
| `shared/ + static/` | Static public website | GitHub Pages or Cloudflare Pages | Yes |
| `shared/ + static/ + dynamic/` | Public website with server-side services | Public server behind Nginx or equivalent | Only approved services |
| `shared/ + static/ + dynamic/ + internal/` | Full member and administration website | Private/internal server with OIDC and LDAP | No |

The root GitHub Actions workflow builds only `static/`. It must never upload `dynamic/`, `internal/`, private media, environment files, or runtime session data as a static artifact.

### GitHub organization and student sites

The public People page links current students to the `e3da` organization, each student's personal site, and the generated organization roster at `https://github.com/e3da/.github/blob/main/profile/README.md`. Portfolio photos and short bios are reviewed and stored locally in the static source so the page does not depend on remote sites at render time.

The organization workflow at `e3da/.github/.github/workflows/main.yml` owns automatic membership discovery and updates `profile/README.md`. The v3 static site should link to that README but should not duplicate its privileged API access. The workflow currently uses the `YRPENG_E3DA_RO` Actions secret to read organization membership; this secret belongs only in the organization repository's Actions settings.

No GitHub permission is required for public profile links, public avatars, or the public organization page. The organization member API currently returns no members anonymously, so private organization membership should not be fetched by the static site. If the roster later needs automatic synchronization, either make the relevant organization memberships public or provide a GitHub Actions secret containing a fine-grained token with read-only organization Members permission. Never put that token in browser code or the published artifact.

## Public and internal deployments

The source layers are cumulative: `shared/ + static/` is the static website, `shared/ + static/ + dynamic/` is the public website with server-side services, and `shared/ + static/ + dynamic/ + internal/` is the complete internal deployment. GitHub Actions builds only `static/` for GitHub Pages or Cloudflare Pages; it never publishes `dynamic/` or `internal/` as static assets.

The internal site remains a separate Astro SSR deployment on the lab server. When LDAP-backed SSO is available, place an OIDC identity provider in front of LDAP and integrate the server with OIDC rather than handling LDAP passwords in Astro. The package and authorization boundary is documented in `infra/INTERNAL-AUTH.md`.

## Protected files

The internal Astro site exposes `GET /download?group=e3da&file=manuals/example.pdf` for authenticated private files and `group=public` for explicitly public files. Files are resolved from `E3DA_PRIVATE_ROOT`, `UARK_PRIVATE_ROOT`, and `E3DA_PUBLIC_ROOT`, not from the Astro project or GitHub Pages output.

The endpoint rejects unknown groups, unauthenticated private requests, path traversal, symlink escapes, and invalid byte ranges. It supports `?stream=1` for inline PDF/video viewing and otherwise returns an attachment. See `internal/site/.env.example`.

Public software releases can be cataloged with `survey=true` in `dynamic/data/manuals.csv`. The internal `/releases` page sends those users through `/survey`, which records the response as JSON Lines when `SURVEY_LOG_PATH` is set and issues a signed, file-scoped cookie. Members with an active session bypass the survey. Set a long random `SURVEY_SECRET` in production; never use the development fallback there.

## Standalone dynamic site

The standalone Astro service in `internal/site/` provides its own website at `/app`; it does not depend on the GitHub Pages site being online. Run it for development with `npm run dev` in `internal/site/`. In this mode, any non-empty username is accepted and `yrpeng` receives the temporary admin role to mirror the legacy behavior.

The production command sets `NODE_ENV=production`, which disables open login. Before production use, replace the demo identity check with real authentication and persistent sessions. Never deploy the development command to a public server.

The initial table is a semantic HTML table generated from `dynamic/data/teaching.csv`. Tabulator 6.x is the preferred future enhancement for screens that need client-side sorting, filtering, pagination, and responsive columns; it should be loaded only on those screens rather than added globally.

Example service and reverse-proxy files are in `infra/systemd/` and `infra/nginx/`. Replace the example user, paths, domain, and TLS configuration before installation.

## Commands

```sh
cd static
npm install
npm run build
npm run dev

cd ../dynamic
npm start

cd ../internal/site
npm install
npm run build
npm run start
```

The static site is currently the v2 draft baseline. Dynamic routes will be added only after their data and authorization boundaries are defined.

## Headless Ubuntu deployment

Build `internal/site/` with the official `@astrojs/node` adapter and run `node dist/server/entry.mjs` under systemd. Put Nginx or Caddy in front for TLS, static assets, and proxying. Keep the service bound to loopback unless it is intentionally exposed through the reverse proxy. Node.js 22 is the current development baseline; Bun remains a later runtime experiment.

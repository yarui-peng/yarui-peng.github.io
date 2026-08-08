# Internal SSO and LDAP boundary

The internal site should not bind user passwords to LDAP directly. Put an identity provider in front of LDAP and expose OpenID Connect (OIDC) to `internal/site`.

## Recommended request path

```text
browser -> Nginx -> Astro SSR -> OIDC provider -> LDAP
                         |
                         +-> protected files and member services
```

The identity provider owns LDAP bind credentials, MFA, password policy, account disablement, and group mapping. The Astro site receives claims such as `sub`, `preferred_username`, `email`, and `groups`, then creates a short-lived application session. Keep authorization based on groups/roles, not on a special username.

## Package choices

- `openid-client` 6.x: standards-based OIDC discovery, Authorization Code Flow, PKCE, token exchange, and UserInfo. Use it in the Node SSR site.
- `jose` 6.x: JWT/JWS/JWK/JWKS verification with zero runtime dependencies. Use it when the site validates ID tokens or access tokens locally.
- `@astrojs/node`: keep the existing standalone SSR adapter for the internal service.
- Optional `rate-limiter-flexible`: add only when login and survey endpoints are exposed publicly; use Redis or another shared store when multiple backend instances are active.

Avoid `passport-ldapauth`, direct LDAP password handling in Astro, and abandoned session/auth wrappers. If an identity provider cannot provide OIDC, use a reverse-proxy gateway such as oauth2-proxy in front of Astro as a temporary bridge, but OIDC-native integration is the long-term interface.

## Required production controls

- Register only the internal callback URL, for example `https://members.example.org/auth/callback`.
- Use Authorization Code Flow with PKCE and a server-side client secret.
- Validate issuer, audience, nonce, state, expiry, and signature; fetch signing keys through the provider's JWKS endpoint.
- Map LDAP groups to explicit application roles such as `member`, `faculty`, `teaching`, and `admin`.
- Store sessions in a shared persistent store before running multiple Astro instances. Do not rely on the current in-memory prototype store.
- Keep the internal hostname and callback unreachable from the public Cloudflare/GitHub Pages site.
- Do not place private PDFs, software manuals, LDAP credentials, or OIDC secrets in GitHub Actions artifacts.

## Planned environment contract

```text
OIDC_ISSUER=https://sso.example.org/realms/e3da
OIDC_CLIENT_ID=e3da-internal
OIDC_CLIENT_SECRET=...
OIDC_REDIRECT_URI=https://members.example.org/auth/callback
OIDC_ALLOWED_GROUPS=member,faculty,teaching,admin
SESSION_SECRET=...
```

The current open-login path is development-only and must be replaced with this contract before production.

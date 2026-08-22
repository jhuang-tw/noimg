# Development

NoIMG's public edition is intentionally stdio-only.

## Commands

```bash
npm ci
npm test
npm run check
```

## Runtime architecture

```text
MCP client
   │
 stdin / stdout
   │
NoIMG stdio adapter
   │
NoIMG MCP core
```

Public runtime invariants:

- no HTTP listener
- no TCP listener
- no ngrok or tunnel helper
- no Cloudflare Worker
- no OAuth or bearer-token layer
- no runtime `fetch()`
- no filesystem, shell, Git, browser, or arbitrary execution tool

The MCP server exports one policy tool: `noimg`.

The package also ships `hooks/noimg-guard.mjs`, a local command hook used by supported coding agents. It has no network access and only writes tiny request-scoped state under the operating system temporary directory.

## Tests

The test suite verifies:

- stdio discovery and invocation
- `@noimg` generative-image-only scope
- generative image creation HARD BLOCK semantics
- existing-image display/render/preview remains explicitly allowed
- exact-token hook activation and non-trigger boundaries
- Claude/Gemini/Codex synthetic hook veto behavior
- public runtime contains no remote transport files
- public dependencies stay minimal
- network primitives do not creep back into `src/`

CI also runs `npm audit` and public-repository hygiene checks.

## Adding remote transport

Do not add remote transport code to the public core casually.

A future remote edition should be treated as a separate security boundary with its own threat model, authentication, rate limiting, credential lifecycle, deployment documentation, and review. "It works through a tunnel" is not a security design.

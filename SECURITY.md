# Security Policy

## Public edition security boundary

The public NoIMG runtime is **stdio only**.

At runtime it does not:

- open a network port
- start an HTTP server
- create a tunnel
- connect to Cloudflare
- use OAuth or bearer tokens
- make outbound network requests
- expose filesystem, shell, Git, browser, or arbitrary execution tools
- collect telemetry

The MCP process communicates with its local client through stdin/stdout only.

NoIMG's policy behavior is **best effort and not a security control**. The project is experimental, was created mostly for fun, and cannot guarantee that every host will honor `@noimg` before its own built-in image routing.

## Package identity

The official npm package is `@alr51307/noimg`.

Prefer a pinned version such as `@alr51307/noimg@0.3.2` in MCP configuration so upgrades are deliberate. A bare npm package named `noimg` is not this project.

## Reporting a vulnerability

Please do not publish exploit details in a public issue.

Use GitHub's private vulnerability reporting / Security Advisory flow when available. If private reporting is unavailable, contact the repository owner privately through GitHub before disclosing technical details publicly.

Include:

- affected version or commit
- reproduction steps
- impact
- any suggested mitigation

## Supported versions

Security fixes are provided for the latest public version only.

## Remote transports

Remote HTTP, ngrok, Cloudflare Worker, and OAuth modes are intentionally outside the public edition's security boundary.

A future remote edition should undergo a separate threat model and security review before release.

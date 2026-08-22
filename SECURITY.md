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

## Supply-chain warning

The `noimg` npm package is **not published yet**.

Until an official release is published from this repository, do not install or execute a package named `noimg` from npm. A package with that name would not be this project.

The README intentionally uses a source checkout until the package namespace is secured.

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

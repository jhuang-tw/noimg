<p align="center">
  <img src="assets/logo.png" alt="NoIMG logo" width="220" />
</p>

<h1 align="center">NoIMG</h1>

<p align="center">
  <a href="https://github.com/jhuang-tw/noimg/actions/workflows/ci.yml"><img src="https://github.com/jhuang-tw/noimg/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/transport-stdio-5B5BD6.svg" alt="stdio only" />
  <img src="https://img.shields.io/badge/network-none-success.svg" alt="no network listener" />
  <img src="https://img.shields.io/badge/images-nope-lightgrey.svg" alt="images: nope" />
</p>

<p align="center"><strong>Stop agents from generating images when nobody asked for one.</strong></p>

<p align="center"><code>@noimg</code> means <strong>NO GENERATIVE IMAGE TOOL</strong>.</p>

`@noimg` is the **only** NoIMG trigger. Ordinary phrases such as `don't generate images`, `no image`, or `nogenimg` keep their normal meaning and do not activate NoIMG.

> **Experimental / made for fun.** NoIMG is a tiny hobby project, not a platform-level kill switch. It can improve the odds that `@noimg` keeps the image generator out of a request, but it is **not 100% reliable** because the host still decides tool routing. Sometimes the agent may still reach for the crayons. `¯\_(ツ)_/¯`

---

You:

```text
@noimg show me the architecture
```

Agent:

```text
Generating a cinematic image now...
```

You: `(ಠ_ಠ)`

That is the bug NoIMG exists to prevent.

```text
@noimg
→ HARD BLOCK generative image creation only
→ keep doing the actual task
```

Existing images and SVGs can still display normally. Vision, screenshots, Mermaid, diagram tools, HTML, code, file operations, and every other non-generative workflow keep going. Only the image generator loses voting rights.

## Public edition: deliberately boring

NoIMG's public runtime is **stdio only**.

- no HTTP server
- no open port
- no ngrok
- no Cloudflare Worker
- no OAuth
- no tokens
- no telemetry
- no runtime outbound network

One process talks to one local MCP client over stdin/stdout. That is it. We bravely resisted adding a control plane.

## Install

Official npm package:

```bash
npx -y @alr51307/noimg@0.3.2
```

For MCP clients, use the same pinned package command. The executable is still `noimg`; the scope just makes package ownership explicit.

Prefer the scoped package name. A bare npm package named `noimg` is **not** this project.

Want source instead?

```bash
git clone https://github.com/jhuang-tw/noimg.git
cd noimg
npm ci
npm run build
node dist/cli.js
```

See [docs/usage.md](docs/usage.md) for client examples. For ChatGPT, the exact-token Custom Instructions block is in [chatgpt/CUSTOM_INSTRUCTIONS.md](chatgpt/CUSTOM_INSTRUCTIONS.md).

Claude Code, Gemini CLI, and Codex can also use the shared request-scoped hook guard in `hooks/noimg-guard.mjs`. Claude and Gemini can veto matched image-generation tools before execution; Gemini can additionally filter an existing function whitelist before tool selection. Codex support is defense in depth because its hook coverage is still evolving.

## Docs

- [Usage](docs/usage.md)
- [ChatGPT Custom Instructions](chatgpt/CUSTOM_INSTRUCTIONS.md)
- [Hard hooks](docs/hooks.md)
- [Development](docs/development.md)
- [Security policy](SECURITY.md)

## License

MIT. Use it responsibly, preferably without accidentally inventing NoIMG Enterprise.

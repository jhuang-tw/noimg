# Usage

NoIMG is intentionally small: one user trigger token and one MCP tool.

## Behavior

When a request contains the literal token `@noimg`, block **GENERATIVE IMAGE CREATION ONLY** before tool routing. NoIMG is not a general ban on images.

`@noimg` is the **only** NoIMG trigger. Do not infer activation from synonyms, paraphrases, or ordinary phrases such as `don't generate images`, `do not generate images`, `no image`, or `nogenimg`. Those phrases keep their normal meaning. When `@noimg` is absent, NoIMG has no effect and normal image generation remains available.

```text
@noimg
→ BLOCK generative image creation
→ BLOCK generative image edits that invoke the image-generation model/tool
→ ALLOW display / render / preview of existing PNG/JPG/SVG
→ ALLOW vision analysis / screenshots / attachments / file operations
→ ALLOW every other non-generative tool and workflow
→ finish the task
```

Words such as `draw`, `render`, `visualize`, `create`, or `image` do not by themselves make an operation forbidden. The deciding boundary is whether the host would invoke a generative image model/tool.

## Limitations

NoIMG is experimental and was created mostly for fun. It is **not a 100% reliable platform-level blocker**. MCP tool selection and built-in image routing are controlled by the host/client. If a host bypasses NoIMG and starts a generative image operation before invoking the tool, the NoIMG server cannot intercept a request it never received.

Treat NoIMG as a best-effort routing hint with a very opinionated name, not as a guarantee.

## Install from npm

The official package is scoped:

```bash
npx -y @alr51307/noimg@0.3.2
```

Pin the version in MCP configuration so upgrades are deliberate:

```json
{
  "mcpServers": {
    "noimg": {
      "command": "npx",
      "args": ["-y", "@alr51307/noimg@0.3.2"]
    }
  }
}
```

A bare package named `noimg` is not this project.

## Build from source

```bash
git clone https://github.com/jhuang-tw/noimg.git
cd noimg
npm ci
npm run build
```

The source-build MCP command is:

```text
node /absolute/path/to/noimg/dist/cli.js
```

NoIMG uses stdin/stdout only. It does not bind a TCP port.

Use the native MCP configuration format for your client if it differs from the generic example.

## ChatGPT Custom Instructions

For ChatGPT, add the repository's exact-token trigger block to your existing Custom Instructions:

```text
chatgpt/CUSTOM_INSTRUCTIONS.md
```

It is request-scoped: only the exact literal token `@noimg` activates NoIMG. Ordinary phrases such as `don't generate images` are not treated as NoIMG triggers.

## Hard hooks for coding agents

For Claude Code, Gemini CLI, and Codex, NoIMG also ships a shared hook guard:

```text
hooks/noimg-guard.mjs
```

It records whether the current request contains the exact literal token `@noimg`, then blocks matched generative-image tool calls at the platform hook layer. See [hooks.md](hooks.md) for setup and tool-matching details.

Platform templates:

```text
claude-code/settings.example.json
gemini-cli/settings.example.json
codex/hooks.example.json
codex/config.example.toml
```

Claude Code uses `UserPromptSubmit` + `PreToolUse`. Gemini CLI uses `BeforeAgent` + `BeforeToolSelection` + `BeforeTool`. Codex uses `UserPromptSubmit` + `PreToolUse`, but Codex hook coverage is still evolving, so treat its hook adapter as defense in depth rather than a complete guarantee.

## Portable rules

The repository also includes small rule files for clients that support project or user instructions:

```text
codex/AGENTS.md
claude-code/CLAUDE.md
cursor/noimg.mdc
gemini-cli/GEMINI.md
generic/SKILL.md
```

They express the same contract as the MCP tool: activate only on the exact literal token `@noimg`, then block only generative image creation or generative image edits that require an image-generation model/tool.

## Examples

```text
@noimg draw the system architecture
→ Mermaid, SVG source, HTML, or another compatible non-image representation

@noimg make five UI mockups
→ HTML/CSS or structured text

@some-tool @noimg do the task
→ keep using @some-tool; only image operations are excluded
```

NoIMG is a seatbelt, not the steering wheel.

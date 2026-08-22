# Usage

NoIMG is intentionally small: one stdio MCP tool and one trigger token.

## Behavior

When a request contains the literal token `@noimg`, treat the request as explicit **NON-IMAGE OUTPUT** before tool routing.

```text
@noimg
→ HARD BLOCK image-generation
→ HARD BLOCK image-editing
→ HARD BLOCK image-rendering
→ continue compatible non-image tools
→ finish the task
```

Words such as `draw`, `render`, `visualize`, `create`, or `illustrate` do not override `@noimg`.

## Build from source

The npm package is not published yet. Do not install an unrelated `noimg` package from npm.

```bash
git clone https://github.com/jhuang-tw/noimg.git
cd noimg
npm ci
npm run build
```

The MCP command is:

```text
node /absolute/path/to/noimg/dist/cli.js
```

NoIMG uses stdin/stdout only. It does not bind a TCP port.

## Generic MCP configuration

```json
{
  "mcpServers": {
    "noimg": {
      "command": "node",
      "args": ["/absolute/path/to/noimg/dist/cli.js"]
    }
  }
}
```

Use the native MCP configuration format for your client if it differs from the generic example.

## Portable rules

The repository also includes small rule files for clients that support project or user instructions:

```text
codex/AGENTS.md
claude-code/CLAUDE.md
cursor/noimg.mdc
gemini-cli/GEMINI.md
generic/SKILL.md
```

They express the same contract as the MCP tool: classify `@noimg` as non-image intent first, then block only image-generation/editing/rendering.

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

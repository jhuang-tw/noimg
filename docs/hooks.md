# NoIMG hard hooks

The shared hook guard is `hooks/noimg-guard.mjs`.

It activates only when the current user prompt contains the exact literal token `@noimg`. Ordinary phrases such as `nogenimg`, `no image`, or `don't generate images` do not activate the guard.

The guard stores only tiny request-scoped state in the operating system temporary directory, keyed by platform and session ID. It does not store the prompt text.

## Tool matching

The default deny pattern targets common generative-image tool names such as `image_gen`, `generate_image`, `text2im`, `image_edit`, `dalle`, and `imagen`.

It intentionally does not match ordinary image capabilities such as `analyze_image`, `view_image`, `screenshot`, or `render_svg`.

If your image generator uses a different tool name, set `NOIMG_GENERATIVE_TOOL_REGEX` to a JavaScript-compatible regular expression before launching the agent.

For Gemini CLI, `BeforeToolSelection` can additionally filter an existing function whitelist. If the CLI does not expose a whitelist in that request, the hook leaves tool selection unchanged and the `BeforeTool` veto remains the enforcement boundary. You can provide an explicit comma-separated whitelist through `NOIMG_ALLOWED_FUNCTIONS` if desired.

## Platform setup

- Claude Code: merge `claude-code/settings.example.json` into `.claude/settings.json`.
- Gemini CLI: merge `gemini-cli/settings.example.json` into `.gemini/settings.json`.
- Codex: merge `codex/hooks.example.json` into `.codex/hooks.json` and enable hooks with the setting shown in `codex/config.example.toml`.

The example commands assume `hooks/noimg-guard.mjs` exists at the project root. Copy the `hooks` directory with the rule files, or adjust each command to the actual installed path.

Claude Code and Gemini CLI provide deterministic pre-tool blocking for matched tool calls. Codex hook support is still evolving and currently has documented coverage gaps, so its hook adapter is defense in depth rather than a complete guarantee.

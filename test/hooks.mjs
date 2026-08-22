import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const stateDir = mkdtempSync(join(tmpdir(), 'noimg-hook-test-'));

const claudeConfig = JSON.parse(readFileSync('claude-code/settings.example.json', 'utf8'));
const geminiConfig = JSON.parse(readFileSync('gemini-cli/settings.example.json', 'utf8'));
const codexConfig = JSON.parse(readFileSync('codex/hooks.example.json', 'utf8'));
assert.ok(claudeConfig.hooks?.UserPromptSubmit);
assert.ok(claudeConfig.hooks?.PreToolUse);
assert.ok(geminiConfig.hooks?.BeforeAgent);
assert.ok(geminiConfig.hooks?.BeforeToolSelection);
assert.ok(geminiConfig.hooks?.BeforeTool);
assert.ok(codexConfig.hooks?.UserPromptSubmit);
assert.ok(codexConfig.hooks?.PreToolUse);
assert.match(readFileSync('codex/config.example.toml', 'utf8'), /hooks = true/);

function run(platform, payload, extraEnv = {}) {
  const result = spawnSync(process.execPath, ['hooks/noimg-guard.mjs', platform], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, NOIMG_STATE_DIR: stateDir, ...extraEnv },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout || '{}');
}

try {
  const claudeSession = 'claude-test';
  let out = run('claude', {
    hook_event_name: 'UserPromptSubmit',
    session_id: claudeSession,
    prompt_id: 'p1',
    prompt: '@noimg fix this SVG without generating an image',
  });
  assert.match(out.hookSpecificOutput?.additionalContext ?? '', /NoIMG is active/);

  out = run('claude', {
    hook_event_name: 'PreToolUse',
    session_id: claudeSession,
    prompt_id: 'p1',
    tool_name: 'mcp__images__generate_image',
    tool_input: {},
  });
  assert.equal(out.hookSpecificOutput?.permissionDecision, 'deny');

  out = run('claude', {
    hook_event_name: 'PreToolUse',
    session_id: claudeSession,
    prompt_id: 'p1',
    tool_name: 'render_svg',
    tool_input: {},
  });
  assert.deepEqual(out, {});

  run('claude', {
    hook_event_name: 'UserPromptSubmit',
    session_id: claudeSession,
    prompt_id: 'p2',
    prompt: "don't generate images; explain only",
  });
  out = run('claude', {
    hook_event_name: 'PreToolUse',
    session_id: claudeSession,
    prompt_id: 'p2',
    tool_name: 'image_gen',
    tool_input: {},
  });
  assert.deepEqual(out, {});

  run('claude', {
    hook_event_name: 'UserPromptSubmit',
    session_id: claudeSession,
    prompt_id: 'p3',
    prompt: 'nogenimg is ordinary text and must not activate NoIMG',
  });
  out = run('claude', {
    hook_event_name: 'PreToolUse',
    session_id: claudeSession,
    prompt_id: 'p3',
    tool_name: 'image_gen',
    tool_input: {},
  });
  assert.deepEqual(out, {});

  const geminiSession = 'gemini-test';
  run('gemini', {
    hook_event_name: 'BeforeAgent',
    session_id: geminiSession,
    prompt: 'Please @noimg edit the SVG source.',
  });
  out = run('gemini', {
    hook_event_name: 'BeforeToolSelection',
    session_id: geminiSession,
    llm_request: {
      toolConfig: {
        allowedFunctionNames: ['read_file', 'mcp_images_generate_image', 'render_svg'],
      },
    },
  });
  assert.deepEqual(out.hookSpecificOutput?.toolConfig?.allowedFunctionNames, ['read_file', 'render_svg']);

  out = run('gemini', {
    hook_event_name: 'BeforeTool',
    session_id: geminiSession,
    tool_name: 'text2im',
    tool_input: {},
  });
  assert.equal(out.decision, 'deny');

  const codexSession = 'codex-test';
  run('codex', {
    hook_event_name: 'UserPromptSubmit',
    session_id: codexSession,
    turn_id: 'turn-1',
    prompt: '@noimg keep this as SVG',
  });
  out = run('codex', {
    hook_event_name: 'PreToolUse',
    session_id: codexSession,
    turn_id: 'turn-1',
    tool_name: 'image_edit',
    tool_input: {},
  });
  assert.equal(out.hookSpecificOutput?.permissionDecision, 'deny');

  out = run('codex', {
    hook_event_name: 'PreToolUse',
    session_id: codexSession,
    turn_id: 'turn-2',
    tool_name: 'image_edit',
    tool_input: {},
  });
  assert.deepEqual(out, {});

  out = run('claude', {
    hook_event_name: 'UserPromptSubmit',
    session_id: 'boundary-test',
    prompt_id: 'b1',
    prompt: '@noimgx should not activate',
  });
  assert.deepEqual(out, {});

  out = run('claude', {
    hook_event_name: 'PreToolUse',
    session_id: 'boundary-test',
    prompt_id: 'b1',
    tool_name: 'generate_image',
    tool_input: {},
  });
  assert.deepEqual(out, {});

  console.log('NoIMG hook guard tests OK');
} finally {
  rmSync(stateDir, { recursive: true, force: true });
}

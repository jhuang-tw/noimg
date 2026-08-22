#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const platform = process.argv[2];
const supportedPlatforms = new Set(['claude', 'gemini', 'codex']);

if (!supportedPlatforms.has(platform)) {
  process.stderr.write('NoIMG hook requires one platform argument: claude, gemini, or codex.\n');
  process.exit(1);
}

const raw = readFileSync(0, 'utf8').trim();
const input = raw ? JSON.parse(raw) : {};
const event = input.hook_event_name ?? '';
const sessionId = String(input.session_id ?? 'unknown-session');
const stateRoot = process.env.NOIMG_STATE_DIR || join(tmpdir(), 'noimg-hook-state');
const stateKey = createHash('sha256').update(`${platform}:${sessionId}`).digest('hex');
const stateFile = join(stateRoot, `${stateKey}.json`);

const DEFAULT_GENERATIVE_TOOL_REGEX = /(^|[_:./-])(?:image[_-]?gen(?:eration)?|generate[_-]?images?|text2im|text[_-]?to[_-]?image|image[_-]?edit(?:ing|or)?|edit[_-]?images?|dall[_-]?e|dalle|imagen)(?=$|[_:./-])/i;

function exactNoimgToken(text) {
  if (typeof text !== 'string') return false;
  return /(^|[^\p{L}\p{N}_@])@noimg(?=$|[^\p{L}\p{N}_-])/u.test(text);
}

function generativeToolRegex() {
  const override = process.env.NOIMG_GENERATIVE_TOOL_REGEX;
  if (!override) return DEFAULT_GENERATIVE_TOOL_REGEX;
  try {
    return new RegExp(override, 'i');
  } catch {
    return DEFAULT_GENERATIVE_TOOL_REGEX;
  }
}

function isGenerativeImageTool(name) {
  return typeof name === 'string' && generativeToolRegex().test(name);
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function writeState(active, promptInput) {
  mkdirSync(stateRoot, { recursive: true });
  const state = {
    active,
    sessionId,
    turnId: input.turn_id ?? null,
    promptId: input.prompt_id ?? null,
    updatedAt: Date.now(),
  };
  const temp = `${stateFile}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(state));
  renameSync(temp, stateFile);
  return state;
}

function readState() {
  try {
    return JSON.parse(readFileSync(stateFile, 'utf8'));
  } catch {
    return null;
  }
}

function stateIsActive() {
  const state = readState();
  if (!state?.active) return false;

  if (platform === 'codex' && state.turnId && input.turn_id) {
    return state.turnId === input.turn_id;
  }

  if (platform === 'claude' && state.promptId && input.prompt_id) {
    return state.promptId === input.prompt_id;
  }

  return true;
}

function activationContext() {
  return 'NoIMG is active for this request because the exact literal token @noimg is present. Do not invoke generative image creation or generative image editing tools. Keep all other tools and ordinary image capabilities available.';
}

function denialReason(toolName) {
  return `NoIMG blocked generative image tool ${toolName} for this @noimg request. Continue with non-generative tools.`;
}

function handlePrompt(prompt) {
  const active = exactNoimgToken(prompt);
  writeState(active, prompt);

  if (!active) {
    writeJson({});
    return;
  }

  if (platform === 'gemini') {
    writeJson({
      hookSpecificOutput: {
        additionalContext: activationContext(),
      },
    });
    return;
  }

  writeJson({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: activationContext(),
    },
  });
}

function handlePreTool(toolName) {
  if (!stateIsActive() || !isGenerativeImageTool(toolName)) {
    writeJson({});
    return;
  }

  if (platform === 'gemini') {
    writeJson({
      decision: 'deny',
      reason: denialReason(toolName),
    });
    return;
  }

  writeJson({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: denialReason(toolName),
    },
  });
}

function handleGeminiToolSelection() {
  if (!stateIsActive()) {
    writeJson({});
    return;
  }

  const configured = input.llm_request?.toolConfig?.allowedFunctionNames;
  const override = process.env.NOIMG_ALLOWED_FUNCTIONS
    ?.split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const source = Array.isArray(override) && override.length > 0
    ? override
    : Array.isArray(configured)
      ? configured
      : null;

  if (!source) {
    writeJson({});
    return;
  }

  const allowedFunctionNames = source.filter(name => !isGenerativeImageTool(name));
  writeJson({
    hookSpecificOutput: {
      toolConfig: allowedFunctionNames.length > 0
        ? { mode: 'AUTO', allowedFunctionNames }
        : { mode: 'NONE', allowedFunctionNames: [] },
    },
  });
}

if ((platform === 'claude' || platform === 'codex') && event === 'UserPromptSubmit') {
  handlePrompt(input.prompt);
} else if (platform === 'gemini' && event === 'BeforeAgent') {
  handlePrompt(input.prompt);
} else if ((platform === 'claude' || platform === 'codex') && event === 'PreToolUse') {
  handlePreTool(input.tool_name);
} else if (platform === 'gemini' && event === 'BeforeTool') {
  handlePreTool(input.tool_name);
} else if (platform === 'gemini' && event === 'BeforeToolSelection') {
  handleGeminiToolSelection();
} else if (event === 'SessionEnd') {
  rmSync(stateFile, { force: true });
  writeJson({});
} else {
  writeJson({});
}

#!/usr/bin/env node

import { runStdio } from './stdio.js';

const VERSION = '0.3.2';

function usage() {
  return `NoIMG ${VERSION}\n\nUsage:\n  noimg            Start the stdio MCP server\n  noimg stdio      Start the stdio MCP server\n\nNo network listener. No remote mode. No tunnel.\n`;
}

async function main() {
  const command = process.argv[2] ?? 'stdio';

  if (command === '--help' || command === '-h' || command === 'help') {
    console.log(usage());
    return;
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    console.log(VERSION);
    return;
  }

  if (command === 'stdio') {
    await runStdio();
    return;
  }

  throw new Error(`Unknown command: ${command}\n\n${usage()}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

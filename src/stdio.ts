import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { createServer } from './server.js';

export async function runStdio() {
  await serveStdio(createServer);
}

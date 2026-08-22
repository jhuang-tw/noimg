import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const client = new Client({ name: 'noimg-smoke', version: '1.0.0' });
await client.connect(new StdioClientTransport({ command: 'node', args: ['dist/cli.js', 'stdio'] }));

try {
  const tools = await client.listTools();
  const noimg = tools.tools.find(tool => tool.name === 'noimg');
  assert.ok(noimg);
  assert.match(noimg.title ?? '', /Hard Block/i);
  assert.match(noimg.description ?? '', /ALWAYS invoke/i);
  assert.match(noimg.description ?? '', /@noimg/);
  assert.match(noimg.description ?? '', /NON-IMAGE OUTPUT/i);
  assert.match(noimg.description ?? '', /before tool routing/i);
  assert.match(noimg.description ?? '', /hard-block image-generation, image-editing, and image-rendering/i);

  const result = await client.callTool({ name: 'noimg', arguments: {} });
  const text = result.content?.find(item => item.type === 'text')?.text ?? '';
  assert.match(text, /NOIMG_ACTIVE/);
  assert.match(text, /NON-IMAGE OUTPUT/i);
  assert.match(text, /HARD BLOCK FOR THIS REQUEST/i);
  assert.match(text, /PRE-ROUTING RULE: before choosing tools/i);
  assert.match(text, /Continue every other explicitly requested compatible tool/i);
} finally {
  await client.close();
}

console.log('NoIMG stdio smoke OK');

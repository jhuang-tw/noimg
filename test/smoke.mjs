import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const client = new Client({ name: 'noimg-smoke', version: '1.0.0' });
await client.connect(new StdioClientTransport({ command: 'node', args: ['dist/cli.js', 'stdio'] }));

try {
  const serverInfo = client.getServerVersion();
  const serverInstructions = client.getInstructions();
  assert.ok(serverInfo);
  assert.match(serverInfo.title ?? '', /NoIMG — NO GEN IMG/i);
  assert.match(serverInfo.description ?? '', /@noimg means NO GEN IMG/i);
  assert.match(serverInstructions ?? '', /before tool routing/i);
  assert.match(serverInstructions ?? '', /Do not block ordinary image capabilities/i);
  assert.match(serverInstructions ?? '', /best-effort guidance/i);

  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map(tool => tool.name), ['noimg']);
  const noimg = tools.tools[0];
  assert.ok(noimg);
  assert.match(noimg.title ?? '', /NO GEN IMG/i);
  assert.match(noimg.description ?? '', /ONLY NoIMG trigger/i);
  assert.match(noimg.description ?? '', /@noimg/);
  assert.match(noimg.description ?? '', /GENERATIVE IMAGE CREATION ONLY/i);
  assert.match(noimg.description ?? '', /do not infer activation/i);
  assert.match(noimg.description ?? '', /nogenimg/i);
  assert.match(noimg.description ?? '', /before tool routing/i);
  assert.match(noimg.description ?? '', /DO NOT BLOCK displaying, rendering, previewing/i);
  assert.match(noimg.description ?? '', /synthesize a new image or perform a generative image edit/i);
  assert.ok(noimg.outputSchema);
  assert.equal(noimg.outputSchema.type, 'object');
  assert.equal(noimg.annotations?.readOnlyHint, true);
  assert.equal(noimg.annotations?.destructiveHint, false);
  assert.equal(noimg.annotations?.idempotentHint, true);
  assert.equal(noimg.annotations?.openWorldHint, false);

  const result = await client.callTool({ name: 'noimg', arguments: {} });
  const text = result.content?.find(item => item.type === 'text')?.text ?? '';
  assert.match(text, /NOIMG_ACTIVE/);
  assert.match(text, /GENERATIVE IMAGE CREATION ONLY/i);
  assert.match(text, /TRIGGER BOUNDARY/i);
  assert.match(text, /@noimg is the only NoIMG trigger/i);
  assert.match(text, /nogenimg/i);
  assert.match(text, /DO NOT BLOCK ordinary image capabilities/i);
  assert.match(text, /HARD BLOCK FOR THIS REQUEST/i);
  assert.match(text, /PRE-ROUTING RULE: before choosing tools/i);
  assert.match(text, /Displaying, rendering, previewing, reading, or analyzing existing PNG\/JPG\/SVG files is allowed/i);
  assert.match(text, /Continue every other requested tool, format, file operation, preview, and workflow normally/i);
  assert.equal(result.structuredContent?.active, true);
  assert.equal(result.structuredContent?.trigger, '@noimg');
  assert.equal(result.structuredContent?.policy, 'block_generative_image_creation_only');
  assert.ok(result.structuredContent?.nonTriggers?.includes('nogenimg'));
  assert.ok(result.structuredContent?.nonTriggers?.includes('do not generate images'));

} finally {
  await client.close();
}

console.log('NoIMG stdio smoke OK');

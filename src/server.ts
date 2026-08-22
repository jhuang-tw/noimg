import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export const NOIMG_DIRECTIVE = [
  'NOIMG_ACTIVE',
  '',
  'USER OUTPUT INTENT: NON-IMAGE. The literal token @noimg means the user explicitly requests that this request must not produce, edit, or render an image.',
  'PRE-ROUTING RULE: before choosing tools, exclude image-generation, image-editing, and image-rendering operations from the candidate set for this request.',
  'Do not interpret words such as draw, create, generate, render, visualize, illustrate, picture, or image as image-generation intent when @noimg is present. Those words must be satisfied with compatible non-image output or tools instead.',
  'HARD BLOCK FOR THIS REQUEST: do not invoke, continue, or route into any image-generation, image-editing, or image-rendering operation.',
  'NoIMG only blocks those image operations. Continue every other explicitly requested compatible tool, format, and workflow normally; do not replace, suppress, or take over compatible non-image tools.',
  'Do not treat the NoIMG tool call as completion of the user request.',
  'If no compatible tool or format was explicitly requested, fulfill the request with a text-native alternative such as ASCII/Unicode art, Mermaid, SVG source, HTML/CSS, code, or structured text. Do not ask the user to restate the request.',
].join('\n');

export function createServer(): McpServer {
  const server = new McpServer({ name: 'noimg', version: '0.3.0' });

  server.registerTool(
    'noimg',
    {
      title: 'NoIMG Non-Image Preflight Hard Block',
      description: '@noimg PRE-FLIGHT — ALWAYS invoke this tool before tool routing whenever the current user request contains the literal token @noimg. That token means the user explicitly requests NON-IMAGE OUTPUT for this request. Do not classify draw, create, generate, render, visualize, illustrate, picture, image, or similar wording as image-generation intent when @noimg is present. Hard-block image-generation, image-editing, and image-rendering operations before selecting tools, then continue all compatible non-image tools, formats, and workflows normally. NoIMG is not task completion.',
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: 'text', text: NOIMG_DIRECTIVE }],
    }),
  );

  return server;
}

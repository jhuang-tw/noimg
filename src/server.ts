import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export const NOIMG_SERVER_INSTRUCTIONS = [
  'NoIMG exists for one narrow purpose: ONLY when the current user request contains the exact literal token @noimg, apply the NoIMG routing constraint before tool routing.',
  'Do not activate NoIMG from inferred intent, synonyms, paraphrases, or ordinary phrases such as dont generate images, do not generate images, no image, or nogenimg. When @noimg is absent, NoIMG has no effect.',
  'Before considering any generative-image route for a request containing @noimg, invoke NoIMG and exclude generative image creation/edit model calls for that request.',
  'Do not block ordinary image capabilities: existing-image display, SVG rendering, previews, vision analysis, screenshots, attachments, file operations, diagrams, HTML, Mermaid, and all other non-generative workflows remain available.',
  'Continue the user\'s actual task normally after applying this narrow routing constraint. NoIMG is best-effort guidance, not a platform-level security control.',
].join('\n');

export const NOIMG_DIRECTIVE = [
  'NOIMG_ACTIVE',
  '',
  'SCOPE: GENERATIVE IMAGE CREATION ONLY. The literal token @noimg means the user does not want a generative image model/tool invoked for this request.',
  'TRIGGER BOUNDARY: @noimg is the only NoIMG trigger. Do not infer activation from synonyms, paraphrases, or ordinary phrases such as dont generate images, do not generate images, no image, or nogenimg; those keep their normal meaning.',
  'PRE-ROUTING RULE: before choosing tools, exclude operations whose purpose is to synthesize a new image or perform a generative image edit using an image-generation model/tool.',
  'DO NOT BLOCK ordinary image capabilities. Displaying, rendering, previewing, reading, or analyzing existing PNG/JPG/SVG files is allowed. Screenshots, attachments, downloads, conversions, exports, SVG rendering, diagram tools, Mermaid, HTML, code, and every other non-generative workflow remain allowed.',
  'Words such as draw, render, visualize, picture, or image do not by themselves make an operation forbidden. Block only the generative image model/tool invocation.',
  'HARD BLOCK FOR THIS REQUEST: do not invoke a generative image creation model/tool.',
  'Continue every other requested tool, format, file operation, preview, and workflow normally. NoIMG must not take over or narrow unrelated capabilities.',
  'Do not treat the NoIMG tool call as completion of the user request.',
].join('\n');

const NOIMG_OUTPUT = {
  active: true as const,
  trigger: '@noimg' as const,
  policy: 'block_generative_image_creation_only' as const,
  nonTriggers: ['NOGENIMG', 'nogenimg', 'no gen img', 'no-image-gen', 'dont generate images', 'do not generate images', 'no image'],
  blocked: ['generative image creation', 'generative image edits using an image-generation model/tool'],
  allowed: ['existing image display', 'SVG rendering', 'image preview', 'vision analysis', 'screenshots', 'attachments', 'file operations', 'diagram tools', 'Mermaid', 'HTML', 'code'],
  directive: NOIMG_DIRECTIVE,
};

const noimgHandler = async () => ({
  content: [{ type: 'text' as const, text: NOIMG_DIRECTIVE }],
  structuredContent: NOIMG_OUTPUT,
});

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: 'noimg',
      title: 'NoIMG — NO GEN IMG',
      version: '0.3.2',
      description: '@noimg means NO GEN IMG: block generative image creation only, while keeping existing images, SVG rendering, vision, screenshots, diagrams, files, and every other non-generative workflow available.',
      websiteUrl: 'https://github.com/jhuang-tw/noimg',
    },
    {
      instructions: NOIMG_SERVER_INSTRUCTIONS,
    },
  );

  server.registerTool(
    'noimg',
    {
      title: 'NoIMG — NO GEN IMG',
      description: '@noimg is the ONLY NoIMG trigger. Activate this tool only when the current user request contains the exact literal token @noimg; do not infer activation from synonyms, paraphrases, or ordinary phrases such as dont generate images, no image, or nogenimg. @noimg PRE-FLIGHT — invoke before tool routing and before any generative-image routing for that request. Scope is GENERATIVE IMAGE CREATION ONLY: exclude generative image model/tool calls that synthesize a new image or perform a generative image edit. DO NOT BLOCK displaying, rendering, previewing, reading, or analyzing existing images/SVGs; screenshots; attachments; downloads; conversions; exports; diagram tools; or any other non-generative workflow. Continue everything else normally.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        active: z.literal(true),
        trigger: z.literal('@noimg'),
        policy: z.literal('block_generative_image_creation_only'),
        nonTriggers: z.array(z.string()),
        blocked: z.array(z.string()),
        allowed: z.array(z.string()),
        directive: z.string(),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    noimgHandler,
  );

  return server;
}

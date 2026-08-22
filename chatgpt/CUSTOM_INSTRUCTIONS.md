# ChatGPT Custom Instructions

Add this block to your existing ChatGPT Custom Instructions. Do not replace unrelated instructions.

```text
--- NOIMG TRIGGER ---

Activate this rule ONLY when the CURRENT user message contains the exact literal token @noimg.

Do not activate this rule from inferred intent, synonyms, paraphrases, or ordinary phrases such as "don't generate images", "do not generate images", "no image", or "nogenimg".

When and only when @noimg is present:
- For this request only, do not invoke any generative image creation or generative image editing model/tool.
- Do not disable any other capability.
- Existing-image viewing, SVG, screenshots, vision, rendering, previewing, files, diagrams, code, and all other non-generative tools remain available.
- Continue the user's requested task normally.

When @noimg is absent, this rule has NO effect and normal image generation remains available.
```

`@noimg` is the only NoIMG trigger. Ordinary language keeps its ordinary meaning.

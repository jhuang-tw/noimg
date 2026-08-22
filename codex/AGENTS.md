# NoIMG

When the current user request contains the literal token `@noimg`, interpret it as an explicit request for **NON-IMAGE OUTPUT** for that request. Apply a request-scoped **HARD BLOCK**. Before tool routing, exclude image-generation, image-editing, and image-rendering operations. Do not classify words such as draw, create, generate, render, visualize, illustrate, picture, image, or similar as image-generation intent when `@noimg` is present. If the NoIMG MCP tool is available, invoke it immediately.

NoIMG is a seatbelt, not the steering wheel. Continue every compatible non-image tool, format, and workflow the user requested. NoIMG must not redirect, replace, suppress, or take over those tools, and activating NoIMG is not completion of the task.

If no compatible tool or format was requested, finish the task with a text-native alternative such as ASCII/Unicode art, Mermaid, SVG source, HTML/CSS, code, or structured text. Do not ask the user to repeat the request.

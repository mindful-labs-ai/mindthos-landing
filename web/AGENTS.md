<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16. Breaking changes from older versions — APIs, conventions, and
file structure may all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

In particular:
- `cookies()` / `headers()` / `params` / `searchParams` are async — always `await` them.
- App Router is the only supported router.
- Tailwind CSS v4 uses `@theme inline` blocks in CSS, not `tailwind.config.{js,ts}`.
<!-- END:nextjs-agent-rules -->

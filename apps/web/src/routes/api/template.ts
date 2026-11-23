// POST /api/template {template, content, brand, type, extras, variant} → one template drawn as HTML. For
// the template quality gate and review wall (tools/bench/src/template-gate.ts,
// docs/m0/25-template-plan.md): it draws test content without any model call.
import { COLOUR_RULES } from '@repo/eval/grammar/colour-rules'
import { TYPE_RULES } from '@repo/eval/grammar/type-rules'
import { type Extra, renderTemplate, type SiteContent, TEMPLATES, theme } from '@repo/library'
import { createFileRoute } from '@tanstack/react-router'
import { benchOnly } from '../../server/limit'

export const Route = createFileRoute('/api/template')({
  server: {
    handlers: {
      GET: () =>
        benchOnly() ??
        Response.json(TEMPLATES.map((t) => ({ id: t.id, label: t.label, dark: t.dark }))),
      POST: async ({ request }) => {
        const hidden = benchOnly()
        if (hidden) return hidden
        const b = (await request.json().catch(() => null)) as {
          template?: string
          content?: SiteContent
          brand?: string
          type?: string
          extras?: Extra[]
          variant?: string
        } | null
        if (!b?.template || !b.content)
          return Response.json({ error: 'template and content' }, { status: 400 })
        const cream = COLOUR_RULES.find((r) => r.key === 'cream') ?? COLOUR_RULES[0]
        const type = TYPE_RULES.find((t) => t.key === b.type) ?? TYPE_RULES[0]
        if (!cream || !type) return Response.json({ error: 'no rules' }, { status: 500 })
        const html = renderTemplate(
          b.content,
          b.template,
          theme(cream.palette(b.brand ?? '#1f4d3a'), type),
          b.extras ?? [],
          b.variant,
        )
        return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
      },
    },
  },
})

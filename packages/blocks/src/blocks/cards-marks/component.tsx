import {
  type BlockProps,
  Container,
  cx,
  Heading,
  Mark,
  markSet,
  RichText,
  Section,
} from '../../kit/index.tsx'

// The drawings come from the site's set (the `marks` setting), one per reason, on discs in the
// three mark colours in turn.
const DISCS = ['bg-mark-c', 'bg-mark-b', 'bg-mark-a'] as const

export default function CardsMarks({ content: c, variant, ctx }: BlockProps<'cards'>) {
  const stack = variant === 'stack'
  const set = markSet(ctx.axes.marks)
  return (
    <Section ctx={ctx}>
      <Container width="wide" className={cx('grid gap-xl', stack && '@lg:grid-cols-5')}>
        {c.headline && (
          <Heading
            ctx={ctx}
            style="h2"
            slot="headline"
            className={cx('max-w-prose', stack && '@lg:col-span-2')}
          >
            {c.headline}
          </Heading>
        )}
        <ul
          data-slot="items"
          className={cx(
            'grid gap-xl',
            stack ? '@lg:col-span-3' : '@md:grid-cols-2 @lg:grid-cols-3',
          )}
        >
          {c.items.map((it, i) => (
            <li
              key={it.id}
              className={cx('flex gap-sm', stack ? 'flex-row items-start gap-md' : 'flex-col')}
            >
              <span
                className={cx(
                  'grid size-2xl shrink-0 place-items-center rounded-full p-sm text-fg',
                  DISCS[i % 3] as string,
                )}
              >
                <Mark name={set.list[i % 3] as string} className="h-full w-full" />
              </span>
              {it.title && (
                <Heading ctx={ctx} style="h3" slot="items.title">
                  {it.title}
                </Heading>
              )}
              {it.body && (
                <RichText ctx={ctx} value={it.body} slot="items.body" className="text-fg-muted" />
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

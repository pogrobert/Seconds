import type { ReactNode } from 'react'

// Drawings for families that letter the business name (the Signature direction, docs/m0/09).
// Each set has three drawings: a round one that can stand in for the letter O, a tall one that
// can stand in for the letter A, and a third for lists. They are flat shapes in the text colour,
// the page colour and the theme's three mark colours (--mark-a/b/c), so they follow the surface.

type Drawing = { viewBox: string; body: ReactNode }

const INK = 'currentColor'
const CUT = 'var(--role-bg)'
const A = 'var(--mark-a, currentColor)'
const B = 'var(--mark-b, currentColor)'
const C = 'var(--mark-c, currentColor)'

const face = (cx0: number, cy: number) => (
  <>
    <circle cx={cx0 - 14} cy={cy} r={5} fill={CUT} />
    <circle cx={cx0 + 14} cy={cy} r={5} fill={CUT} />
    <path
      d={`M${cx0 - 13} ${cy + 15}c7 8 19 8 26 0`}
      stroke={CUT}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  </>
)

const ROUND: Record<string, Drawing> = {
  tooth: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <path
          d="M50 14c-10-9-28-12-38-2C2 22 4 42 9 56c4 12 6 24 8 38 2 14 6 22 13 22 8 0 9-12 12-26 2-8 4-12 8-12s6 4 8 12c3 14 4 26 12 26 7 0 11-8 13-22 2-14 4-26 8-38 5-14 7-34-3-44C78 2 60 5 50 14z"
          fill={INK}
        />
        {face(50, 46)}
        <circle cx={25} cy={60} r={6} fill={C} />
        <circle cx={75} cy={60} r={6} fill={C} />
      </>
    ),
  },
  sun: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <circle cx={50} cy={60} r={44} fill={INK} />
        {face(50, 54)}
        <circle cx={26} cy={70} r={6} fill={C} />
        <circle cx={74} cy={70} r={6} fill={C} />
      </>
    ),
  },
  plate: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <circle cx={50} cy={60} r={46} fill={INK} />
        <circle cx={50} cy={60} r={30} fill={CUT} />
        <circle cx={50} cy={60} r={22} fill={B} />
        <path
          d="M44 52c4-6 12-6 16 0"
          stroke={CUT}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  mirror: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <circle cx={50} cy={60} r={46} fill={INK} />
        <circle cx={50} cy={60} r={34} fill={C} />
        <path
          d="M34 50c4-10 12-16 22-17"
          stroke={CUT}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  bulb: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <path
          d="M50 6a38 38 0 0 0-22 69c5 4 8 9 8 15h28c0-6 3-11 8-15A38 38 0 0 0 50 6z"
          fill={INK}
        />
        <path d="M36 96h28v8H36zM39 108h22v6H39z" fill={A} />
        <path
          d="M42 64l8-18 8 18"
          stroke={CUT}
          strokeWidth={5}
          fill="none"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  kettlebell: {
    viewBox: '0 0 100 120',
    body: (
      <>
        <path d="M30 40c0-30 40-30 40 0" stroke={INK} strokeWidth={10} fill="none" />
        <circle cx={50} cy={74} r={42} fill={INK} />
        <circle cx={50} cy={76} r={16} fill={A} />
      </>
    ),
  },
}

const TALL: Record<string, Drawing> = {
  lighthouse: {
    viewBox: '0 0 100 140',
    body: (
      <>
        <path
          d="M8 36 L30 30 M92 36 L70 30 M10 18 L32 24 M90 18 L68 24"
          stroke={B}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <path d="M38 18h24l4 14H34z" fill={B} />
        <path d="M30 14 L50 2 L70 14z" fill={C} />
        <path d="M34 34h32l12 92H22z" fill={INK} />
        <path d="M30 64h40l3 18H27z M25 100h50l2 14H23z" fill={C} />
        <path d="M2 128c10-8 18-8 28 0s18 8 28 0 18-8 28 0 10 8 12 6v8H2z" fill={A} />
      </>
    ),
  },
  toothbrush: {
    viewBox: '30 0 64 140',
    body: (
      <>
        <path d="M44 40h12l6 98H38z" fill={INK} />
        <path d="M38 6h24v36H38z" fill={A} />
        <path d="M38 10h24M38 18h24M38 26h24M38 34h24" stroke={CUT} strokeWidth={3} />
        <circle cx={72} cy={22} r={9} fill={C} />
        <circle cx={84} cy={44} r={6} fill={B} />
      </>
    ),
  },
  bottle: {
    viewBox: '18 0 64 140',
    body: (
      <>
        <path d="M42 4h16v30c12 6 18 16 18 30v74H24V64c0-14 6-24 18-30z" fill={INK} />
        <path d="M30 76h40v34H30z" fill={B} />
        <path d="M40 4h20v10H40z" fill={C} />
      </>
    ),
  },
  scissors: {
    viewBox: '0 0 100 140',
    body: (
      <>
        <path d="M30 6l40 80M70 6L30 86" stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <circle cx={28} cy={108} r={20} fill={INK} />
        <circle cx={72} cy={108} r={20} fill={INK} />
        <circle cx={28} cy={108} r={9} fill={C} />
        <circle cx={72} cy={108} r={9} fill={B} />
      </>
    ),
  },
  bolt: {
    viewBox: '8 0 84 140',
    body: <path d="M62 2L14 80h30L34 138l52-84H54z" fill={INK} />,
  },
  dumbbell: {
    viewBox: '16 0 68 140',
    body: (
      <>
        <path d="M44 28h12v84H44z" fill={INK} />
        <path d="M22 6h56v24H22zM22 110h56v24H22z" fill={INK} />
        <path d="M30 12h40v12H30zM30 116h40v12H30z" fill={A} />
      </>
    ),
  },
}

const EXTRA: Record<string, Drawing> = {
  star: {
    viewBox: '0 0 100 100',
    body: <path d="M50 14l9 20 22 2-17 15 5 22-19-11-19 11 5-22-17-15 22-2z" fill={INK} />,
  },
  heart: {
    viewBox: '0 0 100 100',
    body: (
      <path
        d="M50 82C20 60 14 46 14 34a18 18 0 0 1 36-4 18 18 0 0 1 36 4c0 12-6 26-36 48z"
        fill={INK}
      />
    ),
  },
  house: {
    viewBox: '0 0 100 100',
    body: <path d="M50 14L12 46h10v38h20V62h16v22h20V46h10z" fill={INK} />,
  },
}

/**
 * The drawings in each set: round (for an O), tall (for the letter it most resembles: a triangle
 * reads as A, a post as I), and three for lists.
 */
export const MARK_SETS: Record<
  string,
  { round: string; tall: string; tallFor: 'A' | 'I'; list: [string, string, string] }
> = {
  shop: { round: 'sun', tall: 'lighthouse', tallFor: 'A', list: ['star', 'heart', 'house'] },
  dental: { round: 'tooth', tall: 'toothbrush', tallFor: 'I', list: ['tooth', 'star', 'heart'] },
  food: { round: 'plate', tall: 'bottle', tallFor: 'I', list: ['plate', 'heart', 'star'] },
  hair: { round: 'mirror', tall: 'scissors', tallFor: 'A', list: ['mirror', 'star', 'heart'] },
  trades: { round: 'bulb', tall: 'bolt', tallFor: 'I', list: ['house', 'bulb', 'star'] },
  fitness: {
    round: 'kettlebell',
    tall: 'dumbbell',
    tallFor: 'I',
    list: ['kettlebell', 'heart', 'star'],
  },
}

const ALL: Record<string, Drawing> = { ...ROUND, ...TALL, ...EXTRA }

/** One drawing by name, decorative. */
export function Mark(p: { name: string; className?: string }) {
  const d = ALL[p.name]
  if (!d) return null
  return (
    <svg
      viewBox={d.viewBox}
      aria-hidden="true"
      focusable="false"
      className={p.className ?? 'block'}
    >
      {d.body}
    </svg>
  )
}

/** The set for a site's `marks` setting; the general set when none is chosen. */
export const markSet = (marks: string | undefined) =>
  (MARK_SETS[marks && marks !== 'none' ? marks : 'shop'] ?? MARK_SETS.shop) as {
    round: string
    tall: string
    tallFor: 'A' | 'I'
    list: [string, string, string]
  }

/**
 * The business name set one word to a line, with the first O drawn as the set's round drawing and
 * the first A or I (whichever the tall drawing resembles) after it, or before it if none, as the
 * tall drawing. Screen readers hear the name.
 */
export function LetteredName(p: { name: string; marks: string | undefined }) {
  const set = markSet(p.marks)
  const words = p.name.split(/\s+/).filter(Boolean)
  const flat = words.join(' ')
  const o = flat.search(/[oO0]/)
  const tall = set.tallFor === 'A' ? /[aA]/ : /[iI]/
  let a = o >= 0 ? flat.slice(o + 1).search(tall) : -1
  a = a >= 0 ? a + o + 1 : flat.search(tall)
  let at = 0
  const lines = words.map((w) => {
    const start = at
    at += w.length + 1
    const parts: ReactNode[] = []
    let run = ''
    for (let i = 0; i < w.length; i++) {
      const k = start + i
      if (k === o || k === a) {
        if (run) parts.push(run)
        run = ''
        parts.push(
          <Mark
            key={k}
            name={k === o ? set.round : set.tall}
            className={k === o ? 'mark-round' : 'mark-tall'}
          />,
        )
      } else run += w[i]
    }
    if (run) parts.push(run)
    return parts
  })
  return (
    <span aria-label={p.name} role="img" className="block">
      {lines.map((parts, i) => (
        <span key={i} aria-hidden="true" className="block">
          {parts}
        </span>
      ))}
    </span>
  )
}

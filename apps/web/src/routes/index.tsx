import { SPEC_VERSION } from '@repo/spec'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto max-w-xl p-8 font-sans">
      <h1 className="text-2xl font-semibold">Builder</h1>
      <p className="mt-2 text-neutral-600">
        M0 harness. Spec version {SPEC_VERSION}. Nothing to generate yet.
      </p>
    </main>
  )
}

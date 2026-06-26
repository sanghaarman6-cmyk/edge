'use client'

export default function SectionConnector({
  height = 120,
}: {
  height?: number
}) {
  return (
    <div className="relative w-full flex justify-center pointer-events-none">
      {/* vertical line */}
      <div
        style={{ height }}
        className="w-px bg-linear-to-b from-emerald-400/0 via-emerald-400/40 to-emerald-400/0"
      />

      {/* soft glow */}
      <div className="absolute top-1/2 w-2 h-2 rounded-full bg-emerald-400/60 blur-md" />
    </div>
  )
}

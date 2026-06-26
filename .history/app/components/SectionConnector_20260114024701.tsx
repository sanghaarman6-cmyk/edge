'use client'

import { motion } from 'framer-motion'

export default function SectionConnector({
  height = 120,
  delay = 0,
}: {
  height?: number
  delay?: number
}) {
  return (
    <div className="relative w-full flex justify-center pointer-events-none">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          delay,
        }}
        className="w-px bg-linear-to-b from-emerald-400/0 via-emerald-400/40 to-emerald-400/0"
      />

      {/* soft glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3 }}
        className="absolute top-1/2 w-2 h-2 rounded-full bg-emerald-400 blur-md"
      />
    </div>
  )
}

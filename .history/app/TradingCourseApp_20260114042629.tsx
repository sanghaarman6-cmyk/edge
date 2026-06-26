"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  FileText,
  Download,
  PlayCircle,
  Calculator as CalculatorIcon,
  CoinsIcon,
  ChevronDown,
  X,
  ShieldAlertIcon,
  SendIcon,
  TvMinimalIcon,
} from "lucide-react"
import { supabase } from "@/supabaseClient"

/* =====================================================================================
   GLOBAL MOTION SYSTEM
===================================================================================== */

const springFast = { type: "spring", stiffness: 420, damping: 32 }
const springSoft = { type: "spring", stiffness: 220, damping: 26 }

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
}

/* =====================================================================================
   DRAG SCROLL (LESSONS)
===================================================================================== */

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  return {
    ref,
    onMouseDown: (e: React.MouseEvent) => {
      if (!ref.current) return
      isDown = true
      startX = e.pageX - ref.current.offsetLeft
      scrollLeft = ref.current.scrollLeft
      ref.current.classList.add("cursor-grabbing")
    },
    onMouseLeave: () => {
      isDown = false
      ref.current?.classList.remove("cursor-grabbing")
    },
    onMouseUp: () => {
      isDown = false
      ref.current?.classList.remove("cursor-grabbing")
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (!isDown || !ref.current) return
      e.preventDefault()
      const x = e.pageX - ref.current.offsetLeft
      const walk = (x - startX) * 1.4
      ref.current.scrollLeft = scrollLeft - walk
    },
  }
}

/* =====================================================================================
   TYPES
===================================================================================== */

interface Lesson {
  title: string
  duration: string
  video: string | null
  thumbnail: string
}

interface Category {
  title: string
  lessons: Lesson[]
}

interface Announcement {
  id: string
  title: string | null
  message: string
  created_at: string
  variant: "neutral" | "green" | "yellow" | "red"
}

type TabKey = "home" | "lessons" | "documents" | "calculator" | "lot"

/* =====================================================================================
   STATIC DATA
===================================================================================== */

const TABS = [
  { key: "home", label: "Home", icon: <Home size={16} /> },
  { key: "lessons", label: "Lessons", icon: <TvMinimalIcon size={16} /> },
  { key: "documents", label: "Docs", icon: <FileText size={16} /> },
  { key: "calculator", label: "Calculator", icon: <CalculatorIcon size={16} /> },
  { key: "lot", label: "Lot Tool", icon: <CoinsIcon size={16} /> },
] as const

const categories: Category[] = [
  {
    title: "Foundations",
    lessons: [
      {
        title: "How the Prop Firm System Really Works",
        duration: "8:16",
        video: "h2ldqp9al5",
        thumbnail: "/thumbnails/t1.webp",
      },
      {
        title: "One-Trade Evaluation Pass Method",
        duration: "7:48",
        video: "tw5e0nld6b",
        thumbnail: "/thumbnails/t2.webp",
      },
      {
        title: "Funded Hedge Payout Engine",
        duration: "24:07",
        video: "h5alyreoz8",
        thumbnail: "/thumbnails/t3.webp",
      },
    ],
  },
]

/* =====================================================================================
   MAIN APP
===================================================================================== */

export default function TradingCourseApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("home")
  const [navOpen, setNavOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [progress, setProgress] = useState(0)

  /* ------------------- Announcements ------------------- */
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    supabase
      .from("admin_announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data as Announcement[])
      })
  }, [])

  /* ------------------- Progress ------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("courseProgress")
    if (saved) {
      const parsed = JSON.parse(saved)
      setCompletedLessons(parsed.completedLessons || [])
      setProgress(parsed.progress || 0)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "courseProgress",
      JSON.stringify({ completedLessons, progress })
    )
  }, [completedLessons, progress])

  const lessonIds = useMemo(() => {
    let i = 0
    return categories.map((c) =>
      c.lessons.map(() => {
        const id = i
        i++
        return id
      })
    )
  }, [])

  const totalLessons = lessonIds.flat().length

  const markComplete = (id: number) => {
    if (completedLessons.includes(id)) return
    const updated = [...completedLessons, id]
    setCompletedLessons(updated)
    setProgress(Math.round((updated.length / totalLessons) * 100))
  }

  /* =====================================================================================
     RENDER
  ===================================================================================== */

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ================= TOP BAR ================= */}
      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-800/70 bg-zinc-950/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-xs tracking-[0.3em] font-semibold">
                PROP ACCELERATOR
              </div>
              <div className="text-[11px] text-zinc-500">
                Trading OS
              </div>
            </div>

            <div className="hidden md:flex gap-1 rounded-2xl border border-zinc-800/70 bg-black/40 p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
                    activeTab === t.key
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <button
              className="md:hidden flex items-center gap-2"
              onClick={() => setNavOpen((s) => !s)}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <main className="mx-auto max-w-6xl px-4 pt-[120px] pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springFast}
          >
            {/* ================= HOME ================= */}
            {activeTab === "home" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-8">
                  <h1 className="text-3xl font-semibold">
                    Execute the system.
                  </h1>
                  <p className="mt-2 text-zinc-400">
                    This is not a course. It’s a controlled trading
                    environment.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4"
                    >
                      <p className="font-semibold">{a.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {a.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= LESSONS ================= */}
            {activeTab === "lessons" && (
              <LessonsSection
                categories={categories}
                lessonIds={lessonIds}
                completedLessons={completedLessons}
                setActiveVideo={setActiveVideo}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={springSoft}
              className="w-full max-w-4xl rounded-3xl bg-black border border-zinc-800/70 p-4"
            >
              <button
                className="absolute top-4 right-4"
                onClick={() => setActiveVideo(null)}
              >
                <X />
              </button>
              <WistiaPlayer
                hashedId={
                  categories.flatMap((c) => c.lessons)[activeVideo]
                    ?.video || ""
                }
                onComplete={() => markComplete(activeVideo)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =====================================================================================
   LESSONS SECTION
===================================================================================== */

function LessonsSection({
  categories,
  lessonIds,
  completedLessons,
  setActiveVideo,
}: any) {
  const drag = useDragScroll()

  return (
    <div
      ref={drag.ref}
      {...drag}
      className="flex gap-6 overflow-x-auto cursor-grab"
    >
      {categories.flatMap((cat: any, cIdx: number) =>
        cat.lessons.map((lesson: any, lIdx: number) => {
          const id = lessonIds[cIdx][lIdx]
          return (
            <motion.div
              key={id}
              whileHover={{ scale: 1.03 }}
              className="min-w-[300px] rounded-3xl border border-zinc-800/70 bg-zinc-950/50 overflow-hidden"
              onClick={() => lesson.video && setActiveVideo(id)}
            >
              <img
                src={lesson.thumbnail}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{lesson.title}</h3>
                <p className="text-sm text-zinc-500">
                  {lesson.duration}
                </p>
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}

/* =====================================================================================
   WISTIA PLAYER
===================================================================================== */

function WistiaPlayer({
  hashedId,
  onComplete,
}: {
  hashedId: string
  onComplete?: () => void
}) {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://fast.wistia.com/assets/external/E-v1.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      window._wq = window._wq || []
      // @ts-ignore
      window._wq.push({
        id: hashedId,
        onReady: function (video: any) {
          video.bind("end", () => onComplete?.())
        },
      })
    }
  }, [hashedId, onComplete])

  return (
    <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <div className={`wistia_embed wistia_async_${hashedId}`} />
      </div>
    </div>
  )
}

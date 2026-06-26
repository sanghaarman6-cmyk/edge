'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';

export default function TrainingWatchPage() {
  // Disable right-click + some common “save video” hotkeys
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Block common save/devtools shortcuts (best-effort)
      const isSave = (e.ctrlKey || e.metaKey) && key === 's';
      const isViewSource = (e.ctrlKey || e.metaKey) && key === 'u';
      const isDevtools =
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'));

      if (isSave || isViewSource || isDevtools) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-black flex flex-col items-center px-4"
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
    >
      {/* WISTIA SCRIPT */}
      <Script
        src="https://fast.wistia.com/assets/external/E-v1.js"
        strategy="afterInteractive"
      />

      {/* LOGO */}
      <div className="mt-10 mb-16 flex justify-center">
      <div className="flex items-center gap-3">
        <img
          src="/favicon.ico"
          alt="Prop Accelerator"
          className="w-10 h-10"
        />
        <span className="text-xs tracking-[0.3em] text-zinc-500">
          PROP ACCELERATOR
        </span>
      </div>
    </div>

      {/* VIDEO */}
      <section className="w-full max-w-4xl">
        <div className="rounded-xl overflow-hidden bg-black relative">
          <div
            className="wistia_responsive_padding"
            style={{ padding: '56.25% 0 0 0', position: 'relative' }}
          >
            <div
              className="wistia_responsive_wrapper"
              style={{
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100%',
              }}
            >
              {/* FULL TRAINING VIDEO */}
              <div className="wistia_embed wistia_async_pqpsbw2gh3 videoFoam=true"></div>
            </div>
          </div>

          {/* Interaction shield (blocks right-click on the player surface) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
          />
        </div>
      </section>

     {/* CTA */}
<section className="mt-16 mb-24 w-full flex justify-center px-4">
  <div className="w-full max-w-4xl">
    <div className="
      relative
      bg-black/60 backdrop-blur-xl
      border border-zinc-800
      rounded-3xl
      px-6 sm:px-10 py-8
      flex flex-col sm:flex-row
      items-center justify-between
      gap-6
    ">
      {/* LEFT COPY */}
      <div className="text-center sm:text-left">
        <p className="text-lg font-semibold text-white">
          Ready to access the full framework?
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Complete system • Real execution logic • No indicators
        </p>
      </div>

      {/* CTA BUTTON */}
      <a
        href="https://www.launchpass.com/prop-accelerator/join"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className="
            px-8 sm:px-10
            py-4
            text-base sm:text-lg
            bg-zinc-400 hover:bg-zinc-300
            text-black font-semibold
            rounded-xl
            shadow-[0_0_25px_rgba(74,222,128,0.35)]
            transition-all
          "
          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        >
          Unlock the Full Framework
        </Button>
      </a>
    </div>
  </div>
</section>


      {/* FOOTER */}
      <footer className="text-xs text-zinc-500 mb-6 text-center px-4 select-none">
        Educational content only. Trading involves risk.
        <br />
        © Prop Accelerator
      </footer>
    </div>
  );
}

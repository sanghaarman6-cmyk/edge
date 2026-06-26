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
      <section className="mt-8 sm:mt-12 mb-20 text-center w-full">
        <a
          href="https://www.launchpass.com/prop-accelerator/join"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex justify-center"
        >
          <Button
            className="
              w-full sm:w-auto
              px-6 sm:px-12 md:px-16
              py-4 sm:py-5 md:py-6
              text-lg sm:text-xl md:text-2xl
              bg-green-400 hover:bg-green-300
              text-black font-bold
              rounded-2xl
              shadow-[0_0_40px_rgba(74,222,128,0.5)]
              select-none
            "
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
          >
            Unlock the Full Framework
          </Button>
        </a>
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

import React, { useEffect, useRef, useState } from 'react';
import { SauronConfig } from '../types';
import { drawSauronFrame } from '../utils/sauronRenderer';
import {
  playFingerprintTouchSound,
  playFingerprintSuccessSound,
  stopFingerprintSound,
} from '../utils/audioSynth';
import confetti from 'canvas-confetti';
import { Flame, Lock, Unlock, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface PhoneSimulatorProps {
  config: SauronConfig;
  activeProfileName: string;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ config, activeProfileName }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 0.5x, 0.25x

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const pressStartTimeRef = useRef<number>(0);

  // Time display
  const [timeStr, setTimeStr] = useState({ hour1: '1', hour2: '2', minutes: '45', date: 'Пн, 20 октября' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' };
      const date = now.toLocaleDateString('ru-RU', dateOpts);
      setTimeStr({
        hour1: hours[0],
        hour2: hours[1],
        minutes,
        date: date.charAt(0).toUpperCase() + date.slice(1),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Continuous frame rendering on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawSauronFrame(ctx, currentFrame, config.frameCount, config);
  }, [currentFrame, config]);

  // Handle finger press & hold loop
  useEffect(() => {
    if (!isPressing || isUnlocked) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    pressStartTimeRef.current = performance.now();
    let localFrame = 0;
    const total = config.frameCount;
    const frameDurationMs = (1000 / config.fps) / playbackSpeed;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      if (delta >= frameDurationMs) {
        localFrame++;
        lastTime = now;

        if (localFrame >= total) {
          // Success unlock!
          setCurrentFrame(total - 1);
          setIsUnlocked(true);
          setIsPressing(false);
          if (soundEnabled) {
            playFingerprintSuccessSound();
          }

          // Trigger subtle particle burst
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.78, x: 0.5 },
            colors: ['#ff4400', '#ffbb00', '#ffe57f', '#ffffff'],
            disableForReducedMotion: true,
          });
          return;
        }

        setCurrentFrame(localFrame);
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPressing, isUnlocked, config, playbackSpeed, soundEnabled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isUnlocked) return;
    setIsPressing(true);
    setCurrentFrame(0);
    if (soundEnabled) {
      playFingerprintTouchSound();
    }
  };

  const handlePointerUp = () => {
    if (isUnlocked) return;
    setIsPressing(false);
    stopFingerprintSound();
    // Reset back to idle after slight delay
    setTimeout(() => {
      if (!isUnlocked) {
        setCurrentFrame(0);
      }
    }, 150);
  };

  const handleReset = () => {
    setIsUnlocked(false);
    setIsPressing(false);
    setCurrentFrame(0);
    stopFingerprintSound();
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* OnePlus Smartphone Frame */}
      <div className="relative w-[320px] h-[640px] sm:w-[340px] sm:h-[680px] bg-neutral-950 rounded-[48px] p-3 shadow-2xl shadow-orange-950/30 border-4 border-neutral-800 ring-1 ring-white/10 flex flex-col justify-between overflow-hidden">
        {/* Outer Phone Bezel Highlights */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none ring-1 ring-inset ring-white/10" />

        {/* Punch Hole Camera (OnePlus Corner Style) */}
        <div className="absolute top-5 left-8 w-3.5 h-3.5 bg-neutral-900 rounded-full border border-neutral-700/60 z-30 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="relative z-20 flex justify-between items-center text-[11px] text-neutral-400 font-medium px-4 pt-1">
          <span className="tracking-tight text-white/90">OxygenOS</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-orange-400 font-mono">5G</span>
            <div className="w-4 h-2 border border-neutral-400 rounded-xs p-0.5 flex items-center">
              <div className="h-full w-3/4 bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative flex-1 flex flex-col items-center justify-between py-6 px-4 z-10">
          {/* Lockscreen Header & Signature OnePlus Clock */}
          <div className="flex flex-col items-center text-center mt-6">
            <div className="flex items-center text-neutral-400 text-xs mb-3 gap-1.5 tracking-wider uppercase font-semibold">
              {isUnlocked ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Разблокировано
                </span>
              ) : (
                <span className="text-neutral-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> OxygenOS Lockscreen
                </span>
              )}
            </div>

            {/* Signature OxygenOS Clock: Red 1 Numeral */}
            <div className="text-6xl font-light tracking-tight text-white font-mono flex items-center drop-shadow-md">
              <span className={timeStr.hour1 === '1' ? 'text-red-500 font-bold' : 'text-white'}>
                {timeStr.hour1}
              </span>
              <span className={timeStr.hour2 === '1' && timeStr.hour1 !== '1' ? 'text-red-500 font-bold' : 'text-white'}>
                {timeStr.hour2}
              </span>
              <span className="text-red-500 mx-0.5 animate-pulse">:</span>
              <span>{timeStr.minutes}</span>
            </div>

            <p className="text-sm text-neutral-300 font-light mt-1 tracking-wide">
              {timeStr.date}
            </p>

            <div className="mt-4 px-2.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[10px] text-neutral-400">
              OnePlus • {activeProfileName.split(' ')[0]}
            </div>
          </div>

          {/* Unlocked State Screen View */}
          {isUnlocked ? (
            <div className="flex-1 flex flex-col items-center justify-center my-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-lg shadow-orange-600/30 mb-3 flex items-center justify-center">
                <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg">Власть Единого Кольца</h3>
              <p className="text-neutral-400 text-xs mt-1 max-w-[220px]">
                Отпечаток пальца распознан! Око Саурона пропустило вас в систему.
              </p>
              <button
                onClick={handleReset}
                className="mt-5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/20 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Заблокировать снова
              </button>
            </div>
          ) : (
            /* Fingerprint On Display (FOD) Area */
            <div className="w-full flex flex-col items-center mb-8">
              <div className="relative flex items-center justify-center">
                {/* Sauron Animation Canvas */}
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={240}
                  className={`w-36 h-36 transition-opacity duration-150 pointer-events-none z-10 ${
                    isPressing ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
                  }`}
                />

                {/* Resting Optical Fingerprint Icon */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 touch-none z-20 ${
                    isPressing
                      ? 'scale-110'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {/* Subtle pulsing optical FOD guide ring */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                      isPressing
                        ? 'border-orange-500/0 ring-4 ring-orange-500/40 animate-ping'
                        : 'border-cyan-400/40 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }`}
                  />

                  {/* Fingerprint Glyph Icon (when not pressing) */}
                  {!isPressing && (
                    <div className="relative flex flex-col items-center justify-center">
                      <svg
                        className="w-10 h-10 text-cyan-300/80 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                        <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                        <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                        <path d="M2 12a10 10 0 0 1 18-6" />
                        <path d="M2 16h.01" />
                        <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                        <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                        <path d="M5.44 10.37a7 7 0 0 1 2.25-3.3" />
                        <path d="M6 16.5c0-.6.1-1.3.3-1.9" />
                        <path d="M10 19.5c0-.4.1-1.2.2-1.8" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Text under scanner */}
              <div className="mt-3 text-center">
                <p className="text-[11px] font-medium text-neutral-400 tracking-wide">
                  {isPressing ? (
                    <span className="text-orange-400 flex items-center gap-1 justify-center animate-pulse">
                      <Sparkles className="w-3 h-3" /> Прикоснитесь и удерживайте...
                    </span>
                  ) : (
                    'Прижмите палец к сканеру'
                  )}
                </p>
                <span className="text-[9px] text-neutral-600 block mt-0.5">
                  Кадр {currentFrame + 1} / {config.frameCount} ({Math.round(((currentFrame + 1) / config.frameCount) * 100)}%)
                </span>
              </div>
            </div>
          )}

          {/* Bottom Lockscreen Shortcuts */}
          <div className="w-full flex justify-between items-center text-neutral-500 px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-xs">
              📞
            </div>
            <div className="h-1 w-28 bg-neutral-800 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-xs">
              📷
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Speed Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-sm">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
            soundEnabled
              ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
          title="Включить/выключить звук и вибрацию сканера"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-orange-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          {soundEnabled ? 'Звук ВКЛ' : 'Звук ВЫКЛ'}
        </button>

        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
          <span className="px-2 text-[10px] text-neutral-500">Скорость:</span>
          {[0.25, 0.5, 1].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                playbackSpeed === speed
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {isUnlocked && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Заблокировать
          </button>
        )}
      </div>
    </div>
  );
};

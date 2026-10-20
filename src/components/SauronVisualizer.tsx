import React, { useEffect, useRef, useState } from 'react';
import { SauronConfig, SauronTheme } from '../types';
import { drawSauronFrame, THEME_PALETTES } from '../utils/sauronRenderer';
import { Play, Pause, SkipBack, SkipForward, Sliders, Flame, Eye, Sparkles, CircleDot } from 'lucide-react';

interface SauronVisualizerProps {
  config: SauronConfig;
  onChangeConfig: (newConfig: Partial<SauronConfig>) => void;
}

export const SauronVisualizer: React.FC<SauronVisualizerProps> = ({
  config,
  onChangeConfig,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % config.frameCount);
    }, 1000 / config.fps);

    return () => clearInterval(interval);
  }, [isPlaying, config.fps, config.frameCount]);

  // Ensure currentFrame is within bounds
  useEffect(() => {
    if (currentFrame >= config.frameCount) {
      setCurrentFrame(0);
    }
  }, [config.frameCount, currentFrame]);

  // Draw frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawSauronFrame(ctx, currentFrame, config.frameCount, config);
  }, [currentFrame, config]);

  const activePalette = THEME_PALETTES[config.theme] || THEME_PALETTES.mordor;

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${activePalette.accent}20`, border: `1px solid ${activePalette.accent}60` }}
          >
            <Eye className="w-5 h-5" style={{ color: activePalette.accent }} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              Генератор Анимации Ока Саурона
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800/50">
                FOD 60 FPS
              </span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Точная покадровая настройка пламени, зрачка и эльфийских рун Кольца
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-neutral-400">
            Кадр: <strong className="text-white font-semibold">{currentFrame + 1}</strong> / {config.frameCount}
          </span>
          <div className="text-[10px] text-neutral-500 font-mono">
            {config.resolution}x{config.resolution} px • {config.fps} FPS
          </div>
        </div>
      </div>

      {/* Center Stage: High-Resolution Canvas & Player Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Canvas Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 bg-neutral-950 rounded-2xl p-2 border border-neutral-800 shadow-inner flex items-center justify-center overflow-hidden group">
            {/* Dark volcanic grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            <canvas
              ref={canvasRef}
              width={config.resolution}
              height={config.resolution}
              className="w-56 h-56 object-contain z-10 transition-transform group-hover:scale-105 duration-200"
            />

            {/* Glowing corner indicator */}
            <div
              className="absolute bottom-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-neutral-400 border border-neutral-800 z-20"
            >
              {Math.round((currentFrame / (config.frameCount - 1 || 1)) * 100)}%
            </div>
          </div>

          {/* Transport / Scrubbing controls */}
          <div className="w-full mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={config.frameCount - 1}
                value={currentFrame}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrame(parseInt(e.target.value, 10));
                }}
                className="w-full accent-orange-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrame((prev) => (prev > 0 ? prev - 1 : config.frameCount - 1));
                }}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Предыдущий кадр"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Пауза' : 'Воспроизведение'}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrame((prev) => (prev + 1) % config.frameCount);
                }}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Следующий кадр"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Parameters & Configuration Column */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-2 block flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Тематическая палитра Ока
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(THEME_PALETTES) as SauronTheme[]).map((themeKey) => {
                const pal = THEME_PALETTES[themeKey];
                const isSelected = config.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => onChangeConfig({ theme: themeKey })}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-neutral-800 border-orange-500 ring-1 ring-orange-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shadow-xs"
                        style={{ backgroundColor: pal.accent }}
                      />
                      <span className="font-medium text-[11px] truncate">{pal.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500 line-clamp-1">{pal.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Flame Intensity & Pupil Dilation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> Сила пламени
                </span>
                <span className="font-mono text-neutral-400">{config.flameIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.1}
                value={config.flameIntensity}
                onChange={(e) => onChangeConfig({ flameIntensity: parseFloat(e.target.value) })}
                className="w-full accent-orange-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-orange-400" /> Ширина зрачка
                </span>
                <span className="font-mono text-neutral-400">{config.pupilDilation.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.4}
                step={0.1}
                value={config.pupilDilation}
                onChange={(e) => onChangeConfig({ pupilDilation: parseFloat(e.target.value) })}
                className="w-full accent-orange-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onChangeConfig({ ringRunes: !config.ringRunes })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center text-center gap-1 transition-all ${
                config.ringRunes
                  ? 'bg-orange-950/30 border-orange-700/60 text-orange-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-medium">Руны Кольца</span>
            </button>

            <button
              onClick={() => onChangeConfig({ emberSparks: !config.emberSparks })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center text-center gap-1 transition-all ${
                config.emberSparks
                  ? 'bg-orange-950/30 border-orange-700/60 text-orange-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium">Искры и угли</span>
            </button>

            <button
              onClick={() => onChangeConfig({ smokeVeil: !config.smokeVeil })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center text-center gap-1 transition-all ${
                config.smokeVeil
                  ? 'bg-orange-950/30 border-orange-700/60 text-orange-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-neutral-700/70" />
              <span className="text-[11px] font-medium">Дым Мордора</span>
            </button>

            <button
              onClick={() => onChangeConfig({ sensorGreenCore: !config.sensorGreenCore })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center text-center gap-1 transition-all ${
                config.sensorGreenCore
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title="Добавляет зелёную подсветку по центру для корректного чтения оптическим датчиком сканера"
            >
              <CircleDot className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-medium">Зелёный сенсор</span>
            </button>
          </div>

          {/* Technical Specs: Resolution, Frames count, FPS */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span>Кадров:</span>
              <div className="flex bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
                {[30, 45, 60].map((count) => (
                  <button
                    key={count}
                    onClick={() => onChangeConfig({ frameCount: count })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                      config.frameCount === count
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Разрешение:</span>
              <div className="flex bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
                {[300, 400, 500].map((res) => (
                  <button
                    key={res}
                    onClick={() => onChangeConfig({ resolution: res })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                      config.resolution === res
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Частота:</span>
              <div className="flex bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
                {[30, 60].map((fpsVal) => (
                  <button
                    key={fpsVal}
                    onClick={() => onChangeConfig({ fps: fpsVal })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                      config.fps === fpsVal
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {fpsVal}fps
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

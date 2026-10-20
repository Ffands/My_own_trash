import React, { useState } from 'react';
import { OxygenOSProfile, SauronConfig, InspectedApkInfo } from './types';
import { OXYGEN_OS_PROFILES } from './utils/oxygenProfiles';
import { PhoneSimulator } from './components/PhoneSimulator';
import { SauronVisualizer } from './components/SauronVisualizer';
import { ApkAnalyzer } from './components/ApkAnalyzer';
import { GitHubActionsGuide } from './components/GitHubActionsGuide';
import { FrameGallery } from './components/FrameGallery';
import { MagiskGuide } from './components/MagiskGuide';
import {
  Flame,
  Smartphone,
  Eye,
  UploadCloud,
  Github,
  Grid,
  BookOpen,
  Settings2,
  FolderArchive,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(OXYGEN_OS_PROFILES[0].id);
  const [customProfile, setCustomProfile] = useState<OxygenOSProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'visualizer' | 'simulator' | 'analyzer' | 'github' | 'gallery' | 'guide'>('visualizer');

  // Sauron animation configuration
  const [sauronConfig, setSauronConfig] = useState<SauronConfig>({
    theme: 'mordor',
    frameCount: 30,
    resolution: 400,
    fps: 30,
    flameIntensity: 1.1,
    pupilDilation: 0.9,
    ringRunes: true,
    emberSparks: true,
    sensorGreenCore: false,
    smokeVeil: true,
  });

  // Determine active profile
  const activeProfile: OxygenOSProfile =
    (customProfile && selectedProfileId === 'custom')
      ? customProfile
      : OXYGEN_OS_PROFILES.find((p) => p.id === selectedProfileId) || OXYGEN_OS_PROFILES[0];

  const handleUpdateConfig = (newCfg: Partial<SauronConfig>) => {
    setSauronConfig((prev) => ({ ...prev, ...newCfg }));
  };

  // When user uploads an APK, adapt target profile
  const handleApplyDetectedProfile = (info: InspectedApkInfo) => {
    const newCust: OxygenOSProfile = {
      id: 'custom',
      name: `Обнаружено из ${info.fileName}`,
      version: 'Автоопределение из APK',
      targetPackage: info.targetPackage || 'com.oplus.uiengine',
      framePrefix: info.framePrefix || 'fingerprint_recognizing_anim_',
      frameExtension: '.png',
      digitsFormat: 5,
      indexStartsAt: 0,
      description: `Сконфигурировано на основе разобранного оверлея ${info.fileName}`,
      category: 'custom',
    };
    setCustomProfile(newCust);
    setSelectedProfileId('custom');

    if (info.detectedFrames.length > 0) {
      setSauronConfig((prev) => ({
        ...prev,
        frameCount: info.detectedFrames.length,
        resolution: info.detectedFrames[0]?.width || prev.resolution,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 p-0.5 shadow-lg shadow-orange-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base tracking-tight">
                  OxygenOS Sauron FOD
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800/50 font-semibold">
                  Studio
                </span>
              </div>
              <p className="text-neutral-400 text-xs">
                Кастомная анимация сканера «Око Саурона» для OnePlus & ColorOS
              </p>
            </div>
          </div>

          {/* Profile Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-400 shrink-0 hidden md:inline">
              Профиль прошивки:
            </span>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full sm:w-72 bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 font-mono transition-colors"
              >
                {OXYGEN_OS_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                {customProfile && (
                  <option value="custom">
                    ✨ {customProfile.name} ({customProfile.targetPackage})
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto pb-1 gap-2 border-b border-neutral-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'visualizer'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Тюнинг Ока</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Смартфон OnePlus</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'analyzer'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Инспектор твоего APK</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'github'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Сборка через GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Кадры (PNG)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Установка (Magisk / ADB)</span>
          </button>
        </div>

        {/* Dual Layout: Workstation Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Active Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeTab === 'visualizer' && (
              <SauronVisualizer
                config={sauronConfig}
                onChangeConfig={handleUpdateConfig}
              />
            )}

            {activeTab === 'simulator' && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
                <div className="w-full text-center mb-4">
                  <h3 className="text-white font-semibold text-base">
                    Интерактивное тестирование FOD
                  </h3>
                  <p className="text-neutral-400 text-xs">
                    Прикоснитесь пальцем или мышью к круглому сенсору, чтобы увидеть запуск Ока Саурона
                  </p>
                </div>
                <PhoneSimulator
                  config={sauronConfig}
                  activeProfileName={activeProfile.name}
                />
              </div>
            )}

            {activeTab === 'analyzer' && (
              <ApkAnalyzer
                config={sauronConfig}
                onApplyDetectedProfile={handleApplyDetectedProfile}
              />
            )}

            {activeTab === 'github' && (
              <GitHubActionsGuide
                profile={activeProfile}
                config={sauronConfig}
              />
            )}

            {activeTab === 'gallery' && (
              <FrameGallery
                config={sauronConfig}
                profile={activeProfile}
              />
            )}

            {activeTab === 'guide' && (
              <MagiskGuide
                profile={activeProfile}
                config={sauronConfig}
              />
            )}
          </div>

          {/* Right Sidebar: Compact Phone Preview or Summary Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Real-time Phone Lockscreen Widget (Always visible when not on full simulator tab) */}
            {activeTab !== 'simulator' && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-orange-400" /> Живой тест FOD
                  </span>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-0.5"
                  >
                    Развернуть <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="transform scale-[0.88] origin-top">
                  <PhoneSimulator
                    config={sauronConfig}
                    activeProfileName={activeProfile.name}
                  />
                </div>
              </div>
            )}

            {/* Quick Profile Summary Card */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Settings2 className="w-4 h-4 text-orange-400" />
                <span>Текущая конфигурация RRO</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                    Target Package
                  </span>
                  <code className="text-orange-400 font-mono text-[11px] font-semibold break-all">
                    {activeProfile.targetPackage}
                  </code>
                </div>

                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                    Префикс файлов
                  </span>
                  <code className="text-neutral-300 font-mono text-[11px]">
                    {activeProfile.framePrefix}
                    {'0'.repeat(activeProfile.digitsFormat)}.png
                  </code>
                </div>

                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                    Спецификация
                  </span>
                  <span className="text-neutral-300 text-[11px]">
                    {activeProfile.description}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('github')}
                className="mt-1 w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-orange-400" />
                <span>Открыть инструкцию GitHub CI</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 px-4 text-center text-xs text-neutral-500">
        <p>
          OxygenOS Sauron FOD Animator • Полная совместимость с OnePlus (OOS 10 / 11 / 12 / 13 / 14 / 15) & ColorOS
        </p>
      </footer>
    </div>
  );
}

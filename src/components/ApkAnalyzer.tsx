import React, { useState, useRef } from 'react';
import { InspectedApkInfo, SauronConfig } from '../types';
import { inspectApkFile, replaceFramesInApk } from '../utils/apkInspector';
import { renderAllFrames } from '../utils/sauronRenderer';
import { UploadCloud, FileCode2, Image as ImageIcon, Play, Pause, CheckCircle2, AlertTriangle, Download, ArrowRight, Sparkles } from 'lucide-react';

interface ApkAnalyzerProps {
  config: SauronConfig;
  onApplyDetectedProfile: (info: InspectedApkInfo) => void;
}

export const ApkAnalyzer: React.FC<ApkAnalyzerProps> = ({
  config,
  onApplyDetectedProfile,
}) => {
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState<InspectedApkInfo | null>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isRepackaging, setIsRepackaging] = useState(false);
  const [repackageStatus, setRepackageStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.apk') && !file.name.endsWith('.zip')) {
      setErrorMsg('Пожалуйста, выберите файл с расширением .apk или .zip');
      return;
    }

    setErrorMsg(null);
    setApkFile(file);
    setIsAnalyzing(true);

    try {
      const info = await inspectApkFile(file);
      setInspectedInfo(info);
      onApplyDetectedProfile(info);
      setActiveFrameIndex(0);
      setIsPlayingOriginal(true);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Не удалось разобрать APK. Убедитесь, что файл не повреждён.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Original APK animation playback loop
  React.useEffect(() => {
    if (!isPlayingOriginal || !inspectedInfo || inspectedInfo.detectedFrames.length === 0) {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
      return;
    }

    animTimerRef.current = window.setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % inspectedInfo.detectedFrames.length);
    }, 1000 / 30);

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [isPlayingOriginal, inspectedInfo]);

  // Handle direct 1-click replacement in existing APK
  const handleReplaceInApk = async () => {
    if (!apkFile || !inspectedInfo) return;

    setIsRepackaging(true);
    setRepackageStatus('Генерация кадров Ока Саурона...');

    try {
      const framesCount = inspectedInfo.detectedFrames.length || config.frameCount;
      const sauronFrames = await renderAllFrames(
        { ...config, frameCount: framesCount },
        (cur, tot) => setRepackageStatus(`Отрисовка кадра ${cur}/${tot}...`)
      );

      setRepackageStatus('Внедрение кадров в структуру APK...');
      const sauronBlobs = sauronFrames.map((f) => f.blob);

      const modifiedApkBlob = await replaceFramesInApk(apkFile, sauronBlobs);

      // Trigger download
      setRepackageStatus('Скачивание готового файла...');
      const url = URL.createObjectURL(modifiedApkBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SauronEye_${apkFile.name.replace(/\.apk$/i, '')}_custom.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setRepackageStatus('Готово! Файл сохранён.');
      setTimeout(() => setRepackageStatus(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Ошибка при замене кадров в APK: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRepackaging(false);
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-950/50 border border-orange-700/60 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              Анализатор и Инжектор APK
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Живой парсинг
              </span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Загрузите найденный APK оверлея отпечатка, чтобы автоматически извлечь кадры и имя пакета
            </p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      {!inspectedInfo ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700 hover:border-orange-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-neutral-950/50 hover:bg-neutral-900/40 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,.zip"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-neutral-800 group-hover:bg-orange-950/60 border border-neutral-700 group-hover:border-orange-600/50 flex items-center justify-center mb-3 transition-colors">
            {isAnalyzing ? (
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7 text-neutral-400 group-hover:text-orange-400 transition-colors" />
            )}
          </div>

          <h4 className="text-white font-medium text-sm">
            {isAnalyzing ? 'Изучение структуры APK...' : 'Перетащите ваш существующий APK сюда'}
          </h4>
          <p className="text-neutral-400 text-xs mt-1 max-w-md">
            Либо нажмите для выбора файла с компьютера или телефона. Мы разберём оверлей, найдём префиксы кадров и целевой сервис OxygenOS.
          </p>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
            <span>Поддерживаются: .apk, .zip оверлеи</span>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                Файл APK
              </span>
              <div className="text-white text-xs font-mono font-medium truncate mt-0.5" title={inspectedInfo.fileName}>
                {inspectedInfo.fileName}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {(inspectedInfo.fileSize / (1024 * 1024)).toFixed(2)} MB • {inspectedInfo.rawFilesCount} файлов
              </span>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                Целевой сервис (Target)
              </span>
              <div className="text-orange-400 text-xs font-mono font-medium truncate mt-0.5">
                {inspectedInfo.targetPackage || 'com.oplus.uiengine'}
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Распознан оверлей OxygenOS
              </span>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                Найдено кадров
              </span>
              <div className="text-white text-xs font-mono font-medium mt-0.5">
                {inspectedInfo.detectedFrames.length} кадров
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Префикс: {inspectedInfo.framePrefix || 'anim_'}
              </span>
            </div>
          </div>

          {/* Original Frames Player & Visual Comparison */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-neutral-400 font-medium mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-neutral-500" /> Кадры из вашего APK
              </span>
              <div className="relative w-36 h-36 bg-black rounded-xl border border-neutral-800 p-2 flex items-center justify-center overflow-hidden">
                {inspectedInfo.detectedFrames[activeFrameIndex] ? (
                  <img
                    src={inspectedInfo.detectedFrames[activeFrameIndex].blobUrl}
                    alt="Original APK Frame"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-neutral-600 text-xs">Нет превью</div>
                )}
                <div className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-neutral-900/90 text-neutral-400 border border-neutral-800">
                  #{activeFrameIndex + 1}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setIsPlayingOriginal(!isPlayingOriginal)}
                  className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1"
                >
                  {isPlayingOriginal ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlayingOriginal ? 'Стоп' : 'Анимация'}
                </button>
                <span className="text-[10px] font-mono text-neutral-500">
                  {inspectedInfo.detectedFrames[activeFrameIndex]?.width || 0}x
                  {inspectedInfo.detectedFrames[activeFrameIndex]?.height || 0}
                </span>
              </div>
            </div>

            {/* Comparison Arrow */}
            <div className="hidden md:flex flex-col items-center text-neutral-500">
              <ArrowRight className="w-6 h-6 text-orange-500" />
              <span className="text-[10px] uppercase font-mono mt-1 text-orange-400 font-semibold">Замена</span>
            </div>

            {/* Direct Quick Actions */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/50">
                <h5 className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Успешная синхронизация со структурой!
                </h5>
                <p className="text-neutral-300 text-xs mt-1 leading-relaxed">
                  Мы считали все имена файлов ({inspectedInfo.detectedFrames[0]?.name || 'fod_anim_01.png'} ...) и настроили генератор Ока Саурона ровно под размер и количество кадров вашего оригинального оверлея.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleReplaceInApk}
                  disabled={isRepackaging}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isRepackaging ? repackageStatus : 'Внедрить Око Саурона прямо в этот APK'}
                </button>

                <button
                  onClick={() => {
                    setInspectedInfo(null);
                    setApkFile(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Выбрать другой APK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

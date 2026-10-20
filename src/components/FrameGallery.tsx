import React, { useEffect, useState } from 'react';
import { OxygenOSProfile, SauronConfig } from '../types';
import { formatFrameFileName } from '../utils/oxygenProfiles';
import { renderAllFrames } from '../utils/sauronRenderer';
import JSZip from 'jszip';
import { Grid, Download, Image as ImageIcon, Sparkles, ZoomIn, X } from 'lucide-react';

interface FrameGalleryProps {
  config: SauronConfig;
  profile: OxygenOSProfile;
}

export const FrameGallery: React.FC<FrameGalleryProps> = ({ config, profile }) => {
  const [frames, setFrames] = useState<{ frameIndex: number; dataUrl: string; blob: Blob }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<{ index: number; dataUrl: string; name: string } | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    renderAllFrames(config).then((rendered) => {
      if (!isCancelled) {
        setFrames(rendered);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [config]);

  const handleDownloadAllPngs = async () => {
    if (frames.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      for (let i = 0; i < frames.length; i++) {
        const fileName = formatFrameFileName(profile, i);
        zip.file(fileName, frames[i].blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SauronFOD_${config.theme}_${frames.length}frames_png.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании архива изображений');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleFrame = (frameIndex: number, blob: Blob) => {
    const fileName = formatFrameFileName(profile, frameIndex);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-orange-400 shadow-md">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              Покадровая Галерея ({frames.length} кадров)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-800">
                PNG с альфа-каналом
              </span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Все кадры сгенерированы с прозрачным фоном и именами под спецификацию: <code className="text-neutral-300 font-mono">{profile.framePrefix}*</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadAllPngs}
          disabled={isLoading || isZipping}
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4 text-orange-400" />
          {isZipping ? 'Упаковка ZIP...' : 'Скачать только кадры (.ZIP)'}
        </button>
      </div>

      {/* Grid of frames */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Генерация {config.frameCount} кадров анимации...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[460px] overflow-y-auto p-1">
          {frames.map((frame, idx) => {
            const fileName = formatFrameFileName(profile, idx);
            return (
              <div
                key={idx}
                onClick={() =>
                  setSelectedFrame({
                    index: idx,
                    dataUrl: frame.dataUrl,
                    name: fileName,
                  })
                }
                className="group relative bg-neutral-950 rounded-xl border border-neutral-800 hover:border-orange-500/80 p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-950/40"
              >
                <div className="relative w-full aspect-square flex items-center justify-center bg-black/60 rounded-lg overflow-hidden">
                  <img
                    src={frame.dataUrl}
                    alt={fileName}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                  </div>
                </div>

                <div className="w-full mt-1.5 text-center">
                  <span className="text-[9px] font-mono text-neutral-400 block truncate" title={fileName}>
                    #{idx + 1}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-600 block truncate">
                    {fileName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Zoom View */}
      {selectedFrame && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedFrame(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center border-b border-neutral-800 pb-2">
              <span className="text-white text-xs font-mono font-semibold">
                {selectedFrame.name}
              </span>
              <button
                onClick={() => setSelectedFrame(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-56 h-56 bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-center">
              <img
                src={selectedFrame.dataUrl}
                alt={selectedFrame.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="w-full flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Кадр: {selectedFrame.index + 1} / {config.frameCount}</span>
              <span>Формат: PNG-32 Alpha</span>
            </div>

            <button
              onClick={() => {
                const targetBlob = frames[selectedFrame.index]?.blob;
                if (targetBlob) {
                  handleDownloadSingleFrame(selectedFrame.index, targetBlob);
                }
              }}
              className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Скачать этот кадр
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

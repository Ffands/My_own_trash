import React, { useState } from 'react';
import { OxygenOSProfile, SauronConfig } from '../types';
import {
  PYTHON_GENERATOR_SCRIPT,
  BUILD_WORKFLOW_YML,
  SETTINGS_GRADLE,
  BUILD_GRADLE_ROOT,
  APP_BUILD_GRADLE,
  GRADLE_PROPERTIES,
  GITIGNORE,
  MANIFEST_XML,
  STRINGS_XML,
  generateReadme,
  buildCompleteProjectZip,
} from '../utils/repoPacker';
import { renderAllFrames } from '../utils/sauronRenderer';
import {
  Github,
  Copy,
  Check,
  Code2,
  FileText,
  FolderArchive,
  Terminal,
  Zap,
  Sparkles,
} from 'lucide-react';

interface GitHubActionsGuideProps {
  profile: OxygenOSProfile;
  config: SauronConfig;
}

type TabKey =
  | 'python'
  | 'workflow'
  | 'app_gradle'
  | 'manifest'
  | 'strings'
  | 'settings_gradle'
  | 'root_gradle'
  | 'gradle_props'
  | 'gitignore'
  | 'readme';

export const GitHubActionsGuide: React.FC<GitHubActionsGuideProps> = ({
  profile,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('python');
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ pct: number; status: string } | null>(null);

  const fileMap: Record<TabKey, { name: string; content: string; desc: string }> = {
    python: {
      name: 'generate_assets.py',
      content: PYTHON_GENERATOR_SCRIPT,
      desc: 'Автономный генератор 60 прозрачных кадров Ока Саурона (Pillow), иконки и звука',
    },
    workflow: {
      name: '.github/workflows/build.yml',
      content: BUILD_WORKFLOW_YML,
      desc: 'Воркфлоу GitHub Actions: запуск Python, сборка Gradle, подпись testkey и выгрузка APK',
    },
    app_gradle: {
      name: 'app/build.gradle',
      content: APP_BUILD_GRADLE,
      desc: 'Модуль RRO-оверлея без Java-классов, с включённой v1/v2 подписью debug keystore',
    },
    manifest: {
      name: 'app/src/main/AndroidManifest.xml',
      content: MANIFEST_XML,
      desc: 'Манифест оверлея с targetPackage="com.oplus.pantanal.ums" и priority="1"',
    },
    strings: {
      name: 'app/src/main/res/values/strings.xml',
      content: STRINGS_XML,
      desc: 'Название стиля анимации в настройках OxygenOS (@string/app_name_78)',
    },
    settings_gradle: {
      name: 'settings.gradle',
      content: SETTINGS_GRADLE,
      desc: 'Подключение репозиториев Google/MavenCentral и модуля :app',
    },
    root_gradle: {
      name: 'build.gradle',
      content: BUILD_GRADLE_ROOT,
      desc: 'Корневой Gradle конфиг плагина com.android.application',
    },
    gradle_props: {
      name: 'gradle.properties',
      content: GRADLE_PROPERTIES,
      desc: 'Параметры памяти JVM и AndroidX',
    },
    gitignore: {
      name: '.gitignore',
      content: GITIGNORE,
      desc: 'Исключения сборки и кэшей Android SDK',
    },
    readme: {
      name: 'README.md',
      content: generateReadme(profile),
      desc: 'Инструкция по запуску облачной сборки за 1 минуту',
    },
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadTurnkeyZip = async () => {
    setIsExporting(true);
    setExportProgress({ pct: 5, status: 'Рендеринг кадров пламени...' });

    try {
      const frames = await renderAllFrames(
        { ...config, frameCount: 60 },
        (current, total) => {
          const pct = Math.round((current / total) * 30);
          setExportProgress({ pct, status: `Отрисовка кадра ${current}/${total}...` });
        }
      );

      const zipBlob = await buildCompleteProjectZip(
        frames,
        profile,
        config,
        (pct, status) => setExportProgress({ pct, status })
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SauronFOD_Turnkey_Repository.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error(err);
      alert('Ошибка при генерации архива: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-950/60 border border-orange-700/60 flex items-center justify-center text-orange-400 shadow-md">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              Автономный Репозиторий Под Ключ
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                CI/CD + Python Pillow
              </span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Чистый RRO-оверлей без Java-кода. GitHub Actions сам генерирует ассеты и собирает подписанный APK.
            </p>
          </div>
        </div>

        {/* 1-Click Complete Turnkey Repo Download Button */}
        <button
          onClick={handleDownloadTurnkeyZip}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-60 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FolderArchive className="w-4 h-4" />
          {isExporting ? (
            <span>{exportProgress?.status || 'Сборка...'} ({exportProgress?.pct}%)</span>
          ) : (
            <span>Скачать автономный репозиторий (.ZIP)</span>
          )}
        </button>
      </div>

      {/* Highlights / Features Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
          <span className="text-orange-400 text-xs font-semibold flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 100% Автономность
          </span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Скрипт <code className="text-neutral-300 font-mono">generate_assets.py</code> запускается в GitHub Actions и сам рендерит 60 кадров Ока Саурона через Pillow.
          </p>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
          <span className="text-cyan-400 text-xs font-semibold flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5" /> Чистый RRO Overlay
          </span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Ноль строчек Java/Kotlin. Пакет переопределяет ресурсы <code className="text-neutral-300 font-mono">com.oplus.pantanal.ums</code> без изменения системного софта.
          </p>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 mb-1">
            <Check className="w-3.5 h-3.5" /> Готовая подпись v1/v2
          </span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Воркфлоу генерирует тестовый keystore и подписывает APK обеими схемами v1 и v2 для бесшовной установки.
          </p>
        </div>
      </div>

      {/* File Structure Tree */}
      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
        <div className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-orange-400" /> Структура файлов репозитория:
        </div>
        <pre className="text-[11px] font-mono text-neutral-400 leading-tight overflow-x-auto p-2 bg-black/60 rounded-lg">
{`├── .github/
│   └── workflows/
│       └── build.yml               # Автономный GitHub Actions CI/CD
├── app/
│   ├── build.gradle                # Настройки сборки RRO-оверлея (без кода, v1/v2 подпись)
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml # <overlay targetPackage="com.oplus.pantanal.ums">
│           └── res/
│               ├── drawable-nodpi/ # 60 кадров (kgd_fingerprint_element_0..59.png)
│               ├── raw/            # front_finger_sound.ogg
│               └── values/
│                   └── strings.xml # app_name_78 ("Eye of Sauron")
├── generate_assets.py              # Автономный генератор ассетов на Pillow
├── build.gradle                    # Корневой Gradle
├── settings.gradle                 # Подключение :app
├── gradle.properties               # Опции JVM
├── .gitignore                      # Исключения
└── README.md                       # Полная инструкция`}
        </pre>
      </div>

      {/* Code Viewer with Tabs */}
      <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-3 py-2 gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {(Object.keys(fileMap) as TabKey[]).map((key) => {
              const item = fileMap[key];
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white bg-neutral-800/60'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Copy Button */}
          <button
            onClick={() => handleCopy(fileMap[activeTab].content, activeTab)}
            className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Скопировать файл
              </>
            )}
          </button>
        </div>

        {/* File Description */}
        <div className="px-4 py-2 bg-neutral-900/30 border-b border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
          <span className="font-mono text-orange-400">{fileMap[activeTab].name}</span>
          <span className="text-[11px] text-neutral-500">{fileMap[activeTab].desc}</span>
        </div>

        {/* Code Content */}
        <div className="p-4 max-h-96 overflow-y-auto text-xs font-mono text-neutral-300 leading-relaxed bg-black/90">
          <pre className="whitespace-pre overflow-x-auto">
            {fileMap[activeTab].content}
          </pre>
        </div>
      </div>
    </div>
  );
};

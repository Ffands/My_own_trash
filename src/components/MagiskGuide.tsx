import React, { useState } from 'react';
import { OxygenOSProfile, SauronConfig } from '../types';
import { ShieldAlert, Terminal, Smartphone, Copy, Check, ChevronDown, ChevronRight, Zap } from 'lucide-react';

interface MagiskGuideProps {
  profile: OxygenOSProfile;
  config: SauronConfig;
}

export const MagiskGuide: React.FC<MagiskGuideProps> = ({ profile }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const adbEnableCmd = `adb shell cmd overlay enable com.sauron.fod.oxygenos.overlay`;
  const adbListCmd = `adb shell cmd overlay list | grep sauron`;
  const adbDisableCmd = `adb shell cmd overlay disable com.sauron.fod.oxygenos.overlay`;

  const faqs = [
    {
      q: 'Как работает подмена отпечатка пальца на OxygenOS?',
      a: `В Android и прошивках OnePlus (OxygenOS / ColorOS) анимации сканера хранятся внутри системного ресурса или пакета (${profile.targetPackage}). Система поддерживает механизм RRO (Runtime Resource Overlay). Оверлей заменяет ресурсы анимации (последовательность PNG картинок) на лету, не модифицируя оригинальный SystemUI или прошивку.`,
    },
    {
      q: 'Почему GitHub Actions — идеальный способ сборки?',
      a: `Для создания APK оверлея требуется скомпилировать ресурсы через Android SDK и утилиту aapt2, а затем подписать APK цифровой подписью. Делать это на обычном компьютере требует гигабайты Android SDK. GitHub Actions запускает облачный Linux-сервер и компилирует всё автоматически за 40 секунд по нашему скрипту .github/workflows/build-apk.yml!`,
    },
    {
      q: 'Что делать, если у меня уже есть рабочий APK с другой анимацией?',
      a: `Используйте вкладку «Инспектор APK» прямо в этом приложении! Загрузите ваш APK — приложение само достанет имена файлов, заменит их на кадры Ока Саурона и сохранит обновлённый файл. Либо на телефоне через приложение MT Manager откройте APK, перейдите в папку res/drawable-nodpi/ и замените картинки файлами из скачанного архива кадров.`,
    },
    {
      q: 'Будет ли работать датчик отпечатка пальца?',
      a: `Да! Оптические датчики отпечатка под экраном (OnePlus 7-12) считывают папиллярные узоры светом. В настройках аниматора вы можете включить опцию «Зелёный сенсор», которая добавит правильную подсветку по центру для надёжного и быстрого распознавания.`,
    },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shadow-md">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base flex items-center gap-2">
            Инструкции по установке (Magisk, Root, ADB, MT Manager)
          </h3>
          <p className="text-neutral-400 text-xs">
            Способы применения оверлея на смартфонах OnePlus с любой версией OxygenOS
          </p>
        </div>
      </div>

      {/* Methods Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Method 1: Root */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Способ 1: Magisk / Root
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% совместимо
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Модуль монтирует APK в <code className="text-neutral-300 font-mono">/system/product/overlay/</code> без проверки системных подписей. Достаточно прошить ZIP из GitHub Actions в Magisk или KernelSU и перезагрузиться.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
            Требуется: Magisk / KernelSU / APatch
          </div>
        </div>

        {/* Method 2: ADB without Root */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Способ 2: Без Root (ADB)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                Без потери гарантии
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Установите собранный APK на телефон, подключите ПК по кабелю с отладкой по USB и активируйте командой:
            </p>
            <div className="mt-2 bg-black p-2 rounded-lg border border-neutral-800 flex items-center justify-between">
              <code className="text-[10px] font-mono text-cyan-300 truncate">
                cmd overlay enable ...
              </code>
              <button
                onClick={() => copyText(adbEnableCmd, 'cmd1')}
                className="text-neutral-400 hover:text-white p-1"
                title="Скопировать команду"
              >
                {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
            Работает через Shizuku или ПК
          </div>
        </div>

        {/* Method 3: MT Manager */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Способ 3: MT Manager
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                Прямо на смартфоне
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Если у вас уже стоит рабочий APK со старой анимацией — откройте его в MT Manager, замените файлы в <code className="text-neutral-300 font-mono">res/drawable-nodpi/</code> на кадры Саурона, подпишите и установите поверх.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
            Удобно для быстрой модификации
          </div>
        </div>
      </div>

      {/* Useful ADB Commands Terminal Snippet */}
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
        <span className="text-xs font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-orange-400" /> Полезные команды ADB для управления оверлеем
        </span>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between bg-black/80 px-3 py-2 rounded-lg border border-neutral-800/80">
            <span className="text-neutral-300">
              <span className="text-neutral-500"># Проверить статус оверлея</span><br />
              {adbListCmd}
            </span>
            <button
              onClick={() => copyText(adbListCmd, 'cmd-list')}
              className="text-neutral-400 hover:text-white p-1"
            >
              {copiedCmd === 'cmd-list' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/80 px-3 py-2 rounded-lg border border-neutral-800/80">
            <span className="text-neutral-300">
              <span className="text-neutral-500"># Включить анимацию Ока Саурона</span><br />
              {adbEnableCmd}
            </span>
            <button
              onClick={() => copyText(adbEnableCmd, 'cmd-enable')}
              className="text-neutral-400 hover:text-white p-1"
            >
              {copiedCmd === 'cmd-enable' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/80 px-3 py-2 rounded-lg border border-neutral-800/80">
            <span className="text-neutral-300">
              <span className="text-neutral-500"># Отключить (вернуть стандартную)</span><br />
              {adbDisableCmd}
            </span>
            <button
              onClick={() => copyText(adbDisableCmd, 'cmd-disable')}
              className="text-neutral-400 hover:text-white p-1"
            >
              {copiedCmd === 'cmd-disable' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Частые вопросы и нюансы работы
        </h4>
        {faqs.map((faq, i) => {
          const isOpen = activeFaq === i;
          return (
            <div
              key={i}
              className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : i)}
                className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-medium text-neutral-200 hover:text-white transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronDown className="w-4 h-4 text-orange-400" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

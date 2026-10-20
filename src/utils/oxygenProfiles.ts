import { OxygenOSProfile } from '../types';

export const OXYGEN_OS_PROFILES: OxygenOSProfile[] = [
  {
    id: 'oos_pantanal_ums',
    name: 'OxygenOS / ColorOS Pantanal (com.oplus.pantanal.ums)',
    version: 'Android 13 / 14 / 15 (Pantanal Service)',
    targetPackage: 'com.oplus.pantanal.ums',
    framePrefix: 'kgd_fingerprint_element_',
    frameExtension: '.png',
    digitsFormat: 1, // 0, 1, 2 ... 59 (no zero-padding or single digit)
    indexStartsAt: 0,
    description: 'Целевой сервис OnePlus/ColorOS Pantanal FOD. 60 кадров kgd_fingerprint_element_0.png - kgd_fingerprint_element_59.png',
    category: 'oos13_14_15',
  },
  {
    id: 'oos13_14_15_oplus',
    name: 'OxygenOS 13 / 14 / 15 (com.oplus.uiengine)',
    version: 'Android 13 / 14 / 15 (UI Engine Base)',
    targetPackage: 'com.oplus.uiengine',
    framePrefix: 'fingerprint_recognizing_anim_',
    frameExtension: '.png',
    digitsFormat: 5, // 00000, 00001, ...
    indexStartsAt: 0,
    description: 'Стандарт для актуальных OnePlus 10 Pro, 11, 12, 12R, Nord 3 и Open на OxygenOS 13-15.',
    category: 'oos13_14_15',
  },
  {
    id: 'oos13_14_systemui',
    name: 'OxygenOS 13 / 14 SystemUI Alternative',
    version: 'Android 13 / 14',
    targetPackage: 'com.android.systemui',
    framePrefix: 'cust_fod_anim_',
    frameExtension: '.png',
    digitsFormat: 2, // 01, 02, ...
    indexStartsAt: 1,
    description: 'Альтернативная привязка через системный UI для прошивок ColorOS/OxygenOS с кастомными оверлеями.',
    category: 'oos13_14_15',
  },
  {
    id: 'oos12_coloros',
    name: 'OxygenOS 12 (OnePlus 8T / 9 / 9 Pro / 10 Pro)',
    version: 'Android 12',
    targetPackage: 'com.oplus.uiengine',
    framePrefix: 'ops_fingerprint_animation_',
    frameExtension: '.png',
    digitsFormat: 3, // 001, 002, ...
    indexStartsAt: 1,
    description: 'Переходная ветка OxygenOS 12 с базой ColorOS 12.',
    category: 'oos12',
  },
  {
    id: 'oos11_classic',
    name: 'OxygenOS 10 / 11 Classic (OnePlus 7 / 7T / 8 / 8 Pro / 9)',
    version: 'Android 10 / 11 (Pure OOS)',
    targetPackage: 'net.oneplus.commonresources',
    framePrefix: 'ops_fingerprint_animation_',
    frameExtension: '.png',
    digitsFormat: 2, // 01, 02, ...
    indexStartsAt: 1,
    description: 'Классическая OxygenOS 11 (до объединения с кодовой базой ColorOS).',
    category: 'oos11',
  },
];

/**
 * Format a frame number with zero-padding
 */
export function formatFrameFileName(
  profile: OxygenOSProfile,
  index: number
): string {
  const actualNumber = profile.indexStartsAt + index;
  const padded = String(actualNumber).padStart(profile.digitsFormat, '0');
  return `${profile.framePrefix}${padded}${profile.frameExtension}`;
}

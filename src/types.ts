export type SauronTheme = 'mordor' | 'ring' | 'nazgul' | 'void' | 'cyber';

export interface SauronConfig {
  theme: SauronTheme;
  frameCount: number; // 30, 45, 60
  resolution: number; // e.g. 300, 400, 500
  fps: number; // 30, 60
  flameIntensity: number; // 0.5 - 2.0
  pupilDilation: number; // 0.2 - 1.5
  ringRunes: boolean;
  emberSparks: boolean;
  sensorGreenCore: boolean; // for optical fingerprint sensors reading light
  smokeVeil: boolean;
}

export interface OxygenOSProfile {
  id: string;
  name: string;
  version: string;
  targetPackage: string;
  framePrefix: string;
  frameExtension: string;
  digitsFormat: number; // e.g. 2 for 01, 5 for 00001
  indexStartsAt: number; // 0 or 1
  description: string;
  category: 'oos11' | 'oos12' | 'oos13_14_15' | 'custom';
}

export interface InspectedApkInfo {
  fileName: string;
  fileSize: number;
  targetPackage?: string;
  detectedFrames: {
    name: string;
    blobUrl: string;
    width: number;
    height: number;
    size: number;
  }[];
  framePrefix?: string;
  isOverlay: boolean;
  rawFilesCount: number;
}

import JSZip from 'jszip';
import { InspectedApkInfo } from '../types';

/**
 * Inspect an uploaded APK file, extracting metadata and drawable frames
 */
export async function inspectApkFile(file: File): Promise<InspectedApkInfo> {
  const zip = await JSZip.loadAsync(file);
  const detectedFrames: InspectedApkInfo['detectedFrames'] = [];
  let detectedTargetPackage: string | undefined = undefined;
  let detectedFramePrefix: string | undefined = undefined;
  let isOverlay = false;

  // 1. Check AndroidManifest.xml for targetPackage / package name
  const manifestFile = zip.file('AndroidManifest.xml');
  if (manifestFile) {
    try {
      const manifestBytes = await manifestFile.async('uint8array');
      const manifestText = new TextDecoder('utf-8', { fatal: false }).decode(
        manifestBytes
      );

      // Search for package or targetPackage attributes in manifest strings table
      const targetMatch = manifestText.match(/targetPackage[^\x00-\x1F]*?([a-zA-Z0-9._]+)/);
      if (targetMatch && targetMatch[1]) {
        detectedTargetPackage = targetMatch[1];
        isOverlay = true;
      } else {
        // Look for common OxygenOS packages in the binary string pool
        const knownTargets = [
          'com.oplus.uiengine',
          'com.oplus.fingerprintservice',
          'com.android.systemui',
          'net.oneplus.commonresources',
          'net.oneplus.launcher',
          'com.oneplus.fingerprintservice',
        ];
        for (const target of knownTargets) {
          if (manifestText.includes(target)) {
            detectedTargetPackage = target;
            isOverlay = true;
            break;
          }
        }
      }
    } catch {
      // ignore binary parse quirks
    }
  }

  // 2. Scan all files for images (PNG, WebP, JPG)
  const imageEntries: { path: string; name: string; file: JSZip.JSZipObject }[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const lower = relativePath.toLowerCase();
      if (
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.jpg')
      ) {
        const fileName = relativePath.split('/').pop() || relativePath;
        imageEntries.push({ path: relativePath, name: fileName, file: zipEntry });
      }
    }
  });

  // Sort images numerically if they have numbers in names
  imageEntries.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Filter for animation sequences (names with numbers, or inside drawable directories)
  const animCandidates = imageEntries.filter((item) => {
    const isDrawable =
      item.path.includes('res/drawable') || item.path.includes('res/raw');
    const hasDigits = /\d+/.test(item.name);
    return isDrawable || hasDigits;
  });

  const targetList = animCandidates.length > 0 ? animCandidates : imageEntries;

  // Process frames to get Blob URLs and dimensions
  for (const item of targetList.slice(0, 80)) {
    try {
      const blob = await item.file.async('blob');
      const blobUrl = URL.createObjectURL(blob);

      // Detect dimensions
      const { width, height } = await new Promise<{ width: number; height: number }>(
        (resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = blobUrl;
        }
      );

      detectedFrames.push({
        name: item.name,
        blobUrl,
        width,
        height,
        size: blob.size,
      });

      if (!detectedFramePrefix) {
        const prefixMatch = item.name.match(/^([a-zA-Z_-]+)\d+/);
        if (prefixMatch) {
          detectedFramePrefix = prefixMatch[1];
        }
      }
    } catch {
      // skip unreadable
    }
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    targetPackage: detectedTargetPackage,
    detectedFrames,
    framePrefix: detectedFramePrefix,
    isOverlay,
    rawFilesCount: Object.keys(zip.files).length,
  };
}

/**
 * Replace images in an existing APK with new Sauron frames and produce a new APK file
 */
export async function replaceFramesInApk(
  originalApkFile: File,
  sauronBlobs: Blob[]
): Promise<Blob> {
  const zip = await JSZip.loadAsync(originalApkFile);

  // Find all existing frame paths in alphabetical order
  const framePaths: string[] = [];
  zip.forEach((path, entry) => {
    if (!entry.dir && (path.endsWith('.png') || path.endsWith('.webp'))) {
      if (path.includes('drawable') || /\d+/.test(path)) {
        framePaths.push(path);
      }
    }
  });

  framePaths.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Overwrite matching paths
  for (let i = 0; i < Math.min(framePaths.length, sauronBlobs.length); i++) {
    const p = framePaths[i];
    const newBlob = sauronBlobs[i];
    const arrayBuffer = await newBlob.arrayBuffer();
    zip.file(p, arrayBuffer);
  }

  // Generate new APK zip
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.android.package-archive',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

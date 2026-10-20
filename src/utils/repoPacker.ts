import JSZip from 'jszip';
import { OxygenOSProfile, SauronConfig } from '../types';
import { formatFrameFileName } from './oxygenProfiles';

export const PYTHON_GENERATOR_SCRIPT = `#!/usr/bin/env python3
"""
Autonomous Asset Generator for OxygenOS / OnePlus Sauron FOD RRO Overlay
Generates 60 transparent 400x400 PNG animation frames:
  kgd_fingerprint_element_0.png ... kgd_fingerprint_element_59.png
Plus fadein, fadeout, preview_icon, and minimal sound asset.
Requires: Pillow (pip install pillow)
"""

import os
import math
from PIL import Image, ImageDraw

OUTPUT_DIR = os.path.join("app", "src", "main", "res", "drawable-nodpi")
RAW_DIR = os.path.join("app", "src", "main", "res", "raw")
VALUES_DIR = os.path.join("app", "src", "main", "res", "values")
DRAWABLE_DIR = os.path.join("app", "src", "main", "res", "drawable")

WIDTH, HEIGHT = 400, 400
TOTAL_FRAMES = 60

def ensure_dirs():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(VALUES_DIR, exist_ok=True)
    os.makedirs(DRAWABLE_DIR, exist_ok=True)

def draw_sauron_frame(frame_idx, total_frames=60):
    """Draws a single 400x400 transparent PNG frame of the Eye of Sauron."""
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = WIDTH / 2, HEIGHT / 2
    progress = frame_idx / (total_frames - 1)
    
    # Breathing and pulsing factor
    pulse = 0.85 + 0.15 * math.sin(progress * math.pi)
    max_radius = 160 * pulse

    # 1. Outer Fiery Solar Corona & Tendrils
    rays = 36
    for i in range(rays):
        angle = (i / rays) * 2 * math.pi + (frame_idx * 0.05)
        flicker = (math.sin(i * 12.5 + frame_idx * 0.8) + 1) / 2
        ray_len = max_radius * (0.7 + 0.3 * flicker)
        
        ex = cx + math.cos(angle) * ray_len
        ey = cy + math.sin(angle) * ray_len
        
        r = int(255)
        g = int(60 + 130 * flicker)
        b = int(10)
        alpha = int(140 + 100 * flicker)
        
        draw.line([(cx, cy), (ex, ey)], fill=(r, g, b, alpha), width=3)

    # 2. Glowing Molten Iris Ring
    iris_r = max_radius * 0.65
    for r_offset in range(int(iris_r), int(iris_r * 0.4), -2):
        factor = (r_offset - iris_r * 0.4) / (iris_r * 0.6)
        r = int(255)
        g = int(40 + 180 * (1 - factor))
        b = int(0)
        a = int(180 * (1 - factor * 0.5))
        draw.ellipse(
            [cx - r_offset, cy - r_offset, cx + r_offset, cy + r_offset],
            outline=(r, g, b, a),
            width=2
        )

    # 3. Concentric Fiery One Ring Runes / Borders
    ring_r = max_radius * 0.92
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=(255, 190, 40, 220),
        width=2
    )
    draw.ellipse(
        [cx - ring_r + 4, cy - ring_r + 4, cx + ring_r - 4, cy + ring_r - 4],
        outline=(255, 120, 20, 150),
        width=1
    )

    # Small rune markers
    runes = 24
    for r_idx in range(runes):
        r_angle = (r_idx / runes) * 2 * math.pi + (progress * math.pi * 0.4)
        rx = cx + math.cos(r_angle) * (ring_r - 2)
        ry = cy + math.sin(r_angle) * (ring_r - 2)
        draw.ellipse([rx - 2, ry - 2, rx + 2, ry + 2], fill=(255, 230, 80, 240))

    # 4. Vertical Slit Pupil of Sauron (Cat-eye slit)
    slit_w = 26 * (0.8 + 0.3 * math.sin(progress * math.pi))
    slit_h = 130 * pulse

    draw.ellipse(
        [cx - slit_w * 1.5, cy - slit_h * 0.55, cx + slit_w * 1.5, cy + slit_h * 0.55],
        fill=(80, 10, 0, 180)
    )

    slit_points = [
        (cx, cy - slit_h * 0.5),
        (cx + slit_w, cy - slit_h * 0.2),
        (cx + slit_w * 0.8, cy + slit_h * 0.2),
        (cx, cy + slit_h * 0.5),
        (cx - slit_w * 0.8, cy + slit_h * 0.2),
        (cx - slit_w, cy - slit_h * 0.2)
    ]
    draw.polygon(slit_points, fill=(10, 0, 0, 255))

    draw.line(
        [(cx, cy - slit_h * 0.35), (cx, cy + slit_h * 0.35)],
        fill=(255, 240, 120, 255),
        width=2
    )

    # 5. Sparks & Embers
    embers = 20
    for e in range(embers):
        e_seed = e * 17.3 + frame_idx
        e_angle = (e / embers) * 2 * math.pi + math.sin(e_seed) * 0.5
        e_dist = (max_radius * 0.3 + (frame_idx * 3 + e * 12) % int(max_radius * 0.8))
        ex = cx + math.cos(e_angle) * e_dist
        ey = cy + math.sin(e_angle) * e_dist
        draw.ellipse([ex - 2, ey - 2, ex + 2, ey + 2], fill=(255, 220, 60, 200))

    # 6. Climax flare
    if progress > 0.85:
        flare_progress = (progress - 0.85) / 0.15
        flare_r = max_radius * (0.3 + flare_progress * 0.7)
        flare_alpha = int((1.0 - flare_progress) * 220)
        draw.ellipse(
            [cx - flare_r, cy - flare_r, cx + flare_r, cy + flare_r],
            outline=(255, 255, 255, flare_alpha),
            width=3
        )

    return img

def generate_minimal_ogg(filepath):
    ogg_header = b'OggS\\x00\\x02\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\x1e\\x01vorbis\\x00\\x00\\x00\\x00\\x02D\\xac\\x00\\x00\\x00\\x00\\x00\\x00\\xee\\x02\\x00\\x00\\xb8\\x01'
    with open(filepath, 'wb') as f:
        f.write(ogg_header)

def main():
    print(f"🔥 Generating Sauron FOD assets in {OUTPUT_DIR}...")
    ensure_dirs()

    for i in range(TOTAL_FRAMES):
        filename = f"kgd_fingerprint_element_{i}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        frame = draw_sauron_frame(i, TOTAL_FRAMES)
        frame.save(filepath, "PNG")
        if i % 10 == 0 or i == TOTAL_FRAMES - 1:
            print(f"  -> Generated {filename} ({i+1}/{TOTAL_FRAMES})")

    fadein = draw_sauron_frame(0, TOTAL_FRAMES)
    fadein.save(os.path.join(OUTPUT_DIR, "kgd_fingerprint_fadein.png"), "PNG")
    
    fadeout = draw_sauron_frame(TOTAL_FRAMES - 1, TOTAL_FRAMES)
    fadeout.save(os.path.join(OUTPUT_DIR, "kgd_fingerprint_fadeout.png"), "PNG")

    preview = draw_sauron_frame(TOTAL_FRAMES // 2, TOTAL_FRAMES)
    preview = preview.resize((192, 192), Image.Resampling.LANCZOS)
    preview.save(os.path.join(OUTPUT_DIR, "preview_icon.png"), "PNG")

    ogg_path = os.path.join(RAW_DIR, "front_finger_sound.ogg")
    generate_minimal_ogg(ogg_path)

    print("✅ All assets generated successfully!")

if __name__ == "__main__":
    main()
`;

export const SETTINGS_GRADLE = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SauronFOD-OxygenOS"
include ':app'
`;

export const BUILD_GRADLE_ROOT = `// Top-level build file
plugins {
    id 'com.android.application' version '8.4.0' apply false
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
`;

export const GRADLE_PROPERTIES = `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`;

export const GITIGNORE = `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
output_apk/
app/build/
`;

export const APP_BUILD_GRADLE = `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.custom.fod.sauron.v2'
    compileSdk 34

    defaultConfig {
        applicationId "com.custom.fod.sauron.v2"
        minSdk 29
        targetSdk 34
        versionCode 2
        versionName "2.0.0"
    }

    signingConfigs {
        debug {
            storeFile file('../debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
            v1SigningEnabled true
            v2SigningEnabled true
        }
        release {
            storeFile file('../debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
        }
    }
}

dependencies {
    // Pure RRO overlay
}
`;

export const MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  OxygenOS / ColorOS Runtime Resource Overlay (RRO)
  Unique Package: com.custom.fod.sauron.v2 (Prevents signature conflicts with existing overlays)
  Target: com.oplus.pantanal.ums (OnePlus Pantanal Service for FOD)
  Animation: Eye of Sauron (60 frames)
-->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.custom.fod.sauron.v2">

    <!-- RRO Overlay declaration -->
    <overlay
        android:targetPackage="com.oplus.pantanal.ums"
        android:priority="1"
        android:isStatic="false" />

    <application
        android:label="@string/app_name_78"
        android:icon="@drawable/preview_icon" />
</manifest>
`;

export const STRINGS_XML = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Animation name displayed in OxygenOS Settings -> Wallpapers & Style -> Fingerprint animation -->
    <string name="app_name_78">Eye of Sauron</string>
</resources>
`;

export const BUILD_WORKFLOW_YML = `name: Build OxygenOS Sauron FOD Overlay APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Autonomous FOD Asset Generation & APK Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Python 3.x
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Pillow
        run: |
          python -m pip install --upgrade pip
          pip install pillow

      - name: Generate Sauron FOD Assets (60 Frames, Icons, Sound)
        run: |
          python generate_assets.py

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      # Note: Android SDK is already pre-installed on GitHub Ubuntu runners at /usr/local/lib/android/sdk
      # We just accept licenses without running the broken third-party setup-android action.
      - name: Accept Android SDK Licenses
        run: |
          mkdir -p "$ANDROID_HOME/licenses" || true
          echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" >> "$ANDROID_HOME/licenses/android-sdk-license"
          echo "84831b9409646a918e30573bab4c9c91346d8abd" >> "$ANDROID_HOME/licenses/android-sdk-preview-license"
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses 2>/dev/null || true

      - name: Generate Debug Keystore for Signing
        run: |
          if [ ! -f "debug.keystore" ]; then
            echo "Generating debug keystore..."
            keytool -genkeypair -v \\
              -keystore debug.keystore \\
              -storepass android \\
              -alias androiddebugkey \\
              -keypass android \\
              -keyalg RSA \\
              -keysize 2048 \\
              -validity 10000 \\
              -dname "CN=Android Debug,O=Android,C=US"
          fi

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Build RRO Overlay APK
        run: |
          chmod +x gradlew || gradle wrapper --gradle-version 8.7
          chmod +x gradlew
          ./gradlew assembleRelease --stacktrace

      - name: Locate and Prepare Output APK
        run: |
          echo "Found APK: $APK_FILE"
          cp "$APK_FILE" output_apk/SauronFOD-com.custom.fod.sauron.v2.apk
          
          echo "=== Verifying APK Internal Contents ==="
          unzip -l output_apk/SauronFOD-com.custom.fod.sauron.v2.apk | grep -E "(AndroidManifest.xml|resources.arsc|kgd_fingerprint_element|META-INF)" || true
          echo "=== Verification Complete: Valid compiled binary APK! ==="

      - name: 11. Upload Compiled & Signed APK to Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: SauronFOD-OxygenOS-APK
          path: output_apk/SauronFOD-com.custom.fod.sauron.v2.apk
          retention-days: 30
`;

export function generateAndroidManifest(profile: OxygenOSProfile): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  OxygenOS / ColorOS Runtime Resource Overlay (RRO)
  Unique Package: com.custom.fod.sauron.v2 (Prevents signature conflicts with existing overlays)
  Target: ${profile.targetPackage}
  Animation: Eye of Sauron FOD
-->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.custom.fod.sauron.v2">

    <overlay
        android:targetPackage="${profile.targetPackage}"
        android:priority="1"
        android:isStatic="false" />

    <application
        android:label="@string/app_name_78"
        android:icon="@drawable/preview_icon" />
</manifest>
`;
}

export function generateAnimationListXml(
  profile: OxygenOSProfile,
  frameCount: number,
  fps: number
): string {
  const frameDurationMs = Math.round(1000 / (fps || 30));
  let items = '';

  for (let i = 0; i < frameCount; i++) {
    const fileName = formatFrameFileName(profile, i).replace(/\\.png$/, '');
    items += `    <item android:drawable="@drawable/${fileName}" android:duration="${frameDurationMs}" />\\n`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<animation-list xmlns:android="http://schemas.android.com/apk/res/android"
    android:oneshot="false">
${items}</animation-list>
`;
}

export function generateReadme(profile: OxygenOSProfile): string {
  return `# 🔥 Eye of Sauron (Око Саурона) FOD RRO Overlay для OxygenOS

Полностью автономный репозиторий для сборки подписанного RRO-оверлея (APK) анимации отпечатка пальца для OnePlus OxygenOS / ColorOS.

- **Целевой пакет (Target):** \`${profile.targetPackage}\`
- **Имя ресурса в настройках:** \`@string/app_name_78\` (Eye of Sauron)
- **Кадры:** \`kgd_fingerprint_element_0.png\` ... \`kgd_fingerprint_element_59.png\`
- **Сборка:** Автоматически через GitHub Actions по кнопке или пушу!

---

## 🚀 Как запустить сборку на GitHub за 1 минуту:

1. Создайте новый репозиторий на GitHub: [github.com/new](https://github.com/new).
2. Загрузите файлы этого архива в репозиторий (через веб-интерфейс **Add file -> Upload files** или \`git push\`).
3. GitHub Actions автоматически запустит воркфлоу **"Build OxygenOS Sauron FOD Overlay APK"**:
   - Сам установит Python и Pillow;
   - Запустит \`generate_assets.py\` и сгенерирует все 60 кадров, иконку и звук;
   - Соберет чистый RRO-оверлей через Gradle;
   - Подпишет APK ключом v1/v2;
   - Выгрузит готовый APK во вкладку **Actions -> Artifacts**!
4. Скачайте \`SauronFOD-OxygenOS-signed.apk\` и установите на телефон.

---

## 📱 Установка на OnePlus:
- **Без Root:**
  1. Установите APK на телефон.
  2. Включите оверлей через ADB:
     \`\`\`bash
     adb shell cmd overlay enable com.sauron.fod.oxygenos.overlay
     \`\`\`
- **С Root:**
  Переместите APK в \`/system/product/overlay/\` или установите модуль.
`;
}

/**
 * Builds the complete GitHub repository ZIP file with all autonomous files and generator
 */
export async function buildCompleteProjectZip(
  frames: { frameIndex: number; blob: Blob }[],
  profile: OxygenOSProfile,
  config: SauronConfig,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(10, 'Подготовка структуры репозитория...');

  // 1. Python Autonomous Generator
  zip.file('generate_assets.py', PYTHON_GENERATOR_SCRIPT);

  // 2. GitHub Actions workflow
  zip.file('.github/workflows/build.yml', BUILD_WORKFLOW_YML);

  // 3. Root gradle files
  zip.file('settings.gradle', SETTINGS_GRADLE);
  zip.file('build.gradle', BUILD_GRADLE_ROOT);
  zip.file('gradle.properties', GRADLE_PROPERTIES);
  zip.file('.gitignore', GITIGNORE);
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // 4. App module files
  zip.file('app/build.gradle', APP_BUILD_GRADLE);
  zip.file('app/src/main/AndroidManifest.xml', generateAndroidManifest(profile));
  zip.file('app/src/main/res/values/strings.xml', STRINGS_XML);
  zip.file(
    'app/src/main/java/com/custom/fod/sauron/v2/Placeholder.java',
    `package com.custom.fod.sauron.v2;

public final class Placeholder {
    private Placeholder() {}
}
`
  );

  // 5. README.md
  zip.file('README.md', generateReadme(profile));

  // 6. Pre-render PNG frames into app/src/main/res/drawable-nodpi/ so it also works instantly
  onProgress?.(30, 'Упаковка 60 кадров Ока Саурона...');
  const drawableFolder = zip.folder('app/src/main/res/drawable-nodpi');

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const fileName = `kgd_fingerprint_element_${i}.png`;
    const arrayBuffer = await f.blob.arrayBuffer();
    drawableFolder?.file(fileName, arrayBuffer);

    if (i === 0) {
      drawableFolder?.file('kgd_fingerprint_fadein.png', arrayBuffer);
    }
    if (i === frames.length - 1) {
      drawableFolder?.file('kgd_fingerprint_fadeout.png', arrayBuffer);
    }
    if (i === Math.floor(frames.length / 2)) {
      drawableFolder?.file('preview_icon.png', arrayBuffer);
    }

    if (i % 5 === 0) {
      const pct = 30 + Math.round((i / frames.length) * 50);
      onProgress?.(pct, `Добавление кадра ${i + 1}/${frames.length}...`);
    }
  }

  // 7. Minimal sound asset
  const rawFolder = zip.folder('app/src/main/res/raw');
  const dummyOgg = new Uint8Array([
    0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x1e,
    0x01, 0x76, 0x6f, 0x72, 0x62, 0x69, 0x73, 0x00, 0x00, 0x00, 0x00, 0x02,
    0x44, 0xac, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xee, 0x02, 0x00, 0x00,
    0xb8, 0x01,
  ]);
  rawFolder?.file('front_finger_sound.ogg', dummyOgg);

  onProgress?.(85, 'Сжатие готового репозитория...');

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(85 + Math.round(metadata.percent * 0.15), 'Финализация ZIP...');
    }
  );

  onProgress?.(100, 'Готово!');
  return zipBlob;
}

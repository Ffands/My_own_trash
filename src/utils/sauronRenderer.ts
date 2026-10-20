import { SauronConfig, SauronTheme } from '../types';

export const THEME_PALETTES: Record<
  SauronTheme,
  {
    name: string;
    description: string;
    coreFlame: string;
    midFlame: string;
    outerFlame: string;
    pupilGlow: string;
    runesColor: string;
    smokeColor: string;
    emberColor: string;
    accent: string;
  }
> = {
  mordor: {
    name: 'Mordor Inferno (Классика)',
    description: 'Испепеляющее багрово-огненное пламя Роковой Горы',
    coreFlame: '#ffe17d',
    midFlame: '#ff5500',
    outerFlame: '#b30000',
    pupilGlow: '#ffaa00',
    runesColor: '#ffbb44',
    smokeColor: 'rgba(25, 5, 2, 0.7)',
    emberColor: '#ffdd66',
    accent: '#ff4400',
  },
  ring: {
    name: 'One Ring (Золотое Кольцо)',
    description: 'Сияющие золотые эльфийские руны и чистое расплавленное золото',
    coreFlame: '#fff5b8',
    midFlame: '#ffaa00',
    outerFlame: '#d46500',
    pupilGlow: '#ffcc00',
    runesColor: '#ffdf59',
    smokeColor: 'rgba(30, 18, 5, 0.7)',
    emberColor: '#ffe885',
    accent: '#ffaa00',
  },
  nazgul: {
    name: 'Minas Morgul (Назгул)',
    description: 'Призрачное некротическое изумрудное пламя древних духов',
    coreFlame: '#baffd8',
    midFlame: '#00e575',
    outerFlame: '#006b3a',
    pupilGlow: '#33ffaa',
    runesColor: '#80ffcc',
    smokeColor: 'rgba(4, 25, 15, 0.7)',
    emberColor: '#a1ffdb',
    accent: '#00e575',
  },
  void: {
    name: 'Void Shadow (Бездна)',
    description: 'Тёмно-фиолетовая первозданная тьма Унголиант',
    coreFlame: '#f5c6ff',
    midFlame: '#a824f0',
    outerFlame: '#4a0578',
    pupilGlow: '#cf4aff',
    runesColor: '#e07dff',
    smokeColor: 'rgba(20, 2, 28, 0.7)',
    emberColor: '#f09fff',
    accent: '#a824f0',
  },
  cyber: {
    name: 'Cyber Sauron (Киберпанк)',
    description: 'Неоновые цифровые дуги, глитч-пламя и гипер-яркость',
    coreFlame: '#00ffff',
    midFlame: '#ff0077',
    outerFlame: '#7b00ff',
    pupilGlow: '#ff00aa',
    runesColor: '#00ffff',
    smokeColor: 'rgba(10, 0, 25, 0.7)',
    emberColor: '#00ffff',
    accent: '#ff0077',
  },
};

// Seeded pseudo-random generator for consistent procedural rendering
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

/**
 * Draws a single frame of the Eye of Sauron onto an HTMLCanvasElement
 * @param ctx 2D Canvas context
 * @param frameIndex current frame number (0 to frameCount - 1)
 * @param totalFrames total number of frames in animation
 * @param config user configuration parameters
 */
export function drawSauronFrame(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  totalFrames: number,
  config: SauronConfig
) {
  const { width, height } = ctx.canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.44;

  ctx.clearRect(0, 0, width, height);

  // Normalized progress (0 to 1)
  const progress = frameIndex / (totalFrames - 1 || 1);
  const palette = THEME_PALETTES[config.theme] || THEME_PALETTES.mordor;

  // Pulse & intensity dynamics
  // An ignition phase (0 -> 0.35), holding & burning phase (0.35 -> 0.8), final flare (0.8 -> 1.0)
  const scale = 0.85 + Math.sin(progress * Math.PI) * 0.18;
  const flameTurbulence = (frameIndex % 30) / 30;

  // 1. Optional Sensor Green Core for optical under-screen scanner support
  if (config.sensorGreenCore) {
    const sensorGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      maxRadius * 0.28
    );
    sensorGlow.addColorStop(0, 'rgba(0, 255, 120, 0.95)');
    sensorGlow.addColorStop(0.5, 'rgba(0, 255, 80, 0.6)');
    sensorGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = sensorGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Volcanic Smoke & Dark Shadow Aura
  if (config.smokeVeil) {
    const smokeCount = 12;
    for (let i = 0; i < smokeCount; i++) {
      const angle = (i / smokeCount) * Math.PI * 2 + progress * 0.8;
      const dist = maxRadius * (0.6 + 0.3 * pseudoRandom(i + 1));
      const sx = centerX + Math.cos(angle) * dist;
      const sy = centerY + Math.sin(angle) * dist;
      const sRadius = maxRadius * (0.3 + 0.15 * Math.sin(progress * Math.PI * 2 + i));

      const smokeGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sRadius);
      smokeGrad.addColorStop(0, palette.smokeColor);
      smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Fiery Corona & Tendrils (Flames spreading outward)
  const flameRays = 48;
  ctx.save();
  ctx.translate(centerX, centerY);

  for (let i = 0; i < flameRays; i++) {
    const angle = (i / flameRays) * Math.PI * 2;
    const flicker = pseudoRandom(i * 13 + frameIndex);
    const wave = Math.sin(angle * 6 + flameTurbulence * Math.PI * 4) * 0.2;
    const rayLength =
      maxRadius * (0.75 + wave + flicker * 0.35) * config.flameIntensity * scale;

    const rayGrad = ctx.createLinearGradient(
      0,
      0,
      Math.cos(angle) * rayLength,
      Math.sin(angle) * rayLength
    );
    rayGrad.addColorStop(0, palette.coreFlame);
    rayGrad.addColorStop(0.35, palette.midFlame);
    rayGrad.addColorStop(0.8, palette.outerFlame);
    rayGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.strokeStyle = rayGrad;
    ctx.lineWidth = 2.5 + flicker * 3;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * (maxRadius * 0.15),
      Math.sin(angle) * (maxRadius * 0.15)
    );
    ctx.lineTo(
      Math.cos(angle + wave * 0.1) * rayLength,
      Math.sin(angle + wave * 0.1) * rayLength
    );
    ctx.stroke();
  }
  ctx.restore();

  // 4. Outer Fiery Ring & Elvish Tengwar Script (One Ring inscription)
  if (config.ringRunes) {
    const ringRadius = maxRadius * 0.88 * scale;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(progress * Math.PI * 0.5); // subtle regal rotation

    // Golden rune ring border
    ctx.strokeStyle = palette.runesColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = palette.midFlame;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    // Procedural elvish/tengwar-styled rune glyph marks around the ring
    const runesCount = 28;
    for (let r = 0; r < runesCount; r++) {
      const runeAngle = (r / runesCount) * Math.PI * 2;
      const rx = Math.cos(runeAngle) * (ringRadius * 0.975);
      const ry = Math.sin(runeAngle) * (ringRadius * 0.975);

      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(runeAngle + Math.PI / 2);
      ctx.strokeStyle = palette.runesColor;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = palette.runesColor;

      // Stylized elvish flourish
      ctx.beginPath();
      ctx.moveTo(-3, -2);
      ctx.quadraticCurveTo(0, 3, 3, -1);
      ctx.stroke();
      if (r % 2 === 0) {
        ctx.beginPath();
        ctx.arc(0, -3, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // 5. Fiery Glowing Iris (Sauron's blazing iris)
  const irisRadius = maxRadius * 0.65 * scale;
  const irisGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    irisRadius * 0.1,
    centerX,
    centerY,
    irisRadius
  );
  irisGrad.addColorStop(0, palette.coreFlame);
  irisGrad.addColorStop(0.4, palette.midFlame);
  irisGrad.addColorStop(0.85, palette.outerFlame);
  irisGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Internal fibrous iris rays
  ctx.save();
  ctx.translate(centerX, centerY);
  for (let j = 0; j < 36; j++) {
    const a = (j / 36) * Math.PI * 2;
    const len = irisRadius * (0.4 + 0.55 * pseudoRandom(j + frameIndex * 2));
    ctx.strokeStyle = palette.coreFlame;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();

  // 6. The Vertical Slit Pupil of Sauron (Cat's Eye)
  // Dynamic dilation based on touch progress & config
  const dilation = config.pupilDilation * (0.8 + 0.3 * Math.sin(progress * Math.PI));
  const pupilWidth = maxRadius * 0.18 * dilation;
  const pupilHeight = maxRadius * 0.82 * scale;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Pupil outer aura/heat distortion
  const pupilGlowGrad = ctx.createRadialGradient(
    0,
    0,
    pupilWidth * 0.5,
    0,
    0,
    pupilWidth * 2.5
  );
  pupilGlowGrad.addColorStop(0, palette.pupilGlow);
  pupilGlowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pupilGlowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, pupilWidth * 2, pupilHeight * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw the iconic slit pupil shape (sharp pointed vertices at top and bottom)
  ctx.beginPath();
  ctx.moveTo(0, -pupilHeight / 2);
  // Right curve of slit
  ctx.bezierCurveTo(
    pupilWidth * 1.5,
    -pupilHeight * 0.2,
    pupilWidth * 1.5,
    pupilHeight * 0.2,
    0,
    pupilHeight / 2
  );
  // Left curve of slit
  ctx.bezierCurveTo(
    -pupilWidth * 1.5,
    pupilHeight * 0.2,
    -pupilWidth * 1.5,
    -pupilHeight * 0.2,
    0,
    -pupilHeight / 2
  );
  ctx.closePath();

  // Inner abyss of the pupil (pitch black with deep crimson core)
  const pupilInternalGrad = ctx.createRadialGradient(
    0,
    0,
    0,
    0,
    0,
    pupilHeight / 2
  );
  pupilInternalGrad.addColorStop(0, '#0a0000');
  pupilInternalGrad.addColorStop(0.7, '#000000');
  pupilInternalGrad.addColorStop(1, '#000000');
  ctx.fillStyle = pupilInternalGrad;
  ctx.shadowColor = palette.outerFlame;
  ctx.shadowBlur = 15;
  ctx.fill();

  // Central piercing slit line (radiant fiery vertical filament inside the pupil)
  ctx.strokeStyle = palette.coreFlame;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = palette.coreFlame;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -pupilHeight * 0.38);
  ctx.lineTo(0, pupilHeight * 0.38);
  ctx.stroke();

  ctx.restore();

  // 7. Dynamic Ballistic Embers & Sparks flying outward
  if (config.emberSparks) {
    const emberCount = 26;
    for (let e = 0; e < emberCount; e++) {
      const eSeed = e * 73.1;
      const initialAngle = pseudoRandom(eSeed) * Math.PI * 2;
      const speed = 0.5 + pseudoRandom(eSeed + 1) * 0.8;
      // Embers travel outward as progress increases
      const emberDistance =
        (maxRadius * 0.2 + maxRadius * 0.9 * progress * speed + (e % 7) * 4) %
        (maxRadius * 1.15);
      const ex = centerX + Math.cos(initialAngle) * emberDistance;
      const ey = centerY + Math.sin(initialAngle) * emberDistance;
      const emberSize = 1.2 + pseudoRandom(eSeed + 3) * 2.2;
      const emberAlpha = Math.max(0, 1 - emberDistance / (maxRadius * 1.15));

      ctx.fillStyle = palette.emberColor;
      ctx.shadowColor = palette.midFlame;
      ctx.shadowBlur = 6;
      ctx.globalAlpha = emberAlpha;
      ctx.beginPath();
      ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  // 8. Unlock completion flare burst (at the climax frames)
  if (progress > 0.85) {
    const burstProgress = (progress - 0.85) / 0.15;
    const burstRadius = maxRadius * (0.4 + burstProgress * 0.8);
    const burstGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      burstRadius
    );
    burstGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (1 - burstProgress) * 0.9 + ')');
    burstGrad.addColorStop(0.3, palette.coreFlame);
    burstGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, burstRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Render all frames into an array of PNG Blobs
 */
export async function renderAllFrames(
  config: SauronConfig,
  onProgress?: (current: number, total: number) => void
): Promise<{ frameIndex: number; blob: Blob; dataUrl: string }[]> {
  const canvas = document.createElement('canvas');
  canvas.width = config.resolution;
  canvas.height = config.resolution;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const frames: { frameIndex: number; blob: Blob; dataUrl: string }[] = [];

  for (let i = 0; i < config.frameCount; i++) {
    drawSauronFrame(ctx, i, config.frameCount, config);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to export canvas to blob'));
      }, 'image/png');
    });

    const dataUrl = canvas.toDataURL('image/png');
    frames.push({ frameIndex: i, blob, dataUrl });

    if (onProgress) {
      onProgress(i + 1, config.frameCount);
    }
  }

  return frames;
}

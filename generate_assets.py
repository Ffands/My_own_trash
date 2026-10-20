#!/usr/bin/env python3
"""
Autonomous Asset Generator for OxygenOS / OnePlus Sauron FOD RRO Overlay
Generates 60 transparent 400x400 PNG animation frames:
  kgd_fingerprint_element_0.png ... kgd_fingerprint_element_59.png
Plus fadein, fadeout, preview_icon, and minimal sound asset.
Requires: Pillow (pip install pillow)
"""

import os
import math
import struct
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
        
        # Color gradient: deep crimson to fiery amber
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

    # Dark aura around pupil
    draw.ellipse(
        [cx - slit_w * 1.5, cy - slit_h * 0.55, cx + slit_w * 1.5, cy + slit_h * 0.55],
        fill=(80, 10, 0, 180)
    )

    # Sharp Slit Polygon
    slit_points = [
        (cx, cy - slit_h * 0.5),
        (cx + slit_w, cy - slit_h * 0.2),
        (cx + slit_w * 0.8, cy + slit_h * 0.2),
        (cx, cy + slit_h * 0.5),
        (cx - slit_w * 0.8, cy + slit_h * 0.2),
        (cx - slit_w, cy - slit_h * 0.2)
    ]
    draw.polygon(slit_points, fill=(10, 0, 0, 255))

    # Radiant vertical fiery slit center
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

    # 6. Unlock climax flare in the final frames
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
    """Generates a minimal valid empty Ogg Vorbis binary file."""
    # Standard Ogg container header (OggS)
    ogg_header = b'OggS\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00\x01\x1e\x01vorbis\x00\x00\x00\x00\x02D\xac\x00\x00\x00\x00\x00\x00\xee\x02\x00\x00\xb8\x01'
    with open(filepath, 'wb') as f:
        f.write(ogg_header)

def main():
    print(f"🔥 Generating Sauron FOD assets in {OUTPUT_DIR}...")
    ensure_dirs()

    # Generate 60 sequence frames
    for i in range(TOTAL_FRAMES):
        filename = f"kgd_fingerprint_element_{i}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        frame = draw_sauron_frame(i, TOTAL_FRAMES)
        frame.save(filepath, "PNG")
        if i % 10 == 0 or i == TOTAL_FRAMES - 1:
            print(f"  -> Generated {filename} ({i+1}/{TOTAL_FRAMES})")

    # Generate fadein / fadeout frames
    fadein = draw_sauron_frame(0, TOTAL_FRAMES)
    fadein.save(os.path.join(OUTPUT_DIR, "kgd_fingerprint_fadein.png"), "PNG")
    
    fadeout = draw_sauron_frame(TOTAL_FRAMES - 1, TOTAL_FRAMES)
    fadeout.save(os.path.join(OUTPUT_DIR, "kgd_fingerprint_fadeout.png"), "PNG")

    # Generate preview_icon.png for Settings UI
    preview = draw_sauron_frame(TOTAL_FRAMES // 2, TOTAL_FRAMES)
    preview = preview.resize((192, 192), Image.Resampling.LANCZOS)
    preview.save(os.path.join(OUTPUT_DIR, "preview_icon.png"), "PNG")

    # Generate front_finger_sound.ogg
    ogg_path = os.path.join(RAW_DIR, "front_finger_sound.ogg")
    generate_minimal_ogg(ogg_path)

    print("✅ All assets generated successfully!")

if __name__ == "__main__":
    main()

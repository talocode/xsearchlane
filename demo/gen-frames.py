#!/usr/bin/env python3
"""Generate demo video frames for XSearchLane."""

from PIL import Image, ImageDraw, ImageFont
import os
import shutil

FRAMES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frames")
if os.path.isdir(FRAMES_DIR):
    shutil.rmtree(FRAMES_DIR)
os.makedirs(FRAMES_DIR, exist_ok=True)

W, H = 1280, 720
FPS = 30

try:
    font_title = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 42
    )
    font_h1 = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 28
    )
    font_h2 = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 22
    )
    font_text = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 18
    )
    font_cmd = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 16
    )
    font_small = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14
    )
except Exception:
    font_title = font_h1 = font_h2 = font_text = font_cmd = font_small = (
        ImageFont.load_default()
    )


def centered_text(draw, x, y, text, font, fill="#ffffff"):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((x - tw // 2, y), text, font=font, fill=fill)


def draw_scene(title, lines, accent="#ffffff", bg="#0a0a0a"):
    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)
    # top bar accent
    draw.rectangle([(0, 0), (W, 6)], fill=accent)
    centered_text(draw, W // 2, 40, title, font_h1, accent)
    draw.line([(100, 85), (W - 100, 85)], fill="#333355", width=1)
    y = 120
    for line in lines:
        if line.startswith("##"):
            centered_text(draw, W // 2, y, line[2:].strip(), font_h2, "#cccccc")
            y += 38
        elif line.startswith(">>>"):
            centered_text(draw, W // 2, y, line[3:].strip(), font_cmd, "#88cc88")
            y += 32
        elif line.startswith("---"):
            y += 16
        elif line.startswith("::"):
            centered_text(draw, W // 2, y, line[2:].strip(), font_text, "#aaaaaa")
            y += 30
        elif line.startswith("!!"):
            centered_text(draw, W // 2, y, line[2:].strip(), font_text, "#ffaa66")
            y += 30
        else:
            centered_text(draw, W // 2, y, line, font_text, "#cccccc")
            y += 30
    # footer
    centered_text(
        draw, W // 2, H - 40, "talocode/xsearchlane  ·  MIT", font_small, "#555566"
    )
    return img


def save_frames(img, name, duration_sec=4):
    n = duration_sec * FPS
    for i in range(n):
        img.save(os.path.join(FRAMES_DIR, f"{name}_{i:04d}.png"))
    print(f"  {name}: {duration_sec}s ({n} frames)")


print("Generating frames...")

save_frames(
    draw_scene(
        "XSearchLane",
        [
            "##Realtime X search for agents",
            "---",
            "::MCP · CLI · SDK · Hosted API",
            "---",
            ">>>npm i -g @talocode/xsearchlane",
            ">>>pip install talocode-xsearchlane",
        ],
        "#88aaff",
    ),
    "scene01",
    4,
)

save_frames(
    draw_scene(
        "The Problem",
        [
            "Agents need live social signal.",
            "---",
            "Web search is not enough.",
            "X is where builders complain first.",
            "---",
            "!!No native X search in most coding agents.",
        ],
        "#ff8866",
    ),
    "scene02",
    4,
)

save_frames(
    draw_scene(
        "The Solution",
        [
            "##One tool surface for X search",
            "---",
            "::xsearchlane_search  — live posts & threads",
            "::xsearchlane_research — themes & pain points",
            "---",
            "Filters: handles · dates · media",
        ],
        "#66cc88",
    ),
    "scene03",
    4,
)

save_frames(
    draw_scene(
        "CLI",
        [
            ">>>xsearchlane search --query \"AI code review bottleneck\"",
            ">>>xsearchlane research --query \"agent sandbox safety\"",
            ">>>xsearchlane doctor",
            "---",
            "::Mock offline · live with XAI_API_KEY · hosted with TALOCODE_API_KEY",
        ],
        "#88ccff",
    ),
    "scene04",
    5,
)

save_frames(
    draw_scene(
        "MCP (OpenCode)",
        [
            "##Plug into your coding agent",
            "---",
            '>>>"mcp": { "xsearchlane": { "command": ["npx",',
            '>>>  "-y", "@talocode/xsearchlane", "mcp"] } }',
            "---",
            "::Tools: search · research · health · pricing · capabilities",
        ],
        "#aa88ff",
    ),
    "scene05",
    5,
)

save_frames(
    draw_scene(
        "Architecture",
        [
            "##Agents → XSearchLane Core → Providers",
            "---",
            "::xai (direct)  ·  talocode (hosted)  ·  mock (CI)",
            "---",
            "!!Hosted credits: search 15cr · research 40cr",
        ],
        "#66aadd",
    ),
    "scene06",
    5,
)

# Architecture image scene if available
arch = os.path.join(os.path.dirname(FRAMES_DIR), "architecture.png")
if os.path.isfile(arch):
    base = Image.open(arch).convert("RGB")
    # fit into 1280x720 with letterbox
    canvas = Image.new("RGB", (W, H), "#0a0a0a")
    base.thumbnail((W - 80, H - 80))
    ox = (W - base.width) // 2
    oy = (H - base.height) // 2
    canvas.paste(base, (ox, oy))
    save_frames(canvas, "scene07", 5)
else:
    save_frames(
        draw_scene("Architecture", ["##See demo/architecture.png"], "#66aadd"),
        "scene07",
        3,
    )

save_frames(
    draw_scene(
        "Install",
        [
            ">>>npm i -g @talocode/xsearchlane",
            ">>>pip install talocode-xsearchlane",
            "---",
            "##Open-source tools. Hosted power.",
            "---",
            "::github.com/talocode/xsearchlane",
        ],
        "#88ffaa",
    ),
    "scene08",
    4,
)

print("Done frames in", FRAMES_DIR)

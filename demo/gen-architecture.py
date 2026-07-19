#!/usr/bin/env python3
"""Generate XSearchLane architecture diagram (PNG + SVG)."""

from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 720

img = Image.new("RGB", (W, H), "#0a0a0a")
draw = ImageDraw.Draw(img)

try:
    font_title = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 28
    )
    font_sub = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14
    )
    font_label = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 15
    )
    font_text = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 12
    )
    font_small = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 11
    )
except Exception:
    font_title = font_sub = font_label = font_text = font_small = ImageFont.load_default()


def box(xy, fill, outline, r=10):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=2)


def ctext(x, y, text, font, fill="#ffffff"):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((x - tw // 2, y), text, font=font, fill=fill)


def arrow(x1, y1, x2, y2, color="#6677aa"):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=2)
    if x2 > x1:
        draw.polygon([(x2, y2), (x2 - 9, y2 - 5), (x2 - 9, y2 + 5)], fill=color)
    else:
        draw.polygon([(x2, y2), (x2 + 9, y2 - 5), (x2 + 9, y2 + 5)], fill=color)


def varrow(x, y1, y2, color="#6677aa"):
    draw.line([(x, y1), (x, y2)], fill=color, width=2)
    draw.polygon([(x, y2), (x - 5, y2 - 9), (x + 5, y2 - 9)], fill=color)


# Title
ctext(W // 2, 18, "XSearchLane Architecture", font_title, "#ffffff")
ctext(W // 2, 52, "Realtime X search for agents — MCP · CLI · SDK · Hosted API", font_sub, "#888899")

# Agent layer
box((40, 95, 1160, 175), "#141422", "#3a3a5a")
ctext(W // 2, 108, "AGENTS & HOSTS", font_label, "#aaccff")
for i, label in enumerate(["OpenCode", "CLI", "Node SDK", "Python SDK", "Custom Agents"]):
    x0 = 70 + i * 220
    box((x0, 135, x0 + 190, 162), "#222238", "#445")
    ctext(x0 + 95, 140, label, font_text, "#dddddd")

varrow(W // 2, 175, 205)

# Core
box((300, 210, 900, 360), "#12182a", "#4466aa", 12)
ctext(600, 222, "XSEARCHLANE CORE", font_label, "#ffffff")
for i, label in enumerate(
    ["runXSearch()", "runXResearch()", "MCP tools", "health / pricing"]
):
    x0 = 330 + i * 140
    box((x0, 260, x0 + 125, 300), "#1a2840", "#5577bb")
    ctext(x0 + 62, 272, label, font_small, "#cce0ff")
ctext(600, 320, "Filters: handles · dates · media understanding · citations", font_text, "#99aacc")

varrow(W // 2, 360, 395)

# Providers
box((40, 400, 1160, 560), "#101418", "#335544")
ctext(W // 2, 412, "PROVIDERS (auto)", font_label, "#88ddaa")

providers = [
    (80, "xai", "Direct upstream", "XAI_API_KEY", "Responses x_search"),
    (430, "talocode", "Hosted Cloud", "TALOCODE_API_KEY", "/v1/xsearchlane/*"),
    (780, "mock", "Offline / CI", "no key", "deterministic"),
]
for x, name, role, key, note in providers:
    box((x, 445, x + 300, 540), "#162018", "#3a6644")
    ctext(x + 150, 455, name, font_label, "#aaffee")
    ctext(x + 150, 480, role, font_text, "#cccccc")
    ctext(x + 150, 500, key, font_small, "#88aa88")
    ctext(x + 150, 518, note, font_small, "#779977")

# Credits bar
box((40, 580, 1160, 655), "#1a1420", "#553366")
ctext(W // 2, 592, "HOSTED CREDITS", font_label, "#ddaaff")
ctext(
    W // 2,
    620,
    "POST /search  15cr    ·    POST /research  40cr    ·    GET health/pricing/capabilities  free",
    font_text,
    "#ccbbdd",
)

ctext(
    W // 2,
    675,
    "XSearchLane v0.1  ·  MIT  ·  github.com/talocode/xsearchlane  ·  npm i @talocode/xsearchlane",
    font_small,
    "#666677",
)

png_path = os.path.join(OUT, "architecture.png")
img.save(png_path)
print("wrote", png_path)

svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <text x="600" y="40" text-anchor="middle" fill="#fff" font-family="monospace" font-size="28" font-weight="bold">XSearchLane Architecture</text>
  <text x="600" y="68" text-anchor="middle" fill="#889" font-family="monospace" font-size="14">Realtime X search for agents — MCP · CLI · SDK · Hosted API</text>
  <rect x="40" y="95" width="1120" height="80" rx="10" fill="#141422" stroke="#3a3a5a"/>
  <text x="600" y="125" text-anchor="middle" fill="#acf" font-family="monospace" font-size="15">AGENTS &amp; HOSTS → OpenCode · CLI · Node SDK · Python SDK · Custom</text>
  <line x1="600" y1="175" x2="600" y2="205" stroke="#67a" stroke-width="2"/>
  <rect x="300" y="210" width="600" height="150" rx="12" fill="#12182a" stroke="#46a"/>
  <text x="600" y="245" text-anchor="middle" fill="#fff" font-family="monospace" font-size="16">XSEARCHLANE CORE</text>
  <text x="600" y="285" text-anchor="middle" fill="#cef" font-family="monospace" font-size="13">runXSearch · runXResearch · MCP tools · health/pricing</text>
  <text x="600" y="320" text-anchor="middle" fill="#9ac" font-family="monospace" font-size="12">handles · dates · media · citations</text>
  <line x1="600" y1="360" x2="600" y2="395" stroke="#67a" stroke-width="2"/>
  <rect x="40" y="400" width="1120" height="160" rx="10" fill="#101418" stroke="#354"/>
  <text x="600" y="430" text-anchor="middle" fill="#8da" font-family="monospace" font-size="15">PROVIDERS: xai · talocode · mock</text>
  <text x="600" y="470" text-anchor="middle" fill="#ccc" font-family="monospace" font-size="13">Direct upstream  |  Hosted /v1/xsearchlane/*  |  Offline CI</text>
  <text x="600" y="510" text-anchor="middle" fill="#8a8" font-family="monospace" font-size="12">XAI_API_KEY  ·  TALOCODE_API_KEY  ·  no key</text>
  <rect x="40" y="580" width="1120" height="75" rx="10" fill="#1a1420" stroke="#536"/>
  <text x="600" y="625" text-anchor="middle" fill="#dad" font-family="monospace" font-size="14">search 15cr · research 40cr · health/pricing free</text>
  <text x="600" y="690" text-anchor="middle" fill="#667" font-family="monospace" font-size="11">MIT · github.com/talocode/xsearchlane</text>
</svg>
'''
svg_path = os.path.join(OUT, "architecture.svg")
with open(svg_path, "w") as f:
    f.write(svg)
print("wrote", svg_path)

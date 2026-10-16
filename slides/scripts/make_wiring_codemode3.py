#!/usr/bin/env python3
"""코드모드 #3 회로 그림(브레드보드 + 아두이노 + 가변저항 + 220Ω 저항 + LED) SVG 생성기.

사용: python3 make_wiring_codemode3.py wiring-codemode3.svg
"""
import sys

W, H = 1400, 900
FONT = "'Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','NanumGothic',sans-serif"


def col(c):
    return 560 + (c - 1) * 38


TOP = [250, 286, 322, 358, 394]
BOT = [500, 536, 572, 608, 644]
USED = [2, 6, 7, 12, 13, 14]

o = []
a = o.append
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">')
a(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

# 아두이노
a('<rect x="40" y="60" width="260" height="700" rx="24" fill="#00979D" stroke="#006468" stroke-width="6"/>')
a('<text x="170" y="480" text-anchor="middle" font-size="44" font-weight="800" fill="#FFFFFF">Arduino</text>')
a('<text x="170" y="532" text-anchor="middle" font-size="44" font-weight="800" fill="#FFFFFF">UNO</text>')
for label, y in [("A0", 110), ("5V", 170), ("GND", 210), ("9 (~)", 250)]:
    a(f'<circle cx="300" cy="{y}" r="14" fill="#FDE68A" stroke="#333333" stroke-width="3"/>')
    a(f'<text x="278" y="{y + 11}" text-anchor="end" font-size="32" font-weight="800" fill="#FFFFFF">{label}</text>')

# 브레드보드
a('<rect x="500" y="80" width="860" height="700" rx="18" fill="#F3E9D2" stroke="#BFA97A" stroke-width="5"/>')
a('<rect x="500" y="420" width="860" height="50" fill="#E4D7B5"/>')
for c in USED:
    a(f'<rect x="{col(c) - 17}" y="234" width="34" height="176" rx="8" fill="#FACC15" fill-opacity=".32"/>')
for c in range(1, 21):
    for y in TOP + BOT:
        a(f'<circle cx="{col(c)}" cy="{y}" r="6" fill="#7C6F4E"/>')
    a(f'<circle cx="{col(c)}" cy="135" r="6" fill="#7C6F4E"/>')
    a(f'<circle cx="{col(c)}" cy="165" r="6" fill="#7C6F4E"/>')
a('<line x1="545" y1="120" x2="1297" y2="120" stroke="#DC2626" stroke-width="4"/>')
a('<line x1="545" y1="180" x2="1297" y2="180" stroke="#2563EB" stroke-width="4"/>')
a('<text x="1330" y="144" text-anchor="middle" font-size="34" font-weight="800" fill="#DC2626">+</text>')
a('<text x="1330" y="174" text-anchor="middle" font-size="34" font-weight="800" fill="#2563EB">−</text>')
a('<text x="930" y="715" text-anchor="middle" font-size="28" font-weight="700" fill="#7C6F4E">노랗게 칠한 세로 줄(5칸)은 안에서 서로 연결돼 있어요</text>')

# 220Ω 저항 (세로 줄 2번 ↔ 6번)
a('<line x1="598" y1="286" x2="750" y2="286" stroke="#6B7280" stroke-width="7" stroke-linecap="round"/>')
a('<rect x="620" y="270" width="108" height="32" rx="7" fill="#E8C9A0" stroke="#1F2937" stroke-width="3"/>')
for x, colr, w in [(640, "#DC2626", 11), (662, "#DC2626", 11), (684, "#7C2D12", 11), (708, "#CA8A04", 9)]:
    a(f'<rect x="{x}" y="270" width="{w}" height="32" fill="{colr}"/>')
a('<text x="650" y="338" text-anchor="middle" font-size="25" font-weight="800" fill="#1F2937">220Ω 저항</text>')

# LED (긴 다리 6번 줄, 짧은 다리 7번 줄)
a('<circle cx="769" cy="352" r="38" fill="#EF4444" stroke="#991B1B" stroke-width="4"/>')
a('<path d="M744 340 A28 28 0 0 1 766 322" stroke="#FFFFFF" stroke-width="6" stroke-opacity=".55" fill="none" stroke-linecap="round"/>')
a('<text x="769" y="362" text-anchor="middle" font-size="26" font-weight="800" fill="#FFFFFF">LED</text>')
a('<text x="764" y="418" text-anchor="end" font-size="24" font-weight="800" fill="#1F2937">긴 다리 (+)</text>')
a('<text x="776" y="418" font-size="24" font-weight="800" fill="#1F2937">짧은 다리 (−)</text>')

# 가변저항 (세로 줄 12·13·14번에 다리 3개)
a('<rect x="948" y="340" width="136" height="190" rx="18" fill="#E5E7EB" stroke="#1F2937" stroke-width="5"/>')
a('<circle cx="1016" cy="432" r="48" fill="#FFFFFF" stroke="#1F2937" stroke-width="5"/>')
a('<line x1="1016" y1="432" x2="1016" y2="392" stroke="#3B82F6" stroke-width="12" stroke-linecap="round"/>')
a('<circle cx="1016" cy="432" r="9" fill="#1F2937"/>')
a('<text x="1016" y="575" text-anchor="middle" font-size="32" font-weight="800" fill="#1F2937">가변저항</text>')


def wire(points, color):
    pts = " ".join(f"{x},{y}" for x, y in points)
    a(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>')
    for x, y in (points[0], points[-1]):
        a(f'<circle cx="{x}" cy="{y}" r="8" fill="{color}" stroke="#FFFFFF" stroke-width="2"/>')


RED, BLACK, YELLOW, GREEN = "#DC2626", "#111827", "#EAB308", "#16A34A"
wire([(300, 170), (440, 170), (440, 135), (560, 135)], RED)          # 5V → + 줄
wire([(300, 210), (480, 210), (480, 165), (560, 165)], BLACK)        # GND → − 줄
wire([(300, 250), (598, 250)], GREEN)                                # 9번 핀 → 저항 쪽 줄
wire([(300, 110), (1016, 110), (1016, 322)], YELLOW)                 # A0 → 가변저항 가운데
wire([(978, 250), (978, 165)], BLACK)                              # 가변저항 왼쪽 → − 줄 (GND)
wire([(1054, 250), (1054, 135)], RED)                                # 가변저항 오른쪽 → + 줄 (5V): 오른쪽으로 돌릴수록 밝아짐
wire([(788, 250), (788, 165)], BLACK)                                # LED 짧은 다리 줄 → − 줄

for x, y, t, c in [(420, 98, "노랑 · A0", "#B45309"), (372, 160, "빨강 · 5V", RED),
                   (392, 200, "검정 · GND", BLACK), (412, 240, "초록 · 9번 핀", "#15803D")]:
    a(f'<text x="{x}" y="{y}" text-anchor="middle" font-size="25" font-weight="800" fill="{c}">{t}</text>')

# 범례
for x, colr, t in [(60, RED, "빨강 = 5V"), (400, BLACK, "검정 = GND"), (740, YELLOW, "노랑 = A0"), (1080, GREEN, "초록 = 9번 핀")]:
    a(f'<line x1="{x}" y1="820" x2="{x + 50}" y2="820" stroke="{colr}" stroke-width="12" stroke-linecap="round"/>')
    a(f'<text x="{x + 64}" y="830" font-size="30" font-weight="700" fill="#1F2937">{t}</text>')
a('<text x="700" y="880" text-anchor="middle" font-size="27" font-weight="700" fill="#6B7280">브레드보드 맨 위 줄: 빨강(+)은 5V, 파랑(−)은 GND</text>')

a("</svg>")
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(o) + "\n")
print("wrote", sys.argv[1])

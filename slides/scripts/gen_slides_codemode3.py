#!/usr/bin/env python3
"""코드모드 #3 슬라이드(HTML, Minimal 테마, 1920x1080) 생성기. 출력은 정적 HTML 1개."""
import sys

TOTAL = 25
OUT = sys.argv[1]
SITE = "arduino-hado.vercel.app"
LOGO = "아두이노 코드모드"

CSS = """
:root{--font-main:'PretendardEmb','Apple SD Gothic Neo','Malgun Gothic','NanumGothic',sans-serif;}
*{box-sizing:border-box;margin:0;padding:0;word-break:keep-all;overflow-wrap:break-word}
html,body{background:#D1D5DB}
body{font-family:var(--font-main);color:#1A1A1A;padding-top:44px}

.slide-nav{position:fixed;top:0;left:0;right:0;background:#333;color:#fff;padding:8px 16px;z-index:100000;display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-family:var(--font-main);font-size:14px}
.slide-nav a{color:#fff;background:#555;padding:4px 9px;border-radius:4px;text-decoration:none}
.slide-nav a:hover{background:#777}
.slide-nav .hint{color:#bbb;margin-left:12px}

.slide{width:1920px;height:1080px;padding:80px 100px;display:flex;flex-direction:column;justify-content:flex-start;box-sizing:border-box;overflow:hidden;position:relative;margin:0 0 24px 0;scroll-margin-top:44px;background:#FAFAFA}
.slide-cover,.slide-section,.slide-ending{background:#3B82F6;color:#fff;justify-content:center;align-items:center;text-align:center}

.slide-title{font-size:52px;font-weight:800;line-height:1.25;padding-bottom:20px;border-bottom:3px solid #3B82F6;margin-bottom:44px}
.content{flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:70px}
.lead{font-size:38px;line-height:1.6;margin-bottom:36px}
.lead b{color:#3B82F6}
.mute{color:#6B7280}
.slide-footer{position:absolute;bottom:40px;left:60px}
.logo-text{font-size:20px;font-weight:700;letter-spacing:2px;color:#6B7280}
.on-dark .logo-text{color:rgba(255,255,255,.65)}
.slide-number{position:absolute;bottom:40px;right:60px;font-size:20px;color:#6B7280}

.cover-tag{font-size:22px;font-weight:600;color:rgba(255,255,255,.7);letter-spacing:6px;margin-bottom:40px}
.cover-title{font-size:84px;font-weight:800;line-height:1.2;margin-bottom:28px}
.cover-rule{width:72px;height:3px;background:rgba(255,255,255,.55);margin:0 auto 32px}
.cover-subtitle{font-size:36px;color:rgba(255,255,255,.85);margin-bottom:48px}
.cover-meta{font-size:24px;color:rgba(255,255,255,.7)}
.section-num{font-size:96px;font-weight:900;color:rgba(255,255,255,.3);display:block;margin-bottom:16px}
.section-title{font-size:64px;font-weight:800}
.section-rule{width:56px;height:3px;background:rgba(255,255,255,.55);margin:32px auto 0}
.ending-title{font-size:84px;font-weight:800;margin-bottom:24px}
.ending-subtitle{font-size:36px;color:rgba(255,255,255,.85);margin-bottom:48px}
.ending-contact{font-size:34px;font-weight:700;color:#fff;background:rgba(255,255,255,.18);padding:18px 44px;border-radius:10px;display:inline-block}

.agenda-list{display:flex;flex-direction:column;gap:40px;margin-top:8px}
.agenda-item{display:flex;align-items:center;gap:40px}
.agenda-num{font-size:60px;font-weight:900;color:#3B82F6;min-width:110px;line-height:1}
.agenda-text{font-size:42px;font-weight:700}
.agenda-sub{font-size:30px;color:#6B7280;font-weight:500;margin-left:16px}

.row{display:flex;gap:40px;align-items:stretch}
.grow{flex:1}
.card{background:#fff;border:2px solid #E5E7EB;border-radius:12px;padding:36px 40px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.pill{display:inline-block;font-size:26px;font-weight:700;padding:6px 20px;border-radius:999px;background:#E5E7EB;color:#6B7280;margin-bottom:20px}
.pill.new{background:#3B82F6;color:#fff}
.fn{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:60px;font-weight:700;color:#3B82F6;margin-bottom:12px}
.role{font-size:46px;font-weight:800;margin-bottom:12px}
.desc{font-size:32px;color:#6B7280;line-height:1.5}

.callout{border-left:8px solid #3B82F6;background:rgba(59,130,246,.08);padding:28px 40px;font-size:36px;line-height:1.6;border-radius:0 10px 10px 0}
.callout b{color:#3B82F6}
.copyhint{margin-top:32px;font-size:32px;color:#6B7280}
.copyhint b{color:#1A1A1A}

.code-box{background:#111827;color:#E5E7EB;border-radius:10px;padding:34px 48px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:46px;line-height:1.55;white-space:pre;text-align:left}
.code-box.sm{font-size:38px}
.code-box.xs{font-size:32px;padding:26px 40px;line-height:1.55}
.code-box .k{color:#93C5FD}
.code-box .n{color:#FCD34D}
.code-box .c{color:#9CA3AF}

.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.item{display:flex;align-items:center;gap:28px;background:#fff;border:2px solid #E5E7EB;border-radius:12px;padding:34px 36px}
.item .no{width:64px;height:64px;border-radius:50%;background:#3B82F6;color:#fff;font-size:34px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.item .name{font-size:42px;font-weight:800;line-height:1.3}
.item .sub{font-size:28px;color:#6B7280}

.flow{display:flex;align-items:stretch;gap:24px}
.flow-box{flex:1;background:#fff;border:3px solid #E5E7EB;border-radius:12px;padding:34px 20px;text-align:center;font-size:36px;font-weight:800;line-height:1.4;display:flex;flex-direction:column;justify-content:center;gap:10px}
.flow-box.hl{border-color:#3B82F6}
.flow-box small{font-size:28px;font-weight:600;color:#6B7280;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
.flow-arrow{align-self:center;font-size:56px;color:#3B82F6;font-weight:900}

.big-row{display:flex;align-items:center;gap:40px;margin-bottom:36px}
.bignum{text-align:center;min-width:300px}
.bignum .v{font-size:120px;font-weight:900;color:#3B82F6;line-height:1}
.bignum .t{font-size:32px;font-weight:700;color:#6B7280;margin-top:10px}
.gauge{flex:1;height:56px;background:#E5E7EB;border-radius:6px;position:relative;overflow:hidden}
.gauge i{display:block;height:100%;width:100%;background:#3B82F6;opacity:.85}
.gauge-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:28px;font-weight:700;color:#6B7280}

.bar-row{display:flex;align-items:center;gap:32px;margin-bottom:30px}
.bar-num{font-size:64px;font-weight:900;color:#3B82F6;min-width:170px;text-align:right;line-height:1}
.bar-track{flex:1;height:64px;background:#E5E7EB;border-radius:6px;overflow:hidden}
.bar-fill{height:100%;background:#3B82F6;border-radius:6px}
.bar-desc{font-size:38px;font-weight:700;min-width:280px}

.zones{display:flex;height:230px;border-radius:8px;overflow:hidden}
.zone{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:56px;font-weight:800}
.zone small{font-size:44px;font-weight:700;margin-top:6px}
.z1{width:29.32%;background:rgba(59,130,246,.22)}
.z2{width:39.10%;background:rgba(59,130,246,.5)}
.z3{width:31.58%;background:#3B82F6;color:#fff}
.ticks{position:relative;height:60px;margin-top:14px;font-size:38px;font-weight:800;color:#6B7280}
.ticks span{position:absolute;top:0;transform:translateX(-50%)}
.ticks span.l{transform:none}
.ticks span.r{transform:translateX(-100%)}

.annot{display:flex;align-items:center;gap:48px;margin-bottom:24px}
.annot .code-box{flex:0 0 auto}
.annot .say{font-size:38px;font-weight:700}
.annot .say b{color:#3B82F6}

.cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:36px}
.ccard{background:#fff;border:2px solid #E5E7EB;border-radius:12px;padding:40px 40px;display:flex;flex-direction:column}
.ccard .badge{align-self:flex-start;background:#3B82F6;color:#fff;font-size:34px;font-weight:800;padding:6px 22px;border-radius:999px;margin-bottom:22px}
.ccard .q{font-size:44px;font-weight:800;line-height:1.5;margin-bottom:20px}
.ccard .h{font-size:34px;color:#6B7280;line-height:1.55}
.ccard .code-box{font-size:36px;padding:26px 30px;margin-top:auto}
.ccard .h{margin-bottom:28px}

.recap{display:flex;flex-direction:column;gap:22px;margin-bottom:34px}
.recap-row{display:flex;align-items:center;gap:36px}
.term{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:40px;font-weight:700;color:#3B82F6;min-width:420px}
.term.plain{font-family:inherit}
.def{font-size:40px;font-weight:600}
.nums{display:flex;gap:36px}
.nums .card{flex:1;text-align:center;padding:26px}
.nums .v{font-size:56px;font-weight:900;color:#3B82F6}
.nums .t{font-size:30px;color:#6B7280;font-weight:700}

.chips{display:flex;gap:18px;flex-wrap:wrap;margin-top:34px}
.chip{background:#fff;border:2px solid #3B82F6;border-radius:999px;padding:10px 28px;font-size:34px;font-weight:700;display:flex;gap:14px;align-items:center}
.chip b{color:#3B82F6}
.chip .m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
.compact .item{padding:14px 30px}
.rgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.rcard{background:#fff;border:2px solid #E5E7EB;border-radius:12px;padding:32px 34px}
.rcard .rt{font-size:28px;font-weight:800;color:#3B82F6;margin-bottom:12px}
.rcard .rq{font-size:36px;font-weight:800;line-height:1.45;margin-bottom:22px}
.rcard .rq .m,.rcard .ra .m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;color:#3B82F6}
.rcard .ro{font-size:30px;line-height:1.55;margin-bottom:8px}
.rcard .ra{font-size:34px;font-weight:800;line-height:1.5;margin-bottom:14px}
.rcard .rd{font-size:29px;color:#6B7280;line-height:1.55}
.ttable{width:100%;border-collapse:collapse;font-size:26px;margin-bottom:26px}
.ttable th{text-align:left;color:#6B7280;font-weight:700;padding:8px 16px;border-bottom:2px solid #1A1A1A}
.ttable td{padding:9px 16px;border-bottom:1px solid #E5E7EB}
.ttable td:first-child{font-weight:800;color:#3B82F6;white-space:nowrap}
.ttable td:nth-child(2){font-weight:700}
.tcall{font-size:27px;line-height:1.55;padding:16px 28px}
.quiz-tag{font-size:30px;font-weight:800;color:#3B82F6;letter-spacing:4px;margin-bottom:12px}
.quiz-q{font-size:50px;font-weight:800;line-height:1.5;margin-bottom:40px}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.opt{display:flex;gap:24px;align-items:center;background:#fff;border:2px solid #E5E7EB;border-radius:12px;padding:30px 36px;font-size:40px;font-weight:600}
.opt .no{width:64px;height:64px;border-radius:50%;background:#3B82F6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;flex-shrink:0}
.opt .m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:36px}
.quiz-hint{margin-top:36px;font-size:32px;color:#6B7280}

.ans-row{display:flex;align-items:center;gap:56px;margin-bottom:40px}
.ans-no{font-size:170px;font-weight:900;color:#3B82F6;line-height:1}
.ans-text{font-size:56px;font-weight:800;line-height:1.35}
.ans-text .m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;color:#3B82F6}

.teacher-tag{display:inline-block;background:#1A1A1A;color:#fff;font-size:26px;font-weight:700;padding:8px 22px;border-radius:6px;margin-bottom:22px;align-self:flex-start}
.tlist{list-style:none;display:flex;flex-direction:column;gap:26px}
.tlist li{font-size:27px;line-height:1.55;padding-left:36px;position:relative}
.tlist li::before{content:'—';position:absolute;left:0;color:#3B82F6;font-weight:800}
.tlist b{color:#3B82F6}

.logo-text,.slide-number,.slide-footer,.def,.term,.pill,.badge,.chip,.rt,.quiz-tag,.teacher-tag,.agenda-num,.bar-num,.bar-desc,.role,.fn{white-space:nowrap}
.recap-row{flex-wrap:nowrap}.recap-row .def{flex:0 0 auto}
.present-btn{background:#3B82F6;color:#fff;border:0;border-radius:4px;padding:4px 12px;font:700 14px var(--font-main);cursor:pointer;margin-left:8px}
body.present{padding-top:0;background:#000;overflow:hidden}
body.present .slide-nav,body.present .download-bar{display:none!important}
body.present .slide{display:none!important;position:fixed;left:0;top:0;margin:0;transform-origin:0 0}
body.present .slide.cur{display:flex!important}
.download-bar{width:1920px;padding:36px 0 80px;text-align:center;font-family:var(--font-main)}
.download-bar button{font-size:24px;font-weight:700;padding:16px 40px;background:#3B82F6;color:#fff;border:0;border-radius:8px;cursor:pointer}
.download-bar button:disabled{opacity:.5;cursor:wait}
.download-bar #downloadStatus{display:block;margin-top:14px;font-size:20px;color:#444}
"""


def footer(dark=False):
    return f'<div class="slide-footer"><span class="logo-text">{LOGO}</span></div>'


def numtag(n):
    return f'<div class="slide-number">{n} / {TOTAL}</div>'


def body(n, title, inner):
    return (
        f'<div class="slide slide-body" id="slide-{n}">\n'
        f'  <h2 class="slide-title">{title}</h2>\n  <div class="content">\n{inner}\n  </div>\n  {footer()}\n  {numtag(n)}\n</div>'
    )


slides = []
import os
_here = os.path.dirname(os.path.abspath(__file__))
import base64
WIRING_IMG_B64 = base64.b64encode(open(os.path.join(_here, "..", "images", "wiring-codemode3-tinkercad.png"), "rb").read()).decode()
HINT = "<span style='font-size:34px;color:#6B7280;font-weight:600'>막혔다면 여기서 확인해요</span>"


def aline(html, plain, mark, width=48):
    pad = " " * max(2, width - len(plain))
    return html + pad + f'<span class="c">// {mark}</span>'


def chips(pairs):
    return '<div class="chips">' + "".join(
        f'<span class="chip"><b>{n}</b><span class="m">{v}</span></span>' for n, v in pairs) + "</div>"


# 1 표지
slides.append(f"""<div class="slide slide-cover on-dark" id="slide-1">
  <div class="cover-content">
    <div class="cover-tag">CODE MODE #3</div>
    <h1 class="cover-title">LED의 밝기를<br>마음대로 조절해보자!</h1>
    <div class="cover-rule"></div>
    <p class="cover-subtitle">가변저항을 돌려서 💡 LED를 밝게 또는 어둡게 만들어 봅니다</p>
    <div class="cover-meta">{LOGO}</div>
  </div>
  {footer()}
</div>""")

# 2 목차
slides.append(body(2, "오늘의 순서", """  <div class="agenda-list">
    <div class="agenda-item"><span class="agenda-num">01</span><span class="agenda-text">지난 시간 복습 &amp; 회로 연결<span class="agenda-sub">약 15분</span></span></div>
    <div class="agenda-item"><span class="agenda-num">02</span><span class="agenda-text">⭐ 1~2단계<span class="agenda-sub">숫자 읽기, LED 밝기 정하기 · 약 27분</span></span></div>
    <div class="agenda-item"><span class="agenda-num">03</span><span class="agenda-text">⭐⭐⭐ 3~4단계<span class="agenda-sub">가변저항으로 밝기 조절하기 · 약 30분</span></span></div>
    <div class="agenda-item"><span class="agenda-num">04</span><span class="agenda-text">🏆 도전 미션 &amp; 퀴즈<span class="agenda-sub">약 8분</span></span></div>
  </div>"""))

# 복습 (지난 시간 조도센서 퀴즈 재사용)
slides.append(body(0, "🔁 지난 시간 복습", """  <div class="rgrid">
    <div class="rcard"><div class="rt">Q1</div><div class="rq"><span class="m">analogRead()</span>는 무엇을 하는 명령일까요?</div>
      <div class="ro">① LED를 켠다</div><div class="ro">② 센서의 값을 숫자로 읽는다</div><div class="ro">③ 1초 기다린다</div><div class="ro">④ 버튼을 만든다</div></div>
    <div class="rcard"><div class="rt">Q2</div><div class="rq"><span class="m">if (lightValue &lt; 500)</span> 의 뜻은?</div>
      <div class="ro">① 밝기 값이 500보다 작다면</div><div class="ro">② 밝기 값이 500보다 크다면</div><div class="ro">③ LED를 500번 켠다</div><div class="ro">④ 500초 기다린다</div></div>
    <div class="rcard"><div class="rt">Q3</div><div class="rq"><span class="m">digitalWrite(ledPin, HIGH);</span> 은 무엇을 할까요?</div>
      <div class="ro">① LED 끄기</div><div class="ro">② LED 켜기</div><div class="ro">③ 센서 읽기</div><div class="ro">④ 숫자 출력하기</div></div>
  </div>"""))

slides.append(body(0, "✅ 복습 정답", """  <div class="rgrid">
    <div class="rcard"><div class="rt">Q1</div><div class="ra">② 센서의 값을 숫자로 읽는다</div><div class="rd">오늘도 <span class="m">analogRead()</span>로 가변저항의 숫자를 읽어요.</div></div>
    <div class="rcard"><div class="rt">Q2</div><div class="ra">① 밝기 값이 500보다 작다면</div><div class="rd"><b>&lt;</b> 는 “작다”예요. 오늘 4단계에도 나와요.</div></div>
    <div class="rcard"><div class="rt">Q3</div><div class="ra">② LED 켜기</div><div class="rd">오늘은 LED를 켜고 끄는 것을 넘어, <b>밝기를 숫자로</b> 정해 볼 거예요.</div></div>
  </div>"""))

# 3 새 명령어
slides.append(body(3, "오늘 새로 만날 명령어", """  <div class="row" style="margin-bottom:40px">
    <div class="card grow">
      <span class="pill">다시 만나요</span>
      <div class="fn">analogRead()</div>
      <div class="role">숫자 읽기</div>
      <div class="desc">가변저항이 알려주는 숫자를 읽어요</div>
    </div>
    <div class="card grow" style="border-color:#3B82F6">
      <span class="pill new">NEW ✨</span>
      <div class="fn">analogWrite()</div>
      <div class="role">LED 밝기 조절하기</div>
      <div class="desc">숫자로 LED의 밝기를 정해요</div>
    </div>
  </div>
  <div class="callout">오늘 꼭 기억할 것: <b>analogWrite</b> = 숫자로 LED 밝기 바꾸기</div>"""))

# 4 준비물
slides.append(body(4, "🔧 준비물", """  <div class="grid3" style="margin-bottom:40px">
    <div class="item"><span class="no">1</span><div><div class="name">Arduino UNO</div><div class="sub">1개</div></div></div>
    <div class="item"><span class="no">2</span><div><div class="name">가변저항</div><div class="sub">1개</div></div></div>
    <div class="item"><span class="no">3</span><div><div class="name">LED</div><div class="sub">1개</div></div></div>
    <div class="item"><span class="no">4</span><div><div class="name">220Ω 저항</div><div class="sub">1개</div></div></div>
    <div class="item"><span class="no">5</span><div><div class="name">브레드보드</div><div class="sub">1개</div></div></div>
    <div class="item"><span class="no">6</span><div><div class="name">점퍼선</div><div class="sub">필요한 만큼</div></div></div>
  </div>
  <p class="lead mute">다 챙겼으면 손을 들어 주세요 ✋</p>"""))

# 5 가변저항 연결
slides.append(body(5, "🔧 가변저항 연결하기", """  <div class="row" style="align-items:center;gap:80px">
    <svg viewBox="0 0 700 520" width="700" height="520" style="flex:0 0 700px">
      <rect x="60" y="30" width="580" height="270" rx="28" fill="#E5E7EB" stroke="#1A1A1A" stroke-width="4"/>
      <circle cx="350" cy="165" r="100" fill="#FAFAFA" stroke="#1A1A1A" stroke-width="4"/>
      <line x1="350" y1="165" x2="350" y2="88" stroke="#3B82F6" stroke-width="14" stroke-linecap="round"/>
      <circle cx="350" cy="165" r="13" fill="#1A1A1A"/>
      <line x1="150" y1="300" x2="150" y2="400" stroke="#1A1A1A" stroke-width="12" stroke-linecap="round"/>
      <line x1="350" y1="300" x2="350" y2="400" stroke="#3B82F6" stroke-width="12" stroke-linecap="round"/>
      <line x1="550" y1="300" x2="550" y2="400" stroke="#1A1A1A" stroke-width="12" stroke-linecap="round"/>
      <text x="150" y="455" text-anchor="middle" font-size="40" font-weight="800" fill="#1A1A1A">GND</text>
      <text x="150" y="498" text-anchor="middle" font-size="28" fill="#6B7280">왼쪽 다리</text>
      <text x="350" y="455" text-anchor="middle" font-size="40" font-weight="800" fill="#3B82F6">A0</text>
      <text x="350" y="498" text-anchor="middle" font-size="28" fill="#6B7280">가운데 다리</text>
      <text x="550" y="455" text-anchor="middle" font-size="40" font-weight="800" fill="#1A1A1A">5V</text>
      <text x="550" y="498" text-anchor="middle" font-size="28" fill="#6B7280">오른쪽 다리</text>
    </svg>
    <div class="grow">
      <p class="lead" style="margin-bottom:28px">가변저항에는 다리가 <b>3개</b> 있어요.</p>
      <div class="recap" style="gap:18px;margin-bottom:36px">
        <div class="recap-row"><span class="def">왼쪽 다리</span><span class="term plain" style="min-width:0">→ GND</span></div>
        <div class="recap-row"><span class="def">가운데 다리</span><span class="term plain" style="min-width:0">→ A0</span></div>
        <div class="recap-row"><span class="def">오른쪽 다리</span><span class="term plain" style="min-width:0">→ 5V</span></div>
      </div>
      <div class="callout">기억하기: <b>가운데 다리</b>에서 숫자를 읽어요!<br><b>오른쪽</b>으로 돌릴수록 숫자가 커져요.</div>
    </div>
  </div>"""))

# 6 LED 연결
slides.append(body(6, "💡 LED 연결하기", """  <p class="lead">이번에는 LED를 <b>9번 핀</b>에 연결해요.</p>
  <div class="flow" style="margin-bottom:44px">
    <div class="flow-box hl">9번 핀</div><div class="flow-arrow">→</div>
    <div class="flow-box">220Ω<br>저항</div><div class="flow-arrow">→</div>
    <div class="flow-box">LED<br>긴 다리 (+)</div><div class="flow-arrow">→</div>
    <div class="flow-box">LED<br>짧은 다리 (−)</div><div class="flow-arrow">→</div>
    <div class="flow-box hl">GND</div>
  </div>
  <div class="callout"><b>왜 9번일까요?</b> LED의 밝기를 바꾸려면 특별한 핀이 필요해요.<br>보드에서 숫자 옆에 <b>물결(~)</b> 표시가 있는 핀을 찾아보세요!</div>"""))

# 전체 회로 그림 (틴커캐드 사진)
slides.append(body(0, "🔌 전체 회로 한눈에 보기", """  <div class="row" style="align-items:center;gap:56px">
    <img src="data:image/png;base64,""" + WIRING_IMG_B64 + """" alt="전체 회로" style="height:700px;width:auto;flex:0 0 auto;border:2px solid #E5E7EB;border-radius:12px;background:#fff">
    <div class="grow">
      <div class="role" style="font-size:40px;margin-bottom:20px">✔ 다 연결했나요?</div>
      <div class="desc" style="font-size:32px;line-height:1.65;color:#1A1A1A">
        <b>1.</b> Arduino <b>5V</b> → 브레드보드 <b>+</b> 줄<br>
        <b>2.</b> Arduino <b>GND</b> → 브레드보드 <b>−</b> 줄<br>
        <b>3.</b> 가변저항: 왼쪽 → <b>−</b> 줄, 가운데 → <b>A0</b>, 오른쪽 → <b>+</b> 줄<br>
        <b>4.</b> 9번 핀 → 저항 → LED 긴 다리(+)<br>
        <b>5.</b> LED 짧은 다리(−) → <b>−</b> 줄<br>
        <span class="mute" style="font-size:28px">USB는 마지막에 꽂아요!</span>
      </div>
      <div class="callout" style="margin-top:28px;font-size:32px">이 회로로 <b>1~4단계를 끝까지</b> 해요.<br>이제부터는 <b>코드만</b> 바꿔요!</div>
    </div>
  </div>"""))

# 7 1단계
slides.append(body(7, "⭐ 1단계 · 가변저항 숫자 확인하기", """  <div class="callout" style="margin-bottom:40px">가변저항을 <b>왼쪽 끝까지</b>, <b>오른쪽 끝까지</b> 돌려 보세요!<br>시리얼 모니터에서 <b>가장 작은 숫자</b>와 <b>가장 큰 숫자</b>를 찾아보세요.<br><span class="mute" style="font-size:32px">오른쪽으로 돌릴수록 숫자가 커져요.</span></div>
  <div class="code-box"><span class="k">int</span> sensorValue = <span class="k">analogRead</span>(sensorPin);</div>
  <p class="copyhint">📋 전체 코드는 사이트에서 복사해요 → <b>""" + SITE + """</b> 의 1단계</p>"""))

# 8 범위
slides.append(body(8, "🔎 확인해 봅시다!", """  <div class="big-row">
    <div class="bignum"><div class="v">0</div><div class="t">가장 작은 숫자</div></div>
    <div style="flex:1"><div class="gauge"><i></i></div><div class="gauge-labels"><span>왼쪽 끝</span><span>오른쪽 끝</span></div></div>
    <div class="bignum"><div class="v">1023</div><div class="t">가장 큰 숫자</div></div>
  </div>
  <div class="callout" style="margin-bottom:32px"><b>analogRead()</b>로 읽은 값은 <b>0 ~ 1023</b> 사이의 숫자예요.</div>
  <div class="annot"><div class="code-box sm"><span class="k">analogRead</span>(sensorPin);</div><div class="say">센서의 값을 <b>숫자로 읽어요!</b></div></div>"""))

# 9 2단계 밝기 숫자
def bar(num, pct, desc):
    return (f'<div class="bar-row"><span class="bar-num">{num}</span>'
            f'<div class="bar-track"><div class="bar-fill" style="width:{pct}%"></div></div>'
            f'<span class="bar-desc">{desc}</span></div>')

slides.append(body(9, "⭐⭐ 2단계 · LED 밝기를 직접 정해보자", """  <p class="lead">LED 밝기는 <b>숫자</b>로 정할 수 있어요!</p>
  """ + bar(0, 0, "완전히 꺼짐") + bar(100, 39.2, "조금 밝음") + bar(200, 78.4, "많이 밝음") + bar(255, 100, "가장 밝음")))

# 10 2단계 미션
slides.append(body(10, "⭐⭐ 2단계 · 빈칸을 채워 LED를 켜 보세요!", """  <div class="code-box" style="margin-bottom:36px"><span class="k">pinMode</span>(<span class="n">____</span>, OUTPUT);
<span class="k">analogWrite</span>(<span class="n">____</span>, <span class="n">____</span>);</div>
  <div class="row" style="margin-bottom:8px">
    <div class="card grow"><div class="role" style="font-size:38px">다 채웠다면?</div><div class="desc" style="font-size:34px">숫자 100을 아래 순서로 바꿔서<br>밝기를 비교해 보세요.<br><b style="color:#3B82F6">30 → 100 → 200 → 255</b></div></div>
    <div class="card grow"><div class="role" style="font-size:38px">생각해 보기 🤔</div><div class="desc" style="font-size:34px">숫자가 커질수록<br>LED는 어떻게 변할까요?</div></div>
  </div>
  <p class="copyhint">📋 빈칸 코드는 사이트에서 복사해요 → <b>""" + SITE + """</b> 의 2단계</p>"""))

# 2단계 정답
slides.append(body(0, "✅ 2단계 정답 " + HINT, """  <div class="code-box sm">""" + "\n".join([
    '<span class="k">int</span> ledPin = 9;',
    '<span class="k">void</span> setup() {',
    aline('  <span class="k">pinMode</span>(<span class="n">ledPin</span>, OUTPUT);', '  pinMode(ledPin, OUTPUT);', '①', 40),
    '}',
    '<span class="k">void</span> loop() {',
    aline('  <span class="k">analogWrite</span>(<span class="n">ledPin</span>, <span class="n">100</span>);', '  analogWrite(ledPin, 100);', '② ③', 40),
    '}',
]) + """</div>
  """ + chips([("①", "ledPin"), ("②", "ledPin"), ("③", "100")])))

# 11 3단계 흐름
slides.append(body(11, "⭐⭐⭐ 3단계 · 가변저항으로 LED 밝기를 조절하자!", """  <p class="lead">가변저항을 돌리면 LED의 밝기도 <b>같이 변하도록</b> 만들어 봅니다!</p>
  <div class="flow">
    <div class="flow-box">🎛️<br>가변저항을<br>돌려요</div><div class="flow-arrow">→</div>
    <div class="flow-box hl">숫자를<br>읽어요<small>analogRead</small></div><div class="flow-arrow">→</div>
    <div class="flow-box hl">밝기 숫자로<br>바꿔요<small>map</small></div><div class="flow-arrow">→</div>
    <div class="flow-box hl">LED 밝기가<br>변해요!<small>analogWrite</small></div>
  </div>
  <p class="copyhint">📋 코드는 사이트에서 복사해요 → <b>""" + SITE + """</b> 의 3단계</p>"""))

# 12 map
slides.append(body(12, "🧠 새로운 코드 발견! map()", """  <div class="code-box" style="margin-bottom:32px"><span class="k">map</span>(sensorValue, 0, 1023, 0, 255);</div>
  <div class="row" style="margin-bottom:32px">
    <div class="card grow" style="text-align:center"><div class="fn" style="margin:0 0 10px;font-size:44px">sensorValue</div><div class="desc">지금 읽은<br>가변저항 숫자</div></div>
    <div class="card grow" style="text-align:center"><div class="fn" style="margin:0 0 10px;font-size:44px">0, 1023</div><div class="desc">가변저항이 낼 수 있는<br><b>숫자의 범위</b></div></div>
    <div class="card grow" style="text-align:center;border-color:#3B82F6"><div class="fn" style="margin:0 0 10px;font-size:44px">0, 255</div><div class="desc">LED가 쓸 수 있는<br><b>밝기의 범위</b></div></div>
  </div>
  <div class="callout">0~1023 숫자를 <b>0~255 숫자로 줄여서</b> 바꿔 줘요.<br>가변저항 값이 <b>전체의 몇 %</b>인지 그대로 LED 밝기의 몇 %로 옮겨요!</div>"""))

# 12-2 map 예시
slides.append(body(0, "🔍 map()은 이렇게 바꿔 줘요", """  <div class="row" style="align-items:center;margin-bottom:34px">
    <div class="card grow" style="text-align:center;padding:26px 10px"><div class="desc">가변저항</div><div class="fn" style="margin:6px 0 0;font-size:52px">0</div><div class="flow-arrow" style="font-size:40px">↓</div><div class="fn" style="margin:0;font-size:52px">0</div><div class="desc">LED 꺼짐</div></div>
    <div class="card grow" style="text-align:center;padding:26px 10px"><div class="desc">가변저항</div><div class="fn" style="margin:6px 0 0;font-size:52px">256</div><div class="flow-arrow" style="font-size:40px">↓</div><div class="fn" style="margin:0;font-size:52px">63</div><div class="desc">조금 밝음</div></div>
    <div class="card grow" style="text-align:center;padding:26px 10px;border-color:#3B82F6"><div class="desc">가변저항</div><div class="fn" style="margin:6px 0 0;font-size:52px">512</div><div class="flow-arrow" style="font-size:40px">↓</div><div class="fn" style="margin:0;font-size:52px">127</div><div class="desc">절반 밝기</div></div>
    <div class="card grow" style="text-align:center;padding:26px 10px"><div class="desc">가변저항</div><div class="fn" style="margin:6px 0 0;font-size:52px">768</div><div class="flow-arrow" style="font-size:40px">↓</div><div class="fn" style="margin:0;font-size:52px">191</div><div class="desc">꽤 밝음</div></div>
    <div class="card grow" style="text-align:center;padding:26px 10px"><div class="desc">가변저항</div><div class="fn" style="margin:6px 0 0;font-size:52px">1023</div><div class="flow-arrow" style="font-size:40px">↓</div><div class="fn" style="margin:0;font-size:52px">255</div><div class="desc">가장 밝음</div></div>
  </div>
  <div class="callout">가변저항을 <b>반쯤 돌리면(512)</b> LED도 <b>반쯤 밝아져요(127)</b>.<br>왜 바꿀까요? analogWrite()는 <b>255까지만</b> 알아듣기 때문이에요.</div>"""))

# 3단계 정답
slides.append(body(0, "✅ 3단계 정답 " + HINT, """  <div class="code-box xs">""" + "\n".join([
    aline('<span class="k">pinMode</span>(<span class="n">ledPin</span>, OUTPUT);', 'pinMode(ledPin, OUTPUT);', '①'),
    aline('<span class="k">int</span> sensorValue = <span class="k">analogRead</span>(<span class="n">sensorPin</span>);', 'int sensorValue = analogRead(sensorPin);', '②'),
    '<span class="k">int</span> brightness = <span class="k">map</span>(sensorValue, 0, 1023, 0, 255);',
    aline('<span class="k">analogWrite</span>(<span class="n">ledPin</span>, brightness);', 'analogWrite(ledPin, brightness);', '③'),
]) + """</div>
  """ + chips([("①", "ledPin"), ("②", "sensorPin"), ("③", "ledPin")])))

# 보너스: 시리얼 플로터
slides.append(body(0, "👀 보너스 · 시리얼 플로터로 그래프 보기", """  <div class="compact" style="display:flex;flex-direction:column;gap:14px;margin-bottom:26px">
    <div class="item"><span class="no">1</span><div class="name" style="font-size:36px">3단계 코드를 업로드해요 <span class="sub">(밝기 숫자를 화면에 보내 줘요)</span></div></div>
    <div class="item"><span class="no">2</span><div class="name" style="font-size:36px">시리얼 모니터는 닫아요</div></div>
    <div class="item"><span class="no">3</span><div class="name" style="font-size:36px">도구 → <b>시리얼 플로터</b>를 열어요 <span class="sub">(속도 9600)</span></div></div>
    <div class="item"><span class="no">4</span><div class="name" style="font-size:36px">가변저항을 천천히 돌려 보세요</div></div>
  </div>
  <div class="callout">숫자가 <b>그래프</b>로 그려져요. 돌리는 방향에 따라 그래프가 어떻게 변하나요? 🤔</div>"""))

# 13 4단계 3구간
slides.append(body(13, "🔥 4단계 · 밝기에 따라 LED 상태를 바꿔보자!", """  <p class="lead">가변저항의 숫자에 따라 LED의 밝기를 <b>3단계</b>로 나눠요.</p>
  <div class="zones">
    <div class="zone z1">어둡게<small>30</small></div>
    <div class="zone z2">중간 밝기<small>100</small></div>
    <div class="zone z3">가장 밝게<small>255</small></div>
  </div>
  <div class="ticks"><span class="l" style="left:0">0</span><span style="left:29.32%">300</span><span style="left:68.42%">700</span><span class="r" style="left:100%">1023</span></div>
  <p class="copyhint" style="margin-top:44px">📋 코드는 사이트에서 복사해요 → <b>""" + SITE + """</b> 의 4단계</p>"""))

# 14 else if
slides.append(body(14, "🔥 4단계 핵심 줄 · else if", """  <div class="annot"><div class="code-box sm"><span class="k">if</span> (sensorValue &lt; 300) {</div><div class="say"><b>300</b>보다 작다면</div></div>
  <div class="annot"><div class="code-box sm">} <span class="k">else if</span> (sensorValue &lt; 700) {</div><div class="say">아니고, <b>700</b>보다 작다면</div></div>
  <div class="annot" style="margin-bottom:40px"><div class="code-box sm">} <span class="k">else</span> {</div><div class="say">둘 다 아니라면</div></div>
  <div class="callout"><b>else if</b> = “아니고, 이렇다면”<br>위에서부터 <b>차례로</b> 물어봐요!</div>"""))

# 4단계 정답
slides.append(body(0, "✅ 4단계 정답 " + HINT, """  <div class="code-box xs">""" + "\n".join([
    aline('<span class="k">pinMode</span>(<span class="n">ledPin</span>, OUTPUT);', 'pinMode(ledPin, OUTPUT);', '①'),
    aline('<span class="k">int</span> sensorValue = <span class="k">analogRead</span>(<span class="n">sensorPin</span>);', 'int sensorValue = analogRead(sensorPin);', '②'),
    aline('<span class="k">if</span> (sensorValue &lt; <span class="n">300</span>) {', 'if (sensorValue < 300) {', '③'),
    aline('  <span class="k">analogWrite</span>(ledPin, <span class="n">30</span>);', '  analogWrite(ledPin, 30);', '④'),
    aline('} <span class="k">else if</span> (sensorValue &lt; <span class="n">700</span>) {', '} else if (sensorValue < 700) {', '⑤'),
    aline('  <span class="k">analogWrite</span>(ledPin, <span class="n">100</span>);', '  analogWrite(ledPin, 100);', '⑥'),
    '} <span class="k">else</span> {',
    aline('  <span class="k">analogWrite</span>(ledPin, <span class="n">255</span>);', '  analogWrite(ledPin, 255);', '⑦'),
    '}',
]) + """</div>
  """ + chips([("①", "ledPin"), ("②", "sensorPin"), ("③", "300"), ("④", "30"), ("⑤", "700"), ("⑥", "100"), ("⑦", "255")])))

# 15 도전 미션
slides.append(body(15, "🏆 도전 미션", """  <p class="lead">모든 단계를 성공했다면 도전해 보세요!</p>
  <div class="cgrid">
    <div class="ccard"><span class="badge">도전 1</span><div class="q">경계 숫자를 바꿔 보세요</div><div class="h">4단계의 300과 700을 다른 숫자로 바꾸면 어떻게 될까요?</div><div class="code-box"><span class="n">200</span>  /  <span class="n">800</span></div></div>
    <div class="ccard"><span class="badge">도전 2 🔥</span><div class="q">LED를 7번 핀으로 옮겨 보세요</div><div class="h"><b>analogWrite(ledPin, 100)</b>과 <b>200</b>을 비교해요. 왜 달라질까요?</div><div class="code-box"><span class="k">int</span> ledPin = <span class="n">7</span>;</div></div>
    <div class="ccard"><span class="badge">도전 3 🔥</span><div class="q">오른쪽으로 돌릴수록 어두워지게!</div><div class="h">map의 숫자 순서를 바꿔 보세요.</div><div class="code-box"><span class="k">map</span>(sensorValue,<br>    0, 1023, <span class="n">255, 0</span>)</div></div>
  </div>"""))

# 16 오늘 배운 것
slides.append(body(16, "📖 오늘 배운 것", """  <div class="recap">
    <div class="recap-row"><span class="term">analogRead()</span><span class="def">센서의 숫자를 읽어요</span></div>
    <div class="recap-row"><span class="term">analogWrite()</span><span class="def">LED의 밝기를 바꿔요</span></div>
    <div class="recap-row"><span class="term">if / else if</span><span class="def">조건을 확인해요</span></div>
    <div class="recap-row"><span class="term">map()</span><span class="def">0~1023을 0~255로 바꿔요</span></div>
  </div>
  <div class="nums">
    <div class="card"><div class="t">센서(analogRead)</div><div class="v">0 ~ 1023</div></div>
    <div class="card"><div class="t">LED 밝기(analogWrite)</div><div class="v">0 ~ 255</div></div>
  </div>"""))


def quiz(n, k, q, opts, hint=""):
    items = "".join(f'<div class="opt"><span class="no">{i+1}</span><span>{o}</span></div>' for i, o in enumerate(opts))
    h = f'<p class="quiz-hint">{hint}</p>' if hint else ""
    return (
        f'<div class="slide slide-body" id="slide-{n}">\n'
        f'  <div class="content">\n  <div class="quiz-tag">QUIZ {k}</div>\n  <div class="quiz-q">{q}</div>\n'
        f'  <div class="opts">{items}</div>\n  {h}\n  </div>\n  {footer()}\n  {numtag(n)}\n</div>'
    )


slides.append(quiz(17, 1, "다음 중 LED의 <b style='color:#3B82F6'>밝기를 조절하는 명령어</b>는 무엇일까요?",
                   ['<span class="m">analogRead()</span>', '<span class="m">digitalRead()</span>',
                    '<span class="m">analogWrite()</span>', '<span class="m">delay()</span>']))
slides.append(quiz(18, 2, "<span style='font-family:ui-monospace,Menlo,monospace;color:#3B82F6'>analogWrite(ledPin, 255);</span><br>LED는 어떻게 될까요?",
                   ["완전히 꺼진다", "아주 어둡게 켜진다", "가장 밝게 켜진다", "센서값을 읽는다"]))
slides.append(quiz(19, 3, "<span style='font-family:ui-monospace,Menlo,monospace;color:#3B82F6'>if (sensorValue &gt; 500)</span><br>이 코드의 뜻은 무엇일까요?",
                   ["센서값이 500보다 작다면", "센서값이 500보다 크다면", "LED를 500번 켠다", "500초 동안 기다린다"],
                   "힌트: <b>&lt;</b> 는 “작다”, <b>&gt;</b> 는 “크다” 예요."))

# 20 마무리
slides.append(f"""<div class="slide slide-ending on-dark" id="slide-20">
  <div class="ending-content">
    <h2 class="ending-title">수고했어요! 👏</h2>
    <div class="section-rule" style="margin:0 auto 32px"></div>
    <p class="ending-subtitle">코드는 언제든 사이트에서 다시 볼 수 있어요</p>
    <div class="ending-contact">{SITE}</div>
  </div>
  {footer()}
</div>""")


def answer(n, k, no, text, extra):
    return (
        f'<div class="slide slide-body" id="slide-{n}">\n'
        f'  <div class="content">\n  <div class="quiz-tag">✅ QUIZ {k} 정답</div>\n'
        f'  <div class="ans-row"><span class="ans-no">{no}</span><div class="ans-text">{text}</div></div>\n'
        f'  {extra}\n  </div>\n  {footer()}\n  {numtag(n)}\n</div>'
    )


slides.append(answer(22, 1, "③", '<span class="m">analogWrite()</span>',
                     '<div class="code-box" style="margin-bottom:32px"><span class="k">analogWrite</span>(ledPin, 150);</div><div class="callout">LED의 밝기를 <b>숫자로</b> 조절할 수 있습니다!</div>'))
slides.append(answer(23, 2, "③", "가장 밝게 켜진다",
                     '<div class="nums"><div class="card"><div class="t">0</div><div class="v">꺼짐</div></div><div class="card"><div class="t">255</div><div class="v">가장 밝음</div></div></div>'))
slides.append(answer(24, 3, "②", "센서값이 500보다 크다면",
                     '<div class="callout"><b>&gt;</b> = ~보다 크다 &nbsp;·&nbsp; <b>&lt;</b> = ~보다 작다</div>'))

# 강사용 메모 2장
slides.append(f"""<div class="slide slide-body" id="slide-0">
  <span class="teacher-tag">강사용 · 학생에게 보여주지 마세요</span>
  <h2 class="slide-title">강사용 메모 ① 수업 포인트</h2>
  <ul class="tlist">
    <li><b>복습 퀴즈</b>는 지난 시간(조도센서) 퀴즈 3개를 그대로 썼어요. 정답은 바로 다음 슬라이드예요.</li>
    <li><b>단계 정답 슬라이드(2·3·4단계 바로 뒤)</b>는 아이들이 막혔을 때만 넘겨 보여 주세요.</li>
    <li><b>가변저항은 오른쪽으로 돌릴수록 밝아져요</b>(오른쪽 다리 5V, 왼쪽 GND). 가변저항 모델에 따라 반대일 수 있으니 수업 전에 한 번 돌려 보세요.</li>
    <li><b>PWM은 설명하지 않아요.</b> “밝기를 바꿀 수 있는 특별한 핀(~ 표시)”이라고만 말해요.</li>
    <li><b>map()은 문법 문제로 내지 않아요.</b> “센서의 0~1023 숫자를 LED가 쓰는 0~255 숫자로 비율 그대로 바꿔주는 코드”라고만 설명해요. 괄호 속 숫자 5개의 뜻과 예시 5개(0→0, 256→63, 512→127, 768→191, 1023→255)는 슬라이드에 있어요. 공식은 설명하지 않아요.</li>
    <li><b>핵심은 연결 하나:</b> analogRead(숫자 읽기) → analogWrite(숫자로 밝기 바꾸기). 마무리 멘트: “지난번에는 빛이 숫자를 바꿨고, 오늘은 우리가 손으로 숫자를 바꾼 거야.”</li>
    <li><b>도전 2(7번 핀):</b> 100이면 꺼지고 200이면 그냥 켜져요. “왜 9번만 되지?”를 스스로 발견하게 해 주세요.</li>
    <li><b>퀴즈 3의 &gt; 는 오늘 코드에 안 나와요.</b> 그래서 힌트 줄을 넣어 두었어요.</li>
  </ul>
  {footer()}
  {numtag(0)}
</div>""")

slides.append(f"""<div class="slide slide-body" id="slide-0">
  <span class="teacher-tag">강사용 · 학생에게 보여주지 마세요</span>
  <h2 class="slide-title">강사용 메모 ② 시간 운영 (80분)</h2>
  <table class="ttable">
    <tr><th>시간</th><th>내용</th><th>메모</th></tr>
    <tr><td>5분</td><td>지난 시간 복습</td><td>퀴즈 3문제 + 정답</td></tr>
    <tr><td>10분</td><td>회로 연결</td><td>늘어나기 쉬워요 (다리 3개, LED 방향, 지난번 7번 → 오늘 9번)</td></tr>
    <tr><td>12분</td><td>1단계</td><td>0과 1023 찾기</td></tr>
    <tr><td>15분</td><td>2단계</td><td>빈칸 3개 + 밝기 4가지 비교</td></tr>
    <tr><td>15분</td><td>3단계</td><td>map 설명은 짧게</td></tr>
    <tr><td>15분</td><td>4단계</td><td>else if 설명 5분 포함</td></tr>
    <tr><td>5분</td><td>도전 미션</td><td>빨리 끝난 팀부터</td></tr>
    <tr><td>3분</td><td>퀴즈 + 정리</td><td>합계 80분</td></tr>
  </table>
  <div class="callout tcall" style="margin-bottom:14px"><b>늦어지면:</b> 도전 미션 생략 · 퀴즈는 1문제만 · 막힌 팀은 정답 슬라이드로 바로 넘어가기</div>
  <div class="callout tcall"><b>빨리 끝나면:</b> 시리얼 플로터 보너스 · 도전 2·3 · 4단계 경계값을 팀마다 다르게 정해 비교하기</div>
  {footer()}
  {numtag(0)}
</div>""")

import re
# 퀴즈 정답은 부록으로 몰지 않고 각 문제 바로 뒤에 둔다 (수업 중 바로 넘겨 보여주기 위해)
_quizzes = [x for x in slides if re.search(r'class="quiz-tag">QUIZ \d<', x)]
_answers = [x for x in slides if '✅ QUIZ' in x]
_rest = [x for x in slides if x not in _quizzes and x not in _answers]
assert len(_quizzes) == len(_answers) == 3
_at = next(i for i, x in enumerate(_rest) if '오늘 배운 것' in x and 'slide-title' in x)
_inter = [y for pair in zip(_quizzes, _answers) for y in pair]
slides[:] = _rest[:_at + 1] + _inter + _rest[_at + 1:]
TOTAL = len(slides)
for _i, _s in enumerate(slides, 1):
    _s = re.sub(r'id="slide-\d+"', f'id="slide-{_i}"', _s, count=1)
    _s = re.sub(r'<div class="slide-number">\d+ / \d+</div>', f'<div class="slide-number">{_i} / {TOTAL}</div>', _s)
    slides[_i - 1] = _s

FONT_B64 = base64.b64encode(open(os.path.join(_here, "..", "assets", "PretendardVariable.woff2"), "rb").read()).decode()
FONT_FACE = "@font-face{font-family:'PretendardEmb';src:url(data:font/woff2;base64," + FONT_B64 + ") format('woff2');font-weight:45 920;font-style:normal;font-display:block}"

PRESENT_JS = """
(function () {
  var slides = [].slice.call(document.querySelectorAll('.slide')), cur = 0, on = false;
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = (window.innerWidth - 1920 * s) / 2, y = (window.innerHeight - 1080 * s) / 2;
    slides[cur].style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  function show(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (el, k) { el.classList.toggle('cur', k === cur); if (k !== cur) el.style.transform = ''; });
    fit();
    try { history.replaceState(null, '', '#slide-' + (cur + 1)); } catch (e) {}
  }
  function startIndex() {
    var m = /slide-(\\d+)/.exec(location.hash);
    if (m) return Math.min(slides.length, Math.max(1, +m[1])) - 1;
    return Math.max(0, Math.min(slides.length - 1, Math.round(window.scrollY / (1080 + 24))));
  }
  function enter(i) {
    on = true; document.body.classList.add('present');
    var d = document.documentElement;
    if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
    show(i);
  }
  function exit() {
    var keep = cur; on = false; document.body.classList.remove('present');
    slides.forEach(function (el) { el.classList.remove('cur'); el.style.transform = ''; });
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    window.scrollTo(0, slides[keep].offsetTop - 44);
  }
  document.getElementById('presentBtn').addEventListener('click', function () { enter(startIndex()); });
  window.addEventListener('resize', function () { if (on) fit(); });
  document.addEventListener('click', function (e) {
    if (!on) return;
    if (e.clientX < window.innerWidth * 0.25) show(cur - 1); else show(cur + 1);
  });
  document.addEventListener('keydown', function (e) {
    var isP = e.code === 'KeyP' || e.key === 'p' || e.key === 'P' || e.key === 'ㅔ';
    var isF = e.code === 'KeyF' || e.key === 'f' || e.key === 'F' || e.key === 'ㄹ';
    if (!on) { if (isP && !e.ctrlKey && !e.metaKey && !e.altKey) { enter(startIndex()); } return; }
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); show(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); show(cur - 1); }
    else if (k === 'Home') { show(0); } else if (k === 'End') { show(slides.length - 1); }
    else if (k === 'Escape') { exit(); }
    else if (isF) {
      if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
    }
  });
})();
"""

nav = "".join(f'<a href="#slide-{i}">{i}</a>' for i in range(1, TOTAL + 1))

JS = """
document.getElementById('downloadBtn').addEventListener('click', async function() {
  const btn = this;
  const status = document.getElementById('downloadStatus');
  btn.disabled = true;
  status.textContent = '준비 중...';

  try {
    const slides = document.querySelectorAll('.slide');
    const zip = new JSZip();

    for (let i = 0; i < slides.length; i++) {
      status.textContent = `슬라이드 처리 중: ${i + 1}/${slides.length}`;
      const slide = slides[i];

      const originalStyle = slide.getAttribute('style') || '';

      slide.style.position = 'fixed';
      slide.style.left = '0';
      slide.style.top = '0';
      slide.style.width = '1920px';
      slide.style.height = '1080px';
      slide.style.zIndex = '99999';
      slide.style.overflow = 'hidden';
      slide.style.margin = '0';

      await new Promise(r => setTimeout(r, 200));

      try {
        const png = await domtoimage.toPng(slide, {
          width: 1920,
          height: 1080
        });
        zip.file(`slide-${String(i+1).padStart(2,'0')}.png`, png.split(',')[1], {base64: true});
      } catch (slideErr) {
        console.warn(`Slide ${i+1} failed, retrying...`, slideErr);
        await new Promise(r => setTimeout(r, 500));
        const png = await domtoimage.toPng(slide, { width: 1920, height: 1080 });
        zip.file(`slide-${String(i+1).padStart(2,'0')}.png`, png.split(',')[1], {base64: true});
      }

      if (originalStyle) {
        slide.setAttribute('style', originalStyle);
      } else {
        slide.removeAttribute('style');
      }
    }

    status.textContent = 'ZIP 생성 중...';
    const blob = await zip.generateAsync({type: 'blob'});
    saveAs(blob, 'arduino-codemode3-presentation.zip');
    status.textContent = '✓ 다운로드 완료!';
  } catch (error) {
    console.error('Download failed:', error);
    status.textContent = '오류: ' + error.message;
  } finally {
    btn.disabled = false;
  }
});
"""

html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920">
<title>코드모드 #3 · 가변저항으로 LED 밝기 조절하기</title>
<style>{FONT_FACE}
{CSS}</style>
</head>
<body>
<div class="slide-nav" id="slideNav"><span>Slide Navigator</span>{nav}<button class="present-btn" id="presentBtn">▶ 발표 모드 (P)</button><span class="hint">발표 모드: 방향키·스페이스로 넘기기, F 전체화면, Esc 종료</span></div>

{chr(10).join(slides)}

<div class="download-bar">
  <button id="downloadBtn">슬라이드 PNG 다운로드 (ZIP)</button>
  <span id="downloadStatus"></span>
</div>

<script src="https://cdn.jsdelivr.net/npm/dom-to-image-more@3.1.6/dist/dom-to-image-more.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>
<script>{JS}</script>
<script>{PRESENT_JS}</script>
</body>
</html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print("wrote", OUT, len(html), "bytes,", TOTAL, "slides")

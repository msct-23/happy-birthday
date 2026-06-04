/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
const CODE  = '2206';
const START = new Date('2023-06-22');

/* ═══════════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const raf = requestAnimationFrame;

function prog(el) {
  if (!el) return 0;
  const r  = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
}

/* ═══════════════════════════════════════════════
   LOCK SCREEN
═══════════════════════════════════════════════ */
(function () {
  const lock = $('lock');
  const dots = [...document.querySelectorAll('.ldot')];
  const err  = $('lock-err');
  let   val  = '';

  const cv = $('lock-canvas');
  const cx = cv.getContext('2d');
  let W, H;
  const pts = [];
  function rsz() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  for (let i = 0; i < 70; i++)
    pts.push({ x: Math.random(), y: Math.random(), s: Math.random() * .35 + .08, o: Math.random() * .25 + .04 });
  function drawBg() {
    cx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.y -= p.s / H;
      if (p.y < 0) p.y = 1;
      cx.beginPath(); cx.arc(p.x * W, p.y * H, 1.2, 0, Math.PI * 2);
      cx.fillStyle = `rgba(255,255,255,${p.o})`; cx.fill();
    });
    raf(drawBg);
  }
  window.addEventListener('resize', rsz); rsz(); drawBg();

  function setDots() {
    dots.forEach((d, i) => {
      d.className = 'ldot';
      if (i < val.length) d.classList.add('on');
    });
  }

  function wrong() {
    dots.forEach(d => { d.className = 'ldot err'; });
    err.classList.add('on');
    const pad = $('lock-pad');
    let dir = -1;
    for (let i = 0; i < 4; i++)
      setTimeout(() => { pad.style.transform = `translateX(${dir * 8}px)`; dir *= -1; }, i * 60);
    setTimeout(() => { pad.style.transform = ''; }, 250);
    setTimeout(() => { err.classList.remove('on'); val = ''; setDots(); }, 900);
  }

  function unlock() {
    dots.forEach(d => { d.className = 'ldot ok'; });
    setTimeout(() => {
      lock.classList.add('out');
      setTimeout(() => {
        lock.style.display = 'none';
        $('site').style.display = 'block';
        initSite();
      }, 750);
    }, 400);
  }

  function handle(v) {
    if (v === 'del') { val = val.slice(0, -1); setDots(); return; }
    if (v === 'ok')  { val === CODE ? unlock() : wrong(); return; }
    if (val.length >= 4) return;
    val += v; setDots();
    if (val.length === 4) setTimeout(() => { val === CODE ? unlock() : wrong(); }, 120);
  }

  $('lock-pad').addEventListener('click', e => {
    const k = e.target.closest('.lkey');
    if (k) handle(k.dataset.v);
  });
  document.addEventListener('keydown', e => {
    if (lock.style.display === 'none') return;
    if (/^[0-9]$/.test(e.key)) handle(e.key);
    else if (e.key === 'Backspace') handle('del');
    else if (e.key === 'Enter')     handle('ok');
  });
})();

/* ═══════════════════════════════════════════════
   SITE PRINCIPAL
═══════════════════════════════════════════════ */
function initSite() {

  /* ── Curseur ── */
  const cur = $('cur'), cur2 = $('cur2');
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
    setTimeout(() => { cur2.style.left = e.clientX + 'px'; cur2.style.top = e.clientY + 'px'; }, 85);
  });

  /* ════════════════════════════════════════════
     S0 — TOILE D'ARAIGNÉE
  ════════════════════════════════════════════ */
  const wv = $('web-canvas'), wc = wv.getContext('2d');
  let wW, wH, nodes = [], nmx = 0, nmy = 0;
  function rsWeb() {
    wW = wv.width = wv.offsetWidth; wH = wv.height = wv.offsetHeight;
    nodes = Array.from({ length: 14 }, () => ({
      x: Math.random() * wW, y: Math.random() * wH,
      vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55
    }));
  }
  wv.addEventListener('mousemove', e => { nmx = e.offsetX; nmy = e.offsetY; });
  function drawWeb() {
    wc.clearRect(0, 0, wW, wH);
    const p = prog($('s0'));
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > wW) n.vx *= -1;
      if (n.y < 0 || n.y > wH) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 260) {
          wc.beginPath(); wc.moveTo(nodes[i].x, nodes[i].y); wc.lineTo(nodes[j].x, nodes[j].y);
          wc.strokeStyle = `rgba(192,57,43,${(1 - d / 260) * .55 * Math.max(.04, p * 2.2)})`; wc.lineWidth = .8; wc.stroke();
        }
      }
      const dm = Math.hypot(nodes[i].x - nmx, nodes[i].y - nmy);
      if (dm < 200) {
        wc.beginPath(); wc.moveTo(nodes[i].x, nodes[i].y); wc.lineTo(nmx, nmy);
        wc.strokeStyle = `rgba(255,120,120,${(1 - dm / 200) * .32})`; wc.lineWidth = .5; wc.stroke();
      }
      wc.beginPath(); wc.arc(nodes[i].x, nodes[i].y, 2, 0, Math.PI * 2);
      wc.fillStyle = `rgba(192,57,43,${Math.max(.04, p)})`; wc.fill();
    }
    raf(drawWeb);
  }
  window.addEventListener('resize', rsWeb); rsWeb(); drawWeb();

  $('s0-years').addEventListener('mouseenter', () => $('s0-years').classList.add('alive'));
  $('egg0').addEventListener('click', () => {
    for (let i = 0; i < 16; i++)
      nodes.push({ x: wW * .5, y: wH * .5, vx: (Math.random() - .5) * 3.5, vy: (Math.random() - .5) * 3.5 });
    setTimeout(() => nodes.splice(14), 3500);
  });

  /* ════════════════════════════════════════════
     S1 — TITRE + ÉMOJIS
  ════════════════════════════════════════════ */
  let s1done = false;
  const EMOJ = ['❤️', '🕷️', '✈️', '🚐', '🏄', '⚽', '🎵', '💫', '🌊'];
  function chkS1() {
    if (!s1done && prog($('s1')) > .35) {
      s1done = true;
      setTimeout(() => $('tl1').classList.add('on'), 0);
      setTimeout(() => $('tlamp').classList.add('on'), 180);
      setTimeout(() => $('tl2').classList.add('on'), 320);
    }
    if ($('s1-bg')) $('s1-bg').style.transform = `translateY(${prog($('s1')) * 38}px)`;
  }
  setInterval(() => {
    if (prog($('s1')) < .1 || prog($('s1')) > .92) return;
    const e = document.createElement('span'); e.className = 'fe';
    e.textContent = EMOJ[Math.floor(Math.random() * EMOJ.length)];
    e.style.left = Math.random() * 100 + '%';
    e.style.animationDuration = (7 + Math.random() * 7) + 's';
    $('s1-floaters').appendChild(e);
    setTimeout(() => e.remove(), 14500);
  }, 750);

  /* ════════════════════════════════════════════
     S2 — TOILE SPIDERMAN
  ════════════════════════════════════════════ */
  const sv = $('sp-canvas'), sc = sv.getContext('2d');
  let spW, spH;
  function rsSp() { spW = sv.width = sv.offsetWidth; spH = sv.height = sv.offsetHeight; }
  function drawSpWeb(p) {
    sc.clearRect(0, 0, spW, spH);
    if (p <= 0) return;
    const cx = spW * .5, cy = spH * .38, maxR = Math.max(spW, spH) * .85, α = Math.min(1, p * 2.5);
    for (let s = 0; s < 12; s++) {
      const sp = Math.min(1, p * 12 - s * .22); if (sp <= 0) continue;
      const a = (s / 12) * Math.PI * 2 - Math.PI / 2;
      sc.beginPath(); sc.moveTo(cx, cy); sc.lineTo(cx + Math.cos(a) * maxR * sp, cy + Math.sin(a) * maxR * sp);
      sc.strokeStyle = `rgba(192,57,43,${α * .4})`; sc.lineWidth = 1; sc.stroke();
    }
    for (let r = 1; r <= 8; r++) {
      const rp = Math.min(1, p * 9 - r + 1); if (rp <= 0) continue;
      const rad = (r / 8) * maxR * .72;
      sc.beginPath();
      for (let a = 0; a <= rp * Math.PI * 2; a += .04) {
        const px = cx + Math.cos(a - Math.PI / 2) * rad, py = cy + Math.sin(a - Math.PI / 2) * rad;
        a === 0 ? sc.moveTo(px, py) : sc.lineTo(px, py);
      }
      sc.strokeStyle = `rgba(192,57,43,${α * .28})`; sc.lineWidth = .8; sc.stroke();
    }
  }
  window.addEventListener('resize', rsSp); rsSp();
  $('s2-spider').addEventListener('click', () => {
    const sp = $('s2-spider');
    sp.style.transition = 'all .5s cubic-bezier(.16,1,.3,1)';
    sp.style.transform  = 'translateY(-100px) rotate(360deg) scale(0)';
    setTimeout(() => { sp.style.transform = ''; sp.style.transition = ''; }, 650);
  });

  /* ════════════════════════════════════════════
     S3 — VAN
  ════════════════════════════════════════════ */
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div'); s.className = 'vstar';
    s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 55 + '%';
    s.style.animationDuration = (1.5 + Math.random() * 3) + 's';
    s.style.animationDelay = Math.random() * 3 + 's';
    $('s3-stars').appendChild(s);
  }
  function updVan() {
    const p = prog($('s3'));
    $('s3-van').style.left = (4 + p * 72) + '%';
    $('s3-sun').style.top  = (22 + p * 68) + '%';
    const sky = $('s3-sky'), stars = $('s3-stars'), sun = $('s3-sun');
    if (p < .28)      { sky.className = ''; stars.style.opacity = '0'; sun.style.opacity = '1'; }
    else if (p < .58) { sky.className = 'sunset'; }
    else              { sky.className = 'night'; stars.style.opacity = Math.min(1, (p - .58) * 6) + ''; sun.style.opacity = Math.max(0, 1 - (p - .58) * 7) + ''; }
  }

  /* ════════════════════════════════════════════
     S4 — VAGUES SURF
  ════════════════════════════════════════════ */
  const wvv = $('wave-canvas'), wvc = wvv.getContext('2d');
  let wvW, wvH, wvT = 0;
  function rsWv() { wvW = wvv.width = wvv.offsetWidth; wvH = wvv.height = wvv.offsetHeight; }
// Remplace toute la fonction drawWaves() par ça :
function drawWaves() {
  wvc.clearRect(0, 0, wvW, wvH);
  const bY = wvH * 0.45; // hauteur fixe, ne bouge plus avec le scroll

  [
    [`rgba(0,55,115,.85)`,   0,   1,   34],
    [`rgba(0,100,175,.65)`, .4, 1.3,   24],
    [`rgba(0,155,205,.5)`,  .8,  .75,  17],
    [`rgba(80,220,220,.3)`, 1.2, 1.6,  11],
    [`rgba(0,55,115,.85)`,   0,   1,   60],  // amp 34 → 60
  ].forEach(([col, off, sp, amp]) => {
    wvc.beginPath();
    wvc.moveTo(0, wvH); // part du bas-gauche
    wvc.lineTo(0, bY + Math.sin(off) * amp); // monte au bord gauche
    for (let x = 0; x <= wvW; x += 3) {
      const y = bY + Math.sin(x / wvW * Math.PI * 4 + wvT * sp + off) * amp;
      wvc.lineTo(x, y);
    }
    wvc.lineTo(wvW, wvH); // descend au bas-droite
    wvc.closePath();
    wvc.fillStyle = col;
    wvc.fill();
  });

  // écume
  wvc.beginPath();
  for (let x = 0; x <= wvW; x += 3) {
    const y = bY + Math.sin(x / wvW * Math.PI * 4 + wvT) * 34 - 4;
    x === 0 ? wvc.moveTo(0, y) : wvc.lineTo(x, y);
  }
  wvc.strokeStyle = 'rgba(255,255,255,.22)'; wvc.lineWidth = 3; wvc.stroke();

  // surfeur
  const surf = $('s4-surfer');
  const sx = 14 + prog($('s4')) * 60;
  surf.style.left = sx + '%';
  surf.style.top = (bY / wvH * 100 + Math.sin(sx / 100 * Math.PI * 4 + wvT) * 34 / wvH * 100 - 9) + '%';

  wvT += .024;
  raf(drawWaves);
}
  $('s4-surfer').addEventListener('click', () => {
    $('s4-secret').classList.add('on');
    setTimeout(() => $('s4-secret').classList.remove('on'), 2000);
  });
  window.addEventListener('resize', rsWv); rsWv(); drawWaves();

  /* ════════════════════════════════════════════
     S5 — FOOT
  ════════════════════════════════════════════ */
  const ball = $('s5-ball');
  let bx = 50, by = 50, bvx = .38, bvy = .5, goals = 3;
  ball.addEventListener('click', () => {
    goals++;
    $('score-l').textContent = goals; $('score-l').classList.add('pop');
    setTimeout(() => $('score-l').classList.remove('pop'), 280);
    $('s5-goal').classList.add('on'); setTimeout(() => $('s5-goal').classList.remove('on'), 1500);
    bvy = -2.3; bvx = (Math.random() - .5) * 3;
  });
  function animBall() {
    const p = prog($('s5'));
    if (p > .08 && p < .92) {
      bx += bvx; by += bvy; bvy += .056;
      if (bx < 4 || bx > 96) bvx *= -1;
      if (by > 82) { by = 82; bvy *= -.58; bvx *= .98; }
      if (by < 5)  { by = 5; bvy *= -1; }
      ball.style.left = bx + '%'; ball.style.top = by + '%';
    }
    raf(animBall);
  }
  animBall();

  /* ════════════════════════════════════════════
     S6 — PHOTOMATON
  ════════════════════════════════════════════ */
  const frames = [...document.querySelectorAll('.pframe')];
  frames.forEach(f => {
    const img = f.querySelector('img');
    if (img) img.addEventListener('error', () => f.classList.add('nope'));
  });
  let lastOut = 0;
  function updPhoto() {
    const p = prog($('s6'));
    const n = Math.min(frames.length, Math.floor(p * (frames.length + 1) * 1.6));
    if (n > lastOut) {
      $('booth-flash').classList.add('on');
      setTimeout(() => $('booth-flash').classList.remove('on'), 160);
    }
    frames.forEach((f, i) => i < n ? f.classList.add('out') : f.classList.remove('out'));
    lastOut = n;
  }

 /* ════════════════════════════════════════════
   S7 — MUSIQUE
════════════════════════════════════════════ */
const eqEl = $('eq-bars'); const eqBars = [];
for (let i = 0; i < 26; i++) {
  const b = document.createElement('div'); b.className = 'eq-bar';
  eqEl.appendChild(b); eqBars.push(b);
}
let isSpinning = false;
let audio = null;

$('s7-vinyl').addEventListener('click', () => {
  isSpinning = !isSpinning;
  $('vinyl-disc').classList.toggle('spin', isSpinning);

  if (isSpinning) {
    audio = new Audio('images/musique.mp3');
    audio.volume = 0.7;
    audio.play();
    $('s7-msg').classList.add('on');
    setTimeout(() => $('s7-msg').classList.remove('on'), 2800);
  } else {
    if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
  }
});

function animEq() {
  const p = prog($('s7')), int = isSpinning ? 1 : Math.max(p, .08), t = Date.now();
  eqBars.forEach((b, i) => {
    const v = (Math.sin(t / 175 + i * .65) * .5 + .5) * (Math.sin(t / 90 + i * 1.2) * .4 + .6);
    b.style.height = (3 + v * 63 * int) + 'px';
  });
  raf(animEq);
}
animEq();

  /* ════════════════════════════════════════════
     S9 — FINAL
  ════════════════════════════════════════════ */
  const PCOLS = ['#c0392b', '#e91e63', '#ff6b9d', '#ffd700', '#fff'];
  const pp = $('s9-particles');
  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div'); p.className = 'fpt';
    const s = 2 + Math.random() * 4;
    p.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;background:${PCOLS[i % PCOLS.length]};animation-duration:${7 + Math.random() * 12}s;animation-delay:${Math.random() * 8}s;`;
    pp.appendChild(p);
  }

  let envOpen = false;
  $('s9-env').addEventListener('click', () => {
    if (envOpen) return; envOpen = true;
    $('env-flap').classList.add('open');
    setTimeout(() => $('env-letter').classList.add('show'), 550);
    $('env-hint').style.opacity = '0';
  });

  function tick() {
    const d = Date.now() - START, days = Math.floor(d / 864e5), h = Math.floor(d % 864e5 / 36e5), m = Math.floor(d % 36e5 / 6e4), s = Math.floor(d % 6e4 / 1e3);
    $('ti-d').textContent = days.toLocaleString('fr');
    $('ti-h').textContent = h; $('ti-m').textContent = m; $('ti-s').textContent = s;
    $('s9-date').textContent = START.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  tick(); setInterval(tick, 1000);

  /* ════════════════════════════════════════════
     BOUCLE SCROLL
  ════════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    chkS1();
    drawSpWeb(prog($('s2')));
    updVan();
    updPhoto();
  }, { passive: true });
  chkS1();

  /* ════════════════════════════════════════════
     EASTER EGGS
  ════════════════════════════════════════════ */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let ki = 0;
  document.addEventListener('keydown', e => {
    ki = e.key === KONAMI[ki] ? ki + 1 : 0;
    if (ki === KONAMI.length) { $('konami').classList.add('on'); ki = 0; }
  });
  $('konami-close').addEventListener('click', () => $('konami').classList.remove('on'));

  let tc = 0;
  $('s1-title')?.addEventListener('click', () => {
    tc++;
    if (tc === 3) { document.body.style.filter = 'hue-rotate(180deg)'; setTimeout(() => { document.body.style.filter = ''; tc = 0; }, 2000); }
  });

  if (window.DeviceMotionEvent) {
    let last = 0;
    window.addEventListener('devicemotion', e => {
      const a = e.accelerationIncludingGravity;
      if (Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z) > 38 && Date.now() - last > 2500) {
        last = Date.now(); $('konami').classList.add('on');
      }
    });
  }

  console.log('%c🕷️ Konami : ↑↑↓↓←→←→BA', 'color:#c0392b;font-size:13px;font-weight:bold');
}

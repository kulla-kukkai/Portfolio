// ✿ Flower Cursor — cursor.js
// Custom animated flower cursor with trailing ring

(function () {
  // ── Create cursor elements ──────────────────────────────────────────────────
  const flower = document.createElement('div');
  flower.id = 'flower-cursor';
  flower.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <!-- petals -->
      <ellipse cx="20" cy="8"  rx="4" ry="7" fill="#f5b8cb" opacity="0.9"/>
      <ellipse cx="20" cy="32" rx="4" ry="7" fill="#f5b8cb" opacity="0.9"/>
      <ellipse cx="8"  cy="20" rx="7" ry="4" fill="#f5b8cb" opacity="0.9"/>
      <ellipse cx="32" cy="20" rx="7" ry="4" fill="#f5b8cb" opacity="0.9"/>
      <ellipse cx="11" cy="11" rx="4" ry="7" fill="#fbcfe0" opacity="0.85" transform="rotate(-45 11 11)"/>
      <ellipse cx="29" cy="11" rx="4" ry="7" fill="#fbcfe0" opacity="0.85" transform="rotate(45 29 11)"/>
      <ellipse cx="11" cy="29" rx="4" ry="7" fill="#fbcfe0" opacity="0.85" transform="rotate(45 11 29)"/>
      <ellipse cx="29" cy="29" rx="4" ry="7" fill="#fbcfe0" opacity="0.85" transform="rotate(-45 29 29)"/>
      <!-- center -->
      <circle cx="20" cy="20" r="7" fill="#a8d4e6"/>
      <circle cx="20" cy="20" r="4" fill="#7bbdd6"/>
      <circle cx="18" cy="18" r="1.5" fill="rgba(255,255,255,0.6)"/>
    </svg>
  `;

  const ring = document.createElement('div');
  ring.id = 'cursor-ring';

  document.body.appendChild(flower);
  document.body.appendChild(ring);

  // ── Inject styles ───────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }

    #flower-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 40px; height: 40px;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease;
      will-change: left, top;
    }

    #flower-cursor svg {
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  filter 0.3s ease;
      filter: drop-shadow(0 2px 6px rgba(248, 167, 196, 0.4));
      transform-origin: center;
    }

    #flower-cursor.hovering svg {
      transform: scale(1.5) rotate(30deg);
      filter: drop-shadow(0 4px 12px rgba(168, 212, 230, 0.6));
    }

    #flower-cursor.clicking svg {
      transform: scale(0.85) rotate(-15deg);
    }

    #cursor-ring {
      position: fixed;
      top: 0; left: 0;
      width: 56px; height: 56px;
      border: 1.5px dashed #f5b8cb;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      opacity: 0.6;
      transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                  height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                  border-color 0.3s ease,
                  opacity 0.3s ease;
      will-change: left, top;
    }

    #cursor-ring.hovering {
      width: 80px; height: 80px;
      border-color: #a8d4e6;
      border-style: solid;
      opacity: 0.4;
    }

    #cursor-ring.clicking {
      width: 40px; height: 40px;
      opacity: 0.8;
      border-color: #f5b8cb;
    }

    /* Petal trail */
    .petal-trail {
      position: fixed;
      pointer-events: none;
      z-index: 99990;
      font-size: 14px;
      opacity: 1;
      transform: translate(-50%, -50%);
      animation: petalFall 0.8s ease-out forwards;
      will-change: transform, opacity;
    }

    @keyframes petalFall {
      0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
      100% { opacity: 0;   transform: translate(-50%, calc(-50% + 40px)) scale(0.4) rotate(60deg); }
    }

    /* Spin animation when idle */
    @keyframes flowerSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // ── Mouse tracking ──────────────────────────────────────────────────────────
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let lastX = mouseX;
  let lastY = mouseY;
  let trailTimer = 0;
  let idleTimer = null;
  let isIdle = false;

  const PETALS = ['✿', '❀', '✾', '❁', '✽'];

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    flower.style.left = mouseX + 'px';
    flower.style.top  = mouseY + 'px';

    // trail every ~80px of movement
    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    trailTimer += dist;
    if (trailTimer > 80) {
      spawnPetal(mouseX, mouseY);
      trailTimer = 0;
    }
    lastX = mouseX; lastY = mouseY;

    // reset idle
    isIdle = false;
    flower.querySelector('svg').style.animation = '';
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isIdle = true;
      flower.querySelector('svg').style.animation = 'flowerSpin 3s linear infinite';
    }, 2500);
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // ── Hover interactions ──────────────────────────────────────────────────────
  const interactables = 'a, button, .nav-item, .skill-cell, .project-row, .contact-link, [data-hover]';

  function attachHover(el) {
    el.addEventListener('mouseenter', () => {
      flower.classList.add('hovering');
      ring.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      flower.classList.remove('hovering');
      ring.classList.remove('hovering');
    });
  }

  document.querySelectorAll(interactables).forEach(attachHover);

  // Watch for dynamically added elements
  const mutationObserver = new MutationObserver(() => {
    document.querySelectorAll(interactables).forEach(el => {
      if (!el.dataset.cursorBound) {
        el.dataset.cursorBound = '1';
        attachHover(el);
      }
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  // ── Click interactions ──────────────────────────────────────────────────────
  document.addEventListener('mousedown', () => {
    flower.classList.add('clicking');
    ring.classList.add('clicking');
    // burst petals on click
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnPetal(mouseX + (Math.random()-0.5)*20, mouseY + (Math.random()-0.5)*20), i * 40);
    }
  });
  document.addEventListener('mouseup', () => {
    flower.classList.remove('clicking');
    ring.classList.remove('clicking');
  });

  // ── Petal trail ─────────────────────────────────────────────────────────────
  function spawnPetal(x, y) {
    const petal = document.createElement('div');
    petal.className = 'petal-trail';
    petal.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
    petal.style.left = x + 'px';
    petal.style.top  = y + 'px';
    petal.style.fontSize = (10 + Math.random() * 8) + 'px';
    petal.style.opacity = (0.5 + Math.random() * 0.4).toString();
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 800);
  }

  // ── Hide cursor when leaving window ─────────────────────────────────────────
  document.addEventListener('mouseleave', () => {
    flower.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    flower.style.opacity = '1';
    ring.style.opacity = '';
  });
})();

/* ──────────────────────────────────────────────────────
  updateClock() — แสดงเวลาปัจจุบันและสภาพท้องฟ้า
  เรียกทุก 60 วินาที
  ▶ แก้ข้อความ sky ได้ใน if/else ด้านล่าง
────────────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');

  const clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = h + ':' + m;

  const hr = now.getHours();
  let sky = 'the sky is calm.';
  if      (hr >= 5  && hr < 8)  sky = 'the sun is rising.';
  else if (hr >= 8  && hr < 12) sky = "it's a bright morning.";
  else if (hr >= 12 && hr < 15) sky = 'the sun is high up.';
  else if (hr >= 15 && hr < 18) sky = 'golden hour soon.';
  else if (hr >= 18 && hr < 20) sky = 'the sky is painted pink.';
  else if (hr >= 20 && hr < 22) sky = 'stars are appearing.';
  else                           sky = "it's dark and dreamy.";

  const skyEl = document.getElementById('sky-status');
  if (skyEl) skyEl.textContent = sky;
}
updateClock();
setInterval(updateClock, 60000);


/* ──────────────────────────────────────────────────────
  IntersectionObserver — fade-in elements เมื่อ scroll มาถึง
  ทุก element ที่มี class .observe-fade จะ invisible ตอนแรก
  แล้ว visible เมื่อ 12% ของ element เข้ามาใน viewport
────────────────────────────────────────────────────── */
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.observe-fade').forEach(el => fadeObs.observe(el));


/* ──────────────────────────────────────────────────────
  Active nav link — highlight nav link ของ section ที่กำลังดูอยู่
────────────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(
        `.nav-links a[href="#${entry.target.id}"]`
      );
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObs.observe(s));


/* ──────────────────────────────────────────────────────
  Smooth scroll — ป้องกัน page jump เวลาคลิก anchor link
  ทำให้ scroll ลงไปหา section แบบ smooth แทน
────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ──────────────────────────────────────────────────────
   CAROUSEL — เลื่อนการ์ด project ซ้าย/ขวา
   ▶ cardWidth = ความกว้างการ์ด + gap (340 + 28 = 368)
      ถ้าเปลี่ยนขนาดการ์ดใน CSS ให้แก้ตัวเลขนี้ด้วย
────────────────────────────────────────────────────── */
(function () {
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsEl  = document.getElementById('carouselDots');

  if (!track) return;

  const cards     = track.querySelectorAll('.project-card');
  const total     = cards.length;
  const cardWidth = 340 + 28; // width + gap — ▶ แก้ถ้าเปลี่ยนขนาดการ์ด
  let current     = 0;

  // สร้าง dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // swipe บนมือถือ
  let startX = 0;
  track.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });
})();

/* ──────────────────────────────────────────────────────
   Back to Top — โผล่เมื่อ scroll เกิน 300px
────────────────────────────────────────────────────── */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});
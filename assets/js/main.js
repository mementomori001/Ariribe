/* ============================================
   ありリベ攻略Wiki - メインスクリプト
   ============================================ */

// ---------- パーティクル生成 ----------
function initParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 20 : 40;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left   = Math.random() * 100 + '%';
    p.style.top    = Math.random() * 100 + '%';
    p.style.setProperty('--dur',   (4 + Math.random() * 8) + 's');
    p.style.setProperty('--delay', (-Math.random() * 8) + 's');

    // 色のバリエーション
    const colors = [
      'rgba(201,168,76,0.7)',
      'rgba(76,127,201,0.6)',
      'rgba(155,110,221,0.5)',
      'rgba(76,201,176,0.5)',
    ];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];

    const size = 1 + Math.random() * 2;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';

    container.appendChild(p);
  }
}

// ---------- ヘッダースクロール処理 ----------
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 50);
    lastY = y;
  }, { passive: true });
}

// ---------- ハンバーガーメニュー ----------
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);

    // スパンをXに変化
    const spans = btn.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // ナビリンククリックで閉じる
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    });
  });
}

// ---------- アクティブナビ判定 ----------
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // 絶対パスに変換して比較
    const linkPath = new URL(href, window.location.href).pathname;
    const isActive = path === linkPath ||
      (path.endsWith('/') && linkPath === path + 'index.html') ||
      (linkPath.endsWith('/index.html') && path + 'index.html' === linkPath);

    link.classList.toggle('active', isActive);
  });
}

// ---------- フェードインアニメーション ----------
function initFadeIn() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('.card, .update-item, .about-box, .hint-box');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.5s ease both';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => {
    el.style.opacity = '0';
    obs.observe(el);
  });

  // アニメーション後にopacity解除
  document.addEventListener('animationend', e => {
    e.target.style.opacity = '';
  }, true);
}

// ---------- テーブル：ソート機能（汎用） ----------
function initTableSort() {
  document.querySelectorAll('.sortable-table').forEach(table => {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach((th, idx) => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const asc = th.dataset.sortDir !== 'asc';
        th.dataset.sortDir = asc ? 'asc' : 'desc';

        // 他ヘッダーのsortDirリセット
        headers.forEach(h => { if (h !== th) delete h.dataset.sortDir; });

        const tbody = table.querySelector('tbody');
        const rows  = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
          const aVal = a.cells[idx]?.textContent.trim() ?? '';
          const bVal = b.cells[idx]?.textContent.trim() ?? '';
          const num  = !isNaN(aVal) && !isNaN(bVal);
          if (num) return asc ? +aVal - +bVal : +bVal - +aVal;
          return asc ? aVal.localeCompare(bVal, 'ja') : bVal.localeCompare(aVal, 'ja');
        });

        rows.forEach(r => tbody.appendChild(r));
      });
    });
  });
}

// ---------- 初期化 ----------
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initHeader();
  initHamburger();
  setActiveNav();
  initFadeIn();
  initTableSort();
});

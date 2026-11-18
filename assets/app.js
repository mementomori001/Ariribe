(() => {
  'use strict';

  const K_CHECKS = 'arirebe_daily_checks_v4';
  const K_THREADS = 'arirebe_forum_threads_v4';
  const K_THEME = 'arirebe_theme_v4';
  const K_GISCUS = 'arirebe_giscus_cfg_v4';

  const state = {
    view: 'home',
    openMega: null, // 'db' | 'tools' | null
    data: { characters: [], magicCircles: [], articles: [], systems: {} },
    articleCat: 'ALL',
    articleId: 'floor-stuck-guide',
    charId: null,
    circleId: null,
    charFilter: { q: '', attr: 'ALL', rarity: 'ALL' },
    circleFilter: { q: '', source: 'ALL', previewTier: '2' },
    charTab: 'skills',
    charAwakened: true,
    circleTier: 4,
    partySlots: ['myu-urplus', 'liliana-urplus', 'miledi-urplus', 'ryutilis-ur', 'yue-urplus'],
    forumMode: 'giscus',
    forumCat: 'ALL',
    dailyChecks: {},
    threads: [],
    giscus: { repo: 'mementomori001/Ariribe', repoId: 'R_kgDOSoUQwg', category: 'General', categoryId: 'DIC_kwDOSoUQws4C95cU' },
    calcCharFrom: 0,
    calcCharTo: 30,
    calcCircleFrom: 0,
    calcCircleTo: 6,
    cmdIndex: 0
  };

  const MEGA_MENUS = {
    db: {
      title: 'データベース',
      items: [
        { view: 'characters', icon: '👤', title: 'キャラクター・スキル', sub: '覚醒前後・UR+進化1〜10' },
        { view: 'circles', icon: '✡', title: '魔法陣（凸別）', sub: '魔法陣44種の星級変化' },
        { view: 'beasts', icon: '🐉', title: '魔獣', sub: '魔獣戦争・開眼スキル・氷槍突き' },
        { view: 'artifacts', icon: '⚔', title: 'アーティファクト', sub: '極シリーズ・専用AF・星石交換' },
        { view: 'kourei', icon: '🐺', title: '煌霊', sub: '煌霊14種・スキル・特徴' },
        { view: 'shinjutsu', icon: '✨', title: '神術', sub: '時序・結界・超級神術' },
        { view: 'divineEquips', icon: '👑', title: '神装備', sub: '神装セット・Lv別効果' },
        { view: 'glossary', icon: '📖', title: '公式ヘルプ仕様', sub: 'ゲーム内仕様解説の検索' },
        { view: 'weapons', icon: '🔫', title: '武器・適正石', sub: 'ハジメ武器7種・適正石11属性' }
      ]
    },
    tools: {
      title: '便利機能・コミュニティ',
      items: [
        { view: 'calculators', icon: '🧮', title: '育成コスト計算機', sub: '★上げ欠片・魔法陣凸・Lv金貨' },
        { view: 'party', icon: '🛡', title: '5体編成シミュレーター', sub: '性格バフ・役割の自動計算' },
        { view: 'forum', icon: '💬', title: '攻略掲示板', sub: '質問スレ・GitHub Discussions' },
        { view: 'daily', icon: '☑', title: '毎日やることチェック', sub: '日課・週課・解放階層リスト' }
      ]
    }
  };

  const DEFAULT_THREADS = [];

  function safeGet(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (_) { return fb; } }
  function safeSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  async function loadAllData() {
    if (window.__INLINE_DATA__) { state.data = window.__INLINE_DATA__; return; }
    const [characters, magicCircles, articles, systems] = await Promise.all([
      fetch('./data/characters.json').then(r => r.json()),
      fetch('./data/magic_circles.json').then(r => r.json()),
      fetch('./data/articles.json').then(r => r.json()),
      fetch('./data/systems.json').then(r => r.json())
    ]);
    state.data = { characters, magicCircles, articles, systems };
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ 白背景' : '🌙 暗転';
    safeSet(K_THEME, theme);
  }

  function renderMegaDrawer() {
    const drawer = document.getElementById('mega-drawer');
    const inner = document.getElementById('mega-inner');
    if (!drawer || !inner) return;
    if (!state.openMega || !MEGA_MENUS[state.openMega]) {
      drawer.classList.remove('open');
      return;
    }
    const menu = MEGA_MENUS[state.openMega];
    inner.innerHTML = `
      <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);margin-bottom:10px;letter-spacing:0.06em;">${esc(menu.title)}</div>
      <div class="mega-grid">
        ${menu.items.map(it => `
          <button class="mega-item" data-mega-nav="${esc(it.view)}" type="button">
            <span class="mega-icon">${it.icon}</span>
            <div>
              <div class="mega-title">${esc(it.title)}</div>
              <div class="mega-sub">${esc(it.sub)}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;
    drawer.classList.add('open');
    inner.querySelectorAll('[data-mega-nav]').forEach(b => {
      b.onclick = () => { state.openMega = null; renderMegaDrawer(); navTo(b.dataset.megaNav); };
    });
  }

  function toggleMega(key) {
    state.openMega = state.openMega === key ? null : key;
    document.querySelectorAll('[data-mega-toggle]').forEach(b => {
      b.classList.toggle('active', b.dataset.megaToggle === state.openMega);
    });
    renderMegaDrawer();
  }

  function closeMega() {
    if (!state.openMega) return;
    state.openMega = null;
    document.querySelectorAll('[data-mega-toggle]').forEach(b => b.classList.remove('active'));
    renderMegaDrawer();
  }

  function navTo(view, opts = {}) {
    closeMega();
    state.view = view;
    if (opts.charId) state.charId = opts.charId;
    if (opts.circleId) state.circleId = opts.circleId;
    if (opts.articleId) state.articleId = opts.articleId;

    const dbViews = ['characters', 'char-detail', 'circles', 'circle-detail', 'beasts', 'artifacts', 'kourei', 'shinjutsu', 'weapons'];
    const toolViews = ['calculators', 'party', 'forum', 'daily'];
    document.querySelectorAll('.nav-link[data-nav]').forEach(b => {
      const target = b.dataset.nav;
      const isAct = (target === 'home' && view === 'home') || (target === 'articles' && (view === 'articles' || view === 'article-detail'));
      b.classList.toggle('active', isAct);
    });
    const dbBtn = document.querySelector('[data-mega-toggle="db"]');
    const toolBtn = document.querySelector('[data-mega-toggle="tools"]');
    if (dbBtn) dbBtn.classList.toggle('active', dbViews.includes(view));
    if (toolBtn) toolBtn.classList.toggle('active', toolViews.includes(view));

    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function calcCharShards(fromStar, toStar) {
    const f = Math.max(0, Math.min(30, Number(fromStar) || 0));
    const t = Math.max(f, Math.min(30, Number(toStar) || 0));
    let total = 0;
    for (let s = f + 1; s <= t; s++) total += s <= 5 ? 8 : s <= 10 ? 40 : s <= 15 ? 80 : s <= 20 ? 200 : 400;
    return total;
  }

  function calcCircleCost(fromStar, toStar) {
    const perStep = [0, 8, 16, 24, 32, 48, 64, 80, 80, 80, 96];
    const f = Math.max(0, Math.min(10, Number(fromStar) || 0));
    const t = Math.max(f, Math.min(10, Number(toStar) || 0));
    let shards = 0;
    for (let s = f + 1; s <= t; s++) shards += perStep[s];
    return { shards, cards: Math.ceil(shards / 8) };
  }

  function computePartySynergy() {
    const counts = { '神': 0, '心': 0, '夢': 0, '彩': 0, '幻': 0 };
    state.partySlots.forEach(cid => {
      const c = state.data.characters.find(x => x.id === cid);
      if (c && counts[c.attr] !== undefined) counts[c.attr]++;
    });
    const buffs = [];
    if (counts['神'] > 0) buffs.push(`神・異世界 ${counts['神']}体 → 攻/HP +${counts['神'] * 5}%・4属性へ与ダメ +${counts['神'] * 5}%`);
    ['心', '夢', '彩', '幻'].forEach(a => {
      if (counts[a] >= 3) {
        const pct = counts[a] === 5 ? 20 : counts[a] === 4 ? 15 : 10;
        buffs.push(`${a}属性 ${counts[a]}体 → 攻/HP +${pct}%`);
      }
    });
    return buffs.length ? buffs.join(' / ') : '属性バフ未発動（同属性3体以上または神属性1体〜で発動）';
  }

  /* ---- Home ---- */
  function renderHome() {
    const { articles, systems, characters, magicCircles } = state.data;
    const cats = ['ALL', ...Array.from(new Set(articles.map(a => a.category)))];
    const feed = articles.filter(a => state.articleCat === 'ALL' || a.category === state.articleCat);

    return `
      <section class="masthead">
        <div class="masthead-kicker">G123『ありふれた職業で世界最強 リベリオンソウル』非公式攻略サイト</div>
        <h1 class="masthead-title">ありリベ攻略・備忘録</h1>
        <p class="masthead-desc">
          階層攻略で詰まったときのボス別対策、キャラクタースキル・魔法陣（凸別変化）・魔獣・アーティファクト・神術データベース、計算機や編成ツール、掲示板をまとめた攻略サイトです。
        </p>
        <div class="masthead-search" id="home-search-trigger" role="button" tabindex="0">
          <span style="font-size:15px;">🔍</span>
          <span style="color:var(--text-muted);font-size:14px;flex:1;">キャラ名・魔法陣・記事キーワードでサイト内を検索…</span>
          <span class="kbd" style="font-size:11.5px;background:var(--bg);padding:2px 7px;border:1px solid var(--border);border-radius:4px;">Ctrl+K</span>
        </div>
        <div class="quick-links-row">
          <button class="quick-link-pill primary" data-open-article="floor-stuck-guide">階層攻略で詰まった時は</button>
          <button class="quick-link-pill" data-nav="characters">キャラ・スキル (${characters.length})</button>
          <button class="quick-link-pill" data-nav="circles">魔法陣 (${magicCircles.length})</button>
          <button class="quick-link-pill" data-nav="beasts">魔獣</button>
          <button class="quick-link-pill" data-nav="artifacts">アーティファクト</button>
          <button class="quick-link-pill" data-nav="calculators">計算機</button>
          <button class="quick-link-pill" data-nav="forum">掲示板</button>
        </div>
      </section>

      <div class="home-columns">
        <div>
          <div class="section-label">
            <span>最新の攻略記事・備忘録</span>
            <button style="background:none;border:none;color:var(--link);font-size:12px;cursor:pointer;" data-nav="articles">記事一覧へ →</button>
          </div>
          <div class="pill-group" style="margin:12px 0 6px;">
            ${cats.map(c => `<button class="pill ${state.articleCat === c ? 'active' : ''}" data-home-acat="${esc(c)}">${c === 'ALL' ? 'すべて' : esc(c)}</button>`).join('')}
          </div>
          <div>
            ${feed.map(a => {
              const firstBody = a.sections?.[0]?.body?.[0] || '';
              return `
                <article class="article-feed-item" data-open-article="${esc(a.id)}">
                  <div class="feed-meta">
                    <span class="feed-cat">${esc(a.category)}</span>
                    <span>${esc(a.updated)}</span>
                    <span>・</span>
                    <span>読了目安 ${esc(a.readTime)}</span>
                  </div>
                  <h2 class="feed-title">${esc(a.title)}</h2>
                  <p class="feed-excerpt">${esc(a.summary)} ${esc(firstBody.slice(0, 72))}…</p>
                </article>
              `;
            }).join('')}
          </div>
        </div>

        <aside>
          <div class="sidebar-block">
            <div class="section-label"><span>データベース</span></div>
            <button class="sidebar-list-item" data-nav="characters"><span>キャラクター・スキル</span><span class="mono" style="color:var(--text-muted);">${characters.length}体 →</span></button>
            <button class="sidebar-list-item" data-nav="circles"><span>魔法陣（2/4/6/10凸）</span><span class="mono" style="color:var(--text-muted);">${magicCircles.length}種 →</span></button>
            <button class="sidebar-list-item" data-nav="beasts"><span>魔獣（開眼・魔獣戦争）</span><span class="mono" style="color:var(--text-muted);">${(systems.beasts || []).length}種 →</span></button>
            <button class="sidebar-list-item" data-nav="artifacts"><span>アーティファクト</span><span class="mono" style="color:var(--text-muted);">${(systems.artifacts || []).length}種 →</span></button>
            <button class="sidebar-list-item" data-nav="kourei"><span>煌霊</span><span class="mono" style="color:var(--text-muted);">${(systems.kourei || []).length}種 →</span></button>
            <button class="sidebar-list-item" data-nav="shinjutsu"><span>神術</span><span class="mono" style="color:var(--text-muted);">${(systems.spirits || []).length}種 →</span></button>
            <button class="sidebar-list-item" data-nav="weapons"><span>武器・適正石</span><span class="mono" style="color:var(--text-muted);">比較表 →</span></button>
          </div>

          <div class="sidebar-block">
            <div class="section-label"><span>便利機能</span></div>
            <button class="sidebar-list-item" data-nav="calculators"><span>育成コスト計算機</span><span style="color:var(--text-muted);">→</span></button>
            <button class="sidebar-list-item" data-nav="party"><span>5体編成シミュレーター</span><span style="color:var(--text-muted);">→</span></button>
            <button class="sidebar-list-item" data-nav="daily"><span>毎日やること・解放階層</span><span style="color:var(--text-muted);">→</span></button>
            <button class="sidebar-list-item" data-nav="forum"><span>攻略掲示板（Giscus対応）</span><span class="mono" style="color:var(--text-muted);">${state.threads.length}件 →</span></button>
          </div>
        </aside>
      </div>
    `;
  }

  /* ---- Articles ---- */
  function renderArticlesIndex() {
    const articles = state.data.articles || [];
    const cats = ['ALL', ...Array.from(new Set(articles.map(a => a.category)))];
    const feed = articles.filter(a => state.articleCat === 'ALL' || a.category === state.articleCat);

    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>攻略記事一覧</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">攻略記事・備忘録一覧</h1>
      <p style="margin:0 0 18px;color:var(--text-sub);">階層攻略、魔法陣コスパ、育成ロードマップ、ダメージ計算仕様などの記事をまとめています。</p>
      <div class="filter-strip"><div class="pill-group">${cats.map(c => `<button class="pill ${state.articleCat === c ? 'active' : ''}" data-home-acat="${esc(c)}">${c === 'ALL' ? 'すべて' : esc(c)}</button>`).join('')}</div></div>
      <div>
        ${feed.map(a => `
          <article class="article-feed-item" data-open-article="${esc(a.id)}">
            <div class="feed-meta"><span class="feed-cat">${esc(a.category)}</span><span>更新: ${esc(a.updated)}</span><span>・</span><span>読了目安 ${esc(a.readTime)}</span></div>
            <h2 class="feed-title">${esc(a.title)}</h2>
            <p class="feed-excerpt">${esc(a.summary)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderArticleDetail() {
    const articles = state.data.articles || [];
    const current = articles.find(a => a.id === state.articleId) || articles[0];
    if (!current) return '';
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <button data-nav="articles">攻略記事一覧</button> / <span>${esc(current.category)}</span></div>
      <div class="article-layout">
        <article class="article-body">
          <div style="padding-bottom:18px;margin-bottom:20px;border-bottom:1px solid var(--border);">
            <div class="feed-meta" style="margin-bottom:8px;"><span class="feed-cat">${esc(current.category)}</span><span>更新: ${esc(current.updated)}</span><span>・</span><span>読了目安 ${esc(current.readTime)}</span></div>
            <h1 style="font-size:25px;line-height:1.35;margin:0 0 10px;">${esc(current.title)}</h1>
            <p style="margin:0;color:var(--text-sub);">${esc(current.summary)}</p>
          </div>
          ${current.sections.map(sec => `
            <section id="sec-${esc(sec.id)}">
              <h2>${esc(sec.heading)}</h2>
              ${(sec.body || []).map(p => `<p>${esc(p)}</p>`).join('')}
              ${sec.callout ? `<div class="callout ${sec.callout.type === 'warning' ? 'gold' : ''}"><strong>${esc(sec.callout.title)}</strong><div>${esc(sec.callout.text)}</div></div>` : ''}
              ${sec.bosses ? `
                <div class="table-wrap" style="margin:14px 0;">
                  <table class="clean-table">
                    <thead><tr><th>ボス系統</th><th>詰まる原因</th><th>突破のポイント</th></tr></thead>
                    <tbody>${sec.bosses.map(b => `<tr><td style="font-weight:700;white-space:nowrap;">${esc(b.name)}</td><td>${esc(b.cause)}</td><td>${esc(b.solution)}</td></tr>`).join('')}</tbody>
                  </table>
                </div>
              ` : ''}
              ${sec.formation ? `
                <div class="formation-strip">
                  ${sec.formation.map(f => `
                    <div class="formation-slot">
                      <div class="mono" style="font-size:11px;color:var(--accent);font-weight:700;">SLOT ${f.slot}</div>
                      <div style="font-weight:700;margin:2px 0;">${esc(f.name)}</div>
                      <div style="color:var(--text-sub);font-size:12px;">${esc(f.circle)}</div>
                      <div style="color:var(--text-muted);font-size:11px;margin-top:2px;">${esc(f.role)}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </section>
          `).join('')}
        </article>
        <aside class="toc-sticky">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:0.06em;margin-bottom:8px;">目次</div>
          ${current.sections.map(sec => `<a class="toc-link" data-scroll-sec="sec-${esc(sec.id)}">${esc(sec.heading)}</a>`).join('')}
          ${current.sourceUrl ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);"><a href="${esc(current.sourceUrl)}" target="_blank" rel="noopener" style="font-size:12px;">参照元Wiki/記事 ↗</a></div>` : ''}
        </aside>
      </div>
    `;
  }

  /* ---- Characters ---- */
  function getFilteredChars() {
    const { q, attr, rarity } = state.charFilter;
    const ql = q.trim().toLowerCase();
    return state.data.characters.filter(c => {
      if (attr !== 'ALL' && c.attr !== attr && c.subAttr !== attr) return false;
      if (rarity !== 'ALL' && c.rarity !== rarity) return false;
      if (ql && ![c.name, c.summary, ...(c.roles || []), JSON.stringify(c.skills)].join(' ').toLowerCase().includes(ql)) return false;
      return true;
    });
  }
  function renderCharRows(list) {
    return list.map(c => `
      <tr class="clickable" data-open-char="${esc(c.id)}">
        <td><strong>${esc(c.name)}</strong></td>
        <td><span class="tag attr-${esc(c.attr)}">${esc(c.attr)}</span>${c.subAttr ? ` <span class="mono" style="font-size:11px;color:var(--text-muted);">(${esc(c.subAttr)})</span>` : ''}</td>
        <td class="mono">${esc(c.rarity)}</td>
        <td>${esc(c.type)}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">該当するキャラクターが見つかりません</td></tr>';
  }
  function renderCharacters() {
    const { q, attr, rarity } = state.charFilter;
    const list = getFilteredChars();
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>キャラクター・スキル</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">キャラクター・スキルデータベース (<span id="char-count">${list.length}</span>体)</h1>
      <p style="margin:0 0 14px;color:var(--text-sub);">行をクリックすると、覚醒前/覚醒後のスキル変化とUR+進化1〜10の詳細ページへ移動します。</p>
      <div class="filter-strip">
        <input type="search" class="clean-input" id="char-search" style="flex:1;min-width:200px;" placeholder="キャラ名・スキル効果（血族、氷像、挑発など）..." value="${esc(q)}">
        <div class="pill-group">${['ALL', '神', '心', '夢', '彩', '幻'].map(a => `<button class="pill ${attr === a ? 'active' : ''}" data-char-attr="${a}">${a === 'ALL' ? '全属性' : a}</button>`).join('')}</div>
        <div class="pill-group">${['ALL', 'SP', 'UR+', 'UR', 'SSR', 'SR'].map(r => `<button class="pill ${rarity === r ? 'active' : ''}" data-char-rarity="${r}">${r === 'ALL' ? '全レア' : r}</button>`).join('')}</div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>キャラクター</th><th>属性</th><th>レア</th><th>タイプ</th></tr></thead>
          <tbody id="char-tbody">${renderCharRows(list)}</tbody>
        </table>
      </div>
    `;
  }

  function renderCharDetail() {
    const c = state.data.characters.find(x => x.id === state.charId) || state.data.characters[0];
    if (!c) return '';
    const skillEntries = Object.entries(c.skills || {});
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <button class="btn-soft" data-nav="characters" type="button">← キャラクター一覧へ戻る</button>
        <div class="breadcrumb" style="margin:0;"><button data-nav="home">トップ</button> / <button data-nav="characters">キャラクター・スキル</button> / <span>${esc(c.name)}</span></div>
      </div>
      <div class="dossier-layout">
        <div>
          <h1 style="margin:0 0 8px;font-size:26px;">${esc(c.name)}</h1>
          <p style="margin:0 0 16px;color:var(--text-sub);">${esc(c.summary)}</p>
          <div class="underline-tabs">
            <button class="u-tab ${state.charTab === 'skills' || state.charTab === 'build' ? 'active' : ''}" data-char-tab="skills">スキル構成（基礎/覚醒）</button>
            <button class="u-tab ${state.charTab === 'evo' ? 'active' : ''}" data-char-tab="evo">${c.rarity === 'SP' ? '星昇華' : '星進化'} (${(c.evolutions || []).length})</button>
            ${(c.inheritance || []).length ? `<button class="u-tab ${state.charTab === 'inh' ? 'active' : ''}" data-char-tab="inh">継承 (${c.inheritance.length})</button>` : ''}
            ${(c.elementResonance || []).length ? `<button class="u-tab ${state.charTab === 'el' ? 'active' : ''}" data-char-tab="el">元素共鳴 (${c.elementResonance.length})</button>` : ''}
          </div>
          ${state.charTab === 'evo' ? `
            ${(c.evolutions || []).length > 0 ? `<table class="clean-table"><thead><tr><th>段階</th><th>解放効果</th></tr></thead><tbody>${c.evolutions.map(e => `<tr><td class="mono" style="font-weight:700;color:var(--gold);white-space:nowrap;">Lv.${e.lv}</td><td style="white-space:pre-line;">${esc(e.desc)}</td></tr>`).join('')}</tbody></table>` : '<p style="color:var(--text-muted);">このキャラクターには星進化・星昇華データがありません。</p>'}
          ` : state.charTab === 'inh' ? `
            ${(c.inheritance || []).map(item => `
              <div class="skill-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <strong style="font-size:15px;">${esc(item.name)}</strong>
                  <span class="tag">継承 (SP限定)</span>
                </div>
                <div style="font-size:14px;white-space:pre-line;">${esc(item.desc)}</div>
              </div>
            `).join('')}
          ` : state.charTab === 'el' ? `
            ${(c.elementResonance || []).map((item, idx) => `
              <div class="skill-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <strong style="font-size:15px;">${esc(item.name)}</strong>
                  <span class="tag">Lv.${(idx % 5) + 1}</span>
                </div>
                <div style="font-size:14px;white-space:pre-line;">${esc(item.desc)}</div>
              </div>
            `).join('')}
          ` : `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="font-size:12.5px;color:var(--text-muted);">表示切替:</span>
              <div class="pill-group">
                <button class="pill ${!state.charAwakened ? 'active' : ''}" data-awk="0">基礎スキル（覚醒前）</button>
                <button class="pill ${state.charAwakened ? 'active' : ''}" data-awk="1">覚醒スキル（覚醒後）</button>
              </div>
            </div>
            ${skillEntries.map(([k, s]) => `
              <div class="skill-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <strong style="font-size:15px;">${esc(s.name)}</strong>
                  <span class="tag">${k === 'main' ? 'メインスキル' : 'パッシブ ' + k.replace('p', '')}</span>
                </div>
                <div style="font-size:14px;white-space:pre-line;">${esc(state.charAwakened ? (s.after || s.before) : (s.before || s.after))}</div>
              </div>
            `).join('')}
          `}
        </div>
        <aside class="wiki-infobox">
          <div class="wiki-infobox-head"><span class="tag attr-${esc(c.attr)}" style="font-size:14px;padding:6px 10px;">${esc(c.attr)}</span><div><div style="font-weight:700;font-size:14.5px;">${esc(c.shortName || c.name)}</div><div style="font-size:12px;color:var(--text-muted);">${esc(c.rarity)} / ${esc(c.type)}</div></div></div>
          <div class="wiki-infobox-row"><span style="color:var(--text-muted);">属性</span><span>${esc(c.attr)}${c.subAttr ? ` (元:${esc(c.subAttr)})` : ''}</span></div>
          <div class="wiki-infobox-row"><span style="color:var(--text-muted);">タイプ</span><span>${esc(c.type)}</span></div>
          <div class="wiki-infobox-row"><span style="color:var(--text-muted);">覚醒節目</span><span class="mono">★22 / 25 / 27 / 30</span></div>
        </aside>
      </div>
    `;
  }

  /* ---- Magic Circles ---- */
  function getFilteredCircles() {
    const { q, source } = state.circleFilter;
    const ql = q.trim().toLowerCase();
    return state.data.magicCircles.filter(m => {
      if (ql && ![m.name, m.note, m.source, ...(m.tags || []), JSON.stringify(m.tiers)].join(' ').toLowerCase().includes(ql)) return false;
      return true;
    });
  }
  function renderCircleRows(list) {
    const t = state.circleFilter.previewTier;
    return list.map(m => `
      <tr class="clickable" data-open-circle="${esc(m.id)}">
        <td style="white-space:nowrap;"><strong>${esc(m.name)}</strong></td>
        <td style="font-size:12px;color:var(--text-muted);white-space:nowrap;">${esc(m.source.split('/')[0].trim())}</td>
        <td style="font-size:13px;">${esc(m.tiers[t] || '')}</td>
      </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px;">該当する魔法陣が見つかりません</td></tr>';
  }
  function renderCircles() {
    const { q, source, previewTier } = state.circleFilter;
    const list = getFilteredCircles();
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>魔法陣（凸別）</span></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin-bottom:10px;">
        <div><h1 style="margin:0 0 4px;font-size:24px;">UR魔法陣データベース (<span id="circle-count">${list.length}</span>種)</h1><p style="margin:0;color:var(--text-sub);">行クリックで2凸・4凸・6凸・10凸の全段階比較ページへ移動します。</p></div>
        <div class="pill-group">${['2', '4', '6', '10'].map(t => `<button class="pill ${previewTier === t ? 'active' : ''}" data-circle-tier="${t}">${t}凸効果を表示</button>`).join('')}</div>
      </div>
      <div class="filter-strip">
        <input type="search" class="clean-input" id="circle-search" style="flex:1;min-width:200px;" placeholder="魔法陣名・スキル効果（シールド、復活、目眩など）..." value="${esc(q)}">
        <div class="pill-group">
          <button class="pill ${source === 'ALL' ? 'active' : ''}" data-circle-pri="ALL">すべて</button>
          <button class="pill ${source === 'SHOP' ? 'active' : ''}" data-circle-pri="SHOP">栄光商店</button>
          <button class="pill ${source === 'SELECT' ? 'active' : ''}" data-circle-pri="SELECT">セレクト箱</button>
          <button class="pill ${source === 'EVENT' ? 'active' : ''}" data-circle-pri="EVENT">イベント・異界</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>魔法陣名</th><th>入手経路</th><th>[${previewTier}凸] 発動効果</th></tr></thead>
          <tbody id="circle-tbody">${renderCircleRows(list)}</tbody>
        </table>
      </div>
    `;
  }

  function renderCircleDetail() {
    const m = state.data.magicCircles.find(x => x.id === state.circleId) || state.data.magicCircles[0];
    if (!m) return '';
    const tierCostMap = { 2: '計3枚 / 欠片24個', 4: '計10枚 / 欠片80個', 6: '計24枚 / 欠片192個', 10: '計66枚 / 欠片528個' };
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <button class="btn-soft" data-nav="circles" type="button">← 魔法陣一覧へ戻る</button>
        <div class="breadcrumb" style="margin:0;"><button data-nav="home">トップ</button> / <button data-nav="circles">魔法陣（凸別）</button> / <span>${esc(m.name)}</span></div>
      </div>
      <div class="dossier-layout">
        <div>
          <h1 style="margin:0 0 8px;font-size:26px;">${esc(m.name)}</h1>
          <p style="margin:0 0 18px;color:var(--text-sub);">${esc(m.note)}</p>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
            <span style="font-size:12.5px;color:var(--text-muted);">凸段階:</span>
            <div class="pill-group">${[2, 4, 6, 10].map(t => `<button class="pill ${state.circleTier === t ? 'active' : ''}" data-detail-ctier="${t}">${t}凸</button>`).join('')}</div>
            <span class="mono" style="margin-left:auto;font-size:12.5px;color:var(--gold);">${tierCostMap[state.circleTier]}</span>
          </div>
          <div class="callout gold"><strong class="mono">[${state.circleTier}凸 発動効果]</strong><div style="margin-top:4px;">${esc(m.tiers[String(state.circleTier)] || '')}</div></div>
          <h2 style="font-size:17px;margin:24px 0 10px;">全凸段階 比較表</h2>
          <table class="clean-table">
            <thead><tr><th>凸数</th><th>必要累計</th><th>効果内容</th></tr></thead>
            <tbody>${[2, 4, 6, 10].map(t => `<tr style="${state.circleTier === t ? 'background:var(--accent-soft);' : ''}"><td class="mono" style="font-weight:700;white-space:nowrap;">${t}凸</td><td class="mono" style="font-size:12px;white-space:nowrap;">${tierCostMap[t]}</td><td>${esc(m.tiers[String(t)] || '')}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <aside class="wiki-infobox">
          <div class="wiki-infobox-head"><div><div style="font-weight:700;font-size:14.5px;">${esc(m.name)}</div></div></div>
          <div class="wiki-infobox-row"><span style="color:var(--text-muted);">入手経路</span><span>${esc(m.source)}</span></div>
          <div class="wiki-infobox-row"><span style="color:var(--text-muted);">ステ型</span><span>${esc(m.statType)}</span></div>
        </aside>
      </div>
    `;
  }

  /* ---- Beasts / Artifacts / Spirits / Weapons ---- */
  function renderBeasts() {
    const all = state.data.systems.beasts || [];
    const r = state.beastRarity || 'ALL';
    const beasts = all.map((b, idx) => ({ b, idx })).filter(x => r === 'ALL' || x.b.rarity === r);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>魔獣</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">魔獣データベース (${beasts.length}件)</h1>
      <div class="filter-strip" style="margin-bottom:12px;">
        <div class="pill-group">${['ALL', 'UR+', 'UR', 'SSR', 'SR'].map(x => `<button class="pill ${r === x ? 'active' : ''}" data-sys-filter="beastRarity" data-val="${x}">${x === 'ALL' ? 'すべて' : x}</button>`).join('')}</div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>魔獣名</th><th>レア</th><th>スキル / 役割</th><th>効果概要</th></tr></thead>
          <tbody>
            ${beasts.map(({ b, idx }) => `<tr class="clickable" data-open-sys="beasts" data-sys-idx="${idx}"><td><strong>${esc(b.name)}</strong></td><td class="mono">${esc(b.rarity)}</td><td>${esc(b.role)}</td><td style="color:var(--text-muted);">${esc(b.note)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  function renderArtifacts() {
    const all = state.data.systems.artifacts || [];
    const r = state.artifactRarity || 'ALL';
    const list = all.map((a, idx) => ({ a, idx })).filter(x => r === 'ALL' || x.a.rarity === r);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>アーティファクト</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">アーティファクトデータベース (${list.length}件)</h1>
      <div class="filter-strip" style="margin-bottom:12px;">
        <div class="pill-group">${['ALL', 'UR+', 'UR', 'SSR', 'SR', 'R', 'N'].map(x => `<button class="pill ${r === x ? 'active' : ''}" data-sys-filter="artifactRarity" data-val="${x}">${x === 'ALL' ? 'すべて' : x}</button>`).join('')}</div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>AF名</th><th>レア</th><th>主な効果</th><th>備考</th></tr></thead>
          <tbody>
            ${list.map(({ a, idx }) => `<tr class="clickable" data-open-sys="artifacts" data-sys-idx="${idx}"><td><strong>${esc(a.name)}</strong></td><td class="mono">${esc(a.rarity)}</td><td>${esc(a.effect)}</td><td style="color:var(--text-muted);">${esc(a.note)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  function renderKourei() {
    const all = state.data.systems.kourei || [];
    const r = state.koureiRarity || 'ALL';
    const list = all.map((k, idx) => ({ k, idx })).filter(x => r === 'ALL' || String(x.k.rarity || '').startsWith(r + ' ') || x.k.rarity === r);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>煌霊</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">煌霊データベース (${list.length}件)</h1>
      <div class="filter-strip" style="margin-bottom:12px;">
        <div class="pill-group">${['ALL', 'UR+', 'UR', 'SSR', 'SR'].map(x => `<button class="pill ${r === x ? 'active' : ''}" data-sys-filter="koureiRarity" data-val="${x}">${x === 'ALL' ? 'すべて' : x}</button>`).join('')}</div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>名称</th><th>レア・特徴</th><th>スキル・概要</th></tr></thead>
          <tbody>
            ${list.map(({ k, idx }) => `<tr class="clickable" data-open-sys="kourei" data-sys-idx="${idx}"><td><strong>${esc(k.name)}</strong></td><td class="mono">${esc(k.rarity)}</td><td style="color:var(--text-muted);white-space:pre-line;">${esc(k.note)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderGlossary() {
    const q = (state.glossaryQuery || '').trim().toLowerCase();
    const helps = (state.data.systems.helpDocs || []).filter(h => !q || h.title.toLowerCase().includes(q) || h.doc.toLowerCase().includes(q));
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>公式ヘルプ仕様</span></div>
      <h1 style="margin:0 0 8px;font-size:24px;">公式ヘルプ仕様 (${helps.length}件)</h1>
      <div class="filter-strip" style="margin-bottom:14px;">
        <input type="search" class="clean-input" id="glossary-search" style="flex:1;min-width:220px;" placeholder="キーワードで検索（例: 凍結、シールド、煌霊、召喚）..." value="${esc(state.glossaryQuery || '')}">
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${helps.map(h => `
          <div class="skill-item">
            <div style="font-weight:700;font-size:13px;color:var(--text-muted);margin-bottom:4px;">${esc(h.title)}</div>
            <div style="font-size:13.5px;color:var(--text-sub);white-space:pre-line;">${esc(h.doc)}</div>
          </div>
        `).join('') || '<p style="color:var(--text-muted);">該当する仕様ヘルプがありません。</p>'}
      </div>
    `;
  }

  function renderDivineEquips() {
    const list = state.data.systems.divineEquips || [];
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>神装備</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">神装備データベース (${list.length}セット)</h1>
      <p style="margin:0 0 16px;color:var(--text-sub);">行をクリックすると、セット部位とLvごとのスキル効果を確認できます。</p>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>セット名</th><th>部位数</th><th>最大強化効果</th></tr></thead>
          <tbody>
            ${list.map((d, idx) => `<tr class="clickable" data-open-sys="divineEquips" data-sys-idx="${idx}"><td><strong>${esc(d.name)}</strong></td><td class="mono">${(d.equips || []).length}部位</td><td>${esc(d.summary)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderShinjutsu() {
    const all = state.data.systems.spirits || [];
    const r = state.spiritRarity || 'ALL';
    const list = all.map((s, idx) => ({ s, idx })).filter(x => r === 'ALL' || x.s.cat === r);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>神術</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">神術データベース (${list.length}件)</h1>
      <div class="filter-strip" style="margin-bottom:12px;">
        <div class="pill-group">${['ALL', '超級', '特級', '高級', '中級'].map(x => `<button class="pill ${r === x ? 'active' : ''}" data-sys-filter="spiritRarity" data-val="${x}">${x === 'ALL' ? 'すべて' : x}</button>`).join('')}</div>
      </div>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>名称</th><th>レア</th><th>基本効果 (Lv.1)</th></tr></thead>
          <tbody>
            ${list.map(({ s, idx }) => `<tr class="clickable" data-open-sys="spirits" data-sys-idx="${idx}"><td><strong>${esc(s.name)}</strong></td><td><span class="tag">${esc(s.cat)}</span></td><td>${esc(s.note)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  function renderWeapons() {
    const { weapons, aptitudeStones } = state.data.systems;
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>データベース</span> / <span>武器・適正石</span></div>
      <h1 style="margin:0 0 16px;font-size:24px;">武器7種・適正石11属性</h1>
      <h2 style="font-size:18px;margin:0 0 10px;">武器比較表（ハジメLv4001〜 / 第4パッシブ共通: 速度+10,000）</h2>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>武器名</th><th>攻撃力</th><th>生命値</th><th>メインスキル (Lv150)</th><th>第2・第3パッシブ</th></tr></thead>
          <tbody>${(weapons || []).map(w => `<tr><td><strong>${esc(w.name)}</strong><div style="font-size:12px;color:var(--text-muted);">${esc(w.note)}</div></td><td class="mono">${esc(w.atk)}</td><td class="mono">${esc(w.hp)}</td><td><strong>${esc(w.skillName)}</strong>: ${esc(w.skillDesc)}</td><td style="white-space:nowrap;">${esc(w.p2)}<br>${esc(w.p3)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <h2 style="font-size:18px;margin:24px 0 10px;">適正石 11属性（Lv60 神級）</h2>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>属性</th><th>効果1</th><th>効果2</th><th>効果3</th></tr></thead>
          <tbody>${(aptitudeStones || []).map(s => `<tr><td><strong>${esc(s.attr)}</strong></td><td class="mono">${esc(s.e1)}</td><td class="mono">${esc(s.e2)}</td><td class="mono">${esc(s.e3)}</td><td>${esc(s.rec)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    `;
  }

  /* ---- Tools: Calculators, Party Builder, Daily Checklist ---- */
  function renderCalculators() {
    const { levelCosts } = state.data.systems;
    const charShards = calcCharShards(state.calcCharFrom, state.calcCharTo);
    const circleCost = calcCircleCost(state.calcCircleFrom, state.calcCircleTo);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>便利機能</span> / <span>育成コスト計算機</span></div>
      <h1 style="margin:0 0 18px;font-size:24px;">育成コスト計算機</h1>
      <div class="grid-2" style="margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border);">
        <div>
          <h2 style="font-size:16px;margin:0 0 10px;">キャラ★上げ 必要欠片計算</h2>
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
            <label>現在 ★ <input type="number" id="calc-char-from" min="0" max="30" value="${state.calcCharFrom}" class="clean-input" style="width:68px;"></label>
            <span>→</span>
            <label>目標 ★ <input type="number" id="calc-char-to" min="0" max="30" value="${state.calcCharTo}" class="clean-input" style="width:68px;"></label>
          </div>
          <div>必要欠片数（解禁8個除く）: <strong class="mono" style="font-size:22px;color:var(--accent);">${charShards.toLocaleString()} 個</strong></div>
        </div>
        <div>
          <h2 style="font-size:16px;margin:0 0 10px;">UR魔法陣 凸数コスト計算</h2>
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
            <label>現在 ★ <input type="number" id="calc-circle-from" min="0" max="10" value="${state.calcCircleFrom}" class="clean-input" style="width:68px;"></label>
            <span>→</span>
            <label>目標 ★ <input type="number" id="calc-circle-to" min="0" max="10" value="${state.calcCircleTo}" class="clean-input" style="width:68px;"></label>
          </div>
          <div>必要枚数 / 欠片: <strong class="mono" style="font-size:22px;color:var(--accent);">${circleCost.cards} 枚</strong> <span class="mono" style="color:var(--text-muted);">(${circleCost.shards}個)</span></div>
        </div>
      </div>
      <h2 style="font-size:18px;margin:0 0 10px;">仲間レベル別 必要金貨・魔核テーブル（主人公は約2倍）</h2>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>目標Lv</th><th>区間金貨</th><th>区間魔核</th></tr></thead>
          <tbody>${(levelCosts || []).map(l => `<tr><td class="mono" style="font-weight:700;">Lv.${l.lv}</td><td class="mono">${esc(l.gold)}</td><td class="mono">${esc(l.core)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <h2 style="font-size:18px;margin:0 0 10px;">キャラLv上げ金貨テーブル（実データ抜粋）</h2>
      <div class="table-wrap">
        <table class="clean-table">
          <thead><tr><th>到達Lv</th><th>そのLvの必要金貨</th><th>Lv.1からの累計金貨</th></tr></thead>
          <tbody>${(state.data.systems.heroLevelMilestones || []).map(m => `<tr><td class="mono">Lv.${m.lv}</td><td class="mono">${m.stepGold.toLocaleString()}</td><td class="mono">${m.cumGold.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function renderPartyBuilder() {
    const characters = state.data.characters || [];
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>便利機能</span> / <span>5体編成シミュレーター</span></div>
      <h1 style="margin:0 0 6px;font-size:24px;">5体編成シミュレーター（性格バフ自動計算）</h1>
      <p style="margin:0 0 16px;color:var(--text-sub);">1〜5番のスロットにキャラクターを選択すると、発生する性格バフ（編成人数バフ）を自動計算します。</p>
      <div class="callout"><strong>発動中の性格バフ:</strong> ${esc(computePartySynergy())}</div>
      <div class="formation-strip" style="margin-top:16px;">
        ${state.partySlots.map((cid, idx) => {
          const ch = characters.find(x => x.id === cid) || characters[0];
          return `
            <div class="formation-slot">
              <div class="mono" style="font-size:11px;color:var(--accent);font-weight:700;">SLOT 0${idx + 1}</div>
              <select class="clean-input" data-party-slot="${idx}" style="width:100%;margin:6px 0;font-size:12.5px;padding:5px 7px;">
                ${characters.map(opt => `<option value="${esc(opt.id)}" ${opt.id === cid ? 'selected' : ''}>${esc(opt.name)} (${esc(opt.attr)})</option>`).join('')}
              </select>
              ${ch ? `<div style="font-size:12px;color:var(--text-sub);">${esc(ch.roles[0] || ch.type)}</div><div style="margin-top:6px;"><button class="btn-soft" style="padding:3px 8px;font-size:11.5px;" data-open-char="${esc(ch.id)}">キャラ詳細 →</button></div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderDailyPage() {
    const { dailyChecklist, unlockFloors } = state.data.systems;
    const checks = state.dailyChecks;
    const doneCount = (dailyChecklist || []).filter(i => checks[i.id]).length;
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>便利機能</span> / <span>毎日やること・解放階層</span></div>
      <h1 style="margin:0 0 18px;font-size:24px;">毎日やることチェック＆機能解放階層</h1>
      <div class="grid-2">
        <div>
          <div class="section-label"><span>日課・週課 (${doneCount}/${(dailyChecklist || []).length})</span><button id="reset-daily-btn" style="background:none;border:none;color:var(--text-muted);font-size:12px;cursor:pointer;">リセット</button></div>
          ${(dailyChecklist || []).map(item => `
            <label style="display:flex;gap:10px;padding:9px 4px;border-bottom:1px solid var(--border);cursor:pointer;font-size:13.5px;align-items:flex-start;">
              <input type="checkbox" data-check-id="${esc(item.id)}" ${checks[item.id] ? 'checked' : ''} style="margin-top:4px;">
              <span class="tag">${esc(item.cat)}</span>
              <span style="${checks[item.id] ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${esc(item.label)}</span>
            </label>
          `).join('')}
        </div>
        <div>
          <div class="section-label"><span>機能解放階層タイムライン</span></div>
          <table class="clean-table">
            <thead><tr><th>解放条件</th><th>解放コンテンツ</th></tr></thead>
            <tbody>${(unlockFloors || []).map(u => `<tr><td class="mono" style="color:var(--accent);font-weight:700;white-space:nowrap;">${esc(u.cond)}</td><td>${esc(u.feature)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ---- Forum ---- */
  function renderForum() {
    const cats = ['ALL', '階層攻略', '魔法陣相談', '編成共有', '雑談'];
    const filtered = state.threads.filter(t => state.forumCat === 'ALL' || t.cat === state.forumCat);
    return `
      <div class="breadcrumb"><button data-nav="home">トップ</button> / <span>便利機能</span> / <span>攻略掲示板</span></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div><h1 style="margin:0 0 4px;font-size:24px;">攻略掲示板・質問スレッド</h1><p style="margin:0;color:var(--text-sub);">サーバー不要のローカル掲示板と、GitHub Discussions (Giscus) 連携の両対応です。</p></div>
        <div class="pill-group">
          <button class="pill ${state.forumMode === 'local' ? 'active' : ''}" data-forum-mode="local">ローカル掲示板</button>
          <button class="pill ${state.forumMode === 'giscus' ? 'active' : ''}" data-forum-mode="giscus">GitHub Discussions (Giscus)</button>
        </div>
      </div>
      ${state.forumMode === 'local' ? `
        <div class="home-columns">
          <div>
            <div class="filter-strip">
              <div class="pill-group">${cats.map(c => `<button class="pill ${state.forumCat === c ? 'active' : ''}" data-forum-cat="${c}">${c === 'ALL' ? 'すべて' : c}</button>`).join('')}</div>
              <button class="btn-soft" id="export-threads-btn" style="margin-left:auto;">JSON書き出し</button>
            </div>
            ${filtered.map(t => `
              <div class="thread-item">
                <button class="upvote-btn" data-like-thread="${esc(t.id)}" type="button"><span>▲</span><span>${t.likes || 0}</span></button>
                <div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;"><span class="tag">${esc(t.cat)}</span><strong style="font-size:15.5px;">${esc(t.title)}</strong></div>
                  <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${esc(t.author)} ・ ${esc(t.date)}</div>
                  <p style="margin:0 0 10px;font-size:13.5px;">${esc(t.body)}</p>
                  ${(t.replies || []).map((r, ri) => `<div style="background:var(--bg-soft);padding:8px 12px;border-radius:6px;margin-bottom:6px;font-size:13px;"><span class="mono" style="color:var(--accent);">[${ri + 2}]</span> <strong>${esc(r.author)}</strong> <span style="color:var(--text-muted);font-size:11.5px;">(${esc(r.date)})</span>: ${esc(r.text)}</div>`).join('')}
                  <form class="reply-form" data-reply-id="${esc(t.id)}" style="display:flex;gap:8px;margin-top:8px;">
                    <input type="text" name="replyText" class="clean-input" style="flex:1;" placeholder="返信を書く…" required>
                    <button type="submit" class="btn-soft">返信</button>
                  </form>
                </div>
              </div>
            `).join('')}
          </div>
          <aside>
            <div class="section-label"><span>新規スレッド投稿</span></div>
            <form id="new-thread-form" style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
              <select name="cat" class="clean-input"><option value="階層攻略">階層攻略（詰まり相談）</option><option value="魔法陣相談">魔法陣・育成相談</option><option value="編成共有">編成共有</option><option value="雑談">雑談・備忘録</option></select>
              <input type="text" name="author" class="clean-input" placeholder="名前（例：s11_錬成師）" required>
              <input type="text" name="title" class="clean-input" placeholder="タイトル" required>
              <textarea name="body" rows="4" class="clean-input" placeholder="現在の階層や相談内容…" required></textarea>
              <button type="submit" class="btn-primary">投稿する</button>
            </form>
          </aside>
        </div>
      ` : `
        <div style="padding-top:8px;">
          <div id="giscus-mount" style="padding-top:4px;">${state.giscus.repo && state.giscus.repoId ? '読み込み中…' : '<span style="color:var(--text-muted);">※ repo と repoId を設定するとここにGitHub Discussionsスレッドが表示されます。</span>'}</div>
          <details style="margin-top:20px;">
            <summary style="cursor:pointer;font-size:12px;color:var(--text-muted);">Giscus連携設定を変更</summary>
            <form id="giscus-cfg-form" class="grid-2" style="margin-top:12px;">
              <input type="text" name="repo" class="clean-input" placeholder="owner/repo" value="${esc(state.giscus.repo)}">
              <input type="text" name="repoId" class="clean-input" placeholder="data-repo-id" value="${esc(state.giscus.repoId)}">
              <input type="text" name="category" class="clean-input" placeholder="カテゴリ名 (General)" value="${esc(state.giscus.category)}">
              <input type="text" name="categoryId" class="clean-input" placeholder="data-category-id" value="${esc(state.giscus.categoryId)}">
              <div style="grid-column:1/-1;"><button type="submit" class="btn-primary">Giscusを読み込む</button></div>
            </form>
          </details>
        </div>
      `}
    `;
  }

  function mountGiscusIfConfigured() {
    const mount = document.getElementById('giscus-mount');
    if (!mount || !state.giscus.repo || !state.giscus.repoId) return;
    mount.innerHTML = '';
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', state.giscus.repo);
    s.setAttribute('data-repo-id', state.giscus.repoId);
    s.setAttribute('data-category', state.giscus.category || 'General');
    s.setAttribute('data-category-id', state.giscus.categoryId || '');
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    s.setAttribute('data-lang', 'ja');
    s.crossOrigin = 'anonymous';
    s.async = true;
    mount.appendChild(s);
  }

  /* ---- Global Search ---- */
  function openSearchModal() {
    closeMega();
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('global-search-input');
    modal.classList.add('open');
    input.value = '';
    state.cmdIndex = 0;
    renderGlobalSearch('');
    setTimeout(() => input.focus(), 20);
  }

  function getSearchItems(query) {
    const q = query.trim().toLowerCase();
    const items = [];
    state.data.articles.forEach(a => { if (!q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)) items.push({ kind: '記事', label: a.title, sub: a.category, action: () => { closeModals(); navTo('article-detail', { articleId: a.id }); } }); });
    state.data.characters.forEach(c => { if (!q || c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) items.push({ kind: 'キャラ', label: c.name, sub: `${c.rarity} / ${c.attr}`, action: () => { closeModals(); navTo('char-detail', { charId: c.id }); } }); });
    state.data.magicCircles.forEach(m => { if (!q || m.name.toLowerCase().includes(q) || m.note.toLowerCase().includes(q)) items.push({ kind: '魔法陣', label: m.name, sub: m.source.split('/')[0].trim(), action: () => { closeModals(); navTo('circle-detail', { circleId: m.id }); } }); });
    (state.data.systems.beasts || []).forEach(b => { if (!q || b.name.toLowerCase().includes(q) || b.role.toLowerCase().includes(q)) items.push({ kind: '魔獣', label: `${b.name} (${b.rarity})`, sub: b.role, action: () => { closeModals(); navTo('beasts'); } }); });
    (state.data.systems.artifacts || []).forEach(a => { if (!q || a.name.toLowerCase().includes(q) || a.effect.toLowerCase().includes(q)) items.push({ kind: 'AF', label: a.name, sub: a.effect, action: () => { closeModals(); navTo('artifacts'); } }); });
    return items.slice(0, 12);
  }

  function renderGlobalSearch(query) {
    const out = document.getElementById('global-search-results');
    const items = getSearchItems(query);
    if (state.cmdIndex >= items.length) state.cmdIndex = 0;
    out.innerHTML = items.map((it, idx) => `
      <div data-cmd-idx="${idx}" style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer;background:${idx === state.cmdIndex ? 'var(--bg-soft)' : 'transparent'};">
        <span class="tag">${esc(it.kind)}</span>
        <span style="font-weight:600;">${esc(it.label)}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--text-muted);">${esc(it.sub)}</span>
      </div>
    `).join('') || '<div style="padding:20px;text-align:center;color:var(--text-muted);">該当するデータがありません</div>';
    out.querySelectorAll('[data-cmd-idx]').forEach(el => { el.onclick = () => items[Number(el.dataset.cmdIdx)].action(); });
  }

  function closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  }

  function bindEvents() {
    const root = document.getElementById('app-root');
    root.querySelectorAll('[data-nav]').forEach(el => { el.onclick = () => navTo(el.dataset.nav); });
    root.querySelectorAll('[data-open-article]').forEach(el => { el.onclick = () => navTo('article-detail', { articleId: el.dataset.openArticle }); });
    root.querySelectorAll('[data-open-char]').forEach(el => { el.onclick = () => navTo('char-detail', { charId: el.dataset.openChar }); });
    root.querySelectorAll('[data-open-circle]').forEach(el => { el.onclick = () => navTo('circle-detail', { circleId: el.dataset.openCircle }); });
    root.querySelectorAll('[data-home-acat]').forEach(el => { el.onclick = () => { state.articleCat = el.dataset.homeAcat; render(); }; });
    root.querySelectorAll('[data-party-slot]').forEach(sel => { sel.onchange = () => { state.partySlots[Number(sel.dataset.partySlot)] = sel.value; render(); }; });
    root.querySelectorAll('[data-check-id]').forEach(cb => { cb.onchange = () => { state.dailyChecks[cb.dataset.checkId] = cb.checked; safeSet(K_CHECKS, state.dailyChecks); render(); }; });
    const resetDaily = document.getElementById('reset-daily-btn');
    if (resetDaily) resetDaily.onclick = () => { state.dailyChecks = {}; safeSet(K_CHECKS, {}); render(); };

    const homeSearchTrigger = document.getElementById('home-search-trigger');
    if (homeSearchTrigger) homeSearchTrigger.onclick = openSearchModal;

    const charSearch = document.getElementById('char-search');
    if (charSearch) {
      let composing = false;
      const updateCharTableOnly = () => {
        state.charFilter.q = charSearch.value;
        const list = getFilteredChars();
        const tbody = document.getElementById('char-tbody');
        const cnt = document.getElementById('char-count');
        if (tbody) {
          tbody.innerHTML = renderCharRows(list);
          tbody.querySelectorAll('[data-open-char]').forEach(el => { el.onclick = () => navTo('char-detail', { charId: el.dataset.openChar }); });
        }
        if (cnt) cnt.textContent = String(list.length);
      };
      charSearch.addEventListener('compositionstart', () => { composing = true; });
      charSearch.addEventListener('compositionend', () => { composing = false; updateCharTableOnly(); });
      charSearch.addEventListener('input', () => { if (!composing) updateCharTableOnly(); });
    }
    root.querySelectorAll('[data-char-attr]').forEach(b => { b.onclick = () => { state.charFilter.attr = b.dataset.charAttr; render(); }; });
    root.querySelectorAll('[data-char-rarity]').forEach(b => { b.onclick = () => { state.charFilter.rarity = b.dataset.charRarity; render(); }; });
    root.querySelectorAll('[data-glossary-tab]').forEach(b => { b.onclick = () => { state.glossaryTab = b.dataset.glossaryTab; render(); }; });
    const gSearch = document.getElementById('glossary-search');
    if (gSearch) gSearch.oninput = (e) => { state.glossaryQuery = e.target.value; render(); const el = document.getElementById('glossary-search'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } };
    root.querySelectorAll('[data-sys-filter]').forEach(b => { b.onclick = () => { state[b.dataset.sysFilter] = b.dataset.val; render(); }; });
    root.querySelectorAll('[data-char-tab]').forEach(b => { b.onclick = () => { state.charTab = b.dataset.charTab; render(); }; });
    root.querySelectorAll('[data-awk]').forEach(b => { b.onclick = () => { state.charAwakened = b.dataset.awk === '1'; render(); }; });

    const circleSearch = document.getElementById('circle-search');
    if (circleSearch) {
      let composing = false;
      const updateCircleTableOnly = () => {
        state.circleFilter.q = circleSearch.value;
        const list = getFilteredCircles();
        const tbody = document.getElementById('circle-tbody');
        const cnt = document.getElementById('circle-count');
        if (tbody) {
          tbody.innerHTML = renderCircleRows(list);
          tbody.querySelectorAll('[data-open-circle]').forEach(el => { el.onclick = () => navTo('circle-detail', { circleId: el.dataset.openCircle }); });
        }
        if (cnt) cnt.textContent = String(list.length);
      };
      circleSearch.addEventListener('compositionstart', () => { composing = true; });
      circleSearch.addEventListener('compositionend', () => { composing = false; updateCircleTableOnly(); });
      circleSearch.addEventListener('input', () => { if (!composing) updateCircleTableOnly(); });
    }
    root.querySelectorAll('[data-circle-pri]').forEach(b => { b.onclick = () => { state.circleFilter.source = b.dataset.circlePri; render(); }; });
    root.querySelectorAll('[data-circle-tier]').forEach(b => { b.onclick = () => { state.circleFilter.previewTier = b.dataset.circleTier; render(); }; });
    root.querySelectorAll('[data-detail-ctier]').forEach(b => { b.onclick = () => { state.circleTier = Number(b.dataset.detailCtier); render(); }; });

    ['calc-char-from', 'calc-char-to', 'calc-circle-from', 'calc-circle-to'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.oninput = () => {
          if (id === 'calc-char-from') state.calcCharFrom = el.value;
          if (id === 'calc-char-to') state.calcCharTo = el.value;
          if (id === 'calc-circle-from') state.calcCircleFrom = el.value;
          if (id === 'calc-circle-to') state.calcCircleTo = el.value;
          render();
          const re = document.getElementById(id);
          if (re) re.focus();
        };
      }
    });

    root.querySelectorAll('[data-scroll-sec]').forEach(el => {
      el.onclick = () => { const t = document.getElementById(el.dataset.scrollSec); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    });

    root.querySelectorAll('[data-forum-mode]').forEach(b => { b.onclick = () => { state.forumMode = b.dataset.forumMode; render(); if (state.forumMode === 'giscus') mountGiscusIfConfigured(); }; });
    root.querySelectorAll('[data-forum-cat]').forEach(b => { b.onclick = () => { state.forumCat = b.dataset.forumCat; render(); }; });
    root.querySelectorAll('[data-like-thread]').forEach(b => {
      b.onclick = () => { const t = state.threads.find(x => x.id === b.dataset.likeThread); if (t) { t.likes = (t.likes || 0) + 1; safeSet(K_THREADS, state.threads); render(); } };
    });
    const newThreadForm = document.getElementById('new-thread-form');
    if (newThreadForm) {
      newThreadForm.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(newThreadForm);
        state.threads.unshift({ id: 't_' + Date.now(), cat: fd.get('cat'), title: fd.get('title'), author: fd.get('author'), date: new Date().toISOString().slice(0, 10), likes: 0, body: fd.get('body'), replies: [] });
        safeSet(K_THREADS, state.threads);
        render();
      };
    }
    root.querySelectorAll('.reply-form').forEach(f => {
      f.onsubmit = (e) => {
        e.preventDefault();
        const t = state.threads.find(x => x.id === f.dataset.replyId);
        const text = new FormData(f).get('replyText');
        if (t && text) { t.replies = t.replies || []; t.replies.push({ author: '名無しの錬成師', date: new Date().toISOString().slice(0, 10), text }); safeSet(K_THREADS, state.threads); render(); }
      };
    });
    const exportBtn = document.getElementById('export-threads-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(state.threads, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'arirebe-threads.json'; a.click();
      };
    }
    const giscusForm = document.getElementById('giscus-cfg-form');
    if (giscusForm) {
      giscusForm.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(giscusForm);
        state.giscus = { repo: String(fd.get('repo') || '').trim(), repoId: String(fd.get('repoId') || '').trim(), category: String(fd.get('category') || 'General').trim(), categoryId: String(fd.get('categoryId') || '').trim() };
        safeSet(K_GISCUS, state.giscus);
        mountGiscusIfConfigured();
      };
    }
  }

  function render() {
    const root = document.getElementById('app-root');
    if (!root) return;
    if (state.view === 'home') root.innerHTML = renderHome();
    else if (state.view === 'articles') root.innerHTML = renderArticlesIndex();
    else if (state.view === 'article-detail') root.innerHTML = renderArticleDetail();
    else if (state.view === 'characters') root.innerHTML = renderCharacters();
    else if (state.view === 'char-detail') root.innerHTML = renderCharDetail();
    else if (state.view === 'circles') root.innerHTML = renderCircles();
    else if (state.view === 'circle-detail') root.innerHTML = renderCircleDetail();
    else if (state.view === 'beasts') root.innerHTML = renderBeasts();
    else if (state.view === 'artifacts') root.innerHTML = renderArtifacts();
    else if (state.view === 'kourei') root.innerHTML = renderKourei();
    else if (state.view === 'shinjutsu') root.innerHTML = renderShinjutsu();
    else if (state.view === 'divineEquips') root.innerHTML = renderDivineEquips();
    else if (state.view === 'glossary') root.innerHTML = renderGlossary();
    else if (state.view === 'weapons') root.innerHTML = renderWeapons();
    else if (state.view === 'calculators') root.innerHTML = renderCalculators();
    else if (state.view === 'party') root.innerHTML = renderPartyBuilder();
    else if (state.view === 'daily') root.innerHTML = renderDailyPage();
    else if (state.view === 'forum') root.innerHTML = renderForum();
    bindEvents();
    if (state.view === 'forum' && state.forumMode === 'giscus') mountGiscusIfConfigured();
  }

  async function init() {
    state.dailyChecks = safeGet(K_CHECKS, {});
    state.threads = safeGet(K_THREADS, DEFAULT_THREADS);
    const savedG = safeGet(K_GISCUS, null); if (savedG && savedG.repo && savedG.repoId) state.giscus = savedG;
    applyTheme(safeGet(K_THEME, 'light'));

    document.getElementById('brand-home').onclick = () => navTo('home');
    document.querySelectorAll('.nav-link[data-nav]').forEach(b => { b.onclick = () => navTo(b.dataset.nav); });
    document.querySelectorAll('[data-mega-toggle]').forEach(b => {
      b.onclick = (e) => { e.stopPropagation(); toggleMega(b.dataset.megaToggle); };
    });
    document.getElementById('mega-drawer').onclick = (e) => e.stopPropagation();
    document.addEventListener('click', () => closeMega());

    document.getElementById('theme-toggle').onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    };
    document.getElementById('search-trigger').onclick = openSearchModal;
    document.querySelectorAll('[data-close-modal]').forEach(b => { b.onclick = closeModals; });
    document.getElementById('search-modal').onclick = (e) => { if (e.target.id === 'search-modal') closeModals(); };

    const gInput = document.getElementById('global-search-input');
    gInput.oninput = (e) => { state.cmdIndex = 0; renderGlobalSearch(e.target.value); };
    gInput.onkeydown = (e) => {
      const items = getSearchItems(gInput.value);
      if (e.key === 'ArrowDown') { e.preventDefault(); state.cmdIndex = (state.cmdIndex + 1) % Math.max(1, items.length); renderGlobalSearch(gInput.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); state.cmdIndex = (state.cmdIndex - 1 + Math.max(1, items.length)) % Math.max(1, items.length); renderGlobalSearch(gInput.value); }
      else if (e.key === 'Enter' && items[state.cmdIndex]) { e.preventDefault(); items[state.cmdIndex].action(); }
    };

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearchModal(); }
      else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { e.preventDefault(); openSearchModal(); }
      else if (e.key === 'Escape') { closeModals(); closeMega(); }
    });

    await loadAllData();
    render();
  }

  window.addEventListener('DOMContentLoaded', init);

  function openSysModal(kind, idx) {
    const item = (state.data.systems[kind] || [])[idx];
    if (!item) return;
    let body = `<h2 style="margin:0 0 8px;font-size:20px;">${esc(item.name)}</h2>`;
    if (kind === 'beasts') {
      body += `<p style="color:var(--text-sub);margin:0 0 12px;">レアリティ: ${esc(item.rarity)} / 役割: ${esc(item.role)}</p>`;
      if (item.skillName || item.skillDesc) {
        body += `<div class="skill-item"><strong>固有スキル: ${esc(item.skillName || '')}</strong><div style="margin-top:4px;white-space:pre-line;">${esc(item.skillDesc || '')}</div></div>`;
      }
      if (item.attributes && item.attributes.length) {
        body += `<div class="skill-item"><strong>ステータス補正</strong><div style="margin-top:4px;">${item.attributes.map(a => `${esc(a.name_ja)}: ${esc(a.value)}`).join(' / ')}</div></div>`;
      }
      if (item.note) body += `<p style="margin-top:10px;color:var(--text-muted);white-space:pre-line;">${esc(item.note)}</p>`;
    } else if (kind === 'artifacts') {
      body += `<p style="color:var(--text-sub);margin:0 0 12px;">レアリティ: ${esc(item.rarity)} / 入手: ${esc(item.cost)}</p>`;
      if (item.attributes && item.attributes.length) {
        body += `<div class="skill-item"><strong>補正ステータス</strong><div style="margin-top:4px;">${item.attributes.map(a => `${esc(a.name_ja)}: ${esc(a.base)} 〜 ${esc(a.max)}`).join('<br>')}</div></div>`;
      }
      if (item.desc || item.note) body += `<p style="margin-top:10px;color:var(--text-muted);white-space:pre-line;">${esc(item.desc || item.note)}</p>`;
      if (item.extraSkills && item.extraSkills.length) {
        body += `<div class="skill-item" style="margin-top:10px;"><strong>鍛造・精錬テキスト</strong><div style="margin-top:4px;max-height:200px;overflow-y:auto;font-size:12.5px;">${item.extraSkills.slice(0, 20).map(s => esc(s.text_ja)).join('<br>')}</div></div>`;
      }
    } else if (kind === 'kourei') {
      body += `<p style="color:var(--text-sub);margin:0 0 12px;">${esc(item.rarity)}</p>`;
      if (item.desc) body += `<div class="skill-item"><strong>概要</strong><div style="margin-top:4px;white-space:pre-line;">${esc(item.desc)}</div></div>`;
      if (item.pgLevels && item.pgLevels.length) {
        body += `<div class="skill-item"><strong>編成技 (${esc(item.skillNames?.pg || '')})</strong><div style="margin-top:4px;font-size:13px;">${item.pgLevels.map(l => `Lv.${l.level}: ${esc(l.desc_ja)}`).join('<br>')}</div></div>`;
      }
      if (item.yhjLevels && item.yhjLevels.length) {
        body += `<div class="skill-item"><strong>援護技 (${esc(item.skillNames?.yhj || '')})</strong><div style="margin-top:4px;font-size:13px;">${item.yhjLevels.map(l => `Lv.${l.level}: ${esc(l.desc_ja)}`).join('<br>')}</div></div>`;
      }
      if (item.bdLevels && item.bdLevels.length) {
        body += `<div class="skill-item"><strong>全体ステータス強化 (${esc(item.skillNames?.bd || '')})</strong><div style="margin-top:4px;max-height:160px;overflow-y:auto;font-size:12.5px;">${item.bdLevels.map(l => `Lv.${l.level}: ${esc(l.desc_ja)}`).join('<br>')}</div></div>`;
      }
      if (item.xmLevels && item.xmLevels.length) {
        body += `<div class="skill-item"><strong>霊の血脈 (${esc(item.skillNames?.xm || '')})</strong><div style="margin-top:4px;max-height:160px;overflow-y:auto;font-size:12.5px;">${item.xmLevels.map(l => `Lv.${l.level}: ${esc(l.desc_ja)}`).join('<br>')}</div></div>`;
      }
        } else if (kind === 'spirits') {
      body += `<p style="color:var(--text-sub);margin:0 0 12px;">系統: ${esc(item.cat)} / ${esc(item.rank)}</p>`;
      if (item.levels && item.levels.length) {
        body += `<div class="skill-item"><strong>段階別効果</strong><div style="margin-top:6px;font-size:13px;">${item.levels.map(l => `<strong>${esc(l.label || '')}</strong>: ${esc(l.desc)}`).join('<br><br>')}</div></div>`;
      }
    } else if (kind === 'divineEquips') {
      body += `<p style="color:var(--text-sub);margin:0 0 12px;">部位: ${(item.equips || []).map(e => esc(e)).join(' / ')}</p>`;
      if (item.skills && item.skills.length) {
        body += `<div class="skill-item"><strong>Lv別セット効果</strong><div style="margin-top:6px;max-height:320px;overflow-y:auto;font-size:13px;">${item.skills.map(s => `Lv.${s.lv}: ${esc(s.desc)}`).join('<br>')}</div></div>`;
      }
    }
    let modal = document.getElementById('sys-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sys-detail-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999;';
      modal.addEventListener('click', (ev) => { if (ev.target === modal || ev.target.dataset.closeSysModal) modal.style.display = 'none'; });
      document.body.appendChild(modal);
    }
    modal.innerHTML = `<div style="background:var(--bg-surface,#ffffff);color:var(--text,#1f2328);border:1px solid var(--border,#e2e4e9);border-radius:12px;max-width:680px;width:100%;max-height:85vh;overflow-y:auto;padding:22px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.25);"><button type="button" data-close-sys-modal="1" style="position:sticky;float:right;top:0;background:transparent;border:none;color:var(--text-muted);font-size:20px;cursor:pointer;">✕</button>${body}</div>`;
    modal.style.display = 'flex';
  }

  document.addEventListener('click', (e) => {
    const tr = e.target.closest('[data-open-sys]');
    if (tr) openSysModal(tr.dataset.openSys, Number(tr.dataset.sysIdx));
  });
})();

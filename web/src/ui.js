/* 부산 2033 - 화면 그리기
 *
 * 한 화면에 장면 하나. 선택을 하면 그 선택과 결과가 같은 화면 아래로 이어 붙는다.
 */
(function (global) {
  'use strict';
  const B = global.B;
  const doc = global.document;

  const ICON = {
    hp: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.8" r="2.6"/><path d="M12 8c-2.9 0-4.5 1.8-4.5 4v3.1h1.7l.6 5.9h4.4l.6-5.9h1.7V12c0-2.2-1.6-4-4.5-4z"/></svg>',
    mp: '<svg viewBox="0 0 24 24"><path d="M12 20.3S3.6 15 3.6 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.4 2.1c0 5.6-8.4 10.9-8.4 10.9z"/></svg>',
    money: '<svg viewBox="0 0 24 24"><path d="M9 6.2h6l-1.4-2.4H10.4z"/><path d="M12 6.2c-3.9 0-6.5 3.6-6.5 7.6S8.1 21 12 21s6.5-3.2 6.5-7.2S15.9 6.2 12 6.2z"/><path d="M12 9.6v7.8M10.1 11.4h3.2a1.5 1.5 0 0 1 0 3h-2.8a1.5 1.5 0 0 0 0 3h3.1"/></svg>',
    rad: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.3"/><path d="M12 3.6l3.3 5.8M12 3.6L8.7 9.4M20.3 16.4h-6.6M10.3 16.4H3.7"/></svg>'
  };

  const RADIO = [
    '부산 2033. 도입부부터 종장까지, 당신이 고른 것만 남습니다.',
    '주운 잡동사니는 버리지 마세요. 쓸모는 상황이 정합니다.',
    '체력·멘탈·돈은 각각 세 칸입니다. 한 칸이 깎이려면 네 번 다쳐야 합니다.',
    '선택지 앞의 초록 글씨는 가진 것, 빨간 글씨는 없는 것입니다.',
    '상처는 두면 열이 되고, 열은 판단을 갉습니다. 소지품에서 바로 치료하세요.',
    '끼니와 잠자리는 주기적으로 돌아옵니다. 굶으면 허기가 붙습니다.',
    '진행도 100%에 닿으면 종장이 열립니다. 그 전에 단서를 모으세요.',
    '엔딩은 열 가지입니다. 죽는 것도 엔딩입니다.'
  ];

  function el(id) { return doc.getElementById(id); }

  function UI(engine) {
    this.e = engine;
    this.gtab = 'all';
    this.sortNew = true;
    this.radioIdx = 0;
    this.revealing = null;
    this.buildStats();
    this.bind();
  }

  /* ── 메뉴 ────────────────────────────────────── */
  UI.prototype.showMenu = function () {
    el('menu').classList.remove('hidden');
    el('app').classList.add('hidden');
    const has = B.Engine.hasSave();
    el('btnResume').classList.toggle('hidden', !has);
    if (has) {
      const saved = B.Engine.load();
      if (saved) {
        el('resumeInfo').textContent =
          saved.st.page + '페이지 · 진행도 ' + saved.progress() + '%';
      }
    }
    this.rollRadio();
  };

  UI.prototype.rollRadio = function () {
    el('radioText').textContent = RADIO[this.radioIdx % RADIO.length];
    this.radioIdx++;
  };

  UI.prototype.showPlay = function () {
    el('menu').classList.add('hidden');
    el('app').classList.remove('hidden');
  };

  /* ── 상단 상태 ───────────────────────────────── */
  UI.prototype.buildStats = function () {
    const stats = doc.querySelector('.hud-stats');
    stats.innerHTML = '';
    const defs = [
      { id: 'hp', key: '체력', icon: ICON.hp, max: 3 },
      { id: 'mp', key: '멘탈', icon: ICON.mp, max: 3 },
      { id: 'money', key: '돈', icon: ICON.money, max: 3 },
      { id: 'rad', key: '피폭', icon: ICON.rad, max: 4 }
    ];
    this.pips = {};
    defs.forEach(function (d) {
      const wrap = doc.createElement('div');
      wrap.className = 'stat';
      const pips = doc.createElement('div');
      pips.className = 'pips';
      for (let i = 0; i < d.max; i++) {
        const s = doc.createElement('span');
        s.className = 'pip';
        s.innerHTML = d.icon;
        pips.appendChild(s);
      }
      const k = doc.createElement('span');
      k.className = 'k';
      k.textContent = d.key;
      wrap.appendChild(pips);
      wrap.appendChild(k);
      stats.appendChild(wrap);
      this.pips[d.id] = { wrap: wrap, nodes: pips.children };
    }, this);
  };

  UI.prototype.bind = function () {
    const self = this;

    el('btnStart').addEventListener('click', function () { self.onStart(); });
    el('btnResume').addEventListener('click', function () { self.onResume(); });
    el('radioNext').addEventListener('click', function () { self.rollRadio(); });
    Array.prototype.forEach.call(doc.querySelectorAll('.menu-nav button'), function (b) {
      b.addEventListener('click', function () { self.openInfo(b.getAttribute('data-menu')); });
    });

    el('story').addEventListener('click', function (ev) {
      if (ev.target.closest('#choices')) return;
      self.tap();
    });
    el('menuBtn').addEventListener('click', function () { self.openGadget(); });
    el('badgeRank').addEventListener('click', function () { self.openGadget(); });
    el('btnGadget').addEventListener('click', function () { self.openGadget(); });
    el('btnSave').addEventListener('click', function () {
      self.e.save();
      self.toast('저장했습니다. ' + self.e.st.page + '페이지');
    });

    el('gClose').addEventListener('click', function () { self.closeGadget(); });
    el('gadgetSheet').addEventListener('click', function (ev) {
      if (ev.target === el('gadgetSheet')) self.closeGadget();
    });
    el('gSort').addEventListener('click', function () {
      self.sortNew = !self.sortNew;
      el('gSort').querySelector('span').textContent = self.sortNew ? '최신순' : '이름순';
      self.renderGadget();
    });
    el('gRestart').addEventListener('click', function () {
      self.ask('진행한 기록이 사라집니다. 처음부터 다시 시작할까요?', function () {
        self.hardReset();
      });
    });
    Array.prototype.forEach.call(doc.querySelectorAll('.gsheet-tabs button'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(doc.querySelectorAll('.gsheet-tabs button'), function (x) {
          x.classList.remove('on');
        });
        b.classList.add('on');
        self.gtab = b.getAttribute('data-gtab');
        self.renderGadget();
      });
    });

    el('infoClose').addEventListener('click', function () { el('infoSheet').classList.add('hidden'); });
    el('infoSheet').addEventListener('click', function (ev) {
      if (ev.target === el('infoSheet')) el('infoSheet').classList.add('hidden');
    });

    doc.addEventListener('keydown', function (ev) {
      if (el('app').classList.contains('hidden')) return;
      if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        self.tap();
      }
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) {
        const btns = doc.querySelectorAll('#choices .choice');
        if (btns[n - 1]) btns[n - 1].click();
      }
    });
  };

  UI.prototype.onStart = function () {
    const self = this;
    function go() {
      B.RESETTING = true;
      B.Engine.clearSave();
      const engine = new B.Engine();
      self.e = engine;
      global.__b2033.engine = engine;
      B.RESETTING = false;
      self.showPlay();
      self.advance();
    }
    if (B.Engine.hasSave()) {
      this.ask('저장된 여정이 있습니다. 새로 시작하면 사라집니다. 계속할까요?', go);
      return;
    }
    go();
  };

  UI.prototype.onResume = function () {
    const saved = B.Engine.load();
    if (!saved) { this.toast('저장된 여정이 없습니다.'); return; }
    this.e = saved;
    global.__b2033.engine = saved;
    this.showPlay();
    if (saved.scene) this.render(saved.scene, true);
    else this.advance();
  };

  /* ── 진행 ────────────────────────────────────── */
  UI.prototype.tap = function () {
    if (this.revealing) { this.revealAll(); return; }
    const s = this.e.scene;
    if (s && s.choices && s.choices.length) return;
    this.advance();
  };

  UI.prototype.advance = function () {
    const s = this.e.step();
    this.render(s);
    this.e.save();
  };

  UI.prototype.choose = function (i) {
    const s = this.e.choose(i);
    if (!s) return;
    this.render(s, true, true);
    this.e.save();
  };

  /* keepScroll: 선택 뒤에는 화면을 위로 되돌리지 않는다 */
  UI.prototype.render = function (sceneObj, instant, keepScroll) {
    if (!sceneObj) return;
    const pages = el('pages');
    const self = this;
    const scrollBefore = el('story').scrollTop;

    pages.innerHTML = '';
    const nodes = [];

    sceneObj.blocks.forEach(function (b) {
      if (b.type === 'text') {
        const p = doc.createElement('p');
        let text = b.text;
        if (text.indexOf('__TITLE__') === 0) {
          p.className = 'title';
          text = text.slice(9);
        } else if (sceneObj.kind === 'ending') {
          p.className = 'ending';
        } else if (sceneObj.kind === 'meal' || sceneObj.kind === 'sleep') {
          p.className = 'system';
        }
        p.textContent = text;
        pages.appendChild(p);
        nodes.push(p);
      } else if (b.type === 'choice') {
        const d = doc.createElement('div');
        d.className = 'echo';
        const lab = doc.createElement('div');
        lab.className = 'e-label';
        lab.textContent = b.label;
        d.appendChild(lab);
        if (b.gains && b.gains.length) {
          const g = doc.createElement('span');
          g.className = 'e-gain';
          g.textContent = '+ ' + b.gains.join(', ');
          d.appendChild(g);
        }
        if (b.losses && b.losses.length) {
          const l = doc.createElement('span');
          l.className = 'e-loss';
          l.textContent = '- ' + b.losses.join(', ');
          d.appendChild(l);
        }
        pages.appendChild(d);
        nodes.push(d);
      }
    });

    this.renderHud();
    this.renderChoices(sceneObj);

    if (keepScroll) {
      el('story').scrollTop = scrollBefore;
      global.requestAnimationFrame(function () {
        el('story').scrollTop = el('story').scrollHeight;
      });
    } else {
      el('story').scrollTop = 0;
    }

    /* 문단을 하나씩 드러낸다. 화면을 누르면 한 번에 다 보인다. */
    if (instant) return;
    const hidden = nodes.slice(1);
    hidden.forEach(function (n) { n.style.visibility = 'hidden'; });
    el('choices').style.visibility = 'hidden';
    let i = 0;
    this.revealing = { nodes: hidden };
    (function step() {
      if (!self.revealing) return;
      if (i >= hidden.length) { self.revealAll(); return; }
      hidden[i].style.visibility = '';
      i++;
      self.revealing.timer = global.setTimeout(step, 260);
    })();
  };

  UI.prototype.revealAll = function () {
    if (!this.revealing) return;
    global.clearTimeout(this.revealing.timer);
    this.revealing.nodes.forEach(function (n) { n.style.visibility = ''; });
    this.revealing = null;
    el('choices').style.visibility = '';
  };

  UI.prototype.renderChoices = function (sceneObj) {
    const box = el('choices');
    const self = this;
    box.innerHTML = '';

    if (!sceneObj.choices || !sceneObj.choices.length) {
      const row = doc.createElement('div');
      row.className = 'next-row';
      row.textContent = '다음';
      row.addEventListener('click', function (ev) { ev.stopPropagation(); self.advance(); });
      box.appendChild(row);
      return;
    }

    sceneObj.choices.forEach(function (c, i) {
      const ok = self.e.checkNeed(c.need);
      const btn = doc.createElement('button');
      btn.className = 'choice' + (ok ? '' : ' locked');
      self.e.tagsOf(c).forEach(function (t) {
        const span = doc.createElement('span');
        span.className = 'tag ' + (t.kind === 'dc' ? 'dc' : (t.ok ? 'ok' : 'no'));
        span.textContent = t.text;
        btn.appendChild(span);
      });
      const label = doc.createElement('span');
      label.className = 'label';
      label.textContent = c.label;
      btn.appendChild(label);
      btn.addEventListener('click', function (ev) {
        /* 이 클릭이 본문 영역까지 올라가면 곧바로 다음 장면으로 넘어가 버린다 */
        ev.stopPropagation();
        if (!ok) { self.toast('필요한 것이 없습니다.'); return; }
        self.choose(i);
      });
      box.appendChild(btn);
    });
  };

  UI.prototype.renderHud = function () {
    const s = this.e.snapshot();
    const map = { hp: s.hp, mp: s.mp, money: s.money, rad: s.rad };
    /* 한 칸이 깎이는 중이라는 것을 눈에 보이게 한다.
     * 마지막으로 켜진 칸이 마모만큼 흐려지다가 꺼진다. */
    const sub = { hp: s.hpSub, mp: s.mpSub };
    for (const k in this.pips) {
      const g = this.pips[k];
      for (let i = 0; i < g.nodes.length; i++) {
        g.nodes[i].classList.toggle('off', i >= map[k]);
        g.nodes[i].classList.remove('worn');
        g.nodes[i].style.opacity = '';
      }
      if (sub[k]) {
        const idx = map[k] - 1;
        if (idx >= 0) {
          g.nodes[idx].classList.add('worn');
          g.nodes[idx].style.opacity = String(1 - (sub[k] / (s.wear || 4)) * 0.68);
        }
      }
      const danger = k === 'rad' ? map[k] >= 3 : (k !== 'money' && map[k] <= 1);
      g.wrap.classList.toggle('danger', danger);
    }

    el('progNum').textContent = s.progress + '%';
    el('progFill').style.width = s.progress + '%';
    const scKind = this.e.scene && this.e.scene.kind;
    el('progTag').textContent = scKind === 'special' ? '특별 이야기'
      : (scKind === 'revive' ? '되살아남'
      : (s.mode === 'prologue' ? '도입부'
      : (s.mode === 'finale' || s.mode === 'ending' ? '종장' : '서사시')));
    el('progTag').classList.toggle('special', scKind === 'special' || scKind === 'revive');
    el('pageno').textContent = '- ' + s.page + ' -';
    el('gadgetCount').textContent = s.items.length + s.skills.length;

    const belt = el('belt');
    belt.innerHTML = '';
    const items = s.items.slice(-4).reverse();
    if (!items.length) {
      const e0 = doc.createElement('span');
      e0.className = 'empty';
      e0.textContent = '가진 것이 없습니다';
      belt.appendChild(e0);
    } else {
      items.forEach(function (it) {
        const sp = doc.createElement('span');
        sp.className = 'slot' + (it.bad ? ' bad' : (it.key ? ' key' : ''));
        sp.textContent = it.name;
        if (it.n > 1) {
          const n = doc.createElement('i');
          n.className = 'n';
          n.textContent = '×' + it.n;
          sp.appendChild(n);
        }
        belt.appendChild(sp);
      });
    }
  };

  /* 안드로이드 WebView 에는 confirm() 을 띄워 줄 것이 없어서 늘 false 가 돌아왔다.
   * 그래서 "재시작"이 눌러도 아무 일이 없었다. 확인창을 직접 그린다. */
  UI.prototype.ask = function (msg, onYes) {
    const box = el('ask');
    el('askText').textContent = msg;
    box.classList.remove('hidden');
    const yes = el('askYes');
    const no = el('askNo');
    function close() {
      box.classList.add('hidden');
      yes.removeEventListener('click', ok);
      no.removeEventListener('click', close);
    }
    function ok() { close(); onYes(); }
    yes.addEventListener('click', ok);
    no.addEventListener('click', close);
  };

  /* 여정을 통째로 새로 시작한다.
   * 예전에는 location.reload() 로 했는데, 새로고침이 pagehide 를 부르고
   * 그 pagehide 가 방금 지운 저장을 도로 써 넣어서 초기화가 안 됐다. */
  UI.prototype.hardReset = function () {
    B.RESETTING = true;
    B.Engine.clearSave();
    const engine = new B.Engine();
    this.e = engine;
    global.__b2033.engine = engine;
    this.closeGadget();
    el('infoSheet').classList.add('hidden');
    B.RESETTING = false;
    this.showPlay();
    this.advance();
    this.toast('처음부터 다시 시작합니다.');
  };

  UI.prototype.toast = function (msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    global.clearTimeout(this._toast);
    this._toast = global.setTimeout(function () { t.classList.add('hidden'); }, 1800);
  };

  /* ── 가젯 시트 ───────────────────────────────── */
  UI.prototype.openGadget = function () {
    el('gadgetSheet').classList.remove('hidden');
    this.renderGadget();
  };
  UI.prototype.closeGadget = function () { el('gadgetSheet').classList.add('hidden'); };

  UI.prototype.renderGadget = function () {
    const body = el('gsheetBody');
    const s = this.e.snapshot();
    const self = this;
    body.innerHTML = '';

    if (this.gtab === 'craft') {
      const list = this.e.craftList();
      const okCount = list.filter(function (r) { return r.ok; }).length;
      const head = doc.createElement('div');
      head.className = 'g-note';
      head.style.paddingTop = '0';
      head.textContent = '지금 만들 수 있는 것 ' + okCount + '가지 · 잡동사니는 재질로 쓰입니다';
      body.appendChild(head);

      list.forEach(function (r) {
        const row = doc.createElement('button');
        row.className = 'craft-row' + (r.ok ? '' : ' off');
        const left = doc.createElement('div');
        left.className = 'c-main';
        left.innerHTML = '<b></b><span class="c-need"></span>';
        left.querySelector('b').textContent = r.name;
        left.querySelector('.c-need').textContent = r.need.join(' + ');
        const right = doc.createElement('div');
        right.className = 'c-make';
        right.textContent = '→ ' + r.makes + (r.n > 1 ? ' ×' + r.n : '');
        row.appendChild(left);
        row.appendChild(right);
        if (r.ok) {
          row.addEventListener('click', function () {
            const res = self.e.craft(r.id);
            if (!res) { self.toast('재료가 모자랍니다.'); return; }
            self.toast(res.made + (res.n > 1 ? ' ×' + res.n : '') + ' 완성');
            self.renderHud();
            self.renderGadget();
            self.e.save();
          });
        }
        body.appendChild(row);
      });
      return;
    }

    if (this.gtab === 'log') {
      const log = s.page ? this.e.st.log.slice(-40) : [];
      if (!log.length) {
        const d = doc.createElement('div');
        d.className = 'g-empty';
        d.textContent = '아직 기록이 없습니다.';
        body.appendChild(d);
        return;
      }
      const ul = doc.createElement('ul');
      ul.className = 'g-log';
      (this.sortNew ? log.slice().reverse() : log).forEach(function (l) {
        const li = doc.createElement('li');
        li.textContent = l;
        ul.appendChild(li);
      });
      body.appendChild(ul);
      return;
    }

    /* 총은 맞는 탄이 있어야 총이다. 지금 쏠 수 있는지 위에 적어 준다 */
    if (this.gtab === 'all' || this.gtab === 'item') {
      const guns = s.items.filter(function (i) { return i.gun; });
      if (guns.length) {
        const g = doc.createElement('div');
        g.className = 'g-note';
        g.style.paddingTop = '0';
        const loaded = guns.filter(function (i) { return self.e.armed(i.gun); });
        g.textContent = loaded.length
          ? '지금 쏠 수 있는 총: ' + loaded.map(function (i) { return i.name; }).join(', ')
          : '총은 있는데 맞는 탄이 없습니다. 탄부터 구해야 합니다.';
        body.appendChild(g);
      }
    }

    if ((this.gtab === 'all' || this.gtab === 'skill') && s.titles && s.titles.length) {
      const tt = doc.createElement('div');
      tt.className = 'g-note';
      tt.style.paddingTop = '0';
      tt.textContent = '불리는 이름: ' + s.titles.map(function (x) { return '「' + x + '」'; }).join(' ');
      body.appendChild(tt);
    }

    let cells = [];
    if (this.gtab === 'all' || this.gtab === 'skill') {
      cells = cells.concat(s.skills.map(function (sk) {
        return { name: sk.name + (sk.lv > 1 ? ' Lv.' + sk.lv : ''), cls: 'key', kind: 'skill' };
      }));
    }
    if (this.gtab === 'all' || this.gtab === 'item') {
      cells = cells.concat(s.items.filter(function (i) { return i.kind !== 'mood'; })
        .map(function (i) {
          const loaded = i.gun && self.e.armed(i.gun);
          return { name: i.name + (loaded ? ' · 장전됨' : ''), n: i.n, id: i.id, kind: 'item',
                   cls: i.key ? 'key' : (loaded ? 'key' : ''), use: self.e.canUse(i.id), note: i.note };
        }));
    }
    if (this.gtab === 'all' || this.gtab === 'state') {
      cells = cells.concat(s.items.filter(function (i) { return i.kind === 'mood'; })
        .map(function (i) {
          return { name: i.name, n: i.n, id: i.id, kind: 'state', cls: i.bad ? 'bad' : 'key' };
        }));
    }

    if (!this.sortNew) cells.sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });
    else cells.reverse();

    if (!cells.length) {
      const d = doc.createElement('div');
      d.className = 'g-empty';
      d.textContent = '아무것도 없습니다.';
      body.appendChild(d);
      return;
    }

    const grid = doc.createElement('div');
    grid.className = 'g-grid';
    cells.forEach(function (c) {
      const b = doc.createElement('button');
      b.className = 'g-cell ' + (c.cls || '') + (c.use ? ' usable' : '');
      b.textContent = c.name;
      if (c.n > 1) {
        const n = doc.createElement('span');
        n.className = 'n';
        n.textContent = ' x ' + c.n;
        b.appendChild(n);
      }
      if (c.use) {
        b.addEventListener('click', function () {
          const r = self.e.useItem(c.id);
          if (!r) return;
          self.toast(r.cured ? r.name + ' 사용 · ' + r.cured + ' 정리' : r.name + '을(를) 썼습니다.');
          self.renderHud();
          self.renderGadget();
          self.e.save();
        });
      } else if (c.note) {
        b.addEventListener('click', function () { self.toast(c.name + ' — ' + c.note); });
      }
      grid.appendChild(b);
    });
    body.appendChild(grid);

    const note = doc.createElement('div');
    note.className = 'g-note';
    note.textContent = '밑줄 친 것은 눌러서 바로 쓸 수 있습니다. 노란 것은 언젠가 쓸 데가 있습니다.';
    body.appendChild(note);
  };

  /* ── 메뉴 안내 시트 ──────────────────────────── */
  UI.prototype.openInfo = function (which) {
    const self2 = this;
    const body = el('infoBody');
    const rec = B.Engine.records();
    body.innerHTML = '';
    el('infoSheet').classList.remove('hidden');

    function h(t) { const x = doc.createElement('div'); x.className = 'info-h'; x.textContent = t; body.appendChild(x); }
    function row(a, b) {
      const d = doc.createElement('div');
      d.className = 'info-row';
      d.innerHTML = '<span></span><span class="muted"></span>';
      d.children[0].textContent = a;
      d.children[1].textContent = b;
      body.appendChild(d);
    }
    function para(t) { const p = doc.createElement('div'); p.className = 'info-p'; p.textContent = t; body.appendChild(p); }
    function note0(t) { const p = doc.createElement('div'); p.className = 'info-p'; p.textContent = t; body.appendChild(p); }

    if (which === 'records') {
      el('infoTitle').textContent = '기록실';
      h('지나온 여정');
      row('시작한 여정', (rec.runs || 0) + '번');
      row('가장 멀리 간 페이지', (rec.best || 0) + '페이지');
      row('본 엔딩', Object.keys(rec.endings || {}).length + ' / ' + Object.keys(B.ARCS.ENDINGS).length);
      h('특별 이야기');
      (B.SPECIALS || []).forEach(function (sp) {
        const seen = (rec.specials || {})[sp.id];
        row(seen ? sp.title.replace('특별 이야기 · ', '') : '???',
            seen ? '완료 ' + seen + '회' : '아직');
      });
      const spDone = Object.keys(rec.specials || {}).length;
      para('특별 이야기 ' + spDone + ' / ' + (B.SPECIALS || []).length + '편을 보았습니다.');

      h('얻은 칭호');
      const titles = (rec.titles || []);
      if (!titles.length) note0('아직 불리는 이름이 없습니다.');
      titles.forEach(function (t2) { row('「' + t2 + '」', ''); });

      h('이 도시가 부르는 이름');
      const known = (B.STATES || []);
      const got = known.filter(function (n) { return titles.indexOf(n) >= 0; });
      known.forEach(function (n) {
        row(titles.indexOf(n) >= 0 ? n : '???', titles.indexOf(n) >= 0 ? '얻음' : '아직');
      });
      para('세력과 동네가 붙여 주는 이름은 ' + got.length + ' / ' + known.length + '개를 얻었습니다.');

      h('이 도시에 있는 것들');
      row('사건', B.TEMPLATES.length + '종');
      row('가젯', (B.ITEMS.length + B.SKILLS.length) + '종');
      row('본편', B.ARCS.CHAPTERS.length + '장 + 종장');
    }

    if (which === 'endings') {
      el('infoTitle').textContent = '엔딩';
      const ends = B.ARCS.ENDINGS;
      Object.keys(ends).forEach(function (id) {
        const seen = (rec.endings || {})[id];
        row(seen ? ends[id].name : '???', seen ? seen + '번' : '아직');
      });
      para('죽는 것도 엔딩입니다. 다르게 걸으면 다르게 끝납니다.');
    }

    if (which === 'help') {
      el('infoTitle').textContent = '도움말';
      h('읽는 법');
      para('화면을 누르면 다음 문단이 한 번에 나옵니다. 선택지는 아래에 나타납니다.');
      h('선택지 앞의 글씨');
      para('초록은 가지고 있는 것, 빨강은 없는 것입니다. 빨간 선택지는 고를 수 없습니다. 분홍색 "판정"은 능력 수치로 성패가 갈린다는 뜻입니다.');
      h('세 칸짜리 자원');
      para('체력·멘탈·돈은 각각 세 칸입니다. 한 칸이 깎이려면 네 번 다쳐야 하고, 회복은 한 번에 한 칸씩 돌아옵니다. 체력이나 멘탈이 0이 되면 그 자리에서 끝납니다.');
      h('피폭');
      para('네 칸까지 있습니다. 시간이 지나면 조금씩 빠지지만, 오염 구역에서는 그보다 빨리 찹니다.');
      h('몸에 남는 것');
      para('감기·감염·출혈·중독 같은 것은 진료소에서 떨어집니다. 화·죄책감·불면·수배는 목욕탕과 모닥불에서 떨어집니다.');
      para('다만 떨어지지 않는 것도 있습니다. 머리에 총상, 벌집이 됨, 개조됨, 탈모, 하드 모드 같은 것들은 그대로 남습니다. 그것도 이 도시를 지나온 기록입니다.');
      h('죽기 직전');
      para('체력이나 멘탈이 0이 되는 순간, 가방을 한 번 뒤집니다. 의약품·의료용 주사기·생명의 부적이 있으면 그중 하나를 쓰고 그 자리에서 되살아납니다. 의약품은 한 칸, 주사기는 두 칸, 부적은 세 칸까지 돌려주고 상처까지 데려갑니다. 부적은 무당에게 한 여정에 딱 하나만 받을 수 있습니다.');
      para('되살릴 것이 하나도 없으면 「사망했습니다」가 뜨고 재시작만 남습니다.');
      h('특별 이야기');
      para('손으로 쓴 단편·중편 32편이 여정 중간중간 끼어듭니다. 나오는 순서와 페이지는 판마다 다르게 섞이고, 한 여정에서 같은 편이 두 번 나오지는 않습니다.');
      h('잡동사니');
      para('값도 없고 배도 안 부르는 물건들이 있습니다. 그중 몇 가지는 한참 뒤에 그것이 있어야만 열리는 사건을 데려옵니다. 웬만하면 버리지 마세요.');
    }

    if (which === 'credit') {
      el('infoTitle').textContent = '만든 것';
      para('부산 2033 · 텍스트 서사 게임');
      h('규모');
      row('사건', B.TEMPLATES.length + '종');
      row('장면 본문', Object.keys(B.BODIES).reduce(function (a, k) { return a + B.BODIES[k].length; }, 0) + '문단');
      row('아이템', B.ITEMS.length + '종');
      row('능력', B.SKILLS.length + '종');
      row('이야기 조합', B.Generator.computeVariety().toLocaleString() + '가지');
      h('진행');
      para('진행도 100%(' + B.Engine.FINAL_PAGE + '페이지)에 닿으면 종장이 열립니다. 그때까지 무엇을 들고 있느냐에 따라 끝이 달라집니다.');
      const nb = doc.createElement('button');
      nb.className = 'info-btn danger';
      nb.textContent = '저장된 여정 지우기';
      nb.addEventListener('click', function () {
        self2.ask('저장된 여정을 지울까요?', function () {
          B.RESETTING = true;
          B.Engine.clearSave();
          B.RESETTING = false;
          el('infoSheet').classList.add('hidden');
          self2.showMenu();
          self2.toast('저장된 여정을 지웠습니다.');
        });
      });
      body.appendChild(nb);
    }
  };

  B.UI = UI;
})(typeof window !== 'undefined' ? window : globalThis);

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
    el('btnResume').classList.toggle('off', !has);
    let info = '저장된 여정 없음';
    if (has) {
      const saved = B.Engine.load();
      if (saved) info = saved.st.page + '페이지 · ' + saved.progress() + '%';
    }
    el('resumeInfo').textContent = info;
    this.paintCookies();
    this.rollRadio();
  };

  /* 안 받은 편지 수 */
  UI.prototype.mailLeft = function () {
    const taken = B.Engine.mailTaken();
    return (B.MAIL || []).filter(function (m) { return !taken[m.id]; }).length;
  };

  UI.prototype.paintCookies = function () {
    const box = el('cookieN');
    if (box) box.textContent = B.Engine.cookies().toLocaleString('ko-KR');

    const left = this.mailLeft();
    const mn = el('mailN');
    if (mn) mn.textContent = left;
    const dots = [el('mailDot'), el('navMailDot')];
    dots.forEach(function (d) { if (d) d.classList.toggle('hidden', left === 0); });

    const mi = el('missInfo');
    if (mi) {
      const ms = B.Engine.missions();
      const done = B.Engine.records().missionDone || {};
      const n3 = ms.filter(function (m) { return done[m.id + '_' + m.tier]; }).length;
      mi.textContent = n3 + ' / ' + ms.length + ' 달성';
    }

    const li = el('longInfo');
    if (li) {
      const all = Object.keys(B.LONGS || {});
      const on = B.Engine.longApplied();
      const n2 = all.filter(function (id) { return on[id]; }).length;
      li.textContent = n2 + ' / ' + all.length + '편 적용';
    }
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
    Array.prototype.forEach.call(doc.querySelectorAll('#menu [data-menu]'), function (b) {
      b.addEventListener('click', function () {
        if (B.Sound) B.Sound.soft();
        self.openInfo(b.getAttribute('data-menu'));
      });
    });

    el('story').addEventListener('click', function (ev) {
      if (ev.target.closest('#choices')) return;
      if (B.Sound) B.Sound.page();
      self.tap();
    });
    el('menuBtn').addEventListener('click', function () { if (B.Sound) B.Sound.soft(); self.openGadget(); });
    el('badgeRank').addEventListener('click', function () { if (B.Sound) B.Sound.soft(); self.openGadget(); });
    el('btnGadget').addEventListener('click', function () { if (B.Sound) B.Sound.soft(); self.openGadget(); });
    el('btnSave').addEventListener('click', function () {
      if (B.Sound) B.Sound.soft();
      self.e.save();
      self.toast('저장했습니다. ' + self.e.st.page + '페이지');
    });

    el('gClose').addEventListener('click', function () { if (B.Sound) B.Sound.soft(); self.closeGadget(); });
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
    if (B.Sound) B.Sound.click();
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
    if (B.Sound) B.Sound.click();
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

    /* 끝난 미션이 있으면 알려 준다 */
    if (this.e && this.e.st && this.e.st.mToast && this.e.st.mToast.length) {
      const ms = this.e.st.mToast;
      this.e.st.mToast = null;
      const self4 = this;
      ms.forEach(function (m, i) {
        global.setTimeout(function () { self4.toast('미션 완료 — ' + m + ' 🍪'); }, 300 + i * 1500);
      });
    }

    /* 조건이 차서 수집된 이야기가 있으면 알려 준다 */
    if (this.e && this.e.st && this.e.st.ksToast && this.e.st.ksToast.length) {
      const names = this.e.st.ksToast;
      this.e.st.ksToast = null;
      const self3 = this;
      names.forEach(function (n, i) {
        global.setTimeout(function () {
          self3.toast('이야기를 수집했습니다 — 「' + n + '」');
        }, 400 + i * 1600);
      });
    }

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
      row.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (B.Sound) B.Sound.page();
        self.advance();
      });
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
        if (!ok) { if (B.Sound) B.Sound.soft(); self.toast('필요한 것이 없습니다.'); return; }
        if (B.Sound) B.Sound.click();
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

    /* 같이 걷는 사람과 쫓기는 정도 */
    const bar = el('mateBar');
    const hunted = s.hunt >= 2;
    if (s.mate || hunted) {
      bar.classList.remove('hidden');
      if (s.mate) {
        el('mateName').textContent = s.mate.name;
        el('mateSub').textContent = s.mate.skill
          ? s.mate.sub + ' · ' + s.mate.skill
          : s.mate.sub;
        let pips = '';
        for (let i = 0; i < 3; i++) pips += '<s class="' + (i < s.mate.trust ? '' : 'off') + '"></s>';
        el('mateTrust').innerHTML = pips;
        el('mateTrust').classList.remove('hidden');
      } else {
        el('mateName').textContent = '혼자';
        el('mateSub').textContent = '같이 걷는 사람이 없습니다';
        el('mateTrust').innerHTML = '';
      }
      const ht = el('huntTag');
      ht.classList.toggle('hidden', !hunted);
      ht.textContent = s.hunt >= 9 ? '쫓김 · 이름이 붙었습니다'
        : (s.hunt >= 5 ? '쫓김 · 값이 붙었습니다' : '쫓김');
    } else {
      bar.classList.add('hidden');
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
                   cls: i.key ? 'key' : (loaded ? 'key' : ''), note: i.note };
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
      b.className = 'g-cell ' + (c.cls || '');
      b.textContent = c.name;
      if (c.n > 1) {
        const n = doc.createElement('span');
        n.className = 'n';
        n.textContent = ' x ' + c.n;
        b.appendChild(n);
      }
      if (c.note) {
        b.addEventListener('click', function () { self.toast(c.name + ' — ' + c.note); });
      }
      grid.appendChild(b);
    });
    body.appendChild(grid);

    const note = doc.createElement('div');
    note.className = 'g-note';
    note.textContent = '가진 것은 이야기 안에서 씁니다. 쓸 자리가 오면 선택지 앞에 이름이 붙습니다. 노란 것은 언젠가 쓸 데가 있습니다.';
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

      h('같이 걸은 사람');
      const known2 = B.Engine.matesKnown();
      (B.MATES || []).forEach(function (m) {
        const k = known2[m.id];
        if (!k) { row('???', '아직 못 만남'); return; }
        const tag = [];
        if (k.walked) tag.push('같이 걸음 ' + k.walked + '번');
        else tag.push('마주침 ' + (k.met || 1) + '번');
        if (k.bond) tag.push('속 얘기 들음');
        if (k.saved) tag.push('대신 맞아 줌');
        row(m.name + ' · ' + m.sub, tag.join(' · '));
      });
      const walkedN = Object.keys(known2).filter(function (id) { return known2[id].walked; }).length;
      para('여덟 중 ' + walkedN + '명과 같이 걸어 봤습니다.');

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

    if (which === 'more') {
      el('infoTitle').textContent = '더보기';
      const more = [
        { id: 'endings',   ico: '📖', t: '엔딩',    d: '본 엔딩과 아직 못 본 엔딩' },
        { id: 'missions',  ico: '📋', t: '미션',    d: '셋씩 붙고, 갱신하면 새로 뽑힙니다' },
        { id: 'keepsakes', ico: '📚', t: '내 서재', d: '수집한 이야기를 켜고 끕니다' },
        { id: 'help',      ico: '❔', t: '도움말',  d: '읽는 법과 규칙' },
        { id: 'credit',    ico: '✎', t: '만든 것',  d: '이 도시에 들어 있는 것들' }
      ];
      more.forEach(function (m) {
        const b = doc.createElement('button');
        b.className = 'more-row';
        b.innerHTML = '<span class="m-ico"></span><span class="m-txt"><b></b><i></i></span><span class="m-go">›</span>';
        b.querySelector('.m-ico').textContent = m.ico;
        b.querySelector('b').textContent = m.t;
        b.querySelector('i').textContent = m.d;
        b.addEventListener('click', function () {
          if (B.Sound) B.Sound.soft();
          self2.openInfo(m.id);
        });
        body.appendChild(b);
      });
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

    if (which === 'keepsakes') {
      el('infoTitle').textContent = '수집한 이야기';
      const list = B.Engine.keepsakeList();
      const got = B.Engine.collected();
      const on = B.Engine.applied();
      para('여정 중에 조건을 맞추면 여기 쌓입니다. 적용해 두면 다음 여정에서 나올 수 있습니다.');
      h('가지고 있는 것');
      let any = 0;
      list.forEach(function (k) {
        if (!got[k.id]) return;
        any++;
        const d = doc.createElement('div');
        d.className = 'info-row';
        d.innerHTML = '<span></span><span class="muted"></span>';
        d.children[0].textContent = k.title.replace('수집한 이야기 · ', '');
        const b = doc.createElement('button');
        b.className = 'info-btn ks-toggle';
        function paint() { b.textContent = B.Engine.applied()[k.id] ? '적용됨' : '적용 안 함'; }
        paint();
        b.addEventListener('click', function () {
          if (B.Sound) B.Sound.click();
          B.Engine.toggleApplied(k.id);
          paint();
        });
        d.children[1].appendChild(b);
        body.appendChild(d);
      });
      if (!any) note0('아직 하나도 없습니다. 여정 중에 조건이 차면 그 자리에서 알려 줍니다.');

      h('아직 못 얻은 것');
      let left = 0;
      list.forEach(function (k) {
        if (got[k.id]) return;
        left++;
        row('???', k.hint || '');
      });
      if (!left) note0('전부 모았습니다.');
      para('수집 ' + Object.keys(got).length + ' / ' + list.length + '편 · 적용 '
           + Object.keys(on).length + '편');
    }

    if (which === 'shop') {
      el('infoTitle').textContent = '상점';
      const own = B.Engine.owned();
      const on = B.Engine.longApplied();
      const done = B.Engine.longsDone();
      para('쿠키로 장편 이야기를 삽니다. 사면 바로 적용되고, 적용해 둔 편은 여정 중에 이어서 나옵니다.');
      row('가진 쿠키', B.Engine.cookies().toLocaleString('ko-KR') + ' 🍪');
      h('장편 이야기');
      Object.keys(B.LONGS || {}).forEach(function (id) {
        const lg = B.LONGS[id];
        const price = (B.SHOP_PRICE || {})[id] || 0;
        const d = doc.createElement('div');
        d.className = 'shop-row';
        const left = doc.createElement('div');
        left.className = 's-l';
        const nb = doc.createElement('b');
        nb.textContent = lg.name + ' — ' + lg.sub;
        const ni = doc.createElement('i');
        ni.textContent = lg.intro + '\n장면 ' + lg.scenes.length + '개'
          + (done[id] ? ' · 끝낸 적 ' + done[id] + '번' : '');
        left.appendChild(nb); left.appendChild(ni);
        const right = doc.createElement('div');
        right.className = 's-r';
        const btn = doc.createElement('button');
        btn.className = 'info-btn ks-toggle';
        function paint() {
          if (!B.Engine.owned()[id]) btn.textContent = price + ' 🍪';
          else btn.textContent = B.Engine.longApplied()[id] ? '적용됨' : '적용 안 함';
        }
        paint();
        btn.addEventListener('click', function () {
          if (B.Sound) B.Sound.click();
          if (!B.Engine.owned()[id]) {
            if (B.Engine.buyLong(id)) { self2.toast(B.josa(lg.name + '을(를) 샀습니다.')); }
            else { self2.toast('쿠키가 모자랍니다.'); }
          } else {
            B.Engine.toggleLong(id);
          }
          paint();
          self2.paintCookies();
          const c = body.querySelector('.info-row .muted');
          if (c) c.textContent = B.Engine.cookies().toLocaleString('ko-KR') + ' 🍪';
        });
        right.appendChild(btn);
        d.appendChild(left); d.appendChild(right);
        body.appendChild(d);
      });
      para('쿠키는 미션을 끝내면 들어옵니다. 우편함도 확인해 보세요.');
    }

    if (which === 'missions') {
      el('infoTitle').textContent = '미션';
      const eng = self2.e;
      const done = B.Engine.missionDone();
      para('셋이 붙어 있습니다. 여정 중에 조건을 채우면 그 자리에서 쿠키가 들어옵니다.');
      row('가진 쿠키', B.Engine.cookies().toLocaleString('ko-KR') + ' 🍪');
      h('지금 미션');
      B.Engine.missions().forEach(function (m) {
        const def = (B.MISSIONS || []).filter(function (x) { return x.id === m.id; })[0];
        if (!def) return;
        const goal = def.goal[m.tier];
        const rew = def.reward[m.tier];
        const now = eng ? eng.missionValue(def.want) : 0;
        const ok = !!done[m.id + '_' + m.tier];
        const d = doc.createElement('div');
        d.className = 'mission-row' + (ok ? ' done' : '');
        const t = doc.createElement('div');
        t.className = 'm-t';
        const nb = doc.createElement('b');
        nb.textContent = def.name + (ok ? ' · 완료' : '');
        const rb = doc.createElement('span');
        rb.className = 'muted';
        rb.textContent = rew + ' 🍪';
        t.appendChild(nb); t.appendChild(rb);
        const dd = doc.createElement('div');
        dd.className = 'm-d';
        dd.textContent = def.desc.replace('{n}', goal)
          + (ok ? '' : '  (' + Math.min(now, goal) + ' / ' + goal + ')');
        const bar = doc.createElement('div');
        bar.className = 'm-bar';
        const fill = doc.createElement('span');
        fill.style.width = Math.min(100, Math.round((ok ? goal : now) / goal * 100)) + '%';
        bar.appendChild(fill);
        d.appendChild(t); d.appendChild(dd); d.appendChild(bar);
        body.appendChild(d);
      });
      const rb2 = doc.createElement('button');
      rb2.className = 'info-btn';
      rb2.textContent = '갱신하기';
      rb2.addEventListener('click', function () {
        if (B.Sound) B.Sound.click();
        B.Engine.rollMissions();
        self2.openInfo('missions');
      });
      body.appendChild(rb2);
      para('이미 끝낸 미션은 갱신해도 안 사라집니다. 여정 중에는 다섯 페이지마다 확인합니다.');
    }

    if (which === 'mail') {
      el('infoTitle').textContent = '우편함';
      const taken = B.Engine.mailTaken();
      row('가진 쿠키', B.Engine.cookies().toLocaleString('ko-KR') + ' 🍪');
      let left = 0;
      (B.MAIL || []).forEach(function (m) {
        const d = doc.createElement('div');
        d.className = 'mail-row';
        const f = doc.createElement('div'); f.className = 'ml-from'; f.textContent = m.from;
        const t = doc.createElement('div'); t.className = 'ml-title'; t.textContent = m.title;
        const b2 = doc.createElement('div'); b2.className = 'ml-body'; b2.textContent = m.body;
        d.appendChild(f); d.appendChild(t); d.appendChild(b2);
        const btn = doc.createElement('button');
        btn.className = 'info-btn';
        function paint() {
          btn.textContent = B.Engine.mailTaken()[m.id]
            ? '받았습니다' : (m.cookies || 0).toLocaleString('ko-KR') + ' 🍪 받기';
          btn.disabled = !!B.Engine.mailTaken()[m.id];
        }
        paint();
        if (!taken[m.id]) left++;
        btn.addEventListener('click', function () {
          if (B.Sound) B.Sound.click();
          const got = B.Engine.takeMail(m.id);
          if (got) self2.toast('쿠키 ' + got.toLocaleString('ko-KR') + '개를 받았습니다.');
          paint();
          self2.paintCookies();
          const c = body.querySelector('.info-row .muted');
          if (c) c.textContent = B.Engine.cookies().toLocaleString('ko-KR') + ' 🍪';
        });
        d.appendChild(btn);
        body.appendChild(d);
      });
      if (!left) para('안 받은 것이 없습니다.');
    }

    if (which === 'help') {
      el('infoTitle').textContent = '도움말';
      h('읽는 법');
      para('화면을 누르면 다음 문단이 한 번에 나옵니다. 선택지는 아래에 나타납니다.');
      h('가진 것을 쓰는 법');
      para('소지품 창에서는 바로 못 씁니다. 쓸 자리가 이야기 안에서 옵니다. 붕대가 필요한 자리에 오면 선택지 앞에 「붕대」가 초록으로 붙고, 그것을 고르면 그때 쓰입니다.');
      para('죽기 직전에만 예외입니다. 그때는 가방을 알아서 뒤집니다.');
      h('선택지 앞의 글씨');
      para('초록은 가지고 있는 것, 빨강은 없는 것입니다. 빨간 선택지는 고를 수 없습니다. 분홍색 "판정"은 능력 수치로 성패가 갈린다는 뜻입니다.');
      h('세 칸짜리 자원');
      para('체력·멘탈·돈은 각각 세 칸입니다. 한 칸이 깎이려면 네 번 다쳐야 하고, 회복은 한 번에 한 칸씩 돌아옵니다. 체력이나 멘탈이 0이 되면 그 자리에서 끝납니다.');
      h('피폭');
      para('네 칸까지 있습니다. 시간이 지나면 조금씩 빠지지만, 오염 구역에서는 그보다 빨리 찹니다.');
      h('쿠키와 상점');
      para('미션을 끝내면 쿠키가 들어옵니다. 미션은 셋이 붙어 있고 갱신하기를 누르면 새로 뽑습니다. 쿠키로 상점에서 장편 이야기를 사고, 적용해 두면 여정 중에 이어서 나옵니다. 우편함도 한 번 열어 보세요.');
      h('시작 사연');
      para('게임을 시작하면 맨 처음 장면에서 고릅니다. 「부산-애프터에이틴」은 산에서 자라 열여덟 해 뒤에 내려온 사람이고, 「부산-코마」는 그날 이전에 눈을 감고 십팔 년 뒤에 깬 사람입니다. 도입부도 본편도 다릅니다.');
      h('수집한 이야기');
      para('여정 중에 조건을 맞추면 짧은 이야기가 하나씩 수집됩니다. 메뉴 아래 「내 서재」에서 적용해 두면 다음 여정의 특별 이야기 순번에 같이 섞여, 새로 시작한 판에서도 나올 수 있습니다.');
      h('소리');
      para('선택할 때마다 짧게 딸깍 소리가 납니다. 파일이 아니라 그때그때 만들어 내는 소리라 용량은 늘지 않습니다.');
      const sb = doc.createElement('button');
      sb.className = 'info-btn';
      function label() { sb.textContent = (B.Sound && B.Sound.isOn()) ? '소리 끄기' : '소리 켜기'; }
      label();
      sb.addEventListener('click', function () { if (B.Sound) B.Sound.toggle(); label(); });
      body.appendChild(sb);

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

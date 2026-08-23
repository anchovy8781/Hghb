/* 부산 2033 - 화면 그리기 */
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

  function el(id) { return doc.getElementById(id); }

  function UI(engine) {
    this.e = engine;
    this.typing = null;
    this.tab = 'status';
    this.build();
    this.bind();
  }

  /* 상단 상태바를 칸 아이콘 방식으로 다시 그린다 */
  UI.prototype.build = function () {
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
      this.pips[d.id] = { wrap: wrap, nodes: pips.children, max: d.max };
    }, this);
  };

  UI.prototype.bind = function () {
    const self = this;

    el('story').addEventListener('click', function () { self.tap(); });

    el('menuBtn').addEventListener('click', function () { self.openSheet(); });
    el('sheetClose').addEventListener('click', function () { self.closeSheet(); });
    el('menuSheet').addEventListener('click', function (ev) {
      if (ev.target === el('menuSheet')) self.closeSheet();
    });
    Array.prototype.forEach.call(doc.querySelectorAll('.sheet-tabs button'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(doc.querySelectorAll('.sheet-tabs button'), function (x) {
          x.classList.remove('on');
        });
        b.classList.add('on');
        self.tab = b.getAttribute('data-tab');
        self.renderSheet();
      });
    });

    doc.addEventListener('keydown', function (ev) {
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

  /* 본문 아무 데나 누르면: 타자 효과 건너뛰기 → 다음 페이지 */
  UI.prototype.tap = function () {
    if (this.typing) { this.finishTyping(); return; }
    const beat = this.e.beat;
    if (beat && beat.choices && beat.choices.length) return;
    this.advance();
  };

  UI.prototype.advance = function () {
    const beat = this.e.step();
    this.show(beat);
  };

  UI.prototype.choose = function (i) {
    const beat = this.e.choose(i);
    if (beat) this.show(beat);
  };

  /* ── 표시 ────────────────────────────────────── */
  UI.prototype.show = function (beat) {
    if (!beat) return;
    const pages = el('pages');
    pages.innerHTML = '';
    const p = doc.createElement('p');
    if (beat.kind === 'title') p.className = 'title';
    else if (beat.kind === 'ending') p.className = 'ending';
    else if (beat.kind === 'sys' || beat.kind === 'meal' || beat.kind === 'sleep') p.className = 'system';
    pages.appendChild(p);
    el('story').scrollTop = 0;

    this.renderHud();
    el('choices').innerHTML = '';
    this.type(p, beat.text || '', beat);
    this.e.save();
  };

  UI.prototype.type = function (node, text, beat) {
    const self = this;
    let i = 0;
    const speed = text.length > 120 ? 12 : 18;
    this.typing = { node: node, text: text, beat: beat };
    node.textContent = '';

    function tick() {
      if (!self.typing) return;
      i += 2;
      node.textContent = text.slice(0, i);
      if (i >= text.length) { self.finishTyping(); return; }
      self.typing.timer = global.setTimeout(tick, speed);
    }
    tick();
  };

  UI.prototype.finishTyping = function () {
    if (!this.typing) return;
    const t = this.typing;
    global.clearTimeout(t.timer);
    t.node.textContent = t.text;
    this.typing = null;
    this.renderChoices(t.beat);
  };

  UI.prototype.renderChoices = function (beat) {
    const box = el('choices');
    const self = this;
    box.innerHTML = '';

    if (!beat.choices || !beat.choices.length) {
      const row = doc.createElement('div');
      row.className = 'next-row';
      row.textContent = '다음';
      row.addEventListener('click', function () { self.advance(); });
      box.appendChild(row);
      return;
    }

    beat.choices.forEach(function (c, i) {
      const ok = self.e.checkNeed(c.need);
      const btn = doc.createElement('button');
      btn.className = 'choice' + (ok ? '' : ' locked');

      const tags = self.e.tagsOf(c);
      tags.forEach(function (t) {
        const span = doc.createElement('span');
        span.className = 'tag ' + (t.kind === 'dc' ? 'dc' : (t.ok ? 'ok' : 'no'));
        span.textContent = t.text;
        btn.appendChild(span);
      });

      const label = doc.createElement('span');
      label.className = 'label';
      label.textContent = c.label;
      btn.appendChild(label);

      btn.addEventListener('click', function () {
        if (!ok) { self.toast('필요한 것이 없습니다.'); return; }
        self.choose(i);
      });
      box.appendChild(btn);
    });
  };

  UI.prototype.renderHud = function () {
    const s = this.e.snapshot();
    const map = { hp: s.hp, mp: s.mp, money: s.money, rad: s.rad };
    for (const k in this.pips) {
      const g = this.pips[k];
      for (let i = 0; i < g.nodes.length; i++) {
        g.nodes[i].classList.toggle('off', i >= map[k]);
      }
      const danger = k === 'rad' ? map[k] >= 3 : (k !== 'money' && map[k] <= 1);
      g.wrap.classList.toggle('danger', danger);
    }

    el('pageno').textContent = '- ' + s.page + ' -';

    /* 하단 벨트: 최근에 얻은 것 위주로 네 칸 */
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
        sp.className = 'slot' + (it.kind === 'mood' && it.bad ? ' bad' : '');
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

    /* 장비 / 계급 배지 */
    const weapon = ['rifle', 'shotgun', 'pistol', 'knife', 'pipe'].filter(function (id) {
      return s.items.some(function (x) { return x.id === id; });
    })[0];
    el('badgeWeapon').innerHTML = '<span>' +
      (weapon ? { rifle: '🎯', shotgun: '💥', pistol: '🔫', knife: '🔪', pipe: '🔧' }[weapon] : '✋') +
      '</span>';
    const chapter = s.chapter;
    el('badgeRank').innerHTML = '<span>' + (chapter > 0 ? chapter : '★') + '</span>';
    el('menuDot').classList.toggle('off', s.page > 3);
  };

  UI.prototype.toast = function (msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    global.clearTimeout(this._toast);
    this._toast = global.setTimeout(function () { t.classList.add('hidden'); }, 1600);
  };

  /* ── 메뉴 ────────────────────────────────────── */
  UI.prototype.openSheet = function () {
    el('menuSheet').classList.remove('hidden');
    this.renderSheet();
  };
  UI.prototype.closeSheet = function () { el('menuSheet').classList.add('hidden'); };

  UI.prototype.renderSheet = function () {
    const body = el('sheetBody');
    const s = this.e.snapshot();
    const st = this.e.st;
    const self = this;
    body.innerHTML = '';

    function h(t) { const x = doc.createElement('h4'); x.textContent = t; body.appendChild(x); }
    function row(a, b) {
      const d = doc.createElement('div');
      d.className = 'row';
      d.innerHTML = '<span>' + a + '</span><span>' + b + '</span>';
      body.appendChild(d);
    }
    function note(t) {
      const d = doc.createElement('div');
      d.className = 'muted';
      d.textContent = t;
      body.appendChild(d);
    }

    if (this.tab === 'status') {
      h('몸과 마음');
      row('체력', s.hp + ' / 3');
      row('멘탈', s.mp + ' / 3');
      row('돈', s.money + ' / 3');
      row('피폭', s.rad + ' / 4');
      row('지나온 페이지', s.page + ' / ' + B.Engine.FINAL_PAGE);
      h('능력');
      const sk = Object.keys(s.skills);
      if (!sk.length) note('아직 내세울 재주가 없습니다.');
      sk.forEach(function (id) {
        const d = B.SKILL_MAP[id];
        row(d ? d.name : id, 'Lv.' + s.skills[id]);
      });
      h('평판');
      const rk = Object.keys(s.rep);
      if (!rk.length) note('어느 쪽에도 이름이 알려지지 않았습니다.');
      rk.forEach(function (id) {
        const f = B.WORLD.FACTIONS.filter(function (x) { return x.id === id; })[0];
        row(f ? f.name : id, (s.rep[id] > 0 ? '+' : '') + s.rep[id]);
      });
    }

    if (this.tab === 'bag') {
      h('소지품');
      if (!s.items.length) note('가진 것이 없습니다.');
      s.items.forEach(function (it) {
        const d = doc.createElement('div');
        d.className = 'row';
        const left = doc.createElement('span');
        left.textContent = it.name + (it.n > 1 ? ' ×' + it.n : '');
        if (it.bad) left.className = 'bad';
        const right = doc.createElement('span');
        if (self.e.canUse(it.id)) {
          const b = doc.createElement('button');
          b.className = 'use';
          b.textContent = '쓰기';
          b.addEventListener('click', function () {
            const r = self.e.useItem(it.id);
            if (!r) return;
            self.toast(r.cured ? r.name + ' 사용 · ' + r.cured + ' 정리' : r.name + '을(를) 썼습니다.');
            self.renderHud();
            self.renderSheet();
            self.e.save();
          });
          right.appendChild(b);
        } else {
          const info = B.ITEM_MAP[it.id];
          right.className = 'muted';
          right.textContent = info && info.note ? info.note : '';
        }
        d.appendChild(left);
        d.appendChild(right);
        body.appendChild(d);
      });
      h('바꿀 수 있는 것');
      let any = false;
      B.CONVERSIONS.forEach(function (cv) {
        if (!st.items[cv.from]) return;
        any = true;
        const b = doc.createElement('button');
        b.className = 'btn';
        b.textContent = B.ITEM_MAP[cv.from].name + ' → ' + B.ITEM_MAP[cv.to].name + ' ×' + cv.count;
        b.addEventListener('click', function () {
          self.e.delItem(cv.from, 1);
          for (let i = 0; i < cv.count; i++) self.e.addItem(cv.to, 1);
          self.toast(cv.line);
          self.renderHud();
          self.renderSheet();
          self.e.save();
        });
        body.appendChild(b);
      });
      if (!any) note('지금은 바꿀 수 있는 것이 없습니다.');
    }

    if (this.tab === 'log') {
      h('지나온 길');
      const log = st.log.slice(-25).reverse();
      if (!log.length) note('아직 기록이 없습니다.');
      const ul = doc.createElement('ul');
      log.forEach(function (l) {
        const li = doc.createElement('li');
        li.textContent = l;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (this.tab === 'sys') {
      h('설정');
      const nb = doc.createElement('button');
      nb.className = 'btn danger';
      nb.textContent = '처음부터 다시 시작';
      nb.addEventListener('click', function () {
        if (!global.confirm('진행한 기록이 사라집니다. 새로 시작할까요?')) return;
        B.Engine.clearSave();
        global.location.reload();
      });
      body.appendChild(nb);

      h('이 이야기에 대하여');
      note('부산 2033 · 텍스트 서사 게임\n' +
        '이야기 조합 ' + B.Generator.computeVariety().toLocaleString() + '가지\n' +
        '사건 템플릿 ' + B.TEMPLATES.length + '종 · 본편 ' + B.ARCS.CHAPTERS.length + '장 · 엔딩 ' +
        Object.keys(B.ARCS.ENDINGS).length + '종\n' +
        '5000페이지에 닿으면 종장이 열립니다.\n' +
        '시드 ' + st.seed);
    }
  };

  B.UI = UI;
})(typeof window !== 'undefined' ? window : globalThis);

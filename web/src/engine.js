/* 부산 2033 - 게임 엔진
 *
 * 화면 단위는 "장면"이다. 장면 하나에 여러 문단이 들어가고,
 * 선택을 하면 그 선택과 결과가 같은 화면 아래로 이어 붙는다.
 * 다 읽고 "다음"을 누르면 다음 장면으로 넘어가며 페이지가 하나 올라간다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MAX = 3;             /* 체력 · 멘탈 · 돈 최대 칸 */
  const RAD_MAX = 4;         /* 피폭 한계 */
  const FINAL_PAGE = 1200;   /* 이 페이지에 닿으면 종장이 열린다 */
  const WEAR = 4;            /* 한 칸이 깎이려면 이만큼 다쳐야 한다 */
  const MEAL_EVERY = 28;
  const SLEEP_EVERY = 61;
  const SAVE_KEY = 'busan2033.save.v2';
  const RECORD_KEY = 'busan2033.records.v1';

  const RECOVERY = ['rest_camp', 'rest_bath', 'scav_store', 'scav_market',
                    'town_gate', 'meet_medic', 'haz_water', 'scav_pharm'];

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function newState(seed) {
    return {
      seed: seed,
      page: 0,
      hp: MAX, mp: MAX, money: 1, rad: 0,
      hpSub: 0, mpSub: 0,
      skills: {},
      items: {},
      flags: {},
      rep: {},
      phase: 1,
      mode: 'prologue',
      prologueIdx: 0,
      chapterIdx: 0,
      sceneIdx: 0,
      inChapter: false,
      chain: null,
      seenSig: {},
      seenText: {},
      log: [],
      ending: null,
      encounters: 0,
      storiesDone: 0,
      spIdx: -1,
      spScene: 0,
      specialsDone: [],
      titles: []
    };
  }

  function Engine(seed) {
    this.st = newState(seed || (Date.now() % 100000));
    this.rnd = B.mulberry32(this.st.seed);
    this.gen = new B.Generator(this.rnd, this.st);
    this.queue = [];       /* 다음에 보여 줄 장면들 */
    this.scene = null;     /* 지금 화면 */
  }

  /* ── 저장 ────────────────────────────────────── */
  Engine.prototype.save = function () {
    if (this.st.page <= 0) return false;   /* 시작도 안 한 여정은 저장하지 않는다 */
    Engine.markProgress(this.st);
    try {
      global.localStorage.setItem(SAVE_KEY, JSON.stringify({
        st: this.st, queue: this.queue, scene: this.scene, recent: this.gen.recent
      }));
      return true;
    } catch (e) { return false; }
  };

  Engine.hasSave = function () {
    try { return !!global.localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  };

  Engine.load = function () {
    try {
      const raw = global.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const e = new Engine(data.st.seed);
      e.st = data.st;
      e.rnd = B.mulberry32((data.st.seed + data.st.page * 7919) >>> 0);
      e.gen = new B.Generator(e.rnd, e.st);
      e.gen.recent = data.recent || [];
      e.queue = data.queue || [];
      e.scene = data.scene || null;
      return e;
    } catch (err) { return null; }
  };

  Engine.clearSave = function () {
    try { global.localStorage.removeItem(SAVE_KEY); } catch (e) { /* 무시 */ }
  };

  /* 엔딩 기록은 새 여정을 시작해도 남는다 */
  Engine.records = function () {
    try {
      return JSON.parse(global.localStorage.getItem(RECORD_KEY)
        || '{"endings":{},"specials":{},"titles":[],"best":0,"runs":0}');
    } catch (e) { return { endings: {}, specials: {}, titles: [], best: 0, runs: 0 }; }
  };

  Engine.markTitle = function (name) {
    try {
      const r = Engine.records();
      r.titles = r.titles || [];
      if (r.titles.indexOf(name) < 0) r.titles.push(name);
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
    } catch (e) { /* 무시 */ }
  };

  Engine.markSpecial = function (id) {
    try {
      const r = Engine.records();
      r.specials = r.specials || {};
      r.specials[id] = (r.specials[id] || 0) + 1;
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
    } catch (e) { /* 무시 */ }
  };

  /* 여정 도중에도 기록실이 살아 있도록, 저장할 때마다 갱신한다 */
  Engine.markProgress = function (st) {
    try {
      const r = Engine.records();
      if (!st.counted) { r.runs = (r.runs || 0) + 1; st.counted = 1; }
      r.best = Math.max(r.best || 0, st.page || 0);
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
    } catch (e) { /* 무시 */ }
  };

  Engine.pushRecord = function (endingId, page, st) {
    try {
      const r = Engine.records();
      r.endings[endingId] = (r.endings[endingId] || 0) + 1;
      r.best = Math.max(r.best || 0, page);
      if (!st || !st.counted) { r.runs = (r.runs || 0) + 1; if (st) st.counted = 1; }
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
    } catch (e) { /* 무시 */ }
  };

  /* ── 상태 ────────────────────────────────────── */
  Engine.prototype.skillLv = function (id) { return this.st.skills[id] || 0; };
  Engine.prototype.has = function (id) { return (this.st.items[id] || 0) > 0; };

  /* 뼈대(만화책, 보온병 …)로 찾는다. 상태가 어떻든 만화책은 만화책이다. */
  Engine.prototype.hasBase = function (baseId) {
    const st = this.st;
    for (const id in st.items) {
      if (!st.items[id]) continue;
      const it = B.ITEM_MAP[id];
      if (it && (it.base === baseId || it.id === baseId)) return id;
    }
    return null;
  };

  Engine.prototype.hasKind = function (kind) {
    const st = this.st;
    for (const id in st.items) {
      if (st.items[id] > 0 && B.ITEM_MAP[id] && B.ITEM_MAP[id].kind === kind) return id;
    }
    return null;
  };

  Engine.prototype.addItem = function (id, n) {
    if (!id || !B.ITEM_MAP[id]) return;
    this.st.items[id] = (this.st.items[id] || 0) + (n || 1);
  };

  Engine.prototype.delItem = function (id, n) {
    const st = this.st;
    if (!st.items[id]) return false;
    st.items[id] -= (n || 1);
    if (st.items[id] <= 0) delete st.items[id];
    return true;
  };

  Engine.prototype.hurt = function (key, subKey, n) {
    const st = this.st;
    st[subKey] = (st[subKey] || 0) + n;
    while (st[subKey] >= WEAR && st[key] > 0) {
      st[subKey] -= WEAR;
      st[key] -= 1;
    }
  };

  Engine.prototype.heal = function (key, subKey, n) {
    this.st[subKey] = 0;
    this.st[key] = clamp(this.st[key] + n, 0, MAX);
  };

  /* 효과를 적용하면서, 화면에 초록색으로 보여 줄 획득 목록을 돌려준다 */
  Engine.prototype.applyEff = function (eff) {
    const gains = [];
    const losses = [];
    if (!eff) return { gains: gains, losses: losses };
    const st = this.st;
    const self = this;

    if (eff.hp) {
      if (eff.hp < 0) { this.hurt('hp', 'hpSub', -eff.hp); losses.push('체력'); }
      else { this.heal('hp', 'hpSub', eff.hp); gains.push('체력'); }
    }
    if (eff.mp) {
      if (eff.mp < 0) { this.hurt('mp', 'mpSub', -eff.mp); losses.push('멘탈'); }
      else { this.heal('mp', 'mpSub', eff.mp); gains.push('멘탈'); }
    }
    if (eff.money) {
      st.money = clamp(st.money + eff.money, 0, MAX);
      (eff.money > 0 ? gains : losses).push('돈');
    }
    if (eff.rad) {
      st.rad = clamp(st.rad + eff.rad, 0, RAD_MAX);
      (eff.rad > 0 ? losses : gains).push('피폭');
    }
    [].concat(eff.add || [], eff.add2 || []).forEach(function (i) {
      if (!B.ITEM_MAP[i]) return;
      self.addItem(i, 1);
      gains.push(B.ITEM_MAP[i].name);
    });
    (eff.del || []).forEach(function (i) {
      if (self.delItem(i, 1) && B.ITEM_MAP[i]) losses.push(B.ITEM_MAP[i].name);
    });
    if (eff.skillUp) {
      st.skills[eff.skillUp] = Math.min(3, (st.skills[eff.skillUp] || 0) + 1);
      const s = B.SKILL_MAP[eff.skillUp];
      gains.push((s ? s.name : eff.skillUp) + ' Lv.' + st.skills[eff.skillUp]);
    }
    if (eff.rep) {
      for (const k in eff.rep) {
        st.rep[k] = (st.rep[k] || 0) + eff.rep[k];
        const f = B.WORLD.FACTIONS.filter(function (x) { return x.id === k; })[0];
        if (f) (eff.rep[k] > 0 ? gains : losses).push(f.name + ' 평판');
      }
    }
    if (eff.title && st.titles.indexOf(eff.title) < 0) {
      st.titles.push(eff.title);
      gains.push('칭호 「' + eff.title + '」');
      Engine.markTitle(eff.title);
    }
    if (eff.flag) st.flags[eff.flag] = 1;
    if (eff.chain) st.chain = eff.chain;
    return { gains: gains, losses: losses };
  };

  Engine.prototype.checkNeed = function (need) {
    if (!need) return true;
    if (need.skill && this.skillLv(need.skill) < (need.lv || 1)) return false;
    if (need.item && !this.has(need.item)) return false;
    if (need.itemKind && !this.hasKind(need.itemKind)) return false;
    if (need.itemBase && !this.hasBase(need.itemBase)) return false;
    if (need.money && this.st.money < need.money) return false;
    if (need.flag && !this.st.flags[need.flag]) return false;
    if (need.title && (this.st.titles || []).indexOf(need.title) < 0) return false;
    if (need.specials && (this.st.specialsDone || []).length < need.specials) return false;
    if (need.rep) {
      for (const k in need.rep) if ((this.st.rep[k] || 0) < need.rep[k]) return false;
    }
    return true;
  };

  Engine.prototype.tagsOf = function (choice) {
    const tags = [];
    const need = choice.need;
    const self = this;
    function push(kind, text, ok) { tags.push({ kind: kind, text: text, ok: ok }); }
    if (need) {
      if (need.skill) {
        const s = B.SKILL_MAP[need.skill];
        const lv = need.lv || 1;
        push('skill', (s ? s.name : need.skill) + (lv > 1 ? ' Lv.' + lv : ''),
             self.skillLv(need.skill) >= lv);
      }
      if (need.item) {
        const it = B.ITEM_MAP[need.item];
        push('item', it ? it.name : need.item, self.has(need.item));
      }
      if (need.itemKind) {
        const names = { food: '식량', water: '물', med: '약', ammo: '무기',
                        part: '부품', lux: '귀중품', doc: '기록', mood: '감정',
                        junk: '잡동사니', key: '유품' };
        push('item', names[need.itemKind] || need.itemKind, !!self.hasKind(need.itemKind));
      }
      if (need.itemBase) {
        const base = (B.JUNK_BASE_LIST || []).filter(function (b) { return b.id === need.itemBase; })[0];
        const nm = base ? base.name : ((B.ITEM_MAP[need.itemBase] || {}).name || need.itemBase);
        push('item', nm, !!self.hasBase(need.itemBase));
      }
      if (need.money) push('money', '돈', self.st.money >= need.money);
      if (need.flag) push('flag', '단서', !!self.st.flags[need.flag]);
      if (need.title) push('title', '「' + need.title + '」', (self.st.titles || []).indexOf(need.title) >= 0);
      if (need.specials) {
        push('title', '특별 이야기 ' + need.specials + '편',
             (self.st.specialsDone || []).length >= need.specials);
      }
      if (need.rep) {
        for (const k in need.rep) {
          const f = B.WORLD.FACTIONS.filter(function (x) { return x.id === k; })[0];
          push('rep', f ? f.name : k, (self.st.rep[k] || 0) >= need.rep[k]);
        }
      }
    }
    if (choice.dc) push('dc', '판정', true);
    return tags;
  };

  Engine.prototype.payCost = function (cost) {
    const losses = [];
    if (!cost) return losses;
    if (cost.money) { this.st.money = clamp(this.st.money - cost.money, 0, MAX); losses.push('돈'); }
    if (cost.hp) { this.hurt('hp', 'hpSub', cost.hp); losses.push('체력'); }
    if (cost.mp) { this.hurt('mp', 'mpSub', cost.mp); losses.push('멘탈'); }
    if (cost.item && this.delItem(cost.item, 1)) losses.push(B.ITEM_MAP[cost.item].name);
    if (cost.itemKind) {
      const id = this.hasKind(cost.itemKind);
      if (id && this.delItem(id, 1)) losses.push(B.ITEM_MAP[id].name);
    }
    if (cost.itemBase) {
      const id = this.hasBase(cost.itemBase);
      if (id && this.delItem(id, 1)) losses.push(B.ITEM_MAP[id].name);
    }
    if (cost.junkAll) {
      const self2 = this;
      const junk = Object.keys(this.st.items).filter(function (id) {
        const it = B.ITEM_MAP[id];
        return it && it.kind === 'junk' && !it.key;
      });
      let n = 0;
      junk.forEach(function (id) { n += self2.st.items[id]; self2.delItem(id, self2.st.items[id]); });
      if (n) losses.push('잡동사니 ' + n + '개');
      this.lastSold = n;
    }
    return losses;
  };

  /* ── 소지품 사용 ─────────────────────────────── */
  Engine.prototype.canUse = function (id) {
    const it = B.ITEM_MAP[id];
    if (!it || !this.has(id)) return false;
    return !!(it.hp || it.mp || it.rad || it.cures);
  };

  Engine.prototype.useItem = function (id) {
    const it = B.ITEM_MAP[id];
    if (!this.canUse(id)) return null;
    this.delItem(id, 1);
    if (it.hp) this.heal('hp', 'hpSub', it.hp);
    if (it.mp) this.heal('mp', 'mpSub', it.mp);
    if (it.rad) this.st.rad = clamp(this.st.rad + it.rad, 0, RAD_MAX);
    let cured = null;
    function mark(name) { cured = cured ? cured + ', ' + name : name; }
    if (it.cures && this.has(it.cures)) { this.delItem(it.cures, 1); mark(B.ITEM_MAP[it.cures].name); }
    if ((id === 'bandage' || id === 'medkit') && this.has('wound')) { this.delItem('wound', 1); mark('상처'); }
    if (id === 'medkit' && this.has('burn')) { this.delItem('burn', 1); mark('화상'); }
    if (it.kind === 'food' && this.has('hunger')) { this.delItem('hunger', 1); mark('허기'); }
    this.checkDeath();
    return { name: it.name, cured: cured };
  };

  /* ── 장면 만들기 ─────────────────────────────── */
  function scene(paragraphs, choices, kind, extra) {
    const s = {
      blocks: paragraphs.filter(Boolean).map(function (t) { return { type: 'text', text: t }; }),
      choices: choices || null,
      kind: kind || 'enc',
      done: false
    };
    if (extra) for (const k in extra) s[k] = extra[k];
    return s;
  }

  const MEAL_LINES = [
    '배가 웁니다. 오늘 안에 뭐라도 넣어야 합니다.\n가방을 열고 남은 것을 헤아려 봅니다.',
    '해가 중천입니다. 그늘을 찾아 앉아 가방을 풉니다.\n먹는 일은 이제 즐거움이 아니라 계산입니다.',
    '하루치 힘이 다 떨어졌습니다.\n손이 떨리기 전에 뭔가를 먹어 두어야 합니다.',
    '식사 시간입니다.\n이 도시에서 정해진 시간에 밥을 먹는 사람은 이제 거의 없지만, 당신은 아직 그 습관을 지킵니다.'
  ];
  const SLEEP_LINES = [
    '해가 떨어졌습니다. 어둠은 이 도시에서 가장 정직한 포식자입니다.\n어디서 밤을 보낼지 정해야 합니다.',
    '눈꺼풀이 더는 버티지 못합니다.\n더 걸으면 실수를 하고, 실수는 여기서 대개 마지막입니다.',
    '기온이 떨어지기 시작합니다.\n몸을 뉘일 자리를 찾을 시간입니다.'
  ];

  function mealScene(rnd) {
    return scene([MEAL_LINES[Math.floor(rnd() * MEAL_LINES.length)]], [
      { label: '호화로운 식사를 한다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['식량을 넉넉히 펼치고 물까지 곁들입니다. 깡통 바닥까지 손가락으로 훑어 먹습니다.\n이런 날은 한 달에 한 번 있을까 말까입니다. 배가 부르니 세상이 잠깐 견딜 만해 보입니다.'],
        eff: { hp: 1, mp: 1, del: ['hunger'] }, dc: 0, ok: [], no: [] },
      { label: '식량을 먹는다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['천천히 씹습니다. 맛은 오래전에 포기했고, 이제는 삼키는 감각만 남았습니다.\n배가 부르지는 않지만, 오늘은 이걸로 됩니다.'],
        eff: { hp: 1, del: ['hunger'] }, dc: 0, ok: [], no: [] },
      { label: '굶는다.', res: ['물만 한 모금 마시고 허리띠를 한 칸 조입니다.\n위장이 자기 자신을 갉는 감각에는 끝까지 익숙해지지 않습니다. 내일은 뭐라도 찾아야 합니다.'],
        eff: { hp: -1, add: ['hunger'] }, dc: 0, ok: [], no: [] }
    ], 'meal');
  }

  function sleepScene(rnd) {
    return scene([SLEEP_LINES[Math.floor(rnd() * SLEEP_LINES.length)]], [
      { label: '안전한 곳을 찾아 제대로 잔다.', need: { money: 1 }, cost: { money: 1 },
        res: ['문이 잠기는 방에서 잡니다. 자물쇠 돌아가는 소리 하나로 사람이 됩니다.\n아침에 일어나니 어제까지 아프던 데가 조금 덜합니다. 몸은 정직해서, 재워 주면 갚습니다.'],
        eff: { hp: 1, mp: 1, del: ['insomnia', 'wound'] }, dc: 0, ok: [], no: [] },
      { label: '불을 피우고 눈을 붙인다.', need: { item: 'lighter' },
        res: ['젖은 나무가 한참 만에 붙습니다. 불빛 앞에서 무릎을 안고 앉아 선잠을 잡니다.\n몇 번 깼고, 깰 때마다 불이 아직 살아 있는지부터 확인했습니다. 그래도 아침은 옵니다.'],
        eff: { mp: 1, del: ['insomnia'] }, dc: 0, ok: [], no: [] },
      { label: '노숙한다.', res: ['처마 밑에 몸을 구겨 넣습니다. 추위보다 소리가 더 무섭습니다.\n밤새 열 번쯤 눈을 뜨고, 열 번 다 아무것도 없었습니다. 그게 다행인지 아닌지 모르겠습니다.'],
        eff: { mp: -1 }, dc: 0, ok: [], no: [] }
    ], 'sleep');
  }

  /* ── 콘텐츠 생산 ─────────────────────────────── */
  Engine.prototype.produce = function () {
    const st = this.st;
    const A = B.ARCS;
    if (st.mode === 'ending') return;

    /* 도입부 */
    if (st.mode === 'prologue') {
      if (st.prologueIdx < A.PROLOGUE.length) {
        const sc = A.PROLOGUE[st.prologueIdx++];
        this.queue.push(scene(sc.pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}), 'story'));
        return;
      }
      st.mode = 'run';
    }

    /* 종장 */
    if (st.page >= FINAL_PAGE && st.mode !== 'finale') {
      st.mode = 'finale';
      st.sceneIdx = 0;
      if (!st.flags.door_open) {
        if ((st.specialsDone || []).length >= 7) this.pushEnding('chronicle');
        else this.pushEnding(st.flags.dog_pups || st.flags.in_town ? 'settle' : 'wander');
        return;
      }
    }
    if (st.mode === 'finale') {
      if (st.sceneIdx < A.FINALE.scenes.length) {
        const sc = A.FINALE.scenes[st.sceneIdx++];
        this.queue.push(scene(sc.pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}), 'story'));
      } else {
        this.pushEnding('wander');
      }
      return;
    }

    /* 본편 장 */
    const ch = A.CHAPTERS[st.chapterIdx];
    if (ch && (st.inChapter || st.page >= ch.at)) {
      st.inChapter = true;
      if (st.sceneIdx < ch.scenes.length) {
        const sc = ch.scenes[st.sceneIdx++];
        const pages = sc.pages.slice();
        if (st.sceneIdx === 1) pages.unshift('__TITLE__' + ch.title);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}), 'story'));
        return;
      }
      st.inChapter = false;
      st.sceneIdx = 0;
      st.chapterIdx++;
      st.phase = st.chapterIdx >= 7 ? 3 : (st.chapterIdx >= 3 ? 2 : 1);
    }

    /* 특별 이야기 — 정해진 페이지에 닿으면 한 편이 통째로 끼어든다 */
    const SP = B.SPECIALS || [];
    if (st.spIdx >= 0) {
      const cur = SP[st.spIdx];
      if (cur && st.spScene < cur.scenes.length) {
        const sc = cur.scenes[st.spScene++];
        const pages = sc.pages.slice();
        if (st.spScene === 1) pages.unshift('__TITLE__' + cur.title);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}),
                              'special', { sp: cur.id }));
        return;
      }
      if (cur) {
        if (st.specialsDone.indexOf(cur.id) < 0) st.specialsDone.push(cur.id);
        st.flags['sp_' + cur.id] = 1;
        Engine.markSpecial(cur.id);
      }
      st.spIdx = -1;
      st.spScene = 0;
    } else {
      for (let i = 0; i < SP.length; i++) {
        const sp = SP[i];
        if (st.specialsDone.indexOf(sp.id) >= 0) continue;
        if (st.page < sp.at) continue;
        if (sp.req && sp.req.flag && !st.flags[sp.req.flag]) continue;
        st.spIdx = i;
        st.spScene = 0;
        return this.produce();
      }
    }

    /* 체력이 바닥이면 회복 계열이 잘 나오게 손본다 */
    if (st.hp <= 1) {
      B.TEMPLATES.forEach(function (t) {
        if (RECOVERY.indexOf(t.id) >= 0 && !t.__boost) { t.__boost = t.w; t.w = t.w * 4; }
      });
    } else {
      B.TEMPLATES.forEach(function (t) {
        if (t.__boost) { t.w = t.__boost; delete t.__boost; }
      });
    }

    const enc = this.gen.compose(st);
    st.encounters++;
    this.queue.push(scene(enc.pages, enc.choices, 'enc', { tpl: enc.tplId }));
  };

  Engine.prototype.pushEnding = function (id) {
    const st = this.st;
    const e = B.ARCS.ENDINGS[id] || B.ARCS.ENDINGS.wander;
    st.mode = 'ending';
    st.ending = id;
    Engine.pushRecord(id, st.page, st);
    const pages = e.pages.slice();
    pages.push('— ' + e.name + ' —\n\n' + st.page + '페이지를 걸었습니다.');
    this.queue.push(scene(pages, [{
      label: '새로운 여정을 시작한다.', restart: true, need: null, cost: null,
      dc: 0, ok: [], no: [], res: [], eff: null
    }], 'ending'));
  };

  /* ── 진행 ────────────────────────────────────── */
  Engine.prototype.step = function () {
    if (!this.queue.length) this.produce();
    if (!this.queue.length) return this.scene;
    this.scene = this.queue.shift();
    this.scene.blocks.forEach(function (b) {
      if (b.type === 'text') b.text = B.josa(b.text);
    });
    this.st.page++;
    this.tick();
    this.ensureExit();
    return this.scene;
  };

  Engine.prototype.ensureExit = function () {
    const s = this.scene;
    if (!s || !s.choices || !s.choices.length) return;
    const self = this;
    if (s.choices.some(function (c) { return self.checkNeed(c.need); })) return;
    s.choices = s.choices.concat([{
      label: '지금은 물러선다.', need: null, cost: null, dc: 0, ok: [], no: [],
      res: ['할 수 있는 일이 없습니다. 미련을 접고 발길을 돌립니다.'], eff: {}
    }]);
  };

  Engine.prototype.tick = function () {
    const st = this.st;
    if (st.mode === 'ending' || st.mode === 'prologue') return;

    if (st.page % MEAL_EVERY === 0) this.queue.unshift(mealScene(this.rnd));
    else if (st.page % SLEEP_EVERY === 0) this.queue.unshift(sleepScene(this.rnd));

    if (st.page % 25 === 0) {
      let wear = 0;
      if (st.items.hunger) wear += 2;
      if (st.items.wound) wear += 1;
      if (st.items.fever) wear += 2;
      if (st.items.fracture) wear += 1;
      if (st.items.burn) wear += 1;
      if (st.rad >= 3) wear += 2;
      if (wear) this.hurt('hp', 'hpSub', Math.min(3, wear));
    }
    if (st.page % 23 === 0) {
      let wear = 0;
      if (st.items.gloom) wear += 2;
      if (st.items.insomnia) wear += 1;
      if (st.items.guilt) wear += 1;
      if (st.items.headache) wear += 1;
      if (st.items.hope) wear -= 2;
      if (st.items.humor) wear -= 1;
      if (wear > 0) this.hurt('mp', 'mpSub', Math.min(3, wear));
      else if (wear < 0) st.mpSub = Math.max(0, (st.mpSub || 0) + wear);
    }
    if (st.page % 43 === 0 && st.rad > 0) st.rad = clamp(st.rad - 1, 0, RAD_MAX);
    this.checkDeath();
  };

  Engine.prototype.checkDeath = function () {
    const st = this.st;
    if (st.mode === 'ending') return;
    if (st.hp <= 0) { this.queue = []; this.pushEnding('death_hp'); }
    else if (st.mp <= 0) { this.queue = []; this.pushEnding('death_mp'); }
    else if (st.rad >= RAD_MAX) { this.queue = []; this.pushEnding('death_rad'); }
  };

  /* 선택 - 장면을 바꾸지 않고 아래로 이어 붙인다 */
  Engine.prototype.choose = function (idx) {
    const s = this.scene;
    if (!s || !s.choices || !s.choices[idx]) return null;
    const c = s.choices[idx];

    if (c.restart) {
      const seed = (this.st.seed + this.st.page + 13) >>> 0;
      const fresh = new Engine(seed);
      this.st = fresh.st;
      this.rnd = fresh.rnd;
      this.gen = fresh.gen;
      this.queue = [];
      this.scene = null;
      Engine.clearSave();
      return this.step();
    }

    if (!this.checkNeed(c.need)) return null;

    const lost = this.payCost(c.cost);
    let texts;
    let res;

    if (c.dc) {
      const lv = c.need && c.need.skill ? this.skillLv(c.need.skill) : 1;
      const p = Math.max(0.15, Math.min(0.92, 0.5 + 0.22 * (lv - c.dc)));
      const success = this.rnd() < p;
      texts = success ? c.ok : c.no;
      res = this.applyEff(success ? c.okEff : c.noEff);
      this.st.log.push((success ? '성공 · ' : '실패 · ') + c.label);
    } else {
      texts = c.res && c.res.length ? c.res : [];
      res = this.applyEff(c.eff);
      this.st.log.push(c.label);
    }
    if (this.st.log.length > 80) this.st.log.shift();

    s.blocks.push({
      type: 'choice',
      label: c.label,
      gains: res.gains,
      losses: lost.concat(res.losses)
    });
    (texts || []).forEach(function (t) {
      s.blocks.push({ type: 'text', text: B.josa(t) });
    });

    s.choices = null;
    s.done = true;

    if (c.end) {
      this.queue = [];
      this.pushEnding(c.end);
    }
    this.checkDeath();
    return s;
  };

  Engine.prototype.progress = function () {
    const st = this.st;
    const byPage = st.page / FINAL_PAGE;
    const byChapter = st.chapterIdx / (B.ARCS.CHAPTERS.length + 1);
    return Math.min(100, Math.round(Math.max(byPage, byChapter * 0.9) * 100));
  };


  /* ── 만들기 ──────────────────────────────────── */
  Engine.prototype.craftList = function () {
    const items = this.snapshot().items;
    return B.RECIPES.map(function (r) {
      const use = B.findMaterials(items, r.need);
      return {
        id: r.id,
        name: r.name,
        makes: (B.ITEM_MAP[r.make] || {}).name || r.make,
        n: r.n || 1,
        need: r.need.map(B.materialLabel),
        ok: !!use
      };
    }).sort(function (a, b) { return (b.ok ? 1 : 0) - (a.ok ? 1 : 0); });
  };

  Engine.prototype.craft = function (recipeId) {
    const r = B.RECIPES.filter(function (x) { return x.id === recipeId; })[0];
    if (!r) return null;
    const items = this.snapshot().items;
    const use = B.findMaterials(items, r.need);
    if (!use) return null;
    const self = this;
    use.forEach(function (id) { self.delItem(id, 1); });
    for (let i = 0; i < (r.n || 1); i++) this.addItem(r.make, 1);
    this.st.log.push('만들기 · ' + r.name);
    return {
      name: r.name,
      made: (B.ITEM_MAP[r.make] || {}).name || r.make,
      n: r.n || 1,
      line: r.line
    };
  };

  Engine.prototype.snapshot = function () {
    const st = this.st;
    const items = [];
    for (const id in st.items) {
      const it = B.ITEM_MAP[id];
      if (it) {
        items.push({ id: id, name: it.name, n: st.items[id], kind: it.kind,
                     bad: !!it.bad, key: !!it.key, note: it.note || '',
                     tag: it.tag || '', base: it.base || '' });
      }
    }
    const skills = [];
    for (const id in st.skills) {
      const s = B.SKILL_MAP[id];
      skills.push({ id: id, name: s ? s.name : id, lv: st.skills[id] });
    }
    return {
      page: st.page, hp: st.hp, mp: st.mp, money: st.money, rad: st.rad,
      max: MAX, radMax: RAD_MAX, progress: this.progress(),
      items: items, skills: skills, rep: st.rep, flags: st.flags,
      mode: st.mode, chapter: st.chapterIdx, ending: st.ending,
      titles: st.titles || [], specialsDone: st.specialsDone || [],
      chapterTitle: (B.ARCS.CHAPTERS[st.chapterIdx] || {}).title || '종장'
    };
  };

  Engine.MAX = MAX;
  Engine.RAD_MAX = RAD_MAX;
  Engine.FINAL_PAGE = FINAL_PAGE;
  Engine.newState = newState;
  B.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);

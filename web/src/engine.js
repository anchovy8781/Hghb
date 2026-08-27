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
  const HIT = 4;             /* 다치면 한 칸이 통째로 날아간다. 세 번 맞으면 끝이다 */
  const TOIL = 2;            /* 힘을 쓰는 대가는 그 절반. 짐을 지는 것과 총 맞는 것은 다르다 */
  /* 도입부는 아직 여정이 시작되기 전이다. 여기서 죽어서 끝나면 안 된다 */
  Engine.prototype.hitScale = function () { return this.st.mode === 'prologue' ? TOIL : HIT; };
  const SP_FIRST = 30;       /* 첫 특별 이야기는 아무리 빨라도 이 페이지 뒤 */
  const SP_MIN_GAP = 16;     /* 특별 이야기끼리 이만큼은 떨어뜨린다 */
  const MEAL_EVERY = 22;
  const SLEEP_EVERY = 45;
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
      origin: 'after18',      /* 시작 사연. after18 | coma */
      lgId: null, lgScene: 0, lgDone: 0, longDone: [],
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
      spOrder: null,      /* 이번 여정에서 특별 이야기가 나올 순서 (섞어 둔다) */
      spAt: 0,            /* 다음 특별 이야기가 끼어들 페이지 */
      specialsDone: [],
      revives: 0,
      titles: []
    };
  }

  function Engine(seed, origin) {
    this.st = newState(seed || (Date.now() % 100000));
    if (origin && (B.ARCS.PROLOGUES || {})[origin]) this.st.origin = origin;
    this.rnd = B.mulberry32(this.st.seed);
    this.gen = new B.Generator(this.rnd, this.st);
    this.queue = [];       /* 다음에 보여 줄 장면들 */
    this.scene = null;     /* 지금 화면 */
  }

  /* ── 저장 ────────────────────────────────────── */
  Engine.prototype.save = function () {
    if (B.RESETTING) return false;         /* 초기화 중에는 도로 써 넣지 않는다 */
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

  /* ── 쿠키 · 미션 · 우편함 · 상점 ────────────────
   *   여정 밖에서만 움직이는 것들. 기록실과 같은 저장소를 쓴다.
   */
  function saveRec(r) {
    try { global.localStorage.setItem(RECORD_KEY, JSON.stringify(r)); } catch (e) { /* 무시 */ }
  }

  Engine.cookies = function () { return Engine.records().cookies || 0; };

  Engine.addCookies = function (n) {
    const r = Engine.records();
    r.cookies = Math.max(0, (r.cookies || 0) + n);
    saveRec(r);
    return r.cookies;
  };

  Engine.spendCookies = function (n) {
    const r = Engine.records();
    if ((r.cookies || 0) < n) return false;
    r.cookies -= n;
    saveRec(r);
    return true;
  };

  /* 우편함 — 받으면 그걸로 끝 */
  Engine.mailTaken = function () { return Engine.records().mail || {}; };

  Engine.takeMail = function (id) {
    const m = (B.MAIL || []).filter(function (x) { return x.id === id; })[0];
    if (!m) return 0;
    const r = Engine.records();
    r.mail = r.mail || {};
    if (r.mail[id]) return 0;
    r.mail[id] = 1;
    r.cookies = (r.cookies || 0) + (m.cookies || 0);
    saveRec(r);
    return m.cookies || 0;
  };

  /* 상점 — 장편 이야기 */
  Engine.owned = function () { return Engine.records().owned || {}; };
  Engine.longApplied = function () { return Engine.records().longOn || {}; };

  Engine.buyLong = function (id) {
    const price = (B.SHOP_PRICE || {})[id];
    if (price === undefined) return false;
    const r = Engine.records();
    r.owned = r.owned || {};
    if (r.owned[id]) return false;
    if ((r.cookies || 0) < price) return false;
    r.cookies -= price;
    r.owned[id] = 1;
    r.longOn = r.longOn || {};
    r.longOn[id] = 1;               /* 사면 바로 적용해 둔다 */
    saveRec(r);
    return true;
  };

  Engine.toggleLong = function (id) {
    const r = Engine.records();
    if (!(r.owned || {})[id]) return false;
    r.longOn = r.longOn || {};
    if (r.longOn[id]) delete r.longOn[id]; else r.longOn[id] = 1;
    saveRec(r);
    return !!r.longOn[id];
  };

  /* 미션 — 셋이 붙어 있고, 갱신을 누르면 새로 뽑는다 */
  function rollOne(pool, used, rnd) {
    const left = pool.filter(function (m) { return used.indexOf(m.id) < 0; });
    const src = left.length ? left : pool;
    const m = src[Math.floor(rnd() * src.length)];
    const tier = Math.floor(rnd() * 3);
    return { id: m.id, tier: tier };
  }

  Engine.missions = function () {
    const r = Engine.records();
    if (!r.missions || !r.missions.length) return Engine.rollMissions();
    return r.missions;
  };

  Engine.rollMissions = function () {
    const pool = B.MISSIONS || [];
    if (!pool.length) return [];
    const r = Engine.records();
    const done = r.missionDone || {};
    const rnd = Math.random;
    const out = [];
    const used = [];
    /* 이미 끝낸 것은 갱신해도 안 사라진다 */
    (r.missions || []).forEach(function (m) {
      if (done[m.id + '_' + m.tier]) { out.push(m); used.push(m.id); }
    });
    while (out.length < 3) {
      const m = rollOne(pool, used, rnd);
      if (used.indexOf(m.id) >= 0 && used.length < pool.length) continue;
      used.push(m.id);
      out.push(m);
    }
    r.missions = out;
    saveRec(r);
    return out;
  };

  Engine.missionDone = function () { return Engine.records().missionDone || {}; };

  /* 지금 여정이 어디까지 왔는지를 미션이 재는 값으로 바꾼다 */
  Engine.prototype.missionValue = function (want) {
    const st = this.st;
    const self = this;
    if (want === 'page') return st.page || 0;
    if (want === 'specials') return (st.specialsDone || []).length;
    if (want === 'titles') return (st.titles || []).length;
    if (want === 'skills') return Object.keys(st.skills || {}).filter(function (k) { return st.skills[k] > 0; }).length;
    if (want === 'deep') return Object.keys(st.skills || {}).filter(function (k) { return st.skills[k] >= 3; }).length;
    if (want === 'junk') {
      let n = 0;
      Object.keys(st.items || {}).forEach(function (id) {
        const it = B.ITEM_MAP[id];
        if (it && it.kind === 'junk') n += st.items[id];
      });
      return n;
    }
    if (want === 'keys') {
      let n = 0;
      Object.keys(st.items || {}).forEach(function (id) {
        const it = B.ITEM_MAP[id];
        if (it && it.key) n += st.items[id];
      });
      return n;
    }
    if (want === 'rep') {
      let m = 0;
      Object.keys(st.rep || {}).forEach(function (k) { if (st.rep[k] > m) m = st.rep[k]; });
      return m;
    }
    if (want === 'crafted') return st.crafted || 0;
    if (want === 'armed') {
      const cls = {};
      Object.keys(B.GUN_CLASSES || {}).forEach(function (k) { if (self.armed(k)) cls[k] = 1; });
      return Object.keys(cls).length;
    }
    if (want === 'pet') return st.flags && st.flags.has_pet ? 1 : 0;
    if (want === 'base') return st.flags && st.flags.has_base ? 1 : 0;
    if (want === 'keepsakes') return Object.keys(Engine.collected()).length;
    if (want === 'full') return st.fullPages || 0;
    if (want === 'warm') {
      const st2 = st;
      return Object.keys(st2.items || {}).some(function (id) {
        const it = B.ITEM_MAP[id];
        return it && it.warm && st2.items[id] > 0;
      }) ? 1 : 0;
    }
    if (want === 'finale') return st.mode === 'finale' || st.mode === 'ending' ? 1 : 0;
    return 0;
  };

  /* 조건이 찬 미션이 있으면 그 자리에서 쿠키를 준다 */
  Engine.prototype.checkMissions = function () {
    const list = Engine.missions();
    const r = Engine.records();
    r.missionDone = r.missionDone || {};
    const got = [];
    const self = this;
    list.forEach(function (m) {
      const def = (B.MISSIONS || []).filter(function (x) { return x.id === m.id; })[0];
      if (!def) return;
      const key = m.id + '_' + m.tier;
      if (r.missionDone[key]) return;
      const goal = def.goal[m.tier];
      if (self.missionValue(def.want) < goal) return;
      r.missionDone[key] = 1;
      r.cookies = (r.cookies || 0) + def.reward[m.tier];
      got.push({ name: def.name, cookies: def.reward[m.tier] });
    });
    if (got.length) saveRec(r);
    return got;
  };

  /* ── 수집한 이야기 ─────────────────────────────
   *   조건을 맞추면 그 자리에서 수집되고, 기록실에 남습니다.
   *   적용해 두면 다음 여정의 특별 이야기 순번에 같이 섞입니다.
   */
  Engine.keepsakeList = function () { return B.KEEPSAKES || []; };

  Engine.collected = function () {
    const r = Engine.records();
    return r.keepsakes || {};
  };

  Engine.applied = function () {
    const r = Engine.records();
    return r.applied || {};
  };

  Engine.collect = function (id) {
    try {
      const r = Engine.records();
      r.keepsakes = r.keepsakes || {};
      if (r.keepsakes[id]) return false;
      r.keepsakes[id] = 1;
      r.applied = r.applied || {};
      r.applied[id] = 1;              /* 처음 얻으면 바로 적용해 둔다 */
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
      return true;
    } catch (e) { return false; }
  };

  Engine.toggleApplied = function (id) {
    try {
      const r = Engine.records();
      r.keepsakes = r.keepsakes || {};
      if (!r.keepsakes[id]) return false;
      r.applied = r.applied || {};
      if (r.applied[id]) delete r.applied[id]; else r.applied[id] = 1;
      global.localStorage.setItem(RECORD_KEY, JSON.stringify(r));
      return !!r.applied[id];
    } catch (e) { return false; }
  };

  /* 지금 상태가 수집 조건을 채웠는지 본다 */
  Engine.prototype.checkKeepsakes = function () {
    const st = this.st;
    const list = B.KEEPSAKES || [];
    const got = [];
    for (let i = 0; i < list.length; i++) {
      const k = list[i];
      const u = k.unlock || {};
      if (st.ksGot && st.ksGot.indexOf(k.id) >= 0) continue;
      if (u.flag && !st.flags[u.flag]) continue;
      if (u.item && !(st.items[u.item] > 0)) continue;
      if (u.items) {
        let ok = true;
        for (let q = 0; q < u.items.length; q++) if (!(st.items[u.items[q]] > 0)) { ok = false; break; }
        if (!ok) continue;
      }
      if (u.title && (st.titles || []).indexOf(u.title) < 0) continue;
      if (u.page && st.page < u.page) continue;
      if (u.sp && st.specialsDone.indexOf(u.sp) < 0) continue;
      st.ksGot = st.ksGot || [];
      st.ksGot.push(k.id);
      if (Engine.collect(k.id)) got.push(k);
    }
    return got;
  };

  Engine.markLong = function (id) {
    try {
      const r = Engine.records();
      r.longs = r.longs || {};
      r.longs[id] = (r.longs[id] || 0) + 1;
      saveRec(r);
    } catch (e) { /* 무시 */ }
  };

  Engine.longsDone = function () { return Engine.records().longs || {}; };

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
  /* 총은 맞는 탄이 있어야 총이다.
   * 들고 있는 총 중에서 탄이 맞는 것을 하나 골라 준다. */
  Engine.prototype.armed = function (klass) {
    const st = this.st;
    const ids = Object.keys(st.items);
    for (let i = 0; i < ids.length; i++) {
      const g = B.ITEM_MAP[ids[i]];
      if (!g || g.kind !== 'gun' || !st.items[ids[i]]) continue;
      if (klass && klass !== true && g.gun !== klass) continue;
      /* 탄만 골라야 한다. 총에도 caliber 가 붙어 있어서, 이 조건을 안 걸면
       * 총이 제 탄으로 잡히고 한 발 쏠 때마다 총이 없어진다. */
      const rounds = ids.filter(function (a) {
        const it = B.ITEM_MAP[a];
        return it && it.kind === 'ammo' && it.caliber === g.caliber && st.items[a] > 0;
      })[0];
      if (rounds) return { gun: ids[i], ammo: rounds };
    }
    return null;
  };

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

  /* 칸과 마모를 하나의 "누적 피해"로 보고 계산한다.
   * 예전에는 회복이 마모를 통째로 0 으로 지워서, 한 칸이 도무지 깎이지 않았다.
   * (로망 하나 들고 다니면 멘탈이 영원히 3칸이었다.)
   */
  function damageOf(st, key, subKey) {
    return (MAX - st[key]) * WEAR + (st[subKey] || 0);
  }
  function setDamage(st, key, subKey, dmg) {
    const d = clamp(dmg, 0, MAX * WEAR);
    st[key] = MAX - Math.floor(d / WEAR);
    st[subKey] = d % WEAR;
    if (st[key] < 0) { st[key] = 0; st[subKey] = 0; }
  }

  Engine.prototype.hurt = function (key, subKey, n) {
    setDamage(this.st, key, subKey, damageOf(this.st, key, subKey) + n);
  };

  /* 회복 한 점은 딱 한 칸 분량의 피해만 지운다. 남은 마모는 그대로 남는다 */
  Engine.prototype.heal = function (key, subKey, n) {
    setDamage(this.st, key, subKey, damageOf(this.st, key, subKey) - n * WEAR);
  };

  /* 효과를 적용하면서, 화면에 초록색으로 보여 줄 획득 목록을 돌려준다 */
  Engine.prototype.applyEff = function (eff) {
    const gains = [];
    const losses = [];
    if (!eff) return { gains: gains, losses: losses };
    const st = this.st;
    const self = this;

    if (eff.hp) {
      if (eff.hp < 0) {
        /* 부상만 옷이 받아 낸다. 지치는 값은 아래 wear 에서 따로 센다 */
        const raw = -eff.hp * this.hitScale();
        const left = this.soak(raw, { losses: losses });
        if (left > 0) { this.hurt('hp', 'hpSub', left); losses.push('체력'); }
      } else { this.heal('hp', 'hpSub', eff.hp); gains.push('체력'); }
    }
    if (eff.mp) {
      if (eff.mp < 0) { this.hurt('mp', 'mpSub', -eff.mp * this.hitScale()); losses.push('멘탈'); }
      else { this.heal('mp', 'mpSub', eff.mp); gains.push('멘탈'); }
    }
    if (eff.wear) {
      /* 다친 게 아니라 깎이는 것. 칸이 아니라 눈금으로 센다 */
      if (eff.wear.hp) { this.hurt('hp', 'hpSub', eff.wear.hp); losses.push('체력'); }
      if (eff.wear.mp) { this.hurt('mp', 'mpSub', eff.wear.mp); losses.push('멘탈'); }
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
    if (need.itemKind) {
      const want = need.itemKindN || 1;
      let have = 0;
      const st5 = this.st;
      Object.keys(st5.items).forEach(function (id) {
        const it = B.ITEM_MAP[id];
        if (it && it.kind === need.itemKind) have += st5.items[id];
      });
      if (have < want) return false;
    }
    if (need.itemBase && !this.hasBase(need.itemBase)) return false;
    if (need.warm) {
      const st6 = this.st;
      const has = Object.keys(st6.items).some(function (id) {
        const it = B.ITEM_MAP[id];
        return it && it.warm && st6.items[id] > 0;
      });
      if (!has) return false;
    }
    if (need.money && this.st.money < need.money) return false;
    if (need.flag && !this.st.flags[need.flag]) return false;
    if (need.title && (this.st.titles || []).indexOf(need.title) < 0) return false;
    if (need.gun && !this.armed(need.gun)) return false;
    if (need.throwable) {
      const st2 = this.st;
      const has = Object.keys(st2.items).some(function (id) {
        const it = B.ITEM_MAP[id];
        return it && it.thrown !== undefined && st2.items[id] > 0;
      });
      if (!has) return false;
    }
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
      if (need.gun) {
        const label = need.gun === true ? '장전된 총'
          : ((B.GUN_CLASSES || {})[need.gun] || need.gun) + ' · 탄';
        push('item', label, !!self.armed(need.gun === true ? null : need.gun));
      }
      if (need.throwable) {
        const st4 = self.st;
        const has = Object.keys(st4.items).some(function (id) {
          const it = B.ITEM_MAP[id];
          return it && it.thrown !== undefined && st4.items[id] > 0;
        });
        push('item', '던질 것', has);
      }
      if (need.warm) {
        const st7 = self.st;
        const has = Object.keys(st7.items).some(function (id) {
          const it = B.ITEM_MAP[id];
          return it && it.warm && st7.items[id] > 0;
        });
        push('item', '두꺼운 옷', has);
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
    if (cost.hp) { this.hurt('hp', 'hpSub', cost.hp * TOIL); losses.push('체력'); }
    if (cost.mp) { this.hurt('mp', 'mpSub', cost.mp * TOIL); losses.push('멘탈'); }
    if (cost.ammo) {
      const a = this.armed(cost.ammo === true ? null : cost.ammo);
      if (a) {
        this.delItem(a.ammo, 1);
        losses.push(B.ITEM_MAP[a.ammo].name);
        this.lastGun = B.ITEM_MAP[a.gun].name;
      }
    }
    if (cost.throwable) {
      const st3 = this.st;
      const ids = Object.keys(st3.items).filter(function (id) {
        const it = B.ITEM_MAP[id];
        return it && it.thrown !== undefined && st3.items[id] > 0;
      });
      /* 백린탄처럼 위험한 것은 마지막에 쓴다 */
      ids.sort(function (a, b) {
        return (B.ITEM_MAP[a].selfHurt || 0) - (B.ITEM_MAP[b].selfHurt || 0);
      });
      const pick = cost.throwable === true ? ids[0] : (ids.indexOf(cost.throwable) >= 0 ? cost.throwable : ids[0]);
      if (pick) {
        const it = B.ITEM_MAP[pick];
        this.delItem(pick, 1);
        losses.push(it.name);
        this.lastThrow = it.name;
        if (it.selfHurt) { this.hurt('hp', 'hpSub', it.selfHurt * HIT); losses.push('체력'); }
      }
    }
    if (cost.item && this.delItem(cost.item, 1)) losses.push(B.ITEM_MAP[cost.item].name);
    if (cost.itemKind) {
      const n = cost.itemKindN || 1;
      for (let k = 0; k < n; k++) {
        const id = this.hasKind(cost.itemKind);
        if (id && this.delItem(id, 1)) losses.push(B.ITEM_MAP[id].name);
      }
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
    this.ensureExit();      /* 방금 쓴 물건이 유일한 선택지의 조건이었을 수 있다 */
    return { name: it.name, cured: cured };
  };

  /* 몸으로 익히는 것들. 일부러 배우지 않아도 쓰다 보면 는다 */
  Engine.prototype.learnFrom = function (c, success) {
    const st = this.st;
    const id = c.need && c.need.skill;
    if (!id) return;
    const lv = this.skillLv(id);
    if (lv >= 3) return;
    /* 성공하면 조금, 실패하면 더 조금. 처음 쓰는 능력일수록 빨리 는다 */
    const chance = (success ? 0.16 : 0.09) * (lv === 0 ? 1.6 : (lv === 1 ? 1 : 0.55));
    if (this.rnd() >= chance) return;
    st.skills[id] = lv + 1;
    const s2 = B.SKILL_MAP[id];
    st.log.push('익힘 · ' + (s2 ? s2.name : id) + ' Lv.' + st.skills[id]);
    this.justLearned = (s2 ? s2.name : id) + ' Lv.' + st.skills[id];
  };

  /* 총은 한 번 쐈다고 없어지지 않는다. 다만 무리하면 걸리고, 드물게 못 쓰게 된다 */
  /* ── 몸에 걸친 것이 한 번은 대신 맞아 준다 ──────
   *   armor 가 붙은 옷은 부상 한 칸을 통째로 받아 냅니다. 대신 그 한 번으로
   *   못 쓰게 됩니다. 두 칸짜리 충격이면 한 칸만 막고 나머지는 몸으로 받습니다.
   *   지치는 값(wear)은 안 막습니다. 굶주림과 노숙을 옷이 막아 줄 수는 없으니까요.
   */
  Engine.prototype.armorItem = function () {
    const st = this.st;
    let best = null;
    let bestV = 0;
    Object.keys(st.items).forEach(function (id) {
      if (st.items[id] <= 0) return;
      const it = B.ITEM_MAP[id];
      if (!it || !it.armor) return;
      if (it.armor > bestV) { bestV = it.armor; best = id; }
    });
    return best;
  };

  /* 들어온 피해(눈금 단위)를 옷이 받아 내고 남은 값을 돌려준다 */
  Engine.prototype.soak = function (hits, res) {
    if (hits <= 0) return hits;
    const id = this.armorItem();
    if (!id) return hits;
    const it = B.ITEM_MAP[id];
    const left = Math.max(0, hits - it.armor * HIT);
    this.delItem(id, 1);
    if (it.broken && B.ITEM_MAP[it.broken]) this.addItem(it.broken, 1);
    if (res && res.losses) res.losses.push(it.name + (left > 0 ? ' 찢어짐' : ' 찢어짐(피해 막음)'));
    this.st.log.push('막음 · ' + it.name);
    this.st.flags.armor_saved = 1;
    return left;
  };

  Engine.prototype.gunMishap = function (res) {
    const a = this.armed(null);
    if (!a) return;
    const r = this.rnd();
    if (r < 0.10) {
      const g = B.ITEM_MAP[a.gun];
      this.delItem(a.gun, 1);
      this.addItem('brokengun', 1);
      if (res && res.losses) res.losses.push(g.name + ' 파손');
      this.st.log.push('파손 · ' + g.name);
    } else if (r < 0.28) {
      this.addItem('gunjam', 1);
      if (res && res.losses) res.losses.push('탄 걸림');
    }
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
      { label: '호화로운 식사를 한다.', need: { itemKind: 'food', itemKindN: 2 },
        cost: { itemKind: 'food', itemKindN: 2 },
        res: ['식량을 두 몫 펼치고 물까지 곁들입니다. 깡통 바닥까지 손가락으로 훑어 먹습니다.\n이런 날은 한 달에 한 번 있을까 말까입니다. 배가 부르니 세상이 잠깐 견딜 만해 보입니다.',
               '두 몫을 한 번에 먹는 것은 사치이면서 계산이기도 합니다. 오늘 걷는 거리가 달라집니다.'],
        eff: { hp: 2, mp: 1, del: ['hunger'], add: ['relief'] }, dc: 0, ok: [], no: [] },
      { label: '식량을 먹는다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['천천히 씹습니다. 맛은 오래전에 포기했고, 이제는 삼키는 감각만 남았습니다.\n배가 부르지는 않지만, 오늘은 이걸로 됩니다.'],
        eff: { hp: 1, del: ['hunger'] }, dc: 0, ok: [], no: [] },
      { label: '굶는다.', res: ['물만 한 모금 마시고 허리띠를 한 칸 조입니다.\n위장이 자기 자신을 갉는 감각에는 끝까지 익숙해지지 않습니다. 내일은 뭐라도 찾아야 합니다.'],
        eff: { wear: { hp: 2 }, add: ['hunger'] }, dc: 0, ok: [], no: [] }
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
      { label: '두꺼운 옷을 여미고 눕는다.', need: { warm: true },
        res: ['불을 안 피웁니다. 불은 온기를 주지만 사람도 부릅니다. 오늘은 그 값이 비쌉니다.\n깃을 세우고 두 팔을 안으로 넣고 무릎을 당깁니다. 그것만으로 밤이 견딜 만해집니다.',
               '아침에 깨니 서리가 옷 위에만 내려 있습니다. 안쪽은 아직 따뜻합니다.'],
        eff: { mp: 1, del: ['insomnia', 'cold'] }, dc: 0, ok: [], no: [] },
      { label: '노숙한다.', res: ['처마 밑에 몸을 구겨 넣습니다. 추위보다 소리가 더 무섭습니다.\n밤새 열 번쯤 눈을 뜨고, 열 번 다 아무것도 없었습니다. 그게 다행인지 아닌지 모르겠습니다.'],
        eff: { wear: { mp: 2 } }, dc: 0, ok: [], no: [] }
    ], 'sleep');
  }

  /* ── 콘텐츠 생산 ─────────────────────────────── */
  Engine.prototype.produce = function () {
    const st = this.st;
    const A = B.ARCS;
    if (st.mode === 'ending') return;

    /* 도입부 */
    if (st.mode === 'prologue') {
      const PRO = this.prologue();
      if (st.prologueIdx < PRO.length) {
        const sc = PRO[st.prologueIdx++];
        this.queue.push(scene(sc.pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}, this), 'story'));
        return;
      }
      st.mode = 'run';
    }

    /* 종장 */
    if (st.page >= FINAL_PAGE && st.mode !== 'finale') {
      st.mode = 'finale';
      st.sceneIdx = 0;
      if (!st.flags.door_open) {
        if ((st.specialsDone || []).length >= 18) this.pushEnding('chronicle');
        else this.pushEnding(st.flags.dog_pups || st.flags.in_town ? 'settle' : 'wander');
        return;
      }
    }
    if (st.mode === 'finale') {
      if (st.sceneIdx < A.FINALE.scenes.length) {
        const sc = A.FINALE.scenes[st.sceneIdx++];
        this.queue.push(scene(sc.pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}, this), 'story'));
      } else {
        this.pushEnding('wander');
      }
      return;
    }

    /* 본편 장 */
    const CH = this.chapters();
    const ch = CH[st.chapterIdx];
    if (ch && (st.inChapter || st.page >= ch.at)) {
      st.inChapter = true;
      if (st.sceneIdx < ch.scenes.length) {
        const sc = ch.scenes[st.sceneIdx++];
        const pages = sc.pages.slice();
        if (st.sceneIdx === 1) pages.unshift('__TITLE__' + ch.title);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}, this), 'story'));
        return;
      }
      st.inChapter = false;
      st.sceneIdx = 0;
      st.chapterIdx++;
      st.phase = st.chapterIdx >= 7 ? 3 : (st.chapterIdx >= 3 ? 2 : 1);
    }

    /* 장편 — 상점에서 사서 적용해 둔 것. 정해진 페이지에 시작해 끝까지 이어진다 */
    const LG = B.LONGS || {};
    if (st.lgId && LG[st.lgId]) {
      const lg = LG[st.lgId];
      if (st.lgScene < lg.scenes.length) {
        const sc = lg.scenes[st.lgScene++];
        const pages = sc.pages.slice();
        if (st.lgScene === 1) pages.unshift('__TITLE__' + lg.title);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}, this),
                              'long', { lg: lg.id }));
        return;
      }
      /* 장편이 끝나면 그 장편의 마무리를 한 장면 보여 준다 */
      if (!st.lgDone) {
        st.lgDone = 1;
        const e2 = lg.ending || {};
        const pages = ['__TITLE__' + (e2.name || lg.name)].concat(e2.pages || []);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: [
          { t: '이야기를 접는다.', res: [], eff: {} }
        ] }, {}, {}, this), 'long', { lg: lg.id }));
        return;
      }
      if (st.longDone.indexOf(st.lgId) < 0) st.longDone.push(st.lgId);
      Engine.markLong(st.lgId);
      st.lgId = null; st.lgScene = 0; st.lgDone = 0;
    } else if (!st.lgId) {
      const on = Engine.longApplied();
      const ids = Object.keys(LG).filter(function (id) {
        return on[id] && st.longDone.indexOf(id) < 0 && st.page >= (LG[id].at || 150);
      });
      if (ids.length) {
        st.lgId = ids[Math.floor(this.rnd() * ids.length)];
        st.lgScene = 0;
        st.lgDone = 0;
        return this.produce();
      }
    }

    /* 특별 이야기 — 순서를 섞어 두고, 무작위 간격으로 한 편씩 끼워 넣는다.
     * 한 여정에서 같은 편이 두 번 나오는 일은 없다. */
    const SP = B.SPECIALS || [];
    this.ensureSpecialPlan();
    if (st.spIdx >= 0) {
      const cur = SP[st.spIdx];
      if (cur && st.spScene < cur.scenes.length) {
        const sc = cur.scenes[st.spScene++];
        const pages = sc.pages.slice();
        if (st.spScene === 1) pages.unshift('__TITLE__' + cur.title);
        this.queue.push(scene(pages, this.gen.buildChoices({ choices: sc.choices }, {}, {}, this),
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
    } else if (st.page >= st.spAt && st.spOrder && st.spOrder.length) {
      /* 조건이 걸린 편은 조건이 찰 때까지 순서에서 건너뛴다 (버려지지는 않는다) */
      for (let k = 0; k < st.spOrder.length; k++) {
        const id = st.spOrder[k];
        if (st.specialsDone.indexOf(id) >= 0) { st.spOrder.splice(k, 1); k--; continue; }
        let idx = -1;
        for (let i = 0; i < SP.length; i++) if (SP[i].id === id) { idx = i; break; }
        if (idx < 0) { st.spOrder.splice(k, 1); k--; continue; }
        const sp = SP[idx];
        if (sp.req && sp.req.flag && !st.flags[sp.req.flag]) continue;
        if (sp.req && sp.req.items) {
          let ok2 = true;
          for (let q = 0; q < sp.req.items.length; q++) {
            if (!st.items[sp.req.items[q]]) { ok2 = false; break; }
          }
          if (!ok2) continue;
        }
        if (sp.req && sp.req.pageMin && st.page < sp.req.pageMin) continue;
        st.spOrder.splice(k, 1);
        st.spIdx = idx;
        st.spScene = 0;
        this.scheduleNextSpecial();
        return this.produce();
      }
      /* 전부 조건에 걸렸다면 조금 뒤에 다시 본다 */
      st.spAt = st.page + 12;
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

    const enc = this.gen.compose(st, this);
    st.encounters++;
    this.queue.push(scene(enc.pages, enc.choices, 'enc', { tpl: enc.tplId }));
  };

  Engine.prototype.pushEnding = function (id) {
    const st = this.st;
    const e = B.ARCS.ENDINGS[id] || B.ARCS.ENDINGS.wander;
    st.mode = 'ending';
    st.ending = id;
    Engine.pushRecord(id, st.page, st);
    const dead = id.indexOf('death_') === 0;
    const pages = e.pages.slice();
    if (dead) pages.unshift('__TITLE__사망했습니다');

    /* 엔딩마다 붙는 맺는 말 */
    if (B.CODA && B.CODA[id]) pages.push(B.CODA[id]);

    /* 그동안 무엇을 했는지 정리해 준다 */
    if (B.summarize) {
      const sum = B.summarize(st);
      if (sum.length) pages.push('__TITLE__이 여정에 남은 것');
      for (let i = 0; i < sum.length; i += 2) {
        pages.push(sum.slice(i, i + 2).join('\n'));
      }
    }

    /* 조건이 맞을 때만 붙는 줄 */
    if (B.ENDING_EXTRA) {
      const extra = B.ENDING_EXTRA.filter(function (x) {
        try { return x.when(st); } catch (err) { return false; }
      }).map(function (x) { return x.text; });
      if (extra.length) pages.push(extra.join('\n'));
    }

    pages.push('— ' + e.name + ' —\n\n' + st.page + '페이지를 걸었습니다.'
      + (dead ? '\n되살릴 것이 가방에 없었습니다.' : ''));
    this.queue.push(scene(pages, [{
      label: dead ? '재시작하기' : '새로운 여정을 시작한다.',
      restart: true, need: null, cost: null,
      dc: 0, ok: [], no: [], res: [], eff: null
    }], 'ending'));
  };

  /* 시작 사연에 따라 도입부와 본편이 갈린다 */
  Engine.prototype.prologue = function () {
    const P = B.ARCS.PROLOGUES || {};
    return P[this.st.origin] || B.ARCS.PROLOGUE;
  };

  Engine.prototype.chapters = function () {
    if (this.st.origin === 'coma' && B.ARCS.CHAPTERS_COMA) return B.ARCS.CHAPTERS_COMA;
    return B.ARCS.CHAPTERS;
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

  /* 소지품을 쓰거나 만들다가 유일하게 열려 있던 선택지가 잠길 수 있다.
   * 그러면 화면이 통째로 막히므로, 그때마다 빠져나갈 길을 다시 확인한다. */
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

  /* 여정을 시작할 때 특별 이야기 순서를 한 번 섞어 둔다.
   * 예전에는 편마다 고정 페이지가 박혀 있어서, 몇 판을 해도 같은 자리에서 같은 편이 나왔다. */
  Engine.prototype.ensureSpecialPlan = function () {
    const st = this.st;
    const SP = B.SPECIALS || [];
    if (st.spOrder) return;
    const ids = SP.filter(function (sp) {
      if (st.specialsDone.indexOf(sp.id) >= 0) return false;
      /* 수집 이야기는 적용해 둔 것만 순번에 든다 */
      if (sp.keepsake) return !!Engine.applied()[sp.id];
      return true;
    }).map(function (sp) { return sp.id; });
    for (let i = ids.length - 1; i > 0; i--) {          /* 피셔-예이츠 */
      const j = Math.floor(this.rnd() * (i + 1));
      const t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    }
    st.spOrder = ids;
    st.spAt = SP_FIRST + Math.floor(this.rnd() * SP_FIRST);
  };

  /* 남은 편 수로 남은 페이지를 나눠, 그 간격을 흔들어 잡는다 */
  Engine.prototype.scheduleNextSpecial = function () {
    const st = this.st;
    const left = st.spOrder ? st.spOrder.length : 0;
    if (!left) { st.spAt = FINAL_PAGE * 2; return; }
    const room = Math.max(1, FINAL_PAGE - st.page);
    const gap = Math.max(SP_MIN_GAP, Math.floor(room / (left + 1)));
    const jitter = Math.floor((this.rnd() - 0.5) * gap * 0.6);
    st.spAt = st.page + Math.max(SP_MIN_GAP, gap + jitter);
  };

  /* 몸을 갉는 것들과 머리를 갉는 것들. 뒤 숫자가 한 번에 깎는 눈금 수 */
  const HP_BAD = [['hunger', 2], ['wound', 1], ['fever', 2], ['fracture', 1], ['burn', 1],
                  ['cold', 1], ['infection', 2], ['bleeding', 2], ['pain', 1], ['poison', 2],
                  ['headshot', 3], ['riddled', 2], ['modified', 1], ['coldweak', 1]];
  const MP_BAD = [['gloom', 2], ['insomnia', 1], ['guilt', 1], ['headache', 1],
                  ['depress', 2], ['mad', 2], ['emptiness', 2], ['cursed', 1], ['wanted', 1],
                  ['anger', 1], ['bugfear', 1], ['hopeaddict', 1], ['uglyscar', 1],
                  ['jobless', 1], ['baldness', 1], ['racoontgt', 1], ['popetgt', 1],
                  ['usbad', 1], ['hardmode', 1], ['greedy', 1]];
  const MP_GOOD = ['humor', 'goodrep', 'blessed', 'beauty', 'stable', 'relief', 'warmth', 'narciss'];

  Engine.prototype.tick = function () {
    const st = this.st;
    if (st.mode === 'ending' || st.mode === 'prologue') return;

    if (st.page % MEAL_EVERY === 0) this.queue.unshift(mealScene(this.rnd));
    else if (st.page % SLEEP_EVERY === 0) this.queue.unshift(sleepScene(this.rnd));

    if (st.page % 25 === 0) {
      let wear = 0;
      HP_BAD.forEach(function (p2) { if (st.items[p2[0]]) wear += p2[1]; });
      if (st.rad >= 3) wear += 2;
      if (wear) this.hurt('hp', 'hpSub', Math.min(3, wear));
    }
    if (st.page % 23 === 0) {
      let wear = 0;
      MP_BAD.forEach(function (p2) { if (st.items[p2[0]]) wear += p2[1]; });
      MP_GOOD.forEach(function (id) { if (st.items[id]) wear -= 1; });
      if (wear > 0) this.hurt('mp', 'mpSub', Math.min(3, wear));
      else if (wear < 0) this.heal('mp', 'mpSub', 0.25);   /* 한 칸이 아니라 마모 한 눈금만 */
    }
    if (st.page % 43 === 0 && st.rad > 0) st.rad = clamp(st.rad - 1, 0, RAD_MAX);

    if (st.hp >= MAX && st.mp >= MAX) st.fullPages = (st.fullPages || 0) + 1;

    /* 조건이 찬 미션이 있으면 쿠키를 준다 */
    if (st.page % 5 === 0) {
      const mdone = this.checkMissions();
      if (mdone.length) {
        st.mToast = mdone.map(function (m) { return m.name + ' +' + m.cookies; });
      }
    }

    /* 조건이 찬 수집 이야기가 있으면 그 자리에서 알려 준다 */
    const got = this.checkKeepsakes();
    if (got.length) {
      this.st.ksToast = got.map(function (k) {
        return k.title.replace('수집한 이야기 · ', '');
      });
    }
    this.checkDeath();
  };

  /* 죽기 직전에 가방을 뒤진다.
   * 의약품 · 의료용 주사기 · 무당이 준 생명의 부적이 있으면 한 번은 되돌아온다.
   * 되돌릴 것이 없으면 그대로 끝난다. */
  Engine.prototype.reviveItem = function () {
    const st = this.st;
    /* 되살릴 수 있는 물건은 전부 후보다. 값이 싼 것부터 쓰고 부적은 마지막까지 아낀다 */
    const held = Object.keys(st.items).filter(function (id) {
      const it = B.ITEM_MAP[id];
      return it && it.revive && st.items[id] > 0;
    });
    if (!held.length) return null;
    held.sort(function (a, b) {
      return (B.ITEM_MAP[a].revive || 0) - (B.ITEM_MAP[b].revive || 0);
    });
    return held[0];
  };

  Engine.prototype.tryRevive = function (cause) {
    const st = this.st;
    const id = this.reviveItem();
    if (!id) return false;
    const it = B.ITEM_MAP[id];
    const back = it.revive || 1;          /* 되돌아오는 칸 수 */

    this.delItem(id, 1);
    if (cause === 'hp') setDamage(st, 'hp', 'hpSub', (MAX - back) * WEAR);
    else if (cause === 'mp') setDamage(st, 'mp', 'mpSub', (MAX - back) * WEAR);
    st.rad = clamp(st.rad - back, 0, RAD_MAX);
    if (back >= 3) {
      /* 부적은 상처까지 데려갑니다 */
      ['wound', 'fracture', 'burn', 'fever', 'hunger', 'gloom'].forEach(function (b) {
        delete st.items[b];
      });
      setDamage(st, 'hp', 'hpSub', 0);
      setDamage(st, 'mp', 'mpSub', 0);
    }
    st.revives = (st.revives || 0) + 1;

    const why = cause === 'hp' ? '몸이 먼저 꺼졌습니다.'
      : (cause === 'mp' ? '머리가 먼저 꺼졌습니다.' : '피폭이 몸을 다 갉았습니다.');
    const how = id === 'lifecharm'
      ? ['품 안에서 뭔가 뜨거워집니다. 무당이 쥐여 준 부적입니다.\n"이거 한 번은 대신 죽어 준다." 그때는 웃고 넘겼습니다.',
         '부적이 손안에서 재가 됩니다. 재를 털어 내고 일어섭니다. 아픈 데가 하나도 없습니다.\n그게 제일 무섭습니다.']
      : (id === 'syringe'
        ? ['가방 바닥에 주사기가 하나 굴러다닙니다. 언제 주웠는지 기억도 안 납니다.',
           '허벅지에 그대로 찔러 넣습니다. 삼 초 뒤에 심장이 다시 일을 시작합니다.\n손이 떨리고 이가 부딪힙니다. 살아 있다는 뜻입니다.']
        : ['의약품 봉지를 이로 뜯습니다. 손이 말을 안 들어서 이로 뜯을 수밖에 없습니다.',
           '피를 멈추고, 숨을 고르고, 벽에 기대 앉습니다. 한참 뒤에 다리에 힘이 돌아옵니다.']);

    this.queue = [];
    this.queue.push(scene(
      ['__TITLE__여기서 끝날 뻔했습니다'].concat([why]).concat(how)
        .concat(['— ' + it.name + '을(를) 썼습니다. 남은 것은 없습니다. —']),
      [{ label: '다시 걷는다.', need: null, cost: null, dc: 0, ok: [], no: [],
         res: ['일어섭니다. 아직 갈 데가 남았습니다.'], eff: {} }],
      'revive'
    ));
    return true;
  };

  Engine.prototype.checkDeath = function () {
    const st = this.st;
    if (st.mode === 'ending') return;
    let cause = null;
    if (st.hp <= 0) cause = 'hp';
    else if (st.mp <= 0) cause = 'mp';
    else if (st.rad >= RAD_MAX) cause = 'rad';
    if (!cause) return;
    if (this.tryRevive(cause)) return;
    this.queue = [];
    this.pushEnding(cause === 'hp' ? 'death_hp' : (cause === 'mp' ? 'death_mp' : 'death_rad'));
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
      /* 능력 한 단계가 성패를 크게 가른다. Lv.3 이면 웬만한 판정은 넘어간다 */
      const p = Math.max(0.22, Math.min(0.95, 0.58 + 0.26 * (lv - c.dc)));
      const success = this.rnd() < p;
      texts = success ? c.ok : c.no;
      res = this.applyEff(success ? c.okEff : c.noEff);
      this.st.log.push((success ? '성공 · ' : '실패 · ') + c.label);
      this.learnFrom(c, success);
      if (!success && c.cost && c.cost.ammo) this.gunMishap(res);
    } else {
      texts = c.res && c.res.length ? c.res : [];
      res = this.applyEff(c.eff);
      this.st.log.push(c.label);
      this.learnFrom(c, true);
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
    const byChapter = st.chapterIdx / (this.chapters().length + 1);
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
    this.st.crafted = (this.st.crafted || 0) + 1;
    this.ensureExit();      /* 재료가 선택지 조건이었을 수 있다 */
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
                     gun: it.gun || '', caliber: it.caliber || '',
                     thrown: it.thrown, melee: it.melee || 0,
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
      hpSub: st.hpSub || 0, mpSub: st.mpSub || 0, wear: WEAR,
      max: MAX, radMax: RAD_MAX, progress: this.progress(),
      items: items, skills: skills, rep: st.rep, flags: st.flags,
      mode: st.mode, chapter: st.chapterIdx, ending: st.ending,
      titles: st.titles || [], specialsDone: st.specialsDone || [],
      chapterTitle: (this.chapters()[st.chapterIdx] || {}).title || '종장'
    };
  };

  Engine.MAX = MAX;
  Engine.RAD_MAX = RAD_MAX;
  Engine.FINAL_PAGE = FINAL_PAGE;
  Engine.newState = newState;
  B.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);

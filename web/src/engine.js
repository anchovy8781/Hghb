/* 부산 2033 - 게임 엔진
 *
 * 진행 단위는 "페이지"다. 페이지 하나에 문단 한 덩어리가 오고,
 * 마지막 문단에 선택지가 붙는다. 5000페이지에 닿으면 종장이 열린다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MAX = 3;          /* 체력 · 멘탈 · 돈 최대 칸 */
  const RAD_MAX = 4;      /* 피폭 한계 */
  const FINAL_PAGE = 5000;
  const SAVE_KEY = 'busan2033.save.v1';

  /* 체력이 바닥일 때 우선적으로 나오는 회복 계열 */
  const RECOVERY = ['rest_camp', 'rest_bath', 'scav_store', 'scav_market',
                    'town_gate', 'meet_medic', 'haz_water', 'scav_pharm'];

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
      encounters: 0
    };
  }

  function Engine(seed) {
    this.st = newState(seed || (Date.now() % 100000));
    this.rnd = B.mulberry32(this.st.seed);
    this.gen = new B.Generator(this.rnd, this.st);
    this.queue = [];
    this.beat = null;
  }

  /* ── 저장 / 불러오기 ─────────────────────────── */
  Engine.prototype.save = function () {
    try {
      const data = { st: this.st, queue: this.queue, beat: this.beat, recent: this.gen.recent };
      global.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
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
      e.beat = data.beat || null;
      return e;
    } catch (err) { return null; }
  };

  Engine.clearSave = function () {
    try { global.localStorage.removeItem(SAVE_KEY); } catch (e) { /* 무시 */ }
  };

  /* ── 상태 조작 ───────────────────────────────── */
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  Engine.prototype.skillLv = function (id) { return this.st.skills[id] || 0; };
  Engine.prototype.has = function (id) { return (this.st.items[id] || 0) > 0; };

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

  /* 한 칸이 깎이려면 이만큼 다쳐야 한다. 3칸짜리 게이지가 너무 빨리 비지 않도록. */
  const WEAR = 4;

  Engine.prototype.hurt = function (key, subKey, n) {
    const st = this.st;
    st[subKey] = (st[subKey] || 0) + n;
    while (st[subKey] >= WEAR && st[key] > 0) {
      st[subKey] -= WEAR;
      st[key] -= 1;
    }
  };

  Engine.prototype.heal = function (key, subKey, n) {
    const st = this.st;
    st[subKey] = 0;
    st[key] = clamp(st[key] + n, 0, MAX);
  };

  Engine.prototype.applyEff = function (eff) {
    if (!eff) return;
    const st = this.st;
    const self = this;
    if (eff.hp) { if (eff.hp < 0) this.hurt('hp', 'hpSub', -eff.hp); else this.heal('hp', 'hpSub', eff.hp); }
    if (eff.mp) { if (eff.mp < 0) this.hurt('mp', 'mpSub', -eff.mp); else this.heal('mp', 'mpSub', eff.mp); }
    if (eff.money) st.money = clamp(st.money + eff.money, 0, MAX);
    if (eff.rad) st.rad = clamp(st.rad + eff.rad, 0, RAD_MAX);
    (eff.add || []).forEach(function (i) { self.addItem(i, 1); });
    (eff.add2 || []).forEach(function (i) { self.addItem(i, 1); });
    (eff.del || []).forEach(function (i) { self.delItem(i, 1); });
    if (eff.skillUp) st.skills[eff.skillUp] = Math.min(3, (st.skills[eff.skillUp] || 0) + 1);
    if (eff.rep) {
      for (const k in eff.rep) st.rep[k] = (st.rep[k] || 0) + eff.rep[k];
    }
    if (eff.flag) st.flags[eff.flag] = 1;
    if (eff.chain) st.chain = eff.chain;
  };

  /* 선택지 사용 가능 여부 */
  Engine.prototype.checkNeed = function (need) {
    if (!need) return true;
    if (need.skill && this.skillLv(need.skill) < (need.lv || 1)) return false;
    if (need.item && !this.has(need.item)) return false;
    if (need.itemKind && !this.hasKind(need.itemKind)) return false;
    if (need.money && this.st.money < need.money) return false;
    if (need.flag && !this.st.flags[need.flag]) return false;
    if (need.rep) {
      for (const k in need.rep) if ((this.st.rep[k] || 0) < need.rep[k]) return false;
    }
    return true;
  };

  /* 선택지 앞에 붙는 태그 (초록 = 보유, 빨강 = 미보유) */
  Engine.prototype.tagsOf = function (choice) {
    const tags = [];
    const need = choice.need;
    const self = this;
    function push(kind, text, ok) { tags.push({ kind: kind, text: text, ok: ok }); }
    if (need) {
      if (need.skill) {
        const s = B.SKILL_MAP[need.skill];
        push('skill', s ? s.name : need.skill, self.skillLv(need.skill) >= (need.lv || 1));
      }
      if (need.item) {
        const it = B.ITEM_MAP[need.item];
        push('item', it ? it.name : need.item, self.has(need.item));
      }
      if (need.itemKind) {
        const names = { food: '식량', water: '물', med: '약', ammo: '무기',
                        part: '부품', lux: '귀중품', doc: '기록', mood: '감정' };
        push('item', names[need.itemKind] || need.itemKind, !!self.hasKind(need.itemKind));
      }
      if (need.money) push('money', '돈', self.st.money >= need.money);
      if (need.flag) push('flag', '단서', !!self.st.flags[need.flag]);
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
    if (!cost) return;
    if (cost.money) this.st.money = clamp(this.st.money - cost.money, 0, MAX);
    if (cost.hp) this.hurt('hp', 'hpSub', cost.hp);
    if (cost.mp) this.hurt('mp', 'mpSub', cost.mp);
    if (cost.item) this.delItem(cost.item, 1);
    if (cost.itemKind) {
      const id = this.hasKind(cost.itemKind);
      if (id) this.delItem(id, 1);
    }
  };

  /* ── 콘텐츠 생산 ─────────────────────────────── */
  function scenesToBeats(scene) {
    const beats = [];
    scene.pages.forEach(function (p, i) {
      beats.push({ text: p, choices: (i === scene.pages.length - 1) ? scene.choices : null, kind: 'story' });
    });
    return beats;
  }

  Engine.prototype.produce = function () {
    const st = this.st;
    const A = B.ARCS;

    /* 엔딩 처리 중이면 더 만들지 않는다 */
    if (st.mode === 'ending') return;

    /* 도입부 */
    if (st.mode === 'prologue') {
      if (st.prologueIdx < A.PROLOGUE.length) {
        const sc = A.PROLOGUE[st.prologueIdx++];
        this.queue = this.queue.concat(scenesToBeats({
          pages: sc.pages,
          choices: this.gen.buildChoices({ choices: sc.choices }, {}, {})
        }));
        return;
      }
      st.mode = 'run';
    }

    /* 종장 */
    if (st.page >= FINAL_PAGE && st.mode !== 'finale') {
      st.mode = 'finale';
      st.sceneIdx = 0;
      if (!st.flags.door_open) {
        this.pushEnding(st.flags.dog_pups || st.flags.in_town ? 'settle' : 'wander');
        return;
      }
    }
    if (st.mode === 'finale') {
      if (st.sceneIdx < A.FINALE.scenes.length) {
        const sc = A.FINALE.scenes[st.sceneIdx++];
        this.queue = this.queue.concat(scenesToBeats({
          pages: sc.pages,
          choices: this.gen.buildChoices({ choices: sc.choices }, {}, {})
        }));
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
        const beats = scenesToBeats({
          pages: sc.pages,
          choices: this.gen.buildChoices({ choices: sc.choices }, {}, {})
        });
        if (st.sceneIdx === 1) {
          beats.unshift({ text: ch.title, choices: null, kind: 'title' });
        }
        this.queue = this.queue.concat(beats);
        return;
      }
      st.inChapter = false;
      st.sceneIdx = 0;
      st.chapterIdx++;
      st.phase = st.chapterIdx >= 7 ? 3 : (st.chapterIdx >= 3 ? 2 : 1);
    }

    /* 무작위 인카운터 */
    if (st.hp <= 1) {
      /* 벼랑 끝이면 회복 계열이 잘 나오게 손을 본다 */
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
    const beats = [];
    enc.pages.forEach(function (p, i) {
      beats.push({
        text: p,
        choices: (i === enc.pages.length - 1) ? enc.choices : null,
        kind: 'enc',
        tpl: enc.tplId
      });
    });
    this.queue = this.queue.concat(beats);
  };

  Engine.prototype.pushEnding = function (id) {
    const st = this.st;
    const e = B.ARCS.ENDINGS[id] || B.ARCS.ENDINGS.wander;
    st.mode = 'ending';
    st.ending = id;
    const beats = e.pages.map(function (p) { return { text: p, choices: null, kind: 'ending' }; });
    beats.push({
      text: '— ' + e.name + ' —\n\n' + st.page + '페이지를 걸었습니다.',
      choices: [{ label: '새로운 여정을 시작한다.', restart: true, need: null, cost: null, dc: 0,
                  ok: [], no: [], res: [], eff: null }],
      kind: 'ending'
    });
    this.queue = this.queue.concat(beats);
  };

  /* ── 진행 ────────────────────────────────────── */
  Engine.prototype.step = function () {
    if (!this.queue.length) this.produce();
    if (!this.queue.length) return this.beat;
    this.beat = this.queue.shift();
    this.st.page++;
    this.tick();
    this.ensureExit();
    return this.beat;
  };

  /* 고를 수 있는 선택지가 하나도 없으면 언제나 물러설 길을 만들어 준다 */
  Engine.prototype.ensureExit = function () {
    const b = this.beat;
    if (!b || !b.choices || !b.choices.length) return;
    const self = this;
    const any = b.choices.some(function (c) { return self.checkNeed(c.need); });
    if (any) return;
    b.choices = b.choices.concat([{
      label: '지금은 물러선다.',
      need: null, cost: null, dc: 0, ok: [], no: [],
      res: ['할 수 있는 일이 없습니다. 발길을 돌립니다.'],
      eff: {}
    }]);
  };

  /* 끼니와 잠자리 — 원작의 "식사 시간입니다!" 를 그대로 옮겼다 */
  const MEAL_EVERY = 110;
  const SLEEP_EVERY = 230;

  const MEAL_LINES = ['식사 시간입니다!', '배가 웁니다. 끼니를 챙길 때입니다.',
                      '해가 중천입니다. 뭐라도 먹어야 합니다.', '하루치 힘이 다 떨어졌습니다.'];
  const SLEEP_LINES = ['어딘가에 몸을 뉘어야 할 시간입니다.', '눈꺼풀이 더는 버티지 못합니다.',
                       '해가 떨어졌습니다. 오늘은 여기까지입니다.'];

  function mealBeat(rnd) {
    return {
      text: MEAL_LINES[Math.floor(rnd() * MEAL_LINES.length)],
      kind: 'meal',
      choices: [
        { label: '호화로운 식사를 한다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
          extraNeed: { itemKind: 'water' },
          res: ['식량을 넉넉히 펼치고 물까지 곁들입니다. 이런 날은 한 달에 한 번 있을까 말까입니다.'],
          eff: { hp: 1, mp: 1, del: ['hunger'] }, dc: 0, ok: [], no: [], need2: 1 },
        { label: '식량을 먹는다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
          res: ['천천히 씹습니다. 배가 부르지는 않지만, 오늘은 이걸로 됩니다.'],
          eff: { hp: 1, del: ['hunger'] }, dc: 0, ok: [], no: [] },
        { label: '굶는다.',
          res: ['물만 한 모금 마시고 허리띠를 조입니다. 내일은 뭐라도 찾아야 합니다.'],
          eff: { hp: -1, add: ['hunger'] }, dc: 0, ok: [], no: [] }
      ]
    };
  }

  function sleepBeat(rnd) {
    return {
      text: SLEEP_LINES[Math.floor(rnd() * SLEEP_LINES.length)],
      kind: 'sleep',
      choices: [
        { label: '안전한 곳을 찾아 제대로 잔다.', need: { money: 1 }, cost: { money: 1 },
          res: ['문이 잠기는 방에서 잡니다. 그것만으로 사람이 됩니다.'],
          eff: { hp: 1, mp: 1, del: ['insomnia'] }, dc: 0, ok: [], no: [] },
        { label: '불을 피우고 눈을 붙인다.', need: { item: 'lighter' },
          res: ['불빛 앞에서 선잠을 잡니다. 몇 번 깼지만 아침은 옵니다.'],
          eff: { mp: 1 }, dc: 0, ok: [], no: [] },
        { label: '노숙한다.',
          res: ['처마 밑에 몸을 구겨 넣습니다. 추위보다 소리가 더 무섭습니다.'],
          eff: { mp: -1 }, dc: 0, ok: [], no: [] }
      ]
    };
  }

  /* 페이지마다 조금씩 몸이 상한다 */
  Engine.prototype.tick = function () {
    const st = this.st;
    if (st.mode === 'ending' || st.mode === 'prologue') return;
    if (st.page % MEAL_EVERY === 0) this.queue.unshift(mealBeat(this.rnd));
    else if (st.page % SLEEP_EVERY === 0) this.queue.unshift(sleepBeat(this.rnd));
    if (st.items.hunger && st.page % 70 === 0) this.hurt('hp', 'hpSub', 2);
    if (st.items.gloom && st.page % 90 === 0) this.hurt('mp', 'mpSub', 2);
    if (st.rad >= 3 && st.page % 80 === 0) this.hurt('hp', 'hpSub', 2);
    /* 몸은 시간이 지나면 조금씩 씻어 낸다 */
    if (st.page % 170 === 0 && st.rad > 0) st.rad = clamp(st.rad - 1, 0, RAD_MAX);
    this.checkDeath();
  };

  Engine.prototype.checkDeath = function () {
    const st = this.st;
    if (st.mode === 'ending') return;
    if (st.hp <= 0) { this.queue = []; this.pushEnding('death_hp'); }
    else if (st.mp <= 0) { this.queue = []; this.pushEnding('death_mp'); }
    else if (st.rad >= RAD_MAX) { this.queue = []; this.pushEnding('death_rad'); }
  };

  Engine.prototype.choose = function (idx) {
    const beat = this.beat;
    if (!beat || !beat.choices || !beat.choices[idx]) return;
    const c = beat.choices[idx];

    if (c.restart) {
      const seed = (this.st.seed + this.st.page + 13) >>> 0;
      const fresh = new Engine(seed);
      this.st = fresh.st;
      this.rnd = fresh.rnd;
      this.gen = fresh.gen;
      this.queue = [];
      this.beat = null;
      Engine.clearSave();
      return this.step();
    }

    if (!this.checkNeed(c.need)) return;   /* 빨간 태그는 고를 수 없다 */

    this.payCost(c.cost);

    let texts;
    if (c.dc) {
      const lv = c.need && c.need.skill ? this.skillLv(c.need.skill) : 1;
      const p = Math.max(0.15, Math.min(0.92, 0.5 + 0.22 * (lv - c.dc)));
      const success = this.rnd() < p;
      texts = success ? c.ok : c.no;
      this.applyEff(success ? c.okEff : c.noEff);
      this.st.log.push((success ? '성공 ' : '실패 ') + c.label);
    } else {
      texts = c.res && c.res.length ? c.res : [];
      this.applyEff(c.eff);
      this.st.log.push(c.label);
    }
    if (this.st.log.length > 60) this.st.log.shift();

    const self2 = this;
    const beats = (texts || []).map(function (t) {
      return { text: self2.gen.decorate(t, self2.st), choices: null, kind: 'res' };
    });

    if (c.end) {
      /* 종장 선택: 결말 문장 뒤에 곧바로 엔딩을 잇는다 */
      this.queue = beats;
      this.beat = null;
      this.pushEnding(c.end);
      return this.step();
    }

    this.queue = beats.concat(this.queue);
    this.beat = null;
    this.checkDeath();
    return this.step();
  };

  Engine.prototype.snapshot = function () {
    const st = this.st;
    const items = [];
    for (const id in st.items) {
      const it = B.ITEM_MAP[id];
      if (it) items.push({ id: id, name: it.name, n: st.items[id], kind: it.kind, bad: !!it.bad });
    }
    return {
      page: st.page, hp: st.hp, mp: st.mp, money: st.money, rad: st.rad,
      max: MAX, radMax: RAD_MAX,
      items: items,
      skills: st.skills,
      rep: st.rep,
      flags: st.flags,
      mode: st.mode,
      chapter: st.chapterIdx,
      ending: st.ending
    };
  };

  Engine.MAX = MAX;
  Engine.RAD_MAX = RAD_MAX;
  Engine.FINAL_PAGE = FINAL_PAGE;
  Engine.newState = newState;
  B.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);

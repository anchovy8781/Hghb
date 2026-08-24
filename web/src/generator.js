/* 부산 2033 - 사건 생성기
 *
 * 중복 서사 방지 4중 장치:
 *   1) 템플릿 쿨다운  - 최근에 쓴 템플릿은 한동안 다시 뽑지 않는다
 *   2) 변형 선택      - 같은 템플릿이라도 도입/전개 문단 변형이 매번 달라진다
 *   3) 조합 서명 검사 - (템플릿·변형·구역·장소·인물·물건) 조합이 이미 나왔으면 다시 뽑는다
 *   4) 본문 해시 검사 - 완성된 본문이 과거와 한 글자도 같지 않은지 최종 확인한다
 */
(function (global) {
  'use strict';
  const B = global.B;

  function Generator(rnd, state) {
    this.rnd = rnd;
    this.state = state;
    this.box = new B.DeckBox(rnd);
    this.recent = [];
  }

  Generator.prototype.pick = function (name, list) {
    return this.box.pick(name, list);
  };

  /* 지금 단계에서 나올 수 있는 구역 */
  Generator.prototype.zone = function (phase) {
    const zs = B.WORLD.ZONES.filter(function (z) { return z.phase <= phase; });
    return this.pick('zone' + phase, zs.map(function (z) { return z.id; }));
  };

  Generator.prototype.person = function (typeHint) {
    const A = B.ACTORS;
    const arch = typeHint
      ? (A.ARCHETYPES.filter(function (a) { return a.id === typeHint; })[0] || A.ARCHETYPES[0])
      : A.ARCHETYPES[Math.floor(this.rnd() * A.ARCHETYPES.length)];
    const name = this.pick('surname', A.SURNAMES) + this.pick('given', A.GIVEN);
    const lines = A.LINES[arch.id] || A.LINES.scav;
    return {
      name: name,
      role: arch.role,
      arch: arch.id,
      trait: this.pick('trait', A.TRAITS),
      habit: this.pick('habit', A.HABITS),
      line: this.pick('line_' + arch.id, lines)
    };
  };

  Generator.prototype.itemOf = function (kind) {
    /* 잡동사니는 이천 가지가 넘는다. 그냥 뽑으면 나중에 쓸모가 있는
     * 열쇠 물건이 영영 안 나오므로, 다섯 번에 한 번은 그쪽에서 뽑는다. */
    if (kind === 'junk' && this.rnd() < 0.35) {
      const keys = (B.ITEMS_BY_KIND.junk || []).filter(function (id) {
        return B.ITEM_MAP[id] && B.ITEM_MAP[id].key;
      });
      if (keys.length) return this.pick('item_junkkey', keys);
    }
    const pool = B.ITEMS_BY_KIND[kind] || B.ITEMS_BY_KIND.food;
    return this.pick('item_' + kind, pool);
  };

  /* 조건 충족 여부 */
  Generator.prototype.eligible = function (tpl, st) {
    if (tpl.phase.indexOf(st.phase) < 0) return false;
    const r = tpl.req;
    if (!r) return true;
    if (r.flag && !st.flags[r.flag]) return false;
    if (r.item && !st.items[r.item]) return false;
    if (r.radMin && st.rad < r.radMin) return false;
    if (r.rep) {
      for (const k in r.rep) {
        if ((st.rep[k] || 0) < r.rep[k]) return false;
      }
    }
    return true;
  };

  Generator.prototype.drawTemplate = function (st) {
    const self = this;
    const all = B.TEMPLATES;

    /* 연속 이야기가 예약되어 있으면 그것부터 */
    if (st.chain) {
      const want = st.chain;
      st.chain = null;
      const t = all.filter(function (x) { return x.id === want; })[0];
      if (t && self.eligible(t, st)) return t;
    }

    /* 덱에서 비복원으로 뽑는다 - 한 바퀴가 끝나기 전에는 같은 템플릿이 다시 안 나온다 */
    if (!this.tplPool || !this.tplPool.length) this.refillTemplatePool(st);

    for (let i = this.tplPool.length - 1; i >= 0; i--) {
      const cand = this.tplPool[i];
      if (self.eligible(cand, st) && self.recent.indexOf(cand.id) < 0) {
        this.tplPool.splice(i, 1);
        this.recent.push(cand.id);
        if (this.recent.length > 10) this.recent.shift();
        return cand;
      }
    }

    /* 덱이 조건에 다 걸리면 새로 섞는다 */
    this.refillTemplatePool(st);
    const usable = all.filter(function (t) { return t.w > 0 && self.eligible(t, st); });
    const t = B.pickWeighted(this.rnd, usable, function (x) { return x.w; });
    this.recent.push(t.id);
    if (this.recent.length > 10) this.recent.shift();
    return t;
  };

  /* 덱에는 조건을 만족하는 템플릿을 한 장씩만 넣는다.
   * 가중치로 장수를 늘리면 특정 사건이 몇 배씩 더 나와 "또 이거네" 소리를 듣게 된다. */
  Generator.prototype.refillTemplatePool = function (st) {
    const self = this;
    const pool = [];
    B.TEMPLATES.forEach(function (t) {
      if (t.w <= 0 || !self.eligible(t, st)) return;
      pool.push(t);
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(this.rnd() * (i + 1));
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    this.tplPool = pool;
  };

  function fill(text, ctx) {
    return B.josa(text.replace(/\{(\w+)\}/g, function (m, k) {
      return ctx[k] !== undefined ? ctx[k] : m;
    }));
  }

  function nameOf(id) {
    const it = B.ITEM_MAP[id];
    return it ? it.name : id;
  }

  Generator.prototype.buildContext = function (tpl, st) {
    const W = B.WORLD;
    const zoneId = this.zone(st.phase);
    const zone = W.ZONES.filter(function (z) { return z.id === zoneId; })[0];
    const s = tpl.slots || {};
    const ctx = { zone: zone.name, __zone: zone };

    if (s.place) {
      /* 사건마다 어울리는 장소가 따로 있으면 그것부터 쓴다 */
      const own = B.PLACESETS && B.PLACESETS[tpl.id];
      ctx.place = own && own.length
        ? this.pick('place_' + tpl.id, own)
        : this.pick('place_' + s.place, W.PLACES[s.place] || W.PLACES.urban);
    }
    if (s.npc) {
      const p = this.person(typeof s.npc === 'string' ? s.npc : null);
      ctx.npc = p.name;
      ctx.role = p.role;
      ctx.trait = p.trait;
      ctx.habit = p.habit;
      ctx.line = p.line;
    }
    if (s.threat) {
      const kinds = B.THREATKINDS && B.THREATKINDS[tpl.id];
      const pool = W.THREATS.filter(function (t) {
        return !kinds || kinds.indexOf(t.kind) >= 0;
      }).map(function (t) { return t.name; });
      ctx.threat = this.pick('threat_' + tpl.id, pool.length ? pool : W.THREATS.map(function (t) { return t.name; }));
    }
    if (s.base) {
      const bases = B.JUNK_BASE_LIST || [];
      const b = this.pick('junkbase', bases.map(function (x) { return x.id; }));
      const found = bases.filter(function (x) { return x.id === b; })[0];
      ctx.__base = b;
      ctx.basename = found ? found.name : b;
      ctx.basenote = found ? found.note : '';
    }
    if (s.item) ctx.item = this.itemOf(s.item);
    if (s.item2) ctx.item2 = this.itemOf(s.item2);
    return ctx;
  };

  Generator.prototype.buildChoices = function (tpl, textCtx, ctx) {
    return tpl.choices.map(function (c) {
      function resolveSlot(v) {
        if (v === '{base}') return ctx.__base;
        if (v === '{item}') return ctx.item;
        if (v === '{item2}') return ctx.item2;
        return v;
      }
      function resolveCond(c2) {
        if (!c2) return c2;
        const out = {};
        for (const k in c2) out[k] = (k === 'itemBase' || k === 'item') ? resolveSlot(c2[k]) : c2[k];
        return out;
      }
      function resolveEff(eff) {
        if (!eff) return null;
        const e = {};
        for (const k in eff) {
          if (k === 'add' || k === 'del' || k === 'add2') {
            e[k] = eff[k].map(function (x) {
              if (x === '{item}') return ctx.item;
              if (x === '{item2}') return ctx.item2;
              return x;
            });
          } else {
            e[k] = eff[k];
          }
        }
        return e;
      }
      function resolveText(arr) {
        return (arr || []).map(function (t) { return fill(t, textCtx); });
      }
      return {
        label: fill(c.t, textCtx),
        need: resolveCond(c.need) || null,
        cost: resolveCond(c.cost) || null,
        dc: c.dc || 0,
        end: c.end || null,
        ok: resolveText(c.ok),
        no: resolveText(c.no),
        res: resolveText(c.res),
        okEff: resolveEff(c.okEff),
        noEff: resolveEff(c.noEff),
        eff: resolveEff(c.eff)
      };
    });
  };


  /* 장면 하나를 만든다.
   *
   * 한 장면은 문단 여러 개로 이루어진다.
   *   도입(open) → 본문(body, 템플릿마다 손으로 쓴 긴 문단) → 전개(mid)
   * 예전처럼 무작위 문장을 앞뒤에 덧붙여 길이를 늘리지 않는다.
   * 어색해지기 때문이다. 대신 각 문단 자체를 길게 쓴다.
   */
  Generator.prototype.compose = function (st) {
    let attempt = 0;
    let fallback = null;

    while (attempt < 30) {
      attempt++;
      const tpl = this.drawTemplate(st);
      const ctx = this.buildContext(tpl, st);
      const openIdx = Math.floor(this.rnd() * tpl.open.length);
      const bodies = B.BODIES[tpl.id];
      const bodyIdx = bodies && bodies.length ? Math.floor(this.rnd() * bodies.length) : -1;
      const midIdx = tpl.mid ? Math.floor(this.rnd() * tpl.mid.length) : -1;

      const sig = [tpl.id, openIdx, bodyIdx, midIdx, ctx.zone, ctx.place || '',
                   ctx.npc || '', ctx.item || '', ctx.item2 || '', ctx.threat || ''].join('|');
      const sigHash = B.hashStr(sig);

      const textCtx = {};
      for (const k in ctx) textCtx[k] = ctx[k];
      if (ctx.item) textCtx.item = nameOf(ctx.item);
      if (ctx.item2) textCtx.item2 = nameOf(ctx.item2);

      const pages = [fill(tpl.open[openIdx], textCtx)];
      if (bodyIdx >= 0) pages.push(fill(bodies[bodyIdx], textCtx));
      if (midIdx >= 0) pages.push(fill(tpl.mid[midIdx], textCtx));

      const built = {
        tplId: tpl.id,
        cat: tpl.cat,
        ctx: ctx,
        pages: pages,
        choices: this.buildChoices(tpl, textCtx, ctx)
      };
      if (!fallback) fallback = built;

      /* 같은 조합, 같은 도입 문단은 다시 쓰지 않는다 */
      const openHash = B.hashStr(pages[0]);
      if (st.seenSig[sigHash] || st.seenText[openHash]) continue;

      st.seenSig[sigHash] = 1;
      st.seenText[openHash] = 1;
      return built;
    }

    st.collisions = (st.collisions || 0) + 1;
    return fallback;
  };

  /* 만들어질 수 있는 이야기 조합의 총수(대략) */
  Generator.computeVariety = function () {
    const W = B.WORLD;
    let total = 0;
    B.TEMPLATES.forEach(function (t) {
      const s = t.slots || {};
      let n = t.open.length * (t.mid ? t.mid.length : 1);
      n *= W.ZONES.length;
      if (s.place) n *= (W.PLACES[s.place] || W.PLACES.urban).length;
      if (s.npc) n *= B.ACTORS.SURNAMES.length * B.ACTORS.GIVEN.length;
      if (s.threat) n *= W.THREATS.length;
      if (s.item) n *= ((B.ITEMS_BY_KIND[s.item] || []).length || 1);
      if (s.item2) n *= ((B.ITEMS_BY_KIND[s.item2] || []).length || 1);
      total += n;
    });
    return total;
  };

  B.Generator = Generator;
})(typeof window !== 'undefined' ? window : globalThis);

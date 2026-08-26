/* 부산 2033 - 자동 플레이 검증기
 *
 *   node tools/simulate.mjs [횟수] [시드]
 *
 * 5000페이지를 끝까지 자동으로 플레이하면서
 *   - 본문이 한 번이라도 중복되는지
 *   - 엔딩까지 도달하는지
 *   - 자원이 어떻게 흘러가는지
 * 를 검사한다. 중복이 하나라도 나오면 실패로 끝난다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'web', 'src');

const FILES = [
  'rng.js',
  'data/world.js', 'data/places.js', 'data/actors.js', 'data/items.js', 'data/items2.js', 'data/items3.js', 'data/items4.js', 'data/junk.js', 'data/craft.js', 'data/fragments.js',
  'data/templates.js', 'data/templates2.js', 'data/templates3.js', 'data/templates4.js', 'data/templates5.js',
  'data/templates6.js', 'data/templates7.js', 'data/templates8.js', 'data/templates9.js', 'data/templates10.js', 'data/templates11.js', 'data/templates12.js', 'data/templates13.js', 'data/templates14.js', 'data/templates15.js', 'data/templates16.js', 'data/templates17.js', 'data/templates18.js',
  'data/bodies.js', 'data/bodies2.js', 'data/bodies3.js', 'data/bodies4.js', 'data/bodies5.js',
  'data/specials.js', 'data/specials2.js', 'data/specials3.js', 'data/specials4.js', 'data/specials5.js', 'data/specials6.js', 'data/specials7.js', 'data/specials8.js', 'data/specials9.js',
  'data/arcs.js', 'data/arcs2.js',
  'generator.js', 'engine.js'
];

function loadGame() {
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  };
  sandbox.Math = Math;
  sandbox.Date = Date;
  sandbox.JSON = JSON;
  for (const f of FILES) {
    const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
    const fn = new Function('window', 'globalThis', 'localStorage', 'B', code + '\nreturn window.B;');
    sandbox.B = fn(sandbox, sandbox, sandbox.localStorage, sandbox.B);
  }
  if (sandbox.B.buildJunkCatalog) sandbox.B.buildJunkCatalog();
  return sandbox.B;
}

/* 사람처럼 고르는 정책: 자원이 바닥이면 자기를 해치는 선택을 피한다 */
function score(e, c) {
  const st = e.st;
  let v = Math.random() * 0.5;
  const effs = [c.eff, c.okEff, c.noEff].filter(Boolean);
  for (const eff of effs) {
    const w = eff === c.noEff ? 0.4 : 1;
    /* 한 대에 한 칸이 날아가므로, 사람이라면 깎이는 선택을 훨씬 더 피한다 */
    if (eff.hp) v += eff.hp * w * (eff.hp < 0 ? (st.hp <= 1 ? 30 : 9) : (st.hp < 3 ? 7 : 2));
    if (eff.mp) v += eff.mp * w * (eff.mp < 0 ? (st.mp <= 1 ? 30 : 9) : (st.mp < 3 ? 7 : 2));
    if (eff.rad) v -= eff.rad * w * (st.rad >= 2 ? 6 : 2);
    if (eff.money) v += eff.money * w * 0.6;
    if (eff.add) v += eff.add.length * 0.5 * w;
    if (eff.del) v += eff.del.length * 2 * w;      /* 붙은 것을 떼는 선택은 값이 높다 */
  }
  if (c.cost && c.cost.hp) v -= st.hp <= 1 ? 30 : 8;
  if (c.cost && c.cost.mp) v -= st.mp <= 1 ? 30 : 8;
  if (c.cost && c.cost.money) v -= 0.4;
  return v;
}

/* (참고) 예전 방식 — 지금은 쓰지 않는다. 회복은 전부 선택지로 한다 */
function useItemsIfNeeded(e, B) {
  const st = e.st;
  const held = Object.keys(st.items);
  const heal = (want) => held.filter((id) => {
    const it = B.ITEM_MAP[id];
    return it && e.canUse(id) && want(it);
  })[0];

  if (st.items.wound || st.items.burn) {
    const id = heal((it) => it.id === 'medkit' || it.id === 'bandage');
    if (id) { e.useItem(id); return true; }
  }
  if (st.items.fever) {
    const id = heal((it) => it.cures === 'fever');
    if (id) { e.useItem(id); return true; }
  }
  if (st.items.headache) {
    const id = heal((it) => it.cures === 'headache');
    if (id) { e.useItem(id); return true; }
  }
  if (st.rad >= 3) {
    const id = heal((it) => it.rad && it.rad < 0);
    if (id) { e.useItem(id); return true; }
  }
  if (st.hp <= 2) {
    const id = heal((it) => it.hp && it.hp > 0);
    if (id) { e.useItem(id); return true; }
  }
  if (st.mp <= 2) {
    const id = heal((it) => it.mp && it.mp > 0);
    if (id) { e.useItem(id); return true; }
  }
  return false;
}

/* 사람이라면 재료가 모이면 만들어 본다 */
function craftIfPossible(e) {
  const list = e.craftList().filter((r) => r.ok);
  if (!list.length) return 0;
  let made = 0;
  list.slice(0, 2).forEach((r) => { if (e.craft(r.id)) made++; });
  return made;
}

function choose(e, pool) {
  let best = pool[0];
  let bestV = -Infinity;
  for (const c of pool) {
    const v = score(e, c);
    if (v > bestV) { bestV = v; best = c; }
  }
  return best;
}

function play(B, seed, maxPages = 4000) {
  const e = new B.Engine(seed);
  const seenOpen = new Map();      // 장면 도입 문단 -> 처음 나온 페이지
  const dup = [];
  const rawJosa = [];
  const tplCount = new Map();
  const tone = { act: new Set(), fun: new Set(), pay: new Set(), ttl: new Set() };
  const specials = new Set();
  let guard = 0;
  let crafted = 0;
  let chars = 0;
  let scenes = 0;

  let sc = e.step();
  while (sc && e.st.page < maxPages && guard < maxPages * 4) {
    guard++;
    scenes++;

    const texts = sc.blocks.filter((b) => b.type === 'text').map((b) => b.text);
    chars += texts.join('').length;
    const opening = (texts[0] || '').trim();
    const systemKind = sc.kind === 'meal' || sc.kind === 'sleep' || sc.kind === 'ending' || sc.kind === 'revive';
    if (opening && !systemKind) {
      if (seenOpen.has(opening)) {
        dup.push({ page: e.st.page, first: seenOpen.get(opening), text: opening.slice(0, 44), kind: sc.kind });
      } else {
        seenOpen.set(opening, e.st.page);
      }
    }
    texts.forEach((t) => {
      if (/[가-힣]\((?:는|가|를|와|과|야|로|으로|였|라)\)/.test(t)) rawJosa.push(t.slice(0, 40));
    });
    if (sc.sp) specials.add(sc.sp);
    if (sc.tpl) {
      tplCount.set(sc.tpl, (tplCount.get(sc.tpl) || 0) + 1);
      const g = sc.tpl.slice(0, 4);
      if (g === 'act_') tone.act.add(sc.tpl);
      else if (g === 'fun_') tone.fun.add(sc.tpl);
      else if (g === 'pay_') tone.pay.add(sc.tpl);
      else if (g === 'ttl_') tone.ttl.add(sc.tpl);
    }

    if (sc.choices && sc.choices.length) {
      if (e.st.mode === 'ending') break;
      /* 소지품에서 바로 쓰는 기능은 없앴다. 회복은 이야기 안에서만 한다 */
      if (e.st.page % 12 === 0) crafted += craftIfPossible(e);
      const usable = sc.choices.filter((c) => e.checkNeed(c.need));
      if (!usable.length) return { error: '선택 불가 상태', page: e.st.page };
      const pick = choose(e, usable);
      const before = sc.blocks.length;
      const after = e.choose(sc.choices.indexOf(pick));
      if (after) {
        after.blocks.slice(before).forEach((b) => {
          if (b.type === 'text') {
            chars += b.text.length;
            if (/[가-힣]\((?:는|가|를|와|과|야|로|으로|였|라)\)/.test(b.text)) rawJosa.push(b.text.slice(0, 40));
          }
        });
      }
      sc = e.step();
    } else {
      sc = e.step();
    }
  }

  return {
    page: e.st.page,
    mode: e.st.mode,
    ending: e.st.ending,
    endingName: e.st.ending ? B.ARCS.ENDINGS[e.st.ending].name : null,
    chapter: e.st.chapterIdx,
    encounters: e.st.encounters,
    uniqueTexts: seenOpen.size,
    scenes: scenes,
    chars: chars,
    dup, rawJosa, tplCount, tone,
    specials: specials,
    titles: e.st.titles || [],
    hp: e.st.hp, mp: e.st.mp, rad: e.st.rad, money: e.st.money,
    collisions: e.st.collisions || 0,
    crafted: crafted,
    progress: e.progress(),
    items: Object.keys(e.st.items).length,
    skills: e.st.skills
  };
}

const B = loadGame();
const runs = Number(process.argv[2] || 3);
const baseSeed = Number(process.argv[3] || 1000);

console.log('이야기 조합 수(대략):', B.Generator.computeVariety().toLocaleString(), '가지');
console.log('템플릿', B.TEMPLATES.length, '· 도입 변형',
  B.TEMPLATES.reduce((a, t) => a + t.open.length, 0), '· 선택지',
  B.TEMPLATES.reduce((a, t) => a + t.choices.length, 0));
console.log('');

let failed = 0;
for (let i = 0; i < runs; i++) {
  const seed = baseSeed + i * 977;
  const r = play(B, seed);
  if (r.error) {
    console.log(`시드 ${seed}: 오류 - ${r.error} (${r.page}p)`);
    failed++;
    continue;
  }
  const ok = r.dup.length === 0 && r.rawJosa.length === 0;
  if (!ok) failed++;
  console.log(
    `시드 ${seed} · ${r.page}p · ${r.chapter}장까지 · 인카운터 ${r.encounters} · ` +
    `장면 ${r.scenes} · 고유 도입 ${r.uniqueTexts} · 중복 ${r.dup.length} · ` +
    `본문 ${(r.chars / 10000).toFixed(1)}만자 · 엔딩 ${r.endingName || '없음'}`
  );
  if (r.rawJosa.length) {
    console.log(`   조사 미처리 ${r.rawJosa.length}건: "${r.rawJosa[0]}…"`);
  }
  if (r.dup.length) {
    r.dup.slice(0, 6).forEach((d) => console.log(`   중복[${d.kind}]: ${d.page}p 와 ${d.first}p — "${d.text}…"`));
  }
  console.log(`   긴장 ${r.tone.act.size}종 · 유머 ${r.tone.fun.size}종 · 잡동사니 보상 ${r.tone.pay.size}종 · 칭호 사건 ${r.tone.ttl.size}종 · 만든 물건 ${r.crafted}개`);
  console.log(`   특별 이야기 ${r.specials.size}/${(B.SPECIALS || []).length}편 · 칭호 ${r.titles.length}개${r.titles.length ? ' (' + r.titles.slice(0, 3).join(', ') + ')' : ''}`);
  if (i === 0) {
    const top = [...r.tplCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log('   자주 나온 템플릿:', top.map(([k, v]) => `${k}(${v})`).join(' '));
  }
}

console.log('');
if (failed) {
  console.log(`실패 ${failed}/${runs}`);
  process.exit(1);
}
console.log(`통과 ${runs}/${runs} — 중복 본문 없음`);

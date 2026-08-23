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
  'data/world.js', 'data/actors.js', 'data/items.js', 'data/fragments.js',
  'data/templates.js', 'data/templates2.js', 'data/templates3.js', 'data/templates4.js', 'data/templates5.js',
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
  return sandbox.B;
}

/* 사람처럼 고르는 정책: 자원이 바닥이면 자기를 해치는 선택을 피한다 */
function score(e, c) {
  const st = e.st;
  let v = Math.random() * 0.5;
  const effs = [c.eff, c.okEff, c.noEff].filter(Boolean);
  for (const eff of effs) {
    const w = eff === c.noEff ? 0.4 : 1;
    if (eff.hp) v += eff.hp * w * (st.hp <= 1 ? 6 : 2);
    if (eff.mp) v += eff.mp * w * (st.mp <= 1 ? 6 : 2);
    if (eff.rad) v -= eff.rad * w * (st.rad >= 2 ? 6 : 2);
    if (eff.money) v += eff.money * w * 0.6;
    if (eff.add) v += eff.add.length * 0.5 * w;
  }
  if (c.cost && c.cost.hp) v -= st.hp <= 1 ? 6 : 1.5;
  if (c.cost && c.cost.mp) v -= st.mp <= 1 ? 6 : 1.5;
  if (c.cost && c.cost.money) v -= 0.4;
  return v;
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

function play(B, seed, maxPages = 12000) {
  const e = new B.Engine(seed);
  const seenPage = new Map();     // 본문 -> 처음 나온 페이지
  const dup = [];
  const tplCount = new Map();
  let beat = null;
  let guard = 0;

  beat = e.step();
  while (beat && e.st.page < maxPages && guard < maxPages * 4) {
    guard++;

    const text = (beat.text || '').trim();
    const systemKind = beat.kind === 'sys' || beat.kind === 'title'
      || beat.kind === 'meal' || beat.kind === 'sleep';
    if (text && !systemKind) {
      if (seenPage.has(text)) {
        dup.push({ page: e.st.page, first: seenPage.get(text), text: text.slice(0, 44), kind: beat.kind });
      } else {
        seenPage.set(text, e.st.page);
      }
    }
    if (beat.tpl) tplCount.set(beat.tpl, (tplCount.get(beat.tpl) || 0) + 1);

    if (beat.choices && beat.choices.length) {
      if (e.st.mode === 'ending') break;              // 엔딩 도달
      const usable = beat.choices.filter((c) => e.checkNeed(c.need));
      if (!usable.length) return { error: '선택 불가 상태', page: e.st.page, beat };
      const pick = choose(e, usable);
      beat = e.choose(beat.choices.indexOf(pick));
    } else {
      beat = e.step();
    }
  }

  return {
    page: e.st.page,
    mode: e.st.mode,
    ending: e.st.ending,
    endingName: e.st.ending ? B.ARCS.ENDINGS[e.st.ending].name : null,
    chapter: e.st.chapterIdx,
    encounters: e.st.encounters,
    uniqueTexts: seenPage.size,
    dup,
    tplCount,
    hp: e.st.hp, mp: e.st.mp, rad: e.st.rad, money: e.st.money,
    collisions: e.st.collisions || 0,
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
  const ok = r.dup.length === 0;
  if (!ok) failed++;
  console.log(
    `시드 ${seed} · ${r.page}p · ${r.chapter}장까지 · 인카운터 ${r.encounters} · ` +
    `고유 본문 ${r.uniqueTexts} · 중복 ${r.dup.length} · 엔딩 ${r.endingName || '없음'} ` +
    `(체력${r.hp} 멘탈${r.mp} 피폭${r.rad} 충돌${r.collisions})`
  );
  if (r.dup.length) {
    r.dup.slice(0, 6).forEach((d) => console.log(`   중복[${d.kind}]: ${d.page}p 와 ${d.first}p — "${d.text}…"`));
  }
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

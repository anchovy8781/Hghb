/* 부산 2033 - 데이터 정합성 검사기
 *
 *   node tools/validate.mjs
 *
 * 템플릿과 본편이 참조하는 능력 / 아이템 / 세력 / 연결 사건 / 엔딩 이름이
 * 실제로 존재하는지 전부 훑는다. 없는 이름을 쓰면 화면에 영문 id 가
 * 그대로 튀어나오기 때문에(예: 선택지에 "sense" 라고 찍히는 버그) 반드시 막아야 한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'web', 'src');

const FILES = [
  'rng.js',
  'data/world.js', 'data/places.js', 'data/actors.js', 'data/items.js', 'data/fragments.js',
  'data/templates.js', 'data/templates2.js', 'data/templates3.js', 'data/templates4.js',
  'data/templates5.js', 'data/templates6.js', 'data/templates7.js', 'data/templates8.js',
  'data/bodies.js', 'data/bodies2.js', 'data/bodies3.js',
  'data/arcs.js', 'data/arcs2.js',
  'generator.js', 'engine.js'
].filter((f) => fs.existsSync(path.join(srcDir, f)));

function loadGame() {
  const sb = {};
  sb.window = sb;
  sb.globalThis = sb;
  sb.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
  for (const f of FILES) {
    const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
    const fn = new Function('window', 'globalThis', 'localStorage', 'B', code + '\nreturn window.B;');
    sb.B = fn(sb, sb, sb.localStorage, sb.B);
  }
  return sb.B;
}

const B = loadGame();
const errors = [];
const warns = [];

const skillIds = new Set(B.SKILLS.map((s) => s.id));
const itemIds = new Set(B.ITEMS.map((i) => i.id));
const kinds = new Set(B.ITEMS.map((i) => i.kind));
const factionIds = new Set(B.WORLD.FACTIONS.map((f) => f.id));
const tplIds = new Set(B.TEMPLATES.map((t) => t.id));
const endingIds = new Set(Object.keys(B.ARCS.ENDINGS));
const placeGroups = new Set(Object.keys(B.WORLD.PLACES));
const archIds = new Set(B.ACTORS.ARCHETYPES.map((a) => a.id));

/* 어느 곳에서든 세워지는 깃발을 모아 둔다 (조건으로 쓰인 깃발이 실제로 세워지는지 확인용) */
const flagsSet = new Set();
const flagsUsed = new Map();

function noteFlagUse(flag, where) {
  if (!flagsUsed.has(flag)) flagsUsed.set(flag, []);
  flagsUsed.get(flag).push(where);
}

function checkEff(eff, where) {
  if (!eff) return;
  ['add', 'add2', 'del'].forEach((k) => {
    (eff[k] || []).forEach((id) => {
      if (id === undefined || id === null) {
        errors.push(`${where}: ${k} 에 빈 값`);
      } else if (!itemIds.has(id) && !/^\{item2?\}$/.test(id)) {
        errors.push(`${where}: 없는 아이템 "${id}"`);
      }
    });
  });
  if (eff.skillUp && !skillIds.has(eff.skillUp)) errors.push(`${where}: 없는 능력 "${eff.skillUp}"`);
  if (eff.rep) {
    Object.keys(eff.rep).forEach((k) => {
      if (!factionIds.has(k)) errors.push(`${where}: 없는 세력 "${k}"`);
    });
  }
  if (eff.chain && !tplIds.has(eff.chain)) errors.push(`${where}: 없는 연결 사건 "${eff.chain}"`);
  if (eff.flag) flagsSet.add(eff.flag);
  ['hp', 'mp', 'money', 'rad'].forEach((k) => {
    if (eff[k] !== undefined && typeof eff[k] !== 'number') errors.push(`${where}: ${k} 값이 숫자가 아님`);
  });
}

function checkNeed(need, where) {
  if (!need) return;
  if (need.skill && !skillIds.has(need.skill)) {
    errors.push(`${where}: 없는 능력 "${need.skill}"  ← 화면에 영문 id 가 그대로 나옵니다`);
  }
  if (need.item && !itemIds.has(need.item)) errors.push(`${where}: 없는 아이템 "${need.item}"`);
  if (need.itemKind && !kinds.has(need.itemKind)) errors.push(`${where}: 없는 분류 "${need.itemKind}"`);
  if (need.flag) noteFlagUse(need.flag, where);
  if (need.rep) {
    Object.keys(need.rep).forEach((k) => {
      if (!factionIds.has(k)) errors.push(`${where}: 없는 세력 "${k}"`);
    });
  }
}

function checkCost(cost, where) {
  if (!cost) return;
  if (cost.item && !itemIds.has(cost.item)) errors.push(`${where}: 없는 아이템 "${cost.item}"`);
  if (cost.itemKind && !kinds.has(cost.itemKind)) errors.push(`${where}: 없는 분류 "${cost.itemKind}"`);
}

/* 본문에 남은 치환자가 실제로 채워지는지 */
function checkPlaceholders(text, slots, where) {
  const found = text.match(/\{(\w+)\}/g) || [];
  const provided = new Set(['zone']);
  if (slots.place) provided.add('place');
  if (slots.npc) { ['npc', 'role', 'trait', 'habit', 'line'].forEach((k) => provided.add(k)); }
  if (slots.threat) provided.add('threat');
  if (slots.item) provided.add('item');
  if (slots.item2) provided.add('item2');
  found.forEach((f) => {
    const key = f.slice(1, -1);
    if (!provided.has(key)) errors.push(`${where}: 채울 수 없는 치환자 ${f}`);
  });
}

/* ── 템플릿 ─────────────────────────────────── */
B.TEMPLATES.forEach((t) => {
  const where = `템플릿 ${t.id}`;
  const slots = t.slots || {};
  if (!t.open || !t.open.length) errors.push(`${where}: 도입 문단 없음`);
  if (!t.choices || !t.choices.length) errors.push(`${where}: 선택지 없음`);
  if (slots.place && !placeGroups.has(slots.place)) errors.push(`${where}: 없는 장소군 "${slots.place}"`);
  if (typeof slots.npc === 'string' && !archIds.has(slots.npc)) {
    errors.push(`${where}: 없는 인물 유형 "${slots.npc}"`);
  }
  if (slots.item && !kinds.has(slots.item)) errors.push(`${where}: 없는 아이템 분류 "${slots.item}"`);
  if (slots.item2 && !kinds.has(slots.item2)) errors.push(`${where}: 없는 아이템 분류 "${slots.item2}"`);
  if (t.req) {
    if (t.req.flag) noteFlagUse(t.req.flag, where);
    if (t.req.item && !itemIds.has(t.req.item)) errors.push(`${where}: 없는 조건 아이템 "${t.req.item}"`);
    if (t.req.rep) {
      Object.keys(t.req.rep).forEach((k) => {
        if (!factionIds.has(k)) errors.push(`${where}: 없는 세력 "${k}"`);
      });
    }
  }

  (t.open || []).forEach((s, i) => checkPlaceholders(s, slots, `${where} open[${i}]`));
  (t.mid || []).forEach((s, i) => checkPlaceholders(s, slots, `${where} mid[${i}]`));

  if (slots.threat && !(B.THREATKINDS && B.THREATKINDS[t.id])) {
    errors.push(`${where}: 위협 종류(THREATKINDS)가 지정되지 않음 — 엉뚱한 위협이 들어갑니다`);
  }
  if (slots.place && !(B.PLACESETS && B.PLACESETS[t.id])) {
    warns.push(`${where}: 사건 전용 장소 목록이 없어 큰 분류에서 뽑습니다 (어색한 조합 위험)`);
  }

  const bodies = B.BODIES[t.id];
  if (!bodies || !bodies.length) {
    errors.push(`${where}: 장면 본문(BODIES)이 없음 — 화면이 너무 짧아집니다`);
  } else {
    bodies.forEach((s, i) => {
      checkPlaceholders(s, slots, `${where} body[${i}]`);
      if (s.length < 60) warns.push(`${where} body[${i}]: 본문이 너무 짧음 (${s.length}자)`);
    });
  }

  (t.choices || []).forEach((c, i) => {
    const cw = `${where} 선택지[${i}] "${(c.t || '').slice(0, 16)}"`;
    if (!c.t) errors.push(`${cw}: 문구 없음`);
    checkNeed(c.need, cw);
    checkCost(c.cost, cw);
    checkEff(c.eff, cw);
    checkEff(c.okEff, cw);
    checkEff(c.noEff, cw);
    if (c.dc && (!c.ok || !c.ok.length)) errors.push(`${cw}: 판정이 있는데 성공 서술이 없음`);
    if (c.dc && (!c.no || !c.no.length)) errors.push(`${cw}: 판정이 있는데 실패 서술이 없음`);
    if (!c.dc && !(c.res || []).length && !c.end) warns.push(`${cw}: 결과 서술이 비어 있음`);
    if (c.dc && c.need && !c.need.skill) warns.push(`${cw}: 판정인데 요구 능력이 없음`);
    checkPlaceholders(c.t, slots, cw);
    [].concat(c.ok || [], c.no || [], c.res || []).forEach((s, j) => {
      checkPlaceholders(s, slots, `${cw} 결과[${j}]`);
    });
    if (c.end && !endingIds.has(c.end)) errors.push(`${cw}: 없는 엔딩 "${c.end}"`);
  });
});

/* ── 본편 ───────────────────────────────────── */
function checkScene(sc, where) {
  if (!sc.pages || !sc.pages.length) errors.push(`${where}: 본문 없음`);
  (sc.choices || []).forEach((c, i) => {
    const cw = `${where} 선택지[${i}] "${(c.t || '').slice(0, 16)}"`;
    checkNeed(c.need, cw);
    checkCost(c.cost, cw);
    checkEff(c.eff, cw);
    checkEff(c.okEff, cw);
    checkEff(c.noEff, cw);
    if (c.end && !endingIds.has(c.end)) errors.push(`${cw}: 없는 엔딩 "${c.end}"`);
    if (c.dc && (!c.ok || !c.no)) errors.push(`${cw}: 판정 서술 누락`);
  });
}

B.ARCS.PROLOGUE.forEach((sc, i) => checkScene(sc, `도입부[${i}] ${sc.id}`));
B.ARCS.CHAPTERS.forEach((ch) => {
  ch.scenes.forEach((sc) => checkScene(sc, `${ch.title} ${sc.id}`));
});
B.ARCS.FINALE.scenes.forEach((sc) => checkScene(sc, `종장 ${sc.id}`));

/* 엔진이 직접 쓰는 아이템 */
['hunger', 'gloom', 'headache', 'insomnia', 'hope', 'painkill'].forEach((id) => {
  if (!itemIds.has(id)) errors.push(`엔진이 쓰는 아이템 "${id}" 가 없음`);
});
B.CONVERSIONS.forEach((cv) => {
  if (!itemIds.has(cv.from)) errors.push(`변환: 없는 아이템 "${cv.from}"`);
  if (!itemIds.has(cv.to)) errors.push(`변환: 없는 아이템 "${cv.to}"`);
});

/* 엔진 안에서 세워지는 깃발도 인정 */
['in_town', 'door_open', 'dog_pups', 'started'].forEach((f) => flagsSet.add(f));

flagsUsed.forEach((wheres, flag) => {
  if (!flagsSet.has(flag)) {
    errors.push(`조건으로 쓰이지만 아무 데서도 세워지지 않는 깃발 "${flag}" (${wheres[0]})`);
  }
});

/* ── 결과 ───────────────────────────────────── */
console.log(`템플릿 ${B.TEMPLATES.length} · 아이템 ${B.ITEMS.length} · 능력 ${B.SKILLS.length} · 엔딩 ${endingIds.size}`);
console.log(`검사한 선택지 ${B.TEMPLATES.reduce((a, t) => a + t.choices.length, 0)}개`);
console.log('');

if (warns.length) {
  console.log(`경고 ${warns.length}건`);
  warns.slice(0, 10).forEach((w) => console.log('  - ' + w));
  console.log('');
}

if (errors.length) {
  console.log(`오류 ${errors.length}건`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('정합성 검사 통과 — 화면에 영문 id 가 새어 나올 곳 없음');

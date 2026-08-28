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

const FILES = JSON.parse(fs.readFileSync(path.join(here, 'files.json'), 'utf8'))
  .filter((f) => f !== 'sound.js' && f !== 'ui.js' && f !== 'main.js')
  .filter((f) => fs.existsSync(path.join(srcDir, f)));

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
  if (sb.B.buildJunkCatalog) sb.B.buildJunkCatalog();
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
  if (eff.title && typeof eff.title !== 'string') errors.push(`${where}: 칭호가 문자열이 아님`);
  const KNOWN = ['hp', 'mp', 'money', 'rad', 'wear', 'add', 'add2', 'del', 'skillUp',
                 'rep', 'flag', 'chain', 'title', 'origin'];
  if (eff.wear) {
    Object.keys(eff.wear).forEach((k) => {
      if (k !== 'hp' && k !== 'mp') errors.push(`${where}: wear 에 쓸 수 없는 값 "${k}"`);
      if (typeof eff.wear[k] !== 'number') errors.push(`${where}: wear.${k} 가 숫자가 아님`);
    });
  }
  Object.keys(eff).forEach((k) => {
    if (KNOWN.indexOf(k) < 0) errors.push(`${where}: 알 수 없는 효과 키 "${k}"`);
  });
  ['hp', 'mp', 'money', 'rad'].forEach((k) => {
    if (eff[k] !== undefined && typeof eff[k] !== 'number') errors.push(`${where}: ${k} 값이 숫자가 아님`);
  });
}

function checkNeed(need, where) {
  if (!need) return;
  if (need.skill && !skillIds.has(need.skill)) {
    errors.push(`${where}: 없는 능력 "${need.skill}"  ← 화면에 영문 id 가 그대로 나옵니다`);
  }
  if (need.item && !itemIds.has(need.item) && need.item !== '{item}' && need.item !== '{item2}') {
    errors.push(`${where}: 없는 아이템 "${need.item}"`);
  }
  if (need.itemBase && need.itemBase !== '{base}' && !itemIds.has(need.itemBase)
      && !(B.JUNK_BASE_LIST || []).some((b) => b.id === need.itemBase)) {
    errors.push(`${where}: 없는 물건 종류 "${need.itemBase}"`);
  }
  if (need.itemKind && !kinds.has(need.itemKind)) errors.push(`${where}: 없는 분류 "${need.itemKind}"`);
  if (need.gun && need.gun !== true && !B.GUN_CLASSES[need.gun]) {
    errors.push(`${where}: 없는 총 분류 "${need.gun}"`);
  }
  if (need.flag) noteFlagUse(need.flag, where);
  if (need.specials && typeof need.specials !== 'number') errors.push(`${where}: specials 조건이 숫자가 아님`);
  if (need.title) {
    const known = [];
    const collect = (eff) => { if (eff && eff.title) known.push(eff.title); };
    (B.SPECIALS || []).forEach((sp) => sp.scenes.forEach((sc) => (sc.choices || []).forEach((c) => {
      collect(c.eff); collect(c.okEff); collect(c.noEff);
    })));
    B.TEMPLATES.forEach((t) => (t.choices || []).forEach((c) => {
      collect(c.eff); collect(c.okEff); collect(c.noEff);
    }));
    if (known.indexOf(need.title) < 0) {
      errors.push(`${where}: 아무 데서도 주지 않는 칭호 "${need.title}"`);
    }
  }
  if (need.rep) {
    Object.keys(need.rep).forEach((k) => {
      if (!factionIds.has(k)) errors.push(`${where}: 없는 세력 "${k}"`);
    });
  }
}

function checkCost(cost, where) {
  if (cost && cost.ammo && cost.ammo !== true && !B.GUN_CLASSES[cost.ammo]) {
    errors.push(`${where}: 없는 총 분류 "${cost.ammo}"`);
  }
  if (cost && cost.throwable && cost.throwable !== true && !itemIds.has(cost.throwable)) {
    errors.push(`${where}: 없는 던질 것 "${cost.throwable}"`);
  }
  if (!cost) return;
  if (cost.item && !itemIds.has(cost.item) && cost.item !== '{item}' && cost.item !== '{item2}') {
    errors.push(`${where}: 없는 아이템 "${cost.item}"`);
  }
  if (cost.itemKind && !kinds.has(cost.itemKind)) errors.push(`${where}: 없는 분류 "${cost.itemKind}"`);
}

/* 본문에 남은 치환자가 실제로 채워지는지 */
function checkPlaceholders(text, slots, where) {
  const found = text.match(/\{(\w+)\}/g) || [];
  const provided = new Set(['zone']);
  if (slots.place) provided.add('place');
  if (slots.npc) { ['npc', 'role', 'trait', 'look', 'habit', 'line'].forEach((k) => provided.add(k)); }
  /* {spend} 는 값으로 실제 나갈 물건 이름. 종류로 값을 무는 선택지에서만 채워진다 */
  provided.add('spend');
  if (slots.threat) provided.add('threat');
  if (slots.item) provided.add('item');
  if (slots.item2) provided.add('item2');
  if (slots.base) { provided.add('basename'); provided.add('basenote'); }
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
    (t.req.items || []).forEach((id) => {
      if (!itemIds.has(id)) errors.push(`${where}: 없는 조건 아이템 "${id}"`);
    });
    if (t.req.rep) {
      Object.keys(t.req.rep).forEach((k) => {
        if (!factionIds.has(k)) errors.push(`${where}: 없는 세력 "${k}"`);
      });
    }
    /* 칭호로 열리는 사건은, 그 칭호를 어디선가 실제로 줘야 열린다 */
    if (t.req.title) checkNeed({ title: t.req.title }, where);
    if (t.req.specials !== undefined && typeof t.req.specials !== 'number') {
      errors.push(`${where}: specials 조건이 숫자가 아님`);
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

/* ── 특별 이야기 ─────────────────────────────── */
const spIds = new Set();
(B.SPECIALS || []).forEach((sp) => {
  if (spIds.has(sp.id)) errors.push(`특별 이야기 id 중복: ${sp.id}`);
  spIds.add(sp.id);
  if (!sp.title) errors.push(`특별 이야기 ${sp.id}: 제목 없음`);
  (sp.req && sp.req.items ? sp.req.items : []).forEach((id) => {
    if (!itemIds.has(id)) errors.push(`특별 이야기 ${sp.id}: 없는 조건 아이템 "${id}"`);
  });
  if (typeof sp.at !== 'number') errors.push(`특별 이야기 ${sp.id}: 등장 페이지(at) 없음`);
  /* 수집한 이야기는 한 장면짜리 짧은 편이다. 특별 이야기는 두 장면 이상이어야 한다 */
  const minScenes = sp.keepsake ? 1 : 2;
  if (!sp.scenes || sp.scenes.length < minScenes) errors.push(`특별 이야기 ${sp.id}: 장면이 너무 적음`);
  (sp.scenes || []).forEach((sc, i) => {
    checkScene(sc, `${sp.title} 장면[${i}]`);
    if (!sc.choices || !sc.choices.length) errors.push(`${sp.title} 장면[${i}]: 선택지 없음`);
    (sc.choices || []).forEach((c, ci) => {
      [].concat([c.t || ''], c.res || [], c.ok || [], c.no || []).forEach((t) => {
        if (/\{\w+\}/.test(t)) {
          errors.push(`${sp.title} 장면[${i}] 선택지[${ci}]: 치환자가 남아 있음 — 특별 이야기에는 슬롯이 없습니다`);
        }
      });
    });
    (sc.pages || []).forEach((t, j) => {
      if (/\{\w+\}/.test(t)) errors.push(`${sp.title} 장면[${i}] 문단[${j}]: 치환자가 남아 있음`);
      if (t.length < 40) warns.push(`${sp.title} 장면[${i}] 문단[${j}]: 문단이 짧음`);
    });
  });
  /* 마지막 장면은 반드시 완주 가능해야 한다 */
  const last = (sp.scenes || [])[(sp.scenes || []).length - 1];
  if (last && (last.choices || []).every((c) => c.need)) {
    errors.push(`특별 이야기 ${sp.id}: 마지막 장면에 조건 없는 선택지가 없어 막힐 수 있음`);
  }
});
console.log(`특별 이야기 ${spIds.size}편 · 장면 ${(B.SPECIALS || []).reduce((a, s) => a + s.scenes.length, 0)}`);

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

/* ── 같은 id 를 두 번 정의하면 뒤엣것이 앞엣것을 조용히 덮어쓴다 ── */
{
  const cnt = new Map();
  B.TEMPLATES.forEach((t) => cnt.set(t.id, (cnt.get(t.id) || 0) + 1));
  cnt.forEach((n, id) => {
    if (n > 1) errors.push(`템플릿 id "${id}" 가 ${n}번 정의됨 — 본문·장소가 서로 덮어써진다`);
  });
}

/* ── 한 장면은 도입 + 본문 + 전개가 이어 붙어 나온다.
 *    같은 문장이 두 자리에 들어 있으면 플레이어가 같은 말을 두 번 읽는다. ── */
{
  const norm = (x) => x.replace(/\{\w+\}/g, '').replace(/[^가-힣0-9]/g, '');
  const cut = (x) => x.split(/\n|(?<=[.?!])\s+/).map((y) => y.trim()).filter((y) => y.length > 10);
  B.TEMPLATES.forEach((t) => {
    const groups = [];
    (t.open || []).forEach((x) => groups.push(['도입', x]));
    (t.mid || []).forEach((x) => groups.push(['전개', x]));
    ((B.BODIES && B.BODIES[t.id]) || []).forEach((x) => groups.push(['본문', x]));
    for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        if (groups[a][0] === groups[b][0]) continue; /* 같은 칸의 변형끼리는 동시에 안 나온다 */
        const before = new Set(cut(groups[a][1]).map(norm));
        cut(groups[b][1]).forEach((sen) => {
          const n = norm(sen);
          if (n.length > 12 && before.has(n)) {
            errors.push(`${t.id}: ${groups[a][0]}과 ${groups[b][0]}에 같은 문장 — "${sen.slice(0, 30)}…"`);
          }
        });
      }
    }
  });
}

/* ── 같은 문장을 살짝 고쳐 쓴 것도 플레이어에게는 같은 말이다 ── */
{
  const cut = (x) => x.split(/\n|(?<=[.?!])\s+/).map((y) => y.trim()).filter((y) => y.length > 12);
  const toks = (x) => new Set(x.replace(/\{\w+\}/g, '').replace(/[^가-힣0-9 ]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 1));
  const near = (x, y) => {
    const A = toks(x); const C = toks(y);
    if (A.size < 4 || C.size < 4) return 0;
    let n = 0; A.forEach((w) => { if (C.has(w)) n++; });
    return n / Math.min(A.size, C.size);
  };
  B.TEMPLATES.forEach((t) => {
    const groups = [];
    (t.open || []).forEach((x) => groups.push(['도입', x]));
    (t.mid || []).forEach((x) => groups.push(['전개', x]));
    ((B.BODIES && B.BODIES[t.id]) || []).forEach((x) => groups.push(['본문', x]));
    for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        if (groups[a][0] === groups[b][0]) continue;
        cut(groups[a][1]).forEach((s1) => {
          cut(groups[b][1]).forEach((s2) => {
            const v = near(s1, s2);
            if (v >= 0.8) {
              errors.push(`${t.id}: ${groups[a][0]}과 ${groups[b][0]}이 거의 같은 문장 — "${s1.slice(0, 26)}…" / "${s2.slice(0, 26)}…"`);
            }
          });
        });
      }
    }
  });
}

/* ── 인물 묘사 치환자를 문법이 안 맞는 자리에 쓰지 않았는지 ──
 *   {trait} 는 "-고" 로 끝나는 연결형이라 명사 앞에 바로 못 온다.
 *   ("한쪽 눈에 안대를 했고 사람입니다" 가 되어 버린다) */
{
  const NOUN_AFTER = /\{trait\}\s*(사람|여자|남자|아이|노인|쪽)/;
  const all = [];
  B.TEMPLATES.forEach((t) => {
    (t.open || []).forEach((x) => all.push([t.id, x]));
    (t.mid || []).forEach((x) => all.push([t.id, x]));
    ((B.BODIES && B.BODIES[t.id]) || []).forEach((x) => all.push([t.id, x]));
  });
  all.forEach(([id, x]) => {
    if (typeof x === 'string' && NOUN_AFTER.test(x)) {
      errors.push(`${id}: "{trait} 명사" 는 말이 안 됩니다 — 관형형 {look} 을 쓰세요`);
    }
  });
}

/* ── 다치는 자리와 지치는 자리를 섞지 않았는지 ──
 *   eff.hp:-1 은 부상 한 칸(세 번이면 죽는다)이고, cost.hp 는 힘을 쓴 값(반 칸)이다.
 *   둘을 한 선택지에 같이 물리면 밭일 한 번에 사람이 죽는다. 실제로 그랬다. */
{
  B.TEMPLATES.forEach((t) => {
    t.choices.forEach((c, i) => {
      const where = `템플릿 ${t.id} 선택지[${i}] "${c.t}"`;
      [['eff', c.eff], ['okEff', c.okEff], ['noEff', c.noEff]].forEach(([k, e]) => {
        if (!e || !c.cost) return;
        if (c.cost.hp && e.hp < 0) errors.push(`${where}: cost.hp 와 ${k}.hp 를 같이 뭅니다 — 한 번에 한 칸 반이 날아갑니다`);
        if (c.cost.mp && e.mp < 0) errors.push(`${where}: cost.mp 와 ${k}.mp 를 같이 뭅니다`);
      });
    });
  });
}

/* ── 화면은 ITEM_MAP 을 보고 이름을 찾는다 ──
 *   B.ITEMS 에만 넣고 ITEM_MAP 등록을 빠뜨리면 선택지 앞에 "pulley" 처럼
 *   영문 id 가 그대로 뜬다. 실제로 그렇게 나왔다. */
{
  const notMapped = B.ITEMS.filter((it) => !B.ITEM_MAP[it.id]);
  notMapped.slice(0, 12).forEach((it) => {
    errors.push(`아이템 "${it.id}" 가 ITEM_MAP 에 없습니다 — 화면에 영문 id 가 그대로 뜹니다`);
  });
  if (notMapped.length > 12) errors.push(`… ITEM_MAP 누락 ${notMapped.length}건`);

  const dupIds = new Map();
  B.ITEMS.forEach((it) => dupIds.set(it.id, (dupIds.get(it.id) || 0) + 1));
  dupIds.forEach((n, id) => { if (n > 1) errors.push(`아이템 id "${id}" 가 ${n}번 정의됨`); });
}

/* ── 플레이어가 읽는 이름에 로마자가 섞이지 않았는지 ──
 *   총 이름이 "Mosin-Nagant" 로 뜨면 이 게임의 목소리가 깨진다. */
{
  const LATIN = /[A-Za-z]/;
  const say = (what, name) => errors.push(`${what} 이름에 로마자가 섞였습니다 — "${name}"`);
  B.ITEMS.forEach((it) => { if (LATIN.test(it.name)) say('아이템', it.name); });
  (B.SKILLS || []).forEach((sk) => { if (LATIN.test(sk.name)) say('능력', sk.name); });
  (B.WORLD.FACTIONS || []).forEach((f) => { if (LATIN.test(f.name)) say('세력', f.name); });
  (B.WORLD.ZONES || []).forEach((z) => { if (LATIN.test(z.name)) say('구역', z.name); });
  Object.keys(B.PLACESETS || {}).forEach((k) => {
    (B.PLACESETS[k] || []).forEach((p) => { if (LATIN.test(p)) say('장소', p); });
  });
  Object.keys(B.GUN_CLASSES || {}).forEach((k) => {
    if (LATIN.test(B.GUN_CLASSES[k])) say('총 분류', B.GUN_CLASSES[k]);
  });
  Object.keys((B.ARCS && B.ARCS.ENDINGS) || {}).forEach((k) => {
    const e = B.ARCS.ENDINGS[k];
    if (e && LATIN.test(e.name)) say('엔딩', e.name);
  });
}

/* ── 총은 분류와 탄종이 다 있어야 총이다 ──
 *   빠지면 "지금 쏠 수 있는 총"에 안 잡히고, 선택지 앞의 「산탄총 · 탄」도 안 켜진다.
 *   실제로 스물넷이 kind:'ammo' 인 채로 굴러다녔다. */
{
  const guns = B.ITEMS.filter((i) => i.kind === 'gun');
  const ammo = B.ITEMS.filter((i) => i.kind === 'ammo');
  const cals = new Set(ammo.map((a) => a.caliber).filter(Boolean));
  guns.forEach((g) => {
    if (!g.gun) errors.push(`총 "${g.name}" 에 분류(gun)가 없습니다`);
    else if (!B.GUN_CLASSES || !B.GUN_CLASSES[g.gun]) errors.push(`총 "${g.name}": 없는 분류 "${g.gun}"`);
    if (!g.caliber) errors.push(`총 "${g.name}" 에 탄종(caliber)이 없습니다`);
    else if (!cals.has(g.caliber)) errors.push(`총 "${g.name}": 탄종 "${g.caliber}" 에 맞는 탄이 하나도 없습니다`);
  });
  ammo.forEach((a) => {
    if (!a.caliber && a.thrown === undefined) errors.push(`탄 "${a.name}" 에 탄종(caliber)이 없습니다`);
  });
  const used = new Set(guns.map((g) => g.caliber));
  cals.forEach((c) => { if (!used.has(c)) warns.push(`탄종 "${c}" 을(를) 쓰는 총이 없습니다`); });
  /* 이름이 총인데 총이 아닌 것 */
  B.ITEMS.forEach((i) => {
    if (i.kind === 'gun') return;
    if (/(산탄총|소총|권총|기관단총|리볼버|엽총|석궁)$/.test(i.name)) {
      errors.push(`"${i.name}" 은(는) 이름은 총인데 kind 가 "${i.kind}" 입니다`);
    }
  });
}

/* ── 조사 표기가 엔진이 아는 형태인지 ──
 *   "(으)로" 처럼 쓰면 치환이 안 돼서 괄호가 그대로 화면에 나온다. */
{
  const OKJOSA = ['은(는)', '는(은)', '이(가)', '가(이)', '을(를)', '를(을)',
                  '과(와)', '와(과)', '아(야)', '야(아)', '이었(였)', '이라(라)',
                  '으로(로)', '로(으로)', '이나(나)', '이란(란)', '이야(야)', '이며(며)'];
  const seen = new Set();
  const scan = (x, where) => {
    if (typeof x !== 'string') return;
    const re = /([가-힣]{1,3})\(([가-힣]{1,3})\)/g;
    let g;
    while ((g = re.exec(x))) {
      const cand = g[1] + '(' + g[2] + ')';
      if (OKJOSA.some((o) => cand.endsWith(o))) continue;
      const key = cand + where;
      if (seen.has(key)) continue;
      seen.add(key);
      errors.push(`${where}: 엔진이 모르는 조사 표기 "${cand}" — 괄호가 화면에 그대로 나옵니다`);
    }
  };
  B.TEMPLATES.forEach((t) => {
    (t.open || []).forEach((x) => scan(x, t.id));
    (t.mid || []).forEach((x) => scan(x, t.id));
    ((B.BODIES && B.BODIES[t.id]) || []).forEach((x) => scan(x, t.id));
    t.choices.forEach((c) => {
      scan(c.t, t.id);
      [].concat(c.res || [], c.ok || [], c.no || []).forEach((x) => scan(x, t.id));
    });
  });
  (B.SPECIALS || []).forEach((sp) => {
    (sp.scenes || []).forEach((sc) => {
      (sc.pages || []).forEach((x) => scan(x, sp.id));
      (sc.choices || []).forEach((c) => {
        scan(c.t, sp.id);
        [].concat(c.res || [], c.ok || [], c.no || []).forEach((x) => scan(x, sp.id));
      });
    });
  });
}

/* ── 장편 이야기 ────────────────────────────── */
{
  const longs = B.LONGS || {};
  Object.keys(longs).forEach((id) => {
    const lg = longs[id];
    if (!lg.name) errors.push(`장편 ${id}: 이름 없음`);
    if (!lg.title) errors.push(`장편 ${id}: 제목 없음`);
    if ((B.SHOP_PRICE || {})[id] === undefined) errors.push(`장편 ${id}: 상점 값이 없음`);
    if (!lg.scenes || lg.scenes.length < 20) errors.push(`장편 ${id}: 장면이 ${(lg.scenes||[]).length}개뿐 — 장편은 스무 장면 이상이어야 합니다`);
    if (!lg.ending || !lg.ending.pages || !lg.ending.pages.length) errors.push(`장편 ${id}: 마무리가 없음`);
    (lg.scenes || []).forEach((sc, i) => {
      const where = `장편 ${lg.name} 장면[${i}]`;
      if (!sc.pages || !sc.pages.length) errors.push(`${where}: 본문 없음`);
      (sc.pages || []).forEach((x) => {
        const left = String(x).match(/\{\w+\}/g);
        if (left) errors.push(`${where}: 치환자가 남아 있음 ${left.join(' ')}`);
      });
      if (!sc.choices || !sc.choices.length) { errors.push(`${where}: 선택지 없음`); return; }
      const free = sc.choices.some((c) => !c.need);
      if (!free) errors.push(`${where}: 조건 없는 선택지가 없어 막힐 수 있음`);
      sc.choices.forEach((c, j) => {
        const w2 = `${where} 선택지[${j}] "${c.t}"`;
        checkNeed(c.need, w2);
        checkCost(c.cost, w2);
        checkEff(c.eff, w2);
        checkEff(c.okEff, w2);
        checkEff(c.noEff, w2);
        [].concat(c.res || [], c.ok || [], c.no || []).forEach((x) => {
          const left = String(x).match(/\{(?!spend\})\w+\}/g);
          if (left) errors.push(`${w2}: 치환자가 남아 있음 ${left.join(' ')}`);
        });
      });
    });
  });
}

/* ── 시작 사연 ──────────────────────────────── */
{
  const P = (B.ARCS && B.ARCS.PROLOGUES) || {};
  Object.keys(P).forEach((k) => {
    (P[k] || []).forEach((sc, i) => {
      const where = `시작 사연 ${k} 장면[${i}]`;
      if (!sc.pages || !sc.pages.length) errors.push(`${where}: 본문 없음`);
      if (!sc.choices || !sc.choices.length) errors.push(`${where}: 선택지 없음`);
      (sc.choices || []).forEach((c, j) => {
        const w2 = `${where} 선택지[${j}] "${c.t}"`;
        checkNeed(c.need, w2); checkCost(c.cost, w2); checkEff(c.eff, w2);
      });
    });
  });
  /* 게임 안에서 사연을 고르는 장면 */
  const PK = B.ARCS && B.ARCS.ORIGIN_PICK;
  if (!PK) errors.push('시작 사연을 고르는 장면(ORIGIN_PICK)이 없습니다');
  else {
    if (!PK.pages || !PK.pages.length) errors.push('사연 고르기: 본문 없음');
    const got = new Set();
    (PK.choices || []).forEach((c, j) => {
      const w2 = `사연 고르기 선택지[${j}] "${c.t}"`;
      checkNeed(c.need, w2); checkCost(c.cost, w2); checkEff(c.eff, w2);
      if (c.need) errors.push(`${w2}: 조건이 붙어 있으면 사연을 못 고를 수 있습니다`);
      const o = c.eff && c.eff.origin;
      if (!o) errors.push(`${w2}: 고를 사연이 지정 안 됨`);
      else if (!P[o]) errors.push(`${w2}: 없는 사연 "${o}"`);
      else got.add(o);
    });
    Object.keys(P).forEach((k) => {
      if (!got.has(k)) errors.push(`사연 고르기: "${k}" 를 고를 수 있는 선택지가 없습니다`);
    });
  }

  const CC = (B.ARCS && B.ARCS.CHAPTERS_COMA) || [];
  CC.forEach((ch) => {
    (ch.scenes || []).forEach((sc, i) => {
      const where = `코마 본편 ${ch.id} 장면[${i}]`;
      (sc.choices || []).forEach((c, j) => {
        const w2 = `${where} 선택지[${j}] "${c.t}"`;
        checkNeed(c.need, w2); checkCost(c.cost, w2); checkEff(c.eff, w2);
      });
    });
  });
}

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

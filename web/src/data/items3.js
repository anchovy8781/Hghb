/* 부산 2033 - 총과 탄약과 던지는 것
 *
 * 총은 맞는 탄이 있어야 총이다. 탄이 없으면 그냥 쇠몽둥이다.
 * kind:'gun'  gun: 분류(ar/dmr/sr/smg/sg/lmg/bow)  caliber: 맞는 탄 종류
 * kind:'ammo' caliber: 탄 종류
 * thrown: 던지는 것. selfHurt 가 있으면 던진 사람도 다친다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  /* ── 탄약 ─────────────────────────────────────── */
  const AMMO = [
    { id: 'a556',  name: '5.56mm 탄',   caliber: '556',  val: 2, note: '제일 흔하고 제일 빨리 없어진다.' },
    { id: 'a762',  name: '7.62mm 탄',   caliber: '762',  val: 2, note: '무겁다. 대신 한 발이 한 발 값을 한다.' },
    { id: 'a9mm',  name: '9mm 탄',      caliber: '9mm',  val: 1, note: '권총과 기관단총이 같이 먹는다.' },
    { id: 'a45',   name: '.45구경 탄',  caliber: '45',   val: 2, note: '느리고 굵다. 가까이서만 값을 한다.' },
    { id: 'a12g',  name: '12게이지 산탄', caliber: '12g', val: 2, note: '한 발에 알이 아홉 개 들어 있다.' },
    { id: 'a300',  name: '.300 매그넘 탄', caliber: '300', val: 3, note: '이 도시에 몇 발이나 남았는지 아무도 모른다.' },
    { id: 'a57',   name: '5.7mm 탄',    caliber: '57',   val: 2, note: '작고 빠르다. 쓰는 총이 딱 하나뿐이다.' },
    { id: 'abolt', name: '석궁 볼트',   caliber: 'bolt', val: 1, note: '주워서 다시 쓸 수 있다. 그게 제일 큰 장점.' }
  ];

  /* ── 총 ───────────────────────────────────────── */
  const GUNS = [
    /* 돌격소총 */
    ['akm', 'AKM', 'ar', '762', 3, '반동이 세고 고장이 안 난다. 이 도시에 제일 많이 남았다.'],
    ['m416', 'M416', 'ar', '556', 3, '부속을 달수록 좋아지는데, 달 부속이 없다.'],
    ['scarl', 'SCAR-L', 'ar', '556', 3, '미군 기지에서 나온 것만 있다.'],
    ['aug', 'AUG', 'ar', '556', 3, '탄창이 뒤에 붙어 있어 좁은 데서 편하다.'],
    ['qbz', 'QBZ', 'ar', '556', 3, '남쪽 배가 실어 온 물건.'],
    ['g36c', 'G36C', 'ar', '556', 3, '손잡이가 손에 잘 붙는다.'],
    ['beryl', 'Beryl M762', 'ar', '762', 3, '무겁고 시끄럽다. 대신 확실하다.'],
    ['ace32', 'ACE32', 'ar', '762', 3, '개머리판이 접힌다. 배낭에 들어간다.'],
    ['groza', 'Groza', 'ar', '762', 3, '짧고 굵다. 골목에서 제일 무섭다.'],
    ['famas', 'FAMAS', 'ar', '556', 3, '연사가 빠른 대신 탄이 순식간에 없어진다.'],
    ['mutant', 'Mk47 Mutant', 'ar', '762', 3, '점사만 된다. 그게 오히려 탄을 아껴 준다.'],
    /* 지정사수 소총 */
    ['mini14', 'Mini14', 'dmr', '556', 3, '가볍고 조용하다. 새 잡는 데도 쓴다.'],
    ['sks', 'SKS', 'dmr', '762', 3, '오래된 총인데 아직도 잘 나간다.'],
    ['slr', 'SLR', 'dmr', '762', 3, '반동이 어깨를 친다. 두 발째가 어렵다.'],
    ['qbu', 'QBU', 'dmr', '556', 3, '엎드려 쏘라고 만든 총.'],
    ['mk12', 'Mk12', 'dmr', '556', 3, '조준경이 아직 김이 안 서렸다.'],
    ['mk14', 'Mk14', 'dmr', '762', 3, '이 총 한 자루가 마을 하나 값이다.'],
    ['dragunov', 'Dragunov', 'dmr', '762', 3, '이십 년 전 것인데 방아쇠가 새것 같다.'],
    ['svd', 'SVD', 'dmr', '762', 3, '드라구노프와 같은 총이라고들 하는데, 다들 따로 부른다.'],
    ['vss', 'VSS', 'dmr', '9mm', 3, '소리가 거의 안 난다. 그래서 값이 두 배다.'],
    /* 저격소총 */
    ['kar98k', 'Kar98k', 'sr', '762', 3, '한 발 쏘고 손으로 밀어야 한다. 그 사이가 길다.'],
    ['m24', 'M24', 'sr', '762', 3, '군용. 총열에 번호가 남아 있다.'],
    ['awm', 'AWM', 'sr', '300', 3, '이 도시에 세 자루 있다는 소문이 있다.'],
    ['mosin', 'Mosin-Nagant', 'sr', '762', 3, '백 년 된 설계인데 아직 사람을 죽인다.'],
    ['win94', 'Win94', 'sr', '45', 2, '서부영화에 나오던 그 총. 진짜로 나간다.'],
    /* 기관단총 */
    ['ump45', 'UMP45', 'smg', '45', 2, '가깝고 좁은 데서 제일 낫다.'],
    ['vector', 'Vector', 'smg', '45', 2, '탄이 순식간에 빈다. 정말 순식간이다.'],
    ['mp5k', 'MP5K', 'smg', '9mm', 2, '외투 안에 들어간다.'],
    ['ump9', 'UMP9', 'smg', '9mm', 2, '반동이 순하다. 처음 총 잡는 사람에게 준다.'],
    ['bizon', 'PP-19 Bizon', 'smg', '9mm', 2, '탄창이 원통이라 예순 발이 들어간다.'],
    ['mp9', 'MP9', 'smg', '9mm', 2, '작고 가볍다. 총 같지가 않다.'],
    ['tommy', 'Tommy Gun', 'smg', '45', 2, '들면 어깨가 저절로 펴진다.'],
    ['p90', 'P90', 'smg', '57', 2, '탄이 위에 얹혀 있다. 쓰는 탄이 딱 하나뿐이라 굶기 쉽다.'],
    ['mp5', 'MP5', 'smg', '9mm', 2, '이 도시 자경단이 제일 좋아하는 총.'],
    /* 산탄총 */
    ['s1897', 'S1897', 'sg', '12g', 3, '펌프를 당기는 소리만으로 사람이 물러선다.'],
    ['s686', 'S686', 'sg', '12g', 3, '두 발. 두 발이면 대개 끝난다.'],
    ['s12k', 'S12K', 'sg', '12g', 3, '반자동. 대신 자주 걸린다.'],
    ['dbs', 'DBS', 'sg', '12g', 3, '무겁다. 들고 뛰면 숨이 먼저 간다.'],
    ['o12', 'O12', 'sg', '12g', 3, '연사가 되는 산탄총. 탄 걱정을 두 배로 한다.'],
    ['ns2000', 'NS2000', 'sg', '12g', 3, '엽우회 사람들이 제일 많이 쓴다.'],
    /* 기관총 */
    ['dp28', 'DP-28', 'lmg', '762', 3, '위에 접시가 달렸다. 쏘면 팔이 저린다.'],
    ['m249', 'M249', 'lmg', '556', 3, '탄띠가 있어야 총이다. 탄띠가 제일 귀하다.'],
    ['mg3', 'MG3', 'lmg', '762', 3, '소리가 톱질하는 소리 같다.'],
    ['pkm', 'PKM', 'lmg', '762', 3, '둘이서 들어야 제대로 쓴다.'],
    ['qbb95', 'QBB95', 'lmg', '556', 3, '가벼운 기관총. 그래도 무겁다.'],
    ['rpd', 'RPD', 'lmg', '762', 3, '탄띠를 통에 감아 넣는다.'],
    /* 활 */
    ['crossbow', '석궁', 'bow', 'bolt', 2, '소리가 안 난다. 볼트를 도로 뽑아 쓸 수 있다.']
  ];

  /* ── 근접무기 · 던지는 것 ─────────────────────── */
  const MELEE = [
    { id: 'machete', name: '마체테', kind: 'part', val: 2, melee: 2, note: '풀도 베고 문도 딴다. 사람은 안 벨수록 좋다.' },
    { id: 'milde',   name: '밀대',   kind: 'part', val: 1, melee: 1, note: '자루가 길다. 그것만으로 반쯤 이긴다.' },
    { id: 'sledge2', name: '쇠지레', kind: 'part', val: 1, melee: 1, note: '무기라기보다 연장인데, 이 도시에서는 둘이 같다.' }
  ];

  const THROWN = [
    { id: 'grenade', name: '수류탄',  kind: 'part', val: 3, thrown: 3,
      note: '레버를 놓고 넷을 센다. 셋에 던지는 사람도 있다.' },
    { id: 'smoke',   name: '연막탄',  kind: 'part', val: 2, thrown: 0,
      note: '아무도 안 다치는데 판이 통째로 바뀐다.' },
    { id: 'molotov2', name: '화염병', kind: 'part', val: 1, thrown: 2,
      note: '병과 천과 기름. 이 도시에 다 있다.' },
    { id: 'flashbang2', name: '섬광탄', kind: 'part', val: 2, thrown: 1,
      note: '눈과 귀를 삼십 초 가져간다. 죽이지는 않는다.' },
    { id: 'whitephos', name: '백린탄', kind: 'part', val: 3, thrown: 4, selfHurt: 1, rare: true,
      note: '쓰면 안 되는 것이다. 던진 사람도 성하지 못한다. 그런데도 누가 만들어 놨다.' }
  ];

  /* ── 색인에 얹는다 ────────────────────────────── */
  const ADD = [];
  AMMO.forEach(function (a) {
    ADD.push({ id: a.id, name: a.name, kind: 'ammo', val: a.val, caliber: a.caliber, note: a.note });
  });
  GUNS.forEach(function (g) {
    ADD.push({ id: g[0], name: g[1], kind: 'gun', gun: g[2], caliber: g[3], val: g[4], note: g[5] });
  });
  MELEE.forEach(function (m) { ADD.push(m); });
  THROWN.forEach(function (t) { ADD.push(t); });

  B.GUN_CLASSES = {
    ar: '돌격소총', dmr: '지정사수소총', sr: '저격소총',
    smg: '기관단총', sg: '산탄총', lmg: '기관총', bow: '석궁'
  };

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });
})(typeof window !== 'undefined' ? window : globalThis);

/* 부산 2033 - 아이템 (7) 탄을 다시 채우는 일, 그리고 남은 자리들 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 탄과 총 손질 ────────────────────────── */
    { id: 'reloadkit', name: '재장전 도구', kind: 'part', val: 3, note: '탄피를 주워 다시 채운다. 이 도시에서 탄을 만드는 유일한 방법.' },
    { id: 'brasscase', name: '빈 탄피 한 줌', kind: 'part', val: 1, note: '주우면 값이 된다. 그래서 총싸움 뒤에 사람이 몰린다.' },
    { id: 'powderjar', name: '흑색화약 단지', kind: 'part', val: 3, note: '눅으면 못 쓴다. 마른 데 둬야 한다.' },
    { id: 'leadball', name: '납 구슬 주머니', kind: 'part', val: 2, note: '녹여서 다시 굳히면 몇 번이고 쓴다.' },
    { id: 'gunoil', name: '총기용 기름', kind: 'part', val: 2, note: '한 방울이면 된다. 많이 치면 오히려 걸린다.' },
    { id: 'cleanrod', name: '꼬질대', kind: 'part', val: 1, note: '총열 안을 밀어 낸다. 이걸 안 하면 총이 먼저 죽는다.' },
    { id: 'scopeold', name: '금 간 조준경', kind: 'part', val: 2, note: '가운데는 아직 맑다. 가장자리는 포기했다.' },
    { id: 'a12g3', name: '소금 산탄', kind: 'ammo', val: 1, caliber: '12g', note: '쇠구슬 대신 굵은소금. 안 죽이고 쫓는 데 쓴다.' },
    { id: 'astone2', name: '쇠 구슬', kind: 'ammo', val: 1, caliber: 'stone', note: '조약돌보다 무겁고 멀리 간다.' },
    { id: 'abolt2', name: '깎아 만든 볼트', kind: 'ammo', val: 1, caliber: 'bolt', note: '깃을 새 깃털로 붙였다.' },
    { id: 'a762b', name: '수제 7.62밀리 탄', kind: 'ammo', val: 1, caliber: '762', note: '열 발에 한 발은 안 나간다. 그 한 발이 언제일지는 모른다.' },
    { id: 'a556b', name: '수제 5.56밀리 탄', kind: 'ammo', val: 1, caliber: '556', note: '탄피를 세 번까지 다시 쓴다. 네 번째는 갈라진다.' },

    /* ── 먹을 것 ─────────────────────────────── */
    { id: 'bindaetteok', name: '빈대떡', kind: 'food', val: 1, hp: 1, mp: 1, note: '기름 냄새가 골목을 채운다.' },
    { id: 'ssambap', name: '쌈밥 한 덩이', kind: 'food', val: 1, hp: 1, note: '잎에 싸면 손이 안 더러워진다.' },
    { id: 'jangajji', name: '장아찌 한 통', kind: 'food', val: 2, hp: 1, note: '짜고 오래간다. 항아리 있는 집에만 있다.' },
    { id: 'siraegi', name: '말린 시래기', kind: 'food', val: 1, hp: 1, note: '버리던 것을 말려 두면 겨울에 국이 된다.' },
    { id: 'dotorimuk', name: '도토리묵', kind: 'food', val: 1, hp: 1, note: '떫은 것을 여러 번 우려야 먹을 수 있다.' },
    { id: 'gamjatang', name: '뼈다귀 한 솥', kind: 'food', val: 3, hp: 2, mp: 1, note: '여럿이 둘러앉게 만드는 음식.' },
    { id: 'yakgwa', name: '약과', kind: 'food', val: 2, hp: 1, mp: 2, note: '제사에 올리던 것. 지금은 아이 몫이다.' },
    { id: 'sikhye', name: '식혜 한 병', kind: 'water', val: 2, hp: 1, mp: 2, note: '단맛이 나는 물. 그 자체로 잔치다.' },

    /* ── 살림 ────────────────────────────────── */
    { id: 'strawmat', name: '멍석', kind: 'part', val: 1, note: '깔면 바닥이 되고 덮으면 지붕이 된다.' },
    { id: 'firetong', name: '부젓가락', kind: 'part', val: 1, note: '숯을 옮기는 데 쓴다. 없으면 손을 쓴다.' },
    { id: 'gourdladle', name: '바가지', kind: 'part', val: 1, note: '박을 말려 만든다. 깨져도 다시 만든다.' },
    { id: 'sieve', name: '체', kind: 'part', val: 1, note: '가루를 치고 물을 거른다. 두 가지에 다 쓴다.' },
    { id: 'jarlid', name: '항아리 뚜껑', kind: 'part', val: 1, note: '뚜껑이 없으면 항아리는 그냥 통이다.' },
    { id: 'winnower', name: '키', kind: 'part', val: 1, note: '까부르면 껍질이 날아간다. 바람 부는 날에만 된다.' },
    { id: 'inkbrush2', name: '몽당붓', kind: 'part', val: 1, note: '반쯤 닳았다. 그래도 획은 나온다.' },
    { id: 'lanterncan', name: '깡통 등', kind: 'part', val: 1, note: '구멍을 뚫어 만든다. 빛이 점점이 샌다.' },
    { id: 'sleddog', name: '끌개', kind: 'part', val: 2, note: '개에게 매면 짐이 두 배로 간다.' },
    { id: 'waterjug', name: '물지게', kind: 'part', val: 2, note: '어깨가 아니라 등으로 진다. 그래야 계단을 오른다.' },

    /* ── 종이와 값나가는 것 ──────────────────── */
    { id: 'gunledger', name: '총포 장부', kind: 'doc', val: 3, key: true, note: '누가 무슨 총을 들고 있는지가 적혀 있다.' },
    { id: 'shootbadge', name: '사격 대회 표', kind: 'key', val: 2, key: true, note: '깡통 열둘 중 아홉. 그 숫자가 새겨져 있다.' },
    { id: 'ricepaper2', name: '두꺼운 장지', kind: 'doc', val: 2, note: '창에 바르면 바람이 안 들고 빛은 든다.' },
    { id: 'oldcalendar', name: '이십 년 전 달력', kind: 'doc', val: 1, key: true, note: '8월에서 멈췄다. 그 뒤 장은 안 넘겨졌다.' },
    { id: 'tinwhistle', name: '양철 피리', kind: 'lux', val: 1, mp: 1, note: '한 옥타브밖에 안 난다. 그거면 대개 충분하다.' },
    { id: 'braziercoal', name: '숯 한 자루', kind: 'part', val: 2, note: '연기가 안 나서 실내에서 쓴다. 대신 조심해야 한다.' },
    { id: 'pearlbutton', name: '자개 단추', kind: 'lux', val: 1, note: '빛에 따라 색이 돈다. 그거 하나로 값이 붙는다.' },
    { id: 'brassbowl', name: '놋그릇', kind: 'lux', val: 2, note: '무겁고 안 삭는다. 시집올 때 가져오던 것.' },
    { id: 'papermoney', name: '빳빳한 지폐 뭉치', kind: 'junk', val: 0, key: true, note: '한 장도 안 접혔다. 그래서 더 쓸모가 없다.' },
    { id: 'medalshoot', name: '사격 우승 메달', kind: 'junk', val: 1, key: true, note: '뒷면에 이름이 있다. 이 도시 사람은 아니다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

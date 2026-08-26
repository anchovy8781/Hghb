/* 부산 2033 - 가젯 확장 (4) 살림살이와 장비
 *
 * 씻는 것, 고치는 것, 기르는 것, 심는 것, 그리고 컴퓨터 부품 일곱 가지.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  const MORE = [
    /* ── 총 관련 상태 ─────────────────────────── */
    { id: 'brokengun', name: '망가진 총', kind: 'junk', val: 1, tag: 'metal',
      note: '공이가 부러졌다. 부품으로는 쓸 수 있다.' },
    { id: 'gunjam',    name: '탄 걸림',   kind: 'mood', val: 0, bad: true,
      note: '약실에 탄이 물렸다. 손볼 자리가 있어야 뺀다.' },

    /* ── 살림 ─────────────────────────────────── */
    { id: 'canopener', name: '캔따개',   kind: 'part', val: 2, note: '이게 없으면 통조림은 그냥 쇳덩이다.' },
    { id: 'washkit',   name: '세안도구', kind: 'part', val: 1, note: '비누 한 조각과 수건. 얼굴을 씻으면 사람 취급을 받는다.' },
    { id: 'toothpaste2', name: '치약',   kind: 'part', val: 1, note: '한 통이면 반년을 쓴다. 상처 소독에도 쓴다는 말이 있다.' },
    { id: 'toothbrush', name: '칫솔',    kind: 'part', val: 1, note: '이십 년 지나도 이는 계속 난다.' },
    { id: 'cuffs',     name: '쇠고랑',   kind: 'part', val: 2, note: '열쇠는 없다. 채우는 데는 문제가 없다.' },
    { id: 'chain',     name: '쇠사슬',   kind: 'part', val: 2, tag: 'metal', note: '문을 걸거나, 끌거나, 묶거나.' },
    { id: 'cosmetics', name: '화장품',   kind: 'lux', val: 2, note: '이십 년 지난 것인데도 값이 있다. 얼굴이 값인 자리가 있어서.' },
    { id: 'handmirror', name: '휴대용 거울', kind: 'part', val: 1, note: '신호를 보내는 데도 쓰고, 모퉁이를 보는 데도 쓴다.' },
    { id: 'fuelcan',   name: '석유통',   kind: 'part', val: 3, note: '반쯤 찼다. 이 도시에서 기름은 물보다 귀할 때가 있다.' },
    { id: 'comb',      name: '빗',       kind: 'part', val: 1 },
    { id: 'patch',     name: '파스',     kind: 'med', val: 1, hp: 1, cures: 'pain' },
    { id: 'fork',      name: '포크',     kind: 'part', val: 1 },
    { id: 'slippers',  name: '슬리퍼',   kind: 'part', val: 1, note: '오래 걸을 수는 없지만, 안에서는 이게 낫다.' },
    { id: 'towel',     name: '수건',     kind: 'part', val: 1, tag: 'cloth' },
    { id: 'tumbler',   name: '텀블러',   kind: 'part', val: 2, note: '뚜껑이 성하다. 이 도시에서 새지 않는 통은 값이 나간다.' },
    { id: 'piggybank', name: '누군가의 저금통', kind: 'lux', val: 2, note: '흔들면 소리가 난다. 깨야 열린다.' },
    { id: 'blanket',   name: '담요',     kind: 'part', val: 2, tag: 'cloth', hp: 1 },
    { id: 'toolbag',   name: '공구가방', kind: 'part', val: 3, note: '없는 게 없다. 무거운 게 유일한 흠이다.' },
    { id: 'bouquet',   name: '꽃다발',   kind: 'lux', val: 2, mp: 1, note: '이 도시에서 꽃을 들고 다니는 사람은 둘 중 하나다. 결혼식에 가거나, 장례식에 가거나.' },
    { id: 'hairdryer', name: '드라이기', kind: 'part', val: 2, note: '전기가 있으면 젖은 것을 말린다. 겨울에 목숨을 살린다.' },
    { id: 'charger',   name: '충전기',   kind: 'part', val: 2 },
    { id: 'powerbank', name: '보조배터리', kind: 'part', val: 3, note: '아직 반이 차 있다. 이십 년 동안 아무도 안 썼다는 뜻이다.' },
    { id: 'puzzle',    name: '퍼즐',     kind: 'lux', val: 1, mp: 1, note: '조각 하나가 없다. 그래도 다들 끝까지 맞춰 본다.' },
    { id: 'glasses',   name: '안경',     kind: 'part', val: 2, note: '도수가 안 맞아도 없는 것보다는 낫다는 사람이 있다.' },
    { id: 'sunglasses', name: '선글라스', kind: 'lux', val: 2 },
    { id: 'ring',      name: '반지',     kind: 'lux', val: 3, note: '안쪽에 날짜가 새겨져 있다.' },
    { id: 'watch',     name: '손목시계', kind: 'lux', val: 3, note: '태엽식이다. 감으면 간다. 이 도시에서 시간을 아는 사람은 몇 없다.' },
    { id: 'powerstrip', name: '멀티탭',  kind: 'part', val: 2 },
    { id: 'scale',     name: '체중계',   kind: 'part', val: 1, note: '올라서면 이십 년 전보다 얼마나 줄었는지 알 수 있다.' },
    { id: 'fan',       name: '선풍기',   kind: 'part', val: 2 },
    { id: 'condenser', name: '에어컨 실외기', kind: 'part', val: 3, note: '통째로는 못 옮긴다. 안에 든 구리가 값이다.' },
    { id: 'handcream', name: '핸드크림', kind: 'lux', val: 1, mp: 1, note: '갈라진 손에 바르면 그날 밤 잠이 온다.' },

    /* ── 먹을 것 ──────────────────────────────── */
    { id: 'kimchi2',   name: '김치',     kind: 'food', val: 2, hp: 1, note: '언제 담근 것인지 아무도 모른다. 그래도 김치다.' },
    { id: 'honey',     name: '벌꿀',     kind: 'food', val: 3, hp: 1, mp: 1, note: '안 상한다. 이십 년이 지나도 꿀은 꿀이다.' },
    { id: 'insamju',   name: '인삼주',   kind: 'lux', val: 3, mp: 1, hp: 1 },

    /* ── 약 ───────────────────────────────────── */
    { id: 'digestive', name: '소화제',   kind: 'med', val: 1, hp: 1, cures: 'poison' },
    { id: 'strongpain', name: '고급 진통제', kind: 'med', val: 2, hp: 1, mp: 1, cures: 'headache',
      note: '이십 년 전 병원에서 쓰던 것. 한 알이면 하루가 통째로 돌아온다.' },
    { id: 'adrenaline', name: '아드레날린', kind: 'med', val: 3, hp: 1, revive: 2,
      note: '심장에 직접. 쓰고 나면 손이 삼십 분 떨린다.' },
    { id: 'capsaicin', name: '캡사이신', kind: 'part', val: 2, note: '눈에 맞으면 삼십 분은 아무것도 못 한다.' },
    { id: 'dentpliers', name: '치과용 집게', kind: 'part', val: 2, note: '이를 뽑는 데도, 박힌 것을 빼는 데도 쓴다.' },
    { id: 'scalpel',   name: '메스',     kind: 'part', val: 2, note: '아직 날이 살아 있다.' },

    /* ── 기계 · 전자 ──────────────────────────── */
    { id: 'laptop',    name: '노트북',   kind: 'part', val: 3, note: '전원이 들어오면 이십 년 전 누군가의 바탕화면이 뜬다.' },
    { id: 'gpu',       name: '고성능 그래픽카드', kind: 'part', val: 3, set: 'pc', note: '팬에 먼지가 굳어 있다. 안쪽은 멀쩡하다.' },
    { id: 'cpu',       name: '고성능 CPU', kind: 'part', val: 3, set: 'pc', note: '핀이 하나도 안 휘었다.' },
    { id: 'ram',       name: '고성능 메모리', kind: 'part', val: 3, set: 'pc' },
    { id: 'cooler',    name: '고성능 쿨러', kind: 'part', val: 2, set: 'pc' },
    { id: 'monitor',   name: '고성능 모니터', kind: 'part', val: 3, set: 'pc', note: '금이 안 갔다. 이게 제일 드물다.' },
    { id: 'keyboard',  name: '키보드',   kind: 'part', val: 2, set: 'pc', note: '키캡 두 개가 없다. ㄱ 과 ㅎ.' },
    { id: 'mouse',     name: '마우스',   kind: 'part', val: 2, set: 'pc' },
    { id: 'wifi',      name: '휴대용 와이파이 공유기', kind: 'part', val: 2, note: '켜면 아직 이름을 뿌린다. 아무도 안 붙는다.' },
    { id: 'usb',       name: 'USB',      kind: 'doc', val: 2, note: '안에 뭐가 들었는지는 읽을 데가 있어야 안다.' },
    { id: 'rccar',     name: 'RC카',     kind: 'lux', val: 2, mp: 1, note: '건전지만 있으면 아직 달린다.' },
    { id: 'drone',     name: '드론',     kind: 'part', val: 3, note: '날리면 이 도시가 어떻게 생겼는지 위에서 볼 수 있다.' },
    { id: 'empnade2',  name: '전자기 펄스 수류탄', kind: 'part', val: 3, thrown: 0,
      note: '사람은 안 다친다. 대신 이 골목 기계가 전부 죽는다.' },

    /* ── 탈것 · 연장 ──────────────────────────── */
    { id: 'bicycle',   name: '자전거',   kind: 'part', val: 3, note: '체인이 늘어졌지만 굴러간다. 이 도시가 반으로 줄어든다.' },
    { id: 'biketools', name: '자전거 수리도구', kind: 'part', val: 2 },
    { id: 'motorbike2', name: '오토바이', kind: 'part', val: 3, note: '기름만 있으면. 늘 그 기름이 문제다.' },
    { id: 'boomerang', name: '부메랑',   kind: 'part', val: 1, note: '돌아온다. 정말로 돌아온다. 그게 유일한 장점이다.' },
    { id: 'minepass',  name: '광산 출입증', kind: 'key', val: 2, note: '기장 폐광. 아직 들어갈 수 있는 사람이 몇 없다.' },
    { id: 'gympass',   name: '헬스장 한 달 이용권', kind: 'doc', val: 1,
      note: '유효기간이 이십 년 전에 끝났다. 그런데도 안 버리는 사람이 있다.' },

    /* ── 기르는 것 ────────────────────────────── */
    { id: 'compost',   name: '퇴비',     kind: 'part', val: 2, note: '냄새가 값이다. 이 도시에서 흙을 살리는 유일한 방법.' },
    { id: 'seeds',     name: '곡물 씨앗', kind: 'food', val: 3, note: '먹으면 한 끼, 심으면 한 계절.' },
    { id: 'dogchew',   name: '개껌',     kind: 'food', val: 1, note: '사람도 씹을 수는 있다. 권하지는 않는다.' },
    { id: 'leash',     name: '개 목줄',  kind: 'part', val: 1, note: '이름표 자리가 비어 있다.' },
    { id: 'pettoy',    name: '동물용 완구', kind: 'lux', val: 1, note: '삑삑 소리가 난다. 이 도시에서 그 소리는 아주 멀리 간다.' },

    /* ── 종이와 붓 ────────────────────────────── */
    { id: 'hanji',     name: '한지',     kind: 'doc', val: 2, tag: 'paper' },
    { id: 'brush',     name: '붓',       kind: 'part', val: 1 },
    { id: 'ink',       name: '먹',       kind: 'part', val: 1 },
    { id: 'greenbook', name: '신재생에너지 가이드북', kind: 'doc', val: 3,
      note: '태양광, 풍력, 소수력. 그림이 정확해서 이 책만 있으면 마을 하나가 밝아진다.' }
  ];

  MORE.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

  /* 컴퓨터 부품 일곱 가지 — 다 모으면 특별 이야기가 열린다 */
  B.PC_SET = ['gpu', 'cpu', 'ram', 'cooler', 'monitor', 'keyboard', 'mouse'];
})(typeof window !== 'undefined' ? window : globalThis);

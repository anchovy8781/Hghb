/* 부산 2033 - 아이템 (6) 겨울, 그리고 아직 이름이 붙어 있는 것들 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 탄 ──────────────────────────────────── */
    { id: 'astone', name: '매끈한 조약돌', kind: 'ammo', val: 1, caliber: 'stone',
      note: '새총에 물린다. 강가에 얼마든지 있다.' },
    { id: 'a12g2', name: '재장전한 산탄', kind: 'ammo', val: 1, caliber: '12g',
      note: '탄피에 화약과 쇠구슬을 다시 채웠다. 가끔 안 나간다.' },
    { id: 'a45b', name: '손으로 만 .45구경 탄', kind: 'ammo', val: 1, caliber: '45',
      note: '탄두가 좀 비뚤다. 그래도 나간다.' },
    { id: 'a9mm2', name: '재생 9밀리 탄', kind: 'ammo', val: 1, caliber: '9mm',
      note: '탄피를 주워 다시 채운 것. 이 도시의 탄은 대개 이렇다.' },
    { id: 'a300b', name: '.300 매그넘 수제탄', kind: 'ammo', val: 2, caliber: '300',
      note: '만들 줄 아는 사람이 이 도시에 둘이다.' },

    /* ── 걸치는 것 ───────────────────────────── */
    { id: 'furhat', name: '털모자', kind: 'part', val: 2, warm: true, note: '머리로 빠져나가는 열이 절반이다.' },
    { id: 'wooljumper', name: '털 스웨터', kind: 'part', val: 2, warm: true, note: '구멍이 셋 났는데 아직 따뜻하다.' },
    { id: 'legwarm', name: '각반', kind: 'part', val: 1, warm: true, note: '무릎 아래가 얼면 걸음이 먼저 죽는다.' },
    { id: 'ridingcoat', name: '군용 방한외투', kind: 'part', val: 3, armor: 1, warm: true, broken: 'ridingtorn',
      note: '안감에 이름표가 남아 있다. 한 번은 대신 맞아 준다.' },
    { id: 'ridingtorn', name: '찢어진 방한외투', kind: 'part', val: 1, warm: true,
      note: '안감이 다 나갔다. 그래도 바람은 막는다.' },
    { id: 'vestplate', name: '철판 조끼', kind: 'part', val: 3, armor: 1, broken: 'vestbent',
      note: '판을 덧대 만들었다. 무겁고, 한 번은 막아 준다.' },
    { id: 'vestbent', name: '휘어진 철판 조끼', kind: 'part', val: 1, note: '한가운데가 움푹 들어갔다. 그 자리가 사람 대신 들어갔다.' },
    { id: 'thickglove', name: '두꺼운 장갑', kind: 'part', val: 1, warm: true, note: '손가락이 얼면 총도 못 잡는다.' },
    { id: 'facecloth', name: '얼굴 가리개', kind: 'part', val: 1, warm: true, note: '재도 막고 바람도 막고 얼굴도 가린다.' },

    /* ── 먹을 것 ─────────────────────────────── */
    { id: 'gukbapbowl', name: '국밥 한 그릇', kind: 'food', val: 2, hp: 2, mp: 1, note: '뜨겁고 짜다. 그거면 된다.' },
    { id: 'ricecake', name: '가래떡', kind: 'food', val: 1, hp: 1, note: '굳으면 구워 먹는다.' },
    { id: 'gangjeong', name: '유과', kind: 'food', val: 1, hp: 1, mp: 1, note: '단것은 이 도시에서 약에 가깝다.' },
    { id: 'winterkimchi', name: '김장 김치', kind: 'food', val: 2, hp: 1, note: '항아리가 있으면 겨울을 난다.' },
    { id: 'friedeomuk', name: '어묵 국물', kind: 'water', val: 1, hp: 1, mp: 1, note: '국물은 공짜다. 그 규칙만은 안 변했다.' },
    { id: 'roastsweet', name: '군고구마', kind: 'food', val: 1, hp: 1, mp: 1, note: '주머니에 넣으면 손난로가 된다.' },
    { id: 'saltedegg', name: '소금에 절인 알', kind: 'food', val: 1, hp: 1, note: '갈매기 알이다. 반만 가져온 것이다.' },
    { id: 'wintersoup', name: '뼈 우린 국물', kind: 'water', val: 2, hp: 2, note: '사흘을 끓였다. 사흘 값을 한다.' },

    /* ── 손과 살림 ───────────────────────────── */
    { id: 'stovepipe', name: '함석 연통', kind: 'part', val: 2, note: '이음매가 맞아야 한다. 안 맞으면 사람이 잔다.' },
    { id: 'drumstove', name: '드럼통 난로', kind: 'part', val: 3, note: '드럼통 하나와 함석 몇 장. 그게 전부다.' },
    { id: 'icesaw', name: '얼음 톱', kind: 'part', val: 2, note: '가장자리부터 안쪽으로. 반대로 하면 갇힌다.' },
    { id: 'sawdust', name: '톱밥 자루', kind: 'part', val: 1, note: '얼음을 여름까지 살린다.' },
    { id: 'cottonbow', name: '솜 트는 활', kind: 'part', val: 2, note: '손목만 쓴다. 어깨를 쓰면 하루도 못 한다.' },
    { id: 'washstick', name: '빨래방망이', kind: 'part', val: 1, note: '소리가 골목을 채운다. 오래된 소리다.' },
    { id: 'flatiron', name: '숯다리미', kind: 'part', val: 2, note: '안에 숯을 넣는다. 뜨거우면 되는 것이다.' },
    { id: 'lensbox', name: '렌즈 상자', kind: 'part', val: 3, note: '스무 개쯤 들었다. 하나가 사람 하나 눈이다.' },
    { id: 'newsglue', name: '풀 통', kind: 'part', val: 1, note: '쌀을 끓여 만든다. 붙이면 잘 안 떨어진다.' },
    { id: 'bloodkit', name: '수혈 도구', kind: 'med', val: 3, hp: 1, key: true, note: '바늘 둘과 관 하나. 이 도시에서 제일 아까운 바늘이다.' },
    { id: 'sugarwater', name: '설탕물 한 병', kind: 'water', val: 1, hp: 1, mp: 1, note: '피를 준 사람에게 제일 먼저 주는 것.' },

    /* ── 종이와 기록 ─────────────────────────── */
    { id: 'newspaper', name: '손으로 쓴 신문', kind: 'doc', val: 2, note: '길, 물, 배급, 없어진 사람, 찾는 사람, 그리고 값.' },
    { id: 'bloodlist', name: '혈액형 명단', kind: 'doc', val: 3, key: true, note: '이름 옆에 형과 사는 자리가 적혀 있다.' },
    { id: 'coatbox', name: '겨울옷 상자표', kind: 'doc', val: 1, key: true, note: '가을에 하나씩 꺼내 입는다. 그게 이 동네 규칙이다.' },
    { id: 'pawnticket', name: '전당표', kind: 'doc', val: 1, key: true, note: '석 달. 못 갚으면 벽에 걸린다.' },
    { id: 'icetoken', name: '얼음 창고 번호표', kind: 'key', val: 1, key: true, note: '팔월까지는 안 상한다.' },
    { id: 'watchkey', name: '시계 태엽 열쇠', kind: 'key', val: 1, key: true, note: '하루에 한 번 감는다. 그 한 번이 습관이 된다.' },

    /* ── 값나가는 것과 잡동사니 ──────────────── */
    { id: 'brasslamp', name: '놋쇠 등잔', kind: 'lux', val: 2, mp: 1, note: '기름을 아주 조금 먹는다.' },
    { id: 'silkscarf', name: '명주 목도리', kind: 'lux', val: 2, mp: 1, warm: true, note: '색이 있는 것은 이 도시에서 눈에 띈다.' },
    { id: 'harmonica', name: '하모니카', kind: 'lux', val: 2, mp: 2, note: '주머니에 들어가는 유일한 악기.' },
    { id: 'inkstone', name: '벼루', kind: 'lux', val: 2, note: '먹을 갈면 손이 느려지고 생각이 정리된다.' },
    { id: 'snowglobe', name: '눈사람 유리구슬', kind: 'junk', val: 0, key: true, note: '흔들면 아직 눈이 내린다.' },
    { id: 'coatbutton', name: '외투 단추 한 줌', kind: 'junk', val: 0, key: true, note: '다 다른 옷에서 나왔다.' },
    { id: 'thermosold', name: '찌그러진 보온병', kind: 'junk', val: 1, note: '아직 반나절은 따뜻하다.' },
    { id: 'kidsglove', name: '한 짝뿐인 아이 장갑', kind: 'junk', val: 0, key: true, note: '나머지 한 짝은 어디 있을까.' },
    { id: 'schoolbell', name: '학교 종', kind: 'junk', val: 1, key: true, note: '이십 년 동안 아무도 안 쳤다.' },
    { id: 'ricebag', name: '빈 쌀 포대', kind: 'part', val: 1, note: '자루로도 쓰고 이불로도 쓴다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

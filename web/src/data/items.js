/* 부산 2033 - 가젯(능력 + 아이템 + 상태)
 *
 * 원작 <서울 2033> 방식: 능력과 아이템을 "가젯" 하나로 묶어 다룬다.
 * 선택지 앞에 필요한 가젯이 붙고, 가지고 있으면 초록 / 없으면 빨강으로 보인다.
 * 감정(로망, 유머, 두통, 우울함)도 아이템처럼 소지된다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  /* ── 능력(레벨 1~3) ─────────────────────────────── */
  const SKILLS = [
    { id: 'talk',  name: '교섭',    note: '말로 여는 문이 제일 싸게 먹힌다.' },
    { id: 'force', name: '완력',    note: '어떤 자물쇠는 설득되지 않는다.' },
    { id: 'shoot', name: '사격술',  note: '방아쇠를 당기는 손이 떨리지 않는다.' },
    { id: 'tech',  name: '기계공학', note: '전기와 배관은 아직 세상을 움직인다.' },
    { id: 'medic', name: '의술',    note: '피를 멈출 줄 아는 사람은 어디서나 귀하다.' },
    { id: 'sneak', name: '은신술',  note: '보이지 않는 사람은 죽지 않는다.' },
    { id: 'lie',   name: '거짓말',  note: '진실은 비싸고, 거짓말은 즉시 쓸 수 있다.' },
    { id: 'sea',   name: '항해술',  note: '부산에서 바다를 모르면 절반만 사는 것이다.' },
    { id: 'lock',  name: '자물쇠따기', note: '잠긴 것은 대개 값어치가 있다.' },
    { id: 'read',  name: '독해',    note: '남이 흘린 글자 속에 길이 있다.' },
    { id: 'sense', name: '직감',    note: '털이 곤두서면 이유는 나중에 안다.' }
  ];

  /* ── 아이템 ────────────────────────────────────────
   * kind: food 식량 / water 물 / med 약 / ammo 탄약 / part 부품
   *       lux 귀중품 / doc 기록 / mood 감정 / key 열쇠아이템
   * val : 거래 가치(돈 칸)
   * hp/mp/rad : 사용 시 효과(칸)
   */
  const ITEMS = [
    { id: 'can',      name: '통조림',        kind: 'food', val: 1, hp: 1 },
    { id: 'ramen',    name: '봉지라면',      kind: 'food', val: 1, hp: 1 },
    { id: 'choco',    name: '초콜릿',        kind: 'food', val: 1, mp: 1 },
    { id: 'dried',    name: '말린 생선',     kind: 'food', val: 1, hp: 1 },
    { id: 'rice',     name: '눌은 쌀',       kind: 'food', val: 1, hp: 1 },
    { id: 'kimchi',   name: '삭은 김치',     kind: 'food', val: 1, hp: 1 },
    { id: 'biscuit',  name: '군용 비스킷',   kind: 'food', val: 1, hp: 1 },
    { id: 'preserve', name: '보존식량',      kind: 'food', val: 2, hp: 2 },
    { id: 'water',    name: '깨끗한 물',     kind: 'water', val: 1, hp: 1 },
    { id: 'boiled',   name: '끓인 물통',     kind: 'water', val: 1, hp: 1 },
    { id: 'filter',   name: '정수 필터',     kind: 'water', val: 2 },
    { id: 'soju',     name: '소주 반 병',    kind: 'water', val: 1, mp: 1 },
    { id: 'beer',     name: '미지근한 맥주', kind: 'water', val: 1, mp: 1 },
    { id: 'bandage',  name: '붕대',          kind: 'med',  val: 1, hp: 1 },
    { id: 'medkit',   name: '의약품',        kind: 'med',  val: 2, hp: 2 },
    { id: 'iodine',   name: '요오드정',      kind: 'med',  val: 2, rad: -1 },
    { id: 'painkill', name: '진통제',        kind: 'med',  val: 1, hp: 1, cures: 'headache' },
    { id: 'anti',     name: '항생제',        kind: 'med',  val: 2, hp: 2, cures: 'fever' },
    { id: 'pistol',   name: '권총',          kind: 'ammo', val: 3, weapon: 2 },
    { id: 'shotgun',  name: '산탄총',        kind: 'ammo', val: 3, weapon: 3 },
    { id: 'rifle',    name: '조립식 저격소총', kind: 'ammo', val: 3, weapon: 3 },
    { id: 'knife',    name: '회칼',          kind: 'ammo', val: 1, weapon: 1 },
    { id: 'pipe',     name: '쇠파이프',      kind: 'ammo', val: 1, weapon: 1 },
    { id: 'shell',    name: '산탄',          kind: 'ammo', val: 1 },
    { id: 'bullet',   name: '소총탄',        kind: 'ammo', val: 1 },
    { id: 'gas',      name: '휘발유',        kind: 'part', val: 2 },
    { id: 'battery',  name: '건전지',        kind: 'part', val: 1 },
    { id: 'wire',     name: '구리선',        kind: 'part', val: 1 },
    { id: 'gasmask',  name: '방독면',        kind: 'part', val: 2, rad: -1 },
    { id: 'tape',     name: '청테이프',      kind: 'part', val: 1 },
    { id: 'solar',    name: '태양광 패널',   kind: 'part', val: 2 },
    { id: 'radio',    name: '라디오',        kind: 'part', val: 2 },
    { id: 'lighter',  name: '지포 라이터',   kind: 'part', val: 1 },
    { id: 'emp',      name: '전자기 펄스 수류탄', kind: 'part', val: 3 },
    { id: 'ring',     name: '결혼반지',      kind: 'lux',  val: 2 },
    { id: 'watch',    name: '멈춘 손목시계', kind: 'lux',  val: 1 },
    { id: 'gold',     name: '금니',          kind: 'lux',  val: 2 },
    { id: 'photo',    name: '가족사진',      kind: 'lux',  val: 1, mp: 1 },
    { id: 'guitar',   name: '통기타',        kind: 'lux',  val: 1, mp: 1 },
    { id: 'nintendo', name: '닌텐도',        kind: 'lux',  val: 2, mp: 1 },
    { id: 'seed',     name: '씨앗 봉투',     kind: 'lux',  val: 2 },
    { id: 'cig',      name: '담배',          kind: 'lux',  val: 1, mp: 1 },
    { id: 'map',      name: '지도 조각',     kind: 'doc',  val: 2 },
    { id: 'note',     name: '누군가의 일기', kind: 'doc',  val: 1, mp: 1 },
    { id: 'pass',     name: '통행증',        kind: 'doc',  val: 2 },
    { id: 'tag',      name: '인식표',        kind: 'doc',  val: 1 },
    { id: 'key',      name: '이름 없는 열쇠', kind: 'doc', val: 1 },
    { id: 'ledger',   name: '조합 장부',     kind: 'doc',  val: 2 },
    /* 감정 — 소지품처럼 들고 다닌다 */
    { id: 'hope',     name: '로망',          kind: 'mood', val: 1, mp: 1 },
    { id: 'humor',    name: '유머',          kind: 'mood', val: 1, mp: 1 },
    { id: 'grit',     name: '오기',          kind: 'mood', val: 1 },
    { id: 'gloom',    name: '우울함',        kind: 'mood', val: 0, bad: true },
    { id: 'headache', name: '두통',          kind: 'mood', val: 0, bad: true },
    { id: 'guilt',    name: '죄책감',        kind: 'mood', val: 0, bad: true },
    { id: 'fever',    name: '열',            kind: 'mood', val: 0, bad: true },
    { id: 'insomnia', name: '불면',          kind: 'mood', val: 0, bad: true },
    { id: 'hunger',   name: '허기',          kind: 'mood', val: 0, bad: true },
    { id: 'wound',    name: '상처',          kind: 'mood', val: 0, bad: true },
    { id: 'fracture', name: '골절',          kind: 'mood', val: 0, bad: true },
    { id: 'burn',     name: '화상',          kind: 'mood', val: 0, bad: true },

    /* ── 잡동사니 ──────────────────────────────────────
     * 값도 없고 배도 안 부르지만, 어떤 것들은 나중에 결정적으로 쓰인다.
     * key: true 인 것은 후반 조건부 사건의 열쇠다. */
    { id: 'batstick', name: '야구 응원 막대', kind: 'junk', val: 0, key: true, note: '주황색. 아직도 소리가 난다.' },
    { id: 'ticket',   name: '지하철 승차권',  kind: 'junk', val: 0, key: true, note: '서면 → 다대포. 편도.' },
    { id: 'teddy',    name: '곰인형',        kind: 'junk', val: 0, key: true, note: '한쪽 눈이 없다.' },
    { id: 'charm',    name: '부적',          kind: 'junk', val: 0, key: true, note: '붉은 글씨가 절반쯤 지워졌다.' },
    { id: 'whistle',  name: '호루라기',      kind: 'junk', val: 0, key: true, note: '체육 선생님 것이었던 듯하다.' },
    { id: 'spray',    name: '페인트 스프레이', kind: 'junk', val: 1, key: true, note: '흔들면 아직 소리가 난다.' },
    { id: 'compass',  name: '나침반',        kind: 'junk', val: 1, key: true, note: '자침이 가끔 엉뚱한 곳을 가리킨다.' },
    { id: 'leash',    name: '개 목줄',       kind: 'junk', val: 0, key: true, note: '이름표에 "방울".' },
    { id: 'stamp',    name: '인감도장',      kind: 'junk', val: 0, key: true, note: '누군가의 성이 새겨져 있다.' },
    { id: 'studentid', name: '학생증',       kind: 'junk', val: 0, key: true, note: '2014년 발급. 사진 속 얼굴이 앳되다.' },
    { id: 'tape2',    name: '카세트테이프',  kind: 'junk', val: 0, key: true, note: '라벨에 "여름"이라고만 적혀 있다.' },
    { id: 'tourmap',  name: '관광 안내도',   kind: 'junk', val: 0, key: true, note: '2013년판. 없어진 건물투성이다.' },
    { id: 'candle',   name: '향초',          kind: 'junk', val: 0, key: true, note: '반쯤 탔다.' },
    { id: 'megaphone', name: '확성기',       kind: 'junk', val: 1, key: true, note: '건전지만 있으면 된다.' },
    { id: 'fishlure', name: '낚시찌',        kind: 'junk', val: 0, key: true, note: '주황색 몸통에 이름이 새겨져 있다.' },
    { id: 'gum',      name: '껌 한 통',      kind: 'junk', val: 0, note: '딱딱하지만 씹으면 단맛이 난다.' },
    { id: 'mirror',   name: '자개 손거울',   kind: 'junk', val: 1, note: '오랜만에 본 자기 얼굴이 낯설다.' },
    { id: 'keyring',  name: '부산타워 열쇠고리', kind: 'junk', val: 0, note: '탑은 아직 서 있다고 들었다.' },
    { id: 'seaweed2', name: '마른 미역',     kind: 'junk', val: 0, note: '물에 불리면 두 배가 된다.' },
    { id: 'pen',      name: '볼펜',          kind: 'junk', val: 0, note: '흔들어 쓰면 아직 나온다.' },
    { id: 'notebook', name: '빈 공책',       kind: 'junk', val: 0, note: '첫 장에 이름이 적혀 있다가 지워졌다.' },
    { id: 'matches',  name: '성냥갑',        kind: 'junk', val: 0, note: '"다방 미인" 이라고 인쇄되어 있다.' },
    { id: 'alcowipe', name: '알코올 솜',     kind: 'junk', val: 0, note: '포장이 아직 안 뜯겼다.' },
    { id: 'glasses',  name: '남의 안경',     kind: 'junk', val: 0, note: '도수가 전혀 안 맞는다.' },
    { id: 'magnet',   name: '자석',          kind: 'junk', val: 0, note: '쇠붙이를 찾을 때 쓸모가 있다.' },
    { id: 'needle',   name: '바늘과 실',     kind: 'junk', val: 1, note: '옷이 하루 더 버틴다.' },
    { id: 'flashdead', name: '죽은 손전등',  kind: 'junk', val: 0, note: '건전지만 있으면.' },
    { id: 'coinpurse', name: '동전 지갑',    kind: 'junk', val: 1, note: '이제는 쇠붙이일 뿐이다.' },
    { id: 'drawing',  name: '아이 그림',     kind: 'junk', val: 0, note: '네 식구가 손을 잡고 있다.' },
    { id: 'candy',    name: '사탕 한 봉지',  kind: 'junk', val: 0, note: '서로 눌어붙었다.' },
    { id: 'towel',    name: '목욕탕 수건',   kind: 'junk', val: 0, note: '"동래온천" 이라고 박혀 있다.' },
    { id: 'slipper',  name: '슬리퍼',        kind: 'junk', val: 0, note: '한 짝은 크고 한 짝은 작다.' },
    { id: 'wallet',   name: '낡은 지갑',     kind: 'junk', val: 1, note: '신분증 사진이 물에 번졌다.' },
    { id: 'glowstick', name: '야광봉',       kind: 'junk', val: 0, note: '꺾으면 십 분쯤 빛난다.' },
    { id: 'tapemeasure', name: '줄자',       kind: 'junk', val: 0, note: '3미터에서 멈춘다.' },
    { id: 'opener',   name: '병따개',        kind: 'junk', val: 0, note: '이것 하나로 저녁이 달라질 때가 있다.' },
    { id: 'fishline', name: '낚싯줄',        kind: 'junk', val: 1, note: '질기다. 여러모로 쓸모가 있다.' },
    { id: 'pushpin',  name: '압정 한 통',    kind: 'junk', val: 0, note: '벽에 뭔가 붙이려면 필요하다.' },
    { id: 'sandpaper', name: '사포',         kind: 'junk', val: 0, note: '녹을 벗겨 낸다.' },
    { id: 'comb',     name: '이 빠진 빗',    kind: 'junk', val: 0, note: '그래도 머리는 빗어진다.' },
    { id: 'stub',     name: '영화 반쪽표',   kind: 'junk', val: 0, note: '2015년 8월 6일 19시 30분.' },
    { id: 'trophy',   name: '작은 트로피',   kind: 'junk', val: 1, note: '"제12회 사내 볼링대회 3위".' },
    /* ── 특별 이야기에서만 나오는 것 ─────────── */
    { id: 'aptreceipt', name: '관리비 영수증',  kind: 'key', val: 0, key: true, note: '도장까지 찍혀 있다. 이 동네에서는 신분증이다.' },
    { id: 'lasttrain',  name: '막차 승차권',    kind: 'key', val: 0, key: true, note: '기관사가 직접 끊어 준 표.' },
    { id: 'gukbap',     name: '이 빠진 국밥 그릇', kind: 'key', val: 0, key: true, note: '아침마다 누가 씻어 엎어 둔다.' },
    { id: 'mic',        name: '마이크',          kind: 'key', val: 0, key: true, note: '선이 잘려 있지만 쥐면 말이 나온다.' },
    { id: 'cityseal',   name: '시청 직인',       kind: 'key', val: 0, key: true, note: '아무 힘도 없고, 그래서 다들 무서워한다.' },
    { id: 'tourposter', name: '순회공연 포스터', kind: 'key', val: 0, key: true, note: '부산 · 울산 · 경주. 날짜 칸은 비어 있다.' },
    { id: 'lodgekey',   name: '산장 열쇠',       kind: 'key', val: 0, key: true, note: '나무 열쇠고리에 고도가 새겨져 있다.' },
    { id: 'usgear',     name: '미군 군장',       kind: 'key', val: 0, key: true, note: '이름표 자리에 다른 나라 글자가 있다.' },
    { id: 'factorykey', name: '공장 마스터키',   kind: 'key', val: 0, key: true, note: '이 열쇠 하나로 문 마흔 개가 열린다.' },
    /* 열쇠 아이템 — 주요 스토리에서만 나온다 */
    { id: 'shard',    name: '녹은 유리 조각', kind: 'key', val: 0 },
    { id: 'letter',   name: '아버지의 편지',  kind: 'key', val: 0 },
    { id: 'code',     name: '벙커 암호표',    kind: 'key', val: 0 },
    { id: 'badge',    name: '조합 인장',      kind: 'key', val: 0 },
    { id: 'chart',    name: '해도',          kind: 'key', val: 0 },
    { id: 'film',     name: '감시 카메라 필름', kind: 'key', val: 0 }
  ];

  /* 로망을 진통제로 쪼개는 식의 변환 — 원작의 가젯 분해를 옮겨 왔다 */
  const CONVERSIONS = [
    { from: 'hope',   to: 'painkill', count: 3, line: '로망을 태워 진통제 세 알을 얻습니다. 남는 장사인지는 모르겠습니다.' },
    { from: 'humor',  to: 'choco',    count: 2, line: '농담 몇 개로 초콜릿 두 개를 얻어냅니다.' },
    { from: 'gold',   to: 'medkit',   count: 1, line: '금니를 의약품과 바꿉니다. 이가 아픈 것보다 낫습니다.' },
    { from: 'guitar', to: 'hope',     count: 1, line: '기타 줄이 하나 더 끊어졌지만, 노래는 남습니다.' },
    { from: 'needle', to: 'bandage',  count: 2, line: '천을 찢어 실로 감칩니다. 붕대 두 개가 생겼습니다.' },
    { from: 'candy',  to: 'humor',    count: 1, line: '사탕 하나를 입에 넣습니다. 별것 아닌데 웃음이 납니다.' },
    { from: 'mirror', to: 'gloom',    count: 1, line: '거울을 오래 봤습니다. 보지 말걸 그랬습니다.' },
    { from: 'flashdead', to: 'wire',  count: 1, line: '손전등을 분해해 구리선을 뽑아냅니다.' },
    { from: 'coinpurse', to: 'magnet', count: 1, line: '동전을 녹여 붙일 수는 없지만, 자석 하나는 건집니다.' }
  ];

  const BY_KIND = {};
  ITEMS.forEach(function (it) { (BY_KIND[it.kind] = BY_KIND[it.kind] || []).push(it.id); });

  B.SKILLS = SKILLS;
  B.SKILL_MAP = SKILLS.reduce(function (m, s) { m[s.id] = s; return m; }, {});
  B.ITEMS = ITEMS;
  B.ITEMS_BY_KIND = BY_KIND;
  B.ITEM_MAP = ITEMS.reduce(function (m, i) { m[i.id] = i; return m; }, {});
  B.CONVERSIONS = CONVERSIONS;
})(typeof window !== 'undefined' ? window : globalThis);

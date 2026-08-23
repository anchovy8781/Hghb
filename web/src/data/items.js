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
    { id: 'read',  name: '독해',    note: '남이 흘린 글자 속에 길이 있다.' }
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
    { from: 'guitar', to: 'hope',     count: 1, line: '기타 줄이 하나 더 끊어졌지만, 노래는 남습니다.' }
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

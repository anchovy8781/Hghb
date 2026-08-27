/* 부산 2033 - 아이템 (5) 살림과 손기술, 그리고 부산에서만 나오는 것들
 *
 * 여기 있는 것들은 대부분 이야기 안에서 쓰입니다. 소지품 창에서 바로 쓰는
 * 물건이 아니라, 그것이 필요한 자리가 왔을 때 선택지 앞에 초록으로 붙습니다.
 */
(function (global) {
  'use strict';
  const B = global.B;
  const I = B.ITEMS;

  const ADD = [
    /* ── 먹을 것 ─────────────────────────────── */
    { id: 'dwaejigukbap', name: '돼지국밥 한 그릇', kind: 'food', val: 2, hp: 2, mp: 1, note: '이 도시가 아직 이 도시인 이유.' },
    { id: 'milmyeonbowl', name: '밀면 한 그릇', kind: 'food', val: 2, hp: 1, mp: 1, note: '피란민이 냉면 대신 만들어 먹던 것.' },
    { id: 'eomuk', name: '어묵 꼬치', kind: 'food', val: 1, hp: 1, mp: 1, note: '국물은 공짜다. 그 규칙만은 안 변했다.' },
    { id: 'ssiathotteok', name: '씨앗호떡 반죽', kind: 'food', val: 1, hp: 1, note: '기름에 눌러야 완성이다.' },
    { id: 'jorimgim', name: '조림김', kind: 'food', val: 1, hp: 1, note: '짜다. 짜서 오래간다.' },
    { id: 'gochujang', name: '고추장 단지', kind: 'food', val: 2, hp: 1, mp: 1, note: '이십 년 묵어 색이 검다. 맛은 더 깊다.' },
    { id: 'doenjang', name: '된장 덩어리', kind: 'food', val: 2, hp: 1, note: '항아리가 있는 마을에만 있다.' },
    { id: 'saltpack', name: '굵은소금 한 되', kind: 'food', val: 2, note: '절이고, 씻고, 상처에 쓴다. 세 가지에 다 쓴다.' },
    { id: 'sugarlump', name: '설탕 덩어리', kind: 'food', val: 2, hp: 1, mp: 1, note: '단맛은 이 도시에서 약에 가깝다.' },
    { id: 'sesameoil', name: '참기름 한 병', kind: 'food', val: 3, hp: 1, mp: 1, note: '한 방울로 한 그릇이 달라진다.' },
    { id: 'driedanchovy', name: '마른 멸치 한 줌', kind: 'food', val: 1, hp: 1, note: '국물을 내면 하루가 든든하다.' },
    { id: 'seasalted', name: '자반고등어', kind: 'food', val: 2, hp: 2, note: '소금에 절였다. 겨울을 나는 생선.' },
    { id: 'chestnut', name: '삶은 밤', kind: 'food', val: 1, hp: 1, note: '구월에 벌어진다.' },
    { id: 'wildgreen', name: '데친 나물', kind: 'food', val: 1, hp: 1, note: '무엇인지 알고 뜯은 사람만 먹는다.' },
    { id: 'oysterjar', name: '굴 항아리', kind: 'food', val: 2, hp: 2, note: '십일월에 살이 찬다.' },
    { id: 'ramyeonbox', name: '봉지라면 한 상자', kind: 'food', val: 3, hp: 2, note: '스무 해가 지나도 안 상한다. 맛은 안 보장한다.' },
    { id: 'porridge', name: '흰죽 한 그릇', kind: 'food', val: 1, hp: 2, note: '탈이 난 사람에게 제일 먼저 주는 것.' },
    { id: 'birthseaweed', name: '미역국', kind: 'food', val: 2, hp: 2, mp: 2, note: '아이가 난 집에서만 끓인다.' },

    /* ── 마실 것 ─────────────────────────────── */
    { id: 'barleypot', name: '보리차 주전자', kind: 'water', val: 1, hp: 1, mp: 1, note: '끓인 물이라는 증표이기도 하다.' },
    { id: 'snowmelt', name: '눈 녹인 물', kind: 'water', val: 1, hp: 1, note: '첫눈은 안 쓴다. 뒤에 오는 것만 받는다.' },
    { id: 'springjar', name: '약수 한 통', kind: 'water', val: 2, hp: 1, mp: 1, note: '안 마르는 자리는 이 도시에 다섯 군데다.' },
    { id: 'ricewater', name: '숭늉', kind: 'water', val: 1, hp: 1, mp: 1, note: '솥 바닥을 긁어 끓인 것.' },

    /* ── 약과 처치 ───────────────────────────── */
    { id: 'charcoalpowder', name: '숯가루', kind: 'med', val: 1, hp: 1, note: '맛이 없고 효과는 있다.' },
    { id: 'saltwater', name: '소금물 한 병', kind: 'med', val: 1, hp: 1, note: '상처를 씻는 데 이만한 게 없다.' },
    { id: 'mugwort', name: '말린 쑥', kind: 'med', val: 1, hp: 1, mp: 1, note: '삼월에 뜯어 일 년을 쓴다.' },
    { id: 'pinesalve', name: '송진 고약', kind: 'med', val: 2, hp: 1, note: '붙이면 잘 안 떨어진다. 그게 장점이다.' },
    { id: 'boiledgauze', name: '삶은 붕대', kind: 'med', val: 1, hp: 1, note: '잿빛이면 오래 걸어온 사람이다.' },
    { id: 'toothpull', name: '이 뽑는 집게', kind: 'med', val: 2, note: '이 도시에서 제일 무서운 도구.' },
    { id: 'eyewash', name: '세안용 식염수', kind: 'med', val: 1, mp: 1, note: '재가 들어간 눈에 쓴다.' },
    { id: 'birthkit', name: '받이 도구 보퉁이', kind: 'med', val: 3, hp: 1, key: true, note: '천, 실, 가위, 그리고 끓인 물.' },

    /* ── 손기술 도구 ─────────────────────────── */
    { id: 'awl', name: '송곳', kind: 'part', val: 1, note: '가죽에도 뚫린다.' },
    { id: 'pliers2', name: '집게', kind: 'part', val: 1, note: '뜨거운 것을 잡는 데 필요하다.' },
    { id: 'whetstone', name: '숫돌', kind: 'part', val: 2, note: '날이 있는 것은 다 이걸 거친다.' },
    { id: 'solderiron', name: '납땜인두', kind: 'part', val: 2, note: '전기가 있어야 쓸모가 있다.' },
    { id: 'handdrill', name: '수동 드릴', kind: 'part', val: 2, note: '전기가 없어도 구멍은 뚫린다.' },
    { id: 'sewkit', name: '반짇고리', kind: 'part', val: 1, note: '옷이 곧 체온이다.' },
    { id: 'ropecoil', name: '삼줄 한 사리', kind: 'part', val: 2, note: '이 도시에서 제일 자주 아쉬운 물건.' },
    { id: 'pulley', name: '도르래', kind: 'part', val: 2, note: '힘이 반이 된다. 시간은 두 배다.' },
    { id: 'ladderrung', name: '접이 사다리', kind: 'part', val: 2, note: '높은 데 있는 것은 대개 아직 남아 있다.' },
    { id: 'tarp', name: '방수포', kind: 'part', val: 2, note: '지붕도 되고 바닥도 되고 들것도 된다.' },
    { id: 'clayjar', name: '항아리', kind: 'part', val: 2, note: '항아리가 있으면 겨울을 난다.' },
    { id: 'ironpot', name: '무쇠솥', kind: 'part', val: 3, note: '무겁다. 무거워서 안 없어졌다.' },
    { id: 'bellows', name: '풀무', kind: 'part', val: 2, note: '불을 키우는 데는 바람이 먼저다.' },
    { id: 'grindstone', name: '맷돌', kind: 'part', val: 2, note: '곡식을 가루로 만들면 두 배로 먹는다.' },
    { id: 'handpump', name: '수동 펌프', kind: 'part', val: 3, note: '펌프가 죽어도 손은 안 죽는다.' },
    { id: 'copperwire', name: '구리선 뭉치', kind: 'part', val: 3, note: '실외기 안에서 나온다. 이 도시의 광산이다.' },
    { id: 'hinge', name: '성한 경첩', kind: 'part', val: 3, note: '관절이 되는 자리에 쓰인다. 이제 잘 안 나온다.' },
    { id: 'chalkbox', name: '분필 한 통', kind: 'part', val: 1, note: '이 도시의 표지판은 전부 이걸로 쓴다.' },
    { id: 'ashbag', name: '재 한 자루', kind: 'part', val: 1, note: '계단에 뿌리면 안 미끄러진다.' },
    { id: 'firestarter', name: '마른 관솔', kind: 'part', val: 1, note: '젖은 나무에도 불이 붙는다.' },

    /* ── 옷과 몸 ─────────────────────────────── */
    { id: 'padcoat', name: '누비 외투', kind: 'part', val: 3, warm: true, note: '무겁고 따뜻하다. 겨울에는 값이 세 배가 된다.' },
    { id: 'strawshoe', name: '삼 신발', kind: 'part', val: 1, note: '신발을 짤 줄 아는 사람이 아직 몇 남았다.' },
    { id: 'kneepad', name: '무릎 보호대', kind: 'part', val: 1, note: '무릎이 나가면 이 도시에서는 끝이다.' },
    { id: 'earmuff', name: '귀마개', kind: 'part', val: 1, note: '귀가 얼면 안 돌아온다.' },
    { id: 'handbalm', name: '손 연고', kind: 'part', val: 1, mp: 1, note: '손이 갈라지면 아무것도 못 잡는다.' },
    { id: 'shavekit', name: '면도 도구', kind: 'part', val: 1, mp: 1, note: '얼굴이 깨끗하면 값을 덜 깎인다.' },
    { id: 'toothsalt', name: '소금 칫솔', kind: 'part', val: 1, hp: 1, note: '이가 없으면 못 먹고, 못 먹으면 끝이다.' },

    /* ── 종이와 기록 ─────────────────────────── */
    { id: 'seedledger', name: '씨앗 장부', kind: 'doc', val: 3, key: true, note: '누가 무엇을 빌려 갔고 몇 배로 갚았는지가 적혀 있다.' },
    { id: 'debtbook', name: '빚 장부', kind: 'doc', val: 3, key: true, note: '죽으면 지워진다. 이십 년 전에 그렇게 정했다.' },
    { id: 'tidechart', name: '물때표', kind: 'doc', val: 2, note: '갯벌이 언제 드러나는지가 적혀 있다.' },
    { id: 'railmap', name: '철길 노선도', kind: 'doc', val: 2, note: '길은 바뀌어도 철길은 안 바뀐다.' },
    { id: 'wellmap', name: '우물 지도', kind: 'doc', val: 3, note: '안 마르는 다섯 군데가 표시돼 있다.' },
    { id: 'letterbag', name: '편지 가방', kind: 'doc', val: 2, key: true, note: '이걸 멘 사람은 어느 마을에서든 한 끼를 얻는다.' },
    { id: 'schoolbook', name: '남은 교과서', kind: 'doc', val: 2, note: '이름 칸이 비어 있다. 지금은 그게 다행이다.' },
    { id: 'songsheet', name: '가사 적은 종이', kind: 'doc', val: 1, mp: 1, note: '백열두 곡. 이 도시가 기억하는 전부다.' },
    { id: 'namelist', name: '이름 목록', kind: 'doc', val: 2, key: true, note: '못 고친 사람들 이름이다. 버리면 같은 실수를 한다.' },

    /* ── 값나가는 것 ─────────────────────────── */
    { id: 'goldtooth', name: '금니', kind: 'lux', val: 3, note: '어디서 나왔는지는 안 묻는 것이 예의다.' },
    { id: 'jadering', name: '옥가락지', kind: 'lux', val: 3, note: '깨지지 않은 것은 드물다.' },
    { id: 'sojubottle', name: '소주 한 병', kind: 'lux', val: 2, mp: 1, note: '소독에도 쓰고 흥정에도 쓴다.' },
    { id: 'makgeolli3', name: '막걸리 한 되', kind: 'lux', val: 2, hp: 1, mp: 1, note: '문 앞에 분필로 적히면 저녁에 스물이 온다.' },
    { id: 'tealeaf', name: '잎차 한 봉', kind: 'lux', val: 2, mp: 1, note: '다방에서 제일 비싼 것.' },
    { id: 'coffeebean', name: '커피콩 한 줌', kind: 'lux', val: 3, mp: 2, note: '이십 년 지난 것인데도 값이 안 떨어졌다.' },
    { id: 'cigarpack', name: '남은 담배 한 갑', kind: 'lux', val: 3, mp: 1, note: '피우려고 사는 사람보다 바꾸려고 사는 사람이 많다.' },
    { id: 'redcloth', name: '붉은 천', kind: 'lux', val: 2, mp: 1, note: '혼롓날 세 마을이 돌려 쓴다.' },
    { id: 'photoframe', name: '성한 액자', kind: 'lux', val: 2, mp: 1, note: '안에 든 사진은 대개 남의 것이다.' },
    { id: 'musicbox', name: '태엽 오르골', kind: 'lux', val: 3, mp: 2, note: '한 곡밖에 안 나온다. 그 한 곡이면 된다.' },

    /* ── 잡동사니 ────────────────────────────── */
    { id: 'brasskey', name: '어느 집 열쇠', kind: 'junk', val: 0, key: true, note: '맞는 문이 아직 서 있을 확률은 낮다.' },
    { id: 'busticket', name: '버스 승차권', kind: 'junk', val: 0, key: true, note: '210번. 산복도로를 돌던 노선이다.' },
    { id: 'schoolbadge', name: '교표', kind: 'junk', val: 0, key: true, note: '어느 학교인지 아는 사람이 아직 있다.' },
    { id: 'lottoslip', name: '안 긁은 복권', kind: 'junk', val: 0, key: true, note: '긁으면 끝난다. 그래서 다들 안 긁는다.' },
    { id: 'shellwind', name: '조개 풍경', kind: 'junk', val: 0, key: true, note: '바람이 불면 아직 소리가 난다.' },
    { id: 'papercrane', name: '접힌 종이학', kind: 'junk', val: 0, key: true, note: '천 마리 중 하나였을 것이다.' },
    { id: 'sandbottle', name: '모래가 든 병', kind: 'junk', val: 0, key: true, note: '해운대 것이라고 적혀 있다.' },
    { id: 'medalrun', name: '완주 메달', kind: 'junk', val: 0, key: true, note: '2014년 부산 마라톤. 완주는 완주다.' },
    { id: 'fanplastic', name: '응원 부채', kind: 'junk', val: 0, key: true, note: '아직도 접었다 폈다 된다.' },
    { id: 'namestamp', name: '나무 도장', kind: 'junk', val: 1, key: true, note: '이 도시에서 도장은 총보다 조용하고 총보다 멀리 간다.' },

    /* ── 부산 2033 전용 ──────────────────────── */
    { id: 'ferrybell', name: '도선 종', kind: 'key', val: 2, key: true, note: '이 종이 울리면 배가 뜬다는 뜻이었다.' },
    { id: 'railspike', name: '철길 대못', kind: 'key', val: 1, key: true, note: '스무 해 묵은 못은 뽑을 때 비명 같은 소리를 낸다.' },
    { id: 'tunnelchalk', name: '터널 분필 표시', kind: 'key', val: 1, key: true, note: '"낮에만." 밑에 다른 글씨. "낮에도 아님."' },
    { id: 'watertoken', name: '급수 번호표', kind: 'key', val: 1, key: true, note: '담뱃갑을 잘라 만들었다. 뒷면에 숫자가 있다.' },
    { id: 'marketseal', name: '조합 인장', kind: 'key', val: 3, key: true, note: '찍히면 배급이 나오고 안 찍히면 안 나온다.' },
    { id: 'headmanstamp', name: '반장 도장', kind: 'key', val: 3, key: true, note: '두 손으로 주고 두 손으로 받는다.' },
    { id: 'gullband', name: '갈매기 발가락지', kind: 'key', val: 1, key: true, note: '누가 번호를 매겨 놨다. 이십 년 전 일이다.' },
    { id: 'driftlog', name: '떠내려온 항해일지', kind: 'key', val: 3, key: true, note: '마지막 줄 날짜가 작년이다.' },
    { id: 'snowday', name: '눈 온 날 적은 쪽지', kind: 'key', val: 1, key: true, note: '"오늘 하얬음." 그게 전부다.' },
    { id: 'firewatch', name: '불 당번표', kind: 'key', val: 1, key: true, note: '두 시간씩. 새벽 당번이 제일 힘들다.' }
  ];

  /* ITEM_MAP 에 같이 넣어야 화면에 이름이 나온다.
   * 이걸 빠뜨리면 선택지 앞에 "pulley" 처럼 영문 id 가 그대로 뜬다. */
  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    I.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

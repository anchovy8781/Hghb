/* 부산 2033 - 아이템 (12)
 *
 * 「부산-세이버」가 헬기에서 들고 나온 것들, 금정산성에서 나오는 것들,
 * 그리고 새 이야기들이 쓰는 물건.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 부산-세이버 ─────────────────────────── */
    { id: 'flightsuit', name: '구조대 비행복', kind: 'part', val: 3, warm: true, armor: 1,
      broken: 'flightsuittorn',
      note: '난연이고 두껍다. 등에 「SAVER」라고 적혀 있다.' },
    { id: 'flightsuittorn', name: '찢어진 비행복', kind: 'part', val: 1, warm: true,
      note: '한 번 대신 맞아 줬다. 반짇고리가 있으면 다시 기운다.' },
    { id: 'helmetavi', name: '비행 헬멧', kind: 'part', val: 3, armor: 1, broken: 'helmetcrack',
      note: '무전기가 붙어 있다. 지금은 아무것도 안 잡힌다.' },
    { id: 'helmetcrack', name: '금 간 헬멧', kind: 'junk', val: 1,
      note: '한 번 값을 했다. 이제는 그냥 쓰고 다닌다.' },
    { id: 'beacon', name: '비상 발신기', kind: 'part', val: 3, key: true,
      note: '누르면 사흘 동안 신호를 보낸다. 받을 사람이 있는지는 모른다.' },
    { id: 'ordersheet', name: '봉인된 명령서', kind: 'doc', val: 3, key: true,
      note: '봉인에 「착륙 후 개봉」이라고 적혀 있다. 착륙은 했다.' },
    { id: 'seoulmap', name: '서울에서 가져온 지도', kind: 'doc', val: 3, key: true,
      note: '이 도시가 빗금으로 칠해져 있다. 「접근 제한」이라고 적혀 있다.' },
    { id: 'medevac', name: '구조대 응급 배낭', kind: 'med', val: 3, hp: 2, revive: 2,
      note: '한 사람을 하루 더 살린다. 그 하루에 뭘 할지가 문제다.' },
    { id: 'rotorblade', name: '부러진 로터 날개', kind: 'part', val: 3,
      note: '가볍고 아주 단단하다. 이 도시에서 이만한 재료가 없다.' },
    { id: 'avionics', name: '항공 계기 뭉치', kind: 'part', val: 3,
      note: '고도계와 나침반과 무전기. 셋 중 둘은 아직 산다.' },
    { id: 'flarekit', name: '조난 신호탄', kind: 'part', val: 3,
      note: '셋 남았다. 쏘면 십 킬로에서 보인다. 좋은 사람도 보고 나쁜 사람도 본다.' },
    { id: 'seoulration', name: '서울 보급 식량', kind: 'food', val: 3, hp: 2,
      note: '2032년 제조. 이 도시에서 이십 년 안 지난 음식은 이것뿐이다.' },
    { id: 'dogtag2', name: '동료의 이름표', kind: 'key', val: 3, key: true,
      note: '넷이 탔고 셋이 내렸다. 이건 못 내린 사람 것이다.' },
    { id: 'winchrope', name: '구조용 윈치 줄', kind: 'part', val: 3,
      note: '오십 미터. 사람 셋을 매달아도 안 끊어진다.' },

    /* ── 금정산성 ────────────────────────────── */
    { id: 'fortkey', name: '동문 빗장 열쇠', kind: 'key', val: 3, key: true,
      note: '사대문 중에 지금도 여닫는 문은 하나뿐이다.' },
    { id: 'beaconwood', name: '봉수 장작 한 짐', kind: 'part', val: 2,
      note: '젖으면 못 쓴다. 그래서 늘 지붕 아래 둔다.' },
    { id: 'fortplan', name: '성벽 도면', kind: 'doc', val: 3, key: true,
      note: '팔 킬로를 백 구간으로 나눠 놓았다. 무너진 데가 서른둘.' },
    { id: 'stonehammer', name: '돌 다듬는 망치', kind: 'part', val: 2,
      note: '삼백 년 전 사람들이 쓰던 것과 같은 모양이다.' },
    { id: 'watchbell', name: '망루 종', kind: 'key', val: 2, key: true,
      note: '성 안 어디서나 들린다. 그러라고 산 위에 달았다.' },
    { id: 'fortledger', name: '성 지키는 사람 명부', kind: 'doc', val: 2, key: true,
      note: '이름 여든넷. 구간마다 맡은 사람이 적혀 있다.' },
    { id: 'oldarrow', name: '삼백 년 된 화살촉', kind: 'junk', val: 1, key: true,
      note: '성벽 틈에서 나왔다. 그때도 여기서 누가 지켰다.' },
    { id: 'mtwater', name: '산성 샘물 한 통', kind: 'water', val: 3, hp: 1,
      note: '이 도시에서 안 걸러도 되는 몇 안 되는 물.' },

    /* ── 새 이야기들이 쓰는 물건 ───────────────── */
    { id: 'stretcher', name: '접이식 들것', kind: 'part', val: 3,
      note: '둘이 들면 업는 것보다 두 배 빠르다. 다친 데를 안 접는다.' },
    { id: 'splintset', name: '부목 한 벌', kind: 'med', val: 2, hp: 1, cures: 'fracture',
      note: '길이가 셋이다. 팔, 아래다리, 넓적다리.' },
    { id: 'tourniquet', name: '지혈대', kind: 'med', val: 3, hp: 1, cures: 'bleeding',
      note: '조인 시각을 적어 둬야 한다. 안 적으면 팔을 잃는다.' },
    { id: 'burnkit', name: '화상 드레싱', kind: 'med', val: 2, hp: 1, cures: 'burn',
      note: '차게 하고 덮는다. 그 순서를 바꾸면 안 된다.' },
    { id: 'signalpanel', name: '지상 신호포', kind: 'part', val: 2,
      note: '주황색 천 넉 장. 땅에 글자를 만들면 하늘에서 읽는다.' },
    { id: 'foldsaw', name: '접이식 톱', kind: 'part', val: 2,
      note: '접으면 손바닥만 하다. 펴면 나무를 벤다.' },
    { id: 'cordreel', name: '가는 줄 한 타래', kind: 'part', val: 2,
      note: '가늘어서 가볍고 질겨서 안 끊어진다. 백 미터.' },
    { id: 'hardhat', name: '안전모', kind: 'part', val: 2, armor: 1, broken: 'hardhatcrack',
      note: '무너진 데 들어갈 때 이것과 안 이것의 차이가 크다.' },
    { id: 'hardhatcrack', name: '깨진 안전모', kind: 'junk', val: 0,
      note: '머리 대신 깨졌다. 그게 이 물건의 일이다.' },
    { id: 'glowtape', name: '야광 테이프', kind: 'part', val: 2,
      note: '어두운 데서 길을 표시한다. 낮에 빛을 먹여 둬야 한다.' },
    { id: 'canteen2', name: '군용 수통 두 개', kind: 'water', val: 2, hp: 1,
      note: '하나는 마시는 물, 하나는 씻는 물. 섞으면 안 된다.' },
    { id: 'fieldstove', name: '야전 버너', kind: 'part', val: 3,
      note: '기름 몇 방울로 물을 끓인다. 연기가 거의 안 난다.' },
    { id: 'sleepbag', name: '침낭', kind: 'part', val: 3, warm: true,
      note: '땅에서 올라오는 냉기를 막는다. 그게 절반이다.' },
    { id: 'mapcase', name: '방수 지도집', kind: 'doc', val: 2,
      note: '비에 안 젖는다. 그래서 이십 년 지난 지도가 아직 읽힌다.' },
    { id: 'binocular', name: '쌍안경', kind: 'part', val: 3,
      note: '멀리 보는 것보다 미리 아는 것이 중요하다.' },
    { id: 'firehook', name: '갈고리 장대', kind: 'part', val: 2,
      note: '무너진 데를 헤집고, 물에 빠진 것을 건진다.' },
    { id: 'ashmask', name: '방진 마스크', kind: 'part', val: 2,
      note: '재 치우는 날에 이걸 쓴 사람과 안 쓴 사람은 겨울이 다르다.' },
    { id: 'coldpack', name: '차게 하는 주머니', kind: 'med', val: 2, hp: 1,
      note: '눌러 터뜨리면 차가워진다. 한 번뿐이다.' },
    { id: 'sugarpack', name: '설탕 한 봉', kind: 'food', val: 2, hp: 1,
      note: '기운이 다 빠졌을 때 이것 한 숟가락이 십 분을 번다.' },
    { id: 'jerkymeat', name: '말린 고기 한 줌', kind: 'food', val: 3, hp: 2,
      note: '가볍고 짜고 오래간다. 걷는 사람 것이다.' },
    { id: 'oatbar', name: '눌러 만든 곡식 덩이', kind: 'food', val: 2, hp: 1,
      note: '꿀로 뭉쳤다. 주머니에 들어간다.' },
    { id: 'thermos', name: '보온병', kind: 'part', val: 2,
      note: '아침에 끓인 물이 저녁까지 따뜻하다. 겨울에 값이 두 배.' },
    { id: 'papermill', name: '종이 뜨는 발', kind: 'part', val: 2,
      note: '헌 종이를 풀어 다시 뜬다. 이 도시에서 종이를 만드는 유일한 방법.' },
    { id: 'sootpen', name: '숯 연필', kind: 'junk', val: 1,
      note: '버드나무 가지를 구우면 된다. 얼마든지 만든다.' },
    { id: 'copperpot', name: '구리 솥', kind: 'part', val: 3,
      note: '열이 고르게 간다. 약 달이는 데는 이것뿐이다.' },
    { id: 'winterquilt', name: '솜 넣은 이불', kind: 'part', val: 3, warm: true,
      note: '무겁다. 무거운 만큼 따뜻하다.' },
    { id: 'toolroll', name: '연장 말이', kind: 'part', val: 3,
      note: '펼치면 열두 가지가 자리마다 꽂혀 있다. 잃어버릴 일이 없다.' },
    { id: 'seedjar', name: '씨앗 항아리', kind: 'part', val: 2,
      note: '금이 가 있다. 씨앗은 새어도 안 없어지니까 상관없다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

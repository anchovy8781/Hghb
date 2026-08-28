/* 부산 2033 - 아이템 (10)
 *
 * 「부산-언어치브드 메리지」가 들고 다니는 것들과,
 * 김해공항 · 영도 조선소 장편에서 나오는 것들, 그리고 새 이야기들이 쓰는 물건.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 그날 예식장에서 들고 나온 것 ─────────── */
    { id: 'guestbook', name: '방명록', kind: 'doc', val: 3, key: true,
      note: '이름 백열두 개. 서른한 개에 줄이 그어져 있다.' },
    { id: 'ring2', name: '반지 큰 것', kind: 'key', val: 3, key: true,
      note: '십팔 년째 목에 걸려 있다. 걸을 때마다 소리가 난다.' },
    { id: 'ring2small', name: '반지 작은 것', kind: 'key', val: 3, key: true,
      note: '안쪽에 날짜가 새겨져 있다. 2015년 8월 6일.' },
    { id: 'cuesheet', name: '사회자 큐시트', kind: 'doc', val: 1, key: true,
      note: '아래에 손으로 적혀 있다. "신랑 긴장 많이 함. 천천히."' },
    { id: 'weddingphoto', name: '신부 대기실 사진', kind: 'doc', val: 3, key: true,
      note: '이십 년 만에 현상했다. 기억보다 얼굴이 어리다.' },
    { id: 'lacecloth', name: '레이스가 붙은 천', kind: 'part', val: 2, warm: true,
      note: '드레스를 잘라 만든 이불 조각. 밑단만 실 색이 다르다.' },
    { id: 'filmroll', name: '현상 안 한 필름', kind: 'doc', val: 2, key: true,
      note: '스물넷 중 여덟만 살았다. 나머지는 이십 년을 못 견뎠다.' },
    { id: 'envelope', name: '축의금 봉투 한 뭉치', kind: 'lux', val: 2,
      note: '아무도 안 가져간 것을 주워 쌓았다.' },
    { id: 'wornsuit', name: '세 번 기운 예복', kind: 'part', val: 2, warm: true, armor: 1,
      broken: 'suittorn',
      note: '등판이 찢어진 채로 십팔 년. 겨울에는 안에 껴입는다.' },
    { id: 'suittorn', name: '더 찢어진 예복', kind: 'junk', val: 0,
      note: '네 번째로 기울 수는 있다. 실이 있으면.' },
    { id: 'driedbouquet', name: '마른 부케', kind: 'junk', val: 0, key: true,
      note: '그날 아침에 받은 것. 물기가 있던 것이 십팔 년이 됐다.' },

    /* ── 김해공항 ────────────────────────────── */
    { id: 'towerlog2', name: '관제 교신 기록', kind: 'doc', val: 3, key: true,
      note: '마지막 줄이 08:09 다. 그다음 줄은 없다.' },
    { id: 'boardpass', name: '탑승권 한 장', kind: 'doc', val: 2, key: true,
      note: '게이트 7번, 08:40 출발. 도장이 안 찍혀 있다.' },
    { id: 'blackbox', name: '비행 기록 장치', kind: 'part', val: 3, key: true,
      note: '주황색이고 아주 무겁다. 여는 방법을 아는 사람이 없다.' },
    { id: 'runwaylight', name: '활주로 유도등', kind: 'part', val: 3,
      note: '전기만 있으면 아직 켜진다. 오 킬로 밖에서 보인다.' },
    { id: 'lifevest', name: '구명조끼', kind: 'part', val: 2,
      note: '좌석 아래에 있던 것. 부는 관이 아직 안 삭았다.' },
    { id: 'planeblanket', name: '기내 담요', kind: 'part', val: 2, warm: true,
      note: '얇은데 이상하게 따뜻하다. 그래서 다들 가져갔다.' },
    { id: 'jetfuel', name: '항공유 한 통', kind: 'part', val: 3,
      note: '아주 잘 탄다. 그래서 아주 조심해야 한다.' },
    { id: 'radarpart', name: '레이더 돔 부품', kind: 'part', val: 3,
      note: '이걸 고치면 하늘을 다시 볼 수 있다. 볼 게 있을지는 모르지만.' },
    { id: 'passlist', name: '탑승자 명단', kind: 'doc', val: 3, key: true,
      note: '이백열둘. 그날 여덟 시 사십 분 편이다.' },
    { id: 'dutyfree', name: '면세점 화장품', kind: 'lux', val: 3,
      note: '이십 년 지났는데 향이 남아 있다. 값이 아주 세다.' },

    /* ── 영도 조선소 ─────────────────────────── */
    { id: 'shipplan', name: '배 도면', kind: 'doc', val: 3, key: true,
      note: '이십 년째 이 도면대로 짓고 있다. 절반쯤 왔다.' },
    { id: 'weldrod', name: '용접봉 한 다발', kind: 'part', val: 3,
      note: '이 도시에서 제일 값나가는 쇠막대.' },
    { id: 'weldmask', name: '용접 면', kind: 'part', val: 2, armor: 1, broken: 'weldmaskcrack',
      note: '유리가 검다. 얼굴 앞에 있으면 웬만한 것은 대신 맞는다.' },
    { id: 'weldmaskcrack', name: '금 간 용접 면', kind: 'junk', val: 0,
      note: '유리에 금이 갔다. 그래도 없는 것보다는 낫다.' },
    { id: 'steelplate', name: '강판 한 장', kind: 'part', val: 3,
      note: '혼자서는 못 든다. 셋이 들면 든다.' },
    { id: 'rivetbag', name: '리벳 한 자루', kind: 'part', val: 2,
      note: '이 배에 십이만 개가 들어간다고 한다.' },
    { id: 'launchbell', name: '진수식 종', kind: 'key', val: 3, key: true,
      note: '배가 물에 들어갈 때 한 번 친다. 아직 안 쳤다.' },
    { id: 'dockkey', name: '도크 수문 열쇠', kind: 'key', val: 3, key: true,
      note: '이걸 돌리면 바닷물이 들어온다. 딱 한 번 쓸 일이다.' },
    { id: 'shipname', name: '뱃머리 이름판', kind: 'key', val: 2, key: true,
      note: '아직 이름이 안 새겨져 있다. 비워 두었다.' },
    { id: 'compass2', name: '배에서 뗀 나침반', kind: 'part', val: 3,
      note: '자침이 아직 산다. 배보다 오래 살았다.' },

    /* ── 새 이야기들이 쓰는 물건 ───────────────── */
    { id: 'stoveplate', name: '무쇠 판', kind: 'part', val: 2,
      note: '불 위에 얹으면 뭐든 구워진다. 무겁다.' },
    { id: 'handmill', name: '손 맷돌', kind: 'part', val: 2,
      note: '한 시간 돌리면 한 끼가 나온다.' },
    { id: 'inkstone', name: '벼루와 먹', kind: 'junk', val: 1,
      note: '벽에 쓴 글씨가 비에 안 지워지는 이유.' },
    { id: 'wintercap', name: '귀 덮는 모자', kind: 'part', val: 2, warm: true,
      note: '귀가 따뜻하면 밤에 잠이 온다.' },
    { id: 'sandbagkit', name: '모래주머니 한 벌', kind: 'part', val: 2,
      note: '물이 오기 전에 쌓으면 값을 한다. 오고 나면 늦는다.' },
    { id: 'wirespool', name: '철사 한 뭉치', kind: 'part', val: 2,
      note: '이 도시에서 제일 자주 쓰이는 물건.' },
    { id: 'glassjar', name: '큰 유리병', kind: 'part', val: 2,
      note: '뭘 담아도 되고, 뭘 담았는지 밖에서 보인다.' },
    { id: 'ropelong', name: '긴 밧줄', kind: 'part', val: 2,
      note: '삼십 미터. 이만큼이면 웬만한 데는 내려간다.' },
    { id: 'firstpack', name: '응급 가방', kind: 'med', val: 3, hp: 2,
      note: '한 사람 몫이 다 들어 있다. 한 번 열면 다시 채워야 한다.' },
    { id: 'toothkit', name: '이 뽑는 집게', kind: 'med', val: 2, hp: 1, cures: 'pain',
      note: '이 도시에서 제일 무서운 물건. 그리고 제일 고맙다.' },
    { id: 'saltfish', name: '소금에 절인 생선', kind: 'food', val: 2, hp: 1,
      note: '한 달을 간다. 짜서 물이 두 배로 든다.' },
    { id: 'ricecake', name: '말린 가래떡', kind: 'food', val: 2, hp: 1,
      note: '구우면 부푼다. 부푸는 걸 보려고 굽는 사람이 있다.' },
    { id: 'pinetea', name: '솔잎차', kind: 'water', val: 2, mp: 1,
      note: '맛이 없다. 그래도 겨울에 이만한 게 없다.' },
    { id: 'beanpaste', name: '된장 한 덩이', kind: 'food', val: 3, hp: 1,
      note: '이십 년 묵은 것도 있다. 오래될수록 값이 오른다.' },
    { id: 'sewthread', name: '굵은 실패', kind: 'part', val: 1,
      note: '옷도 꿰매고 상처도 꿰맨다. 삶아서 쓴다.' },
    { id: 'schoolbell', name: '학교 종', kind: 'junk', val: 1, key: true,
      note: '치면 이 동네 사람이 다 나온다. 그래서 함부로 안 친다.' },
    { id: 'photoframe', name: '빈 액자', kind: 'junk', val: 0, key: true,
      note: '넣을 사진이 생기면 그때 넣는다.' },
    { id: 'winterglove', name: '두꺼운 장갑', kind: 'part', val: 2, warm: true,
      note: '손이 얼면 아무것도 못 한다. 아무것도.' },
    { id: 'ledlamp', name: '손전등', kind: 'part', val: 3,
      note: '축전지만 있으면 밤이 반으로 짧아진다.' },
    { id: 'tinsnip', name: '함석 가위', kind: 'part', val: 2,
      note: '지붕을 이는 사람에게는 이것이 곧 밥이다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

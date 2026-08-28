/* 부산 2033 - 아이템 (11)
 *
 * 「부산-온에어」가 들고 다니는 것들, 을숙도 씨앗 금고에서 나오는 것들,
 * 그리고 새 이야기들이 쓰는 물건.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 부산-온에어 ─────────────────────────── */
    { id: 'micdead', name: '선이 굵은 마이크', kind: 'key', val: 3, key: true,
      note: '십팔 년 동안 이 앞에서 하루 두 번 말했다. 손잡이가 닳아 있다.' },
    { id: 'tubebox', name: '진공관 상자', kind: 'part', val: 3,
      note: '남은 것이 넷이다. 하나가 반년을 간다.' },
    { id: 'scriptpile', name: '방송 원고 뭉치', kind: 'doc', val: 3, key: true,
      note: '만 삼천 장. 하루 두 장씩 십팔 년.' },
    { id: 'listenmap', name: '청취 구역 지도', kind: 'doc', val: 3, key: true,
      note: '어디까지 들리는지 손으로 그렸다. 해마다 줄고 있다.' },
    { id: 'headset', name: '한쪽만 되는 헤드폰', kind: 'part', val: 2,
      note: '오른쪽만 난다. 그래서 늘 왼쪽 귀로 세상을 듣는다.' },
    { id: 'callsign', name: '주파수 표찰', kind: 'key', val: 2, key: true,
      note: '89.1. 이 도시에서 이 숫자를 모르는 사람은 없다.' },
    { id: 'sunglass2', name: '눈 가리는 안경', kind: 'part', val: 1,
      note: '십팔 년 지하에 있던 눈은 볕을 못 견딘다.' },

    /* ── 을숙도 씨앗 금고 ────────────────────── */
    { id: 'seedcard', name: '종자 목록 카드', kind: 'doc', val: 3, key: true,
      note: '삼만 장 중 한 장. 심는 법과 익는 날짜가 적혀 있다.' },
    { id: 'seedbox', name: '봉인된 씨앗 상자', kind: 'key', val: 3, key: true,
      note: '열두 개 중 하나. 열면 되돌릴 수 없다.' },
    { id: 'vaultkey', name: '금고 이중 열쇠', kind: 'key', val: 3, key: true,
      note: '둘이 동시에 돌려야 열린다. 그래서 하나로는 아무것도 아니다.' },
    { id: 'sprouttray', name: '발아 시험 상자', kind: 'part', val: 2,
      note: '백 알을 심어 몇이 나오는지 센다. 그 숫자가 전부다.' },
    { id: 'coldpipe', name: '지하 냉각관 부품', kind: 'part', val: 3,
      note: '지하수를 돌려 온도를 잡는다. 이게 멈추면 삼만 장이 종이가 된다.' },
    { id: 'ricegrain', name: '옛 볍씨 한 줌', kind: 'food', val: 3,
      note: '먹으면 한 끼, 심으면 삼백 그루. 그 계산을 다들 한 번씩 한다.' },
    { id: 'appleseed', name: '사과씨 봉지', kind: 'food', val: 2,
      note: '심어서 열매를 보려면 팔 년이 걸린다. 그래서 아무도 안 심었다.' },
    { id: 'centletter', name: '백 년 뒤에 여는 편지', kind: 'doc', val: 3, key: true,
      note: '2133년이라고 겉봉에 적혀 있다. 쓴 사람은 못 본다.' },
    { id: 'birdband', name: '가락지 낀 깃털', kind: 'junk', val: 1, key: true,
      note: '을숙도에서 스무 해 전에 채운 가락지. 그 새가 아직 온다.' },

    /* ── 새 이야기들이 쓰는 물건 ───────────────── */
    { id: 'antenna2', name: '접이식 안테나', kind: 'part', val: 3,
      note: '펴면 사람 키의 세 배. 접으면 팔뚝만 하다.' },
    { id: 'crystal', name: '광석 라디오 부품', kind: 'part', val: 2,
      note: '전기 없이도 소리가 난다. 아주 작게.' },
    { id: 'tapeblank', name: '빈 테이프', kind: 'part', val: 2,
      note: '녹음할 것이 있어야 값을 한다. 그게 제일 어렵다.' },
    { id: 'speakerhorn', name: '나팔 확성기', kind: 'part', val: 2,
      note: '전기가 없어도 소리를 세 배로 만든다.' },
    { id: 'sundial', name: '해시계 판', kind: 'junk', val: 1,
      note: '흐린 날에는 아무 쓸모가 없다. 맑은 날에는 시계보다 정확하다.' },
    { id: 'rainbarrel', name: '빗물통', kind: 'part', val: 2,
      note: '지붕 하나가 한 해에 물 사십 통을 만든다.' },
    { id: 'grafttool', name: '접붙이는 칼', kind: 'part', val: 2,
      note: '나무 둘을 하나로 만든다. 이 도시에서 이걸 쓸 줄 아는 사람이 셋이다.' },
    { id: 'beehive2', name: '벌통 한 채', kind: 'part', val: 3,
      note: '꿀보다 중요한 것은 벌이 밭을 돈다는 것이다.' },
    { id: 'wormbin', name: '지렁이 통', kind: 'part', val: 2,
      note: '음식 찌꺼기를 흙으로 바꾼다. 그 흙이 이 도시에서 값이 나간다.' },
    { id: 'seedledger2', name: '심은 것 장부', kind: 'doc', val: 2, key: true,
      note: '언제 뭘 어디에 심었는지. 안 적으면 다음 해에 잊는다.' },
    { id: 'nightglass', name: '야간용 렌즈', kind: 'part', val: 3,
      note: '별빛만으로 스무 걸음을 본다. 그 스무 걸음이 밤을 바꾼다.' },
    { id: 'firebow', name: '비비는 불씨 도구', kind: 'part', val: 2,
      note: '라이터가 죽어도 이건 안 죽는다. 대신 팔이 아프다.' },
    { id: 'snowshoe', name: '눈신', kind: 'part', val: 2, warm: true,
      note: '이 도시에 눈이 오는 날이 한 해에 나흘이다. 그 나흘에 값을 한다.' },
    { id: 'facecloth', name: '얼굴 가리개', kind: 'part', val: 1,
      note: '재가 날리는 날에 쓴다. 얼굴을 안 보이려고 쓰기도 한다.' },
    { id: 'ledgerpen', name: '잉크가 남은 펜', kind: 'junk', val: 1,
      note: '이 도시에서 펜은 대개 말라 있다. 이건 아직 나온다.' },
    { id: 'tinlamp', name: '깡통 등잔', kind: 'part', val: 1,
      note: '기름 한 숟가락이면 두 시간이다.' },
    { id: 'clayjar', name: '옹기 항아리', kind: 'part', val: 2,
      note: '숨을 쉬는 그릇. 이 안에 든 것은 안 상한다.' },
    { id: 'noodlepress', name: '국수틀', kind: 'part', val: 2,
      note: '누르면 국수가 나온다. 그 앞에 사람이 줄을 선다.' },
    { id: 'measurecup', name: '눈금 있는 컵', kind: 'junk', val: 1,
      note: '약을 지을 때 이게 있는 것과 없는 것은 다르다.' },
    { id: 'sootsoap', name: '재로 만든 비누', kind: 'med', val: 1, hp: 1, cures: 'infection',
      note: '씻는 것이 약보다 앞선다는 걸 여기서는 다들 안다.' },
    { id: 'driedherb', name: '말린 약초 다발', kind: 'med', val: 2, hp: 1,
      note: '쑥, 익모초, 그리고 이름 모를 것 하나.' },
    { id: 'chestwrap', name: '가슴 두르는 천', kind: 'med', val: 2, hp: 1, cures: 'bleeding',
      note: '갈비가 나갔을 때 이걸로 조인다. 숨이 짧아지는 대신 살아난다.' },
    { id: 'honeyjar2', name: '꿀 한 단지', kind: 'food', val: 3, hp: 2,
      note: '상하지 않는 몇 안 되는 것. 상처에도 바른다.' },
    { id: 'seaweedcake', name: '김 뭉치', kind: 'food', val: 2, hp: 1,
      note: '가볍고 짜다. 걸을 때 제일 좋은 것.' },
    { id: 'barleymeal', name: '보릿가루 한 자루', kind: 'food', val: 2, hp: 1,
      note: '물에 개면 그대로 한 끼. 불이 없어도 된다.' },
    { id: 'appleold', name: '사과 한 알', kind: 'food', val: 3, hp: 1, mp: 1,
      note: '이 도시에서 사과를 본 사람은 스무 해에 몇 없다.' },
    { id: 'radioset', name: '조립 라디오', kind: 'part', val: 3,
      note: '89.1 에 맞춰져 있다. 다른 데는 안 잡힌다.' },
    { id: 'gramophone', name: '태엽 축음기', kind: 'lux', val: 3, mp: 1,
      note: '전기가 필요 없다. 감으면 돈다. 판이 두 장 있다.' },
    { id: 'vinylrec', name: '판 한 장', kind: 'lux', val: 2, mp: 1,
      note: '한쪽 면은 긁혔고 한쪽 면은 멀쩡하다.' },
    { id: 'schoolslate', name: '석판과 분필', kind: 'junk', val: 1,
      note: '썼다 지웠다 한다. 종이가 없는 데서는 이게 공책이다.' },
    { id: 'weathervane', name: '바람개비', kind: 'junk', val: 1,
      note: '지붕에 달아 놓으면 바람 방향을 안다. 그게 생각보다 중요하다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

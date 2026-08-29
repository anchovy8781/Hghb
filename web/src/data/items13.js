/* 부산 2033 - 물건 (13) 문 뒤에 남은 것
 *
 * 종장 근처와 새 특별 이야기에서 나오는 물건들.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};
  const ADD = [
    { id: 'doorkey', name: '문 여는 열쇠', kind: 'key', val: 4, key: true,
      note: '어느 문인지는 안 적혀 있습니다. 열어 보면 압니다.' },
    { id: 'nightbread', name: '밤에 구운 빵', kind: 'food', val: 3, hp: 1, mp: 1,
      note: '아침까지 못 갑니다. 그래서 밤에 다 먹습니다.' },
    { id: 'saltjar', name: '소금 단지', kind: 'food', val: 3,
      note: '이 도시에서 소금은 돈으로 셉니다.' },
    { id: 'gasmaskfilter', name: '여분 정화통', kind: 'part', val: 3,
      note: '숨 쉬는 시간을 사는 겁니다.' },
    { id: 'radioparts', name: '무전기 부속', kind: 'part', val: 3,
      note: '이것만으로는 안 됩니다. 셋을 모아야 합니다.' },
    { id: 'oldcoin', name: '쓸 수 없는 동전', kind: 'lux', val: 2,
      note: '이걸로 물건을 사던 시절이 있었답니다.' },
    { id: 'schoolphoto', name: '반 사진 한 장', kind: 'doc', val: 2, mp: 2,
      note: '뒷면에 마흔 명 이름이 적혀 있습니다.' },
    { id: 'painmild', name: '순한 진통제', kind: 'med', val: 2, hp: 1,
      note: '독하지 않아 애들한테도 씁니다.' },
    { id: 'ironwill', name: '버티는 마음', kind: 'mood', val: 2, mp: 2,
      note: '오늘 하루만 더. 그 말을 십팔 년 했습니다.' },
    { id: 'shamefeel', name: '부끄러움', kind: 'mood', val: 0, bad: true,
      note: '문 앞에서 돌아섰던 날의 기억.' },
    { id: 'bellrope', name: '종 치는 줄', kind: 'junk', val: 2,
      note: '종은 없고 줄만 남았습니다.' },
    { id: 'seedpouch2', name: '주머니에 넣은 씨앗', kind: 'food', val: 3,
      note: '먹을 수도 있고 심을 수도 있습니다. 둘 다는 못 합니다.' },
    { id: 'waterproof', name: '기름 먹인 천', kind: 'part', val: 2,
      note: '비를 반나절 막아 줍니다.' },
    { id: 'oldkeytag', name: '번호 붙은 열쇠고리', kind: 'key', val: 2, key: true,
      note: '「307」. 그 방에 누가 살았는지는 모릅니다.' },
    { id: 'ricewine', name: '담근 지 오래된 술', kind: 'lux', val: 3, mp: 2, drug: true,
      note: '독합니다. 두 잔이면 하루를 잃습니다.' },
    { id: 'flarered', name: '붉은 조명탄', kind: 'part', val: 3,
      note: '한 번 쓰면 끝입니다. 그래서 아무 때나 못 씁니다.' },
    { id: 'coalbrick', name: '연탄 한 장', kind: 'part', val: 2, warm: true,
      note: '스물두 구멍입니다. 세어 본 사람이 있습니다.' },
    { id: 'furboot', name: '털 댄 장화', kind: 'part', val: 3, warm: true, armor: 1,
      broken: 'furbootsplit', note: '발이 젖으면 그날 걷는 거리가 반으로 줍니다.' },
    { id: 'furbootsplit', name: '터진 장화', kind: 'junk', val: 0,
      note: '기울 수는 있습니다. 실이 있다면요.' },
    { id: 'livelist', name: '살아 있는 사람 명부', kind: 'doc', val: 3, mp: 1, key: true,
      note: '죽은 사람 명부는 두껍고 이건 얇습니다.' },
    { id: 'ropebelt', name: '연장 두르는 띠', kind: 'part', val: 3,
      note: '손이 두 개라는 걸 잊게 해 줍니다.' },
    { id: 'chalkpack', name: '분필 한 상자', kind: 'junk', val: 1,
      note: '벽에 쓸 게 남은 사람에게는 귀합니다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

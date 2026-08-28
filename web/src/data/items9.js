/* 부산 2033 - 아이템 (9)
 *
 * 부산대병원 장편에서 나오는 것들과, 새로 생긴 이야기들이 쓰는 물건.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 부산대병원 ─────────────────────────── */
    { id: 'hosprec', name: '진료 기록 뭉치', kind: 'doc', val: 3, key: true,
      note: '이 도시 사람 절반의 이름이 여기 있다. 살았는지는 안 적혀 있다.' },
    { id: 'wardroll', name: '병동 명부', kind: 'doc', val: 3, key: true,
      note: '호수와 이름. 이름이 비어 있는 칸이 몇 개 있다.' },
    { id: 'dutylist', name: '의국 당직표', kind: 'doc', val: 2, key: true,
      note: '2015년 8월 3일 칸에 이름 넷. 그중 하나에만 동그라미가 있다.' },
    { id: 'hospkey', name: '병원 마스터키', kind: 'key', val: 3, key: true,
      note: '약제부와 혈액은행까지 열린다. 영안실은 원래 안 잠근다.' },
    { id: 'surgset', name: '수술 기구 한 벌', kind: 'part', val: 3,
      note: '멸균 포에 싸인 채다. 포를 뜯는 순간부터 시간이 간다.' },
    { id: 'ventpart', name: '인공호흡기 부품', kind: 'part', val: 3,
      note: '이것 하나로 사람 하나가 하루를 더 산다.' },
    { id: 'bloodcard', name: '혈액형 카드', kind: 'doc', val: 2, key: true,
      note: '이 동네에서 O형 음성이 몇인지 적혀 있다. 넷이다.' },
    { id: 'babytag', name: '신생아 이름표', kind: 'junk', val: 0, key: true,
      note: '이름 대신 산모 성만 적혀 있다. 그날 태어난 아이 것이다.' },
    { id: 'cesiumpot', name: '납으로 싼 통', kind: 'part', val: 3,
      note: '영상의학과 것. 열지 않는 한 안전하다. 열면 안 그렇다.' },
    { id: 'whitecoat', name: '흰 가운', kind: 'part', val: 2, warm: true,
      note: '입으면 사람들이 길을 비킨다. 이십 년이 지나도 그렇다.' },
    { id: 'ivstand', name: '수액 거치대', kind: 'part', val: 1,
      note: '바퀴가 셋만 남았다. 짚고 걸으면 지팡이도 된다.' },
    { id: 'ivbag', name: '수액 한 봉', kind: 'med', val: 2, hp: 2,
      note: '팔에 꽂고 삼십 분 앉아 있어야 한다. 그 삼십 분이 값이다.' },
    { id: 'sterilkit', name: '멸균 세트', kind: 'med', val: 2, hp: 1, cures: 'infection',
      note: '끓인 물과 이것만 있으면 상처가 덧나지 않는다.' },
    { id: 'oxymask', name: '산소마스크', kind: 'med', val: 2, hp: 1,
      note: '통이 있어야 쓴다. 통은 무겁다.' },
    { id: 'hospbadge', name: '병원 명찰', kind: 'key', val: 2, key: true,
      note: '이름 아래 직책이 적혀 있다. 이십 년째 유효하다.' },
    { id: 'wardlamp', name: '병동 비상등', kind: 'part', val: 2,
      note: '초록빛이다. 복도 끝까지 이것만 보고 걷는다.' },
    { id: 'crashcart', name: '응급 카트 서랍', kind: 'med', val: 3, hp: 2,
      note: '한 서랍에 사람 하나 살릴 것이 다 들어 있다. 한 번뿐이다.' },
    { id: 'lastchart', name: '마지막 차트', kind: 'doc', val: 3, key: true,
      note: '마지막 줄이 쓰다 말았다. 펜이 종이에 눌린 자국까지 남았다.' },

    /* ── 갱도 · 강 · 그날 ───────────────────── */
    { id: 'blastcap', name: '오래된 뇌관', kind: 'part', val: 2,
      note: '이십 년 묵었다. 터질 수도 있고 안 터질 수도 있다.' },
    { id: 'minecart', name: '갱차 바퀴', kind: 'part', val: 2,
      note: '궤도만 있으면 아직 구른다.' },
    { id: 'minerroll', name: '광부 명부', kind: 'doc', val: 2, key: true,
      note: '1974년부터 적혔다. 마지막 장은 1993년이다.' },
    { id: 'shroomlog', name: '갱도 버섯 자루', kind: 'food', val: 2, hp: 1,
      note: '햇빛 없이 자란다. 그래서 이 도시에서 제일 안전한 밥이다.' },
    { id: 'batguano', name: '박쥐 거름 한 포', kind: 'part', val: 2,
      note: '밭에 뿌리면 두 배가 난다. 냄새는 각오해야 한다.' },
    { id: 'ferrytoken', name: '나룻배 표', kind: 'key', val: 1, key: true,
      note: '한 번 건널 수 있다. 사공이 직접 깎았다.' },
    { id: 'riverlantern', name: '유등 한 개', kind: 'junk', val: 0, key: true,
      note: '이름을 적어 띄운다. 적을 이름이 없는 사람은 안 띄운다.' },
    { id: 'fishmut', name: '지느러미가 넷인 물고기', kind: 'junk', val: 1, key: true,
      note: '먹지 말라고 한다. 아무도 안 먹는다.' },
    { id: 'intakekey', name: '취수장 열쇠', kind: 'key', val: 3, key: true,
      note: '이 도시 상수도가 마지막으로 돌던 자리의 문을 연다.' },
    { id: 'radarlog', name: '방공 관측 기록', kind: 'doc', val: 3, key: true,
      note: '삼 분짜리 기록이다. 그 삼 분이 전부였다.' },
    { id: 'ordercopy', name: '명령서 사본', kind: 'doc', val: 3, key: true,
      note: '서명 칸이 비어 있다. 그게 이 종이의 전부다.' },
    { id: 'sigbook', name: '통신 암구호책', kind: 'doc', val: 2, key: true,
      note: '2015년 8월 것. 그날 이후로 쓴 사람이 없다.' },
    { id: 'threemin', name: '삼 분 녹음', kind: 'doc', val: 3, key: true,
      note: '테이프 한 통. 사람 목소리가 셋 나온다.' },

    /* ── 새 이야기들이 쓰는 물건 ───────────── */
    { id: 'icebox', name: '아이스박스', kind: 'part', val: 2,
      note: '얼음만 있으면 사흘을 번다. 얼음이 없다.' },
    { id: 'saltblock', name: '소금 덩이', kind: 'food', val: 2,
      note: '이 도시에서 제일 안 상하는 재산.' },
    { id: 'ropeladder', name: '줄사다리', kind: 'part', val: 2,
      note: '말아서 들고 다닌다. 내려갈 데가 늘 생긴다.' },
    { id: 'signalmirror', name: '신호용 거울', kind: 'part', val: 2,
      note: '해만 있으면 오 킬로까지 간다.' },
    { id: 'trapkit', name: '덫 한 벌', kind: 'part', val: 2,
      note: '놓고 하루를 기다린다. 기다리는 게 기술이다.' },
    { id: 'sewkit2', name: '큰 반짇고리', kind: 'part', val: 2,
      note: '두꺼운 바늘과 굵은 실. 옷도 사람도 꿰맨다.' },
    { id: 'chalkbox', name: '분필 한 통', kind: 'junk', val: 1,
      note: '길 위에 표시를 남긴다. 비 오면 지워진다.' },
    { id: 'pressgauge', name: '압력계', kind: 'part', val: 2,
      note: '바늘이 빨간 칸에 들어가면 그 자리를 떠야 한다.' },
    { id: 'earplug', name: '귀마개', kind: 'part', val: 1,
      note: '총소리와 코 고는 소리를 같이 막는다.' },
    { id: 'winterboot', name: '방한화', kind: 'part', val: 2, warm: true,
      note: '발이 따뜻하면 밤이 반으로 줄어든다.' },
    { id: 'kneepad', name: '무릎 보호대', kind: 'part', val: 2, armor: 1, broken: 'kneepadtorn',
      note: '한 번 크게 부딪히면 이것이 대신 깨진다.' },
    { id: 'kneepadtorn', name: '깨진 무릎 보호대', kind: 'junk', val: 0,
      note: '한 번 값을 했다. 천을 대면 한 번 더 한다.' },
    { id: 'coffeecan', name: '깡통 커피', kind: 'water', val: 2, mp: 1,
      note: '이 도시에 남은 커피가 몇 통인지 세는 사람이 있다.' },
    { id: 'chesspiece', name: '장기 알 한 벌', kind: 'junk', val: 1,
      note: '차가 하나 없다. 병으로 대신 쓴다.' },
    { id: 'harmonica2', name: '녹슨 하모니카', kind: 'lux', val: 2, mp: 1,
      note: '두 음이 안 난다. 그 두 음을 피해 부는 사람이 있다.' },
    { id: 'babyshoe', name: '아기 신발 한 짝', kind: 'junk', val: 0, key: true,
      note: '한 짝뿐이다. 나머지 한 짝을 찾는 사람이 있을 것이다.' },
    { id: 'toolbelt', name: '공구 벨트', kind: 'part', val: 2,
      note: '손이 두 개인 사람이 네 가지를 동시에 들 수 있게 한다.' },
    { id: 'seedpack2', name: '겨울 씨앗 봉지', kind: 'food', val: 2,
      note: '심으면 봄에 먹는다. 먹으면 오늘 먹는다.' },
    { id: 'lampoil', name: '등잔 기름 한 병', kind: 'part', val: 2,
      note: '밤을 세 시간 늘려 준다.' },
    { id: 'sootink', name: '그을음 먹', kind: 'junk', val: 1,
      note: '벽에 쓰면 비에도 안 지워진다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

/* 부산 2033 - 여정 밖의 것들 (둘)
 *
 * 미션과 우편을 덧붙인다. meta.js 다음에 읽힌다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  const MORE_MISSIONS = [
    { id: 'm_long', name: '끝까지 본 이야기', desc: '장편 이야기를 {n}편 끝까지 본다', want: 'longs', goal: [1, 2, 4], reward: [100, 220, 460] },
    { id: 'm_chapter', name: '장을 넘기다', desc: '{n}장까지 나아간다', want: 'chapter', goal: [2, 4, 6], reward: [60, 140, 300] },
    { id: 'm_money', name: '주머니 사정', desc: '돈을 {n}까지 모은다', want: 'money', goal: [30, 80, 160], reward: [50, 120, 260] },
    { id: 'm_enc', name: '많이 겪은 사람', desc: '사건을 {n}번 지나온다', want: 'enc', goal: [60, 120, 200], reward: [40, 100, 220] },
    { id: 'm_kinds', name: '잡화상', desc: '서로 다른 물건을 {n}가지 지닌다', want: 'kinds', goal: [15, 30, 50], reward: [50, 130, 290] },
    { id: 'm_food', name: '곳간', desc: '식량을 {n}개 지닌다', want: 'food', goal: [5, 12, 22], reward: [40, 100, 210] },
    { id: 'm_med', name: '약상자', desc: '약을 {n}개 지닌다', want: 'med', goal: [2, 4, 7], reward: [50, 120, 250] },
    { id: 'm_water', name: '물 걱정', desc: '마실 것을 {n}개 지닌다', want: 'water', goal: [3, 6, 10], reward: [40, 100, 210] },
    { id: 'm_ammo', name: '탄약통', desc: '탄약을 {n}발 지닌다', want: 'ammo', goal: [10, 30, 60], reward: [60, 140, 300] },
    { id: 'm_doc', name: '읽는 사람', desc: '읽을거리를 {n}개 지닌다', want: 'doc', goal: [2, 5, 9], reward: [50, 120, 250] },
    { id: 'm_lux', name: '없어도 되는 것', desc: '사치품을 {n}개 지닌다', want: 'lux', goal: [1, 3, 6], reward: [50, 120, 250] },
    { id: 'm_repsum', name: '두루 아는 사람', desc: '세력 평판을 다 합쳐 {n}을 만든다', want: 'repsum', goal: [3, 6, 10], reward: [70, 150, 320] },
    { id: 'm_armor', name: '단단한 옷', desc: '몸을 막아 주는 옷이나 장비를 갖춘다', want: 'armor', goal: [1, 1, 1], reward: [70, 70, 70] },
    { id: 'm_revive', name: '두 번 사는 사람', desc: '죽음의 문턱에서 {n}번 돌아온다', want: 'revive', goal: [1, 2, 3], reward: [90, 200, 420] }
  ];

  B.MISSIONS = (B.MISSIONS || []).concat(MORE_MISSIONS);

  const MORE_MAIL = [
    { id: 'mail_origin', from: '조합 등록소',
      title: '어디서 왔는지 적으십시오',
      body: '이 도시는 사람을 이름으로 안 셉니다. 어디서 왔는지로 셉니다.\n\n여정을 시작하면 맨 처음에 시작 사연을 고르게 됩니다.\n산에서 십팔 년을 산 사람, 병상에서 십팔 년을 잔 사람,\n식장에서 혼자 기다리던 사람, 방송을 계속 내보내던 사람,\n서울에서 헬기를 타고 온 사람 — 다섯입니다.\n\n같은 도시인데 다섯 번 다르게 보입니다. 다섯 번 다 걸어 보십시오.',
      cookies: 800 },
    { id: 'mail_wed', from: '이름 없는 하객',
      title: '식장에 두고 온 것',
      body: '해운대 어느 식장에서 문이 삼십 분 늦게 열렸다는 이야기를 들었습니다.\n안에 있던 사람은 아직 그 문을 붙들고 있다고 합니다.\n\n「언어치브드 메리에이지」는 그 사람의 이야기입니다.\n부케를 끝까지 들고 가면 문 앞에서 무엇을 할 수 있는지 아실 겁니다.',
      cookies: 600 },
    { id: 'mail_saver', from: '서울 구조본부 (수신 불가)',
      title: '부산-세이버 · 임무 기록',
      body: '헬기 한 대가 부산 상공에서 신호를 잃었습니다. 열 장 분량의 기록이 남았습니다.\n마지막 장에 이렇게 적혀 있습니다.\n\n「본 임무는 구조가 아니라 확인이다」\n\n무엇을 확인하러 왔는지는 걸어 보셔야 압니다.',
      cookies: 600 },
    { id: 'mail_end', from: '기록실 관리인',
      title: '문 앞에서 갈리는 것',
      body: '끝은 하나가 아닙니다. 스물여섯 갈래로 적어 두었습니다.\n\n종장에 닿으면 먼저 당신이 온 곳의 장면이 한 번 지나갑니다.\n거기서만 볼 수 있는 끝이 사연마다 둘씩 있습니다.\n문 안쪽에도 조건이 붙은 갈래가 셋 더 있습니다.\n\n장편을 셋 끝내고 오십시오. 능력을 서른 가지 익히고 오십시오.\n그러면 문 안쪽에서 다른 말을 할 수 있습니다.',
      cookies: 900 },
    { id: 'mail_shop', from: '중앙동 이야기 좌판',
      title: '좌판에 아홉 편',
      body: '장편 이야기를 아홉 편 올려 두었습니다. 짧은 것도 스무 장면부터 시작합니다.\n\n사 두면 다음 여정부터 정해진 쪽수에서 저절로 끼어듭니다.\n한 여정에 여러 편을 켜 두어도 됩니다. 순서대로 옵니다.\n\n다만 다 켜 두면 걷는 시간이 그만큼 밀립니다. 그것도 알고 사십시오.',
      cookies: 1200 }
  ];

  B.MAIL = (B.MAIL || []).concat(MORE_MAIL);

})(typeof globalThis !== 'undefined' ? globalThis : this);

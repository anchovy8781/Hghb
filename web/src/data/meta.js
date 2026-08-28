/* 부산 2033 - 여정 밖의 것들
 *
 * 쿠키(재화) · 미션 · 우편함 · 상점에 올라가는 장편 이야기 목록.
 * 여정 하나가 끝나도 안 지워지는 기록(busan2033.records.v1)에 같이 저장된다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  /* ── 미션 ────────────────────────────────────
   *   want 는 한 여정 안에서 재는 값이다. 갱신을 누르면 새로 뽑는다.
   *   goal 은 목표 수치, reward 는 쿠키.
   */
  B.MISSIONS = [
    { id: 'm_walk', name: '오래 걷기', desc: '한 여정에서 {n}페이지를 넘긴다', want: 'page', goal: [120, 300, 600], reward: [40, 90, 200] },
    { id: 'm_sp', name: '남의 이야기', desc: '특별 이야기를 {n}편 지나온다', want: 'specials', goal: [2, 5, 10], reward: [60, 140, 300] },
    { id: 'm_title', name: '이름을 얻는 일', desc: '칭호를 {n}개 얻는다', want: 'titles', goal: [1, 3, 6], reward: [50, 120, 260] },
    { id: 'm_skill', name: '몸에 붙는 것', desc: '능력을 {n}가지 익힌다', want: 'skills', goal: [3, 8, 15], reward: [40, 100, 220] },
    { id: 'm_deep', name: '깊어지는 손', desc: 'Lv.3 능력을 {n}가지 만든다', want: 'deep', goal: [1, 2, 4], reward: [80, 180, 400] },
    { id: 'm_junk', name: '주머니의 무게', desc: '잡동사니를 {n}개 지닌다', want: 'junk', goal: [3, 8, 15], reward: [30, 80, 170] },
    { id: 'm_key', name: '못 버리는 것', desc: '유품을 {n}개 지닌다', want: 'keys', goal: [2, 5, 9], reward: [50, 120, 250] },
    { id: 'm_rep', name: '이름값', desc: '세력 하나에서 평판 {n}을 얻는다', want: 'rep', goal: [2, 3, 4], reward: [60, 130, 280] },
    { id: 'm_craft', name: '만드는 손', desc: '물건을 {n}개 만든다', want: 'crafted', goal: [1, 3, 6], reward: [50, 110, 240] },
    { id: 'm_gun', name: '맞는 탄', desc: '쏠 수 있는 총을 {n}자루 갖춘다', want: 'armed', goal: [1, 2, 3], reward: [70, 150, 320] },
    { id: 'm_pet', name: '같이 걷는 것', desc: '짐승을 길들인다', want: 'pet', goal: [1, 1, 1], reward: [90, 90, 90] },
    { id: 'm_base', name: '돌아갈 자리', desc: '아지트를 거처로 삼는다', want: 'base', goal: [1, 1, 1], reward: [90, 90, 90] },
    { id: 'm_ks', name: '수집가', desc: '수집한 이야기를 {n}편 모은다', want: 'keepsakes', goal: [1, 3, 6], reward: [80, 180, 380] },
    { id: 'm_heal', name: '성한 몸', desc: '체력과 멘탈을 세 칸씩 채운 채로 {n}페이지를 지난다', want: 'full', goal: [80, 200, 400], reward: [70, 160, 340] },
    { id: 'm_warm', name: '두꺼운 옷', desc: '두꺼운 옷을 갖춘다', want: 'warm', goal: [1, 1, 1], reward: [60, 60, 60] },
    { id: 'm_end', name: '끝까지', desc: '종장에 닿는다', want: 'finale', goal: [1, 1, 1], reward: [500, 500, 500] }
  ];

  /* ── 우편함 ──────────────────────────────────
   *   받으면 그걸로 끝. 다시 못 받는다.
   */
  B.MAIL = [
    { id: 'mail_open', from: '부산 2033 만든 사람',
      title: '먼저 드립니다',
      body: '이 도시는 값을 먼저 받고 물건을 나중에 주는 곳이 아닙니다.\n그래서 먼저 드립니다.\n\n상점에 장편 이야기 넷을 올려 두었습니다. 미션을 하면 쿠키가 더 쌓입니다.\n무엇부터 살지는 당신이 정하십시오.',
      cookies: 50000 },
    { id: 'mail_mission', from: '조합 배급소',
      title: '미션에 대하여',
      body: '미션은 셋이 붙어 있습니다. 마음에 안 들면 갱신을 누르십시오.\n한 여정 안에서 조건을 채우면 그 자리에서 쿠키가 들어옵니다.\n\n갱신은 몇 번이든 됩니다. 다만 이미 끝낸 미션은 갱신해도 안 사라집니다.',
      cookies: 300 },
    { id: 'mail_coma', from: '해운대 지하 병동',
      title: '깨어난 사람에게',
      body: '십팔 년을 누워 있다가 일어난 사람이 이 도시에 몇 있습니다.\n당신도 그중 하나가 될 수 있습니다.\n\n게임 시작 화면에서 시작 사연을 고를 수 있습니다.\n「부산-코마」는 다른 이야기를 겪습니다. 같은 도시인데 다르게 보입니다.',
      cookies: 500 }
  ];

  /* ── 상점 ────────────────────────────────────
   *   장편 이야기는 B.LONGS 에 들어 있고, 여기서는 값만 매긴다.
   */
  B.SHOP_PRICE = { land: 150, mine: 150, river: 150, nuke: 180, hosp: 170,
                   air: 160, yard: 170, seed: 175 };

})(typeof globalThis !== 'undefined' ? globalThis : this);

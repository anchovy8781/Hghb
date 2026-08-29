/* 부산 2033 - 기존 사건에 붙이는 선택지 (6)
 *
 * 새로 생긴 물건(들것 · 지혈대 · 부목 · 안전모 · 쌍안경 · 침낭 · 야전 버너 ·
 * 갈고리 장대 · 방진 마스크 · 보온병)이 실제로 쓰이는 자리를 만듭니다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MORE = {

    haz_collapse: [
      { t: '안전모를 쓰고 들어간다.', need: { item: 'hardhat' },
        res: ['무너진 데서 위험한 것은 발밑이 아니라 머리 위입니다.',
               '안전모를 쓰고 기어 들어갑니다. 삼십 미터를 갑니다.',
               '나오는 길에 조각이 하나 떨어져 머리를 칩니다. 안전모가 대신 깨집니다.'],
        eff: { add: ['{item}'], del: ['hardhat'], add2: ['hardhatcrack'], mp: 2 } },
      { t: '갈고리 장대로 헤집는다.', need: { item: 'firehook' },
        res: ['손을 넣으면 안 되는 자리가 있습니다. 장대로 헤집습니다.',
               '조각 아래에서 뭔가가 걸려 나옵니다. 가방입니다.',
               '가방 주인은 안 나옵니다. 그건 다행인 쪽입니다.'],
        eff: { add: ['{item}', 'lunchbox'], mp: 2 } }
    ],

    haz_fire: [
      { t: '방진 마스크를 나눠 준다.', need: { item: 'ashmask' }, cost: { item: 'ashmask' },
        res: ['불에서 사람을 죽이는 것은 열이 아니라 연기입니다.',
               '가진 것을 제일 안쪽에 들어가는 사람에게 줍니다.',
               '그 사람이 이 분을 더 버팁니다. 그 이 분에 둘이 나옵니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } },
      { t: '화상 드레싱을 쓴다.', need: { item: 'burnkit' }, cost: { item: 'burnkit' },
        res: ['화상은 먼저 차게 하고 그다음에 덮습니다. 순서를 바꾸면 안 됩니다.',
               '물을 붓고 십 분을 식힌 뒤에 덮습니다.',
               '"이거 안 하면 어떻게 됩니까." 흉이 남고, 심하면 그 자리가 안 낫습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    haz_water: [
      { t: '갈고리 장대로 건진다.', need: { item: 'firehook' },
        res: ['물에 빠진 사람에게 손을 내밀면 둘 다 빠집니다. 장대를 내밀어야 합니다.',
               '장대 끝을 잡게 하고 당깁니다. 이 미터쯤 끌어옵니다.',
               '올라온 사람이 한참 기침을 합니다. 그러고 나서 장대를 안 놓습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    haz_storm: [
      { t: '침낭에 들어가 밤을 난다.', need: { item: 'sleepbag' },
        res: ['땅에서 올라오는 냉기가 절반입니다. 침낭은 그걸 막습니다.',
               '비바람 속에서도 안이 마릅니다. 그게 이 물건의 값입니다.',
               '아침에 나와 보니 옆에서 잔 사람은 밤새 떨었습니다.'],
        eff: { hp: 1, mp: 2, add: ['warmth'] } },
      { t: '야전 버너로 물을 끓인다.', need: { item: 'fieldstove' },
        res: ['비 오는 날에 불을 피우는 것은 거의 안 됩니다. 이건 됩니다.',
               '기름 몇 방울로 물 한 통을 끓입니다. 연기도 거의 안 납니다.',
               '따뜻한 물 한 컵이 젖은 밤에 얼마나 큰지는 겪어 봐야 압니다.'],
        eff: { hp: 1, mp: 3, add: ['warmth', 'water'], rep: { free: 1 } } }
    ],

    meet_medic: [
      { t: '지혈대 쓰는 법을 알려 준다.', need: { item: 'tourniquet' },
        res: ['조인 시각을 이마에 적어야 합니다. 안 적으면 팔을 잃습니다.',
               '"왜 이마에 씁니까." 옮기는 사람이 제일 먼저 보는 데라서요.',
               '그날부터 이 진료소에서 지혈대에 시각을 적기 시작합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } },
      { t: '부목 한 벌을 놓고 간다.', need: { item: 'splintset' }, cost: { item: 'splintset' },
        res: ['길이가 셋입니다. 팔, 아래다리, 넓적다리.',
               '"이 셋이면 웬만한 건 다 잡습니다." 나무를 깎아 쓰던 것보다 훨씬 낫습니다.',
               '"이거 어디서 났습니까." 대답 대신 다음에 또 가져오겠다고 합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } }
    ],

    meet_runner: [
      { t: '쌍안경을 빌려 준다.', need: { item: 'binocular' },
        res: ['전령은 앞을 미리 봐야 합니다. 못 보면 걸어 들어갑니다.',
               '언덕에서 앞길을 봅니다. 이 킬로 앞에 사람이 넷 서 있습니다.',
               '길을 돌아갑니다. 한 시간이 더 걸리고, 대신 무사합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'stable'] } },
      { t: '보온병에 뜨거운 것을 담아 준다.', need: { item: 'thermos' }, cost: { item: 'thermos' },
        res: ['하루 종일 걷는 사람에게 뜨거운 것은 밥보다 낫습니다.',
               '끓인 물에 보릿가루를 풀어 담아 줍니다.',
               '"이거 저녁까지 따뜻합니까." 따뜻합니다. 그 말에 눈이 커집니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } }
    ],

    meet_soldier: [
      { t: '구조대 이야기를 묻는다.',
        res: ['"하늘에서 내려온 사람들 얘기 들으셨습니까." 들었답니다.',
               '"진짭니까." "…진짜지예. 우리도 그날 연기 봤습니다."',
               '"그럼 밖이 있는 겁니까." 그 질문에 이 사람이 총을 고쳐 멥니다. "…있겠지예."'],
        eff: { mp: 2, add: ['note', 'hope'] } }
    ],

    town_gate: [
      { t: '쌍안경으로 앞길을 봐 준다.', need: { item: 'binocular' },
        res: ['초소에서 앞길이 이 킬로 보입니다. 눈으로는 오백 미터입니다.',
               '쌍안경을 대니 이 킬로가 다 보입니다.',
               '"이거 있으면 미리 압니다." 그 차이가 초소에서는 큽니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'stable'] } },
      { t: '들것을 들고 지나간다.', need: { item: 'stretcher' },
        res: ['들것을 든 사람은 아무도 안 막습니다. 이십 년 동안 그랬습니다.',
               '초소 사람이 통행료 얘기를 꺼내려다가 들것을 보고 맙니다.',
               '"어디까지 갑니까." 언덕 위라고 하니 길을 터 줍니다.'],
        eff: { mp: 2, rep: { free: 1 } } }
    ],

    town_work: [
      { t: '안전모를 나눠 준다.', need: { item: 'hardhat' }, cost: { item: 'hardhat' },
        res: ['공사판에서 머리를 가린 사람이 하나도 없습니다.',
               '가진 것을 제일 위에서 일하는 사람에게 줍니다.',
               '한 달 뒤에 그 사람이 찾아옵니다. 안전모가 깨져 있습니다. 그 사람은 멀쩡합니다.'],
        eff: { money: 1, mp: 3, rep: { free: 2 }, add: ['goodrep', 'hardhatcrack'] } }
    ],

    rest_camp: [
      { t: '야전 버너로 밥을 짓는다.', need: { item: 'fieldstove' },
        res: ['불을 피우면 연기가 나고 연기가 나면 사람이 옵니다.',
               '버너는 연기가 거의 안 납니다. 그래서 위험한 자리에서 밥을 지을 수 있습니다.',
               '따뜻한 밥을 먹고 불은 안 피웁니다. 그날 밤에 아무도 안 옵니다.'],
        eff: { hp: 1, mp: 3, add: ['warmth', 'stable'] } },
      { t: '침낭을 펴고 잔다.', need: { item: 'sleepbag' },
        res: ['땅에 그냥 누우면 아래에서 냉기가 올라옵니다. 그게 절반입니다.',
               '침낭을 펴고 들어가니 삼십 분 만에 안이 따뜻해집니다.',
               '오랜만에 아침까지 안 깹니다.'],
        eff: { hp: 1, mp: 2, add: ['relief', 'warmth'] } }
    ],

    rest_road: [
      { t: '보온병을 열어 마신다.', need: { item: 'thermos' },
        res: ['아침에 끓여 담은 것이 아직 따뜻합니다.',
               '길에서 따뜻한 것을 마시면 다리가 다시 움직입니다.',
               '한 모금 남겨 둡니다. 저녁에 마실 것으로요.'],
        eff: { hp: 1, mp: 2, add: ['warmth'] } },
      { t: '야광 테이프로 표시를 남긴다.', need: { item: 'glowtape' },
        res: ['갈림길마다 테이프를 한 조각씩 붙입니다.',
               '낮에 빛을 먹으면 밤에 두 시간쯤 보입니다.',
               '밤에 이 길을 지나는 사람이 그걸 보고 갑니다. 누군지는 모릅니다.'],
        eff: { mp: 2, rep: { free: 1 }, add: ['goodrep'] } }
    ],

    scav_hospital: [
      { t: '들것을 챙긴다.',
        res: ['응급실 벽에 접이식 들것이 걸려 있습니다. 셋 중 둘은 천이 삭았습니다.',
               '하나가 성합니다. 접으면 사람 하나가 집니다.',
               '이 도시에서 들것은 있는 데는 있고 없는 데는 아예 없습니다.'],
        eff: { add: ['stretcher'], mp: 2 } },
      { t: '수술방에서 기구를 고른다.', need: { skill: 'medic' },
        res: ['봉합 세트와 지혈대와 부목. 이 셋이 제일 자주 쓰입니다.',
               '포가 안 뜯긴 것만 고릅니다. 뜯긴 것은 이십 년 동안 공기를 먹었습니다.',
               '한 벌씩 챙깁니다. 다 가져가면 다음 사람이 못 씁니다.'],
        eff: { add: ['tourniquet', 'splintset'], mp: 3, skillUp: 'medic' } }
    ],

    scav_factory: [
      { t: '연장 말이를 찾는다.', need: { skill: 'watch' },
        res: ['정비 작업대 아래에 천으로 말아 놓은 것이 있습니다.',
               '펼치니 열두 가지가 자리마다 꽂혀 있습니다. 하나도 안 빠졌습니다.',
               '주인이 그날 아침에 말아 놓고 나갔습니다.'],
        eff: { add: ['toolroll'], mp: 3, skillUp: 'watch' } },
      { t: '안전모를 모은다.',
        res: ['공장에는 안전모가 사물함마다 하나씩 있습니다.',
               '삭지 않은 것만 고릅니다. 스물넷 중에 여섯입니다.',
               '여섯을 지고 나옵니다. 무겁지는 않은데 부피가 큽니다.'],
        eff: { add: ['hardhat'], mp: 2 } }
    ],

    odd_train: [
      { t: '야광 테이프로 침목을 표시한다.', need: { item: 'glowtape' },
        res: ['철길은 밤에 걷기 좋습니다. 곧고 평평하니까요. 대신 안 보입니다.',
               '백 침목마다 테이프를 한 조각씩 붙입니다.',
               '밤에 걸어 보니 앞이 점선으로 이어집니다. 그 점선만 보고 갑니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    odd_radio: [
      { t: '군용 주파수를 찾아본다.', need: { skill: 'tech', lv: 2 },
        res: ['이 도시 방송 말고 다른 것이 있는지 봅니다.',
               '위쪽 대역에서 규칙적인 신호음이 잡힙니다. 삼 초에 한 번입니다.',
               '사람 목소리는 아닙니다. 다만 기계가 어딘가에서 돌고 있다는 뜻입니다.'],
        eff: { mp: 3, skillUp: 'tech', add: ['note', 'stable'] } }
    ],

    mkt_night: [
      { t: '쌍안경을 판다.', need: { item: 'binocular' }, cost: { item: 'binocular' },
        res: ['좌판에 올리자 값을 부르기도 전에 넷이 붙습니다.',
               '"이거 초소에서 삽니다." 값이 세 번 올라갑니다.',
               '판 뒤에 좀 후회합니다. 이런 건 다시 안 나옵니다.'],
        eff: { money: 2, mp: 2, rep: { market: 2 } } }
    ],

    wint_store: [
      { t: '솜 이불을 편다.', need: { item: 'winterquilt' },
        res: ['무겁습니다. 무거운 만큼 따뜻합니다.',
               '둘이 덮으면 셋도 덮습니다. 그날 밤에 셋이 덮고 잡니다.',
               '아침에 일어나니 밤새 한 번도 안 깼습니다.'],
        eff: { hp: 1, mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } }
    ]
  };

  const byId = {};
  B.TEMPLATES.forEach(function (t) { byId[t.id] = t; });

  Object.keys(MORE).forEach(function (id) {
    const t = byId[id];
    if (!t) return;
    const tail = t.choices.pop();
    MORE[id].forEach(function (c) { t.choices.push(c); });
    t.choices.push(tail);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

/* 부산 2033 - 인카운터 템플릿 (2) 사람과의 조우, 거래, 선택 */
(function (global) {
  'use strict';
  const B = global.B;
  const T = B.TEMPLATES;

  /* ═══ 조우 ═══════════════════════════════════════ */
  T.push({
    id: 'meet_trade', cat: '기본', phase: [1, 2, 3], w: 12,
    slots: { place: 'urban', npc: 'trader', item: 'food', item2: 'part' },
    open: [
      '{place} 앞에 좌판을 펼친 사람이 있습니다. {npc}이라고 자신을 소개합니다.',
      '{zone}에서 {role} {npc}을(를) 만납니다. {trait} {habit}.',
      '길목에 리어카 한 대가 서 있습니다. {role} {npc}이(가) 당신을 먼저 알아봅니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '{item}을(를) 산다.', need: { money: 1 }, cost: { money: 1 },
        res: ['값을 치르고 {item}을(를) 받습니다. 거래는 짧을수록 좋습니다.'],
        eff: { add: ['{item}'] } },
      { t: '값을 깎는다.', need: { skill: 'talk' }, dc: 1,
        ok: ['한참을 실랑이한 끝에 {npc}이(가) 손을 젓습니다. "가져가시오, 가져가."'],
        okEff: { add: ['{item}', '{item2}'] },
        no: ['{npc}의 표정이 굳습니다. "장사 방해하지 마시오."'], noEff: { mp: -1 } },
      { t: '가진 물건을 판다.', need: { itemKind: 'lux' }, cost: { itemKind: 'lux' },
        res: ['{npc}이(가) 물건을 이리저리 돌려 보더니 고개를 끄덕입니다. 돈이 손에 들어옵니다.'],
        eff: { money: 1 } },
      { t: '인사만 하고 지나간다.', res: ['{npc}이(가) 손을 들어 보입니다. 다음에 또 볼 얼굴입니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_toll', cat: '기본', phase: [1, 2, 3], w: 10,
    slots: { place: 'urban', npc: 'guard' },
    open: [
      '{zone} 초입에 드럼통과 철망으로 만든 바리케이드가 서 있습니다.',
      '{place}로 가는 길목을 {role} {npc}이(가) 막아섭니다. {trait} 눈매가 사납습니다.',
      '{zone}의 목 좋은 자리마다 통행료를 받는 사람이 있습니다. 오늘은 {npc}입니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '통행료를 낸다.', need: { money: 1 }, cost: { money: 1 },
        res: ['{npc}이(가) 철망을 옆으로 밀어 줍니다. "조심해 가시오. 요새 길이 험합니다."'],
        eff: {} },
      { t: '사정을 설명한다.', need: { skill: 'talk' }, dc: 1,
        ok: ['{npc}이(가) 잠시 당신을 보더니 턱짓으로 길을 열어 줍니다. "오늘만이오."'], okEff: { mp: 1 },
        no: ['말이 길어질수록 상대의 손이 총 쪽으로 갑니다. 결국 물러섭니다.'], noEff: { mp: -1 } },
      { t: '식량으로 대신한다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['통조림 하나가 통행료가 됩니다. 요즘 환율입니다.'], eff: {} },
      { t: '옆길로 돌아간다.', need: { skill: 'sneak' },
        res: ['담을 넘고 골목을 세 번 꺾어 바리케이드 뒤로 나옵니다. 아무도 모릅니다.'],
        eff: { wear: { hp: 2 } } },
      { t: '밀고 지나간다.', need: { skill: 'force' }, dc: 2,
        ok: ['어깨로 밀치고 지나갑니다. 뒤에서 욕이 날아오지만 그뿐입니다.'], okEff: { rep: { free: 1 } },
        no: ['개머리판이 옆구리에 박힙니다. 숨이 멎을 뻔합니다.'], noEff: { hp: -1, mp: -1, rep: { free: -1 } } }
    ]
  });

  T.push({
    id: 'meet_child', cat: '기본', phase: [1, 2, 3], w: 9,
    slots: { place: 'urban', npc: 'child', item: 'food' },
    open: [
      '바가지 머리를 한 아이가 길 한가운데에서 뭔가를 맛있게 먹고 있습니다.',
      '{place} 앞에 아이 하나가 쪼그려 앉아 있습니다. {trait} 신발이 짝짝이입니다.',
      '{zone}의 골목에서 아이가 당신 옷자락을 붙잡습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '{spend}을(를) 나눠 준다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['아이가 두 손으로 받아 들고는 한참을 들여다봅니다. 그러고는 아주 작게 "고맙습니다"라고 합니다.'],
        eff: { mp: 1, add: ['stable'], rep: { free: 1 } } },
      { t: '가진 것과 바꾸자고 한다.', need: { skill: 'talk' },
        res: ['아이가 주머니를 뒤져 꼬깃한 종이를 내밉니다. 지도 조각입니다. 어디서 났는지는 묻지 않습니다.'],
        eff: { add: ['map'], del: ['choco'] } },
      { t: '꿀밤을 때려 주고 빼앗는다.',
        res: ['아이가 울음을 터뜨립니다. 손에 남은 것은 초콜릿 하나와, 오래 갈 것 같은 기분입니다.'],
        eff: { add: ['choco', 'guilt'], mp: -1, rep: { free: -1 } } },
      { t: '지나간다.', res: ['아이가 뒤에서 뭐라고 외칩니다. 알아듣지 않기로 합니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_medic', cat: '기본', phase: [1, 2, 3], w: 8,
    slots: { place: 'indoor', npc: 'medic' },
    open: [
      '{place}에 흰 천을 내건 자리가 있습니다. 떠돌이 의사 {npc}의 진료소입니다.',
      '{zone}에서 {role} {npc}을(를) 만납니다. {trait} 손이 유난히 깨끗합니다.',
      '"다친 데 있소?" {npc}이(가) 묻습니다. 대답하기도 전에 이미 당신 눈을 들여다보고 있습니다.'
    ],
    choices: [
      { t: '치료를 받는다.', need: { money: 1 }, cost: { money: 1 },
        res: ['상처를 소독하고 새 붕대를 감아 줍니다. 오랜만에 사람 손길이 닿습니다.'],
        eff: { hp: 1, mp: 1 } },
      { t: '일을 도와주고 치료를 받는다.', need: { skill: 'medic' },
        res: ['환자 셋을 함께 봅니다. {npc}이(가) 말없이 당신 팔의 상처를 꿰매 줍니다.'],
        eff: { hp: 1, rep: { market: 1 }, skillUp: 'medic' } },
      { t: '피폭 치료를 부탁한다.', need: { item: 'iodine' }, cost: { item: 'iodine' },
        res: ['요오드정을 건네자 정량을 재어 다시 돌려줍니다. "이렇게 먹어야 합니다. 한 번에 털어 넣지 말고."'],
        eff: { rad: -1 } },
      { t: '괜찮다고 하고 지나간다.', res: ['"몸은 거짓말을 안 합니다." 등 뒤에서 목소리가 따라옵니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_raider', cat: '기본', phase: [1, 2, 3], w: 11,
    slots: { place: 'urban', npc: 'raider', threat: true },
    open: [
      '{place}의 그늘에서 {threat}이(가) 걸어 나옵니다. 셋, 아니 넷입니다.',
      '{zone}에서 {role} {npc}이(가) 길을 막습니다. {trait} 손에 든 것이 파이프인지 총인지 분간이 안 됩니다.',
      '골목 양쪽이 동시에 막힙니다. 처음부터 기다리고 있었던 겁니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '가진 것을 내준다.',
        res: ['가방을 열어 절반을 덜어 줍니다. 목숨값 치고는 싼 편입니다.'],
        eff: { money: -1, mp: -1 } },
      { t: '총을 뽑는다.', need: { skill: 'shoot', item: 'pistol' }, dc: 2,
        ok: ['한 발. 그것으로 충분합니다. 나머지는 알아서 흩어집니다.'],
        okEff: { add: ['bullet'], mp: -1, rep: { free: 1 } },
        no: ['총이 걸립니다. 그다음은 잘 기억나지 않습니다.'], noEff: { hp: -1, money: -1 } },
      { t: '허세를 부린다.', need: { skill: 'lie' }, dc: 2,
        ok: ['"뒤에 열 명 더 있다"고 말합니다. 그들이 골목 끝을 힐끗 봅니다. 그 한 번이면 됩니다.'],
        okEff: { mp: 1, add: ['grit'] },
        no: ['말이 끝나기도 전에 웃음이 터집니다. 그리고 주먹이 날아옵니다.'], noEff: { hp: -1, money: -1 } },
      { t: '도망친다.', need: { skill: 'sneak' }, dc: 1,
        ok: ['담을 넘고 지붕을 타고 세 골목을 건넙니다. 숨이 턱까지 찼지만 아무것도 잃지 않았습니다.'], okEff: { hp: -1 },
        no: ['등 뒤에서 붙잡힙니다. 가방끈이 뜯겨 나갑니다.'], noEff: { hp: -1, money: -1, mp: -1 } }
    ]
  });

  T.push({
    id: 'meet_cult', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'urban', npc: 'cultist' },
    open: [
      '{zone}의 광장에 사람들이 둥글게 모여 있습니다. 가운데 선 {npc}이(가) 하늘을 가리킵니다.',
      '{place} 벽에 흰 페인트로 커다란 원이 그려져 있습니다. 그 앞에 {role} {npc}이(가) 무릎을 꿇고 있습니다.',
      '"빛을 보셨습니까?" {npc}이(가) 당신 앞을 막습니다. {trait} 눈이 이상하게 맑습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '이야기를 들어 준다.',
        res: ['한 시간쯤 들어 줍니다. 말이 끝날 무렵 {npc}이(가) 빵 한 조각을 쥐여 줍니다.'],
        eff: { add: ['biscuit'], mp: -1, rep: { cult: 1 } } },
      { t: '반박한다.', need: { skill: 'read' }, dc: 2,
        ok: ['날짜와 숫자를 조목조목 짚습니다. 둘러선 사람 몇이 조용히 자리를 뜹니다.'],
        okEff: { rep: { cult: -1 }, mp: 1, skillUp: 'read' },
        no: ['말이 통하지 않습니다. 오히려 당신 쪽이 이상한 사람이 됩니다.'], noEff: { mp: -1 } },
      { t: '조용히 빠져나온다.', need: { skill: 'sneak' },
        res: ['사람들 사이로 몸을 낮춰 빠져나옵니다. 아무도 당신을 기억하지 못할 겁니다.'], eff: {} },
      { t: '동참하는 척한다.', need: { skill: 'lie' },
        res: ['같이 무릎을 꿇고 같은 말을 따라 합니다. 나올 때 손에 배급표가 하나 들려 있습니다.'],
        eff: { money: 1, rep: { cult: 1 }, mp: -1 } }
    ]
  });

  T.push({
    id: 'meet_soldier', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'urban', npc: 'soldier' },
    open: [
      '{place} 앞에 아직도 초소가 서 있습니다. 안에 사람이 있습니다.',
      '{zone}에서 군복 차림의 {npc}을(를) 만납니다. 계급장은 뜯겨 나갔지만 자세는 그대로입니다.',
      '"정지." 목소리가 먼저 옵니다. {role} {npc}입니다. {trait} 총구는 땅을 향해 있습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '통행증을 보인다.', need: { item: 'pass' },
        res: ['{npc}이(가) 종이를 한참 들여다보더니 경례를 합니다. 스무 해 묵은 경례입니다.'],
        eff: { rep: { army: 1 } } },
      { t: '군용 물자를 거래한다.', need: { itemKind: 'ammo' }, cost: { itemKind: 'ammo' },
        res: ['탄약을 내밉니다. {npc}의 눈빛이 달라집니다. 대신 보존식량 두 개가 넘어옵니다.'],
        eff: { add: ['preserve', 'preserve'], rep: { army: 1 } } },
      { t: '부대가 아직 있냐고 묻는다.', need: { skill: 'talk' },
        res: ['"명령이 안 내려왔습니다." {npc}이(가) 초소 안쪽 무전기를 가리킵니다. 이십 년째 켜져 있습니다.'],
        eff: { add: ['note'], mp: -1, flag: 'heard_army' } },
      { t: '조용히 물러난다.', res: ['총구는 땅을 향해 있지만, 손가락은 방아쇠 위에 있습니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_elder', cat: '기본', phase: [1, 2, 3], w: 8,
    slots: { place: 'indoor', npc: 'elder' },
    open: [
      '{place}에 노인 하나가 앉아 있습니다. 이 동네를 폭발 전부터 지킨 사람입니다.',
      '{zone}에서 {npc} 어르신을 만납니다. {trait} 무릎에 담요를 덮고 있습니다.',
      '"거기 젊은 사람." 부르는 소리에 돌아보니 {npc}입니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '옆에 앉아 이야기를 듣는다.',
        res: ['옛날 부산 이야기가 두 시간쯤 이어집니다. 듣다 보니 이 도시가 한때 얼마나 시끄러웠는지 알겠습니다.'],
        eff: { mp: 1, add: ['relief'] } },
      { t: '길을 묻는다.', need: { skill: 'talk' },
        res: ['노인이 손가락으로 허공에 지도를 그립니다. 그 손짓이 지도보다 정확합니다.'],
        eff: { add: ['map'] } },
      { t: '먹을 것을 나눈다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['노인이 오래 씹습니다. 다 먹고 나서 낡은 열쇠 하나를 쥐여 줍니다. "쓸 데가 있을 게요."'],
        eff: { add: ['key'], mp: 1, rep: { free: 1 } } },
      { t: '바쁘다고 하고 지나간다.', res: ['노인이 고개를 끄덕입니다. 익숙한 표정입니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_engineer', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'indoor', npc: 'engineer', item: 'part' },
    open: [
      '{place}에서 누군가 기계를 두드리는 소리가 납니다. {role} {npc}입니다.',
      '{zone}, {place}. 전선이 사방으로 뻗은 작업대 앞에 {npc}이(가) 앉아 있습니다.',
      '"거기 잠깐! 그거 밟지 마시오!" {npc}이(가) 소리칩니다. {trait} 손에 납땜인두가 들려 있습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '부품을 건넨다.', need: { itemKind: 'part' }, cost: { itemKind: 'part' },
        res: ['{npc}이(가) 부품을 받아 들고 눈을 빛냅니다. 대가로 라디오를 손봐 줍니다.'],
        eff: { add: ['radio'], rep: { market: 1 } } },
      { t: '수리를 배운다.', need: { skill: 'tech' },
        res: ['옆에 붙어 앉아 배선을 따라 그립니다. 손끝이 조금 더 영리해집니다.'],
        eff: { skillUp: 'tech', mp: 1 } },
      { t: '무엇을 만드는지 묻는다.',
        res: ['"정수기요. 이거 되면 이 동네 사람들 안 죽습니다." 그렇게 말하는 얼굴이 진지합니다.'],
        eff: { add: ['relief'], flag: 'knows_water' } },
      { t: '방해하지 않고 나온다.', res: ['집중한 사람을 방해하는 건 예의가 아닙니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_broker', cat: '조건부', phase: [2, 3], w: 6,
    slots: { place: 'indoor', npc: 'broker' },
    open: [
      '{place} 안쪽 방에서 {role} {npc}이(가) 당신을 기다리고 있었다는 듯 앉아 있습니다.',
      '{zone}의 소문은 전부 이 사람을 거쳐 갑니다. {npc}입니다. {trait} 웃음이 얇습니다.',
      '"찾는 게 있어서 온 거 아니오?" {npc}이(가) 먼저 말합니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '그날의 일을 묻는다.', need: { money: 1 }, cost: { money: 1 },
        res: ['{npc}이(가) 목소리를 낮춥니다. "폭발 직전에 항만 쪽으로 빠져나간 차량이 있었소. 번호까지는 모르오."'],
        eff: { flag: 'lead_port', add: ['note'] } },
      { t: '지도를 산다.', need: { money: 1 }, cost: { money: 1 },
        res: ['손때 묻은 지도 조각을 받습니다. 붉은 표시가 세 군데 있습니다.'],
        eff: { add: ['map'] } },
      { t: '정보를 판다.', need: { item: 'note' }, cost: { item: 'note' },
        res: ['당신이 본 것을 이야기합니다. {npc}이(가) 셈을 하더니 돈을 내놓습니다.'],
        eff: { money: 1 } },
      { t: '아무것도 사지 않는다.', res: ['"다음에 오면 값이 오를 거요." 등 뒤에서 웃음소리가 납니다.'], eff: {} }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);

/* 부산 2033 - 인카운터 템플릿 (5) 바다, 지하, 사람 사이의 일 */
(function (global) {
  'use strict';
  const B = global.B;
  const T = B.TEMPLATES;

  T.push({
    id: 'sea_ferry', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'water', npc: 'fisher' },
    open: [
      '{zone}의 나루에 작은 배 한 척이 손님을 기다립니다.',
      '{place}에서 {role} {npc}이(가) 노를 손질하고 있습니다. {trait} 팔뚝이 굵습니다.',
      '물이 빠진 {place}에 배 밑바닥이 드러나 있습니다. 주인이 그늘에 앉아 담배를 뭅니다.'
    ],
    mid: ['건너편으로 가려면 배가 필요하고, 배에는 값이 붙습니다.'],
    choices: [
      { t: '뱃삯을 내고 건넌다.', need: { money: 1 }, cost: { money: 1 },
        res: ['물살이 생각보다 셉니다. 뱃전에 부딪히는 물이 검게 튑니다. 반대편에 닿는 데 이십 분.'],
        eff: {} },
      { t: '노를 대신 젓겠다고 한다.', need: { skill: 'sea' },
        res: ['{npc}이(가) 자리를 내줍니다. 물을 읽을 줄 아는 사람은 어디서나 반갑습니다.'],
        eff: { skillUp: 'sea', rep: { dock: 1 } } },
      { t: '물길 소식을 산다.', need: { skill: 'talk' },
        res: ['"저쪽 수로는 요새 막혔소. 대신 새벽에 물이 빠지면 걸어서도 건너오."'],
        eff: { add: ['map'] } },
      { t: '돌아서 간다.', res: ['다리 하나를 더 돌아가기로 합니다. 다리가 아플 뿐입니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'sea_catch', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'water', item: 'food' },
    open: [
      '{place}에 낚싯대 여러 개가 꽂혀 있습니다. 주인은 보이지 않습니다.',
      '{zone}의 물가에서 사람들이 그물을 끌어올리고 있습니다.',
      '{place}. 물속에서 뭔가 반짝입니다. 물고기일 수도, 아닐 수도 있습니다.'
    ],
    choices: [
      { t: '함께 그물을 당긴다.', need: { skill: 'force' },
        res: ['열댓 명이 구령에 맞춰 당깁니다. 몫으로 {item}이(가) 돌아옵니다.'],
        eff: { add: ['{item}'], hp: -1, rep: { dock: 1 } } },
      { t: '직접 낚아 본다.', dc: 1,
        ok: ['한 시간 만에 한 마리. 크기는 예전 기준으로도 큽니다. 먹어도 되는지는 별개 문제지만요.'],
        okEff: { add: ['dried'] },
        no: ['해가 질 때까지 아무것도 물지 않습니다. 시간만 흘렀습니다.'], noEff: { mp: -1 } },
      { t: '물속 것을 확인한다.', need: { skill: 'sense' },
        res: ['가라앉은 가방입니다. 건져 보니 안쪽은 아직 젖지 않았습니다.'],
        eff: { add: ['{item}', 'watch'] } },
      { t: '물가에서 멀어진다.', res: ['물은 예뻐 보일 때가 제일 위험합니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'und_tunnel', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'under', threat: true },
    open: [
      '{zone}의 터널 입구가 반쯤 무너져 있습니다. 안쪽에서 바람이 나옵니다.',
      '{place}로 이어지는 통로에 누군가 밧줄을 매어 두었습니다.',
      '{place}. 손전등을 비추자 벽에 화살표와 숫자가 줄줄이 나타납니다.'
    ],
    mid: ['먼저 지나간 사람들이 남긴 표시입니다. 믿을지 말지는 당신 몫입니다.'],
    choices: [
      { t: '표시를 따라간다.', need: { skill: 'read' },
        res: ['숫자는 거리였습니다. 삼십 분 뒤 반대편 출구로 나옵니다. 지름길입니다.'],
        eff: { mp: 1, add: ['map'] } },
      { t: '밧줄을 붙잡고 나아간다.',
        res: ['어둠 속을 더듬어 갑니다. 중간에 밧줄이 끊겨 있지만, 감으로 마저 갑니다.'],
        eff: { hp: -1, rad: -1 } },
      { t: '소리를 죽이고 살핀다.', need: { skill: 'sneak' },
        res: ['안쪽에 {threat}이(가) 자리를 잡고 있습니다. 발길을 돌린 것이 오늘의 가장 잘한 일입니다.'],
        eff: { mp: 1 } },
      { t: '들어가지 않는다.', res: ['바람이 나온다는 건 반대편이 열려 있다는 뜻이지만, 오늘은 아닙니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'und_water', cat: '기본', phase: [1, 2, 3], w: 7,
    slots: { place: 'under' },
    open: [
      '{place} 아래에서 물소리가 납니다. 흐르는 물입니다.',
      '{zone}의 정수 설비가 아직 절반쯤 살아 있습니다.',
      '{place}. 벽을 타고 물이 흘러내려 바닥에 얕은 웅덩이를 만들었습니다.'
    ],
    choices: [
      { t: '설비를 손봐 물을 뺀다.', need: { skill: 'tech' }, dc: 1,
        ok: ['밸브를 열고 배관을 두들깁니다. 한참 뒤 맑은 물이 쏟아집니다. 물통을 전부 채웁니다.'],
        okEff: { add: ['water', 'boiled'], mp: 1 },
        no: ['배관이 터지며 흙탕물을 뒤집어씁니다.'], noEff: { hp: -1, rad: 1 } },
      { t: '필터로 걸러 담는다.', need: { item: 'filter' },
        res: ['천천히 걸러 통을 채웁니다. 이 물이면 며칠은 버팁니다.'], eff: { add: ['water', 'water'] } },
      { t: '얼굴만 씻는다.', res: ['찬물에 얼굴을 담급니다. 정신이 조금 돌아옵니다.'], eff: { mp: 1 } }
    ]
  });

  T.push({
    id: 'meet_runner', cat: '기본', phase: [2, 3], w: 7,
    slots: { place: 'urban', npc: 'runner' },
    open: [
      '누군가 전속력으로 달려옵니다. {role} {npc}입니다.',
      '{place} 모퉁이에서 {npc}과(와) 정면으로 부딪칠 뻔합니다. {trait} 숨이 턱에 찼습니다.',
      '{zone}에서 전령 하나가 멈춰 서서 당신을 봅니다. "당신, 저쪽에서 왔소?"'
    ],
    mid: ['{line}'],
    choices: [
      { t: '소식을 듣는다.',
        res: ['"광안리 쪽에서 사람들이 끌려갔소. 열댓 명은 되오." 말을 마치자마자 다시 뜁니다.'],
        eff: { flag: 'news_gwangan', mp: -1 } },
      { t: '길을 알려 준다.', need: { item: 'map' },
        res: ['지도 조각을 펴 보입니다. {npc}이(가) 고맙다며 주머니의 것을 몽땅 쥐여 줍니다.'],
        eff: { add: ['biscuit', 'battery'], rep: { free: 1 } } },
      { t: '전갈을 부탁한다.', need: { money: 1 }, cost: { money: 1 },
        res: ['짧은 전갈 하나를 맡깁니다. 닿을지는 모르지만, 보냈다는 사실이 중요합니다.'],
        eff: { mp: 1, add: ['relief'] } },
      { t: '비켜 준다.', res: ['달리는 사람을 붙잡으면 안 됩니다. 이유가 있어서 달리는 겁니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'meet_farmer', cat: '기본', phase: [2, 3], w: 6,
    slots: { place: 'indoor', npc: 'farmer', item: 'food' },
    open: [
      '건물 옥상에 흙을 깔아 만든 밭이 있습니다. 주인이 물을 주고 있습니다.',
      '{place} 위쪽에서 사람이 손짓합니다. {role} {npc}입니다.',
      '{zone}에서 초록색을 봅니다. 오랜만입니다. 상추입니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '일을 거들어 준다.', cost: { hp: 1 },
        res: ['물통을 스무 번 지고 올라갑니다. 저녁에 {item}과(와) 상추 한 줌을 받습니다.'],
        eff: { add: ['{item}'], mp: 1, rep: { market: 1 } } },
      { t: '씨앗을 나눠 달라고 한다.', need: { skill: 'talk' },
        res: ['{npc}이(가) 봉투를 반으로 나눕니다. "심을 데가 있으면요. 없으면 가져가지 마시오."'],
        eff: { add: ['seed'] } },
      { t: '물을 대 준다.', need: { item: 'boiled' }, cost: { item: 'boiled' },
        res: ['물통을 통째로 부어 줍니다. 흙이 검게 젖는 걸 둘이 함께 봅니다.'],
        eff: { mp: 1, add: ['warmth'], rep: { free: 1 } } },
      { t: '구경만 하고 내려온다.', res: ['초록색을 오래 보다가 내려옵니다.'], eff: { mp: 1 } }
    ]
  });

  T.push({
    id: 'meet_priest', cat: '기본', phase: [1, 2, 3], w: 6,
    slots: { place: 'indoor', npc: 'priest' },
    open: [
      '{place}에 사람들이 몇 앉아 있습니다. 앞에서 {npc}이(가) 아무 말 없이 서 있습니다.',
      '{zone}의 교회 건물에 아직 지붕이 남았습니다. 안에서 인기척이 납니다.',
      '{role} {npc}이(가) 당신을 보고 자리를 권합니다. {trait} 목소리가 낮습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '앉아 있는다.',
        res: ['아무도 기도하지 않고, 아무도 나가지 않습니다. 한 시간쯤 앉아 있다가 일어섭니다. 이상하게 개운합니다.'],
        eff: { mp: 1, del: ['gloom'] } },
      { t: '고해한다.', need: { item: 'guilt' },
        res: ['그동안 한 일을 말합니다. {npc}은(는) 아무 판단도 하지 않습니다. 그게 필요했던 겁니다.'],
        eff: { del: ['guilt'], mp: 1 } },
      { t: '음식을 나눈다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['앞자리 아이들에게 나눠 줍니다. {npc}이(가) 처음으로 웃습니다.'],
        eff: { mp: 1, add: ['warmth'], rep: { free: 1 } } },
      { t: '문 앞에서 돌아선다.', res: ['들어가면 오래 앉아 있을 것 같습니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'town_court', cat: '조건부', phase: [2, 3], w: 6, req: { flag: 'in_town' },
    slots: { place: 'urban', npc: 'guard' },
    open: [
      '광장에 사람들이 둥글게 모였습니다. 가운데 한 사람이 묶여 있습니다.',
      '{zone}의 마을이 도둑 하나를 잡았습니다. 어떻게 할지 의논 중입니다.',
      '{npc}이(가) 당신을 봅니다. "지나가는 사람 의견도 들읍시다."'
    ],
    choices: [
      { t: '내보내는 것으로 끝내자고 한다.', need: { skill: 'talk' }, dc: 1,
        ok: ['사람들이 웅성거리다 고개를 끄덕입니다. 도둑은 쫓겨나고, 아무도 죽지 않았습니다.'],
        okEff: { rep: { free: 1 }, mp: 1, add: ['stable'] },
        no: ['"말은 쉽지." 분위기가 험해집니다. 당신 말은 묻힙니다.'], noEff: { mp: -1 } },
      { t: '규칙대로 하라고 한다.',
        res: ['조합의 규칙대로 손목이 묶인 채 사흘. 지켜보는 사람들 표정이 좋지 않습니다.'],
        eff: { rep: { market: 1 }, mp: -1 } },
      { t: '아무 말도 하지 않는다.',
        res: ['입을 다물고 지켜봅니다. 결과는 당신 몫이 아닙니다. 그렇게 믿기로 합니다.'],
        eff: { add: ['gloom'] } },
      { t: '도둑의 사정을 묻는다.', need: { skill: 'sense' },
        res: ['배가 고파서였습니다. 늘 그렇습니다. 당신은 그 말을 사람들 앞에서 대신 전합니다.'],
        eff: { rep: { free: 1 }, mp: 1 } }
    ]
  });

  T.push({
    id: 'odd_kids', cat: '기본', phase: [1, 2, 3], w: 6,
    slots: { place: 'urban', npc: 'orphan' },
    open: [
      '{place} 근처에 아이들만 사는 무리가 있습니다. 가장 큰 아이가 열셋쯤 되어 보입니다.',
      '골목 안쪽에서 아이 넷이 담요를 나눠 덮고 있습니다. 대장은 {npc}입니다.',
      '{zone}의 폐건물에서 연기가 납니다. 올라가 보니 아이들이 불을 피우고 있습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '먹을 것을 나눠 준다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['가장 작은 아이부터 먹입니다. {npc}이(가) 맨 마지막에 먹습니다. 어른들이 하던 방식 그대로입니다.'],
        eff: { mp: 1, add: ['stable'], rep: { free: 1 } } },
      { t: '불 피우는 법을 가르쳐 준다.', need: { item: 'lighter' },
        res: ['젖은 나무를 쪼개는 법, 바람을 등지는 법을 알려 줍니다. 아이들이 진지하게 배웁니다.'],
        eff: { mp: 1, rep: { free: 1 }, add: ['humor'] } },
      { t: '마을로 데려가겠다고 한다.', need: { flag: 'in_town' },
        res: ['{npc}이(가) 오래 생각합니다. "우리끼리는 안 갑니다. 넷 다면 갑니다." 넷 다 데려갑니다.'],
        eff: { mp: 1, add: ['stable', 'relief'], rep: { free: 2 }, flag: 'saved_kids' } },
      { t: '조용히 물러난다.', res: ['어른이 나타나면 아이들은 늘 긴장합니다. 그러지 않기로 합니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'odd_train', cat: '기본', phase: [2, 3], w: 6,
    slots: { place: 'under', item: 'part' },
    open: [
      '선로 위에 화차 여러 량이 줄지어 멈춰 있습니다. 봉인이 그대로입니다.',
      '{zone}의 철로가 잡초에 반쯤 잠겼습니다. 그 위에 열차가 서 있습니다.',
      '{place} 옆으로 화물칸 문이 하나 열려 있습니다. 안은 어둡습니다.'
    ],
    choices: [
      { t: '봉인을 뜯는다.', need: { skill: 'force' }, dc: 1,
        ok: ['철사를 끊고 문을 밀어 올립니다. 안에는 아직 아무도 손대지 않은 상자들이 있습니다.'],
        okEff: { add: ['{item}', 'preserve'] },
        no: ['문이 꿈쩍도 하지 않습니다. 어깨만 상했습니다.'], noEff: { hp: -1 } },
      { t: '화물 목록을 찾는다.', need: { skill: 'read' },
        res: ['기관실에 목록이 남아 있습니다. 어느 칸에 무엇이 실렸는지 알고 나니 일이 쉬워집니다.'],
        eff: { add: ['{item}', 'note'] } },
      { t: '차량 아래를 살핀다.', need: { skill: 'sneak' },
        res: ['바퀴 사이에 누군가 숨겨 둔 짐이 있습니다. 주인은 오지 않을 것 같습니다.'],
        eff: { add: ['{item}', 'can'] } },
      { t: '지나간다.', res: ['봉인된 것에는 대개 이유가 있고, 그 이유가 좋았던 적은 별로 없습니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'haz_flood', cat: '기본', phase: [2, 3], w: 6,
    slots: { place: 'wild' },
    open: [
      '비가 사흘째입니다. {place} 일대가 무릎까지 잠겼습니다.',
      '{zone}의 저지대가 물에 잠기기 시작합니다. 물살이 생각보다 셉니다.',
      '검은 물이 골목을 타고 밀려옵니다. 발목, 종아리, 무릎. 빠르게 올라옵니다.'
    ],
    choices: [
      { t: '높은 곳으로 올라간다.',
        res: ['옥상까지 올라가 밤을 새웁니다. 아침에 보니 아래층은 완전히 잠겼습니다.'],
        eff: { mp: -1 } },
      { t: '물살을 가로지른다.', dc: 2,
        ok: ['허리까지 잠긴 채 건넙니다. 몸은 젖었지만 시간은 벌었습니다.'], okEff: { hp: -1, rad: 1 },
        no: ['발이 걸려 넘어집니다. 물을 잔뜩 먹고 겨우 기어 나옵니다.'],
        noEff: { hp: -1, rad: 1, add: ['fever'] } },
      { t: '사람을 돕는다.', need: { skill: 'force' },
        res: ['떠내려가던 노인을 붙잡아 끌어올립니다. 팔이 빠질 것 같지만 놓지 않습니다.'],
        eff: { hp: -1, mp: 1, add: ['relief'], rep: { free: 1 } } }
    ]
  });

  T.push({
    id: 'haz_fire', cat: '기본', phase: [1, 2, 3], w: 6,
    slots: { place: 'urban' },
    open: [
      '{zone} 한쪽에서 불길이 올라옵니다. 바람이 이쪽입니다.',
      '{place}에 불이 붙었습니다. 사람들이 물통을 들고 뛰어다닙니다.',
      '연기 냄새가 나더니, 골목 끝이 통째로 주황색이 됩니다.'
    ],
    choices: [
      { t: '불을 끄는 것을 돕는다.', cost: { hp: 1 },
        res: ['물통을 이어 나릅니다. 두 시간 만에 불이 잡힙니다. 손바닥이 다 벗겨졌습니다.'],
        eff: { rep: { free: 1 }, mp: 1, add: ['grit'] } },
      { t: '안에 사람이 있는지 확인한다.', need: { skill: 'sense' }, dc: 1,
        ok: ['이층 창문에서 사람 그림자를 봅니다. 소리쳐 알리고, 사다리를 붙입니다. 살렸습니다.'],
        okEff: { mp: 1, add: ['relief'], rep: { free: 2 } },
        no: ['연기 속으로 들어갔다가 아무것도 못 보고 나옵니다. 목이 오래 아픕니다.'],
        noEff: { hp: -1, add: ['gloom'] } },
      { t: '타는 건물에서 물건을 건진다.',
        res: ['불이 옮겨붙기 전에 몇 가지를 꺼내 옵니다. 누구의 것이었는지는 생각하지 않기로 합니다.'],
        eff: { add: ['can', 'wire'], mp: -1, add2: ['guilt'] } },
      { t: '멀리 돌아간다.', res: ['불은 사람을 부릅니다. 사람이 모이면 일이 생깁니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'story_photo1', cat: '이야기', phase: [1, 2, 3], w: 5,
    slots: { place: 'indoor', npc: 'elder' },
    open: [
      '{place}에서 사진 한 장을 줍습니다. 가족사진입니다. 뒷면에 주소가 적혀 있습니다.',
      '무너진 서랍에서 앨범 하나가 나옵니다. 대부분 젖었지만 한 장은 멀쩡합니다.',
      '{zone}의 담벼락에 사진이 압정으로 박혀 있습니다. 누가 일부러 붙여 둔 겁니다.'
    ],
    choices: [
      { t: '주소를 찾아가 보기로 한다.',
        res: ['가방 앞주머니에 사진을 넣습니다. 언젠가 그 근처를 지날 일이 있을 겁니다.'],
        eff: { add: ['photo'], chain: 'story_photo2' } },
      { t: '그냥 둔다.', res: ['남의 얼굴을 들고 다니는 건 무거운 일입니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'story_photo2', cat: '이야기', phase: [1, 2, 3], w: 0, req: { item: 'photo' },
    slots: { place: 'indoor', npc: 'elder' },
    open: [
      '사진 뒷면의 주소에 도착합니다. 집은 반쯤 무너졌지만, 사람이 살고 있습니다.',
      '주소지 근처에서 사진 속 얼굴과 닮은 사람을 봅니다.',
      '그 골목에 들어서자, 사진 속과 똑같은 대문이 그대로 서 있습니다.'
    ],
    choices: [
      { t: '사진을 건넨다.',
        res: ['{npc}이(가) 사진을 받아 들고 아무 말도 하지 않습니다. 아주 오래.',
               '그러고는 당신에게 밥을 차려 줍니다. 거절할 수 없는 종류의 식사입니다.'],
        eff: { del: ['photo'], hp: 1, mp: 1, add: ['warmth'], rep: { free: 1 } } },
      { t: '문 앞에 두고 온다.',
        res: ['압정으로 대문에 꽂아 둡니다. 누가 보든 안 보든, 사진은 집에 돌아왔습니다.'],
        eff: { del: ['photo'], mp: 1 } }
    ]
  });

  T.push({
    id: 'story_debt1', cat: '이야기', phase: [2, 3], w: 5,
    slots: { place: 'urban', npc: 'broker' },
    open: [
      '{npc}이(가) 당신을 부릅니다. "빚 하나 대신 갚아 줄 생각 없소? 값은 치르리다."',
      '{place} 앞에서 낯선 사람이 당신 이름을 부릅니다. 이름을 알려 준 적이 없는데도요.',
      '누군가 당신 뒤를 사흘째 밟고 있습니다. 오늘은 아예 앞에 나타났습니다.'
    ],
    mid: ['{line}'],
    choices: [
      { t: '무슨 빚인지 묻는다.', need: { skill: 'talk' },
        res: ['"사람 하나를 찾아 주면 되오. 갈고리한테 잡혀간 사람이오."', '값은 선불로 절반.'],
        eff: { money: 1, flag: 'debt_job', chain: 'story_debt2' } },
      { t: '거절한다.', res: ['"생각 바뀌면 오시오. 나는 늘 여기 있소."'], eff: {} }
    ]
  });

  T.push({
    id: 'story_debt2', cat: '이야기', phase: [2, 3], w: 0, req: { flag: 'debt_job' },
    slots: { place: 'urban', npc: 'raider' },
    open: [
      '수소문 끝에 그 사람이 있는 곳을 알아냅니다. 창고 뒤편 컨테이너입니다.',
      '찾던 사람이 컨테이너 안에 있습니다. 문 앞에 보초가 하나.',
      '{place} 뒤쪽, 자물쇠가 걸린 컨테이너에서 인기척이 납니다.'
    ],
    choices: [
      { t: '보초를 따돌린다.', need: { skill: 'sneak' }, dc: 1,
        ok: ['보초가 담배를 피우러 간 삼 분. 그거면 충분합니다.'],
        okEff: { flag: 'freed_debtor', mp: 1, add: ['warmth'] },
        no: ['발소리를 들켰습니다. 쫓기며 세 골목을 달립니다.'], noEff: { hp: -1 } },
      { t: '자물쇠를 딴다.', need: { skill: 'lock' },
        res: ['자물쇠가 소리 없이 열립니다. 안쪽 사람이 놀란 눈으로 당신을 봅니다.'],
        eff: { flag: 'freed_debtor', mp: 1 } },
      { t: '돈으로 산다.', need: { money: 1 }, cost: { money: 1 },
        res: ['{npc}이(가) 돈을 세어 보더니 어깨를 으쓱합니다. "어차피 밥값도 안 나오던 놈이오."'],
        eff: { flag: 'freed_debtor' } },
      { t: '포기하고 돌아간다.', res: ['오늘 할 수 있는 일이 아닙니다. 선불로 받은 돈이 무겁습니다.'],
        eff: { add: ['guilt'], mp: -1 } }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);

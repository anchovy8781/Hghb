/* 부산 2033 - 인카운터 템플릿 (4) 정착지, 일자리, 세력, 연속 이야기 */
(function (global) {
  'use strict';
  const B = global.B;
  const T = B.TEMPLATES;

  /* ═══ 정착지 · 일자리 ═══════════════════════════ */
  T.push({
    id: 'town_gate', cat: '기본', phase: [1, 2, 3], w: 9,
    slots: { place: 'urban', npc: 'guard' },
    open: [
      '{zone}에 사람 사는 마을이 있습니다. 컨테이너와 천막으로 벽을 세웠습니다.',
      '{zone}의 정착지 입구입니다. 문 앞에 "무기 반입 금지"라고 크게 써 붙였습니다.',
      '연기가 여러 줄기 올라옵니다. {zone}, 사람이 모여 사는 곳입니다.'
    ],
    choices: [
      { t: '정식으로 들어간다.', need: { money: 1 }, cost: { money: 1 },
        res: ['입장료를 내고 들어섭니다. 안쪽은 놀랄 만큼 정돈되어 있습니다. 아이 웃는 소리도 들립니다.'],
        eff: { mp: 1, flag: 'in_town' } },
      { t: '일손이 필요한지 묻는다.', need: { skill: 'talk' },
        res: ['물통 나르는 일을 하루 합니다. 어깨가 빠질 것 같지만, 저녁에 밥과 잠자리가 나옵니다.'],
        eff: { hp: 1, money: 1, rep: { market: 1 } } },
      { t: '의사가 있다고 말한다.', need: { skill: 'medic' },
        res: ['환자를 봐 주는 조건으로 문이 열립니다. 여기서는 의사가 통행증입니다.'],
        eff: { money: 1, rep: { market: 1 }, mp: 1 } },
      { t: '들어가지 않는다.', res: ['사람이 많은 곳은 규칙도 많습니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'town_work', cat: '조건부', phase: [1, 2, 3], w: 8, req: { flag: 'in_town' },
    slots: { place: 'urban', npc: 'trader', item: 'part' },
    open: [
      '마을 게시판에 일거리가 붙어 있습니다. 대개 위험하고, 대개 값이 쌉니다.',
      '{npc}이(가) 사람을 구합니다. "하루면 됩니다. 하루면."',
      '광장 한쪽에서 일꾼을 모읍니다. 줄이 제법 깁니다.'
    ],
    choices: [
      { t: '물자 운반을 맡는다.', cost: { hp: 1 },
        res: ['짐을 지고 반나절을 걷습니다. 삯은 정직하게 나옵니다.'], eff: { money: 1 } },
      { t: '수리 일을 맡는다.', need: { skill: 'tech' },
        res: ['발전기를 손봅니다. 불이 들어오자 사람들이 박수를 칩니다.'],
        eff: { money: 1, rep: { market: 1 }, add: ['hope'], skillUp: 'tech' } },
      { t: '호위를 맡는다.', need: { skill: 'shoot' }, dc: 1,
        ok: ['상단을 다음 마을까지 데려다줍니다. 아무 일도 없었고, 그게 제일 좋은 결과입니다.'],
        okEff: { money: 1, rep: { market: 1 } },
        no: ['도중에 습격을 받습니다. 짐 절반을 잃고, 당신도 성치 않습니다.'],
        noEff: { hp: -1, rep: { market: -1 } } },
      { t: '오늘은 쉰다.', res: ['일이 없는 날도 있어야 삽니다.'], eff: { mp: 1 } }
    ]
  });

  T.push({
    id: 'town_market', cat: '조건부', phase: [1, 2, 3], w: 8, req: { flag: 'in_town' },
    slots: { npc: 'trader', item: 'food', item2: 'med' },
    open: [
      '지하상가 좌판이 줄지어 있습니다. 저울마다 조합의 인장이 찍혀 있습니다.',
      '장이 섰습니다. 사람들이 서로의 물건을 손으로 만져 보며 값을 흥정합니다.',
      '{npc}의 좌판 앞에 사람이 몰려 있습니다. 오늘 물건이 좋은 모양입니다.'
    ],
    choices: [
      { t: '{item}을(를) 산다.', need: { money: 1 }, cost: { money: 1 },
        res: ['값을 치릅니다. 저울눈은 정확합니다. 조합이 그것 하나는 지킵니다.'], eff: { add: ['{item}', '{item}'] } },
      { t: '{item2}을(를) 산다.', need: { money: 1 }, cost: { money: 1 },
        res: ['약은 늘 비쌉니다. 그래도 삽니다.'], eff: { add: ['{item2}'] } },
      { t: '물건을 판다.', need: { itemKind: 'part' }, cost: { itemKind: 'part' },
        res: ['부품은 언제나 값이 나갑니다.'], eff: { money: 1 } },
      { t: '소문만 듣고 나온다.',
        res: ['좌판 사이를 돌며 이야기를 줍습니다. 요새 어디가 위험하고 어디에 물이 있는지 알게 됩니다.'],
        eff: { add: ['note'] } }
    ]
  });

  /* ═══ 세력 ═══════════════════════════════════════ */
  T.push({
    id: 'fac_union', cat: '조건부', phase: [2, 3], w: 6, req: { rep: { market: 1 } },
    slots: { place: 'under', npc: 'trader' },
    open: [
      '지하상가 조합에서 사람을 보냈습니다. 당신 이름이 위에까지 올라간 모양입니다.',
      '조합 사무실로 불려 갑니다. 저울 모양 인장이 벽에 크게 걸려 있습니다.',
      '{npc}이(가) 조합의 이름으로 제안을 합니다.'
    ],
    choices: [
      { t: '조합 일을 맡는다.',
        res: ['장부를 맡깁니다. 숫자를 다루는 일은 총을 다루는 일보다 안전하고, 대개 더 위험합니다.'],
        eff: { add: ['ledger'], rep: { market: 2 }, money: 1 } },
      { t: '인장을 요구한다.', need: { skill: 'talk' }, dc: 2,
        ok: ['조합 인장을 받습니다. 이제 어느 좌판에서나 외상이 됩니다.'],
        okEff: { add: ['badge'], rep: { market: 1 } },
        no: ['"아직 이릅니다." 정중하지만 단호합니다.'], noEff: { rep: { market: -1 } } },
      { t: '거절한다.', res: ['어느 편에도 서지 않는 것이 편할 때가 있습니다.'], eff: { rep: { market: -1 }, mp: 1 } }
    ]
  });

  T.push({
    id: 'fac_dock', cat: '조건부', phase: [2, 3], w: 6,
    slots: { place: 'water', npc: 'fisher' },
    open: [
      '영도 사람들이 나루에 배를 대고 있습니다. 뱃사람 연합입니다.',
      '{npc}이(가) 당신을 위아래로 훑습니다. "바다 타 봤소?"',
      '부잔교 위에서 연합의 깃발이 펄럭입니다. 물고기 뼈 모양입니다.'
    ],
    choices: [
      { t: '배를 탄다.', need: { skill: 'sea' },
        res: ['노를 잡습니다. 물살을 읽는 손이라며 {npc}이(가) 웃습니다.'],
        eff: { rep: { dock: 2 }, skillUp: 'sea', add: ['chart'] } },
      { t: '연료를 대 준다.', need: { item: 'gas' }, cost: { item: 'gas' },
        res: ['휘발유 한 병에 뱃사람들의 태도가 완전히 달라집니다.'],
        eff: { rep: { dock: 2 }, money: 1 } },
      { t: '뱃길을 묻는다.', need: { skill: 'talk' },
        res: ['해도의 한 귀퉁이를 손가락으로 짚어 줍니다. "여기는 절대 가지 마시오."'],
        eff: { add: ['map'], flag: 'knows_sea' } },
      { t: '물러난다.', res: ['바다는 아직 당신 것이 아닙니다.'], eff: {} }
    ]
  });

  T.push({
    id: 'fac_army', cat: '조건부', phase: [3], w: 5, req: { flag: 'heard_army' },
    slots: { place: 'indoor', npc: 'soldier' },
    open: [
      '53사단 잔존 병력의 초소에 도착합니다. 아직도 근무 교대를 합니다.',
      '철조망 안쪽에서 구령 소리가 납니다. 스무 명 남짓이 아직 군인입니다.',
      '{npc}이(가) 당신을 지휘관에게 데려갑니다. 지휘관은 상병입니다. 위로는 아무도 남지 않았습니다.'
    ],
    choices: [
      { t: '정보를 제공한다.', need: { item: 'note' }, cost: { item: 'note' },
        res: ['받아 적은 좌표를 넘깁니다. 지휘관의 손이 미세하게 떨립니다.'],
        eff: { rep: { army: 2 }, add: ['pass'] } },
      { t: '입대를 청한다.', need: { skill: 'shoot' },
        res: ['사격을 시험받습니다. 표적 셋 중 둘. 통과입니다.'],
        eff: { rep: { army: 2 }, add: ['bullet'], flag: 'enlisted' } },
      { t: '그날의 명령서를 묻는다.', need: { skill: 'talk' }, dc: 2,
        ok: ['지휘관이 오래 침묵하다 서랍을 엽니다. 봉인된 봉투가 하나 있습니다.'],
        okEff: { add: ['code'], flag: 'lead_bunker' },
        no: ['"그건 기밀입니다." 스무 해 지난 기밀입니다.'], noEff: {} },
      { t: '돌아선다.', res: ['군대는 아직 자기 자신을 믿고 있습니다.'], eff: {} }
    ]
  });

  /* ═══ 상태 · 조건부 ═══════════════════════════ */
  T.push({
    id: 'cond_headache', cat: '조건부', phase: [1, 2, 3], w: 7, req: { item: 'headache' },
    slots: {},
    open: [
      '관자놀이가 아침부터 쿡쿡 쑤십니다. 참을 만하다고 생각한 지 사흘째입니다.',
      '두통이 시야 가장자리를 갉아먹기 시작합니다.',
      '머리 한쪽이 통째로 저릿합니다. 눈을 감아도 나아지지 않습니다.'
    ],
    choices: [
      { t: '진통제를 먹는다.', need: { item: 'painkill' }, cost: { item: 'painkill' },
        res: ['이십 분쯤 지나자 세상이 조용해집니다.'], eff: { del: ['headache'], mp: 1 } },
      { t: '로망을 태워 진통제를 만든다.', need: { item: 'hope' }, cost: { item: 'hope' },
        res: ['품고 있던 것을 하나 내려놓습니다. 대신 알약 세 개가 생깁니다.'],
        eff: { add: ['painkill', 'painkill', 'painkill'], mp: -1 } },
      { t: '참는다.', res: ['참는 것도 능력입니다. 다만 값이 나중에 청구됩니다.'], eff: { hp: -1, mp: -1 } }
    ]
  });

  T.push({
    id: 'cond_gloom', cat: '조건부', phase: [1, 2, 3], w: 7, req: { item: 'gloom' },
    slots: { place: 'wild' },
    open: [
      '아무 이유 없이 걸음이 멈춥니다. 다시 떼기까지 한참이 걸립니다.',
      '{place}에 앉아 한 시간을 보냅니다. 일어날 이유를 찾는 데 그만큼 걸렸습니다.',
      '오늘은 아무것도 하기 싫습니다. 그런 날이 점점 늘어납니다.'
    ],
    choices: [
      { t: '누군가에게 말을 건다.', need: { skill: 'talk' },
        res: ['지나가는 사람을 붙잡고 아무 말이나 합니다. 상대도 아무 말이나 합니다. 그걸로 조금 낫습니다.'],
        eff: { del: ['gloom'], mp: 1 } },
      { t: '유머를 꺼낸다.', need: { item: 'humor' },
        res: ['혼자 실없는 농담을 합니다. 혼자 웃습니다. 웃었으니 된 겁니다.'],
        eff: { del: ['gloom'], mp: 1 } },
      { t: '사진을 본다.', need: { item: 'photo' },
        res: ['사진 속 사람들은 여전히 웃고 있습니다. 그게 위로가 되기도, 안 되기도 합니다.'],
        eff: { mp: 1, add: ['hope'] } },
      { t: '그냥 걷는다.', res: ['걷다 보면 어떻게든 됩니다. 대개는요.'], eff: { hp: -1 } }
    ]
  });

  T.push({
    id: 'cond_rad', cat: '조건부', phase: [1, 2, 3], w: 7, req: { radMin: 2 },
    slots: {},
    open: [
      '아침에 베개에 머리카락이 한 움큼 묻어납니다.',
      '잇몸에서 피가 멈추지 않습니다. 혀로 훑을 때마다 쇠 맛이 납니다.',
      '손톱 밑이 검게 변했습니다. 계기를 꺼내 보기가 무섭습니다.'
    ],
    choices: [
      { t: '요오드정을 먹는다.', need: { item: 'iodine' }, cost: { item: 'iodine' },
        res: ['정량을 지켜 삼킵니다. 며칠 뒤면 나아질 겁니다. 나아져야 합니다.'], eff: { rad: -1 } },
      { t: '의사를 찾아간다.', need: { money: 1 }, cost: { money: 1 },
        res: ['진료소에서 사흘을 누워 있습니다. 나올 때 다리가 후들거리지만 계기는 낮아졌습니다.'],
        eff: { rad: -1, hp: 1 } },
      { t: '지하에서 며칠 지낸다.',
        res: ['햇빛도 바람도 없는 곳에서 사흘을 보냅니다. 몸은 나아지고 마음은 나빠집니다.'],
        eff: { rad: -1, mp: -1, add: ['gloom'] } },
      { t: '무시한다.', res: ['아직 걸을 수 있으면 괜찮은 겁니다. 그렇게 믿기로 합니다.'], eff: { hp: -1 } }
    ]
  });

  /* ═══ 이야기 인카운터 (연속) ═══════════════════ */
  T.push({
    id: 'story_dog1', cat: '이야기', phase: [1, 2, 3], w: 5,
    slots: { place: 'urban' },
    open: [
      '{place} 근처에서 개 한 마리가 당신을 따라옵니다. 다리를 절뚝입니다.',
      '누런 개 한 마리가 세 골목째 같은 거리를 두고 따라옵니다.',
      '{zone}에서 개가 앞서 걷다가 돌아보고, 또 걷다가 돌아봅니다.'
    ],
    choices: [
      { t: '먹을 것을 나눠 준다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['개가 조심스럽게 다가와 먹습니다. 다 먹고는 당신 옆에 앉습니다.'],
        eff: { mp: 1, flag: 'dog_friend', chain: 'story_dog2' } },
      { t: '다리를 봐 준다.', need: { skill: 'medic' },
        res: ['가시가 박혀 있었습니다. 뽑아 주자 개가 손등을 핥습니다.'],
        eff: { mp: 1, flag: 'dog_friend', chain: 'story_dog2' } },
      { t: '쫓아낸다.', res: ['돌을 집는 시늉을 하자 개가 물러섭니다. 그래도 멀리 가지는 않습니다.'], eff: { mp: -1 } }
    ]
  });

  T.push({
    id: 'story_dog2', cat: '이야기', phase: [1, 2, 3], w: 0, req: { flag: 'dog_friend' },
    slots: { place: 'wild', threat: true },
    open: [
      '개가 갑자기 멈춰 서서 앞쪽을 향해 낮게 으르렁거립니다.',
      '따라오던 개가 털을 세웁니다. {place} 쪽에 뭔가 있습니다.',
      '개가 당신 앞을 막아섭니다. 처음 보는 자세입니다.'
    ],
    choices: [
      { t: '개를 믿고 돌아간다.',
        res: ['개가 이끄는 쪽으로 갑니다. 나중에 알았지만, 앞쪽 길에는 {threat}이(가) 진을 치고 있었습니다.'],
        eff: { mp: 1, add: ['hope'], chain: 'story_dog3' } },
      { t: '그래도 앞으로 간다.',
        res: ['개가 따라오지 않습니다. 백 걸음쯤 갔을 때, 왜 안 따라왔는지 알게 됩니다.'],
        eff: { hp: -1, mp: -1, del: ['hope'] } }
    ]
  });

  T.push({
    id: 'story_dog3', cat: '이야기', phase: [2, 3], w: 0, req: { flag: 'dog_friend' },
    slots: { place: 'urban' },
    open: [
      '개가 며칠째 밥을 잘 못 먹습니다. 배가 눈에 띄게 불렀습니다.',
      '개가 {place} 안쪽으로 들어가더니 나오지 않습니다.',
      '아침에 눈을 뜨니 개가 없습니다. 한참을 찾다 {place}에서 발견합니다.'
    ],
    choices: [
      { t: '옆을 지킨다.',
        res: ['새끼 넷이 태어납니다. 세상이 이런데도 태어납니다. 당신은 아무 말도 못 하고 한참을 봅니다.'],
        eff: { mp: 1, add: ['hope', 'hope'], flag: 'dog_pups' } },
      { t: '먹을 것을 구해 온다.', need: { itemKind: 'food' }, cost: { itemKind: 'food' },
        res: ['가진 것을 전부 내려놓습니다. 오늘 당신은 굶지만, 넷은 삽니다.'],
        eff: { hp: -1, mp: 1, add: ['hope', 'hope'], flag: 'dog_pups' } }
    ]
  });

  T.push({
    id: 'story_note1', cat: '이야기', phase: [1, 2, 3], w: 5,
    slots: { place: 'indoor' },
    open: [
      '{place} 벽에 분필로 쓴 글씨가 있습니다. "3일 뒤 여기서 만나자. — ㅇ"',
      '{place}에서 반쯤 탄 편지를 줍습니다. 날짜가 지난주입니다.',
      '문틈에 쪽지가 끼워져 있습니다. 아직 잉크가 번지지 않았습니다.'
    ],
    choices: [
      { t: '답장을 써 둔다.', need: { skill: 'read' },
        res: ['옆에 짧게 적습니다. "나는 살아 있다. 당신도 그러길." 이름은 쓰지 않습니다.'],
        eff: { mp: 1, chain: 'story_note2' } },
      { t: '기다려 본다.',
        res: ['해가 질 때까지 앉아 있습니다. 아무도 오지 않지만, 오지 않았다는 것도 정보입니다.'],
        eff: { mp: -1, chain: 'story_note2' } },
      { t: '쪽지를 챙긴다.', res: ['종이는 언제나 쓸모가 있습니다.'], eff: { add: ['note'] } }
    ]
  });

  T.push({
    id: 'story_note2', cat: '이야기', phase: [1, 2, 3], w: 0,
    slots: { place: 'indoor', npc: 'scav' },
    open: [
      '며칠 뒤, 같은 자리에 답장이 붙어 있습니다.',
      '그 자리에 다시 가 봅니다. 글씨가 하나 더 늘었습니다.',
      '{place}. 이번에는 사람이 앉아 있습니다.'
    ],
    choices: [
      { t: '얼굴을 마주한다.',
        res: ['{npc}입니다. 서로 아무 관계도 없지만, 글씨를 주고받은 사이입니다. 그것으로 충분합니다.'],
        eff: { mp: 1, add: ['hope'], rep: { free: 1 } } },
      { t: '멀리서 지켜만 본다.', need: { skill: 'sneak' },
        res: ['한 시간을 지켜봅니다. 그 사람은 계속 누군가를 기다립니다. 결국 당신은 나서지 않습니다.'],
        eff: { mp: -1, add: ['gloom'] } }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);

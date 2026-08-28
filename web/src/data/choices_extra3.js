/* 부산 2033 - 기존 사건에 붙이는 선택지 (3)
 *
 * 새로 생긴 물건(무릎 보호대 · 방한화 · 신호 거울 · 덫 · 분필 · 압력계 · 깡통 커피)이
 * 실제로 쓰이는 자리를 만들고, 자주 나오는 사건에 길을 더 냅니다.
 * 마지막 선택지는 늘 맨 뒤에 남겨 둡니다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MORE = {

    scav_home: [
      { t: '옷장 제일 아래 칸을 본다.', need: { skill: 'watch' },
        res: ['옷장 위 칸은 스무 번쯤 털렸습니다. 아래 칸은 무릎을 꿇어야 보입니다.',
               '겨울옷이 개켜진 채로 들어 있습니다. 여름에 털린 집이라 아무도 안 가져갔습니다.',
               '두꺼운 것 한 벌과, 그 아래 깔려 있던 신발 한 켤레.'],
        eff: { add: ['winterboot', 'thread'], mp: 1, skillUp: 'watch' } },
      { t: '벽에 자로 그은 금을 읽는다.',
        res: ['문틀에 연필로 금이 그어져 있습니다. 아이 키를 잰 자국입니다.',
               '금이 아홉 개고, 옆에 날짜가 적혀 있습니다. 마지막이 2015년 7월입니다.',
               '그 위로는 안 그어져 있습니다.'],
        eff: { mp: -1, add: ['gloom'] } }
    ],

    scav_factory: [
      { t: '압력계를 떼어 낸다.', need: { skill: 'tech' },
        res: ['배관마다 계기가 달려 있습니다. 대부분 바늘이 부러졌습니다.',
               '셋 중 하나가 아직 멀쩡합니다. 나사를 풀어 떼어 냅니다.',
               '이런 물건은 보일러 방에서 값을 합니다. 사람이 데는 걸 미리 막아 주니까요.'],
        eff: { add: ['pressgauge'], mp: 2, skillUp: 'tech' } },
      { t: '작업자 사물함을 하나씩 연다.', need: { skill: 'lock' },
        res: ['사물함이 마흔 개인데 잠긴 것이 아홉입니다.',
               '잠긴 것 아홉을 엽니다. 여덟은 작업복과 장갑뿐입니다.',
               '아홉째에 공구 벨트가 통째로 걸려 있습니다. 주인이 그날 안 매고 나갔습니다.'],
        eff: { add: ['toolbelt', 'kneepad'], mp: 2, skillUp: 'lock' } }
    ],

    scav_market: [
      { t: '얼음 창고 자리를 찾는다.', need: { skill: 'sense' },
        res: ['시장에는 반드시 지하 얼음 굴이 있습니다. 없으면 생선을 못 팔았을 테니까요.',
               '바닥 기울기를 보고 찾습니다. 물이 흐르던 쪽 끝에 문이 하나 있습니다.',
               '안이 아직 서늘합니다. 톱밥이 그대로 깔려 있습니다.'],
        eff: { add: ['icebox', 'saltblock'], mp: 2, skillUp: 'sense' } },
      { t: '좌판 밑을 훑는다.',
        res: ['좌판을 들어 보면 그 아래 자잘한 것이 떨어져 있습니다.',
               '동전, 단추, 그리고 이십 년 전 영수증 뭉치.',
               '영수증에 값이 적혀 있습니다. 이십 년 전 값을 보면 지금이 얼마나 이상한지 압니다.'],
        eff: { add: ['{item}', 'coinpurse'], mp: 1 } }
    ],

    scav_boat: [
      { t: '조타실 유리를 떼어 낸다.', need: { skill: 'hand' },
        res: ['조타실 유리가 두껍고 깨끗합니다. 이런 유리는 이 도시에서 값이 나갑니다.',
               '테두리를 따라 조심스레 뜯어냅니다. 한 장을 통째로 살립니다.',
               '햇빛에 대 보니 상이 안 일그러집니다. 신호용으로 쓸 만합니다.'],
        eff: { add: ['signalmirror'], mp: 2, skillUp: 'hand' } },
      { t: '어창 바닥을 긁는다.', need: { skill: 'gut' },
        res: ['어창 바닥에 이십 년 묵은 것이 눌어붙어 있습니다. 냄새가 굉장합니다.',
               '긁어 내니 아래에 소금이 두껍게 깔려 있습니다. 생선 절이던 소금입니다.',
               '소금은 이십 년이 지나도 소금입니다.'],
        eff: { add: ['saltblock'], wear: { hp: 1 }, mp: 1, skillUp: 'gut' } }
    ],

    meet_medic: [
      { t: '수액 만드는 법을 배운다.', need: { skill: 'medic' },
        res: ['끓인 물에 소금과 설탕을 정해진 만큼 섞습니다. 비율이 전부입니다.',
               '"틀리면 어떻게 됩니까." "틀리면 사람이 죽습니다."',
               '숟가락 하나를 기준으로 삼아 외웁니다. 그 숟가락을 얻어 갑니다.'],
        eff: { add: ['ivbag'], mp: 2, skillUp: 'medic' } },
      { t: '상처를 제대로 씻는 법을 배운다.', need: { skill: 'firstaid' },
        res: ['약보다 먼저인 것이 물입니다. 끓여 식힌 물로 오래 씻는 것이 절반입니다.',
               '"얼마나 오래요?" "아프다고 할 때까지요. 그다음에 조금 더요."',
               '천을 삶아 말리는 법까지 배우고 나옵니다.'],
        eff: { add: ['sterilkit'], mp: 2, skillUp: 'firstaid' } }
    ],

    meet_elder: [
      { t: '깡통 커피를 나눠 마신다.', need: { item: 'coffeecan' }, cost: { item: 'coffeecan' },
        res: ['깡통을 따서 반씩 나눕니다. 데울 데가 없어서 찬 채로 마십니다.',
               '노인이 한 모금 마시고 아주 오래 아무 말도 안 합니다.',
               '"이십 년 만이오." 그러고는 이십 년 전 얘기를 두 시간 합니다.'],
        eff: { mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } },
      { t: '옛날 노래를 물어본다.', need: { skill: 'music' },
        res: ['"이 동네에서 부르던 노래 아십니까." 노인이 한참 생각합니다.',
               '"한 소절만 기억나오." 그 한 소절을 세 번 불러 줍니다.',
               '받아 적습니다. 이 도시가 기억하는 노래가 한 곡 더 남습니다.'],
        eff: { add: ['songsheet'], mp: 2, skillUp: 'music', rep: { free: 1 } } }
    ],

    meet_farmer: [
      { t: '거름을 보태 준다.', need: { item: 'batguano' }, cost: { item: 'batguano' },
        res: ['자루를 내려놓자 냄새가 확 퍼집니다. 농부가 냄새부터 맡습니다.',
               '"이거 어디서 났습니까." 갱도라고 하니 눈이 커집니다.',
               '"이 한 자루면 올해 두 배입니다." 그해 가을에 정말로 그랬다고 합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'seedpack2'] } },
      { t: '덫을 놓아 준다.', need: { item: 'trapkit' },
        res: ['밭을 파먹는 것은 대개 짐승입니다. 사람보다 짐승이 더 자주 옵니다.',
               '밭 가장자리 셋에 덫을 놓습니다. 잡는 덫이 아니라 놀라게 하는 덫입니다.',
               '"죽이는 거 아닙니까?" "아닙니다. 아프면 안 옵니다."'],
        eff: { mp: 2, rep: { free: 2 }, add: ['goodrep', 'seeds'] } }
    ],

    meet_runner: [
      { t: '거울로 앞을 확인해 준다.', need: { item: 'signalmirror' },
        res: ['언덕 위에 올라가 거울로 앞길에 신호를 보냅니다.',
               '한참 뒤에 답이 옵니다. 두 번이면 안전, 세 번이면 돌아가라는 뜻입니다.',
               '세 번이 옵니다. 오늘은 돌아갑니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'stable'] } },
      { t: '편지를 하나 맡는다.', need: { skill: 'will' },
        res: ['"이거 산 위까지 갑니까." 간다고 대답합니다.',
               '"언제까지요?" "언제까지인지는 못 정합니다. 가긴 갑니다."',
               '전령이 가방에서 한 통을 꺼내 줍니다. 겉에 이름만 적혀 있습니다.'],
        eff: { add: ['letter'], mp: 2, skillUp: 'will' } }
    ],

    haz_collapse: [
      { t: '무릎 보호대를 차고 기어든다.', need: { item: 'kneepad' },
        res: ['무너진 콘크리트 위를 무릎으로 기어야 합니다. 맨 무릎이면 십 미터에서 포기합니다.',
               '보호대를 차니 삼십 미터를 갑니다. 안쪽에 사람이 남긴 자리가 있습니다.',
               '나오는 길에 큰 조각이 무릎을 칩니다. 보호대가 대신 깨집니다.'],
        eff: { add: ['{item}'], mp: 2, del: ['kneepad'], add2: ['kneepadtorn'] } },
      { t: '받침을 세워 가며 들어간다.', need: { skill: 'eng' },
        res: ['서두르면 들어간 사람이 묻힙니다. 한 걸음마다 각목을 하나씩 세웁니다.',
               '느립니다. 대신 나올 때 그 각목을 짚고 나옵니다.',
               '들어간 사람 셋이 다 나옵니다.'],
        eff: { mp: 3, rep: { free: 2 }, skillUp: 'eng', add: ['goodrep', 'buildmat'] } }
    ],

    haz_fire: [
      { t: '바람 방향부터 읽는다.', need: { skill: 'sense' },
        res: ['불은 바람을 따라갑니다. 사람은 대개 불에서 멀어지는 쪽으로 뜁니다.',
               '그 둘이 같은 방향이면 뛰는 사람이 따라잡힙니다.',
               '옆으로 빠지라고 소리칩니다. 열둘이 방향을 바꿉니다.'],
        eff: { mp: 3, rep: { free: 2 }, skillUp: 'sense', add: ['goodrep'] } },
      { t: '젖은 천으로 얼굴을 싸 준다.', need: { itemKind: 'water' }, cost: { itemKind: 'water' },
        res: ['{spend}을(를) 천에 부어 여럿에게 나눠 줍니다.',
               '불에서 사람을 죽이는 것은 대개 열이 아니라 연기입니다.',
               '젖은 천 하나가 그 연기를 몇 분 막아 줍니다. 몇 분이면 나옵니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'towel'] } }
    ],

    haz_flood: [
      { t: '분필로 물 높이를 표시해 둔다.', need: { item: 'chalkbox' },
        res: ['벽에 지금 물 높이를 긋고 시각을 적습니다. 한 시간 뒤에 또 긋습니다.',
               '두 금 사이 간격으로 언제 이 골목이 잠기는지 계산이 됩니다.',
               '"세 시간 남았습니다." 그 세 시간에 동네 하나가 짐을 옮깁니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } },
      { t: '지붕으로 올려 보낸다.', need: { skill: 'lead' },
        res: ['물이 오는 데서 사람을 옆으로 옮기면 늦습니다. 위로 올려야 합니다.',
               '사다리 둘을 세우고 순서를 정합니다. 아이, 노인, 짐, 그다음이 어른입니다.',
               '마지막으로 올라가 지붕에 앉으니 아래가 이미 무릎까지입니다.'],
        eff: { wear: { hp: 1 }, mp: 3, rep: { free: 2 }, skillUp: 'lead', add: ['goodrep', 'grit'] } }
    ],

    rest_bath: [
      { t: '보일러 압력을 봐 준다.', need: { item: 'pressgauge' },
        res: ['물을 데우는 통에 계기가 없습니다. 계기 없이 불을 때는 것이 제일 위험합니다.',
               '가진 것을 달아 줍니다. 바늘이 빨간 칸에 가면 불을 빼면 됩니다.',
               '"이거 없을 때는 어떻게 했습니까." "소리로요." 소리로 알면 늦습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } },
      { t: '남의 등을 밀어 준다.',
        res: ['탕에 앉은 노인이 등을 좀 밀어 달라고 합니다.',
               '이십 년 만에 남의 등을 밉니다. 밀면서 아무 말도 안 합니다.',
               '끝나고 노인이 이쪽 등을 밀어 줍니다. 그것도 이십 년 만입니다.'],
        eff: { hp: 1, mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } }
    ],

    town_work: [
      { t: '무릎 보호대를 차고 한다.', need: { item: 'kneepad' },
        res: ['하루 종일 무릎으로 기는 일입니다. 배수로 치기나 바닥 까는 일이 그렇습니다.',
               '보호대가 있으니 저녁에 걸을 수 있습니다. 없으면 다음 날 못 나옵니다.',
               '"그거 어디서 났습니까." 다들 그것부터 묻습니다.'],
        eff: { money: 1, mp: 2, rep: { free: 1 }, add: ['goodrep'] } },
      { t: '일을 나누는 순서를 짜 준다.', need: { skill: 'account' },
        res: ['열둘이 붙었는데 다들 같은 일을 하고 있습니다. 그러면 하루가 반나절 몫입니다.',
               '넷씩 셋으로 나누고, 나르기와 파기와 다지기를 돌립니다.',
               '해 지기 전에 끝납니다. 반장이 놀랍니다.'],
        eff: { money: 1, mp: 3, rep: { free: 2 }, skillUp: 'account', add: ['goodrep'] } }
    ],

    town_market: [
      { t: '깡통 커피를 판다.', need: { item: 'coffeecan' }, cost: { item: 'coffeecan' },
        res: ['좌판에 올려놓자 사람이 넷 붙습니다. 값을 부르기도 전에요.',
               '"이거 몇 개 있소?" 하나라고 하니 넷이 서로를 봅니다.',
               '값이 세 번 올라갑니다. 이 도시에 커피가 얼마 안 남았습니다.'],
        eff: { money: 2, mp: 2, rep: { market: 1 } } },
      { t: '소금을 무게로 산다.', need: { skill: 'account' },
        res: ['소금은 부피로 사면 손해입니다. 물을 먹으면 부피가 늡니다.',
               '무게를 달아 사겠다고 하니 상인이 웃습니다. "아는 양반이네."',
               '같은 값에 삼 할을 더 받습니다.'],
        eff: { add: ['saltblock'], mp: 2, skillUp: 'account', rep: { market: 1 } } }
    ],

    wint_store: [
      { t: '방한화를 신는다.', need: { item: 'winterboot' },
        res: ['겨울에 이 도시에서 제일 먼저 못 쓰게 되는 것이 발입니다.',
               '두꺼운 신발을 신고 나니 걷는 거리가 반나절 늘어납니다.',
               '"발이 따뜻하면 밤이 반으로 줄어듭니다." 그 말이 맞습니다.'],
        eff: { hp: 1, mp: 2, add: ['warmth'] } },
      { t: '등잔 기름을 채워 둔다.', need: { item: 'lampoil' }, cost: { item: 'lampoil' },
        res: ['겨울밤은 열네 시간입니다. 그 열네 시간을 어둠으로 다 보내면 사람이 이상해집니다.',
               '등잔에 기름을 채우니 세 시간이 생깁니다.',
               '그 세 시간에 바느질을 하고, 얘기를 하고, 아이에게 글자를 가르칩니다.'],
        eff: { mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } }
    ],

    odd_kids: [
      { t: '장기 알을 꺼내 놓는다.', need: { item: 'chesspiece' }, cost: { item: 'chesspiece' },
        res: ['알을 바닥에 늘어놓자 아이들이 둘러앉습니다. 차가 하나 없어서 병으로 대신합니다.',
               '규칙을 가르치는 데 반나절이 걸립니다. 배우고 나니 아이들끼리 둡니다.',
               '한 달 뒤에 이 동네 아이들이 다 장기를 둔다는 소문이 들립니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['humor', 'goodrep'] } },
      { t: '아기 신발 한 짝을 보여 준다.', need: { item: 'babyshoe' },
        res: ['"이거 누구 건지 아는 사람 있나." 아이들이 돌려 봅니다.',
               '제일 어린 아이가 한참 보다가 말합니다. "우리 집에 나머지 한 짝 있는데."',
               '따라가 보니 정말로 있습니다. 두 짝이 이십 년 만에 다시 한 켤레가 됩니다.'],
        eff: { del: ['babyshoe'], mp: 3, rep: { free: 2 }, add: ['warmth', 'goodrep', 'relief'] } }
    ],

    odd_music: [
      { t: '녹슨 하모니카를 분다.', need: { item: 'harmonica2' },
        res: ['두 음이 안 납니다. 그 두 음을 피해서 부는 법을 익혀야 합니다.',
               '한 곡을 어색하게 끝까지 붑니다. 어색한데 다들 듣습니다.',
               '"그거 원래 그런 곡입니까." 아니라고 대답하고 한 번 더 붑니다.'],
        eff: { mp: 3, add: ['humor', 'warmth'], rep: { free: 1 } } },
      { t: '박자를 물통으로 맞춘다.', need: { skill: 'music' },
        res: ['물통을 엎어 놓고 손바닥으로 칩니다. 둥, 둥, 따.',
               '한 사람이 치면 두 사람이 붙고, 두 사람이 붙으면 열이 됩니다.',
               '아무도 노래를 안 하는데 열둘이 같은 박자로 앉아 있습니다.'],
        eff: { mp: 3, skillUp: 'music', add: ['humor', 'relief'], rep: { free: 1 } } }
    ],

    sea_catch: [
      { t: '얼음을 미리 챙겨 간다.', need: { item: 'icebox' },
        res: ['잡는 것보다 살려 오는 것이 어렵습니다. 여름이면 더 그렇습니다.',
               '아이스박스에 담아 오니 저녁까지 상하지 않습니다.',
               '상하지 않은 생선은 값이 두 배입니다.'],
        eff: { add: ['freshfish', 'freshfish'], money: 1, mp: 2 } },
      { t: '기형인 것을 골라낸다.', need: { skill: 'fish' },
        res: ['지느러미를 세고 눈을 보고 배를 만져 봅니다.',
               '스무 마리 중 둘이 이상합니다. 둘은 도로 던집니다.',
               '"아깝지 않습니까." "먹고 아픈 게 더 아깝습니다."'],
        eff: { add: ['freshfish'], mp: 2, skillUp: 'fish', rep: { dock: 1 } } }
    ],

    odd_train: [
      { t: '침목에 분필로 거리를 적어 둔다.', need: { item: 'chalkbox' },
        res: ['철길을 걷는 사람은 자기가 얼마나 왔는지를 모릅니다.',
               '침목 백 개마다 분필로 숫자를 적습니다. 백 개가 육십 미터쯤입니다.',
               '한 달 뒤에 이 길을 걷는 사람들이 그 숫자로 거리를 말합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } },
      { t: '레일에 귀를 대 본다.', need: { skill: 'sense' },
        res: ['레일에 귀를 대면 아주 멀리서 나는 소리가 들립니다.',
               '기차는 없습니다. 그런데 손수레는 다닙니다.',
               '한참 듣고 있으니 뭔가가 옵니다. 옆으로 비켜 기다립니다.'],
        eff: { mp: 2, skillUp: 'sense', add: ['stable'] } }
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

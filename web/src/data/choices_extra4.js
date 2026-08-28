/* 부산 2033 - 기존 사건에 붙이는 선택지 (4)
 *
 * 새로 생긴 물건(무쇠 판 · 손 맷돌 · 유리병 · 긴 밧줄 · 응급 가방 ·
 * 함석 가위 · 벼루와 먹 · 방한 장구)이 쓰이는 자리를 만들고,
 * 자주 나오는 사건에 길을 더 냅니다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MORE = {

    scav_pharm: [
      { t: '응급 가방을 통째로 찾는다.', need: { skill: 'medic', lv: 2 },
        res: ['약국 안쪽에는 출동용 가방이 하나씩 있습니다. 구급차에 실으려고 싸 둔 것입니다.',
               '창고 제일 아래 칸에서 나옵니다. 봉인이 안 뜯겼습니다.',
               '한 사람 몫이 통째로 들어 있습니다. 이런 건 이 도시에 몇 없습니다.'],
        eff: { add: ['firstpack'], mp: 3, skillUp: 'medic' } }
    ],

    scav_hospital: [
      { t: '멸균 세트를 챙긴다.', need: { skill: 'firstaid' },
        res: ['수술실 앞 선반에 포에 싸인 것이 줄지어 있습니다.',
               '포가 안 뜯긴 것만 고릅니다. 뜯긴 것은 이십 년 동안 공기를 먹었습니다.',
               '넷을 챙깁니다. 넷이면 상처 넷을 덧나지 않게 합니다.'],
        eff: { add: ['sterilkit', 'boiledgauze'], mp: 2, skillUp: 'firstaid' } },
      { t: '수액 거치대를 하나 뽑아 간다.',
        res: ['바퀴가 셋만 남았습니다. 굴러가지는 않습니다.',
               '대신 짚고 걸으면 지팡이가 됩니다. 길이도 맞춰집니다.',
               '무릎이 안 좋은 사람에게 주면 값을 합니다.'],
        eff: { add: ['ivstand'], mp: 1 } }
    ],

    scav_school: [
      { t: '벼루와 먹을 찾는다.', need: { skill: 'watch' },
        res: ['서예실이 남아 있는 학교가 가끔 있습니다. 문에 붓 그림이 그려져 있습니다.',
               '벼루가 스물, 먹이 마흔 개입니다. 이십 년이 지나도 먹은 먹입니다.',
               '이걸로 쓴 글씨는 비에 안 지워집니다. 이 도시에서 그건 큰 값입니다.'],
        eff: { add: ['inkstone', 'sootink'], mp: 2, skillUp: 'watch' } },
      { t: '종을 떼어 간다.', need: { skill: 'force' },
        res: ['현관 처마에 종이 하나 걸려 있습니다. 학교 종입니다.',
               '떼는 데 반 시간이 걸립니다. 무겁습니다.',
               '이걸 동네에 걸면 그 동네가 커집니다. 종소리가 닿는 데까지가 동네니까요.'],
        eff: { add: ['schoolbell'], wear: { hp: 1 }, mp: 2, skillUp: 'force' } }
    ],

    scav_factory: [
      { t: '함석 가위를 찾는다.', need: { skill: 'watch' },
        res: ['판금 작업대 서랍에 있습니다. 손잡이가 길고 날이 짧은 가위입니다.',
               '함석을 종이처럼 자릅니다. 지붕 이는 사람에게는 이게 곧 밥입니다.',
               '두 자루가 있습니다. 하나만 가져갑니다.'],
        eff: { add: ['tinsnip'], mp: 2, skillUp: 'watch' } },
      { t: '큰 유리병을 꺼내 온다.',
        res: ['실험실이나 식품 공장에는 큰 유리병이 있습니다. 열 되짜리입니다.',
               '깨지지 않게 천으로 싸서 짊어집니다.',
               '이걸로 물을 거르고, 술을 담그고, 씨앗을 보관합니다.'],
        eff: { add: ['glassjar'], mp: 1 } }
    ],

    scav_home: [
      { t: '손 맷돌을 찾는다.', need: { skill: 'cook' },
        res: ['부엌 찬장 아래 칸에 돌덩이가 둘 겹쳐 있습니다. 맷돌입니다.',
               '한 시간 돌리면 한 끼가 나옵니다. 알곡을 그냥 삶는 것과 갈아서 쑤는 것은 다릅니다.',
               '무겁습니다. 그래도 가져갑니다.'],
        eff: { add: ['handmill'], wear: { hp: 1 }, mp: 2, skillUp: 'cook' } },
      { t: '무쇠 판을 떼어 간다.',
        res: ['부뚜막에 무쇠 판이 얹혀 있습니다. 이십 년 동안 아무도 안 가져갔습니다.',
               '무거워서입니다. 무거운데도 가져가는 이유는 하나입니다.',
               '이거 하나면 불 위에서 뭐든 구워집니다.'],
        eff: { add: ['stoveplate'], wear: { hp: 1 }, mp: 1 } }
    ],

    rest_camp: [
      { t: '무쇠 판에 구워 먹는다.', need: { item: 'stoveplate' },
        res: ['불 위에 판을 얹고 가진 것을 올립니다. 삶는 것보다 훨씬 낫습니다.',
               '냄새가 멀리 갑니다. 그게 좋기도 하고 나쁘기도 합니다.',
               '오늘은 좋은 쪽이었습니다. 둘이 냄새를 맡고 왔고, 둘 다 뭔가를 들고 왔습니다.'],
        eff: { hp: 1, mp: 3, add: ['warmth', '{item}'] } },
      { t: '귀 덮는 모자를 쓰고 잔다.', need: { item: 'wintercap' },
        res: ['머리에서 열이 제일 많이 빠집니다. 그래서 모자가 이불보다 낫습니다.',
               '귀까지 덮고 눕습니다. 바람 소리가 반으로 줄어듭니다.',
               '오랜만에 깨지 않고 아침까지 잡니다.'],
        eff: { hp: 1, mp: 2, add: ['relief', 'warmth'] } }
    ],

    rest_road: [
      { t: '솔잎차를 끓인다.', need: { item: 'pinetea' }, cost: { item: 'pinetea' },
        res: ['물을 끓여 솔잎을 넣습니다. 맛은 없습니다.',
               '대신 몸이 안에서부터 데워집니다. 겨울 길에서 이만한 게 없습니다.',
               '한 잔 마시고 나면 걸을 만해집니다.'],
        eff: { hp: 1, mp: 2, add: ['warmth'] } },
      { t: '길바닥에 표시를 남긴다.', need: { item: 'inkstone' },
        res: ['먹으로 벽에 씁니다. 날짜와 본 것을 씁니다.',
               '먹은 비에 안 지워집니다. 분필과 다른 점이 그겁니다.',
               '이 길을 다음에 지나는 사람이 이걸 읽습니다.'],
        eff: { mp: 2, rep: { free: 1 }, add: ['goodrep'] } }
    ],

    meet_trade: [
      { t: '소금으로 값을 치른다.', need: { item: 'saltblock' }, cost: { item: 'saltblock' },
        res: ['소금은 이 도시에서 돈에 제일 가깝습니다. 안 상하고 다들 필요합니다.',
               '한 덩이를 내밀자 상대가 바로 셈을 시작합니다.',
               '값이 잘 쳐집니다. 돈보다 낫습니다.'],
        eff: { add: ['{item}', '{item2}'], mp: 2, rep: { market: 1 } } },
      { t: '된장을 두고 흥정한다.', need: { item: 'beanpaste' }, cost: { item: 'beanpaste' },
        res: ['된장은 오래될수록 값이 오르는 몇 안 되는 물건입니다.',
               '한 덩이를 내려놓자 상대가 냄새부터 맡습니다. "이거 몇 년입니까."',
               '오래된 것이라고 하니 값이 두 배가 됩니다.'],
        eff: { money: 1, add: ['{item}'], mp: 2, rep: { market: 1 } } }
    ],

    meet_child: [
      { t: '가래떡을 구워 준다.', need: { item: 'ricecake' }, cost: { item: 'ricecake' },
        res: ['불에 올리니 부풉니다. 아이들이 부푸는 것을 보고 소리를 지릅니다.',
               '맛보다 부푸는 걸 보려고 굽는 겁니다. 다들 압니다.',
               '넷이 하나씩 나눠 물고 아무 말도 안 합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['warmth', 'humor', 'goodrep'] } },
      { t: '빈 액자를 준다.', need: { item: 'photoframe' }, cost: { item: 'photoframe' },
        res: ['"이거 빈 건데요." 아이가 그럽니다. 넣을 걸 나중에 넣으라고 합니다.',
               '"뭘 넣습니까." "그림 그려서 넣어도 되고."',
               '한 달 뒤에 그 액자에 그림이 들어 있는 것을 봅니다.'],
        eff: { mp: 3, rep: { free: 1 }, add: ['warmth', 'drawing'] } }
    ],

    meet_broker: [
      { t: '명단을 판다.', need: { item: 'namelist' },
        res: ['이 도시에서 제일 잘 팔리는 종이가 사람 이름이 적힌 종이입니다.',
               '"사람 찾는 사람이 여전히 많습니까." 브로커가 웃습니다.',
               '"줄어들지가 않습니다. 그게 이 장사가 안 망하는 이유입니다."'],
        eff: { money: 2, mp: 2, rep: { market: 1 } } },
      { t: '사람 찾는 값을 묻는다.',
        res: ['"이름 하나에 얼마입니까." "찾으면 얼마, 못 찾으면 얼마입니다."',
               '"못 찾아도 받습니까." "찾는 데 드는 값은 같으니까요."',
               '틀린 말은 아닙니다. 그래도 기분은 좋지 않습니다.'],
        eff: { mp: -1, add: ['note'] } }
    ],

    haz_water: [
      { t: '긴 밧줄을 건다.', need: { item: 'ropelong' },
        res: ['물살이 센 데를 건널 때는 줄을 먼저 걸어야 합니다.',
               '한쪽을 나무에 묶고 건너가 반대쪽에 묶습니다. 첫 사람이 제일 위험합니다.',
               '줄이 걸리고 나면 나머지는 쉽습니다. 여섯이 차례로 건넙니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'grit'] } },
      { t: '유리병으로 물을 걸러 마신다.', need: { item: 'glassjar' },
        res: ['모래와 숯과 천을 병 안에 층으로 넣습니다. 위에서 부으면 아래로 맑은 게 나옵니다.',
               '한 병에 반나절이 걸립니다. 대신 배탈이 안 납니다.',
               '옆 사람들 것도 걸러 줍니다.'],
        eff: { add: ['water', 'boiled'], mp: 2, rep: { free: 1 } } }
    ],

    haz_storm: [
      { t: '모래주머니를 쌓는다.', need: { item: 'sandbagkit' },
        res: ['물이 오기 전에 쌓아야 값을 합니다. 오고 나면 늦습니다.',
               '문 앞에 두 겹으로 쌓습니다. 반 시간 일입니다.',
               '그날 밤에 골목이 무릎까지 찼습니다. 문 안쪽은 말랐습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'stable'] } },
      { t: '두꺼운 장갑을 나눠 준다.', need: { item: 'winterglove' }, cost: { item: 'winterglove' },
        res: ['비바람에 젖은 손은 삼십 분이면 감각이 없어집니다.',
               '장갑 한 켤레를 제일 어린 사람에게 줍니다.',
               '그 사람이 그날 밤에 짐을 두 배 날랐습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } }
    ],

    town_gate: [
      { t: '소금 한 덩이를 통행료로 낸다.', need: { item: 'saltblock' }, cost: { item: 'saltblock' },
        res: ['초소 사람이 소금을 보고 눈이 커집니다.',
               '"통행료로 소금 받은 건 처음입니다." 두 사람이 나와서 봅니다.',
               '그날 이 문은 값을 안 받고 열렸습니다. 대신 소금은 가져갔습니다.'],
        eff: { mp: 2, rep: { free: 2 }, add: ['goodrep'] } },
      { t: '초소 지붕을 봐 준다.', need: { item: 'tinsnip' },
        res: ['초소 지붕이 한쪽으로 새고 있습니다. 밤에 서 있는 사람이 젖습니다.',
               '함석을 잘라 대고 못을 박습니다. 한 시간 일입니다.',
               '"이제 안 샙니까." 안 샌다고 합니다. 그날부터 이 문은 이쪽을 그냥 통과시킵니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    town_work: [
      { t: '손 맷돌을 빌려 준다.', need: { item: 'handmill' },
        res: ['일하는 사람 열둘 몫 밥을 짓는데 절구뿐입니다.',
               '맷돌을 내놓으니 밥 짓는 사람이 두 손으로 받습니다.',
               '그날 점심이 한 시간 빨리 나왔습니다.'],
        eff: { money: 1, mp: 3, rep: { free: 2 }, add: ['goodrep'] } },
      { t: '응급 가방을 옆에 두고 일한다.', need: { item: 'firstpack' },
        res: ['공사판에서는 하루에 하나쯤 다칩니다. 오늘도 하나 다칩니다.',
               '가방을 열어 그 자리에서 처치합니다. 십 분이면 됩니다.',
               '십 분이 없으면 그 사람은 사흘을 못 나옵니다.'],
        eff: { money: 1, mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    mkt_night: [
      { t: '깡통 커피를 끓여 판다.', need: { item: 'coffeecan' }, cost: { item: 'coffeecan' },
        res: ['밤장에서 뜨거운 것을 팔면 다 팔립니다.',
               '한 통을 물에 풀어 열두 잔을 만듭니다. 아주 연합니다.',
               '연한데도 다 팔립니다. 커피 냄새가 나는 것만으로 값이 됩니다.'],
        eff: { money: 2, mp: 3, rep: { market: 2 }, add: ['humor'] } },
      { t: '등잔 기름을 판다.', need: { item: 'lampoil' }, cost: { item: 'lampoil' },
        res: ['밤장에서 제일 잘 팔리는 것이 불입니다. 밤이니까요.',
               '한 병을 잔으로 나눠 팝니다. 좌판 넷이 사 갑니다.',
               '그날 밤장이 평소보다 한 시간 늦게 끝났습니다.'],
        eff: { money: 2, mp: 2, rep: { market: 2 } } }
    ],

    odd_shrine: [
      { t: '빈 액자를 올려 둔다.', need: { item: 'photoframe' }, cost: { item: 'photoframe' },
        res: ['제단에 액자를 놓습니다. 안이 비어 있습니다.',
               '"누구 겁니까." 묻는 사람에게 대답합니다. "아직 모릅니다."',
               '한 달 뒤에 그 액자에 사진이 들어 있었다고 합니다. 누가 넣었는지는 모릅니다.'],
        eff: { mp: 3, add: ['warmth', 'gloom'], rep: { free: 1 } } }
    ],

    odd_body: [
      { t: '이름을 먹으로 적어 둔다.', need: { item: 'inkstone' },
        res: ['가진 것 중에 이름을 알 만한 게 있는지 봅니다. 대개 없습니다.',
               '없으면 날짜와 자리만 적습니다. 벽에 먹으로 씁니다.',
               '먹은 안 지워집니다. 언젠가 찾는 사람이 오면 읽을 수 있습니다.'],
        eff: { mp: 2, rep: { free: 2 }, add: ['goodrep', 'gloom'] } }
    ],

    med_tooth: [
      { t: '집게를 빌려 준다.', need: { item: 'toothkit' },
        res: ['가진 집게가 진료소 것보다 낫습니다. 날이 안 무뎠습니다.',
               '"이거 어디서 났습니까." 대답 대신 건넵니다.',
               '그날 여섯이 훨씬 덜 아팠습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
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

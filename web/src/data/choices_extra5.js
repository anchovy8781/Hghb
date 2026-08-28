/* 부산 2033 - 기존 사건에 붙이는 선택지 (5)
 *
 * 새로 생긴 물건(라디오 · 광석 · 확성기 · 접붙이는 칼 · 벌통 · 빗물통 ·
 * 옹기 · 석판 · 야간용 렌즈 · 재 비누)이 실제로 쓰이는 자리를 만듭니다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MORE = {

    rest_camp: [
      { t: '라디오를 켜 둔다.', need: { item: 'radioset' },
        res: ['저녁 일곱 시에 맞춰 켭니다. 잡음이 길게 나다가 목소리가 납니다.',
               '불 앞에 앉은 사람들이 하나둘 이쪽으로 옵니다.',
               '방송이 끝나고 나서도 다들 안 갑니다. 그날 밤 불이 늦게까지 탔습니다.'],
        eff: { mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } },
      { t: '재로 만든 비누로 씻는다.', need: { item: 'sootsoap' }, cost: { item: 'sootsoap' },
        res: ['물을 데워 손과 얼굴을 씻습니다. 열흘 만입니다.',
               '이 도시에서 씻는 것은 사치가 아니라 약입니다. 씻으면 상처가 덜 덧납니다.',
               '씻고 나니 몸이 아니라 머리가 가벼워집니다.'],
        eff: { hp: 1, mp: 2, add: ['relief'] } }
    ],

    rest_bath: [
      { t: '재 비누를 나눠 준다.', need: { item: 'sootsoap' }, cost: { item: 'sootsoap' },
        res: ['목욕탕에 비누가 없습니다. 물만 있습니다.',
               '가진 것을 잘라 여럿에게 나눠 줍니다. 한 조각씩입니다.',
               '"이거 어디서 났습니까." 재로 만든다고 하니 다들 만드는 법을 묻습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } }
    ],

    scav_home: [
      { t: '옹기를 하나 챙긴다.',
        res: ['장독대에 항아리가 셋 남아 있습니다. 둘은 깨졌고 하나가 성합니다.',
               '두 손으로 안아야 들립니다. 무겁습니다.',
               '이 안에 든 것은 잘 안 상합니다. 그 이유 하나로 지고 갑니다.'],
        eff: { add: ['clayjar'], wear: { hp: 1 }, mp: 1 } },
      { t: '태엽 축음기를 찾는다.', need: { skill: 'watch' },
        res: ['옛날 집 다락에 상자가 하나 있습니다. 안에 축음기가 들어 있습니다.',
               '태엽을 감으니 돕니다. 전기가 필요 없습니다.',
               '판이 두 장 있는데 한 장은 긁혔고 한 장은 멀쩡합니다.'],
        eff: { add: ['gramophone', 'vinylrec'], mp: 3, skillUp: 'watch' } }
    ],

    scav_store: [
      { t: '조립 라디오 부품을 모은다.', need: { skill: 'elec' },
        res: ['전자제품 진열대는 이십 년 동안 백 번 털렸습니다. 다만 작은 부품은 남습니다.',
               '코일과 다이오드와 이어폰. 이 셋이면 광석 라디오가 됩니다.',
               '전기 없이도 소리가 나는 물건입니다. 아주 작게요.'],
        eff: { add: ['crystal'], mp: 2, skillUp: 'elec' } }
    ],

    scav_school: [
      { t: '석판을 모아 간다.',
        res: ['교실 뒤에 판판한 것이 잔뜩 쌓여 있습니다. 칠판 조각입니다.',
               '깨진 것을 갈아 손바닥만 하게 만들면 석판이 됩니다.',
               '썼다 지웠다 할 수 있으니 종이 백 장 몫입니다.'],
        eff: { add: ['schoolslate'], mp: 2 } },
      { t: '과학실에서 렌즈를 찾는다.', need: { skill: 'tech' },
        res: ['현미경과 망원경이 다 부서져 있는데 렌즈만은 남았습니다.',
               '큰 것 둘을 골라 천에 쌉니다.',
               '이걸 통에 끼우면 밤에 스무 걸음을 봅니다. 그 스무 걸음이 밤을 바꿉니다.'],
        eff: { add: ['nightglass'], mp: 3, skillUp: 'tech' } }
    ],

    meet_farmer: [
      { t: '접붙이는 법을 알려 준다.', need: { item: 'grafttool' },
        res: ['죽어 가는 나무에 산 가지를 붙이면 삽니다. 뿌리와 열매를 따로 고르는 겁니다.',
               '칼로 비스듬히 자르고 딱 맞춰 대고 천으로 묶습니다.',
               '열 번 해서 하나 붙으면 잘한 겁니다. 그 하나가 팔 년 뒤에 열립니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'appleseed'] } },
      { t: '벌통을 하나 놓아 준다.', need: { item: 'beehive2' }, cost: { item: 'beehive2' },
        res: ['벌이 도는 밭과 안 도는 밭은 수확이 다릅니다. 절반쯤 다릅니다.',
               '밭 가장자리 볕 드는 자리에 통을 놓습니다.',
               '"이게 밭에 좋습니까." 좋습니다. 꿀은 덤입니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'honeyjar2'] } }
    ],

    meet_child: [
      { t: '석판에 글자를 써 준다.', need: { item: 'schoolslate' },
        res: ['판에 열 자를 씁니다. 물, 불, 밥, 길, 산, 바다, 사람, 집, 날, 해.',
               '아이가 손가락으로 하나씩 따라 그립니다.',
               '"이거 다 외우면 뭐 됩니까." 벽보를 읽을 수 있게 된다고 대답합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['warmth', 'goodrep'] } },
      { t: '태엽 축음기를 틀어 준다.', need: { item: 'gramophone' },
        res: ['태엽을 감고 바늘을 얹습니다. 지지직 하다가 소리가 납니다.',
               '아이들이 상자 안을 들여다봅니다. 사람이 들어 있는 줄 압니다.',
               '한 면이 끝나면 또 감아 달라고 합니다. 열 번쯤 감았습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['humor', 'warmth', 'goodrep'] } }
    ],

    meet_elder: [
      { t: '방송 얘기를 나눈다.',
        res: ['"저녁 일곱 시 들으십니까." 이십 년째 하루도 안 빠졌답니다.',
               '"제일 기억나는 게 뭡니까." 한참 생각하더니 대답합니다.',
               '"삼 년째 되던 해에 그 사람이 감기 걸렸을 때요. 목소리가 갈라져서 다들 걱정했지예."'],
        eff: { mp: 3, add: ['warmth', 'relief'], rep: { free: 1 } } }
    ],

    meet_medic: [
      { t: '재 비누 만드는 법을 알려 준다.', need: { skill: 'tech' },
        res: ['재를 물에 우려내고 졸이고 기름을 섞습니다. 사흘이면 됩니다.',
               '"이게 약보다 낫습니까." 약보다 앞섭니다. 씻으면 안 덧나니까요.',
               '진료소에서 그날부터 비누를 만들기 시작합니다.'],
        eff: { add: ['sootsoap'], mp: 3, rep: { free: 2 }, skillUp: 'tech', add2: ['goodrep'] } },
      { t: '가슴 두르는 천을 배운다.', need: { skill: 'firstaid' },
        res: ['갈비가 나가면 숨 쉴 때마다 아픕니다. 천으로 조이면 덜 아픕니다.',
               '너무 조이면 숨을 못 쉽니다. 그 사이를 손으로 재는 법을 배웁니다.',
               '"손가락 둘이 들어갈 만큼." 그게 기준입니다.'],
        eff: { add: ['chestwrap'], mp: 2, skillUp: 'firstaid' } }
    ],

    town_market: [
      { t: '꿀을 판다.', need: { item: 'honeyjar2' }, cost: { item: 'honeyjar2' },
        res: ['꿀은 안 상합니다. 그래서 이 도시에서 값이 제일 안 떨어지는 물건입니다.',
               '단지를 좌판에 올리자 값을 부르기도 전에 셋이 붙습니다.',
               '"약에 쓸 겁니까 먹을 겁니까." 둘 다랍니다.'],
        eff: { money: 2, mp: 2, rep: { market: 2 } } },
      { t: '씨앗을 사서 나눠 준다.', need: { item: 'seedpack2' }, cost: { item: 'seedpack2' },
        res: ['좌판에서 산 봉지를 그 자리에서 뜯어 나눕니다.',
               '"이래 나눠도 됩니까." 서른 알을 셋이 열 알씩 가져갑니다.',
               '열 알이면 무 열 개입니다. 셋 다 한 달이 달라집니다.'],
        eff: { mp: 3, rep: { free: 2, market: 1 }, add: ['goodrep'] } }
    ],

    mkt_night: [
      { t: '확성기로 손님을 부른다.', need: { item: 'speakerhorn' },
        res: ['나팔을 입에 대고 소리칩니다. 전기가 없어도 세 배로 갑니다.',
               '"오늘 국수 있습니다. 뜨끈합니다."',
               '이십 분 만에 좌판 앞에 스물이 섭니다. 목이 아프지만 값을 합니다.'],
        eff: { money: 2, mp: 2, rep: { market: 2 }, add: ['humor'] } },
      { t: '야간용 렌즈로 물건을 살핀다.', need: { item: 'nightglass' },
        res: ['밤장은 어두워서 상한 것을 팔기 쉽습니다. 사는 쪽이 불리합니다.',
               '렌즈를 대고 하나씩 봅니다. 셋 중 하나가 상해 있습니다.',
               '상인이 아무 말 없이 그 셋을 치웁니다.'],
        eff: { add: ['{item}'], mp: 2, rep: { market: 1 } } }
    ],

    haz_dogs: [
      { t: '확성기로 소리를 낸다.', need: { item: 'speakerhorn' },
        res: ['개는 큰 소리에 물러납니다. 다만 한 번뿐입니다.',
               '나팔에 대고 낮게 길게 소리를 냅니다. 무리가 뒤로 물러납니다.',
               '그 사이에 골목을 빠져나옵니다.'],
        eff: { mp: 2, add: ['stable'] } }
    ],

    haz_rad_zone: [
      { t: '얼굴 가리개를 쓰고 지난다.', need: { item: 'facecloth' },
        res: ['이 자리에서 위험한 것은 대개 공기 중에 떠 있는 것입니다.',
               '천을 두 겹으로 접어 코와 입을 덮습니다.',
               '숨이 답답한 대신 마시는 것이 반으로 줄어듭니다.'],
        eff: { rad: -1, mp: 2, add: ['stable'] } }
    ],

    odd_music: [
      { t: '축음기를 튼다.', need: { item: 'gramophone' },
        res: ['태엽을 감고 판을 얹습니다. 삼 분짜리 한 면입니다.',
               '전기도 축전지도 안 듭니다. 팔만 있으면 됩니다.',
               '삼 분 동안 아무도 말을 안 합니다. 끝나고 나서 누가 또 틀어 달라고 합니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['warmth', 'relief'] } }
    ],

    odd_radio: [
      { t: '주파수를 맞춰 본다.', need: { skill: 'elec' },
        res: ['다이얼을 아주 천천히 돌립니다. 잡음 사이에 한 자리가 있습니다.',
               '팔십구 점 일입니다. 이 도시에서 유일하게 사람 목소리가 나는 자리입니다.',
               '다른 데는 아무것도 없습니다. 이십 년 동안 그렇습니다.'],
        eff: { add: ['radioset'], mp: 3, skillUp: 'elec', add2: ['warmth'] } },
      { t: '녹음해 둔다.', need: { item: 'tapeblank' },
        res: ['테이프를 걸고 방송을 통째로 녹음합니다. 이십 분입니다.',
               '이걸 안 들리는 동네에 가져가면 그 동네도 듣습니다.',
               '느리지만 안 끊깁니다. 걷는 사람만 있으면요.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep'] } }
    ],

    town_work: [
      { t: '빗물통을 달아 준다.', need: { item: 'rainbarrel' }, cost: { item: 'rainbarrel' },
        res: ['일하는 자리에 물이 없으면 하루가 반나절이 됩니다.',
               '처마에 홈통을 대고 통을 놓습니다. 반 시간 일입니다.',
               '그날 저녁 비에 통이 삼분의 일 찹니다.'],
        eff: { money: 1, mp: 3, rep: { free: 2 }, add: ['goodrep', 'water'] } }
    ],

    town_gate: [
      { t: '오늘 방송 소식을 전해 준다.',
        res: ['초소 사람들은 자리를 못 떠서 방송을 못 듣습니다.',
               '들은 것을 그대로 전해 줍니다. 날씨, 소식, 이름 셋.',
               '"이거 매일 해 주면 안 됩니까." 그 부탁을 여기서도 받습니다.'],
        eff: { mp: 3, rep: { free: 2 }, add: ['goodrep', 'warmth'] } }
    ],

    wint_store: [
      { t: '눈신을 신는다.', need: { item: 'snowshoe' },
        res: ['이 도시에 눈이 오는 날이 한 해에 나흘입니다. 오늘이 그 나흘 중 하루입니다.',
               '눈신을 신으니 안 빠집니다. 안 빠지면 두 배로 갑니다.',
               '"그거 나흘 쓰자고 들고 다닙니까." 그 나흘에 값을 합니다.'],
        eff: { hp: 1, mp: 2, add: ['warmth', 'humor'] } },
      { t: '옹기에 담아 묻는다.', need: { item: 'clayjar' },
        res: ['겨울 식량은 옹기에 담아 땅에 묻으면 봄까지 갑니다.',
               '항아리 목까지 흙을 덮고 위에 짚을 덮습니다.',
               '"이거 어디 묻었는지 잊으면 어떡합니까." 그래서 표시를 합니다.'],
        eff: { add: ['beanpaste', 'kimchi'], mp: 3, rep: { free: 1 } } }
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

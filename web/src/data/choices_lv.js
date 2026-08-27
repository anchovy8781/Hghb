/* 부산 2033 - 능력이 깊어야 열리는 선택지
 *
 * need.lv 가 2 이상인 선택지들. 능력은 쓰면 저절로 늡니다(Lv.0 → 3).
 * 그래서 같은 사건이라도 오래 걸은 사람에게는 다른 길이 하나 더 보입니다.
 * 선택지 앞에 「능력 Lv.2」처럼 붙고, 모자라면 빨강으로 잠깁니다.
 */
(function (global) {
  'use strict';
  const B = global.B;

  const MORE = {

    /* ── 사람 ─────────────────────────────────── */
    meet_trade: [
      { t: '말만으로 값을 절반까지 내린다.', need: { skill: 'talk', lv: 3 },
        res: ['값을 안 부릅니다. 대신 물건을 들어 무게를 재고, 밑면을 보고, 도로 놓습니다.',
               '{npc}이(가) 먼저 값을 내립니다. 이쪽이 아무 말도 안 했는데요.',
               '두 번 더 그러니 절반이 됩니다. 이 도시에서 흥정은 말이 아니라 손으로 하는 겁니다.'],
        eff: { add: ['{item}', '{item}'], money: 1, skillUp: 'talk', add2: ['goodrep'] } }
    ],

    meet_raider: [
      { t: '한마디로 물러서게 한다.', need: { skill: 'grim', lv: 3 },
        res: ['아무 말도 안 하고 한 걸음 앞으로 나섭니다. 넷이 동시에 반 걸음 물러섭니다.',
               '"…아는 얼굴입니까." 하나가 묻습니다. 대답을 안 합니다.',
               '대답 안 하는 것이 제일 무서운 대답일 때가 있습니다. 넷이 골목을 비켜 줍니다.'],
        eff: { mp: 2, rep: { free: 1 }, skillUp: 'grim', add: ['stable', 'goodrep'] } },
      { t: '넷의 주머니를 거꾸로 턴다.', need: { skill: 'pick', lv: 3 },
        res: ['가진 것을 내주는 척하면서 붙습니다. 붙어 있는 동안 손이 따로 움직입니다.',
               '넷이 흩어지고 나서 주머니를 확인해 보니 이쪽 것이 늘어 있습니다.',
               '길에서 이 짓을 할 수 있는 사람이 이 도시에 몇 없습니다.'],
        eff: { money: 2, add: ['{item}', 'humor'], skillUp: 'pick' } }
    ],

    meet_soldier: [
      { t: '군용 문서를 읽어 준다.', need: { skill: 'eng', lv: 2 },
        res: ['초소 안에 이십 년 전 명령서가 붙어 있습니다. 아무도 못 읽고 있었습니다.',
               '소리 내어 읽어 줍니다. 철수 명령입니다. 날짜가 그날 다음 날입니다.',
               '{npc}이(가) 아무 말도 안 합니다. 아주 오래요.'],
        eff: { mp: 2, rep: { army: 2 }, skillUp: 'eng', add: ['note', 'gloom'] } }
    ],

    meet_cult: [
      { t: '교리의 앞뒤를 짚어 무너뜨린다.', need: { skill: 'philo', lv: 3 },
        res: ['반박하지 않습니다. 대신 그쪽 말을 그대로 받아 끝까지 밀고 갑니다.',
               '세 번째 물음에서 {npc}이(가) 말을 멈춥니다. 자기 말에 걸린 겁니다.',
               '둘러선 사람 절반이 그날 안 왔습니다. 좋은 일인지는 모르겠습니다.'],
        eff: { mp: 2, rep: { cult: -2, free: 2 }, skillUp: 'philo', add: ['goodrep', 'gloom'] } }
    ],

    /* ── 뒤지기 ───────────────────────────────── */
    scav_bunker: [
      { t: '자물쇠를 소리 없이 딴다.', need: { skill: 'lock', lv: 3 },
        res: ['핀 다섯 개짜리입니다. 하나씩 올려 잡습니다. 손끝에 걸리는 감각만으로 셉니다.',
               '사십 초 만에 돕니다. 이십 년 묵은 자물쇠치고는 오래 걸린 편입니다.',
               '안쪽이 통째로 남아 있습니다. 자물쇠가 좋으면 안이 좋습니다.'],
        eff: { add: ['{item}', 'ramyeonbox', 'bloodkit'], mp: 2, skillUp: 'lock' } }
    ],

    scav_hospital: [
      { t: '남은 약을 성분으로 가려낸다.', need: { skill: 'medic', lv: 3 },
        res: ['라벨이 삭아 안 보입니다. 대신 알약 모양과 각인으로 봅니다.',
               '이십 년 전에 어머니가 하던 방식입니다. 각인 하나에 이름 하나가 붙어 있습니다.',
               '못 쓰는 것을 다 버리고 나니 셋이 남습니다. 셋 다 아직 듣습니다.'],
        eff: { add: ['antibio', 'antidote', 'painkill'], mp: 2, skillUp: 'medic' } }
    ],

    scav_subway: [
      { t: '어둠 속을 불 없이 걷는다.', need: { skill: 'night', lv: 3 },
        res: ['불을 안 켭니다. 이십 분쯤 서서 눈이 익기를 기다립니다.',
               '익고 나면 보입니다. 회색과 더 진한 회색으로요. 그거면 충분합니다.',
               '선로를 따라 세 정거장을 갑니다. 아무도 이쪽을 못 봤습니다.'],
        eff: { add: ['{item}', 'undermap'], mp: 2, skillUp: 'night', add2: ['stable'] } }
    ],

    scav_factory: [
      { t: '설비를 되살려 한 번 돌린다.', need: { skill: 'eng', lv: 3 },
        res: ['축전지를 갈고, 벨트를 다시 걸고, 접점을 닦습니다. 반나절이 걸립니다.',
               '스위치를 올리자 라인이 돕니다. 이십 년 만에요.',
               '한 바퀴 돌고 멈춥니다. 그 한 바퀴에서 완성품이 넷 나왔습니다.'],
        eff: { add: ['{item}', 'buildmat', 'copperwire'], mp: 3, skillUp: 'eng', add2: ['goodrep'] } }
    ],

    /* ── 위험 ─────────────────────────────────── */
    gun_fight: [
      { t: '한 발로 끝낸다.', need: { gun: true, skill: 'shoot', lv: 3 }, cost: { ammo: true },
        res: ['숨을 반쯤 뱉고 멈춥니다. 딸깍을 백 번 한 손이 흔들리지 않습니다.',
               '한 발입니다. 앞에 선 사람 발밑 십 센티에 박힙니다. 일부러 그쪽입니다.',
               '셋이 동시에 손을 듭니다. 맞힐 줄 아는 사람이라는 걸 그 한 발로 안 겁니다.'],
        eff: { mp: 2, rep: { free: 2 }, skillUp: 'shoot', add: ['stable', 'goodrep'] } }
    ],

    haz_rad_zone: [
      { t: '반감기를 셈해 안전한 시각을 잡는다.', need: { skill: 'nuke', lv: 3 },
        res: ['반감기와 거리 제곱. 종이에 두 줄 적으면 끝나는 계산입니다.',
               '지금 지나면 며칠 치, 새벽에 지나면 반나절 치. 답이 나옵니다.',
               '기다렸다가 새벽에 지납니다. 계기가 거의 안 웁니다.'],
        eff: { mp: 2, skillUp: 'nuke', add: ['stable', 'radmap'] } }
    ],

    haz_dogs: [
      { t: '무리를 통째로 데리고 간다.', need: { skill: 'beast', lv: 3 },
        res: ['서열이 제일 높은 놈 앞에 쪼그려 앉습니다. 눈은 안 맞춥니다.',
               '십 분쯤 그러고 있으니 그놈이 다가와 손등 냄새를 맡습니다.',
               '일어서서 걷자 다섯이 따라옵니다. 골목 끝까지요. 그러고는 흩어집니다.'],
        eff: { mp: 3, skillUp: 'beast', add: ['goodrep', 'warmth'], flag: 'dog_pack' } }
    ],

    haz_storm: [
      { t: '바람 방향으로 폭풍 끝을 읽는다.', need: { skill: 'bird', lv: 2 },
        res: ['갈매기가 어느 쪽으로 몰리는지를 봅니다. 새가 사람보다 먼저 압니다.',
               '십오 분이면 지나갑니다. 지붕 아래 십오 분만 있으면 됩니다.',
               '정확히 십오 분 뒤에 하늘 색이 돌아옵니다.'],
        eff: { mp: 2, skillUp: 'bird', add: ['stable'] } }
    ],

    /* ── 살림과 손 ────────────────────────────── */
    lrn_tech: [
      { t: '죽은 축전지를 되살린다.', need: { skill: 'elec', lv: 3 },
        res: ['부푼 축전지를 조심스럽게 가릅니다. 이걸 잘못하면 손이 없어집니다.',
               '안쪽 판을 갈아 끼우고 다시 봉합니다. 두 시간이 걸립니다.',
               '전압을 재 보니 삽니다. 이 도시에서 축전지를 되살릴 줄 아는 사람이 셋입니다.'],
        eff: { add: ['battery', 'battery', 'portgen'], mp: 2, skillUp: 'elec', add2: ['goodrep'] } }
    ],

    heal_clinic: [
      { t: '수술을 대신 집도한다.', need: { skill: 'medic', lv: 3 }, dc: 2,
        ok: ['{npc}이(가) 자리를 비켜 줍니다. 손이 모자란 게 아니라 이쪽이 더 낫다고 판단한 겁니다.',
              '마취는 소주 한 모금뿐입니다. 사람 셋이 붙잡습니다.',
              '한 시간 반이 걸렸습니다. 끝나고 나서 손이 한참 떨렸습니다.'],
        okEff: { mp: 3, rep: { free: 2, market: 1 }, skillUp: 'medic', add: ['goodrep', 'stable'], title: '손이 좋은 사람' },
        no: ['열고 나서 안이 생각과 다릅니다. {npc}이(가) 밀치고 들어옵니다.',
              '두 시간을 붙어 있었고, 결국 살렸습니다. 이쪽이 살린 건 아닙니다.',
              '"다음에는 먼저 물어보이소." 맞는 말입니다.'],
        noEff: { wear: { mp: 3 }, skillUp: 'medic', add: ['guilt'] } }
    ],

    mkt_fish: [
      { t: '경매를 통째로 읽는다.', need: { skill: 'account', lv: 3 },
        res: ['부르는 값이 아니라 부르는 순서를 봅니다. 순서에 값이 들어 있습니다.',
               '세 번째로 부르는 사람이 늘 오늘 시세를 압니다. 그 사람만 따라갑니다.',
               '반값에 두 대야를 들고 나옵니다. 뒤에서 아무도 혀를 안 찹니다. 알아본 겁니다.'],
        eff: { add: ['{item}', '{item}', 'seasalted'], money: 1, skillUp: 'account', add2: ['goodrep'] } }
    ],

    bar_night: [
      { t: '판을 통째로 웃긴다.', need: { skill: 'humorman', lv: 3 },
        res: ['궤짝 위에 올라섭니다. 아무도 안 시켰습니다.',
               '셋을 나열하고 셋째를 비틉니다. 그게 전부인데 스무 명이 넘어갑니다.',
               '그날 술값은 없었습니다. 대신 다음에 또 오라는 말을 여섯 번 들었습니다.'],
        eff: { hp: 1, mp: 3, rep: { free: 2, market: 1 }, skillUp: 'humorman', add: ['humor', 'warmth', 'goodrep'] } },
      { t: '끝까지 안 취하고 다 듣는다.', need: { skill: 'drink', lv: 3 },
        res: ['한 잔에 한 번씩 바닥에 붓습니다. 아무도 못 봅니다.',
               '여섯 잔째에 옆자리가 무너집니다. 무너진 사람이 하는 말이 제일 정확합니다.',
               '그날 밤에 이 도시 한 달 치 사정을 다 들었습니다.'],
        eff: { mp: 2, money: 1, skillUp: 'drink', add: ['smugmap', 'note', 'humor'] } }
    ],

    news_wall: [
      { t: '한 번에 훑고 다 외운다.', need: { skill: 'speed', lv: 3 },
        res: ['여섯 항목을 덩어리로 봅니다. 한 줄씩 안 읽습니다.',
               '삼십 초 만에 다 들어옵니다. 값 항목까지요.',
               '옆에 선 사람이 아직 첫 항목을 읽고 있습니다.'],
        eff: { add: ['note', 'map'], mp: 2, skillUp: 'speed', add2: ['stable'] } }
    ],

    debt_call: [
      { t: '장부의 구멍을 법으로 짚는다.', need: { skill: 'law', lv: 3 },
        res: ['이 도시의 법전은 세 권입니다. 조합 회칙, 자경단 규약, 단지 관리규정.',
               '셋 다 같은 조항을 하나 두고 있습니다. 죽으면 빚이 지워진다는 조항입니다.',
               '장부에 죽은 사람 이름이 넷 남아 있습니다. 그 넷을 지우게 합니다.'],
        eff: { mp: 3, rep: { free: 2, market: -1 }, skillUp: 'law', add: ['goodrep', 'debtbook'], title: '조항을 아는 사람' } }
    ],

    map_trade: [
      { t: '지도 셋을 겹쳐 진짜를 찾아낸다.', need: { skill: 'read', lv: 3 },
        res: ['셋을 창에 대고 겹쳐 봅니다. 겹치는 선과 안 겹치는 선이 갈립니다.',
               '겹치는 선은 실제 지형이고, 안 겹치는 선은 누가 그려 넣은 겁니다.',
               '누가 왜 그려 넣었는지까지 짐작이 갑니다. 그 자리에 뭔가가 있는 겁니다.'],
        eff: { add: ['undermap', 'treasmap'], mp: 2, skillUp: 'read', add2: ['stable'] } }
    ],

    well_dig: [
      { t: '땅속 물길을 통째로 그려 준다.', need: { skill: 'eco', lv: 3 },
        res: ['이 동네 우물 다섯 곳의 깊이와 수위를 물어 종이에 적습니다.',
               '점 다섯을 이으면 선이 나옵니다. 그 선이 물길입니다.',
               '선 위에 파면 나옵니다. 이틀 만에 물이 났습니다.'],
        eff: { add: ['wellmap'], mp: 3, rep: { free: 2 }, skillUp: 'eco', add2: ['goodrep'], title: '물길을 그린 사람' } }
    ],

    use_pc: [
      { t: '안에 든 것을 통째로 꺼낸다.', need: { skill: 'comp', lv: 3 },
        res: ['부팅이 되는 것과 안에 든 것을 읽는 것은 다른 얘기입니다. 잠겨 있습니다.',
               '이십 년 전 사람들이 쓰던 비밀번호는 대개 넷 중 하나입니다. 두 번째에 열립니다.',
               '문서와 사진이 사만 개 나옵니다. 그중에 이 도시 지도가 한 장 있습니다.'],
        eff: { add: ['map2033', 'usb', 'citymem'], mp: 3, skillUp: 'comp', add2: ['goodrep'] } }
    ],

    stamp_carve: [
      { t: '눈으로만 보고 똑같이 새긴다.', need: { skill: 'hand', lv: 3 },
        res: ['거꾸로 새기는 것을 종이에 먼저 안 그리고 바로 팝니다.',
               '{npc}이(가) 손을 멈추고 봅니다. 그러고는 아무 말도 안 합니다.',
               '찍어 보니 획 하나가 다릅니다. 일부러 다르게 한 겁니다. 그래야 위조가 아닙니다.'],
        eff: { add: ['namestamp', 'inkstone'], mp: 2, skillUp: 'hand', add2: ['goodrep'] } }
    ],

    song_learn: [
      { t: '없어진 가락을 되살린다.', need: { skill: 'music', lv: 3 },
        res: ['제목만 남은 곡이 열두 개 있습니다. 그중 하나를 사람들에게 물어 조각을 모읍니다.',
               '한 사람이 두 마디, 한 사람이 세 마디. 이어 붙이면 반쯤 됩니다.',
               '나머지 반을 지어 채웁니다. 백열두 곡이 백열세 곡이 됩니다.'],
        eff: { mp: 3, rep: { free: 2 }, skillUp: 'music', add: ['songsheet', 'warmth', 'goodrep'], title: '가락을 되살린 사람' } }
    ],

    vote_head: [
      { t: '판을 읽고 미리 셋을 잡는다.', need: { skill: 'politics', lv: 3 },
        res: ['열 명을 한 방향으로 걷게 하려면 첫 세 명을 확실히 잡으면 됩니다.',
               '누가 그 셋인지는 방에 들어온 순서로 압니다. 늦게 온 사람은 이미 정하고 온 사람입니다.',
               '셋에게 먼저 말을 붙입니다. 스무 명이 그 셋을 보고 따라옵니다.'],
        eff: { mp: 2, rep: { free: 2 }, skillUp: 'politics', add: ['goodrep', 'humor'] } }
    ],

    tide_flat: [
      { t: '갯벌 전체를 머릿속에 그린다.', need: { skill: 'sea', lv: 3 },
        res: ['들어가기 전에 등성이와 골을 다 외웁니다. 물이 차면 골부터 잠기니까요.',
               '남들이 못 가는 안쪽까지 들어갔다가 등성이만 밟고 나옵니다.',
               '물이 돌기 오 분 전에 나왔습니다. 캔 것은 남들 두 배입니다.'],
        eff: { add: ['oysterjar', 'oysterjar', 'seasalted'], mp: 2, skillUp: 'sea', add2: ['grit'] } }
    ],

    bee_hive: [
      { t: '벌통을 통째로 옮겨 앉힌다.', need: { skill: 'eco', lv: 3 },
        res: ['여왕이 어디 있는지부터 찾습니다. 여왕만 옮기면 나머지는 따라옵니다.',
               '해가 지고 다 들어온 뒤에 통째로 옮깁니다. 밤에만 되는 일입니다.',
               '사흘 뒤에 새 자리에서 드나들기 시작합니다. 붙은 겁니다.'],
        eff: { add: ['honey', 'honey'], mp: 3, rep: { free: 2 }, skillUp: 'eco', flag: 'has_hive', add2: ['goodrep'] } }
    ],

    lens_grind: [
      { t: '렌즈를 갈아 도수를 만든다.', need: { skill: 'hand', lv: 3 },
        res: ['이 도시에서 새 안경알을 만든 사람은 이십 년 동안 없습니다.',
               '숫돌과 물, 그리고 사흘. 두께를 손톱만큼씩 줄여 가며 갑니다.',
               '나흘째에 됩니다. {npc}이(가) 그걸 눈에 대 보고 한참 말을 못 합니다.'],
        eff: { add: ['glasses', 'lensbox'], mp: 3, rep: { market: 2 }, skillUp: 'hand', add2: ['goodrep'], title: '알을 간 사람' } }
    ],

    blood_give: [
      { t: '이 동네 혈액형을 전부 조사한다.', need: { skill: 'medic', lv: 2 },
        res: ['시약을 아껴 쓰면 마흔 명을 볼 수 있습니다. 한 사람에 십 분입니다.',
               '이틀이 걸렸습니다. 마흔 명 중에 급한 형이 여섯입니다.',
               '명단을 벽에 붙입니다. 이 동네에서 앞으로 피 때문에 죽는 사람이 줄 겁니다.'],
        eff: { add: ['bloodlist'], mp: 3, rep: { free: 2 }, skillUp: 'medic', add2: ['goodrep'], title: '명단을 만든 사람' } }
    ],

    school_open: [
      { t: '가르치는 순서를 통째로 짠다.', need: { skill: 'lead', lv: 3 },
        res: ['지도, 셈, 글자, 노래. 이 순서가 이 도시에 맞는 순서입니다.',
               '한 달 치를 종이에 적어 벽에 붙입니다. 누가 와도 이어서 할 수 있게요.',
               '{npc}이(가) 그걸 보고 손으로 한참 훑습니다. "이제 제가 없어도 되겠습니다."'],
        eff: { mp: 3, rep: { free: 2 }, skillUp: 'lead', add: ['schoolbook', 'goodrep'], title: '순서를 짠 사람' } }
    ],

    scrap_melt: [
      { t: '합금을 맞춰 좋은 쇠를 뽑는다.', need: { skill: 'eng', lv: 2 },
        res: ['구리와 주석 비율을 맞추면 청동이 됩니다. 그냥 쇠보다 훨씬 오래갑니다.',
               '{npc}이(가) 그 비율을 처음 듣습니다. 십 대 일입니다.',
               '식은 것을 두드려 보니 소리가 다릅니다. 맑은 소리가 납니다.'],
        eff: { add: ['buildmat', 'buildmat', 'hinge'], money: 1, skillUp: 'eng', add2: ['goodrep'] } }
    ],

    mkt_night: [
      { t: '좌판 전체의 출처를 짚어 낸다.', need: { skill: 'watch', lv: 3 },
        res: ['스무 좌판을 한 바퀴 돌면서 물건만 봅니다. 사람은 안 봅니다.',
               '여섯 좌판의 물건이 전부 같은 집에서 나왔습니다. 무늬와 흠집이 같은 계열입니다.',
               '그 집이 이번 달에 비었다는 뜻입니다. 아무 말도 안 하고 골목을 나옵니다.'],
        eff: { mp: 2, money: 1, skillUp: 'watch', add: ['note', 'stable'] } }
    ],

    pawn_shop: [
      { t: '값을 진짜로 매겨 본다.', need: { skill: 'taste', lv: 3 },
        res: ['벽에 걸린 삼백 개를 하나씩 봅니다. 두 시간이 걸립니다.',
               '값이 잘못 매겨진 것이 열한 개 있습니다. 아홉은 비싸게, 둘은 싸게요.',
               '싼 둘을 삽니다. 그리고 비싼 아홉을 알려 줍니다. 그러면 다음에도 들여보내 줍니다.'],
        eff: { add: ['jadering', 'musicbox'], money: 1, rep: { market: 2 }, skillUp: 'taste', add2: ['goodrep'] } }
    ],

    coffee_last: [
      { t: '어느 창고인지 알아낸다.', need: { skill: 'liedet', lv: 3 },
        res: ['묻지 않습니다. 대신 다른 얘기를 하면서 방향만 봅니다.',
               '서쪽 얘기가 나올 때마다 손이 멈춥니다. 세 번 다 그렇습니다.',
               '서면 서쪽, 지하, 그리고 문이 잠겨 있는 곳. 그 정도면 찾을 수 있습니다.'],
        eff: { add: ['coffeebean', 'smugmap'], mp: 2, skillUp: 'liedet', add2: ['stable'] } }
    ],

    lrn_street: [
      { t: '아이들 표시를 통째로 읽는다.', need: { skill: 'watch', lv: 2 },
        res: ['담벼락 금들이 그냥 낙서가 아닙니다. 방향, 인심, 위험, 그리고 물.',
               '네 가지가 짧은 금 조합으로 적혀 있습니다. 배우는 데 한 시간이 걸립니다.',
               '읽을 줄 알게 되니 이 도시에 안내판이 갑자기 수천 개 생깁니다.'],
        eff: { add: ['map', 'note'], mp: 3, skillUp: 'watch', add2: ['stable', 'goodrep'] } }
    ],

    fun_gym: [
      { t: '발전기 효율을 두 배로 만든다.', need: { skill: 'tech', lv: 3 },
        res: ['기어비가 틀렸습니다. 페달 한 바퀴에 발전기가 세 바퀴 도는데 여덟 바퀴여야 합니다.',
               '자전거 기어를 뜯어 물립니다. 반나절이 걸립니다.',
               '같은 힘으로 두 배가 나옵니다. {npc}이(가) 그날 저녁 내내 페달만 밟았습니다.'],
        eff: { add: ['battery', 'battery', 'portgen'], mp: 2, rep: { free: 2 }, skillUp: 'tech', add2: ['goodrep'] } }
    ]
  };

  const byId = {};
  B.TEMPLATES.forEach(function (t) { byId[t.id] = t; });

  Object.keys(MORE).forEach(function (id) {
    const t = byId[id];
    if (!t) return;
    /* 깊은 능력이 필요한 길은 위쪽에 둔다. 있으면 먼저 보이는 게 맞다 */
    const head = t.choices.slice(0, 1);
    const tail = t.choices.slice(1);
    t.choices = head.concat(MORE[id], tail);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

/* 부산 2033 - 잡동사니 도감 (1) 물건의 뼈대
 *
 * 이름을 이천 개 손으로 쓰는 대신, "물건 × 상태" 로 만든다.
 * 다만 아무 상태나 붙이지 않는다. 재질이 맞아야 붙는다.
 * "물에 불은 자석" 같은 말이 나오면 그 순간 몰입이 깨지기 때문이다.
 *
 *   tag: paper 종이 · cloth 천 · metal 쇠 · glass 유리플라스틱
 *        elec 전자 · food 먹을것 · wood 나무 · sea 바다것
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  /* 물건의 뼈대. use 가 붙은 것은 조합 재료로 쓰인다. */
  const BASES = [
    /* ── 문구와 종이 ─────────────────────────── */
    { id: 'comic', name: '만화책', tag: 'paper', note: '결말은 늘 다음 권에 있다.' },
    { id: 'novel', name: '소설책', tag: 'paper', note: '표지에 도서관 도장이 찍혔다.' },
    { id: 'textbook', name: '교과서', tag: 'paper', note: '이름 칸이 비어 있다.' },
    { id: 'diary2', name: '일기장', tag: 'paper', note: '중간부터 글씨가 급해진다.' },
    { id: 'album', name: '사진첩', tag: 'paper', note: '빈 자리가 세 칸 있다.' },
    { id: 'calendar', name: '달력', tag: 'paper', note: '8월에서 멈췄다.' },
    { id: 'postcard', name: '엽서', tag: 'paper', note: '보내지 못한 쪽이다.' },
    { id: 'ledger2', name: '가계부', tag: 'paper', note: '마지막 줄은 라면 다섯 개.' },
    { id: 'manual', name: '설명서', tag: 'paper', note: '무엇의 설명서인지 모르겠다.' },
    { id: 'mapbook', name: '지도책', tag: 'paper', note: '없어진 길이 절반이다.' },
    { id: 'poster', name: '영화 포스터', tag: 'paper', note: '개봉일이 그해 여름이다.' },
    { id: 'sticker', name: '스티커 묶음', tag: 'paper', note: '아직 한 장도 안 뗐다.' },
    { id: 'envelope', name: '봉투 뭉치', tag: 'paper', note: '풀칠 자리가 아직 끈적하다.' },
    { id: 'receipt', name: '영수증 다발', tag: 'paper', note: '누군가의 마지막 장보기.' },
    { id: 'homework', name: '숙제 공책', tag: 'paper', note: '빨간 색연필로 동그라미가 많다.' },
    { id: 'newspaper', name: '신문 뭉치', tag: 'paper', note: '1면에 그날 날씨가 맑음이다.' },
    { id: 'card2', name: '명함첩', tag: 'paper', note: '전화번호가 전부 죽었다.' },
    { id: 'lottery', name: '복권', tag: 'paper', note: '긁지 않은 채로 남았다.' },
    { id: 'ticketstub', name: '공연 티켓', tag: 'paper', note: '좌석 번호가 또렷하다.' },
    { id: 'crayon', name: '크레용 상자', tag: 'paper', note: '살구색만 닳았다.' },
    { id: 'pencilcase', name: '필통', tag: 'cloth', note: '지퍼가 반만 열린다.' },
    { id: 'ruler', name: '자', tag: 'glass', note: '30센티까지 눈금이 있다.' },
    { id: 'eraser', name: '지우개', tag: 'glass', note: '가장자리가 새까맣다.' },
    { id: 'notepad', name: '메모지', tag: 'paper', note: '전화번호 하나가 적혀 있다.' },
    { id: 'stampset', name: '우표첩', tag: 'paper', note: '나라 이름이 절반은 낯설다.' },

    /* ── 주방과 먹을 것 언저리 ───────────────── */
    { id: 'thermos', name: '보온병', tag: 'metal', note: '흔들면 아직 안이 따뜻할 것 같다.' },
    { id: 'lunchbox', name: '도시락 통', tag: 'glass', note: '고무 패킹이 삭았다.' },
    { id: 'chopstick', name: '젓가락 한 쌍', tag: 'metal', note: '짝이 맞지 않는다.' },
    { id: 'ladle', name: '국자', tag: 'metal', note: '손잡이가 나무로 덧대어졌다.' },
    { id: 'pot', name: '냄비', tag: 'metal', note: '바닥이 새까맣다.' },
    { id: 'kettle', name: '주전자', tag: 'metal', note: '주둥이가 살짝 찌그러졌다.' },
    { id: 'strainer', name: '체', tag: 'metal', note: '그물눈이 촘촘하다.' },
    { id: 'cutboard', name: '도마', tag: 'wood', note: '칼자국이 세월만큼 있다.' },
    { id: 'saltjar', name: '소금 단지', tag: 'glass', note: '뚜껑이 굳어 안 열린다.' },
    { id: 'teabag', name: '티백 상자', tag: 'food', note: '향은 이미 다 날아갔다.' },
    { id: 'sugar', name: '설탕 봉지', tag: 'food', note: '돌처럼 굳었다.' },
    { id: 'vinegar', name: '식초병', tag: 'glass', note: '이것만은 안 상한다.' },
    { id: 'oilbottle', name: '기름병', tag: 'glass', note: '바닥에 조금 남았다.' },
    { id: 'ricebowl', name: '밥그릇', tag: 'glass', note: '이 빠진 자리가 손에 걸린다.' },
    { id: 'tray', name: '쟁반', tag: 'metal', note: '가장자리가 우그러졌다.' },
    { id: 'jar', name: '유리병', tag: 'glass', note: '무엇이든 담을 수 있다.' },
    { id: 'canopener', name: '깡통따개', tag: 'metal', note: '이것 하나로 저녁이 달라진다.' },
    { id: 'foil', name: '은박지 뭉치', tag: 'metal', note: '구겨졌다 펴진 자국투성이.' },
    { id: 'plasticbag', name: '비닐봉지 뭉치', tag: 'glass', note: '이 시대의 진짜 화폐.' },
    { id: 'ramenpot', name: '양은 냄비', tag: 'metal', note: '뚜껑에 라면 상호가 찍혔다.' },

    /* ── 옷과 천 ─────────────────────────────── */
    { id: 'scarf', name: '목도리', tag: 'cloth', note: '손뜨개다. 코가 몇 군데 빠졌다.' },
    { id: 'glove2', name: '장갑 한 켤레', tag: 'cloth', note: '엄지에 구멍이 났다.' },
    { id: 'sock', name: '양말 뭉치', tag: 'cloth', note: '짝이 다 다르다.' },
    { id: 'jacket', name: '외투', tag: 'cloth', note: '안주머니가 넉넉하다.' },
    { id: 'raincoat', name: '비옷', tag: 'cloth', note: '접힌 자리마다 금이 갔다.' },
    { id: 'hat', name: '모자', tag: 'cloth', note: '챙이 반쯤 꺾였다.' },
    { id: 'belt', name: '허리띠', tag: 'cloth', note: '구멍이 계속 안쪽으로 늘었다.' },
    { id: 'blanket', name: '담요', tag: 'cloth', note: '햇볕에 말리면 아직 냄새가 좋다.' },
    { id: 'curtain', name: '커튼 천', tag: 'cloth', note: '가위질 자국이 있다.' },
    { id: 'apron', name: '앞치마', tag: 'cloth', note: '주머니에 단추가 세 개.' },
    { id: 'schooluni', name: '교복 상의', tag: 'cloth', note: '이름표가 뜯긴 자리가 있다.' },
    { id: 'workwear', name: '작업복', tag: 'cloth', note: '가슴팍에 이름이 수놓였다.' },
    { id: 'towel2', name: '수건', tag: 'cloth', note: '어느 집 잔치 기념품이다.' },
    { id: 'backpack', name: '배낭', tag: 'cloth', note: '끈 하나가 노끈으로 바뀌었다.' },
    { id: 'shoelace', name: '신발끈', tag: 'cloth', note: '질기다. 여러모로 쓸모가 있다.' },
    { id: 'mask2', name: '천 마스크', tag: 'cloth', note: '빨아 쓴 자국이 여러 번.' },
    { id: 'hairband', name: '머리끈', tag: 'cloth', note: '늘어나 헐렁하다.' },
    { id: 'slipper2', name: '실내화', tag: 'cloth', note: '앞코에 이름이 적혔다.' },
    { id: 'pillowcase', name: '베갯잇', tag: 'cloth', note: '누른 자국이 그대로다.' },
    { id: 'flagcloth', name: '천 깃발', tag: 'cloth', note: '무슨 팀이었는지 모르겠다.' },

    /* ── 연장과 쇠붙이 ───────────────────────── */
    { id: 'hammer', name: '망치', tag: 'metal', note: '손잡이가 손에 익었다.' },
    { id: 'screwdriver', name: '드라이버', tag: 'metal', note: '십자와 일자 양쪽이다.' },
    { id: 'plier', name: '펜치', tag: 'metal', note: '물리는 힘이 아직 세다.' },
    { id: 'wrench', name: '스패너', tag: 'metal', note: '크기가 애매하게 안 맞는다.' },
    { id: 'nailbox', name: '못 상자', tag: 'metal', note: '크기별로 섞여 있다.' },
    { id: 'wireroll', name: '철사 뭉치', tag: 'metal', note: '풀면 팔 길이 세 번쯤.' },
    { id: 'chain', name: '쇠사슬', tag: 'metal', note: '자물쇠는 없다.' },
    { id: 'padlock', name: '자물쇠', tag: 'metal', note: '열쇠는 어디에도 없다.' },
    { id: 'hinge', name: '경첩', tag: 'metal', note: '기름칠하면 산다.' },
    { id: 'sawblade', name: '톱날', tag: 'metal', note: '이가 몇 개 나갔다.' },
    { id: 'file2', name: '줄칼', tag: 'metal', note: '쇠를 갉는 소리가 지독하다.' },
    { id: 'bolt', name: '볼트와 너트', tag: 'metal', note: '짝을 찾는 데 한참 걸린다.' },
    { id: 'spring', name: '용수철', tag: 'metal', note: '눌렀다 놓으면 아직 튄다.' },
    { id: 'bearing', name: '베어링', tag: 'metal', note: '돌리면 소리 없이 돈다.' },
    { id: 'pipe2', name: '짧은 파이프', tag: 'metal', note: '들면 묵직하다.' },
    { id: 'clamp', name: '클램프', tag: 'metal', note: '뭔가를 붙잡아 두기에 좋다.' },
    { id: 'blade2', name: '커터 칼날', tag: 'metal', note: '한 칸씩 부러뜨려 쓴다.' },
    { id: 'hook', name: '갈고리', tag: 'metal', note: '이름과 달리 착하게 생겼다.' },
    { id: 'weight', name: '쇳덩이', tag: 'metal', note: '용도는 모르겠고 무겁다.' },
    { id: 'spade', name: '모종삽', tag: 'metal', note: '흙 냄새가 아직 난다.' },

    /* ── 전기와 기계 ─────────────────────────── */
    { id: 'earphone', name: '이어폰', tag: 'elec', note: '한쪽만 나온다.' },
    { id: 'charger', name: '충전기', tag: 'elec', note: '꽂을 데가 없다.' },
    { id: 'usb', name: '유에스비 메모리', tag: 'elec', note: '안에 뭐가 있는지 알 길이 없다.' },
    { id: 'remote', name: '리모컨', tag: 'elec', note: '버튼 몇 개가 닳아 지워졌다.' },
    { id: 'calc', name: '계산기', tag: 'elec', note: '태양광이라 아직 켜진다.' },
    { id: 'watch2', name: '전자시계', tag: 'elec', note: '00:00 에서 깜빡인다.' },
    { id: 'speaker', name: '휴대용 스피커', tag: 'elec', note: '흔들면 안에서 뭔가 굴러다닌다.' },
    { id: 'motor', name: '작은 모터', tag: 'elec', note: '돌리면 손끝이 저릿하다.' },
    { id: 'bulb', name: '전구', tag: 'glass', note: '필라멘트가 아직 멀쩡하다.' },
    { id: 'switch', name: '스위치 뭉치', tag: 'elec', note: '딸깍거리는 맛이 좋다.' },
    { id: 'panelbit', name: '태양광 조각', tag: 'elec', note: '햇빛에 대면 미지근해진다.' },
    { id: 'fanblade', name: '선풍기 날개', tag: 'glass', note: '한 장이 깨졌다.' },
    { id: 'phone2', name: '휴대전화', tag: 'elec', note: '켜지지 않는다. 그래도 다들 챙긴다.' },
    { id: 'camera', name: '필름 카메라', tag: 'elec', note: '뒷면에 필름이 반쯤 감겼다.' },
    { id: 'clockface', name: '벽시계', tag: 'elec', note: '초침만 제자리에서 떤다.' },
    { id: 'antenna', name: '안테나', tag: 'metal', note: '쭉 뽑으면 팔만큼 길어진다.' },
    { id: 'fuse', name: '퓨즈 상자', tag: 'elec', note: '몇 개는 아직 안 끊겼다.' },
    { id: 'cable', name: '케이블 뭉치', tag: 'elec', note: '풀면 방 한 바퀴는 된다.' },
    { id: 'keyboard', name: '자판', tag: 'elec', note: 'ㄱ 자리가 유난히 닳았다.' },
    { id: 'mouse2', name: '마우스', tag: 'elec', note: '선을 자르면 구리선이 나온다.' },

    /* ── 놀이와 취미 ─────────────────────────── */
    { id: 'marble', name: '유리구슬', tag: 'glass', note: '햇빛에 대면 안쪽에 색이 돈다.' },
    { id: 'cards', name: '화투', tag: 'paper', note: '광이 두 장 없다.' },
    { id: 'dice', name: '주사위', tag: 'glass', note: '6이 유난히 잘 나온다.' },
    { id: 'chess', name: '장기말', tag: 'wood', note: '졸이 두 개 모자란다.' },
    { id: 'yoyo', name: '요요', tag: 'glass', note: '줄이 짧게 잘렸다.' },
    { id: 'ball', name: '고무공', tag: 'glass', note: '바람이 반쯤 빠졌다.' },
    { id: 'kite', name: '연', tag: 'paper', note: '살이 하나 부러졌다.' },
    { id: 'harmonica', name: '하모니카', tag: 'metal', note: '불면 두 음이 안 난다.' },
    { id: 'whistle2', name: '호각', tag: 'metal', note: '소리가 생각보다 크다.' },
    { id: 'jumprope', name: '줄넘기', tag: 'cloth', note: '손잡이가 하나 없다.' },
    { id: 'robot', name: '로봇 장난감', tag: 'glass', note: '팔 한쪽이 없다.' },
    { id: 'doll2', name: '인형', tag: 'cloth', note: '눈 한쪽이 단추다.' },
    { id: 'puzzle', name: '퍼즐 조각', tag: 'paper', note: '완성해도 한 조각이 빈다.' },
    { id: 'badminton', name: '배드민턴 채', tag: 'metal', note: '줄이 늘어졌다.' },
    { id: 'gameboy', name: '게임기', tag: 'elec', note: '건전지만 있으면.' },
    { id: 'fishrod', name: '낚싯대', tag: 'wood', note: '끝마디가 없다.' },
    { id: 'binocular', name: '쌍안경', tag: 'glass', note: '한쪽 렌즈에 금이 갔다.' },
    { id: 'skate', name: '롤러스케이트', tag: 'glass', note: '바퀴 하나가 안 돈다.' },
    { id: 'guitarpick', name: '기타 피크', tag: 'glass', note: '가장자리가 닳아 둥글다.' },
    { id: 'ludo', name: '보드게임 말', tag: 'wood', note: '색깔이 네 가지다.' },

    /* ── 몸과 살림 ───────────────────────────── */
    { id: 'toothbrush', name: '칫솔', tag: 'glass', note: '솔이 다 벌어졌다.' },
    { id: 'soap', name: '비누', tag: 'food', note: '금이 갔지만 거품은 난다.' },
    { id: 'razor', name: '면도기', tag: 'metal', note: '날이 무디다.' },
    { id: 'comb2', name: '빗', tag: 'glass', note: '이가 세 개 빠졌다.' },
    { id: 'nailclip', name: '손톱깎이', tag: 'metal', note: '이걸로 잘라 본 지 오래다.' },
    { id: 'mirror2', name: '손거울', tag: 'glass', note: '보고 나면 대개 후회한다.' },
    { id: 'lotion', name: '로션', tag: 'glass', note: '분리됐지만 흔들면 섞인다.' },
    { id: 'tissue', name: '휴지 뭉치', tag: 'paper', note: '눅눅하다.' },
    { id: 'cotton', name: '솜뭉치', tag: 'cloth', note: '피 멎게 하는 데 쓸 만하다.' },
    { id: 'thermometer', name: '체온계', tag: 'glass', note: '수은이 아직 온전하다.' },
    { id: 'pillbox', name: '약통', tag: 'glass', note: '이름 모를 알약이 굴러다닌다.' },
    { id: 'bandaid', name: '반창고', tag: 'paper', note: '테두리가 누렇다.' },
    { id: 'toothpaste', name: '치약', tag: 'glass', note: '끝까지 눌러 짠 자국.' },
    { id: 'perfume', name: '향수병', tag: 'glass', note: '뚜껑을 열면 옛날이 난다.' },
    { id: 'candle2', name: '양초', tag: 'food', note: '심지가 짧다.' },
    { id: 'insect', name: '모기향', tag: 'paper', note: '반 바퀴 남았다.' },
    { id: 'shoehorn', name: '구둣주걱', tag: 'glass', note: '왜 챙겼는지 모르겠다.' },
    { id: 'umbrella', name: '우산', tag: 'cloth', note: '살 두 개가 꺾였다.' },
    { id: 'flashlight2', name: '손전등', tag: 'elec', note: '흔들면 잠깐 들어온다.' },
    { id: 'sewkit', name: '반짇고리', tag: 'cloth', note: '실 색이 다섯 가지.' },

    /* ── 바다와 부산 ─────────────────────────── */
    { id: 'shell', name: '조개껍데기', tag: 'sea', note: '귀에 대면 아직 소리가 난다.' },
    { id: 'net2', name: '그물 조각', tag: 'sea', note: '매듭 짓는 법을 안다면 값이 있다.' },
    { id: 'buoy', name: '작은 부표', tag: 'sea', note: '주황색이 아직 선명하다.' },
    { id: 'anchorbit', name: '닻고리', tag: 'metal', note: '쇠가 두껍다.' },
    { id: 'seaglass', name: '바다유리', tag: 'glass', note: '모서리가 다 닳았다.' },
    { id: 'fishhook', name: '낚싯바늘 통', tag: 'metal', note: '크기별로 꽂혀 있다.' },
    { id: 'ropebit', name: '밧줄 토막', tag: 'sea', note: '소금기에 뻣뻣하다.' },
    { id: 'oarbit', name: '부러진 노', tag: 'wood', note: '손잡이 쪽만 남았다.' },
    { id: 'lifevest', name: '구명조끼', tag: 'cloth', note: '끈이 하나 없다.' },
    { id: 'seasalt', name: '굵은소금 봉지', tag: 'food', note: '이 도시에서 값이 오른 것.' },
    { id: 'driedfish', name: '마른 생선 꾸러미', tag: 'food', note: '냄새로 위치가 들킨다.' },
    { id: 'busanmug', name: '부산 기념 머그컵', tag: 'glass', note: '갈매기 그림이 있다.' },
    { id: 'towerkey', name: '부산타워 열쇠고리', tag: 'metal', note: '탑은 아직 서 있다고 들었다.' },
    { id: 'subwaycard', name: '교통카드', tag: 'glass', note: '잔액은 영영 모른다.' },
    { id: 'ferryticket', name: '유람선 표', tag: 'paper', note: '날짜가 그해 여름이다.' },

    /* ── 이상한 것들 ─────────────────────────── */
    { id: 'trophy2', name: '트로피', tag: 'metal', note: '누군가의 3등.' },
    { id: 'medal', name: '메달', tag: 'metal', note: '목걸이 끈이 삭았다.' },
    { id: 'namestamp', name: '이름 도장', tag: 'wood', note: '남의 성씨가 새겨져 있다.' },
    { id: 'idcard', name: '사원증', tag: 'glass', note: '사진 속 얼굴이 웃지 않는다.' },
    { id: 'keybunch', name: '열쇠 꾸러미', tag: 'metal', note: '맞는 문이 어딘가에는 있다.' },
    { id: 'glassesbit', name: '안경', tag: 'glass', note: '도수가 전혀 안 맞는다.' },
    { id: 'wallet2', name: '지갑', tag: 'cloth', note: '현금은 이제 종이다.' },
    { id: 'compass2', name: '방향 나침반', tag: 'metal', note: '자침이 가끔 헷갈려 한다.' },
    { id: 'magnet2', name: '자석', tag: 'metal', note: '쇠붙이를 찾을 때 쓸모가 있다.' },
    { id: 'lens', name: '돋보기', tag: 'glass', note: '햇빛을 모으면 불이 붙는다.' },
    { id: 'battery2', name: '건전지 묶음', tag: 'elec', note: '몇 개는 살아 있을지도.' },
    { id: 'lighter2', name: '라이터', tag: 'metal', note: '흔들면 기름 소리가 난다.' },
    { id: 'tapebit', name: '청테이프', tag: 'cloth', note: '이 세상 절반은 이걸로 붙어 있다.' },
    { id: 'gluetube', name: '순간접착제', tag: 'glass', note: '뚜껑이 굳었다.' },
    { id: 'chalk', name: '분필 토막', tag: 'glass', note: '벽에 뭔가 남기기 좋다.' },
    { id: 'rosary', name: '묵주', tag: 'wood', note: '알이 손때로 반질하다.' },
    { id: 'incense', name: '향 다발', tag: 'wood', note: '피우면 냄새가 멀리 간다.' },
    { id: 'talisman', name: '부적 조각', tag: 'paper', note: '붉은 글씨가 반쯤 지워졌다.' },
    { id: 'toysoldier', name: '병정 인형', tag: 'glass', note: '총구가 부러졌다.' },
    { id: 'snowball', name: '스노볼', tag: 'glass', note: '흔들면 아직 눈이 내린다.' }
  ];

  /* 상태. need 가 있으면 그 재질에만 붙는다. */
  const MODS = [
    { id: 'old', name: '낡은', all: true },
    { id: 'dusty', name: '먼지 앉은', all: true },
    { id: 'named', name: '이름이 적힌', all: true },
    { id: 'broken', name: '반쯤 부서진', all: true },
    { id: 'fixed', name: '누가 고쳐 쓴', all: true },
    { id: 'newish', name: '새것 같은', all: true },
    { id: 'burnt', name: '검게 그을린', all: true },
    { id: 'taped', name: '테이프로 감은', all: true },
    { id: 'childs', name: '아이 것이었던', all: true },
    { id: 'hidden', name: '숨겨져 있던', all: true },
    { id: 'gifted', name: '누가 선물한 듯한', all: true },
    { id: 'marked', name: '표시를 해 둔', all: true },
    { id: 'soaked', name: '물에 불은', need: ['paper', 'cloth'] },
    { id: 'rusty', name: '녹슨', need: ['metal'] },
    { id: 'cracked', name: '금이 간', need: ['glass'] },
    { id: 'mouldy', name: '곰팡이 핀', need: ['cloth', 'paper', 'food', 'wood'] },
    { id: 'wired', name: '전선이 삐져나온', need: ['elec'] },
    { id: 'salted', name: '소금기에 절은', need: ['metal', 'cloth', 'sea'] },
    { id: 'faded', name: '색이 바랜', need: ['cloth', 'paper', 'glass'] },
    { id: 'bent', name: '휘어진', need: ['metal', 'wood'] }
  ];

  /* 상태가 값과 쓸모를 조금 바꾼다 */
  const MOD_EFFECT = {
    newish: { val: 1 },
    hidden: { val: 1 },
    gifted: { mp: 1 },
    childs: { mp: 1 },
    broken: { val: 0 },
    burnt: { val: 0 },
    mouldy: { val: 0 }
  };

  /* 도감을 만든다. B.ITEMS 뒤에 붙이고 분류표도 갱신한다. */
  B.buildJunkCatalog = function () {
    const made = [];
    BASES.forEach(function (base) {
      MODS.forEach(function (mod) {
        if (!mod.all && (!mod.need || mod.need.indexOf(base.tag) < 0)) return;
        const eff = MOD_EFFECT[mod.id] || {};
        const item = {
          id: 'j_' + base.id + '_' + mod.id,
          name: mod.name + ' ' + base.name,
          kind: 'junk',
          tag: base.tag,
          base: base.id,
          mod: mod.id,
          val: eff.val === undefined ? (base.val || 0) : eff.val,
          note: base.note
        };
        if (eff.mp) item.mp = eff.mp;
        made.push(item);
      });
    });

    made.forEach(function (it) {
      B.ITEMS.push(it);
      B.ITEM_MAP[it.id] = it;
      (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
    });

    B.JUNK_BASES = BASES;
    B.JUNK_MODS = MODS;
    B.JUNK_GENERATED = made;
    return made.length;
  };

  B.JUNK_BASE_LIST = BASES;
})(typeof window !== 'undefined' ? window : globalThis);

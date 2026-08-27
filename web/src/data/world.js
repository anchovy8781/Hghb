/* 부산 2033 - 세계 데이터: 구역, 장소, 시간, 날씨, 위협 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  /** 큰 구역. phase 는 이야기 단계(1 생존기 / 2 세력기 / 3 원정기)에 등장하기 시작하는 시점. */
  const ZONES = [
    { id: 'seomyeon',  name: '서면',       phase: 1, rad: 3, danger: 2, note: '지하상가가 통째로 살아남은 곳. 사람이 모이면 규칙도 생긴다.' },
    { id: 'beomcheon', name: '범천동',     phase: 1, rad: 3, danger: 2, note: '경사진 골목마다 물통을 인 사람들이 오르내린다.' },
    { id: 'busanjin',  name: '부산진역',   phase: 1, rad: 4, danger: 3, note: '철로 위에 멈춘 화차들이 그대로 창고가 되었다.' },
    { id: 'choryang',  name: '초량',       phase: 1, rad: 4, danger: 3, note: '산복도로 아래로 잿빛 항구가 내려다보인다.' },
    { id: 'dongnae',   name: '동래',       phase: 1, rad: 2, danger: 2, note: '온천물이 아직 나온다는 소문이 사람을 끌어들인다.' },
    { id: 'yeonje',    name: '연산동',     phase: 1, rad: 3, danger: 3, note: '교차로마다 바리케이드. 누구의 것인지는 매달 바뀐다.' },
    { id: 'sasang',    name: '사상 공단',  phase: 1, rad: 5, danger: 4, note: '기계 기름 냄새와 쇳가루. 부품을 구하려면 여기다.' },
    { id: 'gupo',      name: '구포',       phase: 2, rad: 4, danger: 3, note: '낙동강을 건너는 다리 중 두 개만 남았다.' },
    { id: 'hadan',     name: '하단',       phase: 2, rad: 5, danger: 3, note: '갈대밭이 사람 키를 넘게 자랐다.' },
    { id: 'yeongdo',   name: '영도',       phase: 2, rad: 4, danger: 4, note: '다리를 끊어 놓고 사는 섬. 배 없이는 못 들어간다.' },
    { id: 'jagalchi',  name: '자갈치',     phase: 2, rad: 6, danger: 4, note: '시장 좌판에 이제 생선 대신 다른 것이 오른다.' },
    { id: 'nampo',     name: '남포동',     phase: 2, rad: 6, danger: 4, note: '극장 간판이 반쯤 녹아내린 채 매달려 있다.' },
    { id: 'gamcheon',  name: '감천',       phase: 2, rad: 3, danger: 3, note: '색색의 집들이 잿빛 한 겹을 뒤집어썼다.' },
    { id: 'gwangan',   name: '광안리',     phase: 2, rad: 7, danger: 5, note: '다리 상판이 바다로 꺾여 들어가 있다.' },
    { id: 'centum',    name: '센텀',       phase: 3, rad: 8, danger: 5, note: '유리 건물의 뼈대만 남아 바람이 지나갈 때마다 운다.' },
    { id: 'haeundae',  name: '해운대',     phase: 3, rad: 9, danger: 6, note: '폭심에서 가장 가까웠던 해변. 모래가 유리로 굳었다.' },
    { id: 'gijang',    name: '기장',       phase: 3, rad: 7, danger: 5, note: '원전 방향. 계기가 미친 듯이 운다.' },
    { id: 'dadaepo',   name: '다대포',     phase: 3, rad: 5, danger: 4, note: '갯벌 위로 바닷물이 붉게 밀려온다.' },
    { id: 'oncheon',   name: '온천장',     phase: 2, rad: 3, danger: 2, note: '김이 오르는 웅덩이 주변에 천막촌이 섰다.' },
    { id: 'geumjeong', name: '금정산',     phase: 3, rad: 2, danger: 4, note: '숲이 살아 있다. 살아 있는 것은 그만큼 굶주려 있다.' }
  ];

  /** 세부 장소. 카테고리별로 뽑아 쓴다. */
  const PLACES = {
    urban: [
      '무너진 편의점', '셔터가 반쯤 내려온 약국', '유리가 다 깨진 문구점', '불탄 프랜차이즈 치킨집',
      '간판만 남은 노래방', '뒤집힌 시내버스', '주차타워 3층', '옥상 물탱크실',
      '문 닫힌 은행 지점', '부서진 파출소', '천장이 내려앉은 목욕탕', '전당포 뒷방',
      '헌책방 이층', '녹슨 자전거포', '커튼이 삭은 미용실', '금은방 잔해'
    ],
    indoor: [
      '아파트 12층 복도', '초등학교 급식실', '교회 지하 성가대실', '병원 별관 계단참',
      '요양원 세탁실', '고시원 402호', '상가 건물 보일러실', '치과 의료폐기물 창고',
      '노인정 부엌', '동사무소 민원실', '학원 자습실', '반지하 셋방'
    ],
    under: [
      '지하상가 다구역', '지하철 승강장', '환기구 통로', '지하 주차장 3층',
      '하수 맨홀 아래', '방공호 입구', '지하 정수 설비', '터널 대피소'
    ],
    water: [
      '방파제 끝', '좌초된 어선 갑판', '수산시장 냉동창고', '부잔교 아래',
      '컨테이너 야적장', '해안 초소', '갯벌 수로', '녹슨 등대'
    ],
    wild: [
      '갈대밭 한복판', '산복도로 굽이', '무너진 축대 아래', '묘지 언덕',
      '송전탑 밑', '밭이었던 자리', '개울 건너 대나무숲', '터널 입구 비탈'
    ]
  };

  const TIMES = [
    { id: 'dawn',  name: '새벽',   line: '해가 뜨기 전, 공기가 가장 차갑고 가장 정직한 시간입니다.' },
    { id: 'morn',  name: '아침',   line: '잿빛 하늘 너머로 해가 희미하게 번집니다.' },
    { id: 'noon',  name: '한낮',   line: '그림자가 가장 짧은 시간, 숨을 곳도 가장 적습니다.' },
    { id: 'eve',   name: '해질녘', line: '붉은 빛이 폐허의 모서리마다 길게 걸립니다.' },
    { id: 'night', name: '밤',     line: '불빛 하나 없는 도시는 생각보다 훨씬 조용합니다.' }
  ];

  const WEATHER = [
    { id: 'ash',   name: '재비',       rad: 2, line: '잿가루가 눈처럼 내려앉아 어깨가 금방 하얘집니다.' },
    { id: 'rain',  name: '검은비',     rad: 3, line: '기름처럼 미끄러운 비가 목덜미를 타고 흘러내립니다.' },
    { id: 'fog',   name: '방사 안개',  rad: 3, line: '안개가 손끝을 지우고, 계기는 안개 속에서 더 크게 웁니다.' },
    { id: 'clear', name: '맑음',       rad: 0, line: '드물게 하늘이 열려, 잊고 있던 파란색이 잠깐 보입니다.' },
    { id: 'wind',  name: '돌풍',       rad: 1, line: '바람이 골목을 훑으며 함석지붕을 두들깁니다.' },
    { id: 'cold',  name: '한파',       rad: 0, line: '숨을 쉴 때마다 폐 안쪽이 얼어붙는 것 같습니다.' },
    { id: 'humid', name: '무더위',     rad: 1, line: '썩는 냄새가 열기에 부풀어 골목을 가득 채웁니다.' }
  ];

  const THREATS = [
    { name: '들개 무리',        pow: 2, kind: '짐승' },
    { name: '기름투성이 약탈단', pow: 4, kind: '사람' },
    { name: '갈고리 패거리',     pow: 4, kind: '사람' },
    { name: '해골 표식의 광신도', pow: 3, kind: '사람' },
    { name: '군복을 입은 잔당',  pow: 5, kind: '사람' },
    { name: '눈이 흰 부랑자',    pow: 2, kind: '사람' },
    { name: '덩치 큰 돌연변이 갈매기 떼', pow: 3, kind: '짐승' },
    { name: '털 빠진 멧돼지',    pow: 3, kind: '짐승' },
    { name: '수로에서 나온 쥐 떼', pow: 2, kind: '짐승' },
    { name: '방독면을 쓴 수금원', pow: 4, kind: '사람' },
    { name: '아이들만 있는 무리', pow: 1, kind: '사람' },
    { name: '이빨을 간 굶주린 남자', pow: 3, kind: '사람' },
    { name: '낙진 폭풍',        pow: 4, kind: '재해' },
    { name: '무너지는 건물',    pow: 3, kind: '재해' },
    { name: '지반 침하',        pow: 3, kind: '재해' },
    { name: '오염된 물웅덩이',  pow: 2, kind: '재해' }
  ];

  /** 세력. 평판이 이야기의 방향을 바꾼다. */
  const FACTIONS = [
    { id: 'market',  name: '서면 지하상가 조합', note: '규칙과 저울을 믿는 사람들.' },
    { id: 'dock',    name: '영도 뱃사람 연합',   note: '바다를 가진 자가 도시를 가진다고 믿는다.' },
    { id: 'army',    name: '53사단 잔존 병력',   note: '아직도 명령서를 기다린다.' },
    { id: 'cult',    name: '빛을 본 자들',       note: '섬광 속에서 무언가를 보았다고 말한다.' },
    { id: 'free',    name: '산복도로 자경단',    note: '누구 편도 아니고, 그래서 늘 쫓긴다.' }
  ];

  B.WORLD = { ZONES, PLACES, TIMES, WEATHER, THREATS, FACTIONS };
})(typeof window !== 'undefined' ? window : globalThis);

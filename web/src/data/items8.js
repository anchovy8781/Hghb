/* 부산 2033 - 아이템 (8) 장편에서만 나오는 것들과, 그 언저리 */
(function (global) {
  'use strict';
  const B = global.B;

  const ADD = [
    /* ── 해운대 랜드마크 타워 ────────────────── */
    { id: 'towerlog', name: '옥상에서 쓴 스무 장', kind: 'doc', val: 3, key: true,
      note: '칠천 장 중에 제일 잘 쓴 날들이라고 했다.' },
    { id: 'towerkey', name: '타워 마스터키', kind: 'key', val: 3, key: true,
      note: '관리소장 것이다. 백한 층 어느 문이든 열린다.' },
    { id: 'towerbadge', name: '101층 표', kind: 'key', val: 2, key: true,
      note: '올라간 사람 다섯 중 하나라는 표시.' },
    { id: 'liftcell', name: '엘리베이터 축전지', kind: 'part', val: 3,
      note: '남은 횟수가 손으로 적혀 있다.' },

    /* ── 일광광산 ────────────────────────────── */
    { id: 'minecore', name: '산에서 나온 유리', kind: 'key', val: 2, key: true,
      note: '삼백 미터 안까지 열이 들어왔다. 만지면 차갑다.' },
    { id: 'minelamp', name: '광부용 램프', kind: 'part', val: 3,
      note: '기름을 아주 조금 먹는다. 갱도에서는 이것뿐이다.' },
    { id: 'minemap', name: '갱도 배치도', kind: 'doc', val: 3, key: true,
      note: '세 갈래 중 어느 쪽이 무너졌는지가 적혀 있다.' },
    { id: 'pickaxe', name: '곡괭이', kind: 'part', val: 2,
      note: '한 시간에 손바닥만큼 판다. 그걸 이 년 했다.' },

    /* ── 낙동강의 기억 ───────────────────────── */
    { id: 'riverlog', name: '하구 수질 기록', kind: 'doc', val: 3, key: true,
      note: '2015년까지 적혀 있다. 그다음 장은 비어 있다.' },
    { id: 'rivermark', name: '옮겨 그린 열두 글자', kind: 'doc', val: 3, key: true,
      note: '우리 글씨가 아니다. 읽는 사람이 이 도시에 있을 것이다.' },
    { id: 'riverrod', name: '이름 새긴 낚싯대', kind: 'key', val: 2, key: true,
      note: '다리 난간에 걸려 있던 스물셋 중 하나.' },
    { id: 'silttest', name: '침전 시험관', kind: 'part', val: 2,
      note: '흙탕물을 하루 세워 두면 답이 나온다.' },

    /* ── 뉴클리어 ────────────────────────────── */
    { id: 'nukephoto', name: '그날 새벽 부두 사진', kind: 'doc', val: 3, key: true,
      note: '트럭 옆면에 표시가 셋이다. 셋 다 다른 나라 것이다.' },
    { id: 'portlog', name: '항만 입출항 기록', kind: 'doc', val: 3, key: true,
      note: '사흘 동안 마흔 척이 들어오고 한 척도 안 나갔다.' },
    { id: 'concreteslip', name: '콘크리트에 찍힌 날짜', kind: 'key', val: 2, key: true,
      note: '2015년 8월 5일. 하루 전이다.' },
    { id: 'threeminute', name: '삼 분이라고만 적힌 쪽지', kind: 'key', val: 1, key: true,
      note: '첫 번째와 두 번째 사이. 그 삼 분에 누가 결정을 했다.' },

    /* ── 코마 사연 ───────────────────────────── */
    { id: 'wardnote', name: '18호 침대 종이', kind: 'key', val: 2, key: true,
      note: '"아직 숨 쉼. 물 주는 사람 있음." 아래로 금이 빼곡하다.' },
    { id: 'wardpass', name: '병원 출입증', kind: 'key', val: 2, key: true,
      note: '사진이 붙어 있다. 아무리 봐도 모르는 얼굴이다.' },
    { id: 'comaband', name: '손목에 남은 밴드', kind: 'key', val: 1, key: true,
      note: '십팔 년 동안 안 풀렸다. 번호가 아직 읽힌다.' },

    /* ── 그 밖 ───────────────────────────────── */
    { id: 'cookiejar', name: '쿠키 통', kind: 'lux', val: 2, mp: 1,
      note: '안이 비었다. 그래도 뚜껑을 열면 냄새가 조금 난다.' },
    { id: 'ropeharness', name: '안전벨트', kind: 'part', val: 2,
      note: '높은 데서 일하던 사람 것. 아직 버클이 물린다.' },
    { id: 'headlamp', name: '머리에 쓰는 등', kind: 'part', val: 3,
      note: '손이 자유로워진다. 그 차이가 갱도에서는 크다.' },
    { id: 'dosimeter', name: '개인 선량계', kind: 'part', val: 3,
      note: '누적을 잰다. 오늘이 아니라 평생을 잰다.' },
    { id: 'lunchbox', name: '누군가의 도시락통', kind: 'junk', val: 0, key: true,
      note: '안에 아무것도 없다. 그래도 안 버려진다.' },
    { id: 'stairchalk', name: '계단참 분필 금', kind: 'junk', val: 0, key: true,
      note: '스무 개. 여기서 스무 밤을 잤다는 뜻이다.' }
  ];

  ADD.forEach(function (it) {
    if (B.ITEM_MAP[it.id]) return;
    B.ITEMS.push(it);
    B.ITEM_MAP[it.id] = it;
    (B.ITEMS_BY_KIND[it.kind] = B.ITEMS_BY_KIND[it.kind] || []).push(it.id);
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);

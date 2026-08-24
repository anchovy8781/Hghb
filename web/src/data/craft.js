/* 부산 2033 - 만들기
 *
 * 잡동사니는 그 자체로는 대개 쓸모가 없다. 붙이면 달라진다.
 * 재료는 "재질"이나 "물건 종류"로 지정한다. 그래서 이천 가지 잡동사니가
 * 전부 재료로 쓰인다. 낡은 수건이든 곰팡이 핀 커튼이든 천은 천이다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  B.RECIPES = [

    /* ── 재질만 맞으면 되는 것들 ─────────────── */
    { id: 'r_kindle', name: '불쏘시개', make: 'lighter', n: 1,
      need: [{ tag: 'paper', n: 3 }],
      line: '종이를 잘게 찢어 새 둥지처럼 뭉칩니다. 불씨 하나면 이걸로 저녁이 따뜻해집니다.' },

    { id: 'r_rag', name: '깨끗한 천 조각', make: 'bandage', n: 1,
      need: [{ tag: 'cloth', n: 1 }, { item: 'boiled', n: 1 }],
      line: '끓인 물에 천을 삶아 널어 말립니다. 이 도시에서 삶는다는 건 사치에 가깝습니다.' },

    { id: 'r_scrapblade', name: '깡통 칼', make: 'knife', n: 1,
      need: [{ tag: 'metal', n: 2 }, { tag: 'cloth', n: 1 }],
      line: '깡통 뚜껑을 접어 겹치고 손잡이를 천으로 감습니다. 한 번 쓰고 버릴 각오로 만듭니다.' },

    { id: 'r_bottle', name: '물통', make: 'boiled', n: 1,
      need: [{ tag: 'glass', n: 2 }],
      line: '깨지지 않은 통 두 개를 골라 하나는 뚜껑으로 씁니다. 물을 담을 수 있는 것이 곧 재산입니다.' },

    { id: 'r_scrapgear', name: '부품 꾸러미', make: 'battery', n: 1,
      need: [{ tag: 'elec', n: 3 }],
      line: '전자제품 셋을 뜯어 살아 있는 부분만 골라 냅니다. 건전지 하나 분량은 나옵니다.' },

    { id: 'r_woodfuel', name: '장작 묶음', make: 'lighter', n: 1,
      need: [{ tag: 'wood', n: 2 }, { tag: 'cloth', n: 1 }],
      line: '나무를 쪼개 천으로 묶습니다. 젖지만 않으면 하룻밤은 갑니다.' },

    { id: 'r_seafood', name: '말린 바다것', make: 'dried', n: 1,
      need: [{ tag: 'sea', n: 1 }, { tag: 'food', n: 1 }],
      line: '소금을 뿌려 널어 둡니다. 사흘이면 됩니다. 사흘을 기다릴 수 있다면요.' },

    { id: 'r_barter', name: '잡동사니 꾸러미', make: 'watch', n: 1,
      need: [{ tag: 'glass', n: 1 }, { tag: 'metal', n: 1 }, { tag: 'paper', n: 1 }],
      line: '잡다한 것을 보기 좋게 묶습니다. 값은 물건이 아니라 포장이 정할 때도 있습니다.' },

    { id: 'r_bandage', name: '붕대', make: 'bandage', n: 2,
      need: [{ tag: 'cloth', n: 2 }],
      line: '천을 길게 찢어 끝을 사선으로 자릅니다. 감을 때 풀리지 않게 하는 요령입니다.' },

    { id: 'r_cotton', name: '지혈솜', make: 'bandage', n: 1,
      need: [{ base: 'cotton', n: 1 }, { tag: 'paper', n: 1 }],
      line: '솜을 종이에 싸서 눌러 씁니다. 급할 때는 이것으로도 피가 멎습니다.' },

    { id: 'r_filter', name: '정수 필터', make: 'filter', n: 1,
      need: [{ base: 'cotton', n: 1 }, { tag: 'cloth', n: 1 }, { base: 'jar', n: 1 }],
      line: '유리병 아래를 잘라 거꾸로 세우고 천과 솜을 층층이 채웁니다.\n물이 한 방울씩 떨어지기 시작합니다. 느리지만 맑습니다.' },

    { id: 'r_boiled', name: '끓인 물', make: 'boiled', n: 2,
      need: [{ base: 'pot', n: 1 }, { item: 'lighter', n: 1 }],
      line: '냄비에 물을 받아 오래 끓입니다. 기다리는 시간이 아깝지 않습니다.' },

    { id: 'r_torch', name: '횃불', make: 'lighter', n: 1,
      need: [{ tag: 'wood', n: 1 }, { tag: 'cloth', n: 1 }, { base: 'oilbottle', n: 1 }],
      line: '막대 끝에 기름 먹인 천을 감아 묶습니다. 손잡이 쪽은 젖은 천으로 한 번 더.' },

    { id: 'r_lamp', name: '흔들이 손전등', make: 'battery', n: 1,
      need: [{ base: 'flashlight2', n: 1 }, { base: 'motor', n: 1 }, { base: 'magnet2', n: 1 }],
      line: '모터와 자석을 손전등 통에 밀어 넣습니다. 흔들면 불이 들어옵니다.\n원리는 단순하고, 단순한 것이 오래 갑니다.' },

    { id: 'r_radio', name: '수신기', make: 'radio', n: 1,
      need: [{ base: 'antenna', n: 1 }, { base: 'cable', n: 1 }, { item: 'battery', n: 1 }],
      line: '안테나를 창밖으로 빼고 선을 잇습니다. 잡음 사이로 사람 목소리 비슷한 것이 지나갑니다.' },

    { id: 'r_solarbank', name: '태양광 충전판', make: 'solar', n: 1,
      need: [{ base: 'panelbit', n: 2 }, { base: 'cable', n: 1 }],
      line: '조각 패널 두 장을 이어 붙입니다. 볕 좋은 날 반나절이면 건전지 하나는 채웁니다.' },

    { id: 'r_wire', name: '구리선', make: 'wire', n: 2,
      need: [{ tag: 'elec', n: 2 }],
      line: '전자제품을 뜯어 구리선만 뽑아냅니다. 이 도시에서 구리는 아직 돈입니다.' },

    { id: 'r_tape', name: '이어 붙인 테이프', make: 'tape', n: 1,
      need: [{ base: 'tapebit', n: 1 }, { base: 'gluetube', n: 1 }],
      line: '끈적임이 남은 테이프에 접착제를 덧발라 되살립니다.' },

    { id: 'r_line', name: '낚싯줄', make: 'fishline', n: 1,
      need: [{ base: 'net2', n: 1 }],
      line: '그물을 풀어 한 가닥으로 잇습니다. 손바닥이 쓰라리지만 질깁니다.' },

    { id: 'r_rod', name: '낚시 채비', make: 'fishlure', n: 1,
      need: [{ base: 'fishrod', n: 1 }, { base: 'fishhook', n: 1 }, { item: 'fishline', n: 1 }],
      line: '대와 줄과 바늘이 한자리에 모였습니다. 이 조합이 얼마 만인지 모릅니다.' },

    { id: 'r_dried', name: '말린 생선', make: 'dried', n: 2,
      need: [{ base: 'driedfish', n: 1 }, { base: 'seasalt', n: 1 }],
      line: '소금을 더 먹여 다시 말립니다. 오래 갑니다. 짜지만 오래 갑니다.' },

    { id: 'r_stove', name: '깡통 화로', make: 'boiled', n: 1,
      need: [{ base: 'ramenpot', n: 1 }, { base: 'foil', n: 1 }, { item: 'lighter', n: 1 }],
      line: '양은 냄비에 구멍을 내고 은박을 덧대 화로를 만듭니다. 연기가 적게 납니다.' },

    { id: 'r_spear', name: '창', make: 'pipe', n: 1,
      need: [{ base: 'pipe2', n: 1 }, { base: 'blade2', n: 1 }, { item: 'tape', n: 1 }],
      line: '파이프 끝에 칼날을 대고 테이프로 단단히 감습니다.\n든든하지는 않지만, 팔 길이만큼 거리가 생깁니다.' },

    { id: 'r_club', name: '못 박은 몽둥이', make: 'pipe', n: 1,
      need: [{ tag: 'wood', n: 1 }, { base: 'nailbox', n: 1 }],
      line: '나무 끝에 못을 여러 개 박습니다. 보기만 해도 물러서는 사람이 있습니다.' },

    { id: 'r_knife', name: '갈아 만든 칼', make: 'knife', n: 1,
      need: [{ base: 'sawblade', n: 1 }, { base: 'file2', n: 1 }, { tag: 'cloth', n: 1 }],
      line: '톱날을 줄로 갈아 날을 세우고 손잡이를 천으로 감습니다. 반나절이 걸립니다.' },

    { id: 'r_slingshot', name: '새총', make: 'shell', n: 1,
      need: [{ base: 'ball', n: 1 }, { tag: 'wood', n: 1 }, { base: 'shoelace', n: 1 }],
      line: '고무를 잘라 Y자 나무에 묶습니다. 소리가 안 나는 무기는 값이 다릅니다.' },

    { id: 'r_mask', name: '급조 방독면', make: 'gasmask', n: 1,
      need: [{ base: 'mask2', n: 1 }, { base: 'cotton', n: 1 }, { base: 'foil', n: 1 }],
      line: '천 마스크 안에 솜을 겹겹이 채우고 은박으로 테두리를 막습니다.\n완벽하지 않지만, 없는 것보다는 훨씬 낫습니다.' },

    { id: 'r_alarm', name: '줄 경보기', make: 'whistle', n: 1,
      need: [{ base: 'whistle2', n: 1 }, { item: 'fishline', n: 1 }, { base: 'spring', n: 1 }],
      line: '줄을 문 앞에 낮게 걸고 호각을 매답니다. 밤에 누가 지나가면 알 수 있습니다.' },

    { id: 'r_lockpick', name: '자물쇠 따개', make: 'key', n: 1,
      need: [{ base: 'hairband', n: 0 }, { base: 'wireroll', n: 1 }, { base: 'plier', n: 1 }],
      line: '철사를 구부려 갈고리와 지렛대를 만듭니다. 손끝 감각만 있으면 웬만한 자물쇠는 열립니다.' },

    { id: 'r_map', name: '이어 붙인 지도', make: 'map', n: 1,
      need: [{ base: 'mapbook', n: 1 }, { item: 'map', n: 1 }],
      line: '지도책의 낱장과 손에 든 조각을 맞춰 붙입니다. 비는 자리가 눈에 띄게 줄었습니다.' },

    { id: 'r_note', name: '기록장', make: 'note', n: 1,
      need: [{ base: 'notepad', n: 1 }, { base: 'pen', n: 0 }, { tag: 'paper', n: 1 }],
      line: '종이를 묶어 공책을 만듭니다. 적어 두면 잊지 않고, 잊지 않으면 살아남습니다.' },

    { id: 'r_charm', name: '수제 부적', make: 'charm', n: 1,
      need: [{ base: 'talisman', n: 1 }, { tag: 'paper', n: 1 }],
      line: '지워진 글씨를 따라 다시 그립니다. 믿는 것과 별개로, 이게 문을 열어 줄 때가 있습니다.' },

    { id: 'r_teddy', name: '기운 인형', make: 'teddy', n: 1,
      need: [{ base: 'doll2', n: 1 }, { base: 'sewkit', n: 1 }],
      line: '터진 배를 꿰매고 눈 단추를 다시 답니다. 다 만들고 나서 한참을 들여다봅니다.' },

    { id: 'r_music', name: '고친 하모니카', make: 'guitar', n: 1,
      need: [{ base: 'harmonica', n: 1 }, { base: 'file2', n: 1 }],
      line: '막힌 리드를 줄로 살살 긁어 냅니다. 두 음이 돌아왔습니다.\n불어 보니 어릴 때 배운 노래가 저절로 나옵니다.' },

    { id: 'r_hope', name: '작은 사치', make: 'hope', n: 1,
      need: [{ base: 'candle2', n: 1 }, { base: 'perfume', n: 1 }, { item: 'lighter', n: 1 }],
      line: '양초를 켜고 향수를 한 방울 떨어뜨립니다. 방 하나가 잠깐 딴 세상이 됩니다.\n이런 걸 사치라고 하던 시절이 있었습니다.' },

    { id: 'r_humor', name: '농담 밑천', make: 'humor', n: 1,
      need: [{ base: 'cards', n: 1 }, { base: 'dice', n: 1 }],
      line: '화투와 주사위를 꺼내 놓자 사람이 둘 셋 모입니다. 웃음은 대개 이렇게 시작합니다.' },

    { id: 'r_lens', name: '불붙이는 돋보기', make: 'lighter', n: 1,
      need: [{ base: 'lens', n: 1 }, { tag: 'paper', n: 1 }],
      line: '햇빛을 한 점에 모읍니다. 연기가 먼저 나고, 그다음 불이 옵니다.\n기름도 부싯돌도 필요 없습니다. 해만 있으면 됩니다.' },

    { id: 'r_trade', name: '팔릴 만한 꾸러미', make: 'gold', n: 1,
      need: [{ tag: 'metal', n: 3 }],
      line: '쇠붙이를 모아 자루에 담습니다. 무게로 파는 물건이 있습니다.' },

    { id: 'r_gift', name: '선물 꾸러미', make: 'candy', n: 2,
      need: [{ base: 'sugar', n: 1 }, { base: 'teabag', n: 1 }],
      line: '굳은 설탕을 깨서 티백 가루와 섞어 굴립니다. 사탕이라고 부르기로 합니다.' },

    { id: 'r_seed', name: '씨앗 봉투', make: 'seed', n: 1,
      need: [{ base: 'envelope', n: 1 }, { base: 'spade', n: 1 }, { tag: 'food', n: 1 }],
      line: '남은 곡식에서 성한 알만 골라 봉투에 담습니다. 심을 데는 나중에 생각합니다.' }
  ];

  /* 소지품에서 재료를 찾는다. 재질/물건 종류/특정 아이템 모두 지원. */
  B.findMaterials = function (items, need) {
    const used = [];
    for (let i = 0; i < need.length; i++) {
      const req = need[i];
      const want = Math.max(1, req.n || 1);
      let got = 0;
      for (let j = 0; j < items.length && got < want; j++) {
        const it = items[j];
        if (used.indexOf(it.id) >= 0) continue;
        const ok = (req.item && it.id === req.item)
          || (req.base && it.base === req.base)
          || (req.base && it.id === req.base)
          || (req.tag && it.tag === req.tag);
        if (!ok) continue;
        const take = Math.min(want - got, it.n);
        for (let k = 0; k < take; k++) used.push(it.id);
        got += take;
      }
      if (got < want) return null;
    }
    return used;
  };

  /* 화면에 보여 줄 재료 이름 */
  B.materialLabel = function (req) {
    const tags = { paper: '종이류', cloth: '천류', metal: '쇠붙이', glass: '유리·플라스틱',
                   elec: '전자부품', food: '먹을것', wood: '나무', sea: '바다것' };
    let label;
    if (req.item) label = (B.ITEM_MAP[req.item] || {}).name || req.item;
    else if (req.base) {
      const base = (B.JUNK_BASE_LIST || []).filter(function (b) { return b.id === req.base; })[0];
      label = base ? base.name : ((B.ITEM_MAP[req.base] || {}).name || req.base);
    } else label = tags[req.tag] || req.tag;
    const n = Math.max(1, req.n || 1);
    return n > 1 ? label + ' ×' + n : label;
  };
})(typeof window !== 'undefined' ? window : globalThis);

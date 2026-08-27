/* 부산 2033 - 마지막 장
 *
 * 엔딩 문단 뒤에 붙는 것들.
 *   1) 여정 정리 — 그동안 무엇을 했는지 상태에서 뽑아 문장으로 만든다
 *   2) 맺는 말   — 엔딩마다 다른, 조금 길게 쓴 마지막 문단
 *   3) 덧붙는 줄 — 조건이 맞을 때만 붙는 한두 줄
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};

  function num(n) { return String(n); }
  function nameOf(id) { const it = B.ITEM_MAP[id]; return it ? it.name : null; }

  /* ── 1) 여정 정리 ────────────────────────────── */
  B.summarize = function (st) {
    const lines = [];
    const page = st.page || 0;
    const chap = (st.chapterIdx || 0) + 1;
    const sp = (st.specialsDone || []).length;
    const titles = (st.titles || []);
    const skills = Object.keys(st.skills || {})
      .filter(function (k) { return st.skills[k] > 0; })
      .sort(function (a, b) { return st.skills[b] - st.skills[a]; });
    const items = Object.keys(st.items || {}).filter(function (k) { return st.items[k] > 0; });
    const keys = items.filter(function (k) { const it = B.ITEM_MAP[k]; return it && it.key; });
    const rep = st.rep || {};
    const friends = Object.keys(rep).filter(function (k) { return rep[k] >= 2; });

    lines.push('당신은 ' + num(page) + '페이지를 걸었습니다.'
      + (chap > 1 ? ' 장으로 세면 ' + num(Math.min(chap, 10)) + '장까지입니다.' : ''));

    if (sp > 0) {
      const done = (st.specialsDone || []).slice(-3).map(function (id) {
        const s2 = (B.SPECIALS || []).filter(function (x) { return x.id === id; })[0];
        return s2 ? s2.title.replace(/^(특별|수집한) 이야기 · /, '') : null;
      }).filter(Boolean);
      lines.push('가는 길에 남의 이야기를 ' + num(sp) + '편 지나왔습니다.'
        + (done.length ? ' 마지막 것은 「' + done[done.length - 1] + '」이었습니다.' : ''));
    } else {
      lines.push('가는 길에 남의 이야기는 하나도 듣지 않았습니다. 그런 여정도 있습니다.');
    }

    if (titles.length) {
      const show = titles.slice(0, 4).map(function (t) { return '「' + t + '」'; }).join(' ');
      lines.push('이 도시가 당신을 부르는 이름이 ' + num(titles.length) + '개 생겼습니다. ' + show
        + (titles.length > 4 ? ' 그리고 몇 개 더.' : ''));
    } else {
      lines.push('이 도시는 끝내 당신을 아무 이름으로도 부르지 않았습니다. 조용히 지나간 겁니다.');
    }

    if (skills.length >= 3) {
      const top = skills.slice(0, 3).map(function (k) {
        const s3 = B.SKILL_MAP[k];
        return (s3 ? s3.name : k) + ' ' + num(st.skills[k]);
      }).join(', ');
      lines.push('몸에 붙은 것이 ' + num(skills.length) + '가지입니다. 그중 깊은 것은 ' + top + '.');
    } else if (skills.length) {
      const only = skills.map(function (k) {
        const s3 = B.SKILL_MAP[k];
        return (s3 ? s3.name : k);
      }).join('과(와) ');
      lines.push('몸에 붙은 것은 ' + only + '뿐입니다. 더 배울 시간이 없었습니다.');
    } else {
      lines.push('아무것도 몸에 붙지 않았습니다. 이 도시는 배우기 전에 먼저 씁니다.');
    }

    if (friends.length) {
      const fn = friends.map(function (k) {
        const f = (B.WORLD.FACTIONS || []).filter(function (x) { return x.id === k; })[0];
        return f ? f.name : k;
      }).join(', ');
      lines.push(fn + '이(가) 당신 이름을 기억합니다. 이 도시에서 그건 적은 일이 아닙니다.');
    }

    if (keys.length) {
      const kn = keys.slice(0, 3).map(nameOf).filter(Boolean).join(', ');
      lines.push('버리지 못한 것이 가방에 ' + num(keys.length) + '개 남았습니다. ' + kn + '.'
        + (keys.length > 3 ? ' 그리고 몇 개 더.' : '') + ' 값은 하나도 안 나갑니다.');
    }

    if (st.flags && st.flags.has_pet) lines.push('마지막까지 발치에 무언가가 누워 있었습니다.');
    if (st.flags && st.flags.has_base) lines.push('돌아갈 자리가 하나 있었습니다. 그것만으로 걸음이 달랐습니다.');
    if (st.flags && st.flags.armor_saved) lines.push('한 번은 옷이 대신 맞아 주었습니다. 그 옷은 아직 가방에 있습니다.');

    return lines;
  };

  /* ── 2) 엔딩마다 붙는 맺는 말 ────────────────── */
  B.CODA = {
    truth: '이 도시는 앞으로도 잿빛일 겁니다. 다만 잿빛 위에 이름이 몇 개 적혔습니다.\n적힌 이름은 지워지지 않습니다. 종이가 삭아도 사람이 옮겨 적으니까요.\n당신이 한 일은 그것뿐이고, 이 도시에서 그것이 제일 어려운 일이었습니다.',
    revenge: '그 방에서 나온 뒤로 오래 잠을 못 잤습니다. 그러다 어느 날 잤습니다.\n자고 일어나니 아무것도 안 달라져 있었고, 그게 이상하게 견딜 만했습니다.\n닫은 문 앞에 오래 서 있는 사람이 있고, 돌아서는 사람이 있습니다. 당신은 결국 돌아섰습니다.',
    silence: '가방 안쪽 주머니에 종이가 있습니다. 이십 년째 있을 겁니다.\n말하지 않기로 한 것은 말한 것보다 오래 갑니다. 매일 다시 말하지 않기로 정해야 하니까요.\n그 매일이 당신 몫으로 남았습니다. 무겁지만, 들고 갈 만합니다.',
    trial: '사흘 동안 이백 명이 한자리에 앉아 있었습니다. 이 도시에서 이십 년 만의 일입니다.\n무엇이 옳았는지는 아무도 확신하지 못했습니다. 다만 혼자 정하지 않았습니다.\n혼자 정하지 않는 방법을 이 도시가 다시 배운 날이었고, 그 자리를 당신이 만들었습니다.',
    burn: '재가 사흘 동안 내렸습니다. 그 사흘이 지나고 나니 아무도 아무것도 증명할 수 없게 되었습니다.\n용서한 것은 아닙니다. 다만 앞으로 갚을 수 없게 만든 겁니다.\n등 뒤가 오래 따뜻했고, 그 따뜻함이 무엇이었는지는 끝내 안 물어보기로 했습니다.',
    chronicle: '공책은 벙커 문 옆에 두고 나왔습니다. 돌로 눌러서요.\n누가 읽을지는 모릅니다. 읽고 나서 무엇을 할지는 더 모릅니다.\n다만 이 도시에서 없어지는 것들 중에 하나는 남겼습니다. 기록하는 사람이 하는 일이 그것뿐이고, 그거면 됩니다.',
    settle: '봄에 마당에 뭔가를 심었습니다. 여름에 그것이 자랐고, 가을에 조금 거뒀습니다.\n삼 년을 넣어야 한 계절을 얻는 흙이라고 했는데, 삼 년째가 되니 정말 그랬습니다.\n복수는 끝내 하지 않았습니다. 대신 더 오래 걸리는 일을 시작했고, 그쪽이 아직 안 끝났습니다.',
    wander: '그 문 앞까지는 못 갔습니다. 대신 이 도시의 골목을 전부 알게 되었습니다.\n어디에 물이 있고, 어디에 사람이 있고, 어디를 밤에 지나면 안 되는지.\n사람들이 길을 물으러 옵니다. 대답해 주는 일이 하루의 대부분이 되었고, 나쁘지 않습니다.',
    death_hp: '이 도시에서 장례는 짧습니다. 얼굴에 천을 덮고, 이름을 알면 적어 두고, 그게 끝입니다.\n당신도 남에게 여러 번 해 준 일입니다. 그때는 그게 그렇게 큰 일인지 몰랐습니다.\n걸어온 길은 그대로 남습니다. 다음에 이 길을 걷는 사람은 조금 덜 헤맬 겁니다.',
    death_mp: '몸은 멀쩡했습니다. 그게 제일 견디기 어려운 부분이었습니다.\n이 도시에서 이렇게 끝나는 사람이 총에 맞아 끝나는 사람보다 많습니다.\n다들 압니다. 알면서도 아무도 그 얘기를 소리 내어 하지 않습니다.'
  };

  /* ── 3) 조건이 맞을 때만 붙는 줄 ─────────────── */
  B.ENDING_EXTRA = [
    { when: function (st) { return (st.specialsDone || []).length >= 20; },
      text: '스무 편이 넘는 남의 이야기를 들고 갑니다. 그중 몇은 당신이 아니면 아무도 모를 겁니다.' },
    { when: function (st) { return (st.titles || []).length >= 10; },
      text: '이 도시가 당신을 부르는 이름이 열 개가 넘습니다. 그 정도면 이 도시의 일부입니다.' },
    { when: function (st) { return st.hp >= 3 && st.mp >= 3; },
      text: '몸도 마음도 세 칸을 다 채운 채로 끝났습니다. 이 도시에서 아주 드문 일입니다.' },
    { when: function (st) { return st.rad >= 3; },
      text: '다만 몸 안쪽에 남은 것이 있습니다. 그건 앞으로 천천히 값을 받아 갈 겁니다.' },
    { when: function (st) { return st.flags && st.flags.gave_coat; },
      text: '어느 겨울에 옷 한 벌을 벗어 준 일이 있었습니다. 그 아이는 지금 물통을 두 개씩 집니다.' },
    { when: function (st) { return st.flags && st.flags.carry_letter; },
      text: '주머니에 아직 전하지 못한 편지가 있습니다. 다음 사람이 들고 갈 겁니다.' }
  ];

})(typeof globalThis !== 'undefined' ? globalThis : this);

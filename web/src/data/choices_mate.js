/* 부산 2033 - 같이 걷는 사람이 있을 때만 열리는 선택지
 *
 * 동행자가 있으면 이야기마다 갈래가 하나 더 열립니다.
 * 어느 이야기에 어느 것이 붙는지는 이야기 id 로 정해지므로 판이 바뀌어도 안 흔들립니다.
 * 특정 인물 이름을 안 씁니다. 여덟 중 누구와 걷든 말이 되게 썼습니다.
 */
(function (global) {
  'use strict';
  const B = global.B;
  if (!B || !B.TEMPLATES) return;

  /* 신뢰가 낮아도 되는 것들 */
  const PLAIN = [
    { t: '같이 걷는 사람에게 맡긴다.', need: { mate: true },
      res: ['제가 못 보는 걸 저 사람이 봅니다. 한 걸음 물러서서 맡깁니다.',
             '맡기는 데도 요령이 있습니다. 뒤에서 안 쳐다보는 게 요령입니다.',
             '끝나고 나서 어땠냐고도 안 물었습니다. 그게 맡긴다는 뜻입니다.'],
      eff: { mp: 2, trust: 1, add: ['relief'] } },
    { t: '둘로 나눠 본다.', need: { mate: true },
      res: ['한 사람이 이쪽, 한 사람이 저쪽. 반나절이 반으로 줍니다.',
             '중간에 두 번 소리를 내서 서로 살아 있는 걸 확인합니다.',
             '다시 만나 각자 본 걸 맞춰 보니 그림이 하나로 붙습니다.'],
      eff: { mp: 2, trust: 1, add: ['note'] } },
    { t: '등을 맡기고 앞만 본다.', need: { mate: true },
      res: ['뒤를 안 보고 앞만 봅니다. 이 도시에서 이걸 할 수 있는 상대가 몇 없습니다.',
             '뒤에서 발소리가 규칙적으로 납니다. 그 규칙이 안 깨지면 괜찮은 겁니다.',
             '한 번 안 규칙적이었고, 그때 뒤를 봤더니 이미 처리돼 있었습니다.'],
      eff: { mp: 3, trust: 1, add: ['stable'] } },
    { t: '먼저 물어본다.', need: { mate: true },
      res: ['"어떻게 볼 것 같습니까." 묻는 것만으로 답이 반쯤 나옵니다.',
             '혼자였으면 안 물었을 겁니다. 물을 데가 없으니까요.',
             '듣고 나서 제 생각을 조금 고쳤습니다. 고쳐도 안 창피했습니다.'],
      eff: { mp: 2, trust: 1, add: ['warmth'] } },
    { t: '먹을 것을 반으로 자른다.', need: { mate: true, itemKind: 'food' },
      res: ['하나를 정확히 반으로 자릅니다. 자르는 쪽이 뒤에 고릅니다.',
             '그게 규칙입니다. 누가 정한 것도 아닌데 둘 다 지킵니다.',
             '반쪽으로 배가 안 부른데, 혼자 하나 먹을 때보다 덜 허전합니다.'],
      eff: { mp: 3, trust: 1, add: ['warmth', 'relief'] } },
    { t: '오늘은 짐을 더 진다.', need: { mate: true },
      res: ['상대 가방에서 무거운 걸 꺼내 제 쪽에 옮겨 담습니다.',
             '말리길래 그냥 멨습니다. 이런 건 말로 하는 게 아닙니다.',
             '저녁에 어깨가 아팠는데, 아픈 게 기분 나쁘지가 않았습니다.'],
      eff: { wear: { hp: 1 }, mp: 4, trust: 1, add: ['warmth'] } }
  ];

  /* 신뢰가 두 칸을 넘어야 열리는 것들 */
  const DEEP = [
    { t: '둘이 나눠 맡고 동시에 움직인다.', need: { mate: true, trust: 2 },
      res: ['눈짓 하나로 갈립니다. 말을 안 해도 어디로 갈지 서로 압니다.',
             '동시에 움직이니 반대쪽이 손쓸 틈이 없습니다.',
             '끝나고 나서 둘 다 웃었습니다. 잘 맞으면 웃음이 납니다.'],
      eff: { mp: 4, trust: 1, add: ['relief', 'humor'] } },
    { t: '위험한 쪽을 내가 맡는다.', need: { mate: true, trust: 2 },
      res: ['"이쪽은 제가 갑니다." 반대쪽이 뭐라 하기 전에 먼저 갔습니다.',
             '가면서 한 번 돌아봤습니다. 안 따라오고 서 있습니다. 약속을 지키는 겁니다.',
             '돌아왔을 때 같은 자리에 그대로 서 있었습니다. 그게 제일 어려운 일입니다.'],
      eff: { wear: { hp: 1 }, mp: 5, trust: 1, title: '앞을 맡은 사람',
             add: ['grit', 'warmth'] } },
    { t: '서로 아는 방식으로 신호를 준다.', need: { mate: true, trust: 2 },
      res: ['둘만 아는 소리가 있습니다. 두 번이면 오라는 뜻이고 세 번이면 오지 말라는 뜻입니다.',
             '오늘은 세 번이 났습니다. 안 갔습니다.',
             '나중에 왜 세 번이었는지 들었습니다. 안 갔길 잘했습니다.'],
      eff: { mp: 4, trust: 1, add: ['stable', 'note'] } },
    { t: '이 사람이 아는 것으로 푼다.', need: { mate: true, trust: 2 },
      res: ['제가 모르는 일입니다. 옆 사람은 압니다.',
             '옆에서 손이 움직이는 걸 봅니다. 배워 두려고 봅니다.',
             '끝나고 한 번 더 해 보라길래 해 봤습니다. 반쯤 됩니다.'],
      eff: { mp: 4, trust: 1, add: ['relief'] } }
  ];

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  let added = 0;
  B.TEMPLATES.forEach(function (t) {
    if (!t.choices || !t.choices.length) return;
    const h = hash('mate:' + t.id);
    /* 셋 중 둘꼴로 붙입니다. 전부 붙이면 이야기가 다 똑같아집니다 */
    if (h % 3 === 0) return;
    const deep = (h >>> 5) % 3 === 0;
    const pool = deep ? DEEP : PLAIN;
    const c = pool[(h >>> 3) % pool.length];
    const have = t.choices.some(function (x) { return x.t === c.t; });
    if (have) return;
    const tail = t.choices.pop();
    t.choices.push(c);
    t.choices.push(tail);
    added++;
  });

  B.MATE_CHOICES_ADDED = added;

})(typeof globalThis !== 'undefined' ? globalThis : this);

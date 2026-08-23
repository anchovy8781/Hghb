/* 부산 2033 - 난수/덱 유틸
 *
 * 모든 무작위성은 시드 기반이라 같은 시드는 같은 이야기를 재현한다.
 * 덱(Deck)은 "뽑은 것은 한 바퀴가 끝나기 전에는 다시 나오지 않는" 비복원 추출기다.
 * 중복 서사를 막는 1차 방어선.
 */
(function (global) {
  'use strict';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStr(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

  /** 비복원 추출 덱. 다 쓰면 자동으로 다시 섞되, 직전 꼬리와 겹치지 않게 한다. */
  function Deck(items, rnd) {
    this.items = items.slice();
    this.rnd = rnd;
    this.pool = [];
    this.last = null;
    this.cycles = 0;
  }

  Deck.prototype._refill = function () {
    this.pool = this.items.slice();
    // Fisher-Yates
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(this.rnd() * (i + 1));
      const t = this.pool[i];
      this.pool[i] = this.pool[j];
      this.pool[j] = t;
    }
    // 새 덱의 첫 장이 직전 덱의 마지막 장과 같으면 뒤로 민다
    if (this.pool.length > 1 && this.pool[this.pool.length - 1] === this.last) {
      const t = this.pool.pop();
      this.pool.unshift(t);
    }
    this.cycles++;
  };

  Deck.prototype.draw = function () {
    if (!this.pool.length) this._refill();
    const v = this.pool.pop();
    this.last = v;
    return v;
  };

  Deck.prototype.remaining = function () {
    return this.pool.length;
  };

  /** 여러 덱을 이름으로 관리한다. */
  function DeckBox(rnd) {
    this.rnd = rnd;
    this.decks = {};
  }

  DeckBox.prototype.deck = function (name, items) {
    let d = this.decks[name];
    if (!d) {
      d = new Deck(items, this.rnd);
      this.decks[name] = d;
    }
    return d;
  };

  DeckBox.prototype.pick = function (name, items) {
    return this.deck(name, items).draw();
  };


  /* 한국어 조사 자동 선택
   *   "{item}을(를)" 처럼 써 두면 앞말 받침을 보고 알맞은 쪽을 고른다.
   *   ㄹ 받침 뒤의 "으로/로" 같은 예외도 함께 처리한다. */
  const JOSA_PAIRS = {
    '은(는)': ['은', '는'], '는(은)': ['은', '는'],
    '이(가)': ['이', '가'], '가(이)': ['이', '가'],
    '을(를)': ['을', '를'], '를(을)': ['을', '를'],
    '과(와)': ['과', '와'], '와(과)': ['과', '와'],
    '아(야)': ['아', '야'], '야(아)': ['아', '야'],
    '이었(였)': ['이었', '였'], '이라(라)': ['이라', '라'],
    '으로(로)': ['으로', '로'], '로(으로)': ['으로', '로'],
    '이나(나)': ['이나', '나'], '이란(란)': ['이란', '란'],
    '이야(야)': ['이야', '야'], '이며(며)': ['이며', '며']
  };

  /* 받침 정보: 0 없음, 8 은 ㄹ */
  function jongseong(ch) {
    const c = ch.charCodeAt(0);
    if (c < 0xAC00 || c > 0xD7A3) return -1;   /* 한글이 아니면 모른다 */
    return (c - 0xAC00) % 28;
  }

  const JOSA_RE = /([가-힣A-Za-z0-9])(은\(는\)|는\(은\)|이\(가\)|가\(이\)|을\(를\)|를\(을\)|과\(와\)|와\(과\)|아\(야\)|야\(아\)|이었\(였\)|이라\(라\)|으로\(로\)|로\(으로\)|이나\(나\)|이란\(란\)|이야\(야\)|이며\(며\))/g;

  function josa(text) {
    if (!text || text.indexOf('(') < 0) return text;
    return text.replace(JOSA_RE, function (m, ch, pair) {
      const forms = JOSA_PAIRS[pair];
      if (!forms) return m;
      const j = jongseong(ch);
      let withJong;
      if (j < 0) {
        /* 숫자나 영문 뒤에는 자주 쓰는 쪽으로 (받침 없는 형태) */
        withJong = false;
      } else {
        withJong = j !== 0;
        /* ㄹ 받침은 "으로" 가 아니라 "로" 를 쓴다 */
        if (j === 8 && (pair === '으로(로)' || pair === '로(으로)')) withJong = false;
      }
      return ch + (withJong ? forms[0] : forms[1]);
    });
  }

  global.B = global.B || {};
  global.B.mulberry32 = mulberry32;
  global.B.hashStr = hashStr;
  global.B.josa = josa;
  global.B.Deck = Deck;
  global.B.DeckBox = DeckBox;
  global.B.pickWeighted = function (rnd, list, weightOf) {
    let total = 0;
    for (let i = 0; i < list.length; i++) total += weightOf(list[i]);
    let r = rnd() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weightOf(list[i]);
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  };
})(typeof window !== 'undefined' ? window : globalThis);

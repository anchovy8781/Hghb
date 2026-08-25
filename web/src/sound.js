/* 부산 2033 - 소리
 *
 * 파일을 쓰지 않는다. 짧은 잡음 하나를 그때그때 만들어서 낸다.
 * 종이 넘기는 소리에 가까운 "딸깍" 하나뿐이다.
 */
(function (global) {
  'use strict';
  const B = global.B = global.B || {};
  const KEY = 'busan2033.sound';

  let ctx = null;
  let on = true;
  try { on = global.localStorage.getItem(KEY) !== 'off'; } catch (e) { on = true; }

  function ready() {
    if (!on) return null;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) { try { ctx = new AC(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* 딸깍 — 아주 짧은 잡음을 빠르게 닫는다 */
  function click(kind) {
    const c = ready();
    if (!c) return;
    const now = c.currentTime;
    const len = 0.035;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * len), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      /* 뒤로 갈수록 빠르게 죽는 잡음 */
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
    }
    const src = c.createBufferSource();
    src.buffer = buf;

    const band = c.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = kind === 'page' ? 1500 : (kind === 'soft' ? 900 : 2400);
    band.Q.value = kind === 'page' ? 0.8 : 1.6;

    const gain = c.createGain();
    gain.gain.setValueAtTime(kind === 'soft' ? 0.05 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

    src.connect(band); band.connect(gain); gain.connect(c.destination);
    src.start(now);
    src.stop(now + len);
  }

  B.Sound = {
    click: function () { click('tap'); },      /* 선택지를 고를 때 */
    page: function () { click('page'); },      /* 다음 장으로 넘어갈 때 */
    soft: function () { click('soft'); },      /* 시트를 열고 닫을 때 */
    isOn: function () { return on; },
    toggle: function () {
      on = !on;
      try { global.localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* 무시 */ }
      if (on) click('tap');
      return on;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* 부산 2033 - 시작점 */
(function (global) {
  'use strict';
  const B = global.B;

  function boot() {
    let engine = B.Engine.load();
    let resumed = !!engine;
    if (!engine) engine = new B.Engine();

    const ui = new B.UI(engine);
    global.__b2033 = { engine: engine, ui: ui };

    /* 안드로이드 셸에서 부르는 갈고리 */
    global.__b2033Save = function () { engine.save(); };
    global.__b2033Back = function () {
      const sheet = global.document.getElementById('menuSheet');
      if (sheet && !sheet.classList.contains('hidden')) { ui.closeSheet(); return true; }
      return false;
    };

    if (resumed && engine.beat) {
      ui.show(engine.beat);
      ui.toast('이어서 진행합니다. ' + engine.st.page + '페이지');
    } else {
      ui.advance();
    }

    global.addEventListener('pagehide', function () { engine.save(); });
    global.addEventListener('visibilitychange', function () { engine.save(); });
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);

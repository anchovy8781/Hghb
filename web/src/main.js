/* 부산 2033 - 시작점 */
(function (global) {
  'use strict';
  const B = global.B;

  function boot() {
    if (B.buildJunkCatalog) B.buildJunkCatalog();

    const engine = B.Engine.load() || new B.Engine();
    const ui = new B.UI(engine);
    global.__b2033 = { engine: engine, ui: ui };

    /* 안드로이드 셸에서 부르는 갈고리 */
    global.__b2033Save = function () {
      if (B.RESETTING) return;
      global.__b2033.engine.save();
    };
    global.__b2033Back = function () {
      const doc = global.document;
      const gsheet = doc.getElementById('gadgetSheet');
      const isheet = doc.getElementById('infoSheet');
      if (gsheet && !gsheet.classList.contains('hidden')) { ui.closeGadget(); return true; }
      if (isheet && !isheet.classList.contains('hidden')) { isheet.classList.add('hidden'); return true; }
      if (!doc.getElementById('app').classList.contains('hidden')) {
        global.__b2033.engine.save();
        ui.e = global.__b2033.engine;
        ui.showMenu();
        return true;
      }
      return false;
    };

    ui.showMenu();

    global.addEventListener('pagehide', function () { global.__b2033Save(); });
    global.addEventListener('visibilitychange', function () { global.__b2033Save(); });
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);

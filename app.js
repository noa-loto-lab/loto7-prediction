(function () {
  'use strict';

  var COLS = 37;       // 1〜37
  var PICK = 7;        // 仮データ用:1回あたりの本数字の数
  var LAST_ROUND = 699;
  var ROUNDS = 40;     // 仮データの回数

  // ---- 仮データ(レイアウト確認用。毎回同じ結果になる擬似乱数) ----
  var seed = 7;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  function makeData() {
    var list = [];
    for (var i = 0; i < ROUNDS; i++) {
      var set = {};
      var n = 0;
      while (n < PICK) {
        var v = 1 + Math.floor(rnd() * COLS);
        if (!set[v]) { set[v] = true; n++; }
      }
      list.push({ round: LAST_ROUND - ROUNDS + 1 + i, nums: set });
    }
    return list; // 古い回が上、新しい回が下
  }

  // ---- DOM生成 ----
  function el(cls, text) {
    var d = document.createElement('div');
    d.className = cls;
    if (text !== undefined) d.textContent = text;
    return d;
  }
  function buildRow(row, label, cellFn) {
    row.appendChild(el('round', label));
    for (var c = 1; c <= COLS; c++) row.appendChild(cellFn(c));
  }
  function colClass(c) { return 'cell' + (c % 5 === 0 ? ' k5' : ''); }

  var headRow = document.getElementById('head-row');
  buildRow(headRow, '開催回', function (c) { return el(colClass(c), c); });

  var tableRows = document.getElementById('table-rows');
  makeData().forEach(function (d) {
    var row = el('row data');
    buildRow(row, '第' + d.round + '回', function (c) {
      var hit = !!d.nums[c];
      return el(colClass(c).replace(' k5', hit ? '' : ' k5') + (hit ? ' hit' : ''), hit ? c : '');
    });
    tableRows.appendChild(row);
  });

  var predRow = document.getElementById('pred-row');
  buildRow(predRow, '次回予想', function (c) { return el(colClass(c)); });

  // ---- 横スクロールの同期(見出し・出目表・予想欄) ----
  var scrollers = [
    document.getElementById('head-scroll'),
    document.getElementById('table-scroll'),
    document.getElementById('pred-scroll')
  ];
  var owner = null, timer = null;
  scrollers.forEach(function (src) {
    src.addEventListener('scroll', function () {
      if (owner && owner !== src) return;   // 同期で動かされた側のイベントは無視
      owner = src;
      var x = src.scrollLeft;
      scrollers.forEach(function (o) { if (o !== src && o.scrollLeft !== x) o.scrollLeft = x; });
      clearTimeout(timer);
      timer = setTimeout(function () { owner = null; }, 120);
    }, { passive: true });
  });

  // ---- 初期位置:新しい回(下側)を表示 ----
  var tableScroll = scrollers[1];
  function toBottom() { tableScroll.scrollTop = tableScroll.scrollHeight; }
  toBottom();
  window.addEventListener('load', toBottom);
  window.addEventListener('orientationchange', function () { setTimeout(toBottom, 300); });
})();

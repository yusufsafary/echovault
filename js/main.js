(function(){
  "use strict";
  document.documentElement.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile nav */
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav nav");
  if (burger && nav) burger.addEventListener("click", function(){ nav.classList.toggle("open"); });

  /* ---------- schedule: seal 06:00 UTC, claims 07:00 UTC ---------- */
  function nextAt(hourUtc){
    var now = new Date();
    var t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc, 0, 0));
    if (t <= now) t.setUTCDate(t.getUTCDate() + 1);
    return t;
  }
  function fmtDur(ms){
    var s = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    function p(n){ return (n < 10 ? "0" : "") + n; }
    return p(h) + ":" + p(m) + ":" + p(ss);
  }
  function fmtClock(d){
    function p(n){ return (n < 10 ? "0" : "") + n; }
    return p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + " UTC";
  }
  var sealEl = document.getElementById("sealCount");
  var boardSeal = document.getElementById("boardSeal");
  var claimEl = document.getElementById("claimCount");
  var sealWhen = document.getElementById("sealWhen");
  var claimWhen = document.getElementById("claimWhen");
  function tickClock(){
    var now = new Date();
    var seal = nextAt(6), claim = nextAt(7);
    if (sealEl) sealEl.textContent = fmtDur(seal - now);
    if (boardSeal) boardSeal.textContent = fmtDur(seal - now);
    if (claimEl) claimEl.textContent = fmtDur(claim - now);
    if (sealWhen) sealWhen.textContent = fmtClock(seal);
    if (claimWhen) claimWhen.textContent = fmtClock(claim);
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- count up ---------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    if (reduced){ el.textContent = target.toLocaleString("en-US"); return; }
    var t0 = null, dur = 1400;
    function step(ts){
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveal + counters + alloc bars ---------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(countUp);
      if (en.target.hasAttribute("data-count")) countUp(en.target);
      en.target.querySelectorAll(".alloc-bar i").forEach(function(b){ b.style.width = b.getAttribute("data-w") + "%"; });
      io.unobserve(en.target);
    });
  }, {threshold: 0.18}) : null;
  document.querySelectorAll(".rv, [data-count], .alloc").forEach(function(el){
    if (io) io.observe(el); else { el.classList.add("in"); }
  });
  if (!io) document.querySelectorAll("[data-count]").forEach(countUp);

  /* ---------- hero echo rings canvas ---------- */
  var cv = document.getElementById("echoCanvas");
  if (cv && !reduced && window.innerWidth > 700){
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, rings = [], last = 0;
    function size(){
      var hero = cv.parentElement;
      var hr = hero.getBoundingClientRect();
      var grid = hero.querySelector(".hero-grid");
      var bottom = grid ? (grid.getBoundingClientRect().bottom - hr.top + 12) : hr.height;
      W = cv.width = Math.max(300, hr.width);
      H = cv.height = Math.max(260, bottom);
      cv.style.height = H + "px";
    }
    size(); window.addEventListener("resize", size);
    function spawn(t){
      rings.push({r: 6, a: 0.85, born: t});
      if (rings.length > 14) rings.shift();
    }
    function frame(t){
      if (document.hidden){ requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.76, cy = H * 0.34;
      /* tempo follows the seal clock: calmer far from seal, denser near it */
      var msToSeal = nextAt(6) - new Date();
      var interval = 1500 + 1700 * Math.min(1, msToSeal / (6 * 3600 * 1000));
      if (t - last > interval){ spawn(t); last = t; }
      rings = rings.filter(function(g){ return g.a > 0.01; });
      rings.forEach(function(g){
        g.r += 0.55 + g.r * 0.006;
        g.a *= 0.986;
        ctx.beginPath();
        ctx.arc(cx, cy, g.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(182,255,46," + (g.a * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });
      /* core gem point */
      ctx.beginPath();
      ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(237,234,226,0.9)";
      ctx.fill();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- chain board canvas: a living chain of echoes ---------- */
  var cc = document.getElementById("chainCanvas");
  if (cc){
    var c2 = cc.getContext("2d");
    var fb = document.querySelector(".chain-fallback");
    if (fb) fb.style.display = "none";
    var CW = 0, CH = 0;
    function size2(){
      var r = cc.getBoundingClientRect();
      CW = cc.width = Math.max(300, r.width);
      CH = cc.height = 92;
    }
    var N = 9;
    function sizeAll(){ size2(); N = CW < 430 ? 7 : 9; }
    sizeAll(); window.addEventListener("resize", sizeAll);
    function drawChain(t){
      sizeAll();
      c2.clearRect(0, 0, CW, CH);
      var y = CH / 2, x0 = 34, x1 = CW - 34;
      var stepX = (x1 - x0) / (N - 1);
      /* links */
      c2.beginPath();
      for (var i = 0; i < N; i++){
        var x = x0 + stepX * i;
        if (i === 0) c2.moveTo(x, y); else c2.lineTo(x, y);
      }
      c2.strokeStyle = "rgba(156,156,146,0.5)"; c2.lineWidth = 1.5; c2.stroke();
      for (var j = 0; j < N; j++){
        var xj = x0 + stepX * j;
        var fade = 1 - j / (N + 2);
        var r = Math.min(17 - j * 1.15, stepX * 0.44);
        c2.beginPath();
        c2.arc(xj, y, Math.max(4, r), 0, Math.PI * 2);
        c2.strokeStyle = "rgba(182,255,46," + (0.25 + 0.75 * fade).toFixed(3) + ")";
        c2.lineWidth = 2;
        c2.stroke();
        c2.beginPath();
        c2.arc(xj, y, 2.2, 0, Math.PI * 2);
        c2.fillStyle = j === 0 ? "rgba(237,234,226,0.95)" : "rgba(182,255,46," + (0.4 + 0.6 * fade).toFixed(3) + ")";
        c2.fill();
      }
    }
    drawChain(0);
    window.addEventListener("resize", function(){ drawChain(0); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ drawChain(0); });
    setTimeout(function(){ drawChain(0); }, 900);
  }

  /* footer year */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getUTCFullYear();
})();

/* ---- Live Chain Board: bacaan on-chain langsung (balapan 5 RPC, timeout 6 dtk) ---- */
(function(){
  var stChain = document.getElementById("stChainV");
  if (!stChain) return;
  var stLen = document.getElementById("stLenV"), stBreak = document.getElementById("stBreakV"),
      bbVal = document.getElementById("bbVal"), liveState = document.getElementById("liveState");
  var NFT = "0x0B6dea434e3b70636b730cDc62e504Bc376E74e3";
  var RPCS = ["https://bsc-dataseed.binance.org", "https://bsc-dataseed1.defibit.io", "https://bsc.publicnode.com", "https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed1.ninicoin.io"];
  var SEL = { genesis: "0x14349d0c", day: "0x5c9302c9", total: "0xd508e53f", chain: "0x3da998fa", toBreak: "0x7363993d" };
  function encUint(n){ return n.toString(16).padStart(64, "0"); }
  function callReq(id, data){ return { jsonrpc: "2.0", id: id, method: "eth_call", params: [{ to: NFT, data: data }, "latest"] }; }
  function race(body){
    var ctrl = new AbortController(); var to = setTimeout(function(){ ctrl.abort(); }, 6000);
    var tries = RPCS.map(function(url){
      return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal })
        .then(function(r){ return r.json(); })
        .then(function(j){ if (!j || j.error || !j.result && !Array.isArray(j)) throw new Error("bad"); return j; });
    });
    return Promise.any(tries).finally(function(){ clearTimeout(to); });
  }
  function u256(hex){ return parseInt(hex, 16); }
  var breakLeft = null;
  function fmtMS(s){ var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
  function refresh(){
    race([callReq(1, SEL.genesis), callReq(2, SEL.day), callReq(3, SEL.total), callReq(4, SEL.chain), callReq(5, SEL.toBreak)])
    .then(function(rows){
      var byId = {}; rows.forEach(function(r){ byId[r.id] = r.result; });
      var genesis = u256(byId[1]) === 1, day = u256(byId[2]), total = u256(byId[3]), chain = u256(byId[4]), toBreak = u256(byId[5]);
      return race([callReq(6, "0x1b4a0291" + encUint(chain)), callReq(7, "0x4bec7310" + encUint(day))])
        .then(function(rows2){
          var byId2 = {}; rows2.forEach(function(r){ byId2[r.id] = r.result; });
          var chainLen = u256(byId2[6]);
          if (liveState) liveState.textContent = genesis ? "LIVE" : "OPENS SOON";
          stChain.textContent = chain;
          if (stLen) stLen.textContent = chainLen;
          if (toBreak > 0 && chainLen > 0){ breakLeft = toBreak; if (bbVal) bbVal.textContent = fmtMS(toBreak); if (stBreak) stBreak.innerHTML = fmtMS(toBreak) + " <small>LEFT</small>"; }
          else { breakLeft = null; if (bbVal) bbVal.textContent = "15:00"; if (stBreak) stBreak.innerHTML = "15 <small>MIN</small>"; }
        });
    }).catch(function(){ /* semua RPC gagal: biarkan nilai statis */ });
  }
  refresh(); setInterval(refresh, 30000);
  setInterval(function(){ if (breakLeft !== null && breakLeft > 0){ breakLeft--; if (bbVal) bbVal.textContent = fmtMS(breakLeft); if (stBreak) stBreak.innerHTML = fmtMS(breakLeft) + " <small>LEFT</small>"; if (breakLeft === 0) refresh(); } }, 1000);
})();

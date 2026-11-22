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
  if (cv && !reduced){
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
  if (cc && !reduced){
    var c2 = cc.getContext("2d");
    var CW = 0, CH = 0;
    function size2(){
      var r = cc.getBoundingClientRect();
      CW = cc.width = Math.max(300, r.width);
      CH = cc.height = 92;
    }
    size2(); window.addEventListener("resize", size2);
    var N = 9;
    function drawChain(t){
      if (document.hidden){ requestAnimationFrame(drawChain); return; }
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
        var pulse = 1 + 0.10 * Math.sin(t / 620 - j * 0.85);
        var r = (17 - j * 1.15) * pulse;
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
      requestAnimationFrame(drawChain);
    }
    requestAnimationFrame(drawChain);
  }

  /* footer year */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getUTCFullYear();
})();

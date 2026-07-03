// ============================================
// 渲染层：hash路由 + 纸片拼贴过渡
// #/1980s  #/map  #/city-london  #/node-blitz
// ============================================
(function () {
  var D = window.SITE_DATA;
  var stage = document.getElementById("stage");
  var animating = false;
  var pendingFly = null; // 被剪下的词：{text, rect, fontSize}

  // ---------- 工具 ----------

  // [[id|文字]] → 剪贴词span
  function parseBody(text) {
    return text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, function (_, id, label) {
      return '<span class="clip" data-target="' + id + '">' + label + "</span>";
    });
  }

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  // ---------- 路由 ----------

  function parseHash() {
    var h = (location.hash || "#/1980s").replace(/^#\//, "");
    if (D.eras[h]) return { view: "era", id: h };
    if (h === "map") return { view: "map" };
    if (D.nodes[h]) return { view: "node", id: h };
    return { view: "era", id: "1980s" };
  }

  function moodFor(route) {
    if (route.view === "era") return D.eras[route.id].mood;
    if (route.view === "map") return D.mapPage.mood;
    return D.nodes[route.id].mood || D.mapPage.mood;
  }

  // 丝线路径：根据当前路由推导，不需要维护栈
  function pathFor(route) {
    var p = [{ label: "1980s", hash: "#/1980s", color: D.eras["1980s"].mood.thread }];
    if (route.view === "era") return p;
    p.push({ label: "地图", hash: "#/map", color: D.mapPage.mood.thread });
    if (route.view === "map") return p;
    var node = D.nodes[route.id];
    if (node.type === "topic" && node.parent) {
      var parent = D.nodes[node.parent];
      p.push({ label: parent.title, hash: "#/" + node.parent, color: parent.mood.thread });
    }
    p.push({ label: node.title, hash: "#/" + route.id, color: (node.mood || D.mapPage.mood).thread });
    return p;
  }

  function renderThread(route) {
    var thread = document.getElementById("thread");
    thread.innerHTML = "";
    var path = pathFor(route);
    path.forEach(function (seg, i) {
      var s = document.createElement("div");
      s.className = "thread-seg";
      s.style.background = seg.color;
      s.title = seg.label;
      if (i < path.length - 1) {
        s.addEventListener("click", function () { location.hash = seg.hash; });
      } else {
        s.style.cursor = "default";
      }
      thread.appendChild(s);
    });
  }

  // ---------- 各视图的DOM ----------

  function buildEra(id) {
    var era = D.eras[id];
    var layer = el('<div class="page-layer center"></div>');
    layer.appendChild(el('<div class="scrap s-era-title" data-rot="-0.6"><h1>' + era.title + "</h1></div>"));
    layer.appendChild(el('<div class="scrap s-tagline" data-rot="0.4"><p>' + era.tagline + "</p></div>"));
    layer.appendChild(el('<div class="scrap s-enter" data-rot="-0.3"><span class="clip" data-target="__map">' + era.enterLabel + "</span></div>"));
    return layer;
  }

  function buildMap() {
    var era = D.eras["1980s"];
    var layer = el('<div class="page-layer"></div>');
    layer.appendChild(el('<div class="scrap s-kicker" data-rot="0.5">' + D.mapPage.title + "</div>"));
    layer.appendChild(el('<div class="scrap s-sub" data-rot="-0.4"><p>' + D.mapPage.sub + "</p></div>"));

    var area = el('<div class="map-area"></div>');
    era.map.forEach(function (cid, i) {
      var c = D.nodes[cid];
      var open = c.status === "open";
      var s = el(
        '<div class="scrap s-city' + (open ? "" : " locked") + '" data-rot="' + ((i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.4)) + '"' +
        ' style="left:' + c.mapPos.x + "%;top:" + c.mapPos.y + '%">' +
        (open ? '<span class="clip" data-target="' + cid + '">' + c.title + "</span>"
              : '<span class="locked-label" data-hint="' + D.mapPage.lockedHint + '">' + c.title + "</span>") +
        (open && c.hover ? '<div class="city-hover">' + c.hover + "</div>" : "") +
        "</div>"
      );
      area.appendChild(s);
    });
    layer.appendChild(area);
    return layer;
  }

  function buildNode(id) {
    var node = D.nodes[id];
    var layer = el('<div class="page-layer"></div>');
    layer.appendChild(el('<div class="scrap s-kicker" data-rot="-0.6">' + node.kicker + "</div>"));
    layer.appendChild(el('<div class="scrap s-title" data-rot="0.4"><h1>' + node.title + "</h1></div>"));
    node.body.forEach(function (p, i) {
      layer.appendChild(el('<div class="scrap" data-rot="' + ((i % 2 ? 1 : -1) * 0.4) + '"><p>' + parseBody(p) + "</p></div>"));
    });
    if (node.type === "topic") {
      layer.appendChild(el(
        '<div class="scrap s-endnote" data-rot="-0.3">' +
        '<span class="end-text">' + D.endNote + "</span>" +
        ' · <a href="#/' + node.parent + '">回到' + D.nodes[node.parent].title + "</a>" +
        ' · <a href="#/map">回到地图</a></div>'
      ));
    }
    return layer;
  }

  function buildFor(route) {
    if (route.view === "era") return buildEra(route.id);
    if (route.view === "map") return buildMap();
    return buildNode(route.id);
  }

  // ---------- 过渡动画 ----------

  function scatterOut(layer, done) {
    var scraps = layer.querySelectorAll(".scrap");
    gsap.to(scraps, {
      x: function () { return gsap.utils.random(-360, 360); },
      y: function () { return gsap.utils.random(-160, 240); },
      rotation: function () { return gsap.utils.random(-28, 28); },
      opacity: 0,
      scale: 0.92,
      duration: 0.55,
      stagger: { each: 0.05, from: "random" },
      ease: "power2.in",
      onComplete: function () { layer.remove(); done(); }
    });
  }

  function assembleIn(layer, done) {
    var scraps = layer.querySelectorAll(".scrap");
    gsap.fromTo(scraps,
      {
        x: function () { return gsap.utils.random(-300, 300); },
        y: function () { return gsap.utils.random(-200, 160); },
        rotation: function () { return gsap.utils.random(-24, 24); },
        opacity: 0,
        scale: 1.05
      },
      {
        x: 0, y: 0, opacity: 1, scale: 1,
        rotation: function (i, t) { return parseFloat(t.dataset.rot || 0); },
        duration: 0.7,
        stagger: { each: 0.07, from: "random" },
        ease: "power3.out",
        onComplete: done || function () {}
      }
    );
  }

  function flyIntoTitle(layer) {
    if (!pendingFly) return;
    var info = pendingFly;
    pendingFly = null;

    var fly = document.createElement("div");
    fly.className = "flying-clip";
    fly.textContent = info.text;
    fly.style.left = info.rect.left + "px";
    fly.style.top = info.rect.top + "px";
    fly.style.fontSize = info.fontSize;
    document.body.appendChild(fly);

    gsap.to(fly, { top: info.rect.top - 40, rotation: -4, scale: 1.15, duration: 0.5, ease: "power2.out" });

    var title = layer.querySelector(".s-title h1, .s-kicker");
    var settle = function () {
      var tRect = title.getBoundingClientRect();
      gsap.to(fly, {
        left: tRect.left, top: tRect.top,
        fontSize: title.tagName === "H1" ? window.getComputedStyle(title).fontSize : "16px",
        duration: 0.6, ease: "power3.inOut", delay: 0.75,
        onComplete: function () {
          gsap.to(fly, { opacity: 0, duration: 0.35, onComplete: function () { fly.remove(); } });
        }
      });
    };
    if (title) settle(); else fly.remove();
  }

  // ---------- 剪贴词交互 ----------

  var lifters = [];

  function bindClips(layer) {
    var clips = gsap.utils.toArray(layer.querySelectorAll(".clip"));
    clips.forEach(function (clip, i) {
      gsap.to(clip, {
        backgroundColor: "#faf4e4",
        duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.7
      });
      clip.addEventListener("click", function () {
        if (animating) return;
        var target = clip.dataset.target;
        var rect = clip.getBoundingClientRect();
        pendingFly = {
          text: clip.textContent,
          rect: rect,
          fontSize: window.getComputedStyle(clip).fontSize
        };
        location.hash = target === "__map" ? "#/map" : "#/" + target;
      });
    });
    lifters = clips.map(function (clip) {
      return {
        el: clip,
        rot: gsap.quickTo(clip, "rotation", { duration: 0.4, ease: "power2.out" }),
        yq: gsap.quickTo(clip, "y", { duration: 0.4, ease: "power2.out" })
      };
    });
  }

  document.addEventListener("mousemove", function (e) {
    var near = false;
    lifters.forEach(function (l) {
      if (!l.el.isConnected) return;
      var r = l.el.getBoundingClientRect();
      var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      var t = 1 - Math.min(d / 90, 1);
      if (t > 0) near = true;
      l.rot(-0.5 + t * -3);
      l.yq(t * -4);
    });
    document.body.classList.toggle("scissors", near);
  });

  // ---------- 路由驱动 ----------

  function show(route, withScatter) {
    animating = true;
    gsap.to("body", { backgroundColor: moodFor(route).bg, duration: 1.2, ease: "sine.inOut" });

    var buildAndAssemble = function () {
      var layer = buildFor(route);
      layer.querySelectorAll(".scrap").forEach(function (s) {
        gsap.set(s, { rotation: parseFloat(s.dataset.rot || 0) });
      });
      stage.appendChild(layer);
      renderThread(route);
      bindClips(layer);
      assembleIn(layer, function () { animating = false; });
      flyIntoTitle(layer);
    };

    var old = stage.querySelector(".page-layer");
    if (old && withScatter) scatterOut(old, buildAndAssemble);
    else { if (old) old.remove(); buildAndAssemble(); }
  }

  window.addEventListener("hashchange", function () {
    show(parseHash(), true);
  });

  show(parseHash(), false);
})();

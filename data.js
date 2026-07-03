// ============================================
// 数据层：一切皆节点
// body 里用 [[节点id|显示文字]] 内嵌延伸点
// 以后扩展 = 往 nodes 里加条目，改 status
// ============================================
window.SITE_DATA = {

  eras: {
    "1980s": {
      title: "1980s",
      tagline: "一个过剩的年代。所有东西都要更大、更亮、更多、更贵。",
      enterLabel: "剪开这一年",
      mood: { bg: "#171512", thread: "#d4af37" },
      map: ["city-london", "city-paris", "city-milan", "city-nyc", "city-tokyo", "city-moscow"]
    }
  },

  mapPage: {
    title: "1980s · 世界",
    sub: "时尚不发生在国家里。它发生在具体的城市、具体的街区、具体的某一扇门后面。选一座城。",
    lockedHint: "尚未剪开",
    mood: { bg: "#15130f", thread: "#6b5c3a" }
  },

  nodes: {

    "city-london": {
      type: "city",
      status: "open",
      era: "1980s",
      kicker: "LONDON · 1980s",
      title: "伦敦",
      hover: "朋克死了，它的孩子们各自上路",
      mapPos: { x: 46, y: 28 },
      mood: { bg: "#171512", thread: "#d4af37" },
      body: [
        "这十年的伦敦被劈成两半。一半在唐宁街：[[node-thatcher|撒切尔]]的经济改革碾过工业城镇，失业率翻倍，年轻人没钱、没工作、没未来。",
        "另一半在夜里：正因为白天一无所有，他们把全部创造力押在穿着上——用窗帘布、旧军装和二手店淘来的碎片，把自己缝成艺术品。每周二晚上，这些人在一间叫[[node-blitz|Blitz]]的酒吧门口排队。",
        "十年后回头看，英国时尚的整个黄金一代，几乎都从这两半的夹缝里长出来。"
      ]
    },

    "city-paris":  { type: "city", status: "locked", title: "巴黎",  mapPos: { x: 48, y: 34 } },
    "city-milan":  { type: "city", status: "locked", title: "米兰",  mapPos: { x: 51, y: 38 } },
    "city-nyc":    { type: "city", status: "locked", title: "纽约",  mapPos: { x: 27, y: 36 } },
    "city-tokyo":  { type: "city", status: "locked", title: "东京",  mapPos: { x: 83, y: 40 } },
    "city-moscow": { type: "city", status: "locked", title: "莫斯科", mapPos: { x: 59, y: 22 } },

    "node-blitz": {
      type: "topic",
      status: "open",
      era: "1980s",
      parent: "city-london",
      kicker: "COVENT GARDEN · 1979–1981",
      title: "BLITZ",
      mood: { bg: "#141019", thread: "#8a4a6a" },
      body: [
        "每周二晚上，Steve Strange站在门口。他不收门票，他收造型——不够华丽的人进不来，哪怕你是Mick Jagger。",
        "里面，Boy George看着衣帽间，Spandau Ballet在演出，一群用窗帘布和旧军装打扮自己的孩子正在发明之后整个十年的样子。它只活了十八个月，但New Romantic从这里出生，八十年代从这里出生。"
      ]
    },

    "node-thatcher": {
      type: "topic",
      status: "open",
      era: "1980s",
      parent: "city-london",
      kicker: "DOWNING ST. · 1979–1990",
      title: "撒切尔时代",
      mood: { bg: "#1a1412", thread: "#a03030" },
      body: [
        "她自己就是全英国最著名的power dresser：垫肩、手袋、一丝不苟。",
        "而她的政策制造了她的反面——1984年，设计师Katharine Hamnett穿着写有“58% DON'T WANT PERSHING”的T恤走进唐宁街和她握手。整个十年，英国时尚都在跟她吵架，也因为她而存在。"
      ]
    }
  },

  endNote: "这条线之后会继续延伸"
};

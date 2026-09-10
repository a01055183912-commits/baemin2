(function () {
  "use strict";

  var PLATFORMS = [
    { key: "baemin", name: "배민 · 가게소개", color: "var(--p-baemin)",
      goal: "주문을 고민하는 고객의 선택을 돕는 글",
      rule: "가게소개 최대 500자", limit: 500 },
    { key: "naver", name: "네이버 플레이스 · 소개", color: "var(--p-naver)",
      goal: "검색하고 비교하는 고객이 가게를 이해하게 하는 정보",
      rule: "대표키워드 최대 5개 · 글자 수는 관리자 화면 기준 확인", limit: 0 },
    { key: "kakao", name: "카카오맵 · 매장 소식", color: "var(--p-kakao)",
      goal: "방문 전 확신을 주는 정보",
      rule: "기타 영업시간 설명 최대 100자 · 태그 최대 5개", limit: 0 },
    { key: "insta", name: "인스타그램 · 게시글", color: "var(--p-insta)",
      goal: "관심·기억·공유를 만드는 콘텐츠",
      rule: "해시태그 최대 5개", limit: 0 }
  ];

  var FIELDS = {
    name: "가게명", kind: "업종", where: "위치", menu: "대표메뉴와 가격",
    taste: "맛·식감", ingredient: "재료", how: "조리방법", guest: "주요 고객",
    strong: "가게의 강점", rule: "지키는 원칙", hours: "영업시간",
    said: "손님이 자주 하는 말", today: "오늘 알리고 싶은 내용", scene: "진짜 장면"
  };

  var BANNED = ["국내 최초", "인생맛집", "역대급", "최고급", "강남맛집", "유명한", "유명", "맛집", "최고", "무조건", "1위", "완벽", "절대", "대박", "미쳤"];

  var SAMPLE_STORE = {
    name: "한자리돼지국밥", kind: "돼지국밥 · 한식", where: "부산 서면 시장 골목",
    menu: "얼큰돼지국밥 10,000원\n수육백반 13,000원",
    taste: "칼칼하고 진하지만 느끼하지 않은 국물",
    ingredient: "국내산 돼지고기, 대파, 다진 양념",
    how: "매일 아침 육수를 직접 끓입니다",
    guest: "평일 점심 직장인, 혼자 오시는 손님",
    strong: "20년째 같은 자리, 혼밥 가능",
    rule: "전날 끓인 육수는 다시 쓰지 않습니다",
    hours: "매일 08:00-21:00, 둘째주 일요일 휴무",
    said: "국물이 안 느끼하다",
    today: "오늘도 정상 영업합니다",
    scene: "아침 6시, 국밥 육수에 불을 올리는 장면"
  };

  var $ = function (id) { return document.getElementById(id); };
  var cardsEl = $("cards");
  var statusEl = $("status");
  var els = {};
  Object.keys(FIELDS).forEach(function (k) { els[k] = $("f-" + k); });

  /* ---------- render shells ---------- */
  var refs = {};
  PLATFORMS.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      '<div class="top">' +
        '<span class="pdot" style="background:' + p.color + '"></span>' +
        '<span class="name"></span>' +
        '<span class="count"></span>' +
        '<span class="goal"></span>' +
      '</div>' +
      '<div class="body empty">위 사실을 채우고 <b>홍보글 4개 만들기</b>를 누르면 여기에 글이 나옵니다.</div>' +
      '<div class="tags" hidden></div>' +
      '<div class="flag" hidden></div>' +
      '<div class="used" hidden></div>' +
      '<div class="foot">' +
        '<span class="rule"></span>' +
        '<button class="btn tiny" type="button">복사</button>' +
      '</div>';
    card.querySelector(".name").textContent = p.name;
    card.querySelector(".goal").textContent = p.goal;
    card.querySelector(".rule").textContent = p.rule;
    cardsEl.appendChild(card);
    refs[p.key] = {
      body: card.querySelector(".body"),
      tags: card.querySelector(".tags"),
      flag: card.querySelector(".flag"),
      used: card.querySelector(".used"),
      count: card.querySelector(".count"),
      copy: card.querySelector(".foot .btn"),
      text: ""
    };
    refs[p.key].copy.addEventListener("click", function () { doCopy(p.key); });
  });

  function doCopy(key) {
    var r = refs[key];
    if (!r.text) { return; }
    var full = r.text;
    var tagList = r.tags.hidden ? [] : Array.prototype.map.call(r.tags.children, function (t) { return t.textContent; });
    if (tagList.length) { full += "\n\n" + tagList.join(" "); }
    var done = function () {
      var b = r.copy, old = b.textContent;
      b.textContent = "복사됨";
      setTimeout(function () { b.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(done, function () { legacyCopy(full, done); });
    } else { legacyCopy(full, done); }
  }
  function legacyCopy(t, done) {
    var ta = document.createElement("textarea");
    ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- store facts ---------- */
  function readStore() {
    var s = {};
    Object.keys(FIELDS).forEach(function (k) { s[k] = (els[k].value || "").trim(); });
    return s;
  }
  function menuLines(s) {
    return (s.menu || "").split("\n").map(function (l) { return l.trim(); })
      .filter(Boolean).slice(0, 6);
  }
  function firstMenuName(s) {
    var l = menuLines(s)[0];
    if (!l) { return ""; }
    return l.replace(/[0-9,.]+\s*원.*$/, "").trim() || l;
  }

  /* ---------- inspection ---------- */
  function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 한국어 조사를 뗀 어근도 같은 의미단어로 인식시켜 매칭을 넓힌다.
  var PARTICLES = ["에서만", "으로는", "에게서", "이라도", "이라서", "이지만",
    "에서", "에게", "으로", "까지", "부터", "처럼", "같이", "보다", "이나", "라도",
    "이며", "으며", "이고", "만큼", "는", "은", "이", "가", "을", "를", "의",
    "에", "로", "와", "과", "도", "만", "나"];
  function stripParticle(w) {
    for (var i = 0; i < PARTICLES.length; i++) {
      var p = PARTICLES[i];
      if (w.length - p.length >= 2 && w.slice(-p.length) === p) { return w.slice(0, -p.length); }
    }
    return w;
  }
  function splitWords(v) {
    return v.split(/[\s,·/()]+/).map(function (w) { return w.trim(); }).filter(Boolean);
  }

  // 필드 하나에서 본문과 매칭해 볼 "의미단어" 후보를 뽑는다: 원문 전체(짧으면),
  // 낱말, 조사를 뗀 어근, 메뉴는 이름/가격을 따로.
  function extractKeywords(key, value) {
    var out = [];
    function add(w) {
      w = (w || "").trim();
      if (w.length >= 2 && out.indexOf(w) === -1) { out.push(w); }
    }
    if (!value) { return out; }
    if (key === "menu") {
      menuLines({ menu: value }).forEach(function (line) {
        add(line);
        var name = line.replace(/[0-9,.]+\s*원.*$/, "").trim();
        add(name);
        var price = line.match(/[0-9][0-9,]*\s*원/);
        if (price) { add(price[0].replace(/\s+/g, "")); }
      });
      return out;
    }
    if (value.length <= 16) { add(value); }
    splitWords(value).forEach(function (w) {
      add(w);
      add(stripParticle(w));
    });
    return out;
  }

  // 과장 표현(banned)과 입력한 가게 사실에서 나온 의미단어(fact)를 본문에서 함께 찾아
  // 겹치지 않게 배치한 뒤, 과장 표현은 <mark>로, 의미단어는 밑줄 <span>으로 표시한다.
  function buildHighlight(text, store) {
    var spans = [];
    BANNED.forEach(function (w) {
      var idx = 0, i;
      while ((i = text.indexOf(w, idx)) !== -1) {
        spans.push({ start: i, end: i + w.length, type: "banned", label: w });
        idx = i + w.length;
      }
    });
    var usedFields = [];
    Object.keys(FIELDS).forEach(function (k) {
      var v = store[k];
      if (!v) { return; }
      var matched = false;
      extractKeywords(k, v).forEach(function (kw) {
        var idx = 0, i;
        while ((i = text.indexOf(kw, idx)) !== -1) {
          spans.push({ start: i, end: i + kw.length, type: "fact", label: FIELDS[k] });
          matched = true;
          idx = i + kw.length;
        }
      });
      if (matched) { usedFields.push(FIELDS[k]); }
    });

    spans.sort(function (a, b) {
      if (a.start !== b.start) { return a.start - b.start; }
      var lenDiff = (b.end - b.start) - (a.end - a.start);
      if (lenDiff !== 0) { return lenDiff; }
      return a.type === "banned" ? -1 : 1;
    });
    var accepted = [], lastEnd = -1;
    spans.forEach(function (sp) {
      if (sp.start >= lastEnd) { accepted.push(sp); lastEnd = sp.end; }
    });

    var html = "", pos = 0, bannedHits = [];
    accepted.forEach(function (sp) {
      html += esc(text.slice(pos, sp.start));
      var chunk = esc(text.slice(sp.start, sp.end));
      if (sp.type === "banned") {
        html += "<mark>" + chunk + "</mark>";
        if (bannedHits.indexOf(sp.label) === -1) { bannedHits.push(sp.label); }
      } else {
        html += '<span class="factlink" title="가게 사실: ' + esc(sp.label) + '">' + chunk + "</span>";
      }
      pos = sp.end;
    });
    html += esc(text.slice(pos));
    return { html: html, bannedHits: bannedHits, usedFields: usedFields };
  }

  // 배민 전용 구조 검수: "메뉴 -> 맛/식감 -> 재료/조리 -> ... -> 가게다운 한마디" 순서를
  // 지키는지, 즉 메뉴 정보가 첫 문장에 나오는지 확인한다.
  function checkMenuFirst(text, store) {
    if (!store.menu) { return null; }
    var kws = extractKeywords("menu", store.menu);
    if (!kws.length) { return null; }
    var earliest = -1;
    kws.forEach(function (kw) {
      var i = text.indexOf(kw);
      if (i !== -1 && (earliest === -1 || i < earliest)) { earliest = i; }
    });
    if (earliest === -1) {
      return "메뉴 이름·가격이 본문에 보이지 않습니다 — 배민은 메뉴부터 보여주세요.";
    }
    var firstSentence = text.match(/^[\s\S]*?[.!?\n]/);
    var firstSentenceLen = firstSentence ? firstSentence[0].length : text.length;
    if (earliest >= firstSentenceLen) {
      return "메뉴 정보가 뒤로 밀렸습니다 — 배민은 메뉴부터 보여주세요.";
    }
    return null;
  }

  function paint(key, text, chips, store) {
    var r = refs[key], p = null;
    for (var i = 0; i < PLATFORMS.length; i++) { if (PLATFORMS[i].key === key) { p = PLATFORMS[i]; } }
    text = (text || "").trim();
    r.text = text;
    if (!text) {
      r.body.className = "body empty";
      r.body.textContent = "글이 만들어지지 않았습니다. 사실을 조금 더 채우고 다시 시도해 주세요.";
      r.tags.hidden = true;
      r.flag.hidden = true;
      r.used.hidden = true;
      r.count.textContent = "";
      return;
    }
    var m = buildHighlight(text, store);
    r.body.className = "body";
    r.body.innerHTML = m.html;

    var n = Array.from(text).length;
    r.count.textContent = n + "자" + (p.limit ? " / " + p.limit : "");
    r.count.className = "count" + (p.limit && n > p.limit ? " over" : "");

    if (chips && chips.length) {
      r.tags.hidden = false;
      r.tags.innerHTML = "";
      chips.slice(0, 5).forEach(function (c) {
        var el = document.createElement("span");
        el.className = "tag";
        el.textContent = c;
        r.tags.appendChild(el);
      });
    } else { r.tags.hidden = true; }

    var msgs = [];
    if (m.bannedHits.length) { msgs.push("근거 없는 과장 표현: " + m.bannedHits.join(", ") + " — 사실 표현으로 바꾸세요."); }
    if (p.limit && n > p.limit) { msgs.push("입력 한도 " + p.limit + "자를 " + (n - p.limit) + "자 넘겼습니다."); }
    if (key === "baemin") {
      var menuMsg = checkMenuFirst(text, store);
      if (menuMsg) { msgs.push(menuMsg); }
    }
    if (msgs.length) {
      r.flag.hidden = false; r.flag.className = "flag"; r.flag.textContent = msgs.join(" / ");
    } else {
      r.flag.hidden = false; r.flag.className = "flag ok"; r.flag.textContent = "과장 표현 없음 · 입력 기준 이내";
    }

    if (m.usedFields.length) {
      r.used.hidden = false;
      r.used.textContent = "사용한 우리 가게 사실 — " + m.usedFields.join(" · ") + " (본문의 밑줄 친 단어에 마우스를 올리면 확인할 수 있습니다)";
    } else { r.used.hidden = true; }
  }

  /* ---------- rule-based draft (no AI) ---------- */
  function j(parts, sep) {
    return parts.filter(Boolean).join(sep || " ");
  }
  function priceLine(s) {
    return menuLines(s).join(" / ");
  }
  function basicDraft(s) {
    var menu1 = firstMenuName(s) || (s.kind || "메뉴");
    var out = {};

    out.baemin = { text: j([
      s.taste ? s.taste + "이(가) 생각날 때 드시기 좋은 " + menu1 + "입니다." : menu1 + "을(를) 준비합니다.",
      s.how ? s.how + "." : "",
      s.ingredient ? "재료는 " + s.ingredient + "을(를) 씁니다." : "",
      priceLine(s) ? priceLine(s) + " 로 주문하실 수 있습니다." : "",
      s.strong ? s.strong + "." : ""
    ]), chips: [] };

    out.naver = { text: j([
      (s.where ? s.where + "에서 " : "") + (s.strong ? s.strong + ", " : "") + (s.name || "저희 가게") + "입니다.",
      s.kind ? "업종은 " + s.kind + "입니다." : "",
      s.how ? s.how + "." : "",
      priceLine(s) ? priceLine(s) + "을(를) 판매합니다." : "",
      s.guest ? s.guest + "이(가) 많이 찾습니다." : "",
      s.hours ? "영업시간은 " + s.hours + "입니다." : ""
    ]), chips: [s.kind, menu1, s.where, s.guest, s.taste].filter(Boolean).slice(0, 5) };

    out.kakao = { text: j([
      s.today ? s.today : "",
      priceLine(s) ? priceLine(s) + "." : "",
      s.hours ? s.hours + "." : "",
      s.where ? s.where + "에 있습니다." : "",
      s.guest ? s.guest + "도 편하게 이용하실 수 있습니다." : ""
    ]), chips: [s.kind, menu1, s.where].filter(Boolean).slice(0, 5) };

    var hook = s.scene ? s.scene + "." : (s.rule ? s.rule + "." : menu1 + "을(를) 준비하는 아침입니다.");
    var tagWords = [menu1, s.where, s.kind, s.name].filter(Boolean)
      .map(function (t) { return t.split(/[·,]/)[0].trim(); })
      .filter(function (t) { return t && Array.from(t).length <= 12; });

    out.insta = { text: j([
      hook,
      s.how ? s.how + "." : "",
      s.said ? "손님들은 이렇게 말씀하십니다. “" + s.said + "”" : "",
      s.rule ? s.rule + "." : "",
      s.today ? s.today : ""
    ], "\n\n"), chips: tagWords.slice(0, 5)
      .map(function (t) { return "#" + t.replace(/[\s·,\-–—]/g, ""); }) };

    return out;
  }

  /* ---------- prompt ---------- */
  function buildPrompt(s) {
    var lines = [];
    Object.keys(FIELDS).forEach(function (k) {
      if (s[k]) { lines.push(FIELDS[k] + ": " + s[k].replace(/\n/g, " / ")); }
    });
    return [
      "당신은 외식업·소상공인 홍보 전문 카피라이터입니다.",
      "",
      "아래에 적힌 우리 가게의 사실만 사용해서 플랫폼의 고객 목적에 맞는 홍보글을 작성해주세요.",
      "절대 입력하지 않은 사실을 추측하거나 만들어내지 마세요.",
      "\"최고\", \"유명한\", \"맛집\", \"인생맛집\", \"무조건\" 같은 근거 없는 과장 표현은 사용하지 마세요.",
      "모든 글은 한국어 존댓말로 씁니다.",
      "",
      "[우리 가게 사실]",
      lines.join("\n"),
      "",
      "다음 4개 플랫폼용으로 각각 작성해주세요.",
      "1. 배민 — 주문을 고민하는 고객의 선택을 돕는다. 메뉴의 맛, 식감, 재료, 구성처럼 주문 결정에 필요한 구체적인 사실을 먼저 보여준다. 400자 이내.",
      "2. 네이버 플레이스 — 검색하고 비교하는 고객이 가게를 이해하도록 돕는다. 업종·대표메뉴·가격·특징·고객 이용 상황을 명확하게 쓴다. 키워드를 억지로 반복하지 않는다. 실제 제공 메뉴·서비스와 관련된 대표키워드를 최대 5개 제안한다.",
      "3. 카카오맵 매장 소식 — 방문을 검토하는 고객이 필요한 정보를 빨리 확인하도록 돕는다. 오늘 영업 여부, 메뉴, 가격, 위치, 이용 시 알아야 할 내용을 간결하고 정확하게. 3~4문장.",
      "4. 인스타그램 — 관심을 갖고 기억하거나 공유하고 싶게 만든다. 첫 문장은 시선을 끌고, 우리 가게만 보여줄 수 있는 실제 장면이나 이야기를 넣는다. 광고문처럼 과장하지 않는다. 관련성 높은 해시태그는 최대 5개.",
      "",
      "답은 다음 JSON 하나만 출력하세요. 다른 문장은 쓰지 마세요.",
      '{"baemin":{"text":"..."},"naver":{"text":"...","keywords":["..."]},"kakao":{"text":"..."},"insta":{"text":"...","hashtags":["#..."]}}'
    ].join("\n");
  }

  /* ---------- status ---------- */
  function setStatus(msg, isErr, busy) {
    statusEl.className = isErr ? "err" : "";
    statusEl.innerHTML = "";
    if (msg && busy) {
      var d = document.createElement("span"); d.className = "dot"; statusEl.appendChild(d);
    }
    if (msg) { statusEl.appendChild(document.createTextNode(msg)); }
  }

  function hasEnough(s) {
    var filled = 0;
    Object.keys(FIELDS).forEach(function (k) { if (s[k]) { filled++; } });
    return filled >= 3;
  }

  function renderBasic(s, note) {
    var d = basicDraft(s);
    PLATFORMS.forEach(function (p) {
      paint(p.key, d[p.key].text, d[p.key].chips, s);
    });
    setStatus(note || "AI 없이 만든 기본 초안입니다. 문장을 사장님 말투로 고쳐 쓰세요.", false, false);
  }

  /* ---------- wiring ---------- */
  $("btn-sample").addEventListener("click", function () {
    Object.keys(SAMPLE_STORE).forEach(function (k) { if (els[k]) { els[k].value = SAMPLE_STORE[k]; } });
    setStatus("예시 가게(돼지국밥집) 사실을 채웠습니다. 실습 때는 사장님 가게 사실로 바꿔 주세요.", false, false);
  });

  $("btn-basic").addEventListener("click", function () {
    var s = readStore();
    if (!hasEnough(s)) { setStatus("가게 사실을 3개 이상 채워 주세요.", true, false); return; }
    renderBasic(s);
  });

  var aiEnabled = false;
  var ctl = null;
  var goBtn = $("btn-go"), stopBtn = $("btn-stop"), aiNote = $("ai-note");

  goBtn.addEventListener("click", function () {
    var s = readStore();
    if (!hasEnough(s)) { setStatus("가게 사실을 3개 이상 채워 주세요.", true, false); return; }
    if (!aiEnabled) { renderBasic(s, "이 서버에서는 AI가 연결되어 있지 않아 기본 초안으로 만들었습니다."); return; }
    run(s);
  });

  stopBtn.addEventListener("click", function () { if (ctl) { ctl.abort(); } });

  function run(s) {
    ctl = new AbortController();
    goBtn.disabled = true;
    stopBtn.hidden = false;
    setStatus("네 개의 글을 쓰는 중입니다…", false, true);

    fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: buildPrompt(s) }),
      signal: ctl.signal
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
    }).then(function (r) {
      if (!r.ok) { throw { code: (r.data && r.data.error) || "upstream_error" }; }
      var data = r.data;
      paint("baemin", (data.baemin || {}).text, [], s);
      paint("naver", (data.naver || {}).text, ((data.naver || {}).keywords || []).map(String), s);
      paint("kakao", (data.kakao || {}).text, [], s);
      paint("insta", (data.insta || {}).text, ((data.insta || {}).hashtags || []).map(String), s);
      setStatus("완성되었습니다. 각 글이 우리 가게 사실만 쓰고 있는지 확인한 뒤 복사하세요.", false, false);
    }).catch(function (e) {
      var code = (e && e.code) || (e && e.name === "AbortError" ? "cancelled" : "upstream_error");
      var map = {
        cancelled: "",
        ai_not_configured: "이 서버에서는 AI가 연결되어 있지 않아 기본 초안으로 만들었습니다.",
        rate_limited: "요청이 많습니다. 잠시 뒤 다시 눌러 주세요. 우선 기본 초안을 보여드립니다.",
        invalid_json: "AI 응답을 읽지 못했습니다. 다시 눌러 주세요. 우선 기본 초안을 보여드립니다.",
        invalid_prompt: "입력을 다시 확인해 주세요.",
        prompt_too_large: "입력이 너무 깁니다. 항목을 줄여 주세요."
      };
      if (code === "cancelled") { setStatus("멈췄습니다.", false, false); return; }
      var msg = map[code] || "연결이 원활하지 않습니다. 우선 기본 초안을 보여드립니다.";
      if (code === "invalid_prompt" || code === "prompt_too_large") { setStatus(msg, true, false); return; }
      renderBasic(s, msg);
      statusEl.className = "err";
    }).then(function () {
      goBtn.disabled = false;
      stopBtn.hidden = true;
      ctl = null;
    });
  }

  fetch("/api/status").then(function (r) { return r.json(); }).then(function (data) {
    aiEnabled = Boolean(data && data.aiEnabled);
    aiNote.textContent = aiEnabled ? "AI가 사실만 가지고 글을 씁니다." : "이 서버에서는 AI 없이 기본 초안만 만듭니다.";
  }).catch(function () {
    aiEnabled = false;
    aiNote.textContent = "이 서버에서는 AI 없이 기본 초안만 만듭니다.";
  });
})();

/* Protótipo: comportamento comum. Rolagem nativa; nada roda com o ponteiro parado ou fora de cena presa na tela. */
(function () {
  var html = document.documentElement;
  var q = new URLSearchParams(location.search);
  var reduce = html.dataset.reduce === "1";
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var interativo = fine && !reduce;
  var captura = html.dataset.captura === "1";
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- Barra do protótipo ---------- */
  function go(k, v) { if (v === null) q.delete(k); else q.set(k, v); location.search = q.toString(); }
  document.querySelectorAll("[data-set]").forEach(function (b) {
    var k = b.dataset.set, v = b.dataset.v;
    b.setAttribute("aria-pressed", String(html.dataset[k] === v));
    b.addEventListener("click", function () { if (k === "cena") q.delete("cor"); go(k, v); });
  });
  document.querySelectorAll("[data-toggle]").forEach(function (b) {
    var k = b.dataset.toggle, on = q.get(k) === "0";
    b.setAttribute("aria-pressed", String(on));
    b.addEventListener("click", function () { go(k, on ? null : "0"); });
  });

  /* ---------- Tema, com transição circular a partir do botão ---------- */
  function applyTheme(t) {
    html.dataset.theme = t; q.set("tema", t); history.replaceState(null, "", "?" + q.toString());
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeBtn === t)); });
    var tg = document.querySelector("[data-theme-toggle]");
    if (tg) tg.setAttribute("aria-label", t === "escuro" ? "Mudar para o tema claro" : "Mudar para o tema escuro");
    window.dispatchEvent(new Event("proto:tema"));
  }
  function setTheme(t, from) {
    if (t === html.dataset.theme) return;
    if (!document.startViewTransition || reduce || !from) { applyTheme(t); return; }
    var r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    html.style.setProperty("--vx", x + "px"); html.style.setProperty("--vy", y + "px");
    html.style.setProperty("--vr", Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + "px");
    document.startViewTransition(function () { applyTheme(t); });
  }
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) toggle.addEventListener("click", function () { setTheme(html.dataset.theme === "escuro" ? "claro" : "escuro", toggle); });
  document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.addEventListener("click", function () { setTheme(b.dataset.themeBtn, b); }); });
  applyTheme(html.dataset.theme);

  /* ---------- Títulos: palavra por palavra (h2) e letra por letra (nome do Hero) ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var text = el.textContent.trim(), letras = el.dataset.split === "l", n = 0;
    var vis = text.split(/\s+/).map(function (w) {
      if (!letras) return '<span class="w" style="--i:' + n++ + '">' + w + "</span>";
      return '<span class="word">' + Array.from(w).map(function (c) { return '<span class="ch" style="--i:' + n++ + '">' + c + "</span>"; }).join("") + "</span>";
    }).join(" ");
    el.innerHTML = '<span class="sr-only">' + text + '</span><span aria-hidden="true">' + vis + "</span>";
    el.classList.add(letras ? "split-l" : "split-w");
    if (letras) raf(function () { el.classList.add("ready"); });
  });

  /* Onda do nome: distância de cada letra ao ponteiro numa gaussiana, gravada em --wave só enquanto o ponteiro se move */
  var nome = document.querySelector(".split-l");
  if (nome && interativo) {
    var letras = nome.querySelectorAll(".ch"), cx = [], px = null, pend = false;
    function medir() { cx = Array.prototype.map.call(letras, function (l) { var r = l.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); }
    function onda() {
      pend = false;
      for (var i = 0; i < letras.length; i++) {
        var w = 0;
        if (px) { var dx = cx[i][0] - px[0], dy = (cx[i][1] - px[1]) * 1.6; w = Math.exp(-(dx * dx + dy * dy) / (2 * 60 * 60)); }
        letras[i].style.setProperty("--wave", w.toFixed(3));
      }
    }
    nome.addEventListener("pointerenter", medir);
    nome.addEventListener("pointermove", function (e) { px = [e.clientX, e.clientY]; if (!pend) { pend = true; raf(onda); } });
    nome.addEventListener("pointerleave", function () { px = null; raf(onda); });
  }

  /* Luz que segue o ponteiro e formas do fundo do Hero */
  var hero = document.querySelector(".hero"), bg = document.querySelector(".hero-bg");
  if (hero && bg && interativo) {
    var hp = null, hpend = false;
    hero.addEventListener("pointermove", function (e) { hp = e; if (!hpend) { hpend = true; raf(luz); } });
    function luz() {
      hpend = false; var r = hero.getBoundingClientRect();
      var x = (hp.clientX - r.left) / r.width, y = (hp.clientY - r.top) / r.height;
      bg.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); bg.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      bg.style.setProperty("--px", (x - 0.5).toFixed(3)); bg.style.setProperty("--py", (y - 0.5).toFixed(3));
    }
  }

  /* Cartão de perfil em 3D (no máximo 8°) com reflexo */
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    if (!interativo) return;
    var ev = null, pend = false;
    card.addEventListener("pointermove", function (e) { ev = e; card.classList.add("is-tilting"); if (!pend) { pend = true; raf(tilt); } });
    card.addEventListener("pointerleave", function () { card.classList.remove("is-tilting"); ["--rx", "--ry"].forEach(function (p) { card.style.setProperty(p, "0deg"); }); card.style.setProperty("--shine", "0"); });
    function tilt() {
      pend = false; var r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--ry", ((x - 0.5) * 16).toFixed(2) + "deg"); card.style.setProperty("--rx", ((0.5 - y) * 16).toFixed(2) + "deg");
      card.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); card.style.setProperty("--gy", (y * 100).toFixed(1) + "%"); card.style.setProperty("--shine", "1");
    }
  });

  /* Brilho que segue o ponteiro nos cartões de competência */
  document.querySelectorAll(".glow").forEach(function (c) {
    if (!interativo) return;
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); });
  });

  /* ---------- Entradas ao aparecer na tela ---------- */
  var alvos = document.querySelectorAll("[data-reveal], .split-w");
  document.querySelectorAll('[data-reveal="children"]').forEach(function (p) { Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty("--i", i); }); });
  function mostrar(el) { el.classList.add("in"); }
  if (reduce || !("IntersectionObserver" in window)) alvos.forEach(mostrar);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -2% 0px" });
    alvos.forEach(function (el) { io.observe(el); });
    /* Foco do teclado num bloco que ainda não entrou: mostra na hora */
    document.addEventListener("focusin", function (e) { var b = e.target.closest("[data-reveal]"); if (b) mostrar(b); });
  }

  /* Números do cartão contam até o valor (o valor final já está no HTML) */
  var nums = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; nio.unobserve(e.target);
        var el = e.target, fim = +el.dataset.count, t0 = performance.now();
        (function passo(t) { var k = Math.min(1, (t - t0) / 900); el.textContent = String(Math.round(fim * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf(passo); })(t0);
      });
    });
    nums.forEach(function (n) { nio.observe(n); });
  }

  /* ---------- Links da barra: vai à seção e leva o foco ao título ---------- */
  document.querySelectorAll('.nav a[href^="#"], .mark[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var alvo = document.querySelector(a.getAttribute("href")); if (!alvo) return;
      e.preventDefault(); alvo.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.pushState(null, "", a.getAttribute("href"));
      var h = alvo.querySelector("h1, h2"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
  });

  /* ---------- Condutor de rolagem: progresso 0..1 em --p, só com cena presa na tela ---------- */
  var scrubs = Array.prototype.slice.call(document.querySelectorAll("[data-scrub]")), ativos = new Set(), rodando = false;
  var parallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  function progresso(el) {
    var r = el.getBoundingClientRect(), vh = innerHeight;
    if (el.classList.contains("seq")) return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
    return Math.min(1, Math.max(0, (vh * 0.75 - r.top) / Math.max(1, r.height)));
  }
  function passo() {
    if (!ativos.size && !parallax.length) { rodando = false; return; }
    ativos.forEach(function (el) {
      var p = progresso(el); el.style.setProperty("--p", p.toFixed(4));
      if (el.classList.contains("seq")) {
        var step = Math.min(4, Math.floor(p * 5));
        el.querySelectorAll(".seq-steps li").forEach(function (li, i) { li.classList.toggle("on", i === step); if (i === step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      }
      if (el.classList.contains("stack")) {
        var cards = el.querySelectorAll(".paper");
        for (var i = 0; i < cards.length; i++) {
          var c = 0;
          if (cards[i + 1]) { var a = cards[i].getBoundingClientRect(), b = cards[i + 1].getBoundingClientRect(); c = Math.min(1, Math.max(0, 1 - (b.top - a.top) / Math.max(1, a.height))); }
          cards[i].style.setProperty("--cover", c.toFixed(3));
        }
      }
    });
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var d = (r.top + r.height / 2 - innerHeight / 2) * (+el.dataset.speed || 0), lim = r.height * 0.15;
      el.style.setProperty("--py", Math.max(-lim, Math.min(lim, d)).toFixed(1) + "px");
    });
    raf(passo);
  }
  function ligar() { if (!rodando) { rodando = true; raf(passo); } }
  if (!reduce) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) ativos.add(e.target); else ativos.delete(e.target); }); ligar(); });
    scrubs.forEach(function (s) { sio.observe(s); });
    if (parallax.length) ligar();
  } else {
    scrubs.forEach(function (s) { s.style.setProperty("--p", "1"); });
    document.querySelectorAll(".seq-steps li").forEach(function (li) { li.classList.add("on"); });
  }

  /* ---------- Carrossel: botões, posição anunciada, sem avanço automático ---------- */
  document.querySelectorAll(".carousel").forEach(function (car) {
    var track = car.querySelector(".track"), slides = track.children, out = car.querySelector("output");
    function atual() { if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) return slides.length - 1; return Math.round(track.scrollLeft / Math.max(1, slides[0].getBoundingClientRect().width + 20)); }
    function ir(i) { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduce ? "auto" : "smooth" }); }
    car.querySelector("[data-prev]").addEventListener("click", function () { ir(atual() - 1); });
    car.querySelector("[data-next]").addEventListener("click", function () { if (atual() >= slides.length - 2) track.scrollTo({ left: track.scrollWidth, behavior: reduce ? "auto" : "smooth" }); else ir(atual() + 1); });
    var t; track.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(function () { out.textContent = atual() + 1 + " de " + slides.length; }, 120); });
  });

  /* ---------- Formulário: o protótipo não envia ---------- */
  var form = document.querySelector("form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); form.querySelector(".form-note").textContent = "Protótipo: nada foi enviado. No site, a mensagem chega à Evelym por e-mail."; });

  /* ---------- Cena 3D ---------- */
  var box = document.querySelector(".scene-box"), canvas = box && box.querySelector("canvas"), poster = box && box.querySelector(".poster");
  var estado = document.querySelector("[data-scene-state]");
  var cena = html.dataset.cena;
  function posterSrc() { return "posters/" + cena + "-" + html.dataset.cor + "-" + html.dataset.theme + ".jpg"; }
  if (poster) { poster.src = posterSrc(); window.addEventListener("proto:tema", function () { poster.src = posterSrc(); }); }
  function diz(t) { if (estado) estado.textContent = t; }
  function temWebGL() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }
  function motivo() {
    if (html.dataset.nowebgl === "1") return "Sem WebGL (simulado): imagem estática no lugar da cena.";
    if (reduce) return "Movimento reduzido: imagem estática no lugar da cena.";
    var con = navigator.connection; if (con && con.saveData) return "Economia de dados: imagem estática no lugar da cena.";
    if (!captura && navigator.deviceMemory && navigator.deviceMemory <= 4 && (navigator.hardwareConcurrency || 8) <= 4) return "Aparelho modesto: imagem estática no lugar da cena.";
    if (!temWebGL()) return "Este navegador não tem WebGL: imagem estática no lugar da cena.";
    return "";
  }
  function cores() {
    var cs = getComputedStyle(html), o = {};
    ["bg", "surface", "surface-2", "border", "text", "muted", "accent", "accent-fill", "ok", "fail", "scene-bg"].forEach(function (k) { o[k] = (cs.getPropertyValue("--scene-" + k) || cs.getPropertyValue("--" + k)).trim(); });
    o.bg = o["scene-bg"];
    var h = o["scene-bg"].replace("#", ""), l = (parseInt(h.slice(0, 2), 16) * 299 + parseInt(h.slice(2, 4), 16) * 587 + parseInt(h.slice(4, 6), 16) * 114) / 255000;
    o.escuro = l < 0.5; return o;
  }
  function voltarAoPoster(t) { box.classList.remove("is-live"); diz(t); }

  function iniciar() {
    var m = motivo(); if (m) { diz(m); return; }
    if (!window.CENAS || !window.CENAS[cena]) return;
    Promise.all([import("three"), import("three/addons/environments/RoomEnvironment.js"), import("three/addons/geometries/RoundedBoxGeometry.js")]).then(function (mods) {
      var THREE = mods[0], lib = { THREE: THREE, RoomEnvironment: mods[1].RoomEnvironment, RoundedBoxGeometry: mods[2].RoundedBoxGeometry };
      var dprMax = matchMedia("(pointer: coarse)").matches ? 1.5 : 2, dpr = Math.min(devicePixelRatio || 1, dprMax);
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: captura, powerPreference: "high-performance" });
      renderer.setPixelRatio(captura ? 1 : dpr);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
      var pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new lib.RoomEnvironment(), 0.04).texture; pmrem.dispose();
      scene.fog = new THREE.Fog(0x000000, 14, 34);
      var api = window.CENAS[cena](lib, { scene: scene, camera: camera, renderer: renderer });
      function tingir() { var c = cores(); scene.fog.color.set(c["scene-bg"]); api.colors(c); }
      tingir(); window.addEventListener("proto:tema", tingir);
      function tamanho() { var r = box.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
      tamanho(); new ResizeObserver(tamanho).observe(box);
      canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); voltarAoPoster("A cena perdeu o contexto WebGL: imagem estática."); });

      var tags = box.querySelectorAll('.scene-tags[data-so-cena="' + cena + '"] li');
      function marcar(p) { tags.forEach(function (li) { li.classList.toggle("on", p >= +li.dataset.de && p <= +li.dataset.ate); }); }
      function prog() { var hh = document.querySelector(".hero").offsetHeight; return Math.min(1, Math.max(0, scrollY / (hh * 0.85))); }
      var ponteiro = { x: 0, y: 0 };
      if (interativo) box.addEventListener("pointermove", function (e) { var r = box.getBoundingClientRect(); ponteiro.x = (e.clientX - r.left) / r.width - 0.5; ponteiro.y = (e.clientY - r.top) / r.height - 0.5; });

      if (captura) { /* pôster: estado determinístico, 4 s de animação em passos fixos, primeira posição da rolagem */
        for (var i = 0; i < 240; i++) api.update(1 / 60, i / 60, 0, ponteiro);
        renderer.render(scene, camera); box.classList.add("is-live"); window.__cenaPronta = true; return;
      }
      var visivel = true, rodandoCena = false, ultimo = 0, t = 0, amostra = [], rebaixou = false;
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; laco(); }).observe(box);
      document.addEventListener("visibilitychange", laco);
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) { if (e.matches) { visivel = false; voltarAoPoster("Movimento reduzido ligado: imagem estática."); } });
      function quadro(agora) {
        if (!visivel || document.hidden || !box.classList.contains("is-live") && t > 0.5) { rodandoCena = false; return; }
        var dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000); ultimo = agora; t += dt;
        var p = prog(); api.update(dt, t, p, ponteiro); renderer.render(scene, camera); marcar(p);
        if (dt > 0) { amostra.push(dt); if (amostra.length > 180) amostra.shift(); }
        if (amostra.length === 180) {
          var media = amostra.reduce(function (a, b) { return a + b; }) / 180;
          if (media > 1 / 30) { if (!rebaixou) { rebaixou = true; renderer.setPixelRatio(1); amostra = []; diz("Cena mais leve para este aparelho."); } else { voltarAoPoster("Aparelho lento: imagem estática no lugar da cena."); rodandoCena = false; return; } }
        }
        raf(quadro);
      }
      function laco() { if (!rodandoCena && visivel && !document.hidden) { rodandoCena = true; ultimo = 0; raf(quadro); } }
      api.update(0, 0, prog(), ponteiro); renderer.render(scene, camera);
      raf(function () { box.classList.add("is-live"); diz(""); laco(); });
    }).catch(function (e) { console.error(e); diz("A cena 3D não carregou (sem internet?): imagem estática."); });
  }
  if (captura) iniciar();
  else if (document.readyState === "complete") agendar(); else addEventListener("load", agendar);
  function agendar() { (window.requestIdleCallback || setTimeout)(iniciar, { timeout: 1500 }); }
})();

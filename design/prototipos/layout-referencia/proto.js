/* Rodada 2: comportamento do protótipo sobre o CSS da referência. As entradas usam os mesmos ganchos de lá
   ([data-motion=ready], [data-reveal] + data-revealed, split-mask/word/char e --wave); o resto (formas do Hero, luz,
   foto 3D, contagem, sequência, pilha, carrossel e cena) vem da rodada 1. Rolagem nativa. */
(function () {
  var html = document.documentElement, q = new URLSearchParams(location.search), raf = requestAnimationFrame.bind(window);
  var reduce = html.dataset.reduce === "1", captura = html.dataset.captura === "1";
  var interativo = matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce;
  function tema() { return html.classList.contains("dark") ? "escuro" : "claro"; }

  /* ---------- Barra do protótipo ---------- */
  function ir(k, v) { if (v === null) q.delete(k); else q.set(k, v); location.search = q.toString(); }
  document.querySelectorAll("[data-set]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(html.dataset[b.dataset.set] === b.dataset.v));
    b.addEventListener("click", function () { ir(b.dataset.set, b.dataset.v); });
  });
  document.querySelectorAll("[data-toggle]").forEach(function (b) {
    var on = q.get(b.dataset.toggle) === "0"; b.setAttribute("aria-pressed", String(on));
    b.addEventListener("click", function () { ir(b.dataset.toggle, on ? null : "0"); });
  });

  /* ---------- Tema: escuro por padrão; troca em círculo a partir do botão ---------- */
  function aplicar(t) {
    html.classList.toggle("dark", t === "escuro"); q.set("tema", t); history.replaceState(null, "", "?" + q.toString() + location.hash);
    document.querySelectorAll("[data-tema-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.temaBtn === t)); });
    var tb = document.querySelector("[data-tema]"); if (tb) tb.setAttribute("aria-label", t === "escuro" ? "Mudar para o tema claro" : "Mudar para o tema escuro");
    dispatchEvent(new Event("proto:tema"));
  }
  function trocar(t, de) {
    if (t === tema()) return;
    if (!document.startViewTransition || reduce || !de) { aplicar(t); return; }
    var r = de.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    html.style.setProperty("--vx", x + "px"); html.style.setProperty("--vy", y + "px");
    html.style.setProperty("--vr", Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + "px");
    document.startViewTransition(function () { aplicar(t); });
  }
  var tb = document.querySelector("[data-tema]");
  if (tb) tb.addEventListener("click", function () { trocar(tema() === "escuro" ? "claro" : "escuro", tb); });
  document.querySelectorAll("[data-tema-btn]").forEach(function (b) { b.addEventListener("click", function () { trocar(b.dataset.temaBtn, b); }); });
  aplicar(tema());

  /* ---------- Menu do celular ---------- */
  var mb = document.querySelector("[data-menu]"), menu = document.getElementById("mobile-menu");
  if (mb && menu) {
    mb.addEventListener("click", function () { var abre = menu.hidden; menu.hidden = !abre; mb.setAttribute("aria-expanded", String(abre)); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a[href^='#']")) { menu.hidden = true; mb.setAttribute("aria-expanded", "false"); } });
  }

  /* ---------- Títulos: a marcação de palavras e letras da referência ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var texto = el.textContent.trim(), letras = el.hasAttribute("data-split-letters"), c = 0;
    var vis = texto.split(/\s+/).map(function (w, i) {
      var dentro = letras ? Array.from(w).map(function (ch) { return '<span class="split-char" style="--c:' + c++ + '">' + ch + "</span>"; }).join("") : w;
      return '<span class="split-mask"><span class="split-word" style="--i:' + i + '">' + dentro + "</span></span>";
    }).join(" ");
    el.innerHTML = '<span class="sr-only split-sr">' + texto + '</span><span aria-hidden="true">' + vis + "</span>";
  });

  /* Onda do nome: gaussiana da distância de cada letra ao ponteiro em --wave, só enquanto o ponteiro se move */
  var nome = document.querySelector("#hero-title");
  if (nome && interativo) {
    var letras = nome.querySelectorAll(".split-char"), cx = [], pt = null, pend = false;
    function medir() { cx = Array.prototype.map.call(letras, function (l) { var r = l.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); }
    function onda() {
      pend = false;
      for (var i = 0; i < letras.length; i++) {
        var w = 0; if (pt) { var dx = cx[i][0] - pt[0], dy = (cx[i][1] - pt[1]) * 1.4; w = Math.exp(-(dx * dx + dy * dy) / (2 * 75 * 75)); }
        letras[i].style.setProperty("--wave", w.toFixed(3));
      }
    }
    nome.addEventListener("pointerenter", medir);
    nome.addEventListener("pointermove", function (e) { pt = [e.clientX, e.clientY]; if (!pend) { pend = true; raf(onda); } });
    nome.addEventListener("pointerleave", function () { pt = null; raf(onda); });
  }

  /* ---------- Formas do fundo do Hero (como as da referência) e luz que segue o ponteiro ---------- */
  var hero = document.getElementById("hero"), fundo = document.querySelector(".hero-backdrop"), luz = document.querySelector(".hero-glow");
  if (fundo) {
    var s = 7, rnd = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    var formas = [];
    for (var i = 0; i < 26; i++) {
      var x = rnd() * 100, y = rnd() * 100, t = 10 + rnd() * 18, tipo = Math.floor(rnd() * 5), cls = rnd() < 0.3 ? "a" : "l", d = Math.round((rnd() - 0.5) * 60), rot = Math.round(rnd() * 90);
      var g = "";
      if (tipo === 0) { var pts = []; for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k; pts.push((t * Math.cos(a)).toFixed(1) + "," + (t * Math.sin(a)).toFixed(1)); } g = '<polygon points="' + pts.join(" ") + '"/>'; }
      else if (tipo === 1) g = '<rect x="' + -t / 2 + '" y="' + -t / 2 + '" width="' + t + '" height="' + t + '" rx="2"/>';
      else if (tipo === 2) g = '<circle r="' + t / 2 + '"/>';
      else if (tipo === 3) g = '<polygon points="0,' + -t / 2 + " " + t / 2 + "," + t / 2 + " " + -t / 2 + "," + t / 2 + '"/>';
      else g = '<path d="M' + -t / 2 + "," + -t / 2 + "L" + t / 2 + "," + t / 2 + "M" + t / 2 + "," + -t / 2 + "L" + -t / 2 + "," + t / 2 + '"/>';
      formas.push('<svg x="' + x.toFixed(1) + '%" y="' + y.toFixed(1) + '%" overflow="visible"><g class="f ' + cls + '" style="--d:' + d + '"><g transform="rotate(' + rot + ')">' + g + "</g></g></svg>");
    }
    for (i = 0; i < 70; i++) formas.push('<circle class="p" cx="' + (rnd() * 100).toFixed(1) + '%" cy="' + (rnd() * 100).toFixed(1) + '%" r="1.3"/>');
    fundo.innerHTML = '<svg aria-hidden="true">' + formas.join("") + "</svg>";
    fundo.setAttribute("data-on", "");
  }
  if (hero && interativo) {
    var hp = null, hpend = false;
    hero.addEventListener("pointermove", function (e) { hp = e; if (!hpend) { hpend = true; raf(mover); } });
    function mover() {
      hpend = false; var r = hero.getBoundingClientRect(), x = (hp.clientX - r.left) / r.width, y = (hp.clientY - r.top) / r.height;
      if (luz) { luz.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); luz.style.setProperty("--my", (y * 100).toFixed(1) + "%"); }
      if (fundo) { fundo.style.setProperty("--px", (x - 0.5).toFixed(3)); fundo.style.setProperty("--py", (y - 0.5).toFixed(3)); }
    }
  }

  /* ---------- Foto do Sobre: inclinação 3D (até 8°) com reflexo ---------- */
  document.querySelectorAll("[data-tilt]").forEach(function (box) {
    if (!interativo) return;
    var ev = null, pend = false;
    box.addEventListener("pointermove", function (e) { ev = e; box.classList.add("is-tilting"); if (!pend) { pend = true; raf(inclinar); } });
    box.addEventListener("pointerleave", function () { box.classList.remove("is-tilting"); box.style.setProperty("--rx", "0deg"); box.style.setProperty("--ry", "0deg"); box.style.setProperty("--shine", "0"); });
    function inclinar() {
      pend = false; var r = box.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      box.style.setProperty("--ry", ((x - 0.5) * 16).toFixed(2) + "deg"); box.style.setProperty("--rx", ((0.5 - y) * 16).toFixed(2) + "deg");
      box.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); box.style.setProperty("--gy", (y * 100).toFixed(1) + "%"); box.style.setProperty("--shine", "1");
    }
  });

  /* Brilho que segue o ponteiro nos cartões de competência (como o CardGlow da referência) */
  document.querySelectorAll(".tech-card").forEach(function (c) {
    if (!interativo) return;
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); });
  });

  /* ---------- Entradas: data-revealed, como na referência ---------- */
  var alvos = document.querySelectorAll("[data-reveal]");
  function revelar(el) { el.setAttribute("data-revealed", ""); }
  if (reduce || !("IntersectionObserver" in window)) alvos.forEach(revelar);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { revelar(e.target); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    alvos.forEach(function (el) { io.observe(el); });
    document.addEventListener("focusin", function (e) { var b = e.target.closest("[data-reveal]"); if (b) revelar(b); });
  }
  document.querySelectorAll('[data-reveal="children"] .tech-chip').forEach(function (c, i, all) { c.style.setProperty("--i", Array.prototype.indexOf.call(c.parentNode.children, c)); });

  /* Números dos fatos contam até o valor (o valor final está no HTML) */
  if (!reduce && "IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; nio.unobserve(e.target);
        var el = e.target, fim = +el.dataset.count, t0 = performance.now();
        (function passo(t) { var k = Math.min(1, (t - t0) / 1000); el.textContent = String(Math.round(fim * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf(passo); })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (n) { nio.observe(n); });
  }

  /* ---------- Links internos levam o foco ao título da seção ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var alvo = document.querySelector(a.getAttribute("href")); if (!alvo) return;
      var h = alvo.querySelector("h1, h2"); if (!h) return;
      if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
      setTimeout(function () { h.focus({ preventScroll: true }); }, reduce ? 0 : 450);
    });
  });

  /* ---------- Condutor de rolagem: --p (0..1) só com cena presa na tela ---------- */
  var scrubs = document.querySelectorAll("[data-scrub]"), ativos = new Set(), rodando = false;
  function prog(el) {
    var r = el.getBoundingClientRect();
    if (el.classList.contains("seq")) return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    return Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / Math.max(1, r.height)));
  }
  function passo() {
    if (!ativos.size) { rodando = false; return; }
    ativos.forEach(function (el) {
      var p = prog(el); el.style.setProperty("--p", p.toFixed(4));
      if (el.classList.contains("seq")) {
        var et = Math.min(4, Math.floor(p * 5));
        el.querySelectorAll(".seq-steps li").forEach(function (li, i) { li.classList.toggle("on", i === et); if (i === et) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      } else {
        var cs = el.querySelectorAll(".paper");
        for (var i = 0; i < cs.length; i++) {
          var c = 0; if (cs[i + 1]) { var a = cs[i].getBoundingClientRect(), b = cs[i + 1].getBoundingClientRect(); c = Math.min(1, Math.max(0, 1 - (b.top - a.top) / Math.max(1, a.height))); }
          cs[i].style.setProperty("--cover", c.toFixed(3));
        }
      }
    });
    raf(passo);
  }
  if (!reduce) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) ativos.add(e.target); else ativos.delete(e.target); }); if (!rodando && ativos.size) { rodando = true; raf(passo); } });
    scrubs.forEach(function (el) { sio.observe(el); });
  } else document.querySelectorAll(".seq-steps li").forEach(function (li) { li.classList.add("on"); });

  /* ---------- Carrossel de recomendações: contador "01 / 03", barra, início/fim, sem avanço automático ---------- */
  var trilho = document.getElementById("recommendations-track");
  if (trilho) {
    var cards = trilho.children, prev = document.querySelector("[data-prev]"), next = document.querySelector("[data-next]");
    var pos = document.querySelector("[data-pos]"), barra = document.querySelector("[data-barra]"), anuncio = document.querySelector("[data-anuncio]");
    var passoX = function () { return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : trilho.clientWidth; };
    function atual() { var max = trilho.scrollWidth - trilho.clientWidth; if (max <= 2) return 0; if (trilho.scrollLeft >= max - 2) return cards.length - 1; return Math.round(trilho.scrollLeft / passoX()); }
    function estado(anunciar) {
      var max = trilho.scrollWidth - trilho.clientWidth, i = atual();
      trilho.toggleAttribute("data-at-start", trilho.scrollLeft <= 2); trilho.toggleAttribute("data-at-end", trilho.scrollLeft >= max - 2);
      prev.disabled = trilho.scrollLeft <= 2; next.disabled = trilho.scrollLeft >= max - 2;
      pos.textContent = String(i + 1).padStart(2, "0"); barra.style.width = ((i + 1) / cards.length * 100).toFixed(0) + "%";
      if (anunciar && anuncio) anuncio.textContent = "Recomendação " + (i + 1) + " de " + cards.length;
    }
    function irPara(i) { i = Math.max(0, Math.min(cards.length - 1, i)); trilho.scrollTo({ left: i * passoX(), behavior: reduce ? "auto" : "smooth" }); }
    prev.addEventListener("click", function () { irPara(atual() - 1); });
    next.addEventListener("click", function () { irPara(atual() + 1); });
    var to; trilho.addEventListener("scroll", function () { clearTimeout(to); to = setTimeout(function () { estado(true); }, 120); });
    estado(false);
  }

  /* ---------- Formulário: o protótipo não envia ---------- */
  var form = document.querySelector("form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); form.querySelector("[data-form-nota]").textContent = "Protótipo: nada foi enviado. No site, a mensagem chega à Evelym por e-mail."; });

  /* ---------- Cena 3D solta no Hero ---------- */
  var cena = html.dataset.cena, caixa = document.querySelector(".hero-scene"), canvas = caixa && caixa.querySelector("canvas");
  var DESC = {
    a: "Abaixo da superfície: sob a interface, requisições descem por gateway, serviços, fila e bancos e voltam com a resposta; ao rolar, a câmera desce e um deploy azul-verde troca a camada de serviços.",
    b: "Cluster que se cura: pods recebem tráfego em três nós; ao rolar, um deploy gradual troca os pods, um nó falha e os pods mudam de nó, e a autoescala cria pods para o pico.",
    d: "A Evelym, de cabelo curto, moletom e headphone, programando concentrada no notebook; em volta, um editor com código Python, um terminal rodando os testes e um selo de deploy em produção, que acende ao rolar a página.",
    c: "Porto de deploy: o código vira container e passa pelo portal de testes, e o que falha volta; ao rolar, a balsa leva os containers aprovados até o cluster, onde viram serviços rodando."
  };
  var desc = document.querySelector("[data-cena-desc]"); if (desc) desc.textContent = DESC[cena];
  function poster() { if (caixa && !captura) caixa.style.backgroundImage = "url(posters/" + cena + "-" + html.dataset.roxo + "-" + tema() + ".webp)"; }
  poster(); addEventListener("proto:tema", poster);
  function cores() {
    var cs = getComputedStyle(html), v = function (k) { return cs.getPropertyValue("--" + k).trim(); };
    return { bg: v("bg"), surface: v("surface"), "surface-2": v("surface-2"), border: v("line"), text: v("text"), muted: v("text-3"),
      accent: v("accent-text"), "accent-fill": v("accent"), accent2: v("accent-2-text"), ok: v("ok"), fail: v("danger"), "scene-bg": v("bg"), escuro: html.classList.contains("dark") };
  }
  /* Explicação para quem não é da área: rótulos sobre as peças, legenda fixa e a etapa atual da história */
  var info = (window.CENAS_INFO || {})[cena], rotEls = [], etapaEl = null, etapaAtual = -1;
  function progresso() { return hero ? Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.85))) : 0; }
  if (caixa && info) {
    var camada = document.createElement("div"); camada.className = "rotulos"; camada.setAttribute("aria-hidden", "true");
    info.rotulos.forEach(function (r) {
      var d = document.createElement("div"); d.className = "rotulo fora"; d.dataset.lado = r.lado;
      d.innerHTML = r.t + (r.s ? "<small>" + r.s + "</small>" : ""); camada.appendChild(d); rotEls.push(d);
    });
    var leg = document.createElement("div"); leg.className = "cena-legenda"; leg.setAttribute("aria-hidden", "true"); if (info.card === false) leg.hidden = true;
    leg.innerHTML = '<b data-n="1"></b><span>' + info.legenda + '</span>' + (info.dica === false ? "" : '<span class="dica">Role a página para ver a história</span>');
    caixa.appendChild(camada); caixa.appendChild(leg); etapaEl = leg.querySelector("b");
    window.__etapaCena = null;
    function etapa() {
      var p = progresso(), i = 0; info.etapas.forEach(function (e, k) { if (p >= e[0]) i = k; });
      if (window.__etapaCena !== null && caixa.classList.contains("is-live")) i = window.__etapaCena;
      if (i !== etapaAtual) { etapaAtual = i; etapaEl.textContent = info.etapas[i][1]; etapaEl.dataset.n = String(i + 1); }
    }
    window.__etapaMuda = etapa;
    etapa(); var ep = false; addEventListener("scroll", function () { if (!ep) { ep = true; raf(function () { ep = false; etapa(); }); } }, { passive: true });
    /* Sem a cena ao vivo, os rótulos ficam onde a imagem estática foi gerada (posters/rotulos.js) */
    var fixos = (window.ROTULOS_ESTATICOS || {})[cena];
    window.__rotulosFixos = function () {
      if (!fixos) return; var r = caixa.getBoundingClientRect();
      rotEls.forEach(function (d, i) { var f = fixos[i]; if (!f) return; posicionar(d, f[0] * r.width, f[1] * r.height, r); });
    };
    window.__rotulosFixos(); new ResizeObserver(function () { if (!caixa.classList.contains("is-live")) window.__rotulosFixos(); }).observe(caixa);
  }
  function posicionar(d, x, y, r) {
    var fora = x < 0 || y < 0 || x > r.width || y > r.height; d.classList.toggle("fora", fora);
    d.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(" + (d.dataset.lado === "esq" ? "calc(-100% - 14px)" : "14px") + ",-50%)";
  }
  function temGL() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }
  function motivo() {
    if (html.dataset.nowebgl === "1") return "webgl";
    if (reduce) return "movimento";
    var con = navigator.connection; if (con && con.saveData) return "dados";
    if (!captura && navigator.deviceMemory && navigator.deviceMemory <= 4 && (navigator.hardwareConcurrency || 8) <= 4) return "aparelho";
    if (!temGL()) return "webgl";
    return "";
  }
  function iniciar() {
    if (!caixa || motivo() || !window.CENAS || !window.CENAS[cena]) { if (caixa) caixa.dataset.estatico = motivo() || "sem-cena"; return; }
    Promise.all([import("three"), import("three/addons/environments/RoomEnvironment.js"), import("three/addons/geometries/RoundedBoxGeometry.js")]).then(function (m) {
      var THREE = m[0], lib = { THREE: THREE, RoomEnvironment: m[1].RoomEnvironment, RoundedBoxGeometry: m[2].RoundedBoxGeometry };
      var dpr = Math.min(devicePixelRatio || 1, matchMedia("(pointer: coarse)").matches ? 1.5 : 2);
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: captura });
      renderer.setPixelRatio(captura ? 1 : dpr); renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
      var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new lib.RoomEnvironment(), 0.04).texture; pm.dispose();
      scene.fog = new THREE.Fog(0x000000, 16, 38);
      var api = window.CENAS[cena](lib, { scene: scene, camera: camera, renderer: renderer });
      function tingir() { var c = cores(); scene.fog.color.set(c.bg); api.colors(c); }
      tingir(); addEventListener("proto:tema", tingir);
      function tam() { var r = caixa.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
      tam(); new ResizeObserver(tam).observe(caixa);
      canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); caixa.classList.remove("is-live"); poster(); if (window.__rotulosFixos) window.__rotulosFixos(); });
      var ptr = { x: 0, y: 0 };
      if (interativo && hero) hero.addEventListener("pointermove", function (e) { var r = caixa.getBoundingClientRect(); ptr.x = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5)); ptr.y = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5)); });
      function p() { return progresso(); }
      var pv = new THREE.Vector3();
      function rotular() {
        if (!api.rotulos || !rotEls.length) return; var r = caixa.getBoundingClientRect();
        for (var i = 0; i < rotEls.length; i++) { if (!api.rotulos[i]) continue; pv.copy(api.rotulos[i]).project(camera); posicionar(rotEls[i], (pv.x * 0.5 + 0.5) * r.width, (-pv.y * 0.5 + 0.5) * r.height, r); }
      }
      function fracoes() { var r = caixa.getBoundingClientRect(); return (api.rotulos || []).map(function (v) { pv.copy(v).project(camera); return [+(pv.x * 0.5 + 0.5).toFixed(4), +(-pv.y * 0.5 + 0.5).toFixed(4)]; }); }
      if (captura) { for (var i = 0; i < 240; i++) api.update(1 / 60, i / 60, 0, ptr); renderer.render(scene, camera); caixa.classList.add("is-live"); window.__rotulos = fracoes(); window.__cenaPronta = true; return; }
      var visivel = true, rod = false, ult = 0, t = 0, am = [], rebaixou = false;
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; laco(); }).observe(caixa);
      document.addEventListener("visibilitychange", laco);
      function quadro(agora) {
        if (!visivel || document.hidden || !caixa.classList.contains("is-live")) { rod = false; return; }
        var dt = Math.min(0.05, (agora - (ult || agora)) / 1000); ult = agora; t += dt;
        api.update(dt, t, p(), ptr); renderer.render(scene, camera); rotular();
        if (typeof api.etapa === "number" && api.etapa !== window.__etapaCena) { window.__etapaCena = api.etapa; if (window.__etapaMuda) window.__etapaMuda(); }
        if (dt > 0) { am.push(dt); if (am.length > 180) am.shift(); }
        if (am.length === 180 && am.reduce(function (a, b) { return a + b; }) / 180 > 1 / 30) {
          if (!rebaixou) { rebaixou = true; renderer.setPixelRatio(1); am = []; } else { caixa.classList.remove("is-live"); caixa.dataset.estatico = "lento"; if (window.__rotulosFixos) window.__rotulosFixos(); rod = false; return; }
        }
        raf(quadro);
      }
      function laco() { if (!rod && visivel && !document.hidden && caixa.classList.contains("is-live")) { rod = true; ult = 0; raf(quadro); } }
      api.update(0, 0, p(), ptr); renderer.render(scene, camera); rotular();
      raf(function () { caixa.classList.add("is-live"); laco(); });
    }).catch(function (e) { console.error(e); caixa.dataset.estatico = "falha"; });
  }
  if (captura) iniciar();
  else if (document.readyState === "complete") agendar(); else addEventListener("load", agendar);
  function agendar() { (window.requestIdleCallback || setTimeout)(iniciar, { timeout: 1500 }); }
})();

/* Protótipo de identidade visual — comportamento comum.
   Direção, tema, "sem WebGL" e "movimento reduzido" vêm da URL (?d=1&tema=claro&webgl=0&mov=0)
   e são aplicados antes da pintura pelo script inline do <head>. */
(function () {
  var html = document.documentElement;
  var params = new URLSearchParams(location.search);
  var dir = html.dataset.dir;

  function go(changes) {
    Object.keys(changes).forEach(function (k) {
      if (changes[k] === null) params.delete(k); else params.set(k, changes[k]);
    });
    location.search = params.toString();
  }

  /* ---------- Tema: troca ao vivo, sem recarregar ---------- */
  function setTheme(t) {
    html.dataset.theme = t;
    params.set("tema", t);
    history.replaceState(null, "", "?" + params.toString());
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.themeBtn === t));
    });
    var tg = document.querySelector("[data-theme-toggle]");
    if (tg) tg.setAttribute("aria-label", t === "escuro" ? "Mudar para o tema claro" : "Mudar para o tema escuro");
    window.dispatchEvent(new Event("proto:theme"));
  }
  document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.dataset.themeBtn); });
  });
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) toggle.addEventListener("click", function () { setTheme(html.dataset.theme === "escuro" ? "claro" : "escuro"); });
  setTheme(html.dataset.theme);

  /* ---------- Barra do protótipo ---------- */
  document.querySelectorAll("[data-go-dir]").forEach(function (a) {
    var d = a.dataset.goDir;
    if (d === dir) a.setAttribute("aria-current", "page");
    a.addEventListener("click", function (e) { e.preventDefault(); go({ d: d, tema: null }); });
  });
  var webglOff = html.dataset.nowebgl === "1";
  var reduceOff = html.dataset.reduce === "1";
  var bw = document.querySelector("[data-toggle-webgl]");
  var bm = document.querySelector("[data-toggle-motion]");
  if (bw) { bw.setAttribute("aria-pressed", String(webglOff)); bw.addEventListener("click", function () { go({ webgl: webglOff ? null : "0" }); }); }
  if (bm) { bm.setAttribute("aria-pressed", String(reduceOff)); bm.addEventListener("click", function () { go({ mov: reduceOff ? null : "0" }); }); }

  /* ---------- Revelar ao rolar ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceOff) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0.01 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Formulário: protótipo não envia nada ---------- */
  var form = document.querySelector("form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var note = form.querySelector(".form-note");
    if (note) note.textContent = "Protótipo: nada foi enviado. No site, a mensagem chega à Evelym por e-mail.";
  });

  /* ---------- Cena 3D: carregada depois do load, só com WebGL e sem movimento reduzido ---------- */
  var visual = document.querySelector(".visual");
  var canvas = visual && visual.querySelector("canvas");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function hasWebGL() {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  function why() {
    if (webglOff) return "Sem WebGL (simulado): imagem estática no lugar da cena 3D.";
    if (reduceOff || motionQuery.matches) return "Movimento reduzido: imagem estática no lugar da cena 3D.";
    if (!hasWebGL()) return "Este navegador não tem WebGL: imagem estática no lugar da cena 3D.";
    return "";
  }

  function readColors() {
    var cs = getComputedStyle(html);
    var keys = ["bg", "surface", "border", "text", "muted", "accent", "accent-fill", "ok", "fail", "block", "on-block"];
    var out = {};
    keys.forEach(function (k) { out[k] = cs.getPropertyValue("--" + k).trim(); });
    out.theme = html.dataset.theme;
    return out;
  }

  function start() {
    var reason = why();
    var cap = visual && visual.querySelector("figcaption [data-scene-state]");
    if (reason) { if (cap) cap.textContent = reason; return; }
    if (!canvas || !window.CENAS || !window.CENAS[dir]) return;
    import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js").then(function (THREE) {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
      var api = window.CENAS[dir](THREE, { scene: scene, camera: camera, renderer: renderer });
      api.colors(readColors());
      window.addEventListener("proto:theme", function () { api.colors(readColors()); });

      function resize() {
        var r = visual.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(r.height, 1);
        camera.updateProjectionMatrix();
      }
      resize();
      new ResizeObserver(resize).observe(visual);

      var visible = true, running = false, last = 0, t = 0;
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; loop(); }).observe(visual);
      document.addEventListener("visibilitychange", loop);
      function progress() {
        var max = document.documentElement.scrollHeight - innerHeight;
        return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      }
      function frame(now) {
        if (!visible || document.hidden) { running = false; return; }
        var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; t += dt;
        api.update(dt, t, progress());
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
      }
      function loop() { if (!running && visible && !document.hidden) { running = true; last = 0; requestAnimationFrame(frame); } }
      loop();
      requestAnimationFrame(function () { visual.classList.add("is-live"); if (cap) cap.textContent = ""; });
    }).catch(function () { if (cap) cap.textContent = "A cena 3D não carregou (sem internet?): imagem estática."; });
  }

  if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule);
  function schedule() { (window.requestIdleCallback || setTimeout)(start, { timeout: 1200 }); }
})();

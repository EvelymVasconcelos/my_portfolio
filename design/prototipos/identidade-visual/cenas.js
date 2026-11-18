/* Protótipo de identidade visual — as três cenas 3D (Three.js, geometria procedural).
   Cada cena recebe (THREE, {scene, camera, renderer}) e devolve {update(dt, t, p), colors(c)}.
   p = progresso da rolagem da página (0 a 1). Nada é alocado dentro do update. */
window.CENAS = {};

function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

/* ---------- 1. Fluxo de requisições: a requisição atravessa o sistema; um serviço cai e o tráfego desvia ---------- */
window.CENAS["1"] = function (THREE, k) {
  var root = new THREE.Group(); k.scene.add(root);
  var P = [
    [-5, 0, 0], [-2.6, 0, 0], [-2.6, 1.9, -1], [0.2, 1.2, 0.6], [0.2, -1.2, -0.6],
    [2.5, 0.3, -1.3], [4.2, 1.1, 0], [4.2, -1.3, 0.7], [2.3, -2.3, 0.9]
  ]; // cliente, gateway, auth, serviço A, serviço B, fila, worker, PostgreSQL, Redis
  var V = P.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); });
  var E = [[0,1],[1,2],[1,3],[1,4],[3,7],[4,7],[3,8],[4,8],[3,5],[4,5],[5,6],[6,7]];
  var ROUTES = [[0,1,3,7],[0,1,4,7],[0,1,3,8],[0,1,4,8],[0,1,3,5,6,7],[0,1,4,5,6,7],[0,1,2]];
  var SAFE = ROUTES.filter(function (r) { return r.indexOf(3) < 0; });

  var boxGeo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
  var edgeGeo = new THREE.EdgesGeometry(boxGeo);
  var fill = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 });
  var edge = new THREE.LineBasicMaterial();
  var failFill = new THREE.MeshBasicMaterial();
  var nodes = V.map(function (v, i) {
    var m = new THREE.Mesh(boxGeo, fill); m.position.copy(v);
    var l = new THREE.LineSegments(edgeGeo, edge); m.add(l);
    if (i === 0) m.scale.setScalar(0.7);
    if (i === 7 || i === 8) m.scale.set(1, 1.35, 1);
    root.add(m); return m;
  });

  var lineArr = new Float32Array(E.length * 6);
  E.forEach(function (e, i) { V[e[0]].toArray(lineArr, i * 6); V[e[1]].toArray(lineArr, i * 6 + 3); });
  var lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute("position", new THREE.BufferAttribute(lineArr, 3));
  var wire = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 });
  root.add(new THREE.LineSegments(lineGeo, wire));

  var dotGeo = new THREE.SphereGeometry(0.09, 10, 10);
  var dotMat = new THREE.MeshBasicMaterial();
  var pulses = [];
  for (var i = 0; i < 34; i++) {
    var m = new THREE.Mesh(dotGeo, dotMat); root.add(m);
    pulses.push({ m: m, r: ROUTES[i % ROUTES.length], s: 0, f: (i * 0.37) % 1, v: 1.4 + (i % 5) * 0.25 });
  }
  var c = {};
  return {
    colors: function (cl) {
      c = cl;
      fill.color.set(cl.surface); edge.color.set(cl.accent); wire.color.set(cl.muted);
      dotMat.color.set(cl.accent); failFill.color.set(cl.fail);
    },
    update: function (dt, t, p) {
      var down = p > 0.28 && p < 0.62; // durante "Projetos" e "Experiência" o serviço A cai
      nodes[3].material = down ? failFill : fill;
      nodes[3].scale.setScalar(down ? 0.8 + Math.sin(t * 8) * 0.05 : 1);
      for (var i = 0; i < pulses.length; i++) {
        var q = pulses[i];
        var len = V[q.r[q.s]].distanceTo(V[q.r[q.s + 1]]);
        q.f += (q.v * dt) / len;
        if (q.f >= 1) {
          q.f = 0; q.s++;
          if (q.s >= q.r.length - 1) { q.s = 0; var pool = down ? SAFE : ROUTES; q.r = pool[(i + Math.floor(t * 3)) % pool.length]; }
          else if (down && q.r[q.s + 1] === 3) { q.r = SAFE[i % SAFE.length]; q.s = 1; }
        }
        q.m.position.lerpVectors(V[q.r[q.s]], V[q.r[q.s + 1]], q.f);
      }
      var a = -0.5 + p * 1.1 + Math.sin(t * 0.25) * 0.06;
      k.camera.position.set(Math.sin(a) * 14.5 - 0.3, 3.4 - p * 2, Math.cos(a) * 14.5);
      k.camera.lookAt(-0.3, -0.1, 0);
    }
  };
};

/* ---------- 2. Pipeline de qualidade: cada commit passa por build, testes, E2E e deploy ---------- */
window.CENAS["2"] = function (THREE, k) {
  var root = new THREE.Group(); k.scene.add(root);
  var belt = new THREE.Mesh(new THREE.BoxGeometry(20, 0.06, 1.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.18 }));
  belt.position.y = -0.55; root.add(belt);
  var GATES = [-4.5, -1.5, 1.5, 4.5]; // build, testes, E2E, deploy
  var gateGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.16, 1.7, 1.7));
  var gateMat = new THREE.LineBasicMaterial();
  GATES.forEach(function (x) { var g = new THREE.LineSegments(gateGeo, gateMat); g.position.set(x, 0.25, 0); root.add(g); });

  var cubeGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
  var cubeEdge = new THREE.EdgesGeometry(cubeGeo);
  var mats = { wait: new THREE.MeshBasicMaterial(), pass: new THREE.MeshBasicMaterial(), fail: new THREE.MeshBasicMaterial(), done: new THREE.MeshBasicMaterial() };
  var edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });
  var N = 16, SPAN = 18, commits = [];
  for (var i = 0; i < N; i++) {
    var m = new THREE.Mesh(cubeGeo, mats.wait); m.add(new THREE.LineSegments(cubeEdge, edgeMat)); root.add(m);
    commits.push({ m: m, x: -9 + (i * SPAN) / N, bad: i % 6 === 4, y: -0.31 });
  }
  return {
    colors: function (cl) {
      var lightOnDark = cl.theme === "claro"; // no tema claro a cena fica sobre o bloco preto
      var acc = lightOnDark ? "#c4b5fd" : cl.accent;
      belt.material.color.set(cl["on-block"]); gateMat.color.set(acc); edgeMat.color.set(cl["on-block"]);
      mats.wait.color.set(lightOnDark ? "#3a3a44" : cl.border); mats.pass.color.set(acc);
      mats.fail.color.set("#f87171"); mats.done.color.set("#4ade80");
    },
    update: function (dt, t, p) {
      for (var i = 0; i < N; i++) {
        var q = commits[i];
        q.x += dt * 1.15;
        if (q.x > 9) { q.x -= SPAN; q.y = -0.31; }
        var stage = 0; for (var g = 0; g < GATES.length; g++) if (q.x > GATES[g]) stage = g + 1;
        var failed = q.bad && stage >= 3; // a falha aparece no E2E, antes do deploy
        q.m.material = failed ? mats.fail : stage === 0 ? mats.wait : stage === 4 ? mats.done : mats.pass;
        if (failed) q.y -= dt * 2.2;
        q.m.position.set(q.x, Math.max(q.y, -4), failed ? 0.35 : 0);
        q.m.rotation.y = failed ? q.m.rotation.y + dt * 3 : 0;
      }
      var cx = -4.5 + p * 9;
      k.camera.position.set(cx + 2.4, 2.6, 8.4);
      k.camera.lookAt(cx + 0.4, -0.2, 0);
      root.rotation.y = Math.sin(t * 0.2) * 0.03;
    }
  };
};

/* ---------- 3. Esquema vivo: tabelas se montam e as relações levam dados de uma para outra ---------- */
window.CENAS["3"] = function (THREE, k) {
  var root = new THREE.Group(); k.scene.add(root);
  var A = [[-3.3, 1.7, 0], [0, 2.1, -0.8], [3.3, 1.5, 0.2], [-3.1, -1.6, 0.4], [0.2, -1.3, 0], [3.4, -1.9, -0.6]];
  var B = [[-2.2, 0.9, 1], [0, 0.2, -1.6], [2.2, 0.9, 1], [-2.6, -2.1, -0.4], [0, -2.4, 1.2], [2.6, -2.1, -0.4]];
  var ROWS = [4, 5, 3, 4, 6, 3];
  var headGeo = new THREE.BoxGeometry(2, 0.38, 0.14), rowGeo = new THREE.BoxGeometry(2, 0.22, 0.08);
  var headMat = new THREE.MeshBasicMaterial(), rowMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85 });
  var rowEdge = new THREE.EdgesGeometry(rowGeo), edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 });
  var tables = A.map(function (a, i) {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(headGeo, headMat));
    for (var r = 0; r < ROWS[i]; r++) {
      var row = new THREE.Mesh(rowGeo, rowMat); row.position.y = -0.36 - r * 0.28;
      row.add(new THREE.LineSegments(rowEdge, edgeMat)); g.add(row);
    }
    root.add(g);
    var s = Math.sin(i * 12.9898) * 43758.5453; s = s - Math.floor(s);
    return { g: g, start: new THREE.Vector3((s - 0.5) * 14, (s * 7 % 1 - 0.5) * 10, -6 - s * 6), rot: (s - 0.5) * 3, a: new THREE.Vector3(), b: new THREE.Vector3(), tmp: new THREE.Vector3() };
  });
  tables.forEach(function (tb, i) { tb.a.fromArray(A[i]); tb.b.fromArray(B[i]); });

  var REL = [[0, 1], [1, 2], [0, 3], [1, 4], [4, 5], [2, 5]], SEG = 24;
  var relMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 });
  var rels = REL.map(function () {
    var arr = new Float32Array((SEG + 1) * 3), geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    var line = new THREE.Line(geo, relMat); line.frustumCulled = false; root.add(line); return { arr: arr, geo: geo };
  });
  var dotGeo = new THREE.SphereGeometry(0.08, 10, 10), dotMat = new THREE.MeshBasicMaterial();
  var dots = REL.map(function (r, i) { var m = new THREE.Mesh(dotGeo, dotMat); root.add(m); return { m: m, f: i / REL.length }; });
  var p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), mid = new THREE.Vector3();
  function bez(out, a, m, b, t) { var u = 1 - t; out.set(u*u*a.x + 2*u*t*m.x + t*t*b.x, u*u*a.y + 2*u*t*m.y + t*t*b.y, u*u*a.z + 2*u*t*m.z + t*t*b.z); }

  return {
    colors: function (cl) {
      headMat.color.set(cl["accent-fill"]); rowMat.color.set(cl.surface); edgeMat.color.set(cl.border);
      relMat.color.set(cl.accent); dotMat.color.set(cl.accent);
    },
    update: function (dt, t, p) {
      var intro = smooth(0, 2.4, t), shift = smooth(0.3, 0.65, p);
      tables.forEach(function (tb, i) {
        tb.tmp.lerpVectors(tb.a, tb.b, shift);
        tb.g.position.lerpVectors(tb.start, tb.tmp, intro);
        tb.g.position.y += Math.sin(t * 0.8 + i) * 0.06;
        tb.g.rotation.set(0, tb.rot * (1 - intro) + Math.sin(t * 0.3 + i) * 0.08, tb.rot * 0.4 * (1 - intro));
      });
      REL.forEach(function (r, i) {
        p0.copy(tables[r[0]].g.position); p1.copy(tables[r[1]].g.position);
        p0.y -= 0.2; p1.y += 0.15;
        mid.addVectors(p0, p1).multiplyScalar(0.5); mid.z += 1.4;
        var arr = rels[i].arr;
        for (var s = 0; s <= SEG; s++) { bez(dots[i].m.position, p0, mid, p1, s / SEG); dots[i].m.position.toArray(arr, s * 3); }
        rels[i].geo.attributes.position.needsUpdate = true;
        dots[i].f = (dots[i].f + dt * 0.35) % 1;
        bez(dots[i].m.position, p0, mid, p1, dots[i].f);
        dots[i].m.visible = intro > 0.95;
      });
      root.rotation.y = -0.25 + p * 0.5;
      k.camera.position.set(0, 0.2, 16 - shift * 1.5);
      k.camera.lookAt(0, 0, 0);
    }
  };
};

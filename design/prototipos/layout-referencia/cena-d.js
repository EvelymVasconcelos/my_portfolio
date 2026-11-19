/* Cena D: Evelym programando. Personagem original, montada só com geometria procedural (sem modelo externo), com
   materiais realistas: pele e tecido com sheen, cabelo com brilho e textura de fios, notebook de alumínio, caneca de
   cerâmica, mesa de madeira, sombras suaves de uma luz principal e a tela iluminando o rosto. A história roda sozinha,
   devagar (24 s): ela digita o código, os testes passam e a versão vai para a produção; depois recomeça.
   Fora o redesenho dos painéis quando o texto muda, nada é alocado dentro do update. */
window.CENAS = window.CENAS || {};
window.CENAS_INFO = window.CENAS_INFO || {};
window.CENAS_INFO.d = {
  card: false,
  legenda: "Quando o código fica pronto, os testes automáticos rodam e, se tudo passar, a versão nova vai para a produção.",
  etapas: [[0, "Escrevendo o código de uma API em Python"], [0.33, "Rodando os testes automáticos"], [0.66, "Tudo passou: deploy em produção"]],
  rotulos: []
};

window.CENAS.d = function (lib, k) {
  var THREE = lib.THREE, RB = lib.RoundedBoxGeometry, PI = Math.PI, root = new THREE.Group(); k.scene.add(root);
  k.renderer.shadowMap.enabled = true; k.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---------- texturas procedurais (canvas): fios de cabelo, trama do moletom, veios da madeira, teclado ----------
  function tex(w, h, desenha, rep) { var c = document.createElement("canvas"); c.width = w; c.height = h; desenha(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
  var rnd = (function () { var s = 11; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  var fios = tex(256, 256, function (g, w, h) { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (var i = 0; i < 520; i++) { var x = rnd() * w; g.strokeStyle = "rgba(" + (rnd() < 0.5 ? "40,40,40" : "200,200,200") + ",0.35)"; g.lineWidth = 0.6 + rnd(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.7, x + 3, h); g.stroke(); } }, [3, 1]);
  var trama = tex(128, 128, function (g, w, h) { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 3) { g.fillStyle = "rgba(0,0,0,0.10)"; g.fillRect(0, y, w, 1); } for (var x = 0; x < w; x += 3) { g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(x, 0, 1, h); } }, [6, 6]);
  var madeira = tex(512, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#a77a55"); gr.addColorStop(1, "#946a48"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) { var y = rnd() * h; g.strokeStyle = "rgba(70,40,20," + (0.08 + rnd() * 0.12) + ")"; g.lineWidth = 0.5 + rnd() * 1.5; g.beginPath(); g.moveTo(0, y); for (var x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3); g.stroke(); } }, [1, 1]);
  var teclado = tex(512, 192, function (g, w, h) { g.fillStyle = "#1b1a20"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c2b33";
    for (var r = 0; r < 5; r++) for (var c = 0; c < 14; c++) { g.beginPath(); g.roundRect(8 + c * 35.5, 10 + r * 35, 30, 29, 5); g.fill(); } });

  // ---------- materiais ----------
  var P = function (o) { return new THREE.MeshPhysicalMaterial(o); };
  var mPele = P({ color: 0xc4875f, roughness: 0.5, sheen: 0.4, sheenColor: 0xffcfa8, sheenRoughness: 0.55 });
  var mLabio = P({ color: 0x9b5552, roughness: 0.55, clearcoat: 0.08 }), mLinha = new THREE.MeshStandardMaterial({ color: 0x6e3433, roughness: 0.6 });
  var mCabelo = P({ color: 0x15100e, roughness: 0.4, sheen: 1, sheenRoughness: 0.32, sheenColor: 0x6b5852, bumpMap: fios, bumpScale: 0.6, side: THREE.DoubleSide });
  var mSobrancelha = new THREE.MeshStandardMaterial({ color: 0x1c1210, roughness: 0.8 });
  var mEsclera = P({ color: 0xf5f0ec, roughness: 0.15, clearcoat: 1 }), mIris = P({ color: 0x2c1a10, roughness: 0.18, clearcoat: 1 }), mPupila = new THREE.MeshBasicMaterial({ color: 0x0b0707 });
  var mBrilho = new THREE.MeshBasicMaterial({ color: 0xffffff }), mCilio = new THREE.MeshStandardMaterial({ color: 0x120b0d, roughness: 0.6 });
  var mBochecha = new THREE.MeshBasicMaterial({ color: 0xd9705f, transparent: true, opacity: 0.12, depthWrite: false });
  var mMoletom = P({ roughness: 0.92, sheen: 0.45, sheenRoughness: 0.8, sheenColor: 0xe9dcff, bumpMap: trama, bumpScale: 0.35 });
  var mCordao = P({ color: 0xf4f2f7, roughness: 0.7 }), mPonteira = P({ color: 0xd9d6de, metalness: 1, roughness: 0.25 });
  var mAluminio = P({ metalness: 0.85, roughness: 0.3, clearcoat: 0.4 }), mTeclado = new THREE.MeshStandardMaterial({ map: teclado, roughness: 0.7 });
  var mTela = new THREE.MeshBasicMaterial({ toneMapped: false }), mMoldura = P({ color: 0x0d0c10, roughness: 0.15, clearcoat: 1 });
  var mFone = P({ color: 0x26222f, roughness: 0.45, clearcoat: 0.5 }), mAlmofada = P({ color: 0x1b1820, roughness: 0.95, sheen: 0.5, sheenColor: 0x5a5070 });
  var mMetal = P({ color: 0xc9c6d0, metalness: 1, roughness: 0.2 }), mLed = new THREE.MeshBasicMaterial({ toneMapped: false });
  var mMesa = P({ map: madeira, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  var mCeramica = P({ roughness: 0.18, clearcoat: 1 }), mCafe = P({ color: 0x3a2116, roughness: 0.1, clearcoat: 1 });
  var mVaso = P({ roughness: 0.6 }), mFolha = P({ color: 0x4f9a6e, roughness: 0.45, sheen: 0.4, sheenColor: 0xc8ffd8, side: THREE.DoubleSide });
  function malha(geo, mat, pai, sombra) { var m = new THREE.Mesh(geo, mat); m.castShadow = sombra !== false; m.receiveShadow = true; (pai || root).add(m); return m; }

  // ---------- luzes: principal com sombra suave, preenchimento, recorte roxo e a tela iluminando o rosto ----------
  var hemi = new THREE.HemisphereLight(0xffffff, 0x2a2235, 0.55); root.add(hemi);
  var sol = new THREE.DirectionalLight(0xfff3ea, 2.6); sol.position.set(-2.4, 3.6, 1.6); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); sol.shadow.camera.left = -1.8; sol.shadow.camera.right = 1.8; sol.shadow.camera.top = 2; sol.shadow.camera.bottom = -1.4;
  sol.shadow.camera.near = 1; sol.shadow.camera.far = 10; sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.02; root.add(sol);
  var recorte = new THREE.DirectionalLight(0xffffff, 1.8); recorte.position.set(-3, 2.5, -3.5); root.add(recorte);
  var luzTela = new THREE.PointLight(0xffffff, 1.4, 1.8, 2); luzTela.position.set(0, 0.45, -0.32); root.add(luzTela);

  // ---------- mesa, notebook, caneca e planta ----------
  var mesa = malha(new RB(2.15, 0.08, 1.3, 4, 0.03), mMesa, root, false); mesa.position.set(0, -0.04, -0.12);
  var base = malha(new RB(0.98, 0.032, 0.64, 4, 0.014), mAluminio); base.position.set(0, 0.016, -0.2);
  var tec = malha(new THREE.PlaneGeometry(0.84, 0.3), mTeclado, root, false); tec.rotation.x = -PI / 2; tec.position.set(0, 0.0335, -0.06);
  var track = malha(new RB(0.3, 0.004, 0.17, 2, 0.002), P({ color: 0xb9b5c2, metalness: 0.6, roughness: 0.35 }), root, false); track.position.set(0, 0.033, -0.37);
  var tampa = new THREE.Group(); tampa.position.set(0, 0.032, 0.115); tampa.rotation.x = 0.3; root.add(tampa);
  var lid = malha(new RB(0.98, 0.64, 0.022, 4, 0.012), mAluminio, tampa); lid.position.y = 0.32;
  var moldura = malha(new THREE.PlaneGeometry(0.95, 0.61), mMoldura, tampa, false); moldura.position.set(0, 0.32, -0.0115); moldura.rotation.y = PI;
  var telaM = malha(new THREE.PlaneGeometry(0.88, 0.54), mTela, tampa, false); telaM.position.set(0, 0.33, -0.0122); telaM.rotation.y = PI;
  var logo = malha(new THREE.CircleGeometry(0.04, 32), mLed, tampa, false); logo.position.set(0, 0.36, 0.0115);
  var perfilCaneca = [new THREE.Vector2(0, 0), new THREE.Vector2(0.075, 0), new THREE.Vector2(0.085, 0.01), new THREE.Vector2(0.088, 0.17), new THREE.Vector2(0.08, 0.175), new THREE.Vector2(0.078, 0.02)];
  var caneca = malha(new THREE.LatheGeometry(perfilCaneca, 40), mCeramica); caneca.position.set(0.74, 0, -0.18);
  var cafe = malha(new THREE.CircleGeometry(0.077, 32), mCafe, root, false); cafe.rotation.x = -PI / 2; cafe.position.set(0.74, 0.15, -0.18);
  var alca = malha(new THREE.TorusGeometry(0.05, 0.013, 12, 28, PI * 1.25), mCeramica); alca.position.set(0.835, 0.09, -0.18); alca.rotation.z = -PI * 0.62;
  var vapor = [0, 1, 2].map(function () { var m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); root.add(m); return m; });
  var perfilVaso = [new THREE.Vector2(0, 0), new THREE.Vector2(0.07, 0), new THREE.Vector2(0.095, 0.15), new THREE.Vector2(0.088, 0.155), new THREE.Vector2(0.08, 0.14)];
  var vaso = malha(new THREE.LatheGeometry(perfilVaso, 32), mVaso); vaso.position.set(-0.8, 0, 0.1);
  for (var f = 0; f < 7; f++) { var a = f / 7 * PI * 2, folha = malha(new THREE.SphereGeometry(0.06, 16, 12), mFolha); folha.scale.set(0.45, 1.7, 0.18); folha.position.set(-0.8 + Math.cos(a) * 0.03, 0.22 + (f % 3) * 0.02, 0.1 + Math.sin(a) * 0.03); folha.rotation.set(Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5); }

  // ---------- corpo: moletom com capuz, cordões com ponteira de metal ----------
  var Z = -0.95;
  var perfilTronco = [new THREE.Vector2(0.33, -0.3), new THREE.Vector2(0.36, -0.05), new THREE.Vector2(0.37, 0.22), new THREE.Vector2(0.355, 0.42), new THREE.Vector2(0.3, 0.54), new THREE.Vector2(0.17, 0.62), new THREE.Vector2(0.1, 0.64)];
  var tronco = malha(new THREE.LatheGeometry(perfilTronco, 48), mMoletom); tronco.position.set(0, 0.02, Z); tronco.scale.set(1.12, 1, 0.74);
  var capuz = malha(new THREE.TorusGeometry(0.17, 0.07, 18, 44), mMoletom); capuz.position.set(0, 0.64, Z - 0.05); capuz.rotation.x = 1.25; capuz.scale.set(1.3, 1, 1);
  var capuzCosta = malha(new THREE.SphereGeometry(0.2, 32, 24, 0, PI * 2, 0, PI / 2), mMoletom); capuzCosta.position.set(0, 0.6, Z - 0.2); capuzCosta.rotation.x = -1.9; capuzCosta.scale.set(1.15, 0.7, 0.85);
  [-0.055, 0.055].forEach(function (x) {
    var c = malha(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8), mCordao); c.position.set(x, 0.5, Z + 0.255); c.rotation.x = -0.12;
    var pt = malha(new THREE.CylinderGeometry(0.01, 0.009, 0.03, 10), mPonteira); pt.position.set(x, 0.39, Z + 0.268);
  });
  var pescoco = malha(new THREE.CylinderGeometry(0.075, 0.085, 0.2, 24), mPele); pescoco.position.set(0, 0.72, Z + 0.02);

  // ---------- braços, punhos e mãos com dedos que digitam ----------
  var UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), meio = new THREE.Vector3();
  function liga(m, a, b, r) { dir.subVectors(b, a); var L = dir.length(); meio.addVectors(a, b).multiplyScalar(0.5); m.position.copy(meio); m.quaternion.setFromUnitVectors(UP, dir.normalize()); m.scale.set(1, Math.max(0.01, L - 2 * r), 1); }
  var lados = [-1, 1].map(function (s) {
    var mao = new THREE.Group(); root.add(mao);
    malha(new THREE.SphereGeometry(0.05, 20, 14), mPele, mao).scale.set(1, 0.45, 1.15);
    var dedos = [0, 1, 2, 3].map(function (i) { var d = new THREE.Group(); d.position.set((-0.03 + i * 0.02) * s * -1, -0.008, 0.045); mao.add(d);
      var g = malha(new THREE.CapsuleGeometry(0.0095, 0.04 - Math.abs(i - 1.5) * 0.006, 4, 10), mPele, d); g.rotation.x = PI / 2 + 0.5; g.position.set(0, -0.012, 0.022); return d; });
    var pol = malha(new THREE.CapsuleGeometry(0.011, 0.032, 4, 10), mPele, mao); pol.position.set(0.045 * s * -1, -0.01, 0.02); pol.rotation.set(PI / 2, 0, 0.7 * s);
    var punho = malha(new THREE.TorusGeometry(0.055, 0.018, 12, 28), mMoletom);
    return { s: s, ombro: new THREE.Vector3(0.35 * s, 0.5, Z), cotovelo: new THREE.Vector3(0.42 * s, 0.15, Z + 0.38), pulso: new THREE.Vector3(0.17 * s, 0.075, -0.4), base: new THREE.Vector3(0.17 * s, 0.075, -0.4),
             braco: malha(new THREE.CapsuleGeometry(0.085, 1, 8, 20), mMoletom), antebraco: malha(new THREE.CapsuleGeometry(0.072, 1, 8, 20), mMoletom), mao: mao, dedos: dedos, punho: punho };
  });

  // ---------- cabeça: rosto a partir das fotos da Evelym (pele dourada, olhos amendoados com gatinho, sorriso leve) ----------
  var cabeca = new THREE.Group(); cabeca.position.set(0, 1.0, Z + 0.06); cabeca.rotation.x = 0.15; root.add(cabeca);
  var cranio = malha(new THREE.SphereGeometry(0.25, 56, 40), mPele, cabeca); cranio.scale.set(0.9, 1.04, 0.95);
  var queixo = malha(new THREE.SphereGeometry(0.135, 40, 28), mPele, cabeca); queixo.position.set(0, -0.135, 0.075); queixo.scale.set(0.95, 0.86, 0.95);
  [-1, 1].forEach(function (s) {
    var o = malha(new THREE.SphereGeometry(0.04, 16, 12), mPele, cabeca); o.position.set(0.222 * s, -0.02, 0.0); o.scale.set(0.4, 1, 0.75);
  });
  function traco(pts, r, mat, pai) { var c = new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(q[0], q[1], q[2] || 0); })); return malha(new THREE.TubeGeometry(c, 24, r, 6, false), mat, pai, false); }
  var rubor = new THREE.MeshBasicMaterial({ map: tex(64, 64, function (g, w, h) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(214,110,96,0.55)"); gr.addColorStop(1, "rgba(214,110,96,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false });
  var olhos = [-1, 1].map(function (s) {
    var g = new THREE.Group(); g.position.set(0.083 * s, -0.004, 0.204); g.scale.set(1.14 * s, 1.14, 1.14); cabeca.add(g);   // espelha o lado esquerdo
    var olho = new THREE.Group(); g.add(olho);
    malha(new THREE.SphereGeometry(0.03, 32, 20), mEsclera, olho, false).scale.set(1.3, 0.68, 0.4);
    var iris = malha(new THREE.SphereGeometry(0.0145, 28, 20), mIris, olho, false); iris.position.set(0.001, -0.002, 0.0092); iris.scale.set(1, 1, 0.36);
    var pup = malha(new THREE.SphereGeometry(0.0068, 20, 14), mPupila, olho, false); pup.position.set(0.001, -0.002, 0.0118); pup.scale.set(1, 1, 0.36);
    var br = malha(new THREE.CircleGeometry(0.0036, 12), mBrilho, olho, false); br.position.set(-0.004, 0.004, 0.0148);
    var br2 = malha(new THREE.CircleGeometry(0.0016, 8), mBrilho, olho, false); br2.position.set(0.006, -0.007, 0.0148);
    traco([[-0.041, -0.001, 0.009], [-0.02, 0.0135, 0.012], [0.01, 0.0165, 0.012], [0.034, 0.0095, 0.011], [0.05, 0.019, 0.007]], 0.0036, mCilio, g);   // cílios com gatinho
    traco([[-0.032, -0.01, 0.011], [-0.005, -0.0175, 0.012], [0.028, -0.011, 0.011]], 0.001, mSobrancelha, g);                                 // linha de baixo
    traco([[-0.042, 0.036, 0.008], [-0.015, 0.049, 0.01], [0.018, 0.049, 0.01], [0.045, 0.038, 0.006]], 0.0058, mSobrancelha, g);               // sobrancelha
    var bc = malha(new THREE.PlaneGeometry(0.08, 0.06), rubor, cabeca, false); bc.position.set(0.112 * s, -0.078, 0.214); bc.rotation.y = 0.42 * s;
    return { g: g, olho: olho };
  });
  // nariz pequeno, ponta arredondada e asas discretas
  var nariz = new THREE.Group(); nariz.position.set(0, -0.064, 0.232); cabeca.add(nariz);
  malha(new THREE.SphereGeometry(0.0145, 24, 16), mPele, nariz).scale.set(1.15, 0.88, 0.75);
  malha(new THREE.SphereGeometry(0.011, 20, 14), mPele, nariz).position.set(0, 0.03, -0.007);
  nariz.children[1].scale.set(0.8, 2.6, 0.75);
  [-1, 1].forEach(function (s) { var a = malha(new THREE.SphereGeometry(0.0085, 16, 12), mPele, nariz); a.position.set(0.0125 * s, -0.004, -0.008); });
  // boca: lábios rosa-amarronzados e a linha do sorriso com os cantos para cima
  var boca = new THREE.Group(); boca.position.set(0, -0.118, 0.212); cabeca.add(boca);
  malha(new THREE.SphereGeometry(0.022, 28, 16), mLabio, boca, false).scale.set(1.55, 0.26, 0.42); boca.children[0].position.y = 0.0035;
  malha(new THREE.SphereGeometry(0.022, 28, 16), mLabio, boca, false).scale.set(1.38, 0.34, 0.46); boca.children[1].position.y = -0.007;
  traco([[-0.036, 0.004, 0.0085], [-0.013, -0.0015, 0.0098], [0.013, -0.0015, 0.0098], [0.036, 0.004, 0.0085]], 0.0014, mLinha, boca);
  // cabelo: chanel até os ombros (casca com abertura para o rosto e pontas para dentro), franja de lado
  var perfilCabelo = [new THREE.Vector2(0.001, 0.29), new THREE.Vector2(0.14, 0.275), new THREE.Vector2(0.235, 0.2), new THREE.Vector2(0.272, 0.06), new THREE.Vector2(0.278, -0.08),
                      new THREE.Vector2(0.29, -0.22), new THREE.Vector2(0.3, -0.33), new THREE.Vector2(0.27, -0.375), new THREE.Vector2(0.245, -0.36)];
  var casca = malha(new THREE.LatheGeometry(perfilCabelo, 64, 1.05, PI * 2 - 2.1), mCabelo, cabeca); casca.scale.set(1, 1, 1.02);
  var perfilFranja = [new THREE.Vector2(0.001, 0.297), new THREE.Vector2(0.15, 0.283), new THREE.Vector2(0.248, 0.2), new THREE.Vector2(0.27, 0.135), new THREE.Vector2(0.266, 0.1), new THREE.Vector2(0.255, 0.092)];
  var calota = malha(new THREE.LatheGeometry([new THREE.Vector2(0.001, 0.292), new THREE.Vector2(0.14, 0.277), new THREE.Vector2(0.222, 0.215), new THREE.Vector2(0.245, 0.17), new THREE.Vector2(0.252, 0.15)], 48), mCabelo, cabeca);
  var franja = malha(new THREE.LatheGeometry(perfilFranja, 40, -0.25, 1.15), mCabelo, cabeca); franja.rotation.z = 0.3; franja.position.set(-0.02, -0.01, 0);
  // headphone: arco com acolchoado, hastes de metal, conchas com almofada e um LED
  var arco = malha(new THREE.TorusGeometry(0.305, 0.02, 14, 64, PI), mFone, cabeca); arco.position.set(0, 0.0, -0.03);
  var acolch = malha(new THREE.TorusGeometry(0.288, 0.016, 10, 48, PI * 0.5), mAlmofada, cabeca); acolch.position.set(0, 0, -0.03); acolch.rotation.z = PI * 0.25;
  [-1, 1].forEach(function (s) {
    var haste = malha(new RB(0.02, 0.09, 0.03, 2, 0.006), mMetal, cabeca); haste.position.set(0.305 * s, -0.035, -0.03);
    var concha = malha(new THREE.CylinderGeometry(0.095, 0.1, 0.065, 40), mFone, cabeca); concha.rotation.z = PI / 2; concha.position.set(0.305 * s, -0.09, -0.02);
    var alm = malha(new THREE.TorusGeometry(0.075, 0.026, 16, 36), mAlmofada, cabeca); alm.rotation.y = PI / 2; alm.position.set(0.268 * s, -0.09, -0.02);
    var aro = malha(new THREE.TorusGeometry(0.07, 0.006, 10, 40), mMetal, cabeca, false); aro.rotation.y = PI / 2; aro.position.set(0.339 * s, -0.09, -0.02);
    var led = malha(new THREE.CircleGeometry(0.012, 16), mLed, cabeca, false); led.position.set(0.3395 * s, -0.06, 0.02); led.rotation.y = PI / 2 * s;
  });

  // ---------- painéis flutuantes (editor, terminal, selo) e a tela do notebook ----------
  function painel(w, h, cw, ch) {
    var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false }));
    root.add(m); return { m: m, ctx: cv.getContext("2d"), tex: t, cv: cv };
  }
  var ed = painel(1.75, 1.12, 700, 448), term = painel(1.3, 0.66, 520, 264), selo = painel(1.05, 0.34, 420, 136);
  ed.m.position.set(-1.0, 1.2, -0.85); ed.m.rotation.y = 0.32; ed.m.scale.setScalar(0.6);
  term.m.position.set(1.0, 1.38, -0.95); term.m.rotation.y = -0.32; term.m.scale.setScalar(0.6);
  selo.m.position.set(0.96, 0.92, -0.62); selo.m.rotation.y = -0.32; selo.m.scale.setScalar(0.6);
  mTela.map = ed.tex; // a tela do notebook mostra o mesmo código
  var CODIGO = [
    [["kw", "@app"], ["tx", ".get("], ["st", "\"/pedidos/{id}\""], ["tx", ")"]],
    [["kw", "async def "], ["fn", "buscar_pedido"], ["tx", "(id: "], ["kw", "int"], ["tx", "):"]],
    [["tx", "    pedido = "], ["kw", "await "], ["tx", "repo.buscar(id)"]],
    [["kw", "    if "], ["tx", "pedido "], ["kw", "is None"], ["tx", ":"]],
    [["kw", "        raise "], ["fn", "HTTPException"], ["tx", "(404)"]],
    [["kw", "    return "], ["tx", "pedido"]]
  ];
  var TOTAL = CODIGO.reduce(function (a, l) { return a + l.reduce(function (b, p) { return b + p[1].length; }, 0); }, 0);
  var cor = {}, ultimoEd = -1, ultimoTerm = -1, ultimoSelo = -1;
  function caixa(c, w, h, r) { c.clearRect(0, 0, w, h); c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, r); c.fillStyle = cor.fundo; c.fill(); c.lineWidth = 2; c.strokeStyle = cor.linha; c.stroke(); }
  function barra(c, titulo) { [0, 1, 2].forEach(function (i) { c.beginPath(); c.arc(30 + i * 22, 30, 6, 0, 7); c.fillStyle = [cor.fail, "#e0b84d", cor.ok][i]; c.fill(); }); c.fillStyle = cor.muted; c.font = "500 18px 'JetBrains Mono', monospace"; c.fillText(titulo, 110, 36); }
  function desenhaEditor(n) {
    var c = ed.ctx; caixa(c, 700, 448, 22); barra(c, "Código Python · api/pedidos.py"); c.font = "500 22px 'JetBrains Mono', monospace"; var resta = n, cursor = false;
    CODIGO.forEach(function (linha, i) {
      var x = 34, y = 92 + i * 52; c.fillStyle = cor.muted; c.fillText(String(i + 1), x, y); x = 72;
      linha.forEach(function (p) { if (resta <= 0) return; var t = p[1].slice(0, resta); resta -= p[1].length; c.fillStyle = cor[p[0]]; c.fillText(t, x, y); x += c.measureText(t).width; });
      if (resta <= 0 && n < TOTAL && !cursor) { c.fillStyle = cor.kw; c.fillRect(x + 2, y - 20, 3, 26); cursor = true; }
    });
    ed.tex.needsUpdate = true;
  }
  function desenhaTerminal(fr) {
    var c = term.ctx; caixa(c, 520, 264, 22); barra(c, "Testes automáticos"); c.font = "500 22px 'JetBrains Mono', monospace";
    c.fillStyle = cor.tx; c.fillText("$ pytest", 30, 100); c.fillStyle = cor.ok; c.fillText("•".repeat(Math.round(fr * 14)), 30, 150);
    if (fr >= 1) { c.font = "700 24px 'JetBrains Mono', monospace"; c.fillText("✓ todos os testes passaram", 30, 210); } else if (fr > 0) { c.fillStyle = cor.muted; c.fillText("rodando os testes…", 30, 210); }
    term.tex.needsUpdate = true;
  }
  function desenhaSelo(on) {
    var c = selo.ctx; c.clearRect(0, 0, 420, 136); c.beginPath(); c.roundRect(4, 4, 412, 128, 64);
    c.fillStyle = on ? cor.okFundo : cor.fundo; c.fill(); c.lineWidth = 3; c.strokeStyle = on ? cor.ok : cor.linha; c.stroke();
    c.beginPath(); c.arc(68, 68, 26, 0, 7); c.fillStyle = on ? cor.ok : cor.linha; c.fill();
    c.fillStyle = on ? cor.tx : cor.muted; c.font = on ? "700 34px 'Bricolage Grotesque', sans-serif" : "600 28px 'Bricolage Grotesque', sans-serif"; c.fillText(on ? "Em produção ✓" : "Aguardando deploy", 112, 80);
    selo.tex.needsUpdate = true;
  }
  var olhar = new THREE.Vector3(0, 0.66, -0.42), focoRosto = /foco=rosto/.test(location.search);

  var api = {
    etapa: 0, rotulos: [],
    colors: function (c) {
      hemi.groundColor.set(c.escuro ? "#1e1a26" : "#cfc8da"); hemi.intensity = c.escuro ? 0.32 : 0.6; recorte.color.set(c["accent-fill"]); recorte.intensity = c.escuro ? 2.2 : 1.2;
      mMoletom.color.set(c.escuro ? "#9468dc" : "#8a5bd6"); mAluminio.color.set(c.escuro ? "#5a5866" : "#cdc9d6"); mCeramica.color.set("#f7f5fa"); mVaso.color.set(c.escuro ? "#3b3747" : "#e4dfec");
      mLed.color.set(c.accent2 || c.accent); luzTela.color.set(c.escuro ? "#c9b8ff" : "#d9ccff");
      cor = { fundo: c.escuro ? "rgba(26,25,32,0.95)" : "rgba(255,255,255,0.96)", linha: c.border, tx: c.text, muted: c.muted, kw: c.accent, st: c.accent2 || c.accent,
              fn: c.escuro ? "#8fd3ff" : "#1f6fb2", ok: c.ok, fail: c.fail, okFundo: c.escuro ? "rgba(91,196,138,0.16)" : "rgba(20,92,49,0.10)" };
      ultimoEd = ultimoTerm = ultimoSelo = -1;
    },
    update: function (dt, t, p, ptr) {
      var u = t % 24, n = Math.min(TOTAL, Math.floor(u * 14));
      if (n !== ultimoEd) { ultimoEd = n; desenhaEditor(n); }
      var fr = Math.min(1, Math.max(0, (u - 12) / 3.5)), q = Math.round(fr * 14) + (fr >= 1 ? 100 : 0);
      if (q !== ultimoTerm) { ultimoTerm = q; desenhaTerminal(fr); }
      var on = u >= 16 ? 1 : 0; if (on !== ultimoSelo) { ultimoSelo = on; desenhaSelo(on); }
      api.etapa = u < 12 ? 0 : u < 16 ? 1 : 2;
      // mãos e dedos digitando (calmos quando o código termina); braços acompanham
      var digita = n < TOTAL ? 1 : 0.12;
      lados.forEach(function (l, i) {
        var lat = Math.sin(t * 2.3 + i * 1.7) * 0.025 * digita;
        l.pulso.set(l.base.x + lat, l.base.y + Math.max(0, Math.sin(t * 6 + i)) * 0.006 * digita, l.base.z);
        l.mao.position.copy(l.pulso); l.mao.rotation.set(0.12, -0.15 * l.s, 0);
        l.dedos.forEach(function (d, j) { d.rotation.x = Math.max(0, Math.sin(t * 11 + j * 1.9 + i * 3.1)) * 0.5 * digita; });
        liga(l.braco, l.ombro, l.cotovelo, 0.085); liga(l.antebraco, l.cotovelo, l.pulso, 0.072);
        l.punho.position.copy(l.pulso); l.punho.position.z -= 0.035; l.punho.quaternion.copy(l.antebraco.quaternion); l.punho.rotateX(PI / 2);
      });
      // cabeça: leve aceno de concentração; piscadas
      cabeca.rotation.x = 0.15 + Math.sin(t * 0.8) * 0.02; cabeca.rotation.y = Math.sin(t * 0.33) * 0.05 + ptr.x * 0.1;
      var pisca = (t % 4.6) < 0.13; olhos.forEach(function (o) { o.olho.scale.y = pisca ? 0.12 : 1; });
      vapor.forEach(function (v, i) { var fz = (t * 0.22 + i / 3) % 1; v.position.set(0.74 + Math.sin(fz * 6 + i) * 0.025, 0.2 + fz * 0.4, -0.18); v.material.opacity = Math.sin(fz * PI) * 0.28; v.scale.setScalar(0.6 + fz * 1.2); });
      ed.m.position.y = 1.2 + Math.sin(t * 0.6) * 0.025; term.m.position.y = 1.38 + Math.sin(t * 0.6 + 1.5) * 0.025; selo.m.position.y = 0.92 + Math.sin(t * 0.6 + 3) * 0.02;
      // câmera em três quartos, enquadrando tudo (nada cortado), com parallax leve do ponteiro
      if (focoRosto) { k.camera.position.set(0.18, 1.02, -0.2); k.camera.lookAt(cabeca.position); return; }
      k.camera.position.set(1.05 + ptr.x * 0.3, 1.55 - ptr.y * 0.2, 3.85 - p * 0.3); k.camera.lookAt(olhar);
    }
  };
  return api;
};

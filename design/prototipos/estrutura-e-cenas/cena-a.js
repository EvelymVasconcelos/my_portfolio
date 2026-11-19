/* Cena A: Abaixo da superfície. A interface é uma placa translúcida; embaixo, em camadas, gateway, serviços, fila e
   dados. Requisições descem como luz e voltam com a resposta. Ao rolar, a câmera desce e um deploy azul-verde troca a
   camada de serviços (v1 sai para trás, v2 entra). Geometria procedural; nada é alocado dentro do update. */
window.CENAS = window.CENAS || {};
window.CenaKit = {
  smooth: function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); },
  luzes: function (THREE, scene) {
    var hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.7), key = new THREE.DirectionalLight(0xffffff, 1.6), rim = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(6, 10, 8); rim.position.set(-8, 3, -6); scene.add(hemi, key, rim);
    return function (c) { rim.color.set(c["accent-fill"]); hemi.intensity = c.escuro ? 0.55 : 0.9; key.intensity = c.escuro ? 1.4 : 1.8; };
  },
  cor: function (THREE, o) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.55, metalness: 0.08 }, o || {})); }
};

window.CENAS.a = function (lib, k) {
  var THREE = lib.THREE, K = window.CenaKit, RB = lib.RoundedBoxGeometry, root = new THREE.Group(); k.scene.add(root);
  var tingeLuz = K.luzes(THREE, k.scene);
  var Y = { ui: 2.3, gw: 1.0, sv: -0.2, fila: -1.3, dados: -2.5 };

  // Superfície: a interface que o usuário vê
  var mSup = K.cor(THREE, { transparent: true, opacity: 0.22, roughness: 0.15, metalness: 0.2, depthWrite: false });
  var sup = new THREE.Mesh(new RB(7.6, 0.08, 4.6, 2, 0.04), mSup); sup.position.y = Y.ui - 0.08; root.add(sup);
  var mBorda = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 });
  var borda = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7.6, 0.08, 4.6)), mBorda); borda.position.copy(sup.position); root.add(borda);
  var mTela = K.cor(THREE, { emissiveIntensity: 0.55, roughness: 0.3 }), TX = [-2.3, 0, 2.3], telaGeo = new RB(1.5, 0.07, 0.95, 2, 0.03);
  TX.forEach(function (x) { var t = new THREE.Mesh(telaGeo, mTela); t.position.set(x, Y.ui, 0.4); root.add(t); });

  // Gateway e autenticação
  var mCamada = K.cor(THREE), mPorta = K.cor(THREE, { emissiveIntensity: 0.4 });
  var gw = new THREE.Mesh(new RB(6, 0.24, 1.3, 2, 0.06), mCamada); gw.position.y = Y.gw; root.add(gw);
  var portaGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20);
  [-1.6, 0, 1.6].forEach(function (x) { var p = new THREE.Mesh(portaGeo, mPorta); p.position.set(x, Y.gw + 0.18, 0); root.add(p); });

  // Serviços: v1 (sai) e v2 (entra) no deploy azul-verde
  var SX = [-2.4, -0.8, 0.8, 2.4], svGeo = new RB(0.95, 0.75, 0.95, 3, 0.1);
  var mV1 = K.cor(THREE), mV2 = K.cor(THREE, { emissiveIntensity: 0.25 });
  var v1 = SX.map(function (x) { var m = new THREE.Mesh(svGeo, mV1); m.position.set(x, Y.sv, 0); root.add(m); return m; });
  var v2 = SX.map(function (x) { var m = new THREE.Mesh(svGeo, mV2); m.position.set(x, Y.sv, 2.6); root.add(m); return m; });

  // Fila: tubo translúcido com mensagens andando
  var mTubo = K.cor(THREE, { transparent: true, opacity: 0.25, depthWrite: false, roughness: 0.2 });
  var tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 5.6, 24, 1, true), mTubo); tubo.rotation.z = Math.PI / 2; tubo.position.set(0, Y.fila, -0.7); root.add(tubo);
  var mMsg = K.cor(THREE, { emissiveIntensity: 0.9 }), MSG = 12, msgs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.16, 0.16), mMsg, MSG); root.add(msgs);

  // Dados: dois bancos relacionais (cilindros) e cache (cubos)
  var mBanco = K.cor(THREE, { roughness: 0.35, metalness: 0.25 }), bancoGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.0, 40);
  var mAnel = new THREE.MeshBasicMaterial(), anelGeo = new THREE.TorusGeometry(0.625, 0.018, 6, 48);
  [-1.6, 0.1].forEach(function (x) {
    var b = new THREE.Mesh(bancoGeo, mBanco); b.position.set(x, Y.dados, 0); root.add(b);
    [0.22, -0.12].forEach(function (dy) { var a = new THREE.Mesh(anelGeo, mAnel); a.rotation.x = Math.PI / 2; a.position.set(x, Y.dados + dy, 0); root.add(a); });
  });
  var cacheGeo = new RB(0.48, 0.48, 0.48, 2, 0.06), mCache = K.cor(THREE, { emissiveIntensity: 0.15 });
  [[1.6, 0, 0.3], [2.2, 0, -0.3], [1.9, 0.52, 0]].forEach(function (p) { var c = new THREE.Mesh(cacheGeo, mCache); c.position.set(p[0], Y.dados - 0.24 + p[1], p[2]); root.add(c); });

  // Fios verticais discretos ligando as camadas
  var fios = new Float32Array(TX.length * 6); TX.forEach(function (x, i) { fios.set([x, Y.ui, 0.4, x * 0.7, Y.dados, 0], i * 6); });
  var gFio = new THREE.BufferGeometry(); gFio.setAttribute("position", new THREE.BufferAttribute(fios, 3));
  var mFio = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18 }); root.add(new THREE.LineSegments(gFio, mFio));

  // Requisições: descem da tela até os dados e voltam (8 pontos fixos por requisição)
  var N = 36, reqs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 12), K.cor(THREE, { emissiveIntensity: 1.4, roughness: 0.2 }), N); root.add(reqs);
  var DX = [-1.6, 0.1, 1.9], pts = [], len = [], f = [], tmp = new THREE.Object3D(), cDesce = new THREE.Color(), cSobe = new THREE.Color();
  for (var i = 0; i < N; i++) {
    var tx = TX[i % 3], gx = [-1.6, 0, 1.6][(i * 7) % 3], s = i % 4, dx = DX[(i * 5) % 3];
    var ida = [[tx, Y.ui, 0.4], [gx, Y.gw + 0.2, 0], [SX[s], Y.sv + 0.4, 0], [SX[s], Y.sv - 0.4, 0], [dx, Y.dados + 0.55, 0]];
    var p = ida.concat(ida.slice(0, 4).reverse()).map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); });
    var L = [0]; for (var j = 1; j < p.length; j++) L.push(L[j - 1] + p[j].distanceTo(p[j - 1]));
    pts.push(p); len.push(L); f.push((i * 0.137) % 1);
    reqs.setColorAt(i, cDesce);
  }
  var deploy = 0;
  function posReq(i, out) {
    var p = pts[i], L = len[i], d = f[i] * L[L.length - 1], j = 1;
    while (j < L.length - 1 && L[j] < d) j++;
    var a = (d - L[j - 1]) / Math.max(1e-4, L[j] - L[j - 1]); out.lerpVectors(p[j - 1], p[j], a);
    return j < 5;
  }
  var camDe = new THREE.Vector3(9.4, 6.4, 11.8), camAte = new THREE.Vector3(8.4, -0.9, 10.4), olhaDe = new THREE.Vector3(0, 0.7, 0), olhaAte = new THREE.Vector3(0, -1.3, 0), olha = new THREE.Vector3();

  return {
    colors: function (c) {
      tingeLuz(c); mAnel.color.set(c.accent);
      mSup.color.set(c.accent); mBorda.color.set(c.accent); mTela.color.set(c["surface-2"]); mTela.emissive.set(c["accent-fill"]);
      mCamada.color.set(c.escuro ? c["surface-2"] : c.surface); mPorta.color.set(c.surface); mPorta.emissive.set(c["accent-fill"]);
      mV1.color.set(c.escuro ? c.border : c["surface-2"]); mV2.color.set(c["accent-fill"]); mV2.emissive.set(c["accent-fill"]);
      mTubo.color.set(c.accent); mMsg.color.set(c.accent); mMsg.emissive.set(c["accent-fill"]);
      mBanco.color.set(c.escuro ? c["surface-2"] : c.surface); mCache.color.set(c.escuro ? c.border : c["surface-2"]); mCache.emissive.set(c.ok);
      mFio.color.set(c.accent); reqs.material.color.set(c.accent); reqs.material.emissive.set(c["accent-fill"]);
      cDesce.set(c.accent); cSobe.set(c.ok);
    },
    update: function (dt, t, p, ptr) {
      deploy = K.smooth(0.45, 0.85, p);
      for (var i = 0; i < 4; i++) {
        v1[i].position.z = -deploy * 1.9; v1[i].scale.setScalar(1 - deploy * 0.35);
        v2[i].position.z = 2.6 * (1 - K.smooth(0, 1, deploy * 1.25 - i * 0.08)); v2[i].visible = deploy > 0.01;
        v1[i].position.y = Y.sv + Math.sin(t * 1.3 + i) * 0.03; v2[i].position.y = v1[i].position.y;
      }
      for (i = 0; i < MSG; i++) { tmp.position.set(-2.6 + ((t * 0.7 + i / MSG) % 1) * 5.2, Y.fila, -0.7); tmp.scale.setScalar(1); tmp.updateMatrix(); msgs.setMatrixAt(i, tmp.matrix); }
      msgs.instanceMatrix.needsUpdate = true;
      for (i = 0; i < N; i++) {
        f[i] = (f[i] + dt * 0.11 * (1 + (i % 3) * 0.2)) % 1;
        var desce = posReq(i, tmp.position);
        if (tmp.position.y < Y.gw && tmp.position.y > Y.fila) tmp.position.z = (deploy > 0.5 ? v2[0].position.z : v1[0].position.z);
        tmp.scale.setScalar(1); tmp.updateMatrix(); reqs.setMatrixAt(i, tmp.matrix); reqs.setColorAt(i, desce ? cDesce : cSobe);
      }
      reqs.instanceMatrix.needsUpdate = true; reqs.instanceColor.needsUpdate = true;
      var s = K.smooth(0, 1, p);
      k.camera.position.lerpVectors(camDe, camAte, s); k.camera.position.x += ptr.x * 0.8; k.camera.position.y -= ptr.y * 0.5;
      olha.lerpVectors(olhaDe, olhaAte, s); k.camera.lookAt(olha);
      root.rotation.y = -0.18 + Math.sin(t * 0.15) * 0.04;
    }
  };
};

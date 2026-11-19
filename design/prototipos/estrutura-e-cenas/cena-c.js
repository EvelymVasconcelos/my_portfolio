/* Cena C: Porto de deploy. À esquerda, blocos de código se juntam num container; o guindaste o leva pelo portal de
   testes (o que falha fica vermelho e volta). A balsa, sobre água escura, leva os containers aprovados até o píer do
   cluster, onde eles acendem como serviços rodando. O ciclo de build e testes é contínuo; a viagem da balsa é a rolagem.
   Nada é alocado dentro do update. */
window.CENAS = window.CENAS || {};
window.CENAS_INFO = window.CENAS_INFO || {};
window.CENAS_INFO.c = {
  legenda: "Do código à produção: tudo passa por testes automáticos, e só o que é aprovado chega a quem usa o sistema.",
  etapas: [[0, "O código vira container e passa pelos testes"], [0.1, "A versão aprovada está a caminho da produção"], [0.88, "Versão nova no ar, atendendo os usuários"]],
  rotulos: [
    { t: "Código vira container", s: "empacotado para rodar em qualquer lugar", lado: "esq" },
    { t: "Testes automáticos", s: "o que falha fica vermelho e volta", lado: "dir" },
    { t: "Versão aprovada", s: "a caminho da produção", lado: "dir" },
    { t: "Produção", s: "onde o sistema atende os usuários", lado: "esq" }
  ]
};
window.CENAS.c = function (lib, k) {
  var THREE = lib.THREE, K = window.CenaKit, RB = lib.RoundedBoxGeometry, root = new THREE.Group(); k.scene.add(root);
  var tingeLuz = K.luzes(THREE, k.scene);

  var mAgua = K.cor(THREE, { roughness: 0.42, metalness: 0.02 }), agua = new THREE.Mesh(new THREE.PlaneGeometry(60, 40, 1, 1), mAgua);
  agua.rotation.x = -Math.PI / 2; agua.position.y = -0.62; root.add(agua);
  var mCais = K.cor(THREE, { roughness: 0.75 });
  var doca = new THREE.Mesh(new RB(4.6, 0.6, 3.6, 2, 0.08), mCais); doca.position.set(-5.4, -0.35, 0); root.add(doca);
  var pier = new THREE.Mesh(new RB(4.2, 0.6, 3.6, 2, 0.08), mCais); pier.position.set(5.6, -0.35, 0); root.add(pier);

  // Guindaste sobre a doca
  var mFerro = K.cor(THREE, { roughness: 0.4, metalness: 0.5 }), poste = new THREE.BoxGeometry(0.14, 3.0, 0.14);
  [[-7.2, -1.3], [-7.2, 1.3], [-3.6, -1.3], [-3.6, 1.3]].forEach(function (q) { var m = new THREE.Mesh(poste, mFerro); m.position.set(q[0], 1.45, q[1]); root.add(m); });
  [-1.3, 1.3].forEach(function (z) { var v = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.14, 0.14), mFerro); v.position.set(-5.4, 2.9, z); root.add(v); });
  var trole = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 2.8), mFerro); trole.position.y = 2.95; root.add(trole);
  var cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), mFerro); root.add(cabo);

  // Portal de testes, com a lâmina de varredura
  var mPortal = K.cor(THREE, { emissiveIntensity: 0.5 }), mLaser = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
  var PX = -4.6;
  [[0, 1.05, -0.95, 0.12, 2.1, 0.12], [0, 1.05, 0.95, 0.12, 2.1, 0.12], [0, 2.1, 0, 0.12, 0.12, 2.0]].forEach(function (b) { var m = new THREE.Mesh(new THREE.BoxGeometry(b[3], b[4], b[5]), mPortal); m.position.set(PX + b[0], b[1] - 0.05, b[2]); root.add(m); });
  var laser = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.0), mLaser); laser.rotation.y = Math.PI / 2; laser.position.set(PX, 1.0, 0); root.add(laser);

  // Container em construção (blocos de código convergem) e o container levado pelo guindaste
  var mCont = K.cor(THREE, { roughness: 0.45, metalness: 0.2, emissiveIntensity: 0 }), contGeo = new RB(1.1, 0.72, 0.9, 2, 0.05);
  var cont = new THREE.Mesh(contGeo, mCont); root.add(cont);
  var B = 14, mBloco = K.cor(THREE, { emissiveIntensity: 0.8 }), blocos = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), mBloco, B); root.add(blocos);
  var bOrig = []; for (var i = 0; i < B; i++) { var a = i / B * Math.PI * 2; bOrig.push(new THREE.Vector3(-6.4 + Math.cos(a) * 1.4, 0.4 + (i % 3) * 0.5, Math.sin(a) * 1.3)); }
  var PAD = new THREE.Vector3(-6.4, 0.32, 0), FIM = new THREE.Vector3(-3.2, 0.32, 0);

  // Balsa com três containers aprovados, e o píer do cluster com três serviços
  var mCasco = K.cor(THREE, { roughness: 0.5, metalness: 0.2 }), balsa = new THREE.Group(); root.add(balsa);
  var casco = new THREE.Mesh(new RB(3.4, 0.42, 1.8, 2, 0.12), mCasco); balsa.add(casco);
  var mAprov = K.cor(THREE, { roughness: 0.45, emissiveIntensity: 0.2 }), carga = [];
  [-1.1, 0, 1.1].forEach(function (x) { var m = new THREE.Mesh(contGeo, mAprov); m.position.set(x, 0.57, 0); m.scale.set(0.9, 0.9, 0.9); balsa.add(m); carga.push(m); });
  var mServ = K.cor(THREE, { roughness: 0.35, emissiveIntensity: 0 }), servicos = [], luzes = [];
  var mLuz = K.cor(THREE, { emissiveIntensity: 0 });
  [-1.3, 0, 1.3].forEach(function (z) {
    var s = new THREE.Mesh(contGeo, mServ); s.position.set(5.6, 0.32, z); s.rotation.y = Math.PI / 2; root.add(s); servicos.push(s);
    var l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), mLuz); l.position.set(5.6, 0.71, z); root.add(l); luzes.push(l);
  });

  var cAprov = new THREE.Color(), cFalha = new THREE.Color(), cNovo = new THREE.Color(), tmp = new THREE.Object3D(), olha = new THREE.Vector3();
  var luzOn = new THREE.Color(), luzOff = new THREE.Color();

  var rot = [new THREE.Vector3(-7.4, 1.1, 0), new THREE.Vector3(PX + 0.6, 2.3, 0), new THREE.Vector3(), new THREE.Vector3(7.0, 0.6, 0)];
  return {
    rotulos: rot,
    colors: function (c) {
      tingeLuz(c);
      mAgua.color.set(c.escuro ? c.bg : c["surface-2"]); mCais.color.set(c.escuro ? c["surface-2"] : c.surface);
      mFerro.color.set(c.escuro ? c.muted : c.border); mPortal.color.set(c.surface); mPortal.emissive.set(c["accent-fill"]); mLaser.color.set(c.accent);
      mBloco.color.set(c.accent2 || c.accent); mBloco.emissive.set(c.accent2 || c["accent-fill"]); mLaser.color.set(c.accent2 || c.accent);
      cNovo.set(c.escuro ? c.border : c["surface-2"]); cAprov.set(c["accent-fill"]); cFalha.set(c.fail);
      mCasco.color.set(c.escuro ? c.surface : c.text); mAprov.color.set(c["accent-fill"]); mAprov.emissive.set(c["accent-fill"]);
      mServ.color.set(c.escuro ? c["surface-2"] : c.surface); luzOn.set(c.ok); luzOff.set(c.escuro ? c.border : c["surface-2"]); mLuz.color.copy(luzOff);
    },
    update: function (dt, t, p, ptr) {
      // Ciclo de build e testes (7 s); a cada terceiro ciclo o container falha no portal e volta
      var T = 12, ciclo = Math.floor(t / T), u = (t % T) / T, falha = ciclo % 3 === 2;
      var monta = K.smooth(0, 0.28, u), leva = K.smooth(0.3, 0.62, u), volta = falha ? K.smooth(0.7, 0.92, u) : 0, some = K.smooth(0.92, 1, u);
      for (var i = 0; i < B; i++) {
        tmp.position.lerpVectors(bOrig[i], PAD, monta); tmp.position.y += Math.sin(monta * Math.PI) * 0.3;
        tmp.rotation.set(t + i, t * 0.7, 0); tmp.scale.setScalar(monta > 0.98 ? 0.0001 : 1 - monta * 0.4); tmp.updateMatrix(); blocos.setMatrixAt(i, tmp.matrix);
      }
      blocos.instanceMatrix.needsUpdate = true;
      cont.scale.setScalar(Math.max(0.0001, monta * (1 - some)));
      var x = PAD.x + (FIM.x - PAD.x) * (leva - volta), sobe = Math.sin(Math.min(1, leva + volta) * Math.PI) * 0.9;
      cont.position.set(x, PAD.y + sobe, 0);
      var noPortal = Math.abs(x - PX) < 0.7 && leva > 0 && leva < 1;
      mLaser.opacity = noPortal ? 0.35 + Math.sin(t * 30) * 0.1 : 0;
      laser.position.y = 0.2 + ((t * 2.4) % 1) * 1.7;
      mCont.color.copy(cNovo); if (leva > 0.5) mCont.color.copy(falha ? cFalha : cAprov);
      mCont.emissive.copy(mCont.color); mCont.emissiveIntensity = leva > 0.5 ? 0.25 : 0;
      trole.position.x = cont.position.x; cabo.position.set(cont.position.x, (2.9 + cont.position.y + 0.36) / 2, 0); cabo.scale.y = Math.max(0.01, 2.9 - cont.position.y - 0.36);
      // Viagem da balsa: conduzida pela rolagem
      var viagem = K.smooth(0.08, 0.88, p);
      balsa.position.set(-1.9 + viagem * 5.4, -0.42 + Math.sin(t * 1.4) * 0.04, 2.6 - viagem * 0.6); balsa.rotation.z = Math.sin(t * 1.1) * 0.015;
      rot[2].copy(balsa.position); rot[2].x += 1.9; rot[2].y += 0.5;
      var chegou = K.smooth(0.84, 0.98, p);
      for (i = 0; i < 3; i++) { carga[i].visible = chegou < 0.5; }
      mLuz.color.copy(luzOff).lerp(luzOn, chegou); mLuz.emissive.copy(luzOn); mLuz.emissiveIntensity = chegou * (1.4 + Math.sin(t * 3) * 0.2);
      mServ.emissive.copy(cAprov); mServ.emissiveIntensity = chegou * 0.35;
      var cx = -1.6 + p * 3.8 + ptr.x * 0.6;
      k.camera.position.set(cx + 1.6, 7.6 - ptr.y * 0.6, 17.4); olha.set(cx * 0.92, -0.4, 0); k.camera.lookAt(olha);
    }
  };
};

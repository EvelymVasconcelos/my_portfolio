/* Cena B: Cluster que se cura. Três nós numa plataforma, pods recebendo tráfego de uma entrada. A rolagem conduz a
   história: deploy gradual (os pods trocam de v1 para v2, um por vez, com o anel de prontidão), falha do nó 3 (os pods
   dele são reagendados nos outros) e autoescala (pods novos para o pico). Nada é alocado dentro do update. */
window.CENAS = window.CENAS || {};
window.CENAS.b = function (lib, k) {
  var THREE = lib.THREE, K = window.CenaKit, RB = lib.RoundedBoxGeometry, root = new THREE.Group(); k.scene.add(root);
  var tingeLuz = K.luzes(THREE, k.scene);

  var mBase = K.cor(THREE, { roughness: 0.7 }), base = new THREE.Mesh(new RB(10.4, 0.36, 6.6, 3, 0.12), mBase); base.position.y = -0.62; root.add(base);
  var NX = [-3.4, 0, 3.4], mNo = [0, 1, 2].map(function () { return K.cor(THREE, { roughness: 0.5 }); });
  var nos = NX.map(function (x, i) { var n = new THREE.Mesh(new RB(2.9, 0.22, 4.8, 2, 0.08), mNo[i]); n.position.set(x, -0.33, 0); root.add(n); return n; });
  var mFalha = new THREE.Color(), mNoCor = new THREE.Color();

  // Vagas: 2 colunas × 3 linhas por nó
  function vaga(no, s) { return new THREE.Vector3(NX[no] + (s % 2 ? 0.62 : -0.62), 0.14, [-1.45, 0, 1.45][Math.floor(s / 2)]); }
  // Plano de cada pod em cada fase: [nó, vaga] inicial, depois da falha, e momento em que nasce na autoescala
  var PLANO = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [0, 5], [1, 4], [1, 5]];
  var RESGATE = { 6: [0, 3], 7: [0, 4], 8: [1, 3] };
  var P = 12, de = [], para = [], podGeo = new THREE.CapsuleGeometry(0.25, 0.42, 6, 14);
  for (var i = 0; i < P; i++) { de.push(vaga(PLANO[i][0], PLANO[i][1])); para.push(RESGATE[i] ? vaga(RESGATE[i][0], RESGATE[i][1]) : de[i].clone()); }
  var mPod = K.cor(THREE, { roughness: 0.3, metalness: 0.15, emissiveIntensity: 0.0 }), pods = new THREE.InstancedMesh(podGeo, mPod, P); root.add(pods);
  var mAnel = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }), aneis = new THREE.InstancedMesh(new THREE.TorusGeometry(0.42, 0.035, 8, 40), mAnel, P); root.add(aneis);
  var cV1 = new THREE.Color(), cV2 = new THREE.Color(), cTmp = new THREE.Color();
  for (i = 0; i < P; i++) { pods.setColorAt(i, cV1); }

  // Entrada (ingress) e tráfego
  var mEntrada = K.cor(THREE, { emissiveIntensity: 0.6 }), arco = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 12, 48, Math.PI), mEntrada);
  arco.position.set(0, -0.44, 4.1); root.add(arco);
  var T = 44, trafego = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 10), K.cor(THREE, { emissiveIntensity: 1.5, roughness: 0.2 }), T); root.add(trafego);
  var tf = [], tAlvo = [], origem = new THREE.Vector3(0, 0.3, 4.1);
  for (i = 0; i < T; i++) { tf.push((i * 0.173) % 1); tAlvo.push(i % 9); }

  var tmp = new THREE.Object3D(), pos = [], alvoAtual = new THREE.Vector3(), olha = new THREE.Vector3(0, -0.7, 0.5);
  for (i = 0; i < P; i++) pos.push(new THREE.Vector3());
  var c = null;

  return {
    colors: function (cl) {
      c = cl; tingeLuz(cl);
      mBase.color.set(cl.escuro ? cl.surface : cl["surface-2"]);
      mNoCor.set(cl.escuro ? cl["surface-2"] : cl.surface); mFalha.set(cl.fail);
      cV1.set(cl.escuro ? cl.muted : cl.border); cV2.set(cl["accent-fill"]);
      mAnel.color.set(cl.ok); mEntrada.color.set(cl.surface); mEntrada.emissive.set(cl["accent-fill"]);
      trafego.material.color.set(cl.accent); trafego.material.emissive.set(cl["accent-fill"]);
    },
    update: function (dt, t, p, ptr) {
      var rolar = K.smooth(0.05, 0.36, p) * 9, falha = K.smooth(0.38, 0.62, p), escala = K.smooth(0.68, 0.95, p) * 3;
      // Nó 3 cai: fica vermelho e afunda um pouco
      for (var n = 0; n < 3; n++) { mNo[n].color.copy(mNoCor); if (n === 2) mNo[n].color.lerp(mFalha, falha * 0.85); }
      nos[2].position.y = -0.33 - falha * 0.12;
      var ativos = 0;
      for (var i = 0; i < P; i++) {
        var nasce = i >= 9 ? Math.min(1, Math.max(0, escala - (i - 9))) : 1;
        var resgate = RESGATE[i] ? falha : 0;
        pos[i].lerpVectors(de[i], para[i], resgate); pos[i].y += Math.sin(resgate * Math.PI) * 1.1; // sobe em arco ao trocar de nó
        // deploy gradual: o pod i troca de versão quando "rolar" passa por ele; encolhe e volta
        var troca = Math.min(1, Math.max(0, rolar - i)), pulso = Math.sin(troca * Math.PI);
        var esc = nasce * (1 - pulso * 0.45) * (1 + Math.sin(t * 2 + i) * 0.015);
        tmp.position.copy(pos[i]); tmp.position.y += 0.46; tmp.scale.setScalar(esc); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); pods.setMatrixAt(i, tmp.matrix);
        cTmp.copy(cV1).lerp(cV2, i >= 9 ? 1 : troca); pods.setColorAt(i, cTmp);
        // anel de prontidão: aparece na troca, no resgate e ao nascer
        var anel = Math.max(pulso, Math.sin(resgate * Math.PI), i >= 9 ? Math.sin(nasce * Math.PI) : 0);
        tmp.position.copy(pos[i]); tmp.position.y += 0.06; tmp.rotation.set(Math.PI / 2, 0, 0); tmp.scale.setScalar(anel > 0.02 ? 0.8 + anel * 0.5 : 0.0001); tmp.updateMatrix(); aneis.setMatrixAt(i, tmp.matrix);
        if (nasce > 0.5) ativos++;
      }
      pods.instanceMatrix.needsUpdate = true; pods.instanceColor.needsUpdate = true; aneis.instanceMatrix.needsUpdate = true;
      // tráfego: da entrada até um pod ativo (desvia do nó com falha; com a autoescala, usa os pods novos)
      for (i = 0; i < T; i++) {
        tf[i] += dt * (0.55 + (i % 4) * 0.08);
        if (tf[i] >= 1) { tf[i] -= 1; var alvo = (i * 7 + Math.floor(t * 2)) % Math.max(1, ativos); if (falha > 0.5 && alvo >= 6 && alvo <= 8 && !RESGATE[alvo]) alvo = alvo % 6; tAlvo[i] = alvo; }
        alvoAtual.copy(pos[tAlvo[i]]); alvoAtual.y += 0.5;
        var f = tf[i]; tmp.position.lerpVectors(origem, alvoAtual, f); tmp.position.y += Math.sin(f * Math.PI) * 0.9;
        tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(f > 0.96 ? 0.0001 : 1); tmp.updateMatrix(); trafego.setMatrixAt(i, tmp.matrix);
      }
      trafego.instanceMatrix.needsUpdate = true;
      var ang = -0.32 + p * 0.55 + ptr.x * 0.12;
      k.camera.position.set(Math.sin(ang) * 16.2, 9.2 - p * 1.6 - ptr.y * 0.8, Math.cos(ang) * 16.2);
      k.camera.lookAt(olha);
    }
  };
};

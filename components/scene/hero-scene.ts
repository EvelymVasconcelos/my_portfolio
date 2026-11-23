/**
 * Cena 3D do Hero: a Evelym programando (decisão 3 da design). Porte da cena D do protótipo
 * (design/prototipos/layout-referencia/cena-d.js). Personagem original, só com geometria procedural (sem modelo
 * externo), com materiais físicos, sombras suaves de uma luz principal e a tela iluminando o rosto. A história roda
 * sozinha num ciclo de 24 s: ela digita o código, os testes passam e a versão vai para a produção.
 *
 * Carregada só por import dinâmico (components/scene/HeroSceneLoader.tsx), depois do carregamento; nada daqui entra
 * no JavaScript inicial. Fora o redesenho dos painéis quando o texto muda, nada é alocado por quadro.
 *
 * Versão do three fixa em 0.160.0, a mesma do protótipo aprovado: na 0.187, o ambiente de reflexo e a luz física
 * clareiam a cena inteira (pele sem o dourado, notebook cinza, sombras fracas). Atualizar o three pede comparar a
 * cena com o protótipo antes (2026-11-19).
 */
import {
  ACESFilmicToneMapping,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  ClampToEdgeWrapping,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SplineCurve,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type MeshPhysicalMaterialParameters,
  type Object3D,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SIGNATURE } from "@/lib/brand/signature-data";

export type SceneTheme = "light" | "dark";
export type SceneState = "running" | "paused" | "poster";

/** Textos dos painéis, no idioma da página (messages/*.json, `hero.scene`). */
export interface SceneLabels {
  editorTitle: string;
  testsTitle: string;
  testsRunning: string;
  testsPassed: string;
  deployWaiting: string;
  deployLive: string;
}

export interface HeroSceneOptions {
  labels: SceneLabels;
  /** Toque ou tela estreita: densidade de pixels menor. */
  coarse: boolean;
  /** Captura do pôster: um quadro parado no estado final da história, sem margem e sem animação. */
  capture?: boolean;
  /** Testes em navegador sem GPU: não rebaixa nem desiste por lentidão. */
  noDowngrade?: boolean;
  onState?: (state: SceneState) => void;
}

export interface HeroScene {
  setTheme(theme: SceneTheme): void;
  /** Progresso da saída do Hero (0 a 1): a câmera se aproxima conforme a rolagem. */
  setProgress(progress: number): void;
  destroy(): void;
}

/** Duração de um ciclo da história, em segundos. */
const CYCLE = 24;
/**
 * Momento da história do pôster e do primeiro quadro ao vivo: código pronto, testes passando e "Em produção". Começar
 * daqui deixa a troca imagem → cena imperceptível; depois a história recomeça sozinha.
 */
const POSTER_T = 20;
/** Personagem gerada por scripts/personagem/ (npm run personagem; exportar.py gera o arquivo). */
const MODEL_URL = "/models/evelym.glb";
/** O modelo sai em metros; a cena usa uma escala maior (a mesa tem 2,15 de largura). */
const MODEL_SCALE = 2.05;
/** Fones feitos para a cabeça antiga (raio 0,25): reduzidos para a cabeça do modelo, em metros. */
const PHONES_SCALE = 0.34;
/** Média de quadros abaixo disso por 3 s rebaixa a qualidade; se persistir, a imagem volta (spec cena-3d). */
const MIN_FPS = 30;
const FPS_WINDOW = 3;

const PI = Math.PI;

/** Código digitado no editor (em inglês, como código costuma ser, nos três idiomas). */
const CODE: ReadonlyArray<ReadonlyArray<readonly [Token, string]>> = [
  [
    ["kw", "@app"],
    ["tx", ".get("],
    ["st", '"/orders/{id}"'],
    ["tx", ")"],
  ],
  [
    ["kw", "async def "],
    ["fn", "get_order"],
    ["tx", "(id: "],
    ["kw", "int"],
    ["tx", "):"],
  ],
  [
    ["tx", "    order = "],
    ["kw", "await "],
    ["tx", "repo.get(id)"],
  ],
  [
    ["kw", "    if "],
    ["tx", "order "],
    ["kw", "is None"],
    ["tx", ":"],
  ],
  [
    ["kw", "        raise "],
    ["fn", "HTTPException"],
    ["tx", "(404)"],
  ],
  [
    ["kw", "    return "],
    ["tx", "order"],
  ],
];
type Token = "kw" | "tx" | "st" | "fn";
const TOTAL_CHARS = CODE.reduce((a, line) => a + line.reduce((b, [, s]) => b + s.length, 0), 0);

interface Palette {
  dark: boolean;
  bg: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  accent2Text: string;
  ok: string;
  danger: string;
}

/** Cores dos tokens do CSS (app/globals.css), lidas no tema atual. */
function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (k: string) => cs.getPropertyValue(`--${k}`).trim();
  return {
    dark: document.documentElement.classList.contains("dark"),
    bg: v("bg"),
    line: v("line"),
    text: v("text"),
    muted: v("text-3"),
    accent: v("accent"),
    accentText: v("accent-text"),
    accent2Text: v("accent-2-text"),
    ok: v("ok"),
    danger: v("danger"),
  };
}

/** Famílias das fontes do site (next/font dá nomes próprios a elas; ver app/[locale]/layout.tsx). */
function fontFamily(variable: string, fallback: string) {
  return getComputedStyle(document.body).getPropertyValue(variable).trim() || fallback;
}

export async function createHeroScene(
  container: HTMLElement,
  opts: HeroSceneOptions
): Promise<HeroScene> {
  const onState = opts.onState ?? (() => {});
  const capture = !!opts.capture;
  const textures: Texture[] = [];

  const CODE_FONT = fontFamily("--font-code", "monospace");
  const HEADING_FONT = fontFamily("--font-heading", "sans-serif");
  // Os painéis são desenhados em canvas: as fontes precisam estar carregadas antes (a mono não é pré-carregada).
  await Promise.all([
    document.fonts.load(`500 22px ${CODE_FONT}`),
    document.fonts.load(`700 34px ${HEADING_FONT}`),
  ]).catch(() => {});

  /* ── Renderização ─────────────────────────────────────────────────── */
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.tabIndex = -1;
  canvas.className = "scene-canvas";

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: capture,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const maxRatio = opts.coarse ? 1.5 : 2;
  // Na captura do pôster, vale a densidade da página do script (scripts/render-scene-posters.ts).
  renderer.setPixelRatio(
    capture ? window.devicePixelRatio || 1 : Math.min(window.devicePixelRatio || 1, maxRatio)
  );

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envTex;
  scene.fog = new Fog(0x000000, 16, 38);
  const camera = new PerspectiveCamera(36, 1, 0.1, 120);
  const root = new Group();
  scene.add(root);

  /* ── Texturas procedurais (canvas): fios de cabelo, trama do moletom, veios da madeira, teclado ── */
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  function tex(
    w: number,
    h: number,
    draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
    rep?: [number, number]
  ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new CanvasTexture(c);
    t.wrapS = t.wrapT = RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]);
    t.anisotropy = 4;
    textures.push(t);
    return t;
  }
  const weave = tex(
    128,
    128,
    (g, w, h) => {
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0,0.10)";
        g.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 3) {
        g.fillStyle = "rgba(255,255,255,0.06)";
        g.fillRect(x, 0, 1, h);
      }
    },
    [6, 6]
  );
  const wood = tex(
    512,
    256,
    (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#a77a55");
      gr.addColorStop(1, "#946a48");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        const y = rnd() * h;
        g.strokeStyle = `rgba(70,40,20,${0.08 + rnd() * 0.12})`;
        g.lineWidth = 0.5 + rnd() * 1.5;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
        g.stroke();
      }
    },
    [1, 1]
  );
  const keyboard = tex(512, 192, (g, w, h) => {
    g.fillStyle = "#1b1a20";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#2c2b33";
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 14; c++) {
        g.beginPath();
        g.roundRect(8 + c * 35.5, 10 + r * 35, 30, 29, 5);
        g.fill();
      }
  });

  /* ── Materiais ─────────────────────────────────────────────────────── */
  const P = (o: MeshPhysicalMaterialParameters) => new MeshPhysicalMaterial(o);
  const mHoodie = P({
    roughness: 0.92,
    sheen: 0.45,
    sheenRoughness: 0.8,
    sheenColor: 0xe9dcff,
    bumpMap: weave,
    bumpScale: 0.35,
  });
  const mCord = P({ color: 0xf4f2f7, roughness: 0.7 });
  const mAluminum = P({ metalness: 0.85, roughness: 0.3, clearcoat: 0.4 });
  const mKeyboard = new MeshStandardMaterial({ map: keyboard, roughness: 0.7 });
  const mScreen = new MeshBasicMaterial({ toneMapped: false });
  const mBezel = P({ color: 0x0d0c10, roughness: 0.15, clearcoat: 1 });
  const mPhones = P({ color: 0x26222f, roughness: 0.45, clearcoat: 0.5 });
  const mCushion = P({ color: 0x1b1820, roughness: 0.95, sheen: 0.5, sheenColor: 0x5a5070 });
  const mMetal = P({ color: 0xc9c6d0, metalness: 1, roughness: 0.2 });
  const mLed = new MeshBasicMaterial({ toneMapped: false });
  const mDesk = P({ map: wood, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const mCeramic = P({ roughness: 0.18, clearcoat: 1 });
  const mCoffee = P({ color: 0x3a2116, roughness: 0.1, clearcoat: 1 });
  const mPot = P({ roughness: 0.6 });
  const mLeaf = P({
    color: 0x4f9a6e,
    roughness: 0.45,
    sheen: 0.4,
    sheenColor: 0xc8ffd8,
    side: DoubleSide,
  });
  const mTrackpad = P({ color: 0xb9b5c2, metalness: 0.6, roughness: 0.35 });

  function mesh(geo: BufferGeometry, mat: Material, parent: Object3D = root, castShadow = true) {
    const m = new Mesh(geo, mat);
    m.castShadow = castShadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const v2 = (x: number, y: number) => new Vector2(x, y);

  /* ── Luzes: principal com sombra suave, preenchimento, recorte roxo e a tela iluminando o rosto ── */
  const hemi = new HemisphereLight(0xffffff, 0x2a2235, 0.55);
  root.add(hemi);
  const sun = new DirectionalLight(0xfff3ea, 2.6);
  sun.position.set(-2.4, 3.6, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -1.8,
    right: 1.8,
    top: 2,
    bottom: -1.4,
    near: 1,
    far: 10,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  root.add(sun);
  const rim = new DirectionalLight(0xffffff, 1.8);
  rim.position.set(-3, 2.5, -3.5);
  root.add(rim);
  const screenLight = new PointLight(0xffffff, 1.4, 1.8, 2);
  screenLight.position.set(0, 0.45, -0.32);
  root.add(screenLight);

  /* ── Mesa, notebook, caneca, garrafa e planta ── */
  mesh(new RoundedBoxGeometry(2.15, 0.08, 1.3, 4, 0.03), mDesk, root, false).position.set(
    0,
    -0.04,
    -0.12
  );
  mesh(new RoundedBoxGeometry(0.98, 0.032, 0.64, 4, 0.014), mAluminum).position.set(0, 0.016, -0.2);
  const keys = mesh(new PlaneGeometry(0.84, 0.3), mKeyboard, root, false);
  keys.rotation.x = -PI / 2;
  keys.position.set(0, 0.0335, -0.06);
  mesh(new RoundedBoxGeometry(0.3, 0.004, 0.17, 2, 0.002), mTrackpad, root, false).position.set(
    0,
    0.033,
    -0.37
  );
  const lid = new Group();
  lid.position.set(0, 0.032, 0.115);
  // Tampa em pé, de propósito: ela cobre o peito e os braços, e acima dela aparecem só a cabeça, o capuz e o alto dos
  // ombros (decisão da dona em 2026-11-23, depois de ver os braços inteiros).
  lid.rotation.x = 0.16;
  root.add(lid);
  mesh(new RoundedBoxGeometry(0.98, 0.64, 0.022, 4, 0.012), mAluminum, lid).position.y = 0.32;
  const bezel = mesh(new PlaneGeometry(0.95, 0.61), mBezel, lid, false);
  bezel.position.set(0, 0.32, -0.0115);
  bezel.rotation.y = PI;
  const screen = mesh(new PlaneGeometry(0.88, 0.54), mScreen, lid, false);
  screen.position.set(0, 0.33, -0.0122);
  screen.rotation.y = PI;
  mesh(new CircleGeometry(0.04, 32), mLed, lid, false).position.set(0, 0.36, 0.0115);

  /* Caneca da Evelym (fotos enviadas pela dona em 2026-11-20): porcelana branca em tulipa, com base estreita, barriga
     arredondada e boca levemente aberta; alça em orelha do lado esquerdo; "Evelym" em letra cursiva (o traçado da
     assinatura do site, components/layout/Signature.tsx) entre quatro corações vermelhos. */
  const mug = new Group();
  mug.position.set(0.74, 0, -0.18);
  mug.rotation.y = 0.08; // o nome de frente para a câmera
  root.add(mug);
  // Contorno externo (raio, altura), da base à boca.
  const mugOuter = new SplineCurve([
    v2(0.057, 0.004),
    v2(0.071, 0.02),
    v2(0.085, 0.05),
    v2(0.09, 0.082),
    v2(0.088, 0.115),
    v2(0.084, 0.15),
    v2(0.086, 0.182),
  ]).getPoints(48);
  mesh(
    new LatheGeometry(
      [
        v2(0, 0),
        v2(0.054, 0),
        ...mugOuter,
        v2(0.0855, 0.185),
        v2(0.0795, 0.181),
        v2(0.077, 0.13),
        v2(0.079, 0.07),
        v2(0.066, 0.022),
        v2(0, 0.02),
      ],
      56
    ),
    mCeramic,
    mug
  );
  const coffee = mesh(new CircleGeometry(0.0775, 40), mCoffee, mug, false);
  coffee.rotation.x = -PI / 2;
  coffee.position.y = 0.152;
  // Alça em orelha: grossa, larga e arredondada, presa logo abaixo da boca e no começo da barriga.
  const handleCurve = new CatmullRomCurve3([
    new Vector3(-0.079, 0.152, 0),
    new Vector3(-0.112, 0.162, 0),
    new Vector3(-0.142, 0.146, 0),
    new Vector3(-0.155, 0.108, 0),
    new Vector3(-0.145, 0.07, 0),
    new Vector3(-0.115, 0.047, 0),
    new Vector3(-0.088, 0.045, 0),
  ]);
  mesh(new TubeGeometry(handleCurve, 40, 0.0125, 14, false), mCeramic, mug);
  // Estampa: uma faixa que acompanha a barriga da caneca, um tiquinho por fora, com o desenho num canvas.
  const DECAL_ARC = 2.1;
  const decalProfile = new SplineCurve(mugOuter)
    .getPoints(64)
    .filter((p) => p.y > 0.03 && p.y < 0.155)
    .map((p) => v2(p.x + 0.0007, p.y));
  const decalMap = tex(1024, 640, (g, w, h) => {
    // "Evelym": os seis primeiros desenhos da assinatura (caixa de 3,7 a 277,9 por 11,8 a 149,6 no desenho original).
    const k = 2.85;
    g.save();
    g.translate(w / 2 - ((3.7 + 277.9) / 2) * k, h * 0.5 - ((11.8 + 149.6) / 2) * k + 30);
    g.scale(k, k);
    g.fillStyle = "#17151c";
    g.strokeStyle = "#17151c";
    g.lineWidth = 2.6;
    for (const d of SIGNATURE.glyphs.slice(0, 6)) {
      const path = new Path2D(d);
      g.fill(path);
      g.stroke(path);
    }
    g.restore();
    // Corações: dois acima e dois abaixo do nome, como na caneca.
    const heart = (x: number, y: number, size: number) => {
      g.save();
      g.translate(x, y);
      g.scale(size / 20, size / 20);
      g.fillStyle = "#d8262e";
      g.beginPath();
      g.moveTo(0, 6);
      g.bezierCurveTo(-12, -2, -8, -12, 0, -6);
      g.bezierCurveTo(8, -12, 12, -2, 0, 6);
      g.fill();
      g.restore();
    };
    heart(w * 0.26, h * 0.13, 46);
    heart(w * 0.74, h * 0.17, 46);
    heart(w * 0.3, h * 0.9, 46);
    heart(w * 0.7, h * 0.88, 46);
  });
  decalMap.wrapS = decalMap.wrapT = ClampToEdgeWrapping;
  decalMap.colorSpace = SRGBColorSpace;
  mesh(
    new LatheGeometry(decalProfile, 48, -DECAL_ARC / 2, DECAL_ARC),
    P({
      map: decalMap,
      transparent: true,
      roughness: 0.18,
      clearcoat: 1,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
    mug,
    false
  );
  // Vapor: branco no escuro; no claro, branco some no fundo, então vira um cinza-lilás (cor e pico em `setTheme`).
  let steamPeak = 0.28;
  const steam = [0, 1, 2].map(() => {
    const m = new Mesh(
      new SphereGeometry(0.03, 12, 10),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
    );
    root.add(m);
    return m;
  });
  /* Garrafa térmica (copo de 887 ml com alça, pedido da dona em 2026-11-20): corpo creme com quatro listras, aro de
     metal, tampa e alça lilás. Sem logo de marca. Fica à direita e atrás da caneca, para não escondê-la. */
  const bottle = new Group();
  bottle.position.set(0.93, 0, -0.42);
  bottle.rotation.y = -0.35;
  root.add(bottle);
  const mBottle = P({ color: 0xf4efe6, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.5 });
  const mLilac = P({ color: 0xb48ad8, roughness: 0.38, clearcoat: 0.45 });
  // Aço escovado claro: totalmente metálico, ele refletiria o fundo escuro e ficaria preto.
  const mSteel = P({ color: 0xdedce4, metalness: 0.55, roughness: 0.3, clearcoat: 0.6 });
  // Perfil: base estreita, que alarga no terço de baixo e segue quase reta até o aro.
  const bottleProfile = [
    v2(0, 0),
    v2(0.05, 0),
    v2(0.057, 0.006),
    v2(0.058, 0.085),
    v2(0.07, 0.14),
    v2(0.074, 0.27),
    v2(0.075, 0.3),
    v2(0, 0.3),
  ];
  mesh(new LatheGeometry(bottleProfile, 48), mBottle, bottle);
  // Raio do corpo na altura y (entre 0,14 e 0,3), para as listras acompanharem o afunilamento.
  const bodyRadius = (y: number) => 0.07 + ((y - 0.14) / 0.13) * 0.004 + 0.0012;
  const stripes: [number, number][] = [
    [0.226, 0xef6a4b],
    [0.206, 0xf3ad3d],
    [0.186, 0xc6a3e8],
    [0.166, 0xec5b3f],
  ];
  for (const [y, color] of stripes) {
    const h = 0.014;
    const band = mesh(
      new CylinderGeometry(bodyRadius(y + h / 2), bodyRadius(y - h / 2), h, 48, 1, true),
      P({ color, roughness: 0.45, clearcoat: 0.4 }),
      bottle,
      false
    );
    band.position.y = y;
  }
  mesh(new CylinderGeometry(0.0765, 0.0765, 0.026, 48), mSteel, bottle).position.y = 0.313;
  const cap = mesh(new CylinderGeometry(0.074, 0.0785, 0.03, 48), mLilac, bottle);
  cap.position.y = 0.341;
  mesh(new RoundedBoxGeometry(0.032, 0.04, 0.03, 3, 0.008), mLilac, bottle).position.set(
    0,
    0.37,
    0.03
  );
  // Alça: uma tira em arco presa nas laterais da tampa, inclinada para trás.
  const strap = mesh(new TorusGeometry(0.079, 0.011, 10, 40, PI), mLilac, bottle);
  strap.scale.set(1, 1.05, 1.9);
  strap.position.set(0, 0.345, -0.01);
  strap.rotation.x = -0.3;
  for (const side of [-1, 1]) {
    const hinge = mesh(new CylinderGeometry(0.012, 0.012, 0.014, 20), mSteel, bottle);
    hinge.rotation.z = PI / 2;
    hinge.position.set(side * 0.081, 0.345, -0.01);
  }

  const potProfile = [v2(0, 0), v2(0.07, 0), v2(0.095, 0.15), v2(0.088, 0.155), v2(0.08, 0.14)];
  mesh(new LatheGeometry(potProfile, 32), mPot).position.set(-0.8, 0, 0.1);
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * PI * 2;
    const leaf = mesh(new SphereGeometry(0.06, 16, 12), mLeaf);
    leaf.scale.set(0.45, 1.7, 0.18);
    leaf.position.set(-0.8 + Math.cos(a) * 0.03, 0.22 + (f % 3) * 0.02, 0.1 + Math.sin(a) * 0.03);
    leaf.rotation.set(Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5);
  }

  /* ── Personagem: modelo 3D gerado no Blender por scripts/personagem/ (rosto do retrato da Evelym, cabelo, moletom) ── */
  const Z = -0.95;
  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  const evelym = gltf.scene;
  evelym.scale.setScalar(MODEL_SCALE);
  root.add(evelym);
  const centro = evelym.getObjectByName("centro_cabeca");
  if (!centro) throw new Error("modelo sem o ponto centro_cabeca");
  // O centro da cabeça vai para onde ficava o da personagem anterior: as mãos, na pose do modelo, chegam ao teclado.
  evelym.updateMatrixWorld(true);
  evelym.position.add(
    new Vector3(0, 1.0, Z + 0.06).sub(root.worldToLocal(centro.getWorldPosition(new Vector3())))
  );
  // Cabelo: cor quase preta, brilho de fio na direção das mechas (anisotropia) e transparência desenhada aqui. No modelo,
  // a raiz de cada mecha fica no alto da textura e a ponta embaixo. As pontas são tufos que afinam de forma suave (colunas
  // de 1 pixel, cada uma terminando numa altura, viravam pontinhos espetados de longe, 2026-11-23).
  const hairAlpha = tex(256, 512, (g, w, h) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    // Tufos largos, de borda nítida e sem degradê: com degradê, a ponta se desfazia em pontinhos sobre o capuz.
    g.fillStyle = "#fff";
    let x = 0;
    while (x < w) {
      const largura = 14 + Math.floor(rnd() * 18);
      const ponta = (0.86 + rnd() * 0.12) * h; // onde o tufo termina
      const bico = (0.03 + rnd() * 0.04) * h; // quanto o tufo afina até a ponta
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + largura, 0);
      g.lineTo(x + largura, ponta - bico);
      g.quadraticCurveTo(x + largura, ponta, x + largura / 2, ponta);
      g.quadraticCurveTo(x, ponta, x, ponta - bico);
      g.closePath();
      g.fill();
      x += largura;
    }
  });
  // fios de tons diferentes, em faixas de alguns pixels, que quebram a superfície lisa do alto da cabeça
  const hairStreaks = tex(256, 64, (g, w, h) => {
    for (let x = 0; x < w;) {
      const largura = 2 + Math.floor(rnd() * 4);
      const v = Math.round(150 + rnd() * 85);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x, 0, largura, h);
      x += largura;
    }
  });
  hairStreaks.colorSpace = SRGBColorSpace;
  const mModelHair = P({
    color: 0x1a1412,
    map: hairStreaks,
    roughness: 0.42,
    // faixa de brilho clara ao longo das mechas, como em cabelo preto liso (mais baixa: a luz de recorte roxa pintava o
    // alto da cabeça)
    specularIntensity: 0.55,
    specularColor: 0xfff4ee,
    sheen: 0.3,
    sheenColor: 0x3a302c,
    sheenRoughness: 0.5,
    anisotropy: 0.5,
    anisotropyRotation: PI / 2,
    alphaMap: hairAlpha,
    // recorte comum: o recorte suave (alpha to coverage) deixava pontinhos soltos onde a ponta fica mais fina que um pixel
    alphaTest: 0.5,
    side: DoubleSide,
    envMapIntensity: 0.45,
  });

  const blinkers: Mesh[] = [];
  evelym.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    if (m.morphTargetDictionary?.piscar !== undefined) blinkers.push(m);
    m.castShadow = m.receiveShadow = true;
    m.frustumCulled = false; // a caixa de uma malha com esqueleto não acompanha os ossos
    const mat = m.material as MeshStandardMaterial;
    if (mat.name === "evelym.female_sportsuit01") m.material = mHoodie;
    else if (mat.name === "evelym.cordao") m.material = mCord;
    else if (mat.name === "evelym.pele") {
      m.material = P({
        map: mat.map,
        roughness: 0.5,
        sheen: 0.4,
        sheenColor: 0xffcfa8,
        sheenRoughness: 0.55,
      });
      mat.dispose();
    } else if (mat.name === "evelym.cabelo") {
      m.material = mModelHair;
      // sem sombra própria: no mapa de sombra (1024 px), as mechas recortadas viravam pontinhos escuros no capuz
      m.castShadow = false;
      mat.map?.dispose();
      mat.dispose();
    } else if (mat.name === "evelym.eyelashes02") {
      // transparência recortada: sem problema de ordem de desenho entre as mechas
      // (o carregador desliga a escrita de profundidade em material transparente; sem ela, o couro cabeludo cobre o cabelo)
      mat.transparent = false;
      mat.depthWrite = true;
      mat.alphaTest = 0.5;
      mat.side = DoubleSide;
      mat.envMapIntensity = 0.55;
    }
  });
  const bone = (name: string) => {
    const b = evelym.getObjectByName(name);
    if (!b) throw new Error(`modelo sem o osso ${name}`);
    return b;
  };
  const headBone = bone("head");
  const chest = bone("spine_02");
  const hands = (["l", "r"] as const).map((s) => ({
    hand: bone(`hand_${s}`),
    fingers: ["index", "middle", "ring", "pinky"].map((f) => bone(`${f}_01_${s}`)),
  }));
  const rest = new Map<Object3D, Quaternion>();
  for (const b of [headBone, chest, ...hands.flatMap((h) => [h.hand, ...h.fingers])])
    rest.set(b, b.quaternion.clone());
  const AX = new Vector3(1, 0, 0);
  const AY = new Vector3(0, 1, 0);
  const qParent = new Quaternion();
  const qInv = new Quaternion();
  const qTurn = new Quaternion();
  const qNod = new Quaternion();
  /** Gira o osso a partir da pose de descanso por `q`, um giro dado nos eixos da cena. */
  function turn(b: Object3D, q: Quaternion) {
    b.parent!.getWorldQuaternion(qParent);
    qInv.copy(qParent).invert();
    b.quaternion.copy(qInv).multiply(q).multiply(qParent).multiply(rest.get(b)!);
  }
  // Os fones são da cena (já aprovados), presos ao centro da cabeça, no tamanho da cabeça do modelo.
  const head = new Group();
  head.scale.setScalar(PHONES_SCALE);
  centro.add(head);

  // headphone: arco com acolchoado, hastes de metal, conchas com almofada e um LED
  mesh(new TorusGeometry(0.305, 0.02, 14, 64, PI), mPhones, head).position.set(0, 0, -0.03);
  const padding = mesh(new TorusGeometry(0.288, 0.016, 10, 48, PI * 0.5), mCushion, head);
  padding.position.set(0, 0, -0.03);
  padding.rotation.z = PI * 0.25;
  for (const s of [-1, 1]) {
    mesh(new RoundedBoxGeometry(0.02, 0.09, 0.03, 2, 0.006), mMetal, head).position.set(
      0.305 * s,
      -0.035,
      -0.03
    );
    const cup = mesh(new CylinderGeometry(0.095, 0.1, 0.065, 40), mPhones, head);
    cup.rotation.z = PI / 2;
    cup.position.set(0.305 * s, -0.09, -0.02);
    const pad = mesh(new TorusGeometry(0.075, 0.026, 16, 36), mCushion, head);
    pad.rotation.y = PI / 2;
    pad.position.set(0.268 * s, -0.09, -0.02);
    const rimRing = mesh(new TorusGeometry(0.07, 0.006, 10, 40), mMetal, head, false);
    rimRing.rotation.y = PI / 2;
    rimRing.position.set(0.339 * s, -0.09, -0.02);
    const led = mesh(new CircleGeometry(0.012, 16), mLed, head, false);
    led.position.set(0.3395 * s, -0.06, 0.02);
    led.rotation.y = (PI / 2) * s;
  }

  /* ── Painéis flutuantes (editor, terminal, selo); a tela do notebook mostra o mesmo código ── */
  function panel(w: number, h: number, cw: number, ch: number) {
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = ch;
    const t = new CanvasTexture(cv);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    textures.push(t);
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false })
    );
    m.scale.setScalar(0.6);
    root.add(m);
    return { m, ctx: cv.getContext("2d")!, tex: t };
  }
  const editor = panel(1.75, 1.12, 700, 448);
  const terminal = panel(1.3, 0.66, 520, 264);
  const badge = panel(1.05, 0.34, 420, 136);
  editor.m.position.set(-1.0, 1.2, -0.85);
  editor.m.rotation.y = 0.32;
  terminal.m.position.set(1.0, 1.38, -0.95);
  terminal.m.rotation.y = -0.32;
  badge.m.position.set(0.96, 0.92, -0.62);
  badge.m.rotation.y = -0.32;
  mScreen.map = editor.tex;

  const L = opts.labels;
  const ink = {
    bg: "",
    line: "",
    tx: "",
    muted: "",
    kw: "",
    st: "",
    fn: "",
    ok: "",
    fail: "",
    okBg: "",
  };
  let lastTyped = -1;
  let lastTests = -1;
  let lastBadge = -1;
  const frame = (c: CanvasRenderingContext2D, w: number, h: number, r: number) => {
    c.clearRect(0, 0, w, h);
    c.beginPath();
    c.roundRect(4, 4, w - 8, h - 8, r);
    c.fillStyle = ink.bg;
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = ink.line;
    c.stroke();
  };
  const titleBar = (c: CanvasRenderingContext2D, title: string) => {
    [ink.fail, "#e0b84d", ink.ok].forEach((color, i) => {
      c.beginPath();
      c.arc(30 + i * 22, 30, 6, 0, 7);
      c.fillStyle = color;
      c.fill();
    });
    c.fillStyle = ink.muted;
    c.font = `500 18px ${CODE_FONT}`;
    c.fillText(title, 110, 36);
  };
  function drawEditor(n: number) {
    const c = editor.ctx;
    frame(c, 700, 448, 22);
    titleBar(c, L.editorTitle);
    c.font = `500 22px ${CODE_FONT}`;
    let left = n;
    let cursor = false;
    CODE.forEach((line, i) => {
      let x = 34;
      const y = 92 + i * 52;
      c.fillStyle = ink.muted;
      c.fillText(String(i + 1), x, y);
      x = 72;
      for (const [kind, s] of line) {
        if (left <= 0) break;
        const t = s.slice(0, left);
        left -= s.length;
        c.fillStyle = ink[kind];
        c.fillText(t, x, y);
        x += c.measureText(t).width;
      }
      if (left <= 0 && n < TOTAL_CHARS && !cursor) {
        c.fillStyle = ink.kw;
        c.fillRect(x + 2, y - 20, 3, 26);
        cursor = true;
      }
    });
    editor.tex.needsUpdate = true;
  }
  function drawTerminal(done: number) {
    const c = terminal.ctx;
    frame(c, 520, 264, 22);
    titleBar(c, L.testsTitle);
    c.font = `500 22px ${CODE_FONT}`;
    c.fillStyle = ink.tx;
    c.fillText("$ pytest", 30, 100);
    c.fillStyle = ink.ok;
    c.fillText("•".repeat(Math.round(done * 14)), 30, 150);
    if (done >= 1) {
      c.font = `700 24px ${CODE_FONT}`;
      c.fillText(L.testsPassed, 30, 210);
    } else if (done > 0) {
      c.fillStyle = ink.muted;
      c.fillText(L.testsRunning, 30, 210);
    }
    terminal.tex.needsUpdate = true;
  }
  function drawBadge(on: boolean) {
    const c = badge.ctx;
    c.clearRect(0, 0, 420, 136);
    c.beginPath();
    c.roundRect(4, 4, 412, 128, 64);
    c.fillStyle = on ? ink.okBg : ink.bg;
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = on ? ink.ok : ink.line;
    c.stroke();
    c.beginPath();
    c.arc(68, 68, 26, 0, 7);
    c.fillStyle = on ? ink.ok : ink.line;
    c.fill();
    c.fillStyle = on ? ink.tx : ink.muted;
    c.font = on ? `700 34px ${HEADING_FONT}` : `600 28px ${HEADING_FONT}`;
    c.fillText(on ? L.deployLive : L.deployWaiting, 112, 80);
    badge.tex.needsUpdate = true;
  }

  /* ── Tema: cores dos tokens, aplicadas sem recriar nada ── */
  function setTheme() {
    const c = readPalette();
    (scene.fog as Fog).color.set(c.bg);
    hemi.groundColor.set(c.dark ? "#1e1a26" : "#cfc8da");
    hemi.intensity = c.dark ? 0.32 : 0.6;
    rim.color.set(c.accent);
    rim.intensity = c.dark ? 2.2 : 1.2;
    mHoodie.color.set(c.dark ? "#9468dc" : "#8a5bd6");
    mAluminum.color.set(c.dark ? "#5a5866" : "#cdc9d6");
    mCeramic.color.set("#f7f5fa");
    mPot.color.set(c.dark ? "#3b3747" : "#e4dfec");
    mLed.color.set(c.accent2Text || c.accentText);
    for (const m of steam)
      (m.material as MeshBasicMaterial).color.set(c.dark ? "#ffffff" : "#8a7fa3");
    steamPeak = c.dark ? 0.28 : 0.4;
    screenLight.color.set(c.dark ? "#c9b8ff" : "#d9ccff");
    Object.assign(ink, {
      bg: c.dark ? "rgba(26,25,32,0.95)" : "rgba(255,255,255,0.96)",
      line: c.line,
      tx: c.text,
      muted: c.muted,
      kw: c.accentText,
      st: c.accent2Text || c.accentText,
      fn: c.dark ? "#8fd3ff" : "#1f6fb2",
      ok: c.ok,
      fail: c.danger,
      okBg: c.dark ? "rgba(91,196,138,0.16)" : "rgba(20,92,49,0.10)",
    });
    lastTyped = lastTests = lastBadge = -1;
    if (!raf) renderAt(clock);
  }

  /* ── Quadro: história, mãos digitando, cabeça, vapor e câmera ── */
  const lookAt = new Vector3(0, 0.66, -0.42);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let progress = 0;

  function update(t: number) {
    const u = t % CYCLE;
    const typed = Math.min(TOTAL_CHARS, Math.floor(u * 14));
    if (typed !== lastTyped) drawEditor((lastTyped = typed));
    const done = Math.min(1, Math.max(0, (u - 12) / 3.5));
    const testsKey = Math.round(done * 14) + (done >= 1 ? 100 : 0);
    if (testsKey !== lastTests) {
      lastTests = testsKey;
      drawTerminal(done);
    }
    const live = u >= 16 ? 1 : 0;
    if (live !== lastBadge) drawBadge((lastBadge = live) === 1);

    // respiração: o peito sobe e desce devagar (antes das mãos, que estão presas a ele)
    turn(chest, qTurn.setFromAxisAngle(AX, Math.sin(t * 1.4) * 0.012));
    // piscada a cada ~4 s, às vezes dupla
    const bt = t % 4.3;
    const blink =
      bt < 0.16
        ? Math.sin((bt / 0.16) * PI)
        : t % 12.9 > 12.5 && bt > 0.3 && bt < 0.46
          ? Math.sin(((bt - 0.3) / 0.16) * PI)
          : 0;
    for (const m of blinkers) m.morphTargetInfluences![m.morphTargetDictionary!.piscar] = blink;
    // mãos e dedos digitando (calmos quando o código termina)
    const typing = typed < TOTAL_CHARS ? 1 : 0.12;
    hands.forEach((side, i) => {
      turn(side.hand, qTurn.setFromAxisAngle(AY, Math.sin(t * 2.3 + i * 1.7) * 0.06 * typing));
      side.fingers.forEach((f, j) => {
        const curl = Math.max(0, Math.sin(t * 11 + j * 1.9 + i * 3.1)) * 0.45 * typing;
        turn(f, qTurn.setFromAxisAngle(AX, curl));
      });
    });
    // cabeça: leve aceno de concentração, acompanhando o ponteiro
    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    qTurn.setFromAxisAngle(AY, Math.sin(t * 0.33) * 0.05 + ptr.x * 0.1);
    turn(headBone, qTurn.multiply(qNod.setFromAxisAngle(AX, 0.06 + Math.sin(t * 0.8) * 0.02)));
    steam.forEach((m, i) => {
      const fz = (t * 0.22 + i / 3) % 1;
      m.position.set(0.74 + Math.sin(fz * 6 + i) * 0.025, 0.2 + fz * 0.4, -0.18);
      (m.material as MeshBasicMaterial).opacity = Math.sin(fz * PI) * steamPeak;
      m.scale.setScalar(0.6 + fz * 1.2);
    });
    editor.m.position.y = 1.2 + Math.sin(t * 0.6) * 0.025;
    terminal.m.position.y = 1.38 + Math.sin(t * 0.6 + 1.5) * 0.025;
    badge.m.position.y = 0.92 + Math.sin(t * 0.6 + 3) * 0.02;
    // câmera em três quartos, enquadrando tudo (nada cortado), com parallax leve do ponteiro e da rolagem
    camera.position.set(1.05 + ptr.x * 0.3, 1.55 - ptr.y * 0.2, 3.85 - progress * 0.3);
    camera.lookAt(lookAt);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ── Laço, pausa, rebaixamento e falhas ───────────────────────────── */
  let raf = 0;
  let inView = true;
  let failed = false;
  let downgraded = false;
  let clock = POSTER_T;
  let last = 0;
  let windowTime = 0;
  let windowFrames = 0;

  function renderAt(t: number) {
    update(t);
    renderer.render(scene, camera);
  }
  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    const real = last ? (now - last) / 1000 : 0;
    last = now;
    clock += dt;
    renderAt(clock);
    if (opts.noDowngrade || !real) return;
    windowTime += real;
    windowFrames++;
    if (windowTime >= FPS_WINDOW) {
      const fps = windowFrames / windowTime;
      windowTime = windowFrames = 0;
      if (fps >= MIN_FPS) return;
      if (!downgraded) {
        downgraded = true;
        renderer.setPixelRatio(1);
        resize();
      } else fail();
    }
  }
  function play() {
    if (capture || raf || !inView || document.hidden || failed) return;
    last = 0;
    windowTime = windowFrames = 0;
    raf = requestAnimationFrame(tick);
    onState("running");
  }
  function pause() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
    onState("paused");
  }
  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) play();
    else pause();
  });
  const ro = new ResizeObserver(() => {
    resize();
    if (!raf) renderAt(clock);
  });
  const onVisibility = () => (document.hidden ? pause() : play());
  const onPointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    ptr.tx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
    ptr.ty = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    fail();
  };
  function fail() {
    if (failed) return;
    failed = true;
    destroy();
    onState("poster");
  }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    container.closest("section")?.removeEventListener("pointermove", onPointer);
    canvas.removeEventListener("webglcontextlost", onLost);
    // Libera geometrias, materiais e texturas da GPU.
    const materials = new Set<Material>();
    scene.traverse((obj) => {
      const m = obj as Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => materials.add(mat));
    });
    materials.forEach((mat) => mat.dispose());
    textures.forEach((t) => t.dispose());
    sun.shadow.map?.dispose();
    envTex.dispose();
    renderer.dispose();
    container.classList.remove("is-live");
    canvas.remove();
  }

  /* ── Montagem: o primeiro quadro é o do pôster, para a troca imagem → cena não ter salto ── */
  setTheme();
  container.appendChild(canvas);
  resize();
  renderAt(POSTER_T);
  ro.observe(container);
  if (!capture) {
    io.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    if (!opts.coarse)
      container.closest("section")?.addEventListener("pointermove", onPointer, { passive: true });
  }
  canvas.addEventListener("webglcontextlost", onLost);
  requestAnimationFrame(() => {
    container.classList.add("is-live");
    play();
  });

  return {
    setTheme: () => setTheme(),
    setProgress(p: number) {
      progress = Math.min(1, Math.max(0, p));
      if (!raf && !failed) renderAt(clock);
    },
    destroy() {
      if (failed) return;
      failed = true;
      destroy();
    },
  };
}

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
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
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
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type MeshPhysicalMaterialParameters,
  type Object3D,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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
  const strands = tex(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 520; i++) {
        const x = rnd() * w;
        g.strokeStyle = `rgba(${rnd() < 0.5 ? "40,40,40" : "200,200,200"},0.35)`;
        g.lineWidth = 0.6 + rnd();
        g.beginPath();
        g.moveTo(x, 0);
        g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.7, x + 3, h);
        g.stroke();
      }
    },
    [3, 1]
  );
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
  const mSkin = P({
    color: 0xc4875f,
    roughness: 0.5,
    sheen: 0.4,
    sheenColor: 0xffcfa8,
    sheenRoughness: 0.55,
  });
  const mLip = P({ color: 0x9b5552, roughness: 0.55, clearcoat: 0.08 });
  const mLipLine = new MeshStandardMaterial({ color: 0x6e3433, roughness: 0.6 });
  const mHair = P({
    color: 0x15100e,
    roughness: 0.4,
    sheen: 1,
    sheenRoughness: 0.32,
    sheenColor: 0x6b5852,
    bumpMap: strands,
    bumpScale: 0.6,
    side: DoubleSide,
  });
  const mBrow = new MeshStandardMaterial({ color: 0x1c1210, roughness: 0.8 });
  const mSclera = P({ color: 0xf5f0ec, roughness: 0.15, clearcoat: 1 });
  const mIris = P({ color: 0x2c1a10, roughness: 0.18, clearcoat: 1 });
  const mPupil = new MeshBasicMaterial({ color: 0x0b0707 });
  const mGlint = new MeshBasicMaterial({ color: 0xffffff });
  const mLash = new MeshStandardMaterial({ color: 0x120b0d, roughness: 0.6 });
  const mHoodie = P({
    roughness: 0.92,
    sheen: 0.45,
    sheenRoughness: 0.8,
    sheenColor: 0xe9dcff,
    bumpMap: weave,
    bumpScale: 0.35,
  });
  const mCord = P({ color: 0xf4f2f7, roughness: 0.7 });
  const mAglet = P({ color: 0xd9d6de, metalness: 1, roughness: 0.25 });
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
  lid.rotation.x = 0.3;
  root.add(lid);
  mesh(new RoundedBoxGeometry(0.98, 0.64, 0.022, 4, 0.012), mAluminum, lid).position.y = 0.32;
  const bezel = mesh(new PlaneGeometry(0.95, 0.61), mBezel, lid, false);
  bezel.position.set(0, 0.32, -0.0115);
  bezel.rotation.y = PI;
  const screen = mesh(new PlaneGeometry(0.88, 0.54), mScreen, lid, false);
  screen.position.set(0, 0.33, -0.0122);
  screen.rotation.y = PI;
  mesh(new CircleGeometry(0.04, 32), mLed, lid, false).position.set(0, 0.36, 0.0115);

  const mugProfile = [
    v2(0, 0),
    v2(0.075, 0),
    v2(0.085, 0.01),
    v2(0.088, 0.17),
    v2(0.08, 0.175),
    v2(0.078, 0.02),
  ];
  mesh(new LatheGeometry(mugProfile, 40), mCeramic).position.set(0.74, 0, -0.18);
  const coffee = mesh(new CircleGeometry(0.077, 32), mCoffee, root, false);
  coffee.rotation.x = -PI / 2;
  coffee.position.set(0.74, 0.15, -0.18);
  const handle = mesh(new TorusGeometry(0.05, 0.013, 12, 28, PI * 1.25), mCeramic);
  handle.position.set(0.835, 0.09, -0.18);
  handle.rotation.z = -PI * 0.62;
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

  /* ── Corpo: moletom com capuz, cordões com ponteira de metal ── */
  const Z = -0.95;
  const torsoProfile = [
    v2(0.33, -0.3),
    v2(0.36, -0.05),
    v2(0.37, 0.22),
    v2(0.355, 0.42),
    v2(0.3, 0.54),
    v2(0.17, 0.62),
    v2(0.1, 0.64),
  ];
  const torso = mesh(new LatheGeometry(torsoProfile, 48), mHoodie);
  torso.position.set(0, 0.02, Z);
  torso.scale.set(1.12, 1, 0.74);
  const hood = mesh(new TorusGeometry(0.17, 0.07, 18, 44), mHoodie);
  hood.position.set(0, 0.64, Z - 0.05);
  hood.rotation.x = 1.25;
  hood.scale.set(1.3, 1, 1);
  const hoodBack = mesh(new SphereGeometry(0.2, 32, 24, 0, PI * 2, 0, PI / 2), mHoodie);
  hoodBack.position.set(0, 0.6, Z - 0.2);
  hoodBack.rotation.x = -1.9;
  hoodBack.scale.set(1.15, 0.7, 0.85);
  for (const x of [-0.055, 0.055]) {
    const c = mesh(new CylinderGeometry(0.008, 0.008, 0.2, 8), mCord);
    c.position.set(x, 0.5, Z + 0.255);
    c.rotation.x = -0.12;
    mesh(new CylinderGeometry(0.01, 0.009, 0.03, 10), mAglet).position.set(x, 0.39, Z + 0.268);
  }
  mesh(new CylinderGeometry(0.075, 0.085, 0.2, 24), mSkin).position.set(0, 0.72, Z + 0.02);

  /* ── Braços, punhos e mãos com dedos que digitam ── */
  const UP = new Vector3(0, 1, 0);
  const dir = new Vector3();
  const mid = new Vector3();
  function link(m: Mesh, a: Vector3, b: Vector3, r: number) {
    dir.subVectors(b, a);
    const L = dir.length();
    mid.addVectors(a, b).multiplyScalar(0.5);
    m.position.copy(mid);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    m.scale.set(1, Math.max(0.01, L - 2 * r), 1);
  }
  const sides = [-1, 1].map((s) => {
    const hand = new Group();
    root.add(hand);
    mesh(new SphereGeometry(0.05, 20, 14), mSkin, hand).scale.set(1, 0.45, 1.15);
    const fingers = [0, 1, 2, 3].map((i) => {
      const d = new Group();
      d.position.set((-0.03 + i * 0.02) * -s, -0.008, 0.045);
      hand.add(d);
      const g = mesh(
        new CapsuleGeometry(0.0095, 0.04 - Math.abs(i - 1.5) * 0.006, 4, 10),
        mSkin,
        d
      );
      g.rotation.x = PI / 2 + 0.5;
      g.position.set(0, -0.012, 0.022);
      return d;
    });
    const thumb = mesh(new CapsuleGeometry(0.011, 0.032, 4, 10), mSkin, hand);
    thumb.position.set(0.045 * -s, -0.01, 0.02);
    thumb.rotation.set(PI / 2, 0, 0.7 * s);
    return {
      s,
      shoulder: new Vector3(0.35 * s, 0.5, Z),
      elbow: new Vector3(0.42 * s, 0.15, Z + 0.38),
      wrist: new Vector3(0.17 * s, 0.075, -0.4),
      base: new Vector3(0.17 * s, 0.075, -0.4),
      arm: mesh(new CapsuleGeometry(0.085, 1, 8, 20), mHoodie),
      forearm: mesh(new CapsuleGeometry(0.072, 1, 8, 20), mHoodie),
      cuff: mesh(new TorusGeometry(0.055, 0.018, 12, 28), mHoodie),
      hand,
      fingers,
    };
  });

  /* ── Cabeça: rosto a partir das fotos da Evelym (pele dourada, olhos amendoados com gatinho, sorriso leve) ── */
  const head = new Group();
  head.position.set(0, 1.0, Z + 0.06);
  head.rotation.x = 0.15;
  root.add(head);
  mesh(new SphereGeometry(0.25, 56, 40), mSkin, head).scale.set(0.9, 1.04, 0.95);
  const chin = mesh(new SphereGeometry(0.135, 40, 28), mSkin, head);
  chin.position.set(0, -0.135, 0.075);
  chin.scale.set(0.95, 0.86, 0.95);
  for (const s of [-1, 1]) {
    const ear = mesh(new SphereGeometry(0.04, 16, 12), mSkin, head);
    ear.position.set(0.222 * s, -0.02, 0);
    ear.scale.set(0.4, 1, 0.75);
  }
  function stroke(pts: number[][], r: number, mat: Material, parent: Object3D) {
    const curve = new CatmullRomCurve3(pts.map((q) => new Vector3(q[0], q[1], q[2] ?? 0)));
    return mesh(new TubeGeometry(curve, 24, r, 6, false), mat, parent, false);
  }
  const blush = new MeshBasicMaterial({
    map: tex(64, 64, (g, w, h) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(214,110,96,0.55)");
      gr.addColorStop(1, "rgba(214,110,96,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }),
    transparent: true,
    depthWrite: false,
  });
  const eyes = [-1, 1].map((s) => {
    const g = new Group();
    g.position.set(0.083 * s, -0.004, 0.204);
    g.scale.set(1.14 * s, 1.14, 1.14); // espelha o lado esquerdo
    head.add(g);
    const eye = new Group();
    g.add(eye);
    mesh(new SphereGeometry(0.03, 32, 20), mSclera, eye, false).scale.set(1.3, 0.68, 0.4);
    const iris = mesh(new SphereGeometry(0.0145, 28, 20), mIris, eye, false);
    iris.position.set(0.001, -0.002, 0.0092);
    iris.scale.set(1, 1, 0.36);
    const pupil = mesh(new SphereGeometry(0.0068, 20, 14), mPupil, eye, false);
    pupil.position.set(0.001, -0.002, 0.0118);
    pupil.scale.set(1, 1, 0.36);
    mesh(new CircleGeometry(0.0036, 12), mGlint, eye, false).position.set(-0.004, 0.004, 0.0148);
    mesh(new CircleGeometry(0.0016, 8), mGlint, eye, false).position.set(0.006, -0.007, 0.0148);
    // cílios com gatinho, linha de baixo e sobrancelha
    stroke(
      [
        [-0.041, -0.001, 0.009],
        [-0.02, 0.0135, 0.012],
        [0.01, 0.0165, 0.012],
        [0.034, 0.0095, 0.011],
        [0.05, 0.019, 0.007],
      ],
      0.0036,
      mLash,
      g
    );
    stroke(
      [
        [-0.032, -0.01, 0.011],
        [-0.005, -0.0175, 0.012],
        [0.028, -0.011, 0.011],
      ],
      0.001,
      mBrow,
      g
    );
    stroke(
      [
        [-0.042, 0.036, 0.008],
        [-0.015, 0.049, 0.01],
        [0.018, 0.049, 0.01],
        [0.045, 0.038, 0.006],
      ],
      0.0058,
      mBrow,
      g
    );
    const cheek = mesh(new PlaneGeometry(0.08, 0.06), blush, head, false);
    cheek.position.set(0.112 * s, -0.078, 0.214);
    cheek.rotation.y = 0.42 * s;
    return eye;
  });
  // nariz pequeno, ponta arredondada e asas discretas
  const nose = new Group();
  nose.position.set(0, -0.064, 0.232);
  head.add(nose);
  mesh(new SphereGeometry(0.0145, 24, 16), mSkin, nose).scale.set(1.15, 0.88, 0.75);
  const bridge = mesh(new SphereGeometry(0.011, 20, 14), mSkin, nose);
  bridge.position.set(0, 0.03, -0.007);
  bridge.scale.set(0.8, 2.6, 0.75);
  for (const s of [-1, 1])
    mesh(new SphereGeometry(0.0085, 16, 12), mSkin, nose).position.set(0.0125 * s, -0.004, -0.008);
  // boca: lábios rosa-amarronzados e a linha do sorriso com os cantos para cima
  const mouth = new Group();
  mouth.position.set(0, -0.118, 0.212);
  head.add(mouth);
  const upper = mesh(new SphereGeometry(0.022, 28, 16), mLip, mouth, false);
  upper.scale.set(1.55, 0.26, 0.42);
  upper.position.y = 0.0035;
  const lower = mesh(new SphereGeometry(0.022, 28, 16), mLip, mouth, false);
  lower.scale.set(1.38, 0.34, 0.46);
  lower.position.y = -0.007;
  stroke(
    [
      [-0.036, 0.004, 0.0085],
      [-0.013, -0.0015, 0.0098],
      [0.013, -0.0015, 0.0098],
      [0.036, 0.004, 0.0085],
    ],
    0.0014,
    mLipLine,
    mouth
  );
  // cabelo: chanel até os ombros (casca com abertura para o rosto e pontas para dentro), franja de lado
  const hairProfile = [
    v2(0.001, 0.29),
    v2(0.14, 0.275),
    v2(0.235, 0.2),
    v2(0.272, 0.06),
    v2(0.278, -0.08),
    v2(0.29, -0.22),
    v2(0.3, -0.33),
    v2(0.27, -0.375),
    v2(0.245, -0.36),
  ];
  mesh(new LatheGeometry(hairProfile, 64, 1.05, PI * 2 - 2.1), mHair, head).scale.set(1, 1, 1.02);
  mesh(
    new LatheGeometry(
      [v2(0.001, 0.292), v2(0.14, 0.277), v2(0.222, 0.215), v2(0.245, 0.17), v2(0.252, 0.15)],
      48
    ),
    mHair,
    head
  );
  const fringe = mesh(
    new LatheGeometry(
      [
        v2(0.001, 0.297),
        v2(0.15, 0.283),
        v2(0.248, 0.2),
        v2(0.27, 0.135),
        v2(0.266, 0.1),
        v2(0.255, 0.092),
      ],
      40,
      -0.25,
      1.15
    ),
    mHair,
    head
  );
  fringe.rotation.z = 0.3;
  fringe.position.set(-0.02, -0.01, 0);
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

    // mãos e dedos digitando (calmos quando o código termina); braços acompanham
    const typing = typed < TOTAL_CHARS ? 1 : 0.12;
    sides.forEach((side, i) => {
      const lat = Math.sin(t * 2.3 + i * 1.7) * 0.025 * typing;
      side.wrist.set(
        side.base.x + lat,
        side.base.y + Math.max(0, Math.sin(t * 6 + i)) * 0.006 * typing,
        side.base.z
      );
      side.hand.position.copy(side.wrist);
      side.hand.rotation.set(0.12, -0.15 * side.s, 0);
      side.fingers.forEach((d, j) => {
        d.rotation.x = Math.max(0, Math.sin(t * 11 + j * 1.9 + i * 3.1)) * 0.5 * typing;
      });
      link(side.arm, side.shoulder, side.elbow, 0.085);
      link(side.forearm, side.elbow, side.wrist, 0.072);
      side.cuff.position.copy(side.wrist);
      side.cuff.position.z -= 0.035;
      side.cuff.quaternion.copy(side.forearm.quaternion);
      side.cuff.rotateX(PI / 2);
    });
    // cabeça: leve aceno de concentração, acompanhando o ponteiro; piscadas
    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    head.rotation.x = 0.15 + Math.sin(t * 0.8) * 0.02;
    head.rotation.y = Math.sin(t * 0.33) * 0.05 + ptr.x * 0.1;
    const blink = t % 4.6 < 0.13;
    for (const eye of eyes) eye.scale.y = blink ? 0.12 : 1;
    steam.forEach((m, i) => {
      const fz = (t * 0.22 + i / 3) % 1;
      m.position.set(0.74 + Math.sin(fz * 6 + i) * 0.025, 0.2 + fz * 0.4, -0.18);
      (m.material as MeshBasicMaterial).opacity = Math.sin(fz * PI) * 0.28;
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

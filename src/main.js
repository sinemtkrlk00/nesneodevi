//npm install lil-gui
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * 1. Kurulum
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0f19');
const gui = new GUI({ title: 'Kedi & Işık Kontrolü' });
const sizes = { width: window.innerWidth, height: window.innerHeight };

/**
 * 2. Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * 3. Kamera ve Kontroller
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3.5, 9);
scene.add(camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1.6, 0);

/**
 * 4. Materyaller
 */
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.0 });
const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffb6c9, roughness: 0.6 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
const noseMat = new THREE.MeshStandardMaterial({ color: 0xff8fab, roughness: 0.4 });
const bowMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.4 });
const whiskerMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.2 });

/**
 * 5. Zemin
 */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
floor.rotation.x = -Math.PI * 0.5;
floor.receiveShadow = true;
scene.add(floor);

/**
 * 6. Kedi Figürü
 */
const cat = new THREE.Group();
scene.add(cat);

// yardımcı: gölgeli mesh oluştur
const makeMesh = (geo, mat, parent = cat) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// Gövde
const body = makeMesh(new THREE.SphereGeometry(0.8, 48, 48), whiteMat);
body.scale.set(0.95, 1.05, 0.85);
body.position.set(0, 0.9, 0);

// Bacaklar
[-1, 1].forEach((s) => {
  const leg = makeMesh(new THREE.SphereGeometry(0.32, 32, 32), whiteMat);
  leg.scale.set(1, 0.8, 1.3);
  leg.position.set(s * 0.42, 0.25, 0.3);
});

// Kollar
[-1, 1].forEach((s) => {
  const arm = makeMesh(new THREE.SphereGeometry(0.22, 32, 32), whiteMat);
  arm.scale.set(0.8, 1.5, 0.8);
  arm.position.set(s * 0.82, 1.0, 0.2);
  arm.rotation.z = s * -0.35;
});

// Kuyruk
const tail = makeMesh(new THREE.SphereGeometry(0.22, 24, 24), whiteMat);
tail.scale.set(0.8, 1.6, 0.8);
tail.position.set(0.7, 0.55, -0.6);
tail.rotation.z = -0.9;

// Kafa grubu (ayrı animasyon için)
const head = new THREE.Group();
head.position.set(0, 2.2, 0);
cat.add(head);

const skull = makeMesh(new THREE.SphereGeometry(1, 64, 64), whiteMat, head);
skull.scale.set(1.25, 1, 1);

// Kulaklar (dış + iç pembe)
[-1, 1].forEach((s) => {
  const ear = makeMesh(new THREE.ConeGeometry(0.4, 0.7, 24), whiteMat, head);
  ear.position.set(s * 0.8, 0.95, 0);
  ear.rotation.z = s * -0.35;
  const inner = makeMesh(new THREE.ConeGeometry(0.25, 0.45, 24), pinkMat, head);
  inner.position.set(s * 0.8, 0.9, 0.12);
  inner.rotation.z = s * -0.35;
});

// Gözler
[-1, 1].forEach((s) => {
  const eye = makeMesh(new THREE.SphereGeometry(0.09, 24, 24), blackMat, head);
  eye.scale.set(0.9, 1.3, 0.5);
  eye.position.set(s * 0.45, 0.05, 0.93);
});

// Burun
const nose = makeMesh(new THREE.SphereGeometry(0.08, 24, 24), noseMat, head);
nose.scale.set(1.3, 0.8, 0.6);
nose.position.set(0, -0.08, 0.98);

// Ağız (yarım halka)
const mouth = makeMesh(new THREE.TorusGeometry(0.1, 0.014, 12, 32, Math.PI), blackMat, head);
mouth.rotation.z = Math.PI;
mouth.position.set(0, -0.18, 0.98);

// Yanaklar
[-1, 1].forEach((s) => {
  const cheek = makeMesh(new THREE.SphereGeometry(0.13, 24, 24), pinkMat, head);
  cheek.scale.set(1.2, 0.7, 0.3);
  cheek.position.set(s * 0.75, -0.1, 0.62);
  cheek.rotation.y = s * 0.8;
});

// Bıyıklar
[-1, 1].forEach((s) => {
  [-1, 0, 1].forEach((i) => {
    const pivot = new THREE.Group();
    pivot.position.set(s * 1.0, -0.05 + i * 0.12, 0.6);
    pivot.rotation.y = s * -0.6;
    pivot.rotation.z = s * i * 0.18;
    const w = makeMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), whiskerMat, pivot);
    w.rotation.z = Math.PI / 2;
    w.position.x = s * 0.35;
    head.add(pivot);
  });
});

// Profesyonel fiyonk oluşturucu
const createBow = (color = 0xff5c8a, size = 1) => {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05 });
  const group = new THREE.Group();

  // Kanat silueti: merkezde dar, dışa doğru genişleyen, yuvarlak uçlu
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.04);
  shape.bezierCurveTo(0.15, 0.12, 0.35, 0.30, 0.52, 0.26);
  shape.bezierCurveTo(0.62, 0.20, 0.62, -0.20, 0.52, -0.26);
  shape.bezierCurveTo(0.35, -0.30, 0.15, -0.12, 0, -0.04);
  shape.lineTo(0, 0.04);

  const wingGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 5,
    curveSegments: 32
  });
  wingGeo.translate(0, 0, -0.04);

  // Sağ ve sol kanat (uçları hafif geriye kıvrık)
  const right = makeMesh(wingGeo, mat, group);
  right.rotation.y = 0.25;
  const left = makeMesh(wingGeo, mat, group);
  left.rotation.y = Math.PI - 0.25;

  // Ortadaki düğüm
  const knotMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
  const knot = makeMesh(new THREE.SphereGeometry(0.13, 32, 32), knotMat, group);
  knot.scale.set(0.9, 1.25, 0.9);

  group.scale.setScalar(size);
  return group;
};

// Kafadaki fiyonk (sağ kulağın yanı)
const headBow = createBow(0xff5c8a, 0.9);
headBow.position.set(0.85, 0.6, 0.38);
headBow.rotation.set(-0.3, 0.7, -0.3);
head.add(headBow);

// İsterseniz boyuna da küçük bir fiyonk
const neckBow = createBow(0x34d399, 0.55);
neckBow.position.set(0, 1.62, 0.62);
cat.add(neckBow);
/**
 * 7. Üç Noktalı Aydınlatma
 */
const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
keyLight.position.set(3, 5, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 14;
keyLight.shadow.camera.left = -4;
keyLight.shadow.camera.right = 4;
keyLight.shadow.camera.top = 4;
keyLight.shadow.camera.bottom = -4;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.HemisphereLight(0x87ceeb, 0x111122, 0.8);
scene.add(fillLight);

const rimLight = new THREE.SpotLight(0x38bdf8, 40, 14, Math.PI * 0.25, 0.4, 1);
rimLight.position.set(-3, 4, -3);
rimLight.target = head;
rimLight.castShadow = true;
rimLight.shadow.mapSize.set(1024, 1024);
scene.add(rimLight);

const movingPointLight = new THREE.PointLight(0xf59e0b, 8, 8);
movingPointLight.castShadow = true;
movingPointLight.shadow.mapSize.set(1024, 1024);
scene.add(movingPointLight);

/**
 * 8. Helper'lar
 */
const keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 0.5);
const rimLightHelper = new THREE.SpotLightHelper(rimLight);
const pointLightHelper = new THREE.PointLightHelper(movingPointLight, 0.2);
scene.add(keyLightHelper, rimLightHelper, pointLightHelper);
keyLightHelper.visible = false;
rimLightHelper.visible = false;
pointLightHelper.visible = false;

/**
 * 9. GUI
 */
const helpersFolder = gui.addFolder('Işık Yardımcıları');
helpersFolder.add(keyLightHelper, 'visible').name('Ana Işık Helper');
helpersFolder.add(rimLightHelper, 'visible').name('Kenar Işık Helper');
helpersFolder.add(pointLightHelper, 'visible').name('Nokta Işık Helper');

const lightsFolder = gui.addFolder('Işık Şiddetleri');
lightsFolder.add(keyLight, 'intensity').min(0).max(10).step(0.1).name('Ana Işık (Key)');
lightsFolder.add(fillLight, 'intensity').min(0).max(5).step(0.1).name('Dolgu (Fill)');
lightsFolder.add(rimLight, 'intensity').min(0).max(100).step(1).name('Kenar (Rim)');
lightsFolder.add(movingPointLight, 'intensity').min(0).max(20).step(0.1).name('Hareketli Işık');

const catFolder = gui.addFolder('Kedi');
catFolder.addColor({ fiyonk: '#34d399' }, 'fiyonk').name('Fiyonk Rengi').onChange((v) => bowMat.color.set(v));
catFolder.addColor({ kedi: '#ffffff' }, 'kedi').name('Kedi Rengi').onChange((v) => whiteMat.color.set(v));

/**
 * 10. Resize
 */
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * 11. Animasyon
 */
const clock = new THREE.Clock();
const tick = () => {
  const t = clock.getElapsedTime();

  // Nefes alma ve hafif zıplama
  cat.position.y = Math.abs(Math.sin(t * 2)) * 0.05;
  body.scale.y = 1.05 + Math.sin(t * 2) * 0.015;

  // Kafa hafifçe sallanır
  head.rotation.z = Math.sin(t * 1.2) * 0.08;
  head.rotation.y = Math.sin(t * 0.8) * 0.2;

  // Kuyruk sallanır
  tail.rotation.z = -0.9 + Math.sin(t * 3) * 0.25;

  // Hareketli ışık yörüngesi
  movingPointLight.position.x = Math.sin(t * 1.5) * 2.5;
  movingPointLight.position.z = Math.cos(t * 1.5) * 2.5;
  movingPointLight.position.y = 1.5 + Math.sin(t * 3) * 0.5;

  if (rimLightHelper.visible) rimLightHelper.update();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
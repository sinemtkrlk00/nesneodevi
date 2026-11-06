//npm install lil-gui
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * 1. Kurulum ve Sahne Yapılandırması
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0f19');

// GUI Arayüzü
const gui = new GUI({ title: 'Aydınlatma & Kulaklık Kontrolü' });

// Ekran Boyutları
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

/**
 * 2. Renderer (İşleyici) ve Gölge Ayarları
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * 3. Kamera ve Kontroller
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 4, 9);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

/**
 * 4. Materyaller, Zemin ve Kulak Üstü Kulaklık Nesnesi
 */
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.8,
  metalness: 0.2
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  floorMaterial
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// --- KULAK ÜSTü KULAKLIK (MÜKEMMEL BİRLEŞİM HALİ) ---
const headphonesGroup = new THREE.Group();

const headphoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x111827,
  roughness: 0.4,
  metalness: 0.8
});

const cushionMaterial = new THREE.MeshStandardMaterial({
  color: 0x374151,
  roughness: 0.9,
  metalness: 0.1
});

const accentMaterial = new THREE.MeshStandardMaterial({
  color: 0x3b82f6,
  roughness: 0.2,
  metalness: 0.5
});

// 1. Kafa Bandı (Üst Yay)
const headbandGeometry = new THREE.TorusGeometry(0.9, 0.13, 16, 64, Math.PI);
const headband = new THREE.Mesh(headbandGeometry, headphoneMaterial);
headband.rotation.x = 0;
headband.position.y = 1.5;
headband.castShadow = true;
headphonesGroup.add(headband);

// 2. Sol Kulaklık Pedi ve Kapağı (Uç noktaya sabitlendi ve içe bakacak şekilde döndürüldü)
const earCupGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 32);

const leftCup = new THREE.Mesh(earCupGeometry, cushionMaterial);
leftCup.rotation.z = Math.PI * 0.5; // Yatay eksene çevrildi
leftCup.position.set(-0.9, 1.5, 0);
leftCup.castShadow = true;
headphonesGroup.add(leftCup);

const leftOuterCover = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.05, 32), accentMaterial);
leftOuterCover.rotation.z = Math.PI * 0.5;
leftOuterCover.position.set(-1.08, 1.5, 0);
headphonesGroup.add(leftOuterCover);

// 3. Sağ Kulaklık Pedi ve Kapağı
const rightCup = new THREE.Mesh(earCupGeometry, cushionMaterial);
rightCup.rotation.z = Math.PI * 0.5;
rightCup.position.set(0.9, 1.5, 0);
rightCup.castShadow = true;
headphonesGroup.add(rightCup);

const rightOuterCover = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.05, 32), accentMaterial);
rightOuterCover.rotation.z = Math.PI * 0.5;
rightOuterCover.position.set(1.08, 1.5, 0);
headphonesGroup.add(rightOuterCover);

headphonesGroup.position.set(0, 0.2, 0);
scene.add(headphonesGroup);

/**
 * 5. Aydınlatma (3-Point Lighting)
 */
const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
keyLight.position.set(3, 5, 2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 12;
keyLight.shadow.camera.left = -4;
keyLight.shadow.camera.right = 4;
keyLight.shadow.camera.top = 4;
keyLight.shadow.camera.bottom = -4;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.HemisphereLight(0x87ceeb, 0x111122, 0.8);
scene.add(fillLight);

const rimLight = new THREE.SpotLight(0x38bdf8, 4, 10, Math.PI * 0.15, 0.25, 1);
rimLight.position.set(-3, 4, -3);
rimLight.target = headphonesGroup;
rimLight.castShadow = true;
scene.add(rimLight);

/**
 * 6. GUI Kontrolleri
 */
const headphoneFolder = gui.addFolder('Kulaklık Kontrolü');
headphoneFolder.add(headphonesGroup.position, 'x').min(-3).max(3).step(0.1).name('Konum X');
headphoneFolder.add(headphonesGroup.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name('Dönüş Y');
headphoneFolder.add(headphonesGroup, 'visible').name('Görünürlük');

/**
 * 7. Pencerelerin Yeniden Boyutlandırılması
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
 * 8. Animasyon Döngüsü (Render Loop)
 */
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Kulaklığın hafifçe kendi etrafında dönmesi
  headphonesGroup.rotation.y = elapsedTime * 0.2;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
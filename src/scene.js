import * as THREE from 'three';
import { gsap } from 'gsap';
import { MASCOT_CONFIG, getMascotId } from './mascot.config.js';
import { buildMascot } from './mascots/registry.js';
import { disposeMascot } from './mascots/parts.js';

// Three different original chibi characters built from real 3D geometry.
// The scene is character-agnostic: all presets expose the same joints.
const stage = document.getElementById('mascot-stage');
const canvas = document.getElementById('mascot-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const hemisphere = new THREE.HemisphereLight(0xf7edff, 0xa99eb7, 2.4);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xffffff, 3.0);
  key.position.set(-3, 8, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9; key.shadow.camera.right = 9;
  key.shadow.camera.top = 9; key.shadow.camera.bottom = -9;
  key.shadow.normalBias = .025;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd4baff, 2.0);
  rim.position.set(4, 5, -6);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffd5ab, 24, 12);
  fill.position.set(4, 4, 3);
  scene.add(fill);

  const material = (color, extras = {}) => new THREE.MeshStandardMaterial({
    color, metalness: .03, roughness: .55, ...extras,
  });
  const gold = material(0xe6b568, { metalness: .27, roughness: .38 });

  function sphere(parent, mat, p, s, segments = 32) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments / 2)), mat);
    mesh.position.set(...p);
    mesh.scale.set(...s);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function box(parent, mat, p, s) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
    mesh.position.set(...p);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function prism(parent, mat, points, z) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    mesh.position.z = z;
    mesh.castShadow = false;
    parent.add(mesh);
    return mesh;
  }

  let selectedId = getMascotId(window.GRADUATION_SELECTED_MASCOT || MASCOT_CONFIG.selected);
  let character = buildMascot(selectedId);
  scene.add(character.group);

  // Platform and ambient decorations.
  const platform = new THREE.Group();
  scene.add(platform);
  const floorTop = new THREE.Mesh(new THREE.CylinderGeometry(2.26,2.33,.20,80), material(0xe9ddf3, { transparent:true,opacity:.83,roughness:.85 }));
  floorTop.position.y = -.20;
  floorTop.receiveShadow = true;
  platform.add(floorTop);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.23,.028,9,96), material(0xe8bfa1, {transparent:true,opacity:.9}));
  ring.rotation.x = Math.PI/2;
  ring.position.y = -.105;
  platform.add(ring);
  function shadowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64,64,2,64,64,64);
    g.addColorStop(0,'rgba(62,52,86,.37)');
    g.addColorStop(.5,'rgba(62,52,86,.16)');
    g.addColorStop(1,'rgba(62,52,86,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.5,2.6), new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false}));
  shadow.rotation.x = -Math.PI/2;
  shadow.position.set(0,-.083,.24);
  platform.add(shadow);

  // Floating sculpted stars around the mascot.
  function starShape() {
    const s = new THREE.Shape();
    for (let i=0;i<10;i++) {
      const a = (i*36-90)*Math.PI/180;
      const r = i%2===0 ? 1 : .38;
      const x = Math.cos(a)*r, y=Math.sin(a)*r;
      if (i===0) s.moveTo(x,y); else s.lineTo(x,y);
    }
    s.closePath();
    return s;
  }
  const starGeometry = new THREE.ShapeGeometry(starShape());
  const sparkleGroup = new THREE.Group();
  scene.add(sparkleGroup);
  const sparkleLocations = [
    [-2.14,3.6,-1.8,.16,0xffc98a],
    [1.91,3.5,-1.6,.23,0xc9a4fa],
    [-2.48,1.9,-.9,.13,0xe9b48b],
    [2.5,2.2,-1.0,.12,0xc0a8ed],
    [1.54,4.3,-2.1,.11,0xf0bd81],
    [-1.36,4.8,-2.0,.08,0xe2a8b7],
  ];
  const sparkles = [];
  for (const [x,y,z,s,color] of sparkleLocations) {
    const mesh = new THREE.Mesh(starGeometry, new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.86,depthWrite:false}));
    mesh.position.set(x,y,z);
    mesh.scale.setScalar(s);
    sparkleGroup.add(mesh);
    sparkles.push({mesh,y,phase:x*3});
  }

  // A real 3D letter, positioned and raycasted independently of the mascot.
  const envelope = new THREE.Group();
  envelope.name = 'Interactive 3D invitation envelope';
  scene.add(envelope);
  envelope.visible = false;
  const envBack = material(0xfffaf0, {roughness:.79});
  const envFlap = new THREE.MeshStandardMaterial({color:0xf1dfed,roughness:.8,side:THREE.DoubleSide});
  const envSide = new THREE.MeshStandardMaterial({color:0xfcf0e5,roughness:.8,side:THREE.DoubleSide});
  const envBottom = new THREE.MeshStandardMaterial({color:0xf8e8ef,roughness:.8,side:THREE.DoubleSide});
  box(envelope, envBack, [0,0,0], [1.67,1.075,.095]);
  prism(envelope, envSide, [[-.825,.52],[-.825,-.52],[.03,-.07]], .051);
  prism(envelope, envSide, [[.825,.52],[.825,-.52],[-.03,-.07]], .052);
  prism(envelope, envBottom, [[-.82,-.52],[.82,-.52],[0,.10]], .063);
  prism(envelope, envFlap, [[-.82,.52],[.82,.52],[0,-.13]], .076);
  sphere(envelope, gold, [0,-.125,.108], [.133,.133,.024], 24);
  const seal = new THREE.Mesh(starGeometry, new THREE.MeshBasicMaterial({color:0xfffaf4,side:THREE.DoubleSide}));
  seal.position.set(0,-.125,.137);
  seal.scale.setScalar(.065);
  envelope.add(seal);
  envelope.rotation.z = -.17;

  const clock = new THREE.Clock();
  const walk = {energy:0};
  let mobile = false;
  let ready = false;
  let intro;
  let envelopeHoverBase = 2;
  let playing = false;
  let wasDestroyed = false;

  function layout() {
    const rect = stage.getBoundingClientRect();
    mobile = rect.width < 850;
    camera.aspect = rect.width / Math.max(1,rect.height);
    if (mobile) {
      camera.fov = 39;
      camera.position.set(0,3.52,10.7);
      camera.lookAt(0,3.13,0);
    } else {
      camera.fov = 38;
      camera.position.set(0,2.65,10.8);
      camera.lookAt(0,1.66,0);
    }
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.45 : 1.9));
    renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    if (!playing && ready) {
      const end = endPose();
      character.group.position.x = end.px;
      platform.position.x = end.px;
      sparkleGroup.position.x = end.px;
      envelope.position.x = end.ex;
      envelope.position.y = end.ey;
      envelope.position.z = end.ez;
      envelopeHoverBase = end.ey;
    }
  }
  function endPose() {
    return mobile
      ? {px:0,ex:0,ey:2.55,ez:5.05}
      : {px:-2.42,ex:-1.05,ey:2.04,ez:4.30};
  }

  function makeReady() {
    playing = false;
    ready = true;
    walk.energy = 0;
    const e = endPose();
    envelopeHoverBase = e.ey;
    window.dispatchEvent(new Event('mascot:ready'));
  }

  function introAnimation() {
    if (intro) intro.kill();
    gsap.killTweensOf([character.group.position,character.group.scale,character.arms[1].rotation,envelope.position,envelope.rotation,envelope.scale,walk]);
    const end = endPose();
    const arrival = Math.max(1.5, Math.min(5, Number(MASCOT_CONFIG.arrivalDuration) || 2.8));
    playing = true;
    ready = false;
    walk.energy = 1;
    character.group.position.set(mobile ? 0 : -3.55, 0, -14);
    character.group.scale.setScalar(.54);
    character.group.rotation.set(0,0,0);
    character.arms[1].rotation.z = character.defaultArmAngles[1];
    envelope.visible = false;
    envelope.scale.setScalar(.01);
    envelope.rotation.set(0,-.33,-.16);
    platform.position.x = end.px;
    sparkleGroup.position.x = end.px;

    if (reducedMotion) {
      walk.energy = 0;
      character.group.position.set(end.px,0,.1);
      character.group.scale.setScalar(1);
      character.arms[1].rotation.z = character.waveArmAngle;
      envelope.visible = true;
      envelope.position.set(end.ex,end.ey,end.ez);
      envelope.scale.setScalar(1);
      makeReady();
      return;
    }

    intro = gsap.timeline({defaults:{ease:'power2.out'}});
    intro.to(character.group.position,{x:end.px,z:.10,duration:arrival},0)
      .to(character.group.scale,{x:1,y:1,z:1,duration:arrival},0)
      .to(walk,{energy:0,duration:1.2},arrival-1.05)
      .to(character.arms[1].rotation,{z:character.waveArmAngle,duration:.8,ease:'back.out(2)'},arrival-.55)
      .add(() => {
        envelope.visible = true;
        envelope.position.set(end.px+.9,1.55,1.08);
        envelope.scale.setScalar(.36);
      },arrival-.20)
      .to(envelope.position,{x:end.ex,y:end.ey,z:end.ez,duration:1.25,ease:'power3.out'},arrival-.18)
      .to(envelope.scale,{x:1,y:1,z:1,duration:1.2,ease:'back.out(1.2)'},arrival-.18)
      .to(envelope.rotation,{y:.10,z:-.06,duration:1.10},arrival-.18)
      .add(makeReady,arrival+1.20);
  }

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const normalizePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(mouse,camera);
    return ready && raycaster.intersectObjects(envelope.children,true).length>0;
  };
  canvas.addEventListener('pointermove',(event) => {
    canvas.style.cursor = normalizePointer(event) ? 'pointer' : 'default';
  },{passive:true});
  canvas.addEventListener('pointerdown',(event) => {
    if (normalizePointer(event)) window.dispatchEvent(new Event('mascot-envelope-click'));
  });

  // Hovering, blinking, footsteps and sparkles are calculated each frame.
  function frame() {
    if (wasDestroyed) return;
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    character.group.position.y = Math.sin(t*2.2)*.026 + walk.energy*Math.abs(Math.sin(t*12))*.10;
    character.group.rotation.z = Math.sin(t*1.4)*.022;
    character.head.rotation.z = Math.sin(t*1.65+.7)*.03;
    character.arms[0].rotation.z = character.defaultArmAngles[0] + Math.sin(t*(walk.energy>0.2?12:2.4))*(walk.energy*.40+.035);
    if (!playing) character.arms[1].rotation.z = character.waveArmAngle + Math.sin(t*2.6)*.065;
    character.feet[0].rotation.x = Math.sin(t*12)*walk.energy*.26;
    character.feet[1].rotation.x = Math.sin(t*12+Math.PI)*walk.energy*.26;
    // Short double blinks every 5.4 seconds.
    const blinkPeriod = t%5.4;
    const blinking = (blinkPeriod>4.57&&blinkPeriod<4.67) || (blinkPeriod>4.79&&blinkPeriod<4.89);
    character.eyes[0].scale.y = character.eyes[1].scale.y = blinking ? .10 : 1;
    for (const s of sparkles) {
      s.mesh.position.y = s.y+Math.sin(t*1.6+s.phase)*.16;
      s.mesh.rotation.z = Math.sin(t*.7+s.phase)*.19;
    }
    if (ready) {
      envelope.position.y = envelopeHoverBase+Math.sin(t*1.9)*.085;
      envelope.rotation.z = -.06+Math.sin(t*1.15)*.045;
    }
    renderer.render(scene,camera);
  }

  window.addEventListener('resize',layout,{passive:true});
  window.addEventListener('mascot:replay',()=>{
    document.body.classList.remove('letter-ready');
    introAnimation();
  });
  window.addEventListener('mascot:change', (event) => {
    const id = getMascotId(event.detail?.id);
    if (id !== selectedId) {
      if (intro) intro.kill();
      gsap.killTweensOf([character.group.position,character.group.scale,
        character.arms[1].rotation,envelope.position,envelope.rotation,envelope.scale,walk]);
      const old = character.group;
      scene.remove(old);
      disposeMascot(old);
      selectedId = id;
      character = buildMascot(id);
      scene.add(character.group);
    }
    document.body.classList.remove('letter-ready');
    introAnimation();
  });
  // Do not let the 3D envelope intercept interactions with the open dialog.
  window.addEventListener('invitation:opened',()=>{canvas.style.cursor='default';});
  layout();
  document.body.classList.add('is-three-ready');
  frame();
  introAnimation();
} catch (error) {
  // Fallback illustration and invitation buttons remain available.
  canvas.style.display = 'none';
  console.warn('Không thể khởi tạo WebGL. Đang dùng linh vật CSS dự phòng.',error);
}

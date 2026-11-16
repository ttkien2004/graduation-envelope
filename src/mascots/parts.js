import * as THREE from 'three';

/** Primitive parts for the three handcrafted animated mascots. */
export function createParts() {
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({
    color,
    metalness: .02,
    roughness: .57,
    ...extra,
  });
  const palette = {
    ivory: mat(0xfffaf5, {roughness:.79}),
    ink: mat(0x24283b, {roughness:.26}),
    shine: mat(0xffffff, {roughness:.12}),
    blush: mat(0xffb4bf, {transparent:true, opacity:.8,roughness:.88}),
    cap: mat(0x252e4b, {roughness:.39}),
    capDark: mat(0x1b2339, {roughness:.43}),
    gold: mat(0xf0bd75, {metalness:.22,roughness:.37}),
    lilac: mat(0xc7acec, {roughness:.65}),
  };
  function addMesh(parent, geometry, material, position, scale) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const sphere = (parent, material, position, scale, segments=30) => addMesh(parent,
    new THREE.SphereGeometry(1,segments,Math.max(14, Math.round(segments*.6))),
    material,position,scale);
  const box = (parent, material,position,size) => addMesh(parent,
    new THREE.BoxGeometry(...size),material,position);
  const cyl = (parent,material,position,radiusTop,radiusBottom,height,segments=32) => addMesh(parent,
    new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments), material, position);
  const tube = (parent,material,points,radius=.012) => addMesh(parent,
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),22,radius,6,false), material);

  function eyes(parent, positions, scale=[.12,.15,.07]) {
    const pivots=[];
    for (const position of positions) {
      const pivot=new THREE.Group();
      pivot.position.set(...position);
      sphere(pivot,palette.ink,[0,0,0],scale,24);
      sphere(pivot,palette.shine,[-.036,.045,scale[2]*.83],[.043,.050,.021],16);
      sphere(pivot,palette.shine,[.032,-.023,scale[2]*.92],[.019,.021,.012],12);
      parent.add(pivot);
      pivots.push(pivot);
    }
    return pivots;
  }
  function cap(parent, offset=0, size=1) {
    const capGroup = new THREE.Group();
    capGroup.position.y=offset;
    parent.add(capGroup);
    cyl(capGroup,palette.capDark,[0,3.17,.01],.55*size,.56*size,.3,32);
    const top=box(capGroup,palette.cap,[0,3.34,.015],[1.77*size,.11,1.6*size]);
    top.rotation.set(.02,-.15,-.037);
    sphere(capGroup,palette.gold,[.67*size,3.41,.24*size],[.069,.065,.068],16);
    tube(capGroup,palette.gold,[
      [.67*size,3.42,.24*size],[.83*size,3.27,.32*size],
      [.88*size,3.08,.35*size],[.83*size,2.94,.39*size],
    ],.024);
    sphere(capGroup,palette.gold,[.83*size,2.9,.39*size],[.055,.12,.055],16);
    return capGroup;
  }
  function sash(parent, x, y, z) {
    const left=box(parent,palette.lilac,[-x,y,z],[.18,.78,.075]);
    const right=box(parent,palette.lilac,[x,y,z],[.18,.78,.075]);
    left.rotation.z=-.16;right.rotation.z=.16;
    sphere(parent,palette.gold,[0,y+.13,z+.085],[.11,.11,.047],20);
    return [left,right];
  }
  function mouth(parent, points, color=palette.ink) { return tube(parent,color,points,.013); }
  return {THREE,mat,palette,sphere,box,cyl,tube,eyes,cap,sash,mouth};
}

export function disposeMascot(group) {
  const geometries = new Set();
  const materials = new Set();
  group.traverse((child) => {
    if (!child.isMesh) return;
    if (child.geometry) geometries.add(child.geometry);
    if (Array.isArray(child.material)) child.material.forEach(m=>materials.add(m));
    else if (child.material) materials.add(child.material);
  });
  geometries.forEach(g=>g.dispose());
  materials.forEach(m=>m.dispose());
}

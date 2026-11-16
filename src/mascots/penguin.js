export function createPenguin(p) {
  const {THREE,mat,palette,sphere,box,eyes,cap,sash,mouth} = p;
  const root = new THREE.Group(); root.name = 'Pingu / 3D graduation penguin';
  const navy=mat(0x293450,{roughness:.46});
  const midnight=mat(0x1b253d,{roughness:.40});
  const orange=mat(0xf3ab70,{roughness:.53});
  const white=palette.ivory;

  const feet=[new THREE.Group(),new THREE.Group()];
  [-.47,.47].forEach((x,i)=>{
    const foot=feet[i];foot.position.set(x,.22,.37);
    sphere(foot,orange,[0,-.03,.13],[.35,.17,.46]);
    for(const dx of [-.17,0,.17]) sphere(foot,orange,[dx,-.08,.45],[.12,.085,.18],18);
    root.add(foot);
  });
  sphere(root,navy,[0,1.31,0],[.96,1.16,.81]);
  sphere(root,white,[0,1.23,.67],[.76,.88,.24]);
  sash(root,.43,1.50,.78);

  const arms=[new THREE.Group(),new THREE.Group()];
  [-.85,.85].forEach((x,i)=>{
    const pivot=arms[i];pivot.position.set(x,1.94,0);
    const wing=sphere(pivot,navy,[i===0?-.20:.20,-.38,.04],[.30,.73,.32]);
    wing.rotation.z=i===0?-.25:.25;
    pivot.rotation.z=i===0?-.14:.15;
    root.add(pivot);
  });
  const head=new THREE.Group();root.add(head);
  sphere(head,navy,[0,2.43,.06],[.88,.84,.8]);
  sphere(head,white,[0,2.27,.72],[.77,.64,.20]);
  sphere(head,palette.blush,[-.53,2.24,.88],[.19,.10,.045],20);
  sphere(head,palette.blush,[.53,2.24,.88],[.19,.10,.045],20);
  const blinkingEyes=eyes(head,[[-.31,2.54,.889],[.31,2.54,.889]],[.117,.15,.070]);
  const beak=sphere(head,orange,[0,2.26,.934],[.19,.12,.15],24);
  beak.rotation.x=.15;
  mouth(head,[[-.11,2.10,.92],[0,2.073,.946],[.11,2.10,.92]],midnight);
  cap(head);
  return {group:root,head,arms,feet,eyes:blinkingEyes,defaultArmAngles:[-.14,.15], waveArmAngle:1.15};
}

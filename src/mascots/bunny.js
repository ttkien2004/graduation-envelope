export function createBunny(p) {
  const {THREE,mat,palette,sphere,eyes,cap,sash,mouth} = p;
  const root=new THREE.Group();root.name='Mochi / 3D graduation bunny';
  const lavender=mat(0xd9c3ef,{roughness:.78});
  const lavenderShade=mat(0xc1a4df,{roughness:.65});
  const pink=mat(0xf4afc4,{roughness:.78});
  const softPink=mat(0xffd8e1,{roughness:.88});
  const milk=palette.ivory;

  const feet=[new THREE.Group(),new THREE.Group()];
  [-.46,.46].forEach((x,i)=>{
    const foot=feet[i];foot.position.set(x,.22,.34);
    sphere(foot,lavender,[0,-.025,.16],[.35,.19,.50]);
    sphere(foot,softPink,[0,-.025,.50],[.19,.11,.07]);
    root.add(foot);
  });
  sphere(root,lavender,[0,1.29,0],[.91,1.13,.76]);
  sphere(root,milk,[0,1.23,.65],[.68,.87,.20]);
  sash(root,.43,1.49,.74);
  sphere(root,lavenderShade,[0,.87,-.77],[.26,.25,.25]); // cotton tail

  const arms=[new THREE.Group(),new THREE.Group()];
  [-.81,.81].forEach((x,i)=>{
    const pivot=arms[i];pivot.position.set(x,1.88,.045);
    const arm=sphere(pivot,lavender,[i===0?-.16:.16,-.37,.06],[.28,.64,.30]);
    arm.rotation.z=i===0?-.20:.20;
    sphere(pivot,milk,[i===0?-.25:.25,-.77,.14],[.19,.22,.20]);
    pivot.rotation.z=i===0?-.13:.13;root.add(pivot);
  });
  const head=new THREE.Group();root.add(head);
  sphere(head,lavender,[0,2.47,.02],[.87,.78,.73]);
  sphere(head,milk,[0,2.27,.65],[.61,.41,.22]);
  // Long outward-leaning ears extend beyond the mortarboard.
  for (const [x,angle] of [[-.50,.26],[.50,-.26]]) {
    const ear=new THREE.Group(); ear.position.set(x,2.96,-.08);ear.rotation.z=angle;
    sphere(ear,lavender,[0,.58,0],[.25,.80,.24]);
    sphere(ear,pink,[0,.61,.22],[.142,.57,.038]);
    head.add(ear);
  }
  const blinkingEyes=eyes(head,[[-.31,2.55,.708],[.31,2.55,.708]],[.115,.15,.063]);
  sphere(head,palette.blush,[-.54,2.28,.76],[.18,.10,.055]);
  sphere(head,palette.blush,[.54,2.28,.76],[.18,.10,.055]);
  sphere(head,pink,[0,2.34,.886],[.115,.085,.085]);
  mouth(head,[[-.14,2.22,.87],[0,2.19,.91],[.14,2.22,.87]],palette.ink);
  cap(head,.02,.93);
  return {group:root,head,arms,feet,eyes:blinkingEyes,defaultArmAngles:[-.13,.13],waveArmAngle:1.10};
}

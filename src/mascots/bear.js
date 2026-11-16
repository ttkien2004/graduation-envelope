export function createBear(p) {
  const {THREE,mat,palette,sphere,eyes,cap,sash,mouth} = p;
  const root=new THREE.Group();root.name='Bo / 3D graduation bear';
  const caramel=mat(0xc68f69,{roughness:.77});
  const cocoa=mat(0x8e5947,{roughness:.67});
  const biscuit=mat(0xf4d9b7,{roughness:.83});
  const toe=mat(0xd9a47e,{roughness:.85});
  const feet=[new THREE.Group(),new THREE.Group()];
  [-.46,.46].forEach((x,i)=>{
    const foot=feet[i];foot.position.set(x,.21,.33);
    sphere(foot,caramel,[0,-.025,.17],[.37,.20,.48]);
    for(const dx of [-.13,0,.13]) sphere(foot,toe,[dx,-.015,.55],[.07,.06,.04],16);
    root.add(foot);
  });
  sphere(root,caramel,[0,1.29,0],[.97,1.16,.80]);
  sphere(root,biscuit,[0,1.25,.69],[.70,.87,.20]);
  sash(root,.43,1.52,.79);
  const arms=[new THREE.Group(),new THREE.Group()];
  [-.85,.85].forEach((x,i)=>{
    const pivot=arms[i];pivot.position.set(x,1.91,.05);
    sphere(pivot,caramel,[i===0?-.18:.18,-.38,.05],[.31,.64,.34]);
    sphere(pivot,biscuit,[i===0?-.25:.25,-.76,.24],[.22,.20,.13]);
    pivot.rotation.z=i===0?-.15:.14;root.add(pivot);
  });
  const head=new THREE.Group();root.add(head);
  sphere(head,caramel,[0,2.45,.02],[.90,.84,.80]);
  [-.65,.65].forEach((x)=>{
    sphere(head,caramel,[x,3.04,-.03],[.31,.34,.24]);
    sphere(head,cocoa,[x,3.06,.20],[.16,.17,.038]);
  });
  sphere(head,biscuit,[0,2.24,.72],[.46,.32,.22]);
  sphere(head,cocoa,[0,2.33,.94],[.16,.105,.09]);
  mouth(head,[[-.12,2.14,.92],[0,2.12,.96],[.12,2.14,.92]],cocoa);
  sphere(head,palette.blush,[-.57,2.28,.77],[.17,.10,.054]);
  sphere(head,palette.blush,[.57,2.28,.77],[.17,.10,.054]);
  const blinkingEyes=eyes(head,[[-.32,2.56,.752],[.32,2.56,.752]],[.11,.145,.069]);
  cap(head,.055,.96);
  return {group:root,head,arms,feet,eyes:blinkingEyes,defaultArmAngles:[-.15,.14],waveArmAngle:1.05};
}

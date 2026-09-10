/* NORD: self-contained Three.js scene. Artwork extracted from the supplied product sheet.
 * Recreated geometry, not a scan. World gravity is independent from cup orientation.
 * Fixed-step ballistics, moving emission points, viscous rim buds and floor impacts.
 */
(()=>{'use strict';
const canvas=document.querySelector('#scene'),$=s=>document.querySelector(s);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){$('#loading').remove();$('#error').style.display='block';return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#080808');scene.fog=new THREE.FogExp2('#080808',.047);
const camera=new THREE.PerspectiveCamera(34,1,.1,80);camera.position.set(0,3.8,10.6);camera.lookAt(0,2.3,0);
scene.add(new THREE.HemisphereLight(0xe9e3dc,0x302720,.65));
function spot(color,intensity,x,y,z,size){const l=new THREE.SpotLight(color,intensity,40,.58,.85,1.4);l.position.set(x,y,z);l.target.position.set(0,2,0);l.castShadow=false;l.shadow.mapSize.set(size,size);l.shadow.bias=-.0003;l.shadow.normalBias=.02;l.shadow.camera.near=.5;scene.add(l,l.target);return l;}
spot(0xffe9d5,85,-4,7,5,2048);spot(0xd7e1f3,40,4,5,-3,1024);spot(0xfff8ee,19,1,3,6,512);
const studio=new THREE.Scene();studio.background=new THREE.Color('#292420');
for(const [x,y,z,w,h,c] of [[-3,4,2,3,5,0xffe5c8],[4,3,-2,2,4,0xd6e2ef],[0,6,0,5,3,0xffffff]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,1,0);studio.add(p);}
const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.1);scene.environment=env.texture;pmrem.dispose();
let seed=481;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function noiseTexture(size){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),d=ctx.createImageData(size,size);for(let i=0;i<d.data.length;i+=4){let n=110+random()*85;d.data[i]=n;d.data[i+1]=n;d.data[i+2]=n;d.data[i+3]=255;}ctx.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const stone=noiseTexture(256);stone.repeat.set(38,38);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x514a44,roughness:.95,map:stone,bumpMap:stone,bumpScale:.025}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const shCanvas=document.createElement('canvas');shCanvas.width=shCanvas.height=128;const shCtx=shCanvas.getContext('2d'),gr=shCtx.createRadialGradient(64,64,3,64,64,63);gr.addColorStop(0,'rgba(0,0,0,.52)');gr.addColorStop(.38,'rgba(0,0,0,.32)');gr.addColorStop(1,'rgba(0,0,0,0)');shCtx.fillStyle=gr;shCtx.fillRect(0,0,128,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);
function materialMap(key,repeat=1){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),d=x.createImageData(256,256);let h=key.includes('paper')?17:53;
 for(let i=0;i<d.data.length;i+=4){h=(h*1664525+1013904223)>>>0;const n=(h>>>24)-128;if(key.includes('Normal')){d.data[i]=128+n*.10;d.data[i+1]=128+n*.10;d.data[i+2]=245;d.data[i+3]=255;}else if(key==='top'){const px=(i/4)%256,py=((i/4)/256)|0;const v=82+28*Math.sin(px*.07+Math.sin(py*.05))+12*Math.sin((px+py)*.18);d.data[i]=Math.max(45,Math.min(120,v));d.data[i+1]=Math.max(24,Math.min(76,v*.57));d.data[i+2]=Math.max(15,Math.min(54,v*.38));d.data[i+3]=255;}else{const v=Math.max(90,Math.min(225,170+n*.25));d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}}
 x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const paperN=materialMap('paperNormal',3),paperR=materialMap('paperRough',3);
const paper=new THREE.MeshPhysicalMaterial({color:0xf1efea,roughness:.98,roughnessMap:paperR,normalMap:paperN,normalScale:new THREE.Vector2(.24,.24),envMapIntensity:.22,clearcoat:0});
const chocN=materialMap('chocNormal',1.8),chocR=materialMap('chocRough',1.8);
const chocolate=new THREE.MeshPhysicalMaterial({color:0x633b25,roughness:.91,roughnessMap:chocR,normalMap:chocN,normalScale:new THREE.Vector2(.28,.28),metalness:0,clearcoat:.12,clearcoatRoughness:.36,envMapIntensity:.52});
const wet=chocolate.clone();wet.roughness=.31;wet.roughnessMap=null;wet.normalScale.set(.08,.08);wet.clearcoat=.38;wet.clearcoatRoughness=.17;
const cup=new THREE.Group();scene.add(cup);cup.position.set(0,2.6,0);
function part(geo,mat,parent=cup){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const profile=[new THREE.Vector2(0,-.902),new THREE.Vector2(.70,-.902),new THREE.Vector2(.722,-.893),new THREE.Vector2(.73,-.876),new THREE.Vector2(.735,-.845),new THREE.Vector2(.906,.872),new THREE.Vector2(.916,.896),new THREE.Vector2(.923,.914),new THREE.Vector2(.917,.929),new THREE.Vector2(.898,.935),new THREE.Vector2(.883,.925),new THREE.Vector2(.88,.91),new THREE.Vector2(.891,.884)];
part(new THREE.LatheGeometry(profile,192),paper);
const rim=part(new THREE.TorusGeometry(.905,.028,16,128),paper);rim.rotation.x=Math.PI/2;rim.position.y=.91;
const bottom=part(new THREE.TorusGeometry(.726,.013,10,96),paper);bottom.rotation.x=Math.PI/2;bottom.position.y=-.904;
const tex=new THREE.TextureLoader().load(LABEL_DATA,()=>{$('#loading').classList.add('done');},undefined,()=>{$('#loading').remove();$('#error').style.display='block';});tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const decalGeo=new THREE.CylinderGeometry(.893,.746,1.47,96,1,true,-.91,1.82);
const decal=part(decalGeo,new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.94,normalMap:paperN,normalScale:new THREE.Vector2(.16,.16),envMapIntensity:.15,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.FrontSide}));decal.position.y=-.045;decal.renderOrder=2;
const capGeo=new THREE.BufferGeometry(),positions=[],uvs=[],indices=[];const NR=150,NA=256;
function photoRelief(r,a){return .42*Math.sin(11*a+17*r)+.28*Math.sin(23*a-9*r)+.18*Math.sin(37*a+31*r);}
function capHeight(r,a){
 const dome=.36*Math.pow(Math.max(0,1-r*r),.7);
 const phase=3*a+6.2*r+.35*Math.sin(a*2);
 const wave=.5+.5*Math.sin(phase);
 const folded=Math.pow(wave,3)*.155*Math.pow(Math.sin(Math.PI*r),.7);
 const asymmetric=.055*Math.sin(a+1.4)*r*(1-r)+.018*Math.sin(5*a+r*7)*r;
 const grain=.003*Math.sin(93*r+Math.sin(a*31)*3)*Math.sin(75*r-a*37)*r;
 return .952+dome+folded+asymmetric+.022*photoRelief(r,a)*Math.sin(Math.PI*r)+grain;
}
for(let i=0;i<=NR;i++){const r=i/NR;for(let j=0;j<=NA;j++){const a=j/NA*Math.PI*2;const edge=1+.024*Math.sin(7*a)+.013*Math.sin(13*a);positions.push(.938*r*Math.sin(a)*edge,capHeight(r,a),.938*r*Math.cos(a)*edge);uvs.push(.5+.5*r*Math.sin(a),.5+.5*r*Math.cos(a));}}
for(let i=0;i<NR;i++)for(let j=0;j<NA;j++){const a=i*(NA+1)+j,b=a+NA+1;indices.push(a,b,a+1,b,b+1,a+1);}
capGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));capGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));capGeo.setIndex(indices);capGeo.computeVertexNormals();const topTex=materialMap('top');topTex.colorSpace=THREE.SRGBColorSpace;const capMat=chocolate.clone();capMat.color.set(0xffffff);capMat.map=topTex;capMat.roughness=.95;capMat.clearcoat=.08;part(capGeo,capMat);
const lipPos=[],lipUV=[],lipIdx=[];const dripAngles=[-.82,-.23,.55,1.6,2.8,4.4];
function lipDepth(a){let d=.033;for(let i=0;i<dripAngles.length;i++){const q=Math.atan2(Math.sin(a-dripAngles[i]),Math.cos(a-dripAngles[i]));d+=(i%2?.105:.16)*Math.exp(-q*q/.008);}return d;}
for(let i=0;i<=12;i++){const v=i/12;for(let j=0;j<=NA;j++){const a=j/NA*Math.PI*2,rr=(.938+.014*Math.sin(Math.PI*v)-.026*v)*(1+.024*Math.sin(7*a)+.013*Math.sin(13*a));lipPos.push(rr*Math.sin(a),capHeight(1,a)-v*lipDepth(a),rr*Math.cos(a));lipUV.push(j/NA,v);}}
for(let i=0;i<12;i++)for(let j=0;j<NA;j++){let a=i*(NA+1)+j,b=a+NA+1;lipIdx.push(a,b,a+1,b,b+1,a+1);}
const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lipPos,3));lg.setAttribute('uv',new THREE.Float32BufferAttribute(lipUV,2));lg.setIndex(lipIdx);lg.computeVertexNormals();part(lg,wet);
const dropGeo=new THREE.SphereGeometry(1,14,12),puddleGeo=new THREE.SphereGeometry(1,22,10),drops=[],puddles=[],sources=[];
for(const a of [-.82,-.23,.55,1.6,2.8,4.4]){const local=new THREE.Vector3(.923*Math.sin(a),.92-lipDepth(a),.923*Math.cos(a));const bud=part(dropGeo,wet,scene);bud.scale.setScalar(.001);sources.push({local,bud,phase:random(),period:1.8+random()*1.5,previous:new THREE.Vector3(),ready:false});}
const velocity=new THREE.Vector3(),oldCup=new THREE.Vector3(),worldDown=new THREE.Vector3(0,-1,0),temp=new THREE.Vector3();let emissionCount=0,impactCount=0;
function emit(p,v,r,splash=false){if(drops.length>110)return;const mesh=part(dropGeo,wet,scene);mesh.position.copy(p);mesh.scale.set(r,r*1.3,r);mesh.receiveShadow=false;drops.push({mesh,v:v.clone(),r,splash,age:0});if(!splash)emissionCount++;}
function impact(d){impactCount++;const mesh=part(puddleGeo,wet,scene);mesh.position.set(d.mesh.position.x,.012+random()*.004,d.mesh.position.z);mesh.rotation.y=random()*Math.PI;mesh.scale.set(.02,.012,.02);mesh.castShadow=false;const radius=d.r*(2.3+random()*.7);puddles.push({mesh,age:0,r:radius});if(puddles.length>65){scene.remove(puddles.shift().mesh);}if(!d.splash){for(let i=0;i<4;i++){const a=random()*Math.PI*2;emit(new THREE.Vector3(mesh.position.x,.04,mesh.position.z),new THREE.Vector3(Math.cos(a)*(.25+random()*.4),.35+random()*.48,Math.sin(a)*(.25+random()*.4)),d.r*.28,true);}}}
let targetX=0,targetY=2.6,targetR=0,targetPitch=0,mode='move',dragging=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,accum=0,last=performance.now(),start=null;
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),dragPlane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hitPoint=new THREE.Vector3();
const clamp=THREE.MathUtils.clamp;
function pointerWorld(e){const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(dragPlane,hitPoint);}
canvas.addEventListener('pointerdown',e=>{pointerWorld(e);if(!ray.intersectObject(cup,true).length)return;dragging=true;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');start={x:hitPoint.x,y:hitPoint.y,px:e.clientX,py:e.clientY,cx:targetX,cy:targetY,r:targetR,p:targetPitch};if(e.pointerType!=='touch')canvas.focus({preventScroll:true});});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;pointerWorld(e);if(mode==='move'){targetX=clamp(start.cx+hitPoint.x-start.x,-(innerWidth<800?1.15:2.5),innerWidth<800?1.15:2.5);targetY=clamp(start.cy+hitPoint.y-start.y,1.62,3.55);targetR=clamp(-(hitPoint.x-start.x)*.2,-.48,.48);}else{targetR=clamp(start.r-(e.clientX-start.px)*.006,-.8,.8);targetPitch=clamp(start.p+(e.clientY-start.py)*.003,-.25,.28);}});
function release(){dragging=false;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
function setMode(m){mode=m;if(matchMedia('(pointer:coarse)').matches){canvas.style.touchAction='none';$('#reset').textContent='Listo ✓';}for(const x of ['move','tilt']){$('#'+x).classList.toggle('active',x===m);$('#'+x).setAttribute('aria-pressed',x===m);}$('#hint').textContent=m==='move'?'Arrastra el bote · Las gotas siguen la gravedad':'Arrastra a los lados para inclinar · La gravedad sigue hacia abajo';}
$('#move').onclick=()=>setMode('move');$('#tilt').onclick=()=>setMode('tilt');
function pauseUI(){$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Reanudar animación':'Pausar animación');$('#pause').setAttribute('aria-pressed',paused);}$('#pause').onclick=()=>{paused=!paused;pauseUI();};pauseUI();
function reset(){canvas.style.touchAction='pan-y';$('#reset').textContent='Recentrar ↺';targetX=0;targetY=2.6;targetR=0;targetPitch=0;for(const d of drops)scene.remove(d.mesh);for(const p of puddles)scene.remove(p.mesh);drops.length=0;puddles.length=0;for(const s of sources){s.phase=random()*.5;s.ready=false;}release();}$('#reset').onclick=reset;
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','A','D','r','R'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')targetX=clamp(targetX-.15,-1.15,1.15);if(e.key==='ArrowRight')targetX=clamp(targetX+.15,-1.15,1.15);if(e.key==='ArrowUp')targetY=clamp(targetY+.15,1.62,3.55);if(e.key==='ArrowDown')targetY=clamp(targetY-.15,1.62,3.55);if(e.key.toLowerCase()==='a')targetR=clamp(targetR+.1,-.8,.8);if(e.key.toLowerCase()==='d')targetR=clamp(targetR-.1,-.8,.8);if(e.key.toLowerCase()==='r')reset();}});
function step(dt){time+=dt;oldCup.copy(cup.position);const k=1-Math.exp(-dt*8);cup.position.x+=(targetX-cup.position.x)*k;cup.position.y+=(targetY+(dragging?0:Math.sin(time*.85)*.065)-cup.position.y)*k;cup.rotation.z+=(targetR-cup.rotation.z)*k;cup.rotation.x+=(targetPitch-cup.rotation.x)*k;cup.updateMatrixWorld(true);velocity.copy(cup.position).sub(oldCup).divideScalar(dt);
for(const s of sources){const p=cup.localToWorld(s.local.clone());const v=s.ready?p.clone().sub(s.previous).divideScalar(dt):new THREE.Vector3();s.previous.copy(p);s.ready=true;
const lower=clamp((cup.position.y+.85-p.y)*.8+.65,.3,1.7);s.phase+=dt/s.period*lower;if(s.phase>=1){const r=.039+random()*.025;emit(p.clone().addScaledVector(worldDown,.055),v.multiplyScalar(.65).clampLength(0,4).add(new THREE.Vector3(0,-.1,0)),r);s.phase=0;}const r=.015+Math.pow(s.phase,1.8)*.043;s.bud.position.copy(p).addScaledVector(worldDown,r*.65);s.bud.scale.set(r*.8,r*(.6+s.phase),r*.8);}
for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;d.v.y-=3.4*dt;d.v.x*=Math.exp(-dt*.12);d.v.z*=Math.exp(-dt*.12);d.mesh.position.addScaledVector(d.v,dt);const stretch=clamp(1+Math.abs(d.v.y)*.12,1,1.85);d.mesh.scale.set(d.r/Math.sqrt(stretch),d.r*stretch,d.r/Math.sqrt(stretch));if(d.mesh.position.y<=d.r*.45){impact(d);scene.remove(d.mesh);drops.splice(i,1);}else if(d.age>8){scene.remove(d.mesh);drops.splice(i,1);}}
for(let i=puddles.length-1;i>=0;i--){const p=puddles[i];p.age+=dt;const grow=1-Math.exp(-p.age*11),fade=clamp((20-p.age)/5,0,1);p.mesh.scale.set(p.r*grow*fade,.011*fade,p.r*.78*grow*fade);if(p.age>20){scene.remove(p.mesh);puddles.splice(i,1);}}
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<800?43:34;camera.position.set(0,w<800?3.9:3.8,w<800?11.7:10.6);camera.lookAt(0,w<800?2.2:2.3,0);camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
let scrollBlend=0;function scrollComposition(dt){const orderTop=$('#aparta').offsetTop;const progress=THREE.MathUtils.clamp((scrollY-innerHeight*.22)/Math.max(1,orderTop-innerHeight*.32),0,1);scrollBlend+=(progress-scrollBlend)*(1-Math.exp(-dt*8));const mobile=innerWidth<801;document.body.classList.toggle('hero-away',scrollY>innerHeight*.65);camera.fov=mobile?43+12*scrollBlend:34;camera.setViewOffset(innerWidth,innerHeight,mobile?-innerWidth*.26*scrollBlend:innerWidth*.255*scrollBlend,mobile?innerHeight*.22*scrollBlend:0,innerWidth,innerHeight);camera.updateProjectionMatrix();}
document.addEventListener('visibilitychange',()=>{last=performance.now();accum=0;});
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!paused&&!document.hidden){accum+=dt;while(accum>=1/90){step(1/90);accum-=1/90;}}else if(paused){const k=1-Math.exp(-dt*8);cup.position.x+=(targetX-cup.position.x)*k;cup.position.y+=(targetY-cup.position.y)*k;cup.rotation.z+=(targetR-cup.rotation.z)*k;cup.rotation.x+=(targetPitch-cup.rotation.x)*k;cup.updateMatrixWorld(true);for(const s of sources){s.bud.position.copy(cup.localToWorld(s.local.clone()));s.ready=false;}}scrollComposition(dt);shadow.position.x=cup.position.x;shadow.material.opacity=clamp(1.2-(cup.position.y-1.6)*.22,.35,1);shadow.scale.setScalar(.85+(cup.position.y-1.6)*.22);renderer.render(scene,camera);}requestAnimationFrame(frame);
window.nordDebug=()=>({cup:{x:cup.position.x,y:cup.position.y,z:cup.rotation.z},emitted:emissionCount,impacts:impactCount,drops:drops.map(d=>({x:d.mesh.position.x,y:d.mesh.position.y,vy:d.v.y})),puddles:puddles.length,paused,mode,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,materialDetail:'PBR normals, roughness, sculpted folds',scrollBlend});
})();

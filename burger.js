/* Hero 3D burger (Three.js) */
/* ===== BURGER ===== */
(function(){if(!window.THREE){$("#bc").replaceWith(Object.assign(document.createElement("div"),{textContent:"🍔",style:"font-size:160px;display:grid;place-items:center;height:100%"}));return}
const T=THREE,cv=$("#bc"),R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.2;
const S=new T.Scene(),C=new T.PerspectiveCamera(30,1,.1,80),rnd=(a=1)=>Math.random()*a;
const tex=(fn,s=true)=>{const c=document.createElement("canvas");c.width=c.height=256;fn(c.getContext("2d"),256);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(s)t.encoding=T.sRGBEncoding;return t};
const speck=(base,cols,n,r,s=true)=>tex((x,w)=>{x.fillStyle=base;x.fillRect(0,0,w,w);for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.globalAlpha=.3+rnd(.5);x.beginPath();x.arc(rnd(w),rnd(w),.8+rnd(r),0,7);x.fill()}},s);
const bunTex=tex((x,w)=>{const g=x.createLinearGradient(0,0,0,w);g.addColorStop(0,"#9c4a14");g.addColorStop(.55,"#cf7f2c");g.addColorStop(1,"#efb75e");x.fillStyle=g;x.fillRect(0,0,w,w);for(let i=0;i<1400;i++){x.fillStyle=["#f0b65a","#a85a1a","#e0983c"][i%3];x.globalAlpha=.25;x.fillRect(rnd(w),rnd(w),1+rnd(3),1+rnd(3))}});
const bump=speck("#808080",["#fff","#000","#aaa"],2600,2.4,false);bump.repeat.set(2,2);
const mBun=new T.MeshStandardMaterial({map:bunTex,bumpMap:bump,bumpScale:.5,roughness:.55}),
mPat=new T.MeshStandardMaterial({map:speck("#4a2815",["#2a1409","#6e3f22","#1a0a04","#85502e"],3600,2.6),bumpMap:bump,bumpScale:1.4,roughness:.72}),
mChe=new T.MeshStandardMaterial({color:0xffb423,roughness:.28,emissive:0x5c3200,emissiveIntensity:.25,side:T.DoubleSide}),
mLet=new T.MeshStandardMaterial({vertexColors:true,roughness:.45,side:T.DoubleSide}),
mTom=new T.MeshStandardMaterial({map:tex((x,w)=>{x.fillStyle="#c02a1b";x.fillRect(0,0,w,w);const g=x.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,"#e8563f");g.addColorStop(1,"#cf3322");x.fillStyle=g;x.beginPath();x.arc(128,128,112,0,7);x.fill();x.strokeStyle="#f2a090";x.lineWidth=3;for(let i=0;i<6;i++){x.beginPath();x.moveTo(128,128);x.lineTo(128+Math.cos(i*1.047)*100,128+Math.sin(i*1.047)*100);x.stroke()}x.fillStyle="#f4c862";for(let i=0;i<12;i++){x.beginPath();x.ellipse(128+Math.cos(i*.52)*62,128+Math.sin(i*.52)*62,7,10,i*.52,0,7);x.fill()}}),roughness:.3}),
mOn=new T.MeshStandardMaterial({color:0xefe2c4,roughness:.45}),mSd=new T.MeshStandardMaterial({color:0xf5e3b3,roughness:.5});
const G=new T.Group();S.add(G);const L=[];let H=0;
const add=(o,h,gap)=>{o.userData.b=H;o.position.y=H;G.add(o);L.push(o);H+=h+gap;return o};
const lathe=(pts,seg=72)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
/* bottom bun */
{const p=[[0,0]];for(let i=0;i<=14;i++){const a=i/14*Math.PI/2;p.push([1.22*Math.sin(a),.5-.5*Math.cos(a)*(1)+0])}
const q=p.map(v=>[v[0],v[1]]);q.push([1.22,.52],[1.14,.6],[0,.6]);
const g=lathe([[0,0],...Array.from({length:15},(_,i)=>{const a=i/14*Math.PI/2;return[1.2*Math.sin(a)+.001,.48*(1-Math.cos(a))]}),[1.22,.5],[1.18,.58],[0,.6]]);add(new T.Mesh(g,mBun),.6,.04)}
/* lettuce */
{const g=new T.RingGeometry(.05,1.5,110,12);g.rotateX(-Math.PI/2);const P=g.attributes.position,col=[];
for(let i=0;i<P.count;i++){let x=P.getX(i),z=P.getZ(i);const r=Math.hypot(x,z),t=Math.atan2(z,x),k=r/1.5,rr=r*(1+.05*Math.sin(t*13)*k+.03*Math.sin(t*7+1)*k);
P.setXYZ(i,Math.cos(t)*rr,(Math.sin(t*10+k*3)*.07+Math.sin(t*5)*.05)*Math.pow(k,1.3)+.05*k,Math.sin(t)*rr);
const c=new T.Color().setHSL(.26+(.04*k),.55,.3+.2*k);col.push(c.r,c.g,c.b)}
g.setAttribute("color",new T.Float32BufferAttribute(col,3));g.computeVertexNormals();add(new T.Mesh(g,mLet),.14,.03)}
/* tomato */
{const o=new T.Group();[[-.38,.1,.88],[.45,-.1,.8]].forEach(([x,z,r])=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,.12,56),mTom);m.position.set(x,.06+(x>0?.02:0),z);o.add(m)});add(o,.13,.03)}
/* onion */
{const o=new T.Group();[[.9,.05],[.55,.05],[.25,.05]].forEach(([r,t],i)=>{const m=new T.Mesh(new T.TorusGeometry(r,t,10,48),mOn);m.rotation.x=Math.PI/2;m.position.set(i==2?.4:0,.05,i==2?-.2:0);o.add(m)});o.rotation.y=.6;add(o,.1,.02)}
/* patty + cheese x2 */
const patty=()=>{const g=lathe([[0,0],[1.1,0],[1.2,.05],[1.25,.17],[1.22,.3],[1.12,.36],[0,.37]],80),P=g.attributes.position;
for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),r=Math.hypot(x,z);if(r>.8){const t=Math.atan2(z,x),k=1+.035*Math.sin(t*6)+.02*Math.sin(t*13+2);P.setX(i,x*k);P.setZ(i,z*k)}}g.computeVertexNormals();return new T.Mesh(g,mPat)};
const cheese=()=>{const g=new T.BoxGeometry(2.7,.06,2.7,26,1,26),P=g.attributes.position;
for(let i=0;i<P.count;i++){const d=Math.max(0,Math.hypot(P.getX(i),P.getZ(i))-1.05);P.setY(i,P.getY(i)-d*d*.5+.07)}g.computeVertexNormals();const m=new T.Mesh(g,mChe);m.rotation.y=Math.PI/4;return m};
add(patty(),.37,0);add(cheese(),.1,.02);const p2=add(patty(),.37,0);p2.rotation.y=2;const c2=add(cheese(),.1,.04);c2.rotation.y=Math.PI/4+.5;
/* top bun */
{const pts=[[0,0],[1.2,0],[1.25,.1]];for(let i=1;i<=18;i++){const a=i/18*Math.PI/2;pts.push([1.25*Math.cos(a)*.999+.0005,.1+.92*Math.pow(Math.sin(a),.85)])}
const top=new T.Mesh(lathe(pts),mBun);top.scale.y=1;
const sg=new T.SphereGeometry(1,8,6);for(let i=0;i<46;i++){const a=rnd(Math.PI*2),b=.12+rnd(1.05),x=1.25*Math.cos(b)*.97*Math.cos(a),y=.1+.92*Math.pow(Math.sin(b),.85)+.01,z=1.25*Math.cos(b)*.97*Math.sin(a);
const s=new T.Mesh(sg,mSd);s.scale.set(.07,.035,.04);s.position.set(x,y,z);const n=new T.Vector3(x/1.56,(y-.1)/.85,z/1.56).normalize();s.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n);s.rotateY(rnd(6));top.add(s)}
add(top,1.05,0)}
/* floor shadow + lights */
const sh=new T.Mesh(new T.PlaneGeometry(7,7),new T.MeshBasicMaterial({map:tex((x,w)=>{const g=x.createRadialGradient(128,128,5,128,128,125);g.addColorStop(0,"rgba(0,0,0,.75)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(0,0,w,w)},false),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;S.add(sh);
S.add(new T.HemisphereLight(0xfff0dc,0x3a2210,.9));
const k=new T.DirectionalLight(0xffe2bd,2.1);k.position.set(-4,8,6);S.add(k);
const rim=new T.DirectionalLight(0xff7a1a,1.8);rim.position.set(5,3,-6);S.add(rim);
const fill=new T.PointLight(0xffb36b,.9,20);fill.position.set(4,1,5);S.add(fill);
const stage=cv.parentElement,hero=$(".hero"),vis=live(stage);
function size(){const w=stage.clientWidth,h=stage.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
new ResizeObserver(size).observe(stage);size();
let p=0,sp=0;const calc=()=>p=Math.min(1,Math.max(0,scrollY/(hero.offsetHeight-innerHeight)));addEventListener("scroll",calc,{passive:true});calc();
function frame(t){requestAnimationFrame(frame);if(!vis())return;
sp+=(p-sp)*.1;const e=sp*sp*(3-2*sp)*.46,n=L.length;
L.forEach((o,i)=>o.position.y=o.userData.b+i*e);
const tot=H+(n-1)*e;G.position.y=-tot/2;sh.position.y=-tot/2-.02;sh.material.opacity=1-sp*.45;sh.scale.setScalar(1+sp*.3);
G.rotation.y=(RM?.6:t/4200)+sp*Math.PI*1.6+mx*.6;G.rotation.x=0;G.rotation.z=my*.08;
const asp=C.aspect,dw=3.9/(2*Math.tan(.2618)*asp),dh=(H+(n-1)*e+.6)/(2*Math.tan(.2618)),d=Math.max(dw,dh)*1.06;
C.position.set(0,d*.3,d*.95);C.lookAt(0,-.15,0);R.render(S,C)}
requestAnimationFrame(frame)})();

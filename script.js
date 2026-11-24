const $=s=>document.querySelector(s);
const M={Burgers:[["Don Classic","Beef patty, cheese, lettuce, tomato, house sauce","149","🍔","Popular"],["Double Don","Two patties, double cheese, pickles","219","🍔"],["Cheese Lava","Molten cheddar centre, caramelised onion","189","🧀"],["Baco Bacon","Smoked bacon, BBQ glaze, crispy onions","199","🥓"],["Crispy Chicken","Buttermilk fried chicken, slaw, mayo","169","🍗"]],
Sides:[["Shoestring Fries","Salted and golden","79","🍟"],["Onion Rings","Beer-battered, with dip","89","🧅"],["Loaded Nachos","Cheese, salsa, ground beef","129","🌮"]],
Drinks:[["Iced Tea","Lemon, over ice","59","🧊"],["Calamansi Soda","Sparkling and sharp","65","🍋"],["Mango Shake","Ripe mangoes, thick and cold","99","🥭","New"],["Iced Coffee","Cold brew, milk, brown sugar","89","☕"]]};
const items=[];Object.entries(M).forEach(([c,a])=>a.forEach(x=>items.push({id:items.length,c,n:x[0],d:x[1],p:+x[2],e:x[3],b:x[4]})));
const cart={};let tab="Burgers",step=0,pay="gcash";
const peso=n=>"₱"+n.toLocaleString();
function renderTabs(){$("#tabs").innerHTML=Object.keys(M).map(k=>`<button class="tab" role="tab" aria-selected="${k==tab}" data-t="${k}">${k}</button>`).join("")}
function renderGrid(){$("#grid").innerHTML=items.filter(i=>i.c==tab).map((i,k)=>`<article class="card" style="--i:${k}">${i.b?`<span class="bd">${i.b}</span>`:""}<div class="ic">${i.e}</div><h3>${i.n}</h3><p>${i.d}</p><div class="row"><span class="price">${peso(i.p)}</span><button class="add" data-a="${i.id}">Add</button></div></article>`).join("")}
$("#tabs").onclick=e=>{const t=e.target.closest("[data-t]");if(!t||t.dataset.t==tab)return;tab=t.dataset.t;renderTabs();renderGrid()};
$("#grid").onclick=e=>{const a=e.target.closest("[data-a]");if(!a)return;cart[a.dataset.a]=(cart[a.dataset.a]||0)+1;a.textContent="Added ✓";setTimeout(()=>a.textContent="Add",900);sync()};
if(matchMedia("(hover:hover) and (pointer:fine)").matches){$("#grid").addEventListener("pointermove",e=>{const c=e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect();c.style.transform=`rotateY(${((e.clientX-r.left)/r.width-.5)*10}deg) rotateX(${-((e.clientY-r.top)/r.height-.5)*10}deg) translateY(-2px)`});$("#grid").addEventListener("pointerout",e=>{const c=e.target.closest(".card");if(c)c.style.transform=""})}
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
const total=()=>Object.entries(cart).reduce((s,[id,q])=>s+items[id].p*q,0);
function sync(){const n=count();$("#cn").textContent=n;$("#bn").textContent=n+(n==1?" item":" items")+" · View order";$("#bt").textContent=peso(total());$("#bar").classList.toggle("show",n>0&&!document.body.classList.contains("open"));if(document.body.classList.contains("open")&&step==0)draw()}
function open_(){document.body.classList.add("open");$("#bar").classList.remove("show");step=0;draw()}
function close_(){document.body.classList.remove("open");sync()}
function draw(){const b=$("#bd");b.style.animation="none";b.offsetHeight;b.style.animation="";
if(step==0){$("#dt").textContent="Your order";const e=Object.keys(cart).filter(k=>cart[k]>0);
b.innerHTML=e.length?e.map(k=>`<div class="ln"><div><b>${items[k].n}</b><br><span style="color:var(--mu)">${peso(items[k].p)}</span></div><div class="q"><button data-m="${k}" aria-label="Less">−</button><b>${cart[k]}</b><button data-p="${k}" aria-label="More">+</button></div></div>`).join("")+`<div class="tot"><span>Total</span><span>${peso(total())}</span></div><button class="btn" data-go="1">Choose payment</button>`:`<p style="color:var(--mu);padding:24px 0">Your order is empty. Add something from the menu.</p><button class="btn" data-x="1">Browse menu</button>`}
else if(step==1){$("#dt").textContent="Payment";b.innerHTML=`<input type="text" id="nm" placeholder="Your name" autocomplete="name"><div class="pm">${[["gcash","GCash","E-wallet"],["maya","Maya","E-wallet"],["card","Credit / Debit card","Visa · Mastercard"],["cash","Cash on pickup","Pay at the counter"]].map(p=>`<label><input type="radio" name="pm" value="${p[0]}" ${p[0]==pay?"checked":""}><span>${p[1]}</span><small>${p[2]}</small></label>`).join("")}</div><div class="tot"><span>Total</span><span>${peso(total())}</span></div><button class="btn" data-go="2">Place order</button><button class="btn ghost" style="margin-top:10px" data-go="0">Back</button><p class="note">Prototype only. No real payment is taken.</p>`}
else{$("#dt").textContent="Order placed";b.innerHTML=`<div class="ok"><div class="big">✅</div><h3>Salamat${window._nm?", "+window._nm:""}!</h3><p style="color:var(--mu)">Order #DZ-${Math.floor(1000+Math.random()*9000)} · ${peso(total())} via ${({gcash:"GCash",maya:"Maya",card:"card",cash:"cash on pickup"})[pay]}.<br>We’ll have it ready at the counter.</p><button class="btn" style="margin-top:28px" data-done="1">Done</button></div>`}}
$("#bd").onclick=e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset;
if(d.p)cart[d.p]++;else if(d.m)cart[d.m]=Math.max(0,cart[d.m]-1);
else if(d.go){if(d.go==1&&!count())return;if(d.go==2)window._nm=($("#nm").value||"").replace(/[<>&"]/g,"");step=+d.go;draw();return}
else if(d.x)return close_();else if(d.done){for(const k in cart)delete cart[k];close_();return}
sync()};
$("#bd").onchange=e=>{if(e.target.name=="pm")pay=e.target.value};
["#cb","#bar"].forEach(s=>$(s).onclick=open_);$("#xb").onclick=close_;$("#veil").onclick=close_;
addEventListener("keydown",e=>e.key=="Escape"&&close_());
renderTabs();renderGrid();sync();
const io=new IntersectionObserver(a=>a.forEach(x=>x.isIntersecting&&(x.target.classList.add("on"),io.unobserve(x.target))),{threshold:.15});
document.querySelectorAll(".rv").forEach(x=>io.observe(x));
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
let mx=0,my=0;addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
const live=(el,fn)=>{let v=true;new IntersectionObserver(a=>v=a[0].isIntersecting).observe(el);return()=>v}
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
/* ===== 3D MAP ===== */
(function(){if(!window.THREE){return}
const T=THREE,cv=$("#mc"),R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=T.sRGBEncoding;
const S=new T.Scene();S.background=new T.Color(0x1a130d);S.fog=new T.Fog(0x1a130d,26,52);
const C=new T.PerspectiveCamera(38,1,.1,100);
let s=11;const rr=()=>(s=(s*16807)%2147483647)/2147483647;
const box=(w,h,d,c,x,y,z,par=S)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color:c}));m.position.set(x,y+h/2,z);par.add(m);return m};
S.add(new T.HemisphereLight(0xfff0dc,0x2a1a0e,.95));const dl=new T.DirectionalLight(0xffd9a8,.9);dl.position.set(-8,14,6);S.add(dl);
box(60,.1,60,0x241b12,0,-.1,0);
[-4.6,4.6].forEach(x=>box(1.5,.04,60,0x3d3023,x,0,0));[-4.2,4.2].forEach(z=>box(60,.04,1.5,0x3d3023,0,0,z));
const pal=[0x57432f,0x6a5238,0x4a3a2a,0x7a6044,0x5f4a36];
const cells=[[-12,-5.4,-11,-5],[5.4,12,-11,-5],[-12,-5.4,5,11],[5.4,12,5,11],[-12,-5.4,-3.5,3.5],[5.4,12,-3.5,3.5],[-3.9,3.9,-11,-5],[-3.9,3.9,5,11]];
cells.forEach(([x0,x1,z0,z1])=>{for(let i=0;i<5;i++){const w=1.4+rr()*2,d=1.4+rr()*2,h=.7+rr()*2.4;box(w,h,d,pal[i%5],x0+w/2+rr()*(x1-x0-w),0,z0+d/2+rr()*(z1-z0-d))}});
const tree=(x,z)=>{box(.14,.5,.14,0x4a3020,x,0,z);const c=new T.Mesh(new T.ConeGeometry(.55,1.3,8),new T.MeshLambertMaterial({color:0x2f5a2a}));c.position.set(x,1.15,z);S.add(c)};
for(let i=0;i<22;i++)tree(rr()*22-11,(rr()<.5?-1:1)*(2.6+rr()*8));
/* restaurant lot */
box(8,.05,7,0x2d231a,0,0,0);
const rest=box(3.6,1.6,2.4,0xf0dfbf,-.6,.05,-.9);box(3.9,.2,2.7,0xff7a1a,-.6,1.65,-.9);box(1.6,.5,.12,0xffb45c,-.6,1.95,-.3);
box(.9,.9,.1,0x3a2a1a,-.6,.05,.32);
for(let i=0;i<3;i++){const x=-2+i*1.4;box(.1,.4,.1,0x888,x,.05,1.9);const tb=new T.Mesh(new T.CylinderGeometry(.36,.36,.06,16),new T.MeshLambertMaterial({color:0xe8d6b0}));tb.position.set(x,.5,1.9);S.add(tb);const um=new T.Mesh(new T.ConeGeometry(.6,.3,10),new T.MeshLambertMaterial({color:i%2?0xff7a1a:0xf6ecdc}));um.position.set(x,1.3,1.9);S.add(um);box(.04,.8,.04,0x666,x,.5,1.9)}
box(1.7,.04,5.6,0x3a3128,2.95,.05,0);for(let i=0;i<4;i++)box(.05,.02,1.1,0xf6ecdc,2.2+(i%2)*1.5,.1,-2+i*1.3);
const car=(z,c)=>{box(.9,.3,.5,c,2.9,.1,z);box(.5,.25,.42,0x222,2.95,.4,z)};car(-1.7,0xc0392b);car(.5,0x2e6da4);
/* pins */
const P=[{n:"Don Zulueta",t:"Burgers, grill and shakes. Open daily, 10 AM to 10 PM (sample hours).",x:-.6,y:2.9,z:-.9},{n:"Dine-in terrace",t:"Outdoor tables under umbrellas, good for groups.",x:-.6,y:1.9,z:2.2},{n:"Pickup and parking",t:"Quick parking bay and counter pickup for ready orders.",x:2.95,y:1.5,z:0}].map(o=>{const g=new T.Group(),m=new T.MeshLambertMaterial({color:0xff7a1a,emissive:0x7a2c00});const c=new T.Mesh(new T.ConeGeometry(.28,.7,16),m);c.rotation.x=Math.PI;c.position.y=-.3;const b=new T.Mesh(new T.SphereGeometry(.3,16,12),m);g.add(c,b);g.position.set(o.x,o.y,o.z);S.add(g);o.g=g;
const el=document.createElement("button");el.className="pn";el.textContent=o.n;$(".mapbox").appendChild(el);o.el=el;return o});
const mi=$("#mi");
let az=.7,pol=.95,dist=19,tx=0,tz=0,gx=0,gz=0,gd=19,auto=true,drag=null;const def={az:.7,pol:.95,dist:19};
const sel=i=>{P.forEach((o,j)=>o.el.classList.toggle("on",i==j));const o=P[i];gx=o.x;gz=o.z;gd=11;auto=false;mi.innerHTML=`<b>${o.n}</b>${o.t}`};
P.forEach((o,i)=>o.el.onclick=()=>sel(i));
cv.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};auto=false;cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(!drag)return;az-=(e.clientX-drag.x)*.009;pol=Math.min(1.3,Math.max(.3,pol-(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY}};
cv.onpointerup=cv.onpointercancel=()=>drag=null;
cv.addEventListener("wheel",e=>{if(!e.ctrlKey&&Math.abs(e.deltaY)<1)return;e.preventDefault();gd=Math.min(30,Math.max(7,gd+e.deltaY*.012))},{passive:false});
$("#zi").onclick=()=>gd=Math.max(7,gd-3);$("#zo").onclick=()=>gd=Math.min(30,gd+3);
$("#rs").onclick=()=>{az=def.az;pol=def.pol;gd=def.dist;gx=gz=0;auto=!RM;P.forEach(o=>o.el.classList.remove("on"));mi.innerHTML="<b>Stylized map of the restaurant</b>Drag to rotate, use + and − to zoom, tap a pin for details."};
const box_=cv.parentElement,vis=live(box_);
function size(){const w=box_.clientWidth,h=box_.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
new ResizeObserver(size).observe(box_);size();
const v=new T.Vector3();
function frame(t){requestAnimationFrame(frame);if(!vis())return;
if(auto&&!RM)az+=.0022;tx+=(gx-tx)*.08;tz+=(gz-tz)*.08;dist+=(gd-dist)*.08;
const dd=dist*(C.aspect<1?1.35:1);C.position.set(tx+dd*Math.sin(pol)*Math.sin(az),dd*Math.cos(pol),tz+dd*Math.sin(pol)*Math.cos(az));C.lookAt(tx,0,tz);
P.forEach((o,i)=>{o.g.position.y=o.y+(RM?0:Math.sin(t/400+i)*.12);o.g.rotation.y=t/600;v.set(o.x,o.y+.9,o.z).project(C);const w=box_.clientWidth,h=box_.clientHeight,ok=v.z<1;
o.el.style.transform=`translate(${(v.x*.5+.5)*w}px,${(-v.y*.5+.5)*h}px) translate(-50%,-100%)`;o.el.style.opacity=ok?1:0});
R.render(S,C)}
requestAnimationFrame(frame)})();

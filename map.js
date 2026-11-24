/* Interactive 3D map (Three.js) */
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

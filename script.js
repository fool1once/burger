/* store.js · shared data layer for the website and the admin panel.
   PROTOTYPE: data lives in this browser (localStorage), so the shop and the admin
   panel only share data when opened in the same browser. A real shop needs a backend (e.g. Firebase). */
const DZ=(()=>{
const K={menu:"dz_menu",orders:"dz_orders",users:"dz_users",me:"dz_me",cfg:"dz_cfg"},mem={};
const get=(k,d)=>{try{const v=localStorage.getItem(K[k]);if(v!==null)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d};
const set=(k,v)=>{mem[k]=v;try{localStorage.setItem(K[k],JSON.stringify(v))}catch(e){}};
const seed=[["Burgers","Don Classic","Beef patty, cheese, lettuce, tomato, house sauce",149,"🍔","Popular"],["Burgers","Double Don","Two patties, double cheese, pickles",219,"🍔",""],["Burgers","Cheese Lava","Molten cheddar centre, caramelised onion",189,"🧀",""],["Burgers","Baco Bacon","Smoked bacon, BBQ glaze, crispy onions",199,"🥓",""],["Burgers","Crispy Chicken","Buttermilk fried chicken, slaw, mayo",169,"🍗",""],["Sides","Shoestring Fries","Salted and golden",79,"🍟",""],["Sides","Onion Rings","Beer-battered, with dip",89,"🧅",""],["Sides","Loaded Nachos","Cheese, salsa, ground beef",129,"🌮",""],["Drinks","Iced Tea","Lemon, over ice",59,"🧊",""],["Drinks","Calamansi Soda","Sparkling and sharp",65,"🍋",""],["Drinks","Mango Shake","Ripe mangoes, thick and cold",99,"🥭","New"],["Drinks","Iced Coffee","Cold brew, milk, brown sugar",89,"☕",""]].map((x,i)=>({id:i+1,c:x[0],n:x[1],d:x[2],p:x[3],e:x[4],b:x[5],on:true}));
return{K,get,set,
menu(){let m=get("menu",null);if(!m){m=seed;set("menu",m)}return m},
orders:()=>get("orders",[]),users:()=>get("users",[]),
cfg:()=>Object.assign({open:true,hours:"10:00 AM – 10:00 PM",phone:"+63 900 000 0000",ig:"donzulueta"},get("cfg",{}))}
})();

/* Don Zulueta · script.js
   Menu, cart, accounts, orders, map tabs, 3D burger and 3D map. */
const $=s=>document.querySelector(s);
const MAP_Q="Poblacion, Baco, Oriental Mindoro, Philippines"; /* replace with your exact restaurant name once it is on Google Maps */
const peso=n=>"₱"+Number(n).toLocaleString();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
let mx=0,my=0;addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
const live=el=>{let v=true;new IntersectionObserver(a=>v=a[0].isIntersecting).observe(el);return()=>v&&!document.body.classList.contains("alock")};
const ST={new:["Received","new"],preparing:["Preparing","prep"],ready:["Ready","ready"],done:["Completed","done"],cancelled:["Cancelled","can"]};
const body=document.body;
let tab="",step=0,pay="gcash",otype="pickup",cart={},last=null;
const menu=()=>DZ.menu(),find=id=>menu().find(i=>i.id==id),cfg=()=>DZ.cfg();
const me=()=>DZ.users().find(u=>u.id==DZ.get("me",null))||null;
const ago=t=>{const m=Math.floor((Date.now()-t)/6e4);return m<1?"just now":m<60?m+" min ago":m<1440?Math.floor(m/60)+" h ago":Math.floor(m/1440)+" d ago"};
/* ---- shop settings from the admin panel ---- */
function applyCfg(){const c=cfg(),t=$("#tg");t.textContent=c.open?"Open now · "+c.hours:"Closed right now · opens "+c.hours.split("–")[0].trim();t.classList.toggle("off",!c.open);
document.querySelectorAll("[data-hours]").forEach(e=>e.textContent="Daily, "+c.hours);
document.querySelectorAll("[data-phone]").forEach(e=>{e.textContent=c.phone;e.href="tel:"+c.phone.replace(/[^+\d]/g,"")});
document.querySelectorAll("[data-ig]").forEach(e=>e.href="https://instagram.com/"+c.ig);
document.querySelectorAll("[data-igt]").forEach(e=>e.textContent="@"+c.ig)}
function acct(){const u=me(),b=$("#ab");b.innerHTML=u?`<i>${esc(u.name[0].toUpperCase())}</i><span>${esc(u.name.split(" ")[0])}</span>`:`<i>👤</i><span>Sign in</span>`;b.classList.toggle("in",!!u)}
/* ---- menu ---- */
function renderTabs(){const cs=[...new Set(menu().map(i=>i.c))];if(!cs.includes(tab))tab=cs[0];$("#tabs").innerHTML=cs.map(k=>`<button class="tab" role="tab" aria-selected="${k==tab}" data-t="${esc(k)}">${esc(k)}</button>`).join("")}
function renderGrid(){const o=cfg().open;$("#grid").innerHTML=menu().filter(i=>i.c==tab).map((i,k)=>`<article class="card" style="--i:${k}">${i.b?`<span class="bd">${esc(i.b)}</span>`:""}<div class="ic">${esc(i.e)}</div><h3>${esc(i.n)}</h3><p>${esc(i.d)}</p><div class="row"><span class="price">${peso(i.p)}</span><button class="add" data-a="${i.id}" ${i.on&&o?"":"disabled"}>${i.on?(o?"Add":"Closed"):"Sold out"}</button></div></article>`).join("")}
$("#tabs").onclick=e=>{const t=e.target.closest("[data-t]");if(!t||t.dataset.t==tab)return;tab=t.dataset.t;renderTabs();renderGrid()};
$("#grid").onclick=e=>{const a=e.target.closest("[data-a]");if(!a||a.disabled)return;cart[a.dataset.a]=(cart[a.dataset.a]||0)+1;a.textContent="Added ✓";setTimeout(()=>{a.textContent="Add"},900);sync()};
if(matchMedia("(hover:hover) and (pointer:fine)").matches){$("#grid").addEventListener("pointermove",e=>{const c=e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect();c.style.transform=`rotateY(${((e.clientX-r.left)/r.width-.5)*10}deg) rotateX(${-((e.clientY-r.top)/r.height-.5)*10}deg) translateY(-2px)`});$("#grid").addEventListener("pointerout",e=>{const c=e.target.closest(".card");if(c)c.style.transform=""})}
/* ---- cart, checkout, profile (the right-hand drawer) ---- */
const lines=()=>Object.keys(cart).filter(k=>cart[k]>0&&find(k));
const count=()=>lines().reduce((s,k)=>s+cart[k],0);
const total=()=>lines().reduce((s,k)=>s+find(k).p*cart[k],0);
function sync(){const n=count();$("#cn").textContent=n;$("#bn").textContent=n+(n==1?" item":" items")+" · View order";$("#bt").textContent=peso(total());$("#bar").classList.toggle("show",n>0&&!body.classList.contains("open"))}
function open_(s=0){body.classList.add("open");$("#bar").classList.remove("show");step=s;draw()}
function close_(){body.classList.remove("open");sync()}
function draw(){const b=$("#bd");b.style.animation="none";b.offsetHeight;b.style.animation="";
if(step==0){$("#dt").textContent="Your order";const e=lines();
b.innerHTML=e.length?e.map(k=>`<div class="ln"><div><b>${esc(find(k).n)}</b><br><span style="color:var(--mu)">${peso(find(k).p)}</span></div><div class="q"><button data-m="${k}" aria-label="Less">−</button><b>${cart[k]}</b><button data-p="${k}" aria-label="More">+</button></div></div>`).join("")+`<div class="tot"><span>Total</span><span>${peso(total())}</span></div><button class="btn" data-go="1">Checkout</button>`:`<p style="color:var(--mu);padding:24px 0">Your order is empty. Add something from the menu.</p><button class="btn" data-x="1">Browse menu</button>`}
else if(step==1){const u=me();$("#dt").textContent="Payment";b.innerHTML=`<div class="who">Ordering as <b>${esc(u.name)}</b><br>We will call ${esc(u.phone)} if we need to confirm.</div><div class="seg"><button data-ot="pickup" class="${otype=="pickup"?"on":""}">Pickup</button><button data-ot="dine" class="${otype=="dine"?"on":""}">Dine-in</button></div><input type="text" id="nt" placeholder="Note for the kitchen (optional)" maxlength="120"><div class="pm">${[["gcash","GCash","E-wallet"],["maya","Maya","E-wallet"],["card","Credit / Debit card","Visa · Mastercard"],["cash","Cash","Pay at the counter"]].map(p=>`<label><input type="radio" name="pm" value="${p[0]}" ${p[0]==pay?"checked":""}><span>${p[1]}</span><small>${p[2]}</small></label>`).join("")}</div><div class="tot"><span>Total</span><span>${peso(total())}</span></div><button class="btn" data-go="2">Place order</button><button class="btn ghost" style="margin-top:10px" data-go="0">Back</button><p class="note">Prototype only. No real payment is taken.</p>`}
else if(step==2){$("#dt").textContent="Order placed";b.innerHTML=`<div class="ok"><div class="big">✅</div><h3>Salamat, ${esc(last.name.split(" ")[0])}!</h3><p style="color:var(--mu)">Order ${last.no} · ${peso(last.total)}<br>We will have it ready at the counter. Track it in your profile.</p><button class="btn" style="margin-top:26px" data-prof="1">Track my order</button><button class="btn ghost" style="margin-top:10px" data-x="1">Done</button></div>`}
else{const u=me();if(!u){close_();return}$("#dt").textContent="Your profile";const os=DZ.orders().filter(o=>o.uid==u.id).sort((a,c)=>c.t-a.t);
b.innerHTML=`<div class="pf"><div class="av2">${esc(u.name[0].toUpperCase())}</div><div><b>${esc(u.name)}</b><br><span style="color:var(--mu)">${esc(u.phone)} · via ${esc(u.via)}</span></div></div><h4 class="sh">Your orders</h4>${os.length?os.map(o=>`<div class="oc"><div class="row" style="margin:0"><b>${o.no}</b><span class="st ${ST[o.status][1]}">${ST[o.status][0]}</span></div><div style="color:var(--mu);font-size:14px;margin:6px 0">${o.items.map(i=>i.q+"× "+esc(i.n)).join(", ")}</div><div class="row" style="margin:0"><span>${peso(o.total)} · ${o.type=="dine"?"Dine-in":"Pickup"}</span><small style="color:var(--mu)">${ago(o.t)}</small></div></div>`).join(""):'<p style="color:var(--mu)">No orders yet.</p>'}<button class="btn ghost" data-out="1" style="margin-top:14px">Sign out</button>`}}
function place(){const u=me();if(!u||!count()||!cfg().open)return;const os=DZ.orders(),its=lines().map(k=>({id:+k,n:find(k).n,p:find(k).p,q:cart[k]})),nt=$("#nt");
last={id:"o"+Date.now(),no:"DZ-"+(1001+os.length),uid:u.id,name:u.name,phone:u.phone,type:otype,pay:({gcash:"GCash",maya:"Maya",card:"Card",cash:"Cash"})[pay],note:nt?nt.value.trim():"",items:its,total:its.reduce((s,i)=>s+i.p*i.q,0),status:"new",t:Date.now()};
os.push(last);DZ.set("orders",os);cart={};step=2;sync();draw()}
$("#bd").onclick=e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset;
if(d.p)cart[d.p]++;else if(d.m)cart[d.m]=Math.max(0,cart[d.m]-1);
else if(d.ot){otype=d.ot;draw();return}
else if(d.go){const g=+d.go;if(g==1){if(!count())return;if(!me()){authOpen("Create an account to place your order. It takes a few seconds.",()=>open_(1));return}}if(g==2){place();return}step=g;draw();return}
else if(d.x){close_();return}else if(d.prof){step=3;draw();return}
else if(d.out){DZ.set("me",null);acct();close_();return}
sync();if(step==0)draw()};
$("#bd").onchange=e=>{if(e.target.name=="pm")pay=e.target.value};
$("#ab").onclick=()=>me()?open_(3):authOpen("Sign in to order faster and track your food.");
["#cb","#bar"].forEach(s=>$(s).onclick=()=>open_(0));$("#xb").onclick=close_;$("#veil").onclick=close_;
/* ---- account: Google / Facebook / phone (all simulated in this prototype) ---- */
let au={};
function authOpen(msg,after){au={s:"home",msg:msg||"",after:after||null,phone:"",via:"",err:""};body.classList.add("mo");authDraw()}
function authClose(){body.classList.remove("mo")}
const digits=s=>String(s).replace(/\D/g,"").replace(/^(63|0)/,"");
function authDraw(){const b=$("#mb");let h="";const er=`<p class="er" id="er">${esc(au.err)}</p>`;
if(au.s=="home")h=`<h3>Create your account</h3><p class="s">${esc(au.msg||"Sign in to order and track your food.")}</p><button class="sb" data-via="Google"><b>G</b>Continue with Google</button><button class="sb fb" data-via="Facebook"><b>f</b>Continue with Facebook</button><div class="or"><span>or use your number</span></div><div class="ph"><span>+63</span><input type="tel" id="ph" inputmode="numeric" placeholder="9XX XXX XXXX" maxlength="13" autocomplete="tel-national" value="${esc(au.phone)}"></div>${er}<button class="btn" data-a="otp">Send code</button><p class="note">Prototype: Google, Facebook and the code are simulated.</p>`;
else if(au.s=="conn")h=`<div style="text-align:center"><div class="spin"></div><h3 style="font-size:24px">Connecting to ${esc(au.via)}…</h3><p class="s">Prototype only. Nothing is shared.</p></div>`;
else if(au.s=="otp")h=`<h3>Enter the code</h3><p class="s">We sent a 6-digit code to +63 ${esc(au.phone)}. Prototype: any 6 digits work.</p><input class="otp" id="otp" inputmode="numeric" maxlength="6" placeholder="······" autocomplete="one-time-code">${er}<button class="btn" data-a="ver">Verify</button><button class="btn ghost" data-a="back">Back</button>`;
else h=`<h3>Almost done</h3><p class="s">${au.via?"Connected with "+esc(au.via)+".":"Number verified."} Tell us who is ordering.</p><input type="text" id="nn" placeholder="Full name" autocomplete="name" maxlength="40"><div class="ph"><span>+63</span><input type="tel" id="np" inputmode="numeric" placeholder="9XX XXX XXXX" maxlength="13" value="${esc(au.phone)}"></div><p class="note" style="margin:-4px 0 10px;text-align:left">We use your number to call you about your order.</p>${er}<button class="btn" data-a="fin">Create account</button>`;
b.innerHTML=h;const f=b.querySelector("input");if(f&&au.s!="conn")setTimeout(()=>f.focus(),60)}
$("#mb").onclick=e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset;
if(d.via){au.via=d.via;au.s="conn";authDraw();setTimeout(()=>{au.s="name";authDraw()},1000)}
else if(d.a=="otp"){const p=digits($("#ph").value);if(p.length!=10){au.err="Enter a 10-digit mobile number, like 912 345 6789.";au.phone=$("#ph").value;return authDraw()}au.phone=p;au.err="";au.s="otp";authDraw()}
else if(d.a=="ver"){if($("#otp").value.replace(/\D/g,"").length!=6){au.err="Enter the 6-digit code.";return authDraw()}au.err="";au.s="name";authDraw()}
else if(d.a=="back"){au.s="home";au.err="";authDraw()}
else if(d.a=="fin"){const n=$("#nn").value.trim().replace(/\s+/g," "),p=digits($("#np").value);if(n.length<2){au.err="Please enter your name.";au.phone=$("#np").value;return authDraw()}if(p.length!=10){au.err="Enter a 10-digit mobile number.";au.phone=$("#np").value;return authDraw()}
const us=DZ.users();let u=us.find(x=>digits(x.phone)==p);if(!u){u={id:"u"+Date.now(),name:n,phone:"0"+p,via:au.via||"Phone",joined:Date.now()};us.push(u);DZ.set("users",us)}
DZ.set("me",u.id);acct();authClose();const f=au.after;au.after=null;if(f)f()}};
$("#mb").addEventListener("keydown",e=>{if(e.key=="Enter"){const b=$("#mb .btn");if(b)b.click()}});
$("#mx").onclick=authClose;$("#md").onclick=e=>{if(e.target.id=="md")authClose()};
addEventListener("keydown",e=>{if(e.key=="Escape"){close_();authClose()}});
/* updates from the admin panel (another tab) */
function refreshSite(){applyCfg();acct();renderTabs();renderGrid();sync();if(body.classList.contains("open")&&(step==0||step==3))draw()}
addEventListener("storage",e=>{if(!e.key||!e.key.startsWith("dz_"))return;refreshSite();return;if(body.classList.contains("open")&&(step==0||step==3))draw()});
setInterval(()=>{if(body.classList.contains("open")&&step==3)draw()},20000);
applyCfg();acct();renderTabs();renderGrid();sync();
const io=new IntersectionObserver(a=>a.forEach(x=>x.isIntersecting&&(x.target.classList.add("on"),io.unobserve(x.target))),{threshold:.12});
document.querySelectorAll(".rv").forEach(x=>io.observe(x));
/* ---- real Google map tabs (embedded map, tilted in 3D) ---- */
(function(){const g=$("#gm"),m=$("#m3"),f=$("#gf"),gi=document.querySelector(".gmi");
const url=sat=>"https://www.google.com/maps?q="+encodeURIComponent(MAP_Q)+"&z=16&output=embed"+(sat?"&t=k":"");
document.querySelectorAll(".mt button").forEach(b=>b.onclick=()=>{const v=b.dataset.v;document.querySelectorAll(".mt button").forEach(x=>x.classList.toggle("on",x==b));m.hidden=v!="s";g.hidden=v=="s";if(v!="s"){const u=url(v=="k");if(f.dataset.u!=u){f.src=u;f.dataset.u=u}}});
$("#tl").oninput=e=>gi.style.setProperty("--t",e.target.value+"deg");$("#tz").oninput=e=>gi.style.setProperty("--z",e.target.value+"deg")})();

/* ===== BURGER (Three.js) ===== */
(function(){const cv=$("#bc");
if(!window.THREE){cv.replaceWith(Object.assign(document.createElement("div"),{textContent:"🍔",style:"font-size:160px;display:grid;place-items:center;height:100%"}));return}
const T=THREE,R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.08;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
const S=new T.Scene(),C=new T.PerspectiveCamera(30,1,.1,80),rnd=(a=1)=>Math.random()*a;
/* studio reflections: a small room of soft lights baked into an environment map */
{const pm=new T.PMREMGenerator(R),es=new T.Scene();es.add(new T.Mesh(new T.SphereGeometry(20,32,16),new T.MeshBasicMaterial({color:0x3a2a1b,side:T.BackSide})));
const pn=(c,i,x,y,z,w,h)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
pn(0xfff1dd,7,-8,8,6,9,6);pn(0xffa860,4,9,3,-6,6,10);pn(0xffffff,3,0,13,0,10,10);pn(0xffd2a0,1.6,6,2,8,8,3);
S.environment=pm.fromScene(es,.04).texture;pm.dispose()}
const tex=(fn,s=true)=>{const c=document.createElement("canvas");c.width=c.height=256;fn(c.getContext("2d"),256);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(s)t.encoding=T.sRGBEncoding;return t};
const speck=(base,cols,n,r,s=true)=>tex((x,w)=>{x.fillStyle=base;x.fillRect(0,0,w,w);for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.globalAlpha=.3+rnd(.5);x.beginPath();x.arc(rnd(w),rnd(w),.8+rnd(r),0,7);x.fill()}},s);
const bunTex=tex((x,w)=>{const g=x.createLinearGradient(0,0,0,w);g.addColorStop(0,"#8f4112");g.addColorStop(.5,"#c9772a");g.addColorStop(1,"#efb85f");x.fillStyle=g;x.fillRect(0,0,w,w);for(let i=0;i<1800;i++){x.fillStyle=["#f3c06a","#9a4e16","#dc9238"][i%3];x.globalAlpha=.22;x.fillRect(rnd(w),rnd(w),1+rnd(3),1+rnd(3))}});
const bump=speck("#808080",["#fff","#000","#aaa"],2600,2.4,false);bump.repeat.set(2,2);
const P=(o)=>new T.MeshPhysicalMaterial(o);
const mBun=P({map:bunTex,bumpMap:bump,bumpScale:.6,roughness:.5,clearcoat:.25,clearcoatRoughness:.4}),
mPat=P({map:speck("#4a2815",["#2a1409","#6e3f22","#1a0a04","#85502e"],3800,2.6),bumpMap:bump,bumpScale:1.6,roughness:.7,clearcoat:.4,clearcoatRoughness:.5}),
mChe=P({color:0xffb017,roughness:.3,clearcoat:1,clearcoatRoughness:.12,emissive:0x5c3200,emissiveIntensity:.2,side:T.DoubleSide}),
mLet=P({vertexColors:true,roughness:.4,clearcoat:.3,side:T.DoubleSide}),
mTom=P({map:tex((x,w)=>{x.fillStyle="#bd2618";x.fillRect(0,0,w,w);const g=x.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,"#ea5a42");g.addColorStop(1,"#cf3322");x.fillStyle=g;x.beginPath();x.arc(128,128,112,0,7);x.fill();x.strokeStyle="#f2a090";x.lineWidth=3;for(let i=0;i<6;i++){x.beginPath();x.moveTo(128,128);x.lineTo(128+Math.cos(i*1.047)*100,128+Math.sin(i*1.047)*100);x.stroke()}x.fillStyle="#f4c862";for(let i=0;i<12;i++){x.beginPath();x.ellipse(128+Math.cos(i*.52)*62,128+Math.sin(i*.52)*62,7,10,i*.52,0,7);x.fill()}}),roughness:.25,clearcoat:.9,clearcoatRoughness:.1}),
mOn=P({color:0xefe2c4,roughness:.4,clearcoat:.4}),mSd=P({color:0xf5e3b3,roughness:.45}),
mPk=P({map:tex((x,w)=>{const g=x.createRadialGradient(128,128,20,128,128,126);g.addColorStop(0,"#9fba54");g.addColorStop(.8,"#6f8f2f");g.addColorStop(1,"#4f6d20");x.fillStyle=g;x.fillRect(0,0,w,w);x.fillStyle="#d9e6a0";for(let i=0;i<26;i++){x.beginPath();x.ellipse(128+Math.cos(i)*(30+i*2.5),128+Math.sin(i*1.7)*(30+i*2.5),4,7,i,0,7);x.fill()}}),roughness:.3,clearcoat:.8}),
mBc=P({map:tex((x,w)=>{x.fillStyle="#8c2a1a";x.fillRect(0,0,w,w);for(let i=0;i<8;i++){x.fillStyle=i%2?"#f1d2a6":"#b5402a";x.globalAlpha=.9;x.fillRect(0,i*32+4,w,i%2?14:22)}}),roughness:.45,clearcoat:.5,side:T.DoubleSide}),
mSa=P({color:0xe0875a,roughness:.3,clearcoat:.8}),
mWood=P({map:tex((x,w)=>{const g=x.createLinearGradient(0,0,0,w);g.addColorStop(0,"#5c3b20");g.addColorStop(1,"#4a2f19");x.fillStyle=g;x.fillRect(0,0,w,w);for(let i=0;i<90;i++){x.strokeStyle=["#3d2512","#6e4727","#2f1c0d"][i%3];x.globalAlpha=.25;x.lineWidth=1+rnd(2);x.beginPath();const y=rnd(w);x.moveTo(0,y);x.bezierCurveTo(80,y+rnd(12)-6,170,y+rnd(12)-6,w,y);x.stroke()}}),roughness:.6});
const G=new T.Group();S.add(G);const L=[];let H=0;
const add=(o,h,gap)=>{o.userData.b=H;o.position.y=H;G.add(o);L.push(o);H+=h+gap;return o};
const lathe=(pts,seg=72)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
const wob=(g,min)=>{const A=g.attributes.position;for(let i=0;i<A.count;i++){const x=A.getX(i),z=A.getZ(i),r=Math.hypot(x,z);if(r>min){const t=Math.atan2(z,x),k=1+.035*Math.sin(t*6)+.02*Math.sin(t*13+2);A.setX(i,x*k);A.setZ(i,z*k)}}g.computeVertexNormals();return g};
/* bottom bun */
add(new T.Mesh(lathe([[0,0],...Array.from({length:15},(_,i)=>{const a=i/14*Math.PI/2;return[1.2*Math.sin(a)+.001,.48*(1-Math.cos(a))]}),[1.22,.5],[1.18,.58],[0,.6]]),mBun),.6,.03);
/* sauce */
add(new T.Mesh(wob(lathe([[0,0],[.95,0],[1.05,.03],[.95,.07],[0,.07]],56),.5),mSa),.07,.02);
/* lettuce: two ruffled leaves */
const leaf=(rad,ph)=>{const g=new T.RingGeometry(.05,rad,110,12);g.rotateX(-Math.PI/2);const A=g.attributes.position,col=[];
for(let i=0;i<A.count;i++){const x=A.getX(i),z=A.getZ(i),r=Math.hypot(x,z),t=Math.atan2(z,x),k=r/rad,rr=r*(1+.05*Math.sin(t*13+ph)*k+.03*Math.sin(t*7+1)*k);
A.setXYZ(i,Math.cos(t)*rr,(Math.sin(t*10+k*3+ph)*.07+Math.sin(t*5)*.05)*Math.pow(k,1.3)+.05*k,Math.sin(t)*rr);const c=new T.Color().setHSL(.26+.04*k,.55,.3+.2*k);col.push(c.r,c.g,c.b)}
g.setAttribute("color",new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return new T.Mesh(g,mLet)};
{const o=new T.Group(),a=leaf(1.5,0),b=leaf(1.3,2);b.position.y=.05;b.rotation.y=1.2;o.add(a,b);add(o,.16,.03)}
/* tomato */
{const o=new T.Group();[[-.38,.1,.88],[.45,-.1,.8]].forEach(([x,z,r])=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,.12,56),mTom);m.position.set(x,.06+(x>0?.02:0),z);o.add(m)});add(o,.13,.03)}
/* onion */
{const o=new T.Group();[[.9,.05],[.55,.05],[.25,.05]].forEach(([r,t],i)=>{const m=new T.Mesh(new T.TorusGeometry(r,t,10,48),mOn);m.rotation.x=Math.PI/2;m.position.set(i==2?.4:0,.05,i==2?-.2:0);o.add(m)});o.rotation.y=.6;add(o,.1,.02)}
/* patties with grill marks, cheese, pickles */
const grill=()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.translate(128,128);x.rotate(-.7);x.strokeStyle="rgba(10,4,0,.7)";x.lineWidth=15;x.lineCap="round";for(let i=-5;i<=5;i++){x.beginPath();x.moveTo(-130,i*30);x.lineTo(130,i*30);x.stroke()}const t=new T.CanvasTexture(c);return t};
const patty=()=>{const m=new T.Mesh(wob(lathe([[0,0],[1.1,0],[1.2,.05],[1.25,.17],[1.22,.3],[1.12,.36],[0,.37]],80),.8),mPat);
const g=new T.Mesh(new T.CircleGeometry(1.1,48),new T.MeshStandardMaterial({map:grill(),transparent:true,depthWrite:false,roughness:.9,polygonOffsetFactor:-2,polygonOffset:true}));g.rotation.x=-Math.PI/2;g.position.y=.372;m.add(g);return m};
const cheese=()=>{const g=new T.BoxGeometry(2.7,.06,2.7,26,1,26),A=g.attributes.position;for(let i=0;i<A.count;i++){const d=Math.max(0,Math.hypot(A.getX(i),A.getZ(i))-1.05);A.setY(i,A.getY(i)-d*d*.5+.07)}g.computeVertexNormals();const m=new T.Mesh(g,mChe);m.rotation.y=Math.PI/4;return m};
add(patty(),.37,0);add(cheese(),.1,.02);
{const o=new T.Group();[[0,.55],[-.5,-.35],[.55,-.3]].forEach(([x,z])=>{const m=new T.Mesh(new T.CylinderGeometry(.42,.42,.05,32),mPk);m.position.set(x,.03,z);o.add(m)});add(o,.07,.02)}
const p2=add(patty(),.37,0);p2.rotation.y=2;const c2=add(cheese(),.1,.03);c2.rotation.y=Math.PI/4+.5;
/* bacon */
{const o=new T.Group();[[.5,.35],[-.5,-.4]].forEach(([r,z],i)=>{const g=new T.PlaneGeometry(2.9,.5,60,1);g.rotateX(-Math.PI/2);const A=g.attributes.position;for(let k=0;k<A.count;k++){const x=A.getX(k);A.setY(k,Math.sin(x*3+i)*.07+Math.sin(x*7)*.02+.05)}g.computeVertexNormals();const m=new T.Mesh(g,mBc);m.rotation.y=r*(i?1:-1);m.position.z=z*.4;o.add(m)});add(o,.14,.02)}
/* top bun with sesame */
{const pts=[[0,0],[1.2,0],[1.25,.1]];for(let i=1;i<=18;i++){const a=i/18*Math.PI/2;pts.push([1.25*Math.cos(a)*.999+.0005,.1+.92*Math.pow(Math.sin(a),.85)])}
const top=new T.Mesh(lathe(pts),mBun),sg=new T.SphereGeometry(1,8,6);
for(let i=0;i<70;i++){const a=rnd(Math.PI*2),b=.1+rnd(1.1),x=1.25*Math.cos(b)*.97*Math.cos(a),y=.1+.92*Math.pow(Math.sin(b),.85)+.01,z=1.25*Math.cos(b)*.97*Math.sin(a),s=new T.Mesh(sg,mSd),k=.8+rnd(.5);
s.scale.set(.07*k,.035*k,.04*k);s.position.set(x,y,z);s.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(x/1.56,(y-.1)/.85,z/1.56).normalize());s.rotateY(rnd(6));top.add(s)}
add(top,1.05,0)}
G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
/* wooden serving board */
const board=new T.Mesh(new T.CylinderGeometry(2.35,2.35,.14,72),mWood);board.receiveShadow=true;S.add(board);
/* lights */
S.add(new T.HemisphereLight(0xfff0dc,0x3a2210,.35));
const k=new T.DirectionalLight(0xffe2bd,2.6);k.position.set(-4,9,5);k.castShadow=true;k.shadow.mapSize.set(2048,2048);Object.assign(k.shadow.camera,{left:-4,right:4,top:6,bottom:-6,near:.5,far:30});k.shadow.bias=-.0004;k.shadow.normalBias=.03;S.add(k);
const rim=new T.DirectionalLight(0xff7a1a,2);rim.position.set(5,3,-6);S.add(rim);
const stage=cv.parentElement,hero=$(".hero"),vis=live(stage);
function size(){const w=stage.clientWidth,h=stage.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
new ResizeObserver(size).observe(stage);size();
let p=0,sp=0,spin=0,dn=null;const calc=()=>p=Math.min(1,Math.max(0,scrollY/(hero.offsetHeight-innerHeight)));addEventListener("scroll",calc,{passive:true});calc();
cv.onpointerdown=e=>{dn=e.clientX;cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(dn!==null){spin+=(e.clientX-dn)*.012;dn=e.clientX}};cv.onpointerup=cv.onpointercancel=()=>dn=null;
function frame(t){requestAnimationFrame(frame);if(!vis())return;
sp+=(p-sp)*.1;const e=sp*sp*(3-2*sp)*.46,n=L.length;
L.forEach((o,i)=>o.position.y=o.userData.b+i*e);
const tot=H+(n-1)*e;G.position.y=-tot/2+.02;board.position.y=-tot/2-.06;
G.rotation.y=(RM?.6:t/4500)+sp*Math.PI*1.6+mx*.5+spin;G.rotation.z=my*.06;
const asp=C.aspect,tn=2*Math.tan(.2618),dw=5.2/(tn*asp),dh=(tot+.9)/tn,d=Math.max(dw,dh)*1.04;
C.position.set(0,d*.32,d*.95);C.lookAt(0,-.1,0);R.render(S,C)}
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

/* ===== ADMIN PANEL "Grill Control" (open the site with #admin at the end of the link) ===== */
(function(){
const host=document.getElementById("adm"),root=host.attachShadow({mode:"open"});
root.appendChild(document.getElementById("at").content.cloneNode(true));
const $=s=>root.querySelector(s);
/* admin.js · Grill Control, the Don Zulueta admin panel (prototype) */
const peso=n=>"₱"+Number(n).toLocaleString();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const AUTH={u:"admin",p:"don123"}; /* PROTOTYPE ONLY: a real admin login needs a backend */
const ST={new:["Received","new","#ff7a1a"],preparing:["Preparing","prep","#f0b94d"],ready:["Ready","ready","#4ade80"],done:["Completed","done","#5eb1ff"],cancelled:["Cancelled","can","#ff5d73"]};
const NEXT={new:["preparing","Accept and start"],preparing:["ready","Mark ready"],ready:["done","Complete"]};
let view="dash",seen=-1;
const isIn=()=>{try{return sessionStorage.getItem("dz_admin")=="1"}catch(e){return !!window._a}};
const setIn=v=>{window._a=v;try{v?sessionStorage.setItem("dz_admin","1"):sessionStorage.removeItem("dz_admin")}catch(e){}};
const ago=t=>{const m=Math.floor((Date.now()-t)/6e4);return m<1?"just now":m<60?m+" min ago":m<1440?Math.floor(m/60)+" h ago":Math.floor(m/1440)+" d ago"};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2600)}
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();setTimeout(()=>o.frequency.value=1175,120);setTimeout(()=>{o.stop();c.close()},280)}catch(e){}}
/* ---------- login ---------- */
function login(){$("#app").innerHTML=`<div class="lg"><form class="lc" id="lf"><div class="mk">🔥</div><h1>Grill Control</h1><p>Don Zulueta staff panel. Sign in to manage orders and the menu.</p><label class="f">Username<input id="lu" autocomplete="username" autofocus></label><label class="f">Password<input id="lp" type="password" autocomplete="current-password"></label><div class="err" id="le"></div><button class="btn" style="width:100%">Sign in</button><div class="hint">Prototype login: <b>admin</b> / <b>don123</b></div><button type="button" class="btn g" id="bk0" style="width:100%;margin-top:12px">← Back to website</button></form></div>`;
$("#bk0").onclick=()=>{location.hash=""};$("#lf").onsubmit=e=>{e.preventDefault();if($("#lu").value.trim()==AUTH.u&&$("#lp").value==AUTH.p){setIn(true);shell()}else{$("#le").textContent="Wrong username or password.";const c=$(".lc");c.classList.remove("shake");void c.offsetWidth;c.classList.add("shake")}}}
/* ---------- shell ---------- */
const NAV=[["dash","📊","Overview"],["orders","🧾","Orders"],["menu","🍔","Menu"],["cust","👥","Customers"],["set","⚙️","Settings"]];
function shell(){$("#app").innerHTML=`<div class="app"><aside class="rail"><div class="lo">🔥</div>${NAV.map(n=>`<button class="nv" data-v="${n[0]}"><i>${n[1]}</i>${n[2]}<span class="bg" hidden></span></button>`).join("")}</aside><main class="mn"><div class="top"><div><h1 id="tt"></h1><small id="ts"></small></div><div class="tr"><span class="pill live">Live</span><button class="pill" id="bk">🌐 Website</button><button class="pill" id="lo">Log out</button><span class="pill" id="ck"></span><label class="pill" style="cursor:pointer"><span id="sl">Shop open</span><span class="sw" id="so"></span></label></div></div><div id="vw"></div></main></div>`;
$(".rail").onclick=e=>{const b=e.target.closest(".nv");if(!b)return;view=b.dataset.v;draw()};$("#lo").onclick=()=>{setIn(false);login()};$("#bk").onclick=()=>{location.hash=""};
$("#so").parentElement.onclick=e=>{e.preventDefault();const c=DZ.cfg();c.open=!c.open;DZ.set("cfg",c);draw();toast(c.open?"Shop is now open":"Shop is now closed")};
$("#vw").onclick=act;seen=DZ.orders().length;draw()}
const TT={dash:["Overview","How the shop is doing today"],orders:["Orders","Move each order from the kitchen to the customer"],menu:["Menu","Add, edit or hide what customers can order"],cust:["Customers","People who created an account"],set:["Settings","Shop details and demo data"]};
function draw(){if(!$("#vw"))return;const os=DZ.orders(),c=DZ.cfg(),n=os.filter(o=>o.status=="new").length;
root.querySelectorAll(".nv[data-v]").forEach(b=>{b.classList.toggle("on",b.dataset.v==view);if(b.dataset.v=="orders"){const g=b.querySelector(".bg");g.hidden=!n;g.textContent=n}});
$("#tt").textContent=TT[view][0];$("#ts").textContent=TT[view][1];$("#so").classList.toggle("on",c.open);$("#sl").textContent=c.open?"Shop open":"Shop closed";
$("#vw").innerHTML={dash,orders,menu,cust,set}[view]();tick()}
function tick(){const e=$("#ck");if(e)e.textContent=new Date().toLocaleString("en",{weekday:"short",hour:"numeric",minute:"2-digit"})}
setInterval(tick,3e4);setInterval(()=>{if(isIn()&&(view=="orders"||view=="dash")&&!root.querySelector(".ov"))draw()},45e3);
/* ---------- views ---------- */
function dash(){const os=DZ.orders(),ok=os.filter(o=>o.status!="cancelled"),d0=new Date();d0.setHours(0,0,0,0);const t0=+d0;
const day=(a,b)=>ok.filter(o=>o.t>=a&&o.t<b),sum=a=>a.reduce((s,o)=>s+o.total,0),td=day(t0,t0+864e5),yd=day(t0-864e5,t0);
const dl=(a,b)=>b?Math.round((a-b)/b*100):(a?100:0),dt=(a,b)=>{const x=dl(a,b);return`<small class="${x>=0?"up":"dn"}">${x>=0?"▲":"▼"} ${Math.abs(x)}% vs yesterday</small>`};
const act=os.filter(o=>["new","preparing","ready"].includes(o.status)).length,avg=td.length?Math.round(sum(td)/td.length):0,yav=yd.length?Math.round(sum(yd)/yd.length):0;
const days=[...Array(7)].map((_,i)=>{const s=t0-(6-i)*864e5;return{l:new Date(s).toLocaleDateString("en",{weekday:"short"}),v:sum(day(s,s+864e5))}}),mx=Math.max(1,...days.map(d=>d.v));
const bars=days.map((d,i)=>{const h=Math.round(d.v/mx*140),x=18+i*64;return`<g><rect x="${x}" y="${170-h}" width="42" height="${Math.max(h,3)}" rx="10" fill="url(#gb)"><title>${d.l}: ${peso(d.v)}</title></rect><text x="${x+21}" y="192" text-anchor="middle" fill="#a89880" font-size="12">${d.l}</text>${d.v?`<text x="${x+21}" y="${162-h}" text-anchor="middle" fill="#f6ecdc" font-size="11" font-weight="700">${peso(d.v)}</text>`:""}</g>`}).join("");
const cnt={};ok.forEach(o=>o.items.forEach(i=>cnt[i.n]=(cnt[i.n]||0)+i.q));const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5),tm=top[0]?top[0][1]:1;
const rec=[...os].sort((a,b)=>b.t-a.t).slice(0,6);
return`<div class="kp"><div class="cd" style="--c:#ff7a1a"><span>Sales today</span><b>${peso(sum(td))}</b>${dt(sum(td),sum(yd))}</div><div class="cd" style="--c:#f0b94d"><span>Orders today</span><b>${td.length}</b>${dt(td.length,yd.length)}</div><div class="cd" style="--c:#4ade80"><span>Active orders</span><b>${act}</b><small style="color:var(--mu)">in the kitchen now</small></div><div class="cd" style="--c:#5eb1ff"><span>Average order</span><b>${peso(avg)}</b>${dt(avg,yav)}</div></div>
<div class="g2"><div class="cd"><h3>Sales, last 7 days</h3><svg viewBox="0 0 460 200" width="100%" role="img" aria-label="Sales chart"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb45c"/><stop offset="1" stop-color="#ff7a1a"/></linearGradient></defs>${bars}</svg></div>
<div class="cd"><h3>Top sellers</h3>${top.length?`<div class="tp">${top.map(t=>`<div><div class="rw"><span>${esc(t[0])}</span><b>${t[1]}</b></div><div class="br"><i style="width:${t[1]/tm*100}%"></i></div></div>`).join("")}</div>`:'<p class="empty">No sales yet. Add demo orders in Settings.</p>'}</div></div>
<div class="cd" style="margin-top:14px"><h3>Latest orders</h3>${rec.length?rec.map(o=>`<div class="ft"><div><b>${o.no}</b> · ${esc(o.name)}<br><span style="color:var(--mu);font-size:13px">${o.items.map(i=>i.q+"× "+esc(i.n)).join(", ")}</span></div><div style="text-align:right"><span class="st ${ST[o.status][1]}">${ST[o.status][0]}</span><br><b>${peso(o.total)}</b></div></div>`).join(""):'<p class="empty">No orders yet.</p>'}</div>`}
function orders(){const os=DZ.orders().sort((a,b)=>a.t-b.t),cols=["new","preparing","ready","done"];
return`<div class="kb">${cols.map(s=>{const l=os.filter(o=>o.status==s);const sh=s=="done"?l.slice(-12).reverse():l;return`<div class="col"><h3>${ST[s][0]} <em>${l.length}</em></h3>${sh.length?sh.map(o=>card(o)).join(""):'<p class="empty">Nothing here</p>'}</div>`}).join("")}</div>`}
function card(o){const nx=NEXT[o.status];return`<div class="oc" style="--ac:${ST[o.status][2]}"><div class="h"><b>${o.no}</b><span class="m">${ago(o.t)}</span></div><div class="m">${esc(o.name)} · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>${o.type=="dine"?"Dine-in":"Pickup"} · ${esc(o.pay)}</div><ul>${o.items.map(i=>`<li>${i.q}× ${esc(i.n)}</li>`).join("")}</ul>${o.note?`<div class="nt">Note: ${esc(o.note)}</div>`:""}<div class="f"><span>Total</span><span>${peso(o.total)}</span></div>${nx?`<div class="ac"><button class="btn s" data-adv="${o.id}">${nx[1]}</button>${o.status=="new"?`<button class="btn s r" data-can="${o.id}">Cancel</button>`:""}</div>`:""}</div>`}
function menu(){const m=DZ.menu(),cs=[...new Set(m.map(i=>i.c))];
return`<div class="tbh"><span class="pill">${m.length} items · ${m.filter(i=>!i.on).length} sold out</span><button class="btn" data-edit="0">+ Add item</button></div>${cs.map(c=>`<h3 style="margin:18px 0 12px">${esc(c)}</h3><div class="mg">${m.filter(i=>i.c==c).map(i=>`<div class="cd mi ${i.on?"":"off"}"><div class="tp2"><div class="e">${esc(i.e)}</div><label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:12px;color:var(--mu)" data-tg="${i.id}">${i.on?"Available":"Sold out"}<span class="sw ${i.on?"on":""}"></span></label></div><div><b>${esc(i.n)}</b> ${i.b?`<span class="st new">${esc(i.b)}</span>`:""}</div><p>${esc(i.d)}</p><div class="pr">${peso(i.p)}</div><div class="ac"><button class="btn g s" data-edit="${i.id}">Edit</button><button class="btn r s" data-del="${i.id}">Delete</button></div></div>`).join("")}</div>`).join("")}`}
function cust(){const us=DZ.users(),os=DZ.orders().filter(o=>o.status!="cancelled");
return`<div class="cd sc">${us.length?`<table class="tb"><tr><th>Customer</th><th>Phone</th><th>Signed up with</th><th>Joined</th><th>Orders</th><th>Spent</th></tr>${us.map(u=>{const a=os.filter(o=>o.uid==u.id);return`<tr><td><b>${esc(u.name)}</b></td><td><a href="tel:${esc(u.phone)}">${esc(u.phone)}</a></td><td>${esc(u.via)}</td><td>${new Date(u.joined).toLocaleDateString("en",{month:"short",day:"numeric"})}</td><td>${a.length}</td><td><b>${peso(a.reduce((s,o)=>s+o.total,0))}</b></td></tr>`}).join("")}</table>`:'<p class="empty">No customers yet. They appear when someone creates an account on the website.</p>'}</div>`}
function set(){const c=DZ.cfg();
return`<div class="g2"><form class="cd" id="sf"><h3>Shop details</h3><label class="f">Opening hours<input name="hours" value="${esc(c.hours)}"></label><label class="f">Phone number<input name="phone" value="${esc(c.phone)}"></label><label class="f">Instagram username (without @)<input name="ig" value="${esc(c.ig)}"></label><button class="btn">Save changes</button></form><div class="cd"><h3>Demo data</h3><p style="color:var(--mu);margin-bottom:14px">Fill the panel with sample orders so you can try the dashboard, or wipe everything and start fresh.</p><div style="display:grid;gap:10px"><button class="btn" data-demo="1">Add 8 demo orders</button><button class="btn r" data-reset="1">Reset all data</button></div></div></div>`}
/* ---------- actions ---------- */
function modal(h){const o=document.createElement("div");o.className="ov";o.innerHTML=`<div class="md">${h}</div>`;o.onclick=e=>{if(e.target==o)o.remove()};root.appendChild(o);return o}
function form(id){const i=DZ.menu().find(x=>x.id==id)||{c:"Burgers",n:"",d:"",p:"",e:"🍔",b:"",on:true},cs=[...new Set(DZ.menu().map(x=>x.c))];
const o=modal(`<h2>${id?"Edit item":"New item"}</h2><form id="mf"><label class="f">Name<input name="n" required value="${esc(i.n)}"></label><label class="f">Description<textarea name="d">${esc(i.d)}</textarea></label><div class="rw2"><label class="f">Price (₱)<input name="p" type="number" min="1" required value="${esc(i.p)}"></label><label class="f">Emoji<input name="e" required maxlength="4" value="${esc(i.e)}"></label></div><div class="rw2"><label class="f">Category<input name="c" list="cl" required value="${esc(i.c)}"><datalist id="cl">${cs.map(c=>`<option value="${esc(c)}">`).join("")}</datalist></label><label class="f">Badge<select name="b">${["","Popular","New","Spicy","Chef pick"].map(b=>`<option ${b==i.b?"selected":""} value="${b}">${b||"None"}</option>`).join("")}</select></label></div><div class="ac"><button type="button" class="btn g" id="mc">Cancel</button><button class="btn">Save item</button></div></form>`);
o.querySelector("#mc").onclick=()=>o.remove();
o.querySelector("#mf").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),m=DZ.menu();f.p=Math.max(1,+f.p||0);
if(id){Object.assign(m.find(x=>x.id==id),f)}else m.push({id:Math.max(0,...m.map(x=>x.id))+1,on:true,...f});
DZ.set("menu",m);o.remove();draw();toast("Menu saved")}}
function act(e){const t=e.target.closest("[data-adv],[data-can],[data-edit],[data-del],[data-tg],[data-demo],[data-reset]");if(!t)return;const d=t.dataset,os=DZ.orders();
if(d.adv||d.can){const o=os.find(x=>x.id==(d.adv||d.can));if(!o)return;o.status=d.can?"cancelled":NEXT[o.status][0];DZ.set("orders",os);draw();toast(o.no+" · "+ST[o.status][0])}
else if(d.edit!=null)form(+d.edit);
else if(d.del){if(!confirm("Delete this menu item?"))return;DZ.set("menu",DZ.menu().filter(x=>x.id!=d.del));draw()}
else if(d.tg){const m=DZ.menu(),i=m.find(x=>x.id==d.tg);i.on=!i.on;DZ.set("menu",m);draw()}
else if(d.demo)demo();
else if(d.reset){if(!confirm("Delete all orders, customers and menu changes in this browser?"))return;Object.values(DZ.K).forEach(k=>{try{localStorage.removeItem(k)}catch(x){}});location.reload()}}
root.addEventListener("submit",e=>{if(e.target.id!="sf")return;e.preventDefault();const c=DZ.cfg();Object.assign(c,Object.fromEntries(new FormData(e.target)));c.ig=c.ig.replace(/^@/,"");DZ.set("cfg",c);toast("Settings saved")});
function demo(){const m=DZ.menu().filter(i=>i.on),us=DZ.users();if(!us.length)["Maria Santos","Juan Dela Cruz","Ana Reyes"].forEach((n,i)=>us.push({id:"d"+i,name:n,phone:"0917 000 00"+(10+i),via:["Google","Facebook","Phone"][i],joined:Date.now()-(i+2)*864e5}));DZ.set("users",us);
const os=DZ.orders(),pays=["GCash","Maya","Card","Cash"];
for(let k=0;k<8;k++){const u=us[k%us.length],its=[...Array(1+k%3)].map((_,j)=>{const i=m[(k*3+j*5)%m.length];return{id:i.id,n:i.n,p:i.p,q:1+(k+j)%2}}),age=k<3?k*8*6e4:(k-2)*20*36e5;
os.push({id:"o"+Date.now()+k,no:"DZ-"+(1001+os.length),uid:u.id,name:u.name,phone:u.phone,type:k%2?"dine":"pickup",pay:pays[k%4],note:k==1?"No onions please":"",items:its,total:its.reduce((s,i)=>s+i.p*i.q,0),status:k<2?"new":k<3?"preparing":"done",t:Date.now()-age})}
DZ.set("orders",os);draw();toast("Added 8 demo orders")}
/* live updates from the website (other tab) */
addEventListener("storage",ev=>{if(!isIn()||!ev.key||!ev.key.startsWith("dz_"))return;const n=DZ.orders().length;if(seen>=0&&n>seen){beep();toast("New order received!")}seen=n;if(!root.querySelector(".ov"))draw()});
function route(){const on=location.hash=="#admin";host.classList.toggle("on",on);document.body.classList.toggle("alock",on);if(on){isIn()?shell():login()}else refreshSite()}
addEventListener("hashchange",route);route();

})();

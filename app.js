/* Menu, cart, payment, reveal + shared helpers */
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

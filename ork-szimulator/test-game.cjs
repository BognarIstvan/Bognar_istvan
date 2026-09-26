const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map();
function boot(){
 const elems=new Map(),events={};
 const noop=()=>{};const context=new Proxy({measureText:s=>({width:s.length*7}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(!elems.has(id))elems.set(id,{id,hidden:['hud','modalBackdrop'].includes(id),style:{},children:[],classList:{add:noop,remove:noop,toggle:noop},getContext:()=>context,focus:noop,setAttribute:noop,replaceChildren(){this.children=[];},append(b){this.children.push(b);},addEventListener:noop,querySelectorAll:()=>[]});return elems.get(id);}
 const sandbox={console,Math,JSON,Number,Array,Object,Infinity,Set,Map,innerWidth:1280,innerHeight:800,devicePixelRatio:1,Image:class{},setTimeout:noop,requestAnimationFrame:noop,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{getElementById:element,createElement:tag=>({...element('anon'+Math.random()),children:[]}),querySelectorAll:()=>[],addEventListener:(k,fn)=>events[k]=fn},window:{addEventListener:(k,fn)=>events[k]=fn}};
 let code=fs.readFileSync('game.js','utf8').replace('// Read-only inspection hook',`window.test={start,fresh,station,close,interact,bike,update,save,load,render,get:()=>state,set:(x)=>Object.assign(state,x),nearby,keys:(x)=>keys=x,solid,groundItems,locations,bins,blocked,W,H,MAP,site,buildings};\n// Read-only inspection hook`);
 vm.runInNewContext(fs.readFileSync('map-data.js','utf8'),sandbox);vm.runInNewContext(code,sandbox);return {t:sandbox.window.test,el:element,events};
}
let {t,el,events}=boot();t.start(t.fresh());
function act(label){const b=el('modalActions').children.find(b=>b.innerHTML.startsWith(label));assert.ok(b,'Action missing: '+label);assert.ok(!b.disabled,'Action disabled: '+label);b.onclick();}
function collectBin(i){t.set({x:t.bins[i].x,y:t.bins[i].y,bike:false});t.interact();}
collectBin(1);assert.equal(t.get().bottles,2);assert.equal(t.get().butts,1);collectBin(1);assert.equal(t.get().bottles,2,'Cannot collect before cooldown');
for(const i of [2,3,4,5,6])collectBin(i);assert.equal(t.get().bottles,12);collectBin(7);assert.equal(t.get().bottles,12,'Bag capacity enforced');
t.station('shop');act('Palackok');assert.equal(t.get().cash,180);assert.equal(t.get().bottles,0);act('Egy üveg');act('Egy üveg');assert.equal(t.get().wine,2);assert.equal(t.get().cash,30);assert.ok(el('modalActions').children.find(b=>b.innerHTML.startsWith('Egy üveg')).disabled,'Cannot overspend');
t.close();t.station('parliament');act('Csucsó leadása');assert.equal(t.get().delivered,2);assert.equal(t.get().wine,0);act('Parlamenti sodrás');assert.equal(t.get().cigs,1);assert.equal(t.get().paper,0);assert.equal(t.get().butts,1);
t.close();t.station('culture');assert.equal(el('modalTitle').textContent,'Kultúrház');assert.equal(t.get().cash,30);assert.equal(t.get().cigs,1);t.close();
t.station('castle');act('A hat palack');assert.equal(t.get().bottles,6);t.station('castle');assert.ok(el('modalActions').children[0].disabled);t.close();
t.station('shop');act('Palackok');act('Egy üveg');t.close();t.station('parliament');act('Csucsó leadása');assert.equal(t.get().delivered,3);assert.equal(t.get().won,true);assert.equal(el('modalTitle').textContent,'A határozat elfogadva!');t.close();
const saved=t.load();assert.equal(saved.won,true);const second=boot();second.t.render();second.events.blur();assert.equal(second.t.load().won,true,'Title screen must not overwrite existing save');
t.start(t.fresh());const boost=t.groundItems.find(i=>i.type==='boost');t.set({x:boost.x,y:boost.y});t.interact();assert.equal(t.get().boost,20);t.update(20);assert.equal(t.get().boost,0);assert.equal(t.get().sober,6);t.update(6);assert.equal(t.get().sober,0);
t.set({x:t.get().bikeX,y:t.get().bikeY});t.bike();assert.equal(t.get().bike,true);t.set({boost:8});t.bike();assert.equal(t.get().bike,false);assert.ok(!t.blocked(t.get().bikeX,t.get().bikeY));t.set({x:t.site('well').x,y:t.site('well').y});t.interact();assert.equal(t.get().boost,0);
t.start(t.fresh());const wall=t.buildings.find(b=>b.type==='shop');t.set({x:wall.x+90,y:wall.y+wall.h+25});t.keys({w:true});for(let i=0;i<100;i++)t.update(.02);assert.ok(t.get().y>=wall.y+wall.h+12,'Building wall blocks movement');t.keys({});
collectBin(1);t.station('park');const before=t.get().time;t.update(50);assert.equal(t.get().time,before,'Time freezes in dialogs');t.close();t.update(46);collectBin(1);assert.equal(t.get().bottles,4,'Bins replenish in game time');
// Flood-fill actual collision space. Each interactive object needs a reachable approach.
const step=10,cols=Math.ceil(t.W/10),rows=Math.ceil(t.H/10),visited=new Uint8Array(cols*rows),queue=[];let startX=Math.round(t.fresh().x/step),startY=Math.round(t.fresh().y/step);queue.push([startX,startY]);visited[startY*cols+startX]=1;
for(let q=0;q<queue.length;q++){const[x,y]=queue[q];for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows)continue;const id=ny*cols+nx;if(!visited[id]&&!t.blocked(nx*step,ny*step)){visited[id]=1;queue.push([nx,ny]);}}}
const unreachable=[...t.locations,...t.bins,...t.groundItems].filter(p=>!queue.some(([x,y])=>Math.hypot(x*step-p.x,y*step-p.y)<(p.type?40:60))); if(unreachable.length)console.log({visited:queue.length,start:t.fresh(),unreachable});assert.equal(unreachable.length,0,'All interactive points need a reachable approach');
console.log('PASS: economy, capacity, cooldown, crafting, culture centre, castle reward, win, reload, title-save safety, boost expiry, well, bike, movement collision, paused time, all interaction approaches reachable.');

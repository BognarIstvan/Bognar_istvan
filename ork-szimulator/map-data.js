/* Geography traced from references/csicso-jelolt-terkep.png (1920 × 945).
   X centres are source anchors; the village is expanded for walkable streets.
   School, square, Ham and Csörgő bridge are inferred from the user's description. */
window.CSICSO_MAP = (() => {
 const point=([x,y])=>{const townY=y<=480?80+y*1.3:704+(y-480)*4.6,landY=850+(y-480)*1.3,mix=Math.max(0,Math.min(1,(x-1400)/100));return{x:x<=1400?80+(x-200)*1.15:1460+(x-1400)*4.6,y:landY*(1-mix)+townY*mix};};
 const path=a=>a.map(p=>{const q=point(p);return[q.x,q.y];});
 const anchors=[
 ['parliament','Parlament · Notorik park',1645,617],['shop','Jednota',1577,665],['culture','Kultúrház',1609,722],
 ['well','Artézi kút',1727,693],['park','Hétvezér park',1625,663],['castle','Kastély',1610,583],
 ['lion','Lion-rengeteg',850,495],['square','Főtér',1594,652],['school','Iskola',1567,642],
 ['office','Községi hivatal',1595,702],['restaurant','Lion vendéglő',1584,682],['football','Focipálya',1667,531],['bridge','Csörgő híd',1636,559],
 ['smallbridge','Kishíd',1634,722],['vineyard','Szőlős kertek',947,584],['fishponds','Halastavak',1198,504],
 ['ham','Ham · nádas mocsár',1120,738],['shelter-west','Kiülő',1468,778],['shelter-east','Kiülő',1740,683],
 ['shelter-well','Kiülő a kútnál',1716,700],['birdwatch','Madárles',1835,644]
 ];
 const sites=anchors.map(([id,name,x,y])=>({id,name,source:[x,y],...point([x,y]),color:'#eac367'}));
 const byId=Object.fromEntries(sites.map(s=>[s.id,s]));
 const roads=[
 {name:'Hami út',width:46,p:[[855,495],[932,526],[1046,562],[1190,589],[1317,618],[1444,638],[1555,668]]},
 {name:'Fő utca',width:64,p:[[1420,770],[1480,724],[1555,668],[1588,644],[1645,631],[1700,595],[1768,549],[1840,498]]},
 {name:'Dunajská',width:48,p:[[1555,630],[1564,669],[1578,710],[1592,745],[1617,775],[1633,820],[1650,855]]},
 {name:'Központ',width:44,p:[[1608,598],[1610,646],[1618,683],[1630,722],[1625,772]]},
 {name:'Kishíd útja',width:42,p:[[1568,734],[1609,722],[1634,722],[1672,709],[1718,682]]},
 {name:'Keleti utca',width:42,p:[[1655,625],[1685,664],[1718,705],[1775,743]]},
 {name:'Keleti keresztutca',width:40,p:[[1696,598],[1730,634],[1764,668]]},
 {name:'Csatorna utca',width:40,p:[[1749,554],[1775,590],[1809,615],[1836,648]]},
 {name:'Keresztutca',width:36,p:[[1685,664],[1730,634],[1775,590]]},
 {name:'Keresztutca',width:36,p:[[1718,705],[1764,668],[1809,615]]},
 {name:'Kastélypark erdei út',width:29,p:[[1610,583],[1621,575],[1636,559],[1650,546],[1667,531]]},
 {name:'Notorik park sétánya',width:32,p:[[1610,600],[1645,617],[1645,631]]},
 {name:'Lion-ösvény',width:26,p:[[932,526],[885,550],[857,585],[836,648],[807,715],[770,782],[701,835]]},
 {name:'Szőlőút',width:26,p:[[980,541],[950,577],[935,619]]},
 {name:'Halastavi töltés',width:26,p:[[1104,570],[1134,515],[1165,446],[1165,350],[1133,277],[1105,217],[1166,125]]},
 {name:'Hami földút',width:26,p:[[1190,589],[1160,660],[1120,738],[1086,824]]},
 {name:'Medvei út',width:39,p:[[1555,630],[1495,555],[1450,486],[1410,385],[1367,253]]}
 ].map(r=>({...r,p:path(r.p)}));
 const waters=[
 {name:'Lion',p:[[682,423],[711,447],[758,451],[798,469],[820,459],[847,456],[859,451],[870,479],[886,486],[885,510],[861,527],[858,561],[839,574],[837,531],[818,506],[804,493],[796,503],[808,540],[812,590],[800,635],[780,692],[754,750],[710,801],[681,830],[669,817],[703,779],[741,716],[771,641],[779,574],[764,524],[742,493],[714,479],[687,496],[654,539],[625,586],[600,632],[566,668],[588,615],[620,559],[649,508],[658,489],[643,477],[601,509],[584,500],[580,483],[602,493],[650,458],[679,430]]},
 {name:'Halastó 1',p:[[1166,125],[1236,215],[1134,274],[1094,209]]},
 {name:'Halastó 2',p:[[1138,280],[1242,221],[1284,312],[1166,341]]},
 {name:'Halastó 3',p:[[1168,349],[1287,319],[1317,400],[1310,412],[1166,407]]},
 {name:'Halastó 4',p:[[1167,413],[1320,417],[1342,463],[1336,488],[1154,451]]},
 {name:'Halastó 5',p:[[1151,457],[1333,494],[1315,547],[1133,512]]},
 {name:'Halastó 6',p:[[1130,518],[1311,553],[1298,608],[1108,570]]},
 {name:'Kastélytó',p:[[1610,611],[1627,608],[1630,623],[1624,633],[1605,630]]}
 ].map(w=>({...w,p:path(w.p)}));
 const stream=path([[1580,490],[1598,535],[1620,555],[1636,559],[1627,630],[1640,680],[1634,722],[1630,780],[1684,820],[1780,855]]);
 const zones=[{name:'Lion-rengeteg',p:[[430,300],[680,290],[902,436],[925,545],[853,709],[715,865],[480,710],[350,450]],color:'#4e7049'},
 {name:'Kastélypark',p:[[1587,551],[1659,511],[1690,530],[1648,585],[1627,608],[1600,598]],color:'#5a7c4b'},
 {name:'Notorik park',p:[[1600,598],[1655,602],[1654,632],[1604,643]],color:'#8fa777'},
 {name:'Hétvezér park',p:[[1621,648],[1628,648],[1629,679],[1622,679]],color:'#9aae76'},
 {name:'Ham',p:[[1020,633],[1170,633],[1100,825],[999,872],[1020,740]],color:'#748970'}
 ].map(z=>({...z,p:path(z.p)}));
 const shelters=['parliament','shelter-west','shelter-east','shelter-well'];
 const busStops=[[1755,554],[1574,626],[1593,644],[1617,775],[1748,889]].map((p,i)=>({id:'bus'+i,...point(p),source:p}));
 const bins=[];function cluster(p,count,area,type='public'){const q=point(p);for(let i=0;i<count;i++)bins.push({x:q.x+(i%3)*26,y:q.y+Math.floor(i/3)*30,area,type});}
 cluster([1560,672],3,'Jednota');cluster([1594,651],5,'Főtér');cluster([1554,643],4,'Iskola');cluster([1573,690],3,'Lion vendéglő');
 // Marked collection islands: large paper, plastic and glass containers.
 [[1424,674],[1783,548],[1815,615],[1718,680],[1616,834]].forEach(p=>{const q=point(p);['paper','plastic','glass'].forEach((material,i)=>bins.push({x:q.x+(i-1)*68,y:q.y,area:'Szelektív gyűjtősziget',type:'recycling',material}));});
 for(const b of busStops)cluster([b.source[0]+5,b.source[1]+6],2,'Buszmegálló');
 cluster([1657,624],2,'Parlament');cluster([1474,782],1,'Kiülő');cluster([1747,690],1,'Kiülő');
 // Household collection types are shown at plausible houses; exact homes were not marked.
 [[1680,644],[1733,614],[1761,638],[1590,754],[1800,591]].forEach(p=>{cluster(p,1,'Ház előtt','brown');cluster([p[0]+6,p[1]+3],1,'Ház előtt','blue');});
 return {width:3900,height:2850,point,path,sites,byId,roads,waters,stream,zones,bins,busStops,shelters};
})();

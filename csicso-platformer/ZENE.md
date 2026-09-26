# Zenei leírás – Csicsói kaland

Leírás a zeneszerzőnek: milyen zene kell a játék egyes pályáihoz, képernyőihez és jelzéseihez.

## A játékról

A Csicsói kaland egy Mario-szerű, oldalnézetes ugrálós játék telefonra. Csicsóban (Číčov) játszódik, egy kis csallóközi faluban. A hős egy melegítős ork, aki kukákból és sörösrekeszekből palackokat gyűjt, a Jednotában visszaváltja őket, és csucsót (kitalált helyi bort) visz belőlük a Parlamentbe, a falu kiülőjébe.

A grafika hibrid: a szereplők pixelesek, a háttér festett hatású. A zenében is ezt a kettősséget kérjük: chip hangzás és igazi falusi zenekar együtt. A humor kedves és önironikus, mint egy falusi búcsú zenekara, amelyik kicsit hamis. Soha nem gúnyolódó.

Jelenleg az 1-1-es pálya játszható. A többi pálya tervezett: a leírásuk a hangulatot adja meg, a részletek még változhatnak. A játékban most még nincs zene. A lejátszást akkor kötjük be, amikor megérkeznek az első fájlok.

## Közös zenei nyelv

- **Hangzás:** Chip (négyszög-, háromszög- és zajhang) a pixeles szereplőkhöz, igazi hangszerek a festett világhoz. Harmonika, bőgő, cimbalom, klarinét, brácsa, a komikus pillanatokban rezesbanda (tuba, trombita).
- **Csucsó-motívum:** Egy rövid, 3–5 hangos, könnyen megjegyezhető dallam. Ötlet: két hang lefelé, mintha valaki azt kiáltaná, hogy „CSU-CSÓ!”. Visszatér a címlapon, az extra életnél, a pálya végén, a Jednota-beváltásnál, és mollban a játék végén.
- **1. világ: A falu:** Napos, dúr, polka- és csárdás-lüktetés, a harmonika vezet.
- **2. világ: A határ:** Vadabb, esti hangulat. Modális hangsorok (dór, fríg), cimbalom és klarinét.
- **Eredetiség:** A népzenei ihletés jó, de a dallamok legyenek sajátok. Ne legyen felismerhető meglévő dal: se Mario-téma, se ismert népdal, se lakodalmas sláger.

## Sorrend: mi kell először

1. 1-1 Parlament → Jednota: ez az egyetlen már játszható pálya.
2. Címlap: a Parlament-téma, benne a Csucsó-motívum.
3. Jinglek: karón kiabálók, pálya vége, életvesztés, +1 csucsó, Gyanús lötty és józanodás.
4. Jednota-beváltás és játék vége.
5. A többi pálya abban a sorrendben, ahogy elkészülnek.

## Menük és jelenetek

### Címlap: a Parlament-téma

*Állapot: kell most · Fájl: `zene/cimlap`*

A Parlament kiülő, laza délután. Kicsit lusta, hívogató swing, mintha az orkok már ülnének a padon és várnák az ellátmányt. Itt hangzik el először a Csucsó-motívum.

- **Tempó:** kb. 92 BPM, swing
- **Hangnem:** F-dúr
- **Hangszerek:** harmonika, pengetett bőgő, kefés dob, chip dallam
- **Hossz:** 45–60 mp-es hurok

### A „karón kiabálók” jingle

*Állapot: kell most · Fájl: `zene/bemondo`*

A falusi hangszórók dallama, ami minden bemondás előtt szól. A pálya eleji kártyán hallatszik, amikor bemondják, milyen nap van (például „Ma ürítették a kék kukákat”). Kicsit hamis, recsegő, hangszóró-szűrős.

- **Tempó:** szabad
- **Hangnem:** szabad
- **Hangszerek:** xilofon- vagy gongszerű 4–5 hang, lo-fi hangszóró hangzás
- **Hossz:** 3–5 mp, nem ismétlődik

### Világtérkép

*Állapot: tervezett · Fájl: `zene/terkep-1 és zene/terkep-2`*

Séta a falun és a határon át pályáról pályára. Ugyanaz a dallam két hangszereléssel: az 1. világban harmonikával, a 2. világban cimbalommal.

- **Tempó:** kb. 108 BPM, 2/4
- **Hangnem:** G-dúr
- **Hangszerek:** harmonika vagy cimbalom, chip kíséret, léptek ritmusa
- **Hossz:** 40–60 mp-es hurok

### Jednota: beváltás

*Állapot: kell most · Fájl: `zene/jednota`*

A pálya végén a visszaváltó automata palackokat számol, és minden 5 palackért ad egy csucsót. Gépies, pittyegő, pénztárgép-hangulat. A végén a Csucsó-motívum szól.

- **Tempó:** kb. 120 BPM
- **Hangnem:** C-dúr
- **Hangszerek:** chip arpeggio, pénztárgép-csörrenés, harmonika a végén
- **Hossz:** 2–3 mp nyitás + rövid hurok, amíg a számolás tart

### Vége a műszaknak (játék vége)

*Állapot: kell most · Fájl: `zene/vege`*

Elfogyott a csucsó. Szomorkás, de vicces, lefelé kanyarodó harmonika, a Csucsó-motívum mollban.

- **Tempó:** lassú
- **Hangnem:** d-moll
- **Hangszerek:** harmonika, bőgő
- **Hossz:** 4–6 mp, nem ismétlődik

## Rövid jelzések (jinglek)

### Pálya vége

*Állapot: kell most · Fájl: `zene/palya-vege`*

Az ork belép a Jednota ajtaján. Győzelmi fanfár a Csucsó-motívummal, rezesbandás csattanóval.

- **Tempó:** —
- **Hangnem:** a pályazene hangneme
- **Hangszerek:** chip + rezesbanda
- **Hossz:** 4–6 mp

### Életvesztés

*Állapot: kell most · Fájl: `zene/eletvesztes`*

Vaddisznó vagy csatorna. Rövid, komikus lefelé csúszás, mint egy leeresztett duda.

- **Tempó:** —
- **Hangnem:** —
- **Hangszerek:** chip, esetleg harmonika-nyekergés
- **Hossz:** 2–3 mp

### +1 csucsó (extra élet)

*Állapot: kell most · Fájl: `zene/csucso`*

Koccintás, üvegcsengés, utána a Csucsó-motívum gyorsan.

- **Tempó:** —
- **Hangnem:** —
- **Hangszerek:** üvegcsengés + chip
- **Hossz:** kb. 1,5 mp

### Gyanús lötty (orkerő)

*Állapot: kell most · Fájl: `zene/lotty`*

Sérthetetlen és gyorsabb vagy. Tüzes, eszeveszett csárdás-friss chip-arpeggiókkal, a Mario-csillag párja. Az utolsó 3 másodperc jelezze, hogy vége lesz.

- **Tempó:** 160+ BPM
- **Hangnem:** szabad
- **Hangszerek:** chip, gyors cimbalom
- **Hossz:** pontosan 20 mp

### Józanodás

*Állapot: kell most · Fájl: `zene/jozanodas`*

Közvetlenül a lötty után jön. Ugyanaz a téma lelassítva, lefelé hangolva, másnapos, nyúlós hangzással.

- **Tempó:** a lötty tempójának kb. fele
- **Hangnem:** a lötty hangneme, lehangolva
- **Hangszerek:** ugyanaz, lelassítva
- **Hossz:** pontosan 6 mp

### Vasárnapi harangszó

*Állapot: nem kötelező · Fájl: `zene/harang`*

Vasárnap a pálya elején egyszer megszólal a templomharang, mielőtt a pályazene indul.

- **Tempó:** —
- **Hangnem:** —
- **Hangszerek:** harang
- **Hossz:** 3–4 mp

## 1. világ: A falu

### 1-1 Parlament → Jednota

*Állapot: játszható · Fájl: `zene/1-1`*

Az első és legfontosabb pálya dallama: ezt fogja mindenki fütyülni. Indul a műszak a Parlament kiülőtől. A falu utcáin kukák, sörösrekeszek, buszmegálló, egy csatorna és vaddisznók. Közben az artézi kút (ellenőrzőpont), a végén a Jednota. Lendületes, vidám, előre hajtó.

- **Tempó:** kb. 132 BPM, polka-lüktetés
- **Hangnem:** C- vagy D-dúr
- **Hangszerek:** chip dallam, harmonika, bőgő, dob
- **Hossz:** 60–90 mp-es hurok, A és B résszel

### 1-2 Főtér és iskola

*Állapot: tervezett · Fájl: `zene/1-2`*

Nyüzsgés a Főtéren, szemben az iskola. Sok kuka, és egy konkurens gyűjtő ork versenyez veled értük. Kicsit sietős, lökdösődő. Az iskolacsengő lehet egy visszatérő motívum.

- **Tempó:** kb. 140 BPM
- **Hangnem:** F-dúr
- **Hangszerek:** harmonika, klarinét, csengő, chip
- **Hossz:** 60–90 mp-es hurok

### 1-3 Hétvezér park

*Állapot: tervezett · Fájl: `zene/1-3`*

Hét faragott faszobor, a hét vezér, az út és a csatorna közti zöldsávban. A szobrok platformok. Túlzó hősi pátosz, szeretetteljes paródiaként, ötfokú, népies dallammal.

- **Tempó:** kb. 112 BPM
- **Hangnem:** d-dór
- **Hangszerek:** furulya vagy tárogató-szerű hang, nagydob, chip „kórus”
- **Hossz:** 60–90 mp-es hurok

### 1-4 Kastélypark és Csörgő híd

*Állapot: tervezett · Fájl: `zene/1-4`*

A Zichy–Kálnoky-kastély parkja, majd erdei ösvény és a Csörgő híd a focipálya felé. Ez a világ „vár” pályája: barokkos menüett-paródia, titokzatos erdei szakasszal. A hídnál csörgő ütőhangszerek.

- **Tempó:** kb. 100 BPM, 3/4
- **Hangnem:** a-moll
- **Hangszerek:** csembaló-szerű chip, vonósok, csörgő
- **Hossz:** 60–90 mp-es hurok

### 1-4 főellenség: a kertész

*Állapot: tervezett · Fájl: `zene/1-4-fonok`*

A kastély kertésze gereblyével kerget. A menüett felgyorsul, és átcsap polkába.

- **Tempó:** kb. 150 BPM
- **Hangnem:** a-moll → A-dúr
- **Hangszerek:** csembaló-chip, rezesbanda
- **Hossz:** 30–45 mp-es hurok

## 2. világ: A határ

### 2-1 Hami út és szőlős kertek

*Állapot: tervezett · Fájl: `zene/2-1`*

A Hami út a faluból a Lion felé, mellette szőlők. Szüreti hangulat, kicsit kótyagos lüktetés. Az erjedt szőlőn darazsak zümmögnek.

- **Tempó:** kb. 120 BPM, 3/4 keringő
- **Hangnem:** G-mixolíd
- **Hangszerek:** cimbalom, brácsa, bőgő, zümmögő tremoló
- **Hossz:** 60–90 mp-es hurok

### 2-2 Halastavak

*Állapot: tervezett · Fájl: `zene/2-2`*

Lopakodós pálya: az orkok a halastavaknál rabsickodnak, a halőr figyel. Lábujjhegyen járás, pengetett bőgő. Jó lenne külön „feszült” réteg, ami a halőr közelében bekapcsol.

- **Tempó:** kb. 92 BPM
- **Hangnem:** e-moll
- **Hangszerek:** pizzicato bőgő, klarinét, vízcsepp-hangok
- **Hossz:** 60–90 mp-es hurok, alap + feszült réteg külön

### 2-3 Ham mocsár

*Állapot: tervezett · Fájl: `zene/2-3`*

Nádas mocsár a halastavak alatt, süllyedő nádcsomók, békák, szúnyograj. Lassú, sűrű, párás, kicsit bluesos.

- **Tempó:** kb. 84 BPM
- **Hangnem:** c-dór
- **Hangszerek:** mély klarinét, bőgő, békabrekegés, chip
- **Hossz:** 60–90 mp-es hurok

### 2-4 Lion-rengeteg és holtág

*Állapot: tervezett · Fájl: `zene/2-4`*

A falutól nyugatra a sötét, ártéri erdő a kanyargó holtággal. Fűzfák, mozdulatlan víz, feszült és titokzatos. Itt terem a Gyanús lötty.

- **Tempó:** kb. 104 BPM
- **Hangnem:** h-fríg
- **Hangszerek:** cimbalom-tremoló, mély vonósok, chip
- **Hossz:** 60–90 mp-es hurok

### 2-4 főellenség: az öreg vaddisznó

*Állapot: tervezett · Fájl: `zene/2-4-fonok`*

Gyorsuló csárdás: lassúval indul, aztán egyre gyorsabb, ahogy a vaddisznó dühödik.

- **Tempó:** 110 → 170 BPM
- **Hangnem:** d-moll
- **Hangszerek:** cimbalom, hegedű, bőgő, chip
- **Hossz:** lassú rész + friss rész hurokban

## Bónuszpályák és különleges pályák

### Madárles

*Állapot: tervezett · Fájl: `zene/madarles`*

Függőleges mászás felfelé a falu keleti szélén álló megfigyelőhelyen. Levegős, könnyű, madárcsicsergés.

- **Tempó:** kb. 124 BPM
- **Hangnem:** A-dúr
- **Hangszerek:** furulya, madárhangok, chip
- **Hossz:** 45–60 mp-es hurok

### Focipálya

*Állapot: tervezett · Fájl: `zene/focipalya`*

Labdát rúgsz a kukákba. Szurkolói rigmus chipben, síp, dob.

- **Tempó:** kb. 140 BPM
- **Hangnem:** D-dúr
- **Hangszerek:** dob, síp, chip, „kórus”
- **Hossz:** 30–45 mp-es hurok

### Kishíd (titkos kijárat)

*Állapot: tervezett · Fájl: `zene/kishid`*

Rejtett átjáró. Halk, zenedobozszerű, titkos felfedezés.

- **Tempó:** kb. 90 BPM
- **Hangnem:** E-dúr
- **Hangszerek:** zenedoboz, chip
- **Hossz:** 30 mp-es hurok

### Sárgazsák-nap: üldözés

*Állapot: tervezett · Fájl: `zene/sargazsak`*

Jani sötétkék Ducatója viszi a sárga zsákokat, a pálya magától görget, utol kell érni. Eszeveszett hajsza autókürttel. A „karón kiabálók” jingle dallamának feldolgozása.

- **Tempó:** 160–170 BPM
- **Hangnem:** g-moll
- **Hangszerek:** rezesbanda, chip, autókürt
- **Hossz:** 45 mp-es hurok

## Technikai kérések

- **Formátum:** Mesterfájl WAV-ban (48 kHz, 24 bit). A játékba OGG (Vorbis, kb. q5) és M4A (AAC, 160 kbps) is kell, mert az iPhone az OGG-t nem mindig játssza le. MP3 csak végszükség esetén, mert a hurok elején és végén rést hagy.
- **Hurkok:** A pályazenék egy rövid nyitásból és egy ismétlődő részből állnak. Kérjük megadni, hány másodpercnél kezdődik és hol ér véget az ismétlődő rész. A játék ezek alapján pontosan, hézag nélkül ismétel. A fájl elején és végén ne legyen csend. A zengés vége fusson át a hurok elejére.
- **Fájlnevek:** zene/<azonosító>.ogg és zene/<azonosító>.m4a (például zene/1-1.ogg). A hurokpontok egy közös szövegfájlba: zene/hurkok.txt, soronként például: 1-1  kezdet=4.364  vege=64.364
- **Hangerő:** Integrált hangosság kb. −16 LUFS, csúcs legfeljebb −1 dBTP, a jinglek is ugyanígy. Így nem ugrik a hangerő, amikor egyik szól a másik után.
- **Helyet a hangeffekteknek:** A játék hangeffektjei (ugrás, palack, taposás, kuka) magas chip-hangok kb. 250 és 1300 Hz között. A dallam ne üljön végig ugyanitt, hogy az effektek is hallatszanak.
- **Telefonhangszóró:** A legtöbben telefonon játszanak. A 100 Hz alatti basszus ott elvész, ezért a basszusvonal felhangjai is szóljanak (pengetett bőgő, enyhe torzítás). Érdemes telefonon is meghallgatni a keveréseket.
- **Ismétlődés:** Egy pályát 3–8 percig hallgat a játékos. Ne legyen fárasztó, éles szólóhang. Az A–B rész és a hangszerelés változatossága segít.
- **Külön sávok (nem kötelező):** Ha lehet, dallam, kíséret és ritmus külön fájlban is. Így a játék rétegeket kapcsolhat, például a halőr közelében vagy a lötty alatt.

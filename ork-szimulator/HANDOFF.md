# Ork szimulátor – teljes átadócsomag

Ez a csomag egy másik fejlesztési session számára készült. A játék jelenlegi állapota egy helyben futó, telepítés nélküli, 2D Canvas-alapú böngészős prototípus Csicsó/Číčov stilizált világában.

## Indítás

Nyisd meg a projekt mappájában:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Ezután: http://127.0.0.1:8765/

Az `index.html` közvetlenül is megnyitható, de a helyi HTTP-szerver ajánlott. A játék nem használ külső könyvtárat, külső fontot vagy hálózati API-t.

## Jelenlegi játékmenet

- Első pálya célja: három CSUCSÓ üveget elvinni a Notorik parkban lévő Parlamenthez.
- A falu neve CSICSÓ; a bor neve CSUCSÓ.
- Kukaátkutatásból visszaváltható palack és csikk szerezhető.
- A Jednotában a palack 0,15 euróért váltható vissza, CSUCSÓ vásárolható.
- A Parlamentnél csucsó adható le; öt csikk és egy papír sodrást készít.
- A kultúrház Jutka boltjának helyén áll, jelenleg találkozóhely és egyszerű információs pont.
- Az artézi kút feltölti az erőnlétet és megszünteti a löttyhatást.
- A Hétvezér parkban hét faszobor és gyűjthető tárgyak vannak.
- A kastély egyszeri hatpalackos jutalmat ad.
- A Lion-rengetegben/holtág környékén van zsákmány, vaddisznó és egy kitalált Gyanús lötty. Ez 20 másodperc gyorsaságot és sérthetetlenséget ad, utána 6 másodperc lassulás jön.
- Bicikli használható.
- A mentés böngésző-localStorage-ben él; a mentési kulcs `csicso-ork-level1-v2`.

## Irányítás

WASD/nyilak: mozgás; E vagy szóköz: használat; B: bicikli; Shift: futás; M: térkép; Esc: szünet/ablak bezárása. Érintőképernyős gombok is vannak.

## Rögzített helyismereti adatok

Az összes eddig megadott részletes követelmény a `HELYSZINEK.md` fájlban van. A legfontosabbak:

- A Parlament a Notorik parkban, a kastélytó mellett van. Csak ezt az egy kiülőt hívják Parlamentnek; más kiülőket időnként megszállnak.
- A Jednota mellett kukák vannak.
- A Főtér a Jednota és a Hétvezér park között van, sok kukával és törzshely szereppel. A térrel szemben az iskola áll, szintén sok kukával.
- A Hétvezér park az út és a csatorna közötti zöldsávban helyezkedik el.
- A Lion a Číčovské mŕtve rameno stilizált alakú nyugati erdős, ártéri területe; mellette szőlős kertek vannak.
- A Hami út köti össze a falut a Lionnal. A közelben halastavak vannak, alattuk a Ham nádas mocsár.
- A kastélyparkból a Csörgő hídon, erdei úton lehet a focipálya felé haladni. A kishíd külön helyszín.
- A buszmegállókban is vannak kukák.
- A Lion vendéglő a faluban található, előtte kukákkal; nem azonos a Lion-rengeteggel.
- A Lion vendéglő és a kultúrház között található a községi hivatal.

## Hulladékrendszer és későbbi feladatok

- A térképen „kuka” jelölésű pontok nagy szelektív gyűjtőszigetek: kék papír-, sárga műanyag- és zöld üveggyűjtő. A jelenlegi rajz ezeket külön konténerekként mutatja.
- A barna és kék háztartási kukák csak a házak előtt jelennek meg. A barnán BIO felirat van; a kék és barna kukán nincs literjelölés. A kék vizuálisan nagyobb.
- A sárgazsákok havi szelektív gyűjtését a „karón kiabálók” utcai hangszórói hirdetik ki. Jani, kopasz férfi, sötétkék dobozos Ducatóval viszi el.
- Barna biohulladékos kuka: kéthetente szerdán ürítik, erjedt gyümölcs is lehet benne.
- Kék nagy kuka: kéthetente pénteken ürítik.
- A benzines palack veszélyes, nem adhat jutalmat; a korábban kitalált poén az automata bűz miatti átmeneti leállása.
- Kéregetés néhány centért csucsóra vagy cigire.
- Halastavi rabsickodás, sárgazsákos eseménynaptár, Jani járművének mozgása, kéregetés és biohulladék-feldolgozás még nincs teljesen megvalósítva.

## Grafikai irány

A jelenlegi pálya kóddal rajzolt egyszerű 2D grafika. A nyitóképernyőn szerepel a `assets/parlament-concept.png` jóváhagyott látványterv. A Jednota a kapott hosszú, lapos fehér/narancs COOP-fotó alapján stilizált. A kultúrház magas, világos, háromablakos épület fehér kerítéssel; a községi hivatal alacsony, hosszú, piros cseréptetős, fehér/piros homlokzatú épület. A nagy szelektív konténerek a fotó szerinti papír/műanyag/üveg színeket követik.

## Fájltérkép

- `index.html`: játékoldal és HUD/modal markup.
- `style.css`: felület, kezdőképernyő, HUD, modális ablakok, reszponzív stílus.
- `game.js`: Canvas-renderelés, mozgás, ütközés, tárgyak, interakciók, mentés és pályalogika.
- `map-data.js`: teljes stilizált térkép; X-középpontokból származó helyszínek, utak, vizek, zónák, buszmegállók, kukák.
- `HELYSZINEK.md`: tartós, részletes felhasználói helyismereti specifikáció.
- `README.md`: rövidebb fejlesztői és indítási leírás.
- `test-game.cjs`: DOM/canvas nélküli VM smoke test; gazdaság, tárgyak, win, mentés, mozgás, elérhetőség.
- `assets/`: játékban használt címer és Parlament látványterv.
- `references/`: jelölt térkép, címer, kultúrház, szelektív kukák, községi hivatal és térképrészlet.

## Ellenőrzés

```powershell
node --check game.js
node test-game.cjs
```

A jelenlegi teszt kimenete: `PASS: economy, capacity, cooldown, crafting, culture centre, castle reward, win, reload, title-save safety, boost expiry, well, bike, movement collision, paused time, all interaction approaches reachable.`

## Következő fejlesztési irányok

1. A kultúrház és községi hivatal részletesebb, fotóhűbb sprite-jai.
2. Naptárrendszer a szerdai/pénteki/havi hulladékeseményekhez.
3. Jani és a sötétkék Ducato mozgó eseményként.
4. Szelektív gyűjtőszigetek anyagtípus-alapú feladatai.
5. Halastavi rabsickodás és a Ham mocsár küldetése.
6. Kéregetés korlátozott, kockázatos pénzforrásként.
7. Több pálya és feladatlánc a Parlament, Jednota, Lion, kastélypark és községi helyek köré.

## Fontos átadási megjegyzés

A `references/` képek referenciaanyagok, az `assets/` képek játékbeli vagy jóváhagyott grafikai anyagok. A térkép nem hivatalos navigációs másolat, hanem stilizált játékpálya a felhasználó által megadott X-középpontok és helyleírások alapján.

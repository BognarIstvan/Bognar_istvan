# Ork szimulátor – Csicsó, első műszak

Játszható 2D böngészős prototípus. Nyisd meg az **index.html** fájlt Chrome-ban vagy Edge-ben. Internet és telepítés nem kell; az `assets` mappa, a `style.css`, a `map-data.js` és a `game.js` maradjon mellette.

Helyi előnézethez: `python -m http.server 8765 --bind 127.0.0.1`, majd http://127.0.0.1:8765.

## Cél

Vigyél három csucsót a Parlamentbe. Egy palack 15 centet ér a Jednotában, egy csucsó 75 cent. Nincs időkorlát. A győzelem után tovább lehet játszani.

## Irányítás

- WASD vagy nyilak: mozgás.
- E vagy szóköz: közeli tárgy, kuka, helyszín használata.
- B: bringára szállás/leszállás a bicikli mellett.
- Shift: futás erőnlétből.
- M: térkép. Esc: szünet/ablak bezárása.
- Érintőképernyőn külön iránygombok és használatgomb.

## Rendszerek

- Közterületi és kék kukák: 2 palack + 1 csikk, 45 játékbeli másodperces újratöltődés. A teli szatyor korlátozza a zsákmányt.
- Barna kukák: 120 literes biohulladékos helyszínek; a feldolgozás még készül. A kék kukák 240 literesek, látványosan nagyobbak.
- Parlament: csucsó leadása, 5 csikk + 1 papír → 1 sodrás, pihenés.
- Jednota: beváltás, csucsó, papír és nagyobb szatyor.
- Községi hivatal: a Lion vendéglő és a kultúrház között, fotó alapján rajzolt homlokzattal.
- A térképen jelölt kukapontokon nagy szelektív gyűjtőszigetek: papír, műanyag és üveg. A kisebb háztartási kukák a házak előtt vannak.
- Kultúrház: találkozóhely Jutka boltja helyén; a homlokzat a kapott fénykép alapján készült.
- Artézi kút: erőnlét és józanodás.
- Hétvezér park: hét faszobor és gyűjthető tárgyak.
- Kastély: egyszeri 6 palackos jutalom.
- Lion: ártéri erdő, holtág, palackok, kóbor vaddisznó. A mesebeli Gyanús lötty 20 mp gyorsaságot és sérthetetlenséget ad, majd 6 mp lassulás következik.
- Automatikus böngészőmentés. Az új játék megerősítést kér. Privát módban vagy tiltott tárhely esetén a mentés elérhetetlen lehet.

## Megjelenés és korlátok

A jóváhagyott generált látványterv a nyitóképernyőn szerepel. A játszható pálya jelenleg külön, kóddal rajzolt, egyszerűbb 2D grafika; nem a részletes látványterv animált változata. A Jednota formája a kapott homlokzati fényképet követi. A térkép a felhasználó X-ekkel megjelölt térképét követi: a falu nagyított, a nyugati táj tömörített. A Lion alakja és a helyszínek sorrendje a referenciához igazodik; az iskola és a Csörgő híd pontos helye közelítés. A részletes helyismeret és a későbbi események a HELYSZINEK.md fájlban szerepelnek. A hulladékgyűjtési naptár, Jani járműve, a kéregetés és a rabsickodás még nincs megvalósítva. A szereplők kitalált orkok.

Nincs hálózati adatküldés, külső könyvtár vagy külső betűkészlet. A mentés csak ebben a böngészőben él; a `file://` és a helyi HTTP megnyitás külön mentést használhat.

## Ellenőrzés

`node --check game.js`

`node test-game.cjs`

A teszt a teljes gazdasági kört, a győzelmet, a mentést, a tárgyakat, a bringát és az interakciós helyszínek elérhetőségét ellenőrzi egy minimális DOM/canvas tesztkörnyezetben. A vizuális és böngészős ellenőrzés külön szükséges.

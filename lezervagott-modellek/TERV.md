# Lézervágott modellek: a generátor felépítése és a Codex-munka átvétele

A cél: történelmi hajók, később mozdonyok és más járművek lézervágott modellkészletként, eladásra. A vágófájlokat egy generátor (Python program) állítja elő; a nyelvi modell a generátort írja és tartja karban, nem minden modellt egyenként.

## A három réteg

1. **Közös mag**: ami minden lézervágott modellre igaz. Lemezvastagság, a lézer égési vesztesége (kb. 0,1-0,2 mm), illesztéstípusok (fésűs horony, fül-horony), alkatrész-számozás, lapra rendezés, DXF/SVG export, útmutató váza.
2. **Építési módok**: hogyan lesz egy alakból alkatrész.
   - Hajó: szeletelt test (keresztmetszetekből bordák, gerinccel fésűsen illesztve).
   - Mozdony: forgástest (kazán gyűrűkből vagy rétegezett korongokból), dobozpanelek (fülke, szerkocsi, fül-horony illesztéssel), korongok (kerekek).
3. **Modellleírás**: egy konkrét modell adatai egy fájlban (lépték, anyag, hajótest-koordináták, bordahelyek). Nincs benne program.

Miért így: egy tűrés-javítás a magban egyszer történik, és minden modell megkapja. A mozdony becslés szerint a mag kb. felét tudja újrahasznosítani; a hajós építési mód ott nem használható, 2-3 új modul kell.

## A választott út: A

Rögzítés most, a hajó befejezése a jelenlegi szerkezetben, az átszervezés utána.

Indok: hamarabb van eladható termék és próbavágás, és a hajó második fele (fedélzet, felépítmények) mutatja meg, mi kell még a magba.

### Lépések

| # | Mikor | Mi | Kész, ha |
|---|---|---|---|
| 1 | most | Rögzítés: döntésnapló, leltár, referencia-kimenetek (1. Codex-feladat) | a három fájl/mappa létezik, és tudjuk: szkript vagy FreeCAD-dokumentum |
| 2 | most | Szabályok a Codexnek a befejezés idejére (AGENTS.md kiegészítés) | a szabályok a Codex-projekt AGENTS.md fájljában vannak |
| 3 | a hajó közben | Hajó befejezése, próbavágás | a próbavágás összeáll |
| 4 | utána | Adatok kiemelése modellleírás-fájlba, aranymintás próbával | a kimenet egyezik a referenciával |
| 5 | utána | A mag kiválasztása külön modulba, aranymintás próbával | a kimenet egyezik a referenciával |
| 6 | utána | Második hajó, a mag módosítása nélkül | ha a maghoz hozzá kell nyúlni, rossz helyen vágtunk |
| 7 | utána | Mozdony mint új építési mód | |

**Aranymintás próba**: az átszervezés előtt elmentett vágófájlokat összevetjük az utána előállítottakkal. Egyezés = az átrendezés nem rontott el semmit; eltérés = pontosan látszik, melyik alkatrész változott.

### Hol törik el

- Ha a hajó kézzel szerkesztett FreeCAD-dokumentum, nem szkript: a 4-5. lépés helyett a 3D testet adatként kell átmenteni, és a lépéseket újraírni.
- A döntésnapló csak annyit ér, amennyit a Codex még tud a saját döntéseiről.

## A `lezerhajo` tárolóra szabva (2026-10-21)

A tároló átnézése után. Állapot: a kalózhajó 115 mm-es középszakasza (v06, 26 alkatrész), az illesztési recept fizikailag igazolva, a v06 teljes összeállítása még nem.

### Amit a kód mutat

- **Verziólánc, nem generátor.** Minden változat az előző mentett állapotára épül: a v06 `build_tabs.py` a v05 mentett FreeCAD-fájlját nyitja meg, a `prepare_tools.py` a v02 exportálóját kb. húsz szövegcserével alakítja v06-tá, és a v02/v04 függvényeit is betölti. Ezért nem törölhetők a régi mappák, és ezért üres a HAJÓ réteg a v06-ban.
- **A hajótest szabálya megvan, csak nem a v06-ban.** `cad/pirate_ship_v14/hull_geometry.py` (85 sor): a hajótest három táblázatból áll (`STATIONS` fél-szélesség, `BOTTOM` fenékvonal, `SHEER` fedélzetvonal a hossz mentén), a függvények ezekből számolnak pontot, normált, metszetet. A táblázatok a modellleírás, a függvények a HAJÓ réteg csírája.
- **A legértékesebb, megfizetett tudás a fizikailag igazolt illesztési recept** (`DONTESNAPLO.md`): 3,15-3,20 mm lemez, 2,95 mm rés, 12 mm csaphoz 11,60 mm fogadó, levehető tartónál 3,15 mm, a korrekció a fogadó oldalra kerül, gépi eltolás 0.

### Pontosítás az A úton

A „hajó befejezése” a v06 középszakasz fizikai igazolását jelenti (LightBurn-előnézet, száraz összeállítás), új kód nélkül. Az orr és a tat már ne v07, v08 láncszemként készüljön: az új hajótest-alak éppen az, amire a láncban nincs szabály, így minden új szakasz egy újabb láncszemet adna a legdrágább ponton. Az átszervezés helye: a középszakasz igazolása után, az orr és a tat előtt.

### A 4-6. lépés erre a kódra

| # | Mi | Konkrétan | Próba |
|---|---|---|---|
| 4 | Lánc lezárása | A v06 minden bemenete (v05 FreeCAD-fájl, `side_geometry.json`, `panels.json`, a v02/v04 függvények) a v06 mellé kerül; `prepare_tools.py` kimarad a buildből; a v06 nem nyúl régi mappába. | SVG SHA-256 = `78d1d300...5415` |
| 5 | Mag kiemelése | `shrink_opening`, `serialize`, lapra rendezés 5,9 mm-es közellenőrzéssel, SVG-írás színrétegekkel, `verify_saved_svg`, kiterítés (`relax`), bemetszésminta. A recept egy **anyagprofil**-fájlba kerül (új lemeztételnél csak ez változik). Az alkatrész-azonosítókhoz kötött elvárások (pl. furatszám alkatrészenként) és a 0,1 mm²-es szálkalyuk-küszöb paraméterként a modellleírásba. | SVG SHA-256 változatlan |
| 6 | Hajó építési mód | `hull_geometry.py` (v14) alapján: hajótest-táblázatok → bordák, gerincfésű, fedélzet, burkolati sávok. Első feladata a v06 középszakasz újragenerálása a táblázatokból. | **Tűréses összevetés**: az alkatrész-kontúrok 0,01 mm-en belül egyeznek a referenciával (új számítási út, bájtegyezés nem várható) |

A 6. lépés után az orr és a tat már új táblázatsor és beállítás, nem új változatmappa.

## Codex-szövegek

### 1. Rögzítés (egyszeri feladat, bemásolandó)

```
Most ne módosíts semmilyen kódot. Csak dokumentálj, három lépésben:

1. DONTESNAPLO.md: sorold fel az eddigi fontos tervezési döntéseket
   (méretek, tűrések, illesztések, lemezvastagság, a lézer égési
   veszteségének kezelése, export beállítások), mindegyiknél az okkal.
   Írd le a zsákutcákat is: mit próbáltunk, miért nem működött.

2. LELTAR.md: minden fájlhoz és függvényhez írd oda, melyik rétegbe
   tartozik:
   - MAG: bármilyen lézervágott modellre igaz (vastagság, illesztések,
     számozás, lapra rendezés, export)
   - HAJÓ: hajókra általában igaz (hajótest szeletelése bordákra,
     gerinc, fésűs illesztés)
   - EZ A HAJÓ: csak erre a konkrét modellre igaz (beégetett számok,
     egyedi alkatrészek)
   Ha egy függvény keverten több réteget tartalmaz, jelöld és írd le,
   mi keveredik benne.

3. Mentsd el a jelenlegi kimeneti vágófájlokat egy referencia/ mappába,
   és mindegyikről írj egy sort a referencia/OSSZEGZES.md fájlba:
   alkatrészek száma, befoglaló méretek.

Végül válaszolj egy mondatban: a hajó Python-szkriptből áll elő,
vagy egy kézzel szerkesztett FreeCAD-dokumentumban van?
```

### 2. Szabályok a befejezés idejére (a Codex-projekt AGENTS.md fájljának végére)

A Codex minden munkamenet elején magától elolvassa az AGENTS.md fájlt, ezért ami ide kerül, az minden további munkára érvényes, nem kell minden alkalommal elmondani. A cél, hogy a hajó második fele már a helyes rétegbe épüljön, így a későbbi átszervezés olcsóbb lesz.

```
## Munkaszabályok (lézervágott generátor)

- Új, csak erre a hajóra jellemző számot (méret, pozíció, darabszám)
  ne írj szétszórva a kódba: gyűjtsd egyetlen helyre, a fájl elején
  egy jól elnevezett blokkba, és ott hivatkozz rá.
- Minden új függvény első megjegyzéssora jelölje a réteget:
  MAG, HAJÓ vagy EZ A HAJÓ (jelentésük a LELTAR.md-ben).
- Ha egy döntés méretet, tűrést, illesztést vagy exportot érint,
  írd a DONTESNAPLO.md végére egy sorban, az okával együtt.
- Egy feladat lezárása előtt állítsd elő újra a vágófájlokat, és
  vesd össze a referencia/ mappával. Ha egy korábban kész alkatrész
  szándékolatlanul megváltozott, ne javítsd csendben: jelezd.
  A referencia/ mappát csak kifejezett kérésre frissítsd.
```

### 3. Később (a 4-7. lépéshez)

A 4-7. lépés pontos tervét a leltár és a döntésnapló alapján érdemes megírni, a valódi kódra szabva. Ehhez a Codex-projektnek GitHubra kell kerülnie.

## Állapot és eltérés a tervtől (2026-10-25)

A `lezerhajo` tároló átnézése alapján (`d907184`).

### Ami a terv szerint ment

- A középszakasz fizikai igazolása kész: V07-V15, kilenc fizikai kör a burkolat rögzítésére (kampó, kisebb kampó, egyenes csap ragasztóval, letörés, pontos kiterítés, ívhossz-korrekció). A V15-öt István 2026-10-23-án elfogadta.
- Az illesztési recept stabil maradt (2,95 mm rés, 12/11,60 mm csap), és bővült: 1 mm-es bevezető letörés, +0,50 mm felső fogadó-könnyítés, belső ívhosszból számolt kiterítés.
- A kivétel alapú visszajelzés, a verziószámos rövid próbagerinc és a Marveen-féle, ellenőrzőösszeggel igazolt átadás a géphez jól működik.

### Eltérés

- Az átszervezés (4-6. lépés) elmaradt; az orr, a tat és a teljes hajó a verzióláncban épült tovább: EV01-EV02 orr- és tatpróba, FT01-FT08 teljes hajó (kb. 610 alkatrész). Az FT08 az FT07 mentett FreeCAD-fájlját nyitja meg.
- A fizikailag igazolt rész a középszakasz 8 alkatrésze. Az EV02 orr- és tatpróba vágófájljai elkészültek, de nincs fizikai próba; az FT-részletek (kabin, ágyúk, árbócok, korlátok, orrdísz) csak digitálisan ellenőrzöttek.
- A `referencia/` még a v06, amit a V15 már felváltott; a Codex minden körben újragenerálja.

### Következő lépés és döntési szabály

1. FT-részletmunka szünetel, amíg az orr és a tat fizikai próbája meg nem történik.
2. A Codex összeveti az EV02 alkatrészeit az FT08 orr- és tatrészével; ha eltérnek, a mostani FT08 geometriából készül az új próba (EV03), saját rövid gerinccel.
3. A referencia a V15 lesz.
4. Az orr-tat próba után: ha a hajótest alakján vagy a burkolat módján nagyobb változtatás kell, előbb a hajótest kerül egy forrásba (átszervezés), csak utána a javítás. Ha csak kis igazítás kell, a lánc mehet tovább a hajó befejezéséig, és az átszervezés a második modell előtt jön.

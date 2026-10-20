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

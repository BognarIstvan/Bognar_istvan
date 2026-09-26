# Csicsói kaland – Ork szimulátor platformer

Mario-szerű, oldalnézetes ugrálós játék a böngészőben, elsősorban telefonra.
Nincs telepítés, internet és külső könyvtár: az `index.html` megnyitásával indul.

Helyi előnézethez a mappában: `python -m http.server 8765`, majd http://127.0.0.1:8765

## Irányítás

- **Telefonon:** ◀ ▶ mozgás, **UGRÁS** (nyomva tartva magasabb), **FUT** be- és kikapcsolható.
  Két ujjal is megy: futás közben ugrás. Fektetve nagyobb a kép.
- **Gépen:** ← → vagy A D mozgás, szóköz / ↑ / W ugrás, Shift futás, P vagy Esc szünet.

## Játékmenet (1-1: Parlament → Jednota)

- **Palack** = pénz. A Jednota automatája minden **5 palackért egy csucsót** ad.
- **Csucsó** = élet. Egy csucsó el van rejtve a pályán egy láthatatlan rekeszben is.
- **Sörösrekesz** (piros, „?”): alulról megfejelve palackot vagy meglepetést ad.
- **Kuka:** a tetejére ugorva kidobja a tartalmát. Hogy mi van benne, a naptáron múlik.
- **Szatyor:** elbírsz vele egy ütést. Ha megüt valami, elszakad, és a palackjaid
  szétszóródnak (Sonic-módra) – pár másodpercig még vissza lehet kapkodni őket.
  Szatyor nélkül egy ütés egy csucsóba kerül.
- **Gyanús lötty:** 20 mp orkerő (gyorsabb, sérthetetlen), utána 6 mp józanodás (lassabb).
- **Artézi kút:** ellenőrzőpont, és józanít.
- **Vaddisznó:** rá lehet taposni. **Szarka:** lecsap, és ha van palackod, ellop egyet.

### Naptár

A címlapon választható, milyen nap van; minden újrakezdés a következő napra ugrik.

| Nap | Hatás |
|---|---|
| Hétfő | szokásos kukák |
| Kedd | a barna BIO-kukában erjedt gyümölcs is van (kótyagos leszel tőle) |
| Szerda | BIO-ürítés: a barna kukák üresek |
| Csütörtök | a kék kukák csordultig (4 palack) |
| Péntek | kék kukás ürítés: üresek |
| Szombat | sárgazsák-nap: sárga zsákok a házak előtt, bennük 3 PET-palack |
| Vasárnap | a vaddisznók lustábbak |

## Fájlok

- `index.html`, `style.css` – oldal, menük, érintőgombok.
- `js/levels.js` – **a pályák szöveges rácsként**, jelmagyarázattal. Szövegszerkesztőben átírható.
- `js/engine.js` – fizika, ütközés, ellenfelek, tárgyak, naptár (rajzolás nélkül, tesztelhető).
- `js/sprites.js` – pixeles figurák betűrajzként és a színtáblázat.
- `js/backgrounds.js` – a kóddal rajzolt festett hátterek, és a generált képek betöltése.
- `js/render.js`, `js/audio.js`, `js/main.js` – kirajzolás, hangok, vezérlés és menük.
- `hatter/` – ide jönnek a generált háttérképek. Lásd **HATTEREK.md**.
- `assets/parlament-concept.png` – a festett látványterv (nyitóképernyő).

## Ellenőrzés

```
node test/engine-test.cjs
```

Pályaformátum, fizika, kukák a naptár szerint, rekeszek, szatyor és szóródás, életvesztés,
ellenfelek, lötty, kút, cél és beváltás, valamint egy robot, amely végigfut a pályán.

## Következő lépések

- 1-2 Főtér és iskola, 1-3 Hétvezér park, 1-4 Kastélypark és Csörgő híd; világtérkép.
- Jani sötétkék Ducatója és a sárgazsák-napi üldözős pálya.
- Kéregetés, halastavi rabsickodás, további ellenfelek (kóbor kutya, konkurens gyűjtő).
- Sodrás mint dobófegyver (füstfelhő).

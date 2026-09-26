# Csicsói kaland – Ork szimulátor platformer

Mario-szerű, oldalnézetes ugrálós játék a böngészőben, elsősorban telefonra.
Nincs telepítés, internet és külső könyvtár: az `index.html` megnyitásával indul.

Helyi előnézethez a mappában: `python -m http.server 8765`, majd http://127.0.0.1:8765

## Irányítás

- **Telefonon:** ◀ ▶ mozgás, **UGRÁS** (nyomva tartva magasabb), **FUT** be- és kikapcsolható,
  **FÜST**: elszívsz egy sodrást. Két ujjal is megy: futás közben ugrás. Fektetve nagyobb a kép.
- **Gépen:** ← → vagy A D mozgás, szóköz / ↑ / W ugrás, Shift futás, F füst, P vagy Esc szünet.

## Játékmenet

Az eredeti Ork szimulátor gazdasága szerint. **Egy műszak két pálya:**

1. **1-1 Parlament → Jednota:** palackot és csikket gyűjtesz. A pálya végén a **Jednotában**:
   - palack visszaváltása: **0,15 €** darabja,
   - **csucsó: 0,75 €**, **cigipapír: 0,15 €**, **nagy szatyor: 0,60 €** (12 helyett 20 palack fér bele).
2. **1-2 Jednota → Parlament:** hazaviszed a csucsót a Főtéren át. A **Parlamentnél**:
   - leadod a csucsót (az esti üléshez **3 csucsó** kell),
   - **sodrást** készítesz (**5 csikk + 1 cigipapír**), és vagy leadod az ülésre, vagy elszívod füstnek a pályán,
   - pihenhetsz (erőnlét).

Ha megvan a 3 csucsó: „A határozat elfogadva!”. Ha nincs meg, holnap új műszak, és ami a szatyorban maradt, megmarad.
A játék minden pálya végén ment, a címlapon a **Folytatás** gombbal lehet visszatérni.

- **Szatyor:** 12 palack fér bele. Ha tele van, a palack ott marad, ahol volt.
- **Sörösrekesz** (piros, „?”): alulról megfejelve palackot, cigipapírt vagy Gyanús löttyöt ad.
  Mindkét pályán el van rejtve egy láthatatlan rekeszben egy üveg csucsó is.
- **Kuka:** a tetejére ugorva kidobja a palackokat és egy csikket. Hogy mennyi van benne, a naptáron múlik.
- **Erőnlét:** a vaddisznó 30-at, a szarka (ha nincs mit ellopnia) 15-öt, a csatorna 25-öt vesz el.
  Ütéskor a palackok szétszóródnak, és pár másodpercig vissza lehet kapkodni őket.
  Ha elfogy, kidőlsz, és a legutóbbi artézi kútnál térsz magadhoz.
- **Artézi kút:** ellenőrzőpont, feltölti az erőnlétet és józanít.
- **Gyanús lötty:** 20 mp orkerő (gyorsabb, sérthetetlen), utána 6 mp józanodás (lassabb).
- **Sodrás füstje:** 4 másodpercre elkábítja a közeli vaddisznót és szarkát.
- **Vaddisznó:** rá lehet taposni. **Szarka:** lecsap, és ha van palackod, ellop egyet.

### Naptár

A címlapon választható, milyen nap van; minden új műszak a következő napra ugrik.

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
- `zene/` – ide jönnek a zenék. A zeneszerzőnek szóló leírás: **ZENE.md**.
- `assets/parlament-concept.png` – a festett látványterv (nyitóképernyő).

## Ellenőrzés

```
node test/engine-test.cjs
```

Pályaformátum, fizika, szatyor férőhelye, kukák a naptár szerint, rekeszek, erőnlét és szóródás, kidőlés, füst, Jednota-bolt, Parlament,
ellenfelek, lötty, kút, célok, valamint egy robot, amely végigfut mindkét pályán.

## Következő lépések

- 1-3 Hétvezér park, 1-4 Kastélypark és Csörgő híd (a kertész egyszeri 6 palackos jutalma); világtérkép.
- Benzines palack (veszélyes lelet: az automata bűz miatt leáll), kéregetés néhány centért.
- Jani sötétkék Ducatója és a sárgazsák-napi üldözős pálya.
- Kéregetés, halastavi rabsickodás, további ellenfelek (kóbor kutya, konkurens gyűjtő).

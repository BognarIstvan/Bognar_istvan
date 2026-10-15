# Hátterek cseréje generált képekre

A játék hibrid stílusú: a szereplők, tárgyak és a talaj pixelesek, a háttér festett hatású.
A hátteret jelenleg kód rajzolja. Bármelyik réteg lecserélhető egy képre: csak be kell tenni
a `hatter/` mappába a megfelelő néven. A kódhoz nem kell hozzányúlni. Ha a kép hiányzik,
a kóddal rajzolt réteg marad.

## Rétegek és fájlnevek (az 1-1-es pályához)

| Fájl | Mit tartalmaz | Háttér | Mozgás |
|---|---|---|---|
| `hatter/1-1-eg.png` | égbolt, felhők, nap | **nem átlátszó** | szinte áll |
| `hatter/1-1-tavoli.png` | távoli dombok, kastély, templomtorony, szőlők | **átlátszó** (PNG) | lassan |
| `hatter/1-1-kozeli.png` | házak, kerítések, fák, villanyoszlopok | **átlátszó** (PNG) | közepesen |
| `hatter/1-1-eloter.png` | (nem kötelező) fűcsomók, virágok a szereplők **előtt** | **átlátszó** (PNG) | gyorsabban |

Egy újabb pályánál a fájlnév eleje a pálya száma lesz (például `1-2-kozeli.png`).

## Méret és elrendezés

- **Oldalnézet, egyenesen szemből.** Ne felülről vagy ferdén.
- Minden réteg a **képernyő teljes magasságát** fedi. Ajánlott magasság: **1080 pont**.
- A szélesség szabad, de legyen legalább kétszerese a magasságnak (például **3840 × 1080**).
- **A kép bal és jobb széle illeszkedjen egymáshoz**, mert vízszintesen ismétlődik.
- **A talajvonal a kép magasságának 83%-ánál van** (1080 pontos képen kb. 900 pontnál).
  Ami ez alatt van, azt eltakarja a pixeles talaj. A házak alja, a kerítések, a fák töve
  ide essen.
- A felső kb. 10%-ot a kijelzők (csucsó, palack, nap) takarják, oda ne kerüljön fontos részlet.

## Tartalom és stílus

- A nyitóképernyő festett látványterve (`assets/parlament-concept.png`) jó stílusminta.
- **Ne legyen a háttérben semmi, amivel játszani lehetne:** ork, kuka, palack, rekesz,
  vaddisznó, szarka. Ezek a pixeles rétegen vannak, a háttérben összezavarnák a játékost.
- **Kicsit tompább, világosabb színek**, mint a szereplőké. Így a pixeles figurák kiválnak.
- Csicsói hangulat: alacsony, piros cseréptetős házak fehér kerítéssel, villanyoszlopok,
  a távolban a kastély és a templomtorony, szőlős dombok.

## Példa kérés képgenerátorhoz

> Side-view 2D game background layer, flat orthographic view, painted illustration style,
> Slovak–Hungarian village street: single-storey houses with red tile roofs, white picket
> fences, round trees, wooden power poles. Soft, slightly muted warm afternoon colours.
> Transparent sky. Seamless horizontally. No characters, no bins, no bottles. 3840×1080.

Az égbolt réteghez: „…only sky with soft clouds, no ground, opaque”.
A távoli réteghez: „…distant rolling hills, vineyard rows, a yellow baroque castle on a hill,
a white church tower, hazy atmospheric colours, transparent sky”.

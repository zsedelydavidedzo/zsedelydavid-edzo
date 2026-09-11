# Hirdetési kreatívok — személyi edzés, Gymtronic Győr

Három kreatív + a hozzájuk tartozó hirdetésszövegek. A cél **ügyfélszerzés személyi
edzésre a győri Gymtronic teremben**. A vizuál a weboldal design systeméből épül
(`css/style.css`): ugyanaz a fekete alap (`#0B0C0E`), lime akcent (`#D8FF3E`),
Oswald nagybetűs címsor + Inter szövegtörzs, pill-gombok, pipás listák.

| # | Fájl | Méret | Felület | Üzenet |
|---|------|-------|---------|--------|
| 1 | `png/kreativ-1-ingyenes-elso-alkalom.png` | 1080×1350 (4:5) | Facebook/Instagram feed | Ajánlat: az első alkalom ingyenes |
| 2 | `png/kreativ-2-kezdoknek.png` | 1080×1080 (1:1) | Feed, hirdetéskörnyezet-mix | Kifogáskezelés: kezdőként is |
| 3 | `png/kreativ-3-csomag-story.png` | 1080×1920 (9:16) | Story / Reels | Csomag és ár: Lendület, 10 alkalom |

---

## 1. kreatív — „Az első alkalom ingyenes" (4:5)

**Kinek:** hideg közönség, Győr + 15 km, 25–50 év. Ez a fő belépő hirdetés.

**Elsődleges szöveg**

> Elkezdenéd, de fogalmad sincs, hol kezdj?
>
> Az első alkalom nálam nem a súlyokról szól: megnézzük, hogyan mozogsz, mi a célod, és mi az, ami tényleg belefér a hetedbe. Utána kapsz egy tervet, ami rád van szabva — nem egy általános programot az internetről.
>
> 1:1 személyi edzés a győri Gymtronic teremben. Végig melletted vagyok, javítom a technikát, és havonta mérjük a haladást.
>
> ✔️ Az első alkalom ingyenes
> ✔️ Heti 2–3 edzés, a beosztásodhoz igazítva
> ✔️ Kezdőknek is — az ügyfeleim nagy része nulláról indult
>
> Írj rám, és 24 órán belül kereslek egy időpont-javaslattal.

**Címsor:** Az első alkalom ingyenes
**Leírás:** Személyi edzés Győrben · Gymtronic
**CTA gomb:** Üzenetküldés (vagy: További információ → `zsedelydavid.hu/#kapcsolat`)

---

## 2. kreatív — „Nem kell formában lenned ahhoz, hogy elkezdd" (1:1)

**Kinek:** hideg és langyos közönség; a leggyakoribb kifogást oldja fel. Jól megy
az 1. kreatív mellé A/B tesztben ugyanazzal a közönséggel.

**Elsődleges szöveg**

> „Majd ha lefogyok egy kicsit, akkor megyek edzőterembe." Ismerős?
>
> Pont fordítva működik. Az ügyfeleim jelentős része nulláról indult — az első alkalom mindig a mozgásod felmérése és az alapok tanítása, nem a nagy súlyok.
>
> Személyi edzés a győri Gymtronic teremben: személyre szabott terv, folyamatos technikai korrekció, és valaki, aki végig ott van melletted.
>
> ⭐⭐⭐⭐⭐ 50+ elégedett ügyfél · 8+ év tapasztalat
>
> Az első konzultáció ingyenes. Írj rám, és megbeszéljük, mi lenne az első lépés.

**Címsor:** Kezdőként is bátran
**Leírás:** 50+ elégedett ügyfél Győrben
**CTA gomb:** Üzenetküldés

---

## 3. kreatív — „Lendület csomag" (9:16, story / reels)

**Kinek:** remarketing — weboldal-látogatók, videónézők, üzenetírók az elmúlt 30 napból.
Ez már az árat mutatja, mert a langyos közönség ezen a ponton akad el.

**Elsődleges szöveg**

> Heti két edzés, három hónap — ennyitől szokott látszani a különbség.
>
> A Lendület csomag 10 alkalomra szól: felmérés, személyre szabott edzésterv, táplálkozási irányelvek és havi haladásmérés. 59 000 Ft, azaz 5 900 Ft egy 60 perces személyi edzés.
>
> Átlátható ár, rejtett tételek nélkül. Az első alkalom ingyenes — előbb nézzük meg, hogy passzolunk-e.

**Címsor:** 10 alkalom · 59 000 Ft
**Leírás:** Átlátható árak, rejtett tételek nélkül
**CTA gomb:** Időpont foglalása → `zsedelydavid.hu/#arak`

---

## Amit érdemes tudni a szövegekhez

- **Terembelépő:** az edzés díja mellé a Gymtronic belépő külön fizetendő (ez a GYIK-ban is így
  szerepel). A kreatívok ezért csak az edzés árát kommunikálják — ne írd a hirdetésbe, hogy
  a terembérlet benne van.
- **Árak:** a 6 500 / 59 000 / 132 000 Ft-os árak a weboldal `#arak` blokkjából jönnek.
  Ha ott változnak, a 3. kreatívot is frissítsd (`kreativ-3-csomag-story.html`).
- **Meta karakterkorlátok:** az elsődleges szövegből kb. 125 karakter látszik „Továbbiak" nélkül
  → a lényeg (ingyenes első alkalom, Győr, 1:1) az első két sorban van.
- **Egészségügyi/„előtte-utána" szabály:** a Meta tiltja a testképre nyomást gyakorló
  hirdetéseket és az előtte-utána képeket. A szövegek ezért képességre és folyamatra
  fókuszálnak, nem a testsúlyra.
- **Landing:** minden kreatív a `zsedelydavid.hu` oldalra visz; a legjobb konverziót az
  `#kapcsolat` űrlap adja (a beküldés a `/koszonjuk` oldalra fut).

## A kreatívok szerkesztése

A kreatívok sima HTML + CSS fájlok, a képek a weboldal `img/` mappájából jönnek.

1. Nyisd meg a `kreativ-*.html` fájlt böngészőben — pontosan úgy néz ki, mint a PNG.
2. Írd át a szöveget a fájlban (a méretek és a stílus a `kreativ.css`-ben vannak).
3. Renderelj újra PNG-t:

```bash
npm i -g playwright && npx playwright install chromium   # csak egyszer
node marketing/kreativok/render.mjs
```

A `render.mjs` mindhárom fájlt kivágja a megadott hirdetési méretben a `png/` mappába.
A `fonts/` mappa az Oswald és Inter betűket tartalmazza, hogy a renderelés internet
nélkül is ugyanazt adja, mint a weboldal.

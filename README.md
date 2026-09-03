# Zsédely Dávid — személyi edző weboldal

Statikus weboldal (HTML + CSS + JavaScript), build lépés nélkül.
Élesben: **https://zsedelydavid.hu**

---

## Tartalom

1. [Mi van a projektben](#1-mi-van-a-projektben)
2. [Élesítés — 1. lépés: GitHub](#2-élesítés--1-lépés-github)
3. [Élesítés — 2. lépés: Netlify](#3-élesítés--2-lépés-netlify)
4. [Élesítés — 3. lépés: saját domain (domdom.hu)](#4-élesítés--3-lépés-saját-domain-domdomhu)
5. [Admin panel beállítása](#5-admin-panel-beállítása)
6. [Szerkesztés admin panelről](#6-szerkesztés-admin-panelről)
7. [Szerkesztés kódból (VS Code + Git)](#7-szerkesztés-kódból-vs-code--git)
8. [Kitöltendő adatok élesítés előtt](#8-kitöltendő-adatok-élesítés-előtt)
9. [Google Naptár](#9-google-naptár)

---

## 1. Mi van a projektben

```
zsedelydavid-edzo/
├── index.html              A weboldal (14 blokk)
├── adatkezeles.html        Adatkezelési tájékoztató (KITÖLTENDŐ sablon)
├── aszf.html               ÁSZF (KITÖLTENDŐ sablon)
├── koszonjuk.html          Az űrlap elküldése utáni oldal
├── 404.html                Hibaoldal
├── css/style.css           Minden stílus (design system + animációk)
├── js/main.js              Menü, animációk, számláló, galéria-nagyító
├── img/                    Képek (WebP + JPG, több méretben)
├── admin/                  Admin panel (jelszavas tartalomszerkesztő)
├── netlify/functions/      A mentést végző szerverfüggvény
├── netlify.toml            Netlify beállítások (fejlécek, cache, átirányítás)
├── robots.txt, sitemap.xml SEO
└── README.md               Ez a fájl
```

**Nincs build lépés.** A fájlok pontosan úgy mennek ki a szerverre, ahogy itt vannak.
Nem kell Node.js, npm vagy bármi telepítés a szerkesztéshez.

---

## 2. Élesítés — 1. lépés: GitHub

A kód már egy helyi Git repóban van. Fel kell tölteni GitHub-ra.

**a) Hozd létre a repót a GitHub-on**

1. Menj a <https://github.com/new> oldalra (a `zsedelydavidedzo` fiókkal belépve)
2. Repository name: **`zsedelydavid-edzo`**
3. **Private** vagy **Public** — mindkettő jó (a Netlify mindkettőt kezeli)
4. **Ne** pipálj be semmit (README, .gitignore, licenc) — már van
5. **Create repository**

**b) Töltsd fel a kódot**

Terminálban, a projekt mappájában:

```bash
cd ~/zsedelydavid-edzo
git branch -M main
git remote add origin https://github.com/zsedelydavidedzo/zsedelydavid-edzo.git
git push -u origin main
```

A push-nál felhasználónevet és jelszót kér. **A jelszó helyére a GitHub token kell**,
nem a fiók jelszava:

1. <https://github.com/settings/tokens> → *Generate new token* → **Classic**
2. Note: `zsedelydavid-web`, Expiration: 90 nap (vagy több)
3. Pipáld be: **`repo`**
4. *Generate token* → **másold ki** (csak egyszer látod)
5. A `git push` jelszó-kérdésénél ezt illeszd be

> Ha macOS-en a Kulcskarikába menti, később nem kér újra.

---

## 3. Élesítés — 2. lépés: Netlify

1. <https://app.netlify.com/signup> → **Sign up with GitHub**
2. **Add new site → Import an existing project → GitHub**
3. Engedélyezd a Netlify hozzáférését a `zsedelydavid-edzo` repóhoz
4. A beállításokat **hagyd üresen** (a `netlify.toml` mindent megad):
   - Build command: *(üres)*
   - Publish directory: `.`
5. **Deploy site**

30–60 másodperc múlva él egy ideiglenes címen, például
`https://random-nev-123456.netlify.app`.

**Ellenőrizd, hogy minden működik**, mielőtt a domaint rákötöd.

### Az űrlap bekapcsolása

A kapcsolati űrlap **Netlify Forms**-szal működik, külön beállítás nélkül.
Az első beérkezett üzenet után:

- **Site configuration → Forms → Form notifications → Add notification → Email notification**
- Add meg a `zsedelydavid.edzo@gmail.com` címet

Így minden érdeklődés e-mailben is megérkezik. (A Netlify ingyenes csomagjában
havi 100 üzenet fér bele.)

---

## 4. Élesítés — 3. lépés: saját domain (domdom.hu)

**a) Netlify oldalon**

1. **Domain management → Add a domain → `zsedelydavid.hu`**
2. A Netlify megkérdezi, hogy te vagy-e a tulajdonos → *Yes, add domain*
3. Kiírja, mit kell beállítani. **Két lehetőség van:**

**1. lehetőség — DNS rekordok (egyszerűbb, a domdom marad a DNS szolgáltató)**

A domdom.hu ügyfélkapun, a domain DNS beállításainál:

| Típus | Név / Host | Érték |
|---|---|---|
| `A` | `@` (vagy üres) | `75.2.60.5` |
| `CNAME` | `www` | `<a-netlify-altalad-kapott-nev>.netlify.app` |

> Az `A` rekord IP-címét **mindig a Netlify felületén kiírt értékkel** ellenőrizd,
> mert változhat. A Netlify a *Domain management* alatt pontosan megmutatja.

**2. lehetőség — Netlify DNS (a Netlify kezeli a DNS-t)**

A Netlify ad 4 névszervert (pl. `dns1.p01.nsone.net`, …).
Ezeket a domdom.hu-n a domain **névszerver (nameserver)** beállításánál kell megadni.
Ez ad gyorsabb működést, de a domdom.hu-s e-mail vagy egyéb szolgáltatásokat is
át kell hozni. **Ha van domdom.hu-s e-mail címed a domainen, az 1. lehetőséget válaszd.**

**b) HTTPS**

A DNS beállítás után 10 perc – 24 óra a terjedés. Amikor kész, a Netlify
automatikusan kiállít egy ingyenes Let's Encrypt tanúsítványt
(*Domain management → HTTPS → Verify DNS configuration*). Nincs teendőd vele.

**c) Tárhelyre nincs szükség**

A domdom.hu-n **nem kell tárhelyet vásárolni** — a Netlify a tárhely.
Csak a domain nevet tartod ott.

---

## 5. Admin panel beállítása

Az admin panel a `https://zsedelydavid.hu/admin/` címen érhető el,
és jelszóval védett. A mentés a GitHub repóba commitol, amit a Netlify élesít.

### a) GitHub token az íráshoz

1. <https://github.com/settings/personal-access-tokens/new> (*Fine-grained token*)
2. Token name: `zsedelydavid-admin`
3. Expiration: 1 év
4. Repository access: **Only select repositories** → `zsedelydavid-edzo`
5. Permissions → Repository permissions → **Contents: Read and write**
6. *Generate token* → **másold ki**

### b) Netlify környezeti változók

**Site configuration → Environment variables → Add a variable** (négy darab):

| Kulcs | Érték |
|---|---|
| `ADMIN_PASSWORD` | egy általad választott, **hosszú** jelszó (min. 16 karakter) |
| `GITHUB_TOKEN` | az előbb generált fine-grained token |
| `GITHUB_REPO` | `zsedelydavidedzo/zsedelydavid-edzo` |
| `GITHUB_BRANCH` | `main` |

Mentés után **Deploys → Trigger deploy → Deploy site**, hogy érvényesüljenek.

> A jelszót és a tokent soha ne írd bele a kódba — csak ide, a Netlify felületére.
> A tokent a lejáratkor meg kell újítani (a Netlify e-mailt küld róla).

---

## 6. Szerkesztés admin panelről

1. Nyisd meg: `https://zsedelydavid.hu/admin/`
2. Add meg a jelszót (`ADMIN_PASSWORD`)
3. Bal oldalt a szekciók, jobbra a szerkeszthető mezők
4. Írd át, amit szeretnél — a módosított mezők **zöld kerettel** jelölődnek
5. **Mentés és közzététel** → 1–2 perc múlva él a változás

**Mit tudsz szerkeszteni:** minden szöveget (címek, bekezdések, gombfeliratok,
árak, vélemények, GYIK, elérhetőségek) és minden képet.

**Képcsere:** a képmezőnél válassz új fájlt. A panel automatikusan levágja
az eredeti képarányra, átméretezi és optimalizálja — nem kell előre szerkesztened.

**Amit az admin panel nem tud** (ezt kódból kell, lásd a 7. pontot):
- új blokk hozzáadása vagy blokk törlése
- linkek célcímének módosítása (pl. az Instagram URL)
- színek, betűtípusok, elrendezés

> Formázás megőrzése: ha egy mezőben `<span class="hl">…</span>` vagy `<br>` szerepel,
> hagyd bennük — a `hl` a lime kiemelés, a `<br>` a sortörés.

---

## 7. Szerkesztés kódból (VS Code + Git)

Egyszeri előkészítés:

1. Töltsd le a **VS Code**-ot: <https://code.visualstudio.com>
2. Nyisd meg vele a `~/zsedelydavid-edzo` mappát

Mindennapi munkamenet:

```bash
cd ~/zsedelydavid-edzo
git pull                       # a legfrissebb állapot letöltése (FONTOS!)
# ... szerkesztés a VS Code-ban ...
git add -A
git commit -m "Mit változtattam"
git push                       # a Netlify automatikusan élesíti
```

> **Mindig `git pull`-lal kezdj**, ha az admin panelről is történt mentés —
> különben ütközés lesz.

**Helyi előnézet** (nem kell hozzá semmi telepítés):

```bash
cd ~/zsedelydavid-edzo && python3 -m http.server 8899
```

Utána nyisd meg: <http://localhost:8899>
(Az admin panel mentése helyben nem működik, csak élesben.)

**Hol mit találsz:**

| Mit szeretnél | Melyik fájl |
|---|---|
| Szövegek, blokkok sorrendje | `index.html` |
| Színek, betűk, elrendezés | `css/style.css` (a `:root` blokkban a színek) |
| Animációk, menü, galéria | `js/main.js` |
| Jogi szövegek | `adatkezeles.html`, `aszf.html` |
| Biztonsági fejlécek, átirányítás | `netlify.toml` |

---

## 8. Kitöltendő adatok élesítés előtt

A látványtervben ezek helykitöltők. **Keresd rá a fájlokban, és cseréld ki:**

| Mit | Hol | Jelenlegi érték |
|---|---|---|
| Telefonszám | `index.html` (3 helyen), `adatkezeles.html`, `aszf.html` | `+36 30 000 0000` |
| E-mail cím | mindenhol | `info@zsedelydavid.hu` |
| Gymtronic pontos címe | `index.html` (Helyszínek, Kapcsolat) | „Gymtronic Győr" |
| Kültéri edzőpark helye | `index.html` (Helyszínek) | „Edzőparkok — Győr" |
| Nyitvatartás | `index.html`, JSON-LD séma | `H–P 6:00–20:00 · Szo 8:00–14:00` |
| Számok (8+ év, 150+ ügyfél) | `index.html` (Számok sáv) | példaértékek |
| Árak | `index.html` (Árak), JSON-LD séma | 9 900 / 89 000 / 199 000 Ft |
| **Vélemények** | `index.html` (Vélemények) | **kitalált minta-szöveg!** |
| Közösségi linkek | `index.html` (Galéria gomb, Lábléc) | `https://instagram.com/` stb. |
| Jogi adatok | `adatkezeles.html`, `aszf.html` | `___` jelöléssel |

### ⚠️ Fontos

- **A három vélemény kitalált szöveg.** Csak valódi ügyfélvisszajelzést tegyél ki —
  a kitalált vélemény megtévesztő kereskedelmi gyakorlatnak minősül.
- **Az adatkezelési tájékoztató és az ÁSZF sablon**, nem jogi tanácsadás.
  Töltsd ki a `___` helyeket, és nézesse át jogász, mielőtt élesíted.
  Az űrlap miatt az adatkezelési tájékoztató kötelező.
- A JSON-LD séma (`index.html` alján) is tartalmazza a telefonszámot,
  e-mailt, árakat és nyitvatartást — **azt is frissítsd**, mert ez kerül a Google találatba.

---

## 9. Google Naptár

Jelenleg nincs beépítve. A tervezett megoldás egy **„Foglalj időpontot" gomb**,
ami a Google Appointment Schedule (Google Naptár időpontfoglaló) oldalára visz.

Amikor sorra kerül:

1. Google Naptár → **Létrehozás → Időpontfoglalási ütemezés**
2. Beállítod az elérhető sávokat és az edzés hosszát
3. A kapott nyilvános linket beillesztjük a CTA és Kapcsolat blokkba

Ehhez Google Workspace vagy sima Gmail fiók is elég (a sima fióknál egy
foglalási oldal hozható létre).

---

## Támogatás

Ha valami nem működik, a Netlify **Deploys** fülén látod a hibaüzenetet,
az admin panel pedig konkrét hibaüzenetet ír ki mentéskor.

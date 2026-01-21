# MusicStencil - Dizájn és Megjelenés (2. fázis)

## 1. Színpaletta
- **UI Háttér:** Spotify Sötétszürke (#181818, #121212).
- **Akcentus:** Spotify Zöld (#1DB954) és Hitster Magenta (#E100E1).
- **Kártya:** Alapértelmezett fehér háttér, fekete barázdák és szöveg (nyomtatóbarát).

## 2. Kártya Geometria
- **Alak:** Fix négyzet.
- **Méret:** 30mm - 90mm között állítható (alap: 46mm).
- **Sarokkerekítés:** 0 - 10mm (sarokradius).
- **Margók:** Belső padding px-ben, külső eltolások (artist, title, code) mm-ben.

## 3. Tipográfia (v6.3.0+)
- **Globális Kezelés:** A betűtípus (`--font-family`) egyszerre változik az egész kártyán a konzisztencia érdekében.
- **Választható:** Google Fonts integráció (Poppins, Montserrat, Orbitron, stb.).
- **Igazítás:** Minden szövegelem fixen középre zárt.
- **Effektek:** 
    - **Bold:** Kapcsolható félkövérség minden mezőre egyedileg.
    - **Transform:** Normál, Csupa nagybetűs, Nagy kezdőbetűs.
    - **Glow:** Szöveg körüli finom derengés (opcionális, nyomtatáshoz alapból kikapcsolva).

## 4. Előnézet és Keret (v6.3.0+)
- **Glossy Frame:** Az előnézeti kártyák egy vastag, "zongoralakk" fekete keretben jelennek meg.
- **Glow effect:** A fekete keret finom, sötét derengést kap a mélységérzet növeléséhez.
- **Pozícionálás:** Tágas térköz a kártyák között és a fejléc alatt az átláthatóságért.

## 5. Vinyl Megjelenés
- **Opacitás:** Szabályozható áttetszőség.
- **Glow:** Kapcsolható neon-effekt a lemez barázdáin.
- **Paraméterezés:** Körök száma, távolsága és eltolása egyedileg állítható.

# MusicStencil - Logika és Működés (1. fázis)

## 1. Adatkezelés
- **Import:** Excel (.xlsx, .xls) fájlok feldolgozása a `xlsx.js` könyvtárral.
- **Mapping:** 
    - 0: Előadó
    - 1: Cím
    - 2: Évszám
    - 3: QR adatok (URL)
    - 4: Code 1
    - 5: Code 2
- **Sample Data:** Beépített mintaadatok a gyors induláshoz.

## 2. Intelligens Szövegtördelés (`adjustTextForOverflow`)
- **Korlát:** Maximum 2 soros megjelenítés az előadó és cím esetében.
- **Algoritmus:** Ha a szöveg túllépi a keretet, a rendszer 0.5px lépésekkel csökkenti a betűméretet 4pt-ig, amíg el nem fér.
- **Helyesírás:** Figyel a szavak tördelésére és esztétikus margót tart.

## 3. Kártya Generálás
- **Előlap:** Évszám középen, eltolható kódok, paraméterezhető betűtípusok és súlyok.
- **Hátlap:** Automatikus QR kód generálás százalékos méretezéssel. Vinyl-glitch SVG háttér.
- **Tükrözés:** Nyomtatáskor a hátlapokat soronként tükrözi a rendszer, hogy kétoldalas nyomtatáskor az előlap és hátlap pontosan fedje egymást.

## 4. Vinyl SVG Algoritmus
- **Barázdák:** Dinamikus körök száma, eltolása és távolsága.
- **Glitch Effekt:** Szekciókra bontott körívek (dash-array), véletlenszerű hézagokkal a "lemez" textúra szimulálásához.

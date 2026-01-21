# MusicStencil - Keretrendszer (0. fázis)

## 1. Verziózási Szabályok
- **Protokoll:** MAJOR.MINOR.PATCH formátum.
- **Visszaállítás:** Minden checkpoint egy teljes körűen működő, stabil állapot. Bármilyen hiba esetén erre a szintre állunk vissza.
- **Láthatóság:** A verziószám mindig látható az alkalmazás láblécében.

## 2. Alapvető Működési Elvek
- **Egykártyás nézet:** Alapértelmezett állapot indításkor. Dinamikusan váltakozó (cycle) előnézet a feltöltött adatokból.
- **Rácsnézet (Grid):** A nyomtatásra optimalizált nézet, ahol az összes kártya előlap-hátlap párba rendezve látszik.
- **Offline prioritás:** Az alkalmazás kliensoldali (Excel feldolgozás, QR generálás, SVG renderelés).

## 3. Fejlesztési Irányelvek
- **Aesthetics First:** A dizájn elemeknek (Spotify-zöld, Hitster-magenta) konzisztensnek kell lenniük.
- **Responsive Controls:** Minden kártya-paraméternek azonnali (real-time) hatása kell legyen a vizuális megjelenítésre.
- **Print Accuracy:** A milliméter alapú méretezésnek pontosnak kell lennie az A4-es nyomtatási képen.

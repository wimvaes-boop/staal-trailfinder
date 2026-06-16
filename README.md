# 🥾 Staal Trailfinder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web / Mobile / PWA](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20PWA-emerald)](https://github.com/)

[Nederlands](#nederlands) | [English](#english-section)

https://wimvaes-boop.github.io/staal-trailfinder/

---

## Nederlands

**Staal Trailfinder** is een 100% serverloze webapplicatie (Progressive Web App) ontworpen voor fietsers, wandelaars en bikepackers. De app analyseert je GPX-route en zoekt live via de OpenStreetMap database (Overpass API) naar nuttige plaatsen (POI's) binnen 500 meter van je route, exact gesorteerd op de kilometerstand van je rit.

### 🌟 Belangrijkste Functionaliteiten
* **Live OpenStreetMap Integratie:** Vind bakkers, supermarkten, cafés, restaurants, tankstations en apotheken langs je route.
* **Exacte Kilometerstanden:** De app berekent exact bij welke kilometer (bijv. "op 42,3 km") je een POI tegenkomt.
* **Live GPS Tracking:** Toont je eigen positie als een blauwe stip live op de kaart (werkt op mobiel via beveiligde HTTPS verbinding).
* **Uitgebreide Filters:** Filter snel op type winkel, horeca of fietsenmakers.
* **GPX Export met Waypoints:** Exporteer je route inclusief alle gevonden winkels/horeca als Waypoints (bijv. `[12km] Bakker`) naar je Garmin of Wahoo fietscomputer.
* **100% Serverloos (PWA):** Geen database of server nodig. Bestanden worden lokaal in de browser verwerkt. Installeerbaar op iPhone en Android.

### 📱 Installeren op iPhone of Android
1. Open de live link van de app in **Safari** (iOS) of **Chrome** (Android).
2. Tik op de **Delen-knop** (vierkantje met pijl omhoog op iOS, of de drie puntjes op Android).
3. Selecteer **"Zet op beginscherm"** (Add to Home Screen).
4. De app staat nu tussen je normale apps met een eigen icoontje en start op in volledig scherm!

### 💻 Lokaal Uitvoeren
Je kunt de app lokaal op je computer testen met Python:
```bash
python app.py
```
Open vervolgens `http://127.0.0.1:5000` in je browser.

---

## English Section

**Staal Trailfinder** is a 100% serverless Progressive Web App (PWA) designed for cyclists, hikers, and bikepackers. The app analyzes your GPX route and queries the OpenStreetMap database (Overpass API) in real-time to find Points of Interest (POIs) within 500 meters of your route, sorted chronologically by the exact kilometer mark of your ride.

### 🌟 Key Features
* **Live OpenStreetMap Integration:** Find bakeries, supermarkets, convenience stores, cafes, restaurants, gas stations, and pharmacies along your route.
* **Exact Distance Calculations:** Know exactly at which kilometer (e.g., "at km 42.3") you will pass a shop or restaurant.
* **Live GPS Tracking:** Displays your current location as a blue dot on the map (requires a secure HTTPS connection).
* **Smart Filter Bar:** Quickly filter between food, cafes, fuel, pharmacies, and bicycle repair shops.
* **GPX Export with Waypoints:** Export your route with the found POIs embedded as waypoints (e.g. `[12km] Bakery`) for direct display on your Garmin or Wahoo bike computer.
* **100% Serverless (PWA):** No database or backend server required. All processing happens locally in the browser. Fully installable on iOS and Android.

### 📱 Installing on iOS or Android
1. Open the live deployment link in **Safari** (iOS) or **Chrome** (Android).
2. Tap the **Share button** (the square icon with an arrow pointing up on iOS, or the three dots on Android).
3. Scroll down and select **"Add to Home Screen"**.
4. The app will be added to your home screen as a standalone app with its own icon.

### 💻 Running Locally
You can test the application locally on your computer using Python:
```bash
python app.py
```
Then open `http://127.0.0.1:5000` in your web browser.

---

## 🛠️ Technologies Used
* **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6)
* **Maps:** [Leaflet.js](https://leafletjs.com/) (OpenStreetMap Tiles)
* **Geospatial Queries:** OpenStreetMap [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
* **Geodetic Calculations:** Haversine formula & Equirectangular projection for point-to-segment distance checking.

---

*This project is #another Staalvaes production by [Wim Vaes](http://www.wimvaes.be).*

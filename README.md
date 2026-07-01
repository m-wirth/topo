# topo

Statische Angular-App für GitHub Pages mit einem Dashboard-Splash-Screen und Einstiegspunkten für drei spätere Apps:

1. Ressourcen Tracker
2. Swisstopo Karten Generator
3. Rezept zu Nutrition Seite

Aktuell sind das moderne Angular-Setup, das Dashboard mit Kacheln und der Ressourcen Tracker umgesetzt.
Die Nutrition- und Mapper-Seiten bleiben Platzhalter und werden später ergänzt.

## Routen

- `/nutrition` - Rezept zu Nutrition Seite
- `/resources` - Ressourcen Tracker mit Wochenkalender, Tagesbewertungen und Wochen-Durchschnitt
- `/mapper` - Swisstopo Karten Generator

## Entwicklung

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

Für GitHub Pages wird mit dem Repository-Basispfad gebaut:

```bash
npm run build:pages
```

Die GitHub-Actions-Workflowdatei `.github/workflows/pages.yml` baut die App und veröffentlicht `dist/topo/browser` auf GitHub Pages.

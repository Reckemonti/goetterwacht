# Götterwacht

Nordisches Wellen-Überlebensspiel im Browser. Eine einzige HTML-Datei, keine Installation, kein Server.

**Spielen:** https://reckemonti.github.io/goetterwacht/  (aufs Handy: «Zum Home-Bildschirm»)

## Spielprinzip
- 3 Götter mit eigenem Fokus: **Donar** (Donnerschlag, Donnerhämmer mit Kettenblitz, Blitze), **Ulfr** (Axtschwung, kreisende Äxte, Wurfäxte, Blutrausch, Kriegsschrei), **Skadi** (Speerstoss, Eisspeere, Wurfspeere, Frostbiss)
- Gemeinsam: Walküren-Schar, Walküren-Zirkel, Rollende Fässer, Runenkreis, Göttlicher Einschlag (Ulti je nach Gott)
- Verschmelzungen, Kombos, Stufe-5-Erwachen, Schicksalswurf alle 9 Stufen (Segen und Flüche)
- Wellen mit Fäulnis-Stufen, Elite-Gegnern, Wolfshorden, Bogenschützen, bis zu 5 Bossen gleichzeitig
- 6 grosse Bosse (Hrungnir, Hrimfang, Surtrs Glut, Nidhögg, Modgud, Fafnir) und 9 Wächter-Typen
- Ereignisse: Blutmond, Nebel; Schreine mit kurzen Segen
- Runenschmiede: 15 Upgrades mit 180 Stufen, 15 freischaltbare Fähigkeiten, danach Vidar als Verbündeter
- 14 Erfolge, Schadens-Statistik, eigene Musik (Start, Kampf, Bosskampf), Vibration auf dem Handy

## Steuerung
PC: `W` `A` `S` `D` oder Pfeiltasten, `Esc` Pause. Handy: Daumen aufs Feld und ziehen.

## Spielstand
Automatisch im Browser. **⬇ Spielstand speichern** lädt eine JSON-Datei herunter, **⬆ Spielstand laden** stellt alles wieder her.

## Dateien
| Datei | Zweck |
| --- | --- |
| `index.html` | Spielbare Version |
| `quelle-claude-artifact.html` | Gleicher Code für die claude.ai-Version |
| `manifest.webmanifest`, `icon-*.png` | App-Symbol für den Home-Bildschirm |
| `werkzeuge/build.sh` | Baut `index.html` aus dem Quellcode |
| `werkzeuge/sim.js` | Autopilot-Simulation fürs Balancing (`node sim.js <version> <runden> <maxWelle> [schmiede-json\|-] [h]`) |
| `werkzeuge/qa.js` | Klick-Test aller Menüs auf Handygrösse |
| `STATUS.md` | Stand und Änderungen |
| `PLAN.md` | Offene Aufgaben (GW-1 bis GW-6) und Routine-Entscheide |
| `werkzeuge/gw34-headless.test.cjs` | Test Münzwurf und Credit (`node werkzeuge/gw34-headless.test.cjs`) |

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
- **Welten:** Start im Menü mit «Spiel starten · Solo» oder «Koop», dann Welt und Gott wählen, «Ragnarök starten». Midgard geht nach Welle 20 endlos weiter. **Niflheim** (Eiswelt) öffnet sich mit Welle 20 in Midgard: eigene Karte aus Eis und Schnee, Frostgegner und Eisgolems, Schneestürme statt Nebel, Treffer lassen dich frieren; Start wieder bei Welle 1, aber viel härter. Ein Platz mehr für Waffen und Gaben
- Runenschmiede: 15 Upgrades mit 180 Stufen (ab Niflheim +10 Stufen pro Kraft-Upgrade, zusammen 300), 15 freischaltbare Fähigkeiten, danach Vidar als Verbündeter; dazu der **Pfad nach Niflheim** (Skilltree mit 10 Fähigkeiten für die Eiswelt)
- Gaben beim Stufenaufstieg: dazu Frostnova, Eiszapfenregen, Zähigkeit, Runenwissen, Scharfblick
- **Heldenhalle** in der Ruhmeshalle: jeden Gott einzeln mit Seelen bis Stufe 10 leveln (mehr Leben, Schaden, Tempo und eine eigene Stärke); sichtbar mächtiger bei Stufe 1, 4, 7 und 10 (Goldbeschläge, Schulterpanzer und grössere Waffe, leuchtende Rune und Aura, göttliche Krone mit Funken)
- **Spielstände:** Unter «Spielstand» gibt es drei Plätze (zum Beispiel für verschiedene Spieler), jeder lässt sich löschen (zweimal tippen).
- **Gaben wählen:** Schalter im Spiel unten rechts über der Karte («Gaben: Kampf / Pause / Auto») mit drei Stellungen: «im Kampf wählen» (das Spiel läuft weiter, Knopf «✦ Gabe wählen», auch solo), «Spiel hält an» oder «automatisch» für alle, die nur kämpfen wollen. Ab Stufe 15 gibt es seltener neue Gaben, dafür je +3 % Schaden
- **Online-Koop mit Link:** «Koop» → «Online mit Link», Welt und Gott wählen, Link schicken; der Mitspieler öffnet ihn auf seinem eigenen Handy oder PC, nimmt einen anderen Gott, und ihr kämpft zusammen auf derselben Karte. Jeder kann frei laufen, ein Pfeil zeigt, wo der andere ist. Neue Gaben warten hinter dem Knopf «✦ Gabe wählen», das Spiel hält nicht an Bricht die Verbindung ab, steigt der Mitspieler mit dem gleichen Link wieder in die laufende Runde ein.
- **Koop zu zweit an einem Gerät:** gemeinsame Wellen, jeder mit eigenem Gott, eigener Lebensleiste und eigenen Waffen; abwechselnd Karten wählen; wer fällt, wird vom anderen wiederbelebt (3 Sekunden danebenstehen); vorbei erst, wenn beide liegen. Gegner sind zu zweit zahlreicher und zäher
- 16 Erfolge, Schadens-Statistik, eigene Musik (Start, Kampf, Bosskampf), Vibration auf dem Handy

## Steuerung
PC: `W` `A` `S` `D` oder Pfeiltasten, `Esc` Pause. Handy: Daumen aufs Feld und ziehen.
Online-Koop: jeder steuert normal auf seinem Gerät. Koop am gleichen Gerät: Spieler 1 `W` `A` `S` `D`, Spieler 2 Pfeiltasten. Auf Handy oder Tablet steuert die linke Bildhälfte Spieler 1, die rechte Spieler 2.

## Spielstand
Automatisch im Browser. **⬇ Spielstand speichern** lädt eine JSON-Datei herunter, **⬆ Spielstand laden** stellt alles wieder her.

## Dateien
| Datei | Zweck |
| --- | --- |
| `index.html` | Spielbare Version |
| `quelle-claude-artifact.html` | Gleicher Code für die claude.ai-Version |
| `manifest.webmanifest`, `icon-*.png` | App-Symbol für den Home-Bildschirm |
| `werkzeuge/build.sh` | Baut `index.html` aus dem Quellcode |
| `werkzeuge/sim.js` | Autopilot-Simulation fürs Balancing (`node sim.js <html-datei\|-> <runden> <maxWelle> [schmiede-json\|-] [h\|-] [eis: all\|json\|-]`, mit `PW_CHANNEL=msedge` für das installierte Edge, `WORLD=eis` für Niflheim, `HERO=0..10` für die Heldenstufe, `COOP=1` für zwei Bots zusammen, `SEED=<zahl>` für wiederholbare Läufe) |
| `werkzeuge/qa.js` | Klick-Test aller Menüs auf Handygrösse, inklusive Koop |
| `werkzeuge/online-wieder.js` | Online-Koop: Spieler 1 kurz offline, Gast kommt trotzdem rein (braucht Internet) |
| `werkzeuge/online-qa.js` | Online-Koop-Test mit zwei Fenstern (ohne Internet; `NETZ=echt` über PeerJS) |
| `werkzeuge/online-zurueck.js` | Online-Test: der Gast verliert mitten in der Runde die Verbindung und steigt mit dem gleichen Link wieder ein (`NETZ=echt` für echtes Netz) |
| `STATUS.md` | Stand und Änderungen |
| `PLAN.md` | Offene Aufgaben (GW-1 bis GW-8) und Routine-Entscheide |
| `werkzeuge/gw34-headless.test.cjs` | Test Münzwurf und Credit (`node werkzeuge/gw34-headless.test.cjs`) |
| `werkzeuge/gw37-headless.test.cjs` | Test Heldenhalle (`node werkzeuge/gw37-headless.test.cjs`) |
| `werkzeuge/gw38-headless.test.cjs` | Test Koop: Spielertausch, Kartenreihenfolge, Wiederbeleben, Leine, Gegner zu zweit, Solo unverändert, Spielstand (`node werkzeuge/gw38-headless.test.cjs`) |
| `werkzeuge/gw36-headless.test.cjs` | Test Welten, Menü, Schmiede-Stufen, Pfad nach Niflheim, neue Gaben, Spielstand v34 (`node werkzeuge/gw36-headless.test.cjs`) |

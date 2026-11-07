# Götterwacht

Stand: 07.11.2026 (Claude), aus der Werkstatt hierher verschoben. Privates Spiel von Nico (kein Müller-Bezug).

## Wo liegt was
- **Live:** dieses Repo (GitHub Pages, `index.html`) und das claude.ai-Artifact «Götterwacht» (Version 34 seit 07.11.2026). Beide werden zusammen nachgeführt.
- **Quelle:** `quelle-claude-artifact.html` (= Artifact-Code); `index.html` = gleicher Code mit App-Kopf (Manifest, Symbole). Test: `node werkzeuge/gw34-headless.test.cjs`.

## Abgleich Aufgabensammlung ↔ Ist-Stand (geprüft 06.11.2026)
Vorhanden: Wellen (Meilensteine bis Welle 20), Ruhmeshalle, Seelen, Nebel als Umwelteffekt, Fähigkeiten (`SKILLS`). Keiner der neuen Punkte ist umgesetzt.

## Offene Aufgaben
| Nr. | Aufgabe | Abhängig von |
| --- | --- | --- |
| GW-1 | Neue Version (34), Credit genau «Made by a Legend NMO», Versionsverlauf mit Urheber der Änderung | – |
| GW-2 | Münzwurf mit dem Tod: freiwillig, Tod erscheint; Totenkopf = sofortiger Tod; Kleeblatt = alle aktuell vorhandenen Fähigkeiten +1 Stufe bis zur jeweiligen Levelgrenze, danach wird der Tod wütend und erzeugt eine Brandfläche, die Gegner verbrennt | GW-1 |
| GW-3 | ✅ v35: Eiswelt nach Welle 20: neue Karte, Gegner in Gestalt, Charakter und Fähigkeiten angepasst, Schneestürme statt Nebel | GW-1 |
| GW-4 | ✅ v35: Zehn neue freischaltbare Fähigkeiten im Skilltree für das Überleben in der Eiswelt | GW-3 |
| GW-5 | ✅ v35: Weitere wählbare Fähigkeiten beim Seelen-Levelaufstieg | GW-4 |
| GW-6 | ✅ v37: Helden einzeln in der Ruhmeshalle leveln (passend zu ihren Fähigkeiten), Helden optisch überarbeiten, mit dem Level sichtbar mächtiger | GW-1 |

Alle Punkte ändern dieselbe Datei: nacheinander, nicht parallel.

## Routine-Entscheide (von Claude im vereinbarten Rahmen festgelegt, änderbar)
- Münzwurf: wird ab Welle 10 nach jeder fünften Welle angeboten (10, 15, 20, …), höchstens einmal pro Angebot, ablehnen ohne Nachteil. Chance 50 : 50. Brandfläche 8 Sekunden, Schaden pro Sekunde wie eine mittlere Fähigkeit dieser Welle. Sind alle Fähigkeiten schon am Maximum, gibt das Kleeblatt stattdessen Seelen im Wert eines Levelaufstiegs.
- Balancing: Nico erreicht ohne Upgrades etwa Welle 17. Die Eiswelt beginnt nach Welle 20 etwas schwerer als Welle 20, die neuen Fähigkeiten gleichen das aus. Keine neue Schwierigkeitskurve für die Wellen 1 bis 20.
- Heldenlevel: Kosten in Seelen, steigend; Levelgrenze 10; sichtbare Stufen bei Level 1, 4, 7 und 10 (Rüstung, Leuchten, Aura).

- Welten (v36, Claude, nach Nicos Vorgabe 07.11.): Niflheim ist eine eigene Welt ab Welle 1, frei sobald Welle 20 in Midgard geschafft ist (Erfolg oder Rekord). Midgard läuft nach 20 endlos weiter wie bis v34. Eisgegner: Leben ×7, Schaden ×2.2, Treffer machen 1.4 s frierend (−20 % Tempo), Schneesturm jede gerade Welle ab 4 ausser Boss-Wellen. Skadi dort +15 % Schaden, friert nicht. Ein siebter Platz für Waffen und Gaben. Ruhmeshalle zählt nur Midgard; Niflheim hat einen eigenen Rekord.
- Schmiede (v36): die 12 Kraft-Upgrades bekommen +10 Stufen, sobald Niflheim offen ist (Kosten laufen nach der gleichen Formel weiter). Schicksalsfaden, Erbe, Zweites Leben bleiben.
- Menü (v36): Hauptmenü «Spiel starten · Solo» / «Koop (bald)» → Weltwahl → Heldenwahl mit Runenschmiede → «Ragnarök starten». Nach der Runde: Zusammenfassung, dann «Heldenauswahl».
- Pfad nach Niflheim (v35, Claude): 10 Fähigkeiten in drei Ästen (Wärme, Eis, Wandel) plus Krone, je mit Vorgänger; Kosten 300 / 650 / 1100 / 1800 Runen (zusammen 7950). Kaufbar jederzeit, wirken nur in Niflheim.
- Neue Gaben (v35, Claude): Waffen Frostnova und Eiszapfenregen (für alle Götter, in der Eiswelt öfter angeboten), Gaben Zähigkeit, Runenwissen, Scharfblick. Zwei neue Erfolge (Niflheim betreten, Welle 20 in Niflheim).

## Nächster Schritt
Koop-Modus (eigene grosse Aufgabe). Offen: Versionen 35-37 ins claude.ai-Artifact veröffentlichen.

# Götterwacht

Stand: 07.11.2026 (Claude), aus der Werkstatt hierher verschoben. Privates Spiel von Nico (kein Müller-Bezug).

## Wo liegt was
- **Live:** dieses Repo (GitHub Pages, `index.html`) und das claude.ai-Artifact «Götterwacht» (Version 34 seit 07.11.2026). Beide werden zusammen nachgeführt.
- **Quelle:** `quelle-claude-artifact.html` (= Artifact-Code); `index.html` = gleicher Code mit App-Kopf (Manifest, Symbole). Tests: `node werkzeuge/gw34-headless.test.cjs` bis `gw38-headless.test.cjs`, Klick-Test `werkzeuge/qa.js`.

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
| GW-7 | ✅ v38: Koop-Modus (lokal zu zweit an einem Gerät) | GW-6 |
| GW-8 | ✅ v39: Online-Koop mit Einladungslink, jeder auf seinem Gerät, nicht derselbe Gott | GW-7 |
| GW-16 | ✅ v48: drei Spielstände, Spielstand löschen | GW-15 |
| GW-15 | ✅ v47: Gaben-Schalter im Spiel unten rechts, nicht mehr im Menü | GW-14 |
| GW-14 | ✅ v46: Solo-Gaben im Kampf wählen wie online (Schalter: im Kampf / Spiel hält an / automatisch) | GW-13 |
| GW-13 | ✅ v45: neue Heldenfiguren mit sichtbaren Stufen, weniger Stufenaufstiege, Gaben automatisch, weniger Daten, Wiedereinstieg, Versionshinweis | GW-12 |
| GW-12 | ✅ v44: Online-Koop frei laufen (eigene Kamera, Pfeil zum Partner), Karten hinter Knopf | GW-11 |
| GW-11 | ✅ v42/v43: Netz-Meldung und Umweg-Server (ExpressTURN, Konto von Nico) | GW-10 |
| GW-10 | ✅ v41: Einladung bleibt gültig, wenn Spieler 1 kurz die App wechselt; Gast klopft 2 Minuten lang an | GW-9 |
| GW-9 | ✅ v40: Online-Koop: Herzschlag gegen Abbrüche, Karten ohne Unterbruch (10 s, geschützt) | GW-8 |
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

- Koop (v38, Claude): **lokal an einem Gerät** statt online. Grund: Online-Koop braucht einen Vermittlungs-Server (WebRTC-Signalisierung oder Relais); das geht weder im claude.ai-Artifact noch auf GitHub Pages ohne fremden Dienst, und Verzögerungen machen ein schnelles Wellenspiel unfair. Lokal braucht nichts davon.
  - Steuerung: Spieler 1 W A S D (linke Bildhälfte), Spieler 2 Pfeiltasten (rechte Bildhälfte). Solo behält WASD und Pfeile zusammen.
  - Technik: Der Spielzustand `G` gehört immer dem aktiven Spieler, der zweite liegt in `G.p2`; `swapP()` tauscht die Spielerfelder (`PK`). So laufen Waffen, Fähigkeiten, Gaben, Pfad nach Niflheim und Heldenstufe für beide ohne doppelten Code. Geschosse, Walküren und Zirkel merken sich ihren Besitzer.
  - Erfahrung und Stufe gemeinsam; jede Stufe: zuerst Spieler 1, dann Spieler 2 eine Karte. Schicksalswurf und Kleeblatt gelten für beide. Schreine wirken auf den, der darin steht.
  - Gegner greifen den näheren stehenden Spieler an; Boss-Flächen, Gift und Feuer treffen beide.
  - Wiederbeleben: 3 s innerhalb 70 Einheiten, dann 40 % Leben und 2 s unverwundbar. «Zweites Leben» aus der Schmiede wirkt pro Spieler zuerst. Ende, wenn beide am Boden sind; der Totenkopf beim Münzwurf beendet die Runde für beide.
  - Kamera: Mitte zwischen beiden, zoomt bis 62 % heraus; weiter auseinander geht nicht (Leine).
  - Schwierigkeit zu zweit: Gegner-Leben ×1.6, Bosse ×1.8, Nachschub ×1.45, Gegner gleichzeitig ×1.35, Erfahrung ÷1.25. Simulation: etwa gleich schwer wie Solo.
  - Rekorde: Koop hat einen eigenen Rekord pro Welt (`koopRekord` im Spielstand), Solo-Rekord und Ruhmeshalle bleiben Solo. Runen, Seelen und Erfolge zählen auch im Koop (Erfolg «Welle 20» öffnet also auch hier Niflheim).

- Online-Koop (v39, Nico 07.11.: «Link senden, gemeinsam in der Sitzung, nicht am gleichen Bildschirm»):
  - Verbindung: PeerJS 1.5.4 (von cdnjs, wird erst beim Online-Koop geladen) über den kostenlosen öffentlichen PeerJS-Vermittler; danach WebRTC direkt zwischen den Geräten. Kein eigener Server. Einladungscode 6 Zeichen, Link `…/goetterwacht/?koop=CODE`. Ohne TURN-Server klappt es in seltenen Netzen nicht (dann WLAN).
  - Spieler 1 ist Gastgeber und rechnet alles (gleicher Koop-Code wie v38). Spieler 2 schickt Steuerung, Kartenwahl, Pause; bekommt 20-mal pro Sekunde den Stand (Gegner, Geschosse, Effekte, Partikel, Töne, Banner) und bewegt die eigene Figur sofort selbst (danach sanft angeglichen).
  - Spieler 2 nutzt seine eigene Runenschmiede und Heldenstufe; Runen und Seelen am Ende gehen in seinen Spielstand, Koop-Rekord auch. Pfad nach Niflheim und Schmiede-Fähigkeiten kommen vom Gastgeber.
  - Nicht derselbe Gott (online und lokal). Welt wählt Spieler 1; Niflheim darf der Gast auch ohne eigene Freischaltung mitspielen.
  - Verbindung weg: Gast landet im Menü, Gastgeber spielt allein weiter (Partner bleibt am Boden). 20 Sekunden ohne Nachricht gelten als Abbruch.
  - Test: `werkzeuge/online-qa.js` (zwei Fenster, ohne Internet über BroadcastChannel, mit `NETZ=echt` über PeerJS).

- Karten im Online-Koop (v40, Nico 08.11.: «sonst gibt es ständig Unterbrüche»): kein Anhalten. Jede gemeinsame Stufe gibt beiden eine Karte, jeder wählt für sich in einer Leiste unten. Während der Wahl ist man geschützt, nach 10 s nimmt das Spiel die erste Karte. Lokaler Koop bleibt beim Abwechseln mit Pause (ein Bildschirm). Schicksal und Münzwurf halten weiter an, weil sie für beide gelten und selten sind.

## Nächster Schritt
Online-Koop mit zwei echten Geräten testen, dann Koop feinjustieren. Offen: Versionen 35-39 ins claude.ai-Artifact veröffentlichen.

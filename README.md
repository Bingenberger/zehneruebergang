# Rechenrahmen-Trainer – Zehnerübergang

Web-App für die 1. Klasse zum Trainieren von **Zehnerübergang** (Addition) und **Zehnerunterschreitung** (Subtraktion) am 20er-Rechenrahmen über das **Teilschrittverfahren**.

---

## Schnellstart

```bash
npm install
npm run dev    # Entwicklungsserver auf http://localhost:5173
npm run build  # Produktions-Build → dist/
```

Das `dist/`-Verzeichnis ist ein rein statisches Build, das auf jedem Webserver ohne Backend läuft.

---

## Bedienung

### Modi
- **Schau zu** – Die App führt das Verfahren vollständig vor. Mit ⏸/▶ oder `Leertaste` pausieren/fortsetzen.
- **Mach mit** – Das Kind gibt an den entscheidenden Stellen die Zwischenergebnisse über das Zahlenfeld ein (Mausklick oder Zifferntasten `1`–`9`).

### Tastaturkürzel
| Taste | Funktion |
|-------|----------|
| `1`–`9` | Zahl eingeben (im „Mach mit"-Modus) |
| `Leertaste` | Pause/Weiter (im „Schau zu"-Modus) |
| `Esc` | Aktuelle Aufgabe zurücksetzen |
| `N` | Neue Aufgabe starten |

### Lehrkraft-Bereich
Über das ⚙-Symbol oben rechts erreichbar:
- **Sachkontext ein-/ausblenden**
- **Filter** nach erstem Summanden/Minuenden
- **Manuelle Aufgabenauswahl** aus der vollständigen Liste
- **Fortschritt zurücksetzen**

---

## Audio-Dateien

Die App funktioniert ohne Audiodateien (stilles Fallback), läuft dann aber ohne Sprachausgabe. Für vollständige Sprachbegleitung werden folgende MP3-Dateien benötigt:

**Format:** MP3, 22 kHz, Mono, ca. 96 kbps, ruhige freundliche Stimme, je ca. 100 ms Stille am Anfang/Ende.

### `public/audio/zahlen/`
`01.mp3` bis `20.mp3`: „eins", „zwei", „drei", „vier", „fünf", „sechs", „sieben", „acht", „neun", „zehn", „elf", „zwölf", „dreizehn", „vierzehn", „fünfzehn", „sechzehn", „siebzehn", „achtzehn", „neunzehn", „zwanzig"

### `public/audio/woerter/`
| Datei | Inhalt |
|-------|--------|
| `plus.mp3` | „plus" |
| `minus.mp3` | „minus" |
| `ist.mp3` | „ist" |

### `public/audio/prompts/`
| Datei | Inhalt |
|-------|--------|
| `wir_rechnen.mp3` | „Wir rechnen …" |
| `neue_aufgabe.mp3` | „Eine neue Aufgabe." |
| `wie_viele_bis_zehn.mp3` | „Wie viele fehlen bis zur Zehn?" |
| `wie_viele_weg_bis_zehn.mp3` | „Wie viele nehmen wir weg, bis wir bei Zehn sind?" |
| `wie_viele_noch_dazu.mp3` | „Wie viele kommen jetzt noch dazu?" |
| `wie_viele_noch_weg.mp3` | „Wie viele nehmen wir jetzt noch weg?" |
| `denke_an_die_zehn.mp3` | „Denke an die Zehn." |
| `in_was_haben_wir_die.mp3` | „In was haben wir die" (Zahl folgt) |
| `zerlegt_in.mp3` | „zerlegt? In" (Zahl folgt) |
| `und_noch.mp3` | „und noch?" |

### `public/audio/feedback/`
| Datei | Inhalt |
|-------|--------|
| `richtig.mp3` | „Richtig!" |
| `super.mp3` | „Super gemacht!" |
| `klasse.mp3` | „Klasse!" |
| `nochmal.mp3` | „Probier es noch einmal." |

---

## Deployment

```bash
npm run build
# Inhalt von dist/ auf jeden statischen Webserver kopieren
# z. B. mit Nginx, Apache, GitHub Pages, Netlify, Vercel (als Static Site)
```

Keine serverseitigen Abhängigkeiten. Keine Datenbank. Kein Backend.

---

## Architektur

### Überblick

```
src/
├── main.ts          DOM-Skeleton, Subscriptions, Keyboard-Handler
├── state.ts         Zentraler reaktiver Store (pub/sub)
├── controller.ts    Phasen-Maschine: runPhaseTransition()
├── tasks.ts         Aufgaben-Pool und Generator
├── audio.ts         AudioSequencer (play, sequence, stop, mute)
├── types.ts         Gemeinsame TypeScript-Typen
└── components/
    ├── rechenrahmen.ts   Perlendarstellung + Bead-Animation
    ├── termAnzeige.ts    Mathematische Notation (schrittweise)
    ├── kontextKarte.ts   Sachkontext-Karte
    ├── sprachLeiste.ts   Text-Leiste + Clip-Mapping pro Phase
    ├── nummernfeld.ts    3×3 Eingabefeld + Tastatur-Binding
    ├── controlBar.ts     Modus- und Operations-Toggle, Stummschalten
    └── lehrerPanel.ts    Einstellungs-Panel für Lehrkräfte
```

### Synchronisationsprinzip

**Ein einziger `runPhaseTransition(toPhase, prevState)`-Aufruf** in `controller.ts` stößt alle vier Darstellungsformen gleichzeitig an:

1. **Perlenbewegung** – `animateBeads()` bewegt Perlen im DOM mit gestaffelter CSS-Animation
2. **Termanzeige** – `store.patch()` aktualisiert `highlightedTermPart`; `termAnzeige.ts` liest den State
3. **Sprachausgabe** – `audio.sequence([...])` spielt die Clips zur Phase ab
4. **Sprachleiste** – Text-Update via `renderSprachLeiste()` nach State-Änderung
5. **Kontextkarte** – Zweiter Satz erscheint ab Phase `frageErgaenzung`

Alle Komponenten abonnieren denselben Store (`store.subscribe(renderAll)`). Es gibt keine voneinander unabhängigen Animationen – der State ist die einzige Quelle der Wahrheit.

### Neuen Aufgabentyp ergänzen

1. **Neuen Aufgaben-Pool** in `tasks.ts` anlegen: `MY_NEW_TASKS: [number, number][]`
2. **`buildTask()`** erweitern oder eine eigene Funktion schreiben, die ein `Task`-Objekt zurückgibt (inkl. `ergaenzung` und `rest` – die Kern-Teilschritte)
3. **Phasenlogik** in `controller.ts` (`handlePhase()`) bei Bedarf um neue Phasen erweitern; die State-Machine in `types.ts` (`Phase`) entsprechend ergänzen
4. **Neue Sachkontexte** in `tasks.ts` → `CONTEXTS[]` hinzufügen
5. **Audio-Clips** für die neuen Formulierungen in `public/audio/prompts/` ablegen und in `main.ts` → `AUDIO_CLIPS[]` eintragen

Die gesamte App-Logik läuft über den zentralen Store; ein neuer Aufgabentyp benötigt keine Änderungen an den Render-Komponenten, solange er dasselbe `Task`-Interface bedient.

---

## Browser-Unterstützung

- Chrome, Firefox, Safari (aktuell)
- Safari auf iPadOS 16+
- `prefers-reduced-motion` wird respektiert (alle Animationen auf 150 ms-Fades reduziert)

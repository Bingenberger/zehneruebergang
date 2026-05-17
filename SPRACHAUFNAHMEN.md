# Sprachaufnahmen – Rechenrahmen-Trainer

Alle Clips werden als separate Audiodateien gespeichert und im App vom System
aneinandergereiht. Wichtig für die Aufnahme:

- **Zahlen und Wörter** werden in Sätze eingebettet – neutrale, gleichmäßige Betonung,
  kein abschließendes Senken oder Heben der Stimme.
- **Prompts** sind entweder vollständige Sätze (mit Satzmelodie) oder Satzfragmente,
  die nahtlos in eine Zahl übergehen. Den Kontext zeigen die Beispielsequenzen.
- Zwischen den Clips gibt es **keine Stille** – kurze natürliche Pausen am Anfang/Ende
  jeder Datei sind aber in Ordnung.
- Aufnahmeformat: **Mono, 44,1 kHz, 16 bit** (oder höher, wird dann konvertiert).

---

## 1. Zahlen (`zahlen/`)

Dateipfad-Schema: `zahlen/01`, `zahlen/02` … `zahlen/20`

Gesprochen werden die Zahlen **isoliert, in neutralem Ton** – keine Satzmelodie.

| Datei        | Text       |
|--------------|------------|
| `zahlen/01`  | eins       |
| `zahlen/02`  | zwei       |
| `zahlen/03`  | drei       |
| `zahlen/04`  | vier       |
| `zahlen/05`  | fünf       |
| `zahlen/06`  | sechs      |
| `zahlen/07`  | sieben     |
| `zahlen/08`  | acht       |
| `zahlen/09`  | neun       |
| `zahlen/10`  | zehn       |
| `zahlen/11`  | elf        |
| `zahlen/12`  | zwölf      |
| `zahlen/13`  | dreizehn   |
| `zahlen/14`  | vierzehn   |
| `zahlen/15`  | fünfzehn   |
| `zahlen/16`  | sechzehn   |
| `zahlen/17`  | siebzehn   |
| `zahlen/18`  | achtzehn   |
| `zahlen/19`  | neunzehn   |
| `zahlen/20`  | zwanzig    |

---

## 2. Wörter (`woerter/`)

Auch diese Clips werden in Sätze eingebettet – neutrale Betonung wie beim Vorlesen.

| Datei           | Text  | Verwendungsbeispiel              |
|-----------------|-------|----------------------------------|
| `woerter/plus`  | plus  | „Wir rechnen **9 plus 4**."     |
| `woerter/minus` | minus | „Wir rechnen **13 minus 4**."   |
| `woerter/ist`   | ist   | „9 plus 1 **ist** zehn."        |

---

## 3. Ansagen (`prompts/`)

### 3.1 Aufgabenstellung

| Datei                 | Text          | Kontext / Beispielsequenz                                    |
|-----------------------|---------------|--------------------------------------------------------------|
| `prompts/wir_rechnen` | Wir rechnen   | → gefolgt von Zahl + op + Zahl: „**Wir rechnen** 9 plus 4." |

`wir_rechnen` ist ein Satzauftakt ohne Abschluss – Stimme bleibt offen/schwebend,
als würde man gleich weitersprechen.

---

### 3.2 Erster Schritt – Ergänzung zur Zehn

| Datei                          | Text                                              |
|--------------------------------|---------------------------------------------------|
| `prompts/wie_viele_bis_zehn`   | Wie viele fehlen bis zur Zehn?                    |
| `prompts/wie_viele_weg_bis_zehn` | Wie viele nehmen wir weg, bis wir bei Zehn sind? |

Beide sind **vollständige Fragen** mit Fragezeichen-Intonation (steigende Stimme am Ende).

---

### 3.3 Zweiter Schritt – Zerlegungserinnerung + Restfrage

Diese drei Clips werden **direkt hintereinander** gespielt, gefolgt von einer der
beiden Restfragen (3.4). Die Aufnahmen müssen nahtlos zusammenpassen.

| Datei                        | Text                  | Position in der Sequenz                              |
|------------------------------|-----------------------|------------------------------------------------------|
| `prompts/in_was_haben_wir_die` | In was haben wir die  | Satzauftakt, offen – direkt gefolgt von einer Zahl  |
| `prompts/zerlegt_in`         | zerlegt? In           | nach der Zahl; kurze Pause nach „zerlegt?", dann „In"|
| `prompts/und_noch`           | und noch …            | nach der Ergänzungs-Zahl; leicht fragend/schwebend  |

**Vollständige Beispielsequenz (Addition, 9 + 4, Ergänzung = 1):**

> „In was haben wir die **4** zerlegt? In **1** und noch …
>  Wie viele kommen jetzt noch dazu?"

**Vollständige Beispielsequenz (Subtraktion, 13 − 4, Ergänzung = 3):**

> „In was haben wir die **4** zerlegt? In **3** und noch …
>  Wie viele nehmen wir jetzt noch weg?"

Hinweis zu `zerlegt_in`: Aufnahme beginnt mitten im Satz. Die Intonation von
„zerlegt?" ist leicht fallend-fragend, dann neutrales „In" als Auftakt für die folgende Zahl.

---

### 3.4 Restfragen

| Datei                          | Text                               |
|--------------------------------|------------------------------------|
| `prompts/wie_viele_noch_dazu`  | Wie viele kommen jetzt noch dazu?  |
| `prompts/wie_viele_noch_weg`   | Wie viele nehmen wir jetzt noch weg? |

Vollständige Fragen mit Fragezeichen-Intonation. Werden direkt nach `und_noch` (3.3) abgespielt.

---

### 3.5 Reserveclip

| Datei                        | Text              | Hinweis                         |
|------------------------------|-------------------|---------------------------------|
| `prompts/denke_an_die_zehn`  | Denke an die Zehn | Vollständiger Satz, leicht betonend; aktuell als Reserve vorgeladen |

---

## 4. Feedback (`feedback/`)

Kurze, motivierende Ausrufe. Freudig, kindgerecht, nicht übertrieben.

| Datei              | Text      | Wann gespielt                               |
|--------------------|-----------|---------------------------------------------|
| `feedback/richtig` | Richtig!  | Nach korrekter Eingabe im Mach-mit-Modus    |
| `feedback/nochmal` | Nochmal!  | Nach falscher Eingabe im Mach-mit-Modus     |
| `feedback/super`   | Super!    | Am Ende einer vollständigen Aufgabe         |
| `feedback/klasse`  | Klasse!   | Reserve / Variation (vorgeladen, noch nicht eingesetzt) |

---

## Übersicht – Anzahl Dateien

| Kategorie  | Anzahl |
|------------|--------|
| Zahlen     | 20     |
| Wörter     | 3      |
| Prompts    | 8      |
| Feedback   | 4      |
| **Gesamt** | **35** |

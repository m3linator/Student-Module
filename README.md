# Uni-App

Persönliche Studien-App als **Progressive Web App** – eine Codebasis für Mac (als Dock-App),
iPhone (als Home-Bildschirm-App) und jeden Browser. Aufgaben mit Abgabe-Countdown, Module mit
Links und Markdown-Notizen sowie ein Habittracker. Alle Daten liegen in Supabase und werden
in Echtzeit zwischen allen geöffneten Geräten synchronisiert.

---

## Inhalt

- [Funktionen](#funktionen)
- [Screenshots](#screenshots)
- [Tech-Stack](#tech-stack)
- [Voraussetzungen](#voraussetzungen)
- [Schnellstart](#schnellstart)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Skripte](#skripte)
- [Projektstruktur](#projektstruktur)
- [Architektur](#architektur)
- [Tests](#tests)
- [Code-Dokumentation (Doxygen)](#code-dokumentation-doxygen)
- [Deployment](#deployment)
- [Lizenz](#lizenz)
- [Releases](#releases)

---

## Funktionen

### Aufgaben

- Liste offener Aufgaben mit den Spalten **Aufgabe | Modul | verbl. Tage**.
- **Countdown in Kalendertagen** (Zeitzone Europe/Berlin). Mit dem Schalter **„Bis Vorabend
  fertig“** zählt er bis zum Tag vor der Abgabe.
- Anzeige `N Tage`, `1 Tag`, `Heute`, `−N` (überfällig) bzw. `–` (ohne Datum). Bei **≤ 2 Tagen**
  ist das Feld rot.
- Sortierung: wenigste verbleibende Tage oben, ohne Datum unten, bei Gleichstand nach
  Erstellzeit.
- **Wischen** nach links (Touch, Maus-Ziehen, Trackpad) bzw. **Hover** am Desktop zeigt die
  Aktionen **Abhaken** (grün) und **Löschen** (rot). Ausgeführt wird erst beim Tippen auf den
  Button.
- **Erledigte Aufgaben** in einem aufklappbaren Bereich, mit **Wiederherstellen**.
- Löschen ist endgültig, 5 Sekunden lang aber über **„Rückgängig“** umkehrbar.
- Pop-up mit kleinem Kalender, optionalem Modul und Tastenkürzel **N** für eine neue Aufgabe
  (Desktop).

### Module

- Kachel-Raster mit Name, ECTS, Prof und Anzahl offener Aufgaben.
- Eigene Modulseite (`/module/:id`) mit Infos (Vorlesung/Übung: Raum & Uhrzeit).
- **Wichtige Links**: angezeigt wird nur der Name. `https://` wird automatisch ergänzt. Die
  Links lassen sich per Wischen bearbeiten oder löschen und per Drag & Drop (oder Pfeiltasten)
  sortieren.
- **Markdown-Notizen** mit Umschalter Bearbeiten/Vorschau (Überschriften, Listen, Checkboxen,
  Code, Links) und Autosave nach ca. 800 ms. Tippst du gerade, überschreibt ein Realtime-Update
  von einem anderen Gerät deinen Text nicht.
- Beim Löschen eines Moduls fragt die App nach. Links und Notizen werden mitgelöscht, Aufgaben
  bleiben erhalten, aber ohne Modul.

### Habittracker

- Ein Habit (Standard „Fokus“), der per Tipp umbenannt werden kann.
- Monatsraster im Stil der Anki-Heatmap (Mo–So). Grün heißt erledigt. **Heute** ist schwarz
  umrandet, zukünftige Tage sind gesperrt.
- **Serie** („🔥 N Tage in Folge“) und Blättern durch vergangene Monate.

### Plattform & Qualität

- Responsives Layout nach Bildschirmbreite: einspaltig unter 1024 px (ab 768 px zentriert, max.
  640 px breit), ab 1024 px zweispaltig (max. 1200 px breit).
- Pop-ups erscheinen auf dem Handy als Bottom-Sheet und auf dem Desktop als zentriertes Modal.
  Esc schließt, Enter speichert.
- iOS-Details: Safe Areas (Notch, Home-Indicator), Touch-Ziele ≥ 44 px, 16-px-Eingabefelder
  (kein Auto-Zoom).
- Optimistische Updates mit Rollback und verständlichen deutschen Fehlermeldungen.
- Echtzeit-Sync über Supabase Realtime. Nach einem Verbindungsabbruch oder längerer Zeit im
  Hintergrund lädt die App automatisch nach.
- Dezenter Offline-Hinweis und Update-Hinweis **„Neue Version verfügbar – Neu laden“**.
- Barrierefreiheit: aria-Labels, sichtbare Fokus-Rahmen, Tastaturbedienung,
  `prefers-reduced-motion`.

---

## Screenshots

| iPhone                                       | Mac                                           |
| -------------------------------------------- | --------------------------------------------- |
| _Platzhalter: `docs/screenshots/mobile.png`_ | _Platzhalter: `docs/screenshots/desktop.png`_ |

---

## Tech-Stack

| Bereich         | Technologie                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| Build & Sprache | [Vite 8](https://vite.dev), [TypeScript 6](https://www.typescriptlang.org) (strict) |
| UI              | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com)            |
| Routing         | [React Router](https://reactrouter.com)                                             |
| Backend         | [Supabase](https://supabase.com) – Postgres, Auth, Realtime, RLS                    |
| PWA             | [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox)                       |
| Datum           | [date-fns](https://date-fns.org) + `@date-fns/tz` (Europe/Berlin)                   |
| Markdown        | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm           |
| Tests           | [Vitest](https://vitest.dev), Testing Library, jsdom                                |
| Qualität        | ESLint (typescript-eslint strict, react-hooks), Prettier                            |
| Hosting         | [Vercel](https://vercel.com)                                                        |

---

## Voraussetzungen

- **Node.js ≥ 22.12** und npm (`node -v` prüfen)
- Ein kostenloses **Supabase**-Projekt (siehe [SETUP.md](SETUP.md))
- Für das Deployment: GitHub- und **Vercel**-Konto
- Optional für die Code-Doku: [Doxygen](https://www.doxygen.nl) (`brew install doxygen`)

---

## Schnellstart

```bash
git clone https://github.com/m3linator/Student-Module.git
cd Student-Module
npm install
cp .env.example .env      # Supabase-URL und Key eintragen (siehe SETUP.md)
npm run dev               # http://localhost:5173
```

Auf dem iPhone im selben WLAN testen:

```bash
npm run dev -- --host     # dann die angezeigte Network-URL in Safari öffnen
```

Die vollständige Ersteinrichtung (Datenbank, Benutzer, Vercel, Installation) steht in
**[SETUP.md](SETUP.md)**.

---

## Umgebungsvariablen

| Variable                 | Beschreibung                                                 |
| ------------------------ | ------------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Project URL, z. B. `https://abcd1234.supabase.co`            |
| `VITE_SUPABASE_ANON_KEY` | Publishable- bzw. anon-Key (öffentlich, durch RLS geschützt) |

- Vorlage: [`.env.example`](.env.example). Die echte `.env` ist per `.gitignore` ausgeschlossen.
- Der **service_role/secret**-Key wird nie im Frontend verwendet.
- Ohne Variablen baut die App trotzdem und zeigt einen Einrichtungshinweis an.

---

## Skripte

| Befehl                 | Zweck                                        |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Entwicklungsserver mit Hot Reload            |
| `npm run build`        | Typprüfung + Produktions-Build nach `dist/`  |
| `npm run preview`      | Produktions-Build lokal ausliefern           |
| `npm test`             | Alle Unit-Tests einmal ausführen             |
| `npm run test:watch`   | Tests im Watch-Modus                         |
| `npm run lint`         | ESLint (Warnungen gelten als Fehler)         |
| `npm run format`       | Code mit Prettier formatieren                |
| `npm run format:check` | Formatierung nur prüfen                      |
| `npm run icons`        | PNG-Icons aus `public/icon.svg` neu erzeugen |
| `npm run docs`         | Doxygen-HTML-Doku nach `docs/html/` erzeugen |

---

## Projektstruktur

```
.
├── public/
│   ├── icon.svg                 # Quell-Icon (schwarz auf weiß) – auch Favicon
│   └── icons/                   # generierte PNGs (180, 192, 512, 512 maskable)
├── scripts/
│   ├── generate-icons.mjs       # SVG → PNG-Icons (sharp)
│   ├── generate-docs.mjs        # Doxygen ausführen und ungenutzte Dateien entfernen
│   └── doxygen-ts-filter.mjs    # übersetzt TypeScript für Doxygen in C++-ähnliche Deklarationen
├── supabase/migrations/         # SQL: Tabellen, RLS-Policies, Realtime
├── docs/
│   ├── Doxyfile                 # Doxygen-Konfiguration (nur abweichende Einstellungen)
│   ├── mainpage.md              # Startseite der Code-Doku
│   └── html/                    # generierte, verschlankte HTML-Doku (index.html öffnen)
├── src/
│   ├── config/app.ts            # ⚙️ App-Name, Zeitzone, Breakpoint, Timings
│   ├── index.css                # 🎨 Tailwind-Theme, Schrift, Safe-Area-Utilities, Markdown-Stile
│   ├── main.tsx / App.tsx       # Einstieg, Provider, Routen
│   ├── pages/                   # Login, Übersicht, Modulseite, Einrichtungshinweis
│   ├── components/
│   │   ├── ui/                  # Bausteine: Sheet, SwipeRow, Calendar, Switch, Toast …
│   │   ├── layout/              # Kopfzeile, Routen-Schutz, Offline-/Update-Hinweis
│   │   ├── tasks/               # Aufgabenliste, Pop-up, erledigte Aufgaben
│   │   ├── modules/             # Kacheln, Modul-Pop-up, Links, Notizen
│   │   └── habit/               # Monatsraster, Umbenennen
│   ├── context/                 # Auth-, Daten- und Toast-Provider
│   ├── data/                    # Store (Reducer), Aktionen, Selektoren, Realtime
│   ├── hooks/                   # useTasks, useToday, useAutosaveDraft, useShortcut …
│   ├── lib/                     # reine Logik (Deadline, Sortierung, Kalender, URL …)
│   ├── types/database.ts        # Typen des Datenbankschemas
│   └── test/                    # Test-Setup und -Helfer
├── index.html                   # iOS-Meta-Tags, Manifest-Link
├── vite.config.ts               # Vite, Tailwind, PWA-Manifest, Service Worker, Vitest
├── vercel.json                  # SPA-Rewrite, Cache- und Sicherheits-Header
├── SETUP.md                     # Schritt-für-Schritt-Einrichtung + Prüf-Checkliste
└── README.md
```

### Wo ändere ich was?

| Ich möchte …                      | Datei                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| den **App-Namen** ändern          | `APP_NAME` in [`src/config/app.ts`](src/config/app.ts) (Manifest, Titel, Kopfzeile)                           |
| den **Desktop-Breakpoint** ändern | `DESKTOP_MIN_WIDTH` in `src/config/app.ts` **und** die `lg:`-Klassen bzw. `64rem` in `src/index.css`          |
| die **Farben** anpassen           | Tailwind-Klassen in `src/components/**` (Grautöne, `red-*` für Fristen/Löschen, `green-*` für Erledigt/Habit) |
| die **Schrift** ändern            | `--font-sans` in [`src/index.css`](src/index.css)                                                             |
| **Texte** ändern                  | direkt in der jeweiligen Komponente (alle UI-Texte sind deutsch, z. B. `TasksSection.tsx`)                    |
| die **Rot-Schwelle** ändern       | `URGENT_DAYS` in [`src/lib/deadline.ts`](src/lib/deadline.ts)                                                 |
| **Autosave-/Toast-Dauer** ändern  | `NOTES_SAVE_DEBOUNCE_MS`, `UNDO_TOAST_MS`, `TOAST_MS` in `src/config/app.ts`                                  |
| das **Icon** ändern               | `public/icon.svg` bearbeiten → `npm run icons`                                                                |

---

## Architektur

```
Supabase (Postgres + RLS) ──REST──▶ loadAllRows() ──▶ DataStore (reduce) ──▶ Hooks ──▶ Komponenten
          │                                               ▲        ▲
          └──Realtime (postgres_changes)──▶ realtimeToAction       │
                                                                   │
Komponenten ──▶ Aktionen ──▶ optimistisch anwenden ──▶ Supabase ──┘ (bei Fehler: Rollback + Toast)
```

- **Store** (`src/data/store.ts`): unveränderlicher In-Memory-Zustand aller Tabellen. Jede
  Änderung läuft durch die reine Funktion `reduce`.
- **Aktionen** (`src/data/actions.ts`): Jede Änderung ist eine Mutation aus _apply_,
  _request_ und _rollback_. Neue Zeilen bekommen clientseitige UUIDs und erscheinen sofort.
- **Realtime** (`src/data/realtime.ts`): ein Channel für alle Tabellen. Bei jedem (Re-)Connect
  wird neu geladen, damit verpasste Änderungen ankommen.
- **Konflikte**: Der letzte Schreibvorgang gewinnt. Ausnahme Notizen: `useAutosaveDraft`
  übernimmt Server-Änderungen erst, wenn das Feld verlassen und gespeichert ist.
- **Datum**: Alle Tage sind ISO-Strings (`YYYY-MM-DD`). „Heute“ wird in Europe/Berlin bestimmt
  und springt um Mitternacht automatisch weiter (`useToday`).
- **Sicherheit**: RLS auf allen Tabellen (`auth.uid() = user_id`). Zusammengesetzte
  Fremdschlüssel verhindern Verweise auf Zeilen anderer Nutzer. Markdown wird ohne Roh-HTML
  gerendert, und Links erlauben nur `http(s)`/`mailto`.
- **Service Worker**: cacht nur die App-Shell, niemals Supabase-Antworten.

---

## Tests

```bash
npm test
```

Die Unit- und Komponententests decken unter anderem ab:

- `deadline.ts`: Vorabend an/aus, Monats-/Jahreswechsel, Zeitumstellung März/Oktober,
  überfällig, ohne Datum
- `sort.ts`: Sortierung und Gleichstand
- Store, Mutationen (Rollback), Aktionen, Selektoren, Realtime-Mapping
- Komponenten: Wisch-Zeile, Pop-ups, Kalender, Aufgabenbereich, Modulseite, Habittracker,
  Autosave mit Tipp-Schutz

---

## Code-Dokumentation (Doxygen)

Alle Funktionen, Hooks und Komponenten haben Doxygen-kompatible Kommentare (`@brief`, `@param`,
`@returns`).

```bash
npm run docs          # erzeugt docs/html/
open docs/html/index.html
```

Doxygen kann TypeScript nicht direkt lesen. Der Filter `scripts/doxygen-ts-filter.mjs` übersetzt
jede Datei deshalb mit dem TypeScript-Compiler in vereinfachte C++-Deklarationen samt der
Original-Kommentare. Danach entfernt `scripts/generate-docs.mjs` alle Dateien, auf die keine Seite
verweist (Suchindex, LaTeX, Graphen und Crawler-Seite werden gar nicht erst erzeugt). Übrig
bleiben nur die HTML-Seiten und fünf Asset-Dateien.

---

## Deployment

Hosting erfolgt auf **Vercel** mit automatischem Deployment bei jedem `git push` auf `main`.
Die [`vercel.json`](vercel.json) leitet alle Routen auf `index.html` (damit `/module/:id` beim
Neuladen funktioniert) und setzt Cache-Header, damit Updates zuverlässig ankommen.

➡️ Schritt-für-Schritt-Anleitung inklusive Supabase und Installation auf Mac/iPhone:
**[SETUP.md](SETUP.md)**

---

## Lizenz

_Platzhalter – noch keine Lizenz gewählt._ Ohne Lizenzdatei gilt: Alle Rechte vorbehalten.

---

## Releases

| Version | Datum      | Inhalt                                                                                  |
| ------- | ---------- | --------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-10-10 | Erste Version: Aufgaben, Module mit Links und Notizen, Habittracker, Realtime-Sync, PWA |

Neue Versionen: `version` in `package.json` erhöhen, Zeile hier ergänzen, dann
`git tag vX.Y.Z && git push --tags`.

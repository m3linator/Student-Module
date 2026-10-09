# Einrichtung – Schritt für Schritt

Diese Anleitung führt dich von null bis zur installierten App auf Mac und iPhone.
Du brauchst dafür etwa 30 Minuten, ein GitHub-Konto und einen Rechner mit **Node.js ≥ 22.12**.

> Hinweis: Die Oberflächen von Supabase und Vercel ändern sich gelegentlich. Wenn ein Menüpunkt
> anders heißt, steht in Klammern die ältere bzw. alternative Bezeichnung.

---

## Inhalt

1. [Supabase einrichten](#1-supabase-einrichten)
2. [Lokal testen](#2-lokal-testen)
3. [GitHub → Vercel (Hosting)](#3-github--vercel-hosting)
4. [App installieren](#4-app-installieren)
5. [Hinweise](#5-hinweise)
6. [Prüf-Checkliste](#6-prüf-checkliste)

---

## 1. Supabase einrichten

### 1.1 Konto und Projekt anlegen

1. Öffne <https://supabase.com> → **Start your project** → mit GitHub anmelden.
2. Falls gefragt: eine Organisation anlegen (Name beliebig, Plan **Free**).
3. **New project** klicken und ausfüllen:
   - **Name:** `uni-app`
   - **Database Password:** auf **Generate a password** klicken und das Passwort in deinem
     Passwortmanager speichern (wird für die App nicht gebraucht, aber für Notfälle).
   - **Region:** **Central EU (Frankfurt)** (`eu-central-1`)
   - **Plan / Instance:** Free
4. **Create new project** → ca. 1–2 Minuten warten, bis das Projekt bereit ist.

### 1.2 Datenbank anlegen (SQL-Migration ausführen)

1. Linke Seitenleiste → **SQL Editor**.
2. Oben links **+ New query** (bzw. **New SQL snippet**).
3. Den **kompletten** Inhalt der Datei
   [`supabase/migrations/20261010000000_init.sql`](supabase/migrations/20261010000000_init.sql)
   kopieren und einfügen.
4. Unten rechts **Run** (oder `Cmd + Enter`).
5. Erwartete Meldung: **Success. No rows returned**.

> Die Migration darf nur **einmal** ausgeführt werden. Ein zweiter Lauf bricht mit
> „relation already exists“ ab – das ist dann harmlos.

### 1.3 Prüfen: RLS aktiv, Realtime eingeschaltet

**Row Level Security**

1. Seitenleiste → **Table Editor**.
2. Für jede der fünf Tabellen (`modules`, `module_links`, `tasks`, `habits`, `habit_checks`)
   darf **kein** rotes Hinweisschild **„RLS disabled“ / „Unrestricted“** zu sehen sein.
3. Seitenleiste → **Authentication** → **Policies**: Jede Tabelle hat **4 Policies**
   (`…_select_own`, `…_insert_own`, `…_update_own`, `…_delete_own`).

**Realtime**

1. Seitenleiste → **Database** → **Publications**.
2. Zeile **`supabase_realtime`** → bei **Tables** (bzw. auf die Zahl klicken) müssen alle fünf
   Tabellen eingeschaltet sein.

**Alternativ per SQL** (SQL Editor → New query → Run):

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
select tablename from pg_publication_tables where pubname = 'supabase_realtime';
```

Erwartung: alle fünf Tabellen mit `rowsecurity = true` und alle fünf in der Publication.

### 1.4 Deinen Benutzer anlegen

1. Seitenleiste → **Authentication** → **Users**.
2. Rechts oben **Add user** → **Create new user**.
3. **Email** und ein **starkes Passwort** eintragen.
4. Haken bei **Auto Confirm User** setzen (sonst müsstest du erst eine Bestätigungsmail klicken).
5. **Create user**.

### 1.5 Neuregistrierungen deaktivieren

Damit sich niemand sonst ein Konto anlegen kann:

1. Seitenleiste → **Authentication** → **Sign In / Providers**
   (ältere Oberfläche: **Authentication → Settings**).
2. Den Schalter **Allow new users to sign up** **ausschalten**.
3. **Save changes**.

Der Provider **Email** bleibt aktiviert – sonst funktioniert auch dein eigener Login nicht.

### 1.6 URL und Key kopieren

1. Seitenleiste ganz unten → **Project Settings** (Zahnrad).
2. **Data API** (bzw. **API**) → **Project URL** kopieren, z. B. `https://abcd1234.supabase.co`.
3. **API Keys** → den **Publishable key** (`sb_publishable_…`) kopieren.
   Ältere Projekte zeigen stattdessen unter **Legacy API Keys** den **anon public** Key – der
   funktioniert genauso.

> ⚠️ Niemals den **secret** / **service_role** Key verwenden. Er umgeht alle Sicherheitsregeln
> und würde im Browser für jeden sichtbar sein.

4. Im Projektordner die Vorlage kopieren und ausfüllen:

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

Die `.env` steht in `.gitignore` und wird nie committet.

---

## 2. Lokal testen

```bash
npm install        # Abhängigkeiten installieren (einmalig)
npm run dev        # Entwicklungsserver starten
```

Öffne <http://localhost:5173> und melde dich mit dem Benutzer aus Schritt 1.4 an.

### Auf dem iPhone im selben WLAN

```bash
npm run dev -- --host
```

1. Im Terminal steht eine Zeile wie `Network: http://192.168.178.42:5173/`.
   (Die IP findest du auch mit `ipconfig getifaddr en0`.)
2. Diese Adresse auf dem iPhone in **Safari** öffnen.

Über `http://` (ohne HTTPS) funktioniert alles außer der Installation als App und dem
Service Worker – dafür ist das Deployment auf Vercel (HTTPS) nötig.

### Weitere Befehle

```bash
npm test           # Unit-Tests
npm run lint       # Code-Prüfung
npm run build      # Produktions-Build nach dist/
npm run preview    # Produktions-Build lokal ansehen
```

---

## 3. GitHub → Vercel (Hosting)

### 3.1 Projekt importieren

1. Öffne <https://vercel.com> → **Sign Up** → **Continue with GitHub** (Plan **Hobby**, kostenlos).
2. Im Dashboard **Add New…** → **Project**.
3. Bei **Import Git Repository** das Repository **Student-Module** auswählen → **Import**.
   (Falls es nicht auftaucht: **Adjust GitHub App Permissions** → Repository freigeben.)
4. **Framework Preset:** wird automatisch als **Vite** erkannt. Build Command `npm run build`,
   Output Directory `dist` – nichts ändern.

### 3.2 Umgebungsvariablen eintragen

Noch auf derselben Seite **Environment Variables** aufklappen und zwei Einträge hinzufügen:

| Key                      | Value                                     |
| ------------------------ | ----------------------------------------- |
| `VITE_SUPABASE_URL`      | deine Project URL aus Schritt 1.6         |
| `VITE_SUPABASE_ANON_KEY` | dein Publishable/anon Key aus Schritt 1.6 |

### 3.3 Deployen

1. **Deploy** klicken → nach ca. 1 Minute erscheint **Congratulations!**.
2. Die URL notieren, z. B. `https://student-module.vercel.app`.

Später geänderte Umgebungsvariablen (**Project → Settings → Environment Variables**) wirken
erst nach einem neuen Deployment (**Deployments → … → Redeploy**).

### 3.4 Vercel-URL in Supabase eintragen

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** deine Vercel-URL eintragen, z. B. `https://student-module.vercel.app`.
3. **Redirect URLs** → **Add URL** → `https://student-module.vercel.app/**` → **Save**.

---

## 4. App installieren

Öffne die Vercel-URL zuerst normal im Browser und prüfe, dass der Login funktioniert.

### Mac (Safari, macOS Sonoma oder neuer)

1. Vercel-URL in **Safari** öffnen.
2. Menüleiste → **Ablage** → **Zum Dock hinzufügen …**
3. Name prüfen („Uni-App“) → **Hinzufügen**.
4. Die App startet ab jetzt aus dem Dock in einem eigenen Fenster ohne Browserleiste.

### iPhone (Safari)

1. Vercel-URL in **Safari** öffnen.
2. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
3. **Zum Home-Bildschirm** wählen (ggf. erst nach unten scrollen).
   Unter iOS 26 muss dabei **Als Web-App öffnen** eingeschaltet sein.
4. **Hinzufügen**.

> Jede installierte App hat ihren eigenen Speicher. Du meldest dich deshalb in der Mac-App, in der
> iPhone-App und im Browser jeweils **einmal** an – danach bleibt die Sitzung dauerhaft bestehen.

---

## 5. Hinweise

### Supabase pausiert im Free Tier

Ein kostenloses Supabase-Projekt wird nach **etwa einer Woche ohne Zugriffe** pausiert. Die App
zeigt dann beim Laden einen Fehler-Toast („Daten konnten nicht geladen werden“).

So reaktivierst du es:

1. <https://supabase.com/dashboard> öffnen → das pausierte Projekt anklicken.
2. **Restore project** (bzw. **Resume project**) klicken.
3. 2–5 Minuten warten, dann die App neu öffnen. Es gehen **keine Daten** verloren.

Bei regelmäßiger Nutzung passiert das nicht.

### Updates einspielen

1. Änderungen committen und `git push`.
2. Vercel baut und deployt automatisch (ca. 1 Minute).
3. Die geöffnete App prüft beim Zurückkehren in den Vordergrund und stündlich auf Updates und
   zeigt dann oben **„Neue Version verfügbar – Neu laden“**. Ein Tipp auf **Neu laden** genügt.

### App-Name, Farben, Texte ändern

Siehe Abschnitt **Projektstruktur** in der [README](README.md#projektstruktur).

---

## 6. Prüf-Checkliste

- [ ] Login funktioniert, ein falsches Passwort wird mit „E-Mail oder Passwort ist falsch.“ abgelehnt.
- [ ] Es gibt keinen Registrieren-Button; ein Sign-up über die API ist in Supabase deaktiviert.
- [ ] Eine Aufgabe auf dem Mac anlegen → erscheint ohne Neuladen auf dem iPhone.
- [ ] Abgabe Mittwoch mit Schalter „Bis Vorabend fertig“ an → Countdown zählt bis Dienstag.
      Bei ≤ 2 Tagen (inkl. „Heute“ und überfällig) ist die Zahl rot.
- [ ] Sortierung: wenigste Tage oben, Aufgaben ohne Datum („–“) unten.
- [ ] Wischen nach links zeigt rot (Löschen) und grün (Abhaken); erst ein Tipp führt aus.
- [ ] Abhaken verschiebt die Aufgabe nach „Erledigte Aufgaben“; dort stellt der grüne Button sie wieder her.
- [ ] Löschen entfernt die Aufgabe, „Rückgängig“ im Toast holt sie innerhalb von 5 s zurück.
- [ ] Mac: Hover über einer Aufgabe zeigt dieselben Buttons; Taste **N** öffnet „Neue Aufgabe“.
- [ ] Modul anlegen → Kachel zeigt Name, ECTS, Prof und „n offen“.
- [ ] Link hinzufügen (z. B. `moodle.h-brs.de`) → nur der Name ist sichtbar, `https://` wurde
      ergänzt, Tippen öffnet die Seite im Browser.
- [ ] Links per Griff (⋮⋮) umsortieren → Reihenfolge bleibt nach Neuladen erhalten.
- [ ] Notiz schreiben → „Speichert…“ → „Gespeichert“; App schließen und neu öffnen → Notiz ist da.
- [ ] Notiz auf zwei Geräten: Während du auf Gerät A tippst, überschreibt Gerät B deinen Text nicht.
- [ ] Modul löschen → Bestätigungsdialog; danach sind Links/Notizen weg, die Aufgaben bleiben ohne Modul.
- [ ] Habit-Tag antippen → grün; erneut tippen → wieder leer. Zukünftige Tage sind gesperrt.
- [ ] Heute ist schwarz umrandet, die Serie („🔥 N Tage in Folge“) stimmt.
- [ ] WLAN aus → dezenter Offline-Hinweis oben; WLAN an → Hinweis verschwindet.
- [ ] RLS-Test: Abfrage ohne Login liefert keine Daten (Ergebnis `[]`). URL und Key aus deiner
      `.env` einsetzen:
      `bash
    curl "https://DEIN-PROJEKT.supabase.co/rest/v1/tasks?select=*" -H "apikey: DEIN_KEY"
    `
- [ ] Mac-App im Dock öffnet ohne Browserleiste; iPhone-Layout ist sauber, Notch und
      Home-Indicator verdecken nichts, kein horizontales Scrollen, kein Zoom beim Tippen.
- [ ] Die Git-Historie enthält nur deine eigene Autorenschaft – dieser Befehl gibt nichts aus:
      `bash
    git log --format='%b' | grep -i "co-authored-by"
    `

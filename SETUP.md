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
7. [Datenbank-Updates (neue Migrationen)](#7-datenbank-updates-neue-migrationen)

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

### 1.2 Datenbank anlegen (SQL-Migrationen ausführen)

Im Ordner [`supabase/migrations/`](supabase/migrations/) liegen die Migrationen. Führe **alle**
nacheinander aus, in der Reihenfolge ihrer Dateinamen (das Datum am Anfang):

| Reihenfolge | Datei                                   | Inhalt                                                 |
| ----------- | --------------------------------------- | ------------------------------------------------------ |
| 1           | `20261010000000_init.sql`               | Tabellen, Row Level Security, Realtime                 |
| 2           | `20261011000000_module_slots.sql`       | mehrere Vorlesungen/Übungen pro Modul                  |
| 3           | `20261012000000_slot_times.sql`         | Termine mit Wochentag, Beginn und Ende                 |
| 4           | `20261013000000_slot_times_cleanup.sql` | alte Freitext-Uhrzeit entfernen, Felder werden Pflicht |

Bei einer **Neueinrichtung** (noch keine Daten) kannst du alle vier direkt nacheinander
ausführen. Bei einem bestehenden Projekt gilt die Reihenfolge aus
[Abschnitt 7](#7-datenbank-updates-neue-migrationen).

Für jede Datei:

1. Linke Seitenleiste → **SQL Editor**.
2. Oben links **+ New query** (bzw. **New SQL snippet**).
3. Den **kompletten** Inhalt der Datei kopieren und einfügen.
4. Unten rechts **Run** (oder `Cmd + Enter`).
5. Erwartete Meldung: **Success. No rows returned**.

> Jede Migration darf nur **einmal** ausgeführt werden. Ein zweiter Lauf bricht mit
> „already exists“ bzw. „does not exist“ ab und ändert dabei nichts.

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

> ⚠️ Häufige Fehler:
>
> - Die Werte gehören in **`.env`**, nicht in `.env.example` (die Vorlage ist eingecheckt und
>   wird von der App nicht gelesen).
> - Die URL endet auf **`.supabase.co`** – ohne `/rest/v1/` oder anderen Zusatz.
> - Nach jeder Änderung an der `.env` den Dev-Server neu starten (`Ctrl + C`, dann `npm run dev`).

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

Noch auf derselben Seite **Environment Variables** aufklappen und zwei Einträge hinzufügen.
Kopiere die Werte **1:1 aus deiner `.env`**, jeweils nur den Teil nach dem `=` (ohne
Anführungszeichen, ohne Leerzeichen):

| Key                      | Value (Beispiel – deine echten Werte stehen in der `.env`) |
| ------------------------ | ---------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | `https://abcd1234.supabase.co`                             |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_…`                                         |

- **Type:** **Config** (bzw. Schalter **Sensitive** aus). Als _Secret_ oder _Sensitive_ lässt
  Vercel Variablen mit dem Präfix `VITE_` nicht zu bzw. später nicht mehr bearbeiten. Das ist
  unbedenklich: URL und Publishable-Key sind öffentlich, deine Daten schützt RLS. Der
  `service_role`-/Secret-Key gehört **nie** hierher.
- **Environments:** Production, Preview und Development anhaken.

> Steht nach dem Deployen nur „Supabase ist nicht konfiguriert“ auf der Seite, fehlt ein Wert
> oder er ist falsch: Werte korrigieren, dann neu deployen (siehe unten).

### 3.3 Deployen

1. **Deploy** klicken → nach ca. 1 Minute erscheint **Congratulations!** mit einem Vorschaubild.
   Ein Klick darauf öffnet deine App.
2. Unter **Settings → Domains** steht die **feste Adresse** deiner App, z. B.
   `https://student-module.vercel.app` (ist der Name vergeben, hängt Vercel ein Kürzel an, z. B.
   `student-module-ldlc.vercel.app`). Diese Adresse notieren.

> Adressen wie `student-module-ldlc-n4zhis5v1-melih24.vercel.app` gehören nur zu **einem**
> Deployment und ändern sich bei jedem Push. Für Supabase und die Installation immer die feste
> Adresse verwenden.

**Eigenen Namen vergeben (optional, kostenlos):** **Settings → Domains → Add Domain** → z. B.
`melih-uni.vercel.app` eingeben (muss weltweit frei sein) → Environment **Production** → **Save**.
Mach das **vor** Schritt 3.4 und 4, weil Supabase und die installierten Apps an die Adresse
gebunden sind.

**Umgebungsvariablen später ändern:** Sie wirken erst nach einem neuen Build. **Deployments** →
oberster Eintrag → **⋯** → **Redeploy** → Environment **Production**, Haken bei **Use existing
Build Cache** entfernen → **Redeploy**.

### 3.4 Vercel-URL in Supabase eintragen

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** deine feste Vercel-Adresse aus 3.3 eintragen, ohne `/login` und ohne `/` am
   Ende, z. B. `https://student-module.vercel.app` → **Save**.
3. **Redirect URLs** → **Add URL** → dieselbe Adresse mit `/**`, z. B.
   `https://student-module.vercel.app/**` → **Save URLs**.

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

### Weitere Nutzer (z. B. Freunde)

Die App ist mehrbenutzerfähig: Jede Person sieht dank Row Level Security **nur ihre eigenen**
Aufgaben, Module, Termine und ihre Aktivität. Da Neuregistrierungen deaktiviert sind (1.5),
legst du Konten selbst an:

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. E-Mail der Person und ein Start-Passwort eintragen, **Auto Confirm User** anhaken →
   **Create user**.
3. Der Person die App-Adresse, E-Mail und Passwort geben. Beim ersten Login legt die App für sie
   automatisch eine eigene Aktivität („Fokus“) an.

Gut zu wissen:

- Als Projekt-Besitzer kannst du im Supabase-Dashboard (Table Editor) alle Daten sehen. Sag das
  deinen Freunden.
- Die App hat noch keine Funktion „Passwort ändern/vergessen“. Ein neues Passwort setzt du im
  **SQL Editor** (E-Mail und Passwort ersetzen):

  ```sql
  update auth.users
  set encrypted_password = extensions.crypt('NEUES-PASSWORT', extensions.gen_salt('bf'))
  where email = 'freund@example.com';
  ```

- Konto entfernen: **Authentication → Users → ⋯ → Delete user**. Alle Daten dieser Person
  werden automatisch mitgelöscht.

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
- [ ] Modul bearbeiten → „+ Vorlesung“ fügt eine weitere Vorlesung hinzu. Tag, Beginn und Ende
      leeren und speichern entfernt den Eintrag.
- [ ] Nur den Tag wählen → Hinweis „Es fehlt: Beginn, Ende.“, Speichern ist gesperrt. Ende vor
      Beginn → das Ende-Feld ist rot markiert, Speichern ist gesperrt.
- [ ] Modul mit Vorlesung Di 10:00–11:30 und Übung Mi 14:15–15:45 anlegen → beide erscheinen im
      Stundenplan, blau bzw. gelb, und enden exakt an der halben bzw. Dreiviertelstunde. Die
      Modulseite listet sie sortiert („**Vorlesung** · Di 10:00–11:30 · 📍 Raum“).
- [ ] Der Übungstitel lautet „Name-Ü“. Uhr- und Stecknadel-Icon sind sichtbar, ohne Raum entfällt
      die Zeile.
- [ ] Im Stundenplan stehen oben nur Wochentage ohne Datum, links Stunden im 1-h-Abstand.
- [ ] Ein Samstagstermin blendet die Sa-Spalte ein, ein Termin um 19 Uhr erweitert die Zeitachse.
- [ ] Zwei überlappende Termine stehen nebeneinander.
- [ ] Heute ist im Kopf blau hervorgehoben, die rote Linie steht auf der aktuellen Uhrzeit.
- [ ] Ein Klick auf einen Termin öffnet die Modulseite, im Stundenplan lässt sich nichts bearbeiten.
- [ ] Eine Terminänderung auf dem Mac erscheint ohne Neuladen auf dem iPhone.
- [ ] Desktop: links Aufgaben, Erledigte und Aktivität, rechts Module und Stundenplan. Handy:
      Aufgaben → Erledigte → Module → Stundenplan → Aktivität, kein horizontales Scrollen.
- [ ] iPhone: Pop-up „Neue Aufgabe“ öffnen, ins Feld tippen → das Pop-up bleibt über der Tastatur,
      lässt sich scrollen, und „Speichern“ oben ist erreichbar.
- [ ] Konto-Menü (iPhone) bzw. Darstellungs-Symbol (Mac) → Hell / Dunkel / Auto wechselt sofort;
      „Auto“ folgt der Systemeinstellung.
- [ ] Aktivität: Tag antippen → grün; erneut tippen → wieder leer. Zukünftige Tage sind gesperrt.
- [ ] Heute ist umrandet, die Serie (🔥 N) stimmt, mit den Pfeilen blätterst du durch vergangene
      Monate, ein Tipp auf den Namen benennt das Habit um.
- [ ] Die Datumsauswahl im Pop-up „Neue Aufgabe“ funktioniert wie bisher.
- [ ] WLAN aus → dezenter Offline-Hinweis oben; WLAN an → Hinweis verschwindet.
- [ ] RLS-Test: Eine Abfrage ohne Login liefert keine Daten (Ergebnis `[]`). URL und Key aus
      deiner `.env` einsetzen:

  ```bash
  curl "https://DEIN-PROJEKT.supabase.co/rest/v1/tasks?select=*" -H "apikey: DEIN_KEY"
  ```

- [ ] Mac-App im Dock öffnet ohne Browserleiste; iPhone-Layout ist sauber, Notch und
      Home-Indicator verdecken nichts, kein horizontales Scrollen, kein Zoom beim Tippen.
- [ ] Die Git-Historie enthält nur deine eigene Autorenschaft – dieser Befehl gibt nichts aus:

  ```bash
  git log --format='%b' | grep -i "co-authored-by"
  ```

---

## 7. Datenbank-Updates (neue Migrationen)

Wenn ein Update eine neue Datei in `supabase/migrations/` mitbringt, musst du **nur diese neue
Datei** einmal ausführen (bereits ausgeführte nicht noch einmal).

### Update auf Version 0.2.0 (mehrere Vorlesungen und Übungen)

Bestehende Projekte (bei denen `20261010000000_init.sql` schon gelaufen ist):

1. Code aktualisieren: `git pull`, danach `npm install`.
2. Supabase → **SQL Editor** → **+ New query**.
3. Inhalt von
   [`supabase/migrations/20261011000000_module_slots.sql`](supabase/migrations/20261011000000_module_slots.sql)
   einfügen → **Run** → **Success. No rows returned**.
4. Dev-Server neu starten (`Ctrl + C`, `npm run dev`) bzw. auf Vercel neu deployen.

Deine bisherigen Vorlesungs- und Übungsangaben werden dabei automatisch übernommen.

> Solange die Migration nicht ausgeführt ist, zeigt die App Module zwar an, kann sie aber nicht
> speichern (Fehlermeldung „Das Modul konnte nicht gespeichert werden.“).

### Update auf Version 0.3.0 (Stundenplan, Termine mit Wochentag/Beginn/Ende)

Version 0.3.0 bringt **zwei** Migrationen. Die zweite führst du erst aus, wenn du die
Übernahme geprüft hast.

1. Code aktualisieren: `git pull`, danach `npm install`.
2. Supabase → linke Seitenleiste **SQL Editor** → oben links **+ New query**.
3. Inhalt von
   [`supabase/migrations/20261012000000_slot_times.sql`](supabase/migrations/20261012000000_slot_times.sql)
   einfügen → **Run** → **Success. No rows returned**.
   - Bestehende Uhrzeiten im Format `Di 10:00–11:30` werden in Wochentag, Beginn und Ende
     übernommen (Mo–So, Binde- oder Gedankenstrich, mit oder ohne Leerzeichen, auch `9.00` oder
     ein angehängtes „Uhr“).
4. **Übernahme prüfen:** neue Query mit folgendem Inhalt → **Run**:

   ```sql
   select m.name as modul, s.art, s.e ->> 'room' as raum, s.e ->> 'time' as bisher
   from public.modules m
   cross join lateral (
     select 'Vorlesung' as art, e from jsonb_array_elements(m.lectures) e
     union all
     select 'Übung', e from jsonb_array_elements(m.exercises) e
   ) s
   where s.e ->> 'weekday' is null
   order by m.name;
   ```

   - **Keine Zeilen** → alles wurde übernommen, weiter mit Schritt 5.
   - **Zeilen** → diese Termine konnten nicht gelesen werden. Öffne in der App das jeweilige
     Modul → **Bearbeiten**. Der Eintrag zeigt „Bisher: …“. Trag Tag, Beginn und Ende ein (oder
     lass ihn leer, dann wird er gelöscht) → **Speichern**. Danach die Abfrage erneut ausführen.

5. **Aufräumen:** neue Query mit dem Inhalt von
   [`supabase/migrations/20261013000000_slot_times_cleanup.sql`](supabase/migrations/20261013000000_slot_times_cleanup.sql)
   → **Run** → **Success. No rows returned**. Die Migration entfernt den alten Freitext und macht
   Wochentag, Beginn und Ende zur Pflicht.
   - Bricht sie mit „… Termin(e) ohne Wochentag, Beginn oder Ende …“ ab, ist noch ein Eintrag
     offen (zurück zu Schritt 4). Es wurde dabei nichts verändert.
6. Dev-Server neu starten bzw. nach dem `git push` auf Vercel in der App **„Neue Version
   verfügbar – Neu laden“** antippen – auf **jedem** Gerät. Eine alte, noch geöffnete App-Version
   kann Termine nach Schritt 5 nicht mehr speichern.

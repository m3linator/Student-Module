# Uni-App – Code-Dokumentation {#mainpage}

Persönliche Studien-App als Progressive Web App (React, TypeScript, Supabase).

Diese Seiten werden aus den Doxygen-Kommentaren im Quellcode erzeugt (`npm run docs`).
TypeScript-Signaturen sind dabei vereinfacht als C++-ähnliche Deklarationen dargestellt.

## Einstieg

| Bereich        | Dateien                                                           |
| -------------- | ----------------------------------------------------------------- |
| Konfiguration  | `config/app.ts` – App-Name, Zeitzone, Breakpoint, Timings         |
| Geschäftslogik | `lib/deadline.ts`, `lib/sort.ts`, `lib/habit.ts`, `lib/calendar.ts` |
| Daten & Sync   | `data/store.ts`, `data/actions.ts`, `data/realtime.ts`            |
| Hooks          | `hooks/useData.ts`, `hooks/useToday.ts`, `hooks/useAutosaveDraft.ts` |
| Oberfläche     | `components/**`, `pages/**`                                       |

Unter **Dateien** sind alle Module mit ihren Funktionen, Komponenten und Typen aufgelistet,
unter **Klassen** die Props- und Datentypen.

# Technisches & Funktionales Dossier: FootyPulse (v1.2.0)

Dieses Dokument dient als Übergabeprotokoll für Entwicklungs-Agenten, um das Systemverständnis der "FootyPulse" Applikation (ehemals favteam) zu gewährleisten.

## 1. Projektübersicht
**Name:** FootyPulse - Der Fußball-Explorer  
**Ziel:** Eine leichtgewichtige, performante Web-App zur Anzeige von Live-Daten der deutschen Bundesligen (1., 2., 3. Liga).  
**Paradigma:** Vanilla Web-Development. Keine Frameworks (React, Vue, etc.), keine Build-Steps.

---

## 2. Funktionale Merkmale (v1.2.0)
*   **Intelligente Suche:** Autocomplete-Suche über alle unterstützten Ligen hinweg. Ergebnisse werden im Format `[Liga] - [Teamname]` angezeigt.
*   **Team-Dashboard:** Zentralisierte Ansicht nach Auswahl eines Teams:
    *   **Stammdaten:** Logo und offizieller Name.
    *   **Formkurve:** Anzeige der letzten 10 absolvierten Spiele mit grafischen Form-Pillen (S/U/N).
    *   **Kommende Spiele:** Anzeige der nächsten 10 anstehenden Partien (Spielplan).
    *   **Tabellen-Kontext:** Anzeige der aktuellen Liga-Tabelle mit automatischer Hervorhebung (Highlighting) des gewählten Teams.
*   **Theme-System:** Dynamischer Wechsel zwischen **Hell-** und **Dunkel-Design** via CSS-Variablen.
*   **Persistenz:**
    *   **Favoriten:** Nutzer können Teams "sternen". Diese werden dauerhaft im `localStorage` gespeichert.
    *   **Zuletzt angesehen:** Eine Historie der letzten Aufrufe wird automatisch gepflegt.
*   **Offline-First Ansatz (Caching):** Aggressives Caching von API-Anfragen im `localStorage`, um Ladezeiten zu minimieren und die API-Last zu senken.

---

## 3. Tech-Stack
*   **Sprachen:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ Module).
*   **Styling:** Modernes CSS mit CSS Variables für Design-Tokens. 
    *   **Features:** Glassmorphism-Elemente, responsive Layouts, optimiert für Mobile (iPhone 12+).
    *   **Typography:** Google Fonts "Inter".
*   **Datenquelle:** [OpenLigaDB REST API](https://api.openligadb.de/).
*   **Versionsverwaltung:** Git (GitHub Repository: `netlusche/FootyPulse`).

---

## 4. Architektur & Modulstruktur
Die Anwendung ist modular aufgebaut (`/js` Verzeichnis):

1.  **`app.js` (Orchestrator):**
    *   Initialisiert die Anwendung und das Theme.
    *   Verbindet UI-Events (Suche, Klicks, Theme-Wechsel) mit der Logik.
    *   Steuert den Page-Lifecycle.
2.  **`api.js` (Data Layer):**
    *   Zentraler Ort für Fetch-Aufrufe.
    *   Implementiert `fetchWithCache`: Prüft `localStorage` auf gültige Daten (30 Min. TTL).
    *   Konfiguriert die `RELEVANT_LEAGUES` (aktuell: `bl1`, `bl2`, `bl3`).
3.  **`state.js` (State Management):**
    *   Verwaltet den globalen App-Status (Teams, Favoriten, Verlauf, Theme).
    *   Synchronisiert den Status automatisch mit dem `localStorage` (Präfix: `footypulse_`).
4.  **`render.js` (UI Layer):**
    *   Enthält reine Render-Funktionen für Suche, Header, Matches und Tabellen.
    *   Erzeugt HTML-Strukturen basierend auf dem State.

---

## 5. Datenfluss (Workflow)
1.  **Start:** `app.js` lädt Theme und Favoriten. Indiziert Teams via `api.js`.
2.  **Suche:** Nutzer tippt -> `app.js` filtert den Team-Index.
3.  **Auswahl:** `state.js` setzt das aktive Team -> Triggert Ladevorgang.
4.  **API Call:** `api.js` liefert Spieldaten und Tabelle (parallel via `Promise.all`).
5.  **UI Update:** `render.js` aktualisiert das Dashboard.

---

## 6. Deployment & Wartung
*   **Server:** Jeder statische Webserver.
*   **Responsive Design:** Mobile-First Ansatz. Kritische Breakpoints bei 768px und 500px.
*   **Wichtige Dateien für Updates:**
    *   `css/style.css`: Beinhaltet die Theme-Definitionen (`:root` vs `[data-theme="dark"]`).
    *   `js/state.js`: Definition der Speicher-Keys.
*   **Releases:** Aktueller Stand v1.2.0 (Redesign & Branding Update).

---

## 7. Bekannte Dev-Notes
*   **Mobile Overflow:** Lange Vereinsnamen werden im Spielplan via `text-overflow: ellipsis` gekürzt, um das Layout auf 390px-Displays (iPhone) stabil zu halten.
*   **CORS:** Lokal muss ein statischer Server (z.B. Python) genutzt werden.

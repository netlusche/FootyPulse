# Technisches & Funktionales Dossier: favteam (Fußball-Explorer)

Dieses Dokument dient als Übergabeprotokoll für Entwicklungs-Agenten, um das Systemverständnis der "favteam" Applikation zu gewährleisten.

## 1. Projektübersicht
**Name:** favteam - Der Fußball-Explorer  
**Ziel:** Eine leichtgewichtige, performante Web-App zur Anzeige von Live-Daten der deutschen Bundesligen (1., 2., 3. Liga).  
**Paradigma:** Vanilla Web-Development. Keine Frameworks (React, Vue, etc.), keine Build-Steps.

---

## 2. Funktionale Merkmale
*   **Intelligente Suche:** Autocomplete-Suche über alle unterstützten Ligen hinweg. Ergebnisse werden im Format `[Liga] - [Teamname]` angezeigt.
*   **Team-Dashboard:** Zentralisierte Ansicht nach Auswahl eines Teams:
    *   **Stammdaten:** Logo und offizieller Name.
    *   **Formkurve:** Anzeige der letzten 10 absolvierten Spiele mit Ergebnissen.
    *   **Tabellen-Kontext:** Anzeige der aktuellen Liga-Tabelle mit automatischer Hervorhebung (Highlighting) des gewählten Teams.
*   **Persistenz:**
    *   **Favoriten:** Nutzer können Teams "sternen". Diese werden dauerhaft gespeichert.
    *   **Zuletzt angesehen:** Eine Historie der letzten Aufrufe wird automatisch gepflegt.
*   **Offline-First Ansatz (Caching):** Aggressives Caching von API-Anfragen im `localStorage`, um Ladezeiten zu minimieren und die API-Last zu senken.

---

## 3. Tech-Stack
*   **Sprachen:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ Module).
*   **Styling:** Custom CSS mit CSS Variables für Design-Tokens (Farben, Spacing). Fokus auf modernes, responsives UI ("Inter" Font, High-Contrast Search).
*   **Datenquelle:** [OpenLigaDB REST API](https://api.openligadb.de/).
*   **Versionsverwaltung:** Git (GitHub Repository: `netlusche/favteam`).

---

## 4. Architektur & Modulstruktur
Die Anwendung ist modular aufgebaut (`/js` Verzeichnis):

1.  **`app.js` (Orchestrator):**
    *   Initialisiert die Anwendung.
    *   Verbindet UI-Events (Suche, Klicks) mit der Logik.
    *   Steuert den Page-Lifecycle.
2.  **`api.js` (Data Layer):**
    *   Zentraler Ort für Fetch-Aufrufe.
    *   Implementiert `fetchWithCache`: Prüft `localStorage` auf gültige Daten, bevor ein Netzwerk-Request abgesetzt wird.
    *   Konfiguriert die `RELEVANT_LEAGUES` (aktuell: `bl1`, `bl2`, `bl3`).
3.  **`state.js` (State Management):**
    *   Verwaltet den globalen App-Status (aktuelles Team, Favoriten, Verlauf).
    *   Synchronisiert den Status automatisch mit dem `localStorage`.
4.  **`render.js` (UI Layer):**
    *   Enthält reine Render-Funktionen.
    *   Erzeugt HTML-Strings oder DOM-Elemente basierend auf dem State.
    *   Beinhaltet das `leagueMap` Mapping (Shortcuts zu Klarnamen).

---

## 5. Datenfluss (Workflow)
1.  **Start:** `app.js` lädt Favoriten aus `state.js`.
2.  **Suche:** Nutzer tippt -> `app.js` filtert den indizierten Team-Index (aus `api.js` geladen).
3.  **Auswahl:** `state.js` setzt das aktive Team -> Triggert `render.js`.
4.  **API Call:** `render.js` fordert Daten an -> `api.js` liefert (Cache oder Network).
5.  **UI Update:** DOM wird mit Tabellen und Spielergebnissen aktualisiert.

---

## 6. Deployment & Wartung
*   **Server:** Jeder statische Webserver (Apache, Nginx, Python `http.server`, GitHub Pages).
*   **Wichtige Dateien für Updates:**
    *   `index.html`: Struktur & Favicon-Link.
    *   `css/style.css`: Design-Anpassungen.
    *   `js/api.js`: Hinzufügen neuer Ligen oder API-Änderungen.
*   **Releases:** Versionierung erfolgt über Git Tags (aktuell v1.0.4).

---

## 7. Bekannte Einschränkungen / Dev-Notes
*   **CORS:** Beim lokalen Testen muss ein Server (z.B. Python `http.server`) genutzt werden.
*   **Datenqualität:** Fokus liegt auf deutschen Bundesligen.

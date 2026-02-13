# favteam - Der Fußball-Explorer ⚽️

Eine moderne, responsive Single-Page-Webanwendung (SPA) zur Erkundung von Fußball-Daten der deutschen Bundesligen.
Entwickelt mit **Vanilla JavaScript**, **HTML5** und **CSS3** – ohne externe Frameworks.

## 🌟 Features

*   **Live-Suche**: Schnelles Finden von Vereinen mit Autocomplete (inkl. Liga-Anzeige).
*   **Daten-Visualisierung**:
    *   Aktuelle Tabelle der jeweiligen Liga (mit Hervorhebung des Teams).
    *   Die letzten 10 Spiele mit Ergebnissen.
*   **Personalisierung**:
    *   ⭐ **Favoriten**: Speichere deine Lieblingsvereine für schnellen Zugriff.
    *   🕒 **Verlauf**: Automatische Liste der zuletzt angesehenen Teams.
*   **Datenquelle**: Nutzt die kostenlose [OpenLigaDB API](https://api.openligadb.de/).
*   **Unterstützte Ligen**:
    *   1. Bundesliga
    *   2. Bundesliga
    *   3. Liga

## 🚀 Installation & Start

Da es sich um eine reine statische Web-App handelt, ist keine komplexe Installation notwendig.

1.  **Repository klonen**
    ```bash
    git clone https://github.com/netlusche/favteam.git
    cd favteam
    ```

2.  **Lokal starten**
    Du benötigst lediglich einen einfachen Webserver, um CORS-Probleme zu vermeiden (direktes Öffnen der `index.html` funktioniert bei manchen Browsern nicht korrekt).

    Mit Python 3:
    ```bash
    python3 -m http.server 8080
    ```
    
    Oder mit Node.js (http-server):
    ```bash
    npx http-server .
    ```

3.  **Öffnen**
    Navigiere in deinem Browser zu `http://localhost:8080`.

## 🛠 Technologien

*   **Frontend**: Native Web Technologies (Custom Elements, CSS Variables)
*   **State Management**: Eigener Store (basierend auf `localStorage`)
*   **API**: `fetch` API mit Caching-Layer

## 📄 Lizenz

MIT License.
Daten bereitgestellt von OpenLigaDB.

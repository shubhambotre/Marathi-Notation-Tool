# Marathi Music Notation Tool - Project Documentation

## Project Overview
A web-based full-stack application designed for writing and exporting Hindustani Classical Music notations in Marathi. It features a specialized rhythmic grid and an on-screen Marathi keyboard.

## Architecture
- **Frontend:** React (TypeScript) with Vanilla CSS.
- **Backend:** Python (Flask) with SQLite for data persistence.
- **Export Formats:** MS Word (DOCX) and PDF (via ReportLab).

## Project Structure
- `frontend/`: React source code, components, and styles.
- `backend/`: Flask API, user authentication, and document generation.
- `backend/app.py`: Main entry point for the API and database management.
- `frontend/src/App.tsx`: Core UI logic, grid management, and authentication flows.
- `frontend/src/App.css`: Modern, themed styles for the editor and modals.

## Key Features
- **Dynamic Rhythmic Grid:** Supports multiple Taals (Teental, Dadra, Keherwa, Jhaptaal, Ektaal) with automated header generation.
- **On-Screen Marathi Keyboard:** Specialized input for Marathi Swaras (Mandra, Madhya, Taar saptaks) and musical markers.
- **User Authentication:** Secure Login, Sign Up, and Password Recovery with security questions.
- **Library Management:** Save, load, rename, and delete notation drafts in a personal library.
- **Auto-Save:** Intelligent debounce-based auto-saving to prevent data loss.
- **Musical Terminology:** Quick-access buttons for standard musical sections (Gat, Tana, Sthai, etc.).

## Setup & Execution

### Prerequisites
- Node.js & npm
- Python 3.12+
- Windows (for `Nirmala.ttf` font path) or update `MARATHI_FONT_PATH` in `backend/app.py`.

### Running the Backend
1. Navigate to `backend/`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run the server: `python app.py`.
4. The API will be available at `http://localhost:5000`.

### Running the Frontend
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Start the development server: `npm start`.
4. The application will open at `http://localhost:3000`.

## Technical Notes
- **Font Handling:** PDF generation requires a Unicode-compatible Devanagari font (defaulted to `C:\Windows\Fonts\Nirmala.ttf`).
- **Cell Constraints:** Each notation cell is limited to 10 characters to maintain grid integrity.
- **Session Management:** Uses JWT-based authentication with local storage for session persistence.
- **Theming:** A custom "Sitar-inspired" theme using deep navies, metallic golds, and parchment backgrounds.

## Future Enhancements
- Support for custom Taal creation.
- MIDI playback functionality for entered swaras.
- Collaborative editing features.
- Mobile-responsive layout optimizations.

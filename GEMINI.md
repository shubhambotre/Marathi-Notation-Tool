# Marathi Music Notation Tool - Project Documentation

## Project Overview
A web-based full-stack application designed for writing and exporting Hindustani Classical Music notations in Marathi. It features a specialized 16-column grid for Teental and an on-screen Marathi keyboard.

## Architecture
- **Frontend:** React (TypeScript) with Vanilla CSS.
- **Backend:** Python (Flask) for document generation and export.
- **Export Formats:** TXT, MS Word (DOCX), and PDF.

## Project Structure
- `frontend/`: React source code, components, and styles.
- `backend/`: Flask API, export logic, and font configurations.
- `backend/app.py`: Main entry point for the API.
- `frontend/src/App.tsx`: Main UI logic and grid management.

## Key Features
- **16-Beat Grid:** Mandatory 16-column layout for Hindustani notation.
- **On-Screen Keyboard:** Specialized input for Marathi Swaras and musical markers.
- **Taal Header:** Automated generation of the Teental header (1-16 beats with Bol and Markers) in all exported files.
- **Musical Terminology:** Quick-access buttons for keywords like Gat, Tana, Sthai, Antara, etc.

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
- **Font Handling:** PDF generation uses `reportlab` and requires a Unicode-compatible Devanagari font (defaulted to `C:\Windows\Fonts\Nirmala.ttf`).
- **Cell Constraints:** Each notation cell is limited to ~5 characters to accommodate Marathi characters + rhythmic markers (e.g., dots or lines).
- **Taal Structure:** Fixed to Teental (16 beats) as per current requirements.

## Future Enhancements
- Support for other Taals (Ektaal, Jhaptaal, etc.).
- Cloud storage for saving and loading notation drafts.
- MIDI playback functionality for entered swaras.

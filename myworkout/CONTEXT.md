# Workout App Context

## Project Structure
- `index.html`: Main UI shell.
- `app.js`: Main orchestration logic.
- `workoutEngine.js`: Business logic, state, and timers.
- `ui.js`: DOM interaction and rendering.
- `style.css`: Styling.
- `data.js` / `exercises.json`: Data source.
- `exercise/`: Media assets (audio, gifs, images).

## Architecture
- Mobile-first, modular web application.
- Uses `localStorage` for state persistence.
- Audio contexts initialized via user interaction.
- ESLint used for code quality (currently configured for ES2022).

## Key Dependencies
- `eslint` (currently experiencing configuration parsing issues).
- Browser APIs (Audio, localStorage).

# Cosmic Grid Math — Context

## Project Overview
**Cosmic Grid Math** is a responsive, modular, touch-friendly math puzzle game for kids. The goal is to safely navigate a spaceship through a cosmic grid to a wormhole portal by solving math equations, collecting stars, and dodging obstacles. 

## Project Structure
- `index.html`: Main HTML5 viewport shell. Contains the app layout and the container for screens (Main Menu, Level Selector, Shop, Gameplay).
- `style.css`: Theme values (`:root`), animations, spatial grid layouts, and mobile-first responsive scaling.
- `app.js`: Application state machine. Bootstraps and coordinates communication between modules.
- `gameEngine.js`: Game logic, coordinates, level data, player balance (stars), and ship configuration.
- `ui.js`: DOM rendering controller (draws the grid, coordinates animations, handles panel popups).
- `audio.js`: Synth engine using Web Audio API to play localized sound effects.
- `data.js`: Algorithmic math problem generator, scaling difficulty parameters.

## Architecture Guidelines
- **Zero Frameworks**: Vanilla JS with ES modules.
- **Mobile-first Design**: Ideal viewport for iPad and mobile screens. Target minimum of `44px` on all interactable buttons.
- **Audio Gesture Gates**: The audio engine unlocks only upon direct user gesture (e.g., clicking the "Enter Galaxy" startup button).
- **No-Timer Stress**: Designed for high confidence, low anxiety, and strategic spatial routing.

import { GameEngine } from './gameEngine.js';
import { UIController } from './ui.js';
import { generateEquation } from './data.js';
import { AudioEngine } from './audio.js';

const app = {
    currentScreen: 'main-menu',
    engine: new GameEngine(),
    ui: new UIController(),
    audio: new AudioEngine(),

    init() {
        console.log('Cosmic Grid Initialized');
        this.engine.loadProgress();
        this.ui.updateStarsDisplay(this.engine.starsCount);
        this.navigate('main-menu');
        this.engine.generateLevel(1);
        this.ui.renderGrid(this.engine.grid, (x, y) => this.handleCellClick(x, y));
        
        // Resume audio context on first user interaction
        document.addEventListener('click', async () => {
            await this.audio.resume();
        }, { once: true });

        // Setup button event listeners
        document.getElementById('btn-play').addEventListener('click', () => this.navigate('level-selector'));
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
        document.getElementById('btn-how-to-play').addEventListener('click', () => this.showHowToPlay());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetProgress());
        document.getElementById('btn-back-from-how-to-play').addEventListener('click', () => this.navigate('main-menu'));
        document.getElementById('btn-back-from-level-selector').addEventListener('click', () => this.navigate('main-menu'));
        document.getElementById('btn-back-from-shop').addEventListener('click', () => this.navigate('main-menu'));
        document.getElementById('btn-quit').addEventListener('click', () => this.quitGame());
    },

    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
            if (screenId === 'level-selector') {
                this.renderLevelSelector();
            }
        }
    },

    handleCellClick(x, y) {
        if (this.engine.isValidMove(x, y) && this.engine.isAdjacentMove(x, y)) {
            const difficultyStages = ['add-10', 'add-20', 'add-100', 'sub-10', 'sub-20'];
            const stage = difficultyStages[Math.min(this.engine.currentLevel - 1, difficultyStages.length - 1)];
            const mathProblem = generateEquation(stage);
            this.ui.showMathPopup(`${mathProblem.question} = ?`, (answer) => {
                if (parseInt(answer) === mathProblem.answer) {
                    console.log("Correct!");
                    this.audio.playThrust();
                    
                    const oldX = this.engine.playerPosition.x;
                    const oldY = this.engine.playerPosition.y;
                    this.engine.grid[oldX][oldY].type = 'empty';
                    this.engine.playerPosition = { x, y };
                    
                    if (this.engine.grid[x][y].type === 'star') {
                        this.engine.collectStar();
                        this.audio.playStar();
                        this.ui.updateStarsDisplay(this.engine.starsCount);
                        this.engine.grid[x][y].type = 'empty';
                    }
                    
                    if (this.engine.grid[x][y].type === 'portal') {
                        console.log("Level Complete!");
                        this.audio.playPortal();
                        if (this.engine.currentLevel >= this.engine.unlockedLevels) {
                            this.engine.unlockedLevels = this.engine.currentLevel + 1;
                            this.engine.saveProgress();
                        }
                        alert("🎉 Level Complete! You reached the portal!");
                        this.navigate('main-menu');
                    } else {
                        this.engine.grid[x][y].type = 'player';
                        this.ui.renderGrid(this.engine.grid, (x, y) => this.handleCellClick(x, y));
                    }
                } else {
                    console.log("Incorrect!");
                    this.ui.showIncorrectFeedback();
                }
            });
        }
    },

    openShop() {
        const skins = [
            { id: 'red-ship', name: 'Red Hull', cost: 5 },
            { id: 'gold-ship', name: 'Gold Hull', cost: 20 }
        ];
        this.ui.renderShop(skins, this.engine.unlockedSkins, (skin) => {
            if (this.engine.purchaseSkin(skin.id, skin.cost)) {
                this.ui.updateStarsDisplay(this.engine.starsCount);
                this.openShop(); // Refresh view
            }
        });
        this.navigate('shop');
    },

    startLevel(level) {
        this.engine.currentLevel = level;
        this.engine.generateLevel(level);
        this.ui.renderGrid(this.engine.grid, (x, y) => this.handleCellClick(x, y));
        this.navigate('gameplay');
    },

    renderLevelSelector() {
        const levelSelector = document.getElementById('screen-level-selector');
        const existingButtons = levelSelector.querySelectorAll('button:not([onclick*="main-menu"])');
        existingButtons.forEach(btn => btn.remove());
        
        const lockIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            if (i > this.engine.unlockedLevels) {
                btn.disabled = true;
                btn.innerHTML = `${lockIcon} Level ${i}`;
            } else {
                btn.textContent = `Level ${i}`;
            }
            btn.onclick = () => this.startLevel(i);
            levelSelector.insertBefore(btn, levelSelector.lastElementChild);
        }
    },

    quitGame() {
        this.navigate('main-menu');
    },

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.engine.resetProgress();
            this.ui.updateStarsDisplay(this.engine.starsCount);
            alert('Progress has been reset!');
        }
    },

    showHowToPlay() {
        this.navigate('how-to-play');
    }
};

window.app = app;
app.init();

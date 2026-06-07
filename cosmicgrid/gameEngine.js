// Core Game State and Puzzle Grid Logic

export class GameEngine {
    constructor() {
        this.starsCount = 0;
        this.currentLevel = 1;
        this.unlockedLevels = 1;
        this.unlockedSkins = ['default'];
        this.grid = [];
        this.playerPosition = { x: 0, y: 0 };
        this.shipCustomization = {
            hull: 'default',
            thruster: 'blue'
        };
    }

    generateLevel(difficulty, gridSize = null) {
        if (!gridSize) {
            gridSize = 4 + Math.floor(difficulty / 3);
            gridSize = Math.min(gridSize, 8);
        }
        
        this.grid = Array(gridSize).fill(null).map(() => 
            Array(gridSize).fill(null).map(() => ({ type: 'empty' }))
        );
        
        // Populate random asteroids/stars
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const rand = Math.random();
                if (rand < 0.2) this.grid[i][j].type = 'asteroid';
                else if (rand < 0.4) this.grid[i][j].type = 'star';
            }
        }
        
        // Place portal at opposite corner
        this.grid[gridSize - 1][gridSize - 1].type = 'portal';
        
        this.playerPosition = { x: 0, y: 0 };
        this.grid[0][0].type = 'player';
    }

    isValidMove(x, y) {
        if (x < 0 || y < 0 || x >= this.grid.length || y >= this.grid[0].length) return false;
        return this.grid[x][y].type !== 'asteroid';
    }

    isAdjacentMove(x, y) {
        const dx = Math.abs(x - this.playerPosition.x);
        const dy = Math.abs(y - this.playerPosition.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    collectStar() {
        this.starsCount++;
        this.saveProgress();
    }

    purchaseSkin(skinName, cost) {
        if (this.starsCount >= cost && !this.unlockedSkins.includes(skinName)) {
            this.starsCount -= cost;
            this.unlockedSkins.push(skinName);
            this.saveProgress();
            return true;
        }
        return false;
    }

    loadProgress() {
        const saved = localStorage.getItem('cosmic_grid_math_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.starsCount = parsed.starsCount || 0;
                this.unlockedLevels = parsed.unlockedLevels || 1;
                this.unlockedSkins = parsed.unlockedSkins || ['default'];
                this.shipCustomization = parsed.shipCustomization || { hull: 'default', thruster: 'blue' };
            } catch (e) {
                console.error("Failed to parse saved state:", e);
            }
        }
    }

    saveProgress() {
        const state = {
            starsCount: this.starsCount,
            unlockedLevels: this.unlockedLevels,
            unlockedSkins: this.unlockedSkins,
            shipCustomization: this.shipCustomization
        };
        try {
            localStorage.setItem('cosmic_grid_math_state', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save progress to LocalStorage:", e);
        }
    }

    resetProgress() {
        this.starsCount = 0;
        this.unlockedLevels = 1;
        this.unlockedSkins = ['default'];
        this.shipCustomization = { hull: 'default', thruster: 'blue' };
        localStorage.removeItem('cosmic_grid_math_state');
    }
}

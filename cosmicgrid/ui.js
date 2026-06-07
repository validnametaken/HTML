// Rendering Controller & View Updates

export class UIController {
    constructor() {
        this.activeScreen = 'audio-overlay';
        this.soundBtn = document.getElementById('sound-toggle');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => {
            el.style.display = 'none';
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'flex';
            this.activeScreen = screenId;
        }

        // Manage sound button visibility
        if (this.soundBtn) {
            if (screenId === 'audio-overlay') {
                this.soundBtn.classList.add('hidden');
            } else {
                this.soundBtn.classList.remove('hidden');
            }
        }
    }

    updateStarsDisplay(stars) {
        const starCounter = document.getElementById('star-count-display');
        if (starCounter) {
            starCounter.textContent = stars.toString();
        }
    }

    updateLevelName(name) {
        const nameEl = document.getElementById('game-level-name');
        if (nameEl) {
            nameEl.textContent = name;
        }
    }

    renderGrid(grid, onCellClick) {
        const gridEl = document.getElementById('game-grid');
        gridEl.innerHTML = '';
        gridEl.style.display = 'grid';
        
        // Responsive cell size based on screen width
        const cellSize = window.innerWidth >= 768 ? (window.innerWidth >= 1024 ? 70 : 60) : 44;
        gridEl.style.gridTemplateColumns = `repeat(${grid.length}, ${cellSize}px)`;
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        const cellIcons = {
            'player': '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z"/></svg>',
            'star': '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            'asteroid': '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
            'portal': '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>',
            'empty': ''
        };
        
        grid.forEach((row, x) => {
            row.forEach((cell, y) => {
                const cellEl = document.createElement('div');
                cellEl.classList.add('cell');
                cellEl.dataset.type = cell.type;
                cellEl.style.width = `${cellSize}px`;
                cellEl.style.height = `${cellSize}px`;
                cellEl.style.border = '1px solid rgba(255,255,255,0.3)';
                cellEl.style.display = 'flex';
                cellEl.style.alignItems = 'center';
                cellEl.style.justifyContent = 'center';
                cellEl.style.fontSize = `${cellSize * 0.55}px`;
                cellEl.style.backgroundColor = 'rgba(74, 144, 226, 0.1)';
                cellEl.innerHTML = cellIcons[cell.type] || '';
                cellEl.dataset.x = x;
                cellEl.dataset.y = y;
                fragment.appendChild(cellEl);
            });
        });
        gridEl.appendChild(fragment);
        
        // Event delegation
        gridEl.onclick = (e) => {
            if (e.target.classList.contains('cell')) {
                onCellClick(parseInt(e.target.dataset.x), parseInt(e.target.dataset.y));
            }
        };
    }

    showMathPopup(equation, onAnswer) {
        const popup = document.getElementById('math-popup');
        const display = document.getElementById('equation-display');
        const answerDisplay = document.getElementById('answer-display');
        display.textContent = equation;
        answerDisplay.textContent = '';
        answerDisplay.classList.remove('incorrect');
        popup.classList.remove('shake');
        popup.classList.add('hidden');
        
        let currentAnswer = '';
        
        const keypad = popup.querySelector('#keypad');
        const handleKeyClick = (e) => {
            if (e.target.tagName === 'BUTTON') {
                const action = e.target.dataset.action;
                const key = e.target.textContent;
                
                if (action === 'backspace') {
                    currentAnswer = currentAnswer.slice(0, -1);
                    answerDisplay.textContent = currentAnswer;
                    answerDisplay.classList.remove('incorrect');
                } else if (action === 'submit') {
                    keypad.onclick = null;
                    popup.classList.add('hidden');
                    onAnswer(currentAnswer);
                } else if (currentAnswer.length < 5) {
                    currentAnswer += key;
                    answerDisplay.textContent = currentAnswer;
                    answerDisplay.classList.remove('incorrect');
                }
            }
        };
        
        keypad.onclick = handleKeyClick;
        popup.classList.remove('hidden');
    }

    showIncorrectFeedback() {
        const popup = document.getElementById('math-popup');
        const answerDisplay = document.getElementById('answer-display');
        answerDisplay.classList.add('incorrect');
        popup.classList.add('shake');
        setTimeout(() => popup.classList.remove('shake'), 500);
    }

    renderShop(skins, unlockedSkins, onPurchase) {
        const shopContainer = document.getElementById('shop-items');
        if (!shopContainer) return;
        shopContainer.innerHTML = '';

        skins.forEach(skin => {
            const btn = document.createElement('button');
            btn.textContent = `${skin.name} (${skin.cost} stars)`;
            if (unlockedSkins.includes(skin.id)) btn.disabled = true;
            btn.onclick = () => onPurchase(skin);
            shopContainer.appendChild(btn);
        });
    }
}

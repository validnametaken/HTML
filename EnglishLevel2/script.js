// Initialize current level index
let currentLevelIndex = 0;

document.addEventListener('click', function() {
    // Select all elements with class 'level'
    let levels = document.querySelectorAll('.level');

    // Ensure current level index stays within bounds
    if (currentLevelIndex < levels.length) {
        // Reset all levels to their initial scale and z-index
        levels.forEach(function(level, index) {
            level.style.transform = 'scale(0.5)';
            level.style.zIndex = levels.length - index; // Set z-index in reverse order
        });

        // Scale up the current level and set it to the top layer
        levels[currentLevelIndex].style.transform = 'scale(3.0)';
        levels[currentLevelIndex].style.zIndex = levels.length + 1;

        // Increment current level index for the next click
        currentLevelIndex++;
    } else {
        // Reset current level index to start over
        currentLevelIndex = 0;
    }
});

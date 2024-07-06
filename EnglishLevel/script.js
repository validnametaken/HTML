// Initialize current level index
let currentLevelIndex = 0;

document.addEventListener('click', function() {
    // Select all elements with class 'cm'
    let cms = document.querySelectorAll('.cm');

    // Ensure current level index stays within bounds
    if (currentLevelIndex < cms.length) {
        // Calculate height for current level
        let currentHeight = 100 / (currentLevelIndex + 1);

        // Update height and scale for each level up to current level index
        for (let i = 0; i <= currentLevelIndex; i++) {
            let scale = 1 / (currentLevelIndex - i + 1); // Calculate scale factor
            cms[i].style.transform = `scaleY(${scale})`; // Apply scale transform
            cms[i].style.height = `${currentHeight}%`; // Set height dynamically
        }

        // Update explanation box content
        updateExplanation(currentLevelIndex);

        // Increment current level index for the next click
        currentLevelIndex++;
    } else {
        // Reset current level index to start over
        currentLevelIndex = 0;

        // Reset all cms to initial state
        cms.forEach(function(cm, index) {
            cm.style.transform = 'scaleY(1)'; // Reset scale transform
            cm.style.height = `${100 / cms.length}%`; // Equal height distribution
        });

        // Clear explanation box content
        clearExplanation();
    }
});

// Function to update the explanation box content based on current level index
function updateExplanation(index) {
    let explanations = [
        "Can say simple words like 'Apple'",
        "Can form basic sentences",
        "Can hold simple conversations",
        "Can discuss more complex topics",
        "Fluent in English"
    ];

    let explanationBox = document.querySelector('.explanation');
    explanationBox.innerHTML = `<h2>Explanation for Level ${index + 1}</h2><p>${explanations[index]}</p>`;
}

// Function to clear explanation box content
function clearExplanation() {
    let explanationBox = document.querySelector('.explanation');
    explanationBox.innerHTML = '';
}

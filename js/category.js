// Main form
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.question-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const answers = [];
    
    // Get all answers
    for (let i = 1; i <= 3; i++) {
        const answer = formData.get(`q${i}`);
        answers.push(answer);
    }
    
    // Get category
    const category = getCurrentCategory();
    
    // Create data object
    const recommendationData = {
        answers: answers,
        category: category,
        timestamp: new Date().toISOString()
    };
    
    // Redirect to results page
    const encodedData = encodeURIComponent(JSON.stringify(recommendationData));
    window.location.href = `../pages/result.html?data=${encodedData}`;
}

// Get current category
function getCurrentCategory() {
    const path = window.location.pathname;
    
    if (path.includes('categoryOne')) {
        return 'situational';
    } else if (path.includes('categoryTwo')) {
        return 'energy';
    } else if (path.includes('categoryThree')) {
        return 'social';
    }
    
    return 'situational';
}
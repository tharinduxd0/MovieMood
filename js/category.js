// Category form handler
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
        if (!answer || answer.trim() === '') {
            return; // Skip if answer missing
        }
        answers.push(answer.trim());
    }
    
    // Determine category based on page
    const category = getCurrentCategory();
    
    // Store data for results page
    const recommendationData = {
        answers: answers,
        category: category,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('movieRecommendationData', JSON.stringify(recommendationData));
    
    // Redirect to results page
    const encodedData = encodeURIComponent(JSON.stringify(recommendationData));
    window.location.href = `../pages/result.html?data=${encodedData}`;
}

// Determine current category based on page
function getCurrentCategory() {
    const path = window.location.pathname;
    const title = document.querySelector('h1')?.textContent || '';
    
    if (path.includes('categoryOne') || title.includes('Situational')) {
        return 'situational';
    } else if (path.includes('categoryTwo') || title.includes('Energy')) {
        return 'energy';
    } else if (path.includes('categoryThree') || title.includes('Social')) {
        return 'social';
    }
    
    return 'situational'; // Fallback
}
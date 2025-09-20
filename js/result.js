// Global variables
let currentRecommendationData = null;

// Initialize page when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Initialize the results page
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
        try {
            const data = JSON.parse(decodeURIComponent(encodedData));
            currentRecommendationData = data;
            getMovieRecommendations(data.answers, data.category);
        } catch (error) {
            console.error('Error parsing URL data:', error);
        }
    } else {
        const storedData = sessionStorage.getItem('movieRecommendationData');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                currentRecommendationData = data;
                getMovieRecommendations(data.answers, data.category);
            } catch (error) {
                console.error('Error parsing stored data:', error);
            }
        }
    }
}

// Get movie recommendations from server
async function getMovieRecommendations(answers, category) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const resultsElement = document.getElementById('movie-results');
    const tryAnotherElement = document.getElementById('try-another');

    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    resultsElement.style.display = 'none';
    tryAnotherElement.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/api/recommend-movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, category })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();

        if (data.success && data.movies && data.movies.length > 0) {
            displayMovieResults(data.movies, data.category);
        } else {
            console.error(data.error || 'No movie recommendations received');
        }

    } catch (error) {
        console.error('Error getting recommendations:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Display movie results
function displayMovieResults(movies, category) {
    const resultsElement = document.getElementById('movie-results');
    const tryAnotherElement = document.getElementById('try-another');

    resultsElement.innerHTML = '';
    movies.forEach((movie, index) => {
        resultsElement.appendChild(createMovieCard(movie, index + 1));
    });

    resultsElement.style.display = 'grid';
    tryAnotherElement.style.display = 'block';
}

// Create individual movie card
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = movie.error ? 'movie-card error-movie' : 'movie-card';

    if (movie.error) {
        card.innerHTML = `
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="ai-reason">${movie.aiReason || 'Recommended for your mood'}</div>
                <p class="error-message">Sorry, we couldn't find details for this movie.</p>
            </div>
        `;
        return card;
    }

    const posterElement = movie.poster_path 
        ? `<img src="${movie.poster_path}" alt="${movie.title}" class="movie-poster" loading="lazy">`
        : '';

    const starRating = generateStarRating(movie.vote_average);

    const genresHtml = movie.genres && movie.genres.length > 0 
        ? `<div class="genres-list">${movie.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}</div>`
        : '';

    const castText = movie.cast && movie.cast.length > 0 
        ? movie.cast.join(', ')
        : 'Cast information not available';

    const runtimeText = movie.runtime 
        ? `${movie.runtime} minutes`
        : 'Runtime not available';

    card.innerHTML = `
        <div class="movie-poster-container">
            ${posterElement}
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            ${movie.aiReason ? `<div class="ai-reason">"${movie.aiReason}"</div>` : ''}
            <div class="movie-details">
                <div class="detail-item">
                    <span class="detail-label">Rating</span>
                    <div class="rating-stars">
                        <div class="star-rating">${starRating}</div>
                        <span class="rating-number">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</span>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Year</span>
                    <span class="detail-value">${movie.year}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Runtime</span>
                    <span class="detail-value">${runtimeText}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Genres</span>
                    <div class="detail-value">${genresHtml || '<span>Not available</span>'}</div>
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Cast</span>
                <span class="cast-list">${castText}</span>
            </div>
            <div class="movie-plot">
                <strong>Plot:</strong> ${movie.overview || 'Plot not available.'}
            </div>
        </div>
    `;

    return card;
}

// Generate star rating HTML
function generateStarRating(rating) {
    const maxStars = 5;
    const starValue = (rating / 10) * maxStars;
    const fullStars = Math.floor(starValue);
    const hasHalfStar = starValue % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<span class="star">★</span>';
    if (hasHalfStar) starsHtml += '<span class="star">☆</span>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<span class="star" style="opacity: 0.3;">★</span>';

    return starsHtml;
}

// Retry recommendations
function retryRecommendations() {
    if (currentRecommendationData) {
        getMovieRecommendations(currentRecommendationData.answers, currentRecommendationData.category);
    } else {
        console.error('No data available for retry.');
    }
}

// Utility function to get category display name
function getCategoryDisplayName(category) {
    const categoryNames = {
        'situational': 'Situational Emotion Check',
        'energy': 'Energy & Engagement Level',
        'social': 'Social Context'
    };
    return categoryNames[category] || 'Movie Recommendations';
}
// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
        const data = JSON.parse(decodeURIComponent(encodedData));
        getMovieRecommendations(data.answers, data.category);
    }
});

// Get movie recommendations from server
async function getMovieRecommendations(answers, category) {
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('movie-results');
    
    // Show loading
    loadingElement.style.display = 'block';
    resultsElement.style.display = 'none';
    
    const response = await fetch('http://localhost:3000/api/recommend-movies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers: answers,
            category: category
        })
    });
    
    const data = await response.json();
    displayMovieResults(data.movies);
    
    // Hide loading
    loadingElement.style.display = 'none';
}

// Display movie results
function displayMovieResults(movies) {
    const resultsElement = document.getElementById('movie-results');
    resultsElement.innerHTML = '';
    
    movies.forEach((movie, index) => {
        const movieCard = createMovieCard(movie);
        resultsElement.appendChild(movieCard);
    });
    
    resultsElement.style.display = 'grid';
}

// Create individual movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Create poster element
    const posterElement = movie.poster_path 
        ? `<img src="${movie.poster_path}" alt="${movie.title}" class="movie-poster" loading="lazy">`
        : `<div class="no-poster">No Poster Available</div>`;
    
    // Generate star rating
    const starRating = generateStarRating(movie.vote_average);
    
    // Format genres
    const genresHtml = movie.genres && movie.genres.length > 0 
        ? `<div class="genres-list">${movie.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}</div>`
        : '';
    
    // Format cast
    const castText = movie.cast && movie.cast.length > 0 
        ? movie.cast.join(', ')
        : 'Cast information not available';
    
    // Format runtime
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
                    <div class="detail-value">
                        ${genresHtml || '<span>Not available</span>'}
                    </div>
                </div>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">Cast</span>
                <span class="cast-list">${castText}</span>
            </div>
            
            <div class="movie-plot">
                <strong>Plot:</strong> ${movie.overview || 'Plot not available.'}
            </div>
            <button class="watchlist-btn">
                + Watchlist
            </button>
        </div>
    `;

    const watchlistBtn = card.querySelector('.watchlist-btn');
    watchlistBtn.addEventListener('click', () => {
        addToWatchlist(watchlistBtn, movie);
    });
    
    return card;
}

// Add movie to watchlist functionality
function addToWatchlist(button, movie) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
        alert("You need to sign in before using this feature");
        return;
    }

    const movieData = { 
        id: String(movie.id), 
        title: movie.title, 
        poster: movie.poster_path || '', 
        rating: movie.vote_average ? String(movie.vote_average.toFixed(1)) : 'N/A', 
        year: String(movie.year),
        watched: false,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const watchlistRef = db.collection('users').doc(user.uid).collection('watchlist').doc(String(movie.id));

    button.disabled = true;
    button.textContent = 'Checking...';

    watchlistRef.get().then((doc) => {
        if (doc.exists) {
            button.textContent = 'Already Added';
            button.classList.add('added');
        } else {
            watchlistRef.set(movieData)
                .then(() => {
                    button.textContent = 'Added';
                    button.classList.add('added');
                })
                .catch((error) => {
                    console.error("Error adding to watchlist: ", error);
                    button.disabled = false;
                    button.textContent = '+ Watchlist';
                });
        }
    }).catch((error) => {
        console.error("Error checking watchlist: ", error);
        button.disabled = false;
        button.textContent = '+ Watchlist';
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const maxStars = 5;
    const starValue = (rating / 10) * maxStars;
    const fullStars = Math.floor(starValue);
    const hasHalfStar = starValue % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="star">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHtml += '<span class="star">☆</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span class="star" style="opacity: 0.3;">★</span>';
    }
    
    return starsHtml;
}
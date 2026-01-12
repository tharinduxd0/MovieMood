// TMDB API Configuration
const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Load BOTH sections on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies();
    fetchTopRatedMovies();
});

// Global Error Logging
window.addEventListener('error', e => console.error('Page error:', e.error));

// Fetch trending movies from TMDB API
async function fetchTrendingMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    if (!moviesGrid) return;

    moviesGrid.innerHTML = '<div class="loading">Loading trending movies...</div>';

    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        moviesGrid.innerHTML = '';
        if (!data.results || data.results.length === 0) throw new Error('No movies found');

        data.results.slice(0, 20).forEach(movie => {
            moviesGrid.appendChild(createMovieCard(movie));
        });
    } catch (error) {
        moviesGrid.innerHTML = `
            <div class="error">
                <p>Error loading movies: ${error.message}</p>
                <button onclick="fetchTrendingMovies()">Retry</button>
            </div>
        `;
    }
}

// Fetch top-rated movies from TMDB API
async function fetchTopRatedMovies() {
    const carousel = document.getElementById('topRatedCarousel');
    if (!carousel) return;
    
    carousel.innerHTML = '<div class="loading">Loading top rated movies...</div>';

    try {
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        const releaseDateGte = fiveYearsAgo.toISOString().split('T')[0];

        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?` +
            `api_key=${TMDB_API_KEY}` +
            `&sort_by=vote_average.desc` +
            `&primary_release_date.gte=${releaseDateGte}` +
<<<<<<< HEAD
            `&vote_count.gte=1000` +
            `&include_adult=false`
=======
            `&vote_count.gte=1000`
>>>>>>> eea6983 (Implemented hero section with title, subtitle)
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        carousel.innerHTML = '';

        if (!data.results || data.results.length === 0) throw new Error('No movies found');

        data.results.forEach(movie => {
            carousel.appendChild(createMovieCard(movie));
        });

    } catch (error) {
        carousel.innerHTML = `
            <div class="error">
                <p>Error loading movies: ${error.message}</p>
                <button onclick="fetchTopRatedMovies()">Retry</button>
            </div>
        `;
    }
}

// Create movie card with watchlist button
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('title', movie.title);

    const poster = movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    const description = movie.overview
        ? (movie.overview.length > 150 ? movie.overview.substring(0, 150) + '...' : movie.overview)
        : 'No description available.';

    card.innerHTML = `
        <div class="movie-poster-container">
            <img src="${poster}" alt="${movie.title}" class="movie-poster" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster'">
            <div class="movie-description">
                <div class="description-title">${movie.title}</div>
                <div class="description-text">${description}</div>
            </div>
        </div>
        <div class="movie-info">
            <div class="movie-title" title="${movie.title}">${movie.title}</div>
            <div class="movie-details">
                <div class="movie-rating">
                    <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${rating}
                </div>
                <div class="movie-year">${year}</div>
            </div>
            <button class="watchlist-btn" onclick="addToWatchlist(this, '${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
                + Watchlist
            </button>
        </div>
    `;
    return card;
}

// Add movie to watchlist functionality
function addToWatchlist(button, movieId, movieTitle) {
    const movieCard = button.closest('.movie-card');
    const poster = movieCard.querySelector('.movie-poster').src;
    const rating = movieCard.querySelector('.movie-rating').textContent.trim();
    const year = movieCard.querySelector('.movie-year').textContent.trim();

    const movieData = { id: movieId, title: movieTitle, poster, rating, year };
    const watchlist = JSON.parse(localStorage.getItem('movieWatchlist') || '[]');

    if (watchlist.some(movie => movie.id === movieId)) {
        button.textContent = 'Already Added';
        button.disabled = true;
        button.classList.add('added');
        return;
    }

    watchlist.push(movieData);
    localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));

    button.textContent = 'Added';
    button.disabled = true;
    button.classList.add('added');
}
// TMDB API Configuration with your API key
const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Load movies when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchTrendingMovies();
});

// Function to fetch trending movies from TMDB API
async function fetchTrendingMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '<div class="loading">Loading trending movies...</div>';
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        moviesGrid.innerHTML = '';
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No movies found');
        }
        
        const moviesToShow = data.results.slice(0, 8);
        
        moviesToShow.forEach((movie) => {
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        });
        
    } catch (error) {
        moviesGrid.innerHTML = `
            <div class="error">
                <p>Error loading movies: ${error.message}</p>
                <p>Please check your internet connection</p>
                <button class="retry-button" onclick="fetchTrendingMovies()">Retry</button>
            </div>
        `;
    }
}

// Function to create movie card element
function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.setAttribute('data-movie-id', movie.id);
    movieCard.setAttribute('title', movie.title);
    
    const posterUrl = movie.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` 
        : 'https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster';
    
    movieCard.innerHTML = `
        <img src="${posterUrl}" 
             alt="${movie.title}" 
             class="movie-poster" 
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster'">
    `;
    
    movieCard.addEventListener('click', () => {
        showMovieInfo(movie);
    });
    
    return movieCard;
}

// Basic error handling for the page
window.addEventListener('error', function(event) {
    console.error('Page error:', event.error);
});
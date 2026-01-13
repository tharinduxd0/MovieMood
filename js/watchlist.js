// Initialize watchlist on page load
document.addEventListener('DOMContentLoaded', loadWatchlist);

function loadWatchlist() {
    const watchlist = getWatchlistFromStorage();
    const watchlistGrid = document.getElementById('watchlistGrid');
    const emptyState = document.getElementById('emptyState');
    const movieCount = document.getElementById('movieCount');
    const clearAllBtn = document.getElementById('clearAllBtn');

    movieCount.textContent = `${watchlist.length} movies`;
    clearAllBtn.disabled = watchlist.length === 0;

    if (watchlist.length === 0) {
        // Show empty state if no movies
        watchlistGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        // Render movie cards
        watchlistGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        watchlistGrid.innerHTML = '';
        watchlist.forEach(movie => {
            watchlistGrid.appendChild(createWatchlistMovieCard(movie));
        });
    }
}

// Retrieve saved watchlist
function getWatchlistFromStorage() {
    const watchlist = localStorage.getItem('movieWatchlist');
    return watchlist ? JSON.parse(watchlist) : [];
}

// Save updated watchlist
function saveWatchlistToStorage(watchlist) {
    localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
}

// Build movie card element
function createWatchlistMovieCard(movie) {
    const card = document.createElement('div');
    card.className = `movie-card ${movie.watched ? 'watched' : ''}`;
    card.setAttribute('data-movie-id', movie.id);

    card.innerHTML = `
        <div class="movie-poster-container">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster'">
        </div>
        <div class="movie-info">
            <div class="movie-title" title="${movie.title}">${movie.title}</div>
            <div class="movie-details">
                <div class="movie-rating">
                    <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${movie.rating}
                </div>
                <div class="movie-year">${movie.year}</div>
            </div>
            <div class="movie-actions">
                <button class="watched-btn" onclick="toggleWatchedStatus('${movie.id}')">
                    ${movie.watched ? 'Unwatch' : 'Mark as Watched'}
                </button>
                <button class="remove-btn" onclick="removeFromWatchlist('${movie.id}')">
                    Remove
                </button>
            </div>
        </div>
    `;
    return card;
}

// Remove single movie
function removeFromWatchlist(movieId) {
    let watchlist = getWatchlistFromStorage();
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    saveWatchlistToStorage(watchlist);
    loadWatchlist();
}

// Clear all movies
function clearAllWatchlist() {
    localStorage.removeItem('movieWatchlist');
    loadWatchlist();
}

// Toggle watched status
function toggleWatchedStatus(movieId) {
    let watchlist = getWatchlistFromStorage();
    const movie = watchlist.find(m => m.id === movieId);
    if (movie) {
        movie.watched = !movie.watched;
    }
    saveWatchlistToStorage(watchlist);
    loadWatchlist();
}

document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.querySelector('.profile-dropdown');

    profileIcon.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent closing immediately
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!profileIcon.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});

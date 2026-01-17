// Initialize watchlist logic
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadWatchlist(user);
        } else {
            showSignInPrompt();
        }
    });
});

function showSignInPrompt() {
    const watchlistGrid = document.getElementById('watchlistGrid');
    const emptyState = document.getElementById('emptyState');
    const movieCount = document.getElementById('movieCount');
    const clearAllBtn = document.getElementById('clearAllBtn');

    watchlistGrid.style.display = 'none';
    emptyState.style.display = 'block';
    
    if (movieCount) movieCount.textContent = '0 movies';
    if (clearAllBtn) clearAllBtn.disabled = true;

    // Update empty state to ask for sign in
    const emptyTitle = emptyState.querySelector('.empty-title');
    const emptyDesc = emptyState.querySelector('.empty-description');
    const discoverBtn = emptyState.querySelector('.discover-btn');

    if (emptyTitle) emptyTitle.textContent = "Please Sign In";
    if (emptyDesc) emptyDesc.textContent = "You need to sign in to view and manage your watchlist.";
    if (discoverBtn) {
        discoverBtn.textContent = "Sign In";
        discoverBtn.href = "../pages/signIn.html";
    }
}

function loadWatchlist(user) {
    const watchlistGrid = document.getElementById('watchlistGrid');
    const emptyState = document.getElementById('emptyState');
    const movieCount = document.getElementById('movieCount');
    const clearAllBtn = document.getElementById('clearAllBtn');


    db.collection('users').doc(user.uid).collection('watchlist')
        .orderBy('addedAt', 'desc')
        .get()
        .then((querySnapshot) => {
            const watchlist = [];
            querySnapshot.forEach((doc) => {
                watchlist.push(doc.data());
            });

            if (movieCount) movieCount.textContent = `${watchlist.length} movies`;
            if (clearAllBtn) clearAllBtn.disabled = watchlist.length === 0;

            if (watchlist.length === 0) {
                watchlistGrid.style.display = 'none';
                emptyState.style.display = 'block';
                
                // Reset empty state text to default
                const emptyTitle = emptyState.querySelector('.empty-title');
                const emptyDesc = emptyState.querySelector('.empty-description');
                const discoverBtn = emptyState.querySelector('.discover-btn');

                if (emptyTitle) emptyTitle.textContent = "Your Watchlist is Empty";
                if (emptyDesc) emptyDesc.textContent = "Start adding movies to your watchlist to see them here!";
                if (discoverBtn) {
                    discoverBtn.textContent = "Discover Movies";
                    discoverBtn.href = "../index.html";
                }

            } else {
                watchlistGrid.style.display = 'grid';
                emptyState.style.display = 'none';
                watchlistGrid.innerHTML = '';
                watchlist.forEach(movie => {
                    watchlistGrid.appendChild(createWatchlistMovieCard(movie));
                });
            }
        })
        .catch((error) => {
            console.error("Error loading watchlist: ", error);
            watchlistGrid.innerHTML = '<p style="color:white; text-align:center;">Error loading watchlist.</p>';
        });
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
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (!confirm("Remove this movie from your watchlist?")) return;

    db.collection('users').doc(user.uid).collection('watchlist').doc(String(movieId)).delete()
        .then(() => {
            loadWatchlist(user);
        })
        .catch((error) => {
            console.error("Error removing movie: ", error);
            alert("Failed to remove movie.");
        });
}

// Clear all movies
function clearAllWatchlist() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (!confirm("Are you sure you want to clear your ENTIRE watchlist?")) return;

    // Firestore doesn't support deleting collections directly from client SDK efficiently for large collections,
    // but for a user watchlist, fetching and batch deleting is fine.
    db.collection('users').doc(user.uid).collection('watchlist').get()
        .then((snapshot) => {
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
        .then(() => {
            loadWatchlist(user);
        })
        .catch((error) => {
            console.error("Error clearing watchlist:", error);
            alert("Failed to clear watchlist.");
        });
}

// Toggle watched status
function toggleWatchedStatus(movieId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const docRef = db.collection('users').doc(user.uid).collection('watchlist').doc(String(movieId));

    docRef.get().then((doc) => {
        if (doc.exists) {
            const isWatched = doc.data().watched;
            docRef.update({ watched: !isWatched })
                .then(() => {
                    loadWatchlist(user);
                })
                .catch((error) => {
                    console.error("Error updating status:", error);
                    alert("Failed to update status.");
                });
        }
    });
}
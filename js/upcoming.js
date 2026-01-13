const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const modal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');

document.addEventListener('DOMContentLoaded', fetchUpcomingMovies);

async function fetchUpcomingMovies() {
  moviesGrid.innerHTML = '<div class="loading">Loading upcoming movies...</div>';

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (!response.ok) throw new Error('Failed to fetch movies');

    const data = await response.json();
    const movies = data.results.slice(0, 12);
    renderMovies(movies);

  } catch (error) {
    moviesGrid.innerHTML = '<div class="error">Error loading movies. Please try again later.</div>';
    console.error(error);
  }
}

function renderMovies(movies) {
  if (!movies || movies.length === 0) {
    moviesGrid.innerHTML = '<div class="loading">No upcoming movies found.</div>';
    return;
  }

  moviesGrid.innerHTML = movies.map((movie, index) => {
    const poster = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}) : 'Unknown';
    const overview = movie.overview || 'No description available.';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return `
      <div class="movie-card" onclick="openModal(${movie.id})" style="animation-delay: ${index*0.05}s">
        <div class="movie-poster-container">
          <img class="movie-poster" src="${poster}" alt="${movie.title}" />
          <div class="movie-poster-overlay">
            <div class="overlay-release-date">Releasing: ${releaseDate}</div>
            <div class="overlay-rating">⭐ ${rating}</div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-overview">${overview}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Modal
async function openModal(movieId) {
  modal.style.display = 'block';
  modalBody.innerHTML = '<div class="modal-loading">Loading movie details...</div>';

  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) throw new Error('Failed to fetch movie details');
    const movie = await res.json();

    const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://via.placeholder.com/850x400?text=No+Backdrop';
    const poster = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/220x330?text=No+Poster';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';

    modalBody.innerHTML = `
      <div class="modal-header" style="background-image:url('${backdrop}')">
        <div class="modal-header-content">
          <h2 class="modal-movie-title">${movie.title}</h2>
          <p class="modal-movie-tagline">${movie.tagline || ''}</p>
        </div>
      </div>
      <div class="modal-main-content">
        <div class="modal-poster-column"><img src="${poster}" class="modal-poster" /></div>
        <div class="modal-details-column">
          <div class="modal-movie-details-grid">
            <div class="detail-item"><strong>Rating</strong><span>⭐ ${rating}</span></div>
            <div class="detail-item"><strong>Runtime</strong><span>${runtime}</span></div>
            <div class="detail-item"><strong>Release Date</strong><span>${releaseDate}</span></div>
          </div>
          <div class="modal-movie-overview">
            <h4>Overview</h4>
            <p>${movie.overview || 'No description available.'}</p>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = '<div class="error">Failed to load movie details.</div>';
    console.error(err);
  }
}

function closeModal() {
  modal.style.display = 'none';
}

window.onclick = e => { if(e.target === modal) closeModal(); };
